const Report = require('../models/Report');
const mongoose = require('mongoose');

const submitReport = async (req, res) => {
  try {
    const { reporterSocketId, reportedSocketId, reason, description, sessionId } = req.body;

    if (!reporterSocketId || !reportedSocketId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Only save if DB is connected
    if (mongoose.connection.readyState === 1) {
      const report = new Report({
        reporterSocketId,
        reportedSocketId,
        reason: reason || 'other',
        description: description?.substring(0, 500),
        sessionId,
      });
      await report.save();
    }

    res.json({ success: true, message: 'Report submitted successfully' });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = {
      totalReports: mongoose.connection.readyState === 1 ? await Report.countDocuments() : 0,
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = { submitReport, getStats };
