const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    photoUrl: { type: String },
    team: { type: String, enum: ['men', 'women'], default: 'men' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema);


