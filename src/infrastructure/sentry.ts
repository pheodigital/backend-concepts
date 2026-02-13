// src/infrastructure/sentry.ts
/* import * as Sentry from '@sentry/node';

export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.log('[sentry] DSN not set — skipping init');
    return;
  }

  // nodeProfilingIntegration() loads a native binary that can crash on
  // Vercel serverless (Linux) if installed on a different OS (Mac/Windows).
  // We load it lazily and safely fall back if it fails.
  const integrations = [];
  try {
    const { nodeProfilingIntegration } = require('@sentry/profiling-node');
    integrations.push(nodeProfilingIntegration());
    console.log('[sentry] profiling integration loaded');
  } catch (err) {
    console.warn('[sentry] profiling integration unavailable — skipping:', err);
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    integrations,
  });

  console.log('[sentry] initialized');
}

export { Sentry }; */
