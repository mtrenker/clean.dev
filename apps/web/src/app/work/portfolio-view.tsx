'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { createIntl } from 'react-intl';
import { ButtonLink, Card, DefinitionList, Eyebrow, SectionHeader, SiteContainer, SiteSection, SiteShell, StatStrip, Tag } from '@/components/site/public-design';
import { getConsultingAvailability } from '@/lib/availability';
import { type Locale } from '@/lib/locale';
import { labItems } from '../lab';
import { type Project } from '../projects';
import { buildDouglasWorkCase, type DouglasWorkCase, formatMonthPeriod } from './douglas-case';
import { buildFeaturedProjectCases, type CaseEvidence, type FeaturedProjectCase } from './featured-cases';
import { recentTechnologies } from './print-cv-data';

interface PortfolioViewProps {
  projects: Project[];
  locale: Locale;
  messages: Record<string, string>;
}

const msg = (intl: ReturnType<typeof createIntl>, id: string) => intl.formatMessage({ id });
const getYear = (date: string) => new Date(`${date}-01T00:00:00Z`).getUTCFullYear();
const formatDateRange = (startDate: string, endDate: string, compact = false) => {
  const startYear = getYear(startDate);
  const endYear = getYear(endDate);
  if (startYear === endYear) return `${startYear}`;
  return compact ? `${startYear}-${String(endYear).slice(2)}` : `${startYear} - ${endYear}`;
};
const formatYearRange = (project: Project, compact = false) => formatDateRange(project.startDate, project.endDate, compact);
const projectName = (project: Project, lang: Locale) => project.company ?? project.industry?.[lang] ?? project.id;
const cityName = (city: string, lang: Locale) => (lang === 'de' && city === 'Munich' ? 'München' : city);
const uniqueCompanies = (projects: Project[], lang: Locale) => new Set(projects.map((project) => projectName(project, lang))).size;

const CaseOutcomeList = ({ outcomes }: { outcomes: string[] }) => (
  <ul className="mt-4 space-y-2">
    {outcomes.map((outcome) => (
      <li key={outcome} className="grid grid-cols-[1rem_1fr] gap-2 text-sm leading-6 text-[var(--site-ink-sec)]">
        <span className="font-mono text-[var(--site-green)]">+</span>
        <span>{outcome}</span>
      </li>
    ))}
  </ul>
);

const CaseEvidenceList = ({ evidence, intl }: { evidence: CaseEvidence[]; intl: ReturnType<typeof createIntl> }) => (
  <ul className="mt-4 space-y-3">
    {evidence.map((item) => (
      <li key={item.text} className="text-sm leading-6 text-[var(--site-ink-sec)]">
        <Tag tone={item.kind === 'measured' ? 'green' : 'amber'}>
          {msg(intl, item.kind === 'measured' ? 'work.case.measured' : 'work.case.observed')}
        </Tag>
        <p className="mt-2">{item.text}</p>
      </li>
    ))}
  </ul>
);

const FeaturedProjectCaseCard = ({ workCase, intl, lang }: { workCase: FeaturedProjectCase; intl: ReturnType<typeof createIntl>; lang: Locale }) => (
  <Card as="article" className="scroll-mt-24 p-6 transition hover:border-[var(--site-rust)]">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--site-rule)] pb-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--site-rust)]">{workCase.role}</p>
        <h3 className="mt-2 text-3xl font-medium tracking-[-0.03em] text-[var(--site-ink)]">{workCase.company}</h3>
      </div>
      <Tag tone="amber">{formatMonthPeriod(workCase.startDate, workCase.endDate, lang)}</Tag>
    </div>

    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <section>
        <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{msg(intl, 'work.case.situation')}</h4>
        <p className="mt-3 leading-7 text-[var(--site-ink-sec)]">{workCase.situation}</p>
      </section>
      <section>
        <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{msg(intl, 'work.case.mandate')}</h4>
        <p className="mt-3 leading-7 text-[var(--site-ink-sec)]">{workCase.mandate}</p>
      </section>
    </div>

    <div className="mt-7 grid gap-6 border-t border-[var(--site-rule)] pt-6 md:grid-cols-2">
      <section>
        <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{msg(intl, 'work.case.personalOwnership')}</h4>
        <CaseOutcomeList outcomes={workCase.personalOwnership} />
      </section>
      <section>
        <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{msg(intl, 'work.case.outcomes')}</h4>
        <CaseEvidenceList evidence={workCase.outcomes} intl={intl} />
      </section>
      <section>
        <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{msg(intl, 'work.case.teamContribution')}</h4>
        <CaseOutcomeList outcomes={workCase.teamContribution} />
      </section>
      <aside>
        <DefinitionList items={[
          { label: msg(intl, 'work.project.context'), value: `${cityName(workCase.city, lang)} / ${workCase.industry}` },
          { label: msg(intl, 'work.project.period'), value: formatMonthPeriod(workCase.startDate, workCase.endDate, lang) },
        ]} />
        <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{msg(intl, 'work.projects.technologies')}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {workCase.technologies.map((technology) => (
            <span key={technology} className="rounded-[2px] border border-[var(--site-rule)] px-2 py-1 font-mono text-xs text-[var(--site-ink-mute)]">{technology}</span>
          ))}
        </div>
      </aside>
    </div>
  </Card>
);

