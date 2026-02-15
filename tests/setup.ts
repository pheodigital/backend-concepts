// tests/setup.ts
// Runs once before every test suite via setupFilesAfterEnv in jest.config.ts

import * as dotenv from 'dotenv';
import * as path from 'path';

// ── 1. Load test environment variables ──────────────────────────────────────
// Must happen before any src/ module is imported so env vars are present
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// ── 2. Mock Prisma globally ──────────────────────────────────────────────────
// Prevents any test from accidentally hitting a real database.
// Individual tests can override these with .mockResolvedValue() as needed.
jest.mock('../src/config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
