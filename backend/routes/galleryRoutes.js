const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadItem, listItems, deleteItem } = require('../controllers/galleryController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

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

router.get('/', listItems);
router.post('/', requireAuth, upload.single('media'), uploadItem);
router.delete('/:id', requireAuth, deleteItem);

module.exports = router;


