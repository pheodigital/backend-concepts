import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    return; // Disabled if DSN not provided
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0, // lower in prod later
    profilesSampleRate: 1.0,
    integrations: [nodeProfilingIntegration()],
  });
}

export { Sentry };
