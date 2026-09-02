import type { Locale } from '@/lib/locale';
import type { Project } from '../projects';
import type { CaseEvidence } from './featured-cases';

export const DOUGLAS_CASE_ID = 'douglas';
const DOUGLAS_PROJECT_IDS = ['19', '20'] as const;

interface LocalizedProgressionStep {
  role: string;
  body: string;
}

const caseCopy: Record<Locale, {
  role: string;
  mandate: string;
  progression: LocalizedProgressionStep[];
}> = {
  en: {
    role: 'React Expert → Technical Lead → Solutions Architect',
    mandate: 'Modernise the POS/CRM platform from its React frontend to backend services in TypeScript/Node.js and C#/.NET, unify the CRM API landscape, and introduce governed AI tooling.',
    progression: [
      {
        role: 'React Expert',
        body: 'Joined to modernise the POS software used in more than 1,200 stores across 14 European countries.',
      },
      {
        role: 'Technical Lead',
        body: 'Led the move from legacy Angular to maintainable React and shipped the business-critical CRM integration in under a year.',
      },
      {
        role: 'Solutions Architect',
        body: 'Took on broader scope across TypeScript/Node.js and C#/.NET backend services to unify the CRM API landscape and introduce governed AI tooling for daily delivery work.',
      },
    ],
  },
  de: {
    role: 'React-Experte → Technical Lead → Solutions Architect',
    mandate: 'Die POS-/CRM-Plattform über das React-Frontend sowie TypeScript-/Node.js- und C#/.NET-Backend-Services hinweg modernisieren, die CRM-API-Landschaft vereinheitlichen und KI-Tooling mit klaren Leitplanken einführen.',
    progression: [
      {
        role: 'React-Experte',
        body: 'Einstieg zur Modernisierung der POS-Software, die in über 1.200 Filialen in 14 europäischen Ländern eingesetzt wird.',
      },
      {
        role: 'Technical Lead',
        body: 'Die Ablösung des Legacy-Angular-Frontends durch wartbares React geleitet und die geschäftskritische CRM-Integration in unter einem Jahr ausgeliefert.',
      },
      {
        role: 'Solutions Architect',
        body: 'Mit erweitertem Verantwortungsbereich an TypeScript-/Node.js- und C#/.NET-Backend-Services gearbeitet, die CRM-API-Landschaft vereinheitlicht und KI-Tooling mit klaren Leitplanken in die tägliche Delivery eingeführt.',
      },
    ],
  },
};

export interface DouglasWorkCase {
  id: typeof DOUGLAS_CASE_ID;
  sourceProjectIds: string[];
  company: string;
  role: string;
  mandate: string;
  progression: Array<LocalizedProgressionStep & { number: string }>;
  personalOwnership: string[];
  outcomes: CaseEvidence[];
  teamContribution: string[];
  technologies: string[];
  startDate: string;
  endDate: string;
  city: string;
  industry: string;
}

const findProject = (projects: Project[], id: string) => {
  const project = projects.find((candidate) => candidate.id === id);
  if (!project) throw new Error(`Douglas source project ${id} is missing`);
  return project;
};

export const isDouglasProject = (project: Project) => DOUGLAS_PROJECT_IDS.includes(project.id as typeof DOUGLAS_PROJECT_IDS[number]);

export const formatMonthPeriod = (startDate: string, endDate: string, locale: Locale) => {
  const formatter = new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const format = (date: string) => formatter.format(new Date(`${date}-01T00:00:00Z`));
  return `${format(startDate)} – ${format(endDate)}`;
};

export const buildDouglasWorkCase = (projects: Project[], locale: Locale): DouglasWorkCase => {
  const technicalLead = findProject(projects, DOUGLAS_PROJECT_IDS[0]);
  const solutionsArchitect = findProject(projects, DOUGLAS_PROJECT_IDS[1]);
  const copy = caseCopy[locale];

  return {
    id: DOUGLAS_CASE_ID,
    sourceProjectIds: [...DOUGLAS_PROJECT_IDS],
    company: technicalLead.company ?? 'Douglas GmbH',
    role: copy.role,
    mandate: copy.mandate,
    progression: copy.progression.map((step, index) => ({ ...step, number: `0${index + 1}` })),
    personalOwnership: [
      solutionsArchitect.highlights[locale][1],
      solutionsArchitect.highlights[locale][2],
      solutionsArchitect.highlights[locale][4],
    ],
    outcomes: [
      { kind: 'measured', text: technicalLead.highlights[locale][1] },
      { kind: 'measured', text: technicalLead.highlights[locale][0] },
      { kind: 'observed', text: technicalLead.highlights[locale][2] },
    ],
    teamContribution: [
      technicalLead.highlights[locale][3],
      technicalLead.highlights[locale][4],
    ],
    technologies: [...new Set([technicalLead, solutionsArchitect].flatMap((project) => project.technologies))],
    startDate: technicalLead.startDate,
    endDate: solutionsArchitect.endDate,
    city: technicalLead.city,
    industry: technicalLead.industry?.[locale] ?? '',
  };
};
