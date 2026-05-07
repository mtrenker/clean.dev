import React from 'react';
import type { WorktreeSnapshot } from '@cleandev/cockpit-protocol';
import { Badge, EmptyState } from '@/components/ui';

interface WorktreeSummaryProps {
  worktrees: WorktreeSnapshot[];
}

function worktreeNeedsCleanup(wt: WorktreeSnapshot): boolean {
  return wt.isDirty || (wt.aheadCount ?? 0) > 0;
}

export const WorktreeSummary: React.FC<WorktreeSummaryProps> = ({ worktrees }) => {
  if (worktrees.length === 0) {
    return (
      <EmptyState
        title="No worktrees"
        description="No worktree snapshots have been received yet."
      />
    );
  }

  return (
    <div className="space-y-2">
      {worktrees.map((wt) => {
        const needsCleanup = worktreeNeedsCleanup(wt);
        return (
          <div
            key={wt.worktreeId}
            className="flex flex-col gap-1 rounded-sm border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-medium text-foreground">
                  {wt.branch ?? wt.worktreeId}
                </span>
                {wt.headSha && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {wt.headSha.slice(0, 7)}
                  </span>
                )}
                {needsCleanup && (
                  <Badge variant="warning">Needs cleanup</Badge>
                )}
              </div>
              {wt.worktreePath && (
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                  {wt.worktreePath}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-1.5">
              {wt.isDirty && (
                <Badge variant="warning">Dirty</Badge>
              )}
              {(wt.aheadCount ?? 0) > 0 && (
                <Badge variant="info">
                  +{wt.aheadCount} ahead
                </Badge>
              )}
              {(wt.behindCount ?? 0) > 0 && (
                <Badge variant="muted">
                  -{wt.behindCount} behind
                </Badge>
              )}
              {!wt.isDirty && (wt.aheadCount ?? 0) === 0 && (
                <Badge variant="success">Clean</Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
