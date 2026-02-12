// src/config/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Disable verbose query logging in production — it adds overhead and
// can cause connection issues on serverless cold starts.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
  });

// Reuse the same instance across hot-reloads in development only
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
