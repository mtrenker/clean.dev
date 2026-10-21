import type { IntlShape } from 'react-intl';
import { getConsultingAvailability } from '@/lib/availability';
import { SOCIAL_PROFILES } from '@/lib/social-profiles';
import { CONTACT_EMAIL } from '@/lib/site-metadata';
import { type Locale } from '@/lib/locale';
import { labItems } from '../lab';
import { type Project } from '../projects';
import { buildDouglasWorkCase, formatMonthPeriod } from './douglas-case';
import { cvRecommendation } from './recommendation';

export interface PrintCvHighlightGroup {
  heading: string;
  highlights: string[];
}

export interface PrintCvEntry {
  id: string;
  period: string;
  name: string;
  role: string;
  context: string[];
  description: string;
  highlights: string[];
  highlightGroups?: PrintCvHighlightGroup[];
  technologies: string;
}

export interface PrintCvExample {
  number: string;
  label: string;
  heading: string;
  body: string;
}

export interface PrintCvRecommendation {
  excerpt: string;
  lang: string;
  author: string;
  role: string;
  source: string;
  href: string;
}

export interface PrintCvModel {
  docLabel: string;
  updatedLabel: string;
  name: string;
  subtitle: string;
  photoAlt: string;
  about: string[];
  recommendation: PrintCvRecommendation;
  contactHeading: string;
  contactLines: Array<{ href: string; text: string }>;
  experience: string;
  examplesHeading: string;
  examplesMeta: string;
  examples: PrintCvExample[];
  technologiesHeading: string;
  technologies: string;
  historyHeading: string;
  historyMeta: string;
  entries: PrintCvEntry[];
  availabilityLabel: string;
  availabilityText: string;
  labHeading: string;
  labMeta: string;
  labEntries: PrintCvEntry[];
  certsNote: string;
}

const SITE_URL = 'https://clean.dev';
const RECENT_TECHNOLOGY_LIMIT = 14;
const PRINT_CV_RECENT_TECHNOLOGY_LIMIT = 10;
const AWS_PROOF_TECHNOLOGIES = ['aws (2020–2025)', 'aws-cdk', 'lambda', 'dynamodb'] as const;

const getYear = (date: string) => Number(date.slice(0, 4));
const formatDatePeriod = (startDate: string, endDate: string) => {
  const startYear = getYear(startDate);
  const endYear = getYear(endDate);
  return startYear === endYear ? `${startYear}` : `${startYear} – ${endYear}`;
};
const formatPeriod = (project: Project) => formatDatePeriod(project.startDate, project.endDate);
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

export const printCvTechnologies = (projects: Project[]): string[] => [
  ...recentTechnologies(projects, PRINT_CV_RECENT_TECHNOLOGY_LIMIT),
  ...AWS_PROOF_TECHNOLOGIES,
];

