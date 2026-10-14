# Direction B: Schematic, builder notes

## 1. Typeface and signal color

**Type.** IBM Plex Sans (400, 400 italic, 600) for headings and body; IBM Plex Mono 400 for labels, metadata, dimensions and table values; Plex Mono 600 for the few heavy marks (project name, sheet numbers, dimension values, the CONSTRAINT callout, revision numbers). Plex was drawn for an engineering company and its mono and sans share proportions, so the labels and the prose look like one drawing set rather than "code font next to text font". Mono never sets a paragraph. Plex Sans and Mono load from Google Fonts (marked temporary in `index.html`). The repo copy of Plex Mono SemiBold is registered as a separate family (`IBM Plex Mono Repo`) and only backs up the 600 weight; sharing the name made it replace the 400 weight when the webfont failed. Source Sans 3 from the repo is the named fallback for Plex Sans. I rendered the page with Google Fonts blocked: the hierarchy holds, the headings get a bit narrower, and the mono falls back to DejaVu Sans Mono.

**Signal color: safety orange, `#c43d00`.** I chose orange over drafting blue for three reasons. Blue is the convention for links and would compete with ink-underlined links. Blue also reads as calm "information", while orange is the convention for hazards and stoppages, which is what a constraint is. Finally, orange stays distinct from graphite in greyscale and for the common red-green deficiencies (it shifts toward a dark yellow-brown, still clearly not ink). I darkened it from a true safety orange so the same single value passes 4.5:1 as text. That keeps "exactly one signal color" literally true instead of needing one orange for lines and another for text.

Palette: paper `#fbf9f4`, ink `#1d1f22`, secondary ink `#4b4f55` (same hue family, used for labels), figure grid `#ece8de` (decorative, figure area only), signal `#c43d00`.

## 2. Contrast table

Computed with the WCAG 2.x relative-luminance formula.

| Foreground | Background | Use | Ratio | Requirement |
| --- | --- | --- | --- | --- |
| ink `#1d1f22` | paper `#fbf9f4` | body, headings, links, lines, title-block rules | 15.70:1 | 4.5 |
| secondary ink `#4b4f55` | paper | mono labels, meta, capacity labels, caption label | 7.83:1 | 4.5 |
| signal `#c43d00` | paper | constraint text (table row, inline refs, SVG labels) | 4.97:1 | 4.5 |
| signal `#c43d00` | paper | constraint box, dimension line, arrow, table row rules (graphics) | 4.97:1 | 3.0 |
| signal `#c43d00` | ink `#1d1f22` | where the orange table rule meets the ink rules | 3.16:1 | 3.0 |
| ink | grid `#ece8de` | worst case if a grid line ran under ink text | 13.50:1 | 4.5 |
| secondary ink | grid | same, labels | 6.73:1 | 4.5 |
| signal | grid | same, constraint labels | 4.28:1 | see note |
| focus outline (ink, 2px, 3px offset) | paper | every link and the skip link | 15.70:1 | 3.0 |
| grid `#ece8de` | paper | decorative grid, carries no meaning | 1.16:1 | none |

Note on the grid: all SVG text has a 5px paper knockout (`paint-order: stroke`), so grid lines stop short of every label and the text always sits on paper. The 4.28:1 case does not occur on screen. HTML text never sits on the grid; the caption, table and text equivalent sit outside the gridded area.

## 3. How the signature moves are implemented

**Title block.** The `<header>` is a CSS grid whose 1px gaps show the ink background, so the internal rules are real hairlines with no borders to double up. A 2px outer frame matches the heavier border of a drawing's title block. Cells: PROJECT (clean.dev, Plex Mono 600, links home), SHEET (Home, 1 of 5), REV. (working), DATE (2026-10-14), DRAWN BY (Martin Trenker with a coding agent), LANG. (EN / DE, DE non-functional). The navigation is the second row. Each link is a sheet reference ("SHT 2 / Writing" … "SHT 5 / Contact"). The "SHT n" part is `aria-hidden` so screen readers hear only the link name. On wide screens the nav row is a nested CSS subgrid, so its column lines continue the rules of the row above, as on a ruled title block. Reflow:
- above 56rem: two rows, project cell spanning both;
- 30–56rem: project + lang / four nav cells / sheet, rev, date / drawn by;
- below 30rem (360px): a two-column block: project + lang, nav as a 2×2 grid of cells (each at least 44px tall, full-cell hit area), then sheet + rev, date + drawn by. No content is hidden; it stays a usable header. The cost is height: about 330px at 360px.

**Dimension lines.** Each station gets a dimension line measuring its queue: witness (extension) lines at both ends, architectural slash ticks instead of arrowheads, and the count as the dimension value (Plex Mono 600) with its unit underneath ("waiting", or "in progress" for Development). The lengths are to scale (10 units per item wide, 8 per item narrow), except Ideas (48), which uses the drafting break symbol (a zigzag) and is labelled "not to scale" so it does not dominate the drawing. Release is a zero-length dimension, a single tick with "0". A drawing note states the convention: "Dimensions: queue length per station. Ideas not to scale."

