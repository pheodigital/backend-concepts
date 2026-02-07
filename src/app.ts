// src/app.ts
import Fastify, { FastifyInstance } from 'fastify';
import { registerSwagger } from './common/swagger/swagger';

import { authRoutesV1 } from './routes/v1/auth.routes';
import { userRoutesV1 } from './routes/v1/user.routes';
import { taskRoutesV1 } from './routes/v1/task.routes';
import { adminRoutesV1 } from './routes/v1/admin.routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  // Register Swagger before routes so all schemas are picked up
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
