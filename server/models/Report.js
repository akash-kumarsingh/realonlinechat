const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterSocketId: { type: String, required: true },
  reportedSocketId: { type: String, required: true },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate', 'other'],
    default: 'other'
  },
  description: { type: String, maxlength: 500 },
  sessionId: { type: String },
  ipHash: { type: String },
  createdAt: { type: Date, default: Date.now, expires: '30d' }
});

module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema);
