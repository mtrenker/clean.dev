import { describe, expect, it } from 'vitest';
import { projects } from '../projects';
import { buildDouglasWorkCase } from './douglas-case';

const weakerEnglishWording = 'picked up C#/.NET during the engagement';
const weakerGermanWording = 'C#/.NET im laufenden Projekt gelernt';

describe('buildDouglasWorkCase', () => {
  it('consolidates the two chronological source records without changing them', () => {
    const sourceRecords = projects.filter((project) => ['19', '20'].includes(project.id));
    const workCase = buildDouglasWorkCase(projects, 'en');

    expect(sourceRecords).toHaveLength(2);
    expect(workCase.sourceProjectIds).toEqual(sourceRecords.map((project) => project.id));
    expect(workCase.startDate).toBe('2024-01');
    expect(workCase.endDate).toBe('2026-07');
    expect(workCase.role).toBe('React Expert → Technical Lead → Solutions Architect');
    expect(workCase.progression.map((step) => step.role)).toEqual([
      'React Expert',
      'Technical Lead',
      'Solutions Architect',
    ]);
  });

  it('keeps every selected outcome traceable to the source project highlights', () => {
    for (const locale of ['en', 'de'] as const) {
      const workCase = buildDouglasWorkCase(projects, locale);
      const sourceHighlights = projects
        .filter((project) => workCase.sourceProjectIds.includes(project.id))
        .flatMap((project) => project.highlights[locale]);

      for (const outcome of [...workCase.personalOwnership, ...workCase.teamContribution]) {
        expect(sourceHighlights).toContain(outcome);
      }
    }
  });

  it('uses senior ownership language in English and German', () => {
    const english = buildDouglasWorkCase(projects, 'en');
    const german = buildDouglasWorkCase(projects, 'de');

    expect(english.personalOwnership.join(' ')).toContain('personally designed and shipped the unified API');
    expect(german.personalOwnership.join(' ')).toContain('die einheitliche API persönlich konzipiert und umgesetzt');
    expect(english.personalOwnership.join(' ')).not.toContain(weakerEnglishWording);
    expect(german.personalOwnership.join(' ')).not.toContain(weakerGermanWording);
  });

  it('includes the complete stack once across both phases', () => {
    const workCase = buildDouglasWorkCase(projects, 'en');

    expect(workCase.technologies).toEqual([...new Set(workCase.technologies)]);
    expect(workCase.technologies).toEqual(expect.arrayContaining(['react', 'dotnet', 'csharp', 'graphql', 'rest']));
  });
});
