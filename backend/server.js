const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDatabase } = require('./config/db');
const Admin = require('./models/Admin');

const adminRoutes = require('./routes/adminRoutes');
const memberRoutes = require('./routes/memberRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('🚨 Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message 
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;

// Enhanced environment debugging
console.log('🔍 Environment check:');
console.log('   - NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   - PORT:', PORT);
console.log('   - MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('   - MONGODB_URI exists:', !!process.env.MONGODB_URI);

// Check for common .env issues
if (process.env.MONGO_URI) {
  const mongoUri = process.env.MONGO_URI;
  console.log('   - MONGO_URI length:', mongoUri.length);
  
  // Check for quotes or extra spaces
  if (mongoUri.trim() !== mongoUri) {
    console.log('   ⚠️  MONGO_URI has leading/trailing spaces');
  }
  if (mongoUri.startsWith('"') || mongoUri.startsWith("'")) {
    console.log('   ⚠️  MONGO_URI appears to be wrapped in quotes');
  }
}

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting server...');
    
    // Connect to database
    await connectDatabase();
    
    // Ensure admin credentials exist
    try {
      const bcrypt = require('bcrypt');
      const TARGET_USERNAME = 'floorball';
      const TARGET_PASSWORD = 'Floorball$##1';
      const passwordHash = await bcrypt.hash(TARGET_PASSWORD, 10);
      
      const existing = await Admin.findOne({ username: TARGET_USERNAME });
      if (existing) {
        existing.passwordHash = passwordHash;
        await existing.save();
        console.log('✅ Admin credentials updated');
      } else {
        await Admin.create({ username: TARGET_USERNAME, passwordHash });
        console.log('✅ Admin credentials created');
      }
      
      // Invalidate tokens by bumping tokenVersion for all admins
      await Admin.updateMany({}, { $inc: { tokenVersion: 1 } });
      console.log('✅ Existing sessions invalidated');
      console.log('👤 Admin username: floorball');
      
    } catch (e) {
      console.error('❌ Failed to ensure admin credentials', e);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🎉 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log('='.repeat(50));
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    console.log('🔧 Check your .env file and MongoDB connection string');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Server termination signal received...');
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  }
  process.exit(0);
});

// Start the application
startServer();
