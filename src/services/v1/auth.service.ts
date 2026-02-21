// src/services/v1/auth.service.ts
import argon2 from "argon2";
import jwt from "jsonwebtoken";

import { prisma } from "../../config/prisma";

import { AppError } from "../../common/errors/app-error";

export class AuthService {
  static async register(
    email: string,
    password: string,
    role: "USER" | "ADMIN" = "USER",
  ) {
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(400, "USER_EXISTS", "User already exists");

    // Hash password
    const hashed = await argon2.hash(password);

    // Create user
    const user = await prisma.user.create({
      data: { email, password: hashed, role },
    });

    return user;
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );

    const valid = await argon2.verify(user.password, password);
    if (!valid)
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );

    // Generate tokens
    const accessToken = AuthService.generateAccessToken(user.id, user.role);
    const refreshToken = AuthService.generateRefreshToken(user.id, user.role);

    return { user, token: accessToken, refreshToken };
  }

  static generateAccessToken(userId: string, role: "USER" | "ADMIN") {
    return jwt.sign(
      { userId, role },
      process.env.JWT_ACCESS_SECRET as jwt.Secret, // ✅ Cast to jwt.Secret
      {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as string) || "15m",
      } as jwt.SignOptions, // ✅ Cast options
    );
  }

  static generateRefreshToken(userId: string, role: "USER" | "ADMIN") {
    return jwt.sign(
      { userId, role },
      process.env.JWT_REFRESH_SECRET as jwt.Secret,
      {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
          "7d") as jwt.SignOptions["expiresIn"],
      },
    );
  }

  static async refreshToken(oldToken: string) {
    // Verify token
    let payload: { userId: string; role: "USER" | "ADMIN" };
    try {
      payload = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET!) as any;
    } catch {
      throw new AppError(
        401,
        "INVALID_TOKEN",
        "Invalid or expired refresh token",
      );
    }

    // Check DB
    const stored = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
    });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new AppError(
        401,
        "INVALID_TOKEN",
        "Refresh token invalid or expired",
      );
    }

    // Generate new access token
    const accessToken = AuthService.generateAccessToken(
      payload.userId,
      payload.role,
    );
    return { accessToken };
  }

  static async saveRefreshToken(
    token: string,
    userId: string,
    expiresIn: string | number,
  ) {
    const expiresAt = new Date();
    if (typeof expiresIn === "string" && expiresIn.endsWith("d")) {
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
    } else if (typeof expiresIn === "string" && expiresIn.endsWith("m")) {
      expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiresIn));
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7); // default 7 days
    }

    await prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  }

  static async revokeRefreshToken(token: string) {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  }

  static async rotateRefreshToken(oldToken: string) {
    let payload: { userId: string; role: "USER" | "ADMIN" };

    try {
      payload = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET!) as any;
    } catch {
      throw new AppError(401, "INVALID_TOKEN", "Invalid refresh token");
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new AppError(
        401,
        "INVALID_TOKEN",
        "Refresh token expired or revoked",
      );
    }

    // 🔒 Revoke old token
    await prisma.refreshToken.update({
      where: { token: oldToken },
      data: { revoked: true },
    });

    // 🔁 Generate new tokens
    const accessToken = this.generateAccessToken(payload.userId, payload.role);

    const newRefreshToken = this.generateRefreshToken(
      payload.userId,
      payload.role,
    );

    await this.saveRefreshToken(
      newRefreshToken,
      payload.userId,
      process.env.JWT_REFRESH_EXPIRES_IN!,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
