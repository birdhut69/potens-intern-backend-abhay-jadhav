#!/usr/bin/env node
/*
Simple benchmark: append N entries then measure verify time.
Usage: node scripts/benchmark.js --count=1000 --concurrency=10
*/
const { appendLog, verifyChain } = require('../src/services/logService');
const db = require('../src/db');

function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.replace('--', '').split('=');
      args[k] = v || true;
    }
  }
  return args;
}

async function run() {
  const args = parseArgs();
  const count = parseInt(args.count || '1000', 10);
  const concurrency = parseInt(args.concurrency || '10', 10);

  console.log(`Running benchmark: count=${count} concurrency=${concurrency}`);

  const start = process.hrtime.bigint();

  let inFlight = 0;
  let written = 0;

  async function worker(i) {
    const actor = `bench-${Math.floor(Math.random() * 1000)}`;
    const action = 'bench-write';
    const payload = { seq: i, ts: new Date().toISOString() };
    await appendLog({ actor, action, payload });
  }

  const tasks = [];
  for (let i = 0; i < count; i++) {
    const p = (async (idx) => {
      while (inFlight >= concurrency) {
        await new Promise((r) => setTimeout(r, 5));
      }
      inFlight++;
      try {
        await worker(idx);
        written++;
      } finally {
        inFlight--;
      }
    })(i);
    tasks.push(p);
  }

  await Promise.all(tasks);

  const end = process.hrtime.bigint();
  const seconds = Number(end - start) / 1e9;
  console.log(`Wrote ${written} entries in ${seconds.toFixed(2)}s (${(written / seconds).toFixed(1)} inserts/sec)`);

  // run full verification
  const vStart = process.hrtime.bigint();
  const result = await verifyChain();
  const vEnd = process.hrtime.bigint();
  const vSeconds = Number(vEnd - vStart) / 1e9;
  console.log(`Full chain verification: ${vSeconds.toFixed(3)}s`);
  console.log('verify result:', result);

  // destroy DB pool
  await db.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
