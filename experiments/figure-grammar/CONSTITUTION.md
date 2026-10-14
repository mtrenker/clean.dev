# clean.dev design constitution, v0

Status: draft from experiment 2 (issue #124), 2026-10-14. Written for two readers: Martin, who owns taste, and any agent asked to build a page, a figure or a component for clean.dev. Every rule states its reason. A rule without a reason you can repeat is not a rule yet and should be questioned in the issue.

## 1. What the site is

clean.dev is a working drawing of how software organizations deliver, made in the open by a senior engineer and a coding agent. It argues that organizations are factories with one constraint at a time, that clean code is knowing the patterns well enough to say why you are not using one, and that the people who build should be listened to first. Readers are senior developers and tech leads. Engineering leaders who hire read like that too. It is not a vendor page.

## 2. Thesis

The site should feel exact, candid and quietly playful, because its reader respects a good drawing and distrusts decoration. It is expressed through one paper surface, one ink, one signal color that means "here the system waits", a title block, numbered sheets, and figures drawn in a single pen grammar. Everything else is clean.

Must not feel like: a SaaS dashboard, a dark hacker theme, a consultant's landing page, engineer cosplay (mono everywhere, instrument panels), or a tasteful developer blog that anyone could have written.

## 3. Rules

1. **Color means constraint.** The signal color appears only on the loop around a constraint, its leader, the word "constraint", the constraint row of a table, and the result values of a live sentence. Reason: a reader learns the color once and can then read every figure on the site without a legend. If something else "needs" color, it does not get one.
2. **Every page carries at least one drawn system, or it is a plain page by design.** Reason: the identity lives in the figures; prose and tables alone pass the removal test as "any careful engineer". An essay without a figure must state why in its front matter, and the publishing check enforces it.
3. **Figures are data, not drawings.** Authors write stations, queues, capacity and a constraint; the renderer draws, tabulates and describes. Reason: a grammar only exists if it is cheap enough to use every time and identical every time. Hand-placed SVG is allowed only inside an experiment folder.
4. **Every figure ships with its table and its text equivalent, and every interactive model has a text-first form.** Reason: screen readers, agents and text-only readers get the same facts; the drawing is the enhancement, the sentence and the table are the artifact.
5. **Nothing on the page without a reason you can state.** Reason: this is the removal test applied per element. Decorative labels, status dots, icons, badges and tiles fail it by construction.
6. **Mono states facts.** Mono is used only for the title block, figure labels and measurements, table column headers, metadata lines and section numbers. Never body text, never section titles. Reason: mono is the drawing convention for measurements; used elsewhere it becomes costume.
7. **Accessibility is the bar, not a feature.** Smallest rendered text 14px, contrast at least 4.5:1 for text and 3:1 for lines, no horizontal scroll from 360px up, keyboard operable, visible focus, reduced-motion equivalents, no color-only meaning. Reason: Martin's words: "absolute accessibility", from mobile to very wide screens, screen readers and agents.
8. **Narrow screens get a reflow, never a shrink.** Figures have a wide and a narrow orientation; the wide one is never scaled below its label sizes. Reason: rule 7.
9. **Numbers that are illustrative say so, and models behind live numbers are stated.** Reason: the site argues with numbers; an unstated model is a number pulled from the air.
10. **Builders disagree in writing.** Agents record deviations from a brief in notes rather than quietly building something else. Reason: the issue is the public record; a silent deviation is a lost decision.

## 4. Tokens

Taken from direction D as built. Contrast ratios computed with WCAG 2.x relative luminance.

| Token | Value | Use | Contrast on paper |
| --- | --- | --- | --- |
| paper | #fbf9f4 | the one surface | |
| ink | #1d1f22 | text, lines, squares, stations, rules | 15.70:1 |
| ink-2 | #4b4f55 | metadata, capacities, secondary labels | 7.83:1 |
| grid | #ece8de | figure area grid only, decorative | 1.16:1 (carries no meaning) |
| signal | #c43d00 | the constraint, rule 1 | 4.97:1 text, 3.16:1 on ink |

Type: IBM Plex Sans for reading, headings, captions, labels in figures (station names at 600). IBM Plex Mono for rule 6. Fallbacks: Source Sans 3 (self-hosted in the repo), system-ui; ui-monospace, DejaVu Sans Mono. Production self-hosts Plex; Google Fonts is for specimens only.

Scale (D as built): body 18px, line-height 1.6, measure 36rem; h1 clamp(2.125rem, 1.2rem + 3.4vw, 3.75rem); h2 clamp(1.625rem, 1.25rem + 1.4vw, 2.25rem); h3 1.25rem; live sentence clamp(1.5rem, 1.15rem + 1.5vw, 2.375rem); metadata 0.875rem to 0.9375rem; figure labels 18/16px wide, 16/14px narrow.

Space: pad clamp(1rem, 4vw, 3rem); margin column 7rem; gap 2rem; page max 80rem.

Geometry: square. 1px lines. No radius, no shadow, no fill except the signal where rule 1 allows. Grid only inside figure areas, with paper knockouts behind every label.

Motion: none required. Allowed only as causal feedback (the live sentence). Always with a reduced-motion equivalent that is not movement.

## 5. The figure grammar

Defined by `types.ts` and `grammar.ts` in this folder; `render.ts` is the only thing that draws it. In words: work flows along one line with an arrowhead, left to right on wide screens and top to bottom on narrow ones. Stations are small open circles on the line, named in sans. Queued work is countable open squares stacked at the station, grouped in fives; work in progress is filled squares. Capacity is small open circles on the other side of the line. The constraint is a hand-drawn loop in the signal color with a leader to the mono word "constraint". A flow that ends in a lost outcome ends in a plain tick with the loss named. Parallel lanes fan out from the line and three dots mean "some, not this many".

Memory hook: the loop around the constraint.

## 6. The live sentence

The text-first form of a figure. It states the thesis as arithmetic before the drawing asks for effort. Adjustable values are ink, 600, dotted underline (controls in production); results are 600 in the signal color (they are the constraint). The model is stated in one line under the sentence. Without JavaScript the sentence is complete and static.

## 7. The title block

The always-present carrier of identity when a page has no figure: project, sheet, revision, date, drawn by, language, in a ruled mono block. On narrow screens it collapses to two rows under about 120px with nothing hidden. "rev. working" and "drawn by Martin Trenker with a coding agent" are facts, not jokes, and that is where the humor lives.

## 8. Prohibitions

No dark theme, glow, gradient (except the 1px grid lines), full-page grid, cards, pill badges, icon set, status dots, KPI tiles, hero image, bento layout, glass. No second color. No mono body text. No decorative label. No hover-only affordance. No figure without a stated constraint or a stated reason for none. No invented counts: a drawing of "some" uses dots.

## 9. Checks

`node check.ts` validates figure data (one constraint per flow or a reason; text equivalent names every station and the constraint) and essays (a figure block or `figure: none` with `figure_reason`). Planned, not built: a contrast check for any new token, a text-size check for rendered pages, a removal-test prompt in the pull-request template.

## 10. The removal test

Cover the name and every proper noun and ask what remains, per section, as a sentence starting with "someone who". The target sentence is: "a working drawing of how work flows, made in the open, by someone who marks where it waits". A section that reads as "any careful engineer" is allowed only when the page carries a figure elsewhere.

## 11. Undecided

- Where the system lives (this folder, a workspace package, or a repo root `design/`).
- Whether the drafting register is Martin's voice or a costume. Decided for now ("I like the ink style figures, that could be the accent for the page where everything else is clean"), re-tested on the first full essay page.
- The German version: the grammar is language-free, the title block and sentence are not.
- Dark mode: declined for now. Paper is the identity. Revisit only with a reason beyond preference.
