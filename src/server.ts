// src/server.ts
import "dotenv/config";
import { buildApp } from "./app";
import { env } from "./config/env";

// Start the server. In Fastify TS examples,
// this is done in a separate file to keep the app definition clean and focused on routes and plugins. [web:20][web:24]
async function startServer() {
  try {
    const app = await buildApp({ enableRateLimit: true });

    await app.listen({
      port: env.PORT,
      host: "0.0.0.0", // suitable for Docker/k8s and production use [web:13][web:25]
    });

    console.log(
      `🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`,
    );
    console.log(`📚 Swagger docs: http://localhost:${env.PORT}/docs`);
  } catch (err) {
    // In Fastify TS examples, failures cause immediate exit. [web:21][web:26]
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

startServer();
