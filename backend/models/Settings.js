const mongoose = require('mongoose');

const newsItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    heroImageUrl: { type: String },
    nextMatch: {
      opponent: { type: String },
      venue: { type: String },
      time: { type: String },
      date: { type: String },
    },
    upcomingEvent: {
      title: { type: String },
      date: { type: String }, // YYYY-MM-DD
      time: { type: String }, // HH:MM
      description: { type: String },
      // UTC timestamp in milliseconds for precise countdowns
      timestamp: { type: Number },
    },
    teamsStory: { type: String },
    news: { type: [newsItemSchema], default: [] },
    social: {
      instagram: { type: String },
      facebook: { type: String },
      tiktok: { type: String },
      whatsapp: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);



