# Direction D: Drawn, builder notes

The specimen is `index.html` and `styles.css`, with no JavaScript and no build step. The figure SVGs were generated once by a throwaway script, because 48 hand-jittered squares and two hand-drawn loops are easier to compute than to type. The output is plain inline SVG in `index.html`, and nothing on the page depends on the script.

## 1. What I took from A, B and C, and what I changed

**From B (backbone)**
- Kept: the palette, unchanged (paper `#fbf9f4`, ink `#1d1f22`, secondary ink `#4b4f55`, figure grid `#ece8de`, signal `#c43d00`). Also kept: the ruled title block built from CSS grid gaps, with the nav row as a subgrid so its rules continue the columns above; sheets with a 1px top edge; the gridded figure area with paper knockouts behind SVG text; two SVGs per figure (one shown at a time); the ruled table style; the ruled footer; the font loading and repo fallbacks.
- **Fixed the 330px mobile header.** Below 56rem the title block becomes two rows: project and navigation, then one compact mono line. It measures 113.7px at 360 (section 3).
- **Fixed the two numbering schemes.** The nav has no sheet numbers ("Sht 2" and so on are gone). The sheet value is "Home", not "Home, 1 of 5". The revision table has no 01 to 03 counters. The only numbers on the page are the section numbers 01 to 04 and the figure numbers.
- **Fixed mono overuse.** These moved from mono to sans: the status line, table data cells, the figure caption label, the colophon, the table caption, the "Progression" title and the drawing note. Mono is left in these places only: the title block, figure labels and measurements inside the SVGs, the "Fig. n" labels, table column headers, the "constraint" tag in table 1, the essay meta line, the work `dt` labels, the live-sentence key, and the section numbers with their margin labels. I count those last two as metadata, see section 7. Uppercase tracking survives only in the wide title-block labels, where it is the drawing convention.
- Dropped: dimension lines, the "not to scale" break symbol, the flow animation, and the 2px outer frame on the title block. Every line is now 1px.
- The margin column is narrower (7rem instead of 11rem). It holds only the number and, where content.md gives one, the section label ("Writing", "Work").

**From A (figure grammar)**
- Kept: a single flow line with an arrowhead, small open circles for stations, open squares for queued work, filled squares for work in progress, small circles for capacity, and a loop around the constraint with a leader to the word "constraint".
- Changed:
  - All strokes are ink. Only the loop, its leader and its label are in the signal color. In A the whole figure was drawn in the pen color.
  - Labels are Plex Sans 600 (names) and Plex Mono (counts and capacities).
  - Squares are grouped in fives so you can count them: columns five wide on wide screens, rows of ten with a gap after the fifth on narrow screens.
  - Each square is drawn as a four-point path with its corners nudged by up to 0.6 units, so the stacks look hand-set without becoming hard to count.
  - The loop is a smooth Catmull-Rom curve, not A's polyline (section 4).

**From C (live sentence)**
- Kept: the markup pattern (`.v.in` for adjustable values, `.v.out` for results), the two-paragraph before/after structure, and the plan for production behavior from C's NOTES (inline controls, `aria-live="polite"` on the result sentence, reduced-motion swap).
- Changed:
  - Adjustable values are `<var>`, which is the semantically correct element for a variable. They are set in ink, weight 600, with a dotted underline, so they cannot be confused with links, which use a solid underline.
  - Results are weight 600 in the signal color and not underlined.
  - The sentence is set in the drawing's sans at a size between body and h1: 24px at 360, 38px from about 1280.
  - Below it sits a one-line mono key: "Key: **5** input, **14** waiting at the constraint." This puts the word "constraint" next to the first use of the color, which teaches the color rule in the opening sentence of the figure (see section 7).

## 2. Contrast

Computed with the WCAG 2.x relative-luminance formula.

| Foreground | Background | Use | Ratio | Needs |
| --- | --- | --- | --- | --- |
| ink `#1d1f22` | paper `#fbf9f4` | body, headings, links, figure lines, squares, stations, table rules | 15.70:1 | 4.5 |
| secondary ink `#4b4f55` | paper | status line, mono labels, capacities in figures, "no understanding", colophon, table headers | 7.83:1 | 4.5 |
| signal `#c43d00` | paper | live-sentence results (24px+ bold), "constraint" in captions and text equivalents, constraint table text (16px), SVG "constraint" labels (14 to 19px) | 4.97:1 | 4.5 |
| signal | paper | hand-drawn loop (1.6px), leader (1.2px), constraint row rules (1px) | 4.97:1 | 3.0 |
| signal | ink | where the loop crosses the ink flow line or ink squares; where the orange row rule meets the ink rules | 3.16:1 | 3.0 |
| focus outline, 2px ink | paper | every link and the skip link. Offset 3px outside, or -4px inside title-block cells, so it always sits on paper | 15.70:1 | 3.0 |
| ink | grid `#ece8de` | worst case if a grid line ran under ink | 13.50:1 | 4.5 |
| secondary ink | grid | same, labels | 6.73:1 | 4.5 |
| signal | grid | same, constraint labels | 4.28:1 | see note |
| grid | paper | decorative grid, carries no meaning | 1.16:1 | none |
| signal | secondary ink | never adjacent as fill and line; they only sit side by side as separate glyphs on paper in the key line | 1.58:1 | not a pair |

