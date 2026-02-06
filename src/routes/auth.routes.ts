import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../common/middleware/auth.middleware';
import { validate } from '../common/middleware/validator.middleware';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from '../validators/auth.validator';

export async function authRoutes(app: FastifyInstance) {
  // ✅ Register new user
  app.post(
    '/register',
    { preHandler: [validate(registerSchema, 'body')] },
    AuthController.register,
  );

  // ✅ Login
  app.post(
    '/login',
    { preHandler: [validate(loginSchema, 'body')] },
    AuthController.login,
  );

  // ✅ Get current user (/me)
  app.get('/me', { preHandler: [requireAuth] }, async (req, reply) => {
    return {
      userId: req.user!.userId,
      role: req.user!.role,
    };
  });

  // ✅ Refresh access token
  app.post(
    '/refresh',
    { preHandler: [validate(refreshSchema, 'body')] },
    AuthController.refresh,
  );

  // ✅ Logout / revoke refresh token
  app.post(
    '/logout',
    { preHandler: [validate(refreshSchema, 'body')] },
    AuthController.logout,
  );
}
