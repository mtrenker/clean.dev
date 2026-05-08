/**
 * POST /api/cockpit/projects/[projectId]/reproject
 *
 * Forces a full re-projection of a project from sequence 0.
 *
 * Resets the projection checkpoint so the background projector will re-fold
 * every raw event on its next cycle.  The response body includes the raw
 * sequence high-water mark and the (now-reset) projected sequence so callers
 * can confirm the lag before the projector runs.
 *
 * ## Recovery guide (no DB access required)
 *
 * **Symptom: dashboard shows stale data despite daemon being connected**
 * 1. Check `GET /api/cockpit/projects/[projectId]/status` — compare
 *    `rawMaxSequence` vs `projectedSequence`.
 * 2. If `sequenceLag > 0`, the projector is behind. POST this endpoint.
 * 3. Wait a few seconds for the background projector cycle, then refresh.
 *
 * **Symptom: projection error left an inconsistent snapshot**
 * 1. POST this endpoint to reset the checkpoint.
 * 2. The next projector cycle folds all events from scratch.
 *
 * **Symptom: daemon offline / ingestion stopped**
 * 1. `GET /api/cockpit/projects/[projectId]/status` — `rawMaxSequence` will
 *    have stopped advancing.  Re-projecting won't help — restart the daemon.
 *
 * **Symptom: UI cache stale (snapshot present but old)**
 * 1. `isDirty = false` and `projectedAt` is recent — this is a browser
 *    cache issue.  Do a hard-refresh (Ctrl+Shift+R) or hit the Refresh
 *    button on the dashboard.
 *
 * Requires an active admin session.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { isAdminSession } from '@/lib/authz';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { logger } from '@/lib/logger';

async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const session = await auth();
  const { projectId } = await params;

  const repo = getCockpitRepository();

  const project = await repo.getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  try {
    // Capture pre-reset status so the response shows the lag that was cleared.
    const statusBefore = await repo.getProjectionStatus(projectId);

    await repo.resetProjectionCheckpoint(projectId, session?.user?.email ?? null);

    logger.info({
      event: 'cockpit.projection.force_reproject',
      projectId,
      requestedBy: session?.user?.email ?? null,
      raw_max_sequence_before: statusBefore?.rawMaxSequence ?? null,
      projected_sequence_before: statusBefore?.projectedSequence ?? 0,
      sequence_lag_before: statusBefore?.sequenceLag ?? null,
    });

    return NextResponse.json({
      projectId,
      triggeredAt: new Date().toISOString(),
      sequenceLagCleared: statusBefore?.sequenceLag ?? null,
      rawMaxSequence: statusBefore?.rawMaxSequence ?? null,
      message:
        'Projection checkpoint reset. The background projector will re-fold all events on its next cycle (within a few seconds).',
    });
  } catch (err) {
    logger.error({
      event: 'cockpit.projection.force_reproject_error',
      projectId,
      error: String(err),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
