import { beforeEach, describe, expect, it, vi } from 'vitest';
import sitemap from './sitemap';

const { getAllPostsMock } = vi.hoisted(() => ({
  getAllPostsMock: vi.fn(),
}));

vi.mock('@/lib/blog', () => ({
  getAllPosts: getAllPostsMock,
}));

const staticUrls = [
  'https://clean.dev/',
  'https://clean.dev/work',
  'https://clean.dev/contact',
  'https://clean.dev/imprint',
  'https://clean.dev/privacy',
];

describe('sitemap route', () => {
  beforeEach(() => {
    getAllPostsMock.mockReturnValue([]);
  });

  it('contains exactly the five static public routes when the blog is empty', () => {
    const result = sitemap();

    expect(result.map((entry) => entry.url)).toEqual(staticUrls);
    // The unlisted practice brief (#116) must never reach the sitemap.
    expect(result.map((entry) => entry.url)).not.toContain('https://clean.dev/work/ai-assisted-engineering');
    for (const entry of result) {
      expect(entry).not.toHaveProperty('changeFrequency');
      expect(entry).not.toHaveProperty('priority');
      expect(entry).not.toHaveProperty('lastModified');
    }
  });

  it('adds the blog and newest-first post entries with truthful dates', () => {
    getAllPostsMock.mockReturnValue([
      {
        slug: 'newer',
        frontmatter: {
          title: 'Newer',
          description: 'Newer post',
          date: '2026-08-20',
          updated: '2026-08-22',
        },
      },
    ]);

    const result = sitemap();

    expect(result.map((entry) => entry.url)).toEqual([
      ...staticUrls,
      'https://clean.dev/blog',
      'https://clean.dev/blog/newer',
    ]);
    expect(result.at(-1)?.lastModified).toBe('2026-08-22');
  });
});
