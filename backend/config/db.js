const mongoose = require('mongoose');

async function connectDatabase() {
  // Try multiple environment variable names for flexibility
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI in .env');
  }

  // Validate connection string format
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MongoDB connection string. Must start with mongodb:// or mongodb+srv://');
  }

  console.log('Connecting to MongoDB...');
  console.log('Connection string:', mongoUri.substring(0, mongoUri.includes('@') ? mongoUri.indexOf('@') + 1 : 30) + '...');
  
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

module.exports = { connectDatabase };
