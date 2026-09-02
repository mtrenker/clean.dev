import React from 'react';
import { practiceBrief, type Claim, type LabelledItem } from './practice-brief';
import { WorkflowRail } from './workflow-rail';

/**
 * One-page A4 composition of the practice brief.
 *
 * It renders a deterministic subset of the same source the screen uses: for
 * claims, practice items, and lessons it shows the label and `sentences[0]`
 * only. There is no second copy of any sentence, which is why the first
 * sentence of each item is authored to stand alone.
 *
 * The A4 content area is 174mm x 267mm, set by the global
 * `@page { margin: 1.5cm 1.8cm }`. Nothing here may use `break-before-page`,
 * and every block group avoids breaking inside itself. If the composition grows
 * past one sheet, apply the ordered trim list in
 * `apps/web/docs/ai-assisted-engineering-brief-spec.md` section 11 rather than
 * inventing a content cut.
 */

const SectionRule = ({ title, meta }: { title: string; meta?: string }) => (
  <div className="flex items-end justify-between gap-[6mm] border-b border-[var(--print-ink)] pb-[1.2mm]">
    <h2 className="text-[9.5pt] font-semibold leading-[1.15] tracking-[-0.01em] text-[var(--print-ink)]">{title}</h2>
    {meta ? (
      <p className="font-mono text-[6.5pt] uppercase tracking-[0.12em] text-[var(--print-ink-mute)]">{meta}</p>
    ) : null}
  </div>
);

const PrintTag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block border border-[var(--print-rule)] px-[1.2mm] py-[0.3mm] font-mono text-[6pt] font-semibold uppercase leading-[1.2] tracking-[0.1em] text-[var(--print-ink-mute)]">
    {children}
  </span>
);

const maturityLabel = (claim: Claim) =>
  practiceBrief.client.maturities.find((maturity) => maturity.id === claim.maturity)?.label ?? claim.maturity;

const CompactEntry = ({ label, sentence }: { label: string; sentence: string }) => (
  <div className="break-inside-avoid border-t border-[var(--print-rule)] py-[1.5mm]">
    <p className="text-[8.5pt] font-semibold leading-[1.25] text-[var(--print-ink)]">{label}</p>
    <p className="mt-[0.6mm] text-[8pt] leading-[1.3] text-[var(--print-ink-sec)] hyphens-auto">{sentence}</p>
  </div>
);

const compact = (item: LabelledItem) => <CompactEntry key={item.id} label={item.label} sentence={item.sentences[0]} />;

