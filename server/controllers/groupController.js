const { prisma } = require('../models/userModel');
const { readSubmissionMeta } = require('../utils/submissionStorage');

// Helper to check if user is already in a group
const checkUserGroup = async (userId) => {
    return await prisma.groupMember.findUnique({ where: { user_id: userId } });
};

// GET /api/groups/me
const getMyGroup = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        if (role === 'STUDENT') {
            const membership = await prisma.groupMember.findUnique({
                where: { user_id: userId },
                include: {
                    group: {
                        include: {
                            supervisor: { select: { id: true, name: true, email: true } },
                            members: { include: { user: { select: { id: true, name: true, email: true } } } },
                            supervisor_request: { include: { supervisor: { select: { id: true, name: true } } } }
                        }
                    }
                }
            });

            if (!membership || !membership.group) {
                return res.status(200).json({ group: null, msg: "No group assigned" });
            }

            const formattedGroup = {
                ...membership.group,
                members: membership.group.members.map(m => ({
                    id: m.user.id,
                    name: m.user.name,
                    email: m.user.email,
                    role: m.role
                }))
            };

            return res.status(200).json({ group: formattedGroup, myRole: membership.role });
        } else if (role === 'SUPERVISOR') {
            const supervisedGroups = await prisma.group.findMany({
                where: { supervisor_id: userId },
                include: {
                    members: { include: { user: { select: { id: true, name: true, email: true } } } }
                }
            });

            const formattedGroups = supervisedGroups.map(g => ({
                ...g,
                members: g.members.map(m => m.user)
            }));
            return res.status(200).json({ groups: formattedGroups });
        }
        
        return res.status(403).json({ error: 'Role not supported' });
    } catch (err) {
        console.error('Error in getMyGroup:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/groups
const createGroup = async (req, res) => {
    try {
        const userId = req.user.userId;
        let { name } = req.body;

        if (!name) return res.status(400).json({ error: 'Group name required' });
        name = name.trim().toLowerCase();

        // check if user already in group
        const existingMember = await checkUserGroup(userId);
        if (existingMember) return res.status(400).json({ error: 'You are already in a group' });

        // check if group name exists
        const existingGroup = await prisma.group.findUnique({ where: { name } });
        if (existingGroup) return res.status(400).json({ error: 'Group name already taken' });

        // create group and make user LEADER
        const newGroup = await prisma.group.create({
            data: {
                name,
                status: 'PENDING',
                members: {
                    create: {
                        user_id: userId,
                        role: 'LEADER'
                    }
                }
            }
        });

        res.status(201).json({ group: newGroup, message: "Group created successfully" });
    } catch (err) {
        console.error('Create group error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/groups/join
const joinGroup = async (req, res) => {
    try {
        const userId = req.user.userId;
        let { name } = req.body;
        
        if (!name) return res.status(400).json({ error: 'Group name required' });
        name = name.trim().toLowerCase();

        // check if already in group
        if (await checkUserGroup(userId)) {
            return res.status(400).json({ error: 'You are already in a group' });
        }

        const group = await prisma.group.findUnique({
            where: { name },
            include: { members: true }
        });

        if (!group) return res.status(404).json({ error: 'Group not found' });
        if (group.members.length >= 4) return res.status(400).json({ error: 'Group is full (max 4 members)' });

        const membership = await prisma.groupMember.create({
            data: {
                user_id: userId,
                group_id: group.id,
                role: 'MEMBER'
            }
        });

        res.status(200).json({ membership, message: "Joined group successfully" });
    } catch (err) {
        console.error('Join group error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/groups/supervisors
const getSupervisors = async (req, res) => {
    try {
        const supervisors = await prisma.user.findMany({
            where: { role: 'SUPERVISOR' },
            select: { id: true, name: true, email: true }
        });
        res.status(200).json({ supervisors });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/groups/request-supervisor
const requestSupervisor = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { supervisorId } = req.body;

        if (!supervisorId) return res.status(400).json({ error: 'Supervisor ID required' });

        const membership = await checkUserGroup(userId);
        if (!membership || membership.role !== 'LEADER') {
            return res.status(403).json({ error: 'Only the group leader can send a request' });
        }

        const groupId = membership.group_id;

        // Check active requests
        const existingReq = await prisma.supervisorRequest.findUnique({ where: { group_id: groupId } });
        
        if (existingReq && existingReq.status === 'PENDING') {
            return res.status(400).json({ error: 'Group already has a pending supervisor request' });
        }

        let request;
        if (existingReq) {
            // Update rejected to track new pending request
            request = await prisma.supervisorRequest.update({
                where: { group_id: groupId },
                data: {
                    supervisor_id: supervisorId,
                    status: 'PENDING'
                }
            });
        } else {
            request = await prisma.supervisorRequest.create({
                data: {
                    group_id: groupId,
                    supervisor_id: supervisorId,
                    status: 'PENDING'
                }
            });
        }

        // Also update group status to PENDING
        await prisma.group.update({
            where: { id: groupId },
            data: { status: 'PENDING' }
        });

        res.status(200).json({ request, message: "Supervisor request sent successfully" });
    } catch (err) {
        console.error('Request supervisor error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/groups/my-group/weeks
const getMyGroupWeeks = async (req, res) => {
    try {
        const userId = req.user.userId;

        const membership = await checkUserGroup(userId);
        if (!membership) return res.status(404).json({ error: 'Group mapping not found' });

        const groupId = membership.group_id;

        const allWeeks = await prisma.week.findMany({ orderBy: { week_number: 'asc' } });
        const groupWeeks = await prisma.groupWeek.findMany({ where: { group_id: groupId } });

        const mergedWeeks = allWeeks.map(week => {
            const statusRecord = groupWeeks.find(gw => gw.week_id === week.id);
            const fileMeta = readSubmissionMeta(groupId, week.id);
            return {
                ...week,
                status: statusRecord ? statusRecord.status : 'PENDING',
                submission_comments: statusRecord?.submission_comments ?? null,
                submitted_file_name: fileMeta?.originalName ?? null,
                submitted_file_type: fileMeta?.mimeType ?? null,
                submitted_file_size: fileMeta?.size ?? null,
                submitted_at: statusRecord?.submitted_at ?? null,
                supervisor_feedback: statusRecord?.supervisor_feedback ?? null,
            };
        });

        res.status(200).json({ weeks: mergedWeeks });
    } catch (err) {
        console.error('Error in getMyGroupWeeks:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getMyGroup,
    getMyGroupWeeks,
    createGroup,
    joinGroup,
    getSupervisors,
    requestSupervisor
};
