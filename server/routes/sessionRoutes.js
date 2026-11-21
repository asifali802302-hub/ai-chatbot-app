const express = require('express');
const router = express.Router();
const { 
  getSessions, 
  createSession, 
  getSessionMessages, 
  updateSession, 
  deleteSession 
} = require('../controllers/sessionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getSessions);
router.post('/', createSession);
router.get('/:sessionId', getSessionMessages);
router.put('/:sessionId', updateSession);
router.delete('/:sessionId', deleteSession);

module.exports = router;
