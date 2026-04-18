/**
 * Next.js server instrumentation hook.
 *
 * Called once when the Next.js server starts (or a new serverless sandbox is
 * initialised).  Use this file to:
 *
 *   • Register OpenTelemetry / Prometheus exporters when they are available.
 *   • Log the runtime configuration so operators can confirm which features
 *     are active without reading env-var dumps.
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register(): Promise<void> {
  // Only run on the Node.js runtime – edge workers have their own cold-start
  // path and don't need a one-time startup log.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Defer importing the logger to keep this file side-effect-free at
  // import time (required by Next.js).
  const { logger } = await import('./src/lib/logger');

  const featureFlags = {
    review_links: isEnabled(process.env.FEATURE_REVIEW_LINKS),
  };

  const envPresence = {
    REVIEW_LINK_SECRET:     !!process.env.REVIEW_LINK_SECRET,
    REVIEW_RECIPIENT_EMAIL: !!process.env.REVIEW_RECIPIENT_EMAIL,
    LINKEDIN_CLIENT_ID:     !!process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: !!process.env.LINKEDIN_CLIENT_SECRET,
    SMTP_HOST:              !!process.env.SMTP_HOST,
    SMTP_PORT:              !!process.env.SMTP_PORT,
  };

  logger.info({
    event:        'server.startup',
    node_env:     process.env.NODE_ENV ?? 'unknown',
    feature_flags: featureFlags,
    env_presence:  envPresence,
  });
}

/** Mirrors the truthy check in review-links.ts without importing it. */
function isEnabled(flag: string | undefined): boolean {
  const v = flag?.toLowerCase().trim();
  return v === 'true' || v === '1' || v === 'yes';
}
