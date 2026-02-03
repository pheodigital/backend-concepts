import { FastifyInstance } from 'fastify';
import { authenticate } from '../common/auth/auth.middleware';
import { TaskController } from '../controllers/task.controller';

export async function taskRoutes(app: FastifyInstance) {
  app.post('/tasks', { preHandler: [authenticate] }, TaskController.createTask);
  app.get('/tasks', { preHandler: [authenticate] }, TaskController.getTasks);
  app.get(
    '/tasks/:id',
    { preHandler: [authenticate] },
    TaskController.getTaskById,
  );
  app.put(
    '/tasks/:id',
    { preHandler: [authenticate] },
    TaskController.updateTask,
  );
  app.delete(
    '/tasks/:id',
    { preHandler: [authenticate] },
    TaskController.deleteTask,
  );
}
