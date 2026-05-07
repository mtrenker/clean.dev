// @vitest-environment node
/**
 * Integration tests for CockpitWsServer.
 *
 * Each test spins up a real HTTP server (port assigned by OS) with a mock
 * ICockpitRepository, connects a ws WebSocket client, and asserts on the
 * round-trip protocol flow:
 *
 *   connect → server_hello
 *   client_hello
 *   event_batch → event_batch_ack   (first send: accepted)
 *   event_batch → event_batch_ack   (retry:      all duplicates)
 */

import { createServer } from 'node:http';
import type { Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WebSocket from 'ws';
import { cockpitProtocolSchemaVersion } from '@cleandev/cockpit-protocol';
import type { CockpitServerMessage, EventBatchAck } from '@cleandev/cockpit-protocol';
import type { ICockpitRepository } from '@cleandev/cockpit-store';
import { CockpitWsServer, extractBearerToken, hashToken } from './cockpit-ws';

// ── Constants ──────────────────────────────────────────────────────────────────

const RAW_TOKEN = 'test-bearer-token-12345';
const TOKEN_HASH = hashToken(RAW_TOKEN);
const DEVICE_ID = 'device-abc-123';
const TOKEN_ID = 'token-xyz-456';
const SESSION_ID = 'session-001';

// ── Mock helpers ───────────────────────────────────────────────────────────────

function makeTokenRecord() {
  return {
    tokenId: TOKEN_ID,
    deviceId: DEVICE_ID,
    tokenHash: TOKEN_HASH,
    tokenLabel: null as string | null,
    issuedAt: new Date(),
    expiresAt: null as Date | null,
    revokedAt: null as Date | null,
    revokedReason: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeSessionRecord() {
  return {
    sessionId: SESSION_ID,
    deviceId: DEVICE_ID,
    tokenId: TOKEN_ID,
    connectionId: null as string | null,
    instanceName: 'test' as string | null,
    lastAckedSequence: 0,
    startedAt: new Date(),
    lastSeenAt: new Date(),
    endedAt: null as Date | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Creates a mock ICockpitRepository.
 *
 * insertEventBatch behaviour (stateful):
 *   - 1st call → all events accepted (acceptedCount = events.length, duplicateCount = 0)
 *   - 2nd+ call → all events duplicate (acceptedCount = 0, duplicateCount = events.length)
 *
 * This mirrors the actual Postgres implementation that uses ON CONFLICT DO NOTHING.
 */
function makeMockRepo(): {
  repo: ICockpitRepository;
  mocks: {
    findActiveTokenByHash: ReturnType<typeof vi.fn>;
    createSession: ReturnType<typeof vi.fn>;
    touchSession: ReturnType<typeof vi.fn>;
    insertEventBatch: ReturnType<typeof vi.fn>;
  };
} {
  let insertCallCount = 0;

  const mocks = {
    findActiveTokenByHash: vi.fn().mockResolvedValue(makeTokenRecord()),
    createSession: vi.fn().mockResolvedValue(makeSessionRecord()),
    touchSession: vi.fn().mockResolvedValue(makeSessionRecord()),
    insertEventBatch: vi.fn().mockImplementation(async (input: { batchId: string; sentAt: string; events: Array<{ sequence: number }> }) => {
      insertCallCount++;
      const maxSeq = Math.max(...input.events.map((e) => e.sequence));
      const first = insertCallCount === 1;
      return {
        batchId: input.batchId,
        ackedThroughSequence: maxSeq,
        acceptedCount: first ? input.events.length : 0,
        duplicateCount: first ? 0 : input.events.length,
        rejected: [],
        serverTime: new Date().toISOString(),
      } satisfies EventBatchAck;
    }),
  };

  const repo: ICockpitRepository = {
    findActiveTokenByHash: mocks.findActiveTokenByHash,
    createSession: mocks.createSession,
    touchSession: mocks.touchSession,
    insertEventBatch: mocks.insertEventBatch,
    // No-op stubs for methods not under test
    createProject: vi.fn().mockResolvedValue({}),
    listProjects: vi.fn().mockResolvedValue([]),
    createDevice: vi.fn().mockResolvedValue({ device: {}, token: null }),
    listDevices: vi.fn().mockResolvedValue([]),
    revokeDevice: vi.fn().mockResolvedValue({}),
    markProjectDirty: vi.fn().mockResolvedValue({}),
    getProjectedProjectState: vi.fn().mockResolvedValue(null),
    upsertProjectedProjectState: vi.fn().mockResolvedValue({}),
    pruneRawEvents: vi.fn().mockResolvedValue({ deletedEventCount: 0, projectsAffected: [], pruneRun: {} }),
  } as unknown as ICockpitRepository;

  return { repo, mocks };
}

/** Returns a minimal valid event_batch client message. */
function makeEventBatchMsg(batchId = 'batch-001') {
  return {
    type: 'event_batch' as const,
    schemaVersion: cockpitProtocolSchemaVersion,
    payload: {
      batchId,
      sentAt: new Date().toISOString(),
      events: [
        {
          schemaVersion: cockpitProtocolSchemaVersion,
          eventId: `evt-${batchId}`,
          sequence: 1,
          occurredAt: new Date().toISOString(),
          source: 'live' as const,
          projectId: 'proj-001',
          deviceId: DEVICE_ID,
          type: 'project_heartbeat' as const,
          payload: {
            daemonVersion: '1.0.0',
            activePlanId: null,
            activeTaskCount: 0,
          },
        },
      ],
    },
  };
}

/** Returns a valid client_hello message. */
function makeClientHello(deviceId = DEVICE_ID) {
  return {
    type: 'client_hello' as const,
    schemaVersion: cockpitProtocolSchemaVersion,
    sessionId: SESSION_ID,
    deviceId,
    deviceName: 'Test Device',
    instanceName: 'test-instance',
    lastAckedSequence: 0,
  };
}

// ── WebSocket client helpers ───────────────────────────────────────────────────

interface WsClient {
  ws: WebSocket;
  /** Returns the next message (from queue if already arrived, otherwise waits). */
  nextMsg: () => Promise<CockpitServerMessage>;
  /** Sends a message and awaits the next reply. */
  send: (msg: unknown) => Promise<CockpitServerMessage>;
}

/**
 * Opens a WebSocket connection using the proven queue pattern.
 *
 * The message listener is registered BEFORE awaiting 'open' so that messages
 * delivered in the same I/O tick as the HTTP 101 handshake (e.g. server_hello)
 * are captured in the queue and not lost.
 */
function openWs(port: number, token: string = RAW_TOKEN): Promise<WsClient> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/api/cockpit/ws`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Message queue — populated by the 'message' handler registered BEFORE 'open'.
    const queue: CockpitServerMessage[] = [];
    // Callers waiting for the next message (in arrival order).
    const waiters: Array<(msg: CockpitServerMessage) => void> = [];

    ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString()) as CockpitServerMessage;
      const waiter = waiters.shift();
      if (waiter) {
        waiter(msg);
      } else {
        queue.push(msg);
      }
    });

    function nextMsg(): Promise<CockpitServerMessage> {
      const queued = queue.shift();
      if (queued !== undefined) {
        return Promise.resolve(queued);
      }
      return new Promise<CockpitServerMessage>((res) => {
        waiters.push(res);
      });
    }

    function send(msg: unknown): Promise<CockpitServerMessage> {
      ws.send(JSON.stringify(msg));
      return nextMsg();
    }

    ws.once('open', () => resolve({ ws, nextMsg, send }));
    ws.once('error', reject);
  });
}

/** Short delay helper. */
const tick = (ms = 50) => new Promise<void>((r) => setTimeout(r, ms));

// ── Test fixtures ──────────────────────────────────────────────────────────────

let httpServer: HttpServer;
let wsServer: CockpitWsServer;
let repo: ICockpitRepository;
let mocks: ReturnType<typeof makeMockRepo>['mocks'];
let port: number;

beforeEach(async () => {
  const result = makeMockRepo();
  repo = result.repo;
  mocks = result.mocks;

  httpServer = createServer();
  wsServer = new CockpitWsServer(httpServer, repo);

  await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  port = (httpServer.address() as AddressInfo).port;
});

afterEach(async () => {
  await wsServer.close();
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
});

// ── Unit tests: pure helper functions ──────────────────────────────────────────

describe('hashToken', () => {
  it('returns a 64-character hex string', () => {
    expect(hashToken('any-token')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic', () => {
    expect(hashToken('same')).toBe(hashToken('same'));
  });

  it('produces different values for different inputs', () => {
    expect(hashToken('a')).not.toBe(hashToken('b'));
  });
});

describe('extractBearerToken', () => {
  function nodeReq(authHeader?: string) {
    return {
      headers: authHeader ? { authorization: authHeader } : {},
    } as unknown as import('http').IncomingMessage;
  }

  it('extracts token from a valid header', () => {
    expect(extractBearerToken(nodeReq('Bearer my-secret'))).toBe('my-secret');
  });

  it('returns null when header is absent', () => {
    expect(extractBearerToken(nodeReq())).toBeNull();
  });

  it('returns null for non-Bearer scheme', () => {
    expect(extractBearerToken(nodeReq('Basic dXNlcjpwYXNz'))).toBeNull();
  });

  it('returns null for "Bearer " with no token', () => {
    expect(extractBearerToken(nodeReq('Bearer '))).toBeNull();
  });

  it('trims surrounding whitespace from the token', () => {
    expect(extractBearerToken(nodeReq('Bearer   trimmed   '))).toBe('trimmed');
  });
});

// ── Integration: authentication ────────────────────────────────────────────────

describe('CockpitWsServer – authentication', () => {
  it('rejects upgrade without Authorization header', async () => {
    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}/api/cockpit/ws`);
      ws.once('unexpected-response', (_req, res) => {
        expect(res.statusCode).toBe(401);
        resolve();
      });
      ws.once('error', () => resolve()); // some clients raise error instead
    });
  });

  it('rejects upgrade when token is not found in DB', async () => {
    mocks.findActiveTokenByHash.mockResolvedValueOnce(null);

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}/api/cockpit/ws`, {
        headers: { Authorization: 'Bearer bogus-token' },
      });
      ws.once('unexpected-response', (_req, res) => {
        expect(res.statusCode).toBe(401);
        resolve();
      });
      ws.once('error', () => resolve());
    });
  });

  it('sends server_hello immediately after successful auth', async () => {
    const { ws, nextMsg } = await openWs(port);
    try {
      const msg = await nextMsg();
      expect(msg.type).toBe('server_hello');
      if (msg.type === 'server_hello') {
        expect(msg.schemaVersion).toBe(cockpitProtocolSchemaVersion);
        expect(typeof msg.connectionId).toBe('string');
        expect(msg.heartbeatIntervalMs).toBeGreaterThan(0);
      }
    } finally {
      ws.close();
    }
  });

  it('looks up the token by its SHA-256 hash', async () => {
    const { ws, nextMsg } = await openWs(port, RAW_TOKEN);
    try {
      await nextMsg(); // server_hello
      expect(mocks.findActiveTokenByHash).toHaveBeenCalledWith(TOKEN_HASH);
    } finally {
      ws.close();
    }
  });
});

// ── Integration: client_hello ──────────────────────────────────────────────────

describe('CockpitWsServer – client_hello', () => {
  it('creates a session for a matching deviceId', async () => {
    const { ws, nextMsg } = await openWs(port);
    try {
      await nextMsg(); // server_hello
      ws.send(JSON.stringify(makeClientHello()));
      await tick(); // wait for async createSession
      expect(mocks.createSession).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId: SESSION_ID, deviceId: DEVICE_ID }),
      );
    } finally {
      ws.close();
    }
  });

  it('sends server_error and closes when deviceId mismatches the token', async () => {
    const { ws, nextMsg, send } = await openWs(port);
    try {
      await nextMsg(); // server_hello
      const reply = await send(makeClientHello('wrong-device'));
      expect(reply.type).toBe('server_error');
      if (reply.type === 'server_error') {
        expect(reply.code).toBe('unauthorized');
      }
    } finally {
      ws.close();
    }
  });
});

// ── Integration: event_batch ingestion ────────────────────────────────────────

describe('CockpitWsServer – event_batch', () => {
  /** Opens connection and completes the handshake (server_hello + client_hello). */
  async function authenticatedWs() {
    const client = await openWs(port);
    await client.nextMsg(); // server_hello
    client.ws.send(JSON.stringify(makeClientHello()));
    await tick();
    return client;
  }

  it('returns event_batch_ack with acceptedCount=1 for a new batch', async () => {
    const { ws, send } = await authenticatedWs();
    try {
      const reply = await send(makeEventBatchMsg('batch-new'));
      expect(reply.type).toBe('event_batch_ack');
      if (reply.type === 'event_batch_ack') {
        expect(reply.payload.batchId).toBe('batch-new');
        expect(reply.payload.acceptedCount).toBe(1);
        expect(reply.payload.duplicateCount).toBe(0);
        expect(reply.payload.ackedThroughSequence).toBe(1);
      }
    } finally {
      ws.close();
    }
  });

  it('stores events exactly once (idempotency): second send returns duplicateCount=1', async () => {
    const { ws, send } = await authenticatedWs();
    try {
      const batch = makeEventBatchMsg('batch-retry');

      // First send → accepted
      const first = await send(batch);
      expect(first.type).toBe('event_batch_ack');
      if (first.type === 'event_batch_ack') {
        expect(first.payload.acceptedCount).toBe(1);
        expect(first.payload.duplicateCount).toBe(0);
      }

      // Retry (same message) → duplicates reported, events NOT re-inserted
      const retry = await send(batch);
      expect(retry.type).toBe('event_batch_ack');
      if (retry.type === 'event_batch_ack') {
        expect(retry.payload.acceptedCount).toBe(0);
        expect(retry.payload.duplicateCount).toBe(1);
      }

      // Repository was called twice (idempotency enforced by DB ON CONFLICT DO NOTHING)
      expect(mocks.insertEventBatch).toHaveBeenCalledTimes(2);
    } finally {
      ws.close();
    }
  });

  it('touches the session with the latest acked sequence after each batch', async () => {
    const { ws, send } = await authenticatedWs();
    try {
      await send(makeEventBatchMsg('batch-touch'));
      await tick();
      expect(mocks.touchSession).toHaveBeenCalledWith(SESSION_ID, 1);
    } finally {
      ws.close();
    }
  });

  it('sends retryable server_error when insertEventBatch throws', async () => {
    mocks.insertEventBatch.mockRejectedValueOnce(new Error('DB unavailable'));

    const { ws, send } = await authenticatedWs();
    try {
      const reply = await send(makeEventBatchMsg('batch-fail'));
      expect(reply.type).toBe('server_error');
      if (reply.type === 'server_error') {
        expect(reply.code).toBe('internal_error');
        expect(reply.retryable).toBe(true);
      }
    } finally {
      ws.close();
    }
  });

  it('sends server_error (not retryable) for invalid batch schema – no storage attempted', async () => {
    const { ws, send } = await authenticatedWs();
    try {
      const invalid = {
        type: 'event_batch',
        schemaVersion: cockpitProtocolSchemaVersion,
        payload: { /* missing batchId, sentAt, events */ },
      };
      const reply = await send(invalid);
      expect(reply.type).toBe('server_error');
      if (reply.type === 'server_error') {
        expect(reply.code).toBe('invalid_message');
        expect(reply.retryable).toBe(false);
      }
      // Nothing should have been stored
      expect(mocks.insertEventBatch).not.toHaveBeenCalled();
    } finally {
      ws.close();
    }
  });
});

// ── Integration: connection lifecycle ─────────────────────────────────────────

describe('CockpitWsServer – connection management', () => {
  it('tracks connectionCount as clients connect and disconnect', async () => {
    expect(wsServer.connectionCount).toBe(0);

    const client1 = await openWs(port);
    await client1.nextMsg(); // server_hello
    expect(wsServer.connectionCount).toBe(1);

    const client2 = await openWs(port);
    await client2.nextMsg(); // server_hello
    expect(wsServer.connectionCount).toBe(2);

    client1.ws.close();
    await tick();
    expect(wsServer.connectionCount).toBe(1);

    client2.ws.close();
    await tick();
    expect(wsServer.connectionCount).toBe(0);
  });

  it('sends server_error for malformed JSON without closing the connection', async () => {
    const { ws, nextMsg } = await openWs(port);
    try {
      await nextMsg(); // server_hello

      ws.send('{ not: valid json }');
      const reply = await nextMsg();

      expect(reply.type).toBe('server_error');
      if (reply.type === 'server_error') {
        expect(reply.code).toBe('invalid_message');
      }
      // Connection is still open
      expect(ws.readyState).toBe(WebSocket.OPEN);
    } finally {
      ws.close();
    }
  });
});
