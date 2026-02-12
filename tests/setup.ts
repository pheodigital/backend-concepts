// import '@jest/globals';
/*
// Mock Prisma globally for unit tests
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      task: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    })),
  };
});
*/

// tests/setup.ts
// Runs once before every test suite via setupFilesAfterEnv in jest.config.ts

import * as dotenv from 'dotenv';
import * as path from 'path';

// ── 1. Load test environment variables ──────────────────────────────────────
// Must happen before any src/ module is imported so env vars are present
// when Prisma, Sentry, JWT configs etc. initialise.
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

// ── 3. Mock Sentry globally ──────────────────────────────────────────────────
// Prevents Sentry.init() from making outbound network calls on app startup.
jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setContext: jest.fn(),
  setUser: jest.fn(),
  withScope: jest.fn((cb: (scope: unknown) => void) =>
    cb({ setTag: jest.fn(), setLevel: jest.fn(), setExtra: jest.fn() })
  ),
}));

// Prevent Jest from trying to load the native Sentry CPU profiler
jest.mock('@sentry-internal/node-cpu-profiler', () => ({
  startProfiling: jest.fn(),
  stopProfiling: jest.fn(),
}));