Note on the grid: every SVG label has a 5px paper knockout (`paint-order: stroke`), so grid lines stop short of the text and every label sits on paper. The 4.28:1 case never appears on screen. HTML text never sits on the grid.

## 3. The title block at 360px

**Measured height: 113.7px at 360**, with Plex loaded (112.7px with Google Fonts blocked). At 768 it is 95.5px, and above 56rem it is 124.1px. No horizontal scroll at 360, 768, 1280 or 1920 (`scrollWidth == innerWidth`).

How it collapses:
- **Row one:** a two-cell ruled row.
  - Left cell: "clean.dev" in Plex Mono 600 at 16px, linking home. Its "Project" label is visually hidden, because the name needs no label at this size.
  - Right cell: Writing, Work, Lab, Contact in Plex Sans at 15px, right-aligned. Each link is 40px tall with a full-height hit area.
- **Row two:** one mono line at 14px that reads "Home · rev. working · 2026-10-14 · drawn by Martin Trenker with a coding agent · EN / DE".
  - The same `.tb-cell` elements that form the wide title block switch to `display: inline`.
  - The "Sheet", "Date" and "Lang." labels become visually hidden, so screen readers still hear them. "Rev." and "Drawn by" stay visible and are lowercased by CSS.
  - The separators come from `::before { content: "\a0· " / "" }`. They are silent to screen readers, and the non-breaking space keeps a "·" from starting a line.
  - I removed the whitespace between the cells in the source, so each separator is the only gap.
- Nothing is hidden. EN / DE stays as two links, with EN marked `aria-current`.

At 360 the line wraps twice, not once (see section 7). On wide screens the cells return to the ruled grid. `.tb-meta` becomes `display: contents`, and the nav row is a subgrid under Sheet, Rev., Date and Drawn by, with "Lang." spanning both rows.

## 4. Figure grammar and reflow

**Grammar.** The same conventions apply in both figures and in both orientations.

| Mark | Meaning |
| --- | --- |
| Straight 1.25px ink line, open chevron arrowhead | the flow (ruled, not freehand) |
| 5-unit open circle on the line | a station |
| Sans 600 label | the station name |
| Mono label in secondary ink | the capacity |
| 10-unit open square | one queued item |
| Filled square | one item in progress |
| 3.5-unit open circle, on the opposite side of the line from the queue | one unit of capacity: 1 product owner, 5 developers, 1 senior reviewer, the 3 worktree agents, Martin |
| Mono count above each stack | the number of squares ("48", "12", "9 in progress", "14", "0"). The squares are the measurement; the numeral confirms it. |
| Signal loop with a curved leader to the mono word "constraint" | the constraint. Nothing else in a figure is colored. |

The station names, including "Review" and "review by Martin", stay ink.

**The loop.** Each loop is a parametric ellipse sampled at 31 points and drawn as a smooth cubic path:
- the radius wobbles with three low-amplitude sine terms;
- the sweep is one full turn plus about 30 degrees;
- the radius drifts outward by 8% over the stroke.

The end therefore passes outside the start and leaves a short overlapping tail, the way a pen loop actually closes. Each loop has its own seed, so no two are identical. The stroke is 1.6px with round caps, and `vector-effect: non-scaling-stroke` keeps it between 1px and 1.5px plus in every size, so it never thickens into a CSS-like ring at 1920.

**Figure 1** ("Where the work waits"):
- Wide (viewBox 960 by 330, shown from 64rem): five stations left to right. Queues stack upward in columns five wide, so Ideas is a 10-row tower of 48 and Review is 14 squares in three rows. All 48 Ideas squares are drawn.
- Narrow (viewBox 328 by 514, drawn 1:1 for a 360 screen and capped at 25rem): the flow line runs down the left at x=28. Each station's name and count share a line, the capacity text sits below, and the squares follow in rows of ten with a gap after five. Capacity circles stack on the left of the line, which is the "below" side once the drawing is rotated. The loop becomes a wide ellipse around Review, its capacity circle, its label and its 14 squares, with "constraint" lower right.

