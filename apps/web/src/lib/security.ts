/**
 * Shared security helpers for the review submission flow.
 *
 * All exports in this module are safe for the Next.js Edge runtime (middleware)
 * as well as standard Node.js server routes.  Anything that requires
 * `node:crypto` lives in the route handler itself to avoid importing Node-only
 * APIs into the middleware bundle.
 *
 * SECURITY STRATEGY – REVIEW ENDPOINT HARDENING
 * ──────────────────────────────────────────────
 *
 * 1. Callback / origin validation (open-redirect prevention)
 *    ────────────────────────────────────────────────────────
 *    OAuth sign-in flows accept a `callbackUrl` parameter.  Without strict
 *    validation an attacker could supply `callbackUrl=https://evil.com` and
 *    users would be redirected off-site after authentication.
 *
 *    `sanitizeCallbackUrl` enforces that any redirect target is a relative
 *    path starting with `/` and not a protocol-relative URL (`//evil.com`).
 *    If the value does not meet the predicate it is replaced with the safe
 *    default `'/'`.
 *
 * 2. CSRF / same-origin enforcement
 *    ─────────────────────────────────
 *    The review-submit API route is a JSON endpoint called by the browser.
 *    `isRequestFromSameOrigin` checks the `Origin` header against the app
 *    origin derived from the incoming `Host` / `X-Forwarded-Host` header.
 *    Requests without a matching `Origin` (or without the header on older
 *    browsers) are rejected with HTTP 403.
 *
 * 3. Token size guard
 *    ──────────────────
 *    Overly large token strings can trigger denial-of-service by forcing
 *    expensive regex / JSON decoding paths.  `isTokenSizeValid` caps the
 *    token at `MAX_TOKEN_BYTES` (2 KB) before any parsing takes place.
 *
 * 4. HTML escaping
 *    ───────────────
 *    `escapeHtml` prevents XSS in server-rendered HTML (e.g. email bodies).
 *    All user-supplied strings that are embedded in HTML **must** be passed
 *    through this function.
 */

// ── 1. Callback URL sanitisation ──────────────────────────────────────────────

/**
 * Acceptable redirect paths must:
 *   • Start with a single `/` (not `//` which is protocol-relative)
 *   • Not start with `/\` (Windows UNC-path bypass)
 *   • Contain no line-feed or carriage-return characters (header injection)
 */
const SAFE_PATH_RE = /^\/(?![\\/])[^\r\n]*$/;

/**
 * Returns `true` when `url` is a safe, same-origin relative path.
 *
 * Rejects:
 *   - Absolute URLs with a scheme (`http://`, `https://`, `javascript:`, …)
 *   - Protocol-relative URLs (`//evil.com`)
 *   - Windows UNC bypasses (`/\evil`)
 *   - Header-injection characters (`\r`, `\n`)
 *   - Empty strings
 */
export function isSafeCallbackUrl(url: string): boolean {
  if (!url) return false;
  return SAFE_PATH_RE.test(url);
}

/**
 * Returns `url` when it passes the safe-path predicate, otherwise returns
 * the fallback (default: `'/'`).
 *
 * Use this wherever a user-controlled callback/redirect URL is consumed.
 *
 * @example
 * ```ts
 * const safe = sanitizeCallbackUrl(rawCallbackUrl);
 * return Response.redirect(new URL(safe, req.nextUrl.origin));
 * ```
 */
export function sanitizeCallbackUrl(url: string, fallback = '/'): string {
  return isSafeCallbackUrl(url) ? url : fallback;
}

// ── 2. Same-origin / CSRF enforcement ─────────────────────────────────────────

/**
 * Returns `true` when the `Origin` header on `request` matches the app origin
 * inferred from the `Host` (or `X-Forwarded-Host`) header.
 *
 * Rules:
 *   - A missing `Origin` header is **rejected** (conservative stance: old
 *     browsers and some curl invocations omit it, but legitimate browser
 *     fetch() calls always send it for cross-origin checks).
 *   - The scheme is matched against `X-Forwarded-Proto` when present,
 *     falling back to `https` in production or `http` in dev
 *     (`NODE_ENV !== 'production'`).
 *
 * @param request  The incoming `Request` or `NextRequest` object.
 */
export function isRequestFromSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    '';
  if (!host) return false;

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const scheme =
    forwardedProto ??
    (process.env.NODE_ENV === 'production' ? 'https' : 'http');

  const expected = `${scheme}://${host}`;

  // Parse both to normalise port / case differences.
  try {
    const originUrl = new URL(origin);
    const expectedUrl = new URL(expected);
    return originUrl.origin === expectedUrl.origin;
  } catch {
    return false;
  }
}

// ── 3. Token size guard ────────────────────────────────────────────────────────

/**
 * Maximum byte length of a review-link token string.
 * A well-formed token (header + payload + signature) is well under 1 KB;
 * 2 KB leaves ample room for future extensions.
 */
export const MAX_TOKEN_BYTES = 2_048;

/**
 * Returns `true` when `token` is within the permitted byte budget.
 *
 * Uses `Buffer.byteLength` (available in both Node.js and the Next.js Edge
 * runtime via the built-in Buffer polyfill) to measure UTF-8 byte length.
 *
 * @param token  Raw token string from the request body.
 */
export function isTokenSizeValid(token: string): boolean {
  return Buffer.byteLength(token, 'utf8') <= MAX_TOKEN_BYTES;
}

// ── 4. HTML escaping ──────────────────────────────────────────────────────────

/**
 * Escapes the five characters that have special meaning in HTML.
 *
 * Use this when embedding user-supplied text directly in an HTML string
 * (e.g. an email template built with string interpolation).
 *
 * @param str  Raw, potentially unsafe string.
 * @returns    HTML-safe version of the string.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
