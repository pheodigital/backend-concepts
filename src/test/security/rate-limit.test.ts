// src/test/security/rate-limit.test.ts

import { FastifyInstance } from 'fastify';
import request from 'supertest';
import { createTestApp } from '../utils/test-app';

// ── Mock Prisma so login never touches a real DB ─────────────────────────────
// Path must match the import inside auth.service.ts: '../../config/prisma'
jest.mock('../../config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

// Import AFTER jest.mock so we get the mocked version
import { describe, expect, it, jest } from '@jest/globals';
import { prisma } from '../../config/prisma';

// ── Describe ─────────────────────────────────────────────────────────────────

describe.skip('Rate limiting', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Return null → user not found → AuthService throws 401 immediately.
    // This skips argon2.verify (CPU-heavy) so each request resolves in <1ms.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);
  });

  it.skip('blocks login after max attempts', async () => {
    // ── 5 allowed attempts, each returns 500 ────────────────────────────────
    for (let i = 0; i < 5; i++) {
      await request(app.server)
        .post('/login')
        .send({ email: 'a@test.com', password: 'wrong' })
        .expect(401);
    }

    // ── 6th attempt must be blocked by the rate limiter ─────────────────────
    const res = await request(app.server)
      .post('/login')
      .send({ email: 'a@test.com', password: 'wrong' })
      .expect(429); //429 Too Many Requests

    // expect(res.body.message).toMatch(/too many/i);
    expect(res.headers['x-ratelimit-limit']).toBeDefined();
  });
});
