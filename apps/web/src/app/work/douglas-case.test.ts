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

      for (const outcome of [
        workCase.summary,
        workCase.inHouseService,
        ...workCase.personalOwnership,
        ...workCase.outcomes.map((item) => item.text),
        ...workCase.teamContribution,
      ]) {
        expect(sourceHighlights).toContain(outcome);
      }
    }
  });

  it('uses senior ownership language in English and German', () => {
    const english = buildDouglasWorkCase(projects, 'en');
    const german = buildDouglasWorkCase(projects, 'de');

    expect(english.personalOwnership.join(' ')).toContain('TypeScript/Node.js with NestJS and Express');
    expect(german.personalOwnership.join(' ')).toContain('TypeScript/Node.js mit NestJS und Express');
    expect(english.personalOwnership.join(' ')).toContain('personally designed and shipped the unified API');
    expect(german.personalOwnership.join(' ')).toContain('die einheitliche API persönlich konzipiert und umgesetzt');
    expect(english.personalOwnership.join(' ')).not.toContain(weakerEnglishWording);
    expect(german.personalOwnership.join(' ')).not.toContain(weakerGermanWording);
  });

  it.each(['en', 'de'] as const)('leads with API ownership and keeps the summary out of the ownership list (%s)', (locale) => {
    const workCase = buildDouglasWorkCase(projects, locale);
    const [shippedApi, runtimeConfig] = workCase.personalOwnership;

    expect(shippedApi).toContain(locale === 'en' ? 'personally designed and shipped the unified API' : 'die einheitliche API persönlich konzipiert und umgesetzt');
    expect(runtimeConfig).toContain(locale === 'en' ? 'config changes no longer require a release' : 'Konfigurationsänderungen brauchen kein Release mehr');
    // Both statements describe the unified API; one list never repeats it.
    expect(workCase.personalOwnership).not.toContain(workCase.summary);
    expect(workCase.summary).toContain(locale === 'en' ? 'ending business logic duplicated' : 'Schluss mit duplizierter Businesslogik');
    // The source record does not say the service was built alone, so it stays an observation.
    expect(workCase.outcomes).toContainEqual({ kind: 'observed', text: workCase.inHouseService });
    expect(workCase.personalOwnership).not.toContain(workCase.inHouseService);
  });

  it('includes the complete stack once across both phases', () => {
    const workCase = buildDouglasWorkCase(projects, 'en');

    expect(workCase.technologies).toEqual([...new Set(workCase.technologies)]);
    expect(workCase.technologies).toEqual(expect.arrayContaining([
      'react', 'typescript', 'node.js', 'nestjs', 'express', 'dotnet', 'csharp', 'graphql', 'rest',
    ]));
  });
});
