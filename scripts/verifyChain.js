#!/usr/bin/env node
require('dotenv').config();
const { verifyChain } = require('../src/services/logService');

(async () => {
  try {
    const result = await verifyChain();
    if (result.pass) {
      console.log('Chain verification: PASS');
      process.exit(0);
    }
    console.error('Chain verification: FAIL at id', result.firstBrokenId);
    process.exit(2);
  } catch (err) {
    console.error('Chain verification error:', err.message);
    process.exit(3);
  }
})();
