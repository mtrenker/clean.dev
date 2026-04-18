/**
 * Tests for the structured logger module.
 *
 * These tests verify:
 *  - JSON output format and required fields
 *  - Output suppression in test environments
 *  - Timer utility accuracy
 *  - All well-known event-name constants are defined strings
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  log,
  logger,
  startTimer,
  // Well-known event names
  EVT_INVITE_OPENED,
  EVT_INVITE_INVALID,
  EVT_SUBMIT_CSRF_REJECTED,
  EVT_SUBMIT_IP_RATE_LIMITED,
  EVT_SUBMIT_TOKEN_REPLAYED,
  EVT_SUBMIT_TOKEN_TOO_LARGE,
  EVT_SUBMIT_VALIDATION_FAIL,
  EVT_SUBMIT_TOKEN_INVALID,
  EVT_SUBMIT_LINKEDIN_ENRICHED,
  EVT_SUBMIT_DELIVERED,
  EVT_SUBMIT_DELIVERY_FAILED,
  EVT_LINKEDIN_AUTH_SUCCESS,
  EVT_LINKEDIN_AUTH_DENIED,
} from './logger';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse the last JSON line written to console.log or console.error. */
function lastParsedLog(spy: ReturnType<typeof vi.spyOn>): Record<string, unknown> {
  const lastCall = spy.mock.calls[spy.mock.calls.length - 1];
  if (!lastCall) throw new Error('No log calls recorded');
  return JSON.parse(lastCall[0] as string) as Record<string, unknown>;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('logger – output suppression', () => {
  it('does not emit in test env when LOG_IN_TESTS is unset', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    // NODE_ENV is 'test' by default in vitest; LOG_IN_TESTS is not set.
    log('info', { event: 'test.event' });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('emits when LOG_IN_TESTS=true', () => {
    const original = process.env.LOG_IN_TESTS;
    process.env.LOG_IN_TESTS = 'true';
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    log('info', { event: 'test.visible' });

    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
    if (original === undefined) {
      delete process.env.LOG_IN_TESTS;
    } else {
      process.env.LOG_IN_TESTS = original;
    }
  });
});

describe('logger – JSON structure', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.LOG_IN_TESTS = 'true';
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    consoleErrSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    delete process.env.LOG_IN_TESTS;
    consoleSpy.mockRestore();
    consoleErrSpy.mockRestore();
  });

  it('info entries go to console.log with required fields', () => {
    const before = Date.now();
    log('info', { event: 'review.test.info', project_slug: 'proj-a' });
    const after = Date.now();

    const entry = lastParsedLog(consoleSpy);

    expect(entry.level).toBe('info');
    expect(entry.event).toBe('review.test.info');
    expect(entry.project_slug).toBe('proj-a');
    expect(typeof entry.ts).toBe('string');
    // ts is a valid ISO timestamp within our test window
    const ts = new Date(entry.ts as string).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('debug entries go to console.log', () => {
    log('debug', { event: 'review.test.debug' });
    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleErrSpy).not.toHaveBeenCalled();
  });

  it('warn entries go to console.error', () => {
    log('warn', { event: 'review.test.warn' });
    expect(consoleErrSpy).toHaveBeenCalledOnce();
    expect(consoleSpy).not.toHaveBeenCalled();
    const entry = lastParsedLog(consoleErrSpy);
    expect(entry.level).toBe('warn');
  });

  it('error entries go to console.error', () => {
    log('error', { event: 'review.test.error', error: 'boom' });
    expect(consoleErrSpy).toHaveBeenCalledOnce();
    const entry = lastParsedLog(consoleErrSpy);
    expect(entry.level).toBe('error');
    expect(entry.error).toBe('boom');
  });

  it('extra context fields are preserved', () => {
    log('info', {
      event:        'review.submit.delivered',
      project_slug: 'slug-xyz',
      duration_ms:  42,
      has_linkedin: true,
      relationship: 'client',
    });
    const entry = lastParsedLog(consoleSpy);
    expect(entry.project_slug).toBe('slug-xyz');
    expect(entry.duration_ms).toBe(42);
    expect(entry.has_linkedin).toBe(true);
    expect(entry.relationship).toBe('client');
  });

  it('logger convenience wrappers proxy to log()', () => {
    logger.info({ event: 'review.test.via.info' });
    expect(lastParsedLog(consoleSpy).level).toBe('info');
    consoleSpy.mockClear();

    logger.warn({ event: 'review.test.via.warn' });
    expect(lastParsedLog(consoleErrSpy).level).toBe('warn');
    consoleErrSpy.mockClear();

    logger.error({ event: 'review.test.via.error' });
    expect(lastParsedLog(consoleErrSpy).level).toBe('error');
  });
});

describe('startTimer', () => {
  it('returns 0 or more ms elapsed', async () => {
    const elapsed = startTimer();
    // Tiny async tick
    await new Promise((r) => setTimeout(r, 5));
    const ms = elapsed();
    expect(ms).toBeGreaterThanOrEqual(0);
  });

  it('increases over time', async () => {
    const elapsed = startTimer();
    await new Promise((r) => setTimeout(r, 10));
    const first = elapsed();
    await new Promise((r) => setTimeout(r, 10));
    const second = elapsed();
    expect(second).toBeGreaterThan(first);
  });
});

describe('well-known event name constants', () => {
  const events = [
    EVT_INVITE_OPENED,
    EVT_INVITE_INVALID,
    EVT_SUBMIT_CSRF_REJECTED,
    EVT_SUBMIT_IP_RATE_LIMITED,
    EVT_SUBMIT_TOKEN_REPLAYED,
    EVT_SUBMIT_TOKEN_TOO_LARGE,
    EVT_SUBMIT_VALIDATION_FAIL,
    EVT_SUBMIT_TOKEN_INVALID,
    EVT_SUBMIT_LINKEDIN_ENRICHED,
    EVT_SUBMIT_DELIVERED,
    EVT_SUBMIT_DELIVERY_FAILED,
    EVT_LINKEDIN_AUTH_SUCCESS,
    EVT_LINKEDIN_AUTH_DENIED,
  ];

  it('all constants are non-empty strings', () => {
    for (const evt of events) {
      expect(typeof evt).toBe('string');
      expect(evt.length).toBeGreaterThan(0);
    }
  });

  it('all constants follow the domain.noun.verb convention', () => {
    for (const evt of events) {
      expect(evt).toMatch(/^[a-z]+(\.[a-z_]+){1,3}$/);
    }
  });

  it('all constants are unique', () => {
    const set = new Set(events);
    expect(set.size).toBe(events.length);
  });
});
