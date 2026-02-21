// src/common/swagger/auth.schema.ts

// Request bodies
export const RegisterBodySchema = {
  type: "object",
  required: ["email", "password"], // role is optional in validator
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 },
    role: { type: "string", enum: ["USER", "ADMIN"] },
  },
};

export const LoginBodySchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 },
  },
};

export const RefreshTokenBodySchema = {
  type: "object",
  required: ["refreshToken"],
  properties: {
    refreshToken: { type: "string", minLength: 1 },
  },
};

// Basic user info used inside auth responses
export const UserResponseSchema = {
  type: "object",
  required: ["id", "email", "role"],
  properties: {
    id: { type: "string" },
    email: { type: "string", format: "email" },
    role: { type: "string", enum: ["USER", "ADMIN"] },
  },
};

// Responses
export const LoginResponseSchema = {
  type: "object",
  required: ["token", "refreshToken", "user"],
  properties: {
    token: { type: "string", description: "Access token" },
    refreshToken: { type: "string" },
    user: UserResponseSchema,
  },
};

export const AccessTokenResponseSchema = {
  type: "object",
  required: ["accessToken"],
  properties: {
    accessToken: { type: "string" },
  },
};

export const LogoutResponseSchema = {
  type: "object",
  required: ["message"],
  properties: {
    message: { type: "string" },
  },
};

export const CurrentUserResponseSchema = {
  type: "object",
  required: ["userId", "role"],
  properties: {
    userId: { type: "string" },
    role: { type: "string", enum: ["USER", "ADMIN"] },
  },
};
