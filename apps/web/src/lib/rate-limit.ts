/**
 * In-process sliding-window rate limiter.
 *
 * SECURITY NOTE
 * ─────────────
 * This module provides per-key rate limiting backed by a process-local Map.
 * It is effective against abuse within a single server instance.  In
 * multi-process or serverless deployments each instance maintains its own
 * counter, so the effective limit per client is `configured_limit × instance_count`.
 * For cross-instance coordination replace `checkRateLimit` with a Redis-backed
 * implementation (e.g. Upstash Ratelimit) while keeping the same call-site
 * interface.
 *
 * Two built-in policies are exported for the review-submit endpoint:
 *
 *   IP_POLICY   – 5 submissions per IP per 15 minutes.  Throttles bulk
 *                 attacks from a single address even when tokens differ.
 *
 *   TOKEN_POLICY – 1 submission per unique token identity (sub+iat) over the
 *                  token's remaining lifetime, capped at 24 h.  Prevents a
 *                  valid token from being submitted multiple times ("replay").
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface RateLimitPolicy {
  /** Maximum number of requests allowed in the time window. */
  limit: number;
  /** Duration of the sliding window in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  /** `true` when the request may proceed. */
  allowed: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Unix-ms timestamp at which the window resets for this key. */
  resetAt: number;
}

// ── Store ──────────────────────────────────────────────────────────────────────

interface Entry {
  /** Sorted array of request timestamps (Unix ms). */
  timestamps: number[];
}

// Bounded in-memory store – evict oldest entry when full to avoid unbounded
// memory growth in long-running processes.
const DEFAULT_MAX_STORE_SIZE = 20_000;

/** Exported so tests can reset between runs. */
export const _store = new Map<string, Entry>();

// ── Core implementation ────────────────────────────────────────────────────────

/**
 * Checks and records a rate-limit hit for `key`.
 *
 * Uses a sliding window: timestamps outside `windowMs` are discarded before
 * the count is evaluated.  The call itself is idempotent if `allowed` is
 * `false` – a rejected request is **not** recorded.
 *
 * @param key       Arbitrary string identifying the caller (e.g. IP address or
 *                  token fingerprint).
 * @param policy    `limit` and `windowMs` for this key class.
 * @param now       Current Unix-ms timestamp (injectable for testing).
 * @param maxSize   Maximum number of keys retained in the store.
 */
export function checkRateLimit(
  key: string,
  policy: RateLimitPolicy,
  now: number = Date.now(),
  maxSize: number = DEFAULT_MAX_STORE_SIZE,
): RateLimitResult {
  const { limit, windowMs } = policy;

  // Evict the oldest entry when the store is at capacity and the key is new.
  if (_store.size >= maxSize && !_store.has(key)) {
    const oldest = _store.keys().next().value;
    if (oldest !== undefined) {
      _store.delete(oldest);
    }
  }

  const entry = _store.get(key) ?? { timestamps: [] };

  // Drop timestamps that have fallen outside the sliding window.
  const cutoff = now - windowMs;
  const active = entry.timestamps.filter((ts) => ts > cutoff);

  if (active.length >= limit) {
    // Reject – do NOT record this request.
    _store.set(key, { timestamps: active });
    return {
      allowed: false,
      remaining: 0,
      // The window resets when the earliest active timestamp exits the window.
      resetAt: active[0]! + windowMs,
    };
  }

  // Allow – record the request.
  active.push(now);
  _store.set(key, { timestamps: active });

  return {
    allowed: true,
    remaining: limit - active.length,
    resetAt: active[0]! + windowMs,
  };
}

/**
 * Removes all stored rate-limit state for `key`.
 * Useful in tests and in cleanup hooks.
 */
export function resetRateLimit(key: string): void {
  _store.delete(key);
}

// ── Built-in policies ──────────────────────────────────────────────────────────

/**
 * Per-IP submission policy: 5 requests per 15 minutes.
 *
 * Applied before token verification so that invalid requests do not consume
 * a token slot.
 */
export const IP_POLICY: RateLimitPolicy = {
  limit: 5,
  windowMs: 15 * 60 * 1_000, // 15 min
};

/**
 * Per-token replay policy: 1 submission per unique token identity (sub + iat).
 *
 * A token's identity is derived from its `sub` and `iat` claims (hashed), so
 * the same token cannot be submitted a second time within the observation
 * window.  The window is capped at 24 hours regardless of the token's own TTL
 * to bound memory usage.
 */
export const TOKEN_POLICY: RateLimitPolicy = {
  limit: 1,
  windowMs: 24 * 60 * 60 * 1_000, // 24 h
};
