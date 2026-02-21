// src/controllers/v1/auth.controller.test.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../common/errors/app-error";
import { AuthService } from "../../services/v1/auth.service";
import { AuthController } from "./auth.controller";

jest.mock("../../services/v1/auth.service");

describe("AuthController", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = { body: {} };
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("register", () => {
    it("should register a new user and return 201 status", async () => {
      const mockUser = { id: "1", email: "test@example.com", role: "USER" };
      (AuthService.register as jest.Mock).mockResolvedValue(mockUser);
      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
        role: "USER",
      };

      await AuthController.register(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("login", () => {
    it("should login user and return tokens", async () => {
      const mockUser = { id: "1", email: "test@example.com", role: "USER" };
      const mockTokens = {
        user: mockUser,
        token: "accessToken",
        refreshToken: "refreshToken",
      };
      (AuthService.login as jest.Mock).mockResolvedValue(mockTokens);
      (AuthService.saveRefreshToken as jest.Mock).mockResolvedValue(undefined);
      mockRequest.body = { email: "test@example.com", password: "password123" };
      process.env.JWT_REFRESH_EXPIRES_IN = "7d";

      await AuthController.login(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(AuthService.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
      expect(mockReply.send).toHaveBeenCalledWith({
        token: "accessToken",
        refreshToken: "refreshToken",
        user: mockUser,
      });
    });
  });

  describe("refresh", () => {
    it("should refresh access token", async () => {
      (AuthService.rotateRefreshToken as jest.Mock).mockResolvedValue({
        accessToken: "newAccessToken",
      });
      mockRequest.body = { refreshToken: "refreshToken" };

      await AuthController.refresh(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(AuthService.rotateRefreshToken).toHaveBeenCalledWith(
        "refreshToken",
      );
      expect(mockReply.send).toHaveBeenCalledWith({
        accessToken: "newAccessToken",
      });
    });

    it("should throw error if refresh token is missing", async () => {
      mockRequest.body = { refreshToken: "" };

      await expect(
        AuthController.refresh(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        ),
      ).rejects.toThrow(AppError);
    });
  });

  describe("logout", () => {
    it("should logout user successfully", async () => {
      (AuthService.revokeRefreshToken as jest.Mock).mockResolvedValue(
        undefined,
      );
      mockRequest.body = { refreshToken: "refreshToken" };

      await AuthController.logout(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(AuthService.revokeRefreshToken).toHaveBeenCalledWith(
        "refreshToken",
      );
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });
    });

    it("should throw error if refresh token is missing", async () => {
      mockRequest.body = { refreshToken: "" };

      await expect(
        AuthController.logout(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        ),
      ).rejects.toThrow(AppError);
    });
  });
});
