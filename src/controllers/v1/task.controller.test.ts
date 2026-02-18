import type { FastifyReply, FastifyRequest } from 'fastify';
import { TaskService } from '../../services/v1/task.service';
import { TaskController } from './task.controller';

// ✅ MANUAL ENUM - No Prisma dependency
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TaskStatus: any = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
};

jest.mock('../../services/v1/task.service');

describe('TaskController', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      user: { userId: 'user-123', role: 'ADMIN' },
      body: {},
      params: {},
      query: {},
    };
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task and return 201 status', async () => {
      const taskData = { title: 'Test Task', description: 'Test Description' };
      const createdTask = { id: '1', ...taskData };

      mockRequest.body = taskData;
      (TaskService.create as jest.Mock).mockResolvedValue(createdTask);

      await TaskController.createTask(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(TaskService.create).toHaveBeenCalledWith(taskData, {
        userId: 'user-123',
        role: 'ADMIN',
      });
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith(createdTask);
    });
  });

  describe('getTasks', () => {
    it('should return tasks with default pagination', async () => {
      const tasks = { data: [], total: 0 };

      mockRequest.query = {};
      (TaskService.list as jest.Mock).mockResolvedValue(tasks);

      await TaskController.getTasks(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(TaskService.list).toHaveBeenCalledWith(
        { userId: 'user-123', role: 'ADMIN' },
        1,
        10,
        undefined,
        'createdAt',
        'desc'
      );
      expect(mockReply.send).toHaveBeenCalledWith(tasks);
    });

    it('should return tasks with custom filters', async () => {
      const tasks = { data: [], total: 0 };

      mockRequest.query = {
        page: 2,
        limit: 20,
        status: TaskStatus.DONE,
        sort: 'title',
        order: 'asc',
      };
      (TaskService.list as jest.Mock).mockResolvedValue(tasks);

      await TaskController.getTasks(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(TaskService.list).toHaveBeenCalledWith(
        { userId: 'user-123', role: 'ADMIN' },
        2,
        20,
        TaskStatus.DONE,
        'title',
        'asc'
      );
      expect(mockReply.send).toHaveBeenCalledWith(tasks);
    });
  });

  describe('getTaskById', () => {
    it('should return task by id', async () => {
      const task = { id: '1', title: 'Test Task' };

      mockRequest.params = { id: '1' };
      (TaskService.getById as jest.Mock).mockResolvedValue(task);

      await TaskController.getTaskById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(TaskService.getById).toHaveBeenCalledWith('1', { userId: 'user-123', role: 'ADMIN' });
      expect(mockReply.send).toHaveBeenCalledWith(task);
    });
  });

  describe('updateTask', () => {
    it('should update task and return updated task', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedTask = { id: '1', ...updateData };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      (TaskService.update as jest.Mock).mockResolvedValue(updatedTask);

      await TaskController.updateTask(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(TaskService.update).toHaveBeenCalledWith('1', updateData, {
        userId: 'user-123',
        role: 'ADMIN',
      });
      expect(mockReply.send).toHaveBeenCalledWith(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete task and return 204 status', async () => {
      mockRequest.params = { id: '1' };
      (TaskService.delete as jest.Mock).mockResolvedValue(undefined);

      await TaskController.deleteTask(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(TaskService.delete).toHaveBeenCalledWith('1', { userId: 'user-123', role: 'ADMIN' });
      expect(mockReply.status).toHaveBeenCalledWith(204);
      expect(mockReply.send).toHaveBeenCalled();
    });
  });
});
