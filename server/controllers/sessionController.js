const Store = require('../models/store');

const getSessions = async (req, res) => {
  try {
    const sessions = await Store.getSessionsByUser(req.user._id);
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
  }
};

const createSession = async (req, res) => {
  try {
    const { title, category } = req.body;
    const sessionTitle = title || 'New Conversation';
    const sessionCategory = category || req.user.preferences?.category || 'general';

    const session = await Store.createSession(req.user._id, sessionTitle, sessionCategory);
    res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create session', error: error.message });
  }
};

const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Store.getSessionById(sessionId, req.user._id);

    if (!session) {
      return res.status(404).json({ message: 'Conversation session not found' });
    }

    const messages = await Store.getMessagesBySession(sessionId);
    res.json({ session, messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};

const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const session = await Store.updateSessionTitle(sessionId, req.user._id, title);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ message: 'Session updated', session });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update session', error: error.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const deleted = await Store.deleteSession(sessionId, req.user._id);

    if (!deleted) {
      return res.status(404).json({ message: 'Session not found or already deleted' });
    }

    res.json({ message: 'Conversation session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete session', error: error.message });
  }
};

module.exports = {
  getSessions,
  createSession,
  getSessionMessages,
  updateSession,
  deleteSession
};
