import React from 'react';
import clsx from 'clsx';
import type { FleetOverview } from '@/lib/cockpit/overview-aggregate';
import { formatNumber, formatCostUsd } from '@/lib/cockpit/format';

interface OverviewStatsProps {
  overview: FleetOverview;
}

interface StatCellProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'default' | 'accent' | 'success' | 'warning' | 'destructive' | 'info';
  /** Monospace command-line style annotation under the value. */
  command?: string;
}

const toneRing: Record<NonNullable<StatCellProps['tone']>, string> = {
  default: 'border-border/60',
  accent: 'border-accent/40',
  success: 'border-success/30',
  warning: 'border-warning/30',
  destructive: 'border-destructive/30',
  info: 'border-info/30',
};

const toneText: Record<NonNullable<StatCellProps['tone']>, string> = {
  default: 'text-foreground',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  info: 'text-info',
};

const StatCell: React.FC<StatCellProps> = ({
  label,
  value,
  hint,
  tone = 'default',
  command,
}) => (
  <div
    className={clsx(
      'relative flex flex-col gap-1 border-l-2 px-4 py-3',
      toneRing[tone],
    )}
  >
    <div className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
      {label}
    </div>
    <div
      className={clsx(
        'font-mono text-2xl font-semibold leading-none tracking-tight tabular-nums',
        toneText[tone],
      )}
    >
      {value}
    </div>
    {(hint || command) && (
      <div className="font-mono text-xs text-muted-foreground">
        {command && (
          <span className="text-accent" aria-hidden="true">
            $&nbsp;
          </span>
        )}
        {command ?? hint}
      </div>
    )}
  </div>
);

/**
 * HUD-style top strip summarising the entire fleet.
 *
 * Designed to answer Martin's at-a-glance questions without scrolling:
 *   • how many projects/devices are reporting?
 *   • how many agents are currently running?
 *   • how much cleanup work is queued up?
 *   • how much have we spent today (estimated)?
 */
export const OverviewStats: React.FC<OverviewStatsProps> = ({ overview }) => {
  const projectsValue = (
    <span>
      {overview.activeProjects}
      <span className="text-base text-muted-foreground">
        {' '}
        / {overview.totalProjects}
      </span>
    </span>
  );

  const projectsHint =
    overview.staleProjects > 0
      ? `${overview.staleProjects} stale · ${overview.offlineProjects} offline`
      : overview.offlineProjects > 0
        ? `${overview.offlineProjects} offline`
        : 'all live';

  const devicesValue = (
    <span>
      {overview.activeDeviceCount}
      <span className="text-base text-muted-foreground">
        {' '}
        / {overview.totalDeviceCount}
      </span>
    </span>
  );

  return (
    <div
      className="terminal-card grid grid-cols-2 divide-x divide-border/30 sm:grid-cols-3 lg:grid-cols-6"
      role="status"
      aria-label="Fleet overview summary"
    >
      <StatCell
        label="Projects"
        value={projectsValue}
        hint={projectsHint}
        tone={overview.activeProjects > 0 ? 'success' : 'warning'}
      />
      <StatCell
        label="Devices"
        value={devicesValue}
        hint={
          overview.activeDeviceCount > 0
            ? `${overview.activeDeviceCount} reporting work`
            : 'idle'
        }
        tone={overview.activeDeviceCount > 0 ? 'accent' : 'default'}
      />
      <StatCell
        label="Agents running"
        value={overview.runningAgents}
        tone={overview.runningAgents > 0 ? 'info' : 'default'}
        command={
          overview.runningAgents > 0
            ? 'tail -f cockpit/agents.log'
            : 'no live runs'
        }
      />
      <StatCell
        label="Cleanup queue"
        value={overview.worktreesNeedingCleanup}
        tone={overview.worktreesNeedingCleanup > 0 ? 'warning' : 'default'}
        hint={
          overview.failedTasks > 0
            ? `${overview.failedTasks} failed task${overview.failedTasks > 1 ? 's' : ''}`
            : 'worktrees · branches'
        }
      />
      <StatCell
        label="Archive review"
        value={overview.archivedPlansAwaitingReview}
        tone={overview.archivedPlansAwaitingReview > 0 ? 'accent' : 'default'}
        hint="plans pending review"
      />
      <StatCell
        label="Estimated cost"
        value={formatCostUsd(overview.totalEstimatedCostUsd)}
        tone={overview.totalEstimatedCostUsd > 0 ? 'accent' : 'default'}
        hint={`${formatNumber(
          overview.totalInputTokens + overview.totalOutputTokens,
        )} tokens`}
      />
    </div>
  );
};
