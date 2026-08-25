import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { ROUTES, SITE_URL } from '@/lib/site-metadata';

const absoluteUrl = (path: string): string => `${SITE_URL}${path}`;

const sitemap = (): MetadataRoute.Sitemap => {
  const staticRoutes: MetadataRoute.Sitemap = Object.values(ROUTES)
    .filter((route) => route.sitemap === true)
    .map((route) => ({ url: absoluteUrl(route.path) }));
  const conditionalRoute = Object.values(ROUTES)
    .find((route) => route.sitemap === 'whenPostsExist');
  const posts = getAllPosts();

  if (posts.length === 0 || !conditionalRoute) return staticRoutes;

  return [
    ...staticRoutes,
    { url: absoluteUrl(conditionalRoute.path) },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.frontmatter.updated ?? post.frontmatter.date,
    })),
  ];
};

export default sitemap;
