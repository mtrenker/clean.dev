# Martin's email signature

## Settled direction

This signature should feel direct, precise, and personal, never promotional. It is a fixed-ink identity block that makes the relationship between Martin's sending address and public practice immediately legible: `martin@pacabytes.io` is the mail address; `clean.dev` is the website and brand.

## Constitution

- Use a compact two-column table: a typographic `/` mark in a bordered rail, then four content lines.
- Use the print-like clean.dev palette: ink `#1a1714`, secondary ink `#454039`, muted ink `#6f695c`, rust `#a8472a`, and a decorative rule `#a8a395`.
- Use no background color, images, remote assets, web fonts, pitch, tagline, social icons, phone number, or confidentiality boilerplate.
- Keep links recognizable without relying on color alone. `clean.dev` is underlined; the mail address is explicitly labelled `MAIL /`.
- Treat Outlook's loss of rounded corners and letter spacing, and dark-mode hue inversion, as acceptable cosmetic degradation.
- Keep the default signature to four lines. Additional LinkedIn and legal rows are opt-in variants.

## Default copy

```text
Martin Trenker
Technical Lead and Solutions Architect
clean.dev · Munich and remote DACH
MAIL / martin@pacabytes.io
```

Plain-text companion:

```text
Martin Trenker
Technical Lead and Solutions Architect
clean.dev | Munich and remote DACH
mail / martin@pacabytes.io
```

## Implementation constraints

- Email markup uses presentation tables and inline styles only.
- No `<style>`, classes, media queries, images, SVG, CSS variables, background colors, layout CSS, or conditional comments inside copied signatures.
- Sans stack starts with `'Segoe UI'`; mono falls back through Consolas and Menlo.
- Sized cells duplicate HTML width/height attributes and inline CSS.
- Spacer cells use a height attribute, inline height, zero type metrics, and `&nbsp;`.
- Every line height includes `mso-line-height-rule:exactly`.
- Anchor colors are repeated on an inner span to resist client auto-recoloring.
- The local preview and clipboard output derive from the same `<template>` nodes.

## Acceptance criteria

- The default copied HTML is at most 3,500 characters and contains no network request.
- It remains useful with colors, borders, radius, and letter spacing removed.
- At 320 px it creates no horizontal overflow.
- All meaningful text passes WCAG AA against white before client-side dark-mode transforms.
- Blocked remote content changes nothing.
- Real-message checks cover Proton or the actual sending client, Gmail web, Outlook, Apple Mail, and at least one mobile dark-mode client.
- The From-domain mismatch is resolved within one line of the `clean.dev` link.

The implementation tool is [`index.html`](./index.html). Open it locally to preview, copy, and verify each variant.
