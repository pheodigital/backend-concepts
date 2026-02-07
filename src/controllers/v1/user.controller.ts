import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../../services/v1/user.service';

export class UserController {
  // ✅ Get all users (admin only)
  static async getAllUsers(req: FastifyRequest, reply: FastifyReply) {
    const users = await UserService.getAllUsers();
    return reply.send(users);
  }

  // ✅ Get user by ID
  static async getUserById(req: FastifyRequest, reply: FastifyReply) {
    // req.params is already validated by middleware
    const user = await UserService.getUserById(req.params.id as string);
    return reply.send(user);
  }
}
