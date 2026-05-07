/**
 * Cockpit daemon main loop.
 *
 * Responsibilities:
 *   1. Load config + open local SQLite DB.
 *   2. Sync configured projects into the DB.
 *   3. Run an initial full reconcile (git worktrees + pi-fleet) for all projects.
 *   4. Start the outbound WebSocket transport (connects, reconnects, batches).
 *   5. Run a periodic full reconcile every RECONCILE_INTERVAL_MS and flush after.
 *   6. Handle SIGINT / SIGTERM for graceful shutdown.
 *
 * The function returns only when the process receives a shutdown signal.
 * All file-system errors in reconcile scans are caught and logged; the loop
 * keeps running even if a single project scan fails.
 */

import { randomUUID } from 'node:crypto';

import type { DaemonConfig } from '@cleandev/cockpit-protocol';

import { loadDaemonConfig } from './config';
import type { DaemonPaths } from './config';
import { openLocalDaemonDb } from './local-db';
import type { LocalDaemonDb } from './local-db';
import { createLogger } from './logging';
import type { CliIo } from './cli';
import { scanProjectGitWorktrees } from './adapters/git';
import { scanProjectPiFleet } from './adapters/pi-fleet';
import { DaemonTransport } from './transport/websocket';

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * How often the daemon re-scans all projects even if nothing changed on disk.
 * 60 s keeps the server's stale-project timeout (≈ 1 min of no heartbeat) at bay.
 */
const RECONCILE_INTERVAL_MS = 60_000;

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Run the cockpit daemon until the process receives SIGINT or SIGTERM.
 *
 * Called by `cli.ts` when the user runs `cockpit-daemon daemon`.
 * Returns the exit code to use (0 on clean shutdown, 1 on fatal error).
 */
export const runDaemon = async (paths: DaemonPaths, io: CliIo): Promise<number> => {
  const logger = createLogger(io);

  const { config } = await loadDaemonConfig(paths);

  if (!config.credential) {
    logger.error(
      'No credential configured. Run `cockpit-daemon login --device-name <name>` first.',
    );
    return 1;
  }

  if (config.projects.length === 0) {
    logger.warn(
      'No projects mapped. Use `cockpit-daemon map --project-id <id> --path <dir>` to add one.',
    );
  }

  const db = await openLocalDaemonDb(paths);
  const sessionId = randomUUID();

  try {
    db.syncConfiguredProjects(config.projects);

    logger.info(`[daemon] Starting (sessionId=${sessionId})`);
    logger.info(`[daemon] Server: ${config.serverUrl}`);
    logger.info(`[daemon] Projects: ${config.projects.length}`);

    // ── Initial full reconcile ───────────────────────────────────────────────
    logger.info('[daemon] Running initial reconcile...');
    await reconcileAll(db, config, logger);
    logger.info('[daemon] Initial reconcile complete');

    // ── WebSocket transport ──────────────────────────────────────────────────
    const transport = new DaemonTransport({
      serverUrl: config.serverUrl,
      token: config.credential.token,
      deviceId: config.credential.deviceId,
      deviceName: config.credential.deviceName,
      instanceName: config.instanceName,
      db,
      sessionId,
      logger,
    });

    transport.start();

    // ── Periodic reconcile loop ──────────────────────────────────────────────
    const reconcileTimer = setInterval(() => {
      reconcileAll(db, config, logger)
        .then(() => transport.flush())
        .catch((err: unknown) => {
          logger.error(`[daemon] Reconcile error: ${String(err)}`);
        });
    }, RECONCILE_INTERVAL_MS);

    // ── Wait for shutdown signal ─────────────────────────────────────────────
    await new Promise<void>((resolve) => {
      const shutdown = () => {
        logger.info('[daemon] Shutting down...');
        clearInterval(reconcileTimer);
        transport.stop();
        resolve();
      };

      process.once('SIGINT', shutdown);
      process.once('SIGTERM', shutdown);
    });

    logger.info('[daemon] Stopped.');
    return 0;
  } finally {
    db.close();
  }
};

// ── Reconcile helper ───────────────────────────────────────────────────────────

/**
 * Scans all mapped projects and queues events into the local outbox.
 *
 * Per-project errors are caught and logged; other projects still run.
 */
const reconcileAll = async (
  db: LocalDaemonDb,
  config: DaemonConfig,
  logger: ReturnType<typeof createLogger>,
): Promise<void> => {
  const deviceId = config.credential?.deviceId ?? `local-${config.instanceName}`;

  await Promise.all(
    config.projects.map(async (project) => {
      // Git worktrees
      try {
        await scanProjectGitWorktrees(db, project, deviceId);
      } catch (err) {
        logger.error(
          `[daemon] git scan failed for project ${project.projectId}: ${String(err)}`,
        );
      }

      // Pi-fleet (task/plan) events
      try {
        await scanProjectPiFleet(db, project, deviceId);
      } catch (err) {
        logger.error(
          `[daemon] pi-fleet scan failed for project ${project.projectId}: ${String(err)}`,
        );
      }
    }),
  );
};
