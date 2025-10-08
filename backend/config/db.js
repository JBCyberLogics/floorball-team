const mongoose = require('mongoose');

async function connectDatabase() {
  // Try multiple environment variable names for flexibility
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI in .env');
  }

  // Debug the actual connection string (masked for security)
  console.log('🔧 Debugging MongoDB connection string:');
  console.log('- Length:', mongoUri.length);
  console.log('- First 50 chars:', mongoUri.substring(0, 50));
  console.log('- Starts with mongodb://:', mongoUri.startsWith('mongodb://'));
  console.log('- Starts with mongodb+srv://:', mongoUri.startsWith('mongodb+srv://'));
  
  // Check for common issues
  if (mongoUri.includes(' ')) {
    console.log('⚠️  Warning: Connection string contains spaces');
  }
  if (mongoUri.includes('\n') || mongoUri.includes('\r')) {
    console.log('⚠️  Warning: Connection string contains newlines');
  }

  // Validate connection string format
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    console.log('❌ Invalid MongoDB connection string format');
    console.log('💡 Your connection string should look like:');
    console.log('   mongodb+srv://username:password@cluster.mongodb.net/database');
    console.log('   OR');
    console.log('   mongodb://localhost:27017/yourdatabase');
    throw new Error('Invalid MongoDB connection string. Must start with mongodb:// or mongodb+srv://');
  }

  console.log('🔌 Connecting to MongoDB...');
  
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    
    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔁 MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Check if your MongoDB Atlas cluster is running');
    console.log('   2. Verify your username/password are correct');
    console.log('   3. Check your IP whitelist in MongoDB Atlas');
    console.log('   4. Ensure the database name is correct');
    throw error;
  }
}

module.exports = { connectDatabase };  
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    
    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔁 MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Check if your MongoDB Atlas cluster is running');
    console.log('   2. Verify your username/password are correct');
    console.log('   3. Check your IP whitelist in MongoDB Atlas');
    console.log('   4. Ensure the database name is correct');
    throw error;
  }
}

module.exports = { connectDatabase };
