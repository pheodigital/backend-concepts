import { prisma } from '../../config/prisma';
import { AppError } from '../../common/errors/app-error';

export class UserService {
  static async getAllUsers() {
    return prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    return user;
  }
}
