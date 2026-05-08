import React from 'react';
import { Badge, EmptyState, Link } from '@/components/ui';
import { ConsolePanel } from '../console-panel';
import type { CockpitProjectedPlanState } from '@cleandev/cockpit-store';
import {
  formatRelativeTime,
  formatCostUsd,
  formatNumber,
} from '@/lib/cockpit/format';

interface ProjectPlansPanelProps {
  title: string;
  command: string;
  plans: CockpitProjectedPlanState[];
  variant?: 'live' | 'archived';
  emptyTitle?: string;
  emptyDescription?: string;
  /**
   * If provided, plan titles render as links to
   * `${planHrefBase}/${planId}` (e.g. `/cockpit/proj-1/plans`).  When omitted,
   * titles render as static text — backwards-compatible with the original
   * Task 010 layout.
   */
  planHrefBase?: string;
}

const STATUS_VARIANT: Record<
  'pending' | 'reviewed' | 'dismissed',
  React.ComponentProps<typeof Badge>['variant']
> = {
  pending: 'warning',
  reviewed: 'success',
  dismissed: 'muted',
};

export const ProjectPlansPanel: React.FC<ProjectPlansPanelProps> = ({
  title,
  command,
  plans,
  variant = 'live',
  emptyTitle,
  emptyDescription,
  planHrefBase,
}) => {
  return (
    <ConsolePanel
      title={title}
      command={command}
      meta={
        plans.length > 0 ? (
          <Badge variant={variant === 'archived' ? 'muted' : 'info'}>
            {plans.length} plan{plans.length === 1 ? '' : 's'}
          </Badge>
        ) : null
      }
      flush
    >
      {plans.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title={emptyTitle ?? 'No plans'}
            description={
              emptyDescription ??
              'The planner will surface plans here once they are emitted.'
            }
          />
        </div>
      ) : (
        <ul className="divide-y divide-border/30">
          {plans.map((plan) => {
            const tokens =
              (plan.usage?.inputTokens ?? 0) + (plan.usage?.outputTokens ?? 0);
            const cost = Number(plan.costEstimate?.totalCost ?? 0);
            const status = plan.archive?.reviewStatus;
            return (
              <li
                key={plan.planId}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    {planHrefBase ? (
                      <Link
                        href={`${planHrefBase}/${encodeURIComponent(plan.planId)}`}
                        variant="muted"
                        className="text-sm font-medium text-foreground hover:text-accent"
                      >
                        {plan.title}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-foreground">
                        {plan.title}
                      </span>
                    )}
                    <Badge variant="muted">
                      {plan.taskCount} task{plan.taskCount === 1 ? '' : 's'}
                    </Badge>
                    {variant === 'archived' && status && (
                      <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
                    )}
                  </div>
                  {plan.overview && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {plan.overview}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-3 font-mono text-xs text-muted-foreground/80">
                    <span>id: {plan.planId}</span>
                    {plan.sourcePlanPath && <span>{plan.sourcePlanPath}</span>}
                    {plan.archive?.archivePath && (
                      <span>{plan.archive.archivePath}</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  <div>
                    {variant === 'archived'
                      ? formatRelativeTime(plan.archive?.archivedAt)
                      : formatRelativeTime(plan.lastSeenAt)}
                  </div>
                  {tokens > 0 && (
                    <div>{formatNumber(tokens)} tokens</div>
                  )}
                  {cost > 0 && (
                    <div className="text-accent">{formatCostUsd(cost)}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ConsolePanel>
  );
};
