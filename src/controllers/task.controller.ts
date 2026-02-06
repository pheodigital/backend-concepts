import { FastifyRequest, FastifyReply } from 'fastify';
import { TaskService } from '../services/task.service';
import { UserContext } from '../types/user-context';

export class TaskController {
  /**
   * Build user context once per request.
   * Controllers should NOT handle authorization logic.
   */
  private static getUser(req: FastifyRequest): UserContext {
    return {
      userId: req.user!.userId,
      role: req.user!.role,
    };
  }

  // ✅ Create Task
  static async createTask(req: FastifyRequest, reply: FastifyReply) {
    const task = await TaskService.create(req.body as any, this.getUser(req));
    return reply.status(201).send(task);
  }

  // ✅ Get all tasks for the user
  static async getTasks(req: FastifyRequest, reply: FastifyReply) {
    const tasks = await TaskService.list(this.getUser(req));
    return reply.send(tasks);
  }

  // ✅ Get task by ID
  static async getTaskById(req: FastifyRequest, reply: FastifyReply) {
    const task = await TaskService.getById(req.params.id, this.getUser(req));
    return reply.send(task);
  }

  // ✅ Update task
  static async updateTask(req: FastifyRequest, reply: FastifyReply) {
    const task = await TaskService.update(
      req.params.id,
      req.body,
      this.getUser(req),
    );
    return reply.send(task);
  }

  // ✅ Delete task
  static async deleteTask(req: FastifyRequest, reply: FastifyReply) {
    await TaskService.delete(req.params.id, this.getUser(req));
    return reply.send({ message: 'Task deleted successfully' });
  }
}
