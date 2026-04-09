const express = require('express');
const router = express.Router();
const { downloadWeekFile, submitWeek } = require('../controllers/submissionController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// POST /api/submissions/:weekId  — student submits or saves a draft
router.post('/:weekId', verifyToken, requireRole(['STUDENT']), submitWeek);
router.get('/:weekId/file', verifyToken, requireRole(['STUDENT']), downloadWeekFile);

module.exports = router;
