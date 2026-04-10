const { prisma } = require('../prisma');
const { generateWeeklyReportPdf } = require('../utils/reportPdf');
const { readSubmissionMeta } = require('../utils/submissionStorage');

// ─── Helper: verify supervisor owns the group ────────────────────────────────
async function assertSupervisorOwnsGroup(supervisorId, groupId) {
    const group = await prisma.group.findFirst({
        where: { id: groupId, supervisor_id: supervisorId },
    });
    if (!group) throw { status: 403, message: 'Access denied: this group is not assigned to you.' };
    return group;
}

function formatWeekInfo(week, submittedAt) {
    const dateLabel = submittedAt
        ? new Date(submittedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          })
        : 'Date not available';

    return `${week.name} - ${dateLabel}`;
}

function sanitizeStudent(student = {}) {
    return {
        name: typeof student.name === 'string' ? student.name.trim() : '',
        reg: typeof student.reg === 'string' ? student.reg.trim() : '',
        mobile: typeof student.mobile === 'string' ? student.mobile.trim() : '',
        email: typeof student.email === 'string' ? student.email.trim() : '',
    };
}

function sanitizeReportValue(value, fallback = '') {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

// ─── GET /api/supervisor/groups ──────────────────────────────────────────────
// Returns all groups assigned to the logged-in supervisor
const getAssignedGroups = async (req, res) => {
    try {
        const supervisorId = req.user.userId;

        const groups = await prisma.group.findMany({
            where: { supervisor_id: supervisorId },
            include: {
                members: { select: { role: true, user: { select: { id: true, name: true, email: true } } } },
                _count: { select: { week_statuses: true } },
            },
            orderBy: { name: 'asc' },
        });

        const formattedGroups = groups.map(g => ({
            ...g,
            members: g.members.map(m => ({ ...m.user, role: m.role }))
        }));

        res.status(200).json({ groups: formattedGroups });
    } catch (err) {
        console.error('getAssignedGroups error:', err);
        res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    }
};

// ─── GET /api/supervisor/groups/:groupId ─────────────────────────────────────
// Full group detail: members + all weeks with statuses/submissions
const getGroupDetail = async (req, res) => {
    try {
        const supervisorId = req.user.userId;
        const { groupId } = req.params;

        await assertSupervisorOwnsGroup(supervisorId, groupId);

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                members: { select: { role: true, user: { select: { id: true, name: true, email: true } } } },
                supervisor: { select: { id: true, name: true, email: true } },
            },
        });

        const formattedGroup = {
            ...group,
            members: group.members.map(m => ({ ...m.user, role: m.role }))
        };

        // Fetch all global weeks and merge with group-specific statuses
        const allWeeks = await prisma.week.findMany({ orderBy: { week_number: 'asc' } });
        const groupWeeks = await prisma.groupWeek.findMany({
            where: { group_id: groupId },
            include: {
                submitted_by: { select: { id: true, name: true, email: true } },
            },
        });

        const weeks = allWeeks.map(week => {
            const gw = groupWeeks.find(g => g.week_id === week.id);
            const fileMeta = readSubmissionMeta(groupId, week.id);
            return {
                ...week,
                group_week_id: gw?.id ?? null,
                status: gw?.status ?? 'PENDING',
                submission_comments: gw?.submission_comments ?? null,
                submitted_file_name: fileMeta?.originalName ?? null,
                submitted_file_type: fileMeta?.mimeType ?? null,
                submitted_file_size: fileMeta?.size ?? null,
                submitted_at: gw?.submitted_at ?? null,
                submitted_by: gw?.submitted_by ?? null,
                supervisor_feedback: gw?.supervisor_feedback ?? null,
                reviewed_at: gw?.reviewed_at ?? null,
            };
        });

        res.status(200).json({ group: formattedGroup, weeks });
    } catch (err) {
        console.error('getGroupDetail error:', err);
        res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    }
};

