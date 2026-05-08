/**
 * GET  /api/cockpit/projects/[projectId]/config  – get project observation config
 * PATCH /api/cockpit/projects/[projectId]/config  – update project observation/telemetry config
 *
 * Both routes require an active admin session (GitHub OAuth, role = "admin").
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import {
  projectObservationConfigSchema,
  telemetryProfileSchema,
} from '@cleandev/cockpit-protocol';
import { isAdminSession } from '@/lib/authz';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { readLimitedJson } from '@/lib/cockpit-security';

// ── Auth helper ────────────────────────────────────────────────────────────────

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

// ── GET /api/cockpit/projects/[projectId]/config ──────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { projectId } = await params;

  try {
    const repo = getCockpitRepository();
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
    console.error('[cockpit/projects/config] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH /api/cockpit/projects/[projectId]/config ────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { projectId } = await params;

  const parsed = await readLimitedJson(request);
  if ('response' in parsed) return parsed.response;

  const body = parsed.data;

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 422 });
  }

  const raw = body as Record<string, unknown>;

  // Parse observation if provided
  let observation: ReturnType<typeof projectObservationConfigSchema.parse> | null | undefined;
  if ('observation' in raw) {
    if (raw.observation === null) {
      observation = null;
    } else {
      const obsResult = projectObservationConfigSchema.safeParse(raw.observation);
      if (!obsResult.success) {
        return NextResponse.json(
          { error: `Invalid observation config: ${obsResult.error.message}` },
          { status: 422 },
        );
      }
      observation = obsResult.data;
    }
  }

  // Parse telemetry if provided
  let telemetry: ReturnType<typeof telemetryProfileSchema.parse> | null | undefined;
  if ('telemetry' in raw) {
    if (raw.telemetry === null) {
      telemetry = null;
    } else {
      const telResult = telemetryProfileSchema.safeParse(raw.telemetry);
      if (!telResult.success) {
        return NextResponse.json(
          { error: `Invalid telemetry config: ${telResult.error.message}` },
          { status: 422 },
        );
      }
      telemetry = telResult.data;
    }
  }

  // Parse worktreeRootPath if provided
  let worktreeRootPath: string | null | undefined;
  if ('worktreeRootPath' in raw) {
    if (raw.worktreeRootPath === null) {
      worktreeRootPath = null;
    } else if (typeof raw.worktreeRootPath === 'string') {
      if (raw.worktreeRootPath.length > 2_000) {
        return NextResponse.json(
          { error: 'worktreeRootPath must be 2000 characters or fewer' },
          { status: 422 },
        );
      }
      worktreeRootPath = raw.worktreeRootPath.trim();
    } else {
      return NextResponse.json(
        { error: 'worktreeRootPath must be a string or null' },
        { status: 422 },
      );
    }
  }

  try {
    const repo = getCockpitRepository();

    // Ensure project exists
    const existing = await repo.getProject(projectId);
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = await repo.updateProjectConfig({
      projectId,
      observation,
      telemetry,
      worktreeRootPath,
    });

    return NextResponse.json({
      projectId: project.projectId,
      projectSlug: project.projectSlug ?? null,
      projectName: project.projectName ?? null,
      worktreeRootPath: project.worktreeRootPath ?? null,
      observation: project.observation ?? null,
      telemetry: project.telemetry ?? null,
    });
  } catch (err) {
    console.error('[cockpit/projects/config] PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
