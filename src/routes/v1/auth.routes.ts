// src/routes/v1/auth.routes.ts
import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validator.middleware';
import {
  AccessTokenResponseSchema,
  CurrentUserResponseSchema,
  LoginBodySchema,
  LoginResponseSchema,
  LogoutResponseSchema,
  RefreshTokenBodySchema,
  RegisterBodySchema,
  UserResponseSchema,
} from '../../common/swagger/auth.schema';
import { CommonErrorResponses, RateLimitErrorResponse } from '../../common/swagger/error.swager';
import { AuthController } from '../../controllers/v1/auth.controller';
import { loginSchema, refreshSchema, registerSchema } from '../../validators/auth.validator';

export async function authRoutesV1(app: FastifyInstance) {
  app.register(async instance => {
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
            ...RateLimitErrorResponse,
          },
        },
        config: {
          rateLimit: {
            max: 5,
            timeWindow: '1 minute',
          },
        },
      },
      AuthController.register
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
            ...RateLimitErrorResponse,
          },
        },
        config: {
          rateLimit: {
            max: 5,
            timeWindow: '1 minute',
          },
        },
      },
      AuthController.login
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
      async req => ({
        userId: req.user!.userId,
        role: req.user!.role,
      })
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
            ...RateLimitErrorResponse,
          },
        },
        config: {
          rateLimit: {
            max: 3,
            timeWindow: '1 minute',
          },
        },
      },
      AuthController.refresh
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
      AuthController.logout
    );
  });
}
