import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  mintReviewToken,
  verifyReviewToken,
  isReviewLinksEnabled,
  ReviewTokenError,
  type ReviewerContext,
} from './review-links';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const VALID_SECRET = 'test-secret-that-is-at-least-32-characters-long';

const sampleContext: ReviewerContext = {
  sub: 'reviewer-abc123',
  name: 'Alice Reviewer',
  email: 'alice@example.com',
  projectSlug: 'acme-website-redesign',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function setEnv(overrides: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

// ── isReviewLinksEnabled ──────────────────────────────────────────────────────

describe('isReviewLinksEnabled', () => {
  afterEach(() => {
    delete process.env.FEATURE_REVIEW_LINKS;
  });

  it('returns false when env var is absent', () => {
    delete process.env.FEATURE_REVIEW_LINKS;
    expect(isReviewLinksEnabled()).toBe(false);
  });

  it('returns false for an empty string', () => {
    process.env.FEATURE_REVIEW_LINKS = '';
    expect(isReviewLinksEnabled()).toBe(false);
  });

  it.each(['true', 'TRUE', 'True', '1', 'yes', 'YES'])(
    'returns true for truthy value "%s"',
    (value) => {
      process.env.FEATURE_REVIEW_LINKS = value;
      expect(isReviewLinksEnabled()).toBe(true);
    },
  );

  it.each(['false', '0', 'no', 'off', 'disabled'])(
    'returns false for falsy value "%s"',
    (value) => {
      process.env.FEATURE_REVIEW_LINKS = value;
      expect(isReviewLinksEnabled()).toBe(false);
    },
  );
});

// ── mintReviewToken ───────────────────────────────────────────────────────────

describe('mintReviewToken', () => {
  beforeEach(() => {
    setEnv({ REVIEW_LINK_SECRET: VALID_SECRET });
  });

  afterEach(() => {
    delete process.env.REVIEW_LINK_SECRET;
  });

  it('returns a token with three dot-separated parts', () => {
    const token = mintReviewToken(sampleContext);
    expect(token.split('.')).toHaveLength(3);
  });

  it('produces URL-safe characters only (no +, /, or = outside dots)', () => {
    const token = mintReviewToken(sampleContext);
    // base64url alphabet plus dots
    expect(token).toMatch(/^[A-Za-z0-9\-_.]+$/);
  });

  it('throws when REVIEW_LINK_SECRET is missing', () => {
    delete process.env.REVIEW_LINK_SECRET;
    expect(() => mintReviewToken(sampleContext)).toThrow(
      'REVIEW_LINK_SECRET',
    );
  });

  it('embeds the reviewer context in the payload', () => {
    const token = mintReviewToken(sampleContext);
    const [, encodedPayload] = token.split('.');
    const padded = encodedPayload + '='.repeat((4 - (encodedPayload.length % 4)) % 4);
    const payload = JSON.parse(
      Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'),
    ) as ReviewerContext & { iat: number; exp: number };

    expect(payload.sub).toBe(sampleContext.sub);
    expect(payload.name).toBe(sampleContext.name);
    expect(payload.email).toBe(sampleContext.email);
    expect(payload.projectSlug).toBe(sampleContext.projectSlug);
    expect(typeof payload.iat).toBe('number');
    expect(typeof payload.exp).toBe('number');
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it('respects a custom TTL', () => {
    const before = Math.floor(Date.now() / 1000);
    const token = mintReviewToken(sampleContext, 3600);
    const after = Math.floor(Date.now() / 1000);

    const [, encodedPayload] = token.split('.');
    const padded = encodedPayload + '='.repeat((4 - (encodedPayload.length % 4)) % 4);
    const payload = JSON.parse(
      Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'),
    ) as { iat: number; exp: number };

    expect(payload.exp - payload.iat).toBe(3600);
    expect(payload.iat).toBeGreaterThanOrEqual(before);
    expect(payload.iat).toBeLessThanOrEqual(after);
  });
});

// ── verifyReviewToken ─────────────────────────────────────────────────────────

describe('verifyReviewToken', () => {
  beforeEach(() => {
    setEnv({
      REVIEW_LINK_SECRET: VALID_SECRET,
      FEATURE_REVIEW_LINKS: 'true',
    });
  });

  afterEach(() => {
    delete process.env.REVIEW_LINK_SECRET;
    delete process.env.FEATURE_REVIEW_LINKS;
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  it('returns the reviewer context for a freshly minted valid token', () => {
    const token = mintReviewToken(sampleContext);
    const result = verifyReviewToken(token);

    expect(result).toEqual(sampleContext);
  });

  it('strips timing claims (iat / exp) from the returned context', () => {
    const token = mintReviewToken(sampleContext);
    const result = verifyReviewToken(token);

    expect(result).not.toHaveProperty('iat');
    expect(result).not.toHaveProperty('exp');
  });

  // ── Feature flag off ────────────────────────────────────────────────────────

  it('throws DISABLED when feature flag is off', () => {
    process.env.FEATURE_REVIEW_LINKS = 'false';
    const token = mintReviewToken(sampleContext);

    expect(() => verifyReviewToken(token)).toThrow(ReviewTokenError);
    try {
      verifyReviewToken(token);
    } catch (err) {
      expect(err).toBeInstanceOf(ReviewTokenError);
      expect((err as ReviewTokenError).code).toBe('DISABLED');
    }
  });

  it('throws DISABLED when feature flag env var is absent', () => {
    delete process.env.FEATURE_REVIEW_LINKS;
    const token = mintReviewToken(sampleContext);

    try {
      verifyReviewToken(token);
      // Should not reach here
      expect.fail('Expected ReviewTokenError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ReviewTokenError);
      expect((err as ReviewTokenError).code).toBe('DISABLED');
    }
  });

  // ── Malformed tokens ────────────────────────────────────────────────────────

  it('throws MALFORMED for a completely invalid string', () => {
    try {
      verifyReviewToken('not-a-valid-token');
      expect.fail('Expected ReviewTokenError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ReviewTokenError);
      expect((err as ReviewTokenError).code).toBe('MALFORMED');
    }
  });

  it('throws MALFORMED for a token with too few parts', () => {
    try {
      verifyReviewToken('header.payload');
      expect.fail('Expected ReviewTokenError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ReviewTokenError);
      expect((err as ReviewTokenError).code).toBe('MALFORMED');
    }
  });

  it('throws MALFORMED for a token with too many parts', () => {
    try {
      verifyReviewToken('a.b.c.d');
      expect.fail('Expected ReviewTokenError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ReviewTokenError);
      expect((err as ReviewTokenError).code).toBe('MALFORMED');
    }
  });

  // ── Tampered tokens ─────────────────────────────────────────────────────────

  it('throws INVALID_SIGNATURE when the signature is replaced', () => {
    const token = mintReviewToken(sampleContext);
    const [header, payload] = token.split('.');
    const tampered = `${header}.${payload}.invalidsignatureXXXXXX`;

    try {
      verifyReviewToken(tampered);
      expect.fail('Expected ReviewTokenError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ReviewTokenError);
      expect((err as ReviewTokenError).code).toBe('INVALID_SIGNATURE');
    }
  });

  it('throws INVALID_SIGNATURE when the payload is modified', () => {
    const token = mintReviewToken(sampleContext);
    const [header, , signature] = token.split('.');

    // Mint a new payload with different content (different sub)
    const tamperedContext = { ...sampleContext, sub: 'attacker-000' };
    const tamperedToken = mintReviewToken(tamperedContext);
    const [, tamperedPayload] = tamperedToken.split('.');

    // Splice the tampered payload with the original signature
    const spliced = `${header}.${tamperedPayload}.${signature}`;

    try {
      verifyReviewToken(spliced);
      expect.fail('Expected ReviewTokenError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ReviewTokenError);
      expect((err as ReviewTokenError).code).toBe('INVALID_SIGNATURE');
    }
  });

  it('throws INVALID_SIGNATURE when signed with a different secret', () => {
    // Mint with the default secret
    const token = mintReviewToken(sampleContext);

    // Verify with a different secret
    process.env.REVIEW_LINK_SECRET = 'completely-different-secret-value-xyz';

    try {
      verifyReviewToken(token);
      expect.fail('Expected ReviewTokenError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ReviewTokenError);
      expect((err as ReviewTokenError).code).toBe('INVALID_SIGNATURE');
    }
  });

  // ── Expired tokens ──────────────────────────────────────────────────────────

  it('throws EXPIRED for a token with a negative TTL (already past)', () => {
    // Mint a token that expired 1 second ago
    const token = mintReviewToken(sampleContext, -1);

    try {
      verifyReviewToken(token);
      expect.fail('Expected ReviewTokenError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ReviewTokenError);
      expect((err as ReviewTokenError).code).toBe('EXPIRED');
    }
  });

  it('throws EXPIRED for a token minted in the distant past via faked time', () => {
    // Freeze time at 1 hour ago to produce an already-expired token (TTL=1s)
    const oneHourAgo = Date.now() - 3600 * 1000;
    vi.spyOn(Date, 'now').mockReturnValue(oneHourAgo);

    const token = mintReviewToken(sampleContext, 1);

    // Restore real time for verification
    vi.restoreAllMocks();

    try {
      verifyReviewToken(token);
      expect.fail('Expected ReviewTokenError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ReviewTokenError);
      expect((err as ReviewTokenError).code).toBe('EXPIRED');
    }
  });

  // ── ReviewTokenError shape ──────────────────────────────────────────────────

  it('ReviewTokenError instances have the correct name', () => {
    process.env.FEATURE_REVIEW_LINKS = 'false';
    const token = mintReviewToken(sampleContext);

    try {
      verifyReviewToken(token);
    } catch (err) {
      expect((err as ReviewTokenError).name).toBe('ReviewTokenError');
    }
  });
});
