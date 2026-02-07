// src/routes/v1/auth.routes.ts
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
  UserResponseSchema,
} from '../../common/swagger/auth.schema';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from '../../validators/auth.validator';

export async function authRoutesV1(app: FastifyInstance) {
  app.register(async (instance) => {
    // POST /register
    instance.post(
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

    // POST /login
    instance.post(
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

    // GET /me
    instance.get(
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

    // POST /refresh
    instance.post(
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

    // POST /logout
    instance.post(
      '/logout',
      {
        // You might also want requireAuth here; depends on your design.
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
  });
}
