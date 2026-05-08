import React from 'react';
import { Badge, EmptyState, Link } from '@/components/ui';
import { ConsolePanel } from './console-panel';
import type { WorktreeHygieneRow } from '@/lib/cockpit/overview-aggregate';
import { formatRelativeTime } from '@/lib/cockpit/format';

interface WorktreeHygienePanelProps {
  rows: WorktreeHygieneRow[];
  hrefBase?: string;
}

const REASON_VARIANT: Record<
  WorktreeHygieneRow['reasons'][number],
  'warning' | 'info' | 'destructive' | 'muted'
> = {
  dirty: 'warning',
  untracked: 'muted',
  ahead: 'info',
  behind: 'muted',
  diverged: 'destructive',
};

const REASON_LABEL: Record<WorktreeHygieneRow['reasons'][number], string> = {
  dirty: 'dirty',
  untracked: 'untracked',
  ahead: 'ahead',
  behind: 'behind',
  diverged: 'diverged',
};

/**
 * Worktree / branch hygiene panel.
 *
 * Surfaces every worktree that needs cleanup (dirty, has untracked files,
 * is ahead/behind/diverged from upstream). The goal is to make stale
 * branches visible without having to drill into each project.
 */
export const WorktreeHygienePanel: React.FC<WorktreeHygienePanelProps> = ({
  rows,
  hrefBase = '/cockpit',
}) => {
  return (
    <ConsolePanel
      title="Worktree hygiene"
      command="git worktree list --porcelain | needs-cleanup"
      meta={
        rows.length > 0 ? (
          <Badge variant="warning">{rows.length} need cleanup</Badge>
        ) : (
          <Badge variant="success">clean</Badge>
        )
      }
      flush
    >
      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="All worktrees clean"
            description="No tracked worktree is dirty, ahead of upstream, or has untracked files."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 text-left">Branch</th>
                <th scope="col" className="px-4 py-2 text-left">Project</th>
                <th scope="col" className="px-4 py-2 text-left">Path</th>
                <th scope="col" className="px-4 py-2 text-left">State</th>
                <th scope="col" className="px-4 py-2 text-right">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {rows.map((row) => {
                const wt = row.worktree;
                return (
                  <tr
                    key={`${row.projectId}:${wt.worktreeId}`}
                    className="transition-colors hover:bg-accent/5"
                  >
                    <td className="px-4 py-2 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-foreground">
                          {wt.branch ?? wt.displayName ?? wt.worktreeId}
                        </span>
                        {wt.headSha && (
                          <span className="font-mono text-xs text-muted-foreground">
                            {wt.headSha.slice(0, 7)}
                          </span>
                        )}
                      </div>
                      {wt.groupName && (
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                          group: {wt.groupName}
                        </div>
                      )}
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
                    <td className="px-4 py-2 align-top">
                      <span
                        className="block max-w-[28ch] truncate font-mono text-xs text-muted-foreground"
                        title={wt.worktreePath ?? undefined}
                      >
                        {wt.worktreePath ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-top">
                      <div className="flex flex-wrap gap-1">
                        {row.reasons.map((r) => (
                          <Badge key={r} variant={REASON_VARIANT[r]}>
                            {REASON_LABEL[r]}
                            {r === 'ahead' && (wt.aheadCount ?? 0) > 0
                              ? ` +${wt.aheadCount}`
                              : ''}
                            {r === 'behind' && (wt.behindCount ?? 0) > 0
                              ? ` -${wt.behindCount}`
                              : ''}
                            {r === 'diverged'
                              ? ` +${wt.aheadCount ?? 0}/-${wt.behindCount ?? 0}`
                              : ''}
                            {r === 'untracked' && (wt.untrackedCount ?? 0) > 0
                              ? ` ${wt.untrackedCount}`
                              : ''}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right align-top font-mono text-xs text-muted-foreground tabular-nums">
                      {formatRelativeTime(wt.lastObservedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ConsolePanel>
  );
};
