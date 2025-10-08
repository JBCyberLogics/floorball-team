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

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/admin', adminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🚀 Starting server...');
    
    await connectDatabase();
    
    // Ensure admin credentials
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
    
    await Admin.updateMany({}, { $inc: { tokenVersion: 1 } });
    console.log('✅ Existing sessions invalidated');
    console.log('👤 Admin username: floorball');

    app.listen(PORT, () => {
      console.log(`🎉 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
