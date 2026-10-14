# Direction A: Margin, builder notes

## 1. Typeface and color

**Text serif: Source Serif 4** (Google Fonts, variable, optical size axis). It has a real optical-size axis, so the 50px headline and the 17px body come from the same family without the headline looking like enlarged body text. Its texture is close to a technical book (it descends from Fournier-style text faces), which fits the notebook thesis better than Newsreader (more editorial and magazine-like) or Literata (warmer, more e-reader). Headlines use weight 450 and body 400; the only 600 is the essay subheading and the role names in the work entry. Hierarchy comes from size and space.

Fallback stack: `"Source Serif Pro", Charter, "Bitstream Charter", Georgia, "Times New Roman", serif`. I rendered the page with Google Fonts blocked. On this Linux machine it fell back to a Times metric clone. The layout holds (no overflow, same line breaks in the headline, measure drops to about 70 characters because Times is narrower). It looks more generic but nothing breaks. The Google Fonts `<link>` is commented as temporary.

**Annotation sans: Source Sans 3** from the repo (`apps/web/src/app/_fonts/`, regular and semibold via `@font-face` with a relative path). It is the humanist companion to Source Serif, so notes and body share proportions. There is no sans italic in the repo, so the sans is never italicised.

**Colors** (one surface, no second background anywhere):

| Token | Hex | Use |
| --- | --- | --- |
| paper | `#F3F5F5` | the only surface. Off-white with a slight blue-green cast, not beige. |
| ink | `#1B1E22` | all text, headings, focus ring, table rules |
| ink-soft | `#4E555C` | metadata, capacities, text equivalent. Still ink, only quieter; it is not a second color. |
| pen | `#B23B1E` | margin notes, note markers, figure strokes, link underlines, the constraint loop. Nothing else. |

Why a red-orange pen and not a blue pencil: the margin is where Martin disagrees with himself, and a reviewer's red is the color of correction and review comments, which is exactly what the notes are. A blue pencil would sit too close to default link blue and to the cool paper, so the notes would read as UI rather than handwriting. `#B23B1E` is dark enough to pass 4.5:1 as small text on the paper, which a brighter vermilion would not.

## 2. Contrast

Computed with the WCAG 2.x relative luminance formula.

| Foreground | Background | Ratio | Used for | Requirement |
| --- | --- | --- | --- | --- |
| ink `#1B1E22` | paper `#F3F5F5` | 15.29:1 | all body text, headings, nav, footer links, table | 4.5:1, passes |
| ink-soft `#4E555C` | paper | 6.91:1 | metadata (15px), capacities in the figure, text equivalent, colophon (14px), DE in language switch | 4.5:1, passes |
| pen `#B23B1E` | paper | 5.43:1 | margin notes (15px), note markers, "constraint" label in figure | 4.5:1, passes |
| pen strokes (1.25 to 1.5px) | paper | 5.43:1 | figure lines, queue squares, loop | 3:1 non-text, passes |
| pen link underline | paper | 5.43:1 | link underline (links are also identified by position and the underline itself) | 3:1 non-text, passes |
| focus ring, 2px ink, 3px offset | paper | 15.29:1 | every link, skip link | 3:1, passes |
| pen underline | ink text above it | 2.82:1 | not a required pair; the underline sits on paper, offset 0.22em from the glyphs | n/a |
| ink-soft | pen | 1.27:1 | never adjacent; noted only to show they are not used as a pair | n/a |

The focus ring is offset 3px so it always sits on paper, never on the pen underline. Focus was checked by tabbing in Chromium (skip link and nav both show the ring).

## 3. Signature moves

