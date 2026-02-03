import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/prisma';

export class AdminController {
  static async listUsers(_req: FastifyRequest, reply: FastifyReply) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send(users);
  }
}
