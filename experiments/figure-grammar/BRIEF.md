# Experiment 2: make the figure cheap

Issue #124, record 2 ended with a risk: direction D's identity lives in its figures, and nobody will draw 48 jittered squares by hand for every essay. This experiment tests whether the pen grammar survives a renderer. If Figures 1 and 2 come out of a data file looking like the hand-built ones in `../identity-specimens/d-drawn/index.html`, the grammar is real and can be promised on every page. If not, the quality lived in the builder's hand, and the design system must say so.

Read first: `../identity-specimens/d-drawn/BRIEF.md` (section "Figure grammar"), `../identity-specimens/d-drawn/NOTES.md` (sections 1, 4 and 8), the figure markup in `../identity-specimens/d-drawn/index.html` (lines 64 to 370 and 369 to 548), and `../identity-specimens/content.md` for the source facts.

## Where it lives

`experiments/figure-grammar/`, standalone. Zero dependencies. Node 26 runs TypeScript directly (`node build.ts`), so there is no build tool, no `node_modules`, and no package wiring yet. Whether this becomes a workspace package is a later decision and belongs in the record, not in this folder.

Files (builder 1 unless marked):

```
BRIEF.md            this file (design owner)
README.md           how to run, one screen (builder 1)
types.ts            the data format below, with doc comments agents can read (builder 1)
grammar.ts          the drawing constants, named, with the D value and its reason (builder 1)
render.ts           data in, { wide, narrow, table, text, sentence, figure } out (builder 1)
figures/fig1.ts     "Where the work waits"            (builder 1, data below)
figures/fig2.ts     "Two ways to work with agents"    (builder 1, data below)
figures/fig3.ts     "The bottleneck moves"            (builder 1, data below)
models/review-queue.js   the live-sentence model, plain ESM so the browser can import it (builder 2)
live.js             progressive enhancement for the live sentence (builder 2)
check.ts            the publishing check (builder 2)
build.ts            renders all figures into out/ and writes the comparison page (builder 1)
out/index.html      the comparison page, generated, committed (builder 1)
out/compare.css     only what the comparison page needs beyond D's stylesheet (builder 1)
out/screenshots/    360.png and 1280.png of the comparison page (builder 1)
NOTES.md            builder 1's notes; NOTES-live-check.md builder 2's notes
```

Nothing in `../identity-specimens/` is modified. The comparison page links D's stylesheet relatively (`../../identity-specimens/d-drawn/styles.css`) so there is one source for the paper, ink, signal and type.

## The data format

A figure is data. The renderer owns every pixel; authors own the facts and the argument.

```ts
export type Figure = {
  id: string;                 // "fig-1", used for element ids and as the jitter seed
  number: number;             // "Fig. 1"
  title: string;              // mono, inside the SVG <title> and the caption
  note?: string;              // "Numbers are illustrative." Rendered small under the caption.
  flows: Flow[];              // one row per flow; Figure 1 has one, Figures 2 and 3 have two
  caption: string;            // the argument. Authored, never generated. Required.
  text?: string;              // text equivalent. Generated from the data unless given.
  sentence?: Sentence;        // optional live sentence shown before the drawing
};

export type Flow = {
  label?: string;             // "Fleet", "Now", "Before", "After". Mono, left of the row.
  stations: Station[];
  end: "arrow" | { stop: string };  // arrowhead, or a plain tick labelled with the given words
  noConstraint?: string;      // required if no station is the constraint: the reason, in words
};

export type Station = {
  name: string;               // sans 600, below the line (wide) or beside it (narrow)
  queue?: { count: number; state?: "waiting" | "in-progress" };  // open squares, or filled
  capacity?: { count?: number; label: string };  // circles if count is given, label always
  constraint?: true;          // the loop, the leader, the word "constraint". At most one per flow.
  lanes?: { count: number; more?: boolean };     // fan out into parallel lanes, each carrying
                                                  // this station's queue; more adds three dots
                                                  // beyond the outermost lane
};

export type Sentence = {
  model: string;              // module name under models/, e.g. "review-queue"
  inputs: Record<string, { value: number; min: number; max: number; label: string }>;
};
```

Rules the renderer enforces (and `check.ts` reports):

