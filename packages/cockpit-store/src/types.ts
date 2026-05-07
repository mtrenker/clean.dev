import type { CockpitEvent, EventBatchAck, TelemetryProfile } from '@cleandev/cockpit-protocol';

export type {
  CockpitProjectedPlanState,
  CockpitProjectedProjectState,
  CockpitProjectedTaskState,
} from '@cleandev/pm';

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
} from '@cleandev/pm';

export type CockpitProjectRecord = typeof cockpitProjects.$inferSelect;
export type CockpitPairedDeviceRecord = typeof cockpitPairedDevices.$inferSelect;
export type CockpitDevicePairingRecord = typeof cockpitDevicePairings.$inferSelect;
export type CockpitDeviceTokenRecord = typeof cockpitDeviceTokens.$inferSelect;
export type CockpitDeviceSessionRecord = typeof cockpitDeviceSessions.$inferSelect;
export type CockpitRawEventRecord = typeof cockpitRawEvents.$inferSelect;
export type CockpitProjectedProjectStateRecord = typeof cockpitProjectedProjectState.$inferSelect;
export type CockpitManualPruneRunRecord = typeof cockpitManualPruneRuns.$inferSelect;

export interface CreateCockpitProjectInput {
  projectId: string;
  projectSlug?: string;
  projectName?: string | null;
  localRootPath?: string | null;
  telemetry?: TelemetryProfile;
}

export interface CreateCockpitDeviceInput {
  deviceId: string;
  deviceName: string;
  instanceName?: string | null;
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
  telemetry?: TelemetryProfile;
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
  telemetry?: TelemetryProfile;
  latestEventId: string;
  latestSequence: number;
  latestOccurredAt: string;
}

export interface ListCockpitDevicesInput {
  /** If true, include revoked devices. Defaults to false. */
  includeRevoked?: boolean;
}

export interface ICockpitRepository {
  createProject(input: CreateCockpitProjectInput): Promise<CockpitProjectRecord>;
  listProjects(): Promise<CockpitProjectRecord[]>;
  createDevice(input: CreateCockpitDeviceInput): Promise<CreateCockpitDeviceResult>;
  listDevices(input?: ListCockpitDevicesInput): Promise<CockpitPairedDeviceRecord[]>;
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
}
