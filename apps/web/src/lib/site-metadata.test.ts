import { describe, expect, it } from 'vitest';
import { buildArticleMetadata, buildRouteMetadata, ROUTES } from './site-metadata';
import type { Locale } from './locale';

const expected = {
  home: {
    en: ['Martin Trenker · Technical Lead and Solutions Architect · Munich and remote DACH', 'Technical Lead and Solutions Architect in Munich and remote DACH. I modernise architecture, improve delivery reliability, and keep AI workflows team-owned.', 'Martin Trenker · Technical Lead and Solutions Architect'],
    de: ['Martin Trenker · Technical Lead und Solutions Architect · München und remote im DACH-Raum', 'Technical Lead und Solutions Architect in München und remote im DACH-Raum. Ich modernisiere Architektur, verbessere Delivery und halte KI-Workflows überprüfbar.', 'Martin Trenker · Technical Lead und Solutions Architect'],
  },
  work: {
    en: ['Selected work and project history | clean.dev', '20 client engagements, from React expert to Technical Lead and Solutions Architect, including the Douglas POS and CRM modernisation across 1,200+ stores.', 'Selected work and project history'],
    de: ['Ausgewählte Projekte und Projekthistorie | clean.dev', '20 Kundenprojekte, vom React-Experten zum Technical Lead und Solutions Architect, inklusive der POS-/CRM-Modernisierung bei Douglas in über 1.200 Filialen.', 'Ausgewählte Projekte und Projekthistorie'],
  },
  contact: {
    en: ['Project enquiry | clean.dev', 'Send Martin Trenker the context of your project, or book an introductory call. You get a direct answer about fit, in German or English, not a pitch.', 'Project enquiry'],
    de: ['Projektanfrage | clean.dev', 'Schicken Sie Martin Trenker den Kontext Ihres Projekts oder buchen Sie ein Erstgespräch. Direkte Einschätzung zur Passung, kein Verkaufsgespräch.', 'Projektanfrage'],
  },
  blog: {
    en: ['Articles | clean.dev', 'Notes from inside real engagements: architecture, delivery reliability, and AI adoption that teams can actually own.', 'Articles'],
    de: ['Artikel | clean.dev', 'Notizen aus echten Projekten: Architektur, verlässliche Delivery und KI-Einführung, die Teams wirklich selbst verantworten können.', 'Artikel'],
  },
  imprint: {
    en: ['Imprint | clean.dev', 'Legal information and imprint according to German law (§ 5 TMG).', 'Imprint | clean.dev'],
    de: ['Impressum | clean.dev', 'Rechtliche Angaben und Impressum gemäß deutschem Recht (§ 5 TMG).', 'Impressum | clean.dev'],
  },
  privacy: {
    en: ['Privacy Policy | clean.dev', 'Privacy policy and information about the processing of personal data on clean.dev according to the GDPR.', 'Privacy Policy | clean.dev'],
    de: ['Datenschutzerklärung | clean.dev', 'Datenschutzerklärung und Informationen zur Verarbeitung personenbezogener Daten auf clean.dev gemäß DSGVO.', 'Datenschutzerklärung | clean.dev'],
  },
} as const;

const months = /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/i;

describe('site metadata', () => {
  it('builds the approved metadata for every route and locale', () => {
    for (const key of Object.keys(ROUTES) as (keyof typeof ROUTES)[]) {
      for (const locale of ['en', 'de'] as Locale[]) {
        const metadata = buildRouteMetadata(key, locale);
        const [title, description, ogTitle] = expected[key][locale];
        const openGraph = metadata.openGraph as Record<string, unknown>;
        const twitter = metadata.twitter as Record<string, unknown>;

        expect(metadata.title).toBe(title);
        expect(metadata.description).toBe(description);
        expect(metadata.alternates?.canonical).toBe(ROUTES[key].path);
        expect(metadata.alternates?.languages).toBeUndefined();
        expect(openGraph.title).toBe(ogTitle);
        expect(openGraph.description).toBe(description);
        expect(openGraph.url).toBe(metadata.alternates?.canonical);
        expect(openGraph.type).toBe('website');
        expect(openGraph.alternateLocale).toBeUndefined();
        expect(openGraph.images).toEqual([{
          url: 'https://clean.dev/opengraph-image',
          width: 1200,
          height: 630,
          alt: 'clean.dev share card: Martin Trenker, Technical Lead and Solutions Architect, Munich and remote DACH.',
        }]);
        expect(twitter.card).toBe('summary_large_image');
        expect(twitter.site).toBeUndefined();
        expect(twitter.creator).toBeUndefined();
        expect(twitter.images).toEqual([{
          url: 'https://clean.dev/opengraph-image',
          alt: 'clean.dev share card: Martin Trenker, Technical Lead and Solutions Architect, Munich and remote DACH.',
        }]);
        expect(description).not.toMatch(/\d+\s*days/i);
        expect(description).not.toMatch(months);
      }
    }
  });

  it('keeps the six canonical paths explicit and unique', () => {
    expect(Object.values(ROUTES).map((route) => route.path)).toEqual([
      '/', '/work', '/contact', '/blog', '/imprint', '/privacy',
    ]);
  });

  it('builds complete article metadata', () => {
    const metadata = buildArticleMetadata({
      slug: 'owned-ai',
      frontmatter: {
        title: 'AI workflows teams can own',
        description: 'A practical note.',
        date: '2026-08-20',
        updated: '2026-08-22',
      },
    });
    const openGraph = metadata.openGraph as Record<string, unknown>;

    expect(metadata.alternates?.canonical).toBe('/blog/owned-ai');
    expect(metadata.alternates?.types).toEqual({ 'application/rss+xml': 'https://clean.dev/blog/rss.xml' });
    expect(openGraph.type).toBe('article');
    expect(openGraph.locale).toBe('en_US');
    expect(openGraph.publishedTime).toBe('2026-08-20T00:00:00.000Z');
    expect(openGraph.modifiedTime).toBe('2026-08-22T00:00:00.000Z');
    expect(openGraph.authors).toEqual(['Martin Trenker']);
  });
});
