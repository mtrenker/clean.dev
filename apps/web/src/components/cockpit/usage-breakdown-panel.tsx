import React from 'react';
import { Badge, EmptyState } from '@/components/ui';
import { ConsolePanel } from './console-panel';
import type { UsageBreakdown } from '@/lib/cockpit/overview-aggregate';
import { formatCostUsd, formatNumber } from '@/lib/cockpit/format';

interface UsageBreakdownPanelProps {
  breakdown: UsageBreakdown;
  /** Hide rows with zero tokens (default true). */
  hideEmpty?: boolean;
  /** Maximum number of combined rows to render (default 12). */
  combinedLimit?: number;
}

interface DimRow {
  name: string;
  tokens: number;
  cost: number;
  taskCount: number;
}

function MiniBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-sm bg-muted/40"
      role="presentation"
    >
      <div
        className={className ?? 'h-full bg-accent/70'}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function DimList({
  title,
  prompt,
  rows,
  max,
  hideEmpty,
}: {
  title: string;
  prompt: string;
  rows: DimRow[];
  max: number;
  hideEmpty: boolean;
}) {
  const visible = hideEmpty ? rows.filter((r) => r.tokens > 0 || r.cost > 0) : rows;
  return (
    <div className="rounded-sm border border-border/50 bg-background/40 p-3">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {title}
        </span>
        <span className="font-mono text-xs text-accent">{prompt}</span>
      </div>
      {visible.length === 0 ? (
        <p className="font-mono text-xs text-muted-foreground">no usage yet</p>
      ) : (
        <ul className="space-y-2">
          {visible.slice(0, 5).map((r) => (
            <li key={r.name} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2 font-mono text-xs">
                <span className="truncate text-foreground" title={r.name}>
                  {r.name}
                </span>
                <span className="shrink-0 tabular-nums text-foreground/85">
                  {formatCostUsd(r.cost)}
                </span>
              </div>
              <MiniBar value={r.tokens} max={max} />
              <div className="font-mono text-xs text-muted-foreground">
                {formatNumber(r.tokens)} tokens · {r.taskCount} task
                {r.taskCount === 1 ? '' : 's'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Estimated usage / cost broken down by engine, model, and profile.
 *
 * Top section is a sparkline-style triple panel (one mini-bar list per
 * dimension). Bottom is a combined ranking — the engine•model•profile
 * combinations consuming the most estimated dollars across the fleet.
 */
export const UsageBreakdownPanel: React.FC<UsageBreakdownPanelProps> = ({
  breakdown,
  hideEmpty = true,
  combinedLimit = 12,
}) => {
  const byEngine: DimRow[] = breakdown.byEngine.map((r) => ({
    name: r.name,
    tokens: r.usage.inputTokens + r.usage.outputTokens,
    cost: r.estimatedCostUsd,
    taskCount: r.taskCount,
  }));
  const byModel: DimRow[] = breakdown.byModel.map((r) => ({
    name: r.name,
    tokens: r.usage.inputTokens + r.usage.outputTokens,
    cost: r.estimatedCostUsd,
    taskCount: r.taskCount,
  }));
  const byProfile: DimRow[] = breakdown.byProfile.map((r) => ({
    name: r.name,
    tokens: r.usage.inputTokens + r.usage.outputTokens,
    cost: r.estimatedCostUsd,
    taskCount: r.taskCount,
  }));

  const maxTokens = Math.max(
    1,
    ...byEngine.map((r) => r.tokens),
    ...byModel.map((r) => r.tokens),
    ...byProfile.map((r) => r.tokens),
  );

  const combinedRows = breakdown.rows.filter(
    (r) => !hideEmpty || r.inputTokens + r.outputTokens > 0 || r.estimatedCostUsd > 0,
  );
  const combinedMaxCost = Math.max(
    1,
    ...combinedRows.map((r) => r.estimatedCostUsd),
  );

  const isEmpty =
    byEngine.length === 0 && byModel.length === 0 && byProfile.length === 0;

  return (
    <ConsolePanel
      title="Estimated usage & cost"
      command="cockpit cost ls --by engine,model,profile"
      meta={
        breakdown.rows.length > 0 ? (
          <Badge variant="accent">
            {breakdown.rows.length} combination
            {breakdown.rows.length === 1 ? '' : 's'}
          </Badge>
        ) : null
      }
    >
      {isEmpty ? (
        <EmptyState
          title="No usage recorded"
          description="Token usage is reported per task. Once tasks complete, usage will be aggregated here."
        />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DimList
              title="By engine"
              prompt="--by engine"
              rows={byEngine}
              max={maxTokens}
              hideEmpty={hideEmpty}
            />
            <DimList
              title="By model"
              prompt="--by model"
              rows={byModel}
              max={maxTokens}
              hideEmpty={hideEmpty}
            />
            <DimList
              title="By profile"
              prompt="--by profile"
              rows={byProfile}
              max={maxTokens}
              hideEmpty={hideEmpty}
            />
          </div>

          {combinedRows.length > 0 && (
            <div className="overflow-x-auto rounded-sm border border-border/50">
              <table className="w-full text-sm">
                <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left">Engine</th>
                    <th scope="col" className="px-4 py-2 text-left">Model</th>
                    <th scope="col" className="px-4 py-2 text-left">Profile</th>
                    <th scope="col" className="px-4 py-2 text-right">Input</th>
                    <th scope="col" className="px-4 py-2 text-right">Output</th>
                    <th scope="col" className="px-4 py-2 text-right">Tasks</th>
                    <th scope="col" className="px-4 py-2 text-right">Est. cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {combinedRows.slice(0, combinedLimit).map((r) => (
                    <tr key={r.key} className="hover:bg-accent/5">
                      <td className="px-4 py-2 font-mono text-xs text-foreground">
                        {r.engine}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-foreground">
                        {r.model}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-foreground">
                        {r.profile}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-foreground/85">
                        {formatNumber(r.inputTokens)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-foreground/85">
                        {formatNumber(r.outputTokens)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {r.taskCount}
                      </td>
                      <td className="px-4 py-2 text-right align-middle">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-xs tabular-nums text-accent">
                            {formatCostUsd(r.estimatedCostUsd)}
                          </span>
                          <div className="w-24">
                            <MiniBar
                              value={r.estimatedCostUsd}
                              max={combinedMaxCost}
                              className="h-full bg-accent/70"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </ConsolePanel>
  );
};
