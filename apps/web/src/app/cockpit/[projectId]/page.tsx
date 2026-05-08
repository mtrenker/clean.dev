import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { Heading, Link, Badge } from '@/components/ui';
import { PruneEventsForm } from '@/components/cockpit';
import { getDaemonHealth } from '@/components/cockpit/health-indicator';
import {
  ProjectDetailHeader,
  ProjectSummaryStrip,
  ProjectWorktreesPanel,
  ProjectDevicesPanel,
  ProjectTasksPanel,
  ProjectPlansPanel,
  ProjectCostPanel,
  ProjectionStatusPanel,
} from '@/components/cockpit/project';
import {
  buildProjectSummary,
  buildWorktreeGroupRows,
  buildProjectDeviceRows,
  bucketTasks,
  bucketPlans,
  buildProjectUsageBreakdown,
} from '@/lib/cockpit/project-detail';

interface CockpitProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: CockpitProjectPageProps,
): Promise<Metadata> {
  const { projectId } = await params;
  const repo = getCockpitRepository();
  const project = await repo.getProject(projectId);
  const displayName =
    project?.projectName ?? project?.projectSlug ?? projectId;
  return { title: `Cockpit — ${displayName}` };
}

const CockpitProjectPage = async ({ params }: CockpitProjectPageProps) => {
  const { projectId } = await params;
  const repo = getCockpitRepository();

  const [project, state, projectionStatus] = await Promise.all([
    repo.getProject(projectId),
    repo.getProjectedProjectState(projectId),
    repo.getProjectionStatus(projectId),
  ]);

  if (!project) notFound();

  const displayName =
    state?.projectName ?? project.projectName ?? project.projectSlug ?? project.projectId;
  const projectSlug = state?.projectSlug ?? project.projectSlug;

  // ── Aggregations ─────────────────────────────────────────────────────────
  const summary = buildProjectSummary(state);
  const worktreeRows = buildWorktreeGroupRows(state);
  const deviceRows = buildProjectDeviceRows(state);
  const tasks = bucketTasks(state);
  const plans = bucketPlans(state);
  const usage = buildProjectUsageBreakdown(state);

  const health = state
    ? getDaemonHealth(state.dirty, state.lastHeartbeat != null)
    : 'offline';

  const configHref = `/cockpit/${project.projectId}/config`;

  return (
    <div className="relative space-y-8">
      {/* Subtle blueprint grid behind the header. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden opacity-30"
        aria-hidden="true"
      >
        <div className="tech-grid" />
      </div>

      <ProjectDetailHeader
        projectId={project.projectId}
        projectName={displayName}
        projectSlug={projectSlug}
        localRootPath={state?.localRootPath ?? project.localRootPath}
        worktreeRootPath={state?.worktreeRootPath ?? project.worktreeRootPath}
        health={health}
        lastHeartbeatAt={state?.lastHeartbeat?.occurredAt ?? null}
        lastEventAt={
          state?.lastEvent?.occurredAt ??
          (project.latestEventAt ? new Date(project.latestEventAt).toISOString() : null)
        }
        daemonVersion={state?.lastHeartbeat?.daemonVersion ?? null}
        primaryAction={
          <Link
            href={configHref}
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-transparent px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
            ariaLabel="Configure project observation"
          >
            ⚙ Configure
          </Link>
        }
      />

      {/* ── Summary strip ──────────────────────────────────────────── */}
      <ProjectSummaryStrip summary={summary} />

      {/* ── Live & failed tasks ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ProjectTasksPanel
          title="Running agents"
          command="cockpit task ls --status running"
          variant="running"
          tasks={tasks.running}
          projectId={project.projectId}
          emptyTitle="No agents running"
          emptyDescription="When the daemon starts a task it will appear here in real time."
        />
        <ProjectTasksPanel
          title="Failed tasks"
          command="cockpit task ls --status failed"
          variant="failed"
          tasks={tasks.failed}
          projectId={project.projectId}
          emptyTitle="No failed tasks"
          emptyDescription="Failures will surface here with stack traces and the latest progress step."
        />
      </div>

      {/* ── Devices observing this project ─────────────────────────── */}
      <ProjectDevicesPanel rows={deviceRows} />

      {/* ── Worktrees / branches ───────────────────────────────────── */}
      <ProjectWorktreesPanel rows={worktreeRows} />

      {/* ── Plans (live) ───────────────────────────────────────────── */}
      <ProjectPlansPanel
        title="Live plans"
        command="cockpit plan ls"
        plans={plans.live}
        variant="live"
        emptyTitle="No live plans"
        emptyDescription="Plans currently being executed by an agent will appear here."
        planHrefBase={`/cockpit/${project.projectId}/plans`}
      />

      {/* ── Recently completed tasks ───────────────────────────────── */}
      <ProjectTasksPanel
        title="Recently completed"
        command="cockpit task ls --status done | head -n 20"
        variant="completed"
        tasks={tasks.done.slice(0, 20)}
        projectId={project.projectId}
        emptyTitle="No completed tasks yet"
        emptyDescription="Once a task finishes its handoff and runtime metrics will appear here."
      />

      {/* ── Archive review (plans + tasks) ─────────────────────────── */}
      <section className="space-y-3" aria-label="Archive review">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Heading
            as="h2"
            variant="label"
            className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground"
          >
            Archive review
          </Heading>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <Link
              href={`/cockpit/${project.projectId}/archive`}
              variant="muted"
            >
              Open archive index →
            </Link>
            <Link
              href={`/cockpit/${project.projectId}/runs`}
              variant="muted"
            >
              Historical runs →
            </Link>
            {summary.archivedPlansAwaitingReview > 0 && (
              <Badge variant="warning">
                {summary.archivedPlansAwaitingReview} pending
              </Badge>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ProjectPlansPanel
            title="Archived plans"
            command="ls .pi/archive/plans/"
            plans={plans.archived}
            variant="archived"
            emptyTitle="No archived plans"
            emptyDescription="Plans archived by the planner will appear here for review."
            planHrefBase={`/cockpit/${project.projectId}/plans`}
          />
          <ProjectTasksPanel
            title="Archived tasks"
            command="ls .pi/archive/tasks/"
            variant="archived"
            tasks={tasks.archived.slice(0, 20)}
            projectId={project.projectId}
            emptyTitle="No archived tasks"
            emptyDescription="Tasks archived by completed plans will appear here for review."
          />
        </div>
      </section>

      {/* ── Usage / cost breakdown ─────────────────────────────────── */}
      <ProjectCostPanel breakdown={usage} />

      {/* ── Operator tools ─────────────────────────────────────────── */}
      <section
        className="space-y-4 border-t border-border/50 pt-6"
        aria-label="Operator tools"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Heading
            as="h2"
            variant="label"
            className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground"
          >
            Operator tools
          </Heading>
          <Badge variant="outline">admin only</Badge>
        </div>

        {/* Projection health & manual re-projection */}
        {projectionStatus && (
          <ProjectionStatusPanel status={projectionStatus} />
        )}

        {/* Raw-event pruning */}
        <PruneEventsForm
          projectId={project.projectId}
          suggestedThroughSequence={project.latestEventSequence}
        />
      </section>

      {/* Footer signal strip — keeps the screen feeling like one console. */}
      <footer
        className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-4 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground"
        aria-label="Project signal strip"
      >
        <span>signal: {health}</span>
        <span className="hidden sm:inline">
          {summary.runningTasks > 0
            ? `${summary.runningTasks} agent${summary.runningTasks > 1 ? 's' : ''} on the wire`
            : 'no live agents'}
        </span>
        <Badge variant="outline">read-only data</Badge>
      </footer>
    </div>
  );
};

export default CockpitProjectPage;
