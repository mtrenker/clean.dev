import type {
  CockpitEvent,
  DeviceObservationMetadata,
  EventBatchAck,
  ProjectObservationConfig,
  TelemetryProfile,
} from '@cleandev/cockpit-protocol';

export type {
  CockpitProjectedPlanState,
  CockpitProjectedProjectState,
  CockpitProjectedTaskState,
} from '@cleandev/db';

import type {
  CockpitProjectedProjectState,
  cockpitDevicePairings,
  cockpitDeviceSessions,
  cockpitDeviceTokens,
  cockpitManualPruneRuns,
  cockpitPairedDevices,
  cockpitProjects,
  cockpitProjectedProjectState,
  cockpitRawEvents,
  cockpitTaskDetails,
} from '@cleandev/db';

export type CockpitProjectRecord = typeof cockpitProjects.$inferSelect;
export type CockpitPairedDeviceRecord = typeof cockpitPairedDevices.$inferSelect;
export type CockpitDevicePairingRecord = typeof cockpitDevicePairings.$inferSelect;
export type CockpitDeviceTokenRecord = typeof cockpitDeviceTokens.$inferSelect;
export type CockpitDeviceSessionRecord = typeof cockpitDeviceSessions.$inferSelect;
export type CockpitRawEventRecord = typeof cockpitRawEvents.$inferSelect;
export type CockpitProjectedProjectStateRecord = typeof cockpitProjectedProjectState.$inferSelect;
export type CockpitManualPruneRunRecord = typeof cockpitManualPruneRuns.$inferSelect;
export type CockpitTaskDetailRecord = typeof cockpitTaskDetails.$inferSelect;

export interface CreateCockpitProjectInput {
  projectId: string;
  projectSlug?: string;
  projectName?: string | null;
  localRootPath?: string | null;
  worktreeRootPath?: string | null;
  telemetry?: TelemetryProfile;
  observation?: ProjectObservationConfig;
}

export interface UpdateCockpitProjectConfigInput {
  projectId: string;
  observation?: ProjectObservationConfig | null;
  telemetry?: TelemetryProfile | null;
  worktreeRootPath?: string | null;
}

export interface CreateCockpitDeviceInput {
  deviceId: string;
  deviceName: string;
  instanceName?: string | null;
  metadata?: DeviceObservationMetadata | null;
  tokenHash?: string;
  tokenLabel?: string | null;
  expiresAt?: string | Date | null;
}

export interface CreateCockpitDeviceResult {
  device: CockpitPairedDeviceRecord;
  token: CockpitDeviceTokenRecord | null;
}

export interface RevokeCockpitDeviceInput {
  deviceId: string;
  reason?: string | null;
}

export interface CreateCockpitDevicePairingInput {
  deviceCodeHash: string;
  userCode: string;
  deviceId: string;
  deviceName: string;
  instanceName?: string | null;
  expiresAt: string | Date;
}

export interface ApproveCockpitDevicePairingInput {
  userCode: string;
  tokenLabel?: string | null;
  approvedBy?: string | null;
}

export interface ExchangeCockpitDevicePairingInput {
  deviceCodeHash: string;
  deviceId: string;
  tokenHash: string;
  fallbackTokenLabel?: string | null;
}

export type ExchangeCockpitDevicePairingResult =
  | { status: 'pending' | 'expired' | 'device_mismatch'; pairing: CockpitDevicePairingRecord | null; device: null; token: null }
  | { status: 'approved'; pairing: CockpitDevicePairingRecord; device: CockpitPairedDeviceRecord; token: CockpitDeviceTokenRecord | null };

export interface CreateCockpitSessionInput {
  sessionId: string;
  deviceId: string;
  tokenId?: string | null;
  connectionId?: string | null;
  instanceName?: string | null;
  lastAckedSequence?: number;
}

export interface InsertCockpitEventBatchInput {
  batchId: string;
  sentAt: string;
  events: CockpitEvent[];
}

export interface MarkCockpitProjectDirtyInput {
  projectId: string;
  projectSlug?: string;
  projectName?: string | null;
  localRootPath?: string | null;
  worktreeRootPath?: string | null;
  telemetry?: TelemetryProfile;
  observation?: ProjectObservationConfig;
  latestEventId?: string | null;
  latestEventSequence?: number;
}

export interface UpsertProjectedProjectStateInput {
  projectId: string;
  state: CockpitProjectedProjectState;
  latestEventId?: string | null;
  latestEventSequence: number;
  projectedAt?: string | Date;
}

export interface SetTaskArchiveReviewInput {
  projectId: string;
  taskId: string;
  /** Source the task was emitted from. Defaults to 'archive'. */
  source?: 'live' | 'archive';
  reviewStatus: 'pending' | 'reviewed' | 'dismissed';
  reviewNotes?: string | null;
  reviewedBy?: string | null;
}

