/**
 * CockpitProjector – debounced projection of raw cockpit events into a
 * per-project current-state snapshot.
 *
 * ## How it works
 *
 * After events arrive (via the WebSocket or HTTP ingestion endpoint) the
 * repository layer marks each affected project as *dirty* and records the
 * current time in `cockpit_projects.dirty_marked_at`.
 *
 * The projector polls for dirty projects on a configurable interval and only
 * processes projects whose `dirty_marked_at` is older than `debounceMs` (the
 * debounce window).  This means a project that is actively receiving events
 * won't be projected until activity has been quiet for at least `debounceMs`,
 * which keeps the number of DB writes low while ensuring the snapshot is
 * reasonably up-to-date.
 *
 * For each eligible project the projector:
 *   1. Loads the existing projected-state record (for `latestEventSequence`).
 *   2. Fetches all raw events with sequence > `latestEventSequence`.
 *   3. Folds those events onto the current state with `foldEventsIntoState`.
 *   4. Sets `state.dirty = true` if the daemon heartbeat is stale (> 60 s old).
 *   5. Persists the new snapshot via `upsertProjectedProjectState`, which also
 *      clears `cockpit_projects.projectionDirty`.
 *
 * The resulting snapshot is what the UI reads; it never has to scan the raw
 * event log.
 *
 * ## Staleness detection
 *
 * The `state.dirty` field in the persisted JSONB blob signals to the UI that
 * the daemon may be inactive – it is `true` when the most-recent heartbeat (or,
 * falling back, the most-recent event) is older than `heartbeatStaleMs`.
 * The DB row's `dirty` column indicates "unprojected events exist" and is
 * managed separately by the repository layer.
 */

import {
  emptyProjectedState,
  foldEventsIntoState,
  HEARTBEAT_STALE_MS,
} from '@cleandev/cockpit-store';
import type { ICockpitRepository } from '@cleandev/cockpit-store';
import { logger } from '../logger';

// ── Constants ──────────────────────────────────────────────────────────────────

/** How long after the last event arrival before a dirty project is projected. */
export const DEFAULT_DEBOUNCE_MS = 3_000;

/** How often the projector polls the DB for dirty projects (ms). */
export const DEFAULT_POLL_INTERVAL_MS = 1_000;

/**
 * Maximum number of raw events to fetch per project per projection cycle.
 * Limits memory usage for projects that accumulate a very large backlog.
 */
export const DEFAULT_EVENT_BATCH_LIMIT = 10_000;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CockpitProjectorOptions {
  /**
   * Minimum ms of quiet time (no new events) before a dirty project becomes
   * eligible for projection.  Default: {@link DEFAULT_DEBOUNCE_MS}.
   */
  debounceMs?: number;
  /**
   * Window (ms) without a heartbeat/recent event after which `state.dirty` is
   * set to `true` in the output, telling the UI the daemon may be inactive.
   * Default: {@link HEARTBEAT_STALE_MS} (60 000 ms).
   */
  heartbeatStaleMs?: number;
  /**
   * Maximum number of raw events to load per project per cycle.
   * Default: {@link DEFAULT_EVENT_BATCH_LIMIT}.
   */
  eventBatchLimit?: number;
}

export interface ProjectionCycleResult {
  /** Number of projects successfully projected in this cycle. */
  projected: number;
  /** Number of projects that were skipped due to errors. */
  skipped: number;
}

// ── CockpitProjector ───────────────────────────────────────────────────────────

