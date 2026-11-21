const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.use(requireAdmin);

router.get('/analytics', getAnalytics);

module.exports = router;