export interface SetPlanArchiveReviewInput {
  projectId: string;
  planId: string;
  reviewStatus: 'pending' | 'reviewed' | 'dismissed';
  reviewNotes?: string | null;
  reviewedBy?: string | null;
}

export interface PruneCockpitRawEventsInput {
  projectId?: string;
  throughSequence?: number;
  occurredBefore?: string | Date;
  requestedBy?: string | null;
  reason?: string | null;
}

export interface PruneCockpitRawEventsResult {
  deletedEventCount: number;
  projectsAffected: string[];
  pruneRun: CockpitManualPruneRunRecord;
}

export interface CockpitProjectEventSummary {
  projectId: string;
  projectSlug?: string;
  projectName?: string | null;
  localRootPath?: string | null;
  worktreeRootPath?: string | null;
  telemetry?: TelemetryProfile;
  observation?: ProjectObservationConfig;
  latestEventId: string;
  latestSequence: number;
  latestOccurredAt: string;
}

export interface ListCockpitDevicesInput {
  /** If true, include revoked devices. Defaults to false. */
  includeRevoked?: boolean;
}

/**
 * Token summary returned alongside a device in `listDevicesWithDetails`.
 *
 * The `tokenHash` field is intentionally absent — raw token values must never
 * be returned to the browser after the exchange step.
 */
export interface CockpitDeviceTokenSummary {
  tokenId: string;
  tokenLabel: string | null;
  issuedAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  revokedReason: string | null;
}

/**
 * Paired device enriched with session counts and latest token metadata.
 * Safe to return from API routes — no token hashes are included.
 */
export interface CockpitDeviceWithDetails extends CockpitPairedDeviceRecord {
  /** Number of open (not-ended) sessions for this device. */
  activeSessionCount: number;
  /** Most recently issued token (without the hash). Null if no token exists. */
  latestToken: CockpitDeviceTokenSummary | null;
  /** Highest raw-event sequence number emitted by this device; null if no events. */
  maxEventSequence: number | null;
}

/**
 * Projection health snapshot for a single project.
 *
 * Gives operators a quick view of the gap between raw ingestion and the
 * projected snapshot, so they can distinguish:
 *   - "daemon offline" (rawMaxSequence not advancing)
 *   - "ingestion stopped" (rawMaxSequence stuck, sessions closed)
 *   - "projection delayed" (rawMaxSequence > projectedSequence && isDirty)
 *   - "UI cache stale" (projectedAt old, but isDirty = false)
 */
export interface CockpitProjectionStatus {
  projectId: string;
  /**
   * Highest sequence number stored in `cockpit_raw_events` for this project.
   * Null if no events have been ingested yet.
   */
  rawMaxSequence: number | null;
  /**
   * Highest sequence the projector has successfully folded into the current
   * snapshot (the `latestEventSequence` column in `cockpit_projected_project_state`).
   */
  projectedSequence: number;
  /**
   * True when `cockpit_projects.projectionDirty = true`, meaning unprojected
   * events exist.  The projector will pick this up on the next cycle.
   */
  isDirty: boolean;
  /** When the project was last marked dirty (i.e., when events last arrived). */
  dirtyMarkedAt: Date | null;
  /** When the projector last wrote a snapshot for this project. */
  projectedAt: Date | null;
  /**
   * rawMaxSequence − projectedSequence.  Positive means the projector is
   * behind; null if no raw events exist.
   */
  sequenceLag: number | null;
}

