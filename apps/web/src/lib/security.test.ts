import { describe, expect, it } from 'vitest';
import {
  escapeHtml,
  isSafeCallbackUrl,
  isRequestFromSameOrigin,
  isTokenSizeValid,
  MAX_TOKEN_BYTES,
  sanitizeCallbackUrl,
} from './security';

// ── isSafeCallbackUrl ─────────────────────────────────────────────────────────

describe('isSafeCallbackUrl', () => {
  it('accepts a simple relative path', () => {
    expect(isSafeCallbackUrl('/reviews/some-token')).toBe(true);
  });

  it('accepts a path with query parameters', () => {
    expect(isSafeCallbackUrl('/reviews?foo=bar')).toBe(true);
  });

  it('accepts a path with a hash fragment', () => {
    expect(isSafeCallbackUrl('/page#section')).toBe(true);
  });

  it('accepts the root path', () => {
    expect(isSafeCallbackUrl('/')).toBe(true);
  });

  it('rejects an absolute http URL', () => {
    expect(isSafeCallbackUrl('http://evil.com/steal')).toBe(false);
  });

  it('rejects an absolute https URL', () => {
    expect(isSafeCallbackUrl('https://evil.com')).toBe(false);
  });

  it('rejects a protocol-relative URL (//evil.com)', () => {
    expect(isSafeCallbackUrl('//evil.com/steal')).toBe(false);
  });

  it('rejects a Windows UNC bypass (/\\evil)', () => {
    expect(isSafeCallbackUrl('/\\evil.com')).toBe(false);
  });

  it('rejects a javascript: scheme', () => {
    expect(isSafeCallbackUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejects a path containing a line feed', () => {
    expect(isSafeCallbackUrl('/valid\nX-Header: injected')).toBe(false);
  });

  it('rejects a path containing a carriage return', () => {
    expect(isSafeCallbackUrl('/valid\rX-Header: injected')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isSafeCallbackUrl('')).toBe(false);
  });

  it('rejects a bare hostname without leading slash', () => {
    expect(isSafeCallbackUrl('evil.com')).toBe(false);
  });
});

// ── sanitizeCallbackUrl ───────────────────────────────────────────────────────

describe('sanitizeCallbackUrl', () => {
  it('returns the URL unchanged when it is safe', () => {
    expect(sanitizeCallbackUrl('/reviews/token')).toBe('/reviews/token');
  });

  it('returns "/" for an unsafe absolute URL', () => {
    expect(sanitizeCallbackUrl('https://evil.com')).toBe('/');
  });

  it('returns "/" for a protocol-relative URL', () => {
    expect(sanitizeCallbackUrl('//evil.com')).toBe('/');
  });

  it('returns "/" for an empty string', () => {
    expect(sanitizeCallbackUrl('')).toBe('/');
  });

  it('returns the custom fallback when supplied and URL is unsafe', () => {
    expect(sanitizeCallbackUrl('http://evil.com', '/home')).toBe('/home');
  });

  it('does not use custom fallback when URL is safe', () => {
    expect(sanitizeCallbackUrl('/safe', '/home')).toBe('/safe');
  });
});

// ── isRequestFromSameOrigin ───────────────────────────────────────────────────

describe('isRequestFromSameOrigin', () => {
  function makeRequest(headers: Record<string, string>): Request {
    return new Request('http://localhost/api/reviews/submit', {
      method: 'POST',
      headers,
    });
  }

  it('returns true when Origin matches Host in development', () => {
    const req = makeRequest({
      origin: 'http://localhost:3000',
      host: 'localhost:3000',
    });
    expect(isRequestFromSameOrigin(req)).toBe(true);
  });

  it('returns true when Origin matches X-Forwarded-Host with https scheme', () => {
    const req = makeRequest({
      origin: 'https://app.example.com',
      host: 'app.example.com',
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'app.example.com',
    });
    expect(isRequestFromSameOrigin(req)).toBe(true);
  });

  it('returns false when Origin does not match Host', () => {
    const req = makeRequest({
      origin: 'https://evil.com',
      host: 'app.example.com',
      'x-forwarded-proto': 'https',
    });
    expect(isRequestFromSameOrigin(req)).toBe(false);
  });

  it('returns false when the Origin header is absent', () => {
    const req = makeRequest({ host: 'localhost:3000' });
    expect(isRequestFromSameOrigin(req)).toBe(false);
  });

  it('returns false when the Host header is absent', () => {
    const req = makeRequest({ origin: 'http://localhost:3000' });
    expect(isRequestFromSameOrigin(req)).toBe(false);
  });

  it('returns false when Origin is an invalid URL', () => {
    const req = makeRequest({
      origin: 'not-a-url',
      host: 'localhost:3000',
    });
    expect(isRequestFromSameOrigin(req)).toBe(false);
  });

  it('uses production https scheme when NODE_ENV is production and no X-Forwarded-Proto', () => {
    const original = process.env.NODE_ENV;
    // @ts-expect-error – override read-only env for this test
    process.env.NODE_ENV = 'production';
    const req = makeRequest({
      origin: 'https://app.example.com',
      host: 'app.example.com',
    });
    const result = isRequestFromSameOrigin(req);
    // @ts-expect-error – restore
    process.env.NODE_ENV = original;
    expect(result).toBe(true);
  });
});

// ── isTokenSizeValid ──────────────────────────────────────────────────────────

describe('isTokenSizeValid', () => {
  it('returns true for a normal-length token', () => {
    const token = 'header.payload.signature';
    expect(isTokenSizeValid(token)).toBe(true);
  });

  it('returns true for a token exactly at the limit', () => {
    const token = 'a'.repeat(MAX_TOKEN_BYTES);
    expect(isTokenSizeValid(token)).toBe(true);
  });

  it('returns false for a token one byte over the limit', () => {
    const token = 'a'.repeat(MAX_TOKEN_BYTES + 1);
    expect(isTokenSizeValid(token)).toBe(false);
  });

  it('returns false for a very large token', () => {
    const token = 'x'.repeat(100_000);
    expect(isTokenSizeValid(token)).toBe(false);
  });
});

// ── escapeHtml ────────────────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than signs', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes greater-than signs', () => {
    expect(escapeHtml('3 > 2')).toBe('3 &gt; 2');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#x27;s');
  });

  it('escapes a full XSS payload', () => {
    const payload = '<img src=x onerror="alert(\'XSS\')">';
    const escaped = escapeHtml(payload);
    expect(escaped).not.toContain('<img');
    expect(escaped).not.toContain('>');
    expect(escaped).toContain('&lt;img');
    expect(escaped).toContain('&gt;');
    expect(escaped).toContain('&quot;');
    expect(escaped).toContain('&#x27;');
  });

  it('leaves safe text unchanged', () => {
    expect(escapeHtml('Hello, World!')).toBe('Hello, World!');
  });
});

