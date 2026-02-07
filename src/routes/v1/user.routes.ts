import { FastifyInstance } from 'fastify';
import { UserController } from '../../controllers/v1/user.controller';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/role.middleware';
import { validate } from '../../common/middleware/validator.middleware';
import { getUserParamsSchema } from '../../validators/user.validator';
import { CommonErrorResponses } from '../../common/swagger/error.swager';
import {
  UserSchema,
  UsersArraySchema,
  getUserParamsJsonSchema,
} from '../../common/swagger/user.schema';

export async function userRoutesV1(app: FastifyInstance) {
  // Apply authentication to all user routes
  app.addHook('preHandler', requireAuth);

  // ✅ Get all users - Admin only
  app.get(
    '/users',
    {
      preHandler: [requireRole('ADMIN')],
      schema: {
        description: 'Get all users (Admin only)',
        response: {
          200: UsersArraySchema,
          ...CommonErrorResponses,
        },
      },
    },
    UserController.getAllUsers,
  );

  // ✅ Get user by ID - requires param validation
  app.get(
    '/users/:id',
    {
      preHandler: [validate(getUserParamsSchema, 'params')],
      schema: {
        description: 'Get a single user by ID',
        params: getUserParamsJsonSchema, // Swagger only
        response: {
          200: UserSchema,
          ...CommonErrorResponses,
        },
      },
    },
    UserController.getUserById,
  );
}
