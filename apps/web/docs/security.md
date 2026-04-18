# Review Endpoint Security

## Threat model

The `/api/reviews/submit` endpoint is publicly reachable by anyone who holds a
valid signed deep-link token.  The main abuse scenarios are:

| Threat | Impact |
|--------|--------|
| Spam – bulk automated submissions | Inbox flooding, storage waste |
| Replay – re-submitting a valid token | Duplicate reviews, skewed signals |
| Token tampering – forging or extending a token | Submitting as a different reviewer or past expiry |
| Open redirect – injecting an attacker-controlled `callbackUrl` | Phishing after OAuth sign-in |
| XSS via form fields – injecting HTML/script in email bodies | Code execution in reviewer's mail client |
| CSRF – cross-origin POST | Submitting on behalf of an authenticated session |
| DoS via large payloads – oversized token strings | Expensive base64/JSON decoding per request |

---

## Countermeasures

### 1 — Same-origin check (CSRF)

Every `POST /api/reviews/submit` request must carry an `Origin` header that
matches the app's own host (derived from `Host` / `X-Forwarded-Host`).

- **Implementation**: `isRequestFromSameOrigin` in `src/lib/security.ts`
- **HTTP status on failure**: `403 Forbidden`
- **Bypass risk**: Absent `Origin` is rejected.  Server-to-server callers
  (cURL, integration tests) must either supply a matching `Origin` header or
  pass through the same-origin gate in tests via mocking.

### 2 — Per-IP rate limiting

A sliding-window counter keyed on the client IP address (`X-Forwarded-For` →
first address → `X-Real-IP` → `"unknown"`) allows **5 submissions per 15
minutes** per address.

- **Implementation**: `IP_POLICY` + `checkRateLimit` in `src/lib/rate-limit.ts`
- **HTTP status on failure**: `429 Too Many Requests` with a `Retry-After`
  header (seconds until the window resets)
- **Limitation**: In-memory per-process store; rate is per-instance in
  multi-process or serverless deployments.  Replace with a Redis-backed store
  (e.g. Upstash Ratelimit) for cross-instance coordination.

### 3 — Token size guard

The raw token string is capped at **2 048 bytes** (`MAX_TOKEN_BYTES`) before
any parsing or cryptographic operations take place.  This prevents DoS via
artificially inflated tokens that trigger expensive base64/JSON decoding.

- **Implementation**: `isTokenSizeValid` in `src/lib/security.ts`
- **HTTP status on failure**: `400 Bad Request`

### 4 — Input validation & length caps

All reviewer-supplied fields are validated server-side (independent of
client-side validation):

| Field        | Constraint |
|--------------|------------|
| `name`       | Required; ≤ 200 characters |
| `email`      | Required; valid format; ≤ 254 characters |
| `role`       | Optional; ≤ 200 characters |
| `relationship` | Required; must be `client`, `manager`, or `peer` |
| `feedback`   | Required; ≥ 40 and ≤ 10 000 characters |
| `consent`    | Required; must be `true` |

- **Implementation**: `validateBody` in
  `src/app/api/reviews/submit/route.ts`
- **HTTP status on failure**: `422 Unprocessable Entity`

### 5 — Token signature & expiry verification

The HMAC-SHA256 signed token is **re-verified on every request**, not trusted
from client state.

- Tampered signatures → `401 Unauthorized`
- Expired tokens → `410 Gone`
- Malformed tokens → `400 Bad Request`
- Feature disabled → `403 Forbidden`

The comparison is constant-time (`timingSafeEqual`) to prevent timing-based
side-channel attacks.

- **Implementation**: `verifyReviewToken` in `src/lib/review-links.ts`

### 6 — Per-token replay prevention

After successful verification the raw token is hashed with SHA-256
(`tokenFingerprint` in `src/app/api/reviews/submit/route.ts`) and a
`TOKEN_POLICY` rate-limit check (limit=1, window=24 h) prevents the same token
being submitted more than once.

- **Implementation**: `TOKEN_POLICY` + `checkRateLimit` in
  `src/lib/rate-limit.ts`, fingerprinting in `route.ts`
- **HTTP status on failure**: `429 Too Many Requests`
- **Limitation**: In-memory; a server restart clears the replay record.  For
  production-grade one-time use, record the token fingerprint in the database.

### 7 — HTML escaping

All user-supplied strings embedded in the email body (name, email, role,
relationship, feedback, LinkedIn identity) are escaped with `escapeHtml` before
interpolation to prevent HTML/script injection in the recipient's mail client.

- **Implementation**: `escapeHtml` in `src/lib/review-delivery.ts` (also
  exported from `src/lib/security.ts` for other callers)

### 8 — Open-redirect prevention

`callbackUrl` parameters used in OAuth flows and admin-route sign-in redirects
are validated against a strict allow-list:

- Must start with a single `/` (not `//`, which is protocol-relative)
- Must not start with `/\` (Windows UNC bypass)
- Must contain no `\r` or `\n` (header injection)

Any value that fails this predicate is replaced with `/`.

- **Implementation**: `isSafeCallbackUrl` / `sanitizeCallbackUrl` in
  `src/lib/security.ts`; applied in `proxy.ts`

---

## Architecture notes

- `src/lib/security.ts` — Edge-runtime safe (no `node:crypto`); imported by
  both server routes and Next.js middleware.
- `src/lib/rate-limit.ts` — In-memory sliding-window store; Edge-runtime safe.
- Token fingerprinting (`createHash`) lives in the route handler to avoid
  importing `node:crypto` into the Edge middleware bundle.

---

## Known limitations & future hardening

1. **Cross-instance rate limits**: Replace the in-memory `Map` with Redis for
   accurate limiting across multiple workers / serverless invocations.
2. **Durable replay prevention**: Persist token fingerprints to the database
   with a TTL equal to the token's `exp` claim for cross-restart protection.
3. **CAPTCHA**: Add a CAPTCHA challenge on the review form to reduce automated
   submissions before they reach the API.
4. **Bot fingerprinting**: Apply `X-Forwarded-For` trust only for known reverse
   proxies; strip or reject the header from direct connections to prevent IP
   spoofing.
