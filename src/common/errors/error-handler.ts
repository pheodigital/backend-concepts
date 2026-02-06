import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from './app-error';

export function errorHandler(
  error: FastifyError | AppError,
  _req: FastifyRequest,
  reply: FastifyReply,
) {
  // ✅ Known application errors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // ✅ Prisma errors (safe handling)
  if ((error as any).code?.startsWith('P')) {
    return reply.status(400).send({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Invalid database operation',
      },
    });
  }

  // ❌ Unexpected errors
  console.error(error);

  return reply.status(500).send({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
    },
  });
}
