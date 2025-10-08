const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    // Used to invalidate existing JWTs when incremented
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);


