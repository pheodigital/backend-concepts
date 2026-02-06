import { FastifyInstance } from 'fastify';
import { TaskController } from '../controllers/task.controller';
import { requireAuth } from '../common/middleware/auth.middleware';
import { validate } from '../common/middleware/validator.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
} from '../validators/task.validator';

export async function taskRoutes(app: FastifyInstance) {
  app.post(
    '/tasks',
    { preHandler: [requireAuth, validate(createTaskSchema, 'body')] },
    TaskController.createTask,
  );

  app.get('/tasks', { preHandler: [requireAuth] }, TaskController.getTasks);

  app.get(
    '/tasks/:id',
    { preHandler: [requireAuth, validate(taskIdParamSchema, 'params')] },
    TaskController.getTaskById,
  );

  app.put(
    '/tasks/:id',
    {
      preHandler: [
        requireAuth,
        validate(taskIdParamSchema, 'params'),
        validate(updateTaskSchema, 'body'),
      ],
    },
    TaskController.updateTask,
  );

  app.delete(
    '/tasks/:id',
    { preHandler: [requireAuth, validate(taskIdParamSchema, 'params')] },
    TaskController.deleteTask,
  );
}
