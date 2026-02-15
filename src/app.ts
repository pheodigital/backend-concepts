// src/app.ts

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import Fastify, { FastifyError, FastifyInstance } from 'fastify';

import { registerSwagger } from './common/swagger/swagger';

import { env } from './config/env';

import { adminRoutesV1 } from './routes/v1/admin.routes';
import { authRoutesV1 } from './routes/v1/auth.routes';
import { taskRoutesV1 } from './routes/v1/task.routes';
import { userRoutesV1 } from './routes/v1/user.routes';

function isFastifyError(error: unknown): error is FastifyError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function setupFastifyErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (isFastifyError(error)) {
      reply.status(500).send({ message: error.message });
    } else {
      reply.status(500).send({ message: 'An unexpected error occurred' });
    }
  });
}

export async function buildApp(opts?: { enableRateLimit?: boolean }): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    requestTimeout: 10_000 /* Prevent requests from hanging forever. */,
  });

  setupFastifyErrorHandler(app);

  // 🔐 Security headers (XSS, clickjacking, etc.)
  app.register(helmet);

  // 🌍 CORS protection
  app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) cb(null, true);
      else if (origin === env.FRONTEND_URL) cb(null, true);
      else cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  // 🔐 Global rate limiting
  if (opts?.enableRateLimit !== false) {
    app.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });
  }

  // Register Swagger before routes so all schemas are picked up
  // 1️⃣ Register plugins (swagger, rate-limit, cors, helmet)
  await registerSwagger(app); // typically wraps @fastify/swagger + @fastify/swagger-ui [web:12][web:14][web:22]

  // Health/root

  app.get('/health', async (req, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  app.get('/', async () => ({
    message: 'Welcome to the API. Visit /docs for Swagger UI.',
  }));

  // API routes
  await authRoutesV1(app);
  await userRoutesV1(app);
  await taskRoutesV1(app);
  await adminRoutesV1(app);

  return app;
}
