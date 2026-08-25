import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateMetadata } from './page';

const { cookiesMock, getAllPostsMock, headersMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  getAllPostsMock: vi.fn(),
  headersMock: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: cookiesMock,
  headers: headersMock,
}));

vi.mock('@/lib/blog', () => ({
  formatPostDate: vi.fn(),
  getAllPosts: getAllPostsMock,
}));

describe('blog metadata', () => {
  beforeEach(() => {
    cookiesMock.mockResolvedValue({ get: vi.fn(() => undefined) });
    headersMock.mockResolvedValue({ get: vi.fn(() => null) });
    getAllPostsMock.mockReturnValue([]);
  });

  it('keeps an empty blog crawlable but out of the index', async () => {
    const metadata = await generateMetadata();

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.types).toBeUndefined();
  });

  it('makes a populated blog indexable and advertises its feed', async () => {
    getAllPostsMock.mockReturnValue([{
      slug: 'delivery-reliability',
      frontmatter: {
        title: 'Delivery reliability',
        description: 'A field note.',
        date: '2026-08-20',
      },
    }]);

    const metadata = await generateMetadata();

    expect(metadata.robots).toBeUndefined();
    expect(metadata.alternates?.types).toEqual({
      'application/rss+xml': 'https://clean.dev/blog/rss.xml',
    });
  });
});
