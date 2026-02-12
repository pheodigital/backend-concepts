// src/routes/v1/admin.routes.ts
import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/role.middleware';
import { AdminUsersArraySchema } from '../../common/swagger/admin.schema';
import { CommonErrorResponses } from '../../common/swagger/error.swager';
import { AdminController } from '../../controllers/v1/admin.controller';

export async function adminRoutesV1(app: FastifyInstance) {
  app.register(async instance => {
    // Admin-only protection for everything in this plugin
    instance.addHook('preHandler', requireAuth);
    instance.addHook('preHandler', requireRole('ADMIN'));

    instance.get(
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
      AdminController.listUsers
    );
  });
}
