const Store = require('../models/store');

const getAnalytics = async (req, res) => {
  try {
    const stats = await Store.getAnalytics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve analytics', error: error.message });
  }
};

module.exports = {
  getAnalytics
};
