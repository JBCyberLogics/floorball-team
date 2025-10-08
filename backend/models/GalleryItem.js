const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'video'], required: true },
    fileUrl: { type: String, required: true },
    originalName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryItem', galleryItemSchema);


