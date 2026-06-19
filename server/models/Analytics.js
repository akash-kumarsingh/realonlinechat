const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  event: {
    type: String,
    enum: ['chat_started', 'chat_ended', 'user_connected', 'user_disconnected', 'next_stranger'],
    required: true
  },
  sessionDuration: { type: Number }, // in seconds
  messageCount: { type: Number },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

analyticsSchema.index({ date: 1 });
analyticsSchema.index({ event: 1 });

module.exports = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
