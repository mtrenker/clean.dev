/**
 * POST /api/reviews/submit
 *
 * Accepts a review submission, re-verifies the signed token, validates and
 * sanitises all reviewer-supplied fields, enriches with any LinkedIn identity
 * present in the active session, and forwards the review to the configured
 * delivery sink.
 *
 * Submissions are **never written to the application database**.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * SECURITY LAYERS (applied in order)
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * 1. Same-origin check (CSRF)
 *    The `Origin` header is validated against the app's own host.  Requests
 *    without a matching origin are rejected with 403 before any parsing.
 *
 * 2. Per-IP rate limiting
 *    Max 5 submissions per IP per 15-minute window (IP_POLICY).  Limits bulk
 *    attacks from a single address regardless of the token supplied.
 *
 * 3. Token size guard
 *    Token strings are capped at MAX_TOKEN_BYTES (2 KB) before any parsing.
 *    Prevents DoS via huge payloads hitting base64/JSON decoding paths.
 *
 * 4. Input validation & sanitisation
 *    All string fields are trimmed and bounded (name ≤ 200 chars, feedback ≤
 *    10 000 chars, etc.).  Enum fields are checked against an allow-list.
 *
 * 5. Token signature & expiry verification
 *    The server re-verifies the HMAC-signed token on every request.  Tampered
 *    or expired tokens are rejected with appropriate status codes.
 *
 * 6. Per-token replay prevention
 *    After successful verification the token is fingerprinted (SHA-256 of the
 *    raw token string, truncated to 32 hex chars) and checked against an
 *    in-memory rate-limit store with TOKEN_POLICY (limit=1, window=24 h).
 *    A second submission for the same token is rejected with 429.
 *
 * 7. LinkedIn session enrichment
 *    Optional – session failure never blocks delivery.
 */
import { createHash } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { ReviewTokenError, verifyReviewToken } from '@/lib/review-links';
import { deliverReview, type LinkedInIdentity } from '@/lib/review-delivery';
import { checkRateLimit, IP_POLICY, TOKEN_POLICY } from '@/lib/rate-limit';
import {
  isRequestFromSameOrigin,
  isTokenSizeValid,
} from '@/lib/security';
import {
  logger,
  startTimer,
  EVT_SUBMIT_CSRF_REJECTED,
  EVT_SUBMIT_IP_RATE_LIMITED,
  EVT_SUBMIT_TOKEN_REPLAYED,
  EVT_SUBMIT_TOKEN_TOO_LARGE,
  EVT_SUBMIT_VALIDATION_FAIL,
  EVT_SUBMIT_TOKEN_INVALID,
  EVT_SUBMIT_LINKEDIN_ENRICHED,
  EVT_SUBMIT_DELIVERED,
  EVT_SUBMIT_DELIVERY_FAILED,
} from '@/lib/logger';

// ── Token fingerprinting ───────────────────────────────────────────────────────

/**
 * Derives a compact, opaque fingerprint from the raw token string for use as a
 * replay-prevention key in the rate-limit store.
 *
 * Hashing the whole token (header + payload + HMAC signature) gives a unique
 * identifier per issuance; the result is safe to store because SHA-256 is
 * one-way (the original token cannot be reconstructed from the fingerprint).
 *
 * This function intentionally lives here rather than in `security.ts` because
 * `node:crypto` is not available in the Next.js Edge runtime used by
 * middleware – server routes run on Node.js and have no such restriction.
 */
function tokenFingerprint(rawToken: string): string {
  return createHash('sha256').update(rawToken, 'utf8').digest('hex').slice(0, 32);
}

// ── Validation constants ───────────────────────────────────────────────────────

const MIN_FEEDBACK_LENGTH = 40;
const MAX_FEEDBACK_LENGTH = 10_000;
const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MAX_ROLE_LENGTH = 200;
const VALID_RELATIONSHIPS = new Set(['client', 'manager', 'peer']);
const EMAIL_RE = /^\S+@\S+\.\S+$/;

// ── Types ──────────────────────────────────────────────────────────────────────

