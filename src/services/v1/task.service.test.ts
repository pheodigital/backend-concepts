import type { UserContext } from '../../types/user-context';
import { TaskService } from './task.service';

import { prisma } from '../../config/prisma';

// ✅ MANUAL ENUM - No Prisma dependency
const TaskStatus: any = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
};

// ✅ MOCK EXACTLY MATCHES YOUR GLOBAL PRISMA STRUCTURE
jest.mock('../../config/prisma', () => {
  const mockPrismaClient = {
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  };

  // ✅ SIMULATE YOUR GLOBAL SINGLETON
  const globalForPrisma = { prisma: mockPrismaClient };

  return {
    prisma: mockPrismaClient,
    globalForPrisma, // Export to match your pattern
  };
});

describe('TaskService', () => {
  const mockUser: UserContext = { userId: 'user-123', role: 'USER' };
  const mockTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    ownerId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated tasks with defaults', async () => {
      const mockPrisma = prisma;

      (mockPrisma.task.findMany as jest.Mock).mockImplementation(() => Promise.resolve([mockTask]));
      (mockPrisma.task.count as jest.Mock).mockImplementation(() => Promise.resolve(25));

      const result = await TaskService.list(mockUser);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-123' },
        skip: 0,
        take: 10,
        orderBy: [{ createdAt: 'desc' }],
      });
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it('should filter by status', async () => {
      const mockPrisma = prisma;

      (mockPrisma.task.findMany as jest.Mock).mockImplementation(() => Promise.resolve([mockTask]));
      (mockPrisma.task.count as jest.Mock).mockImplementation(() => Promise.resolve(1));

      await TaskService.list(mockUser, 1, 10, TaskStatus.IN_PROGRESS);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ownerId: 'user-123', status: TaskStatus.IN_PROGRESS },
        })
      );
    });
  });

  describe('create', () => {
    it('should create with default TODO status', async () => {
      const mockPrisma = prisma;

      (mockPrisma.task.create as jest.Mock).mockImplementation(() => Promise.resolve(mockTask));

      const result = await TaskService.create({ title: 'New Task' }, mockUser);

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'New Task',
          status: TaskStatus.TODO,
          ownerId: 'user-123',
        },
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('getById', () => {
    it('should return owned task', async () => {
      const mockPrisma = prisma;

      (mockPrisma.task.findFirst as jest.Mock).mockImplementation(() => Promise.resolve(mockTask));

      const result = await TaskService.getById('task-123', mockUser);

      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should update owned task', async () => {
      const mockPrisma = prisma;

      (mockPrisma.task.updateMany as jest.Mock).mockImplementation(() =>
        Promise.resolve({ count: 1 })
      );

      const result = await TaskService.update('task-123', { title: 'Updated' }, mockUser);

      expect(result).toEqual({ count: 1 });
    });
  });

  describe('delete', () => {
    it('should delete owned task', async () => {
      const mockPrisma = prisma;

      (mockPrisma.task.deleteMany as jest.Mock).mockImplementation(() =>
        Promise.resolve({ count: 1 })
      );

      const result = await TaskService.delete('task-123', mockUser);

      expect(result).toEqual({ count: 1 });
    });
  });
});
