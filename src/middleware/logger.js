const pino = require('pino');
const pinoHttp = require('pino-http');

// Central pino logger instance used across the app. Keep config minimal here;
// production tuning (sampling, redact) belongs in deployment configs.
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// pino-http middleware attaches `req.log` and `res.log` for structured request logs.
const httpLogger = pinoHttp({ logger });

module.exports = {
  logger,
  httpLogger,
};
