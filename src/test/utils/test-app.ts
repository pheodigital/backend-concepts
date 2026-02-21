// tests/utils/test-app.ts
import { buildApp } from "../../app"; // your actual app entrypoint

export async function createTestApp() {
  const app = await buildApp({ enableRateLimit: false }); // rate limiting optional for tests
  await app.ready(); // Fastify lifecycle hook
  return app;
}