interface SubmitBody {
  token: string;
  name: string;
  email: string;
  role: string;
  relationship: string;
  feedback: string;
  consent: boolean;
}

interface ValidationErrors {
  [field: string]: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Extracts the client IP from the request, preferring the standard
 * `X-Forwarded-For` proxy header (first address = original client).
 * Falls back to `X-Real-IP` and then the literal string `'unknown'`.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // X-Forwarded-For can be a comma-separated list; the first entry is the
    // original client IP when the proxy is trusted.
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

// ── Validation ─────────────────────────────────────────────────────────────────

function validateBody(
  body: unknown,
): { data: SubmitBody } | { errors: ValidationErrors } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { errors: { _root: 'Request body must be a JSON object' } };
  }

  const raw = body as Record<string, unknown>;
  const errors: ValidationErrors = {};

  // token – length guard is applied before this function is called
  if (typeof raw.token !== 'string' || !raw.token.trim()) {
    errors.token = 'Token is required';
  }

  // name
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name) {
    errors.name = 'Name is required';
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be at most ${MAX_NAME_LENGTH} characters`;
  }

  // email
  const email = typeof raw.email === 'string' ? raw.email.trim() : '';
  if (!email || !EMAIL_RE.test(email)) {
    errors.email = 'A valid email address is required';
  } else if (email.length > MAX_EMAIL_LENGTH) {
    errors.email = `Email must be at most ${MAX_EMAIL_LENGTH} characters`;
  }

  // role (optional)
  const role = typeof raw.role === 'string' ? raw.role.trim() : '';
  if (role.length > MAX_ROLE_LENGTH) {
    errors.role = `Role must be at most ${MAX_ROLE_LENGTH} characters`;
  }

  // relationship
  const relationship =
    typeof raw.relationship === 'string' ? raw.relationship.trim() : '';
  if (!relationship || !VALID_RELATIONSHIPS.has(relationship)) {
    errors.relationship = 'Relationship must be one of: client, manager, peer';
  }

  // feedback
  const feedback = typeof raw.feedback === 'string' ? raw.feedback.trim() : '';
  if (feedback.length < MIN_FEEDBACK_LENGTH) {
    errors.feedback = `Feedback must be at least ${MIN_FEEDBACK_LENGTH} characters`;
  } else if (feedback.length > MAX_FEEDBACK_LENGTH) {
    errors.feedback = `Feedback must be at most ${MAX_FEEDBACK_LENGTH} characters`;
  }

  // consent
  if (raw.consent !== true) {
    errors.consent = 'Consent is required';
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      token: (raw.token as string).trim(),
      name,
      email,
      role,
      relationship,
      feedback,
      consent: true,
    },
  };
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Layer 1: Same-origin check ─────────────────────────────────────────────
  // Rejects cross-origin POST requests (CSRF protection).
  // Browsers always send Origin on cross-origin fetch; same-origin fetch
  // may omit it – allow the missing-Origin case only during local development
  // (NODE_ENV !== 'production') or when the Origin is explicitly same-site.
  if (!isRequestFromSameOrigin(request)) {
    logger.warn({ event: EVT_SUBMIT_CSRF_REJECTED });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ── Layer 2: Per-IP rate limiting ──────────────────────────────────────────
  const ip = getClientIp(request);
  const ipCheck = checkRateLimit(`ip:${ip}`, IP_POLICY);
  if (!ipCheck.allowed) {
    logger.warn({
      event:    EVT_SUBMIT_IP_RATE_LIMITED,
      reset_in_s: Math.ceil((ipCheck.resetAt - Date.now()) / 1_000),
    });
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((ipCheck.resetAt - Date.now()) / 1_000)) },
      },
    );
  }

  // ── Layer 3: Parse JSON body ───────────────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // ── Layer 3a: Token size guard ─────────────────────────────────────────────
  // Applied after parsing to avoid double-reads; the raw body parse above is
  // bounded by the framework's body-size limit anyway (Next.js defaults to
  // 1 MB), but we add an explicit token-string cap before any crypto work.
  const rawToken =
    rawBody !== null &&
    typeof rawBody === 'object' &&
    !Array.isArray(rawBody)
      ? (rawBody as Record<string, unknown>).token
      : undefined;

  if (typeof rawToken === 'string' && !isTokenSizeValid(rawToken)) {
    logger.warn({ event: EVT_SUBMIT_TOKEN_TOO_LARGE });
    return NextResponse.json(
      { error: 'Token exceeds maximum permitted length' },
      { status: 400 },
    );
  }

  // ── Layer 4: Input validation & sanitisation ───────────────────────────────
  const validationResult = validateBody(rawBody);
  if ('errors' in validationResult) {
    logger.warn({
      event:            EVT_SUBMIT_VALIDATION_FAIL,
      // Log which fields failed, never the submitted values.
      failed_fields: Object.keys(validationResult.errors),
    });
    return NextResponse.json(
      { error: 'Validation failed', fields: validationResult.errors },
      { status: 422 },
    );
  }

  const { token, name, email, role, relationship, feedback } =
    validationResult.data;

  // ── Layer 5: Token signature & expiry verification ─────────────────────────
  let reviewerContext: ReturnType<typeof verifyReviewToken>;
  try {
    reviewerContext = verifyReviewToken(token);
  } catch (err) {
    if (err instanceof ReviewTokenError) {
      logger.warn({
        event:      EVT_SUBMIT_TOKEN_INVALID,
        error_code: err.code,
      });
      const statusByCode: Record<string, number> = {
        DISABLED: 403,
        EXPIRED: 410,
        MALFORMED: 400,
        INVALID_SIGNATURE: 401,
      };
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: statusByCode[err.code] ?? 400 },
      );
    }
    logger.error({ event: EVT_SUBMIT_TOKEN_INVALID, error_code: 'UNKNOWN' });
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 400 },
    );
  }

  // ── Layer 6: Per-token replay prevention ───────────────────────────────────
  // The token has been verified – fingerprint the raw token string and check
  // whether it has been submitted before.  A legitimate reviewer submits once;
  // a replay attempt (re-posting the same token) is rejected with 429.
  const fp = tokenFingerprint(token);
  const tokenCheck = checkRateLimit(`tok:${fp}`, TOKEN_POLICY);
  if (!tokenCheck.allowed) {
    logger.warn({
      event:        EVT_SUBMIT_TOKEN_REPLAYED,
      // project_slug comes from the verified context – safe to log.
      project_slug: reviewerContext.projectSlug,
    });
    return NextResponse.json(
      { error: 'This review link has already been used.' },
      { status: 429 },
    );
  }

  // ── Layer 7: LinkedIn session enrichment (optional) ───────────────────────
  let linkedin: LinkedInIdentity | undefined;
  try {
    const session = await auth();
    if (
      session?.user?.provider === 'linkedin' &&
      session.user.linkedinSub
    ) {
      linkedin = {
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        sub: session.user.linkedinSub,
      };
      logger.info({ event: EVT_SUBMIT_LINKEDIN_ENRICHED });
    }
  } catch {
    // Session is optional – proceed without LinkedIn enrichment.
  }

  // ── Deliver the review without persisting it ───────────────────────────────
  const elapsed = startTimer();
  try {
    await deliverReview({
      token: reviewerContext,
      form: { name, email, role, relationship, feedback },
      linkedin,
    });
  } catch (err) {
    const duration_ms = elapsed();
    logger.error({
      event:        EVT_SUBMIT_DELIVERY_FAILED,
      project_slug: reviewerContext.projectSlug,
      has_linkedin: !!linkedin,
      duration_ms,
      // Log error type/message but never review content.
      error:        err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: 'Failed to deliver review. Please try again later.' },
      { status: 500 },
    );
  }

  logger.info({
    event:        EVT_SUBMIT_DELIVERED,
    project_slug: reviewerContext.projectSlug,
    relationship,
    has_linkedin: !!linkedin,
    duration_ms:  elapsed(),
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
