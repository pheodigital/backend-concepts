import { FastifyInstance } from 'fastify';
import { TaskController } from '../../controllers/v1/task.controller';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validator.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
} from '../../validators/task.validator';
import { listTasksQuerySchema } from '../../validators/task-query.validator';
import { CommonErrorResponses } from '../../common/swagger/error.swager';
import {
  TaskSchema,
  PaginatedTasksSchema,
  taskIdParamsJsonSchema,
} from '../../common/swagger/task.schema';

export async function taskRoutesV1(app: FastifyInstance) {
  // ✅ Get all tasks with pagination & filtering
  app.get(
    '/tasks',
    {
      preHandler: [requireAuth, validate(listTasksQuerySchema, 'query')],
      schema: {
        tags: ['Tasks'],
        summary: 'Get all tasks with optional pagination & filtering',
        description:
          'Retrieve tasks for the current user. Supports pagination, filtering by status, and sorting by createdAt.',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
            sort: {
              type: 'string',
              enum: ['createdAt', 'updatedAt', 'title'],
              default: 'createdAt',
            },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
        response: {
          200: PaginatedTasksSchema,
          ...CommonErrorResponses,
        },
        security: [{ bearerAuth: [] }],
      },
    },
    TaskController.getTasks,
  );

  // ✅ Other routes (Create, Get by ID, Update, Delete)
  app.post(
    '/tasks',
    { preHandler: [requireAuth, validate(createTaskSchema, 'body')] },
    TaskController.createTask,
  );

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
