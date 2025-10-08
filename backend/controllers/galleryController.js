const GalleryItem = require('../models/GalleryItem');

async function uploadItem(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const isVideo = req.file.mimetype.startsWith('video/');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const item = await GalleryItem.create({
      type: isVideo ? 'video' : 'image',
      fileUrl: `${baseUrl}/uploads/${req.file.filename}`,
      originalName: req.file.originalname,
    });
    return res.status(201).json(item);
  } catch (err) {
    return res.status(500).json({ message: 'Upload failed' });
  }
}

async function listItems(_req, res) {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch items' });
  }
}

async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const item = await GalleryItem.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.json({ message: 'Item deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete item' });
  }
}

module.exports = { uploadItem, listItems, deleteItem };


