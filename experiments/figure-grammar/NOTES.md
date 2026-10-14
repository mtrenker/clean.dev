# Experiment 2, builder 1 notes: the renderer

## 1. What was built

- `types.ts`: the data format from the brief, with doc comments, plus the `Rendered` return type.
- `grammar.ts`: every drawing constant, named, with D's measured value and the reason.
- `render.ts`: `render(figure)` returns `{ wide, narrow, table, text, sentence, figure }` as HTML strings. It validates first and throws on a broken figure (two constraints, no constraint and no reason, missing caption, authored text that drops a station name or the word "constraint"). It imports `models/review-queue.js` (builder 2's real module) for the static live-sentence markup. It uses D's class names, so paper, ink, signal and stroke widths still come from D's `styles.css`.
- `figures/fig1.ts`, `fig2.ts`, `fig3.ts`: the data from the brief, with one brief-level text fix (section 5).
- `build.ts`: renders the three figures and writes `out/index.html`. The hand-built Figures 1 and 2 are copied verbatim from D's `index.html` at build time. The copy also brings D's text-equivalent paragraphs, so the copied SVGs' `aria-describedby` still resolves. No clock and no unseeded randomness are used.
- `out/compare.css`: the title block without navigation, both orientations shown at once, the caption parts the generic renderer adds (`.fig-name`, `.fig-note`, `.live-model`), the row-group rows in multi-flow tables, and the data `<pre>`.
- `out/screenshots/360.png`, `1280.png`.

How layout is computed (no figure ids appear in `render.ts`):

- **Wide:**
  - Stations sit at the centres of equal slots across `[lineStart - 24, 934]`. Where neighbouring labels or marks need more room, those gaps widen and the rest share what is left. This is a water-fill solved by bisection.
  - If the row still does not fit, the widest wrappable label is wrapped and the row is solved again. A slash list stacks one item per line; anything else breaks into two balanced lines.
  - The viewBox height comes from the row bands: the tallest stack, the lanes and dots, the loop and its word, and the label rows.
- **Narrow:** each station block is placed 36 units below the previous one. A constraint loop that would reach back into the block above pushes its own station down.
- **Lanes:** the station has `lanes.count` lanes, the main line being one of them. Each lane gets its own station circle and the station's queue. `more` adds three dots.
- **Row labels:** they go in a left gutter only if every label in the figure is at most 80 units wide ("Fleet", "Now", "Before"). Otherwise they go above the rows ("After a second reviewer").
- **Loop:** the renderer collects the constraint's marks (squares, station, capacity circles) plus any text within 14 units of them. Text counts as a cross through its x-height, not its box corners, because a pen loop hugs words. It then fits an ellipse whose aspect ratio is the enclosed box's to the power 0.6, clamped to 1 to 3, and adds 10 units of padding with a 40-unit minimum. The ellipse is sampled at 31 points over 390 degrees, with three seeded sine terms and an 8% outward drift, and drawn with Catmull-Rom curves.
- **Leader:** it starts at -40 degrees on wide and +30 degrees on narrow. If the word would leave the drawing, the attach point walks up to 40 degrees around the loop, and only then does the leader flip to the other side.
- **Jitter:** seeded from `${figure.id}:${flow}:${station}:${square}`, so a square keeps its wobble when unrelated stations change. Wide and narrow use the same seed for the same square.

## 2. Constants extracted, and what changed

Everything below was measured from D's SVG coordinates, not from its notes. The full list with reasons is in `grammar.ts`.

| Constant | D value (where measured) | Here |
| --- | --- | --- |
| square, pitch | 10, 14 both axes (x 63/77/91/105/119; y 208/194/180...) | same |
| jitter | ±0.6 per corner (M62.9 208.1 L73.5 208 ... against a nominal 63/73) | same |
| station r, capacity r, capacity pitch | 5, 3.5, 12 | same |
| arrow | back 10, half 5, tip 2 beyond the line end (M926 231 L936 236 L926 241, line to 934) | same |
| wide: squares bottom, count gap, capacity y, name y, cap gap | 18 above the line, 10 above the top row, +20, +56, +24 (lines +22/+20) | same |
| wide: station x, Figure 1 | 96, 282, 468, 654, 840 | 93.4, 280.2, 467, 653.8, 840.6 (equal slots over 0 to 934) |
| wide: lanes | pitch 32; fan leaves 140 before, flat from 76 before, rejoins 180 after (at the next station) | pitch 32; symmetric ±140 / ±76 |
| lane square, dots | square 7 above its lane; dots r 1.3 at 28/35/42 beyond the outer lane | same |
| narrow: line x, text x, count right, capacity x | 28, 46, 326, 12 | same |
| narrow: name, capacity text, squares | name +6; capacity text +28 (Fig. 1) or +26 (Fig. 2), lines 18; squares 12 below the last baseline; rows of ten with 4 extra after five | name +6; capacity text +28; the rest the same |
| narrow: station gap | 32 to 40, varied by hand | 36 |
| narrow: lanes | pitch 30; fan ±75, flat ±45; rejoins at the next station | same fan; next station 20 after the rejoin |
| loop | 31 points, Catmull-Rom with tension 1/6 and doubled ends (first control point = start + (p2 − p1)/6, checked), start about -138° wide and -114° to -123° narrow | 31 points, start -126° ± 8° seeded, sweep 390°, drift 8%, wobble 3%/1.8%/1.2% on harmonics 2/3/5 |
| leader | wide from about -40°, end (+54,−50) (Fig. 1) or (+31,−38) (Fig. 2), word at (+6,+4); narrow from about 30°, (+36,+22), word at (+4,+6) | wide (+46,−44); narrow the same as D |
| text sizes | wide 18/16; narrow 16/14 | same |

Values changed from D, and why:

- **Fan rejoin.** Made symmetric, because "rejoin at the next station" depends on a neighbour's position. That would be a second layout pass for one mark. See the critique: D's version reads better.
- **Narrow station gap.** One value (36) instead of D's hand-varied 32 to 40.
- **Wobble amplitudes** were not measurable exactly from D's loops (the drift and wobble are mixed together). They are set by eye against D's loops and documented as such.
- **New rule: the count numeral appears only for zero or more than five squares.** D printed every count in Figure 1 and none in Figure 2. The brief's data has counts in both, so a rule was needed. "More than one group of five, or nothing to draw" reproduces both of D's figures and matches D's own reason for keeping numerals (NOTES section 7: "0" and "9 in progress" cannot be shown by squares, and 48 squares take time to count). Its cost is in Figure 3: "After" Review shows 3 squares and no numeral.
- **Loop fitting** is new; D placed each loop by hand. The rule and its limits are in section 4.

## 3. The generated text equivalent for Figure 3

Quoted from `out/index.html` (`fig-3-text`):

> Before. Work flows from Ideas through Refinement, Development and Review to Release. Ideas has 48 waiting (capacity: unlimited). Refinement has 12 waiting (capacity: 1 product owner). Development has 9 in progress (capacity: 5 developers). Review has 14 waiting (capacity: 1 senior reviewer). Release has none waiting (capacity: every 2 weeks). The constraint is Review, 1 senior reviewer. After a second reviewer. Work flows from Ideas through Refinement, Development and Review to Release. Ideas has 48 waiting (capacity: unlimited). Refinement has 12 waiting (capacity: 1 product owner). Development has 9 in progress (capacity: 5 developers). Review has 3 waiting (capacity: 2 senior reviewers). Release has 11 waiting (capacity: every 2 weeks). The constraint is Release, every 2 weeks.

My judgment: it is complete and correct, and it should not ship as it stands.

- It is an inventory, not a description. It repeats five unchanged stations, buries the one change (Review 14 to 3, Release 0 to 11), and never says the constraint moved. That is the figure's whole point, and the authored captions say it ("Relieve review and the work waits for the release train").
- "(capacity: every 2 weeks)" is grammatical but stiff.

It works as a floor: a screen-reader user gets every fact. It is not the text a person would write. Two cheap improvements would close most of the gap without an author:

- For multi-flow figures, describe the second flow as a diff against the first: "After a second reviewer, Review has 3 waiting with 2 senior reviewers and Release has 11 waiting; the constraint moves to Release."
- Lead with the constraint sentence.

I did not build the diff form, because the brief asked to judge the plain generator first. Recommendation: keep `text` optional, but have `check.ts` warn when a multi-flow figure has no authored text.

## 4. Self-critique: rendered against hand-built

At thumbnail scale (`out/screenshots/1280.png`), Figure 1 is hard to tell from D's. Figure 2 is close in wide, and noticeably different in narrow at the loop.

**Figure 1, wide**

1. Station positions agree within 3 units. Square stacks, count numerals, capacity circles, labels and arrow match D's rules exactly. Tie: they were rules in D too.
2. The viewBox is 960×280, not 330. D left about 60 units of empty paper above the 48 tower; the algorithm stops 10 units above the tallest mark. Algorithm right: the air carried no meaning. D's extra air does make the tower look less cramped against the figure-area padding, though.
3. The loop measures about 124×119 units. D's is 138×127 and slightly rounder and more generous. The leader is a little shorter. D is slightly better, but this is within what the eye forgives.

**Figure 1, narrow**

4. The loop is rounder and taller (about 224×127 against D's 209×100). It cuts across the line on both sides and pushes Release down, so the viewBox is 569 tall, not 514. D right. D's flat ellipse hugs "Review / 1 senior reviewer / squares" the way a pen would. The fitter takes the ellipse through the farthest marks, and the square-root aspect rule rounds a flat cluster. A hand draws a flatter loop and lets the corners of text boxes poke out. I tried the obvious fix (text as a cross through its x-height) and it helped, but not enough.
5. The station gap is a fixed 36, against D's 32 to 40. Algorithm right: D's variation was incidental.

**Figure 2, wide**

6. D's fan rejoins exactly at "code appears", so the four lanes converge into the result. Mine rejoins 140 units after the lanes station, about 18 units before "code appears", on the bare line. D right. The convergence is part of the argument (many agents, one pile of code). The algorithm could do it, by rejoining at the next station when it is within reach, but that is a second pass I chose not to special-case.
7. Line break: D wrote "agents in / separate workspaces", I wrote "agents in separate / workspaces". D right. The balanced-width split tears "separate workspaces" apart. Authors could protect a phrase with a no-break space, but check.ts matches station names verbatim against the text, so that needs a decision (section 5).
8. "Martin" prints under "review by Martin" as the capacity label. D drew only the circle. D right. The brief's rule ("label always prints") produces a redundant word. The fix belongs in the data rule, not the renderer: let `capacity.label` be omitted when `count` is given and the station name already says who.
9. Stations: Now is at 116 to 860 (D 110 to 860); Fleet is 109, 244, 422, 580, 715, stop 860 (D 110, 250, 430, 610, 740, stop 880). The viewBox is 487 tall, against 500. No visible consequence. Tie.
10. No count numerals, as in D (the countAbove rule). Tie.

**Figure 2, narrow**

11. Lane squares sit 7 units right of each lane station, centred on it, so they nearly touch the circles ("○■ ○■"). D offset them up and right. D right: they read as cargo on the lane, not as part of the station.
12. The loop around "review by Martin / Martin / one square" is about 203×122, against D's 202×67. It makes the lower half of the figure feel heavy and pushes "merge" down 36 units. D right, for the same reason as item 4, made worse by the redundant "Martin" line.

**Both figures: the words around the drawing**

13. The caption carries a mono title next to "Fig. n" (the brief asks for the title in the caption) and the note under it. D's Figure 1 relied on the h2 for the title. D's Figure 2 set the caption as a pull quote, which is an editorial choice the data format cannot express. D right in an essay. A `pull?: true` flag would cover it.
14. The tables differ. Figure 1's matches D's. For multi-flow figures I used one row group per flow, each with Station, Waiting and Capacity, plus a footer row for "Ends in …" and the no-constraint reason. D's Figure 2 table (Workflow, Stations, Constraint) reads better for Figure 2. Mine is the only one that works for Figure 3, where the numbers are the point. Algorithm right for the system, D right for that one figure.
15. The live sentence says 22, not 20, and "senior reviewer" where D said "reviewer". Both come from builder 2's model. The model is right.

**Figure 3 (no hand-built version)**

- It came out readable on the first render. Cost: about twenty minutes, nearly all of it spent fixing two general bugs (the narrow leader flip, and the loop overlapping the previous block) that Figures 1 and 2 had also exposed. A further figure would take as long as typing the data.
- Weakness: in "After", the constraint is the last station. The wide loop around Release swallows the arrowhead, and the leader correctly flips left, but the word then floats between Review and Release. A person would have moved the arrow or started the leader from the top.

Where the hand still wins, in one line: composition at the loop (its shape, its relation to neighbours), and phrase-aware choices (line breaks, dropping a redundant word, rejoining lanes where the argument needs them).

## 5. Disagreements with the brief, and brief-level fixes

- **Brief-level fix (design owner, not my deviation).** Figure 2's authored text said "Martin's review", but the station is "review by Martin", and check.ts requires station names verbatim. On the design owner's instruction, the last two clauses now read: "…then crosses as a pull request into review by Martin before it is merged. The constraint is review by Martin, by design." `node check.ts figures/*.ts` reports all three figures ok.
- **Both sentence paragraphs carry `aria-live="polite"`**, not only the second as in the brief's example markup. Changing developers or reviewers changes the first sentence's number too. The design owner confirmed this. Every `var.in` carries `data-label`, `data-min` and `data-max`.
- **"Both orientations side by side at all widths" is not possible together with the 14px rule.**
  - At 360, side by side has no room, so the page stacks wide above narrow. The wide drawing then renders at 0.34px per unit, so its labels are 5.6px. That happens only on this comparison page, where the wide drawing is a reference thumbnail; no production page would ever show it.
  - At 1280, side by side only works because `compare.css` cuts the page pad to 1rem and the figure-area padding to 0.75rem. That gives the wide drawing 0.906px per unit (16-unit labels at 14.5px) next to the 328px narrow one. Side by side starts at 80rem; below that the orientations stack.
- **Counts are not always printed.** See section 2. The brief implies numerals everywhere; D's Figure 2 has none. The countAbove rule is the smallest rule that reproduces both of D's figures.
- **"Capacity label always prints"** produces "Martin" under "review by Martin" (item 8). I would make the label optional when `count` is present.
- **Line breaks need an authoring mechanism.** A no-break space in a station name would protect "separate workspaces", but it would break check.ts's verbatim name match against the authored text. Either check.ts normalises whitespace, or names gain an optional `lines?: string[]`.
- **"`node build.ts` regenerates out/ from the data with no other input"** is true for the rendered figures. The comparison page also reads D's `index.html` to copy the hand-built figures verbatim, which beats pasting a stale copy into `build.ts`. A production build would not read it.
- **Text widths are estimated, not measured.** Plex Mono is exact (0.6em). Plex Sans SemiBold is estimated per glyph class with a 5% margin. That is good enough for spacing, but a long name near a fit limit could wrap one step too late or too early. Real font metrics would need either the font file or a browser, and both conflict with zero dependencies.
- **Data the format cannot say, which D used:** a pull-quote caption (item 13) and "rejoin the lanes at the next station" (item 6). I would add the first as a flag. The second should simply become the renderer's default; it is a rule I ran out of time to generalise, not a missing field.

## Acceptance results

- **Deterministic:** `node build.ts` run twice gives the same `out/index.html` SHA-256.
- **Text sizes, checked by script.** Method: a Node script imports the playwright package from the npx cache (`~/.npm/_npx/<hash>/node_modules/playwright`, 1.64.1) and drives the cached headless Chromium. At 360×800 and 1280×900 it waits for fonts, then reads every visible SVG `<text>` (computed font size × rendered width ÷ viewBox width) and every visible HTML text node. It skips visually hidden nodes and the off-screen skip link.
  - Rendered narrow SVGs at 360: minimum 14.00px (14-unit capacity text at 1:1).
  - Rendered wide SVGs at 1280: minimum 14.50px.
  - Rendered narrow SVGs at 1280: 14.00px.
  - HTML text: minimum 14px at both widths.
  - Wide SVGs at 360: 5.6px. These are comparison thumbnails only (section 5), on both D's copies and mine.
- **No horizontal scroll:** `scrollWidth == innerWidth` at 360 (360) and 1280 (1280). The data `<pre>` scrolls inside its own box.
- **Contrast:** unchanged from D. All colours come from D's stylesheet, and the only new colour use is `--ink-2` for the orientation labels, notes and the model line, at 7.83:1 on paper.
- **Live sentence:** with `live.js`, the three numerals become number inputs named "developers", "senior reviewers" and "developers added". ArrowUp on developers gives 18 and 26 and keeps focus in the input. Both result paragraphs are polite live regions. Without JavaScript the static sentence reads "A team of 5 developers and 1 senior reviewer has 14 changes waiting for review. Add 2 developers and 22 changes wait."
- **Fonts:** the network was available, so the screenshots use IBM Plex from Google Fonts, as D does.

## Did the hand-drawn quality survive the renderer?

Mostly yes. The answer is "yes for the grammar, no for the loop", and the loop is the memory hook. Everything countable came out of the data indistinguishable from D at thumbnail scale: the ruled line and chevron, the stacked squares with their jitter, the station and capacity circles, the fan, the dots and the numerals. That is not surprising, because D generated those with a script too. They were never in the hand; they were in the grammar, and the grammar is now real and cheap. Figure 3 cost the data plus fixes that every later figure inherits. What did not fully survive is the one mark that was placed by eye: the signal loop. The renderer's loops are correct (they enclose the right marks, never collide with the block above, and their words stay on the page). But they are rounder, larger and less intimate than D's, especially on narrow screens, and in Figure 3 the loop swallows an arrowhead. The same is true of the small editorial calls around it: where four lanes rejoin, where a phrase breaks, whether "Martin" needs saying twice. So the design system can promise the grammar on every page. It should say plainly that each figure's loop and line breaks get one human look before publishing, and that a figure which needs D's composition still gets a hand pass. The renderer is a good first draft and a strict floor, not a substitute for that last look.

## 9. Round 2

The design owner reviewed the rendered figures against D's and accepted every "D right" in section 4. Sections 1 to 8 stay as the round 1 record. This section supersedes them where they disagree.

### What changed

1. **Loop shape.** Radii are now the enclosed box's half-extents × 1.2 plus 6 units of padding: aspect power 1, clamped to 1 to 3.5, with a 24-unit minimum radius.
   - The box's far corners may poke out slightly. D's do too: the corner of D's narrow Figure 1 squares sits at 1.05 of its ellipse.
   - At a drawing edge, the loop first tightens to as little as 85% of its width, and only then moves off-centre. This stops narrow loops sliding right, away from the capacity circles.
   - Text still counts through its x-height band only.
   - The capacity circles are always among the enclosed marks. On narrow the loop therefore crosses the flow line only above and below the station, as in D.
2. **Last-station constraint.** The arrowhead never sits inside a loop. The line extends until the arrowhead's back clears the loop by 12 units, and if that would leave the drawing, the stations are re-solved in a narrower region. The leader starts at the top of the loop (-84°) with the word centred above it. The same top leader replaces the old flip-left fallback on wide drawings. In Figure 3 the tighter loop already clears the default arrow (30 units), so the extension exists but did not need to trigger.
3. **Lanes rejoin at the next station**, in both orientations.
   - On wide the descent runs 1.55 × (leave − flat), which is D's 100 units.
   - On narrow the fan is drawn after the layout pass, from the next station's actual y.
   - The next narrow station sits exactly at the rejoin (`fanClear` 0, D's choice).
4. **Count numerals are all or nothing per figure**, with one deviation (below). Figure 3's "After" Review now prints "3".
5. **Capacity label is optional when a count is given.**
   - `types.ts` now reads `{ count: number; label?: string } | { label: string }`.
   - `render.ts` and `check.ts` share one rule: a capacity needs a count or a label.
   - Figure 2's "review by Martin" has `capacity: { count: 1 }`. The drawing shows the circle alone, and the table shows "1".
6. **Authored line breaks.** A "\n" in a station name breaks the line in both SVGs and is never re-wrapped. Everywhere else it reads as a space: table, text equivalent, SVG title, render.ts's text check, and check.ts's name match (`check.ts` normalises "\n" to a space before matching). Figure 2 uses "agents in\nseparate workspaces".
7. **Pull-quote caption.** `pull?: true` is on `Figure`. The caption becomes D's `<blockquote class="pull">`, with "Fig. 2" and the title kept as the small mono line above it. Figure 2 sets it.
8. **Narrow lane squares** sit up and right of each lane station, at (+10, −10), as D drew them.
   - The dots move to 23, 30 and 37 beyond the outer lane, against D's 16, 23 and 30. At D's offsets the first dot overlaps the last lane's square, in D as well.
   - The name sits 10 after the last dot. "separate workspaces" ends at 325.3 of 328 units, measured with getBBox in Chromium with Plex loaded.
9. **Generated text** leads each flow with its route, gives one fact per station without the "(capacity: …)" parenthesis, ends the first flow with its constraint sentence, and tells a later flow with the same stations as a diff.
   - A later flow with different stations (Figure 2) is described in full.
   - Capacity phrasing:
     - with a count: "for 1 product owner";
     - a one-word label alone: "unlimited capacity";
     - a longer label alone: "capacity every 2 weeks";
     - a count alone: "a capacity of 1".

**One deviation from the decisions: in-progress does not switch counts on.** Decision 4 lists "zero, more than five, or in-progress state" and also says Figure 2 must still print none. Figure 2's worktree has 1 in progress, so the literal rule prints "1 in progress", "1", "1" and "1" across Figure 2's Now row. That contradicts the stated goal and D. I kept the trigger to zero or more than five; Figures 1 and 3 still switch on through 48, 12, 9, 14 and 0. If in-progress should count, Figure 2 needs its in-progress squares to stop being "in-progress", and that is a data question, not a renderer one.

### Loop measurements against D

Extents of the loop path's points, in user units (width × height).

| Loop | D | Round 1 | Round 2 |
| --- | --- | --- | --- |
| Fig. 1 wide, Review | 139 × 129 | 124 × 119 | 136 × 130 |
| Fig. 1 narrow, Review | 209 × 103 | 224 × 127 | 202 × 93 |
| Fig. 2 wide, review by Martin | 92 × 83 | 81 × 75 | 74 × 76 |
| Fig. 2 narrow, review by Martin | 203 × 68 | 203 × 122 | 178 × 64 |
| Fig. 3 wide, Before / After | none | 121 × 124 / 103 × 104 | 133 × 136 / 111 × 112 |
| Fig. 3 narrow, Before / After | none | 218 × 132 / 228 × 136 | 197 × 97 / 209 × 92 |

Three loops now sit within about 10% of D's: both of Figure 1's and Figure 2's narrow height. Figure 2's narrow loop is 25 units narrower than D's, because the edge rule tightens it rather than letting it bleed. Figure 2's wide loop is smaller than D's: D drew a generous circle around one square, and the hug rule does not. I think the smaller loop is fine there, but it is the one place D's hand is still visibly more relaxed. Narrow viewBox heights went from 569 to 544 (Figure 1, D 514) and from 929 to 874 (Figure 2, D 892).

### The generated text for Figure 3, again

> Before: Work flows from Ideas through Refinement, Development and Review to Release. Ideas has 48 waiting, unlimited capacity. Refinement has 12 waiting for 1 product owner. Development has 9 in progress for 5 developers. Review has 14 waiting for 1 senior reviewer. Release has none waiting, capacity every 2 weeks. The constraint is Review, 1 senior reviewer. After a second reviewer: Review has 3 waiting with 2 senior reviewers and Release has 11 waiting; the constraint moves to Release, every 2 weeks.

**Judgment: good enough to ship as the default.** The second half now says what the figure argues: what changed, and that the constraint moved. A screen-reader user gets that in one sentence instead of re-hearing five stations. What remains:

- "capacity every 2 weeks" is still stiff. It is the one fact whose label is a cadence, not a count of people, and no grammar rule will phrase it well without knowing that.
- "The constraint is Review, 1 senior reviewer" is terse but clear.
- The capital "Work" after "Before:" follows the requested shape. A lowercase "work" would read better after a colon in running prose.

I would still author the text for flagship figures. For a working essay figure, this is better than what most authors would write.

### Acceptance, re-run

- **Deterministic:** two runs of `node build.ts` give the same SHA-256 (`3f4ea6cc…`).
- **Text sizes** (same script and method as before):
  - rendered narrow SVGs at 360: 14.00px minimum;
  - rendered wide SVGs at 1280: 14.50px minimum;
  - HTML text: 14px minimum.
  - Every narrow SVG label stays inside its 328-unit viewBox (getBBox maximum 326.0).
- **No horizontal scroll** at 360 or 1280.
- **check.ts:** `node check.ts figures/*.ts` reports fig1, fig2 and fig3 ok. With `samples/*.md` it reports the two good samples ok and the third with the expected "no figure" message.
- **Live sentence:** ArrowUp on developers gives 18 and 26 and keeps focus. Both paragraphs are polite live regions.
- **Screenshots:** `out/screenshots/360.png` and `1280.png` were retaken with Plex loaded.

### Did the hand-drawn quality survive? (updated)

Yes, now with one named exception. After round 2, Figures 1 and 2 at thumbnail scale differ from D's only by small distances. The loops hug their blocks within about 10% of D's proportions. The lanes converge into "code appears". The phrase breaks where the author says. The redundant "Martin" is gone, and the caption is a pull quote again. Figure 3 gets a correct arrow, a word above its last-station loop, and a text equivalent that states the argument. What made the difference is telling: none of the fixes were special cases. Each was a rule D had followed by eye and nobody had written down (hug the block, let corners poke, rejoin where the work goes, never loop the exit, let the author choose a phrase break). So the quality was not in the hand. It was in judgments that had not been named yet. The remaining gap is generosity: D's loop around a single square is looser and warmer than the rule's. That gap is small enough that the design system can promise the grammar on every page without a hand pass. Each new figure's loop and line breaks should still get a glance in review, because a new shape of data is where an unnamed judgment will turn up next.
