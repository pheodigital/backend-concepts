import Fastify from 'fastify';
import { errorHandler } from './common/errors/error-handler';

import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { taskRoutes } from './routes/task.routes';
import { adminRoutes } from './routes/admin.routes';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // 🌐 Centralized error handler
  app.setErrorHandler(errorHandler);

  // ❤️ Health check
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  // 🔐 Auth & public routes
  authRoutes(app);

  // 👤 User routes
  userRoutes(app);

  // ✅ Protected task routes
  taskRoutes(app);

  // 🛡️ Admin-only routes
  adminRoutes(app);

  return app;
}
