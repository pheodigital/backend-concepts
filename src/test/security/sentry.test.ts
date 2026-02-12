// src/test/security/sentry.test.ts

import * as Sentry from '@sentry/node';
import { FastifyInstance } from 'fastify';
import request from 'supertest';
import { createTestApp } from '../utils/test-app';

// ── Mock Sentry before the app loads it ─────────────────────────────────────
jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setContext: jest.fn(),
  setUser: jest.fn(),
  withScope: jest.fn(cb => cb({ setTag: jest.fn(), setLevel: jest.fn(), setExtra: jest.fn() })),
  init: jest.fn(),
}));

describe('Sentry integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('captures unhandled errors', async () => {
    await request(app.server)
      .get('/boom') // route that throws
      .expect(500);

    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
