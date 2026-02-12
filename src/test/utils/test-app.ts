import { buildApp } from '../../app';

export async function createTestApp() {
  const app = await buildApp();
  await app.listen({ port: 0, host: '127.0.0.1' }); // port 0 = OS picks a free port
  return app;
}
