import type { Metadata } from 'next';
import { Badge, Heading } from '@/components/ui';
import { ProjectCard, RefreshButton } from '@/components/cockpit';
import { listDemoCockpitProjects } from '@/lib/cockpit';
import { DemoAutoRefresh } from './demo-auto-refresh';

export const metadata: Metadata = {
  title: 'Cockpit Demo',
  description: 'Public synthetic cockpit stream with sanitized project activity.',
};

export const dynamic = 'force-dynamic';

const DemoCockpitOverviewPage = () => {
  const demoProjects = listDemoCockpitProjects();

  let totalRunning = 0;
  let totalFailed = 0;
  let totalDirtyWorktrees = 0;
  let activeProjects = 0;

  for (const { state } of demoProjects) {
    if (!state.dirty) activeProjects += 1;
    const tasks = Object.values(state.tasks);
    totalRunning += tasks.filter((task) => task.status === 'running').length;
    totalFailed += tasks.filter((task) => task.status === 'failed').length;
    totalDirtyWorktrees += Object.values(state.worktrees).filter(
      (worktree) => worktree.isDirty || (worktree.aheadCount ?? 0) > 0,
    ).length;
  }

  const sortedProjects = [...demoProjects].sort((a, b) => {
    const activeA = a.state.dirty ? 1 : 0;
    const activeB = b.state.dirty ? 1 : 0;
    if (activeA !== activeB) return activeA - activeB;

    const nameA = a.state.projectName ?? a.project.projectName ?? a.project.projectId;
    const nameB = b.state.projectName ?? b.project.projectName ?? b.project.projectId;
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="space-y-8">
      <DemoAutoRefresh />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Heading as="h1" variant="section" className="text-2xl sm:text-3xl">
            Public cockpit demo
          </Heading>
          <p className="mt-1 text-sm text-muted-foreground">
            Synthetic and sanitized stream data rendered through the same projection and UI model as the private dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">No private data</Badge>
          <RefreshButton className="self-start" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="status" aria-label="Demo cockpit summary">
        <Badge variant={activeProjects > 0 ? 'success' : 'muted'}>
          {activeProjects} active
        </Badge>
        {totalRunning > 0 && (
          <Badge variant="info">{totalRunning} agent{totalRunning === 1 ? '' : 's'} running</Badge>
        )}
        {totalFailed > 0 && (
          <Badge variant="destructive">{totalFailed} failed</Badge>
        )}
        {totalDirtyWorktrees > 0 && (
          <Badge variant="warning">
            {totalDirtyWorktrees} worktree{totalDirtyWorktrees === 1 ? '' : 's'} need cleanup
          </Badge>
        )}
        <Badge variant="outline">{demoProjects.length} project{demoProjects.length === 1 ? '' : 's'} total</Badge>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        This route never reads `cockpit_projects`, `cockpit_raw_events`, or any paired-device tables. It is generated in-process from validated demo events only.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedProjects.map(({ project, state }) => (
          <ProjectCard
            key={project.projectId}
            project={project}
            state={state}
            hrefBase="/demo/cockpit"
          />
        ))}
      </div>
    </div>
  );
};

export default DemoCockpitOverviewPage;
