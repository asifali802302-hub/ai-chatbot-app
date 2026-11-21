const express = require('express');
const router = express.Router();
const { sendMessage, rateMessage } = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/message', sendMessage);
router.post('/rate/:messageId', rateMessage);

module.exports = router;
