import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from './app-error';

export function errorHandler(
  error: FastifyError | AppError,
  _req: FastifyRequest,
  reply: FastifyReply,
) {
  // Handle known AppError
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // Unknown / unexpected error
  console.error(error); // Log internally for debugging

  return reply.status(500).send({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
    },
  });
}