export class CockpitProjector {
  private readonly repo: ICockpitRepository;
  private readonly debounceMs: number;
  private readonly heartbeatStaleMs: number;
  private readonly eventBatchLimit: number;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(repo: ICockpitRepository, opts: CockpitProjectorOptions = {}) {
    this.repo = repo;
    this.debounceMs = opts.debounceMs ?? DEFAULT_DEBOUNCE_MS;
    this.heartbeatStaleMs = opts.heartbeatStaleMs ?? HEARTBEAT_STALE_MS;
    this.eventBatchLimit = opts.eventBatchLimit ?? DEFAULT_EVENT_BATCH_LIMIT;
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  /**
   * Run one projection cycle: find all dirty projects that have been quiet for
   * `debounceMs`, project each one, and return a summary.
   *
   * Safe to call concurrently – each project is an independent transaction, and
   * the underlying `upsertProjectedProjectState` is idempotent.
   */
  async projectAll(): Promise<ProjectionCycleResult> {
    const dirtyProjects = await this.repo.listDirtyProjects(this.debounceMs);

    let projected = 0;
    let skipped = 0;

    for (const project of dirtyProjects) {
      try {
        await this.projectOne(project.projectId);
        projected++;
      } catch (err) {
        logger.error({
          event: 'cockpit.projector.project_error',
          projectId: project.projectId,
          error: String(err),
        });
        skipped++;
      }
    }

    if (projected > 0) {
      logger.info({
        event: 'cockpit.projector.cycle_complete',
        projected,
        skipped,
      });
    }

    return { projected, skipped };
  }

  /**
   * Start a background polling loop that calls {@link projectAll} every
   * `pollIntervalMs` milliseconds.
   *
   * Calling `start()` when already started is a no-op.
   */
  start(pollIntervalMs: number = DEFAULT_POLL_INTERVAL_MS): void {
    if (this.pollTimer !== null) return;
    this.pollTimer = setInterval(
      () => void this.projectAll(),
      pollIntervalMs,
    );
    logger.info({
      event: 'cockpit.projector.started',
      debounce_ms: this.debounceMs,
      poll_interval_ms: pollIntervalMs,
      heartbeat_stale_ms: this.heartbeatStaleMs,
    });
  }

  /**
   * Stop the background polling loop.  Any in-flight `projectAll` call will
   * complete before the next tick is scheduled, so this is race-free.
   */
  stop(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
      logger.info({ event: 'cockpit.projector.stopped' });
    }
  }

  /** `true` if the polling loop is currently running. */
  get isRunning(): boolean {
    return this.pollTimer !== null;
  }

  // ── Internal ──────────────────────────────────────────────────────────────────

  /**
   * Project a single project:
   *   1. Load the current state record (for `latestEventSequence`).
   *   2. Fetch unprojected raw events (sequence > latestEventSequence).
   *   3. Fold events onto the current state.
   *   4. Persist the new snapshot.
   */
  private async projectOne(projectId: string): Promise<void> {
    const now = new Date();

    // ── Step 1: Current projection record ────────────────────────────────────
    const record = await this.repo.getProjectedProjectStateRecord(projectId);
    const afterSequence = record?.latestEventSequence ?? 0;
    const currentState =
      record?.state ?? emptyProjectedState(projectId);

    // ── Step 2: Load new events ───────────────────────────────────────────────
    const newEvents = await this.repo.listRawEventsSince(
      projectId,
      afterSequence,
      this.eventBatchLimit,
    );

    // ── Step 3: Fold ──────────────────────────────────────────────────────────
    const projectedState = foldEventsIntoState(
      currentState,
      newEvents,
      now,
      this.heartbeatStaleMs,
    );

    // ── Step 4: Persist ───────────────────────────────────────────────────────
    // Calculate the new highest projected sequence.
    const latestSequence =
      newEvents.length > 0
        ? Math.max(...newEvents.map((e) => e.sequence))
        : afterSequence;

    await this.repo.upsertProjectedProjectState({
      projectId,
      state: projectedState,
      latestEventId: projectedState.lastEvent?.eventId ?? null,
      latestEventSequence: latestSequence,
      projectedAt: now,
    });

    logger.debug({
      event: 'cockpit.projector.projected',
      projectId,
      new_events: newEvents.length,
      latest_sequence: latestSequence,
      daemon_stale: projectedState.dirty,
    });
  }
}
