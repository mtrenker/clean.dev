# Direction D: Drawn

This direction is the pruned result of A, B and C. It takes Schematic (B) as the backbone, replaces its box diagram with Margin's (A) pen-drawn figure grammar, and adopts Letter's (C) live sentence as the text-first interactive pattern. Read the three sibling BRIEF.md and NOTES.md files first; reuse code from B and A where it fits, and fix what their builders flagged.

## Thesis
clean.dev should feel like a working drawing of a delivery system, made in the open by a senior engineer and a coding agent: exact, candid, quietly playful, never a dashboard and never a costume. The reader is an engineer who respects a good drawing and distrusts decoration.

## Emotional target
Capable, clear, honest. Playfulness lives in precision and in a few dry labels, never in cuteness. Must not feel like a SaaS dashboard, a dark hacker theme, a "we are technical" startup page, or engineer cosplay (mono everywhere, fake instrument panels).

## Center and intensity
Reading first, exploration second. Expression is spent only where a system is shown behaving: the figures and the live sentence. Prose, navigation, work history and footer stay calm.

## Constructive grammar
- Surface: light drafting paper, one color, close to white with a hint of warmth (B used #fbf9f4). A faint grid appears only inside figure areas.
- Color: graphite ink for everything, plus exactly one signal color that means "this is where the system waits". It appears only on the constraint: the loop around it in a figure, the word "constraint", the constraint row in a table, and the result values in the live sentence. B's safety orange #c43d00 is the starting point; keep or adjust and record the contrast. No other color anywhere; links are underlined ink.
- Type: IBM Plex Sans for all reading text, headings, captions and section labels. IBM Plex Mono only for the title block, figure labels and measurements, table headers and metadata lines. Never for body paragraphs, never for section titles. Body measure 60 to 72 characters.
- Space and density: calmer than B. Sections are sheets with a 1px top edge, a number and a title, but the margin column holds only the number and a short label, nothing else.
- Geometry: square, 1px lines, no radius, no shadows, no fills except the signal color where the rule allows.
- Imagery: figures drawn in the pen grammar from A, in ink, inside B's gridded figure area. See "Figure grammar".
- Motion: none required. Optional subtle flow on arrows, off under prefers-reduced-motion.
- Voice: first person, precise, plain.

## Figure grammar (the core of the design system)
Every figure follows the same conventions so a reader learns them once:
- Work flows along a single line with an arrowhead, left to right on wide screens, top to bottom on narrow screens (two SVGs, one shown at a time, as A and B did).
- Stations sit on the line as small open circles with their name below in sans and their capacity in mono.
- Queued work is drawn as individual small squares stacked above the station, so the count is literally countable; work in progress is drawn as filled squares. Ideas (48) may be drawn in full; it is the point.
- Capacity is drawn as small open circles below the line (5 developers = 5 circles).
- The constraint is marked by a hand-drawn loop in the signal color around its station, with a leader line to the word "constraint" in mono. Nothing else in the figure is colored.
- Dimension lines from B are dropped. The squares are the measurement. A single mono "Fig. n" label and a drawn-by-hand feel (1px to 1.5px strokes, slight irregularity in the loop) are the signature.
- Each figure has a visible text equivalent and a real table.

## The live sentence (the text-first interactive pattern)
Figure 1 is introduced by the live sentence, placed before the drawing, set large (bigger than body, smaller than the h1) in sans:
"A team of 5 developers and 1 reviewer has 14 changes waiting for review. Add 2 developers and 20 changes wait."
- Adjustable values (5, 1, 2) are ink, bold, underlined with a dotted underline: they are controls in production. In this static specimen they are plain spans styled that way, nothing happens.
- Result values (14, 20) are bold and in the signal color: they are the constraint. This teaches the color rule in the first sentence.
- The drawing, caption, text equivalent and table follow. The drawing shows the "before" state.

## Signature
1. The title block header, reduced. On wide screens: PROJECT clean.dev, SHEET Home, REV. working, DATE, DRAWN BY "Martin Trenker with a coding agent", LANG EN / DE, with navigation as plain names in a second row (no sheet numbers; the numbering scheme on a page is sections only). On narrow screens it must collapse to at most two rows of roughly 120px total: row one is project and navigation, row two is one compact mono line "Home · rev. working · 2026-10-14 · drawn by Martin Trenker with a coding agent" that may wrap once. Nothing is hidden.
2. The figure grammar above, recurring: Figure 1 in the intro section, Figure 2 in the essay section, drawn from content.md.
3. Color means constraint, everywhere, including the live sentence.

Memory hook: the loop around the constraint.

## Pacing
Thumbnail test: peak (h1 and Figure 1 with the live sentence), rest (essay prose), smaller peak (Figure 2 with the pull quote as caption), rest (work as a revision table), footer. The essay section must not contain the pull quote twice.

## Prohibitions
- No dark theme, no glow, no gradient, no full-page grid, no cards, no pill badges, no icon set, no status dots, no KPI tiles.
- No mono body text or mono section titles.
- No second color. If something "needs" a color and is not the constraint, it does not get one.
- No decorative labels. Every mono label must state a fact (a figure number, a date, a count, a revision).

## Removal test
With the name and nouns gone, the page should still read as "a working drawing of how work flows, made in the open, by someone who marks where it waits". If it reads as "dashboard" or "developer blog", the direction has failed and NOTES.md should say so.
