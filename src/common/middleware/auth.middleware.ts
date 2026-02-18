import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../../types/auth.types';
import { AppError } from '../errors/app-error';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export async function requireAuth(req: FastifyRequest, _reply: FastifyReply) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing Authorization header');
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid Authorization header');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;

    req.user = payload;
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired access token');
  }
}
