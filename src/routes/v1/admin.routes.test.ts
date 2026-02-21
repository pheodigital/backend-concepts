// src/routes/v1/admin.routes.test.ts

import type { FastifyInstance } from "fastify";
import { adminRoutesV1 } from "./admin.routes";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { AdminController } from "../../controllers/v1/admin.controller";

describe("Admin Routes V1", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = {
      register: jest.fn().mockImplementation((fn) => fn(app)),
      addHook: jest.fn(),
      get: jest.fn(),
    } as unknown as FastifyInstance;
  });

  it("should register admin plugin", async () => {
    await adminRoutesV1(app);
    expect(app.register).toHaveBeenCalled();
  });

  it("should add auth and role middleware hooks", async () => {
    await adminRoutesV1(app);

    // First hook call
    expect(app.addHook).toHaveBeenCalledWith("preHandler", requireAuth);

    // Second hook call – check type, not reference
    const secondCall = (app.addHook as jest.Mock).mock.calls[1];

    expect(secondCall[0]).toBe("preHandler");
    expect(typeof secondCall[1]).toBe("function");
  });

  it("should register GET /admin/users endpoint", async () => {
    await adminRoutesV1(app);
    expect(app.get).toHaveBeenCalledWith(
      "/admin/users",
      expect.objectContaining({
        schema: expect.objectContaining({
          tags: ["Admin"],
          summary: "List all users (Admin only)",
        }),
      }),
      AdminController.listUsers,
    );
  });

  it("should include bearer auth security in schema", async () => {
    await adminRoutesV1(app);
    const callArgs = (app.get as any).mock.calls[0][1];
    expect(callArgs.schema.security).toEqual([{ bearerAuth: [] }]);
  });

  it("should include 200 and error responses in schema", async () => {
    await adminRoutesV1(app);
    const callArgs = (app.get as any).mock.calls[0][1];
    expect(callArgs.schema.response).toHaveProperty("200");
  });
});
