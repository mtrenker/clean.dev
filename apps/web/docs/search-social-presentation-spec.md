# Search and social-share presentation specification

Status: approved design, copy, information-architecture, and structured-data handoff for implementation issue #91.
Owner of this specification: Claude Opus 5 (product copy, visual direction, information architecture, structured data), on behalf of #105.
Parent outcome: #87. Blocks: #91. Coordinates with: #84.
Date of specification: 25 August 2026.
Evidence base: repository state at commit `2be35d8` (`issue/105-…` worktree, identical to `main`), inspected in a running Next 16 dev build of `apps/web` on 25 August 2026.

This document is the single source of truth for clean.dev search metadata, social previews, indexing
policy, canonical behaviour, and structured data. A cold implementation agent should be able to
complete #91 from this file alone, without reconstructing chat history, without inventing copy,
visual direction, route policy, or schema relationships, and without reading an unavailable
positioning brief.

Everything marked **exact value** is literal. Copy it character for character, including the
middot separators (`·`), the non-breaking-free spacing, and the German umlauts.

---

## 1. Precedence, authority, and scope

1. The **25 August 2026 positioning brief** is the commercial source of truth. It is not present in
   this repository. Where it is needed, its content reaches this specification through #87, #89, and
   `apps/web/docs/homepage-positioning-spec.md`, which quote it. Nothing in this document introduces
   a commercial claim that is not already visible on the public site or present in
   `apps/web/src/app/projects.ts`, `apps/web/src/lib/availability.ts`,
   `apps/web/src/lib/social-profiles.ts`, or `apps/web/src/app/imprint/page.tsx`.
2. `apps/web/docs/homepage-positioning-spec.md` owns the rendered lower homepage. This document owns
   nothing that renders inside the page body. Where the two touch (the visual grammar reused by the
   social image), this document restates rather than changes.
3. `DESIGN_SYSTEM.md` at the repository root is **stale for the public site**. It documents the older
   `--background` / `--accent` HSL layer. The public site uses `@/components/site/public-design` and
   the `--site-*` tokens in `apps/web/src/app/globals.css`. Implement against the code and against
   section 7 of this document.
4. Work completed by #89 (hero, proof strip, canonical availability, truthful Articles state), #90
   (Douglas), #92 (lower homepage), #93 (`/work`), and #94 (contact qualification) is preserved.
   This specification changes no rendered page content.
5. Three consequential forks were put to Martin in the #105 session on 25 August 2026 and decided
   there. They are recorded in section 16 and are binding.

### Out of scope for #91

- Migrating to locale-prefixed URLs, or any locale-routing architecture (separate decision).
- Publishing articles. #84 owns article authorship; this document defines only the contract #91
  must satisfy so that #84 needs no metadata work of its own.
- Analytics of any kind. #95 owns analytics and the truthfulness of the privacy page's current
  Plausible statement. **Do not treat `apps/web/src/messages/*.json` `privacy.analytics.*` as a
  factual source**: it describes an integration that does not exist in this repository.
- Per-article social images, keyword landing pages, a new brand identity, client logos, testimonials,
  rates, or any service claim not already visible on the site.
- Restoring Articles to primary navigation. That threshold belongs to #84 (see section 11).

---

## 2. What was inspected

| Evidence | Location | What it establishes |
| --- | --- | --- |
| Root metadata | `apps/web/src/app/layout.tsx` | `metadataBase: https://clean.dev`; locale-derived title/description; a hard-coded `openGraph.url` of `https://clean.dev` that leaks onto every route; no image, no canonical, no Twitter card |
| Person JSON-LD | `apps/web/src/lib/social-profiles.ts`, injected in `layout.tsx` `<head>` | One `Person` node, `jobTitle: 'Software Consultant'`, no `@id`, no organisation, no relationships |
| Locale resolution | `apps/web/src/lib/locale.ts` | Cookie `NEXT_LOCALE` only; `Accept-Language` deliberately ignored; `DEFAULT_LOCALE = 'en'` |
| Route metadata | `contact/page.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`, `imprint/page.tsx`, `privacy/page.tsx` | Contact and blog have title/description but no canonical; imprint and privacy have canonicals; `/` and `/work` have no route metadata at all |
| Blog pipeline | `apps/web/src/lib/blog.ts`, `apps/web/content/posts/` | Filesystem-backed; `content/posts/` holds only `.gitkeep`; frontmatter is `title`, `date`, `description`, optional `tags` |
| Public primitives | `apps/web/src/components/site/public-design.tsx` | `SiteShell`, `SiteSection`, `SiteContainer`, `SectionHeader`, `Card`, `Tag`, `Eyebrow`, `ButtonLink`; radii, tracking, and type scale used by section 7 |
| Design tokens | `apps/web/src/app/globals.css` lines 13–44 | The complete `--site-*` dark and light palettes quoted in section 7 |
| Fonts | `apps/web/src/app/layout.tsx` | Source Sans 3 (400/500/600), IBM Plex Mono (400/600), Newsreader (400/700/800), all via `next/font/google` |
| Route protection | `apps/web/proxy.ts`, `apps/web/src/lib/authz.ts` | Next 16 `proxy.ts` guards `/admin`, `/clients`, `/time`, `/invoices`, `/settings`, `/bill`; pages additionally call `requireAdminSession` |
| Verified facts | `apps/web/src/app/projects.ts`, `src/lib/availability.ts`, `src/app/work/douglas-case.ts`, `src/app/imprint/page.tsx` | 20 engagements, 16 unique companies, first project 2008, Douglas 1,200+ stores / 14 countries, September 2026 / 2–5 days per week / Munich and remote DACH / German and English, VAT `DE262621028`, `info@clean.dev` |
| Rendered output | dev build, `http://localhost:3112`, EN and DE, dark and light | Section 3 |
| Test baseline | `npx vitest run` in `apps/web`, 25 August 2026 | 25 files, 203 tests, 3 failing in 2 files (section 15) |

---

## 3. Verified baseline of the current presentation

Measured from rendered HTML in the dev build. #91 is closing exactly these gaps.

| Observation | Evidence |
| --- | --- |
| `/` and `/work` share the root title `clean.dev \| Embedded Delivery Consulting` and the root description | Rendered `<title>` and `meta[name=description]` on both routes |
| That title is off-positioning | "Embedded Delivery Consulting" predates #89's Technical Lead / Solutions Architect direction |
| The German homepage title is the English string | `layout.tsx` returns the same literal in both branches of its locale ternary |
| `og:url` is `https://clean.dev` on **every** route, including `/work`, `/contact`, `/blog`, `/imprint`, `/privacy` | Rendered `meta[property="og:url"]` |
| `og:title` and `og:description` are the root values on every route, even where `<title>` is route-specific | Rendered `/contact`: `<title>Project enquiry \| clean.dev</title>` beside `og:title` of `clean.dev \| Embedded Delivery Consulting` |
| No `og:image` and no `twitter:image` exist anywhere | Rendered head of all public routes |
| `twitter:card` is `summary` (small card) | Rendered `meta[name="twitter:card"]` |
| No canonical on `/`, `/work`, `/contact`, `/blog` | Only `/imprint` and `/privacy` emit `link[rel=canonical]` |
| `/robots.txt` and `/sitemap.xml` return 404 | `curl -o /dev/null -w '%{http_code}'` |
| `/blog` is correctly `noindex, nofollow` while empty | Rendered `meta[name=robots]`; asserted by `e2e/public-site.spec.ts` |
| `/blog` metadata is English-only in both locales | Rendered DE `/blog` title `Articles \| clean.dev` |
| `/reviews/<invalid-token>` returns **200** with the root title and **no** robots directive | Rendered head of `/reviews/abc` |
| `/docs-editor` and `/workflow-simulator` return 200 and are indexable | Rendered head; neither is linked from public navigation |
| `/work/dossier` returns 200 `text/markdown` with `Content-Disposition: attachment` and no robots header | Response headers |
| `/blog/rss.xml` returns 200 `application/rss+xml` with an empty item list | Response body |
| Person JSON-LD claims `jobTitle: "Software Consultant"` | Rendered `script[type="application/ld+json"]`, contradicting `work.subtitle` |
| `/bill` is listed in `proxy.ts` `adminRoutes` but has no page and returns 404 | Route probe |

---

## 4. Localization, canonical, and crawler model

This is the constraint that shapes every other section. Read it before implementing anything.

### 4.1 How the locale is chosen

`getLocale()` in `apps/web/src/lib/locale.ts` reads **only** the `NEXT_LOCALE` cookie and otherwise
returns `'en'`. `Accept-Language` is deliberately ignored. One URL therefore serves both languages,
and the language is a property of the visitor's session, not of the URL.

### 4.2 What crawlers and social scrapers receive

Googlebot, Bingbot, the LinkedIn Post Inspector, Slackbot, and every other unfurler send **no
cookies**. They therefore always receive:

- `<html lang="en">`
- the **English** title, description, `og:title`, `og:description`
- `og:locale` = `en_US`
- English JSON-LD (which section 10 pins to English unconditionally)

**Consequence, stated plainly:** clean.dev has one indexable language. The German site is a
cookie-selected in-browser experience, not an independently discoverable one. #91 does not change
this and must not pretend otherwise.

The German values in section 5 are still required. They are what a German-speaking visitor sees in
their browser tab and browser history, and what a German visitor's own share tooling would carry if
it ever forwarded a cookie. They are also the values a future locale-routing migration will reuse
without re-deriving copy.

