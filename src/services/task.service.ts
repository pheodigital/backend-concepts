import { prisma } from '../config/prisma';
import { AppError } from '../common/errors/app-error';
import { TaskStatus } from '@prisma/client';
import { UserContext } from '../types/user-context';

export class TaskService {
  /**
   * INTERNAL helper
   * Enforces ownership + admin override in ONE place
   */
  private static async findOwnedTaskOrThrow(taskId: string, user: UserContext) {
    const where =
      user.role === 'ADMIN'
        ? { id: taskId }
        : { id: taskId, ownerId: user.userId };

    const task = await prisma.task.findFirst({ where });

    if (!task) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
    }

    return task;
  }

  /**
   * Create task (owner always derived from token)
   */
  static async create(
    data: { title: string; description?: string; status?: TaskStatus },
    user: UserContext,
  ) {
    return prisma.task.create({
      data: {
        ...data,
        ownerId: user.userId,
      },
    });
  }

  /**
   * List tasks
   * USER → own tasks only
   * ADMIN → all tasks
   */
  static async list(user: UserContext) {
    if (user.role === 'ADMIN') {
      return prisma.task.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return prisma.task.findMany({
      where: { ownerId: user.userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single task by ID
   */
  static async getById(taskId: string, user: UserContext) {
    return this.findOwnedTaskOrThrow(taskId, user);
  }

  /**
   * Update task
   */
  static async update(
    taskId: string,
    data: Partial<{
      title: string;
      description?: string;
      status?: TaskStatus;
    }>,
    user: UserContext,
  ) {
    await this.findOwnedTaskOrThrow(taskId, user);

    return prisma.task.update({
      where: { id: taskId },
      data,
    });
  }

  /**
   * Delete task
   */
  static async delete(taskId: string, user: UserContext) {
    await this.findOwnedTaskOrThrow(taskId, user);

    await prisma.task.delete({
      where: { id: taskId },
    });
  }
}
