import type { Metadata } from 'next';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { Heading, Badge, EmptyState } from '@/components/ui';
import {
  RefreshButton,
  OverviewStats,
  ProjectHealthGrid,
  ActiveDevicesPanel,
  RunningAgentsPanel,
  WorktreeHygienePanel,
  RecentHandoffsPanel,
  ArchiveReviewPanel,
  UsageBreakdownPanel,
} from '@/components/cockpit';
import {
  buildFleetOverview,
  buildActiveDeviceRows,
  buildRunningAgentRows,
  buildWorktreeHygieneRows,
  buildRecentHandoffRows,
  buildArchivedPlanRows,
  buildUsageBreakdown,
} from '@/lib/cockpit/overview-aggregate';
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

  // Fetch projected states in parallel (N+1 is fine for a small cockpit).
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

  // ── Aggregate fleet-wide views ─────────────────────────────────────────────
  const overview = buildFleetOverview(stateMap);
  const activeDevices = buildActiveDeviceRows(stateMap);
  const runningAgents = buildRunningAgentRows(stateMap);
  const worktreeHygiene = buildWorktreeHygieneRows(stateMap);
  const recentHandoffs = buildRecentHandoffRows(stateMap);
  const archivedPlans = buildArchivedPlanRows(stateMap);
  const usage = buildUsageBreakdown(stateMap);

  return (
    <div className="relative space-y-8">
      {/* Subtle blueprint grid behind the header. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden opacity-40"
        aria-hidden="true"
      >
        <div className="tech-grid" />
      </div>

      {/* ── Page header ──────────────────────────────────────────── */}
      <header className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
            <span aria-hidden="true">$&nbsp;</span>cockpit overview
          </p>
          <Heading
            as="h1"
            variant="section"
            className="mt-2 text-3xl sm:text-4xl"
          >
            Fleet console
          </Heading>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Live state across every paired device, project, and agent run —
            sorted to surface what needs attention next.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 self-start sm:self-end">
          <RefreshButton />
        </div>
      </header>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects"
          description="No cockpit projects have been registered yet. Pair a daemon device to start receiving events."
        />
      ) : (
        <>
          {/* ── HUD strip ────────────────────────────────────────── */}
          <OverviewStats overview={overview} />

          {/* ── Project health (compact card view) ──────────────── */}
          <ProjectHealthGrid projects={projects} stateMap={stateMap} />

          {/* ── Active devices + running agents ─────────────────── */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ActiveDevicesPanel
              rows={activeDevices}
              totalDevices={overview.totalDeviceCount}
            />
            <RunningAgentsPanel rows={runningAgents} />
          </div>

          {/* ── Worktree hygiene ────────────────────────────────── */}
          <WorktreeHygienePanel rows={worktreeHygiene} />

          {/* ── Recent handoffs + archive review ────────────────── */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RecentHandoffsPanel rows={recentHandoffs} />
            <ArchiveReviewPanel rows={archivedPlans} />
          </div>

          {/* ── Estimated usage / cost ──────────────────────────── */}
          <UsageBreakdownPanel breakdown={usage} />

          {/* Footer signal strip — keeps the dashboard feeling like one
              continuous console rather than a stack of cards. */}
          <footer
            className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-4 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground"
            aria-label="Cockpit signal strip"
          >
            <span>signal: ok</span>
            <span className="hidden sm:inline">
              {overview.runningAgents > 0
                ? `${overview.runningAgents} agent${overview.runningAgents > 1 ? 's' : ''} on the wire`
                : 'no live agents'}
            </span>
            <Badge variant="outline">read-only</Badge>
          </footer>
        </>
      )}
    </div>
  );
};

export default CockpitOverviewPage;
