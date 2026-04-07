const express = require('express');
const router = express.Router();
const weekController = require('../controllers/weekController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, weekController.getAvailableWeeks);

// This sits here since it modifies a week, but applies to a specific group. 
// Can also live in /groups routes. We place it here or under groups as requested.
router.put('/groups/:groupId/:weekId/status', verifyToken, weekController.updateWeekStatus);

module.exports = router;
