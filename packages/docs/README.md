# @cleandev/docs

A reusable **[Plate.js](https://platejs.org)** document-writing editor with a
paginated **Page Mode** and a set of generic, PDF-oriented layout elements.

It is a *document* editor, not a CV app: the same building blocks compose
**client reports, proposals/offers, CVs/project profiles, and blog posts**. The
package is self-contained — it ships its own stylesheet and carries no
app-specific routes, data, or business logic, so it survives independently of
any host application.

---

## Features

- **Page Mode / Page Preview** — content composed as paper-like pages with
  consistent, PDF-oriented layout: page size, margins, printable content width,
  paper background, drop shadow, gutter, and optional page-boundary guides.
- **Flow Mode** — a distraction-free, full-width writing surface for drafting.
- **Generic layout elements** that guarantee predictable print output:
  cover/header, document title & subtitle, eyebrow, section, callout/aside,
  two-column block, project/card block, key-value/metadata block, and an
  explicit page break — plus the usual headings, paragraphs, blockquote, rule,
  and marks.
- **Print/PDF-ready** — `@page` rules, `break-before`/`break-inside`
  management, and a print stylesheet that strips chrome for clean "Print → Save
  as PDF" output.
- **Themeable** via CSS custom properties — no Tailwind or app tokens required.
- **Clean public API** — main component, plugins, element render components,
  page/document config, types, authoring helpers, and transform utilities.

---

## Installation

This package lives in the monorepo and is consumed via the workspace:

```jsonc
// package.json
{
  "dependencies": {
    "@cleandev/docs": "workspace:*"
  }
}
```

It builds on Plate; peer/runtime deps (`platejs`, `@platejs/basic-nodes`,
`react`, `react-dom`) are resolved through the workspace.

If you consume the source directly (the default `main` points at `src/`), add it
to your bundler's transpile list. For **Next.js**:

```js
// next.config.js
module.exports = { transpilePackages: ['@cleandev/docs'] };
```

### Fonts (optional but recommended)

The default theme targets Space Grotesk (display), IBM Plex Sans (body), and IBM
Plex Mono (labels). Load them in the host app for the full look — the stacks
degrade gracefully to system fonts otherwise:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

---

## Quick start

```tsx
'use client';
import { DocumentEditor, samples } from '@cleandev/docs';
import '@cleandev/docs/styles.css';

export function Editor() {
  return (
    <DocumentEditor
      value={samples.report}
      mode="page"
      page={{ size: 'A4', margin: { top: 18, right: 18, bottom: 18, left: 18 } }}
      onChange={(value) => console.log(value)}
    />
  );
}
```

Use it as a **page preview** for PDF composition by setting `readOnly`:

```tsx
<DocumentEditor value={doc} mode="page" readOnly />
// then the user runs the browser's Print → Save as PDF
```

---

## Page Mode configuration

Pass a partial `PageConfig` to the `page` prop (physical units are
**millimetres**, so screen preview and print line up at 96dpi):

```ts
interface PageConfig {
  size: 'A4' | 'A5' | 'Letter' | 'Legal' | { width: number; height: number };
  orientation: 'portrait' | 'landscape';
  margin: { top: number; right: number; bottom: number; left: number };
  showPageGuides: boolean; // faint hairline at every page boundary
  gutter: number;          // px gap around the sheet on screen
}
```

Theme tokens are passed to the `theme` prop (`Partial<DocumentTheme>`); each maps
to a `--pdoc-*` CSS variable, so re-theming is a single prop:

```tsx
<DocumentEditor theme={{ accent: '#7c3aed', paper: '#ffffff' }} />
```

> **Print tip:** set the print dialog's paper size to match `page.size`. The
> sheet is sized in real millimetres and `@page { margin: 0 }`, so it maps 1:1.

---

## Layout elements

All element types are **generic** — named for layout/semantic role, never for a
document kind. Build values by hand, from an API/CMS, or with the `b.*` helpers.

| Type (`DocElement`)         | Role                                            |
| --------------------------- | ----------------------------------------------- |
| `Cover`                     | Header band (eyebrow + title + subtitle + meta) |
| `Eyebrow`                   | Kicker / overline label                         |
| `DocTitle` / `DocSubtitle`  | Document title and subtitle                     |
| `Section`                   | Semantic grouping with spacing/rules            |
| `H1` / `H2` / `H3` / `P`    | Headings and paragraphs                         |
| `Blockquote` / `Hr`         | Pull quote, horizontal rule                     |
| `Callout`                   | Aside box (`note`/`info`/`success`/`warning`/`accent`) |
| `Columns` / `Column`        | Multi-column block                              |
| `Card`                      | Project/card block (aside, title, meta, tags)   |
| `KeyValue` / `KeyValueItem` | Metadata / key-value list                       |
| `PageBreak`                 | Explicit page break for print/PDF               |

```ts
import { b } from '@cleandev/docs';

const doc = [
  b.cover([b.eyebrow('Report'), b.docTitle('Q3 Review'), b.docSubtitle('Acme Inc.')]),
  b.section([
    b.h2('Summary'),
    b.callout([b.p('Uptime held at 99.96%.')], { variant: 'success', title: 'Headline' }),
    b.keyValue([b.kv('Availability', '99.96%'), b.kv('Deploys / week', '24')]),
  ]),
  b.pageBreak(),
  b.section([b.h2('Details'), b.p('…')]),
];
```

---

## Extension points

- **Add plugins** — combine your own Plate plugins with the defaults:

  ```ts
  import { createDocumentPlugins } from '@cleandev/docs';
  const plugins = createDocumentPlugins({ extend: [MyImagePlugin, MyTablePlugin] });
  // <DocumentEditor plugins={plugins} />  (or pass extendPlugins={[...]})
  ```

- **Custom elements** — `createPlatePlugin(...).withComponent(...)`, then append
  via `extend`. The shipped element components are exported under `elements.*` if
  you want to wrap or restyle them.

- **Custom toolbar/UI** — build on the exported transform helpers
  (`toggleMark`, `setBlockType`, `insertBlock`, `isMarkActive`, `isBlockType`,
  `currentBlockType`) and Plate's `useEditorRef`. Pass `toolbar={<MyToolbar />}`
  or `toolbar={false}`.

- **Access the editor** — `onReady={(editor) => …}` exposes the Plate editor
  instance (useful for future export integrations).

---

## Public API

```ts
// Components
DocumentEditor, PageCanvas, DocumentToolbar
// Plugins
createDocumentPlugins, basicPlugins, documentLayoutPlugins, <ElementName>Plugin…
// Config
PAGE_SIZES, defaultPageConfig, defaultTheme, resolvePageConfig, resolveTheme,
resolvePageSize, effectiveDimensions, pageCssVariables
// Types
DocElement, DocMark, DocElementType, DocMarkType, CalloutVariant, DocumentValue, …
// Authoring & transforms
b, createEmptyDocument, toggleMark, setBlockType, insertBlock, isMarkActive, …
// Samples (demos/tests only)
samples, sampleProfile, sampleReport, sampleProposal, sampleBlogPost
```

---

## PDF export

Today, high-quality PDF output is produced through the browser's **Print → Save
as PDF** path: the print stylesheet sizes the sheet in real millimetres, sets
`@page { margin: 0 }`, honours explicit page breaks, and applies
`break-inside: avoid` to cards/callouts/rows.

Programmatic export (e.g. headless Chromium, or rendering the document tree with
`@react-pdf/renderer`) is intentionally **not** bundled in this pass. The API is
shaped so it can be added cleanly later:

- elements are modelled generically with explicit layout semantics;
- `onReady` exposes the editor instance;
- `pageCssVariables` / `effectiveDimensions` expose the exact page geometry a
  renderer needs.

---

## Consuming from another app

The package has no dependency on this repo's app, routes, or data. To use it
elsewhere: copy/publish `packages/docs`, install its dependencies, import
`DocumentEditor` and `@cleandev/docs/styles.css`, and (for source consumption)
add it to your bundler's transpile list. Everything else — theming, page config,
elements, and authoring helpers — is part of the public API above.