export const buildPrintCv = (projects: Project[], locale: Locale, intl: IntlShape): PrintCvModel => {
  const msg = (id: string) => intl.formatMessage({ id });

  const sorted = [...projects].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const availability = getConsultingAvailability(locale);
  const douglasCase = buildDouglasWorkCase(projects, locale);
  const newestDouglasProjectId = douglasCase.sourceProjectIds.at(-1);
  const platform = labItems.find((item) => item.id === 'k8s-platform');
  if (!platform) throw new Error('Lab platform record is missing');

  const entries: PrintCvEntry[] = sorted.flatMap((project) => {
    if (project.id === newestDouglasProjectId) {
      return [{
        id: douglasCase.id,
        period: formatMonthPeriod(douglasCase.startDate, douglasCase.endDate, locale),
        name: douglasCase.company,
        role: douglasCase.role,
        context: [cityName(douglasCase.city, locale), douglasCase.industry],
        description: douglasCase.mandate,
        highlights: [],
        highlightGroups: [
          {
            heading: msg('work.case.progression'),
            highlights: douglasCase.progression.map((step) => `${step.number} · ${step.role}: ${step.body}`),
          },
          { heading: douglasCase.decision.heading, highlights: [douglasCase.decision.body] },
          { heading: msg('work.case.personalOwnership'), highlights: douglasCase.personalOwnership },
          { heading: msg('work.case.outcomes'), highlights: douglasCase.outcomes.map((outcome) => outcome.text) },
          { heading: msg('work.case.teamContribution'), highlights: douglasCase.teamContribution },
        ],
        technologies: douglasCase.technologies.join(' · '),
      }];
    }

    if (douglasCase.sourceProjectIds.includes(project.id)) return [];

    return [{
      id: project.id,
      period: formatPeriod(project),
      name: projectName(project, locale),
      role: project.title[locale],
      context: [cityName(project.city, locale), project.industry?.[locale]].filter((value): value is string => Boolean(value)),
      description: project.description[locale],
      highlights: project.highlights[locale],
      technologies: project.technologies.join(' · '),
    }];
  });

  return {
    docLabel: msg('work.print.doc.label'),
    updatedLabel: intl.formatMessage(
      { id: 'work.print.doc.updated' },
      { date: intl.formatDate(new Date(), { month: 'long', year: 'numeric' }) },
    ) as string,
    name: msg('work.title'),
    subtitle: msg('work.subtitle'),
    photoAlt: msg('work.img.alt'),
    about: [msg('work.about.p1')],
    recommendation: {
      excerpt: cvRecommendation.excerpt,
      lang: cvRecommendation.lang,
      author: cvRecommendation.author,
      role: cvRecommendation.role,
      source: intl.formatMessage(
        { id: 'work.recommendation.source' },
        { date: intl.formatDate(`${cvRecommendation.date}T00:00:00Z`, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) },
      ) as string,
      href: cvRecommendation.sourceUrl,
    },
    contactHeading: msg('work.contact.heading'),
    contactLines: [
      { href: `mailto:${CONTACT_EMAIL}`, text: CONTACT_EMAIL },
      { href: SITE_URL, text: displayUrl(SITE_URL) },
      ...SOCIAL_PROFILES.map((profile) => ({ href: profile.href, text: displayUrl(profile.href) })),
    ],
    experience: msg('work.experience'),
    examplesHeading: msg('work.examples.heading'),
    examplesMeta: msg('work.examples.meta'),
    // Page one names concrete ownership with its attribution: two client
    // decisions from the Douglas records and one self-funded platform.
    examples: [
      { key: 'api', body: douglasCase.summary },
      { key: 'service', body: douglasCase.inHouseService },
      { key: 'platform', body: platform.ownership[locale] },
    ].map((example, index) => ({
      number: `0${index + 1}`,
      label: msg(`work.examples.${example.key}.label`),
      heading: msg(`work.examples.${example.key}.heading`),
      // Source highlights are list fragments; under a heading they read as sentences.
      body: `${example.body.charAt(0).toLocaleUpperCase(locale)}${example.body.slice(1)}`,
    })),
    technologiesHeading: msg('work.projects.technologies'),
    technologies: printCvTechnologies(projects).join(' · '),
    historyHeading: msg('work.print.history.heading'),
    historyMeta: msg('work.timeline.meta'),
    entries,
    availabilityLabel: availability.label,
    availabilityText: availability.dossierSummary,
    labHeading: msg('work.lab.heading'),
    labMeta: msg('work.lab.meta'),
    labEntries: labItems.map((item) => ({
      id: item.id,
      period: item.period[locale],
      name: item.title[locale],
      role: '',
      context: [],
      description: item.description[locale],
      highlights: item.highlights[locale],
      highlightGroups: [
        { heading: msg('work.lab.ownership'), highlights: [item.ownership[locale]] },
        { heading: msg('work.lab.relevance'), highlights: [item.clientRelevance[locale]] },
        { heading: msg('work.lab.operations'), highlights: [item.operations[locale]] },
        ...(item.workflowExample
          ? [{ heading: msg('work.lab.workflow'), highlights: [item.workflowExample[locale]] }]
          : []),
      ],
      technologies: item.technologies.join(' · '),
    })),
    certsNote: msg('work.certs.note'),
  };
};
