const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  preferences: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    botName: { type: String, default: 'NovaAI' },
    category: { type: String, enum: ['general', 'casual', 'professional', 'creative'], default: 'general' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
