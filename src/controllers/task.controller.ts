import { FastifyRequest, FastifyReply } from 'fastify';

import { TaskService } from '../services/task.service';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
} from '../validators/task.validator';
import { UserContext } from '../types/user-context';

export class TaskController {
  /**
   * Build user context once per request.
   * Controllers should NOT do authorization logic.
   */
  private static getUser(req: FastifyRequest): UserContext {
    return {
      userId: req.user!.userId,
      role: req.user!.role,
    };
  }

  static async createTask(req: FastifyRequest, reply: FastifyReply) {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const task = await TaskService.create(parsed.data, this.getUser(req));

    return reply.status(201).send(task);
  }

  static async getTasks(req: FastifyRequest, reply: FastifyReply) {
    const tasks = await TaskService.list(this.getUser(req));
    return reply.send(tasks);
  }

  static async getTaskById(req: FastifyRequest, reply: FastifyReply) {
    const params = taskIdParamSchema.safeParse(req.params);
    if (!params.success) {
      return reply.status(400).send({ error: 'Invalid task ID' });
    }

    const task = await TaskService.getById(params.data.id, this.getUser(req));

    return reply.send(task);
  }

  static async updateTask(req: FastifyRequest, reply: FastifyReply) {
    const params = taskIdParamSchema.safeParse(req.params);
    const body = updateTaskSchema.safeParse(req.body);

    if (!params.success || !body.success) {
      return reply.status(400).send({ error: 'Invalid request' });
    }

    const task = await TaskService.update(
      params.data.id,
      body.data,
      this.getUser(req),
    );

    return reply.send(task);
  }

  static async deleteTask(req: FastifyRequest, reply: FastifyReply) {
    const params = taskIdParamSchema.safeParse(req.params);
    if (!params.success) {
      return reply.status(400).send({ error: 'Invalid task ID' });
    }

    await TaskService.delete(params.data.id, this.getUser(req));

    return reply.send({ message: 'Task deleted successfully' });
  }
}
