const { prisma } = require('../models/userModel');

// ─── POST /api/submissions/:weekId ───────────────────────────────────────────
// Student submits or saves a draft for a given week
const submitWeek = async (req, res) => {
    try {
        const userId  = req.user.userId;
        const { weekId } = req.params;
        const { comments, isDraft } = req.body;

        // Get the student's group
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { group_id: true },
        });

        if (!user?.group_id) {
            return res.status(400).json({ error: 'You are not assigned to a group.' });
        }

        const week = await prisma.week.findUnique({ where: { id: weekId } });
        if (!week) return res.status(404).json({ error: 'Week not found.' });

        const newStatus = isDraft ? 'PENDING' : 'SUBMITTED';

        const submission = await prisma.groupWeek.upsert({
            where: {
                group_id_week_id: {
                    group_id: user.group_id,
                    week_id: weekId,
                },
            },
            update: {
                submission_comments: comments ?? null,
                submitted_at: isDraft ? undefined : new Date(),
                submitted_by_id: isDraft ? undefined : userId,
                status: newStatus,
            },
            create: {
                group_id: user.group_id,
                week_id: weekId,
                submission_comments: comments ?? null,
                submitted_at: isDraft ? null : new Date(),
                submitted_by_id: isDraft ? null : userId,
                status: newStatus,
            },
        });

        res.status(200).json({
            message: isDraft ? 'Draft saved.' : 'Report submitted.',
            submission,
        });
    } catch (err) {
        console.error('submitWeek error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { submitWeek };
