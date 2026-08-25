import type { IntlShape } from 'react-intl';
import { getConsultingAvailability } from '@/lib/availability';
import type { Locale } from '@/lib/locale';
import { labItems } from '../lab';
import type { Project } from '../projects';
import { buildDouglasWorkCase, formatMonthPeriod } from './douglas-case';
import { buildFeaturedProjectCases } from './featured-cases';
import { buildPrintCv } from './print-cv-data';

interface DossierCopy {
  title: string;
  language: string;
  documentLanguage: string;
  documentFormat: string;
  profile: string;
  roleTitles: string;
  availability: string;
  location: string;
  languages: string;
  utilization: string;
  projectTypes: string;
  coreSkills: string;
  recentProjects: string;
  sectors: string;
  contact: string;
  fullHistory: string;
  currentSystems: string;
  situation: string;
  mandate: string;
  personalOwnership: string;
  outcomes: string;
  teamContribution: string;
  technologies: string;
  period: string;
  sector: string;
  context: string;
  operationalResponsibility: string;
  clientRelevance: string;
  workflowExample: string;
  measured: string;
  observed: string;
  projectTypesValue: string;
}

const copy: Record<Locale, DossierCopy> = {
  en: {
    title: 'Project dossier',
    language: 'English',
    documentLanguage: 'Document language',
    documentFormat: 'Document format',
    profile: 'Profile',
    roleTitles: 'Role titles',
    availability: 'Availability',
    location: 'Location and work model',
    languages: 'Languages',
    utilization: 'Utilization',
    projectTypes: 'Project types',
    coreSkills: 'Core skills',
    recentProjects: 'Recent projects',
    sectors: 'Sectors',
    contact: 'Contact',
    fullHistory: 'Full project history',
    currentSystems: 'Current hands-on systems',
    situation: 'Situation',
    mandate: 'Mandate',
    personalOwnership: 'Personal ownership',
    outcomes: 'Outcomes and evidence',
    teamContribution: 'Team delivery and contribution',
    technologies: 'Technologies',
    period: 'Period',
    sector: 'Sector',
    context: 'Context',
    operationalResponsibility: 'Operational responsibility',
    clientRelevance: 'Client relevance',
    workflowExample: 'Reviewable workflow example',
    measured: 'Measured fact',
    observed: 'Unmeasured observation',
    projectTypesValue: 'Architecture modernisation; delivery reliability; governed AI workflows',
  },
  de: {
    title: 'Projektdossier',
    language: 'Deutsch',
    documentLanguage: 'Dokumentsprache',
    documentFormat: 'Dokumentformat',
    profile: 'Profil',
    roleTitles: 'Rollen',
    availability: 'Verfügbarkeit',
    location: 'Standort und Arbeitsmodell',
    languages: 'Sprachen',
    utilization: 'Auslastung',
    projectTypes: 'Projekttypen',
    coreSkills: 'Kernkompetenzen',
    recentProjects: 'Aktuelle Projekte',
    sectors: 'Branchen',
    contact: 'Kontakt',
    fullHistory: 'Vollständige Projekthistorie',
    currentSystems: 'Aktuelle Hands-on-Systeme',
    situation: 'Situation',
    mandate: 'Auftrag',
    personalOwnership: 'Persönliche Verantwortung',
    outcomes: 'Ergebnisse und Evidenz',
    teamContribution: 'Teamleistung und eigener Beitrag',
    technologies: 'Technologien',
    period: 'Zeitraum',
    sector: 'Branche',
    context: 'Kontext',
    operationalResponsibility: 'Betriebsverantwortung',
    clientRelevance: 'Relevanz für Kunden',
    workflowExample: 'Überprüfbares Workflow-Beispiel',
    measured: 'Gemessener Fakt',
    observed: 'Unquantifizierte Beobachtung',
    projectTypesValue: 'Architekturmodernisierung; zuverlässige Delivery; kontrollierte KI-Workflows',
  },
};

const bulletList = (items: string[]) => items.map((item) => `- ${item}`).join('\n');
const field = (label: string, value: string) => `- ${label}: ${value}`;
const cityName = (city: string, locale: Locale) => (locale === 'de' && city === 'Munich' ? 'München' : city);

