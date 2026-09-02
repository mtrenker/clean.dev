import React from 'react';
import clsx from 'clsx';
import type { WorkflowStage } from './practice-brief';

/**
 * The five-stage delivery loop, rendered as an ordered list of real headings
 * and sentences rather than as an image or an SVG. The rule, the ticks, and the
 * dashed rework path are decoration and are hidden from assistive technology,
 * so there is no alt text that can drift out of sync with the captions.
 *
 * The loop note is always rendered as text by the caller, at every viewport and
 * in print. The drawn return path is the illustration of a statement that is
 * already written down.
 */

interface WorkflowRailProps {
  stages: WorkflowStage[];
  variant?: 'screen' | 'print';
}

const ScreenRail = ({ stages }: { stages: WorkflowStage[] }) => (
  <div className="relative">
    <ol className="grid gap-y-0 border-t-2 border-[var(--site-rule)] lg:grid-cols-5 lg:gap-x-6">
      {stages.map((stage) => (
        <li
          key={stage.number}
          className="border-b border-[var(--site-rule)] pb-5 pt-4 lg:border-b-0 lg:pb-0"
        >
          <span
            aria-hidden="true"
            className={clsx(
              'block h-[10px] w-[2px]',
              stage.gate ? 'bg-[var(--site-green)]' : 'bg-[var(--site-rust)]',
            )}
          />
          <p className="mt-3 font-mono text-sm text-[var(--site-rust)]">{stage.number}</p>
          <h3 className="mt-2 text-base font-semibold leading-6 text-[var(--site-ink)]">{stage.label}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--site-ink-sec)]">{stage.caption}</p>
        </li>
      ))}
    </ol>
    {/* Rework path: 04 back to 02. Wide viewports only; the loop note carries
        the meaning everywhere else. */}
    <div aria-hidden="true" className="mt-6 hidden lg:grid lg:grid-cols-5 lg:gap-x-6">
      <div className="col-start-2 col-end-5 flex items-center">
        <span className="h-4 w-px bg-[var(--site-ink-faint)]" />
        <span className="flex-1 border-b border-dashed border-[var(--site-ink-faint)]" />
        <span className="px-3 font-mono text-xs uppercase tracking-[0.16em] text-[var(--site-ink-sec)]">rework</span>
        <span className="flex-1 border-b border-dashed border-[var(--site-ink-faint)]" />
        <span className="h-4 w-px bg-[var(--site-ink-faint)]" />
      </div>
    </div>
  </div>
);

const PrintRail = ({ stages }: { stages: WorkflowStage[] }) => (
  <div className="break-inside-avoid">
    <ol className="grid grid-cols-5 gap-[2.5mm] border-t-2 border-[var(--print-ink)]">
      {stages.map((stage) => (
        <li key={stage.number}>
          <span aria-hidden="true" className="block h-[2mm] w-[0.5mm] bg-[var(--print-rust)]" />
          <p className="mt-[1mm] font-mono text-[6.5pt] font-semibold text-[var(--print-rust)]">{stage.number}</p>
          <h3 className="mt-[0.6mm] text-[8pt] font-semibold leading-[1.15] text-[var(--print-ink)]">{stage.label}</h3>
          <p className="mt-[0.8mm] text-[6.5pt] leading-[1.22] text-[var(--print-ink-sec)] hyphens-auto">{stage.caption}</p>
        </li>
      ))}
    </ol>
    <div aria-hidden="true" className="mt-[1mm] grid grid-cols-5 gap-[2.5mm]">
      <div className="col-start-2 col-end-5 flex items-center">
        <span className="h-[1.5mm] w-px bg-[var(--print-rule)]" />
        <span className="flex-1 border-b border-dashed border-[var(--print-rule)]" />
        <span className="px-[2mm] font-mono text-[6.5pt] uppercase tracking-[0.14em] text-[var(--print-ink-mute)]">rework</span>
        <span className="flex-1 border-b border-dashed border-[var(--print-rule)]" />
        <span className="h-[1.5mm] w-px bg-[var(--print-rule)]" />
      </div>
    </div>
  </div>
);

export const WorkflowRail: React.FC<WorkflowRailProps> = ({ stages, variant = 'screen' }) => (
  variant === 'print' ? <PrintRail stages={stages} /> : <ScreenRail stages={stages} />
);
