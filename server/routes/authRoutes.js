const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePreferences } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/preferences', authenticate, updatePreferences);

module.exports = router;
