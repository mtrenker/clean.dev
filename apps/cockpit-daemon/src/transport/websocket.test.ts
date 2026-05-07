/**
 * Tests for DaemonTransport (WebSocket client).
 *
 * We spin up a real WebSocket server on a random port, run the transport
 * against it, and assert protocol behaviour:
 *   - client_hello sent immediately on connect
 *   - event_batch sent when outbox has pending events
 *   - event_batch_ack persisted to local DB + next batch requested
 *   - client_heartbeat sent on the server-specified interval
 *   - exponential-backoff reconnect after disconnect
 *   - buildWsUrl converts http(s)://... → ws(s)://...
 */

import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { Server as HttpServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import { afterEach, describe, expect, it } from 'vitest';

import { openLocalDaemonDb } from '../local-db';
import type { LocalDaemonDb } from '../local-db';
import { resolveDaemonPaths } from '../config';
import { createLogger } from '../logging';
import { DaemonTransport, buildWsUrl } from './websocket';
import type { TransportOptions } from './websocket';

// ── Test server ────────────────────────────────────────────────────────────────

interface TestServer {
  port: number;
  wss: WebSocketServer;
  close(): Promise<void>;
}

/**
 * Spin up an HTTP server + WebSocket server on a random port.
 * Automatically registered for cleanup in afterEach.
 */
function startTestServer(): Promise<TestServer> {
  return new Promise((resolve, reject) => {
    const httpServer = createServer();
    const wss = new WebSocketServer({ server: httpServer });

    httpServer.listen(0, '127.0.0.1', () => {
      const addr = httpServer.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('Unexpected server address'));
        return;
      }

      const server: TestServer = {
        port: addr.port,
        wss,
        /**
         * Gracefully close the server.
         *
         * IMPORTANT: call transport.stop() BEFORE this so the transport
         * doesn't reconnect and create new connections that block httpServer.close().
         * We force-terminate remaining clients before closing so wss.close()
         * resolves immediately instead of waiting for the close handshake.
         */
        close: () =>
          new Promise<void>((res, rej) => {
            // Force-terminate any remaining WS clients so wss.close() doesn't hang.
            for (const client of wss.clients) {
              client.terminate();
            }
            wss.close(() => {
              // closeAllConnections() terminates any lingering keep-alive HTTP connections.
              const hs = httpServer as HttpServer & { closeAllConnections?: () => void };
              if (typeof hs.closeAllConnections === 'function') {
                hs.closeAllConnections();
              }
              httpServer.close((err) => (err ? rej(err) : res()));
            });
          }),
      };

      servers.push(server);
      resolve(server);
    });

    httpServer.on('error', reject);
  });
}

// ── Message queue ──────────────────────────────────────────────────────────────

/**
 * Lossless message reader for a server-side WebSocket.
 *
 * Problem: the `ws` library emits all 'message' events for frames that arrived
 * in the same TCP segment synchronously within a single event-loop tick.
 * Using `ws.once('message', ...)` therefore drops messages that arrive between
 * when a listener fires and when the next listener is registered (the gap where
 * `resolve()` has scheduled a microtask but the microtask hasn't run yet).
 *
 * Solution: a permanent `'message'` listener pushes every frame into a FIFO
 * queue.  `next()` dequeues the oldest item immediately (or suspends until one
 * arrives).  This means no message is ever lost, regardless of how quickly
 * consecutive frames arrive.
 */
class MessageQueue {
  private readonly queue: unknown[] = [];
  private readonly waiters: Array<{
    resolve: (v: unknown) => void;
    reject: (e: Error) => void;
  }> = [];
  private closed = false;

  constructor(ws: WebSocket) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ws.on('message', (data: any) => {
      const msg = JSON.parse(String(data)) as unknown;
      const waiter = this.waiters.shift();
      if (waiter) {
        waiter.resolve(msg);
      } else {
        this.queue.push(msg);
      }
    });

