import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-metadata';

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: '*',
    allow: '/',
    disallow: ['/api/', '/admin', '/clients', '/invoices', '/time', '/settings'],
  },
  sitemap: `${SITE_URL}/sitemap.xml`,
});

export default robots;
