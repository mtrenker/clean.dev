# Notes: live sentence and publishing check (builder 2)

## What was built

- `models/review-queue.js`: the model behind Figure 1's live sentence. Plain ESM with JSDoc types, imported unchanged by Node (`check.ts`, `render.ts`) and the browser (`live.js`). Exports `compute`, `lines`, the two rates `PER_DEVELOPER` and `PER_REVIEWER`, and `note`, the model stated in words, so the static "Illustrative model" line and the arithmetic come from one file.
- `live.js` (148 lines, no dependencies): turns each `var.v.in` into an inline `<input type="number">` and re-renders the sentences from `lines()` on every valid input. Styles are injected once as a small `<style>`, because the brief gives this builder no stylesheet. Nothing changes without JavaScript.
- `check.ts`: the publishing check, `node check.ts <paths…>`. Validates figure modules (every export with a `flows` array) and Markdown essays (a fenced `figure` block with JSON, or front matter `figure: none` plus `figure_reason`). Prints one line per figure or essay and exits 1 on any failure. It also exports `validate(figure)`, and the command line only runs under `import.meta.main`, so `build.ts` could import it without side effects.
- `samples/with-figure.md`, `samples/figure-none.md`, `samples/no-figure.md`: fixtures.

## The model and the sentence lines

`waiting = max(0, developers·4 − reviewers·6)`, `waiting2 = max(0, (developers + added)·4 − reviewers·6)`. Stated under the sentence as: "Illustrative model: each developer finishes four changes a week, one senior reviewer clears six. The figure shows one week." With D's inputs (5, 1, 2) that gives 14 and 22.

Lines as produced by `lines()` (inputs in brackets are controls, outputs are signal numerals):

| inputs | sentence 1 | sentence 2 |
| --- | --- | --- |
| 5, 1, 2 (default) | A team of [5] developers and [1] senior reviewer has 14 changes waiting for review. | Add [2] developers and 22 changes wait. |
| 3, 1, 1 | A team of [3] developers and [1] senior reviewer has 6 changes waiting for review. | Add [1] developer and 10 changes wait. |
| 1, 1, 1 | A team of [1] developer and [1] senior reviewer has no changes waiting for review. | Add [1] developer and 2 changes wait. |
| 1, 1, 0 | A team of [1] developer and [1] senior reviewer has no changes waiting for review. | Add [0] developers and the review queue stays clear. |
| 5, 2, 0 | A team of [5] developers and [2] senior reviewers has 8 changes waiting for review. | Add [0] developers and 8 changes wait. |

Plurals: developer/developers, senior reviewer/senior reviewers, change/changes, "1 change waits"/"n changes wait". Zero: sentence 1 says "has no changes waiting for review" (the output numeral is dropped, not printed as 0); sentence 2 says "and the review queue stays clear". Inputs keep the same order in every call, which `live.js` relies on to keep the input elements in place.

## The publishing check on the samples

```
$ node check.ts samples/*.md
samples/figure-none.md: ok
samples/no-figure.md: no figure. Add a figure block or state a reason in front matter (figure: none, figure_reason: …).
samples/with-figure.md: ok
$ echo $?
1
```

`with-figure.md` embeds Figure 1 as JSON, including the live sentence, so the sentence check (inputs within min..max, labels present, every input used by `lines()`, every output computed by the model) runs on it too.

Before builder 1's figures existed, I tested against the three figures copied from the brief plus a file of deliberate violations (in the scratchpad, not committed):

```
bad.ts noReason: caption is missing; the argument is authored, never generated; flow: end must be "arrow" or { stop: "<words>" }; flow, station 1 "A": queue.count must be a whole number, 0 or more; flow, station 1 "A": capacity.label is missing; flow has no constraint; mark one station or give the reason in noConstraint; sentence input "developers": value 30 is outside 1..20
bad.ts twoConstraints: flow has 2 constraints (A, B); a flow has exactly one
bad.ts unknownModel: sentence model "nope" not found in models/
fig1.ts fig1: ok
fig2.ts fig2: text does not name "review by Martin"
fig3.ts fig3: ok
```

Against builder 1's real figures, the full acceptance command (stderr, which only carries Node's typeless-module warning, omitted):

```
$ node check.ts figures/*.ts samples/*.md
figures/fig1.ts fig1: ok
figures/fig2.ts fig2: text does not name "review by Martin"
figures/fig3.ts fig3: ok
samples/figure-none.md: ok
samples/no-figure.md: no figure. Add a figure block or state a reason in front matter (figure: none, figure_reason: …).
samples/with-figure.md: ok
$ echo $?
1
```

The three sample results are the expected ones. The Figure 2 failure is a real finding about the brief's data; see disagreement 1.

## Keyboard, motion and announcements: what I verified and how

Tested in headless Chromium (Playwright from the npx cache) against a fixture page in the scratchpad that reproduces the brief's static markup, plus `data-label`, `data-min` and `data-max`, and links D's `styles.css` and fonts. The page was served from 127.0.0.1 and the server was stopped afterwards.

