import React from 'react';
import { Badge, EmptyState, Link } from '@/components/ui';
import { ConsolePanel } from './console-panel';
import type { ArchivedPlanRow } from '@/lib/cockpit/overview-aggregate';
import { formatRelativeTime, formatCostUsd } from '@/lib/cockpit/format';

interface ArchiveReviewPanelProps {
  rows: ArchivedPlanRow[];
  hrefBase?: string;
}

const STATUS_VARIANT: Record<
  ArchivedPlanRow['reviewStatus'],
  'warning' | 'success' | 'muted'
> = {
  pending: 'warning',
  reviewed: 'success',
  dismissed: 'muted',
};

/**
 * Archive review queue — archived plans that an operator may still need to
 * read (or has already reviewed/dismissed). Pending plans surface first.
 */
export const ArchiveReviewPanel: React.FC<ArchiveReviewPanelProps> = ({
  rows,
  hrefBase = '/cockpit',
}) => {
  return (
    <ConsolePanel
      title="Archive review"
      command="ls .pi/archive/plans/"
      meta={
        rows.length > 0 ? (
          <Badge variant="muted">{rows.length} plans</Badge>
        ) : null
      }
      flush
    >
      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="No archived plans"
            description="Plans archived by the planner will appear here for review."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 text-left">Plan</th>
                <th scope="col" className="px-4 py-2 text-left">Project</th>
                <th scope="col" className="px-4 py-2 text-right">Tasks</th>
                <th scope="col" className="px-4 py-2 text-right">Cost</th>
                <th scope="col" className="px-4 py-2 text-left">Status</th>
                <th scope="col" className="px-4 py-2 text-right">Archived</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {rows.map((row) => (
                <tr
                  key={`${row.projectId}:${row.planId}`}
                  className="transition-colors hover:bg-accent/5"
                >
                  <td className="px-4 py-2 align-top">
                    <span className="text-sm font-medium text-foreground">
                      {row.title}
                    </span>
                    {row.archivePath && (
                      <div
                        className="mt-0.5 max-w-[36ch] truncate font-mono text-xs text-muted-foreground"
                        title={row.archivePath}
                      >
                        {row.archivePath}
                      </div>
                    )}
                    <div className="font-mono text-xs text-muted-foreground/70">
                      {row.planId}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <Link
                      href={`${hrefBase}/${row.projectId}`}
                      variant="muted"
                      className="font-mono text-sm"
                    >
                      {row.projectName}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-foreground">
                    {row.taskCount}
                  </td>
                  <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-foreground/85">
                    {formatCostUsd(row.costUsd)}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <Badge variant={STATUS_VARIANT[row.reviewStatus]}>
                      {row.reviewStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right align-top font-mono text-xs text-muted-foreground tabular-nums">
                    {formatRelativeTime(row.archivedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ConsolePanel>
  );
};
