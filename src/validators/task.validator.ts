import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'DONE']).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdParamSchema = z.object({
  id: z.string().cuid(),
});
