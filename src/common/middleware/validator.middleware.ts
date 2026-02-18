import type { FastifyRequest } from 'fastify';
import type { ZodObject } from 'zod';
import { AppError } from '../errors/app-error';

export function validate(schema: ZodObject, property: 'body' | 'params' | 'query' = 'body') {
  return async (req: FastifyRequest) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      const errors = result.error.format();
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid request data', errors);
    }

    // Replace request data with parsed data
    req[property] = result.data;
  };
}