**Two drawings, not one scaled drawing.** The wide SVG (horizontal flow, viewBox 1120 wide) shows only from 68.75rem, where its smallest label still renders at about 14.3px. Below that, a separate vertical-flow SVG (viewBox 328 wide, drawn 1:1 for a 360px screen) takes over: stations stack, flow arrows point down, dimension lines run horizontally to the right. At 768px it is capped at 26rem and centred. Only one SVG is displayed at a time (`display: none` also removes the other from the accessibility tree). Both have `role="img"`, a `<title>`, and `aria-describedby` pointing to the visible text equivalent. A script check of every rendered text node at all four widths found nothing under 14px, SVG labels included.

**Single signal color.** Orange appears only on the constraint: the Review box (3px stroke), its incoming arrow, its dimension line and value, the CONSTRAINT callout with leader line, the Review row in the table (2px orange rules above and below plus orange text), and every inline mention of Review or review capacity in the caption and text equivalent. It is never the only carrier of meaning. The drawing says "CONSTRAINT" in words, the table row carries a "constraint" tag in the station header cell, and a "Constraint: Review" line sits above the text equivalent. Links stay ink and underlined. Orange text is not underlined, so it cannot be mistaken for a link.

**Motion.** Small paper-coloured gaps travel along the flow arrows (3 units visible every 44 units, 2.4s). They only render inside `@media (prefers-reduced-motion: no-preference)`. Otherwise the overlay is `display: none` and the drawing is complete and static. No JavaScript is used.

**Sections as sheets.** Each section has a 1px top edge, a margin column with a two-digit sheet number (01–04) in Plex Mono 600 and a mono label (the status line for 01, "Fig. 1", "Writing", "Work"). The work progression is drawn as a revision table: a ruled `<ol>` with 01–03 counters, as on a drawing's revision block.

**Rhythm.** The h1 is the first peak. 02 is the main peak: the only bordered, gridded, full-width area, with the only color, set off by more space above it. 03 is the long rest: one 68ch column, no rules except a 2px rule above the pull quote. 04 is a mid-density spec sheet (definition rows and a revision table). The footer closes with a smaller ruled block that echoes the title block.

**Added labels (not in content.md), kept minimal:** Project, Sheet "Home, 1 of 5", Rev. "working", Date, Drawn by, Lang., "Sht 2–5", section numbers 01–04, "Fig. 1", "waiting" / "in progress" units in the drawing, "not to scale", the drawing note, "Progression", and the uppercase "constraint" tag. "Constraint", "Period", "Role" and "Mandate" come from content.md.

## 4. Self-critique

**Usefulness.** You can reach the nav and the contact link straight away. The figure says what it claims, with a table and a text equivalent. Weakness: at 360px the title block takes about 330px before the h1, so most of the first screen is metadata. Readers who care about drawings will forgive it. A recruiter skimming on a phone might not.

**Emotional fit.** At 1280 and 1920 it reads as a calm drawing sheet, not a dashboard. Nothing glows, there are no tiles and no dots, and the only color marks a problem. The dry humour comes from the conventions ("rev. working", the Ideas break symbol with "not to scale") rather than from jokes. Risk: the mono-heavy title block can still suggest "developer site" at a glance. The drawing is what tips it toward "workshop".

**Pacing at thumbnail scale.** In the full-page captures there are two clear peaks: the h1 block and the gridded figure with its single orange box. Then come the long quiet essay column and the denser ruled work sheet. Sections do not look identical. At 360 the figure is less of a peak because the vertical drawing is narrow and the grid band is short. The orange still finds the eye.

**Coherence and resilience.** One surface, one ink, one signal, 1px rules and square geometry are used throughout. The page holds with webfonts blocked. Page zoom to 200% reflows into the narrow layouts (equivalent to the 640px and 960px layouts), with no horizontal scroll at 360px (scrollWidth checked). Weak spot: SVG label sizes are in CSS px, so Firefox's text-only zoom will not enlarge them. The table and text equivalent next to the drawing do enlarge and carry all the same information.

## 5. Removal test

Mostly passes, and only because of the figure and the title block. With the name and nouns removed, the top of the page still reads as "a drawing set". Section 02 still reads as "someone measuring where work queues and marking the one place it stops", because the measurement grammar survives: dimension lines, ticks, a break symbol, one orange element. Sections 03 and 04 on their own read as a tidy technical document. They are well set but not specific to clean.dev; any careful engineer's site could look like that. It does not read as a developer dashboard. The direction depends on drawings appearing regularly. A long essay page with no figure would lose most of the identity except the title block.

## 6. Disagreements and things I could not do

- **Section numbers vs sheet numbers.** The brief asks for both a title block with nav as sheet references and numbered sections. Putting "Sht 2 Writing" in the nav and "03 Writing" in the body is a small collision. I kept both and used a different form ("SHT n" vs two digits). A real system should pick one numbering scheme.
- **"No gradient".** The figure grid uses `repeating-linear-gradient` because that is the simplest way to draw 1px CSS lines. Nothing looks graded. I read the prohibition as visual, not syntactic.
- **"Exactly one signal color" vs safety orange.** A true safety orange (around `#ff6a00`) cannot carry text on light paper (under 3:1). I kept one value and darkened it to `#c43d00`. It reads a little more rust than safety orange.
- **The animation** is on by default for users without a reduced-motion preference. It is very subtle. If anyone finds it distracting, the static drawing is already complete and the overlay can be deleted.
- **DE** is a plain link to `/de/`, which does not exist in the specimen, as instructed.
