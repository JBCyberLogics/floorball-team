const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDatabase } = require('./config/db');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const memberRoutes = require('./routes/memberRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// ✅ MIDDLEWARE MUST COME FIRST
app.use(cors());
app.use(express.json());

// ✅ THEN MOUNT ROUTES
app.use('/api/admin', adminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Add debug route
app.get('/api/debug', (req, res) => {
  res.json({ 
    message: 'Debug route working',
    routes: ['/api/admin', '/api/members', '/api/gallery', '/api/settings']
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🚀 Starting server with environment:', process.env.NODE_ENV || 'development');
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`🎉 Server running on port ${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
      console.log(`✅ Debug route: http://localhost:${PORT}/api/debug`);
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
