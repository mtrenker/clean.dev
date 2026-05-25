'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { createIntl } from 'react-intl';
import { ButtonLink, Card, DefinitionList, PageHero, SectionHeader, SiteContainer, SiteSection, SiteShell, StatStrip, Tag } from '@/components/site/public-design';
import { type Locale } from '@/lib/locale';
import { type Project } from '../projects';

interface PortfolioViewProps {
  projects: Project[];
  locale: Locale;
  messages: Record<string, string>;
}

const msg = (intl: ReturnType<typeof createIntl>, id: string) => intl.formatMessage({ id });
const getYear = (date: string) => new Date(`${date}-01T00:00:00Z`).getUTCFullYear();
const formatYearRange = (project: Project, compact = false) => {
  const startYear = getYear(project.startDate);
  const endYear = getYear(project.endDate);
  if (startYear === endYear) return `${startYear}`;
  return compact ? `${startYear}-${String(endYear).slice(2)}` : `${startYear} - ${endYear}`;
};
const projectName = (project: Project, lang: Locale) => project.company ?? project.industry?.[lang] ?? project.id;
const cityName = (city: string, lang: Locale) => (lang === 'de' && city === 'Munich' ? 'München' : city);
const uniqueCompanies = (projects: Project[], lang: Locale) => new Set(projects.map((project) => projectName(project, lang))).size;

const ProjectCard = ({ project, lang, hero = false, intl }: { project: Project; lang: Locale; hero?: boolean; intl: ReturnType<typeof createIntl> }) => (
  <Card as="article" className={`p-6 transition hover:border-[var(--site-rust)] ${hero ? 'lg:col-span-2' : ''}`}>
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--site-rule)] pb-4">
      <div>
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--site-rust)]">{project.title[lang]}</p>
        <h3 className="mt-2 text-3xl font-medium tracking-[-0.03em] text-[var(--site-ink)]">{projectName(project, lang)}</h3>
      </div>
      <Tag tone="amber">{formatYearRange(project, true)}</Tag>
    </div>

    <div className={hero ? 'mt-5 grid gap-6 md:grid-cols-[1.4fr_0.8fr]' : 'mt-5 space-y-5'}>
      <div>
        <p className="leading-7 text-[var(--site-ink-sec)]">{project.description[lang]}</p>
        {project.highlights[lang].length > 0 && (
          <ul className="mt-5 space-y-2">
            {project.highlights[lang].slice(0, hero ? 5 : 3).map((highlight) => (
              <li key={highlight} className="grid grid-cols-[1rem_1fr] gap-2 text-sm leading-6 text-[var(--site-ink-sec)]">
                <span className="font-mono text-[var(--site-green)]">+</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="space-y-5 border-t border-dashed border-[var(--site-rule)] pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
        <DefinitionList items={[
          { label: msg(intl, 'work.project.context'), value: `${cityName(project.city, lang)}${project.industry ? ` / ${project.industry[lang]}` : ''}` },
          { label: msg(intl, 'work.project.period'), value: formatYearRange(project) },
        ]} />
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, hero ? 14 : 9).map((technology) => (
            <span key={technology} className="rounded-[2px] border border-[var(--site-rule)] px-2 py-1 font-mono text-[0.65rem] text-[var(--site-ink-mute)]">
              {technology}
            </span>
          ))}
        </div>
      </aside>
    </div>
  </Card>
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
  const spotlightProjects = sortedProjects.filter((project) => project.spotlight);
  const timelineProjects = timelineExpanded ? sortedProjects : sortedProjects.slice(0, 10);
  const firstYear = Math.min(...projects.map((project) => getYear(project.startDate)));

  return (
    <SiteShell className="print:bg-white print:text-black">
      <PageHero
        eyebrow={msg(intl, 'work.hero.label')}
        title={msg(intl, 'work.hero.heading')}
        lead={msg(intl, 'work.hero.lead')}
        aside={(
          <Card className="p-5 print:hidden">
            <Image src="/me.png" alt={msg(intl, 'work.img.alt')} width={280} height={320} className="h-64 w-full rounded-[4px] border border-[var(--site-rule)] object-cover object-[50%_24%] grayscale-[10%]" priority />
            <div className="mt-5 border-t border-dashed border-[var(--site-rule)] pt-4">
              <p className="text-2xl font-medium tracking-[-0.02em] text-[var(--site-ink)]">Martin Trenker</p>
              <p className="mt-2 font-mono text-xs leading-6 text-[var(--site-ink-mute)]">{msg(intl, 'work.subtitle')}</p>
            </div>
          </Card>
        )}
      />

      <StatStrip stats={[
        { value: '20+', label: msg(intl, 'work.stats.years.label') },
        { value: String(projects.length), label: msg(intl, 'work.stats.engagements.label') },
        { value: String(uniqueCompanies(projects, lang)), label: msg(intl, 'work.stats.companies.label') },
        { value: String(firstYear), label: msg(intl, 'work.stats.since.label') },
      ]} />

      <SiteSection>
        <SiteContainer>
          <SectionHeader title={msg(intl, 'work.focus.heading')} meta={msg(intl, 'work.focus.meta')} />
          <div className="grid gap-4 md:grid-cols-3">
            {(['cleanAgile', 'learner', 'automation'] as const).map((section, index) => (
              <Card key={section} className="p-6">
                <p className="font-mono text-3xl font-medium text-[var(--site-rust)]">0{index + 1}</p>
                <h2 className="mt-5 text-2xl font-medium tracking-[-0.02em] text-[var(--site-ink)]">{msg(intl, `work.section.${section}.heading`)}</h2>
                <p className="mt-3 leading-7 text-[var(--site-ink-sec)]">{msg(intl, `work.section.${section}.p`)}</p>
              </Card>
            ))}
          </div>
        </SiteContainer>
      </SiteSection>

      <SiteSection>
        <SiteContainer>
          <SectionHeader title={msg(intl, 'work.spotlight.heading')} meta={msg(intl, 'work.spotlight.meta')} />
          <p className="mb-8 max-w-3xl leading-7 text-[var(--site-ink-sec)]">{msg(intl, 'work.spotlight.lead')}</p>
          <div className="grid gap-4 lg:grid-cols-3">
            {spotlightProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} lang={lang} intl={intl} hero={index === 0} />
            ))}
          </div>
        </SiteContainer>
      </SiteSection>

      <SiteSection border={false} className="print:p-0">
        <SiteContainer className="print:max-w-none print:px-0">
          <SectionHeader title={msg(intl, 'work.timeline.heading')} meta={msg(intl, 'work.timeline.meta')} />
          <ol className="overflow-hidden rounded-[6px] border border-[var(--site-rule)] bg-[var(--site-panel)] print:border-black print:bg-white">
            {timelineProjects.map((project) => (
              <TimelineEntry key={project.id} project={project} lang={lang} />
            ))}
          </ol>
          <button
            aria-expanded={timelineExpanded}
            className="mt-6 rounded-[3px] border border-[var(--site-rule)] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[var(--site-ink)] transition hover:border-[var(--site-rust)] hover:text-[var(--site-rust)] print:hidden"
            onClick={() => setTimelineExpanded((value) => !value)}
            type="button"
          >
            {timelineExpanded
              ? msg(intl, 'work.timeline.collapse')
              : intl.formatMessage({ id: 'work.timeline.showAll' }, { count: projects.length })}
          </button>
        </SiteContainer>
      </SiteSection>

      <SiteSection border={false} className="bg-[var(--site-panel-deep)] md:py-20 print:hidden">
        <SiteContainer>
          <Card className="p-8 md:p-10">
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
