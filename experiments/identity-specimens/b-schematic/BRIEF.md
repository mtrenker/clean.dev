# Direction B: Schematic

## Thesis
This should feel like a technical drawing of a delivery system pinned to the wall of a workshop: exact, legible, quietly playful, never a dashboard and never a dark "hacker" theme. Martin sees organizations as plants to be tuned, and the reader is an engineer who respects a good drawing.

## Emotional target
Capable, clear, playful through precision. Must not feel like a SaaS dashboard, a startup "we are technical" site, or the existing clean.dev lab route (dark slate, glowing accents).

## Center and intensity
Exploration and reading, in that order. Expression lives in schematics, dimension lines and labels. Prose stays calm and plain.

## Constructive grammar
- Surface: light drafting paper. One surface color, close to white with a hint of warmth. A faint grid may appear only inside figure areas, never as full-page wallpaper.
- Color: graphite ink for text and lines, plus exactly one signal color used only for the constraint (the bottleneck) wherever it appears: in the figure, in the table row, in any inline reference to it. Candidates: safety orange, drafting blue. State the choice and reason in NOTES.md. No other color anywhere, including links (links are underlined ink).
- Type: IBM Plex Sans for body and headings, IBM Plex Mono for labels, dimensions, metadata and the title block. Both open licensed; load them, do not assume. Body measure 60 to 75 characters. Hierarchy through numbered sections (01, 02, 03) and size steps, with weight used sparingly.
- Space and density: denser than a book, looser than a dashboard. Sections are sheets: each has a number, a title and clear top edge.
- Geometry: square. 1px lines, no radius, no shadows, no fills except the signal color on the constraint.
- Imagery: SVG schematics drawn with drafting conventions: boxes for stations, arrows for flow, dimension lines with the queue counts as measurements, leader lines for labels. Labels in mono. The figure must have an accessible text equivalent and a proper table.
- Motion: the figure may show a very subtle flow animation (for example dashes moving along the arrows) that is off under prefers-reduced-motion and never required for understanding. Default static is acceptable.
- Voice: first person, precise, dry humor allowed in labels (for example a revision note in the title block).

## Signature
1. The title block. The page header is laid out like the title block of an engineering drawing: project (clean.dev), sheet (Home), revision (an honest value, for example "rev. working"), date, drawn by (Martin Trenker with a coding agent), and the navigation as sheet references. It must stay usable as a real header on narrow screens.
2. Dimension lines on figures, carrying the real queue counts.
3. The one signal color appearing only on the constraint, so the eye learns that color means "this is where the system waits".

Memory hook: the title block.

## Prohibitions
- No dark theme, no glow, no gradient, no full-page grid, no cards, no pill badges, no icon set.
- No status dots, sparklines, KPI tiles or anything that reads as a dashboard.
- Mono type is for labels and measurements, never for body paragraphs.

## Removal test
If the name and nouns vanished, the page should still read as "a drawing of how work flows, made by someone who measures queues". If it reads as "developer dashboard", the direction has failed and NOTES.md should say so.
