import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { AppError } from '../common/errors/app-error';

export class AuthController {
  static async register(req: FastifyRequest, reply: FastifyReply) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success)
      throw new AppError(400, 'INVALID_BODY', 'Invalid input');

    const user = await AuthService.register(
      parsed.data.email,
      parsed.data.password,
      parsed.data.role,
    );
    return reply.send({ id: user.id, email: user.email, role: user.role });
  }

  static async login(req: FastifyRequest, reply: FastifyReply) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'INVALID_BODY', 'Invalid input');
    }

    const {
      user,
      token: accessToken,
      refreshToken,
    } = await AuthService.login(parsed.data.email, parsed.data.password);

    // ✅ STORE refresh token in DB
    await AuthService.saveRefreshToken(
      refreshToken,
      user.id,
      process.env.JWT_REFRESH_EXPIRES_IN!,
    );

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

  static async refresh(req: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken)
      throw new AppError(400, 'NO_TOKEN', 'Refresh token required');

    const { accessToken } = await AuthService.rotateRefreshToken(refreshToken);
    return reply.send({ accessToken });
  }

  static async logout(req: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken)
      throw new AppError(400, 'NO_TOKEN', 'Refresh token required');

    await AuthService.revokeRefreshToken(refreshToken);
    return reply.send({ message: 'Logged out successfully' });
  }
}
