import type { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../../services/v1/user.service';


// Define param types for routes that use ID
interface UserIdParams {
  id: string;
}

export class UserController {
  // ✅ Get all users (admin only)
  static async getAllUsers(req: FastifyRequest, reply: FastifyReply) {
    const users = await UserService.getAllUsers();
    return reply.send(users);
  }

  // ✅ Get user by ID
  static async getUserById(req: FastifyRequest<{ Params: UserIdParams }>, reply: FastifyReply) {
    const { id } = req.params;
    // req.params is already validated by middleware
    const user = await UserService.getUserById(id);
    return reply.send(user);
  }
}
