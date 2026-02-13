// src/app.ts

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import Fastify, { FastifyError, FastifyInstance } from 'fastify';

import { registerSwagger } from './common/swagger/swagger';

import { env } from './config/env';
// import { Sentry } from './infrastructure/sentry';
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
      // Sentry.captureException(error);
      reply.status(500).send({ message: error.message });
    } else {
      // Sentry.captureException(new Error(String(error)));
      reply.status(500).send({ message: 'An unexpected error occurred' });
    }
  });
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    requestTimeout: 10_000 /* Prevent requests from hanging forever. */,
  });

  setupFastifyErrorHandler(app);

  // 1️⃣ Sentry request context (runs for every request)
  /* app.addHook('onRequest', request => {
    Sentry.setContext('request', {
      method: request.method,
      url: request.url,
      headers: request.headers,
    });
  });

  app.addHook('preHandler', request => {
    if (request.user) {
      Sentry.setUser({
        id: request.user.userId,
        role: request.user.role,
      });
    }
  }); */

  // 2️⃣ Global error handler (must be before routes)
  /* app.setErrorHandler((error: FastifyError, request, reply) => {
    if (isFastifyError(error)) {
      const statusCode = error.statusCode ?? 500;

      // 🚦 Rate limit errors (EXPECTED)

      if (statusCode === 429 || error.code === 'FST_RATE_LIMIT') {
        Sentry.withScope(scope => {
          scope.setTag('type', 'rate_limit');
          scope.setLevel('warning');
          scope.setExtra('ip', request.ip);
          scope.setExtra('url', request.url);
          scope.setExtra('method', request.method);
          scope.setExtra('userAgent', request.headers['user-agent']);

          Sentry.captureMessage('Rate limit exceeded');
        });

        return reply.status(429).send({
          statusCode: 429,
          error: 'Too Many Requests',
          message: 'Too many requests, please try again later.',
        });
      }

      // ❌ Real application errors

      Sentry.captureException(error);

      reply.status(statusCode).send({
        statusCode,
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  }); */

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
  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Register Swagger before routes so all schemas are picked up
  // 1️⃣ Register plugins (swagger, rate-limit, cors, helmet)
  await registerSwagger(app); // typically wraps @fastify/swagger + @fastify/swagger-ui [web:12][web:14][web:22]

  // Health/root
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
