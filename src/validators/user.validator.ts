// src/validators/user.validator.ts
import { z } from 'zod';

export const getUserParamsSchema = z.object({
  id: z.cuid(),
});

export type GetUserParams = z.infer<typeof getUserParamsSchema>;
