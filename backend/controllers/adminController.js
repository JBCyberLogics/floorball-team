const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

async function register(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ username, passwordHash });
    return res.status(201).json({ id: admin._id, username: admin.username });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Issue very short-lived token, scoped by tokenVersion
    const token = jwt.sign({ sub: admin._id, username: admin.username, tokenVersion: admin.tokenVersion }, process.env.JWT_SECRET, {
      expiresIn: '10m',
    });
    return res.json({ token, username: admin.username, expiresInSeconds: 600 });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
}

async function rotateAllTokens(_req, res) {
  // Increment tokenVersion for all admins to invalidate existing JWTs
  await Admin.updateMany({}, { $inc: { tokenVersion: 1 } });
  return res.json({ message: 'Rotated' });
}

// Start admin transfer: verify current admin password and stage transfer details
async function startTransfer(req, res) {
  try {
    const { currentUsername, currentPassword, newUsername, newPassword } = req.body;
    if (!currentUsername || !currentPassword || !newUsername || !newPassword) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const current = await Admin.findOne({ username: currentUsername });
    if (!current) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(currentPassword, current.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    // Store a one-time transfer token in-memory (non-persistent)
    const transferToken = jwt.sign({ currentId: current._id, newUsername, newPasswordHash: await bcrypt.hash(newPassword, 10) }, process.env.JWT_SECRET, { expiresIn: '10m' });
    return res.json({ transferToken });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to start transfer' });
  }
}

// Confirm transfer via token (would be emailed in production); here we accept token param
async function confirmTransfer(req, res) {
  try {
    const { token } = req.body; // could also be a query param in a clicked link
    if (!token) return res.status(400).json({ message: 'Missing token' });
    let payload;
    try { payload = jwt.verify(token, process.env.JWT_SECRET); } catch (_e) { return res.status(400).json({ message: 'Invalid token' }); }
    const { currentId, newUsername, newPasswordHash } = payload || {};
    if (!currentId || !newUsername || !newPasswordHash) return res.status(400).json({ message: 'Invalid payload' });
    // Create or upsert new admin user
    const existing = await Admin.findOne({ username: newUsername });
    if (existing) {
      existing.passwordHash = newPasswordHash;
      await existing.save();
    } else {
      await Admin.create({ username: newUsername, passwordHash: newPasswordHash });
    }
    // Invalidate all tokens
    await Admin.updateMany({}, { $inc: { tokenVersion: 1 } });
    return res.json({ message: 'Admin transfer complete' });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to confirm transfer' });
  }
}

module.exports = { register, login, rotateAllTokens, startTransfer, confirmTransfer };


