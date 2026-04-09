const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisorController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const isSupervisor = [verifyToken, requireRole(['SUPERVISOR'])];

// All assigned groups for this supervisor
router.get('/groups', isSupervisor, supervisorController.getAssignedGroups);

// Full group detail (members + all weeks merged)
router.get('/groups/:groupId', isSupervisor, supervisorController.getGroupDetail);

// Single week detail for a group
router.get('/groups/:groupId/weeks/:weekId', isSupervisor, supervisorController.getWeekDetail);

// Approve a week submission
router.put('/groups/:groupId/weeks/:weekId/approve', isSupervisor, supervisorController.approveWeek);

// Reject a week submission with feedback
router.put('/groups/:groupId/weeks/:weekId/reject', isSupervisor, supervisorController.rejectWeek);

// Download the student's uploaded weekly report file
router.get('/groups/:groupId/weeks/:weekId/file', isSupervisor, supervisorController.downloadWeekSubmission);

// Generate a weekly progress report PDF for the selected group/week
router.post('/groups/:groupId/weeks/:weekId/report', isSupervisor, supervisorController.generateWeekReport);

// Supervisor requests queue
router.get('/requests', isSupervisor, supervisorController.getRequests);
router.put('/requests/:id/approve', isSupervisor, supervisorController.approveRequest);
router.put('/requests/:id/reject', isSupervisor, supervisorController.rejectRequest);

module.exports = router;
