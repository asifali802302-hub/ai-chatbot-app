const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Store = require('../models/store');
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await Store.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await Store.createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
      preferences: {
        theme: 'dark',
        botName: 'NovaAI',
        category: 'general'
      }
    });

    const token = generateToken(user);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await Store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const { theme, botName, category } = req.body;
    const currentPrefs = req.user.preferences || {};

    const updatedPrefs = {
      theme: theme || currentPrefs.theme || 'dark',
      botName: botName || currentPrefs.botName || 'NovaAI',
      category: category || currentPrefs.category || 'general'
    };

    const updatedUser = await Store.updateUserPreferences(req.user._id, updatedPrefs);
    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedUser.preferences
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update preferences', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePreferences
};
