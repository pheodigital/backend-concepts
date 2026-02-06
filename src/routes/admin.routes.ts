import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/admin.controller';
import { requireRole } from '../common/middleware/role.middleware';
import { requireAuth } from '../common/middleware/auth.middleware';

export async function adminRoutes(app: FastifyInstance) {
  // ✅ Admin-only: list all users
  app.get(
    '/admin/users',
    { preHandler: [requireAuth, requireRole('ADMIN')] },
    AdminController.listUsers,
  );
}
