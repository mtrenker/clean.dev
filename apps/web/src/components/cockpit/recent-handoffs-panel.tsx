import React from 'react';
import { Badge, EmptyState, Link } from '@/components/ui';
import { ConsolePanel } from './console-panel';
import type { RecentHandoffRow } from '@/lib/cockpit/overview-aggregate';
import { formatDuration, formatRelativeTime } from '@/lib/cockpit/format';

interface RecentHandoffsPanelProps {
  rows: RecentHandoffRow[];
  hrefBase?: string;
}

function truncate(s: string, max = 220): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max).trimEnd()}…`;
}

/**
 * Recently completed tasks with their handoff summary (when available).
 *
 * Tasks that produced a `handoff.md` are surfaced first because that is
 * what an operator typically needs to read next. Tasks that completed
 * without a handoff are still listed (compact) so the recent fleet work
 * is visible.
 */
export const RecentHandoffsPanel: React.FC<RecentHandoffsPanelProps> = ({
  rows,
  hrefBase = '/cockpit',
}) => {
  return (
    <ConsolePanel
      title="Recent handoffs"
      command="cat tasks/*/handoff.md | tail -n 50"
      meta={
        rows.length > 0 ? (
          <Badge variant="muted">{rows.length} recent</Badge>
        ) : null
      }
    >
      {rows.length === 0 ? (
        <EmptyState
          title="No recent task handoffs"
          description="Completed tasks emit a handoff summary that appears here as soon as the daemon scans them."
        />
      ) : (
        <ol className="space-y-3">
          {rows.map((row) => {
            const t = row.task;
            return (
              <li
                key={`${row.projectId}:${t.taskId}`}
                className="rounded-sm border border-border/60 bg-background/50 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {t.taskName}
                      </span>
                      {t.handoffSummary ? (
                        <Badge variant="success">handoff</Badge>
                      ) : (
                        <Badge variant="muted">no handoff</Badge>
                      )}
                      {t.source === 'archive' && (
                        <Badge variant="outline">archive</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                      <Link
                        href={`${hrefBase}/${row.projectId}`}
                        variant="muted"
                      >
                        {row.projectName}
                      </Link>
                      <span aria-hidden="true">·</span>
                      <span>plan: {t.planId}</span>
                      {t.slug && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{t.slug}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    <div>{formatRelativeTime(t.completedAt)}</div>
                    {t.durationMs != null && (
                      <div>{formatDuration(t.durationMs)}</div>
                    )}
                  </div>
                </div>
                {t.handoffSummary && (
                  <pre className="mt-2 max-h-28 overflow-hidden whitespace-pre-wrap rounded-sm border border-border/40 bg-background/70 p-2 font-mono text-xs leading-5 text-foreground/85">
                    {truncate(t.handoffSummary)}
                  </pre>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </ConsolePanel>
  );
};
