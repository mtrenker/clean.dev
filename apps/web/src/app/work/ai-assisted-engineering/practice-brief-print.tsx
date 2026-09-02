import React from 'react';
import { buildPrintBrief, type PrintItem } from './practice-brief';
import { WorkflowRail } from './workflow-rail';

/**
 * One-page A4 composition of the practice brief.
 *
 * It renders the curated projection built by `buildPrintBrief`, so every string
 * on the sheet is lifted verbatim from the same structured source the screen
 * uses. There is no second narrative here and no copy of its own: the component
 * chooses layout, the source chooses words, and the projection chooses which
 * items fit.
 *
 * The A4 content area is 174mm x 267mm, set by the global
 * `@page { margin: 1.5cm 1.8cm }`. Nothing here may use `break-before-page`.
 * The measured budget is in `apps/web/docs/ai-assisted-engineering-brief-spec.md`
 * section 11; if the sheet grows past one page, change the projection there
 * rather than shrinking type or inventing a content cut.
 */

const SectionRule = ({ title }: { title: string }) => (
  <h2 className="border-b border-[var(--print-ink)] pb-[1mm] text-[9pt] font-semibold leading-[1.15] tracking-[-0.01em] text-[var(--print-ink)]">
    {title}
  </h2>
);

const MaturityTag = ({ children }: { children: React.ReactNode }) => (
  <span className="mr-[1.5mm] inline-block border border-[var(--print-rule)] px-[1mm] py-[0.2mm] align-[1.5px] font-mono text-[5.5pt] font-semibold uppercase leading-[1.2] tracking-[0.08em] text-[var(--print-ink-mute)]">
    {children}
  </span>
);

const CompactItem = ({ item, tag }: { item: PrintItem; tag?: string }) => (
  <div className="break-inside-avoid border-t border-[var(--print-rule)] py-[1mm]">
    <p className="text-[8pt] font-semibold leading-[1.2] text-[var(--print-ink)]">
      {tag ? <MaturityTag>{tag}</MaturityTag> : null}
      {item.label}
    </p>
    <p className="mt-[0.4mm] text-[7pt] leading-[1.2] text-[var(--print-ink-sec)] hyphens-auto">{item.sentence}</p>
  </div>
);

