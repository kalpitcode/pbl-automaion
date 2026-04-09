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

module.exports = { submitWeek, downloadWeekFile };
