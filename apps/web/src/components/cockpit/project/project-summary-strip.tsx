import React from 'react';
import clsx from 'clsx';
import type { ProjectSummary } from '@/lib/cockpit/project-detail';
import { formatCostUsd, formatNumber } from '@/lib/cockpit/format';

interface ProjectSummaryStripProps {
  summary: ProjectSummary;
}

interface Cell {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'default' | 'accent' | 'warning' | 'destructive' | 'info' | 'success';
}

const TONE_CLASSES: Record<NonNullable<Cell['tone']>, string> = {
  default: 'text-foreground',
  accent: 'text-accent',
  warning: 'text-warning',
  destructive: 'text-destructive',
  info: 'text-info',
  success: 'text-success',
};

/**
 * Project-scoped HUD strip — six dense stat cells echoing the fleet overview's
 * top strip but answering "what is this project doing right now?" The
 * grouping mirrors the panels below it so an operator can scan top-to-bottom.
 */
export const ProjectSummaryStrip: React.FC<ProjectSummaryStripProps> = ({
  summary,
}) => {
  const cells: Cell[] = [
    {
      label: 'Devices',
      value: formatNumber(summary.totalDevices),
      hint: `${summary.activeDevices} active · ${summary.staleDevices} idle`,
      tone: summary.activeDevices > 0 ? 'info' : 'default',
    },
    {
      label: 'Worktrees',
      value: formatNumber(summary.worktreeCount),
      hint: `${summary.worktreeGroups} group${summary.worktreeGroups === 1 ? '' : 's'} · ${summary.worktreesNeedingCleanup} cleanup`,
      tone: summary.worktreesNeedingCleanup > 0 ? 'warning' : 'default',
    },
    {
      label: 'Live tasks',
      value: formatNumber(summary.liveTasks),
      hint: `${summary.runningTasks} running · ${summary.failedTasks} failed`,
      tone:
        summary.failedTasks > 0
          ? 'destructive'
          : summary.runningTasks > 0
            ? 'info'
            : 'default',
    },
    {
      label: 'Plans',
      value: formatNumber(summary.livePlans + summary.archivedPlans),
      hint: `${summary.livePlans} live · ${summary.archivedPlans} archived`,
      tone: 'default',
    },
    {
      label: 'Archive review',
      value: formatNumber(summary.archivedPlansAwaitingReview),
      hint: `${summary.archivedTasks} archived task${summary.archivedTasks === 1 ? '' : 's'}`,
      tone: summary.archivedPlansAwaitingReview > 0 ? 'warning' : 'default',
    },
    {
      label: 'Est. cost',
      value: formatCostUsd(summary.totalEstimatedCostUsd),
      hint: `${formatNumber(summary.totalInputTokens)} in · ${formatNumber(summary.totalOutputTokens)} out`,
      tone: 'accent',
    },
  ];

  return (
    <section
      className="terminal-card grid grid-cols-2 divide-x divide-y divide-border/50 sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0"
      aria-label="Project summary"
    >
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="flex min-w-0 flex-col gap-1 px-4 py-3"
        >
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {cell.label}
          </span>
          <span
            className={clsx(
              'font-mono text-2xl font-semibold tabular-nums',
              TONE_CLASSES[cell.tone ?? 'default'],
            )}
          >
            {cell.value}
          </span>
          {cell.hint && (
            <span className="truncate font-mono text-xs text-muted-foreground">
              {cell.hint}
            </span>
          )}
        </div>
      ))}
    </section>
  );
};
