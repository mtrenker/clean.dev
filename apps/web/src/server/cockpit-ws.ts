/**
 * CockpitWsServer – WebSocket ingestion endpoint for paired cockpit daemons.
 *
 * Protocol lifecycle:
 *   1. HTTP upgrade arrives at /api/cockpit/ws
 *   2. Bearer token extracted from Authorization header, hashed, looked up in DB
 *   3. Auth failure  → HTTP 401 (no WebSocket upgrade)
 *   4. Auth success  → upgrade completes; server sends server_hello
 *   5. Daemon sends  → client_hello (validated; session created in DB)
 *   6. Daemon sends  → event_batch (validated; events inserted idempotently; ack sent)
 *   7. Daemon sends  → client_heartbeat (session touched; no reply required)
 *   8. Server sends  → server_ping every heartbeatIntervalMs
 *   9. On disconnect → session touched with final acked sequence
 *
 * Idempotency:
 *   The repository layer uses ON CONFLICT DO NOTHING on cockpit_raw_events.event_id.
 *   Retried batches are accepted gracefully; ack.duplicateCount reflects rejects.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { IncomingMessage, Server as HttpServer } from 'node:http';
import type { Socket } from 'node:net';
import { WebSocketServer, WebSocket } from 'ws';
import type { RawData } from 'ws';
import {
  cockpitClientMessageSchema,
  cockpitProtocolSchemaVersion,
} from '@cleandev/cockpit-protocol';
import type {
  CockpitClientMessage,
  CockpitServerMessage,
  EventBatchAck,
} from '@cleandev/cockpit-protocol';
import type { ICockpitRepository } from '@cleandev/cockpit-store';
import { logger } from '../lib/logger';

// ── Constants ──────────────────────────────────────────────────────────────────

/** Interval (ms) between server → client ping messages. */
export const HEARTBEAT_INTERVAL_MS = 30_000;

/** Custom WS close codes */
const WS_CLOSE_NORMAL = 1000;
const WS_CLOSE_UNAUTHORIZED = 4001;

/** URL path that this server intercepts. */
const WS_PATH = '/api/cockpit/ws';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ConnectionState {
  connectionId: string;
  deviceId: string;
  tokenId: string;
  sessionId: string | null;
  lastAckedSequence: number;
  ws: WebSocket;
  heartbeatTimer: ReturnType<typeof setInterval>;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Hashes a raw bearer token with SHA-256 to produce the value stored in the DB.
 * Deterministic and constant-time for same input.
 */
export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Extracts the raw bearer token from an incoming request's Authorization header.
 * Returns null if the header is absent, malformed, or empty.
 */
export function extractBearerToken(request: IncomingMessage): string | null {
  const raw = request.headers['authorization'];
  const authHeader = Array.isArray(raw) ? raw[0] : raw;

  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

const truncateServerMessage = (message: string) =>
  message.length <= 512 ? message : `${message.slice(0, 509)}...`;

function sendMessage(ws: WebSocket, message: CockpitServerMessage): void {
  const safeMessage = message.type === 'server_error'
    ? { ...message, message: truncateServerMessage(message.message) }
    : message;

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(safeMessage));
  }
}

// ── CockpitWsServer ────────────────────────────────────────────────────────────

/**
 * Attaches a WebSocket server to an existing HTTP server.
 *
 * Intercepts upgrade requests on WS_PATH and performs bearer-token
 * authentication before completing the WebSocket handshake.  All other upgrade
 * requests are destroyed (404 equivalent).
 */
export class CockpitWsServer {
  private readonly wss: WebSocketServer;
  private readonly connections = new Map<string, ConnectionState>();
  private readonly repo: ICockpitRepository;

  constructor(server: HttpServer, repo: ICockpitRepository) {
    this.repo = repo;
    // noServer: handle upgrade manually so we can reject before the handshake
    this.wss = new WebSocketServer({
      noServer: true,
      // Keep daemon telemetry messages small enough to avoid accidental or
      // malicious memory pressure. The protocol batches at most 100 events and
      // the daemon currently sends 50 per batch.
      maxPayload: 256 * 1024,
    });
    this.wss.on('connection', this.onConnection.bind(this));
    server.on('upgrade', this.onUpgrade.bind(this));
  }

  // ── Upgrade handler ──────────────────────────────────────────────────────────

