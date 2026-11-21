const jwt = require('jsonwebtoken');
const Store = require('../models/store');

const JWT_SECRET = process.env.JWT_SECRET || 'ai_chatbot_enterprise_jwt_secret_2026';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await Store.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Administrator privileges required' });
  }
  next();
};

const verifySocketToken = (token) => {
  try {
    if (!token) return null;
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    return jwt.verify(cleanToken, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  verifySocketToken,
  JWT_SECRET
};
