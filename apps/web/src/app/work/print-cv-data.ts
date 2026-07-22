import type { IntlShape } from 'react-intl';
import { SOCIAL_PROFILES } from '@/lib/social-profiles';
import { type Locale } from '@/lib/locale';
import { type Project } from '../projects';

export interface PrintCvEntry {
  id: string;
  period: string;
  name: string;
  role: string;
  context: string[];
  description: string;
  highlights: string[];
  technologies: string;
}

export interface PrintCvModel {
  docLabel: string;
  updatedLabel: string;
  name: string;
  subtitle: string;
  photoAlt: string;
  about: string[];
  contactHeading: string;
  contactLines: Array<{ href: string; text: string }>;
  stats: Array<{ value: string; label: string }>;
  focusHeading: string;
  focusMeta: string;
  focusItems: Array<{ number: string; heading: string; body: string }>;
  technologiesHeading: string;
  technologies: string;
  historyHeading: string;
  historyMeta: string;
  entries: PrintCvEntry[];
}

const CONTACT_EMAIL = 'info@clean.dev';
const SITE_URL = 'https://clean.dev';
const RECENT_TECHNOLOGY_LIMIT = 14;

const getYear = (date: string) => Number(date.slice(0, 4));
const formatPeriod = (project: Project) => {
  const startYear = getYear(project.startDate);
  const endYear = getYear(project.endDate);
  return startYear === endYear ? `${startYear}` : `${startYear} – ${endYear}`;
};
const projectName = (project: Project, lang: Locale) => project.company ?? project.industry?.[lang] ?? project.id;
const cityName = (city: string, lang: Locale) => (lang === 'de' && city === 'Munich' ? 'München' : city);
const displayUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/**
 * Technologies from the most recent engagements, newest project first,
 * preserving each project's own ordering.
 */
export const recentTechnologies = (projects: Project[], limit = RECENT_TECHNOLOGY_LIMIT): string[] => {
  const byRecency = [...projects].sort((a, b) => b.endDate.localeCompare(a.endDate));
  const seen = new Set<string>();
  const result: string[] = [];
  for (const project of byRecency) {
    for (const technology of project.technologies) {
      if (result.length >= limit) return result;
      if (!seen.has(technology)) {
        seen.add(technology);
        result.push(technology);
      }
    }
  }
  return result;
};

export const buildPrintCv = (projects: Project[], locale: Locale, intl: IntlShape): PrintCvModel => {
  const msg = (id: string) => intl.formatMessage({ id });

  const sorted = [...projects].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const firstYear = Math.min(...projects.map((project) => getYear(project.startDate)));
  const companies = new Set(projects.map((project) => projectName(project, locale))).size;

  const entries: PrintCvEntry[] = sorted.map((project) => ({
    id: project.id,
    period: formatPeriod(project),
    name: projectName(project, locale),
    role: project.title[locale],
    context: [cityName(project.city, locale), project.industry?.[locale]].filter((value): value is string => Boolean(value)),
    description: project.description[locale],
    highlights: project.highlights[locale],
    technologies: project.technologies.join(' · '),
  }));

  return {
    docLabel: msg('work.print.doc.label'),
    updatedLabel: intl.formatMessage(
      { id: 'work.print.doc.updated' },
      { date: intl.formatDate(new Date(), { month: 'long', year: 'numeric' }) },
    ) as string,
    name: msg('work.title'),
    subtitle: msg('work.subtitle'),
    photoAlt: msg('work.img.alt'),
    about: [msg('work.about.p1'), msg('work.about.p2')],
    contactHeading: msg('work.contact.heading'),
    contactLines: [
      { href: `mailto:${CONTACT_EMAIL}`, text: CONTACT_EMAIL },
      { href: SITE_URL, text: displayUrl(SITE_URL) },
      ...SOCIAL_PROFILES.map((profile) => ({ href: profile.href, text: displayUrl(profile.href) })),
    ],
    stats: [
      { value: '20+', label: msg('work.stats.years.label') },
      { value: String(projects.length), label: msg('work.stats.engagements.label') },
      { value: String(companies), label: msg('work.stats.companies.label') },
      { value: String(firstYear), label: msg('work.stats.since.label') },
    ],
    focusHeading: msg('work.focus.heading'),
    focusMeta: msg('work.focus.meta'),
    focusItems: (['cleanAgile', 'learner', 'automation'] as const).map((section, index) => ({
      number: `0${index + 1}`,
      heading: msg(`work.section.${section}.heading`),
      body: msg(`work.section.${section}.p`),
    })),
    technologiesHeading: msg('work.projects.technologies'),
    technologies: recentTechnologies(projects).join(' · '),
    historyHeading: msg('work.print.history.heading'),
    historyMeta: msg('work.timeline.meta'),
    entries,
  };
};
