import { FastifyInstance } from 'fastify';
import { authenticate } from '../common/auth/auth.middleware';
import { UserController } from '../controllers/user.controller';

export async function userRoutes(app: FastifyInstance) {
  app.get('/users', { preHandler: [authenticate] }, UserController.getAllUsers);
  app.get(
    '/users/:id',
    { preHandler: [authenticate] },
    UserController.getUserById,
  );
}
