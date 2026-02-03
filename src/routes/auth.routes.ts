import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../common/auth/auth.middleware';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', AuthController.register);
  app.post('/login', AuthController.login);
  app.get('/me', { preHandler: [authenticate] }, async (req, reply) => {
    return { userId: req?.user?.userId, role: req?.user?.role };
  });
  app.post('/refresh', AuthController.refresh); // <--- refresh token
  app.post('/logout', AuthController.logout); // <--- revoke refresh token
}
