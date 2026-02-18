import type { FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../../types/auth.types';
import { AppError } from '../errors/app-error';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export async function requireAuth(req: FastifyRequest) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing Authorization header');
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid Authorization header');
  }

  if (!process?.env?.JWT_ACCESS_SECRET) {
    throw new AppError(500, 'CONFIG_ERROR', 'Missing JWT_ACCESS_SECRET in environment variables');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as JwtPayload;

    req.user = payload;
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired access token');
  }
}
