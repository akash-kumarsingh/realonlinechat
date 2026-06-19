const express = require('express');
const router = express.Router();
const { submitReport, getStats } = require('../controllers/reportController');
const { httpRateLimiter } = require('../middleware/rateLimiter');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.post('/report', httpRateLimiter, submitReport);
router.get('/stats', getStats);

module.exports = router;
