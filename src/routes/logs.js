const express = require('express');
const router = express.Router();
const { appendLog, getLogById, verifyEntry, verifyChain, exportLogs } = require('../services/logService');
const { createWriteLimiter } = require('../middleware/rateLimiter');
const apiKeyAuth = require('../middleware/auth');

// POST /log - append a new entry (protected)
router.post('/', createWriteLimiter(), apiKeyAuth, async (req, res) => {
  try {
    const { actor, action, payload } = req.body;
    if (!actor || !action || payload === undefined) {
      return res.status(400).json({ error: 'Missing required fields: actor, action, payload' });
    }

    const inserted = await appendLog({ actor, action, payload });
    return res.status(201).json({ id: inserted.id, reference: inserted.chain_hash });
  } catch (err) {
    req.log && req.log.error({ err: err.message }, 'appendLog failed');
    // Distinguish cryptographic errors from generic server errors
    return res.status(500).json({ error: 'Append failed', details: err.message });
  }
});

// GET /log/:id - return entry plus immediate verification boolean
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const row = await getLogById(id);
    if (!row) return res.status(404).json({ error: 'not_found' });

    const verification = await verifyEntry(id);
    return res.json({ entry: row, verification });
  } catch (err) {
    req.log && req.log.error({ err: err.message }, 'GET /log/:id failed');
    return res.status(500).json({ error: 'Failed to retrieve entry' });
  }
});

// GET /verify - scan full chain
router.get('/', async (req, res) => {
  // This endpoint uses query ?action=verify to disambiguate from POST /
  if (req.query.action === 'verify') {
    try {
      const result = await verifyChain();
      return res.json(result);
    } catch (err) {
      req.log && req.log.error({ err: err.message }, 'chain verify failed');
      return res.status(500).json({ error: 'Chain verification failed', details: err.message });
    }
  }

  // Otherwise treat as export route: GET /logs?actor=...&start=...&end=...
  try {
    const { actor, start, end } = req.query;
    const rows = await exportLogs({ actor, start, end });
    return res.json({ count: rows.length, rows });
  } catch (err) {
    req.log && req.log.error({ err: err.message }, 'export failed');
    return res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
