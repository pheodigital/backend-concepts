import { z } from 'zod';

export const getUserParamsSchema = z.object({
  id: z.string().cuid(),
});
