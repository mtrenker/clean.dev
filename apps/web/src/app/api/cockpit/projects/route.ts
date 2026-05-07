/**
 * GET  /api/cockpit/projects  – list all projects
 * POST /api/cockpit/projects  – create (or upsert) a project
 *
 * Both routes require an active admin session (GitHub OAuth, role = "admin").
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { isAdminSession } from '@/lib/authz';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { readLimitedJson } from '@/lib/cockpit-security';

// ── Auth helper ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null; // null = access granted
}

// ── GET /api/cockpit/projects ─────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const repo = getCockpitRepository();
    const projects = await repo.listProjects();
    return NextResponse.json({ projects });
  } catch (err) {
    console.error('[cockpit/projects] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST /api/cockpit/projects ────────────────────────────────────────────────

interface CreateProjectBody {
  projectId: string;
  projectSlug?: string;
  projectName?: string | null;
  localRootPath?: string | null;
}

function validateCreateProjectBody(
  body: unknown,
): { data: CreateProjectBody } | { error: string } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw.projectId !== 'string' || !raw.projectId.trim() || raw.projectId.length > 160) {
    return { error: 'projectId is required and must be a non-empty string up to 160 characters' };
  }

  if (raw.projectSlug !== undefined && (typeof raw.projectSlug !== 'string' || raw.projectSlug.length > 160)) {
    return { error: 'projectSlug must be a string up to 160 characters when provided' };
  }

  if (typeof raw.projectName === 'string' && raw.projectName.length > 512) {
    return { error: 'projectName must be 512 characters or fewer' };
  }

  if (typeof raw.localRootPath === 'string' && raw.localRootPath.length > 2_000) {
    return { error: 'localRootPath must be 2000 characters or fewer' };
  }

  return {
    data: {
      projectId: raw.projectId.trim(),
      projectSlug: typeof raw.projectSlug === 'string' ? raw.projectSlug.trim() : undefined,
      projectName: typeof raw.projectName === 'string' ? raw.projectName.trim() : null,
      localRootPath: typeof raw.localRootPath === 'string' ? raw.localRootPath.trim() : null,
    },
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = await readLimitedJson(request);
  if ('response' in parsed) return parsed.response;

  const result = validateCreateProjectBody(parsed.data);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  try {
    const repo = getCockpitRepository();
    const project = await repo.createProject(result.data);
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error('[cockpit/projects] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