export interface ICockpitRepository {
  createProject(input: CreateCockpitProjectInput): Promise<CockpitProjectRecord>;
  getProject(projectId: string): Promise<CockpitProjectRecord | null>;
  listProjects(): Promise<CockpitProjectRecord[]>;
  updateProjectConfig(input: UpdateCockpitProjectConfigInput): Promise<CockpitProjectRecord>;
  createDevice(input: CreateCockpitDeviceInput): Promise<CreateCockpitDeviceResult>;
  listDevices(input?: ListCockpitDevicesInput): Promise<CockpitPairedDeviceRecord[]>;
  /**
   * Like `listDevices` but enriches each record with active session count,
   * latest token summary (no hash), and the highest raw-event sequence emitted
   * by that device.
   */
  listDevicesWithDetails(input?: ListCockpitDevicesInput): Promise<CockpitDeviceWithDetails[]>;
  revokeDevice(input: RevokeCockpitDeviceInput): Promise<CockpitPairedDeviceRecord>;
  createDevicePairing(input: CreateCockpitDevicePairingInput): Promise<CockpitDevicePairingRecord>;
  findDevicePairingByUserCode(userCode: string): Promise<CockpitDevicePairingRecord | null>;
  listPendingDevicePairings(): Promise<CockpitDevicePairingRecord[]>;
  approveDevicePairing(input: ApproveCockpitDevicePairingInput): Promise<CockpitDevicePairingRecord>;
  exchangeDevicePairing(input: ExchangeCockpitDevicePairingInput): Promise<ExchangeCockpitDevicePairingResult>;
  createSession(input: CreateCockpitSessionInput): Promise<CockpitDeviceSessionRecord>;
  touchSession(sessionId: string, lastAckedSequence?: number): Promise<CockpitDeviceSessionRecord>;
  findActiveTokenByHash(tokenHash: string): Promise<CockpitDeviceTokenRecord | null>;
  insertEventBatch(input: InsertCockpitEventBatchInput): Promise<EventBatchAck>;
  markProjectDirty(input: MarkCockpitProjectDirtyInput): Promise<CockpitProjectRecord>;
  getProjectedProjectState(projectId: string): Promise<CockpitProjectedProjectState | null>;
  /** Returns the full projected-state DB record, including `latestEventSequence`. */
  getProjectedProjectStateRecord(projectId: string): Promise<CockpitProjectedProjectStateRecord | null>;
  upsertProjectedProjectState(input: UpsertProjectedProjectStateInput): Promise<CockpitProjectedProjectStateRecord>;
  pruneRawEvents(input: PruneCockpitRawEventsInput): Promise<PruneCockpitRawEventsResult>;
  /**
   * Returns projects that have `projectionDirty = true` and whose
   * `dirtyMarkedAt` is at least `minDirtyAgeMs` milliseconds in the past.
   *
   * This implements the debounce window: a project only becomes eligible for
   * projection after no new events have arrived for `minDirtyAgeMs`.
   */
  listDirtyProjects(minDirtyAgeMs: number): Promise<CockpitProjectRecord[]>;
  /**
   * Returns the raw `CockpitEvent` payloads for a project, ordered ascending
   * by sequence, with sequence strictly greater than `afterSequence`.
   *
   * @param projectId     Target project.
   * @param afterSequence Exclusive lower bound on sequence numbers.
   * @param limit         Maximum number of events to return (default 10 000).
   */
  listRawEventsSince(projectId: string, afterSequence: number, limit?: number): Promise<import('@cleandev/cockpit-protocol').CockpitEvent[]>;
  /**
   * Returns a snapshot of projection health for a project: the raw-ingestion
   * sequence high-water mark vs. the last-projected sequence, plus dirty/lag
   * metrics.  Null if the project doesn't exist.
   */
  getProjectionStatus(projectId: string): Promise<CockpitProjectionStatus | null>;
  /**
   * Forces a full re-projection of a project from sequence 0.
   *
   * Resets `latestEventSequence` to 0 in the projected-state record and marks
   * the project dirty so the background projector will pick it up on the next
   * cycle.  Safe to call while the daemon is streaming — the next projection
   * cycle will fold all events from the beginning and write a correct snapshot.
   *
   * @param projectId   Target project.
   * @param requestedBy E-mail of the admin who triggered the re-projection (audit).
   */
  resetProjectionCheckpoint(projectId: string, requestedBy?: string | null): Promise<void>;
  /**
   * Records an admin's archive-review verdict for an archived task.  Upserts a
   * row in `cockpit_task_details` and patches the projected-state JSON so the
   * UI can immediately reflect the new status without waiting for the next
   * projection cycle.  Operates atomically inside a single transaction.
   */
  setTaskArchiveReview(input: SetTaskArchiveReviewInput): Promise<void>;
  /**
   * Records an admin's archive-review verdict for an archived plan.  There is
   * no dedicated plan table, so this only patches the projected-state JSON's
   * plan archive metadata.  The next projection cycle re-derives the plan from
   * events; the patched verdict is preserved by re-applying the most recent
   * stored verdict on top of the recomputed state (best-effort).
   */
  setPlanArchiveReview(input: SetPlanArchiveReviewInput): Promise<void>;
  /**
   * Returns the archive-review verdicts persisted in `cockpit_task_details`
   * for a project, keyed by `taskId`.  Used to overlay the verdict onto the
   * projected task state in case a re-projection has not yet picked it up.
   */
  listTaskArchiveReviews(projectId: string): Promise<TaskArchiveReviewRecord[]>;
}

export interface TaskArchiveReviewRecord {
  taskId: string;
  source: 'live' | 'archive';
  reviewStatus: 'pending' | 'reviewed' | 'dismissed' | null;
  reviewNotes: string | null;
  reviewedAt: Date | null;
}
