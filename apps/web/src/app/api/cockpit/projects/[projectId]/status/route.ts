/**
 * GET /api/cockpit/projects/[projectId]/status
 *
 * Returns the projection health snapshot for a single project so operators
 * can distinguish the four common failure modes without direct DB access:
 *
 * | Condition                         | rawMaxSequence | isDirty | sequenceLag |
 * |-----------------------------------|----------------|---------|-------------|
 * | Daemon offline, no events yet     | null           | false   | null        |
 * | Daemon connected, projector OK    | N              | false   | 0           |
 * | Daemon streaming, projector lag   | N              | true    | > 0         |
 * | Projection error (bad checkpoint) | N              | false   | > 0         |
 * | Events exist but not projected    | N              | true    | > 0         |
 *
 * Requires an active admin session.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { isAdminSession } from '@/lib/authz';
import { getCockpitRepository } from '@/lib/cockpit-repo';

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { projectId } = await params;

  try {
    const repo = getCockpitRepository();
    const status = await repo.getProjectionStatus(projectId);

    if (!status) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      projectId: status.projectId,
      rawMaxSequence: status.rawMaxSequence,
      projectedSequence: status.projectedSequence,
      sequenceLag: status.sequenceLag,
      isDirty: status.isDirty,
      dirtyMarkedAt: status.dirtyMarkedAt?.toISOString() ?? null,
      projectedAt: status.projectedAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error('[cockpit/projects/status] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
