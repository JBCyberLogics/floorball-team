const Settings = require('../models/Settings');
const fs = require('fs');
const path = require('path');

async function getSettings(_req, res) {
  const doc = await Settings.findOne();
  return res.json(doc || {});
}

async function updateSettings(req, res) {
  const payload = req.body;
  const doc = await Settings.findOneAndUpdate({}, payload, { new: true, upsert: true });
  return res.json(doc);
}

module.exports = { getSettings, updateSettings };

async function setHeroImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const heroImageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const doc = await Settings.findOneAndUpdate({}, { heroImageUrl }, { new: true, upsert: true });
    return res.json(doc);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to set hero image' });
  }
}

async function deleteHeroImage(req, res) {
  try {
    const current = await Settings.findOne();
    const currentUrl = current && current.heroImageUrl;
    if (currentUrl && currentUrl.includes('/uploads/')) {
      const filename = currentUrl.split('/uploads/')[1];
      if (filename) {
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        fs.promises.unlink(filePath).catch(() => {});
      }
    }
    const doc = await Settings.findOneAndUpdate({}, { heroImageUrl: undefined }, { new: true, upsert: true });
    return res.json(doc);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to delete hero image' });
  }
}

module.exports.setHeroImage = setHeroImage;
module.exports.deleteHeroImage = deleteHeroImage;



