import { describe, expect, it } from 'vitest';
import robots from './robots';

describe('robots route', () => {
  it('returns the approved crawler policy', () => {
    const result = robots();

    expect(result).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/clients', '/invoices', '/time', '/settings'],
      },
      sitemap: 'https://clean.dev/sitemap.xml',
    });

    const serialized = JSON.stringify(result);
    for (const crawlableNoIndexRoute of ['/blog', '/reviews', '/docs-editor', '/workflow-simulator']) {
      expect(serialized).not.toContain(crawlableNoIndexRoute);
    }
  });
});
