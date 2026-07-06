const express = require('express');
const request = require('supertest');

describe('logs routes', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('POST /logs missing fields returns 400', async () => {
    // Mock appendLog so route can be mounted without DB
    jest.doMock('../src/services/logService', () => ({ appendLog: jest.fn() }));
    const logsRouter = require('../src/routes/logs');
    const app = express();
    app.use(express.json());
    app.use('/logs', logsRouter);

    const res = await request(app).post('/logs').send({ actor: 'a' });
    expect(res.status).toBe(400);
  });

  test('POST /logs without API key returns 401', async () => {
    // Use real router but mock appendLog to prevent DB operations
    jest.doMock('../src/services/logService', () => ({ appendLog: jest.fn() }));
    process.env.API_KEY = 'testkey';
    const logsRouter = require('../src/routes/logs');
    const app = express();
    app.use(express.json());
    app.use('/logs', logsRouter);

    const res = await request(app).post('/logs').send({ actor: 'a', action: 'x', payload: {} });
    expect(res.status).toBe(401);
  });
});
