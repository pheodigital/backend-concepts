import request from "supertest";
import { createTestApp } from "../utils/test-app";

describe("Helmet security headers", () => {
  it("sets security headers", async () => {
    const app = await createTestApp();

    const res = await request(app.server).get("/");

    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBeDefined();
    expect(res.headers["content-security-policy"]).toBeDefined();
  });
});