export const PracticeBriefPrint: React.FC = () => {
  const brief = buildPrintBrief();

  return (
    <div data-print-document lang="en" className="hidden bg-white font-sans text-[var(--print-ink)] print:block">
      <header className="flex items-center justify-between border-b-2 border-[var(--print-ink)] pb-[2mm]">
        <p className="flex items-center gap-[2mm] font-mono text-[8pt] font-semibold uppercase tracking-[0.14em] text-[var(--print-ink)]">
          <span aria-hidden="true" className="inline-flex h-[4.5mm] w-[4.5mm] items-center justify-center border border-[var(--print-rust)] text-[var(--print-rust)]">/</span>
          clean.dev
        </p>
        <p className="font-mono text-[6.5pt] font-semibold uppercase tracking-[0.14em] text-[var(--print-ink-mute)]">
          {brief.docLabel}
        </p>
      </header>

      <section className="mt-[4mm] break-inside-avoid">
        <h1 className="text-[16pt] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--print-ink)]">{brief.title}</h1>
        <p className="mt-[1.2mm] text-[9.5pt] leading-[1.3] text-[var(--print-ink-sec)]">{brief.subtitle}</p>
        <hr className="mt-[1.6mm] w-[10mm] border-0 border-t-2 border-[var(--print-rust)]" />
        <p className="mt-[1.6mm] text-[8pt] leading-[1.3] text-[var(--print-ink-sec)] hyphens-auto">{brief.lead}</p>
      </section>

      <section className="mt-[2.5mm] break-inside-avoid border border-[var(--print-rule)] px-[3mm] py-[1.5mm]">
        <p className="font-mono text-[6pt] font-semibold uppercase tracking-[0.14em] text-[var(--print-ink-mute)]">
          {brief.principle.heading}
        </p>
        <div className="mt-[1.5mm] grid grid-cols-3 gap-[5mm]">
          {brief.principle.items.map((item) => (
            <div key={item.id}>
              <p className="text-[8pt] font-semibold leading-[1.2] text-[var(--print-ink)]">{item.label}</p>
              <p className="mt-[0.5mm] text-[7pt] leading-[1.25] text-[var(--print-ink-sec)] hyphens-auto">{item.sentence}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-[2.5mm] break-inside-avoid">
        <SectionRule title={brief.workflow.heading} />
        <div className="mt-[2mm]">
          <WorkflowRail stages={brief.workflow.stages} variant="print" />
        </div>
        <p className="mt-[1.5mm] text-[7pt] leading-[1.25] text-[var(--print-ink-sec)]">{brief.workflow.loopNote}</p>
      </section>

      <div className="mt-[2.5mm] grid grid-cols-[1.6fr_1fr] gap-[7mm]">
        {/* Left: the client record. Right: Martin's own voice, present tense. */}
        <section>
          <SectionRule title={brief.client.heading} />
          {/* A legend, not prose: sans at 6.5pt reads tighter than mono here and
              keeps the densest grey block on the sheet to two lines. */}
          <p className="mt-[1.2mm] text-[6.5pt] leading-[1.25] text-[var(--print-ink-mute)]">
            {brief.client.maturities.map((maturity) => (
              <React.Fragment key={maturity.id}>
                <span className="font-semibold text-[var(--print-ink)]">{maturity.label}</span>
                {` ${maturity.definition} `}
              </React.Fragment>
            ))}
          </p>
          <div className="mt-[1.5mm]">
            {brief.client.claims.map((claim) => (
              <CompactItem key={claim.id} item={claim} tag={claim.maturityLabel} />
            ))}
          </div>
          <p className="mt-[1.2mm] border-t border-[var(--print-rule)] pt-[1.2mm] text-[7pt] leading-[1.25] text-[var(--print-ink-sec)] hyphens-auto">
            {brief.client.closing}
          </p>
        </section>

        <section>
          <SectionRule title={brief.practice.heading} />
          <div className="mt-[1.5mm]">
            {brief.practice.items.map((item) => (
              <CompactItem key={item.id} item={item} />
            ))}
          </div>
          <div className="mt-[3mm] break-inside-avoid border-l-2 border-[var(--print-rust)] pl-[2.5mm]">
            <p className="font-mono text-[6pt] font-semibold uppercase tracking-[0.14em] text-[var(--print-ink-mute)]">
              {brief.limits.heading}
            </p>
            <ul className="mt-[1mm] space-y-[0.6mm]">
              {brief.limits.labels.map((label) => (
                <li key={label} className="text-[7pt] font-semibold leading-[1.2] text-[var(--print-ink)]">{label}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="mt-[2.5mm] break-inside-avoid">
        <SectionRule title={brief.tools.heading} />
        <div className="mt-[1.5mm] grid grid-cols-3 gap-x-[5mm] gap-y-[1.2mm]">
          {brief.tools.entries.map((entry) => (
            <div key={entry.id}>
              <p className="text-[7.5pt] font-semibold leading-[1.2] text-[var(--print-ink)]">
                {entry.name}
                <span className="ml-[1.2mm] font-mono text-[5.5pt] font-normal uppercase tracking-[0.08em] text-[var(--print-ink-mute)]">
                  {entry.context}
                </span>
              </p>
              <p className="mt-[0.4mm] text-[6.5pt] leading-[1.2] text-[var(--print-ink-sec)] hyphens-auto">{entry.purpose}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-[2.5mm] break-inside-avoid">
        <SectionRule title={brief.lessons.heading} />
        <div className="mt-[0.5mm] grid grid-cols-3 gap-x-[5mm]">
          {brief.lessons.items.map((item) => (
            <CompactItem key={item.id} item={item} />
          ))}
        </div>
      </section>

      <footer className="mt-[2.5mm] break-inside-avoid border-t border-[var(--print-rule)] pt-[1.2mm]">
        <p className="text-[6.5pt] leading-[1.25] text-[var(--print-ink-mute)]">
          {brief.colophon} {brief.subsetNote}
        </p>
        <p className="mt-[0.8mm] font-mono text-[6.5pt] tracking-[0.08em] text-[var(--print-ink)]">{brief.footer}</p>
      </footer>
    </div>
  );
};
