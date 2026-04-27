'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { createIntl } from 'react-intl';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Badge } from '@/components/ui/badge';
import { CliPanel } from '@/components/ui/cli-panel';
import { Link } from '@/components/ui/link';
import { type Project } from '../projects';
import { type Locale } from '@/lib/locale';

interface PortfolioViewProps {
  projects: Project[];
  locale: Locale;
  messages: Record<string, string>;
}

// ─── Spotlight Card ──────────────────────────────────────────────────────────

interface SpotlightCardProps {
  project: Project;
  lang: Locale;
  intl: ReturnType<typeof createIntl>;
  hero?: boolean;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ project, lang, intl, hero }) => {
  const startYear = new Date(project.startDate).getFullYear();
  const endYear = new Date(project.endDate).getFullYear();
  const yearRange = startYear === endYear ? `${startYear}` : `${startYear} – ${endYear}`;

  const caseName = (project.company ?? project.industry?.[lang] ?? project.id)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return (
    <CliPanel
      title={`case.${caseName}`}
      command="inspect --proof"
      className={clsx(
        'observe group transition-[opacity,transform,border-color,box-shadow] hover:border-accent hover:shadow-[4px_4px_0px_0px_hsl(var(--accent))]',
        hero ? 'md:col-span-2' : 'col-span-1',
      )}
      bodyClassName={clsx('flex flex-col gap-6', hero ? 'md:grid md:grid-cols-[minmax(0,1.55fr)_minmax(14rem,0.75fr)] md:gap-10' : '')}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="m-0 font-serif text-2xl font-bold leading-tight text-foreground">
            {project.company ?? project.industry?.[lang]}
          </h3>
          <time className="text-label shrink-0 text-accent" dateTime={`${startYear}`}>
            {yearRange}
          </time>
        </div>

        <p className="text-label m-0 text-muted-foreground">
          {project.title[lang]}
        </p>

        <p className="m-0 text-sm leading-relaxed text-muted-foreground">
          {project.description[lang]}
        </p>

        {project.highlights[lang].length > 0 && (
          <ul className="m-0 space-y-1 pl-0">
            {project.highlights[lang].slice(0, hero ? 4 : 2).map((h) => (
              <li key={h} className="grid grid-cols-[1rem_1fr] gap-2 text-sm leading-relaxed text-muted-foreground">
                <span aria-hidden="true" className="font-mono text-accent">›</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="flex flex-col justify-between gap-5 border-t border-border/50 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
        <dl className="grid gap-3 font-mono text-xs">
          <div>
            <dt className="uppercase tracking-[0.18em] text-accent">mode</dt>
            <dd className="mt-1 text-muted-foreground">embedded / hands-on</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.18em] text-accent">context</dt>
            <dd className="mt-1 text-muted-foreground">{project.city}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.18em] text-accent">signal</dt>
            <dd className="mt-1 text-muted-foreground">{project.industry?.[lang] ?? project.title[lang]}</dd>
          </div>
        </dl>

        {project.technologies.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-label m-0 text-xs text-muted-foreground">
              {intl.formatMessage({ id: 'work.projects.technologies' })}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, hero ? 12 : 7).map((t) => (
                <Badge key={t} variant="muted" className="font-mono">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </aside>
    </CliPanel>
  );
};

// ─── Timeline Entry ───────────────────────────────────────────────────────────

interface TimelineEntryProps {
  project: Project;
  lang: Locale;
}

const TimelineEntry: React.FC<TimelineEntryProps> = ({ project, lang }) => {
  const startYear = new Date(project.startDate).getFullYear();
  const endYear = new Date(project.endDate).getFullYear();
  const yearRange = startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`;

  return (
    <li className="observe flex items-start gap-6">
      <div aria-hidden="true" className="flex shrink-0 flex-col items-center gap-1">
        <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm bg-accent" />
      </div>
      <div className="flex flex-1 flex-wrap items-baseline gap-x-4 gap-y-0.5 pb-6">
        <span className="font-mono text-xs text-accent">{yearRange}</span>
        <span className="font-serif font-semibold text-foreground">
          {project.company ?? project.industry?.[lang]}
        </span>
        <span className="text-label text-xs text-muted-foreground">
          {project.title[lang]}
        </span>
      </div>
    </li>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const PortfolioView: React.FC<PortfolioViewProps> = ({ projects, locale, messages }) => {
  const lang = locale as Locale;
  const intl = createIntl({ locale, messages });
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const spotlightProjects = [...projects].filter((p) => p.spotlight).reverse();
  const allProjectsReversed = [...projects].reverse();
  const timelineProjects = timelineExpanded ? allProjectsReversed : allProjectsReversed.slice(0, 8);

  // Single IntersectionObserver for all .observe elements on this page
  useEffect(() => {
    // Respect the user's reduced-motion preference: mark all elements visible immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const elements = containerRef.current?.querySelectorAll('.observe') ?? [];
      elements.forEach((el) => el.classList.add('animate-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    const elements = containerRef.current?.querySelectorAll('.observe') ?? [];
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [timelineExpanded, locale]);

  return (
    <div className="contents" ref={containerRef}>

      {/* ── Hero (screen) ─────────────────────────────────────────────────── */}
      <Section noBorder className="observe w-full print:hidden">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[280px_1fr] md:gap-16">

            {/* Photo */}
            <div className="flex justify-center md:justify-start">
              <div className="relative">
                <div className="absolute -bottom-3 -right-3 h-full w-full border-2 border-accent" />
                <picture className="relative block h-[260px] w-[260px] overflow-hidden md:h-[280px] md:w-[280px]">
                  <Image
                    alt={intl.formatMessage({ id: 'work.img.alt' })}
                    className="m-0 h-full w-full object-cover"
                    height={280}
                    src="/me.png"
                    width={280}
                    priority
                  />
                </picture>
              </div>
            </div>

            {/* Identity + About */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-label mb-3 tracking-[0.3em] text-accent">
                  {intl.formatMessage({ id: 'work.about.heading' })}
                </p>
                <Heading as="h1" variant="display" className="text-5xl uppercase md:text-6xl lg:text-7xl">
                  {intl.formatMessage({ id: 'work.title' })}
                </Heading>
                <p className="text-label mt-3 text-xl text-muted-foreground md:text-2xl">
                  {intl.formatMessage({ id: 'work.subtitle' })}
                </p>
              </div>
              <div className="h-px w-16 bg-accent" />
              <div className="max-w-2xl space-y-3 text-base leading-relaxed text-muted-foreground md:text-lg">
                <p>{intl.formatMessage({ id: 'work.about.p1' })}</p>
                <p>{intl.formatMessage({ id: 'work.about.p2' })}</p>
              </div>
            </div>

          </div>
        </Container>
      </Section>

      {/* ── Stats strip (screen only) — intentionally full-bleed ─────────── */}
      <div className="observe w-full border-y-[length:var(--border-width)] border-border print:hidden">
        <div className="grid grid-cols-2 divide-x-[length:var(--border-width)] divide-border md:grid-cols-4">
          {(
            [
              { value: '20+', label: intl.formatMessage({ id: 'work.stats.years.label' }) },
              { value: String(projects.length), label: intl.formatMessage({ id: 'work.stats.engagements.label' }) },
              { value: String(new Set(projects.map((p) => p.company ?? p.industry?.[lang])).size), label: intl.formatMessage({ id: 'work.stats.companies.label' }) },
              { value: String(Math.min(...projects.map((p) => new Date(p.startDate).getFullYear()))), label: intl.formatMessage({ id: 'work.stats.since.label' }) },
            ] as const
          ).map((stat, i) => (
            <div
              className="observe flex flex-col gap-2 px-8 py-8"
              key={i}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="font-serif text-5xl font-bold leading-none">{stat.value}</span>
              <span className="text-label text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Traits panel (screen only) — intentionally full-bleed ──────────── */}
      <Section variant="inverted" noPadding className="print:hidden">
        <div className="grid divide-y-[length:var(--border-width)] divide-accent/20 md:grid-cols-3 md:divide-x-[length:var(--border-width)] md:divide-y-0">
          {([
            {
              num: '01',
              heading: intl.formatMessage({ id: 'work.section.cleanAgile.heading' }),
              body: intl.formatMessage({ id: 'work.section.cleanAgile.p' }),
            },
            {
              num: '02',
              heading: intl.formatMessage({ id: 'work.section.learner.heading' }),
              body: intl.formatMessage({ id: 'work.section.learner.p' }),
            },
            {
              num: '03',
              heading: intl.formatMessage({ id: 'work.section.automation.heading' }),
              body: intl.formatMessage({ id: 'work.section.automation.p' }),
            },
          ]).map((item, i) => (
            <div
              className="observe px-8 py-10"
              key={item.num}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="mb-4 font-mono text-3xl font-bold text-accent">{item.num}</div>
              <h3 className="mb-3 font-serif text-2xl font-bold">{item.heading}</h3>
              <p className="leading-relaxed opacity-70">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Print page 1: two-column intro (sidebar + about/traits) ──────────── */}
      <div className="hidden w-full print:flex print:gap-8">

        {/* Left sidebar */}
        <aside className="w-[160px] shrink-0">
          <picture className="mb-4 block overflow-hidden">
            <Image
              alt={intl.formatMessage({ id: 'work.img.alt' })}
              className="m-0 h-auto w-full"
              height={200}
              src="/me.png"
              width={160}
            />
          </picture>

          <div className="mb-5 border-b border-foreground pb-4">
            <h1 className="m-0 font-serif text-lg font-bold uppercase leading-tight tracking-tight text-foreground">
              {intl.formatMessage({ id: 'work.title' })}
            </h1>
            <p className="text-label mt-1 text-xs text-muted-foreground">
              {intl.formatMessage({ id: 'work.subtitle' })}
            </p>
          </div>

          <div className="mb-5">
            <h3 className="text-label mb-1 text-xs font-semibold uppercase tracking-widest text-foreground">
              {intl.formatMessage({ id: 'work.contact.heading' })}
            </h3>
            <ul className="m-0 list-none p-0 text-xs text-muted-foreground">
              <li className="my-0.5">info@clean.dev</li>
              <li className="my-0.5">https://clean.dev</li>
            </ul>
          </div>

          <div>
            <h3 className="text-label mb-1 text-xs font-semibold uppercase tracking-widest text-foreground">
              {intl.formatMessage({ id: 'work.skills.heading' })}
            </h3>
            <h4 className="text-label mb-0.5 mt-2 text-xs text-foreground">
              {intl.formatMessage({ id: 'work.skills.programming.heading' })}
            </h4>
            <ul className="m-0 list-none p-0 text-xs text-muted-foreground">
              <li className="my-0.5">Clean Code</li>
              <li className="my-0.5">TypeScript</li>
              <li className="my-0.5">Serverless</li>
              <li className="my-0.5">Web Components</li>
              <li className="my-0.5">REST / GraphQL</li>
            </ul>
            <h4 className="text-label mb-0.5 mt-2 text-xs text-foreground">
              {intl.formatMessage({ id: 'work.skills.org.heading' })}
            </h4>
            <ul className="m-0 list-none p-0 text-xs text-muted-foreground">
              <li className="my-0.5">Agile Mindset</li>
              <li className="my-0.5">Quality Management</li>
              <li className="my-0.5">Transparent Communication</li>
              <li className="my-0.5">Theory of Constraints</li>
            </ul>
          </div>
        </aside>

        {/* Right: about + traits — page 1 only */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 border-l-2 border-foreground pl-4">
            <h3 className="text-label mb-1 text-xs font-semibold uppercase tracking-widest text-foreground">
              {intl.formatMessage({ id: 'work.about.heading' })}
            </h3>
            <p className="my-1 text-sm leading-relaxed tracking-wide text-muted-foreground">
              {intl.formatMessage({ id: 'work.about.p1' })}
            </p>
            <p className="my-1 text-sm leading-relaxed tracking-wide text-muted-foreground">
              {intl.formatMessage({ id: 'work.about.p2' })}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 border-t border-border pt-5">
            {[
              {
                heading: intl.formatMessage({ id: 'work.section.cleanAgile.heading' }),
                body: intl.formatMessage({ id: 'work.section.cleanAgile.p' }),
              },
              {
                heading: intl.formatMessage({ id: 'work.section.learner.heading' }),
                body: intl.formatMessage({ id: 'work.section.learner.p' }),
              },
              {
                heading: intl.formatMessage({ id: 'work.section.automation.heading' }),
                body: intl.formatMessage({ id: 'work.section.automation.p' }),
              },
            ].map((item) => (
              <div key={item.heading}>
                <h4 className="text-label mb-1 text-xs font-semibold uppercase tracking-widest text-foreground">
                  {item.heading}
                </h4>
                <p className="m-0 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Print pages 2+: full-width projects ────────────────────────────── */}
      <section className="hidden w-full break-before-page print:block">
        <h3 className="text-label mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
          {intl.formatMessage({ id: 'work.projects.heading' })}
        </h3>
        {projects
          .filter((p) => p.featured)
          .reverse()
          .map((project) => {
            const startYear = new Date(project.startDate).getFullYear();
            const endYear = new Date(project.endDate).getFullYear();
            return (
              <article className="mb-5 break-inside-avoid" key={project.id}>
                <div className="flex items-center gap-3">
                  <h4 className="m-0 shrink-0 font-serif text-sm font-semibold text-foreground">
                    {project.company ?? project.industry?.[lang]}
                  </h4>
                  <hr className="m-0 h-px flex-1 border-0 border-b border-muted" />
                  <time className="shrink-0 text-xs text-muted-foreground" dateTime={`${startYear}`}>
                    {startYear === endYear ? startYear : `${startYear} - ${endYear}`}
                  </time>
                </div>
                <p className="text-label m-0 text-xs text-foreground">
                  {project.title[lang]}
                </p>
                <p className="my-1 text-sm leading-relaxed tracking-wide text-muted-foreground">
                  {project.description[lang]}
                </p>
                {project.highlights[lang].length > 0 && (
                  <ul className="m-0 mt-1 list-none p-0 pl-3">
                    {project.highlights[lang].map((highlight) => (
                      <li
                        className="my-0.5 text-sm leading-relaxed text-muted-foreground before:mr-1.5 before:text-foreground before:content-['·']"
                        key={highlight}
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
                {project.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {project.technologies.map((technology) => (
                      <span
                        className="rounded-sm bg-foreground px-1.5 py-0.5 font-mono text-xs text-background"
                        key={technology}
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
      </section>

      {/* ── Spotlight Grid (screen only) ───────────────────────────────────── */}
      <Section noBorder className="print:hidden">
        <Container>
          <div className="observe mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-label mb-1 text-accent">
                {intl.formatMessage({ id: 'work.spotlight.heading' })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {intl.formatMessage({ id: 'work.spotlight.lead' })}
              </p>
            </div>
            <div aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spotlightProjects.map((project, index) => (
              <SpotlightCard
                hero={index === 0}
                intl={intl}
                key={project.id}
                lang={lang}
                project={project}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Timeline (screen only) ─────────────────────────────────────────── */}
      <Section noBorder className="print:hidden">
        <Container>
          <div className="observe mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-label mb-1 text-muted-foreground">
                {intl.formatMessage({ id: 'work.timeline.heading' })}
              </h2>
            </div>
            <div aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>

          <div className="relative border-l-2 border-accent/30 pl-2">
            <ul id="timeline-list" className="m-0 list-none space-y-0 p-0">
              {timelineProjects.map((project, index) => (
                <TimelineEntry
                  key={project.id}
                  lang={lang}
                  project={project}
                />
              ))}
            </ul>
          </div>

          <button
            aria-expanded={timelineExpanded}
            aria-controls="timeline-list"
            className="text-label mt-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={() => setTimelineExpanded((v) => !v)}
            type="button"
          >
            <span className="text-accent" aria-hidden="true">{timelineExpanded ? '↑' : '↓'}</span>
            {timelineExpanded
              ? intl.formatMessage({ id: 'work.timeline.collapse' })
              : intl.formatMessage({ id: 'work.timeline.showAll' }, { count: projects.length })}
          </button>
        </Container>
      </Section>

      {/* ── Contact CTA (screen only) ─────────────────────────────────────── */}
      <Section variant="accent" className="print:hidden">
        <Container className="text-center">
          <Heading as="h2" variant="section" animate className="mb-4">
            {intl.formatMessage({ id: 'work.cta.heading' })}
          </Heading>
          <p className="observe delay-200 mb-8 text-lg leading-relaxed md:text-xl">
            {intl.formatMessage({ id: 'work.cta.lead' })}
          </p>
          <div className="observe delay-300">
            <Link href="/contact" className="btn bg-foreground text-background hover:bg-foreground/90">
              {intl.formatMessage({ id: 'work.cta.button' })}
            </Link>
          </div>
        </Container>
      </Section>

    </div>
  );
};
