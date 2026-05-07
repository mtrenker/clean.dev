/**
 * DaemonTransport – outbound WebSocket client for cockpit-daemon.
 *
 * Protocol lifecycle (client-side view):
 *   1. Connect to wss://<host>/api/cockpit/ws with Authorization: Bearer <token>
 *   2. Receive   server_hello  → store heartbeatIntervalMs
 *   3. Send      client_hello  → register session / resume sequence
 *   4. Send      event_batch   → flush pending events from local outbox (batched)
 *   5. Receive   event_batch_ack → advance lastAckedSequence in local DB
 *   6. Send      client_heartbeat every heartbeatIntervalMs
 *   7. Receive   server_ping   → no response required
 *   8. On disconnect → clear timers, exponential-backoff reconnect
 *
 * Reconnect backoff: starts at minReconnectDelayMs (default 1 s), doubles on
 * each attempt up to maxReconnectDelayMs (default 60 s), then stays there.
 * Counter resets to 0 on every successful open.
 *
 * Event delivery exactly-once guarantee:
 *   - Events sit in the local SQLite outbox until the server acks them.
 *   - On reconnect the transport re-reads unacked events and re-sends them.
 *   - The server uses ON CONFLICT DO NOTHING on event_id, so duplicates are
 *     silently absorbed and reflected in ack.duplicateCount.
 */

import { randomUUID } from 'node:crypto';
import { WebSocket } from 'ws';

import {
  cockpitProtocolSchemaVersion,
  cockpitServerMessageSchema,
} from '@cleandev/cockpit-protocol';
import type { CockpitClientMessage } from '@cleandev/cockpit-protocol';

import type { LocalDaemonDb } from '../local-db';
import type { Logger } from '../logging';

// ── Public types ───────────────────────────────────────────────────────────────

export interface TransportOptions {
  /** WebSocket server URL – https:// or wss:// both work (protocol is replaced). */
  serverUrl: string;
  /** Raw bearer token (not hashed). */
  token: string;
  deviceId: string;
  deviceName: string;
  instanceName: string;
  /** Open local DB instance used to read the outbox and write acks. */
  db: LocalDaemonDb;
  /** Stable session identifier for this daemon run. */
  sessionId: string;
  logger: Logger;
  /** Max events per event_batch message. Default 50. */
  batchSize?: number;
  /** Initial reconnect delay in ms. Default 1 000. */
  minReconnectDelayMs?: number;
  /** Cap on reconnect delay in ms. Default 60 000. */
  maxReconnectDelayMs?: number;
  /** Heartbeat interval used before server_hello is received. Default 30 000. */
  defaultHeartbeatIntervalMs?: number;
}

type TransportLifecycleState = 'idle' | 'connecting' | 'connected' | 'stopped';

// ── DaemonTransport ────────────────────────────────────────────────────────────

export class DaemonTransport {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lifecycleState: TransportLifecycleState = 'idle';
  private heartbeatIntervalMs: number;
  private reconnectAttempts = 0;

  private readonly serverUrl: string;
  private readonly token: string;
  private readonly deviceId: string;
  private readonly deviceName: string;
  private readonly instanceName: string;
  private readonly db: LocalDaemonDb;
  private readonly sessionId: string;
  private readonly logger: Logger;
  private readonly batchSize: number;
  private readonly minReconnectDelayMs: number;
  private readonly maxReconnectDelayMs: number;

