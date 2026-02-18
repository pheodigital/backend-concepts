import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/prisma';

export class AdminController {
  /**
   * List all users (Admin only)
   */
  static async listUsers(_req: FastifyRequest, reply: FastifyReply) {
    console.log('## ##');
    
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
