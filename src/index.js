require('dotenv').config();
const express = require('express');
const { httpLogger } = require('./middleware/logger');
const apiKeyAuth = require('./middleware/auth');
const { createWriteLimiter } = require('./middleware/rateLimiter');

const app = express();

// Structured request logging middleware (attaches req.log)
app.use(httpLogger);
app.use(express.json());

// Health
app.get('/health', (req, res) => {
  req.log.info({ route: '/health' }, 'health check');
  res.json({ status: 'ok' });
});

// Placeholder for POST /log that applies auth + rate limit for Stage 4.
// Implementation of the actual append logic will be in Stage 5.
app.post('/log', createWriteLimiter(), apiKeyAuth, (req, res) => {
  req.log.info({ route: '/log' }, 'received log request (placeholder)');
  res.status(501).json({ error: 'Not implemented yet' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // Use structured logging attached to the process logger via httpLogger's logger
  // (pino instance is already configured in middleware/logger.js).
  console.log(`Server listening on port ${port}`);
});
