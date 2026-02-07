// src/app.ts
import Fastify from 'fastify';
import { registerSwagger } from './common/swagger/swagger';

import { authRoutesV1 } from './routes/v1/auth.routes';
import { userRoutesV1 } from './routes/v1/user.routes';
import { taskRoutesV1 } from './routes/v1/task.routes';
import { adminRoutesV1 } from './routes/v1/admin.routes';

export function buildApp() {
  const app = Fastify({ logger: true });

  return app;
}

export async function startApp() {
  const app = buildApp();

  // Register Swagger
  await registerSwagger(app);

  // Add root route
  app.get('/', async () => ({
    message: 'Welcome to the API. Visit /docs for Swagger UI.',
  }));

  // Register all routes
  await authRoutesV1(app);
  await userRoutesV1(app);
  await taskRoutesV1(app);
  await adminRoutesV1(app);

  // Start server
  await app.listen({ port: 3000 });
  console.log('Swagger docs: http://localhost:3000/docs');

  return app;
}

// If you want direct start
if (require.main === module) {
  startApp().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