  constructor(opts: TransportOptions) {
    this.serverUrl = opts.serverUrl;
    this.token = opts.token;
    this.deviceId = opts.deviceId;
    this.deviceName = opts.deviceName;
    this.instanceName = opts.instanceName;
    this.db = opts.db;
    this.sessionId = opts.sessionId;
    this.logger = opts.logger;
    this.batchSize = opts.batchSize ?? 50;
    this.minReconnectDelayMs = opts.minReconnectDelayMs ?? 1_000;
    this.maxReconnectDelayMs = opts.maxReconnectDelayMs ?? 60_000;
    this.heartbeatIntervalMs = opts.defaultHeartbeatIntervalMs ?? 30_000;
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  /**
   * Start the connection loop. Safe to call when already started (idempotent).
   */
  start(): void {
    if (this.lifecycleState !== 'idle') return;
    this.lifecycleState = 'connecting';
    this.doConnect();
  }

  /**
   * Permanently stop the transport. Cancels timers and closes the WebSocket.
   * The transport cannot be restarted after this call.
   */
  stop(): void {
    this.lifecycleState = 'stopped';
    this.clearAllTimers();
    if (this.ws !== null) {
      this.ws.close(1000, 'Daemon stopped');
      this.ws = null;
    }
  }

  /**
   * Trigger an immediate flush of pending outbox events.
   * No-op when not currently connected.
   */
  flush(): void {
    if (this.lifecycleState === 'connected') {
      this.flushPendingEvents();
    }
  }

  // ── Connection management ────────────────────────────────────────────────────

  private doConnect(): void {
    if (this.lifecycleState === 'stopped') return;

    const wsUrl = buildWsUrl(this.serverUrl);
    this.logger.info(`[transport] Connecting to ${wsUrl}`);

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
    } catch (err) {
      this.logger.error(`[transport] Failed to create WebSocket: ${String(err)}`);
      this.scheduleReconnect();
      return;
    }

    this.ws = ws;

    ws.on('open', () => this.onOpen());
    ws.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => this.onMessage(data));
    ws.on('close', (code: number, reason: Buffer) => this.onClose(code, reason));
    ws.on('error', (err: Error) => this.onError(err));
  }

  // ── Event handlers ───────────────────────────────────────────────────────────

  private onOpen(): void {
    this.logger.info('[transport] Connection established');
    this.lifecycleState = 'connected';
    this.reconnectAttempts = 0;
    this.sendClientHello();
    this.scheduleHeartbeat();
    this.flushPendingEvents();
  }

  private onMessage(data: Buffer | ArrayBuffer | Buffer[]): void {
    let raw: unknown;
    try {
      raw = JSON.parse(data.toString()) as unknown;
    } catch {
      this.logger.warn('[transport] Received non-JSON message from server');
      return;
    }

    const result = cockpitServerMessageSchema.safeParse(raw);
    if (!result.success) {
      this.logger.warn(
        `[transport] Unrecognized server message: ${JSON.stringify(result.error.flatten())}`,
      );
      return;
    }

    const msg = result.data;

    switch (msg.type) {
      case 'server_hello':
        this.logger.info(
          `[transport] server_hello received: connectionId=${msg.connectionId} ` +
            `heartbeatIntervalMs=${msg.heartbeatIntervalMs}`,
        );
        this.heartbeatIntervalMs = msg.heartbeatIntervalMs;
        // Reschedule heartbeat with the server-specified interval
        if (this.heartbeatTimer !== null) {
          this.scheduleHeartbeat();
        }
        break;

      case 'event_batch_ack':
        this.logger.info(
          `[transport] event_batch_ack: batchId=${msg.payload.batchId} ` +
            `ackedThroughSequence=${msg.payload.ackedThroughSequence} ` +
            `accepted=${msg.payload.acceptedCount} duplicates=${msg.payload.duplicateCount}`,
        );
        try {
          this.db.acknowledgeBatch(msg.payload);
        } catch (err) {
          this.logger.error(`[transport] Failed to persist ack: ${String(err)}`);
        }
        // Send next batch if more events are still pending
        this.flushPendingEvents();
        break;

      case 'server_error':
        this.logger.warn(
          `[transport] Server error: code=${msg.code} message=${msg.message} retryable=${msg.retryable}`,
        );
        if (!msg.retryable) {
          this.logger.error('[transport] Non-retryable error – closing connection');
          this.ws?.close(1000, 'Non-retryable server error');
        }
        break;

      case 'server_ping':
        // Protocol: no response required from client
        break;
    }
  }

  private onClose(code: number, reason: Buffer): void {
    const reasonText = reason.length > 0 ? reason.toString() : '(no reason)';
    this.logger.info(`[transport] Disconnected (code=${code} reason=${reasonText})`);
    this.clearHeartbeatTimer();
    this.ws = null;

    if (this.lifecycleState !== 'stopped') {
      this.lifecycleState = 'connecting';
      this.scheduleReconnect();
    }
  }

  private onError(err: Error): void {
    // The 'close' event will always follow 'error', so reconnect is handled there.
    this.logger.error(`[transport] WebSocket error: ${err.message}`);
  }

  // ── Message senders ──────────────────────────────────────────────────────────

  private sendClientHello(): void {
    const state = this.db.getState();
    this.send({
      type: 'client_hello',
      schemaVersion: cockpitProtocolSchemaVersion,
      sessionId: this.sessionId,
      deviceId: this.deviceId,
      deviceName: this.deviceName,
      instanceName: this.instanceName,
      lastAckedSequence: state.lastAckedSequence,
    });
  }

  private sendHeartbeat(): void {
    if (this.lifecycleState !== 'connected' || this.ws === null) return;

    const state = this.db.getState();
    const projects = this.db.listConfiguredProjects();

    this.send({
      type: 'client_heartbeat',
      schemaVersion: cockpitProtocolSchemaVersion,
      sentAt: new Date().toISOString(),
      // latestSequence is the highest sequence we've ever emitted
      latestSequence: Math.max(0, state.nextSequence - 1),
      activeProjectIds: projects.map((p) => p.projectId),
    });
  }

  private flushPendingEvents(): void {
    if (this.ws === null || this.ws.readyState !== WebSocket.OPEN) return;

    const pending = this.db.listPendingOutboundEvents(this.batchSize);
    if (pending.length === 0) return;

    const batchId = randomUUID();
    this.logger.info(
      `[transport] Sending event_batch: batchId=${batchId} eventCount=${pending.length}`,
    );

    this.send({
      type: 'event_batch',
      schemaVersion: cockpitProtocolSchemaVersion,
      payload: {
        batchId,
        sentAt: new Date().toISOString(),
        events: pending.map((r) => r.event),
      },
    });
  }

  private send(message: CockpitClientMessage): void {
    if (this.ws === null || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(JSON.stringify(message));
    } catch (err) {
      this.logger.error(`[transport] Send failed: ${String(err)}`);
    }
  }

  // ── Timer management ─────────────────────────────────────────────────────────

  private scheduleHeartbeat(): void {
    this.clearHeartbeatTimer();
    this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
  }

  private clearHeartbeatTimer(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.lifecycleState === 'stopped') return;

    // Exponential backoff: minDelay * 2^attempts, capped at maxDelay
    const delay = Math.min(
      this.minReconnectDelayMs * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelayMs,
    );
    this.reconnectAttempts += 1;

    this.logger.info(
      `[transport] Reconnecting in ${delay}ms (attempt #${this.reconnectAttempts})`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.doConnect();
    }, delay);
  }

  private clearAllTimers(): void {
    this.clearHeartbeatTimer();
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// ── URL helper ─────────────────────────────────────────────────────────────────

/**
 * Converts an HTTP(S) server URL to the WebSocket endpoint URL.
 *
 * `https://clean.dev`  → `wss://clean.dev/api/cockpit/ws`
 * `http://localhost:3000` → `ws://localhost:3000/api/cockpit/ws`
 */
export function buildWsUrl(serverUrl: string): string {
  const url = new URL(serverUrl.replace(/\/$/, ''));
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/api/cockpit/ws';
  return url.toString();
}
