const rateLimit = require('express-rate-limit');

// Conservative default: 60 requests per minute per IP for write endpoints.
// This limiter can be applied selectively to routes (e.g., POST /log).
const createWriteLimiter = () =>
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });

module.exports = { createWriteLimiter };
