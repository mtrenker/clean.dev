/**
 * GET /api/cockpit/daemon/projects/[projectId]/config
 *
 * Daemon-facing endpoint that returns the server-defined observation and
 * telemetry config for a specific project.  The daemon uses this to merge
 * server-defined defaults with safe local overrides.
 *
 * Authentication: daemon bearer token (NOT a browser session).
 *
 * Response 200:
 *   {
 *     projectId:        string
 *     projectSlug:      string | null
 *     projectName:      string | null
 *     worktreeRootPath: string | null
 *     observation:      ProjectObservationConfig | null
 *     telemetry:        TelemetryProfile | null
 *   }
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { authenticateCockpitDaemon } from '@/lib/cockpit-security';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const repo = getCockpitRepository();
  const daemon = await authenticateCockpitDaemon(request, repo);
  if (!daemon) {
    return NextResponse.json(
      { error: 'Unauthorized – valid daemon bearer token required' },
      { status: 401 },
    );
  }

  const { projectId } = await params;

  try {
    const project = await repo.getProject(projectId);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      projectId: project.projectId,
      projectSlug: project.projectSlug ?? null,
      projectName: project.projectName ?? null,
      worktreeRootPath: project.worktreeRootPath ?? null,
      observation: project.observation ?? null,
      telemetry: project.telemetry ?? null,
    });
  } catch (err) {
    console.error('[cockpit/daemon/projects/config] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
