// src/routes/v1/user.routes.test.ts
import type { FastifyInstance } from "fastify";
import { userRoutesV1 } from "./user.routes";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { requireRole } from "../../common/middleware/role.middleware";
import { UserController } from "../../controllers/v1/user.controller";

describe("User Routes V1", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = {
      register: jest.fn().mockImplementation((fn) => fn(app)),
      addHook: jest.fn(),
      get: jest.fn(),
    } as unknown as FastifyInstance;
  });

  it("should register user routes plugin", async () => {
    await userRoutesV1(app);
    expect(app.register).toHaveBeenCalled();
  });

  it("should add global requireAuth preHandler hook", async () => {
    await userRoutesV1(app);
    expect(app.addHook).toHaveBeenCalledWith("preHandler", requireAuth);
  });
  it("should register GET /users (Admin only)", async () => {
    await userRoutesV1(app);

    const getCall = (app.get as jest.Mock).mock.calls.find(
      (call) => call[0] === "/users",
    );

    expect(getCall).toBeDefined();

    const [, options, handler] = getCall!;

    // handler
    expect(handler).toBe(UserController.getAllUsers);

    // preHandler
    expect(options.preHandler).toHaveLength(1);
    expect(typeof options.preHandler[0]).toBe("function");

    // schema assertions (partial, stable)
    expect(options.schema).toEqual(
      expect.objectContaining({
        tags: ["Users"],
        summary: "Get all user",
        security: [{ bearerAuth: [] }],
      }),
    );
  });

  it("should register GET /users/:id", async () => {
    await userRoutesV1(app);

    expect(app.get).toHaveBeenCalledWith(
      "/users/:id",
      expect.objectContaining({
        schema: expect.objectContaining({
          tags: ["Users"],
          summary: "Get user by id",
          security: [{ bearerAuth: [] }],
        }),
      }),
      UserController.getUserById,
    );
  });
});
