// Auth request & response schemas

export const RegisterBodySchema = {
  type: 'object',
  required: ['email', 'password', 'role'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    role: { type: 'string', enum: ['USER', 'ADMIN'] },
  },
};

export const LoginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
  },
};

export const RefreshTokenBodySchema = {
  type: 'object',
  required: ['refreshToken'],
  properties: {
    refreshToken: { type: 'string' },
  },
};

export const UserResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: ['USER', 'ADMIN'] },
  },
};

export const LoginResponseSchema = {
  type: 'object',
  properties: {
    token: { type: 'string', description: 'Access token' },
    refreshToken: { type: 'string' },
    user: UserResponseSchema,
  },
};

export const AccessTokenResponseSchema = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
  },
};

export const LogoutResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
};

export const CurrentUserResponseSchema = {
  type: 'object',
  properties: {
    userId: { type: 'string' },
    role: { type: 'string' },
  },
};
