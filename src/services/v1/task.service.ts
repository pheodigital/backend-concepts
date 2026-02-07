// src/services/v1/task.service.ts
import { Prisma, PrismaClient, TaskStatus } from '@prisma/client';
import { UserContext } from '../../types/user-context';

const prisma = new PrismaClient();

interface PaginatedTasks {
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class TaskService {
  static async list(
    user: UserContext,
    page: number = 1,
    limit: number = 10,
    status?: TaskStatus,
    sort: 'createdAt' | 'updatedAt' | 'title' = 'createdAt',
    order: 'asc' | 'desc' = 'desc',
  ): Promise<PaginatedTasks> {
    const where: Prisma.TaskWhereInput = {
      ownerId: user.userId,
      ...(status ? { status } : {}),
    };

    const skip = (page - 1) * limit;

    // Dynamic orderBy based on sort parameter
    const orderBy: Prisma.TaskOrderByWithRelationInput[] = [{ [sort]: order }];

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks,
      meta: { page, limit, total, totalPages },
    };
  }

  static async create(
    data: {
      title: string;
      description?: string;
      status?: TaskStatus;
    },
    user: UserContext,
  ) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || 'TODO',
        ownerId: user.userId,
      },
    });
  }

  static async getById(id: string, user: UserContext) {
    return prisma.task.findFirst({
      where: {
        id,
        ownerId: user.userId,
      },
    });
  }

  static async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
    },
    user: UserContext,
  ) {
    return prisma.task.updateMany({
      where: {
        id,
        ownerId: user.userId,
      },
      data,
    });
  }

  static async delete(id: string, user: UserContext) {
    return prisma.task.deleteMany({
      where: {
        id,
        ownerId: user.userId,
      },
    });
  }
}
