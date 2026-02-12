import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { FastifyReply } from 'fastify';
import { AdminController } from './admin.controller';

// Mock Prisma
jest.mock('../../config/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = require('../../config/prisma').prisma;

describe('AdminController', () => {
  let mockReply: jest.Mocked<Partial<FastifyReply>>;

  beforeEach(() => {
    jest.clearAllMocks();

    // ✅ FIXED: Proper FastifyReply mock
    mockReply = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis(),
    } as any; // Type assertion for chainable methods
  });

  describe('listUsers', () => {
    it('should return all users ordered by createdAt desc', async () => {
      const mockUsers = [
        {
          id: 'user-123',
          email: 'admin@example.com',
          role: 'ADMIN',
          createdAt: new Date('2026-01-01'),
        },
        {
          id: 'user-456',
          email: 'user@example.com',
          role: 'USER',
          createdAt: new Date('2026-01-02'),
        },
      ];

      mockPrisma.user.findMany.mockImplementation(() => Promise.resolve(mockUsers));

      await AdminController.listUsers({} as any, mockReply as FastifyReply);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      mockPrisma.user.findMany.mockImplementation(() => Promise.resolve([]));

      await AdminController.listUsers({} as any, mockReply as FastifyReply);

      expect(mockReply.send).toHaveBeenCalledWith([]);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      mockPrisma.user.findMany.mockImplementation(() => Promise.reject(mockError));

      await expect(AdminController.listUsers({} as any, mockReply as FastifyReply)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
