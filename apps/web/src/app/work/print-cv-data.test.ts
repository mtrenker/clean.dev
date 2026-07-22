import { describe, expect, it } from 'vitest';
import { createIntl } from 'react-intl';
import { projects } from '../projects';
import { buildPrintCv, recentTechnologies } from './print-cv-data';
import type { Locale } from '@/lib/locale';
import enMessages from '@/messages/en.json';
import deMessages from '@/messages/de.json';

const intlFor = (locale: Locale) =>
  createIntl({ locale, messages: (locale === 'de' ? deMessages : enMessages) as Record<string, string> });

describe('buildPrintCv', () => {
  it('includes every project, newest first, with render-ready fields', () => {
    const cv = buildPrintCv(projects, 'en', intlFor('en'));

    expect(cv.entries).toHaveLength(projects.length);
    expect(cv.entries[0].name).toBe('Douglas GmbH');
    expect(cv.entries[0].period).toBe('2024 – 2026');
    expect(cv.entries.at(-1)?.name).toBe('Siemens AG');
    expect(cv.entries.at(-1)?.period).toBe('2008 – 2009');

    for (const entry of cv.entries) {
      expect(entry.role).not.toHaveLength(0);
      expect(entry.description).not.toHaveLength(0);
      expect(entry.context).not.toHaveLength(0);
    }
  });

  it('resolves all message keys for both locales', () => {
    for (const locale of ['en', 'de'] as const) {
      const cv = buildPrintCv(projects, locale, intlFor(locale));
      const staticText = [
        cv.docLabel, cv.updatedLabel, cv.name, cv.subtitle, cv.photoAlt,
        cv.contactHeading, cv.focusHeading, cv.focusMeta,
        cv.technologiesHeading, cv.historyHeading, cv.historyMeta,
        ...cv.about,
        ...cv.stats.map((stat) => stat.label),
        ...cv.focusItems.flatMap((item) => [item.heading, item.body]),
      ];
      for (const value of staticText) {
        expect(value).toBeTruthy();
        // react-intl echoes the id back when a key is missing.
        expect(value).not.toMatch(/^work\./);
      }
    }
  });

  it('localizes project fields and city names', () => {
    const cv = buildPrintCv(projects, 'de', intlFor('de'));
    const douglas = cv.entries[0];
    expect(douglas.role).toBe('Berater & Technischer Leiter');
    expect(douglas.context).toContain('Düsseldorf');
    const munichEntry = cv.entries.find((entry) => entry.context[0] === 'München');
    expect(munichEntry).toBeDefined();
  });

  it('provides contact lines with hrefs and short display text', () => {
    const cv = buildPrintCv(projects, 'en', intlFor('en'));
    expect(cv.contactLines[0]).toEqual({ href: 'mailto:info@clean.dev', text: 'info@clean.dev' });
    expect(cv.contactLines.map((line) => line.text)).toContain('github.com/mtrenker');
    for (const line of cv.contactLines) {
      expect(line.text).not.toMatch(/^https?:\/\//);
    }
  });
});

describe('recentTechnologies', () => {
  it('lists the newest engagement stack first without duplicates', () => {
    const technologies = recentTechnologies(projects);
    expect(technologies).toHaveLength(14);
    expect(new Set(technologies).size).toBe(technologies.length);
    expect(technologies.slice(0, 3)).toEqual(['react', 'typescript', 'next.js']);
  });
});