const DouglasCaseCard = ({ workCase, intl, lang }: { workCase: DouglasWorkCase; intl: ReturnType<typeof createIntl>; lang: Locale }) => (
  <article id={workCase.id} className="scroll-mt-24 rounded-[6px] border border-[var(--site-rule)] bg-[var(--site-panel)] p-6 transition hover:border-[var(--site-rust)] lg:col-span-2">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--site-rule)] pb-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--site-rust)]">{workCase.role}</p>
        <h3 className="mt-2 text-3xl font-medium tracking-[-0.03em] text-[var(--site-ink)]">{workCase.company}</h3>
      </div>
      <span className="rounded-[2px] border border-[var(--site-rust-soft)] px-2 py-1 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-rust)]">
        {formatMonthPeriod(workCase.startDate, workCase.endDate, lang)}
      </span>
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(15rem,0.5fr)]">
      <div>
        <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">
          {msg(intl, 'work.case.mandate')}
        </h4>
        <p className="mt-3 max-w-4xl leading-7 text-[var(--site-ink-sec)]">{workCase.mandate}</p>
      </div>
      <aside className="border-t border-dashed border-[var(--site-rule)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <DefinitionList items={[
          { label: msg(intl, 'work.project.context'), value: `${cityName(workCase.city, lang)} / ${workCase.industry}` },
          { label: msg(intl, 'work.project.period'), value: formatMonthPeriod(workCase.startDate, workCase.endDate, lang) },
        ]} />
      </aside>
    </div>

    <section aria-labelledby="douglas-progression-heading" className="mt-7 border-t border-[var(--site-rule)] pt-6">
      <h4 id="douglas-progression-heading" className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">
        {msg(intl, 'work.case.progression')}
      </h4>
      <ol className="mt-4 grid overflow-hidden rounded-[4px] border border-[var(--site-rule)] md:grid-cols-3 md:divide-x md:divide-[var(--site-rule)]">
        {workCase.progression.map((step) => (
          <li key={step.number} className="border-t border-[var(--site-rule)] p-5 first:border-t-0 md:border-t-0">
            <p className="font-mono text-2xl text-[var(--site-rust)]">{step.number}</p>
            <h5 className="mt-3 text-lg font-semibold text-[var(--site-ink)]">{step.role}</h5>
            <p className="mt-2 text-sm leading-6 text-[var(--site-ink-sec)]">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>

    <section className="mt-7 border-t border-[var(--site-rule)] pt-6">
      <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">
        {msg(intl, 'work.case.outcomes')}
      </h4>
      <CaseEvidenceList evidence={workCase.outcomes} intl={intl} />
    </section>

    <div className="mt-7 grid gap-6 border-t border-[var(--site-rule)] pt-6 lg:grid-cols-[1fr_1fr_0.7fr]">
      <section>
        <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">
          {msg(intl, 'work.case.personalOwnership')}
        </h4>
        <CaseOutcomeList outcomes={workCase.personalOwnership} />
      </section>
      <section>
        <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">
          {msg(intl, 'work.case.teamContribution')}
        </h4>
        <CaseOutcomeList outcomes={workCase.teamContribution} />
      </section>
      <aside className="border-t border-dashed border-[var(--site-rule)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">
          {msg(intl, 'work.projects.technologies')}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {workCase.technologies.map((technology) => (
            <span key={technology} className="rounded-[2px] border border-[var(--site-rule)] px-2 py-1 font-mono text-xs text-[var(--site-ink-mute)]">
              {technology}
            </span>
          ))}
        </div>
      </aside>
    </div>
  </article>
);

const TimelineEntry = ({ project, lang }: { project: Project; lang: Locale }) => (
  <li className="grid gap-2 border-t border-[var(--site-rule)] px-5 py-4 first:border-t-0 md:grid-cols-[8rem_14rem_13rem_1fr] md:items-start md:gap-4">
    <time className="font-mono text-xs tracking-[0.04em] text-[var(--site-ink-mute)]" dateTime={`${getYear(project.startDate)}`}>
      {formatYearRange(project, true)}
    </time>
    <span className="font-mono text-sm font-semibold text-[var(--site-ink)]">{projectName(project, lang)}</span>
    <span className="font-mono text-xs text-[var(--site-rust)]">{project.title[lang]}</span>
    <span className="text-sm leading-6 text-[var(--site-ink-sec)]">{project.description[lang]}</span>
  </li>
);

export const PortfolioView: React.FC<PortfolioViewProps> = ({ projects, locale, messages }) => {
  const lang = locale;
  const intl = createIntl({ locale, messages });
  const [timelineExpanded, setTimelineExpanded] = useState(false);

  const sortedProjects = [...projects].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const douglasCase = buildDouglasWorkCase(projects, lang);
  const featuredProjectCases = buildFeaturedProjectCases(projects, lang);
  const timelineProjects = timelineExpanded ? sortedProjects : sortedProjects.slice(0, 10);
  const firstYear = Math.min(...projects.map((project) => getYear(project.startDate)));
  const availability = getConsultingAvailability(locale);
  const coreTechnologies = recentTechnologies(projects, 9);

  return (
    <SiteShell className="print:hidden">
      <SiteSection className="py-10 md:py-14">
        <SiteContainer>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <Eyebrow>{msg(intl, 'work.hero.label')}</Eyebrow>
              <h1 className="mt-6 max-w-5xl text-[clamp(2.8rem,6.5vw,5.6rem)] font-medium leading-[0.95] tracking-[-0.055em] text-[var(--site-ink)]">
                {msg(intl, 'work.hero.heading')}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--site-ink-sec)] md:text-xl">
                {msg(intl, 'work.hero.lead')}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/contact">{msg(intl, 'work.cta.button')}</ButtonLink>
                <ButtonLink
                  ariaLabel={msg(intl, 'work.hero.downloadAria')}
                  href={`/work/dossier?locale=${locale}`}
                  variant="secondary"
                >
                  {msg(intl, 'work.hero.download')}
                </ButtonLink>
              </div>
              <Card className="mt-7 grid gap-5 p-5 md:grid-cols-2">
                <div>
                  <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">
                    <span className="inline-block h-2 w-2 rounded-full bg-[var(--site-green)]" aria-hidden />
                    {availability.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--site-ink)]">{availability.dossierSummary}</p>
                </div>
                <div className="border-t border-dashed border-[var(--site-rule)] pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{msg(intl, 'work.focus.heading')}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--site-ink)]">{msg(intl, 'work.hero.projectTypes')}</p>
                </div>
              </Card>
            </div>

            <Card className="p-5">
              <div className="flex items-center gap-4 lg:block">
                <Image src="/me.png" alt={msg(intl, 'work.img.alt')} width={280} height={220} className="h-24 w-24 rounded-[4px] border border-[var(--site-rule)] object-cover object-[50%_24%] grayscale-[10%] lg:h-48 lg:w-full" priority />
                <div className="lg:mt-4">
                  <p className="text-2xl font-medium tracking-[-0.02em] text-[var(--site-ink)]">Martin Trenker</p>
                  <p className="mt-1 font-mono text-xs leading-6 text-[var(--site-rust)]">{msg(intl, 'work.subtitle')}</p>
                </div>
              </div>
              <div className="mt-5 border-t border-dashed border-[var(--site-rule)] pt-4">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{msg(intl, 'work.hero.coreStack')}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {coreTechnologies.map((technology) => (
                    <span key={technology} className="rounded-[2px] border border-[var(--site-rule)] px-2 py-1 font-mono text-xs text-[var(--site-ink-mute)]">{technology}</span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </SiteContainer>
      </SiteSection>

      <StatStrip stats={[
        { value: '20+', label: msg(intl, 'work.stats.years.label') },
        { value: String(projects.length), label: msg(intl, 'work.stats.engagements.label') },
        { value: String(uniqueCompanies(projects, lang)), label: msg(intl, 'work.stats.companies.label') },
        { value: String(firstYear), label: msg(intl, 'work.stats.since.label') },
      ]} />

      <SiteSection>
        <SiteContainer>
          <SectionHeader title={msg(intl, 'work.spotlight.heading')} meta={msg(intl, 'work.spotlight.meta')} />
          <p className="max-w-3xl leading-7 text-[var(--site-ink-sec)]">{msg(intl, 'work.spotlight.lead')}</p>
          <p className="mt-3 max-w-4xl font-mono text-xs leading-6 text-[var(--site-ink-sec)]">{msg(intl, 'work.case.evidenceNote')}</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <DouglasCaseCard workCase={douglasCase} intl={intl} lang={lang} />
            {featuredProjectCases.map((workCase) => (
              <FeaturedProjectCaseCard key={workCase.id} workCase={workCase} lang={lang} intl={intl} />
            ))}
          </div>
        </SiteContainer>
      </SiteSection>

      <SiteSection border={false}>
        <SiteContainer>
          <SectionHeader title={msg(intl, 'work.timeline.heading')} meta={msg(intl, 'work.timeline.meta')} />
          <ol className="overflow-hidden rounded-[6px] border border-[var(--site-rule)] bg-[var(--site-panel)]">
            {timelineProjects.map((project) => (
              <TimelineEntry key={project.id} project={project} lang={lang} />
            ))}
          </ol>
          <button
            aria-expanded={timelineExpanded}
            className="mt-6 rounded-[3px] border border-[var(--site-rule)] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[var(--site-ink)] transition hover:border-[var(--site-rust)] hover:text-[var(--site-rust)]"
            onClick={() => setTimelineExpanded((value) => !value)}
            type="button"
          >
            {timelineExpanded
              ? msg(intl, 'work.timeline.collapse')
              : intl.formatMessage({ id: 'work.timeline.showAll' }, { count: projects.length })}
          </button>
        </SiteContainer>
      </SiteSection>

      <SiteSection>
        <SiteContainer>
          <SectionHeader title={msg(intl, 'work.lab.heading')} meta={msg(intl, 'work.lab.meta')} />
          <p className="mb-8 max-w-3xl leading-7 text-[var(--site-ink-sec)]">{msg(intl, 'work.lab.lead')}</p>
          <div className="grid gap-4 lg:grid-cols-3">
            {labItems.map((item) => (
              <Card key={item.id} as="article" className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <h3 className="text-2xl font-medium tracking-[-0.02em] text-[var(--site-ink)]">{item.title[lang]}</h3>
                  <Tag tone="amber">{item.period[lang]}</Tag>
                </div>
                <p className="mt-3 leading-7 text-[var(--site-ink-sec)]">{item.description[lang]}</p>
                <dl className="mt-5 space-y-4 border-t border-dashed border-[var(--site-rule)] pt-5">
                  {[
                    { label: msg(intl, 'work.lab.ownership'), value: item.ownership[lang] },
                    { label: msg(intl, 'work.lab.relevance'), value: item.clientRelevance[lang] },
                    { label: msg(intl, 'work.lab.operations'), value: item.operations[lang] },
                  ].map((detail) => (
                    <div key={detail.label}>
                      <dt className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--site-ink-mute)]">{detail.label}</dt>
                      <dd className="mt-1 text-sm leading-6 text-[var(--site-ink-sec)]">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
                {item.workflowExample ? (
                  <div className="mt-5 border-l-2 border-[var(--site-green)] bg-[var(--site-panel-alt)] p-4">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--site-ink-sec)]">{msg(intl, 'work.lab.workflow')}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--site-ink)]">{item.workflowExample[lang]}</p>
                  </div>
                ) : null}
                {item.highlights[lang].length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {item.highlights[lang].map((highlight) => (
                      <li key={highlight} className="grid grid-cols-[1rem_1fr] gap-2 text-sm leading-6 text-[var(--site-ink-sec)]">
                        <span className="font-mono text-[var(--site-green)]">+</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-5 flex flex-wrap gap-1.5 border-t border-dashed border-[var(--site-rule)] pt-4">
                  {item.technologies.map((technology) => (
                    <span key={technology} className="rounded-[2px] border border-[var(--site-rule)] px-2 py-1 font-mono text-xs text-[var(--site-ink-mute)]">
                      {technology}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-6 font-mono text-xs text-[var(--site-ink-sec)]">{msg(intl, 'work.certs.note')}</p>
        </SiteContainer>
      </SiteSection>

      <SiteSection border={false} className="bg-[var(--site-panel-deep)] md:py-20">
        <SiteContainer>
          <Card className="p-8 md:p-10">
            <div className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-dashed border-[var(--site-rule)] pb-6">
              <span className="inline-block h-2 w-2 shrink-0 self-center rounded-full bg-[var(--site-green)]" aria-hidden />
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{availability.label}</span>
              <span className="text-sm leading-6 text-[var(--site-ink)]">{availability.dossierSummary}</span>
            </div>
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-[-0.03em] text-[var(--site-ink)] md:text-5xl">
              {msg(intl, 'work.cta.heading')}
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--site-ink-sec)]">{msg(intl, 'work.cta.lead')}</p>
            <ButtonLink href="/contact" className="mt-8">{msg(intl, 'work.cta.button')}</ButtonLink>
          </Card>
        </SiteContainer>
      </SiteSection>
    </SiteShell>
  );
};
