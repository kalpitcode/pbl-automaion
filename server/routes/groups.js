const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, groupController.getMyGroup);
router.post('/', verifyToken, groupController.createGroup);
router.post('/join', verifyToken, groupController.joinGroup);
router.get('/supervisors', verifyToken, groupController.getSupervisors);
router.post('/request-supervisor', verifyToken, groupController.requestSupervisor);

router.get('/my-group/weeks', verifyToken, groupController.getMyGroupWeeks);

module.exports = router;
