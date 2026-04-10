const { prisma } = require('../prisma');



// Helper to validate marks
const validateMarks = (cws, mte, ete) => {
  const c = parseInt(cws);
  const m = parseInt(mte);
  const e = parseInt(ete);
  if (isNaN(c) || c < 0 || c > 30) return 'CWS must be 0-30';
  if (isNaN(m) || m < 0 || m > 30) return 'MTE must be 0-30';
  if (isNaN(e) || e < 0 || e > 40) return 'ETE must be 0-40';
  return null;
};

// GET /api/grades - Supervisor: get all own groups/students grades (with/without records)
const getGrades = async (req, res) => {
  try {
    const supervisorId = req.user.userId;

    const groups = await prisma.group.findMany({
      where: { supervisor_id: supervisorId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

if (groups.length === 0) {
      res.json({ grades: [] });
      return;
    }
    const formattedGroups = [];
    for (const g of groups) {
      const groupGrades = await prisma.studentGrades.findMany({
        where: {
          supervisor_id: supervisorId,
          group_id: g.id
        },
        include: {
          student: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      const students = g.members.map(m => {
        const grade = groupGrades.find(gr => gr.student_id === m.user_id);
        return {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          memberRole: m.role,
          cws: grade?.cws || null,
          mte: grade?.mte || null,
          ete: grade?.ete || null,
          total: grade?.total || null,
          is_published: grade?.is_published || false,
          gradeId: grade?.id || null
        };
      });

      formattedGroups.push({
        id: g.id,
        name: g.name,
        students
      });
    }

    res.json({ grades: formattedGroups });
  } catch (err) {

    console.error('Get grades error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/grades - Create a new grade record for a student
const createGrade = async (req, res) => {
  try {
    const supervisorId = req.user.userId;
    const { studentId, groupId, cws, mte, ete } = req.body;

    if (!studentId || !groupId) {
      return res.status(400).json({ error: 'studentId and groupId are required' });
    }

    const error = validateMarks(cws, mte, ete);
    if (error) return res.status(400).json({ error });

    // Verify this supervisor owns the group
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group || group.supervisor_id !== supervisorId) {
      return res.status(403).json({ error: 'Not authorized for this group' });
    }

    // Verify the student is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: { user_id: studentId, group_id: groupId }
    });
    if (!membership) {
      return res.status(400).json({ error: 'Student is not a member of this group' });
    }

    const total = parseInt(cws) + parseInt(mte) + parseInt(ete);

    const grade = await prisma.studentGrades.upsert({
      where: {
        student_id_supervisor_id_group_id: {
          student_id: studentId,
          supervisor_id: supervisorId,
          group_id: groupId
        }
      },
      update: {
        cws: parseInt(cws),
        mte: parseInt(mte),
        ete: parseInt(ete),
        total
      },
      create: {
        student_id: studentId,
        supervisor_id: supervisorId,
        group_id: groupId,
        cws: parseInt(cws),
        mte: parseInt(mte),
        ete: parseInt(ete),
        total
      }
    });

    res.json({ grade, message: 'Grade created' });
  } catch (err) {
    console.error('Create grade error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/grades/:gradeId - Update marks for an existing grade
const updateGrade = async (req, res) => {
  try {
    const supervisorId = req.user.userId;
    const { gradeId } = req.params;
    const { cws, mte, ete } = req.body;

    const error = validateMarks(cws, mte, ete);
    if (error) return res.status(400).json({ error });

    // Check if grade exists and belongs to supervisor
    const existing = await prisma.studentGrades.findUnique({
      where: { id: gradeId }
    });
    if (!existing || existing.supervisor_id !== supervisorId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const total = parseInt(cws) + parseInt(mte) + parseInt(ete);

    const grade = await prisma.studentGrades.update({
      where: { id: gradeId },
      data: {
        cws: parseInt(cws),
        mte: parseInt(mte),
        ete: parseInt(ete),
        total
      }
    });

    res.json({ grade, message: 'Marks updated' });
  } catch (err) {
    console.error('Update grade error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/grades/publish - Publish all own grades
const publishGrades = async (req, res) => {
  try {
    const supervisorId = req.user.userId;

    await prisma.studentGrades.updateMany({
      where: { supervisor_id: supervisorId },
      data: { is_published: true }
    });

    res.json({ message: 'All marks published to students' });
  } catch (err) {
    console.error('Publish error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/grades/me - Student: get own published grades
const getMyGrades = async (req, res) => {
  try {
    const userId = req.user.userId;

    const grades = await prisma.studentGrades.findMany({
      where: {
        student_id: userId,
        is_published: true
      },
      include: {
        supervisor: { select: { name: true } },
        group: { select: { name: true } }
      }
    });

    res.json({ grades });
  } catch (err) {
    console.error('Get my grades error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getGrades,
  createGrade,
  updateGrade,
  publishGrades,
  getMyGrades
};

