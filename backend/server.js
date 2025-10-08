const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDatabase } = require('./config/db');

const adminRoutes = require('./routes/adminRoutes');
const memberRoutes = require('./routes/memberRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
app.use('/api/admin', adminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🚀 Starting server with environment:', process.env.NODE_ENV || 'development');
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`🎉 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
