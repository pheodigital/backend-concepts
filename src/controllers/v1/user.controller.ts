import type { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../../services/v1/user.service';

export class UserController {
  // ✅ Get all users (admin only)
  static async getAllUsers(req: FastifyRequest, reply: FastifyReply) {
    const users = await UserService.getAllUsers();
    return reply.send(users);
  }

  // ✅ Get user by ID
  static async getUserById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string }; // ✅ Type assertion
    // req.params is already validated by middleware
    const user = await UserService.getUserById(id);
    return reply.send(user);
  }
}
