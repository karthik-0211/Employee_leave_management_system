const express = require('express');
const { applyLeave, getLeaveHistory, getLeaveBalance } = require('../controllers/leaveController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.use(authenticateToken);
router.post('/apply', applyLeave);
router.get('/history', getLeaveHistory);
router.get('/balance', getLeaveBalance);

module.exports = router;