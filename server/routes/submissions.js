const express = require('express');
const router = express.Router();
const { submitWeek } = require('../controllers/submissionController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// POST /api/submissions/:weekId  — student submits or saves a draft
router.post('/:weekId', verifyToken, requireRole(['STUDENT']), submitWeek);

module.exports = router;
