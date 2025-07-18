const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' },
  question: String,
  answer: String,
  userId: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chat', chatSchema);