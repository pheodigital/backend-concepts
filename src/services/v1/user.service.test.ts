// src/services/v1/user.service.test.ts

import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../config/prisma";
import { UserService } from "./user.service";

// ✅ Reuse same Prisma mock pattern that worked for TaskService
jest.mock("../../config/prisma", () => {
  const mockPrismaClient = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  return {
    prisma: mockPrismaClient,
  };
});

describe("UserService", () => {
  const mockPrisma = prisma;

  const mockUser = {
    id: "user-123",
    email: "user@example.com",
    role: "USER",
    createdAt: new Date(),
  };

  const mockUsers = [
    {
      id: "user-123",
      email: "user1@example.com",
      role: "USER",
      createdAt: new Date(),
    },
    {
      id: "user-456",
      email: "user2@example.com",
      role: "ADMIN",
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("should return all users with selected fields", async () => {
      (mockPrisma.user.findMany as jest.Mock).mockImplementation(() =>
        Promise.resolve(mockUsers),
      );

      const result = await UserService.getAllUsers();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        select: { id: true, email: true, role: true, createdAt: true },
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
    });

    it("should return empty array when no users exist", async () => {
      (mockPrisma.user.findMany as jest.Mock).mockImplementation(() =>
        Promise.resolve([]),
      );

      const result = await UserService.getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockImplementation(() =>
        Promise.resolve(mockUser),
      );

      const result = await UserService.getUserById("user-123");

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
        select: { id: true, email: true, role: true, createdAt: true },
      });
      expect(result).toEqual(mockUser);
    });

    it("should throw USER_NOT_FOUND error when user does not exist", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockImplementation(() =>
        Promise.resolve(null),
      );

      await expect(UserService.getUserById("user-999")).rejects.toThrow(
        new AppError(404, "USER_NOT_FOUND", "User not found"),
      );

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-999" },
        select: { id: true, email: true, role: true, createdAt: true },
      });
    });

    it("should select only specified fields", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockImplementation(() =>
        Promise.resolve(mockUser),
      );

      await UserService.getUserById("user-123");

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          select: { id: true, email: true, role: true, createdAt: true },
        }),
      );
    });
  });

  describe("error handling", () => {
    it("should handle database errors gracefully", async () => {
      const mockError = new Error("Database connection failed");
      (mockPrisma.user.findUnique as jest.Mock).mockImplementation(() =>
        Promise.reject(mockError),
      );

      await expect(UserService.getUserById("user-123")).rejects.toThrow(
        "Database connection failed",
      );
    });
  });
});
