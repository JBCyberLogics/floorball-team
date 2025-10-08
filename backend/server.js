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

const PORT = process.env.PORT || 5000;

connectDatabase(process.env.MONGO_URI)
  .then(() => {
    // Ensure specified admin credentials exist and invalidate old sessions
    (async () => {
      try {
        const bcrypt = require('bcrypt');
        const TARGET_USERNAME = 'floorball';
        const TARGET_PASSWORD = 'Floorball$##1';
        const passwordHash = await bcrypt.hash(TARGET_PASSWORD, 10);
        const existing = await Admin.findOne({ username: TARGET_USERNAME });
        if (existing) {
          existing.passwordHash = passwordHash;
          await existing.save();
        } else {
          await Admin.create({ username: TARGET_USERNAME, passwordHash });
        }
        // Invalidate tokens by bumping tokenVersion for all admins
        await Admin.updateMany({}, { $inc: { tokenVersion: 1 } });
        console.log('Admin credentials ensured (username: floorball). Existing sessions invalidated.');
      } catch (e) {
        console.error('Failed to ensure admin credentials', e);
      }
    })();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database', err);
    process.exit(1);
  });


