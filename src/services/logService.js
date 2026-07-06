const db = require('../db');
const { computeChainHash, GENESIS_PREV } = require('../cryptoEngine');
const { logger } = require('../middleware/logger');

/**
 * Append a new log entry atomically. Uses an explicit table lock
 * to avoid race conditions when reading the previous chain hash.
 *
 * We set the timestamp on the application side so that the value used to
 * compute the chain hash is the same as the value persisted in the DB.
 */
async function appendLog({ actor, action, payload }) {
  return await db.transaction(async (trx) => {
    // Strict table-level lock to serialize concurrent appends.
    await trx.raw('LOCK TABLE logs IN EXCLUSIVE MODE');

    // Read latest entry to obtain prev_hash
    const last = await trx('logs').orderBy('id', 'desc').first();
    const prevHash = last ? last.chain_hash : GENESIS_PREV;

    const timestamp = new Date().toISOString();
    const rowForHash = { timestamp, actor, action, payload };
    const chainHash = computeChainHash(rowForHash, prevHash);

    const [inserted] = await trx('logs')
      .insert({ actor, action, payload, prev_hash: prevHash, chain_hash: chainHash, timestamp })
      .returning(['id', 'timestamp', 'actor', 'action', 'payload', 'prev_hash', 'chain_hash']);

    logger.info({ id: inserted.id }, 'appended log entry');
    return inserted;
  });
}

async function getLogById(id) {
  return await db('logs').where({ id }).first();
}

/**
 * Verify a single entry's immediate validity: recompute its hash using the
 * previous entry (or GENESIS_PREV) and compare to stored chain_hash.
 */
async function verifyEntry(id) {
  const row = await getLogById(id);
  if (!row) return { exists: false, valid: false, reason: 'not_found' };

  const prev = await db('logs').where('id', '<', id).orderBy('id', 'desc').first();
  const prevHash = prev ? prev.chain_hash : GENESIS_PREV;

  // Recompute
  const recomputed = computeChainHash({ timestamp: row.timestamp, actor: row.actor, action: row.action, payload: row.payload }, prevHash);

  const valid = recomputed === row.chain_hash;
  const reason = valid ? 'ok' : 'hash_mismatch';
  return { exists: true, valid, reason, id, stored: row.chain_hash, recomputed };
}

/**
 * Scan the full chain in order and report first broken entry if any.
 */
async function verifyChain() {
  const rows = await db('logs').orderBy('id', 'asc');
  let expectedPrev = GENESIS_PREV;

  for (const row of rows) {
    const recomputed = computeChainHash({ timestamp: row.timestamp, actor: row.actor, action: row.action, payload: row.payload }, expectedPrev);
    if (recomputed !== row.chain_hash) {
      logger.warn({ id: row.id }, 'chain verification failed at entry');
      return { pass: false, firstBrokenId: row.id };
    }
    expectedPrev = row.chain_hash;
  }

  return { pass: true };
}

async function exportLogs({ actor, start, end }) {
  const q = db('logs').select('id', 'timestamp', 'actor', 'action', 'payload', 'prev_hash', 'chain_hash').orderBy('id', 'asc');
  if (actor) q.where('actor', actor);
  if (start) q.where('timestamp', '>=', new Date(start).toISOString());
  if (end) q.where('timestamp', '<=', new Date(end).toISOString());
  return await q;
}

module.exports = {
  appendLog,
  getLogById,
  verifyEntry,
  verifyChain,
  exportLogs,
};
