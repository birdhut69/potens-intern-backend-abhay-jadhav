const { logger } = require('./logger');

/**
 * Simple API key auth middleware. Expects `X-API-Key` header.
 * Returns 401 for missing/invalid keys and 500 if server misconfigured.
 */
function apiKeyAuth(req, res, next) {
  const configured = process.env.API_KEY;
  if (!configured) {
    // Misconfiguration should be explicit to operators, not a silent 401.
    logger.error('API_KEY not configured in environment');
    return res.status(500).json({ error: 'Server misconfiguration: API_KEY missing' });
  }

  const provided = req.header('x-api-key') || req.header('X-API-Key');
  if (!provided) {
    req.log && req.log.warn('Missing API key header');
    return res.status(401).json({ error: 'Missing API key' });
  }

  if (provided !== configured) {
    req.log && req.log.warn({ provided }, 'Invalid API key');
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Attach a simple principal for downstream handlers
  req.principal = { apiKey: 'provided' };
  next();
}

module.exports = apiKeyAuth;
