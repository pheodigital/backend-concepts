// src/validators/task-query.validator.ts
import { z } from 'zod';

export const listTasksQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, { message: 'Page must be > 0' }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, { message: 'Limit must be 1-100' }),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'title']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