// ─── GET /api/supervisor/groups/:groupId/weeks/:weekId ───────────────────────
// Returns full detail for a single week of a group
const getWeekDetail = async (req, res) => {
    try {
        const supervisorId = req.user.userId;
        const { groupId, weekId } = req.params;

        await assertSupervisorOwnsGroup(supervisorId, groupId);

        const week = await prisma.week.findUnique({ where: { id: weekId } });
        if (!week) return res.status(404).json({ error: 'Week not found' });

        const gw = await prisma.groupWeek.findUnique({
            where: { group_id_week_id: { group_id: groupId, week_id: weekId } },
            include: { submitted_by: { select: { id: true, name: true, email: true } } },
        });
        const fileMeta = readSubmissionMeta(groupId, weekId);

        res.status(200).json({
            week,
            submission: gw
                ? {
                      id: gw.id,
                      status: gw.status,
                      submission_comments: gw.submission_comments,
                      submitted_file_name: fileMeta?.originalName ?? null,
                      submitted_file_type: fileMeta?.mimeType ?? null,
                      submitted_file_size: fileMeta?.size ?? null,
                      submitted_at: gw.submitted_at,
                      submitted_by: gw.submitted_by,
                      supervisor_feedback: gw.supervisor_feedback,
                      reviewed_at: gw.reviewed_at,
                  }
                : null,
        });
    } catch (err) {
        console.error('getWeekDetail error:', err);
        res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    }
};

// ─── PUT /api/supervisor/groups/:groupId/weeks/:weekId/approve ───────────────
const approveWeek = async (req, res) => {
    try {
        const supervisorId = req.user.userId;
        const { groupId, weekId } = req.params;

        await assertSupervisorOwnsGroup(supervisorId, groupId);

        const updated = await prisma.groupWeek.upsert({
            where: { group_id_week_id: { group_id: groupId, week_id: weekId } },
            update: {
                status: 'APPROVED',
                supervisor_feedback: null,
                reviewed_at: new Date(),
            },
            create: {
                group_id: groupId,
                week_id: weekId,
                status: 'APPROVED',
                reviewed_at: new Date(),
            },
        });

        res.status(200).json({ message: 'Week approved.', submission: updated });
    } catch (err) {
        console.error('approveWeek error:', err);
        res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    }
};

// ─── PUT /api/supervisor/groups/:groupId/weeks/:weekId/reject ────────────────
const rejectWeek = async (req, res) => {
    try {
        const supervisorId = req.user.userId;
        const { groupId, weekId } = req.params;
        const { feedback } = req.body;

        if (!feedback || !feedback.trim()) {
            return res.status(400).json({ error: 'Feedback is required when rejecting a submission.' });
        }

        await assertSupervisorOwnsGroup(supervisorId, groupId);

        const updated = await prisma.groupWeek.upsert({
            where: { group_id_week_id: { group_id: groupId, week_id: weekId } },
            update: {
                status: 'REJECTED',
                supervisor_feedback: feedback.trim(),
                reviewed_at: new Date(),
            },
            create: {
                group_id: groupId,
                week_id: weekId,
                status: 'REJECTED',
                supervisor_feedback: feedback.trim(),
                reviewed_at: new Date(),
            },
        });

        res.status(200).json({ message: 'Week rejected with feedback.', submission: updated });
    } catch (err) {
        console.error('rejectWeek error:', err);
        res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    }
};

// GET /api/supervisor/groups/:groupId/weeks/:weekId/file
const downloadWeekSubmission = async (req, res) => {
    try {
        const supervisorId = req.user.userId;
        const { groupId, weekId } = req.params;

        await assertSupervisorOwnsGroup(supervisorId, groupId);

        const submission = await prisma.groupWeek.findUnique({
            where: { group_id_week_id: { group_id: groupId, week_id: weekId } },
        });

        const fileMeta = readSubmissionMeta(groupId, weekId);

        if (!submission || !fileMeta?.storedPath || !fileMeta.originalName) {
            return res.status(404).json({ error: 'No uploaded file was found for this week.' });
        }

        res.download(fileMeta.storedPath, fileMeta.originalName);
    } catch (err) {
        console.error('downloadWeekSubmission error:', err);
        res.status(err.status || 500).json({ error: err.message || 'Failed to download file.' });
    }
};

