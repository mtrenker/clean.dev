import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  _store,
  checkRateLimit,
  IP_POLICY,
  TOKEN_POLICY,
  type RateLimitPolicy,
} from './rate-limit';

// ── Helpers ────────────────────────────────────────────────────────────────────

const TEST_POLICY: RateLimitPolicy = { limit: 3, windowMs: 60_000 };

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('checkRateLimit', () => {
  beforeEach(() => {
    _store.clear();
  });

  afterEach(() => {
    _store.clear();
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  it('allows a first request and returns correct remaining count', () => {
    const result = checkRateLimit('user-1', TEST_POLICY);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('allows requests up to the limit', () => {
    checkRateLimit('user-1', TEST_POLICY);
    checkRateLimit('user-1', TEST_POLICY);
    const third = checkRateLimit('user-1', TEST_POLICY);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it('blocks the request that exceeds the limit', () => {
    checkRateLimit('user-1', TEST_POLICY);
    checkRateLimit('user-1', TEST_POLICY);
    checkRateLimit('user-1', TEST_POLICY);
    const fourth = checkRateLimit('user-1', TEST_POLICY);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  // ── Sliding window ───────────────────────────────────────────────────────────

  it('allows a request after the window has slid past all previous hits', () => {
    const t0 = 1_000_000;
    checkRateLimit('user-1', TEST_POLICY, t0);
    checkRateLimit('user-1', TEST_POLICY, t0);
    checkRateLimit('user-1', TEST_POLICY, t0);

    // After the window (60 001 ms later), all previous timestamps are stale.
    const t1 = t0 + 60_001;
    const result = checkRateLimit('user-1', TEST_POLICY, t1);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('partially unblocks when only some timestamps have expired', () => {
    const t0 = 1_000_000;
    // Two requests at t0.
    checkRateLimit('user-1', TEST_POLICY, t0);
    checkRateLimit('user-1', TEST_POLICY, t0);

    // One request 30 s later.
    checkRateLimit('user-1', TEST_POLICY, t0 + 30_000);

    // At t0 + 61 s the first two timestamps are gone; the third is still active.
    // Limit is 3, active is 1, so 2 more are allowed.
    const result = checkRateLimit('user-1', TEST_POLICY, t0 + 61_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  // ── Key isolation ─────────────────────────────────────────────────────────────

  it('tracks different keys independently', () => {
    checkRateLimit('a', TEST_POLICY);
    checkRateLimit('a', TEST_POLICY);
    checkRateLimit('a', TEST_POLICY);
    const blockedA = checkRateLimit('a', TEST_POLICY);
    const allowedB = checkRateLimit('b', TEST_POLICY);

    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });

  // ── Rejected requests are not counted ─────────────────────────────────────────

  it('does not count a rejected request toward the limit', () => {
    const t0 = 1_000_000;
    checkRateLimit('user-1', TEST_POLICY, t0);
    checkRateLimit('user-1', TEST_POLICY, t0);
    checkRateLimit('user-1', TEST_POLICY, t0);

    // Rejected – should not add to the store.
    checkRateLimit('user-1', TEST_POLICY, t0);
    checkRateLimit('user-1', TEST_POLICY, t0);

    // After window expires the slate is clean (only 0 active, not 5).
    const t1 = t0 + 61_000;
    const result = checkRateLimit('user-1', TEST_POLICY, t1);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2); // 3 limit - 1 new hit = 2 remaining
  });

  // ── resetAt ──────────────────────────────────────────────────────────────────

  it('returns a resetAt timestamp in the future when allowed', () => {
    const now = Date.now();
    const result = checkRateLimit('user-1', TEST_POLICY, now);
    expect(result.resetAt).toBeGreaterThan(now);
    expect(result.resetAt).toBeLessThanOrEqual(now + TEST_POLICY.windowMs);
  });

  it('returns a resetAt timestamp pointing to when the first hit expires when blocked', () => {
    const t0 = 1_000_000;
    checkRateLimit('user-1', TEST_POLICY, t0);
    checkRateLimit('user-1', TEST_POLICY, t0);
    checkRateLimit('user-1', TEST_POLICY, t0);
    const blocked = checkRateLimit('user-1', TEST_POLICY, t0 + 1_000);
    // First hit was at t0; it expires at t0 + windowMs.
    expect(blocked.resetAt).toBe(t0 + TEST_POLICY.windowMs);
  });

  // ── Store eviction ────────────────────────────────────────────────────────────

  it('evicts the oldest entry when the store reaches maxSize', () => {
    const now = Date.now();
    // Fill store with 2 keys.
    checkRateLimit('alpha', TEST_POLICY, now, 2);
    checkRateLimit('beta', TEST_POLICY, now, 2);

    // Adding a 3rd key should evict 'alpha' (the oldest).
    checkRateLimit('gamma', TEST_POLICY, now, 2);

    expect(_store.has('alpha')).toBe(false);
    expect(_store.has('beta')).toBe(true);
    expect(_store.has('gamma')).toBe(true);
  });
});

// ── Built-in policy shapes ─────────────────────────────────────────────────────

describe('IP_POLICY', () => {
  it('has a limit of 5', () => {
    expect(IP_POLICY.limit).toBe(5);
  });

  it('has a 15-minute window', () => {
    expect(IP_POLICY.windowMs).toBe(15 * 60 * 1_000);
  });
});

describe('TOKEN_POLICY', () => {
  beforeEach(() => {
    _store.clear();
  });

  afterEach(() => {
    _store.clear();
  });

  it('has a limit of 1', () => {
    expect(TOKEN_POLICY.limit).toBe(1);
  });

  it('has a 24-hour window', () => {
    expect(TOKEN_POLICY.windowMs).toBe(24 * 60 * 60 * 1_000);
  });

  it('allows the first submission for a token fingerprint', () => {
    const result = checkRateLimit('tok-fp-abc', TOKEN_POLICY);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('blocks a second submission for the same token fingerprint', () => {
    checkRateLimit('tok-fp-abc', TOKEN_POLICY);
    const second = checkRateLimit('tok-fp-abc', TOKEN_POLICY);
    expect(second.allowed).toBe(false);
  });
});
