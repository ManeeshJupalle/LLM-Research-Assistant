const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  title: String,
  authors: String,
  uploadDate: { type: Date, default: Date.now },
  filename: String,
  filepath: String,
  textContent: String,
  summary: String,
  userId: String, // For future auth implementation
});

module.exports = mongoose.model('Paper', paperSchema);