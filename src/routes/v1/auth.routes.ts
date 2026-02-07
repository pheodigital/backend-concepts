import { FastifyInstance } from 'fastify';
import { AuthController } from '../../controllers/v1/auth.controller';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validator.middleware';
import { CommonErrorResponses } from '../../common/swagger/error.swager';
import {
  RegisterBodySchema,
  LoginBodySchema,
  RefreshTokenBodySchema,
  LoginResponseSchema,
  AccessTokenResponseSchema,
  LogoutResponseSchema,
  CurrentUserResponseSchema,
} from '../../common/swagger/auth.schema';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from '../../validators/auth.validator';

export async function authRoutesV1(app: FastifyInstance) {
  app.post(
    '/register',
    {
      preHandler: [validate(registerSchema, 'body')],
      schema: {
        tags: ['Auth'],
        summary: 'Register a new user',
        body: RegisterBodySchema,
        response: {
          200: UserResponseSchema,
          ...CommonErrorResponses,
        },
      },
    },
    AuthController.register,
  );

  app.post(
    '/login',
    {
      preHandler: [validate(loginSchema, 'body')],
      schema: {
        tags: ['Auth'],
        summary: 'Login',
        body: LoginBodySchema,
        response: {
          200: LoginResponseSchema,
          ...CommonErrorResponses,
        },
      },
    },
    AuthController.login,
  );

  app.get(
    '/me',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Auth'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        response: {
          200: CurrentUserResponseSchema,
          ...CommonErrorResponses,
        },
      },
    },
    async (req) => ({
      userId: req.user!.userId,
      role: req.user!.role,
    }),
  );

  app.post(
    '/refresh',
    {
      preHandler: [validate(refreshSchema, 'body')],
      schema: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        body: RefreshTokenBodySchema,
        response: {
          200: AccessTokenResponseSchema,
          ...CommonErrorResponses,
        },
      },
    },
    AuthController.refresh,
  );

  app.post(
    '/logout',
    {
      preHandler: [validate(refreshSchema, 'body')],
      schema: {
        tags: ['Auth'],
        summary: 'Logout',
        body: RefreshTokenBodySchema,
        response: {
          200: LogoutResponseSchema,
          ...CommonErrorResponses,
        },
      },
    },
    AuthController.logout,
  );
}