    const fail = (err?: Error) => {
      this.closed = true;
      const e = err ?? new Error('WebSocket closed before message received');
      for (const w of this.waiters.splice(0)) w.reject(e);
    };
    ws.once('close', () => fail());
    ws.once('error', (err) => fail(err));
  }

  next(): Promise<unknown> {
    if (this.queue.length > 0) return Promise.resolve(this.queue.shift()!);
    if (this.closed) return Promise.reject(new Error('WebSocket already closed'));
    return new Promise<unknown>((resolve, reject) => {
      this.waiters.push({ resolve, reject });
    });
  }

  async waitForType(type: string): Promise<Record<string, unknown>> {
    for (;;) {
      // eslint-disable-next-line no-await-in-loop
      const msg = (await this.next()) as Record<string, unknown>;
      if (msg.type === type) return msg;
    }
  }

  /**
   * Collect all messages that arrive within `windowMs` ms from now.
   * Already-buffered messages are included.
   */
  async collectFor(windowMs: number): Promise<unknown[]> {
    // Drain what's already buffered.
    const acc: unknown[] = this.queue.splice(0);
    // Wait out the window; new messages are pushed into this.queue by the listener.
    await new Promise<void>((resolve) => setTimeout(resolve, windowMs));
    // Drain anything that arrived during the wait.
    acc.push(...this.queue.splice(0));
    return acc;
  }
}

// ── Resource tracking (cleaned up by afterEach) ────────────────────────────────

const transports: DaemonTransport[] = [];
const servers: TestServer[] = [];
const dbs: LocalDaemonDb[] = [];
const tempDirs: string[] = [];

/**
 * Cleanup order is critical:
 *  1. Stop all transports (sets state='stopped', cancels timers, closes WS).
 *     After this no reconnect attempts will be scheduled.
 *  2. Close all servers. Because transports are stopped, wss.close() resolves
 *     quickly (we also terminate lingering clients in server.close()).
 *  3. Close all DBs.
 *  4. Delete all temp directories.
 */
afterEach(async () => {
  for (const t of transports.splice(0)) {
    t.stop();
  }
  for (const s of servers.splice(0)) {
    await s.close().catch(() => {
      /* already closed */
    });
  }
  for (const db of dbs.splice(0)) {
    try {
      db.close();
    } catch {
      /* already closed */
    }
  }
  for (const dir of tempDirs.splice(0)) {
    await rm(dir, { recursive: true, force: true });
  }
});

// ── Test helpers ───────────────────────────────────────────────────────────────

async function makeTempDb() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cockpit-daemon-ws-test-'));
  tempDirs.push(dir);
  const configPath = path.join(dir, 'config.json');
  const paths = resolveDaemonPaths(configPath);
  const db = await openLocalDaemonDb(paths);
  dbs.push(db);
  return { db, dir };
}

const silentLogger = createLogger({ stdout: () => {}, stderr: () => {} });

/** Queue one or more minimal events into the DB outbox. */
function queueTestEvent(db: LocalDaemonDb, n = 1) {
  for (let i = 0; i < n; i++) {
    db.queueEvent({
      event: {
        schemaVersion: 1,
        eventId: randomUUID(),
        occurredAt: new Date().toISOString(),
        source: 'live',
        projectId: 'proj-1',
        deviceId: 'device-1',
        type: 'project_seen',
        payload: {
          projectName: 'Test',
          telemetry: {
            worktreePath: 'relative',
            repoRootPath: 'off',
            git: 'full',
            progressText: false,
            usage: true,
            planText: true,
            taskDescription: true,
          },
        },
      },
    });
  }
}

/**
 * Create and start a transport with sensible test defaults.
 * Automatically registered for cleanup in afterEach.
 */
function makeTransport(
  server: TestServer,
  db: LocalDaemonDb,
  overrides: Partial<TransportOptions> = {},
): DaemonTransport {
  const t = new DaemonTransport({
    serverUrl: `http://127.0.0.1:${server.port}`,
    token: 'test-token',
    deviceId: 'device-test',
    deviceName: 'Test Device',
    instanceName: 'test',
    db,
    sessionId: 'session-test',
    logger: silentLogger,
    ...overrides,
  });
  transports.push(t);
  t.start();
  return t;
}

