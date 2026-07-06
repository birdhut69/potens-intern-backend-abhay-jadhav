const crypto = require('crypto');
const stableStringify = require('fast-json-stable-stringify');
const logger = require('pino')();

// Genesis prev_hash: 64 zeros
const GENESIS_PREV = '0'.repeat(64);

/**
 * Build a deterministic string for hashing.
 * We include: timestamp (ISO), actor, action, stable-stringified payload, prev_hash.
 * Ordering and stable stringify are essential to guarantee repeatable hashes.
 * We avoid including DB-assigned `id` because it should not influence chain integrity.
 */
function buildHashString({ timestamp, actor, action, payload }, prevHash) {
  // Ensure timestamp is an ISO string for determinism
  const ts = timestamp ? new Date(timestamp).toISOString() : '';
  const payloadStr = payload ? stableStringify(payload) : '';

  // Use a clear delimiter to avoid accidental collisions between fields.
  return [`timestamp:${ts}`, `actor:${actor || ''}`, `action:${action || ''}`, `payload:${payloadStr}`, `prev_hash:${prevHash || ''}`].join('|');
}

/**
 * Compute SHA-256 hex digest for the provided row data and previous chain hash.
 * Returns a 64-character lowercase hex string.
 */
function computeChainHash(row, prevChainHash = GENESIS_PREV) {
  try {
    const toHash = buildHashString(row, prevChainHash);
    const hash = crypto.createHash('sha256').update(toHash, 'utf8').digest('hex');
    // Defensive check: ensure expected length
    if (hash.length !== 64) {
      logger.error({ hashLength: hash.length }, 'Unexpected sha256 length');
      throw new Error('Invalid hash length computed');
    }
    return hash;
  } catch (err) {
    // Surface cryptographic errors clearly for error isolation
    logger.error({ err: err.message }, 'computeChainHash failed');
    throw new Error(`computeChainHash failed: ${err.message}`);
  }
}

module.exports = {
  GENESIS_PREV,
  buildHashString,
  computeChainHash,
};
