const { prisma } = require('../models/userModel');

// GET /api/weeks
const getAvailableWeeks = async (req, res) => {
    try {
        const weeks = await prisma.week.findMany({
            orderBy: { week_number: 'asc' }
        });
        res.status(200).json({ weeks });
    } catch (err) {
        console.error('Error fetching global weeks:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /api/groups/:groupId/weeks/:weekId/status
const updateWeekStatus = async (req, res) => {
    try {
        const { groupId, weekId } = req.params;
        const { status } = req.body;

        if (!status || !['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updated = await prisma.groupWeek.upsert({
            where: {
                group_id_week_id: {
                    group_id: groupId,
                    week_id: weekId
                }
            },
            update: {
                status: status.toUpperCase()
            },
            create: {
                group_id: groupId,
                week_id: weekId,
                status: status.toUpperCase()
            }
        });

        res.status(200).json({ message: 'Week status updated', updated });
    } catch (err) {
        console.error('Error updating week status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAvailableWeeks,
    updateWeekStatus
};