**Margin notes.** The page uses one CSS grid with named lines: `text` (max 33rem, about 64 to 67 characters per line measured in Chromium at 768, 1280 and 1920) and, from 64rem up, a 3rem gap plus a 14.5rem `margin` column. A paragraph that carries a note is wrapped in `.spread`, which repeats the same columns; the paragraph and the `<aside class="note" role="note">` both sit in grid row 1, so the note starts on the same line as the paragraph it answers. A small pen numeral in the text (`aria-hidden`, since the note directly follows in source order) pairs with the same numeral hanging in front of the note.
Below 64rem the margin column collapses into the text column. The note then follows its paragraph as an inline aside: sans, pen color, hanging numeral, indented 1.5rem. It is distinct by voice and color without any border or panel.
Only two notes exist, both quoted from BRIEF.md: the factory caveat (beside Fig. 1's caption) and the fleets caveat (beside the paragraph where the fleet stops being understandable). I did not write more because content.md forbids invented copy.
The margin also holds metadata in ink-soft: the status line beside the lead, "Writing / Draft, 2026. About 9 minutes." beside the essay title, "Work / 2024 to 2026" beside Douglas. Pen is reserved for notes, so the two uses stay legible as different voices.

**Numbered figure with a book caption.** `Fig. 1` (sans semibold) then the title in serif, followed by the caption text. The drawing is inline SVG drawn as a line figure in the pen: a flow line with an arrow, one open circle per station, queue items as 9px open squares (Development's 9 in-progress items are filled), capacity as small circles under the line (1, 5, 1), and a hand-drawn, not-quite-closed loop around Review with a pen leader to the word "constraint". This is the reviewer circling the problem on the diagram. On wide screens the drawing breaks out across text and margin columns. Below 64rem a second, vertical SVG is shown instead (stations top to bottom, queues as rows of squares, the loop around the review queue), because scaling the horizontal drawing down would push labels under 14px. SVG labels are 16 units and render between 15 and 19px at all four widths.
Text equivalent: visible paragraph inside the `<figcaption>` (in ink-soft), also referenced by `aria-describedby` from the SVG; the SVG has `role="img"` and `aria-labelledby` pointing at the figure title. The data is also a real `<table>` with `<caption>` and `<th scope>`, ruled with thin ink lines; the Review row header carries a pen underline.

**Colophon.** Footer, sans, 14px, ink-soft, under a quiet "Open source and built in public." and three links. It uses the colophon line from content.md verbatim.

**Other choices.** Section rhythm alternates scale: headline and lead (peak), figure (visual peak, widest element), essay (long, even column; rest), pull quote set larger in serif italic and indented (one small peak inside the rest), work entry (smaller type, denser, numbered steps with numerals hanging outside the column), footer (smallest). Straight quotes and apostrophes from content.md are rendered as typographic quotes; the words are unchanged.

## 4. Self-critique

**Usefulness.** A visitor gets the thesis in one headline, who Martin is in the lead, availability in the margin, and a concrete example of the thesis in Fig. 1 before any essay. The figure's four representations (drawing, caption, text equivalent, table) are accessible but repetitive; a sighted reader reads the same facts three times. Navigation and CTA are plain and findable. "Let's talk about your team." as a plain underlined link is easy to miss at the end of the intro; the brief wants it plain, and I kept it plain.

**Emotional fit.** Calm and trusted: yes, the paper, the even serif and the lack of any chrome do that. Curious: mostly through the figure and the two pen notes. The pen notes are the only moments where the page feels like a person thinking; with only two, the page leans calm more than curious. It does not look like a brochure. It is closer to a "tasteful developer blog" than I would like in the essay section, where nothing but the one note distinguishes it.

**Pacing and emphasis at thumbnail scale.** At 1280 and 1920 the thumbnail shows clear peaks: headline block, the red-orange figure (the only area of color mass), the italic pull quote, then a denser work block. The empty right margin between notes is visible as white space, which is correct for a book page but makes the margin look under-used at a glance. At 360 the page is a single column with two distinct red asides and the vertical figure as the one color block; pacing is still varied but flatter. At 768 the layout is single column with roughly 240px unused; the wide layout would need a narrower margin to fit there.

**Coherence and resilience.** One surface, one accent, two families, no borders except table rules: the grammar holds everywhere. All units are rem/em; breakpoints are in rem so browser text-size changes move the layout to single column. Tested: no horizontal scroll at 320, 360, 640, 768, 1280, 1920; with root font size forced to 200% at 360 the table initially overflowed, fixed by allowing cells to hyphenate and wrap. Fallback fonts keep the layout. Reduced motion: the only motion is a 120ms underline-thickness transition, applied only under `prefers-reduced-motion: no-preference`. Weak spot: a forced 200% root size without the media queries following (not a real browser setting, only a test hack) squeezes the text column at 1280 because the margin column is fixed width.

## 5. Removal test

Remove the name and the nouns, and what is left is: a single cool sheet, a serif text column with a narrow right margin, two short red handwritten-feeling asides that talk back to the text, and a line diagram where someone has circled one part and written "constraint". On desktop that reads as "someone who annotates systems and shows their working", mainly because of the circled diagram and the pen notes beside the text. It passes there, narrowly.
On mobile and in the essay section it is weaker: with the margin collapsed and only one aside in the essay, the page reads as "well-set serif blog with red footnotes". Honest verdict: a partial pass. The direction depends on margin notes, and the shared content gives it only two. With five or six real notes per page (Martin's actual second thoughts) it would pass clearly; with two it passes on desktop and drifts toward "nice blog" on phones.

## 6. Disagreements and deviations

- **Margin note copy comes from BRIEF.md, not content.md.** The brief names the two notes explicitly, so I used them verbatim and wrote no others. This is the main limit on the direction (see removal test).
- **The factory note sits beside the figure as the brief asks, but it argues with the headline.** "Software teams are not factories" lands best next to "Software organizations are factories". I followed the brief; I would move it to the headline in a next round.
- **Metadata in the margin.** The brief reserves the margin for notes in spirit. I also put the status line and the section labels with their meta there, in ink-soft, so the margin column is not empty for most of the page. This dilutes the "margin = second thoughts" rule a little; the pen color keeps notes distinct.
- **Colophon content.** The brief asks for a colophon that "says what the page is made of and why". The content.md colophon line says why but not what (no typefaces, no tools). I did not add typeface names because that would be invented copy.
- **Minimal labels I added:** "Skip to content" (skip link), `aria-label` "Main" on the nav and "Language" on the EN/DE list, "Fig. 1", note numerals 1 and 2, and the word "constraint" in the drawing (from "Constraint: Review"). The table caption reuses the content.md heading "Where the work waits (illustrative numbers)".
- **Two SVGs instead of one.** A horizontal and a vertical drawing of the same figure, swapped by media query. More markup than one responsive drawing, but it is the only way to keep figure labels at 14px or larger on a phone.
- **No thin rule under the header or above the footer.** The brief allows rules only for figures and tables, so the header and footer are separated by space alone.
