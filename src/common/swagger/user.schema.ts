// src/common/swagger/user.schema.ts

// Single user response
export const UserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['USER', 'ADMIN'] },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'email', 'role', 'createdAt'],
};

// Array of users
export const UsersArraySchema = {
  type: 'array',
  items: UserSchema,
};

// Route params for Swagger / OpenAPI
export const getUserParamsJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' }, // remove example here
  },
  required: ['id'],
};
