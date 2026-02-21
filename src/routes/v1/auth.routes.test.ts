// src/routes/v1/auth.routes.test.ts
import type { FastifyInstance } from "fastify";
import { authRoutesV1 } from "./auth.routes";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validator.middleware";
import { AuthController } from "../../controllers/v1/auth.controller";

describe("Auth Routes V1", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = {
      register: jest.fn().mockImplementation((fn) => fn(app)),
      post: jest.fn(),
      get: jest.fn(),
    } as unknown as FastifyInstance;
  });

  it("should register auth plugin", async () => {
    await authRoutesV1(app);
    expect(app.register).toHaveBeenCalled();
  });

  it("should register POST /register route", async () => {
    await authRoutesV1(app);

    expect(app.post).toHaveBeenCalledWith(
      "/register",
      expect.objectContaining({
        preHandler: expect.any(Array),
        schema: expect.objectContaining({
          tags: ["Auth"],
          summary: "Register a new user",
        }),
      }),
      AuthController.register,
    );
  });

  it("should register POST /login route", async () => {
    await authRoutesV1(app);

    expect(app.post).toHaveBeenCalledWith(
      "/login",
      expect.objectContaining({
        preHandler: expect.any(Array),
        schema: expect.objectContaining({
          tags: ["Auth"],
          summary: "Login",
        }),
      }),
      AuthController.login,
    );
  });

  it("should register GET /me route with requireAuth middleware", async () => {
    await authRoutesV1(app);

    expect(app.get).toHaveBeenCalledWith(
      "/me",
      expect.objectContaining({
        preHandler: [requireAuth],
        schema: expect.objectContaining({
          tags: ["Auth"],
          summary: "Get current user",
          security: [{ bearerAuth: [] }],
        }),
      }),
      expect.any(Function),
    );
  });

  it("should register POST /refresh route", async () => {
    await authRoutesV1(app);

    expect(app.post).toHaveBeenCalledWith(
      "/refresh",
      expect.objectContaining({
        preHandler: expect.any(Array),
        schema: expect.objectContaining({
          tags: ["Auth"],
          summary: "Refresh access token",
        }),
      }),
      AuthController.refresh,
    );
  });

  it("should register POST /logout route", async () => {
    await authRoutesV1(app);

    expect(app.post).toHaveBeenCalledWith(
      "/logout",
      expect.objectContaining({
        preHandler: expect.any(Array),
        schema: expect.objectContaining({
          tags: ["Auth"],
          summary: "Logout",
        }),
      }),
      AuthController.logout,
    );
  });

  it("should apply rate limiting config where defined", async () => {
    await authRoutesV1(app);

    const registerCall = (app.post as any).mock.calls.find(
      (call: any[]) => call[0] === "/register",
    );

    expect(registerCall[1].config).toHaveProperty("rateLimit");
    expect(registerCall[1].config.rateLimit).toEqual(
      expect.objectContaining({
        max: expect.any(Number),
        timeWindow: expect.any(String),
      }),
    );
  });
});
