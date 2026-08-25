import { createIntl } from 'react-intl';
import { describe, expect, it } from 'vitest';
import type { Locale } from '@/lib/locale';
import deMessages from '@/messages/de.json';
import enMessages from '@/messages/en.json';
import { projects } from '../projects';
import { buildProjectDossier } from './project-dossier';

const intlFor = (locale: Locale) =>
  createIntl({ locale, messages: (locale === 'de' ? deMessages : enMessages) as Record<string, string> });

describe('buildProjectDossier', () => {
  it('builds a stable, parseable English dossier from shared profile and project sources', () => {
    const dossier = buildProjectDossier(projects, 'en', intlFor('en'));

    expect(dossier).toMatch(/^# Project dossier: Martin Trenker\n/);
    expect(dossier).toContain('- Document format: UTF-8 Markdown');
    expect(dossier).toContain('- Role titles: Technical Lead; Solutions Architect');
    expect(dossier).toContain('- Availability: September 2026');
    expect(dossier).toContain('- Location and work model: Munich and remote DACH');
    expect(dossier).toContain('- Languages: German and English');
    expect(dossier).toContain('- Utilization: 2–5 days/week');
    expect(dossier).toContain('## Core skills');
    expect(dossier).toContain('## Recent projects');
    expect(dossier.indexOf('### 1. Douglas GmbH')).toBeLessThan(dossier.indexOf('### 2. Oetker Digital GmbH'));
    expect(dossier.indexOf('### 2. Oetker Digital GmbH')).toBeLessThan(dossier.indexOf('### 3. Fielmann AG'));
    expect(dossier).toContain('## Sectors');
    expect(dossier).toContain('## Contact');
    expect(dossier).toContain('info@clean.dev: mailto:info@clean.dev');
    expect(dossier).toContain('## Full project history');
    expect(dossier).toContain('## Current hands-on systems');
    expect(dossier).toContain('issue-scoped agent → isolated worktree → deterministic test and build gates → human-reviewed pull request');
  });

  it('keeps the German dossier equivalent in structure and preserves UTF-8 content', () => {
    const dossier = buildProjectDossier(projects, 'de', intlFor('de'));
    const roundTripped = new TextDecoder('utf-8').decode(new TextEncoder().encode(dossier));

    expect(roundTripped).toBe(dossier);
    expect(dossier).toMatch(/^# Projektdossier: Martin Trenker\n/);
    expect(dossier).toContain('- Rollen: Technical Lead; Solutions Architect');
    expect(dossier).toContain('- Verfügbarkeit: September 2026');
    expect(dossier).toContain('- Standort und Arbeitsmodell: München und remote im DACH-Raum');
    expect(dossier).toContain('- Sprachen: Deutsch und Englisch');
    expect(dossier).toContain('- Auslastung: 2–5 Tage/Woche');
    expect(dossier).toContain('## Aktuelle Projekte');
    expect(dossier).toContain('### 1. Douglas GmbH');
    expect(dossier).toContain('### 2. Oetker Digital GmbH');
    expect(dossier).toContain('### 3. Fielmann AG');
    expect(dossier).toContain('## Aktuelle Hands-on-Systeme');
    expect(dossier).toContain('Überprüfbares Workflow-Beispiel');
  });
});
