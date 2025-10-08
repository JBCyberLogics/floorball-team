const express = require('express');
const { getSettings, updateSettings, setHeroImage, deleteHeroImage } = require('../controllers/settingsController');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

router.get('/', getSettings);
router.put('/', requireAuth, updateSettings);

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});
const upload = multer({ storage });

router.post('/hero', requireAuth, upload.single('hero'), setHeroImage);
router.delete('/hero', requireAuth, deleteHeroImage);

module.exports = router;



