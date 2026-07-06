describe('verifyChain behavior', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('verifyChain passes on empty chain', async () => {
    // Mock db to return empty rows
    jest.doMock('../src/db', () => {
      return function () {
        return {
          orderBy: () => Promise.resolve([]),
        };
      };
    });

    const { verifyChain } = require('../src/services/logService');
    const result = await verifyChain();
    expect(result.pass).toBe(true);
  });

  test('verifyChain detects first broken entry', async () => {
    // Prepare two rows: first valid, second tampered (chain_hash mismatch)
    const rows = [
      {
        id: 1,
        timestamp: '2026-07-06T00:00:00.000Z',
        actor: 'a',
        action: 'act',
        payload: { v: 1 },
        prev_hash: '0'.repeat(64),
        chain_hash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
      {
        id: 2,
        timestamp: '2026-07-06T00:00:01.000Z',
        actor: 'b',
        action: 'act2',
        payload: { v: 2 },
        prev_hash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        chain_hash: 'tampered',
      },
    ];

    jest.doMock('../src/db', () => {
      return function () {
        return {
          orderBy: () => Promise.resolve(rows),
        };
      };
    });

    const { verifyChain } = require('../src/services/logService');
    const result = await verifyChain();
    expect(result.pass).toBe(false);
    expect(result.firstBrokenId).toBe(1);
  });
});
