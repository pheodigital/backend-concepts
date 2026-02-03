import { FastifyInstance } from 'fastify';
import { authenticate } from '../common/auth/auth.middleware';
import { requireRole } from '../common/middleware/role.middleware';
import { AdminController } from '../controllers/admin.controller';

export async function adminRoutes(app: FastifyInstance) {
  app.get(
    '/admin/users',
    { preHandler: [authenticate, requireRole('ADMIN')] },
    AdminController.listUsers,
  );
}
