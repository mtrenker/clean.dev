import { describe, expect, it } from 'vitest';
import { SOCIAL_PROFILES } from './social-profiles';
import {
  getArticleStructuredData,
  getSiteStructuredData,
  ORGANIZATION_ID,
  PERSON_ID,
  serializeStructuredData,
} from './structured-data';

const findNode = (graph: unknown[], type: string): Record<string, unknown> => {
  const node = graph.find((candidate) => (candidate as Record<string, unknown>)['@type'] === type);
  if (!node) throw new Error(`Missing ${type} node`);
  return node as Record<string, unknown>;
};

describe('structured data', () => {
  it('emits one site graph with the approved Person and ProfessionalService', () => {
    const structuredData = getSiteStructuredData();
    const graph = structuredData['@graph'] as unknown[];
    const person = findNode(graph, 'Person');
    const service = findNode(graph, 'ProfessionalService');
    const address = service.address as Record<string, unknown>;
    const offers = service.makesOffer as Array<Record<string, unknown>>;

    expect(graph).toHaveLength(2);
    expect(person['@id']).toBe(PERSON_ID);
    expect(person.jobTitle).toBe('Technical Lead and Solutions Architect');
    expect(person.sameAs).toEqual(SOCIAL_PROFILES.map((profile) => profile.href));
    expect(service['@id']).toBe(ORGANIZATION_ID);
    expect(service.knowsLanguage).toEqual(['de', 'en']);
    expect(service).not.toHaveProperty('provider');
    expect(service).not.toHaveProperty('availableLanguage');
    expect(Object.keys(address)).toEqual(['@type', 'addressLocality', 'addressCountry']);
    expect(offers).toHaveLength(3);
    const offeredServices = offers.map((offer) => offer.itemOffered as Record<string, unknown>);
    expect(offeredServices.map((offeredService) => offeredService.name)).toEqual([
      'Embedded Technical Lead or Solutions Architect',
      'Architecture and Delivery Assessment',
      'AI-enabled Engineering Advisory',
    ]);
    for (const offeredService of offeredServices) {
      expect(offeredService.provider).toEqual({ '@id': PERSON_ID });
      expect(offeredService.availableLanguage).toEqual(['de', 'en']);
    }

    const serialized = JSON.stringify(structuredData);
    for (const forbidden of ['priceRange', 'streetAddress', 'telephone', 'postalCode']) {
      expect(serialized).not.toContain(`"${forbidden}"`);
    }
  });

  it('emits an Article that references, rather than duplicates, site entities', () => {
    const article = getArticleStructuredData({
      slug: 'delivery-reliability',
      frontmatter: {
        title: 'Delivery reliability is a technical leadership concern',
        description: 'A field note.',
        date: '2026-08-20',
        tags: ['delivery', 'leadership'],
      },
    });

    expect(article.author).toEqual({ '@id': PERSON_ID });
    expect(article.publisher).toEqual({ '@id': ORGANIZATION_ID });
    expect(Object.keys(article.author as object)).toEqual(['@id']);
    expect(Object.keys(article.publisher as object)).toEqual(['@id']);
    expect(article.keywords).toBe('delivery, leadership');
    expect(article.dateModified).toBe(article.datePublished);
    expect(JSON.stringify(article)).not.toContain('"sameAs"');
    expect(JSON.stringify(article)).not.toContain('"jobTitle"');
  });

  it('serializes JSON-LD without script-breaking characters', () => {
    const serialized = serializeStructuredData({
      value: '</script>\u2028next\u2029line',
    });

    expect(serialized).toBe('{"value":"\\u003c/script>\\u2028next\\u2029line"}');
  });

  it('truncates long headlines at a word boundary before 110 characters', () => {
    const title = 'A deliberately long article headline that keeps adding meaningful words until it crosses the structured data headline limit safely';
    const article = getArticleStructuredData({
      slug: 'long-headline',
      frontmatter: { title, description: 'Description', date: '2026-08-20' },
    });
    const headline = article.headline as string;

    expect(headline.length).toBeLessThanOrEqual(110);
    expect(title.startsWith(headline)).toBe(true);
    expect(title[headline.length]).toBe(' ');
  });
});
