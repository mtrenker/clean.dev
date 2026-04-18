import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { _store } from '@/lib/rate-limit';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const VALID_SECRET = 'test-secret-at-least-32-characters-long-xyzabc';

const validBody = {
  token: '', // filled in beforeEach after minting
  name: 'Jane Reviewer',
  email: 'jane@example.com',
  role: 'Senior Engineer',
  relationship: 'client',
  feedback: 'Exceptional collaboration throughout the engagement. Clear deliverables and strong communication.',
  consent: true,
};

/** Shared origin/host headers that pass the same-origin check. */
const SAME_ORIGIN_HEADERS = {
  'Content-Type': 'application/json',
  'origin': 'http://localhost:3000',
  'host': 'localhost:3000',
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { deliverReviewMock, verifyReviewTokenMock, authMock } = vi.hoisted(() => ({
  deliverReviewMock: vi.fn().mockResolvedValue(undefined),
  verifyReviewTokenMock: vi.fn(),
  authMock: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/review-delivery', () => ({
  deliverReview: deliverReviewMock,
}));

vi.mock('@/lib/review-links', async () => {
  const actual = await vi.importActual<typeof import('@/lib/review-links')>('@/lib/review-links');
  return {
    ...actual,
    verifyReviewToken: verifyReviewTokenMock,
  };
});

vi.mock('auth', () => ({
  auth: authMock,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(
  body: unknown,
  headers: Record<string, string> = SAME_ORIGIN_HEADERS,
): NextRequest {
  return new NextRequest('http://localhost:3000/api/reviews/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/reviews/submit', () => {
  beforeEach(() => {
    process.env.REVIEW_LINK_SECRET = VALID_SECRET;
    process.env.FEATURE_REVIEW_LINKS = 'true';

    verifyReviewTokenMock.mockReturnValue({
      sub: 'rev-1',
      name: 'Jane Token',
      email: 'jane@example.com',
      projectSlug: 'platform-refresh',
    });
    deliverReviewMock.mockResolvedValue(undefined);
    authMock.mockResolvedValue(null);

    // Reset the rate-limit store between tests so limits don't bleed over.
    _store.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.REVIEW_LINK_SECRET;
    delete process.env.FEATURE_REVIEW_LINKS;
    _store.clear();
  });

  // ── Import route handler lazily so mocks are in place ──────────────────────
  async function getHandler() {
    const mod = await import('./route');
    return mod.POST;
  }

  // ── Happy path ──────────────────────────────────────────────────────────────

  it('returns 200 and { success: true } for a valid submission', async () => {
    const POST = await getHandler();
    const response = await POST(makeRequest({ ...validBody, token: 'header.payload.sig' }));

    expect(response.status).toBe(200);
    const data = await response.json() as { success: boolean };
    expect(data.success).toBe(true);
  });

  it('calls deliverReview with sanitised form data', async () => {
    const POST = await getHandler();
    await POST(makeRequest({ ...validBody, token: 'h.p.s', name: '  Jane  ' }));

    expect(deliverReviewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        form: expect.objectContaining({ name: 'Jane' }),
      }),
    );
  });

  it('enriches submission with LinkedIn identity from the session', async () => {
    authMock.mockResolvedValue({
      user: {
        provider: 'linkedin',
        linkedinSub: 'li-sub-xyz',
        name: 'Jane Li',
        image: 'https://example.com/photo.jpg',
      },
    });

    const POST = await getHandler();
    await POST(makeRequest({ ...validBody, token: 'h.p.s' }));

    expect(deliverReviewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        linkedin: { name: 'Jane Li', image: 'https://example.com/photo.jpg', sub: 'li-sub-xyz' },
      }),
    );
  });

  it('submits without LinkedIn enrichment when session has no LinkedIn provider', async () => {
    authMock.mockResolvedValue({ user: { provider: 'github' } });

    const POST = await getHandler();
    await POST(makeRequest({ ...validBody, token: 'h.p.s' }));

    const call = deliverReviewMock.mock.calls[0] as [{ linkedin?: unknown }];
    expect(call[0].linkedin).toBeUndefined();
  });

  // ── Same-origin / CSRF protection ───────────────────────────────────────────

  it('returns 403 when the Origin header is absent', async () => {
    const POST = await getHandler();
    const response = await POST(
      makeRequest(
        { ...validBody, token: 'h.p.s' },
        { 'Content-Type': 'application/json', host: 'localhost:3000' },
      ),
    );
    expect(response.status).toBe(403);
    expect(deliverReviewMock).not.toHaveBeenCalled();
  });

  it('returns 403 when the Origin does not match the Host', async () => {
    const POST = await getHandler();
    const response = await POST(
      makeRequest(
        { ...validBody, token: 'h.p.s' },
        {
          'Content-Type': 'application/json',
          origin: 'https://evil.com',
          host: 'localhost:3000',
        },
      ),
    );
    expect(response.status).toBe(403);
    expect(deliverReviewMock).not.toHaveBeenCalled();
  });

  // ── Per-IP rate limiting ────────────────────────────────────────────────────

  it('returns 429 after the per-IP limit (5) is reached', async () => {
    const POST = await getHandler();
    const ip = '10.0.0.99';
    const headers = {
      ...SAME_ORIGIN_HEADERS,
      'x-forwarded-for': ip,
    };

    // Use distinct tokens so replay prevention doesn't trigger first.
    for (let i = 0; i < 5; i++) {
      verifyReviewTokenMock.mockReturnValueOnce({
        sub: `rev-${i}`,
        name: 'Jane',
        email: 'jane@example.com',
        projectSlug: 'proj',
      });
      await POST(makeRequest({ ...validBody, token: `h.p.s${i}` }, headers));
    }

    // 6th request should be rate-limited.
    const response = await POST(makeRequest({ ...validBody, token: 'h.p.s6' }, headers));
    expect(response.status).toBe(429);
    expect(deliverReviewMock).toHaveBeenCalledTimes(5);
  });

  it('includes a Retry-After header when rate-limited', async () => {
    const POST = await getHandler();
    const ip = '10.0.0.88';
    const headers = { ...SAME_ORIGIN_HEADERS, 'x-forwarded-for': ip };

    for (let i = 0; i < 5; i++) {
      verifyReviewTokenMock.mockReturnValueOnce({
        sub: `rev-${i}`, name: 'J', email: 'j@x.com', projectSlug: 'p',
      });
      await POST(makeRequest({ ...validBody, token: `h.p.t${i}` }, headers));
    }

    const blocked = await POST(makeRequest({ ...validBody, token: 'h.p.t6' }, headers));
    expect(blocked.status).toBe(429);
    const retryAfter = blocked.headers.get('retry-after');
    expect(retryAfter).toBeTruthy();
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });

  // ── Token size guard ────────────────────────────────────────────────────────

  it('returns 400 for a token that exceeds MAX_TOKEN_BYTES', async () => {
    const POST = await getHandler();
    const hugeToken = 'a'.repeat(3_000);
    const response = await POST(makeRequest({ ...validBody, token: hugeToken }));
    expect(response.status).toBe(400);
    expect(deliverReviewMock).not.toHaveBeenCalled();
  });

  // ── Replay prevention ───────────────────────────────────────────────────────

  it('returns 429 when the same token is submitted a second time', async () => {
    const POST = await getHandler();
    const token = 'unique.payload.signature';

    // First submission succeeds.
    const first = await POST(makeRequest({ ...validBody, token }));
    expect(first.status).toBe(200);

    // Second submission with the same token is rejected.
    const second = await POST(makeRequest({ ...validBody, token }));
    expect(second.status).toBe(429);
    expect(deliverReviewMock).toHaveBeenCalledTimes(1);
  });

  it('allows different tokens from the same reviewer', async () => {
    const POST = await getHandler();

    const first = await POST(makeRequest({ ...validBody, token: 'h.p.sig1' }));
    expect(first.status).toBe(200);

    const second = await POST(makeRequest({ ...validBody, token: 'h.p.sig2' }));
    expect(second.status).toBe(200);

    expect(deliverReviewMock).toHaveBeenCalledTimes(2);
  });

  // ── Validation errors ───────────────────────────────────────────────────────

  it('returns 422 when consent is false', async () => {
    const POST = await getHandler();
    const response = await POST(
      makeRequest({ ...validBody, token: 'h.p.s', consent: false }),
    );
    expect(response.status).toBe(422);
    expect(deliverReviewMock).not.toHaveBeenCalled();
  });

  it('returns 422 when feedback is too short', async () => {
    const POST = await getHandler();
    const response = await POST(
      makeRequest({ ...validBody, token: 'h.p.s', feedback: 'Short' }),
    );
    expect(response.status).toBe(422);
  });

  it('returns 422 for an invalid relationship value', async () => {
    const POST = await getHandler();
    const response = await POST(
      makeRequest({ ...validBody, token: 'h.p.s', relationship: 'enemy' }),
    );
    expect(response.status).toBe(422);
  });

  it('returns 422 for an invalid email', async () => {
    const POST = await getHandler();
    const response = await POST(
      makeRequest({ ...validBody, token: 'h.p.s', email: 'not-an-email' }),
    );
    expect(response.status).toBe(422);
  });

  it('returns 400 for a non-JSON body', async () => {
    const POST = await getHandler();
    const request = new NextRequest('http://localhost:3000/api/reviews/submit', {
      method: 'POST',
      headers: SAME_ORIGIN_HEADERS,
      body: 'not json {{{',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  // ── Token verification errors ───────────────────────────────────────────────

  it('returns 410 when the token is EXPIRED', async () => {
    const { ReviewTokenError } = await import('@/lib/review-links');
    verifyReviewTokenMock.mockImplementation(() => {
      throw new ReviewTokenError('expired', 'EXPIRED');
    });

    const POST = await getHandler();
    const response = await POST(makeRequest({ ...validBody, token: 'h.p.s' }));
    expect(response.status).toBe(410);
    expect(deliverReviewMock).not.toHaveBeenCalled();
  });

  it('returns 401 when the token signature is invalid', async () => {
    const { ReviewTokenError } = await import('@/lib/review-links');
    verifyReviewTokenMock.mockImplementation(() => {
      throw new ReviewTokenError('bad sig', 'INVALID_SIGNATURE');
    });

    const POST = await getHandler();
    const response = await POST(makeRequest({ ...validBody, token: 'h.p.s' }));
    expect(response.status).toBe(401);
  });

  it('returns 403 when the feature is disabled', async () => {
    const { ReviewTokenError } = await import('@/lib/review-links');
    verifyReviewTokenMock.mockImplementation(() => {
      throw new ReviewTokenError('disabled', 'DISABLED');
    });

    const POST = await getHandler();
    const response = await POST(makeRequest({ ...validBody, token: 'h.p.s' }));
    expect(response.status).toBe(403);
  });

  // ── Delivery failures ───────────────────────────────────────────────────────

  it('returns 500 when deliverReview throws', async () => {
    deliverReviewMock.mockRejectedValue(new Error('SMTP error'));

    const POST = await getHandler();
    const response = await POST(makeRequest({ ...validBody, token: 'h.p.s' }));
    expect(response.status).toBe(500);
  });
});
