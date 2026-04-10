const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const {
  getGrades,
  createGrade,
  updateGrade,
  publishGrades,
  getMyGrades
} = require('../controllers/gradingController');

// Supervisor routes
router.get('/', verifyToken, requireRole(['SUPERVISOR']), getGrades);
router.post('/', verifyToken, requireRole(['SUPERVISOR']), createGrade);
router.put('/:gradeId', verifyToken, requireRole(['SUPERVISOR']), updateGrade);
router.post('/publish', verifyToken, requireRole(['SUPERVISOR']), publishGrades);

// Student route
router.get('/me', verifyToken, requireRole(['STUDENT']), getMyGrades);

module.exports = router;