### 4.3 Canonical rules

1. Every public route emits exactly one `link[rel=canonical]`, absolute, on the `https://clean.dev`
   origin, with no query string, no fragment, and no trailing slash except on the homepage.
2. The canonical is **locale-independent**: `/work` canonicalises to `https://clean.dev/work` for
   both an English and a German visitor. There is one URL, so there is one canonical.
3. `og:url` **must equal the canonical** for the route. The current hard-coded
   `openGraph.url: 'https://clean.dev'` in the root layout must be removed, not overridden.
4. Canonical values resolve against the existing `metadataBase` (`https://clean.dev`). Implement them
   as root-relative strings (`alternates: { canonical: '/work' }`) so `metadataBase` stays the single
   origin definition. The homepage uses `'/'`, which Next resolves to `https://clean.dev/`.

### 4.4 hreflang: not emitted, and why

**#91 must emit no `link[rel="alternate"][hreflang]` tags at all.**

`hreflang` declares "this content also exists at *that* URL in *that* language". Under cookie-only
localisation there is no other URL. Emitting `hreflang="de" href="https://clean.dev/"` beside
`hreflang="en" href="https://clean.dev/"` would be two contradictory claims about one URL, which
Google treats as an invalid annotation and which would misrepresent the site.

For the same reason, **do not** emit `og:locale:alternate`. Its only real consumer is Facebook's
`?fb_locale=` mechanism, which this site does not implement, and it makes the same unsupported
claim.

The route metadata objects must therefore not contain `alternates.languages`. A unit test asserts
`alternates?.languages === undefined` for every covered route (section 14).

A future migration to `/de/*` URLs is a separate architecture decision. When it happens, section 5's
German values become the content of those routes and `hreflang` becomes valid.

---

## 5. Exact route metadata

`SITE_NAME` is `clean.dev`. `SITE_URL` is `https://clean.dev`.

Suffix convention: existing routes use `<page> | clean.dev`. This is retained everywhere **except
the homepage**, where the brand is the domain itself and the suffix would push an already long title
to 93 characters for no gain.

Character counts are given so an implementer can verify a copy-paste landed intact. They are not a
budget to re-optimise against; the values below are approved as written.

### 5.1 `/` (homepage)

| Field | Locale | Exact value | Chars |
| --- | --- | --- | --- |
| `title` | en | `Martin Trenker · Technical Lead and Solutions Architect · Munich and remote DACH` | 80 |
| `title` | de | `Martin Trenker · Technical Lead und Solutions Architect · München und remote im DACH-Raum` | 89 |
| `description` | en | `Technical Lead and Solutions Architect in Munich and remote DACH. I modernise architecture, improve delivery reliability, and keep AI workflows team-owned.` | 155 |
| `description` | de | `Technical Lead und Solutions Architect in München und remote im DACH-Raum. Ich modernisiere Architektur, verbessere Delivery und halte KI-Workflows überprüfbar.` | 160 |
| `og:title` | en | `Martin Trenker · Technical Lead and Solutions Architect` | 55 |
| `og:title` | de | `Martin Trenker · Technical Lead und Solutions Architect` | 55 |
| `canonical` | both | `https://clean.dev/` | — |
| `og:type` | both | `website` | — |

The title deliberately exceeds the ~60-character window Google renders. Name and both role titles
land inside that window; only the location tail truncates. The full string remains valuable in the
browser tab, in browser history search, and as a relevance signal for regional queries. This was
put to Martin as an explicit fork and chosen over a 64-character trim (section 16).

`og:title` is shorter than `<title>` on purpose: a share card has no truncation affordance and reads
better without the location tail, which the image itself already carries (section 7).

