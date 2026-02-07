import { prisma } from '../../config/prisma';
import { AppError } from '../../common/errors/app-error';
import { UserContext } from '../../types/user-context';
import { TaskStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

interface ListTasksOptions {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  sort?: keyof Prisma.TaskOrderByWithRelationInput;
  order?: 'asc' | 'desc';
}

export class TaskService {
  // ✅ Create Task
  static async create(
    data: { title: string; description?: string; status?: TaskStatus },
    user: UserContext,
  ) {
    return prisma.task.create({
      data: { ...data, ownerId: user.userId },
    });
  }

  // ✅ Get task by ID with ownership check
  static async getById(taskId: string, user: UserContext) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');

    if (task.ownerId !== user.userId && user.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Access denied');
    }

    return task;
  }

  // ✅ Update task
  static async update(
    taskId: string,
    data: Partial<{ title: string; description?: string; status?: TaskStatus }>,
    user: UserContext,
  ) {
    const task = await this.getById(taskId, user);

    return prisma.task.update({
      where: { id: task.id },
      data,
    });
  }

  // ✅ Delete task
  static async delete(taskId: string, user: UserContext) {
    const task = await this.getById(taskId, user);

    await prisma.task.delete({ where: { id: task.id } });
  }

  // ✅ List tasks with pagination, filtering, sorting
  static async list(
    user: UserContext,
    page: number = 1,
    limit: number = 10,
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE',
    order: 'asc' | 'desc' = 'desc',
  ) {
    const where: Prisma.TaskWhereInput = {
      ownerId: user.userId,
      ...(status ? { status } : {}),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: order },
      }),
      prisma.task.count({ where }),
    ]);

    return { total, page, limit, tasks };
  }
}
