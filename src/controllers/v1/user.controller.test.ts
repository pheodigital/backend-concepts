import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../../services/v1/user.service';
import { UserController } from './user.controller';

// Define UserIdParams interface locally for test (same as routes)
interface UserIdParams {
  Params: {
    id: string;
  };
}

jest.mock('../../services/v1/user.service');

describe('UserController', () => {
  const mockRequest = {} as FastifyRequest;
  const mockReply = {
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ];
      (UserService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      await UserController.getAllUsers(mockRequest, mockReply);

      expect(UserService.getAllUsers).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: '1', name: 'User 1' };

      // Properly typed mock request matching UserIdParams
      const requestWithParams: FastifyRequest<UserIdParams> = {
        params: { id: '1' },
      } as FastifyRequest<UserIdParams>;

      (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await UserController.getUserById(requestWithParams, mockReply);

      expect(UserService.getUserById).toHaveBeenCalledWith('1');
      expect(mockReply.send).toHaveBeenCalledWith(mockUser);
    });
  });
});
