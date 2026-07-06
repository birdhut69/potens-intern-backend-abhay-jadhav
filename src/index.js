const express = require('express');
const pino = require('pino');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  logger.info({ route: '/health' }, 'health check');
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info({ port }, 'server listening');
});
