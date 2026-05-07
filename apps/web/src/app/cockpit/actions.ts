'use server';

/**
 * Server actions for the cockpit UI pages.
 *
 * All mutations require an active GitHub/admin session (enforced by
 * `requireAdminSession`).  Callers that run from Client Components invoke
 * these via `import { ... } from '@/app/cockpit/actions'` – the `'use server'`
 * directive ensures the action bodies only ever run on the server.
 */

import { auth } from 'auth';
import { requireAdminSession } from '@/lib/authz';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { logger } from '@/lib/logger';

// ── Projects ───────────────────────────────────────────────────────────────────

export interface CreateProjectInput {
  projectId: string;
  projectSlug?: string;
  projectName?: string | null;
  localRootPath?: string | null;
}

export async function createProjectAction(input: CreateProjectInput) {
  const session = await auth();
  requireAdminSession(session, '/cockpit');

  const repo = getCockpitRepository();
  return repo.createProject({
    projectId: input.projectId,
    projectSlug: input.projectSlug,
    projectName: input.projectName,
    localRootPath: input.localRootPath,
  });
}

export async function listProjectsAction() {
  const session = await auth();
  requireAdminSession(session, '/cockpit');

  const repo = getCockpitRepository();
  return repo.listProjects();
}

// ── Devices ────────────────────────────────────────────────────────────────────

/**
 * Returns all pending (not-yet-approved) pairing requests so the UI can
 * display them for approval.  The `deviceCode` and `rawToken` fields are
 * never included in the response.
 */
export async function listPendingPairingsAction() {
  const session = await auth();
  requireAdminSession(session, '/cockpit');

  const repo = getCockpitRepository();
  return repo.listPendingDevicePairings();
}

export interface ApproveDeviceInput {
  /** The human-readable user code displayed on the daemon's terminal. */
  userCode: string;
  /** Optional label for this token (e.g. "dev-laptop-2026"). */
  tokenLabel?: string | null;
}

/**
 * Approves a pending device-code pairing request.
 *
 * Creates the device record in the database, generates a bearer token,
 * stores the token hash in the database, and makes the plaintext token
 * available for the daemon to exchange via /api/cockpit/devices/exchange.
 *
 * Returns the approved device record (no token – the raw token is only
 * accessible once via the exchange endpoint).
 */
export async function approveDeviceAction(input: ApproveDeviceInput) {
  const session = await auth();
  requireAdminSession(session, '/cockpit');

  const repo = getCockpitRepository();
  const pairing = await repo.approveDevicePairing({
    userCode: input.userCode,
    tokenLabel: input.tokenLabel ?? `token-${new Date().toISOString().slice(0, 10)}`,
    approvedBy: session?.user?.email ?? null,
  });

  return { pairing };
}

export interface RevokeDeviceInput {
  deviceId: string;
  reason?: string | null;
}

export async function revokeDeviceAction(input: RevokeDeviceInput) {
  const session = await auth();
  requireAdminSession(session, '/cockpit');

  const repo = getCockpitRepository();

  const device = await repo.revokeDevice({
    deviceId: input.deviceId,
    reason: input.reason,
  });

  logger.info({
    event: 'cockpit.device.revoked',
    deviceId: input.deviceId,
    reason: input.reason ?? null,
  });

  return device;
}

// ── Raw-event pruning ──────────────────────────────────────────────────────────

export interface PruneProjectEventsInput {
  /**
   * Scope the prune to a single project.  Pass `null` or omit to prune across
   * all projects (requires `occurredBefore`).
   */
  projectId?: string | null;
  /**
   * Delete events with sequence ≤ this value.  Useful when the projection is
   * confirmed clean and you want to reclaim space for a specific project.
   */
  throughSequence?: number | null;
  /**
   * Delete events that occurred before this ISO-8601 timestamp.  Safe to use
   * for time-based retention without knowing the exact sequence.
   */
  occurredBefore?: string | null;
  /** Human-readable reason stored in the audit log. */
  reason?: string | null;
}

export interface PruneProjectEventsResult {
  deletedEventCount: number;
  projectsAffected: string[];
  pruneRunId: string;
}

/**
 * Prune raw cockpit events for an authenticated operator.
 *
 * At least one of `throughSequence` or `occurredBefore` must be provided.
 * The operation is logged to `cockpit_manual_prune_runs` by the repository
 * layer, and a structured log entry is emitted here for observability.
 *
 * Safe to run while the daemon is streaming — `pruneRawEvents` operates in
 * a single transaction and does not block event ingestion.
 */
export async function pruneProjectEventsAction(
  input: PruneProjectEventsInput,
): Promise<PruneProjectEventsResult> {
  const session = await auth();
  requireAdminSession(session, '/cockpit');

  if (input.throughSequence == null && input.occurredBefore == null) {
    throw new Error('Provide throughSequence or occurredBefore to limit the prune scope');
  }

  const repo = getCockpitRepository();

  const result = await repo.pruneRawEvents({
    projectId: input.projectId ?? undefined,
    throughSequence: input.throughSequence ?? undefined,
    occurredBefore: input.occurredBefore ? new Date(input.occurredBefore) : undefined,
    requestedBy: session?.user?.email ?? null,
    reason: input.reason ?? null,
  });

  logger.info({
    event: 'cockpit.prune.completed',
    project_id: input.projectId ?? null,
    through_sequence: input.throughSequence ?? null,
    occurred_before: input.occurredBefore ?? null,
    deleted_event_count: result.deletedEventCount,
    projects_affected: result.projectsAffected,
    prune_run_id: result.pruneRun.pruneRunId,
  });

  return {
    deletedEventCount: result.deletedEventCount,
    projectsAffected: result.projectsAffected,
    pruneRunId: result.pruneRun.pruneRunId,
  };
}
