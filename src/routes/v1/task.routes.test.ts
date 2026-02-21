// src/routes/v1/task.routes.test.ts
import type { FastifyInstance } from "fastify";
import { taskRoutesV1 } from "./task.routes";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { TaskController } from "../../controllers/v1/task.controller";

describe("Task Routes V1", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = {
      register: jest.fn().mockImplementation((fn) => fn(app)),
      addHook: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as FastifyInstance;
  });

  it("should register task routes plugin", async () => {
    await taskRoutesV1(app);
    expect(app.register).toHaveBeenCalled();
  });

  it("should add global requireAuth preHandler hook", async () => {
    await taskRoutesV1(app);
    expect(app.addHook).toHaveBeenCalledWith("preHandler", requireAuth);
  });

  it("should register GET /tasks", async () => {
    await taskRoutesV1(app);
    expect(app.get).toHaveBeenCalledWith(
      "/tasks",
      expect.objectContaining({
        schema: expect.objectContaining({
          tags: ["Tasks"],
          summary: "Get all tasks with pagination & filtering",
          security: [{ bearerAuth: [] }],
        }),
      }),
      TaskController.getTasks,
    );
  });

  it("should register POST /tasks", async () => {
    await taskRoutesV1(app);
    expect(app.post).toHaveBeenCalledWith(
      "/tasks",
      expect.objectContaining({
        schema: expect.objectContaining({
          tags: ["Tasks"],
          summary: "Create a new task",
        }),
      }),
      TaskController.createTask,
    );
  });

  it("should register GET /tasks/:id", async () => {
    await taskRoutesV1(app);
    expect(app.get).toHaveBeenCalledWith(
      "/tasks/:id",
      expect.any(Object),
      TaskController.getTaskById,
    );
  });

  it("should register PUT /tasks/:id", async () => {
    await taskRoutesV1(app);
    expect(app.put).toHaveBeenCalledWith(
      "/tasks/:id",
      expect.any(Object),
      TaskController.updateTask,
    );
  });

  it("should register DELETE /tasks/:id", async () => {
    await taskRoutesV1(app);
    expect(app.delete).toHaveBeenCalledWith(
      "/tasks/:id",
      expect.any(Object),
      TaskController.deleteTask,
    );
  });
});
