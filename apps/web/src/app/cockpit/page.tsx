import type { Metadata } from 'next';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { Heading, Badge, EmptyState } from '@/components/ui';
import { ProjectCard, RefreshButton } from '@/components/cockpit';
import type { CockpitProjectedProjectState } from '@cleandev/cockpit-store';

export const metadata: Metadata = {
  title: 'Cockpit — Overview',
};

// Always fetch fresh data on every request so the dashboard reflects
// the latest projected state without cache staleness.
export const dynamic = 'force-dynamic';

const CockpitOverviewPage = async () => {
  const repo = getCockpitRepository();
  const projects = await repo.listProjects();

  // Fetch projected states in parallel (N+1 is fine for a small cockpit)
  const stateResults = await Promise.allSettled(
    projects.map((p) => repo.getProjectedProjectState(p.projectId)),
  );

  const stateMap = new Map<string, CockpitProjectedProjectState | null>();
  projects.forEach((p, i) => {
    const result = stateResults[i];
    stateMap.set(
      p.projectId,
      result.status === 'fulfilled' ? result.value : null,
    );
  });

  // Compute global summary for the header bar
  let totalRunning = 0;
  let totalFailed = 0;
  let totalDirtyWorktrees = 0;
  let activeProjects = 0;

  for (const state of stateMap.values()) {
    if (!state) continue;
    if (!state.dirty) activeProjects++;
    const tasks = Object.values(state.tasks);
    totalRunning += tasks.filter((t) => t.status === 'running').length;
    totalFailed += tasks.filter((t) => t.status === 'failed').length;
    totalDirtyWorktrees += Object.values(state.worktrees).filter(
      (w) => w.isDirty || (w.aheadCount ?? 0) > 0,
    ).length;
  }

  // Sort: active projects first, then by project name
  const sortedProjects = [...projects].sort((a, b) => {
    const stateA = stateMap.get(a.projectId);
    const stateB = stateMap.get(b.projectId);
    const activeA = stateA && !stateA.dirty ? 0 : 1;
    const activeB = stateB && !stateB.dirty ? 0 : 1;
    if (activeA !== activeB) return activeA - activeB;
    const nameA = stateA?.projectName ?? a.projectName ?? a.projectSlug ?? a.projectId;
    const nameB = stateB?.projectName ?? b.projectName ?? b.projectSlug ?? b.projectId;
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="space-y-8">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Heading as="h1" variant="section" className="text-2xl sm:text-3xl">
            Project overview
          </Heading>
          <p className="mt-1 text-sm text-muted-foreground">
            Live state of all monitored projects
          </p>
        </div>
        <RefreshButton className="self-start" />
      </div>

      {/* ── Global summary bar ───────────────────────────────────── */}
      {projects.length > 0 && (
        <div className="flex flex-wrap gap-2" role="status" aria-label="Global cockpit summary">
          <Badge variant={activeProjects > 0 ? 'success' : 'muted'}>
            {activeProjects} active
          </Badge>
          {totalRunning > 0 && (
            <Badge variant="info">{totalRunning} agent{totalRunning > 1 ? 's' : ''} running</Badge>
          )}
          {totalFailed > 0 && (
            <Badge variant="destructive">{totalFailed} failed</Badge>
          )}
          {totalDirtyWorktrees > 0 && (
            <Badge variant="warning">{totalDirtyWorktrees} worktree{totalDirtyWorktrees > 1 ? 's' : ''} need cleanup</Badge>
          )}
          <Badge variant="outline">{projects.length} project{projects.length > 1 ? 's' : ''} total</Badge>
        </div>
      )}

      {/* ── Project grid / list ──────────────────────────────────── */}
      {projects.length === 0 ? (
        <EmptyState
          title="No projects"
          description="No cockpit projects have been registered yet. Pair a daemon device to start receiving events."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.projectId}
              project={project}
              state={stateMap.get(project.projectId) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CockpitOverviewPage;
