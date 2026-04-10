const { prisma } = require('../models/userModel');
const { readSubmissionMeta, saveSubmissionFile } = require('../utils/submissionStorage');

function normalizeBoolean(value) {
    return value === true || value === 'true';
}

function normalizeComments(value) {
    return typeof value === 'string' ? value.trim() : '';
}

// ─── POST /api/submissions/:weekId ───────────────────────────────────────────
// Student submits or saves a draft for a given week
const submitWeek = async (req, res) => {
    try {
        const userId  = req.user.userId;
        const { weekId } = req.params;
        const comments = normalizeComments(req.body?.comments);
        const isDraft = normalizeBoolean(req.body?.isDraft);

        const membership = await prisma.groupMember.findUnique({
            where: { user_id: userId },
            select: { group_id: true },
        });

        if (!membership?.group_id) {
            return res.status(400).json({ error: 'You are not assigned to a group.' });
        }

        const week = await prisma.week.findUnique({ where: { id: weekId } });
        if (!week) return res.status(404).json({ error: 'Week not found.' });

        const existingSubmission = await prisma.groupWeek.findUnique({
            where: {
                group_id_week_id: {
                    group_id: membership.group_id,
                    week_id: weekId,
                },
            },
        });

        if (existingSubmission?.status === 'APPROVED') {
            return res.status(400).json({ error: 'Approved reports are locked and cannot be changed.' });
        }

        let nextFile = null;
        if (req.body?.file) {
            nextFile = saveSubmissionFile({
                groupId: membership.group_id,
                weekId,
                file: req.body.file,
            });
        }

        const existingMeta = readSubmissionMeta(membership.group_id, weekId);
        const existingFileAvailable = Boolean(existingMeta);
        const hasAnyFile = Boolean(nextFile || existingFileAvailable);

        if (!isDraft && !hasAnyFile) {
            return res.status(400).json({ error: 'Please upload a PDF, DOC, or DOCX file before submitting.' });
        }

        if (isDraft && !hasAnyFile && !comments) {
            return res.status(400).json({ error: 'Add comments or choose a file before saving a draft.' });
        }

        const newStatus = isDraft ? 'DRAFT' : 'SUBMITTED';

        const submission = await prisma.groupWeek.upsert({
            where: {
                group_id_week_id: {
                    group_id: membership.group_id,
                    week_id: weekId,
                },
            },
            update: {
                submission_comments: comments || null,
                submitted_at: isDraft ? null : new Date(),
                submitted_by_id: isDraft ? null : userId,
                status: newStatus,
                supervisor_feedback: null,
                reviewed_at: null,
            },
            create: {
                group_id: membership.group_id,
                week_id: weekId,
                submission_comments: comments || null,
                submitted_at: isDraft ? null : new Date(),
                submitted_by_id: isDraft ? null : userId,
                status: newStatus,
                supervisor_feedback: null,
                reviewed_at: null,
            },
        });

        res.status(200).json({
            message: isDraft ? 'Draft saved.' : 'Report submitted.',
            submission,
        });
    } catch (err) {
        console.error('submitWeek error:', err);
        res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    }
};

const downloadWeekFile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { weekId } = req.params;

        const membership = await prisma.groupMember.findUnique({
            where: { user_id: userId },
            select: { group_id: true },
        });

        if (!membership?.group_id) {
            return res.status(400).json({ error: 'You are not assigned to a group.' });
        }

        const submission = await prisma.groupWeek.findUnique({
            where: {
                group_id_week_id: {
                    group_id: membership.group_id,
                    week_id: weekId,
                },
            },
        });

        const submissionMeta = readSubmissionMeta(membership.group_id, weekId);

        if (!submission || !submissionMeta?.storedPath || !submissionMeta.originalName) {
            return res.status(404).json({ error: 'No uploaded file was found for this week.' });
        }

        res.download(submissionMeta.storedPath, submissionMeta.originalName);
    } catch (err) {
        console.error('downloadWeekFile error:', err);
        res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    }
};

// ─── POST /api/submissions/:weekId/report ────────────────────────────────────
// Student generates a formal weekly progress report PDF
const generateStudentReport = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { weekId } = req.params;

        const membership = await prisma.groupMember.findUnique({
            where: { user_id: userId },
            include: { group: { include: { supervisor: { select: { name: true, email: true } }, members: { include: { user: { select: { name: true, email: true } } } } } } },
        });

        if (!membership?.group_id) {
            return res.status(400).json({ error: 'You are not assigned to a group.' });
        }

        const week = await prisma.week.findUnique({ where: { id: weekId } });
        if (!week) return res.status(404).json({ error: 'Week not found.' });

        const submission = await prisma.groupWeek.findUnique({
            where: { group_id_week_id: { group_id: membership.group_id, week_id: weekId } },
        });

        const group = membership.group;

        function sanitizeVal(value, fallback = '') {
            return typeof value === 'string' && value.trim() ? value.trim() : fallback;
        }

        const providedStudents = Array.isArray(req.body?.students)
            ? req.body.students.filter(s => s && s.name)
            : [];

        const fallbackStudents = group.members.map(m => ({
            name: m.user.name,
            reg: '',
            mobile: '',
            email: m.user.email,
        }));

        const submittedDate = submission?.submitted_at
            ? new Date(submission.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Date not available';

        const reportData = {
            courseCode: sanitizeVal(req.body?.courseCode, 'AIM2270'),
            semesterSection: sanitizeVal(req.body?.semesterSection, 'IV / B'),
            facultySupervisor: sanitizeVal(req.body?.facultySupervisor, group.supervisor?.name || 'Supervisor'),
            weekInfo: sanitizeVal(req.body?.weekInfo, `${week.name} - ${submittedDate}`),
            projectTitle: sanitizeVal(req.body?.projectTitle, group.topic || group.name),
            programmingLanguage: sanitizeVal(req.body?.programmingLanguage, 'Not specified'),
            projectStatus: sanitizeVal(req.body?.projectStatus, submission?.status || 'PENDING'),
            weeklySummary: sanitizeVal(req.body?.weeklySummary, submission?.submission_comments || 'No weekly summary provided.'),
            individualContribution: sanitizeVal(req.body?.individualContribution, 'Contribution details not provided.'),
            students: providedStudents.length > 0 ? providedStudents : fallbackStudents,
        };

        const { generateWeeklyReportPdf } = require('../utils/reportPdf');
        const pdfBuffer = await generateWeeklyReportPdf(reportData);
        const fileName = `${group.name}_${week.name}_Weekly_Report.pdf`.replace(/\s+/g, '_');

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': pdfBuffer.length.toString(),
        });
        res.send(pdfBuffer);
    } catch (err) {
        console.error('generateStudentReport error:', err);
        res.status(err.status || 500).json({ error: err.message || 'Failed to generate report.' });
    }
};

module.exports = { submitWeek, downloadWeekFile, generateStudentReport };
