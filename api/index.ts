// api/index.ts
// Vercel serverless entry point — do NOT use for local dev (use src/server.ts instead).
// Vercel routes every request through this file.

import { IncomingMessage, ServerResponse } from 'http';
import { buildApp } from '../src/app';
import { initSentry } from '../src/infrastructure/sentry';

let appInstance: Awaited<ReturnType<typeof buildApp>> | null = null;

// Reuse the same Fastify instance across warm Lambda invocations
async function getApp() {
  if (!appInstance) {
    initSentry(); // must run before buildApp(), same as server.ts
    appInstance = await buildApp();
    await appInstance.ready();
  }
  return appInstance;
}

// Vercel expects a default export function (req, res) => void
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();
  app.server.emit('request', req, res);
}
