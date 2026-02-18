import type { FastifyRequest } from 'fastify';
import { AppError } from '../errors/app-error';

export const requireRole = (role: 'ADMIN' | 'USER') => async (req: FastifyRequest) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
  }

  if (req.user.role !== role) {
    throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions');
  }
};
