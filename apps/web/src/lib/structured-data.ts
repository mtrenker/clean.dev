import type { PostMeta } from '@/lib/blog';
import { SOCIAL_PROFILES } from '@/lib/social-profiles';
import { SITE_URL, SOCIAL_IMAGE_URL } from '@/lib/site-metadata';
import enMessages from '@/messages/en.json';

export const PERSON_ID = `${SITE_URL}/#martin-trenker`;
export const ORGANIZATION_ID = `${SITE_URL}/#clean-dev`;

export const serializeStructuredData = (data: Record<string, unknown>): string => (
  JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
);

const personReference = { '@id': PERSON_ID } as const;
const organizationReference = { '@id': ORGANIZATION_ID } as const;

/** The site-level graph is English and locale-independent. */
export const getSiteStructuredData = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Martin Trenker',
      jobTitle: 'Technical Lead and Solutions Architect',
      url: `${SITE_URL}/`,
      image: `${SITE_URL}/me.png`,
      email: 'mailto:info@clean.dev',
      sameAs: SOCIAL_PROFILES.map((profile) => profile.href),
      knowsLanguage: ['de', 'en'],
      knowsAbout: [
        'Architecture modernisation',
        'Delivery reliability',
        'Governed AI workflows',
      ],
      worksFor: organizationReference,
    },
    {
      '@type': 'ProfessionalService',
      '@id': ORGANIZATION_ID,
      name: 'clean.dev',
      url: `${SITE_URL}/`,
      description: 'Technical Lead and Solutions Architect for teams in Munich and remote DACH: architecture modernisation, delivery reliability, and governed AI workflows.',
      founder: personReference,
      email: 'mailto:info@clean.dev',
      vatID: 'DE262621028',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'München',
        addressCountry: 'DE',
      },
      areaServed: [
        { '@type': 'Country', name: 'Germany' },
        { '@type': 'Country', name: 'Austria' },
        { '@type': 'Country', name: 'Switzerland' },
      ],
      knowsLanguage: ['de', 'en'],
      makesOffer: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: enMessages['home.formats.embedded.title'],
            serviceType: 'Embedded technical leadership',
            provider: personReference,
            availableLanguage: ['de', 'en'],
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: enMessages['home.formats.assessment.title'],
            serviceType: 'Architecture and delivery assessment',
            provider: personReference,
            availableLanguage: ['de', 'en'],
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: enMessages['home.formats.advisory.title'],
            serviceType: 'AI-enabled engineering advisory',
            provider: personReference,
            availableLanguage: ['de', 'en'],
          },
        },
      ],
    },
  ],
});

const truncateHeadline = (headline: string): string => {
  if (headline.length <= 110) return headline;

  const candidate = headline.slice(0, 111);
  const wordBoundary = candidate.lastIndexOf(' ');
  return wordBoundary > 0 ? candidate.slice(0, wordBoundary) : headline.slice(0, 110);
};

/** One Article node referencing the site-level entities by id only. */
export const getArticleStructuredData = (post: PostMeta): Record<string, unknown> => {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const { frontmatter } = post;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: truncateHeadline(frontmatter.title),
    description: frontmatter.description,
    image: SOCIAL_IMAGE_URL,
    datePublished: new Date(frontmatter.date).toISOString(),
    dateModified: new Date(frontmatter.updated ?? frontmatter.date).toISOString(),
    inLanguage: 'en',
    ...(frontmatter.tags && frontmatter.tags.length > 0
      ? { keywords: frontmatter.tags.join(', ') }
      : {}),
    author: personReference,
    publisher: organizationReference,
  };
};