- A flow has exactly one constraint, or `noConstraint` with a reason. Two constraints is an error.
- A station with a queue of 0 draws no squares; the count "0" is still printed.
- `capacity.count` draws that many circles. No count, no circles; the label still prints.
- Nothing in a figure is colored except the loop, its leader and the word "constraint".
- Every figure gets: `<figure>` with `<figcaption>` starting with mono "Fig. n", a wide and a narrow SVG each with `role="img"`, `<title>` and `aria-describedby` pointing at the text equivalent, a visible text equivalent, and a real `<table>` with `<caption>`, `th scope="col"` and `th scope="row"`, the constraint row in signal with the word "constraint" beside it. This is the contract from D; do not weaken it.
- The generated text equivalent names every station in order, states every count and capacity, and ends with the constraint sentence ("The constraint is Review, 1 senior reviewer."). If `text` is authored, the check verifies it still contains every station name and the word "constraint" (or the `noConstraint` reason).

## The grammar, as constants

Extract D's values from its SVG and name them in `grammar.ts`. Expected, from D's notes: flow line 1.25 units, open chevron arrowhead; station circle r=5 on the line; queue squares 10 units, corners nudged by up to 0.6 units, grouped in fives (columns five wide stacked upward on wide, rows of ten with a gap after five on narrow); capacity circles r=3.5 on the opposite side of the line; loop stroke 1.6 with round caps and `vector-effect: non-scaling-stroke`, a parametric ellipse sampled at 31 points, radius wobbling with three low-amplitude sine terms, one full turn plus about 30 degrees, radius drifting out 8% so the end overlaps the start; leader curved to the mono word "constraint"; every SVG text with a 5-unit paper knockout (`paint-order: stroke`); label sizes that render at 14px or more at D's breakpoints (wide SVG shown from 64rem, narrow capped at 25rem and drawn 1:1 for 360).

Jitter is seeded from `figure.id` plus the square's index, so `node build.ts` is deterministic and a diff of `out/` means something changed on purpose.

Layout is computed, not hand-placed: station spacing from the number of stations and the widest queue, viewBox height from the tallest stack, lanes from `lanes.count`. Where D's hand placement made a choice the algorithm cannot reproduce, say so in NOTES.md rather than special-casing a figure id.

## The three figures

Figure 1 and 2 are the test: they must come out as close to D's as the algorithm allows. Figure 3 never existed; it is the proof that a new figure costs minutes.

```ts
// figures/fig1.ts
export const fig1: Figure = {
  id: "fig-1", number: 1, title: "Where the work waits", note: "Numbers are illustrative.",
  flows: [{
    stations: [
      { name: "Ideas",       queue: { count: 48 },                          capacity: { label: "unlimited" } },
      { name: "Refinement",  queue: { count: 12 },                          capacity: { count: 1, label: "1 product owner" } },
      { name: "Development", queue: { count: 9, state: "in-progress" },     capacity: { count: 5, label: "5 developers" } },
      { name: "Review",      queue: { count: 14 },                          capacity: { count: 1, label: "1 senior reviewer" }, constraint: true },
      { name: "Release",     queue: { count: 0 },                           capacity: { label: "every 2 weeks" } },
    ],
    end: "arrow",
  }],
  caption: "Adding two developers here feeds the review queue. The constraint is review capacity, so more developers make the system slower, not faster, until review is relieved.",
  text: "Work flows from Ideas through Refinement, Development and Review to Release. The longest queue sits in front of Review, where 14 changes wait for one senior reviewer. Development has 9 changes in progress for 5 developers. Adding developers increases the review queue; the constraint is review capacity.",
  sentence: {
    model: "review-queue",
    inputs: {
      developers: { value: 5, min: 1, max: 20, label: "developers" },
      reviewers:  { value: 1, min: 1, max: 10, label: "senior reviewers" },
      added:      { value: 2, min: 0, max: 20, label: "developers added" },
    },
  },
};
```