  private async onUpgrade(
    request: IncomingMessage,
    socket: Socket,
    head: Buffer,
  ): Promise<void> {
    const url = request.url ?? '';
    if (!url.startsWith(WS_PATH)) {
      socket.destroy();
      return;
    }

    const rawToken = extractBearerToken(request);
    if (!rawToken) {
      this.rejectUpgrade(socket, 401, 'Unauthorized');
      logger.warn({ event: 'cockpit.ws.upgrade_rejected', reason: 'missing_auth_header' });
      return;
    }

    const tokenHash = hashToken(rawToken);
    let tokenRecord: Awaited<ReturnType<ICockpitRepository['findActiveTokenByHash']>>;
    try {
      tokenRecord = await this.repo.findActiveTokenByHash(tokenHash);
    } catch (err) {
      logger.error({ event: 'cockpit.ws.token_lookup_error', error: String(err) });
      this.rejectUpgrade(socket, 500, 'Internal Server Error');
      return;
    }

    if (!tokenRecord) {
      this.rejectUpgrade(socket, 401, 'Unauthorized');
      logger.warn({ event: 'cockpit.ws.upgrade_rejected', reason: 'unknown_or_revoked_token' });
      return;
    }

    // Complete the WebSocket handshake, passing auth context to onConnection.
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit('connection', ws, request, {
        deviceId: tokenRecord!.deviceId,
        tokenId: tokenRecord!.tokenId,
      });
    });
  }

  private rejectUpgrade(socket: Socket, status: number, statusText: string): void {
    socket.write(
      `HTTP/1.1 ${status} ${statusText}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n`,
    );
    socket.destroy();
  }

  // ── Connection handler ───────────────────────────────────────────────────────

  private onConnection(
    ws: WebSocket,
    _request: IncomingMessage,
    auth: { deviceId: string; tokenId: string },
  ): void {
    const connectionId = randomUUID();
    const { deviceId, tokenId } = auth;

    logger.info({ event: 'cockpit.ws.connected', connectionId, deviceId });

    sendMessage(ws, {
      type: 'server_hello',
      schemaVersion: cockpitProtocolSchemaVersion,
      connectionId,
      serverTime: new Date().toISOString(),
      heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS,
    } satisfies CockpitServerMessage);

    const state: ConnectionState = {
      connectionId,
      deviceId,
      tokenId,
      sessionId: null,
      lastAckedSequence: 0,
      ws,
      heartbeatTimer: setInterval(() => this.sendPing(connectionId), HEARTBEAT_INTERVAL_MS),
    };
    this.connections.set(connectionId, state);

    ws.on('message', (data: RawData) => void this.onMessage(connectionId, data));
    ws.on('close', () => this.onClose(connectionId));
    ws.on('error', (err) => {
      logger.error({ event: 'cockpit.ws.socket_error', connectionId, error: String(err) });
    });
  }

  // ── Message dispatch ─────────────────────────────────────────────────────────

  private async onMessage(connectionId: string, data: RawData): Promise<void> {
    const state = this.connections.get(connectionId);
    if (!state) return;

    // ── Parse JSON ────────────────────────────────────────────────────────────
    let rawMessage: unknown;
    try {
      rawMessage = JSON.parse(data.toString());
    } catch {
      logger.warn({ event: 'cockpit.ws.invalid_json', connectionId });
      sendMessage(state.ws, {
        type: 'server_error',
        schemaVersion: cockpitProtocolSchemaVersion,
        code: 'invalid_message',
        message: 'Message body must be valid JSON',
        retryable: false,
      });
      return;
    }

    // ── Schema validation ─────────────────────────────────────────────────────
    const parseResult = cockpitClientMessageSchema.safeParse(rawMessage);
    if (!parseResult.success) {
      const details = parseResult.error.flatten().fieldErrors;
      logger.warn({
        event: 'cockpit.ws.validation_failed',
        connectionId,
        failed_fields: Object.keys(details),
      });
      // Do NOT store anything — log only.
      sendMessage(state.ws, {
        type: 'server_error',
        schemaVersion: cockpitProtocolSchemaVersion,
        code: 'invalid_message',
        message: `Validation failed: ${JSON.stringify(details)}`,
        retryable: false,
      });
      return;
    }

    const message: CockpitClientMessage = parseResult.data;

    switch (message.type) {
      case 'client_hello':
        await this.handleClientHello(connectionId, message);
        break;
      case 'event_batch':
        await this.handleEventBatch(connectionId, message);
        break;
      case 'client_heartbeat':
        await this.handleClientHeartbeat(connectionId, message);
        break;
    }
  }

  // ── client_hello ─────────────────────────────────────────────────────────────

  private async handleClientHello(
    connectionId: string,
    message: Extract<CockpitClientMessage, { type: 'client_hello' }>,
  ): Promise<void> {
    const state = this.connections.get(connectionId);
    if (!state) return;

    // The deviceId in the hello must match the authenticated token.
    if (message.deviceId !== state.deviceId) {
      logger.warn({
        event: 'cockpit.ws.pairing_mismatch',
        connectionId,
        expected_device_id: state.deviceId,
        got_device_id: message.deviceId,
      });
      sendMessage(state.ws, {
        type: 'server_error',
        schemaVersion: cockpitProtocolSchemaVersion,
        code: 'unauthorized',
        message: 'deviceId in client_hello does not match authenticated device',
        retryable: false,
      });
      state.ws.close(WS_CLOSE_UNAUTHORIZED, 'deviceId mismatch');
      return;
    }

    try {
      await this.repo.createSession({
        sessionId: message.sessionId,
        deviceId: state.deviceId,
        tokenId: state.tokenId,
        connectionId: state.connectionId,
        instanceName: message.instanceName,
        lastAckedSequence: message.lastAckedSequence,
      });
    } catch (err) {
      logger.error({ event: 'cockpit.ws.session_create_error', connectionId, error: String(err) });
      sendMessage(state.ws, {
        type: 'server_error',
        schemaVersion: cockpitProtocolSchemaVersion,
        code: 'internal_error',
        message: 'Failed to register session',
        retryable: true,
      });
      return;
    }

    state.sessionId = message.sessionId;
    state.lastAckedSequence = message.lastAckedSequence;

    logger.info({
      event: 'cockpit.ws.paired',
      connectionId,
      deviceId: state.deviceId,
      sessionId: message.sessionId,
      instance_name: message.instanceName ?? null,
    });
  }

  // ── event_batch ───────────────────────────────────────────────────────────────

  private async handleEventBatch(
    connectionId: string,
    message: Extract<CockpitClientMessage, { type: 'event_batch' }>,
  ): Promise<void> {
    const state = this.connections.get(connectionId);
    if (!state) return;

    if (!state.sessionId) {
      logger.warn({ event: 'cockpit.ws.batch_before_hello', connectionId });
      sendMessage(state.ws, {
        type: 'server_error',
        schemaVersion: cockpitProtocolSchemaVersion,
        code: 'unauthorized',
        message: 'client_hello is required before event batches',
        retryable: false,
      });
      state.ws.close(WS_CLOSE_UNAUTHORIZED, 'client_hello required');
      return;
    }

    const hasForeignDeviceEvent = message.payload.events.some((event) => event.deviceId !== state.deviceId);
    if (hasForeignDeviceEvent) {
      logger.warn({ event: 'cockpit.ws.batch_device_mismatch', connectionId, deviceId: state.deviceId });
      sendMessage(state.ws, {
        type: 'server_error',
        schemaVersion: cockpitProtocolSchemaVersion,
        code: 'unauthorized',
        message: 'event deviceId does not match authenticated daemon',
        retryable: false,
      });
      state.ws.close(WS_CLOSE_UNAUTHORIZED, 'event deviceId mismatch');
      return;
    }

    const hasForeignSessionEvent = message.payload.events.some(
      (event) => event.sessionId !== undefined && event.sessionId !== state.sessionId,
    );
    if (hasForeignSessionEvent) {
      logger.warn({ event: 'cockpit.ws.batch_session_mismatch', connectionId, sessionId: state.sessionId });
      sendMessage(state.ws, {
        type: 'server_error',
        schemaVersion: cockpitProtocolSchemaVersion,
        code: 'unauthorized',
        message: 'event sessionId does not match registered session',
        retryable: false,
      });
      state.ws.close(WS_CLOSE_UNAUTHORIZED, 'event sessionId mismatch');
      return;
    }

    let ack: EventBatchAck;
    try {
      ack = await this.repo.insertEventBatch(message.payload);
    } catch (err) {
      logger.error({ event: 'cockpit.ws.batch_insert_error', connectionId, error: String(err) });
      sendMessage(state.ws, {
        type: 'server_error',
        schemaVersion: cockpitProtocolSchemaVersion,
        code: 'internal_error',
        message: 'Failed to persist event batch',
        retryable: true,
      });
      return;
    }

    // Track highest acked sequence.
    if (ack.ackedThroughSequence > state.lastAckedSequence) {
      state.lastAckedSequence = ack.ackedThroughSequence;
    }

    // Touch session in DB (best-effort, non-blocking).
    if (state.sessionId) {
      this.repo
        .touchSession(state.sessionId, state.lastAckedSequence)
        .catch((err) => logger.error({ event: 'cockpit.ws.touch_session_error', connectionId, error: String(err) }));
    }

    // Structured log captures ingestion throughput and duplicate rate so
    // operators can detect:
    //   - ingestion stopped: accepted_count stalls at 0 over multiple batches
    //   - daemon replay: duplicate_count > 0 (reconnect after disconnect)
    //   - sequence gap: acked_through_sequence jumping unexpectedly
    logger.info({
      event: 'cockpit.ws.batch_ingested',
      connectionId,
      deviceId: state.deviceId,
      sessionId: state.sessionId,
      batchId: message.payload.batchId,
      event_count: message.payload.events.length,
      accepted_count: ack.acceptedCount,
      duplicate_count: ack.duplicateCount,
      rejected_count: ack.rejected?.length ?? 0,
      acked_through_sequence: ack.ackedThroughSequence,
      // Project IDs involved in this batch (for cross-referencing projection lag).
      project_ids: [...new Set(message.payload.events.map((e) => e.projectId))],
    });

    sendMessage(state.ws, {
      type: 'event_batch_ack',
      schemaVersion: cockpitProtocolSchemaVersion,
      payload: ack,
    });
  }

  // ── client_heartbeat ──────────────────────────────────────────────────────────

  private async handleClientHeartbeat(
    connectionId: string,
    message: Extract<CockpitClientMessage, { type: 'client_heartbeat' }>,
  ): Promise<void> {
    const state = this.connections.get(connectionId);
    if (!state || !state.sessionId) return;

    // Log heartbeat receipt so operators can confirm daemon liveness.
    // daemon_stale detection in the projector uses the most-recent heartbeat
    // event in the raw-event log (not this WS heartbeat) — this is a
    // transport-level liveness check.
    logger.debug({
      event: 'cockpit.ws.client_heartbeat',
      connectionId,
      deviceId: state.deviceId,
      sessionId: state.sessionId,
      latest_sequence: message.latestSequence,
    });

    this.repo
      .touchSession(state.sessionId, message.latestSequence)
      .catch((err) => logger.error({ event: 'cockpit.ws.touch_session_error', connectionId, context: 'heartbeat', error: String(err) }));
  }

  // ── Periodic ping ─────────────────────────────────────────────────────────────

  private sendPing(connectionId: string): void {
    const state = this.connections.get(connectionId);
    if (!state || state.ws.readyState !== WebSocket.OPEN) return;

    sendMessage(state.ws, {
      type: 'server_ping',
      schemaVersion: cockpitProtocolSchemaVersion,
      sentAt: new Date().toISOString(),
    });
  }

  // ── Disconnect ────────────────────────────────────────────────────────────────

  private onClose(connectionId: string): void {
    const state = this.connections.get(connectionId);
    if (!state) return;

    clearInterval(state.heartbeatTimer);
    this.connections.delete(connectionId);

    // Log with session_id so operators can correlate against the projected
    // state's device map.  After disconnect the projected state's `dirty` flag
    // will flip to true once the daemon heartbeat window expires.
    logger.info({
      event: 'cockpit.ws.disconnected',
      connectionId,
      deviceId: state.deviceId,
      sessionId: state.sessionId,
      last_acked_sequence: state.lastAckedSequence,
      // Hint: if the daemon reconnects quickly this is a transient drop.
      // If it doesn't reconnect, check the device's lastHeartbeatAt in /cockpit/devices.
      remaining_connections: this.connections.size,
    });

    // Persist final acked sequence.
    if (state.sessionId) {
      this.repo
        .touchSession(state.sessionId, state.lastAckedSequence)
        .catch((err) => logger.error({ event: 'cockpit.ws.touch_session_error', connectionId, context: 'close', error: String(err) }));
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  /** Number of currently active connections. */
  get connectionCount(): number {
    return this.connections.size;
  }

  /** Gracefully close all connections and shut down the WebSocket server. */
  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      for (const state of this.connections.values()) {
        clearInterval(state.heartbeatTimer);
        state.ws.close(WS_CLOSE_NORMAL, 'Server shutting down');
      }
      this.connections.clear();
      this.wss.close((err) => (err ? reject(err) : resolve()));
    });
  }
}
