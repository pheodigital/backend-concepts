import { FastifyRequest, FastifyReply } from 'fastify';
import { TaskService } from '../../services/v1/task.service';
import { UserContext } from '../../types/user-context';
import { listTasksQuerySchema } from '../../validators/task-query.validator';
import { AppError } from '../../common/errors/app-error';

export class TaskController {
  private static getUser(req: FastifyRequest): UserContext {
    return {
      userId: req.user!.userId,
      role: req.user!.role,
    };
  }

  static async createTask(req: FastifyRequest, reply: FastifyReply) {
    const task = await TaskService.create(req.body as any, this.getUser(req));
    return reply.status(201).send(task);
  }

  // GET /tasks with pagination & filtering
  static async getTasks(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as {
      page?: number;
      limit?: number;
      status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
      sort?: 'asc' | 'desc';
    };

    const page = query.page || 1;
    const limit = query.limit || 10;
    const status = query.status;
    const sort = query.sort || 'desc';

    const result = await TaskService.list(
      this.getUser(req),
      page,
      limit,
      status,
      sort,
    );
    return reply.send(result);
  }

  static async getTaskById(req: FastifyRequest, reply: FastifyReply) {
    const task = await TaskService.getById(req.params.id, this.getUser(req));
    return reply.send(task);
  }

  static async updateTask(req: FastifyRequest, reply: FastifyReply) {
    const task = await TaskService.update(
      req.params.id,
      req.body,
      this.getUser(req),
    );
    return reply.send(task);
  }

  static async deleteTask(req: FastifyRequest, reply: FastifyReply) {
    await TaskService.delete(req.params.id, this.getUser(req));
    return reply.send({ message: 'Task deleted successfully' });
  }
}
