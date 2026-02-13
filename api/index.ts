// api/index.ts
import { IncomingMessage, ServerResponse } from 'http';
import { buildApp } from '../src/app';

let appInstance: Awaited<ReturnType<typeof buildApp>> | null = null;

// getApp initializes the Fastify app on the first request and reuses the same instance for subsequent requests.
async function getApp() {
  if (!appInstance) {
    console.log('[vercel] starting app...');

    /* console.log('[vercel] calling initSentry...');
    initSentry();
    console.log('[vercel] initSentry done'); */

    console.log('[vercel] calling buildApp...');
    appInstance = await buildApp();
    console.log('[vercel] buildApp done');

    console.log('[vercel] calling ready...');
    await appInstance.ready();
    console.log('[vercel] ready done — app fully started');
  }
  return appInstance;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await getApp();
    app.server.emit('request', req, res);
  } catch (err) {
    console.error('[vercel] handler error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: String(err) }));
  }
}