// POST /api/supervisor/groups/:groupId/weeks/:weekId/report
const generateWeekReport = async (req, res) => {
    try {
        const supervisorId = req.user.userId;
        const { groupId, weekId } = req.params;

        await assertSupervisorOwnsGroup(supervisorId, groupId);

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                supervisor: { select: { id: true, name: true, email: true } },
                members: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });

        const week = await prisma.week.findUnique({ where: { id: weekId } });
        const submission = await prisma.groupWeek.findUnique({
            where: { group_id_week_id: { group_id: groupId, week_id: weekId } },
        });

        if (!group || !week) {
            return res.status(404).json({ error: 'Group or week not found.' });
        }

        const providedStudents = Array.isArray(req.body?.students)
            ? req.body.students.map(sanitizeStudent).filter((student) => student.name)
            : [];

        const fallbackStudents = group.members.map((member) => ({
            name: member.user.name,
            reg: '',
            mobile: '',
            email: member.user.email,
        }));

        const reportData = {
            courseCode: sanitizeReportValue(req.body?.courseCode, 'AIM2270'),
            semesterSection: sanitizeReportValue(req.body?.semesterSection, 'IV / B'),
            facultySupervisor: sanitizeReportValue(
                req.body?.facultySupervisor,
                group.supervisor?.name || 'Supervisor'
            ),
            weekInfo: sanitizeReportValue(
                req.body?.weekInfo,
                formatWeekInfo(week, submission?.submitted_at)
            ),
            projectTitle: sanitizeReportValue(req.body?.projectTitle, group.topic || group.name),
            programmingLanguage: sanitizeReportValue(req.body?.programmingLanguage, 'Not specified'),
            projectStatus: sanitizeReportValue(req.body?.projectStatus, submission?.status || 'PENDING'),
            weeklySummary: sanitizeReportValue(
                req.body?.weeklySummary,
                submission?.submission_comments || 'No weekly summary provided.'
            ),
            individualContribution: sanitizeReportValue(
                req.body?.individualContribution,
                'Contribution details not provided.'
            ),
            students: providedStudents.length > 0 ? providedStudents : fallbackStudents,
        };

        const pdfBuffer = await generateWeeklyReportPdf(reportData);
        const fileName = `${group.name}_${week.name}_Weekly_Report.pdf`.replace(/\s+/g, '_');

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': pdfBuffer.length.toString(),
        });
        res.send(pdfBuffer);
    } catch (err) {
        console.error('generateWeekReport error:', err);
        res.status(err.status || 500).json({ error: err.message || 'Failed to generate report.' });
    }
};

// ─── GET /api/supervisor/requests ──────────────────────────────────────────────
const getRequests = async (req, res) => {
    try {
        const supervisorId = req.user.userId;
        const requests = await prisma.supervisorRequest.findMany({
            where: { supervisor_id: supervisorId, status: 'PENDING' },
            include: {
                group: {
                    include: {
                        members: {
                            include: { user: { select: { id: true, name: true, email: true } } }
                        }
                    }
                }
            },
            orderBy: { created_at: 'asc' }
        });
        
        const formatted = requests.map(r => ({
            id: r.id,
            status: r.status,
            group: {
                id: r.group.id,
                name: r.group.name,
                status: r.group.status,
                members: r.group.members.map(m => m.user)
            }
        }));

        res.status(200).json({ requests: formatted });
    } catch (err) {
        console.error('getRequests error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── PUT /api/supervisor/requests/:id/approve ────────────────────────────────
const approveRequest = async (req, res) => {
    try {
        const supervisorId = req.user.userId;
        const { id } = req.params;

        const request = await prisma.supervisorRequest.findUnique({ where: { id } });
        if (!request || request.supervisor_id !== supervisorId || request.status !== 'PENDING') {
            return res.status(404).json({ error: 'Pending request not found.' });
        }

        await prisma.$transaction([
            prisma.supervisorRequest.update({
                where: { id },
                data: { status: 'APPROVED' }
            }),
            prisma.group.update({
                where: { id: request.group_id },
                data: { 
                    status: 'APPROVED',
                    supervisor_id: supervisorId
                }
            })
        ]);

        res.status(200).json({ message: 'Request approved successfully.' });
    } catch (err) {
        console.error('approveRequest error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── PUT /api/supervisor/requests/:id/reject ─────────────────────────────────
const rejectRequest = async (req, res) => {
    try {
        const supervisorId = req.user.userId;
        const { id } = req.params;

        const request = await prisma.supervisorRequest.findUnique({ where: { id } });
        if (!request || request.supervisor_id !== supervisorId || request.status !== 'PENDING') {
            return res.status(404).json({ error: 'Pending request not found.' });
        }

        await prisma.$transaction([
            prisma.supervisorRequest.update({
                where: { id },
                data: { status: 'REJECTED' }
            }),
            prisma.group.update({
                where: { id: request.group_id },
                data: { status: 'REJECTED' }
            })
        ]);

        res.status(200).json({ message: 'Request rejected.' });
    } catch (err) {
        console.error('rejectRequest error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAssignedGroups,
    getGroupDetail,
    getWeekDetail,
    approveWeek,
    rejectWeek,
    downloadWeekSubmission,
    generateWeekReport,
    getRequests,
    approveRequest,
    rejectRequest,
};
