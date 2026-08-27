import type { Metadata } from 'next';
import type { Locale } from '@/lib/locale';
import type { PostMeta } from '@/lib/blog';
import deMessages from '@/messages/de.json';
import enMessages from '@/messages/en.json';

export const SITE_URL = 'https://clean.dev';
export const SITE_NAME = 'clean.dev';
export const SOCIAL_IMAGE_URL = `${SITE_URL}/opengraph-image`;
export const SOCIAL_IMAGE_ALT = 'clean.dev share card: Martin Trenker, Technical Lead and Solutions Architect, Munich and remote DACH.';

export type RouteKey = 'home' | 'work' | 'contact' | 'blog' | 'imprint' | 'privacy';

interface RouteCopy {
  title: string;
  description: string;
  ogTitle: string;
}

interface MessageRouteCopy {
  fromMessages: {
    title: string;
    description: string;
    ogTitle: string;
  };
}

export interface RouteDefinition {
  /** Root-relative path, used verbatim as the canonical. */
  path: string;
  /** Literal copy, or message ids for routes that already own catalog keys. */
  copy: Record<Locale, RouteCopy> | MessageRouteCopy;
  /** Static sitemap membership. `whenPostsExist` defers to getAllPosts(). */
  sitemap: boolean | 'whenPostsExist';
  /** Omitted means index, follow. */
  robots?: { index: false; follow: boolean };
}

export const ROUTES: Record<RouteKey, RouteDefinition> = {
  home: {
    path: '/',
    sitemap: true,
    copy: {
      en: {
        title: 'Martin Trenker · Technical Lead and Solutions Architect · Munich and remote DACH',
        description: 'Technical Lead and Solutions Architect in Munich and remote DACH. I modernise architecture, improve delivery reliability, and keep AI workflows team-owned.',
        ogTitle: 'Martin Trenker · Technical Lead and Solutions Architect',
      },
      de: {
        title: 'Martin Trenker · Technical Lead und Solutions Architect · München und remote im DACH-Raum',
        description: 'Technical Lead und Solutions Architect in München und remote im DACH-Raum. Ich modernisiere Architektur, verbessere Delivery und halte KI-Workflows überprüfbar.',
        ogTitle: 'Martin Trenker · Technical Lead und Solutions Architect',
      },
    },
  },
  work: {
    path: '/work',
    sitemap: true,
    copy: {
      en: {
        title: 'Selected work and project history | clean.dev',
        description: '20 client engagements, from React expert to Technical Lead and Solutions Architect, including the Douglas POS and CRM modernisation across 1,200+ stores.',
        ogTitle: 'Selected work and project history',
      },
      de: {
        title: 'Ausgewählte Projekte und Projekthistorie | clean.dev',
        description: '20 Kundenprojekte, vom React-Experten zum Technical Lead und Solutions Architect, inklusive der POS-/CRM-Modernisierung bei Douglas in über 1.200 Filialen.',
        ogTitle: 'Ausgewählte Projekte und Projekthistorie',
      },
    },
  },
  contact: {
    path: '/contact',
    sitemap: true,
    copy: {
      en: {
        title: 'Project enquiry | clean.dev',
        description: 'Send Martin Trenker the context of your project, or book an introductory call. You get a direct answer about fit, in German or English, not a pitch.',
        ogTitle: 'Project enquiry',
      },
      de: {
        title: 'Projektanfrage | clean.dev',
        description: 'Schicken Sie Martin Trenker den Kontext Ihres Projekts oder buchen Sie ein Erstgespräch. Direkte Einschätzung zur Passung, kein Verkaufsgespräch.',
        ogTitle: 'Projektanfrage',
      },
    },
  },
  blog: {
    path: '/blog',
    sitemap: 'whenPostsExist',
    robots: { index: false, follow: true },
    copy: {
      en: {
        title: 'Articles | clean.dev',
        description: 'Notes from inside real engagements: architecture, delivery reliability, and AI adoption that teams can actually own.',
        ogTitle: 'Articles',
      },
      de: {
        title: 'Artikel | clean.dev',
        description: 'Notizen aus echten Projekten: Architektur, verlässliche Delivery und KI-Einführung, die Teams wirklich selbst verantworten können.',
        ogTitle: 'Artikel',
      },
    },
  },
  imprint: {
    path: '/imprint',
    sitemap: true,
    copy: {
      fromMessages: {
        title: 'imprint.metadata.title',
        description: 'imprint.metadata.description',
        ogTitle: 'imprint.metadata.title',
      },
    },
  },
  privacy: {
    path: '/privacy',
    sitemap: true,
    copy: {
      fromMessages: {
        title: 'privacy.metadata.title',
        description: 'privacy.metadata.description',
        ogTitle: 'privacy.metadata.title',
      },
    },
  },
};

const messageCatalogs: Record<Locale, Record<string, string>> = {
  en: enMessages,
  de: deMessages,
};

const resolveRouteCopy = (definition: RouteDefinition, locale: Locale): RouteCopy => {
  if ('fromMessages' in definition.copy) {
    const messageIds = definition.copy.fromMessages;
    const messages = messageCatalogs[locale];
    return {
      title: messages[messageIds.title] ?? messageIds.title,
      description: messages[messageIds.description] ?? messageIds.description,
      ogTitle: messages[messageIds.ogTitle] ?? messageIds.ogTitle,
    };
  }

  return definition.copy[locale];
};

export const buildRouteMetadata = (key: RouteKey, locale: Locale): Metadata => {
  const definition = ROUTES[key];
  const copy = resolveRouteCopy(definition, locale);

  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: definition.path },
    openGraph: {
      title: copy.ogTitle,
      description: copy.description,
      url: definition.path,
      siteName: SITE_NAME,
      type: 'website',
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      images: [{
        url: SOCIAL_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: SOCIAL_IMAGE_ALT,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.ogTitle,
      description: copy.description,
      images: [{ url: SOCIAL_IMAGE_URL, alt: SOCIAL_IMAGE_ALT }],
    },
    robots: definition.robots,
  };
};

const toIsoDate = (date: string): string => new Date(date).toISOString();

export const buildArticleMetadata = (post: PostMeta): Metadata => {
  const canonical = `/blog/${post.slug}`;
  const { frontmatter } = post;

  return {
    title: `${frontmatter.title} | clean.dev`,
    description: frontmatter.description,
    alternates: {
      canonical,
      types: { 'application/rss+xml': `${SITE_URL}/blog/rss.xml` },
    },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'en_US',
      publishedTime: toIsoDate(frontmatter.date),
      modifiedTime: toIsoDate(frontmatter.updated ?? frontmatter.date),
      authors: ['Martin Trenker'],
      images: [{
        url: SOCIAL_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: SOCIAL_IMAGE_ALT,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
      images: [{ url: SOCIAL_IMAGE_URL, alt: SOCIAL_IMAGE_ALT }],
    },
  };
};