Copy sources: role from `work.subtitle` and `home.hero.lead` (#89); location and languages from
`getConsultingAvailability()`; "modernise architecture, improve delivery reliability" from
`home.hero.lead`; "team-owned" from `home.hero.lead` ("owned by the team") and
`home.help.aiWorkflows.body`.

### 5.2 `/work`

| Field | Locale | Exact value | Chars |
| --- | --- | --- | --- |
| `title` | en | `Selected work and project history \| clean.dev` | 45 |
| `title` | de | `Ausgewählte Projekte und Projekthistorie \| clean.dev` | 52 |
| `description` | en | `20 client engagements, from React expert to Technical Lead and Solutions Architect, including the Douglas POS and CRM modernisation across 1,200+ stores.` | 153 |
| `description` | de | `20 Kundenprojekte, vom React-Experten zum Technical Lead und Solutions Architect, inklusive der POS-/CRM-Modernisierung bei Douglas in über 1.200 Filialen.` | 155 |
| `og:title` | en | `Selected work and project history` | 33 |
| `og:title` | de | `Ausgewählte Projekte und Projekthistorie` | 40 |
| `canonical` | both | `https://clean.dev/work` | — |
| `og:type` | both | `website` | — |

Copy sources: `20` is `projects.length` in `projects.ts`, verified as exactly 20 and already rendered
by the proof strip as `home.proof.engagements`. The progression string is
`douglas-case.ts` `caseCopy.<locale>.role` in prose form. `1,200+` and the POS/CRM framing come from
`projects.ts` project `19`. German number formatting follows the site (`1.200+`, matching
`home.proof.enterprise.value`).

Do not compute `20` at runtime for the metadata string. The number is stable, the metadata is copy,
and a runtime-computed description would make the acceptance test brittle. If `projects.ts` ever
gains or loses an engagement, the description is updated by hand in the same change.

### 5.3 `/contact`

| Field | Locale | Exact value | Chars |
| --- | --- | --- | --- |
| `title` | en | `Project enquiry \| clean.dev` | 27 |
| `title` | de | `Projektanfrage \| clean.dev` | 26 |
| `description` | en | `Send Martin Trenker the context of your project, or book an introductory call. You get a direct answer about fit, in German or English, not a pitch.` | 148 |
| `description` | de | `Schicken Sie Martin Trenker den Kontext Ihres Projekts oder buchen Sie ein Erstgespräch. Direkte Einschätzung zur Passung, kein Verkaufsgespräch.` | 145 |
| `og:title` | en | `Project enquiry` | 15 |
| `og:title` | de | `Projektanfrage` | 14 |
| `canonical` | both | `https://clean.dev/contact` | — |
| `og:type` | both | `website` | — |

The titles are the values #94 already shipped and are retained unchanged. Only the descriptions grow
to carry the booking option and the direct-answer promise, both from `contact.lead`,
`contact.booking.body`, and `contact.context.selectivity`.

**Rule: no metadata description may contain an availability date, a start month, or a days-per-week
figure.** Availability is generated by `getConsultingAvailability()` and changes; a hard-coded copy
of it in a `<meta>` tag would silently go stale and would contradict the page. Language availability
("in German or English") is stable and is allowed.

### 5.4 `/blog` (article index)

These values apply in both the empty and the populated state. Only `robots` changes between them
(section 8, section 11).

| Field | Locale | Exact value | Chars |
| --- | --- | --- | --- |
| `title` | en | `Articles \| clean.dev` | 20 |
| `title` | de | `Artikel \| clean.dev` | 19 |
| `description` | en | `Notes from inside real engagements: architecture, delivery reliability, and AI adoption that teams can actually own.` | 116 |
| `description` | de | `Notizen aus echten Projekten: Architektur, verlässliche Delivery und KI-Einführung, die Teams wirklich selbst verantworten können.` | 130 |
| `og:title` | en | `Articles` | 8 |
| `og:title` | de | `Artikel` | 7 |
| `canonical` | both | `https://clean.dev/blog` | — |
| `og:type` | both | `website` | — |

The current description ("Essays on embedded delivery, software architecture, agile transformation,
and useful AI") is replaced. "Agile transformation" reads as an Agile-coaching offer, which #87
explicitly excludes from the primary positioning, and the string is English-only in both locales
today.

### 5.5 `/blog/[slug]` (published article)

Templated, not literal. Article bodies are English-only until #84 introduces a localized content
model, so these values are identical in both locales.

| Field | Value | Rule |
| --- | --- | --- |
| `title` | `${frontmatter.title} \| clean.dev` | Existing template, retained |
| `description` | `frontmatter.description` | Verbatim, no truncation, no fallback |
| `og:title` | `frontmatter.title` | Without the suffix |
| `og:description` | `frontmatter.description` | — |
| `canonical` | `https://clean.dev/blog/${slug}` | — |
| `og:type` | `article` | The only route with a non-`website` type |
| `og:locale` | `en_US` | **Pinned**, not derived from the cookie locale |
| `article:published_time` | `frontmatter.date` as ISO 8601 | Via `openGraph.publishedTime` |
| `article:modified_time` | `frontmatter.updated ?? frontmatter.date`, ISO 8601 | Via `openGraph.modifiedTime` |
| `article:author` | `Martin Trenker` | Via `openGraph.authors` |

`og:locale` is pinned to `en_US` on article routes because `og:locale` describes the content of the
page, and the article body is English regardless of which chrome language the visitor selected.
Every other route derives `og:locale` from the active locale as the root layout does today. When
#84 introduces localized posts, the pin becomes "derive from the post's own language".

`generateMetadata` for a missing slug currently returns `{}`; keep that. The page calls `notFound()`,
and the 404 route is `noindex` by section 8.

### 5.6 `/imprint` and `/privacy`

Unchanged. Their titles, descriptions, and canonicals already exist in `imprint.metadata.*` and
`privacy.metadata.*` and are correct. #91 must not rewrite them. It must only:

- ensure they inherit the shared social image and `summary_large_image` card;
- add `openGraph.url` equal to their canonical (they currently inherit the wrong root `og:url`);
- register them in the route table so the sitemap and the tests can iterate one structure.

### 5.7 Where these strings live in code

Create `apps/web/src/lib/site-metadata.ts` as the single typed route table. It is the file a cold
agent opens to see every covered route at once, and the file the exhaustive metadata test iterates.

```ts
import type { Locale } from '@/lib/locale';

export const SITE_URL = 'https://clean.dev';
export const SITE_NAME = 'clean.dev';

export type RouteKey = 'home' | 'work' | 'contact' | 'blog' | 'imprint' | 'privacy';

interface RouteCopy {
  title: string;
  description: string;
  ogTitle: string;
}

export interface RouteDefinition {
  /** Root-relative path, used verbatim as the canonical. */
  path: string;
  /** Literal copy, or a message-id pair for routes that already own catalog keys. */
  copy: Record<Locale, RouteCopy> | { fromMessages: { title: string; description: string; ogTitle: string } };
  /** Static sitemap membership. `'whenPostsExist'` defers to getAllPosts(). */
  sitemap: boolean | 'whenPostsExist';
  /** Omitted means "index, follow". */
  robots?: { index: false; follow: boolean };
}

export const ROUTES: Record<RouteKey, RouteDefinition> = { /* … */ };
```

`imprint` and `privacy` use the `fromMessages` form so their existing catalog keys stay the single
source and `legal-pages.integration.test.tsx` keeps passing unchanged. The other four routes carry
literal copy, because metadata is not rendered through react-intl in the component tree and a typed
literal is easier for a cold agent to verify against this document.

Export one helper from the same file:

```ts
export const buildRouteMetadata = (key: RouteKey, locale: Locale): Metadata => { /* … */ };
```

It returns `title`, `description`, `alternates.canonical`, `openGraph` (`title`, `description`,
`url`, `siteName`, `type`, `locale`), `twitter` (`card`, `title`, `description`), and `robots` when
the route defines one. It must never return `alternates.languages`.

Article metadata is built by a second helper in the same file,
`buildArticleMetadata(post: PostMeta): Metadata`, so the `og:type`, `og:locale`, and
`article:*` rules of section 5.5 live in one place.

---

## 6. Open Graph and Twitter contract

Applies to every public route. Values not listed are not emitted.

| Property | Value | Notes |
| --- | --- | --- |
| `og:site_name` | `clean.dev` | Root layout, inherited |
| `og:title` | per section 5 | Never inherited from the root |
| `og:description` | equals the route `description` | No separate string; keeps the catalogs small |
| `og:url` | equals the route canonical | Root layout's hard-coded value is **removed** |
| `og:type` | `website`, or `article` on `/blog/[slug]` | — |
| `og:locale` | `en_US` / `de_DE` from the active locale; pinned `en_US` on article routes | Crawlers always see `en_US` |
| `og:image` | the shared image of section 7, absolute | One image for all routes |
| `og:image:width` / `:height` | `1200` / `630` | Emitted by Next from the image file convention |
| `og:image:alt` | `clean.dev share card: Martin Trenker, Technical Lead and Solutions Architect, Munich and remote DACH.` | 101 chars |
| `twitter:card` | `summary_large_image` | Set explicitly in the root layout |
| `twitter:title` / `twitter:description` | mirror `og:title` / `og:description` | — |
| `twitter:image` | the same shared image | — |
| `twitter:site` / `twitter:creator` | **not emitted** | `social-profiles.ts` holds Xing, LinkedIn, and GitHub only. There is no X/Twitter account, and inventing a handle is not permitted |

`og:locale:alternate` and `hreflang` are not emitted (section 4.4).

---

## 7. The shared social image

### 7.1 Decision: one generated image, not a hand-drawn asset

The image is produced by a committed Next file-convention route,
`apps/web/src/app/opengraph-image.tsx`, using `ImageResponse` from `next/og`. Because it lives in the
root `app` segment it applies to every route that does not override it, which satisfies #91's "one
shared branded image" without repeating the reference on each page.

A static PNG in `public/` was considered and rejected: a cold implementation agent cannot reliably
produce a raster image from a written brief, whereas it can reproduce the JSX below exactly, and a
generated route is testable at request time (status, content type, and dimensions).

Martin chose a typographic composition over one including his portrait (section 16). The deciding
reason is legibility: at the ~500 px width LinkedIn renders a large card, a portrait consuming a
third of the canvas pushes the proof-strip labels below readable size.

### 7.2 Canvas, safe area, and legibility floor

| Property | Value |
| --- | --- |
| Dimensions | 1200 × 630 px (`export const size = { width: 1200, height: 630 }`) |
| Format | PNG (`export const contentType = 'image/png'`) |
| Alt text | the `og:image:alt` string of section 6 (`export const alt = …`) |
| Theme | **Dark only, fixed.** Social previews have no theme signal, and the dark palette reads as clean.dev against the white feeds of LinkedIn, Slack, and Google |
| Horizontal padding | 56 px left and right, matching `SiteContainer`'s `md:px-14` |
| Vertical structure | Hero zone `y 0–440`, proof band `y 440–630` |
| Legibility floor | No text below **24 px**. At the 0.42× downscale of a 500 px-wide LinkedIn card that renders at ~10 px |
| Review sizes | Must be reviewed at 1200 × 630 (Slack expanded, Google Discover), **1200 × 627 at 0.42× ≈ 500 × 262** (LinkedIn feed), and **360 × 189** (Slack collapsed / mobile) |

### 7.3 Palette (literal hex, not CSS variables)

Satori does not resolve CSS custom properties. Use these literals, which are the dark-theme values
from `globals.css` lines 13–26 verbatim.

| Role | Token | Hex |
| --- | --- | --- |
| Canvas | `--site-bg` | `#14130f` |
| Proof band surface | `--site-panel` | `#1c1a16` |
| Hairlines and dividers | `--site-rule` | `#2c2924` |
| Primary ink | `--site-ink` | `#ede7d4` |
| Secondary ink | `--site-ink-sec` | `#c4bda9` |
| Accent | `--site-rust` | `#d96e3f` |
| Accent border | `--site-rust-soft` | `#8b3f24` |
| Brand line | `--site-green` | `#7eaf6a` |

### 7.4 Content hierarchy and exact copy

Six blocks, top to bottom, all left-aligned at `x = 56`.

| # | Block | Exact copy | Type |
| --- | --- | --- | --- |
| 1 | Brand lockup | `/` in a bordered square, then `CLEAN.DEV` | IBM Plex Mono 600 |
| 2 | Eyebrow | `INDEPENDENT CONSULTANT · MUNICH AND REMOTE DACH` | IBM Plex Mono 600 |
| 3 | Headline | `Martin Trenker` | Source Sans 3 600 |
| 4 | Sub-headline | `Technical Lead and Solutions Architect` | Source Sans 3 400 |
| 5 | Brand line | `INSIDE THE WORK. SHARPER DELIVERY. AI WITH JUDGMENT.` | IBM Plex Mono 600 |
| 6 | Proof band | three cells, see 7.6 | mixed |

Every string is static English. The image carries no dynamic text, so there is no overflow case to
handle and no locale variant to build. Blocks 2 and 5 are the uppercased forms of
`getConsultingAvailability('en').eyebrow` and `home.hero.supporting`; they are hard-coded in the
image, not imported, so that a copy change on the homepage cannot silently reflow a raster asset.

### 7.5 Hero zone geometry

Absolute y positions, block top edge to block bottom edge. A flex column with the listed gaps
produces the same result; the numbers are given so the output can be verified against a screenshot.

| Block | y (top) | Height | Font | Size / line-height | Tracking | Colour |
| --- | --- | --- | --- | --- | --- | --- |
| Brand square | 64 | 44 × 44 | IBM Plex Mono 600 | 24 / 44 | 0 | `#d96e3f` on 1 px `#8b3f24` border, radius 4 |
| `CLEAN.DEV` | 64 | 44 | IBM Plex Mono 600 | 24 / 44 | 3.4 px (0.14em) | `#ede7d4` |
| Eyebrow box | 144 | 44 | IBM Plex Mono 600 | 24 / 24 | 3.84 px (0.16em) | `#d96e3f` on 1 px `#8b3f24` border, radius 2, padding 10 × 16 |
| Headline | 216 | 100 | Source Sans 3 600 | 100 / 100 | −5 px (−0.05em) | `#ede7d4` |
| Sub-headline | 330 | 52 | Source Sans 3 400 | 44 / 52 | −0.88 px (−0.02em) | `#c4bda9` |
| Brand line | 398 | 30 | IBM Plex Mono 600 | 26 / 30 | 2.6 px (0.1em) | `#7eaf6a` |

The brand square and `CLEAN.DEV` sit on one row with a 14 px gap. Measured advance widths at these
sizes leave every line inside the 1088 px content width, with the brand line the widest at ~946 px.

### 7.6 Proof band geometry

The band reproduces the homepage proof strip, which is the site's most recognisable structural
element and carries #91's "strongest verified proof".

| Property | Value |
| --- | --- |
| Band | `y 440` to `y 630`, height 190, background `#1c1a16`, horizontal padding 56 px |
| Top border | 1 px `#2c2924`, full width |
| Cells | three, 362 px each, separated by 1 px `#2c2924` vertical rules naturally landing at `x = 418` and `x = 780` |
| Cell padding | top 30, bottom 32; cell 1 has 0 horizontal padding, cells 2 and 3 have exactly 32 px left padding. With the 1 px dividers this yields 33/32 px post-divider gutters (30 + 52 value + 12 gap + 64 label + 32 = 190) |
| Value type | Source Sans 3 600, 52 / 52, tracking −1.56 px (−0.03em), `#ede7d4` |
| Label type | IBM Plex Mono 600, 24 / 32, uppercase, tracking 3.84 px (0.16em), `#c4bda9`, `maxWidth: 360px` |
| Value-to-label gap | 12 px |

| Cell | Value | Label | Expected wrap |
| --- | --- | --- | --- |
| 1 | `20+` | `YEARS IN SOFTWARE DELIVERY` | two lines: `YEARS IN SOFTWARE` / `DELIVERY` |
| 2 | `20` | `CLIENT ENGAGEMENTS` | one line |
| 3 | `1,200+ / 14` | `STORES / COUNTRIES` | one line |

Sources, all three cells lifted from the homepage proof strip in
`src/components/home/landing-page.tsx`: `20+` is the literal value there, labelled by
`home.proof.years`; `20` is `projects.length`, labelled by `home.proof.engagements`;
`1,200+ / 14` is `home.proof.enterprise.value`, labelled by `home.proof.enterprise`, and traces to
project `19` in `projects.ts`. The homepage's third proof cell (the role progression) is omitted here
because block 4 already states the role. The 56 px band safe area and three 362 px cells preserve the
approved wraps. Cell 1 remains flush to the inset; cells 2 and 3 use 32 px left padding, producing
33/32 px post-divider gutters and a 63 px right margin. The optional brand-line polish was not
approved and remains out of scope.

### 7.7 Decorative grammar and what is forbidden

Retained from the public site: warm near-black canvas, hairline rules as the only dividers, mono
uppercase eyebrows and labels with wide tracking, rust as the single accent, 2–4 px radii, one green
line for the brand statement, left-aligned type with tight negative tracking on the display face.

Forbidden in this image:

- gradients, drop shadows, glows, blurs, noise, or texture overlays;
- icons, illustrations, logos, flags, or photographs, including Martin's portrait;
- any second accent colour beyond the rust and the single green line;
- a light-theme variant, a per-route variant, or a per-locale variant;
- any number, client name, or claim not listed in 7.4 and 7.6;
- centred type, or a second type family beyond Source Sans 3 and IBM Plex Mono.

### 7.8 Fonts

`ImageResponse` cannot read `next/font` output. Commit three static font files under
`apps/web/src/app/_fonts/` (a leading underscore makes it a private folder, excluded from routing)
and load them with `fs.readFileSync` at module scope in `opengraph-image.tsx`:

| File | Family / weight | Used by |
| --- | --- | --- |
| `SourceSans3-SemiBold.ttf` | Source Sans 3, 600 | headline, proof values |
| `SourceSans3-Regular.ttf` | Source Sans 3, 400 | sub-headline |
| `IBMPlexMono-SemiBold.ttf` | IBM Plex Mono, 600 | brand lockup, eyebrow, brand line, proof labels |

Reading the files needs care. `process.cwd()` is `apps/web` under `next dev` and `turbo dev`, but
`/app` inside the standalone Docker image, and files under `src/` are not copied into the standalone
output. Two rules:

1. Resolve the font directory with a candidate list, mirroring `resolvePostsDir()` in
   `apps/web/src/lib/blog.ts`: try `path.join(process.cwd(), 'src/app/_fonts')` then
   `path.join(process.cwd(), 'apps/web/src/app/_fonts')`, and read from the first that exists.
2. `opengraph-image.tsx` uses no dynamic API, so Next generates the PNG at build time and serves it
   as a static asset. That is the intended behaviour, and it means the font read happens during
   `next build` where `src/` is present. **Verify this holds in the Docker standalone image, not only
   in `next dev`.** If the image ever becomes dynamic, the font read moves to runtime and the files
   must move to `apps/web/public/fonts/`, which the standalone build does copy.

Requirements: **static instances, not variable fonts** (satori renders variable fonts unreliably).
Both families are SIL Open Font Licence 1.1, which permits redistribution inside this repository;
add no licence header to the binaries but keep the OFL note in this document as the record.

The site renders proof labels at weight 400. The image uses 600 for all mono text so only one mono
file is committed. This is a deliberate, accepted simplification; at 24 px on a dark canvas the
difference is not perceptible at any review size.

If committing binaries is rejected in review, the documented fallback is fetching the two families
from `fonts.gstatic.com` inside `opengraph-image.tsx` at build time. The Docker build already has
outbound network (`pnpm install` and `next/font/google` both require it), so this works, but it makes
the image build network-dependent and is the second choice.

### 7.9 Satori implementation constraints

`ImageResponse` renders through satori, which supports a subset of CSS. A cold agent must know this
before writing the JSX:

- every element with more than one child needs an explicit `display: 'flex'`;
- there is no CSS cascade and no custom properties: every colour, size, and spacing value is inline
  and literal;
- `letterSpacing` takes px values, not `em`; the em equivalents in 7.5 and 7.6 are given only so the
  values can be traced back to the Tailwind classes they mirror;
- text wrapping is supported but hyphenation is not; the expected wraps in 7.6 must be verified
  visually, and if `YEARS IN SOFTWARE DELIVERY` fails to break as documented, insert an explicit
  two-element column rather than reducing the font size;
- use `runtime = 'nodejs'` (the default for this route) so `fs.readFileSync` is available.

### 7.10 Twitter image

Next derives `twitter:image` from the `opengraph-image` convention when no `twitter-image` file
exists. Verify this in the rendered HTML rather than assuming it. If `twitter:image` is absent after
implementation, add `apps/web/src/app/twitter-image.tsx` that re-exports the same component, `alt`,
`size`, and `contentType`. Do not duplicate the composition.

---

## 8. Route policy matrix

Every App Router page and route handler in `apps/web/src/app` is accounted for. "Index" and "Follow"
describe the intended crawler instruction; "Mechanism" is how #91 delivers it.

### 8.1 Public content

| Route | Index | Follow | Sitemap | Mechanism | Rationale |
| --- | --- | --- | --- | --- | --- |
| `/` | yes | yes | yes | default | Primary commercial entry point |
| `/work` | yes | yes | yes | default | Proof and recruiter surface; the strongest verified content |
| `/contact` | yes | yes | yes | default | Conversion destination; must be reachable from search by name |
| `/imprint` | yes | yes | yes | default | German § 5 TMG disclosure must remain findable |
| `/privacy` | yes | yes | yes | default | GDPR disclosure must remain findable |

### 8.2 Articles

| Route | Index | Follow | Sitemap | Mechanism | Rationale |
| --- | --- | --- | --- | --- | --- |
| `/blog`, zero posts | **no** | yes | no | `metadata.robots = { index: false, follow: true }` | #89 requires the empty Articles state to stay out of indexable discovery. `follow: true` (a change from today's `nofollow`) lets a crawler that lands here still reach `/contact` |
| `/blog`, one or more posts | yes | yes | yes | `robots` omitted when `getAllPosts().length > 0` | An index page with real articles is legitimate content |
| `/blog/[slug]` | yes | yes | yes, one entry per post | default | Published articles are the point of #84 |

`/blog` must not be `Disallow`ed in `robots.txt`. A disallowed URL cannot be crawled, so its
`noindex` is never read, and Google may still index the URL without content. `noindex` alone is the
correct instrument.

### 8.3 Utility routes

| Route | Index | Follow | Sitemap | Mechanism | Rationale |
| --- | --- | --- | --- | --- | --- |
| `/blog/rss.xml` | no | — | no | add `X-Robots-Tag: noindex` to the existing response headers | A feed is a syndication endpoint, not a page. It stays reachable at 200 so feed readers work |
| `/work/dossier` | no | — | no | add `X-Robots-Tag: noindex` to the existing response headers | A Markdown attachment (`Content-Disposition: attachment`, `Cache-Control: no-store`) that duplicates `/work` content |

Neither gains a `Disallow` line, for the same reason as `/blog`.

The RSS feed additionally gains **head discovery** on `/blog` and `/blog/[slug]`, but **only when
posts exist**: `alternates.types['application/rss+xml'] = 'https://clean.dev/blog/rss.xml'`.
Advertising an empty feed is the same trust leak as promoting an empty blog.

### 8.4 Private and authenticated routes

| Route | Index | Follow | Sitemap | Mechanism | Rationale |
| --- | --- | --- | --- | --- | --- |
| `/admin` | no | no | no | `robots.txt` `Disallow`; already 307s to `/api/auth/signin` | Administrative |
| `/clients` | no | no | no | as above | Client records |
| `/invoices`, `/invoices/[id]` | no | no | no | as above (`proxy.ts` matches the `/invoices` prefix) | Financial records |
| `/time` | no | no | no | as above | Time tracking |
| `/settings` | no | no | no | as above | Configuration |

These already redirect unauthenticated requests, so there is nothing for a crawler to index. The
`Disallow` lines are defence in depth and cost nothing.

### 8.5 Token, API, and development routes

| Route | Index | Follow | Sitemap | Mechanism | Rationale |
| --- | --- | --- | --- | --- | --- |
| `/reviews/[token]` | **no** | **no** | no | `export const metadata` with `robots: { index: false, follow: false }` on the page | **Today this returns 200 with the root title and no robots directive** (section 3). Review invitations are private. Use `noindex` and **not** a `robots.txt` `Disallow`: a disallowed token URL that leaks into a referrer could still be URL-indexed, whereas `noindex` is honoured on crawl |
| `/api/health` | no | — | no | `robots.txt` `Disallow: /api/` | Liveness probe |
| `/api/ready` | no | — | no | as above | Readiness probe |
| `/api/auth/[...nextauth]` | no | — | no | as above | Authentication |
| `/api/admin/migrate` | no | — | no | as above | Administrative |
| `/api/reviews/submit` | no | — | no | as above | Form endpoint |
| `/docs-editor` | **no** | no | no | `export const metadata` gains `robots: { index: false, follow: false }` | A `@cleandev/docs` demo. Public 200 today and indexable. #87 forbids thin destinations; a Plate.js playground is not commercial content |
| `/workflow-simulator` | **no** | no | no | as above | A `@cleandev/sim` lab demo, same reasoning. Its own copy calls it "clean.dev lab" |
| `not-found.tsx` (404) | no | — | no | Next serves 404 with `noindex` by default; verify, do not add metadata | Error state |
| `error.tsx`, `global-error.tsx` | no | — | no | Error boundaries, not routes | — |

`/api/` routes get `robots.txt` `Disallow` because they return no HTML, so a `<meta>` directive is
impossible and `robots.txt` is the only available instrument.

### 8.6 Informational: `/bill`

`proxy.ts` lists `/bill` in `adminRoutes`, but no `src/app/bill/page.tsx` exists and the route
returns 404. This is a stale entry left by an earlier removal. **#91 must not touch it.** It is
recorded here so an implementer does not treat it as a missing route or a policy gap. Removing it is
separate cleanup.

---

## 9. `robots.txt` and `sitemap.xml`

### 9.1 `apps/web/src/app/robots.ts`

Implement with the Next `MetadataRoute.Robots` convention. Exact expected output:

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /clients
Disallow: /invoices
Disallow: /time
Disallow: /settings

Sitemap: https://clean.dev/sitemap.xml
```

Rules:

- One `*` user-agent group. No per-crawler groups, no AI-crawler blocks, no `Crawl-delay`; adding
  any of these is a policy decision nobody has taken.
- `/blog`, `/reviews/`, `/docs-editor`, `/workflow-simulator`, `/blog/rss.xml`, and `/work/dossier`
  are **absent** from this file by design. Each is governed by `noindex`, which requires the URL to
  remain crawlable (sections 8.2, 8.3, 8.5).
- No `Host` directive: it is a Yandex extension and Google ignores it.
- The `Sitemap` line is absolute and built from `SITE_URL`.

### 9.2 `apps/web/src/app/sitemap.ts`

Implement with the Next `MetadataRoute.Sitemap` convention.

With `content/posts/` empty, the sitemap contains **exactly five** URLs, in this order:

```
https://clean.dev/
https://clean.dev/work
https://clean.dev/contact
https://clean.dev/imprint
https://clean.dev/privacy
```

When one or more posts exist, it additionally contains `https://clean.dev/blog` and one entry per
post, newest first, matching `getAllPosts()` order.

Rules:

- **Omit `changeFrequency` and `priority` entirely.** Google ignores both. Emitting invented values
  is noise in a file whose only job is to be trustworthy.
- **Omit `lastModified` for the five static routes.** There is no honest source for it; a build
  timestamp would claim daily changes that do not happen.
- **Set `lastModified` for article entries** from `frontmatter.updated ?? frontmatter.date`. This is
  a real, accurate date.
- The sitemap and `/blog`'s robots decision must both derive from the same `getAllPosts()` call
  shape. They must never disagree about whether posts exist. Do not introduce a second post-listing
  path.
- Never include `/blog/rss.xml`, `/work/dossier`, `/reviews/*`, `/docs-editor`,
  `/workflow-simulator`, any `/api/*` route, or any authenticated route.

### 9.3 Interaction with `proxy.ts`

`proxy.ts` matches `/((?!api|_next/static|_next/image|favicon.ico).*)`, so `/robots.txt` and
`/sitemap.xml` pass through it. Neither is an admin route, so the guard returns `undefined` and the
request continues. **No change to `proxy.ts` is required or permitted by #91.** Verify both routes
return 200 in a production build as part of acceptance (section 13).

---

## 10. Structured data

### 10.1 The graph

Exactly three node types, as #105 specifies. Two are site-level and one is per-article.

```
Person (#martin-trenker)  ──worksFor──▶  ProfessionalService (#clean-dev)
        ▲                                        ▲
        │ author                                 │ publisher
        └──────────  Article (/blog/<slug>#article)  ──────────┘
```

| Node | `@id` | Emitted on | Emitted by |
| --- | --- | --- | --- |
| `Person` | `https://clean.dev/#martin-trenker` | every route | root layout, inside one `@graph` |
| `ProfessionalService` | `https://clean.dev/#clean-dev` | every route | the same `@graph` |
| `Article` | `https://clean.dev/blog/<slug>#article` | `/blog/[slug]` only | the post page, as a second `<script>` |

`@id` values are permanent. Changing one breaks every entity Google has already associated with the
site, so they are treated as an API.

A `WebSite` node was considered and **rejected**: #105 scopes the graph to three types, nothing in
Google's Article requirements needs it, and this site has no search action to declare.

### 10.2 Non-duplication rule

This is the answer to "how Person data remains single-sourced without contradictory duplicate nodes":

> **`Article` references `Person` and `ProfessionalService` by `@id` only.** It must never restate
> `name`, `url`, `sameAs`, `jobTitle`, `image`, or any other property of those nodes.

```json
"author":    { "@id": "https://clean.dev/#martin-trenker" },
"publisher": { "@id": "https://clean.dev/#clean-dev" }
```

Because the site-level `@graph` is emitted by the root layout, it is present on the article page
too, so both referenced nodes are always resolvable in the same document. A unit test asserts that
the serialized `Article` object contains no `name` and no `sameAs` key (section 14).

### 10.3 Language rule

**The JSON-LD graph is emitted in English on every request, regardless of the active locale.**

Reasons: the canonical URL has exactly one indexable representation (section 4.2); a graph whose
`jobTitle` changed language while its `@id` stayed constant would make two different claims about
one entity; and a locale-varying graph is untestable in a meaningful way. This is a deliberate
divergence from the `<html lang>` and `<title>` behaviour, and it is testable: request `/` with
`Cookie: NEXT_LOCALE=de` and assert the JSON-LD is byte-identical to the English response.

### 10.4 `Person`

| Property | Exact value | Source |
| --- | --- | --- |
| `@type` | `Person` | — |
| `@id` | `https://clean.dev/#martin-trenker` | — |
| `name` | `Martin Trenker` | Rendered on `/`, `/work`, `/imprint` |
| `jobTitle` | `Technical Lead and Solutions Architect` | `work.subtitle`, `work.hero.heading` (#89). **Replaces the current `Software Consultant`, which contradicts the visible site** |
| `url` | `https://clean.dev/` | — |
| `image` | `https://clean.dev/me.png` | `apps/web/public/me.png`, rendered on `/` and `/work` |
| `email` | `mailto:info@clean.dev` | `/imprint` |
| `sameAs` | `["https://www.xing.com/profile/Martin_Trenker2", "https://www.linkedin.com/in/martin-trenker-193449291/", "https://github.com/mtrenker"]` | Mapped from `SOCIAL_PROFILES`, not retyped |
| `knowsLanguage` | `["de", "en"]` | `availability.ts` `languages` |
| `knowsAbout` | `["Architecture modernisation", "Delivery reliability", "Governed AI workflows"]` | `work.hero.projectTypes`, verbatim segments |
| `worksFor` | `{ "@id": "https://clean.dev/#clean-dev" }` | — |

Not emitted: `telephone` (no public number exists), `address` or `homeLocation` (the organisation
node carries location; duplicating it on the Person would publish a residence claim), `birthDate`,
`alumniOf`, `award`, `hasCredential`. The AWS certifications in `work.certs.note` expired in 2023 and
must not be asserted as current credentials.

`sameAs` must be derived from `SOCIAL_PROFILES` at runtime (`SOCIAL_PROFILES.map((p) => p.href)`), as
today, so adding a profile updates the graph automatically.

### 10.5 `ProfessionalService`

| Property | Exact value | Source |
| --- | --- | --- |
| `@type` | `ProfessionalService` | — |
| `@id` | `https://clean.dev/#clean-dev` | — |
| `name` | `clean.dev` | Brand lockup, `og:site_name` |
| `url` | `https://clean.dev/` | — |
| `description` | `Technical Lead and Solutions Architect for teams in Munich and remote DACH: architecture modernisation, delivery reliability, and governed AI workflows.` | Composed from `work.hero.lead` and `work.hero.projectTypes`; 152 chars |
| `founder` | `{ "@id": "https://clean.dev/#martin-trenker" }` | — |
| `email` | `mailto:info@clean.dev` | `/imprint` |
| `vatID` | `DE262621028` | `/imprint`, § 27a UStG disclosure |
| `address` | `{ "@type": "PostalAddress", "addressLocality": "München", "addressCountry": "DE" }` | `/imprint`, **locality and country only** |
| `areaServed` | `[{ "@type": "Country", "name": "Germany" }, { "@type": "Country", "name": "Austria" }, { "@type": "Country", "name": "Switzerland" }]` | "remote DACH" in `availability.ts`; DACH is exactly D/A/CH |
| `knowsLanguage` | `["de", "en"]` | `availability.ts` |
| `makesOffer` | three `Offer` nodes, see below | `home.formats.*` |

`makesOffer` (no prices, no durations, no availability dates):

```json
[
  { "@type": "Offer", "itemOffered": { "@type": "Service",
      "name": "Embedded Technical Lead or Solutions Architect",
      "serviceType": "Embedded technical leadership",
      "provider": { "@id": "https://clean.dev/#martin-trenker" },
      "availableLanguage": ["de", "en"] } },
  { "@type": "Offer", "itemOffered": { "@type": "Service",
      "name": "Architecture and Delivery Assessment",
      "serviceType": "Architecture and delivery assessment",
      "provider": { "@id": "https://clean.dev/#martin-trenker" },
      "availableLanguage": ["de", "en"] } },
  { "@type": "Offer", "itemOffered": { "@type": "Service",
      "name": "AI-enabled Engineering Advisory",
      "serviceType": "AI-enabled engineering advisory",
      "provider": { "@id": "https://clean.dev/#martin-trenker" },
      "availableLanguage": ["de", "en"] } }
]
```

The three `name` values are `home.formats.embedded.title`, `home.formats.assessment.title`, and
`home.formats.advisory.title` verbatim, so the graph and the rendered homepage cannot drift apart.
`provider` and `availableLanguage` belong on each offered `Service` in the schema.org domain model;
they are not emitted on `ProfessionalService`. The organisation-level language fact uses
`knowsLanguage` instead.

**The full street address is deliberately omitted.** Martin decided this in the #105 session
(section 16): the imprint carries the legally required version in HTML, and structured data would
turn a residential address into machine-readable data for aggregators and mapping products. Do not
add `streetAddress` or `postalCode`, and do not add `geo`.

Not emitted: `priceRange` (#87 forbids publishing rates; an invented range would be a false claim),
`openingHours`, `aggregateRating`, `review`, `logo`, `numberOfEmployees`, `foundingDate`.
`priceRange` is recommended by some `LocalBusiness` validators; its absence produces a warning, not
an error, and a warning is preferable to a fabricated figure.

### 10.6 `Article`

Emitted only on `/blog/[slug]`, only for a post that exists.

| Property | Value | Rule |
| --- | --- | --- |
| `@type` | `Article` | See note below |
| `@id` | `https://clean.dev/blog/${slug}#article` | — |
| `mainEntityOfPage` | `https://clean.dev/blog/${slug}` | Equals the canonical |
| `url` | `https://clean.dev/blog/${slug}` | — |
| `headline` | `frontmatter.title`, truncated at the last word boundary before 110 characters if longer | Google truncates `headline` at 110 and flags longer values |
| `description` | `frontmatter.description` | Verbatim |
| `image` | the absolute URL of the shared social image | Satisfies Google's Article image requirement at 1200 × 630 |
| `datePublished` | `frontmatter.date` as ISO 8601 | — |
| `dateModified` | `frontmatter.updated ?? frontmatter.date` as ISO 8601 | — |
| `inLanguage` | `en` | Article bodies are English until #84 changes the content model |
| `keywords` | `frontmatter.tags` joined with `, `, omitted when there are no tags | — |
| `author` | `{ "@id": "https://clean.dev/#martin-trenker" }` | Reference only |
| `publisher` | `{ "@id": "https://clean.dev/#clean-dev" }` | Reference only |

`BlogPosting` was considered. It is a subtype of `Article` and marginally more precise, but #91,
#105, and #87 all name `Article`, Google supports both identically, and no consumer benefits from
the distinction. `Article` is used so the implementation matches the approved language exactly.

### 10.7 Where structured data lives in code

Create `apps/web/src/lib/structured-data.ts`:

```ts
export const PERSON_ID = 'https://clean.dev/#martin-trenker';
export const ORGANIZATION_ID = 'https://clean.dev/#clean-dev';

/** The site-level @graph: Person + ProfessionalService. English, locale-independent. */
export const getSiteStructuredData = (): Record<string, unknown> => ({ '@context': 'https://schema.org', '@graph': [ /* … */ ] });

/** One Article node. References Person and ProfessionalService by @id only. */
export const getArticleStructuredData = (post: PostMeta): Record<string, unknown> => ({ /* … */ });
```

`apps/web/src/lib/social-profiles.ts` keeps `SOCIAL_PROFILES`, `SocialProfileMeta`,
`SocialProfileDisplay`, and `getSocialProfiles`. Its `getPersonStructuredData` export is **removed**;
its only caller is `layout.tsx`, which switches to `getSiteStructuredData`. Do not leave a
deprecated alias behind: two exported ways to build a Person node is exactly the duplication this
section exists to prevent.

`layout.tsx` continues to inject one `<script type="application/ld+json">` in `<head>` on every
route, including private ones. Gating it on route type adds a branch, adds a test surface, and buys
nothing: the graph is public information already rendered on every public page.

---

## 11. Empty and future article states

### 11.1 Behaviour by post count

| Post count | `/blog` robots | `/blog` in sitemap | Post entries in sitemap | RSS head discovery | Article JSON-LD | Articles in primary navigation |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | `noindex, follow` | no | none | no | none | no (#89) |
| 1 | omitted (indexable) | yes | one | yes | on that post | **no** (#84 threshold not met) |
| 2 or more | omitted (indexable) | yes | one per post | yes | on every post | yes, when #84 restores it |

Two different thresholds are in play and they must not be confused:

- the **indexing** threshold is **one** post, and it belongs to #91;
- the **navigation** threshold is **two** substantive articles, and it belongs to #84.

#89 required the *empty* blog to stay out of indexable discovery. Empty means zero. A single real
article is legitimate indexable content even though it is not yet enough to justify a primary
navigation item.

### 11.2 The contract #91 provides to #84

#91 must ship all of this while `content/posts/` contains only `.gitkeep`, so that #84 needs to write
no metadata, no structured data, and no sitemap code:

1. `getAllPosts()` is the only post-listing path. `/blog`'s robots decision, the sitemap, the RSS
   route, and `generateStaticParams` all call it.
2. Frontmatter contract, extending `PostFrontmatter` in `apps/web/src/lib/blog.ts`:

   | Field | Required | Type | Used by |
   | --- | --- | --- | --- |
   | `title` | yes | string | `<title>`, `og:title`, `headline` |
   | `date` | yes | ISO date string | `datePublished`, sitemap `lastModified`, RSS `pubDate` |
   | `description` | yes | string | `description`, `og:description`, JSON-LD `description` |
   | `tags` | no | string[] | `keywords`, rendered tags |
   | `updated` | **new, optional** | ISO date string | `dateModified`, sitemap `lastModified` |

   `updated` is added by #91 as an optional field so #84 can revise an article without a schema
   change. #91 does not need any post to use it.
3. Adding a Markdown file to `content/posts/` and rebuilding is sufficient to produce: an indexable
   `/blog`, a sitemap entry, a canonical, `og:type=article`, `article:published_time`, valid Article
   JSON-LD, and an RSS item. **No code change is required to publish.**
4. Articles inherit the shared social image of section 7. Per-article images are out of scope; if
   #84 wants them, that is a separate decision with its own visual direction.
5. If every post file is later removed, all of the above reverts automatically. The empty state must
   stay honest without manual intervention.

### 11.3 What #91 must not do

Do not author, stub, or fixture a Markdown file into `content/posts/`. Article behaviour is tested
with a mocked `@/lib/blog` (section 14), never with a committed placeholder post. A placeholder
would appear on the live site and reintroduce exactly the trust leak #89 removed.

---

## 12. Implementation boundaries

### 12.1 Files to create

| File | Contents |
| --- | --- |
| `apps/web/src/lib/site-metadata.ts` | `SITE_URL`, `SITE_NAME`, `ROUTES`, `buildRouteMetadata`, `buildArticleMetadata` (section 5.7) |
| `apps/web/src/lib/structured-data.ts` | `PERSON_ID`, `ORGANIZATION_ID`, `getSiteStructuredData`, `getArticleStructuredData` (section 10.7) |
| `apps/web/src/app/robots.ts` | Section 9.1 |
| `apps/web/src/app/sitemap.ts` | Section 9.2 |
| `apps/web/src/app/opengraph-image.tsx` | Section 7 |
| `apps/web/src/app/_fonts/SourceSans3-SemiBold.ttf` | Section 7.8 |
| `apps/web/src/app/_fonts/SourceSans3-Regular.ttf` | Section 7.8 |
| `apps/web/src/app/_fonts/IBMPlexMono-SemiBold.ttf` | Section 7.8 |
| `apps/web/src/lib/site-metadata.test.ts` | Section 14.1 |
| `apps/web/src/lib/structured-data.test.ts` | Section 14.1 |
| `apps/web/src/app/robots.test.ts` | Section 14.1 |
| `apps/web/src/app/sitemap.test.ts` | Section 14.1 |
| `apps/web/e2e/search-social.spec.ts` | Section 14.2 |
| `apps/web/src/app/twitter-image.tsx` | Only if section 7.10's verification shows it is needed |

### 12.2 Files to change

| File | Change |
| --- | --- |
| `src/app/layout.tsx` | Keep `metadataBase`; **remove** `openGraph.url`; keep `openGraph.siteName`; add `twitter.card = 'summary_large_image'`; keep the locale-derived root title/description as the fallback for uncovered routes; replace `getPersonStructuredData()` with `getSiteStructuredData()` |
| `src/app/page.tsx` | Add `generateMetadata` calling `buildRouteMetadata('home', locale)` |
| `src/app/work/page.tsx` | Add `generateMetadata` calling `buildRouteMetadata('work', locale)` |
| `src/app/contact/page.tsx` | Replace the inline metadata object with `buildRouteMetadata('contact', locale)`; keep `PROTON_BOOKING_URL` exported unchanged |
| `src/app/blog/page.tsx` | Replace the inline metadata with `buildRouteMetadata('blog', locale)` plus the post-count robots rule and RSS discovery |
| `src/app/blog/[slug]/page.tsx` | Use `buildArticleMetadata(post)`; add the Article JSON-LD `<script>` |
| `src/app/imprint/page.tsx` | Route through `buildRouteMetadata('imprint', locale)`; the emitted title, description, and canonical must be byte-identical to today's |
| `src/app/privacy/page.tsx` | Same, for `'privacy'` |
| `src/app/blog/rss.xml/route.ts` | Add `X-Robots-Tag: noindex` to the response headers; change nothing else |
| `src/app/work/dossier/route.ts` | Add `X-Robots-Tag: noindex` to the response headers; change nothing else |
| `src/app/reviews/[token]/page.tsx` | Add `export const metadata: Metadata = { robots: { index: false, follow: false } }` |
| `src/app/docs-editor/page.tsx` | Add `robots: { index: false, follow: false }` to the existing metadata object |
| `src/app/workflow-simulator/page.tsx` | Same |
| `src/lib/social-profiles.ts` | Remove `getPersonStructuredData`; keep everything else |
| `src/lib/blog.ts` | Add optional `updated?: string` to `PostFrontmatter` |
| `apps/web/package.json` | Nothing. `next/og` ships with Next 16; no dependency is added |

### 12.3 Files that must not change

`src/app/projects.ts`, `src/app/lab.ts`, `src/lib/availability.ts`, `src/app/work/douglas-case.ts`,
`src/app/work/featured-cases.ts`, `src/app/work/print-cv*.ts(x)`, `src/app/work/project-dossier.ts`,
`src/components/home/landing-page.tsx`, `src/app/work/portfolio-view.tsx`,
`src/components/site/public-design.tsx`, `src/components/ui/**`, `src/app/globals.css`,
`src/styles/**`, `proxy.ts`, `auth.ts`, `src/lib/locale.ts`, `content/posts/**`,
`DESIGN_SYSTEM.md`, `apps/web/docs/homepage-positioning-spec.md`.

Message catalogs were originally outside #91. Martin granted a narrow post-merge scope waiver for
`home.profileCard.meta1` only: English is exactly `technical lead and solutions architect`; German is
exactly `Technical Lead und Solutions Architect`. No other catalog key or rendered page copy changes.

### 12.4 Rendered page content

The original #91 implementation changed no visible page content. The approved post-merge correction
changes only `home.profileCard.meta1` to align the profile card with the canonical positioning. Any
other body-copy change still requires escalation.

---

## 13. Acceptance criteria for #91

A cold agent can treat this as the definition of done.

**Metadata**

1. `/`, `/work`, `/contact`, `/blog`, `/imprint`, and `/privacy` each emit the exact `title`,
   `description`, and `og:title` of section 5, in English with no locale cookie and in German with
   `NEXT_LOCALE=de`.
2. Every one of those routes emits exactly one `link[rel=canonical]` with the absolute URL listed in
   section 5, identical in both locales.
3. `og:url` equals the canonical on every route. No route emits `https://clean.dev` as `og:url`
   unless it is the homepage.
4. No route emits any `link[rel="alternate"][hreflang]`, and no route metadata object contains
   `alternates.languages`.
5. No route emits `og:locale:alternate`.
6. `twitter:card` is `summary_large_image` on every public route.
7. `twitter:site` and `twitter:creator` are absent.
8. Requesting `/` with `Accept-Language: de-DE` and no cookie returns the English title, proving the
   crawler-locale behaviour of section 4.2.

**Social image**

9. The shared image route returns 200 with `content-type: image/png` and pixel dimensions
   1200 × 630.
10. `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`, and `twitter:image` are present
    and absolute on every public route.
11. The rendered image matches section 7: the six blocks, the exact copy, the three proof cells, the
    dark palette, and no forbidden element.
12. The image is legible at 500 × 262 and at 360 × 189: every label is readable and no text is
    clipped by the canvas edge.

**Robots and sitemap**

13. `/robots.txt` returns 200 `text/plain` and matches section 9.1 exactly, including the absolute
    `Sitemap` line.
14. `/sitemap.xml` returns 200 with an XML content type and, with `content/posts/` empty, contains
    exactly the five URLs of section 9.2 and nothing else.
15. The sitemap contains no `changeFrequency` and no `priority` element, and no `lastmod` on the
    static routes.
16. With a post present, the sitemap additionally contains `/blog` and the post URL, and the post
    entry carries a `lastmod` derived from its frontmatter.
17. Every route in section 8 behaves as its row specifies. In particular `/reviews/<any-token>`,
    `/docs-editor`, and `/workflow-simulator` emit `noindex`, and `/blog/rss.xml` and `/work/dossier`
    return an `X-Robots-Tag: noindex` header.

**Structured data**

18. `/` emits exactly one site-level `<script type="application/ld+json">` containing an `@graph`
    with one `Person` and one `ProfessionalService`, with the `@id` values of section 10.1.
19. Every property in sections 10.4 and 10.5 is present with the exact value given, and no property
    listed as "not emitted" appears.
20. `Person.jobTitle` is `Technical Lead and Solutions Architect`. The string `Software Consultant`
    appears nowhere in the rendered output.
21. `Person.sameAs` is derived from `SOCIAL_PROFILES` and contains exactly its three URLs.
22. The JSON-LD is byte-identical between a request with no cookie and a request with
    `NEXT_LOCALE=de`.
23. A published article emits a second `<script>` with an `Article` node whose `author` and
    `publisher` are `@id` references and which restates no `Person` or `ProfessionalService`
    property.
24. `ProfessionalService.address` contains `addressLocality` and `addressCountry` only. Neither
    `streetAddress` nor `postalCode` appears anywhere in the rendered output.

**Article states**

25. With `content/posts/` empty: `/blog` is `noindex, follow`, absent from the sitemap, and carries
    no RSS discovery link; no `Article` JSON-LD exists anywhere.
26. Adding one Markdown file with valid frontmatter and rebuilding produces an indexable `/blog`, a
    sitemap entry, a canonical, `og:type=article`, and valid Article JSON-LD **with no code change**.
27. `content/posts/` still contains only `.gitkeep` when #91 is complete.

**Regression**

28. `pnpm --filter @cleandev/web test` shows no failures beyond the recorded baseline of section 15.
29. The existing e2e assertions keep passing, including
    `the empty blog is excluded from search indexing`,
    `homepage leads with verified project evidence and does not promote an empty blog`, and the legal
    metadata assertions in `src/app/legal-pages.integration.test.tsx`.
30. `next build` succeeds, and the shared social image renders correctly from the **standalone Docker
    image**, not only under `next dev` (section 7.8).
31. No file listed in section 12.3 is modified.

---

## 14. Validation map

### 14.1 Unit tests (vitest)

| File | Assertions |
| --- | --- |
| `src/lib/site-metadata.test.ts` | Iterate `ROUTES` × `['en','de']`: exact `title`, `description`, `openGraph.title`, `alternates.canonical`, `openGraph.url === alternates.canonical`, `openGraph.type`, `twitter.card === 'summary_large_image'`, `alternates?.languages === undefined`. Assert the six literal canonicals. Assert no description contains a digit followed by `days` or a month name, enforcing the availability rule of section 5.3 |
| `src/lib/structured-data.test.ts` | `getSiteStructuredData()` has `@graph.length === 2`; the `@id` constants; `jobTitle`; `sameAs` deep-equals `SOCIAL_PROFILES.map(p => p.href)`; `address` has exactly the keys `@type`, `addressLocality`, `addressCountry`; `ProfessionalService` has `knowsLanguage` and no `provider` or `availableLanguage`; each offered `Service` has the Person `provider` reference and `availableLanguage`; `makesOffer.length === 3` with the three exact `name` values; no `priceRange`, `streetAddress`, `telephone`, or `postalCode` key anywhere in the serialized JSON. `getArticleStructuredData(fixture)` has `author`/`publisher` objects whose only key is `@id`, and the serialized string contains neither `"sameAs"` nor `"jobTitle"`. A `headline` longer than 110 chars is truncated at a word boundary |
| `src/app/robots.test.ts` | The returned object produces the exact rule set of section 9.1; `sitemap` is `https://clean.dev/sitemap.xml`; `/blog`, `/reviews`, `/docs-editor`, `/workflow-simulator` are **not** disallowed |
| `src/app/sitemap.test.ts` | With `@/lib/blog` mocked to return `[]`: exactly five entries in the documented order, none with `changeFrequency`, `priority`, or `lastModified`. With one mocked post: seven entries, `/blog` present, the post entry carries `lastModified` from `updated ?? date` |
| extend `src/app/legal-pages.integration.test.tsx` | Unchanged assertions must still pass after imprint and privacy route through `buildRouteMetadata` |

Mock `next/headers` with the `vi.hoisted` pattern already used by
`legal-pages.integration.test.tsx`. Do not add a new mocking style.

The social image is **not** unit-tested. `ImageResponse` needs a WASM/font runtime that jsdom does
not provide; asserting on it there tests the harness, not the artifact. It is covered by e2e and by
manual review instead.

### 14.2 End-to-end tests (Playwright, `e2e/search-social.spec.ts`)

| Test | Assertion |
| --- | --- |
| `robots.txt is a valid production response` | 200, `text/plain`, body contains `Sitemap: https://clean.dev/sitemap.xml`, contains `Disallow: /api/`, does not contain `Disallow: /blog` |
| `sitemap.xml lists exactly the public routes` | 200, XML content type, the `<loc>` sequence derives from `getAllPosts()`: five static URLs while empty, then `/blog` and one URL per post; no `<changefreq>` or `<priority>`; `<lastmod>` count equals post count |
| `public routes carry correct canonical and Open Graph URLs` | For each of the six routes: one canonical, `og:url` equal to it, `og:image` absolute, `twitter:card` = `summary_large_image`, zero `link[rel=alternate][hreflang]` |
| `German pages carry the approved German metadata` | With `NEXT_LOCALE=de`: the exact German titles and descriptions of section 5 on `/`, `/work`, `/contact`, `/blog` |
| `crawlers without a locale cookie receive English` | `Accept-Language: de-DE`, no cookie, on `/`: English title |
| `the shared social image renders at the required size` | Fetch the `og:image` URL: 200, `image/png`, decoded width 1200 and height 630 |
| `the empty blog stays out of the index` | `/blog`: `meta[name=robots]` matches `/noindex/`. Keeps the existing `public-site.spec.ts` assertion honest from the new file too |
| `private and utility surfaces are not indexable` | `/reviews/not-a-real-token`, `/docs-editor`, `/workflow-simulator`: `noindex`. `/blog/rss.xml` and `/work/dossier`: `x-robots-tag` response header contains `noindex` |
| `the site graph is one non-contradictory entity set` | On `/`: exactly one site-level `ld+json` script; it parses; `@graph` has the two expected `@id` values; `jobTitle` is the approved string; the response with `NEXT_LOCALE=de` yields an identical JSON string |
| `admin routes redirect rather than render` | `/admin`, `/clients`, `/invoices`, `/time`, `/settings` return a redirect to `/api/auth/signin` |

Article assertions are written now and skipped with a documented `test.skip` guard on
`getAllPosts().length === 0`, so that #84's first article activates them without new test code.

### 14.3 Rendered-output checks in the production build

Run against `next build && next start` before deploying, not only against the dev server:

1. `curl -s https://<host>/robots.txt` and diff against section 9.1.
2. `curl -s https://<host>/sitemap.xml | grep -c '<loc>'` returns 5.
3. `curl -s https://<host>/ | grep -o 'og:image[^>]*'` shows an absolute URL on the production origin.
4. `curl -s https://<host>/work | grep canonical` shows `https://clean.dev/work`, not the host the
   build ran on. This catches a `metadataBase` regression.
5. `curl -s https://<host>/ | grep -c 'application/ld+json'` returns 1.
6. Fetch the `og:image` URL from the same build and confirm 200, `image/png`, and 1200 × 630. Run
   this against the standalone Docker image specifically; it is the check that catches a font path
   that only resolves in dev (section 7.8).

### 14.4 Manual and post-deployment checks

| Check | Tool | Pass condition |
| --- | --- | --- |
| Structured data validity | Google Rich Results Test on `https://clean.dev/` | Person and ProfessionalService detected, zero errors; `priceRange` warning is expected and accepted |
| Schema conformance | Schema.org validator on the same URL | No unrecognised properties |
| LinkedIn preview | LinkedIn Post Inspector, re-scrape `https://clean.dev/` and `https://clean.dev/work` | Large card, correct per-route title and description, image legible, correct URL |
| Slack preview | Paste both URLs into a private Slack channel | Large unfurl, image renders, title matches the route |
| Article preview | Repeat both after #84's first article | `og:type=article`, article title, shared image |
| Search Console | Submit `https://clean.dev/sitemap.xml` | Five URLs discovered, zero errors |
| Index hygiene | `site:clean.dev` after two weeks | No `/admin`, `/reviews`, `/api`, `/docs-editor`, `/workflow-simulator`, or `/blog` results |
| Image review | Render the image at 1200 × 630, 500 × 262, 360 × 189 | Every label readable at every size; nothing clipped |

Social scrapers cache aggressively. A preview correction after deployment requires an explicit
re-scrape in the LinkedIn Post Inspector; Slack refreshes on its own within roughly 30 minutes.

---

## 15. Known baseline, risks, and follow-ups

Recorded so #91 does not chase pre-existing problems.

**Unit-test baseline**, `npx vitest run` in `apps/web`, 25 August 2026, commit `2be35d8`:
**25 files, 203 tests, 3 failing in 2 files.**

- `src/test/a11y-source-guards.test.ts` — sub-12 px arbitrary text sizes from the May 2026 redesign.
- `src/components/ui/shell.integration.test.tsx` — two failures from `usePathname()` returning `null`
  under jsdom in `navigation-links.tsx`, plus one obsolete snapshot.

#91 must not fix these and must not regenerate that snapshot. Anything else failing after the change
is a genuine regression.

**Other known conditions**

- `pnpm lint` in `apps/web` is broken independently of this work: the script still calls `next lint`,
  which Next 16 removed. Do not treat it as a regression and do not fix it inside #91.
- `packages/db` must be built before `apps/web` will compile the authenticated routes locally
  (`pnpm --filter @cleandev/db build`). Without it, `/clients`, `/invoices`, `/time`, and `/settings`
  fail to resolve `@cleandev/db` and the dev server returns 500 for **every** route. This is a local
  setup condition, not a route-policy problem.
- The privacy page states that Plausible Analytics is active. No analytics integration exists in this
  repository. #95 owns the correction. #91 must not cite that page as a factual source and must not
  add analytics of any kind.
- `proxy.ts` guards a `/bill` route that no longer exists (section 8.6).

**Risks**

- *Next changes how file-convention images populate `twitter:image`.* Acceptance criterion 10
  asserts the rendered tag, so a future Next upgrade fails loudly rather than silently shipping a
  small card. The fix is section 7.10's explicit `twitter-image.tsx`.
- *`metadataBase` and deployment host disagree.* If canonicals ever render against the pod host
  instead of `https://clean.dev`, check 14.3.4 catches it before the sitemap is submitted.
- *Font files drift.* If someone replaces the committed static fonts with variable versions, satori
  renders a wrong weight silently. The manual image review at three sizes is the only guard; keep it
  in the release checklist for any change to `opengraph-image.tsx`.
- *`projects.ts` gains a 21st engagement.* The `/work` description and the image's second proof cell
  both hard-code `20`. Both are listed in section 12.2 so that change is a one-line edit in two
  places, but nothing enforces it automatically. Accepted: a runtime-computed description would trade
  a rare manual edit for a permanently brittle test.
- *Cookie-locale indexing.* Only the English site is discoverable. This is a known, accepted
  limitation of the current architecture, not a defect introduced by #91. Revisit it with a
  locale-routing decision, not inside this issue.

**Follow-ups, explicitly out of scope**

- Locale-prefixed routes and valid `hreflang`.
- Per-article social images.
- Refreshing `DESIGN_SYSTEM.md` for the `--site-*` public palette.
- Removing the stale `/bill` entry from `proxy.ts`.

---

## 16. Approval record

Issue #105 requires Martin's approval of the consequential copy, route policy, social-image
direction, and structured-data model before #91 returns to Ready.

Three forks were put to Martin in the #105 session on 25 August 2026 and decided there:

| # | Fork | Decision | Where it applies |
| --- | --- | --- | --- |
| 1 | How much of the imprint address the `ProfessionalService` graph publishes | **City and country only**, with `areaServed` covering DE/AT/CH. The street address stays in the HTML imprint and out of structured data | Section 10.5 |
| 2 | Whether the shared social image includes Martin's portrait | **Typographic only.** A portrait would push the proof-strip labels below legibility at LinkedIn's render width | Section 7 |
| 3 | Homepage `<title>` length | **Full, 80 characters**, carrying name, both roles, Munich, and remote DACH, accepting SERP truncation of the location tail | Section 5.1 |

After PR #107 merged, an independent Opus review identified the schema.org property correction and
two decisions requiring Martin's judgment. Martin approved the safe-area correction and the narrow
`home.profileCard.meta1` EN/DE copy scope waiver; the property placement follows schema.org's domain
model as recorded in section 10.5. A subsequent Opus review of PR #108 found the remaining band-rhythm
defect. The 0/32/32 px cell-left-padding, 33/32 px post-divider gutters, and 63 px right margin are
the Opus-directed implementation refinement required to realise the approved safe-area and rhythm
intent, not a separate Martin approval. The optional brand-line polish was not approved and remains
out of scope. Martin's approvals are the scope waiver for the image, message-catalog, rendered-copy,
and specification edits in the correction commits.

Everything else in this document is a design decision taken under the authority of #105. The
remaining points most worth an explicit yes or no before implementation starts:

1. **Making `/docs-editor` and `/workflow-simulator` non-indexable** (section 8.5). Both are public
   today. They are lab demos rather than commercial content, and #87 forbids thin destinations, but
   this does remove two indexable pages from the site.
2. **Replacing the `/blog` description**, which currently promises essays on "agile transformation"
   (section 5.4). The new wording keeps Agile out of the primary offer, consistent with #87.
3. **Committing three font binaries** to `apps/web/src/app/_fonts/` (section 7.8), against the
   alternative of fetching them from Google at build time.
