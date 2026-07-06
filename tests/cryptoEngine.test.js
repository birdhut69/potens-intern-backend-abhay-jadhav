const { computeChainHash, GENESIS_PREV } = require('../src/cryptoEngine');

test('computeChainHash is deterministic across object key order', () => {
  const a = { x: 1, y: 2 };
  const b = { y: 2, x: 1 };
  const rowA = { timestamp: '2026-07-06T00:00:00.000Z', actor: 'alice', action: 'create', payload: a };
  const rowB = { timestamp: '2026-07-06T00:00:00.000Z', actor: 'alice', action: 'create', payload: b };

  const h1 = computeChainHash(rowA, GENESIS_PREV);
  const h2 = computeChainHash(rowB, GENESIS_PREV);
  expect(h1).toBe(h2);
  expect(h1).toMatch(/^[0-9a-f]{64}$/);
});
