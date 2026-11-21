const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'general' },
  rating: {
    score: { type: Number, enum: [1, -1, 0], default: 0 },
    feedback: { type: String, default: '' }
  },
  tokens: { type: Number, default: 0 },
  responseTimeMs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
