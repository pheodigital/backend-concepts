import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../common/middleware/auth.middleware';
import { requireRole } from '../common/middleware/role.middleware'; // optional admin check
import { validate } from '../common/middleware/validator.middleware';
import { getUserParamsSchema } from '../validators/user.validator';

export async function userRoutes(app: FastifyInstance) {
  // ✅ Get all users - Admin only
  app.get(
    '/users',
    { preHandler: [requireAuth, requireRole('ADMIN')] },
    UserController.getAllUsers,
  );

  // ✅ Get user by ID
  app.get(
    '/users/:id',
    { preHandler: [requireAuth, validate(getUserParamsSchema, 'params')] },
    UserController.getUserById,
  );
}
