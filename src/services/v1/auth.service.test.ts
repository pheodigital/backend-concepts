// src/services/v1/auth.service.test.ts

import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../config/prisma";
import { AuthService } from "./auth.service";

// Mock all external dependencies FIRST
jest.mock("argon2");
jest.mock("jsonwebtoken");
jest.mock("../../config/prisma");

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register new user successfully", async () => {
      // Arrange
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        password: "hashed-password",
        role: "USER",
      };

      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);
      (argon2.hash as jest.Mock<any>).mockResolvedValue("hashed-password");
      (prisma.user.create as jest.Mock<any>).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.register(
        "test@example.com",
        "password123",
        "USER",
      );

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(argon2.hash).toHaveBeenCalledWith("password123");
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          password: "hashed-password",
          role: "USER",
        },
      });
      expect(result).toEqual(mockUser);
    });

    it("should throw USER_EXISTS error when email already exists", async () => {
      // Arrange
      const existingUser = { id: "user-123", email: "test@example.com" };
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(
        existingUser,
      );

      // Act & Assert
      await expect(
        AuthService.register("test@example.com", "password123"),
      ).rejects.toThrow(
        new AppError(400, "USER_EXISTS", "User already exists"),
      );

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should default to USER role when no role provided", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);
      (argon2.hash as jest.Mock<any>).mockResolvedValue("hashed-password");
      (prisma.user.create as jest.Mock<any>).mockResolvedValue({
        id: "user-123",
        role: "USER",
      });

      await AuthService.register("test@example.com", "password123");

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: "USER" }),
        }),
      );
    });
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      // Arrange
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        password: "hashed-password",
        role: "USER",
      };

      const mockAccessToken = "access-jwt";
      const mockRefreshToken = "refresh-jwt";

      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock<any>).mockResolvedValue(true);

      // Mock static methods
      jest
        .spyOn(AuthService, "generateAccessToken")
        .mockReturnValue(mockAccessToken);
      jest
        .spyOn(AuthService, "generateRefreshToken")
        .mockReturnValue(mockRefreshToken);

      // Act
      const result = await AuthService.login("test@example.com", "password123");

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(argon2.verify).toHaveBeenCalledWith(
        "hashed-password",
        "password123",
      );
      expect(result).toEqual({
        user: mockUser,
        token: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    it.each([
      { scenario: "user not found", user: null },
      { scenario: "invalid password", user: { password: "wrong-hash" } },
    ])("should throw INVALID_CREDENTIALS for $scenario", async ({ user }) => {
      // Arrange
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(user);
      (argon2.verify as jest.Mock<any>).mockResolvedValue(false);

      // Act & Assert
      await expect(
        AuthService.login("test@example.com", "password123"),
      ).rejects.toThrow(
        new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password"),
      );
    });
  });

  describe("generateAccessToken", () => {
    it("should generate valid JWT access token", () => {
      // Arrange
      const mockToken = "jwt.access.token";
      const signSpy = jest
        .spyOn(jwt, "sign")
        .mockImplementation(() => mockToken);

      // Act
      const result = AuthService.generateAccessToken("user-123", "USER");

      // Assert
      expect(signSpy).toHaveBeenCalledWith(
        { userId: "user-123", role: "USER" },
        process.env.JWT_ACCESS_SECRET,
        expect.objectContaining({
          expiresIn: expect.any(String),
        }),
      );
      expect(result).toBe(mockToken);
    });
  });
});