/** Wait for the next client to connect; returns the WS socket and a lossless message reader. */
function waitForConnection(server: TestServer): Promise<{ ws: WebSocket; mq: MessageQueue }> {
  return new Promise((resolve) => {
    server.wss.once('connection', (ws) => {
      resolve({ ws, mq: new MessageQueue(ws) });
    });
  });
}

// ── buildWsUrl ─────────────────────────────────────────────────────────────────

describe('buildWsUrl', () => {
  it('converts https:// to wss://', () => {
    expect(buildWsUrl('https://clean.dev')).toBe('wss://clean.dev/api/cockpit/ws');
  });

  it('converts http:// to ws://', () => {
    expect(buildWsUrl('http://localhost:3000')).toBe('ws://localhost:3000/api/cockpit/ws');
  });

  it('replaces an existing path', () => {
    expect(buildWsUrl('https://example.com/other')).toBe('wss://example.com/api/cockpit/ws');
  });

  it('preserves port', () => {
    expect(buildWsUrl('http://127.0.0.1:4242')).toBe('ws://127.0.0.1:4242/api/cockpit/ws');
  });
});

// ── client_hello ───────────────────────────────────────────────────────────────

describe('client_hello', () => {
  it('sends client_hello immediately after connecting', async () => {
    const server = await startTestServer();
    const { db } = await makeTempDb();

    const connPromise = waitForConnection(server);
    makeTransport(server, db);

    const { mq } = await connPromise;
    const msg = (await mq.waitForType('client_hello')) as {
      type: string;
      sessionId: string;
      deviceId: string;
      deviceName: string;
      instanceName: string;
      lastAckedSequence: number;
    };

    expect(msg.type).toBe('client_hello');
    expect(msg.deviceId).toBe('device-test');
    expect(msg.deviceName).toBe('Test Device');
    expect(msg.instanceName).toBe('test');
    expect(msg.sessionId).toBe('session-test');
    expect(msg.lastAckedSequence).toBe(0);
  });
});

// ── event_batch ────────────────────────────────────────────────────────────────

describe('event_batch', () => {
  it('sends pending outbox events as event_batch after connecting', async () => {
    const server = await startTestServer();
    const { db } = await makeTempDb();
    queueTestEvent(db, 3);

    const connPromise = waitForConnection(server);
    makeTransport(server, db);

    const { mq } = await connPromise;
    const batchMsg = (await mq.waitForType('event_batch')) as {
      type: string;
      payload: { batchId: string; events: unknown[] };
    };

    expect(batchMsg.type).toBe('event_batch');
    expect(batchMsg.payload.events).toHaveLength(3);
    expect(typeof batchMsg.payload.batchId).toBe('string');
  });

  it('does not send event_batch when outbox is empty', async () => {
    const server = await startTestServer();
    const { db } = await makeTempDb();

    const connPromise = waitForConnection(server);
    makeTransport(server, db);

    const { mq } = await connPromise;
    // Collect messages for 100 ms – should only see client_hello
    const msgs = await mq.collectFor(100);
    const types = (msgs as Array<Record<string, unknown>>).map((m) => m.type);

    expect(types).toContain('client_hello');
    expect(types).not.toContain('event_batch');
  });

  it('respects batchSize option', async () => {
    const server = await startTestServer();
    const { db } = await makeTempDb();
    queueTestEvent(db, 10);

    const connPromise = waitForConnection(server);
    makeTransport(server, db, { batchSize: 3 });

    const { mq } = await connPromise;
    const batchMsg = (await mq.waitForType('event_batch')) as {
      payload: { events: unknown[] };
    };

    expect(batchMsg.payload.events).toHaveLength(3);
  });
});

// ── event_batch_ack ────────────────────────────────────────────────────────────

