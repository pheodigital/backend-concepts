import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../../services/v1/auth.service';
import { AppError } from '../../common/errors/app-error';

export class AuthController {
  // ✅ Register a new user
  static async register(req: FastifyRequest, reply: FastifyReply) {
    // req.body is already validated by middleware
    const { email, password, role } = req.body as {
      email: string;
      password: string;
      role: 'USER' | 'ADMIN';
    };

    const user = await AuthService.register(email, password, role);

    return reply.status(201).send({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  // ✅ Login
  static async login(req: FastifyRequest, reply: FastifyReply) {
    const { email, password } = req.body as { email: string; password: string };

    const { user, token: accessToken, refreshToken } = await AuthService.login(email, password);

    // Store refresh token in DB
    await AuthService.saveRefreshToken(refreshToken, user.id, process.env.JWT_REFRESH_EXPIRES_IN!);

    return reply.send({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  }

  // ✅ Rotate / Refresh access token
  static async refresh(req: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = req.body as { refreshToken: string };

    if (!refreshToken) {
      throw new AppError(400, 'NO_TOKEN', 'Refresh token required');
    }

    const { accessToken } = await AuthService.rotateRefreshToken(refreshToken);

    return reply.send({ accessToken });
  }

  // ✅ Logout
  static async logout(req: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = req.body as { refreshToken: string };

    if (!refreshToken) {
      throw new AppError(400, 'NO_TOKEN', 'Refresh token required');
    }

    await AuthService.revokeRefreshToken(refreshToken);

    return reply.send({ message: 'Logged out successfully' });
  }
}