**Figure 2** ("Two ways to work with agents"):
- Wide (viewBox 960 by 500): two rows.
  - Fleet: Large plan, split into tasks (four open squares), then the line fans into four lanes (agents in separate workspaces, one filled square and one station per lane). The lanes rejoin at code appears and continue to dashboard. The line then stops at a plain tick with no arrowhead, labelled "no understanding" in secondary-ink mono. Fleet has no loop.
  - Now: Issue, one small task (one open square), worktree (one filled square, three capacity circles, and "orchestrator / implementer / reviewer" in mono), pull request, review by Martin (one open square waiting, one capacity circle, the loop), merge, with an arrowhead.
  - The contrast between the rows is drawn, not written: four parallel lanes against one square at a time.
- Narrow (viewBox 328 by 892): the same two sequences stacked vertically. The fleet lanes fan to the right of the main line and the names move right of the lanes.
- On wide screens, Figure 2 leaves the essay column by a negative margin equal to the margin column plus the gap. Both figures therefore use the same figure-area width, and the same 64rem breakpoint keeps every label at 14px or more.

**Narrow reflow.** The wide drawing is never scaled down. Below 64rem the vertical SVG is shown and the wide one is `display: none`, which also removes it from the accessibility tree. A script checked every rendered text node at 360, 768, 1280 and 1920, scaling SVG text by its rendered viewBox ratio. The smallest text anywhere on the page is 14.0px.

**Accessibility of the figures:**
- Each figure is a `<figure>` with a `<figcaption>` that starts with a mono "Fig. n".
- Each SVG has `role="img"`, a `<title>`, and `aria-describedby` pointing at the visible text equivalent paragraph below the figure.
- Each figure has a real `<table>` with `<caption>`, `th scope="col"` and `th scope="row"`.
- Table 1 marks the Review row in signal, with signal rules and a mono "constraint" tag. Table 2 puts "review by Martin" in signal under a "Constraint" column header.
- Wherever the color appears, the word "constraint" appears beside it.

## 5. Self-critique

**Usefulness.**
- What works:
  - At 360 the header costs 114px, so the status line and most of the h1 are in the first screen. The nav sits in the first row with 40px targets.
  - The live sentence states the thesis as arithmetic before the drawing asks for any effort.
  - The CTA is a plain link at 20px, findable but easy to pass over, as in A and C.
