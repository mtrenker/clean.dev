import React from 'react';
import { Badge, EmptyState } from '@/components/ui';
import { ConsolePanel } from '../console-panel';
import type { ProjectUsageBreakdown } from '@/lib/cockpit/project-detail';
import { formatCostUsd, formatNumber } from '@/lib/cockpit/format';

interface ProjectCostPanelProps {
  breakdown: ProjectUsageBreakdown;
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-sm bg-muted/40">
      <div className="h-full bg-accent/70" style={{ width: `${pct}%` }} />
    </div>
  );
}

interface DimSectionProps {
  title: string;
  prompt: string;
  rows: ProjectUsageBreakdown['byEngine'];
  maxTokens: number;
}

const DimSection: React.FC<DimSectionProps> = ({
  title,
  prompt,
  rows,
  maxTokens,
}) => (
  <div className="rounded-sm border border-border/50 bg-background/40 p-3">
    <div className="mb-3 flex items-baseline justify-between gap-2">
      <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </span>
      <span className="font-mono text-xs text-accent">{prompt}</span>
    </div>
    {rows.length === 0 ? (
      <p className="font-mono text-xs text-muted-foreground">no usage yet</p>
    ) : (
      <ul className="space-y-2">
        {rows.slice(0, 6).map((r) => {
          const tokens = r.usage.inputTokens + r.usage.outputTokens;
          return (
            <li key={r.name} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2 font-mono text-xs">
                <span className="truncate text-foreground" title={r.name}>
                  {r.name}
                </span>
                <span className="shrink-0 tabular-nums text-foreground/85">
                  {formatCostUsd(r.estimatedCostUsd)}
                </span>
              </div>
              <MiniBar value={tokens} max={maxTokens} />
              <div className="font-mono text-xs text-muted-foreground">
                {formatNumber(tokens)} tokens
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

/**
 * Per-project usage / cost panel. Mirrors the fleet `UsageBreakdownPanel` but
 * is scoped to a single project so an operator can answer "what is *this*
 * project costing me?" The bars are normalised across all three dimensions
 * so engine vs model vs profile share the same scale.
 */
export const ProjectCostPanel: React.FC<ProjectCostPanelProps> = ({
  breakdown,
}) => {
  const isEmpty =
    breakdown.byEngine.length === 0 &&
    breakdown.byModel.length === 0 &&
    breakdown.byProfile.length === 0 &&
    breakdown.totalUsage.inputTokens === 0 &&
    breakdown.totalUsage.outputTokens === 0;

  const maxTokens = Math.max(
    1,
    ...breakdown.byEngine.map((r) => r.usage.inputTokens + r.usage.outputTokens),
    ...breakdown.byModel.map((r) => r.usage.inputTokens + r.usage.outputTokens),
    ...breakdown.byProfile.map((r) => r.usage.inputTokens + r.usage.outputTokens),
  );

  return (
    <ConsolePanel
      title="Estimated cost & usage"
      command="cockpit cost ls --project"
      meta={
        <Badge variant="accent">
          {formatCostUsd(breakdown.totalEstimatedCostUsd)}
        </Badge>
      }
    >
      {isEmpty ? (
        <EmptyState
          title="No usage recorded"
          description="Token usage is reported per task. Once tasks complete, usage and cost will be aggregated here."
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
            <SummaryCell
              label="Input tokens"
              value={formatNumber(breakdown.totalUsage.inputTokens)}
            />
            <SummaryCell
              label="Output tokens"
              value={formatNumber(breakdown.totalUsage.outputTokens)}
            />
            <SummaryCell
              label="Total tokens"
              value={formatNumber(
                breakdown.totalUsage.inputTokens +
                  breakdown.totalUsage.outputTokens,
              )}
            />
            <SummaryCell
              label="Estimated cost"
              value={formatCostUsd(breakdown.totalEstimatedCostUsd)}
              tone="accent"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DimSection
              title="By engine"
              prompt="--by engine"
              rows={breakdown.byEngine}
              maxTokens={maxTokens}
            />
            <DimSection
              title="By model"
              prompt="--by model"
              rows={breakdown.byModel}
              maxTokens={maxTokens}
            />
            <DimSection
              title="By profile"
              prompt="--by profile"
              rows={breakdown.byProfile}
              maxTokens={maxTokens}
            />
          </div>
        </div>
      )}
    </ConsolePanel>
  );
};

interface SummaryCellProps {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'accent';
}

const SummaryCell: React.FC<SummaryCellProps> = ({
  label,
  value,
  tone = 'default',
}) => (
  <div className="rounded-sm border border-border/40 bg-background/50 px-3 py-2">
    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
      {label}
    </div>
    <div
      className={
        tone === 'accent'
          ? 'mt-1 font-mono text-base font-semibold tabular-nums text-accent'
          : 'mt-1 font-mono text-base font-semibold tabular-nums text-foreground'
      }
    >
      {value}
    </div>
  </div>
);
