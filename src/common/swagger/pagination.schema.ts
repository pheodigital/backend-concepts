// src/common/swagger/pagination.schema.ts
export const PaginatedTasksSchema = {
  type: "object",
  properties: {
    total: { type: "number", description: "Total number of items" },
    page: { type: "number", description: "Current page number" },
    limit: { type: "number", description: "Number of items per page" },
    tasks: {
      type: "array",
      items: {
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
      },
    },
  },
};
