import React from 'react';
import { Badge, EmptyState } from '@/components/ui';
import { ConsolePanel } from '../console-panel';
import type { WorktreeGroupRow } from '@/lib/cockpit/project-detail';
import { worktreeNeedsCleanup } from '@/lib/cockpit/overview-aggregate';
import { formatRelativeTime } from '@/lib/cockpit/format';

interface ProjectWorktreesPanelProps {
  rows: WorktreeGroupRow[];
}

/**
 * Per-project worktree drilldown. Each group is rendered as its own
 * sub-table so an operator can scan branches by their grouping rule
 * (canonical / scratch / feature / etc.) and see why each branch needs
 * cleanup, plus which device most-recently observed it.
 */
export const ProjectWorktreesPanel: React.FC<ProjectWorktreesPanelProps> = ({
  rows,
}) => {
  const totalCleanup = rows.reduce((acc, r) => acc + r.cleanupCount, 0);
  return (
    <ConsolePanel
      title="Worktrees & branches"
      command="git worktree list --by group"
      meta={
        rows.length === 0 ? null : totalCleanup > 0 ? (
          <Badge variant="warning">{totalCleanup} cleanup</Badge>
        ) : (
          <Badge variant="success">all clean</Badge>
        )
      }
      flush
    >
      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="No worktrees observed"
            description="No worktree snapshots have been received for this project yet."
          />
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {rows.map((group) => (
            <div key={group.groupName} className="px-4 py-3 sm:px-5">
              <div className="mb-2 flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
                  ▸ {group.groupName}
                </span>
                <Badge variant="muted">
                  {group.worktrees.length} branch
                  {group.worktrees.length === 1 ? '' : 'es'}
                </Badge>
                {group.cleanupCount > 0 && (
                  <Badge variant="warning">{group.cleanupCount} cleanup</Badge>
                )}
                {group.observingDeviceIds.length > 0 && (
                  <span className="font-mono text-xs text-muted-foreground">
                    seen by {group.observingDeviceIds.join(', ')}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto rounded-sm border border-border/40 bg-background/40">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/40 bg-muted/20 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-3 py-1.5 text-left">
                        Branch / id
                      </th>
                      <th scope="col" className="px-3 py-1.5 text-left">
                        HEAD
                      </th>
                      <th scope="col" className="px-3 py-1.5 text-left">
                        Path
                      </th>
                      <th scope="col" className="px-3 py-1.5 text-left">
                        State
                      </th>
                      <th scope="col" className="px-3 py-1.5 text-right">
                        Last seen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {group.worktrees.map((wt) => {
                      const reasons: string[] = [];
                      if (wt.isDirty) reasons.push('dirty');
                      if ((wt.untrackedCount ?? 0) > 0)
                        reasons.push(`${wt.untrackedCount} untracked`);
                      const ahead = wt.aheadCount ?? 0;
                      const behind = wt.behindCount ?? 0;
                      if (ahead > 0 && behind > 0) {
                        reasons.push(`diverged +${ahead}/-${behind}`);
                      } else {
                        if (ahead > 0) reasons.push(`+${ahead} ahead`);
                        if (behind > 0) reasons.push(`-${behind} behind`);
                      }
                      const isClean = !worktreeNeedsCleanup(wt);
                      return (
                        <tr
                          key={wt.worktreeId}
                          className="transition-colors hover:bg-accent/5"
                        >
                          <td className="px-3 py-1.5 align-top">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm text-foreground">
                                {wt.branch ?? wt.displayName ?? wt.worktreeId}
                              </span>
                              {wt.branch && wt.displayName && (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {wt.displayName}
                                </span>
                              )}
                            </div>
                            {wt.branchUpstream?.trackingBranch && (
                              <div className="font-mono text-xs text-muted-foreground/80">
                                ↳ {wt.branchUpstream.trackingBranch}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-1.5 align-top font-mono text-xs text-muted-foreground">
                            {wt.headSha?.slice(0, 7) ?? '—'}
                          </td>
                          <td className="px-3 py-1.5 align-top">
                            <span
                              className="block max-w-[28ch] truncate font-mono text-xs text-muted-foreground"
                              title={wt.worktreePath ?? undefined}
                            >
                              {wt.worktreePath ?? '—'}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 align-top">
                            {isClean ? (
                              <Badge variant="success">clean</Badge>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {wt.isDirty && (
                                  <Badge variant="warning">dirty</Badge>
                                )}
                                {(wt.untrackedCount ?? 0) > 0 && (
                                  <Badge variant="muted">
                                    {wt.untrackedCount} untracked
                                  </Badge>
                                )}
                                {ahead > 0 && behind > 0 ? (
                                  <Badge variant="destructive">
                                    diverged +{ahead}/-{behind}
                                  </Badge>
                                ) : (
                                  <>
                                    {ahead > 0 && (
                                      <Badge variant="info">+{ahead} ahead</Badge>
                                    )}
                                    {behind > 0 && (
                                      <Badge variant="muted">
                                        -{behind} behind
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-1.5 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                            {formatRelativeTime(wt.lastObservedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </ConsolePanel>
  );
};
