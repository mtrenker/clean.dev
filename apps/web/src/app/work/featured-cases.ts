import type { Locale } from '@/lib/locale';
import type { Project } from '../projects';

export type EvidenceKind = 'measured' | 'observed';

export interface CaseEvidence {
  kind: EvidenceKind;
  text: string;
}

export interface FeaturedProjectCase {
  id: string;
  projectId: string;
  company: string;
  role: string;
  situation: string;
  mandate: string;
  personalOwnership: string[];
  outcomes: CaseEvidence[];
  teamContribution: string[];
  technologies: string[];
  startDate: string;
  endDate: string;
  city: string;
  industry: string;
}

const FEATURED_PROJECT_IDS = ['18', '16'] as const;

type FeaturedProjectId = typeof FEATURED_PROJECT_IDS[number];

interface CaseCopy {
  situation: string;
  mandate: string;
  personalOwnershipIndexes: number[];
  outcomes: Array<{ highlightIndex: number; kind: EvidenceKind }>;
  teamContributionIndexes: number[];
}

const caseCopy: Record<FeaturedProjectId, Record<Locale, CaseCopy>> = {
  '18': {
    en: {
      situation: 'A Next.js platform was moving from an external agency to a newly formed in-house team while active delivery continued.',
      mandate: 'Audit the codebase, consolidate two products, and establish the new team without stopping ongoing product work.',
      personalOwnershipIndexes: [0, 1],
      outcomes: [{ highlightIndex: 1, kind: 'observed' }],
      teamContributionIndexes: [2, 3],
    },
    de: {
      situation: 'Eine Next.js-Plattform wechselte bei laufender Delivery von einer externen Agentur zu einem neu gebildeten internen Team.',
      mandate: 'Die Codebasis prüfen, zwei Produkte zusammenführen und das neue Team aufbauen, ohne die laufende Produktarbeit zu stoppen.',
      personalOwnershipIndexes: [0, 1],
      outcomes: [{ highlightIndex: 1, kind: 'observed' }],
      teamContributionIndexes: [2, 3],
    },
  },
  '16': {
    en: {
      situation: 'An AngularJS optometry workflow for in-store staff had accumulated complex, ad-hoc state logic.',
      mandate: 'Rebuild the workflow in TypeScript and React with an explicit state-machine architecture and transfer the knowledge into the team.',
      personalOwnershipIndexes: [1, 2],
      outcomes: [{ highlightIndex: 1, kind: 'observed' }],
      teamContributionIndexes: [0],
    },
    de: {
      situation: 'Ein AngularJS-Optometrie-Workflow für Filialmitarbeiter war durch komplexe Ad-hoc-Zustandslogik schwer veränderbar geworden.',
      mandate: 'Den Workflow mit TypeScript und React auf einer expliziten State-Machine-Architektur neu aufbauen und das Wissen ins Team übertragen.',
      personalOwnershipIndexes: [1, 2],
      outcomes: [{ highlightIndex: 1, kind: 'observed' }],
      teamContributionIndexes: [0],
    },
  },
};

const findProject = (projects: Project[], id: FeaturedProjectId) => {
  const project = projects.find((candidate) => candidate.id === id);
  if (!project) throw new Error(`Featured project ${id} is missing`);
  return project;
};

export const buildFeaturedProjectCases = (projects: Project[], locale: Locale): FeaturedProjectCase[] =>
  FEATURED_PROJECT_IDS.map((projectId) => {
    const project = findProject(projects, projectId);
    const copy = caseCopy[projectId][locale];
    const highlights = project.highlights[locale];

    return {
      id: project.company?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ?? project.id,
      projectId,
      company: project.company ?? project.id,
      role: project.title[locale],
      situation: copy.situation,
      mandate: copy.mandate,
      personalOwnership: copy.personalOwnershipIndexes.map((index) => highlights[index]),
      outcomes: copy.outcomes.map(({ highlightIndex, kind }) => ({ kind, text: highlights[highlightIndex] })),
      teamContribution: copy.teamContributionIndexes.map((index) => highlights[index]),
      technologies: project.technologies,
      startDate: project.startDate,
      endDate: project.endDate,
      city: project.city,
      industry: project.industry?.[locale] ?? '',
    };
  });
