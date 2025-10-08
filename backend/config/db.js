const mongoose = require('mongoose');

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  console.log('🔧 Connecting to MongoDB...');
  
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

module.exports = { connectDatabase };
