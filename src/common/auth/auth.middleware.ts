import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/app-error';

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
      throw new AppError(401, 'UNAUTHORIZED', 'No token provided');

    const token = authHeader.split(' ')[1];
    if (!token) throw new AppError(401, 'UNAUTHORIZED', 'No token provided');

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      userId: string;
      role: 'USER' | 'ADMIN';
    };
    req.user = decoded; // attach to request
  } catch (err) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
}
