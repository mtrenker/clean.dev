import React from 'react';
import { Badge, EmptyState, Heading, Link } from '@/components/ui';
import { ConsolePanel } from '../console-panel';
import {
  formatCostUsd,
  formatNumber,
  formatRelativeTime,
} from '@/lib/cockpit/format';
import type { ArchiveRunRow } from '@/lib/cockpit/archive-detail';

interface ArchiveRunsIndexProps {
  projectId: string;
  projectName: string;
  runs: ArchiveRunRow[];
}

/**
 * Historical fleet runs index — every distinct `archive.runId` for the
 * project, sorted most-recent first.  Each row is a link into the run-detail
 * drilldown.
 */
export const ArchiveRunsIndex: React.FC<ArchiveRunsIndexProps> = ({
  projectId,
  projectName,
  runs,
}) => {
  const totalPlans = runs.reduce((acc, run) => acc + run.planIds.length, 0);
  const totalTasks = runs.reduce((acc, run) => acc + run.taskIds.length, 0);
  const pendingReviews = runs.reduce((acc, run) => acc + run.pendingReviews, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border/50 pb-5">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Link href={`/cockpit/${projectId}`} variant="muted">
            ← Project
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/cockpit/${projectId}/archive`} variant="muted">
            Archive
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-accent">runs</span>
        </div>
        <Heading as="h1" variant="section" className="text-2xl sm:text-3xl">
          Historical runs · {projectName}
        </Heading>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Every distinct fleet run that has been archived for this project,
          sorted most-recent first.  Click a run to inspect every plan and
          task it produced.
        </p>
      </header>

      <section
        className="terminal-card grid grid-cols-2 divide-x divide-y divide-border/40 sm:grid-cols-4 sm:divide-y-0"
        aria-label="Run history summary"
      >
        <Stat label="Runs" value={formatNumber(runs.length)} />
        <Stat label="Plans" value={formatNumber(totalPlans)} />
        <Stat label="Tasks" value={formatNumber(totalTasks)} />
        <Stat
          label="Pending review"
          value={formatNumber(pendingReviews)}
          tone={pendingReviews > 0 ? 'warning' : 'default'}
        />
      </section>

      <ConsolePanel
        title="Runs"
        command="cat .pi/archive/index.json | jq '.[].runId'"
        meta={
          runs.length > 0 ? (
            <Badge variant="muted">{runs.length}</Badge>
          ) : null
        }
        flush
      >
        {runs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No historical runs archived yet"
              description="Once the planner emits archive events with a runId they'll surface here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left">Run</th>
                  <th scope="col" className="px-4 py-2 text-right">Plans</th>
                  <th scope="col" className="px-4 py-2 text-right">Tasks</th>
                  <th scope="col" className="px-4 py-2 text-right">Tokens</th>
                  <th scope="col" className="px-4 py-2 text-right">Cost</th>
                  <th scope="col" className="px-4 py-2 text-right">Started</th>
                  <th scope="col" className="px-4 py-2 text-right">Ended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {runs.map((row) => {
                  const tokens = row.inputTokens + row.outputTokens;
                  return (
                    <tr key={row.runId} className="transition-colors hover:bg-accent/5">
                      <td className="px-4 py-2 align-top">
                        <Link
                          href={`/cockpit/${projectId}/runs/${encodeURIComponent(row.runId)}`}
                          variant="muted"
                          className="text-sm font-medium text-foreground hover:text-accent"
                        >
                          {row.runId}
                        </Link>
                        {row.pendingReviews > 0 && (
                          <div className="mt-0.5 font-mono text-xs text-warning">
                            {row.pendingReviews} pending review
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-foreground">
                        {row.planIds.length}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-foreground">
                        {row.taskIds.length}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                        {tokens > 0 ? formatNumber(tokens) : '—'}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-foreground/85">
                        {row.costUsd > 0 ? formatCostUsd(row.costUsd) : '—'}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                        {formatRelativeTime(row.startedAt)}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                        {formatRelativeTime(row.endedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ConsolePanel>
    </div>
  );
};

interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'default' | 'warning';
}

const Stat: React.FC<StatProps> = ({ label, value, hint, tone }) => (
  <div className="flex flex-col gap-1 px-4 py-3">
    <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
      {label}
    </span>
    <span
      className={
        tone === 'warning'
          ? 'font-mono text-xl font-semibold tabular-nums text-warning'
          : 'font-mono text-xl font-semibold tabular-nums text-foreground'
      }
    >
      {value}
    </span>
    {hint && (
      <span className="font-mono text-xs text-muted-foreground">{hint}</span>
    )}
  </div>
);
