import React from 'react';
import Image from 'next/image';
import { createIntl } from 'react-intl';
import { type Locale } from '@/lib/locale';
import { type Project } from '../projects';
import { buildPrintCv, type PrintCvEntry } from './print-cv-data';

interface WorkPrintCvProps {
  projects: Project[];
  locale: Locale;
  messages: Record<string, string>;
}

const PrintLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-[7pt] font-semibold uppercase tracking-[0.14em] text-[var(--print-ink-mute)]">
    {children}
  </p>
);

const PrintSectionHeader = ({ title, meta }: { title: string; meta?: string }) => (
  <div className="flex items-end justify-between gap-[6mm] border-b border-[var(--print-ink)] pb-[1.6mm]">
    <h2 className="text-[13pt] font-medium leading-none tracking-[-0.015em] text-[var(--print-ink)]">{title}</h2>
    {meta ? <PrintLabel>{meta}</PrintLabel> : null}
  </div>
);

const PrintHistoryEntry = ({ entry }: { entry: PrintCvEntry }) => (
  <article className="grid break-inside-avoid grid-cols-[26mm_1fr] gap-[6mm] border-t border-[var(--print-rule)] py-[2.8mm] first:border-t-0">
    <div>
      <p className="font-mono text-[8.5pt] font-semibold leading-[1.3] text-[var(--print-ink)]">{entry.period}</p>
      {entry.context.map((line) => (
        <p key={line} className="mt-[0.7mm] font-mono text-[7pt] leading-[1.35] text-[var(--print-ink-mute)]">{line}</p>
      ))}
    </div>
    <div>
      <p className="font-mono text-[7pt] font-semibold uppercase tracking-[0.14em] text-[var(--print-rust)]">{entry.role}</p>
      <h3 className="mt-[0.6mm] text-[11pt] font-semibold leading-[1.2] text-[var(--print-ink)]">{entry.name}</h3>
      <p className="mt-[1.2mm] text-[9pt] leading-[1.4] text-[var(--print-ink-sec)] hyphens-auto">{entry.description}</p>
      {entry.highlights.length > 0 && (
        <ul className="mt-[1.5mm] space-y-[0.7mm]">
          {entry.highlights.map((highlight) => (
            <li key={highlight} className="grid grid-cols-[3.5mm_1fr] text-[8.5pt] leading-[1.35] text-[var(--print-ink-sec)]">
              <span aria-hidden="true" className="font-mono text-[var(--print-rust)]">+</span>
              <span className="hyphens-auto">{highlight}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-[1.5mm] font-mono text-[7.5pt] leading-[1.45] text-[var(--print-ink-mute)]">{entry.technologies}</p>
    </div>
  </article>
);

export const WorkPrintCv: React.FC<WorkPrintCvProps> = ({ projects, locale, messages }) => {
  const intl = createIntl({ locale, messages });
  const cv = buildPrintCv(projects, locale, intl);

  return (
    <div data-print-document className="hidden bg-white font-sans text-[var(--print-ink)] print:block">
      {/* Brand masthead */}
      <header className="flex items-center justify-between border-b-2 border-[var(--print-ink)] pb-[3mm]">
        <p className="flex items-center gap-[2.5mm] font-mono text-[9pt] font-semibold uppercase tracking-[0.14em] text-[var(--print-ink)]">
          <span aria-hidden="true" className="inline-flex h-[6mm] w-[6mm] items-center justify-center border border-[var(--print-rust)] text-[var(--print-rust)]">/</span>
          clean.dev
        </p>
        <PrintLabel>{`${cv.docLabel} · ${cv.updatedLabel}`}</PrintLabel>
      </header>

      {/* Identity + rail */}
      <section className="mt-[9mm] grid grid-cols-[1fr_44mm] gap-[11mm]">
        <div>
          <h1 className="text-[27pt] font-medium leading-[1.04] tracking-[-0.02em] text-[var(--print-ink)]">{cv.name}</h1>
          <p className="mt-[2.5mm] text-[11pt] leading-[1.45] text-[var(--print-ink-sec)]">{cv.subtitle}</p>
          <hr className="mt-[6mm] w-[14mm] border-0 border-t-2 border-[var(--print-rust)]" />
          {cv.about.map((paragraph) => (
            <p key={paragraph} className="mt-[4mm] text-[10pt] leading-[1.55] text-[var(--print-ink-sec)] hyphens-auto">
              {paragraph}
            </p>
          ))}
        </div>
        <aside>
          <Image
            alt={cv.photoAlt}
            className="w-full border border-[var(--print-rule)] object-cover"
            height={200}
            priority
            src="/me.png"
            width={176}
          />
          <div className="mt-[5mm]">
            <PrintLabel>{cv.contactHeading}</PrintLabel>
            <ul className="mt-[1.8mm] space-y-[1mm]">
              {cv.contactLines.map((line) => (
                <li key={line.href}>
                  <a className="font-mono text-[7pt] leading-[1.35] text-[var(--print-ink)] [overflow-wrap:anywhere]" href={line.href}>
                    {line.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-[5mm]">
            <PrintLabel>{cv.technologiesHeading}</PrintLabel>
            <p className="mt-[1.8mm] font-mono text-[7pt] leading-[1.6] text-[var(--print-ink-sec)]">{cv.technologies}</p>
          </div>
        </aside>
      </section>

      {/* Evidence strip */}
      <section className="mt-[9mm] grid break-inside-avoid grid-cols-4 divide-x divide-[var(--print-rule)] border-y border-[var(--print-ink)]">
        {cv.stats.map((stat) => (
          <div key={stat.label} className="py-[4mm] pl-[4mm] first:pl-0">
            <p className="text-[16pt] font-medium leading-none tracking-[-0.02em] text-[var(--print-ink)]">{stat.value}</p>
            <div className="mt-[1.6mm]">
              <PrintLabel>{stat.label}</PrintLabel>
            </div>
          </div>
        ))}
      </section>

      {/* Focus areas */}
      <section className="mt-[9mm] break-inside-avoid">
        <PrintSectionHeader meta={cv.focusMeta} title={cv.focusHeading} />
        <div className="mt-[4.5mm] grid grid-cols-3 gap-[8mm]">
          {cv.focusItems.map((item) => (
            <div key={item.number}>
              <p className="font-mono text-[10.5pt] font-semibold text-[var(--print-rust)]">{item.number}</p>
              <h3 className="mt-[1.8mm] text-[10pt] font-semibold leading-[1.3] text-[var(--print-ink)]">{item.heading}</h3>
              <p className="mt-[1.5mm] text-[9pt] leading-[1.5] text-[var(--print-ink-sec)] hyphens-auto">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Project history — the dossier pages, deliberately starting on a fresh sheet */}
      <section className="break-before-page">
        <div className="break-after-avoid">
          <PrintSectionHeader meta={cv.historyMeta} title={cv.historyHeading} />
        </div>
        <div className="mt-[1mm]">
          {cv.entries.map((entry) => (
            <PrintHistoryEntry key={entry.id} entry={entry} />
          ))}
        </div>
      </section>
    </div>
  );
};