Verified by script:
- **Keyboard.** Tab reaches the three inputs in reading order (developers, senior reviewers, developers added). ArrowUp/ArrowDown step by 1, and the sentence updates on each step. Focus stays in the edited input after every re-render: the input elements are never moved or recreated, and only the text and output nodes around them are replaced. ArrowDown stops at `min`. Typing 99 into a field with max 20 and tabbing away clamps it to 20 and re-renders. An empty or out-of-range value while typing leaves the sentence as it was until the value is valid.
- **Names.** The accessibility snapshot shows `spinbutton "developers": "5"`, `spinbutton "senior reviewers": "1"` and `spinbutton "developers added": "2"`, each inside its sentence.
- **Look.** The inputs compute to the same weight (600), ink color and dotted underline as D's static `var.v.in`. Paragraph heights at 1280 are identical with and without JavaScript (98/49/98px).
- **Width (revised after the design owner's review at 1280).** Each input reserves exactly the max value's digit count in `ch` (`2ch` for max 20), with no padding or border, and the numeral is centered in that box. At 1280, `2ch` measures 46.00px against 45.25px for a static "10" in the same style, so the box is the width of two tabular digits plus 0.75px. Around a single digit, the only air left is the unused half-digit on each side, which is the cost of not reflowing. Stepping developers 5 → 9 → 10 leaves the next input at x = 552.23px every time, with paragraph heights unchanged and focus still in the input: no reflow. No horizontal scroll at 360.
- **Motion allowed.** On a change, three Web Animations run: the new numeral rolls up from below, the old one leaves upward (180ms ease-out, clipped by `overflow: clip` on the output span), and the edited input gets the `nudged` class, which thickens its underline for 240ms. After 700ms no animations and no leftover old numerals remain, and the output's text baseline is identical to its position before the roll (measured with a Range).
- **Reduced motion** (`reducedMotion: "reduce"`): no animations run. The output gets weight 800 for 600ms and returns to 600, and the input underline does not change.
- **Live region.** A MutationObserver on the `aria-live` paragraph recorded no mutations on load: the region is set to `aria-live="off"` while the `var` elements become inputs, and then restored to `polite` two frames later with `aria-atomic="true"`, so the whole sentence is read rather than just the changed number. Each change produces one sentence, e.g. "Add 3 developers and 26 changes wait." Under motion, the outgoing numeral sits in the region for 180ms as an `aria-hidden` span, so the raw `textContent` briefly reads "2622". The accessible text excludes it.
- **No JavaScript.** The static markup is the complete sentence. Nothing in `live.js` is needed to read it.

Not verified:
- What a real screen reader (NVDA, JAWS, VoiceOver, TalkBack) actually speaks, and whether the "mute during enhancement" step prevents an announcement on load in every browser and screen reader pair. I checked the DOM and the accessibility snapshot, not speech.
- Repeated rapid ArrowUp presses each queue a polite announcement. Screen readers usually drop superseded polite messages, but I could not confirm that.
- Firefox and Safari: only Chromium was run. `appearance: textfield` and the spin-button rules are intended to hide the steppers in Firefox and WebKit, but I did not look.
- Touch: `inputmode="numeric"` is set, but no mobile keyboard was tested.

## Disagreements with the brief

1. **Figure 2's authored text fails the brief's own rule.** The station is named "review by Martin" and the text says "Martin's review". The check reports `fig2: text does not name "review by Martin"`, so `node check.ts figures/*.ts samples/*.md` has two failures, not one. I did not loosen the check, because a literal match is what makes it trustworthy. The fix belongs in the data, and it is one phrase either way: rename the station "Martin's review", or write "…into review by Martin before it is merged" in the text. That is the design owner's call.
2. **The zero case is now "the review queue stays clear" (resolved).** Under this model `waiting2 >= waiting`, since `added >= 0`, so the brief's "clears" could never describe a queue emptying. The design owner changed the wording in the model.
3. **Only the second sentence is a live region.** Changing developers or reviewers also changes sentence 1's number, which is not announced, so a screen-reader user hears "Add 2 developers and 26 changes wait." without the new base number. I followed the brief. The alternative is to make the whole `.live` block one atomic polite region, which is louder but complete.
4. **The markup contract needs `data-min` and `data-max` on each `var.v.in`, next to `data-label`.** The brief only mentions `data-label`, but the inputs need their bounds from the data. Without them, `live.js` falls back to 0..99.
5. **Node prints a `MODULE_TYPELESS_PACKAGE_JSON` warning on stderr** for `check.ts` and `models/review-queue.js`, because the nearest `package.json` (the repo root) has no `"type": "module"`. Output and exit code are unaffected. With no `package.json` allowed in this folder, the options are `.mts`/`.mjs` names or running with `--disable-warning=MODULE_TYPELESS_PACKAGE_JSON`. I kept the brief's file names.
6. **`live.js` injects its own CSS.** The input styling belongs next to `.v.in` in D's stylesheet, but that file is out of bounds for this experiment. In production it should move there.

## Changes after the design owner's review (2026-10-14)

- Zero case reworded to "the review queue stays clear", as point 2 above argued. Changed in `models/review-queue.js` by the design owner.
- Both sentence paragraphs get `aria-live="polite"` (point 3). This lands in builder 1's static markup.
- Figure 2's text equivalent is reworded to name the station "review by Martin" (point 1). This lands in builder 1's `figures/fig2.ts`.
- `data-min` and `data-max` are emitted by the renderer (point 4).
- Input width is now exactly the max value's digit count in `ch`, with no padding or border and the numeral centered; previously `+0.15ch`. Retested in Chromium: no reflow from 9 to 10 (see "Width" above). `live.js` already mutes and restores every `aria-live` paragraph during enhancement, so two live paragraphs need no code change.
- Inputs size to the digits of their current value, not the max (design owner, after seeing the 2ch version rendered). The results already reflow the sentence when they change width, so reserving room at the inputs only added visible air. Retested in Chromium: ArrowUp from 5 to 10 widens the input from 1ch to 2ch, the roll still clips to its box, focus stays.