- Weaknesses:
  - Figure 1 now says the same thing five times (sentence, drawing, caption, text equivalent, table). Each is there for a different reader, but a sighted skimmer meets real repetition.
  - The live sentence is static, so the dotted underlines promise interaction that does not exist yet (C's false affordance, inherited on purpose).

**Emotional fit.**
- What works: at 1280 and 1920 it reads as a calm working drawing. There is one ink, ruled cells and countable marks, and color appears only where something waits. The dry humor comes from conventions ("rev. working", "drawn by Martin Trenker with a coding agent", "no understanding" at the end of a line that just stops), not from jokes. Nothing glows, and there are no tiles or dots. The hand-drawn loop is the one warm, human mark, and it lands where it should.
- Risk: the compact mono line in the narrow header still looks a little "developer" at first glance.

**Pacing and emphasis at thumbnail scale.**
- 1280 and 1920 follow the brief's sequence:
  - peak: h1 block, then the live sentence with its two orange numbers above the widest gridded area;
  - rest: the essay column;
  - smaller peak: Figure 2 with the large italic pull quote;
  - rest: two denser ruled tables for work;
  - the framed footer echoing the title block.
- Weaknesses:
  - Figure 2's drawing is taller than Figure 1's (500 against 330 units), so it is "smaller" only because Figure 1 has the live sentence and table around it.
  - At 1920 the prose sections leave the right 40% of the sheet empty. That is correct for reading, but makes the page look left-heavy.
  - At 360, Figure 2 runs a little over one screen tall.

**Coherence and resilience.**
- Coherence: one surface, one ink, one signal, 1px rules, square geometry, two type families, and one figure grammar used twice.
- Resilience results:
  - Webfonts blocked: Source Sans 3 and DejaVu Sans Mono take over, the header is 112.7px at 360, and nothing overflows.
  - Page zoom 200% (1280 at 640 CSS px): no horizontal scroll.
  - Root font size forced to 200% at 360, 640 and 1280: no overflow. This simulates text-only zoom where breakpoints do not follow, so it is the worst case. Fixing it took `overflow-wrap` on table cells, title-block cells and headings.
  - Every link shows a 2px ink outline when tabbed (checked in Chromium).
  - The page has no animation. A `prefers-reduced-motion: reduce` guard is in place for anything added later.
- Weak spot: SVG label sizes are in CSS px, so Firefox's text-only zoom will not enlarge them. The table and text equivalent beside each drawing do enlarge and carry the same facts.

## 6. Removal test

**It passes, more clearly than B did.**
- Remove "clean.dev", Martin, Douglas and the nouns, and what remains is:
  - a ruled title block saying a revision is in progress;
  - numbered sheets;
  - a large sentence whose numbers are marked either as inputs or in one warning color;
  - two drawings in the same hand: a line of stations, work you can count square by square, and one place circled in orange by hand with the word "constraint";
  - one of those drawings showing a line that fans out and then just stops.
- That reads as "a working drawing of how work flows, made in the open, by someone who marks where it waits". It does not read as a dashboard: there are no tiles, dots or live-looking numbers, and the only color is a correction mark.
- It is not a generic developer blog either, because the mark recurs: the essay section now has its own figure. B's main weakness was that its essay section was plain prose.

Where it still fails:
- The work section and footer, taken alone, are a tidy ruled document that any careful engineer could have made.
- An essay page with no figure would keep only the title block and the sheet structure.

The identity depends on drawings appearing regularly in the writing. That is a content commitment, not only a design one.

## 7. Disagreements with the brief and deviations

- **"Row two may wrap once."** This is not achievable at 360 with mono at 14px or larger and nothing hidden.
  - The line is 88 characters including EN / DE, and Plex Mono at 14px fits about 37 per line in the framed header.
  - Without EN / DE it is 78 characters, still more than two lines. Row one has no room for the language switch, because the nav already uses about 315 of 326px.
  - The line therefore wraps twice. The height target holds: 113.7px, under the roughly 120px budget.
- **The live sentence alone does not contain the word "constraint".** The hard rule says the word appears wherever the color does, so I added a mono key line under the sentence: "Key: 5 input, 14 waiting at the constraint." This is added copy, kept to a statement of the notation. It is also one of the two decisions I am least sure about: it is honest, but it explains a mark that a good drawing should make obvious.
- **Margin labels.** Sections 01 and 02 show only their number. The only labels used are the ones content.md provides ("Writing", "Work"), and "Fig. 1" lives in the figure's caption rather than being repeated in the margin. The cost is that the first two margins look sparse.
- **Mono for section numbers and margin labels.** The brief lists mono for "title block, figure labels and measurements, table headers and metadata lines". I read a sheet number as metadata and set it in mono. Moving it to sans would also be defensible.
- **Figure 2 draws counts the essay does not state.** The four fleet lanes and four task squares are a drawing of "split into tasks", not a claim that there were four. The Now row's single squares do come from the text ("one small task"). The table and text equivalent state no lane count. This is the second decision I am least sure about: a careful reader might count the lanes and take the number as fact.
- **Count numerals kept on Figure 1.** The brief drops B's dimension lines and says the squares are the measurement. I kept a small mono count above each stack (as A did), because "9 in progress" and "0" cannot be shown by squares alone, and 48 squares take time to count.
- **Narrow rotation is not literal.** A strict 90-degree rotation would draw queues as five-row blocks growing sideways. I used rows of ten, grouped in fives, because that is shorter and still countable. Capacity circles do follow the rotation and sit on the left of the line.
- **Added labels** (all minimal):
  - "Fig. 1", "Fig. 2";
  - the title-block labels Project, Sheet, Rev., Date, Drawn by, Lang.;
  - section numbers 01 to 04;
  - "Key:" plus "input" and "waiting at the constraint";
  - in Figure 2: "Fleet" and "Now" (from content.md) and "no understanding" (from content.md);
  - table 2 headers "Workflow", "Stations", "Constraint" and the cell "none marked" (from "No station is marked as the constraint");
  - the revision table's "Role" and "Description" headers and "Progression" caption (from content.md);
  - the "constraint" tag in table 1;
  - the visually hidden "Skip to content" link.
  - The value "20" in the live sentence comes from BRIEF.md, not content.md.
- **"No gradient."** The figure grid uses `repeating-linear-gradient` to draw 1px lines, as B did. Nothing looks graded.
- **Title block frame is 1px**, not B's 2px. The brief says 1px lines, and the title block reads as a title block without the heavier frame.
- **DE** is a plain link to `/de/`, which does not exist in the specimen, as instructed. The live sentence is static, as instructed. Its production behavior is described in C's NOTES and applies here unchanged.

## 8. Changes after Martin's review (2026-10-14)

- Removed the "Key:" line under the live sentence. The word "constraint" already appears in the caption, the table and the figure, so the color rule holds without an explanatory key.
- Added three small dots beyond the outermost fleet lane in both orientations, so the lanes read as "some" rather than a claim of exactly four agents, which the essay never makes.
- Kept the count numerals above the stacks, as the builder argued.
