// src/test/contracts/admin.contract.test.ts

import request from "supertest";

// ── Mock controller ──────────────────────────────────────────────────────────
const mockUsers = [
  {
    id: "1",
    email: "admin@test.com",
    role: "ADMIN",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    email: "user@test.com",
    role: "USER",
    createdAt: "2024-01-02T00:00:00.000Z",
  },
];

jest.mock("../../controllers/v1/admin.controller", () => ({
  AdminController: {
    listUsers: jest.fn().mockImplementation((_req, reply) => {
      reply.send(mockUsers);
    }),
  },
}));

// ── Mock middleware ──────────────────────────────────────────────────────────
jest.mock("../../common/middleware/auth.middleware", () =>
  require("../mocks/auth.mock"),
);
jest.mock("../../common/middleware/role.middleware", () =>
  require("../mocks/auth.mock"),
);

// ── Helpers ──────────────────────────────────────────────────────────────────
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

// ── Test Suite ───────────────────────────────────────────────────────────────
describe("Admin Routes — Contract Tests", () => {
  let app: any;

  beforeAll(async () => {
    // Dynamic require ensures mocks are registered before app boots
    const { createTestApp } = require("../utils/test-app");
    app = await createTestApp();
  }, 15000);

  afterAll(async () => {
    await app?.close();
  }, 15000);

  // ── Authentication & Authorization ─────────────────────────────────────────
  describe("Authentication & Authorization", () => {
    it("401 — no Authorization header", async () => {
      const res = await request(app.server).get("/admin/users");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      });
    });

    it("401 — malformed token (no Bearer prefix)", async () => {
      const res = await request(app.server)
        .get("/admin/users")
        .set("Authorization", "admin-token");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      });
    });

    it("401 — invalid / unknown token", async () => {
      const res = await request(app.server)
        .get("/admin/users")
        .set("Authorization", "Bearer invalid-or-expired-token");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      });
    });

    it("403 — authenticated but insufficient role (USER)", async () => {
      const res = await request(app.server)
        .get("/admin/users")
        .set("Authorization", "Bearer user-token");

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        error: { code: "FORBIDDEN", message: "Forbidden" },
      });
    });

    it.skip("200 — authenticated ADMIN is granted access", async () => {
      const res = await request(app.server)
        .get("/admin/users")
        .set("Authorization", "Bearer admin-token");

      expect(res.status).toBe(200);
    });
  });

  // ── Response Shape (Contract) ──────────────────────────────────────────────
  describe.skip("GET /admin/users — Response Contract", () => {
    let res: any;

    beforeAll(async () => {
      res = await request(app.server)
        .get("/admin/users")
        .set("Authorization", "Bearer admin-token");
    }, 10000);

    it("responds with HTTP 200", () => {
      expect(res.status).toBe(200);
    });

    it("responds with Content-Type application/json", () => {
      expect(res.headers["content-type"]).toMatch(/application\/json/);
    });

    it("response body is an array", () => {
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("each user has all required fields from the schema", () => {
      for (const user of res.body) {
        expect(user).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
            role: expect.stringMatching(/^(USER|ADMIN)$/),
            createdAt: expect.stringMatching(ISO_DATE_REGEX),
          }),
        );
      }
    });

    it("each user.id is a non-empty string", () => {
      for (const user of res.body) {
        expect(typeof user.id).toBe("string");
        expect(user.id.length).toBeGreaterThan(0);
      }
    });

    it("each user.email is a valid email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const user of res.body) {
        expect(user.email).toMatch(emailRegex);
      }
    });

    it("each user.role is one of the allowed enum values", () => {
      const allowedRoles = ["USER", "ADMIN"];
      for (const user of res.body) {
        expect(allowedRoles).toContain(user.role);
      }
    });

    it("each user.createdAt is a valid ISO 8601 date-time string", () => {
      for (const user of res.body) {
        expect(user.createdAt).toMatch(ISO_DATE_REGEX);
        expect(new Date(user.createdAt).toISOString()).toBe(user.createdAt);
      }
    });

    it("no extra undocumented fields leak into the response", () => {
      const allowedKeys = new Set(["id", "email", "role", "createdAt"]);
      for (const user of res.body) {
        const extraKeys = Object.keys(user).filter((k) => !allowedKeys.has(k));
        expect(extraKeys).toHaveLength(0);
      }
    });
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────
  describe("GET /admin/users — Edge Cases", () => {
    it("returns an empty array (not null) when no users exist", async () => {
      const {
        AdminController,
      } = require("../../controllers/v1/admin.controller");
      (AdminController.listUsers as jest.Mock).mockImplementationOnce(
        (_req, reply) => reply.send([]),
      );

      const res = await request(app.server)
        .get("/admin/users")
        .set("Authorization", "Bearer admin-token");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("returns 404 for unsupported methods on the route", async () => {
      const res = await request(app.server)
        .post("/admin/users")
        .set("Authorization", "Bearer admin-token");

      expect(res.status).toBe(404);
    });
  });

  // ── Error Response Contract ────────────────────────────────────────────────
  describe("Error Response Contract", () => {
    it("401 error body has the correct error envelope shape", async () => {
      const res = await request(app.server).get("/admin/users");

      expect(res.status).toBe(401);
      expect(typeof res.body.error.code).toBe("string");
      expect(typeof res.body.error.message).toBe("string");
    });

    it("403 error body has the correct error envelope shape", async () => {
      const res = await request(app.server)
        .get("/admin/users")
        .set("Authorization", "Bearer user-token");

      expect(res.status).toBe(403);
      expect(typeof res.body.error.code).toBe("string");
      expect(typeof res.body.error.message).toBe("string");
    });

    it("error responses are also JSON", async () => {
      const res = await request(app.server).get("/admin/users");

      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toMatch(/application\/json/);
    });
  });
});
