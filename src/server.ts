import 'dotenv/config';

import { buildApp } from './app';
import { env } from './config/env';

async function startServer() {
  const app = buildApp();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on ${env.NODE_ENV} on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();
