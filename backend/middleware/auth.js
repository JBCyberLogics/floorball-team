const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

async function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Enforce tokenVersion and short-lived tokens
    const admin = await Admin.findById(payload.sub).select('tokenVersion username');
    if (!admin) return res.status(401).json({ message: 'Unauthorized' });
    if (typeof payload.tokenVersion !== 'number' || payload.tokenVersion !== admin.tokenVersion) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = { id: admin._id.toString(), username: admin.username };
    return next();
  } catch (_e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { requireAuth };