export const buildProjectDossier = (projects: Project[], locale: Locale, intl: IntlShape): string => {
  const labels = copy[locale];
  const availability = getConsultingAvailability(locale);
  const cv = buildPrintCv(projects, locale, intl);
  const douglas = buildDouglasWorkCase(projects, locale);
  const featuredCases = buildFeaturedProjectCases(projects, locale);
  const sectors = [...new Set(projects.flatMap((project) => project.industry ? [project.industry[locale]] : []))].sort((a, b) => a.localeCompare(b, locale));

  const recentProjects = [
    [
      `### 1. ${douglas.company}`,
      field(labels.roleTitles, douglas.role),
      field(labels.period, formatMonthPeriod(douglas.startDate, douglas.endDate, locale)),
      field(labels.location, douglas.city),
      field(labels.sector, douglas.industry),
      `#### ${labels.mandate}`,
      douglas.mandate,
      `#### ${labels.personalOwnership}`,
      bulletList(douglas.personalOwnership),
      `#### ${labels.outcomes}`,
      bulletList(douglas.outcomes.map((outcome) => `${outcome.kind === 'measured' ? labels.measured : labels.observed}: ${outcome.text}`)),
      `#### ${labels.teamContribution}`,
      bulletList(douglas.teamContribution),
      field(labels.technologies, douglas.technologies.join('; ')),
    ].join('\n\n'),
    ...featuredCases.map((workCase, index) => [
      `### ${index + 2}. ${workCase.company}`,
      field(labels.roleTitles, workCase.role),
      field(labels.period, formatMonthPeriod(workCase.startDate, workCase.endDate, locale)),
      field(labels.location, cityName(workCase.city, locale)),
      field(labels.sector, workCase.industry),
      `#### ${labels.situation}`,
      workCase.situation,
      `#### ${labels.mandate}`,
      workCase.mandate,
      `#### ${labels.personalOwnership}`,
      bulletList(workCase.personalOwnership),
      `#### ${labels.outcomes}`,
      bulletList(workCase.outcomes.map((outcome) => `${outcome.kind === 'measured' ? labels.measured : labels.observed}: ${outcome.text}`)),
      `#### ${labels.teamContribution}`,
      bulletList(workCase.teamContribution),
      field(labels.technologies, workCase.technologies.join('; ')),
    ].join('\n\n')),
  ].join('\n\n');

  const history = cv.entries.map((entry) => [
    `### ${entry.name}`,
    field(labels.period, entry.period),
    field(labels.roleTitles, entry.role),
    field(labels.context, entry.context.join('; ')),
    entry.description,
    entry.highlights.length > 0 ? bulletList(entry.highlights) : '',
    field(labels.technologies, entry.technologies.replaceAll(' · ', '; ')),
  ].filter(Boolean).join('\n\n')).join('\n\n');

  const systems = labItems.map((item) => [
    `### ${item.title[locale]}`,
    field(labels.period, item.period[locale]),
    item.description[locale],
    field(labels.personalOwnership, item.ownership[locale]),
    field(labels.clientRelevance, item.clientRelevance[locale]),
    field(labels.operationalResponsibility, item.operations[locale]),
    item.workflowExample ? field(labels.workflowExample, item.workflowExample[locale]) : '',
    field(labels.technologies, item.technologies.join('; ')),
  ].filter(Boolean).join('\n\n')).join('\n\n');

  return [
    `# ${labels.title}: Martin Trenker`,
    field(labels.documentLanguage, `${locale} (${labels.language})`),
    field(labels.documentFormat, 'UTF-8 Markdown'),
    `## ${labels.profile}`,
    field(labels.roleTitles, 'Technical Lead; Solutions Architect'),
    field(labels.availability, availability.start),
    field(labels.location, availability.location),
    field(labels.languages, availability.languages),
    field(labels.utilization, availability.schedule),
    field(labels.projectTypes, labels.projectTypesValue),
    `## ${labels.coreSkills}`,
    bulletList(cv.technologies.split(' · ')),
    `## ${labels.recentProjects}`,
    recentProjects,
    `## ${labels.sectors}`,
    bulletList(sectors),
    `## ${labels.contact}`,
    bulletList(cv.contactLines.map((line) => `${line.text}: ${line.href}`)),
    `## ${labels.fullHistory}`,
    history,
    `## ${labels.currentSystems}`,
    systems,
  ].join('\n\n').concat('\n');
};
