/**
 * GET /api/cockpit/daemon/projects
 *
 * Daemon-facing endpoint that returns the list of cockpit projects.
 *
 * Authentication: daemon bearer token (NOT a browser session).
 * The token was issued during the device pairing flow and stored as a hash in
 * `cockpit_device_tokens`.
 *
 * Response 200:
 *   {
 *     projects: Array<{
 *       projectId:     string
 *       projectSlug:   string | null
 *       projectName:   string | null
 *       localRootPath: string | null
 *       createdAt:     string
 *     }>
 *   }
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { authenticateCockpitDaemon } from '@/lib/cockpit-security';

// ── Route handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const repo = getCockpitRepository();
  const daemon = await authenticateCockpitDaemon(request, repo);
  if (!daemon) {
    return NextResponse.json(
      { error: 'Unauthorized – valid daemon bearer token required' },
      { status: 401 },
    );
  }

  try {
    const projects = await repo.listProjects();

    return NextResponse.json({
      projects: projects.map((p) => ({
        projectId: p.projectId,
        projectSlug: p.projectSlug ?? null,
        projectName: p.projectName ?? null,
        localRootPath: p.localRootPath ?? null,
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
      })),
    });
  } catch (err) {
    console.error('[cockpit/daemon/projects] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
