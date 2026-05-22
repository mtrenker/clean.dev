/**
 * Structured logger for the review journey.
 *
 * Emits JSON lines to stdout so that log-aggregation pipelines (Loki,
 * CloudWatch, Datadog, etc.) can ingest, parse, and alert on them without
 * any additional parsing configuration.
 *
 * PRIVACY RULES – strictly enforced at this layer
 * ───────────────────────────────────────────────
 * The logger itself does **not** enforce field-level redaction; callers are
 * responsible for only passing safe data.  The following fields MUST NEVER
 * appear in a log call:
 *
 *   ✗  token strings or any segment thereof
 *   ✗  email addresses
 *   ✗  reviewer display names
 *   ✗  review content / feedback text
 *   ✗  LinkedIn sub identifiers
 *   ✗  full IP addresses (use `ip_masked` instead, or omit)
 *
 * Safe fields (examples):
 *   ✓  event name (string)
 *   ✓  project_slug (no PII)
 *   ✓  error_code (e.g. 'EXPIRED', 'INVALID_SIGNATURE')
 *   ✓  duration_ms (latency)
 *   ✓  has_linkedin (boolean – whether enrichment was present)
 *   ✓  relationship (client / manager / peer – not PII)
 *   ✓  status (http status code)
 *   ✓  validation_fields (array of field names that failed – not values)
 *
 * Compatible with both the Node.js and Next.js Edge runtimes (no Node-only APIs).
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Arbitrary structured context that accompanies a log entry.
 * The `event` key is required and should follow the `domain.noun.verb` convention
 * (e.g. `review.token.validated`, `review.submission.delivered`).
 */
export interface LogContext {
  /** Dot-separated event identifier – the primary key for log queries. */
  event: string;
  [key: string]: unknown;
}

export interface LogEntry extends LogContext {
  level: LogLevel;
  ts: string;
}

// ── Core ───────────────────────────────────────────────────────────────────────

/**
 * Emits a single structured log entry as a JSON line.
 *
 * In `test` environments output is suppressed unless `LOG_IN_TESTS=true` is
 * set – this keeps vitest output clean while preserving the option to inspect
 * logs during debugging.
 */
export function log(level: LogLevel, ctx: LogContext): void {
  if (
    process.env.NODE_ENV === 'test' &&
    process.env.LOG_IN_TESTS !== 'true'
  ) {
    return;
  }

  const entry: LogEntry = {
    level,
    ts: new Date().toISOString(),
    ...ctx,
  };

  const line = JSON.stringify(entry);

  if (level === 'error' || level === 'warn') {
    console.error(line);
  } else {
    console.log(line);
  }
}

// ── Convenience helpers ────────────────────────────────────────────────────────

export const logger = {
  debug: (ctx: LogContext) => log('debug', ctx),
  info:  (ctx: LogContext) => log('info',  ctx),
  warn:  (ctx: LogContext) => log('warn',  ctx),
  error: (ctx: LogContext) => log('error', ctx),
} as const;

// ── Timer ──────────────────────────────────────────────────────────────────────

/**
 * Returns a function that, when called, yields the elapsed milliseconds since
 * `startTimer()` was invoked.
 *
 * @example
 * ```ts
 * const elapsed = startTimer();
 * await doWork();
 * logger.info({ event: 'review.delivery.success', duration_ms: elapsed() });
 * ```
 */
export function startTimer(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}

// ── Well-known event names ─────────────────────────────────────────────────────
//
// Centralising event strings here prevents typos across call sites and makes
// it easy to grep for all instrumented events.

/** Review invite page loaded and token validated successfully. */
export const EVT_INVITE_OPENED          = 'review.invite.opened'          as const;
/** Review invite page loaded but token was invalid / expired / disabled. */
export const EVT_INVITE_INVALID         = 'review.invite.invalid'         as const;

/** POST /api/reviews/submit – request rejected (same-origin / CSRF). */
export const EVT_SUBMIT_CSRF_REJECTED   = 'review.submit.csrf_rejected'   as const;
/** POST /api/reviews/submit – IP rate-limit triggered. */
export const EVT_SUBMIT_IP_RATE_LIMITED = 'review.submit.ip_rate_limited' as const;
/** POST /api/reviews/submit – token replay detected. */
export const EVT_SUBMIT_TOKEN_REPLAYED  = 'review.submit.token_replayed'  as const;
/** POST /api/reviews/submit – token size guard rejected the token. */
export const EVT_SUBMIT_TOKEN_TOO_LARGE = 'review.submit.token_too_large' as const;
/** POST /api/reviews/submit – input validation failed (field errors). */
export const EVT_SUBMIT_VALIDATION_FAIL = 'review.submit.validation_failed' as const;
/** POST /api/reviews/submit – token verification failed. */
export const EVT_SUBMIT_TOKEN_INVALID   = 'review.submit.token_invalid'   as const;
/** POST /api/reviews/submit – LinkedIn session enrichment attached. */
export const EVT_SUBMIT_LINKEDIN_ENRICHED = 'review.submit.linkedin_enriched' as const;
/** POST /api/reviews/submit – delivery succeeded. */
export const EVT_SUBMIT_DELIVERED       = 'review.submit.delivered'       as const;
/** POST /api/reviews/submit – delivery failed (SMTP / config error). */
export const EVT_SUBMIT_DELIVERY_FAILED = 'review.submit.delivery_failed' as const;

/** LinkedIn OAuth sign-in callback – success. */
export const EVT_LINKEDIN_AUTH_SUCCESS  = 'review.linkedin.auth_success'  as const;
/** LinkedIn OAuth sign-in callback – sign-in denied or provider error. */
export const EVT_LINKEDIN_AUTH_DENIED   = 'review.linkedin.auth_denied'   as const;
