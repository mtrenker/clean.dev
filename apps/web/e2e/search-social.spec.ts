import { expect, test } from '@playwright/test';
import { getAllPosts } from '../src/lib/blog';

const posts = getAllPosts();

const publicRoutes = [
  { path: '/', canonical: 'https://clean.dev/' },
  { path: '/work', canonical: 'https://clean.dev/work' },
  { path: '/contact', canonical: 'https://clean.dev/contact' },
  { path: '/blog', canonical: 'https://clean.dev/blog' },
  { path: '/imprint', canonical: 'https://clean.dev/imprint' },
  { path: '/privacy', canonical: 'https://clean.dev/privacy' },
];

const germanMetadata = [
  {
    path: '/',
    title: 'Martin Trenker · Technical Lead und Solutions Architect · München und remote im DACH-Raum',
    description: 'Technical Lead und Solutions Architect in München und remote im DACH-Raum. Ich modernisiere Architektur, verbessere Delivery und halte KI-Workflows überprüfbar.',
  },
  {
    path: '/work',
    title: 'Ausgewählte Projekte und Projekthistorie | clean.dev',
    description: '20 Kundenprojekte, vom React-Experten zum Technical Lead und Solutions Architect, inklusive der POS-/CRM-Modernisierung bei Douglas in ~1.800 Filialen.',
  },
  {
    path: '/contact',
    title: 'Projektanfrage | clean.dev',
    description: 'Schicken Sie Martin Trenker den Kontext Ihres Projekts oder buchen Sie ein Erstgespräch. Direkte Einschätzung zur Passung, kein Verkaufsgespräch.',
  },
  {
    path: '/blog',
    title: 'Artikel | clean.dev',
    description: 'Notizen aus echten Projekten: Architektur, verlässliche Delivery und KI-Einführung, die Teams wirklich selbst verantworten können.',
  },
];

test('robots.txt is a valid production response', async ({ request }) => {
  const response = await request.get('/robots.txt');
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/plain');
  expect(body).toContain('Sitemap: https://clean.dev/sitemap.xml');
  expect(body).toContain('Disallow: /api/');
  expect(body).not.toContain('Disallow: /blog');
});

test('sitemap.xml lists exactly the public routes', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  const body = await response.text();
  const locations = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedLocations = [
    ...publicRoutes
      .filter(({ path }) => path !== '/blog')
      .map(({ canonical }) => canonical),
    ...(posts.length > 0
      ? [
          'https://clean.dev/blog',
          ...posts.map((post) => `https://clean.dev/blog/${post.slug}`),
        ]
      : []),
  ];

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('xml');
  expect(locations).toEqual(expectedLocations);
  expect(body).not.toContain('<changefreq>');
  expect(body).not.toContain('<priority>');
  expect([...body.matchAll(/<lastmod>/g)]).toHaveLength(posts.length);
});

test('public routes carry correct canonical and Open Graph URLs', async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route.path);

    const renderedCanonical = route.path === '/' ? 'https://clean.dev' : route.canonical;
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', renderedCanonical);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', renderedCanonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/clean\.dev\//);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /^https:\/\/clean\.dev\//);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
  }
});

test('German pages carry the approved German metadata', async ({ context, page }) => {
  await context.addCookies([{ name: 'NEXT_LOCALE', value: 'de', domain: '127.0.0.1', path: '/' }]);

  for (const route of germanMetadata) {
    await page.goto(route.path);
    expect(await page.title()).toBe(route.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', route.description);
  }
});

test('crawlers without a locale cookie receive English', async ({ request }) => {
  const response = await request.get('/', { headers: { 'Accept-Language': 'de-DE' } });
  const body = await response.text();

  expect(body).toContain('<title>Martin Trenker · Technical Lead and Solutions Architect · Munich and remote DACH</title>');
});

test('the shared social image renders at the required size', async ({ page, request }) => {
  await page.goto('/');
  const imageUrl = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(imageUrl).toBeTruthy();

  const imagePath = new URL(imageUrl!).pathname + new URL(imageUrl!).search;
  const response = await request.get(imagePath);
  const image = await response.body();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(630);
});

test('the empty blog stays out of the index', async ({ page }) => {
  test.skip(posts.length > 0, 'Only applies while the blog is empty.');
  await page.goto('/blog');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[type="application/rss+xml"]')).toHaveCount(0);
});

test('a populated blog is indexable and advertises its feed', async ({ page }) => {
  test.skip(posts.length === 0, 'Activates when the first article is published.');
  await page.goto('/blog');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
    'href',
    'https://clean.dev/blog/rss.xml',
  );
});

test('an unknown article slug returns a noindex 404', async ({ page }) => {
  const response = await page.goto('/blog/not-a-published-article');

  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('private and utility surfaces are not indexable', async ({ page, request }) => {
  for (const path of ['/reviews/not-a-real-token', '/docs-editor', '/workflow-simulator']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  }

  for (const path of ['/blog/rss.xml', '/work/dossier']) {
    const response = await request.get(path);
    expect(response.headers()['x-robots-tag']).toContain('noindex');
  }
});

test('the site graph is one non-contradictory entity set', async ({ context, page }) => {
  await page.goto('/');
  const scripts = page.locator('script[type="application/ld+json"]');
  await expect(scripts).toHaveCount(1);
  const englishJson = await scripts.textContent();
  const parsed = JSON.parse(englishJson!);
  const graph = parsed['@graph'];

  expect(graph.map((node: { '@id': string }) => node['@id'])).toEqual([
    'https://clean.dev/#martin-trenker',
    'https://clean.dev/#clean-dev',
  ]);
  expect(graph[0].jobTitle).toBe('Technical Lead and Solutions Architect');

  await context.addCookies([{ name: 'NEXT_LOCALE', value: 'de', domain: '127.0.0.1', path: '/' }]);
  await page.goto('/');
  expect(await page.locator('script[type="application/ld+json"]').textContent()).toBe(englishJson);
});

test('admin routes redirect rather than render', async ({ request }) => {
  for (const path of ['/admin', '/clients', '/invoices', '/time', '/settings']) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect([302, 303, 307, 308]).toContain(response.status());
    expect(response.headers().location).toMatch(/^\/(?:api\/auth\/signin|$)/);
  }
});

test('published articles expose complete metadata and Article structured data', async ({ page }) => {
  test.skip(posts.length === 0, 'Activates when the first article is published by #84.');
  const post = posts[0];

  await page.goto(`/blog/${post.slug}`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://clean.dev/blog/${post.slug}`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="article:published_time"]')).toHaveCount(1);
  await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute('href', 'https://clean.dev/blog/rss.xml');

  const scripts = page.locator('script[type="application/ld+json"]');
  await expect(scripts).toHaveCount(2);
  const article = JSON.parse((await scripts.nth(1).textContent())!);
  expect(article['@type']).toBe('Article');
  expect(article.author).toEqual({ '@id': 'https://clean.dev/#martin-trenker' });
  expect(article.publisher).toEqual({ '@id': 'https://clean.dev/#clean-dev' });
});