export const PracticeBriefPrint: React.FC = () => {
  const brief = practiceBrief;

  return (
    <div data-print-document lang="en" className="hidden bg-white font-sans text-[var(--print-ink)] print:block">
      <header className="flex items-center justify-between border-b-2 border-[var(--print-ink)] pb-[2.5mm]">
        <p className="flex items-center gap-[2.5mm] font-mono text-[8.5pt] font-semibold uppercase tracking-[0.14em] text-[var(--print-ink)]">
          <span aria-hidden="true" className="inline-flex h-[5mm] w-[5mm] items-center justify-center border border-[var(--print-rust)] text-[var(--print-rust)]">/</span>
          clean.dev
        </p>
        <p className="font-mono text-[6.5pt] font-semibold uppercase tracking-[0.14em] text-[var(--print-ink-mute)]">
          {brief.print.docLabel}
        </p>
      </header>

      <section className="mt-[5mm] break-inside-avoid">
        <h1 className="text-[19pt] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--print-ink)]">{brief.title}</h1>
        <p className="mt-[1.5mm] text-[10pt] leading-[1.35] text-[var(--print-ink-sec)]">{brief.subtitle}</p>
        <hr className="mt-[3mm] w-[12mm] border-0 border-t-2 border-[var(--print-rust)]" />
        <p className="mt-[3mm] text-[8.5pt] leading-[1.4] text-[var(--print-ink-sec)] hyphens-auto">{brief.lead}</p>
      </section>

      <section className="mt-[5mm] break-inside-avoid border border-[var(--print-rule)] px-[4mm] py-[2.5mm]">
        <p className="font-mono text-[6.5pt] font-semibold uppercase tracking-[0.14em] text-[var(--print-ink-mute)]">
          {brief.principle.heading}
        </p>
        <div className="mt-[2mm] grid grid-cols-3 gap-[6mm]">
          {brief.principle.items.map((item) => (
            <div key={item.id}>
              <p className="text-[8.5pt] font-semibold leading-[1.2] text-[var(--print-ink)]">{item.label}</p>
              <p className="mt-[0.8mm] text-[7.5pt] leading-[1.3] text-[var(--print-ink-sec)] hyphens-auto">{item.sentences[0]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-[5mm] break-inside-avoid">
        <SectionRule title={brief.workflow.heading} />
        <div className="mt-[3mm]">
          <WorkflowRail stages={brief.workflow.stages} variant="print" />
        </div>
        <p className="mt-[2mm] text-[7.5pt] leading-[1.3] text-[var(--print-ink-sec)]">{brief.workflow.loopNote}</p>
      </section>

      <div className="mt-[5mm] grid grid-cols-[1.37fr_1fr] gap-[8mm]">
        <section>
          <SectionRule title={brief.client.heading} />
          <p className="mt-[2mm] font-mono text-[6.5pt] leading-[1.35] text-[var(--print-ink-mute)]">
            {brief.client.maturities.map((maturity) => `${maturity.label}: ${maturity.definition}`).join(' ')}
          </p>
          <div className="mt-[2mm]">
            {brief.client.claims.map((claim) => (
              <div key={claim.id} className="break-inside-avoid border-t border-[var(--print-rule)] py-[1.4mm]">
                <p className="text-[8.5pt] font-semibold leading-[1.25] text-[var(--print-ink)]">
                  <PrintTag>{maturityLabel(claim)}</PrintTag>
                  <span className="ml-[1.5mm]">{claim.label}</span>
                </p>
                <p className="mt-[0.6mm] text-[8pt] leading-[1.3] text-[var(--print-ink-sec)] hyphens-auto">{claim.sentences[0]}</p>
              </div>
            ))}
          </div>
          <p className="mt-[1.5mm] border-t border-[var(--print-rule)] pt-[1.5mm] text-[7.5pt] leading-[1.3] text-[var(--print-ink-sec)] hyphens-auto">
            {brief.client.closing}
          </p>
        </section>

        <section>
          <SectionRule title={brief.practice.heading} />
          <div className="mt-[2mm]">{brief.practice.items.map(compact)}</div>
        </section>
      </div>

      <section className="mt-[5mm] break-inside-avoid">
        <SectionRule title={brief.tools.heading} />
        <div className="mt-[2mm] grid grid-cols-3 gap-x-[6mm] gap-y-[1.5mm]">
          {brief.tools.entries.map((entry) => (
            <div key={entry.id}>
              <p className="text-[8pt] font-semibold leading-[1.2] text-[var(--print-ink)]">
                {entry.name}
                <span className="ml-[1.5mm] font-mono text-[6.5pt] font-normal uppercase tracking-[0.1em] text-[var(--print-ink-mute)]">
                  {entry.context}
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-[5mm] break-inside-avoid">
        <SectionRule title={brief.lessons.heading} />
        <div className="mt-[1mm] grid grid-cols-2 gap-x-[8mm]">
          {brief.lessons.items.map(compact)}
        </div>
      </section>

      <section className="mt-[5mm] break-inside-avoid border-l-2 border-[var(--print-rust)] pl-[3mm]">
        <p className="font-mono text-[6.5pt] font-semibold uppercase tracking-[0.14em] text-[var(--print-ink-mute)]">
          {brief.limits.heading}
        </p>
        <div className="mt-[1.2mm] grid grid-cols-2 gap-x-[8mm] gap-y-[1mm]">
          {brief.limits.items.map((item) => (
            <p key={item.id} className="text-[7.5pt] leading-[1.3] text-[var(--print-ink-sec)] hyphens-auto">
              <span className="font-semibold text-[var(--print-ink)]">{item.label}</span>{' '}
              {item.sentences[0]}
            </p>
          ))}
        </div>
      </section>

      <footer className="mt-[4mm] break-inside-avoid border-t border-[var(--print-rule)] pt-[1.5mm]">
        <p className="text-[6.5pt] leading-[1.3] text-[var(--print-ink-mute)]">{brief.colophon}</p>
        <p className="mt-[1mm] font-mono text-[6.5pt] tracking-[0.08em] text-[var(--print-ink)]">{brief.print.footer}</p>
      </footer>
    </div>
  );
};