```ts
// figures/fig2.ts
export const fig2: Figure = {
  id: "fig-2", number: 2, title: "Two ways to work with agents",
  flows: [
    {
      label: "Fleet",
      stations: [
        { name: "Large plan" },
        { name: "split into tasks",               queue: { count: 4 } },
        { name: "agents in separate workspaces",  queue: { count: 1, state: "in-progress" }, lanes: { count: 4, more: true } },
        { name: "code appears" },
        { name: "dashboard" },
      ],
      end: { stop: "no understanding" },
      noConstraint: "The essay marks no station. The row ends in lost understanding.",
    },
    {
      label: "Now",
      stations: [
        { name: "Issue" },
        { name: "one small task",   queue: { count: 1 } },
        { name: "worktree",         queue: { count: 1, state: "in-progress" }, capacity: { count: 3, label: "orchestrator / implementer / reviewer" } },
        { name: "pull request" },
        { name: "review by Martin", queue: { count: 1 }, capacity: { count: 1, label: "Martin" }, constraint: true },
        { name: "merge" },
      ],
      end: "arrow",
    },
  ],
  caption: "The bottleneck is still me. That's fine. I have to live with the code after the agents move on.",
  text: "In the fleet workflow, a large plan is split into tasks and sent to agents in separate workspaces; code appears quickly and a dashboard shows activity, but understanding is lost. In the current workflow, one groomed issue becomes one small task, worked in a worktree by an orchestrator, an implementer and a reviewer, then crosses as a pull request into Martin's review before it is merged. The constraint is Martin's review, by design.",
};
```

Figure 2's four lanes and four task squares are a drawing of "split into tasks", not a count the essay makes; the dots say "some". Keep that.

```ts
// figures/fig3.ts  (derived from Martin's brief "What Factorio taught me about agile bottlenecks":
// "approval layers and dependencies become invisible queues", "bottlenecks move, but rituals stay fixed")
export const fig3: Figure = {
  id: "fig-3", number: 3, title: "The bottleneck moves", note: "Numbers are illustrative.",
  flows: [
    {
      label: "Before",
      stations: [
        { name: "Ideas",       queue: { count: 48 },                      capacity: { label: "unlimited" } },
        { name: "Refinement",  queue: { count: 12 },                      capacity: { count: 1, label: "1 product owner" } },
        { name: "Development", queue: { count: 9, state: "in-progress" }, capacity: { count: 5, label: "5 developers" } },
        { name: "Review",      queue: { count: 14 },                      capacity: { count: 1, label: "1 senior reviewer" }, constraint: true },
        { name: "Release",     queue: { count: 0 },                       capacity: { label: "every 2 weeks" } },
      ],
      end: "arrow",
    },
    {
      label: "After a second reviewer",
      stations: [
        { name: "Ideas",       queue: { count: 48 },                      capacity: { label: "unlimited" } },
        { name: "Refinement",  queue: { count: 12 },                      capacity: { count: 1, label: "1 product owner" } },
        { name: "Development", queue: { count: 9, state: "in-progress" }, capacity: { count: 5, label: "5 developers" } },
        { name: "Review",      queue: { count: 3 },                       capacity: { count: 2, label: "2 senior reviewers" } },
        { name: "Release",     queue: { count: 11 },                      capacity: { label: "every 2 weeks" }, constraint: true },
      ],
      end: "arrow",
    },
  ],
  caption: "Bottlenecks move, but rituals stay fixed. Relieve review and the work waits for the release train.",
};
```

Figure 3 has no authored `text`; the generated text equivalent is used, and NOTES.md quotes it so we can judge whether generated prose is good enough to ship.

## The live sentence (builder 2, with builder 1 producing the static markup)

The sentence is the text-first form of the figure. It reads the same data as the drawing. The static HTML is complete without JavaScript; `live.js` only adds controls.

The model module `models/review-queue.js` (plain ESM, JSDoc-typed, importable from Node and the browser) exports:

```js
export function compute({ developers, reviewers, added }) → { waiting, waiting2 }
export function lines(inputs, outputs) → Segment[][]   // one array per sentence
// Segment = { text: string } | { input: name } | { output: name }
```

Model, stated under the sentence in sans at the secondary ink, because an unstated model is a number pulled from the air: *Illustrative model: each developer finishes four changes a week, one senior reviewer clears six. The figure shows one week.* So `waiting = max(0, developers·4 − reviewers·6)` and `waiting2 = max(0, (developers+added)·4 − reviewers·6)`. With D's inputs that gives 14 and 22. D said 20, which came from no model; 22 is the honest number and the record will say so.

`lines()` owns plurals and the zero case ("1 senior reviewer", "senior reviewers"; when nothing waits: "and the review queue clears"). The renderer calls `lines()` with the default inputs to produce static markup:

```html
<div class="live" data-model="review-queue" data-figure="fig-1">
  <p>A team of <var class="v in" data-input="developers">5</var> developers and <var class="v in" data-input="reviewers">1</var> senior reviewer has <span class="v out" data-output="waiting">14</span> changes waiting for review.</p>
  <p aria-live="polite">Add <var class="v in" data-input="added">2</var> developers and <span class="v out" data-output="waiting2">22</span> changes wait.</p>
  <p class="live-model">Illustrative model: …</p>
</div>
<script type="module" src="../live.js"></script>
```

`live.js` turns each `var.in` into an inline `<input type="number">` (min, max, step 1, inputmode numeric) styled exactly like the static numeral (ink, 600, dotted underline, tabular numerals, width reserved for the max value), labelled by the `label` from the data (builder 1 passes it through as `data-label`; builder 2 uses it as `aria-label`). On change it recomputes and re-renders the sentences from `lines()`, keeps focus in the edited input, and follows C's NOTES (`../identity-specimens/c-letter/NOTES.md` "Production behavior"): with motion allowed, the output numeral rolls vertically about 180ms ease-out clipped to the line box and the edited input's underline widens briefly; under `prefers-reduced-motion: reduce` the numeral swaps instantly with a 600ms weight step. Keyboard: arrow keys step, the inputs are in tab order, the result paragraph announces politely. No library, no build step, under 150 lines.

## The publishing check (builder 2)

`node check.ts <paths…>` with no dependencies. Two kinds of input:

1. Figure data modules (`figures/*.ts`): validates the rules under "The data format" and prints one line per figure, "ok" or the violation.
2. Markdown essays (`*.md`): an essay embeds a figure as a fenced block with the language `figure` containing the figure's JSON, or front matter `figure: none` together with `figure_reason: <words>`. An essay with neither fails with: `<file>: no figure. Add a figure block or state a reason in front matter (figure: none, figure_reason: …).` An essay whose figure block fails validation reports the violation. Write two sample essays into `samples/` (one with a figure block, one with `figure: none` and a reason) and a third that fails, and show the three outputs in NOTES-live-check.md. The samples are fixtures, not content; three paragraphs of placeholder text drawn from `content.md` are enough.

Exit code 1 on any failure, so it can gate a commit later.

## The comparison page (builder 1)

`out/index.html`, generated by `build.ts`. D's title block markup, with SHEET "Figure grammar", REV. "experiment 2", today's date, same drawn-by line, no navigation. Then four sheets:

1. Figure 1: D's hand-built figure (copy its `<figure>` verbatim from D's index.html, including both SVGs) above the rendered one. On this page both orientations are shown side by side at all widths, each under a mono label "wide" / "narrow", so the comparison does not depend on the breakpoint. The rendered version carries the live sentence (live) and the generated table and text.
2. Figure 2: the same, hand-built above rendered.
3. Figure 3: rendered only.
4. A sheet "Data" showing the three data files as `<pre>` so a reviewer sees what the figure cost.

Screenshots at 360 and 1280 via `npx -y playwright screenshot --full-page --viewport-size=WxH` (Chromium is in `~/.cache/ms-playwright`; serve the folder with `python3 -m http.server` on a free port while capturing, bound to 127.0.0.1).

## Acceptance

- `node build.ts` regenerates `out/` from the data with no other input and no diff on a second run.
- Figures 1 and 2 at thumbnail scale are hard to tell from D's. Where they differ, NOTES.md lists each difference and whether the algorithm or D was right.
- Every rendered text label measures 14px or more at 360 (narrow) and 1280 (wide), checked by script as D did.
- No horizontal scroll at 360 and 1280.
- Contrast: unchanged from D, since the colors come from D's stylesheet; say so.
- The live sentence works with keyboard only, announces results, and is unchanged with JavaScript off except that the numerals are not controls.
- `node check.ts figures/*.ts samples/*.md` reports the three expected results and exits 1.

## What to record

NOTES.md and NOTES-live-check.md, in this order: what was built; the constants extracted and any value you changed from D and why; the generated text equivalent for Figure 3, quoted; a self-critique of the rendered figures against D (where the hand still wins); disagreements with this brief; and a one-paragraph answer to the experiment's question: did the hand-drawn quality survive the renderer?

Builders disagree in writing, not by quietly building something else. Do not commit. Do not modify anything outside `experiments/figure-grammar/`. Do not add dependencies.
