import { mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import {
  cockpitEventSchema,
  eventBatchAckSchema,
  mappedProjectSchema,
  type CockpitEvent,
  type EventBatchAck,
  type MappedProject,
} from '@cleandev/cockpit-protocol';

import type { DaemonPaths } from './config';

export interface LocalDbStatus {
  path: string;
  directory: string;
  exists: boolean;
}

export interface ObservedFileState {
  projectId: string;
  filePath: string;
  byteOffset: number;
  snapshotHash: string | null;
  lastEventSequence: number | null;
  updatedAt: string;
}

export interface ObservedWorktreeState {
  projectId: string;
  worktreeId: string;
  repoRootPath: string | null;
  worktreePath: string;
  branch: string | null;
  headSha: string | null;
  isDirty: boolean;
  untrackedCount: number;
  aheadCount: number | null;
  behindCount: number | null;
  snapshotHash: string;
  firstSeenAt: string;
  lastObservedAt: string;
  lastChangedAt: string;
  lastEventSequence: number | null;
}

export interface QueuedEventRecord {
  sequence: number;
  eventId: string;
  event: CockpitEvent;
  sourceFilePath: string | null;
  sourceOffset: number | null;
  snapshotHash: string | null;
  ackedAt: string | null;
  createdAt: string;
}

export interface LocalDaemonState {
  nextSequence: number;
  lastAckedSequence: number;
  lastServerTime: string | null;
  configuredProjectCount: number;
  observedFileCount: number;
  observedWorktreeCount: number;
  queuedEventCount: number;
  pendingEventCount: number;
  ackedEventCount: number;
}

export interface UpsertObservedWorktreeInput {
  projectId: string;
  worktreeId: string;
  repoRootPath?: string | null;
  worktreePath: string;
  branch?: string | null;
  headSha?: string | null;
  isDirty: boolean;
  untrackedCount: number;
  aheadCount?: number | null;
  behindCount?: number | null;
  snapshotHash: string;
  observedAt: string;
  changedAt?: string;
  lastEventSequence?: number | null;
}

export interface EventSourceCursorInput {
  filePath: string;
  offset: number;
  snapshotHash: string;
}

export interface QueueEventInput {
  event: Omit<CockpitEvent, 'sequence'> & { sequence?: number };
  source?: EventSourceCursorInput;
}

interface DaemonStateRow {
  next_sequence: number;
  last_acked_sequence: number;
  last_server_time: string | null;
}

interface QueuedEventRow {
  sequence: number;
  event_id: string;
  event_json: string;
  source_file_path: string | null;
  source_offset: number | null;
  snapshot_hash: string | null;
  acked_at: string | null;
  created_at: string;
}

interface ObservedFileRow {
  project_id: string;
  file_path: string;
  byte_offset: number;
  snapshot_hash: string | null;
  last_event_sequence: number | null;
  updated_at: string;
}

interface MappedProjectRow {
  project_id: string;
  project_slug: string | null;
  project_name: string | null;
  local_root_path: string;
  telemetry_json: string;
}

interface ObservedWorktreeRow {
  project_id: string;
  worktree_id: string;
  repo_root_path: string | null;
  worktree_path: string;
  branch: string | null;
  head_sha: string | null;
  is_dirty: number;
  untracked_count: number;
  ahead_count: number | null;
  behind_count: number | null;
  snapshot_hash: string;
  first_seen_at: string;
  last_observed_at: string;
  last_changed_at: string;
  last_event_sequence: number | null;
}

const DAEMON_STATE_SINGLETON = 1;

export const resolveLocalDbPath = (configPath: string) =>
  path.join(path.dirname(configPath), 'state', 'cockpit-daemon.sqlite3');

export const inspectLocalDb = async (paths: DaemonPaths): Promise<LocalDbStatus> => {
  try {
    await stat(paths.localDbPath);
    return {
      path: paths.localDbPath,
      directory: paths.localDbDir,
      exists: true,
    };
  } catch {
    return {
      path: paths.localDbPath,
      directory: paths.localDbDir,
      exists: false,
    };
  }
};

export const ensureLocalDbDirectory = async (paths: DaemonPaths) => {
  await mkdir(paths.localDbDir, { recursive: true });
};

export const hashSnapshot = (value: string) =>
  createHash('sha256').update(value).digest('hex');

export class LocalDaemonDb {
  private readonly db: DatabaseSync;

  constructor(dbPath: string) {
    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec('PRAGMA foreign_keys = ON');
    this.db.exec('PRAGMA busy_timeout = 5000');
    this.initialize();
  }

  close() {
    this.db.close();
  }

  syncConfiguredProjects(projects: MappedProject[]) {
    const normalizedProjects = projects.map((project) => mappedProjectSchema.parse(project));
    const now = new Date().toISOString();
    const upsertProject = this.db.prepare(`
      INSERT INTO configured_projects (
        project_id,
        project_slug,
        project_name,
        local_root_path,
        telemetry_json,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(project_id) DO UPDATE SET
        project_slug = excluded.project_slug,
        project_name = excluded.project_name,
        local_root_path = excluded.local_root_path,
        telemetry_json = excluded.telemetry_json,
        updated_at = excluded.updated_at
    `);
    const deleteMissing = this.db.prepare(`
      DELETE FROM configured_projects
      WHERE project_id NOT IN (${normalizedProjects.map(() => '?').join(', ')})
    `);
    const deleteAll = this.db.prepare('DELETE FROM configured_projects');
    this.withTransaction(() => {
      for (const project of normalizedProjects) {
        upsertProject.run(
          project.projectId,
          project.projectSlug ?? null,
          project.projectName ?? null,
          project.localRootPath,
          JSON.stringify(project.telemetry),
          now,
        );
      }

      if (normalizedProjects.length > 0) {
        deleteMissing.run(...normalizedProjects.map((project) => project.projectId));
      } else {
        deleteAll.run();
      }
    });
  }

  listConfiguredProjects(): MappedProject[] {
    const rows = this.db
      .prepare(
        `
          SELECT project_id, project_slug, project_name, local_root_path, telemetry_json
          FROM configured_projects
          ORDER BY project_id ASC
        `,
      )
      .all() as unknown as MappedProjectRow[];

    return rows.map((row) =>
      mappedProjectSchema.parse({
        projectId: row.project_id,
        projectSlug: row.project_slug ?? undefined,
        projectName: row.project_name ?? undefined,
        localRootPath: row.local_root_path,
        telemetry: JSON.parse(row.telemetry_json) as unknown,
      }),
    );
  }

  queueEvent(input: QueueEventInput): QueuedEventRecord {
    return this.withTransaction(() => {
      const source = input.source
        ? {
            filePath: input.source.filePath,
            offset: input.source.offset,
            snapshotHash: input.source.snapshotHash,
          }
        : undefined;

      if (source) {
        const existing = this.findEventBySource(
          resolveProjectId(input.event),
          source.filePath,
          source.offset,
          source.snapshotHash,
        );

        if (existing) {
          return existing;
        }
      }

      const state = this.getStateRow();
      const requestedSequence =
        typeof input.event.sequence === 'number' ? input.event.sequence : undefined;
      const nextSequence = requestedSequence ?? state.next_sequence;
      const event = cockpitEventSchema.parse({
        ...input.event,
        sequence: nextSequence,
      });
      const now = new Date().toISOString();

      this.db
        .prepare(
          `
            INSERT INTO outbound_events (
              sequence,
              event_id,
              project_id,
              event_type,
              occurred_at,
              event_json,
              source_file_path,
              source_offset,
              snapshot_hash,
              created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
        )
        .run(
          event.sequence,
          event.eventId,
          event.projectId,
          event.type,
          event.occurredAt,
          JSON.stringify(event),
          source?.filePath ?? null,
          source?.offset ?? null,
          source?.snapshotHash ?? null,
          now,
        );

      this.db
        .prepare(
          `
            UPDATE daemon_state
            SET next_sequence = ?, updated_at = ?
            WHERE singleton = ?
          `,
        )
        .run(
          Math.max(state.next_sequence, event.sequence + 1),
          now,
          DAEMON_STATE_SINGLETON,
        );

      if (source) {
        this.db
          .prepare(
            `
              INSERT INTO observed_files (
                project_id,
                file_path,
                byte_offset,
                snapshot_hash,
                last_event_sequence,
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(project_id, file_path) DO UPDATE SET
                byte_offset = MAX(observed_files.byte_offset, excluded.byte_offset),
                snapshot_hash = excluded.snapshot_hash,
                last_event_sequence = excluded.last_event_sequence,
                updated_at = excluded.updated_at
            `,
          )
          .run(
            event.projectId,
            source.filePath,
            source.offset,
            source.snapshotHash,
            event.sequence,
            now,
          );
      }

      return this.getEventBySequence(event.sequence);
    });
  }

  listPendingOutboundEvents(limit = 100): QueuedEventRecord[] {
    const state = this.getStateRow();
    const rows = this.db
      .prepare(
        `
          SELECT
            sequence,
            event_id,
            event_json,
            source_file_path,
            source_offset,
            snapshot_hash,
            acked_at,
            created_at
          FROM outbound_events
          WHERE sequence > ?
          ORDER BY sequence ASC
          LIMIT ?
        `,
      )
      .all(state.last_acked_sequence, limit) as unknown as QueuedEventRow[];

    return rows.map((row) => mapQueuedEventRow(row));
  }

  acknowledgeBatch(ackInput: EventBatchAck): EventBatchAck {
    const ack = eventBatchAckSchema.parse(ackInput);
    return this.withTransaction(() => {
      const state = this.getStateRow();
      const effectiveAckSequence = Math.max(state.last_acked_sequence, ack.ackedThroughSequence);
      const recordedAt = new Date().toISOString();

      this.db
        .prepare(
          `
            INSERT INTO server_acknowledgements (
              batch_id,
              acked_through_sequence,
              accepted_count,
              duplicate_count,
              rejected_json,
              server_time,
              recorded_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(batch_id) DO UPDATE SET
              acked_through_sequence = excluded.acked_through_sequence,
              accepted_count = excluded.accepted_count,
              duplicate_count = excluded.duplicate_count,
              rejected_json = excluded.rejected_json,
              server_time = excluded.server_time,
              recorded_at = excluded.recorded_at
          `,
        )
        .run(
          ack.batchId,
          ack.ackedThroughSequence,
          ack.acceptedCount,
          ack.duplicateCount,
          JSON.stringify(ack.rejected),
          ack.serverTime,
          recordedAt,
        );

      this.db
        .prepare(
          `
            UPDATE outbound_events
            SET acked_at = COALESCE(acked_at, ?)
            WHERE sequence <= ?
          `,
        )
        .run(ack.serverTime, effectiveAckSequence);

      this.db
        .prepare(
          `
            UPDATE daemon_state
            SET last_acked_sequence = ?, last_server_time = ?, updated_at = ?
            WHERE singleton = ?
          `,
        )
        .run(effectiveAckSequence, ack.serverTime, recordedAt, DAEMON_STATE_SINGLETON);

      this.refreshObservedFileAcknowledgements();

      return ack;
    });
  }

  getObservedFile(projectId: string, filePath: string): ObservedFileState | null {
    const row = this.db
      .prepare(
        `
          SELECT
            project_id,
            file_path,
            byte_offset,
            snapshot_hash,
            last_event_sequence,
            updated_at
          FROM observed_files
          WHERE project_id = ? AND file_path = ?
        `,
      )
      .get(projectId, filePath) as unknown as ObservedFileRow | undefined;

    return row ? mapObservedFileRow(row) : null;
  }

  getObservedWorktree(projectId: string, worktreeId: string): ObservedWorktreeState | null {
    const row = this.db
      .prepare(
        `
          SELECT
            project_id,
            worktree_id,
            repo_root_path,
            worktree_path,
            branch,
            head_sha,
            is_dirty,
            untracked_count,
            ahead_count,
            behind_count,
            snapshot_hash,
            first_seen_at,
            last_observed_at,
            last_changed_at,
            last_event_sequence
          FROM observed_worktrees
          WHERE project_id = ? AND worktree_id = ?
        `,
      )
      .get(projectId, worktreeId) as unknown as ObservedWorktreeRow | undefined;

    return row ? mapObservedWorktreeRow(row) : null;
  }

  listObservedWorktrees(projectId: string): ObservedWorktreeState[] {
    const rows = this.db
      .prepare(
        `
          SELECT
            project_id,
            worktree_id,
            repo_root_path,
            worktree_path,
            branch,
            head_sha,
            is_dirty,
            untracked_count,
            ahead_count,
            behind_count,
            snapshot_hash,
            first_seen_at,
            last_observed_at,
            last_changed_at,
            last_event_sequence
          FROM observed_worktrees
          WHERE project_id = ?
          ORDER BY worktree_path ASC
        `,
      )
      .all(projectId) as unknown as ObservedWorktreeRow[];

    return rows.map((row) => mapObservedWorktreeRow(row));
  }

  upsertObservedWorktree(input: UpsertObservedWorktreeInput): ObservedWorktreeState {
    const now = input.observedAt;
    const changedAt = input.changedAt ?? now;

    this.db
      .prepare(
        `
          INSERT INTO observed_worktrees (
            project_id,
            worktree_id,
            repo_root_path,
            worktree_path,
            branch,
            head_sha,
            is_dirty,
            untracked_count,
            ahead_count,
            behind_count,
            snapshot_hash,
            first_seen_at,
            last_observed_at,
            last_changed_at,
            last_event_sequence
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(project_id, worktree_id) DO UPDATE SET
            repo_root_path = excluded.repo_root_path,
            worktree_path = excluded.worktree_path,
            branch = excluded.branch,
            head_sha = excluded.head_sha,
            is_dirty = excluded.is_dirty,
            untracked_count = excluded.untracked_count,
            ahead_count = excluded.ahead_count,
            behind_count = excluded.behind_count,
            snapshot_hash = excluded.snapshot_hash,
            last_observed_at = excluded.last_observed_at,
            last_changed_at = excluded.last_changed_at,
            last_event_sequence = excluded.last_event_sequence
        `,
      )
      .run(
        input.projectId,
        input.worktreeId,
        input.repoRootPath ?? null,
        input.worktreePath,
        input.branch ?? null,
        input.headSha ?? null,
        input.isDirty ? 1 : 0,
        input.untrackedCount,
        input.aheadCount ?? null,
        input.behindCount ?? null,
        input.snapshotHash,
        now,
        now,
        changedAt,
        input.lastEventSequence ?? null,
      );

    return this.getObservedWorktree(input.projectId, input.worktreeId) as ObservedWorktreeState;
  }

  getState(): LocalDaemonState {
    const state = this.getStateRow();
    const counts = this.db
      .prepare(
        `
          SELECT
            (SELECT COUNT(*) FROM configured_projects) AS configured_project_count,
            (SELECT COUNT(*) FROM observed_files) AS observed_file_count,
            (SELECT COUNT(*) FROM observed_worktrees) AS observed_worktree_count,
            (SELECT COUNT(*) FROM outbound_events) AS queued_event_count,
            (SELECT COUNT(*) FROM outbound_events WHERE sequence > ?) AS pending_event_count,
            (SELECT COUNT(*) FROM outbound_events WHERE sequence <= ?) AS acked_event_count
        `,
      )
      .get(state.last_acked_sequence, state.last_acked_sequence) as Record<string, number>;

    return {
      nextSequence: state.next_sequence,
      lastAckedSequence: state.last_acked_sequence,
      lastServerTime: state.last_server_time,
      configuredProjectCount: counts.configured_project_count,
      observedFileCount: counts.observed_file_count,
      observedWorktreeCount: counts.observed_worktree_count,
      queuedEventCount: counts.queued_event_count,
      pendingEventCount: counts.pending_event_count,
      ackedEventCount: counts.acked_event_count,
    };
  }

  private initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS daemon_state (
        singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
        next_sequence INTEGER NOT NULL DEFAULT 1,
        last_acked_sequence INTEGER NOT NULL DEFAULT 0,
        last_server_time TEXT,
        updated_at TEXT NOT NULL
      );

      INSERT INTO daemon_state (singleton, next_sequence, last_acked_sequence, last_server_time, updated_at)
      VALUES (1, 1, 0, NULL, CURRENT_TIMESTAMP)
      ON CONFLICT(singleton) DO NOTHING;

      CREATE TABLE IF NOT EXISTS configured_projects (
        project_id TEXT PRIMARY KEY,
        project_slug TEXT,
        project_name TEXT,
        local_root_path TEXT NOT NULL,
        telemetry_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS observed_files (
        project_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        byte_offset INTEGER NOT NULL DEFAULT 0,
        snapshot_hash TEXT,
        last_event_sequence INTEGER,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (project_id, file_path)
      );

      CREATE TABLE IF NOT EXISTS observed_worktrees (
        project_id TEXT NOT NULL,
        worktree_id TEXT NOT NULL,
        repo_root_path TEXT,
        worktree_path TEXT NOT NULL,
        branch TEXT,
        head_sha TEXT,
        is_dirty INTEGER NOT NULL DEFAULT 0,
        untracked_count INTEGER NOT NULL DEFAULT 0,
        ahead_count INTEGER,
        behind_count INTEGER,
        snapshot_hash TEXT NOT NULL,
        first_seen_at TEXT NOT NULL,
        last_observed_at TEXT NOT NULL,
        last_changed_at TEXT NOT NULL,
        last_event_sequence INTEGER,
        PRIMARY KEY (project_id, worktree_id)
      );

      CREATE TABLE IF NOT EXISTS outbound_events (
        sequence INTEGER PRIMARY KEY,
        event_id TEXT NOT NULL UNIQUE,
        project_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        occurred_at TEXT NOT NULL,
        event_json TEXT NOT NULL,
        source_file_path TEXT,
        source_offset INTEGER,
        snapshot_hash TEXT,
        acked_at TEXT,
        created_at TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS outbound_events_source_dedupe_idx
      ON outbound_events (project_id, source_file_path, source_offset, snapshot_hash)
      WHERE source_file_path IS NOT NULL
        AND source_offset IS NOT NULL
        AND snapshot_hash IS NOT NULL;

      CREATE TABLE IF NOT EXISTS server_acknowledgements (
        batch_id TEXT PRIMARY KEY,
        acked_through_sequence INTEGER NOT NULL,
        accepted_count INTEGER NOT NULL,
        duplicate_count INTEGER NOT NULL DEFAULT 0,
        rejected_json TEXT NOT NULL,
        server_time TEXT NOT NULL,
        recorded_at TEXT NOT NULL
      );
    `);
  }

  private getStateRow(): DaemonStateRow {
    return this.db
      .prepare(
        `
          SELECT next_sequence, last_acked_sequence, last_server_time
          FROM daemon_state
          WHERE singleton = ?
        `,
      )
      .get(DAEMON_STATE_SINGLETON) as unknown as DaemonStateRow;
  }

  private getEventBySequence(sequence: number): QueuedEventRecord {
    const row = this.db
      .prepare(
        `
          SELECT
            sequence,
            event_id,
            event_json,
            source_file_path,
            source_offset,
            snapshot_hash,
            acked_at,
            created_at
          FROM outbound_events
          WHERE sequence = ?
        `,
      )
      .get(sequence) as unknown as QueuedEventRow;

    return mapQueuedEventRow(row);
  }

  private findEventBySource(
    projectId: string,
    filePath: string,
    offset: number,
    snapshotHash: string,
  ): QueuedEventRecord | null {
    const row = this.db
      .prepare(
        `
          SELECT
            sequence,
            event_id,
            event_json,
            source_file_path,
            source_offset,
            snapshot_hash,
            acked_at,
            created_at
          FROM outbound_events
          WHERE project_id = ?
            AND source_file_path = ?
            AND source_offset = ?
            AND snapshot_hash = ?
        `,
      )
      .get(projectId, filePath, offset, snapshotHash) as unknown as QueuedEventRow | undefined;

    return row ? mapQueuedEventRow(row) : null;
  }

  private refreshObservedFileAcknowledgements() {
    const rows = this.db
      .prepare(
        `
          SELECT
            project_id,
            source_file_path,
            source_offset,
            snapshot_hash,
            sequence
          FROM outbound_events
          WHERE acked_at IS NOT NULL
            AND source_file_path IS NOT NULL
            AND source_offset IS NOT NULL
          ORDER BY sequence ASC
        `,
      )
      .all() as unknown as Array<{
        project_id: string;
        source_file_path: string;
        source_offset: number;
        snapshot_hash: string | null;
        sequence: number;
      }>;

    const latestByFile = new Map<string, (typeof rows)[number]>();

    for (const row of rows) {
      latestByFile.set(`${row.project_id}\u0000${row.source_file_path}`, row);
    }

    const updateObserved = this.db.prepare(`
      UPDATE observed_files
      SET byte_offset = ?, snapshot_hash = ?, last_event_sequence = ?, updated_at = ?
      WHERE project_id = ? AND file_path = ?
    `);
    const now = new Date().toISOString();

    for (const row of latestByFile.values()) {
      updateObserved.run(
        row.source_offset,
        row.snapshot_hash,
        row.sequence,
        now,
        row.project_id,
        row.source_file_path,
      );
    }
  }

  private withTransaction<T>(work: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');

    try {
      const result = work();
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
}

export const openLocalDaemonDb = async (paths: DaemonPaths) => {
  await ensureLocalDbDirectory(paths);
  return new LocalDaemonDb(paths.localDbPath);
};

const mapQueuedEventRow = (row: QueuedEventRow): QueuedEventRecord => ({
  sequence: row.sequence,
  eventId: row.event_id,
  event: cockpitEventSchema.parse(JSON.parse(row.event_json) as unknown),
  sourceFilePath: row.source_file_path,
  sourceOffset: row.source_offset,
  snapshotHash: row.snapshot_hash,
  ackedAt: row.acked_at,
  createdAt: row.created_at,
});

const mapObservedFileRow = (row: ObservedFileRow): ObservedFileState => ({
  projectId: row.project_id,
  filePath: row.file_path,
  byteOffset: row.byte_offset,
  snapshotHash: row.snapshot_hash,
  lastEventSequence: row.last_event_sequence,
  updatedAt: row.updated_at,
});

const mapObservedWorktreeRow = (row: ObservedWorktreeRow): ObservedWorktreeState => ({
  projectId: row.project_id,
  worktreeId: row.worktree_id,
  repoRootPath: row.repo_root_path,
  worktreePath: row.worktree_path,
  branch: row.branch,
  headSha: row.head_sha,
  isDirty: row.is_dirty === 1,
  untrackedCount: row.untracked_count,
  aheadCount: row.ahead_count,
  behindCount: row.behind_count,
  snapshotHash: row.snapshot_hash,
  firstSeenAt: row.first_seen_at,
  lastObservedAt: row.last_observed_at,
  lastChangedAt: row.last_changed_at,
  lastEventSequence: row.last_event_sequence,
});

const resolveProjectId = (event: QueueEventInput['event']) => {
  if (!('projectId' in event) || typeof event.projectId !== 'string' || event.projectId.length === 0) {
    throw new Error('Queued daemon events must include a projectId.');
  }

  return event.projectId;
};
