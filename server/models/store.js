const mongoose = require('mongoose');
const User = require('./User');
const Session = require('./Session');
const Message = require('./Message');

// In-memory fallback collections
const memStore = {
  users: [],
  sessions: [],
  messages: []
};

const isMongoActive = () => mongoose.connection && mongoose.connection.readyState === 1;

// Helper to generate a fake ObjectId-like 24 hex string
const generateId = () => {
  return 'mem' + Math.random().toString(16).substring(2, 10) + Date.now().toString(16).substring(0, 12);
};

const Store = {
  // === USER OPERATIONS ===
  async findUserByEmail(email) {
    if (isMongoActive()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return memStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (isMongoActive()) {
      return await User.findById(id).select('-password');
    }
    const user = memStore.users.find(u => u._id.toString() === id.toString());
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },

  async createUser(userData) {
    if (isMongoActive()) {
      const user = new User(userData);
      return await user.save();
    }
    const newUser = {
      _id: generateId(),
      ...userData,
      preferences: userData.preferences || { theme: 'dark', botName: 'NovaAI', category: 'general' },
      createdAt: new Date()
    };
    memStore.users.push(newUser);
    return newUser;
  },

  async updateUserPreferences(userId, prefs) {
    if (isMongoActive()) {
      return await User.findByIdAndUpdate(
        userId,
        { $set: { preferences: prefs } },
        { new: true }
      ).select('-password');
    }
    const idx = memStore.users.findIndex(u => u._id.toString() === userId.toString());
    if (idx !== -1) {
      memStore.users[idx].preferences = { ...memStore.users[idx].preferences, ...prefs };
      const { password, ...safeUser } = memStore.users[idx];
      return safeUser;
    }
    return null;
  },

  // === SESSION OPERATIONS ===
  async getSessionsByUser(userId) {
    if (isMongoActive()) {
      return await Session.find({ userId }).sort({ updatedAt: -1 });
    }
    return memStore.sessions
      .filter(s => s.userId.toString() === userId.toString())
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  async getSessionById(sessionId, userId) {
    if (isMongoActive()) {
      return await Session.findOne({ _id: sessionId, userId });
    }
    return memStore.sessions.find(s => s._id.toString() === sessionId.toString() && s.userId.toString() === userId.toString()) || null;
  },

  async createSession(userId, title = 'New Conversation', category = 'general') {
    if (isMongoActive()) {
      const s = new Session({ userId, title, category });
      return await s.save();
    }
    const newSession = {
      _id: generateId(),
      userId,
      title,
      category,
      pinned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memStore.sessions.push(newSession);
    return newSession;
  },

  async updateSessionTitle(sessionId, userId, title) {
    if (isMongoActive()) {
      return await Session.findOneAndUpdate(
        { _id: sessionId, userId },
        { $set: { title, updatedAt: new Date() } },
        { new: true }
      );
    }
    const s = memStore.sessions.find(item => item._id.toString() === sessionId.toString() && item.userId.toString() === userId.toString());
    if (s) {
      s.title = title;
      s.updatedAt = new Date();
      return s;
    }
    return null;
  },

  async deleteSession(sessionId, userId) {
    if (isMongoActive()) {
      await Message.deleteMany({ sessionId });
      return await Session.findOneAndDelete({ _id: sessionId, userId });
    }
    memStore.messages = memStore.messages.filter(m => m.sessionId.toString() !== sessionId.toString());
    const initialLen = memStore.sessions.length;
    memStore.sessions = memStore.sessions.filter(s => !(s._id.toString() === sessionId.toString() && s.userId.toString() === userId.toString()));
    return memStore.sessions.length < initialLen;
  },

  // === MESSAGE OPERATIONS ===
  async getMessagesBySession(sessionId) {
    if (isMongoActive()) {
      return await Message.find({ sessionId }).sort({ createdAt: 1 });
    }
    return memStore.messages
      .filter(m => m.sessionId.toString() === sessionId.toString())
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  async createMessage(msgData) {
    if (isMongoActive()) {
      const m = new Message(msgData);
      const saved = await m.save();
      await Session.findByIdAndUpdate(msgData.sessionId, { $set: { updatedAt: new Date() } });
      return saved;
    }
    const newMsg = {
      _id: generateId(),
      ...msgData,
      rating: msgData.rating || { score: 0, feedback: '' },
      tokens: msgData.tokens || 0,
      responseTimeMs: msgData.responseTimeMs || 0,
      createdAt: new Date()
    };
    memStore.messages.push(newMsg);

    const s = memStore.sessions.find(x => x._id.toString() === msgData.sessionId.toString());
    if (s) s.updatedAt = new Date();

    return newMsg;
  },

  async rateMessage(messageId, score, feedback = '') {
    if (isMongoActive()) {
      return await Message.findByIdAndUpdate(
        messageId,
        { $set: { rating: { score, feedback } } },
        { new: true }
      );
    }
    const m = memStore.messages.find(item => item._id.toString() === messageId.toString());
    if (m) {
      m.rating = { score, feedback };
      return m;
    }
    return null;
  },

  // === ADMIN / ANALYTICS OPERATIONS ===
  async getAnalytics() {
    let totalUsers = 0;
    let totalSessions = 0;
    let totalMessages = 0;
    let avgResponseTime = 0;
    let positiveRatings = 0;
    let negativeRatings = 0;
    let categoryBreakdown = { general: 0, casual: 0, professional: 0, creative: 0 };
    let recentMessages = [];

    if (isMongoActive()) {
      totalUsers = await User.countDocuments();
      totalSessions = await Session.countDocuments();
      totalMessages = await Message.countDocuments();
      
      const resTimeAgg = await Message.aggregate([
        { $match: { sender: 'ai', responseTimeMs: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$responseTimeMs' } } }
      ]);
      avgResponseTime = resTimeAgg[0] ? Math.round(resTimeAgg[0].avg) : 320;

      positiveRatings = await Message.countDocuments({ 'rating.score': 1 });
      negativeRatings = await Message.countDocuments({ 'rating.score': -1 });

      const catAgg = await Message.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      catAgg.forEach(c => {
        if (c._id && categoryBreakdown[c._id] !== undefined) {
          categoryBreakdown[c._id] = c.count;
        }
      });

      recentMessages = await Message.find().sort({ createdAt: -1 }).limit(10);
    } else {
      totalUsers = memStore.users.length;
      totalSessions = memStore.sessions.length;
      totalMessages = memStore.messages.length;

      const aiMsgs = memStore.messages.filter(m => m.sender === 'ai' && m.responseTimeMs > 0);
      avgResponseTime = aiMsgs.length > 0 
        ? Math.round(aiMsgs.reduce((acc, m) => acc + m.responseTimeMs, 0) / aiMsgs.length) 
        : 340;

      positiveRatings = memStore.messages.filter(m => m.rating?.score === 1).length;
      negativeRatings = memStore.messages.filter(m => m.rating?.score === -1).length;

      memStore.messages.forEach(m => {
        const cat = m.category || 'general';
        if (categoryBreakdown[cat] !== undefined) categoryBreakdown[cat]++;
      });

      recentMessages = [...memStore.messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
    }

    return {
      totalUsers,
      totalSessions,
      totalMessages,
      avgResponseTimeMs: avgResponseTime,
      positiveRatings,
      negativeRatings,
      satisfactionRate: (positiveRatings + negativeRatings > 0) 
        ? Math.round((positiveRatings / (positiveRatings + negativeRatings)) * 100) 
        : 95,
      categoryBreakdown,
      recentMessages
    };
  }
};

module.exports = Store;
