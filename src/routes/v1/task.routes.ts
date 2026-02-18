// src/routes/v1/task.routes.ts
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
  app.register(async instance => {
    instance.addHook('preHandler', requireAuth);

    // GET /tasks - paginated list
    instance.get(
      '/tasks',
      {
        preHandler: [validate(listTasksQuerySchema, 'query')],
        schema: {
          tags: ['Tasks'],
          summary: 'Get all tasks with pagination & filtering',
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
      TaskController.getTasks
    );

    // POST /tasks - create
    instance.post(
      '/tasks',
      {
        preHandler: [validate(createTaskSchema, 'body')],
        schema: {
          tags: ['Tasks'],
          summary: 'Create a new task',
          body: {
            type: 'object',
            required: ['title'],
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
            },
          },
          response: {
            201: TaskSchema,
            ...CommonErrorResponses,
          },
          security: [{ bearerAuth: [] }],
        },
      },
      TaskController.createTask
    );

    // GET /tasks/:id
    instance.get(
      '/tasks/:id',
      {
        preHandler: [validate(taskIdParamSchema, 'params')],
        schema: {
          tags: ['Tasks'],
          summary: 'Get a task by ID',
          params: taskIdParamsJsonSchema,
          response: {
            200: TaskSchema,
            ...CommonErrorResponses,
          },
          security: [{ bearerAuth: [] }],
        },
      },
      TaskController.getTaskById
    );

    // PUT /tasks/:id
    instance.put(
      '/tasks/:id',
      {
        preHandler: [validate(taskIdParamSchema, 'params'), validate(updateTaskSchema, 'body')],
        schema: {
          tags: ['Tasks'],
          summary: 'Update a task by ID',
          params: taskIdParamsJsonSchema,
          body: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
            },
          },
          response: {
            200: TaskSchema,
            ...CommonErrorResponses,
          },
          security: [{ bearerAuth: [] }],
        },
      },
      TaskController.updateTask
    );

    // DELETE /tasks/:id
    instance.delete(
      '/tasks/:id',
      {
        preHandler: [validate(taskIdParamSchema, 'params')],
        schema: {
          tags: ['Tasks'],
          summary: 'Delete a task by ID',
          params: taskIdParamsJsonSchema,
          response: {
            204: { type: 'null' },
            ...CommonErrorResponses,
          },
          security: [{ bearerAuth: [] }],
        },
      },
      TaskController.deleteTask
    );
  });
}
