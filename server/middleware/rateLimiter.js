const rateLimit = require('express-rate-limit');

// Per-socket message rate limiting (in-memory)
const socketMessageCounts = new Map();
const MESSAGE_LIMIT = 30; // messages per window
const WINDOW_MS = 10000; // 10 seconds

const checkMessageRate = (socketId) => {
  const now = Date.now();
  const record = socketMessageCounts.get(socketId);

  if (!record || now - record.windowStart > WINDOW_MS) {
    socketMessageCounts.set(socketId, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= MESSAGE_LIMIT) return false;

  record.count++;
  return true;
};

const cleanupSocketRate = (socketId) => {
  socketMessageCounts.delete(socketId);
};

// HTTP rate limiter
const httpRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

module.exports = { checkMessageRate, cleanupSocketRate, httpRateLimiter };
