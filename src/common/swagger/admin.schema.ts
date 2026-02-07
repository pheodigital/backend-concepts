// src/common/swagger/admin.schema.ts

export const AdminUserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['USER', 'ADMIN'] },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

export const AdminUsersArraySchema = {
  type: 'array',
  items: AdminUserSchema,
};
