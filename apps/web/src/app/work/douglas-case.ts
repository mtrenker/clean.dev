import type { Locale } from '@/lib/locale';
import type { Project } from '../projects';
import type { CaseEvidence } from './featured-cases';

export const DOUGLAS_CASE_ID = 'douglas';
const DOUGLAS_PROJECT_IDS = ['19', '20'] as const;

interface LocalizedProgressionStep {
  role: string;
  body: string;
}

/** Why the unified API was built as its own C#/.NET API, in Martin's account. */
interface ApiDecision {
  heading: string;
  body: string;
}

const caseCopy: Record<Locale, {
  role: string;
  mandate: string;
  progression: LocalizedProgressionStep[];
  decision: ApiDecision;
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
    // Rationale and requirements, not a measured result.
    decision: {
      heading: 'Why a separate C#/.NET API',
      body: 'Extending the existing NestJS/TypeScript API was one of a few options. Internally, though, there was a move towards C# on the backend, because it was the best understood and supported setup. The existing API was also not built from the ground up for the resilience and scaling the unified API required; adding another controller to it would have meant shoehorning those requirements in. I continued to maintain the production TypeScript API.',
    },
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
    decision: {
      heading: 'Warum eine eigene C#/.NET-API',
      body: 'Eine von mehreren Optionen war, die bestehende NestJS-/TypeScript-API zu erweitern. Intern gab es aber eine Bewegung hin zu C# im Backend, weil dieses Setup am besten verstanden und unterstützt wurde. Außerdem war die bestehende API nicht von Grund auf für die Resilienz und Skalierung gebaut, die die einheitliche API brauchte; einen weiteren Controller dort hinzuzufügen, hätte bedeutet, diese Anforderungen hineinzuzwängen. Die produktive TypeScript-API habe ich weiter gewartet.',
    },
  },
};

type DouglasRecord = 'technicalLead' | 'solutionsArchitect';

/**
 * Evidence is selected by statement, not by array position, so reordering or
 * extending a project's highlights cannot silently swap what a surface claims.
 * Each marker must match exactly one highlight of its source record.
 */
const statements = {
  unifiedApiConsequence: { record: 'solutionsArchitect', en: 'ending business logic duplicated', de: 'Schluss mit duplizierter Businesslogik' },
  unifiedApiShipped: { record: 'solutionsArchitect', en: 'personally designed and shipped the unified API', de: 'die einheitliche API persönlich konzipiert und umgesetzt' },
  runtimeConfig: { record: 'solutionsArchitect', en: 'config changes no longer require a release', de: 'Konfigurationsänderungen brauchen kein Release mehr' },
  crmBackend: { record: 'solutionsArchitect', en: 'production CRM backend in TypeScript/Node.js', de: 'produktives CRM-Backend in TypeScript/Node.js' },
  agentCli: { record: 'solutionsArchitect', en: 'agent CLI', de: 'Agent-CLI' },
  storeFootprint: { record: 'technicalLead', en: 'every cash register', de: 'jedem Kassenterminal' },
  crmRewrite: { record: 'technicalLead', en: 'rewrote the CRM/POS integration', de: 'Neuentwicklung der CRM/POS-Integration' },
  businessHourDeployments: { record: 'technicalLead', en: 'deployments during business hours', de: 'Deployments im laufenden Betrieb' },
  inHouseService: { record: 'technicalLead', en: 'shortlink and QR service', de: 'Shortlink- und QR-Service' },
  onboarding: { record: 'technicalLead', en: 'onboarded 1 senior', de: '1 Senior und 2 Junior' },
  fullStackFridays: { record: 'technicalLead', en: 'Full Stack Fridays', de: 'Full Stack Fridays' },
} satisfies Record<string, { record: DouglasRecord } & Record<Locale, string>>;

type DouglasStatement = keyof typeof statements;

export interface DouglasWorkCase {
  id: typeof DOUGLAS_CASE_ID;
  sourceProjectIds: string[];
  company: string;
  role: string;
  mandate: string;
  progression: Array<LocalizedProgressionStep & { number: string }>;
  decision: ApiDecision;
  /** One sentence stating what Martin designed and why it mattered. */
  summary: string;
  /** The in-house service that replaced an unsuitable SaaS. */
  inHouseService: string;
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
  const records: Record<DouglasRecord, Project> = { technicalLead, solutionsArchitect };
  const copy = caseCopy[locale];

  const statement = (name: DouglasStatement) => {
    const { record, [locale]: marker } = statements[name];
    const matches = records[record].highlights[locale].filter((highlight) => highlight.includes(marker));
    if (matches.length !== 1) throw new Error(`Douglas statement ${name} (${locale}) matched ${matches.length} highlights`);
    return matches[0];
  };

  return {
    id: DOUGLAS_CASE_ID,
    sourceProjectIds: [...DOUGLAS_PROJECT_IDS],
    company: technicalLead.company ?? 'Douglas GmbH',
    role: copy.role,
    mandate: copy.mandate,
    progression: copy.progression.map((step, index) => ({ ...step, number: `0${index + 1}` })),
    decision: copy.decision,
    summary: statement('unifiedApiConsequence'),
    inHouseService: statement('inHouseService'),
    // The API ownership and its runtime-config consequence lead; the summary
    // statement is deliberately absent here because it restates the first item.
    personalOwnership: [
      statement('unifiedApiShipped'),
      statement('runtimeConfig'),
      statement('crmBackend'),
      statement('agentCli'),
    ],
    outcomes: [
      { kind: 'measured', text: statement('storeFootprint') },
      { kind: 'measured', text: statement('crmRewrite') },
      { kind: 'observed', text: statement('businessHourDeployments') },
      { kind: 'observed', text: statement('inHouseService') },
    ],
    teamContribution: [
      statement('onboarding'),
      statement('fullStackFridays'),
    ],
    technologies: [...new Set([technicalLead, solutionsArchitect].flatMap((project) => project.technologies))],
    startDate: technicalLead.startDate,
    endDate: solutionsArchitect.endDate,
    city: technicalLead.city,
    industry: technicalLead.industry?.[locale] ?? '',
  };
};
