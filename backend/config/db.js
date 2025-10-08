const mongoose = require('mongoose');

async function connectDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error('Missing MongoDB connection string. Set MONGO_URI in .env');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
}

module.exports = { connectDatabase };


