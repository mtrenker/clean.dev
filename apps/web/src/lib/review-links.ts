/**
 * Stateless review-link token module.
 *
 * Mints and verifies signed, expiring deep-link tokens that carry the minimum
 * reviewer context needed for personalisation, with **no database persistence**.
 *
 * Token format (dot-separated, URL-safe):
 *   base64url(header) . base64url(payload) . base64url(HMAC-SHA256 signature)
 *
 * Required env vars:
 *   REVIEW_LINK_SECRET   – signing secret (min 32 chars recommended)
 *   FEATURE_REVIEW_LINKS – set to "true" / "1" / "yes" to enable the feature
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

// ── Types ──────────────────────────────────────────────────────────────────────

/** Minimum reviewer context embedded in the deep-link token. */
export interface ReviewerContext {
  /** Reviewer identifier (e.g. a CRM contact ID or email-based slug). */
  sub: string;
  /** Reviewer's display name – used for personalised greeting. */
  name: string;
  /** Reviewer's email address. */
  email: string;
  /** Slug of the project being reviewed. */
  projectSlug: string;
}

interface TokenHeader {
  alg: string;
  typ: string;
}

interface TokenPayload extends ReviewerContext {
  /** Issued-at Unix timestamp (seconds). */
  iat: number;
  /** Expiry Unix timestamp (seconds). */
  exp: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────

/** Default token lifetime: 7 days. */
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;

const HEADER: TokenHeader = { alg: 'HS256', typ: 'RL1' };

// ── Helpers ────────────────────────────────────────────────────────────────────

function base64urlEncode(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/={1,2}$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(value: string): string {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(
    padded.replace(/-/g, '+').replace(/_/g, '/'),
    'base64',
  ).toString('utf8');
}

function getSigningSecret(): string {
  const secret = process.env.REVIEW_LINK_SECRET;
  if (!secret) {
    throw new Error(
      'REVIEW_LINK_SECRET environment variable is not set. ' +
        'Generate a strong secret and set it before using review-link tokens.',
    );
  }
  return secret;
}

function computeSignature(signingInput: string): string {
  const secret = getSigningSecret();
  return createHmac('sha256', secret)
    .update(signingInput, 'utf8')
    .digest('base64')
    .replace(/={1,2}$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// ── Feature flag ───────────────────────────────────────────────────────────────

/**
 * Returns `true` when review-link functionality is enabled via the
 * `FEATURE_REVIEW_LINKS` environment variable.
 *
 * Accepted truthy values: `"true"`, `"1"`, `"yes"` (case-insensitive).
 * Any other value – including a missing variable – disables the feature
 * without requiring a code change or redeployment.
 */
export function isReviewLinksEnabled(): boolean {
  const flag = process.env.FEATURE_REVIEW_LINKS?.toLowerCase().trim();
  return flag === 'true' || flag === '1' || flag === 'yes';
}

// ── Error class ────────────────────────────────────────────────────────────────

export type ReviewTokenErrorCode =
  | 'DISABLED'
  | 'MALFORMED'
  | 'INVALID_SIGNATURE'
  | 'EXPIRED';

/**
 * Thrown by {@link verifyReviewToken} when the token cannot be trusted.
 * Inspect `code` to distinguish the failure mode.
 */
export class ReviewTokenError extends Error {
  constructor(
    message: string,
    public readonly code: ReviewTokenErrorCode,
  ) {
    super(message);
    this.name = 'ReviewTokenError';
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Mints a signed, expiring deep-link token embedding the reviewer context.
 *
 * The token is self-contained and requires no database look-up on
 * verification.  Keep tokens short-lived; prefer the default 7-day TTL unless
 * a tighter window is justified.
 *
 * @param context  Minimum reviewer context for personalisation.
 * @param ttl      Token lifetime in seconds (default: 7 days).
 * @returns        Opaque, URL-safe token string.
 * @throws         When `REVIEW_LINK_SECRET` is not configured.
 */
export function mintReviewToken(
  context: ReviewerContext,
  ttl: number = DEFAULT_TTL_SECONDS,
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    ...context,
    iat: now,
    exp: now + ttl,
  };

  const encodedHeader = base64urlEncode(JSON.stringify(HEADER));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = computeSignature(signingInput);

  return `${signingInput}.${signature}`;
}

/**
 * Verifies a review-link token and returns the embedded reviewer context.
 *
 * Performs, in order:
 *  1. Feature-flag check – throws `DISABLED` when the feature is off.
 *  2. Structure check    – throws `MALFORMED` for tokens that lack three parts.
 *  3. Signature check    – throws `INVALID_SIGNATURE` for tampered tokens
 *                          (constant-time comparison prevents timing attacks).
 *  4. Expiry check       – throws `EXPIRED` for tokens past their `exp` claim.
 *
 * @param token  Token string previously produced by {@link mintReviewToken}.
 * @returns      The embedded {@link ReviewerContext} when the token is valid.
 * @throws       {@link ReviewTokenError} on any verification failure.
 */
export function verifyReviewToken(token: string): ReviewerContext {
  if (!isReviewLinksEnabled()) {
    throw new ReviewTokenError(
      'Review links are currently disabled',
      'DISABLED',
    );
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new ReviewTokenError(
      'Token must consist of exactly three dot-separated parts',
      'MALFORMED',
    );
  }

  const [encodedHeader, encodedPayload, suppliedSignature] = parts as [
    string,
    string,
    string,
  ];
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = computeSignature(signingInput);

  // Constant-time comparison prevents timing-based side-channel attacks.
  const encoder = new TextEncoder();
  const suppliedBuf = encoder.encode(suppliedSignature);
  const expectedBuf = encoder.encode(expectedSignature);
  const lengthMatch = suppliedBuf.length === expectedBuf.length;
  // If lengths differ, compare against a same-length buffer so
  // timingSafeEqual doesn't throw, then fail on the length check.
  const compareBuf = lengthMatch ? suppliedBuf : new Uint8Array(expectedBuf.length);
  if (!timingSafeEqual(compareBuf, expectedBuf) || !lengthMatch) {
    throw new ReviewTokenError('Token signature is invalid', 'INVALID_SIGNATURE');
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(base64urlDecode(encodedPayload)) as TokenPayload;
  } catch {
    throw new ReviewTokenError('Token payload could not be decoded', 'MALFORMED');
  }

  if (typeof payload.exp !== 'number') {
    throw new ReviewTokenError('Token payload is missing expiry claim', 'MALFORMED');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp < nowSeconds) {
    throw new ReviewTokenError('Token has expired', 'EXPIRED');
  }

  const { sub, name, email, projectSlug } = payload;
  return { sub, name, email, projectSlug };
}
