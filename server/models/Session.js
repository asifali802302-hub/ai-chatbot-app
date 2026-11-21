const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Conversation' },
  category: { 
    type: String, 
    enum: ['general', 'casual', 'professional', 'creative'], 
    default: 'general' 
  },
  pinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Session || mongoose.model('Session', SessionSchema);
