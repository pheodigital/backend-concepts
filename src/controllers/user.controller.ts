import { FastifyRequest, FastifyReply } from 'fastify';

import { UserService } from '../services/user.service';
import { getUserParamsSchema } from '../validators/user.validator';

export class UserController {
  static async getAllUsers(req: FastifyRequest, reply: FastifyReply) {
    const users = await UserService.getAllUsers();
    return reply.send(users);
  }

  static async getUserById(req: FastifyRequest, reply: FastifyReply) {
    const params = getUserParamsSchema.safeParse(req.params);
    if (!params.success)
      return reply.status(400).send({ error: 'Invalid user ID' });

    const user = await UserService.getUserById(params.data.id);
    return reply.send(user);
  }
}
