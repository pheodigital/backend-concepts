import { FastifyInstance } from 'fastify';
import { AdminController } from '../../controllers/v1/admin.controller';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/role.middleware';
import { CommonErrorResponses } from '../../common/swagger/error.swager';
import { AdminUsersArraySchema } from '../../common/swagger/admin.schema';

export async function adminRoutesV1(app: FastifyInstance) {
  // 🔐 Admin-only protection
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireRole('ADMIN'));

  app.get(
    '/admin/users',
    {
      schema: {
        tags: ['Admin'],
        summary: 'List all users (Admin only)',
        description: 'Returns all users. Requires ADMIN role.',
        security: [{ bearerAuth: [] }],
        response: {
          200: AdminUsersArraySchema,
          ...CommonErrorResponses,
        },
      },
    },
    AdminController.listUsers,
  );
}
