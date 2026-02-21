// src/common/swagger/task.schema.ts

// Single Task object
export const TaskSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] },
    ownerId: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["id", "title", "status", "ownerId", "createdAt", "updatedAt"],
};

// Array of tasks
export const TasksArraySchema = {
  type: "array",
  items: TaskSchema,
};

// Task ID params for Swagger
export const taskIdParamsJsonSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
};

// Pagination metadata
export const PaginationMetaSchema = {
  type: "object",
  properties: {
    page: { type: "integer" },
    limit: { type: "integer" },
    total: { type: "integer" },
    totalPages: { type: "integer" },
  },
  required: ["page", "limit", "total", "totalPages"],
};

// Paginated tasks response
export const PaginatedTasksSchema = {
  type: "object",
  properties: {
    data: TasksArraySchema,
    meta: PaginationMetaSchema,
  },
  required: ["data", "meta"],
};