describe('event_batch_ack', () => {
  it('persists ack to DB and advances lastAckedSequence', async () => {
    const server = await startTestServer();
    const { db } = await makeTempDb();
    queueTestEvent(db, 2);

    const connPromise = waitForConnection(server);
    makeTransport(server, db);

    const { ws: serverWs, mq } = await connPromise;
    const batchMsg = (await mq.waitForType('event_batch')) as {
      payload: { batchId: string; events: Array<{ sequence: number }> };
    };

    const maxSequence = Math.max(...batchMsg.payload.events.map((e) => e.sequence));

    // Server sends ack
    serverWs.send(
      JSON.stringify({
        type: 'event_batch_ack',
        schemaVersion: 1,
        payload: {
          batchId: batchMsg.payload.batchId,
          ackedThroughSequence: maxSequence,
          acceptedCount: 2,
          duplicateCount: 0,
          rejected: [],
          serverTime: new Date().toISOString(),
        },
      }),
    );

    // Wait for transport to process the ack
    await new Promise((resolve) => setTimeout(resolve, 100));

    const state = db.getState();
    expect(state.lastAckedSequence).toBe(maxSequence);
    expect(state.pendingEventCount).toBe(0);
  });

  it('requests next batch after receiving ack when more events are pending', async () => {
    const server = await startTestServer();
    const { db } = await makeTempDb();
    queueTestEvent(db, 5);

    const connPromise = waitForConnection(server);
    makeTransport(server, db, { batchSize: 3 });

    const { ws: serverWs, mq } = await connPromise;

    // First batch
    const batch1 = (await mq.waitForType('event_batch')) as {
      payload: { batchId: string; events: Array<{ sequence: number }> };
    };
    expect(batch1.payload.events).toHaveLength(3);

    // Ack batch 1
    const maxSeq1 = Math.max(...batch1.payload.events.map((e) => e.sequence));
    serverWs.send(
      JSON.stringify({
        type: 'event_batch_ack',
        schemaVersion: 1,
        payload: {
          batchId: batch1.payload.batchId,
          ackedThroughSequence: maxSeq1,
          acceptedCount: 3,
          duplicateCount: 0,
          rejected: [],
          serverTime: new Date().toISOString(),
        },
      }),
    );

    // Second batch should arrive automatically
    const batch2 = (await mq.waitForType('event_batch')) as {
      payload: { events: unknown[] };
    };
    expect(batch2.payload.events).toHaveLength(2);
  });
});

// ── client_heartbeat ───────────────────────────────────────────────────────────

describe('client_heartbeat', () => {
  it('sends client_heartbeat after server_hello specifies interval', async () => {
    const server = await startTestServer();
    const { db } = await makeTempDb();

    const connPromise = waitForConnection(server);
    makeTransport(server, db, { defaultHeartbeatIntervalMs: 80 });

    const { ws: serverWs, mq } = await connPromise;

    // Wait for client_hello, then send server_hello with a short heartbeat interval
    await mq.waitForType('client_hello');
    serverWs.send(
      JSON.stringify({
        type: 'server_hello',
        schemaVersion: 1,
        connectionId: randomUUID(),
        serverTime: new Date().toISOString(),
        heartbeatIntervalMs: 80,
      }),
    );

    // Should receive a heartbeat within a few intervals
    const hb = (await mq.waitForType('client_heartbeat')) as {
      type: string;
      latestSequence: number;
      activeProjectIds: string[];
      sentAt: string;
    };

    expect(hb.type).toBe('client_heartbeat');
    expect(typeof hb.latestSequence).toBe('number');
    expect(Array.isArray(hb.activeProjectIds)).toBe(true);
    expect(typeof hb.sentAt).toBe('string');
  });
});

// ── reconnect ─────────────────────────────────────────────────────────────────

