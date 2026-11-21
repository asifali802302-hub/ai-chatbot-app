const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('⚠️  No MONGODB_URI provided in environment. Running with local memory fallback.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Warning: ${error.message}. Switching to in-memory fallback.`);
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
