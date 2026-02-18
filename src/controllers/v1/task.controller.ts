// src/controllers/v1/task.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import { TaskService } from '../../services/v1/task.service';
import type { UserContext } from '../../types/user-context';
import type { TaskStatus } from '@prisma/client';


// Define param types for routes that use ID
interface TaskIdParams {
  id: string;
}

export class TaskController {
  private static getUser(req: FastifyRequest): UserContext {
    return {
      userId: req.user!.userId,
      role: req.user!.role,
    };
  }

  static async createTask(req: FastifyRequest, reply: FastifyReply) {
    const body = req.body as {
      title: string;
      description?: string;
      status?: TaskStatus;
    };
    const task = await TaskService.create(body, this.getUser(req));
    return reply.status(201).send(task);
  }

  static async getTasks(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as {
      page?: number;
      limit?: number;
      status?: TaskStatus;
      sort?: 'createdAt' | 'updatedAt' | 'title';
      order?: 'asc' | 'desc';
    };

    const { page = 1, limit = 10, status, sort = 'createdAt', order = 'desc' } = query;

    const result = await TaskService.list(this.getUser(req), page, limit, status, sort, order);
    return reply.send(result);
  }

  static async getTaskById(req: FastifyRequest<{ Params: TaskIdParams }>, reply: FastifyReply) {
    const { id } = req.params;
    const task = await TaskService.getById(id, this.getUser(req));
    return reply.send(task);
  }

  static async updateTask(req: FastifyRequest<{ Params: TaskIdParams }>, reply: FastifyReply) {
    const { id } = req.params;
    const body = req.body as {
      title?: string;
      description?: string;
      status?: TaskStatus;
    };
    const task = await TaskService.update(id, body, this.getUser(req));
    return reply.send(task);
  }

  static async deleteTask(req: FastifyRequest<{ Params: TaskIdParams }>, reply: FastifyReply) {
    const { id } = req.params;
    await TaskService.delete(id, this.getUser(req));
    return reply.status(204).send();
  }
}