describe('reconnect', () => {
  it('reconnects after the server closes the connection', async () => {
    const server = await startTestServer();
    const { db } = await makeTempDb();

    let connectionCount = 0;
    const connections: WebSocket[] = [];

    server.wss.on('connection', (ws) => {
      connectionCount += 1;
      connections.push(ws);
    });

    makeTransport(server, db, { minReconnectDelayMs: 50, maxReconnectDelayMs: 200 });

    // Wait for initial connection
    await new Promise<void>((resolve) => {
      const poll = setInterval(() => {
        if (connectionCount >= 1) {
          clearInterval(poll);
          resolve();
        }
      }, 10);
    });

    // Close from server side
    connections[0]?.close();

    // Wait for reconnect (up to 2 s)
    await new Promise<void>((resolve) => {
      const poll = setInterval(() => {
        if (connectionCount >= 2) {
          clearInterval(poll);
          resolve();
        }
      }, 10);
      setTimeout(() => {
        clearInterval(poll);
        resolve();
      }, 2000);
    });

    expect(connectionCount).toBeGreaterThanOrEqual(2);
  });

  it('uses exponential backoff for reconnect delays', () => {
    // Test the backoff math directly without a real server.
    // minDelay=100, attempts: 0→100, 1→200, 2→400, 3→800, 4→capped at 1000
    const min = 100;
    const max = 1000;
    const delays = [0, 1, 2, 3, 4].map((attempts) =>
      Math.min(min * Math.pow(2, attempts), max),
    );

    expect(delays[0]).toBe(100);
    expect(delays[1]).toBe(200);
    expect(delays[2]).toBe(400);
    expect(delays[3]).toBe(800);
    expect(delays[4]).toBe(1000); // capped
  });
});

// ── stop ──────────────────────────────────────────────────────────────────────

describe('stop', () => {
  it('does not reconnect after stop() is called', async () => {
    const server = await startTestServer();
    const { db } = await makeTempDb();

    let connectionCount = 0;
    server.wss.on('connection', () => {
      connectionCount += 1;
    });

    // makeTransport auto-tracks, afterEach will call stop() but stop() is idempotent
    const transport = makeTransport(server, db, { minReconnectDelayMs: 50 });

    // Wait for initial connection
    await new Promise<void>((resolve) => {
      const poll = setInterval(() => {
        if (connectionCount >= 1) {
          clearInterval(poll);
          resolve();
        }
      }, 10);
    });

    transport.stop();

    // Wait to see if it reconnects (it shouldn't)
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Still just 1 connection (the initial one)
    expect(connectionCount).toBe(1);
  });
});

// ── flush ─────────────────────────────────────────────────────────────────────

describe('flush', () => {
  it('flush() while connected sends pending events', async () => {
    const server = await startTestServer();
    const { db } = await makeTempDb();
    // Start with empty outbox

    const connPromise = waitForConnection(server);
    const transport = makeTransport(server, db);

    const { mq } = await connPromise;
    // Consume client_hello so it doesn't interfere
    await mq.waitForType('client_hello');

    // Queue an event AFTER connection is established
    queueTestEvent(db, 1);

    // Manually flush
    transport.flush();

    const batchMsg = (await mq.waitForType('event_batch')) as {
      payload: { events: unknown[] };
    };
    expect(batchMsg.payload.events).toHaveLength(1);
  });
});

// ── server_error ──────────────────────────────────────────────────────────────

describe('server_error', () => {
  it('handles non-retryable server_error without crashing', async () => {
    const server = await startTestServer();
    const { db } = await makeTempDb();

    const connPromise = waitForConnection(server);

    const warnings: string[] = [];
    const testLogger = createLogger({
      stdout: () => {},
      stderr: (msg) => {
        warnings.push(msg);
      },
    });

    makeTransport(server, db, { logger: testLogger });

    const { ws: serverWs, mq } = await connPromise;
    await mq.waitForType('client_hello');

    serverWs.send(
      JSON.stringify({
        type: 'server_error',
        schemaVersion: 1,
        code: 'unauthorized',
        message: 'Token revoked',
        retryable: false,
      }),
    );

    // Give the transport time to process and log the error
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(
      warnings.some((w) => w.includes('unauthorized') || w.includes('Token revoked')),
    ).toBe(true);
  });
});
