# Direction C: Letter, builder's notes

## 1. Typeface and accent

**Typeface: Instrument Sans** (variable: width 75 to 100, weight 400 to 700, roman and italic; SIL OFL). It is loaded from Google Fonts for this specimen only. The `<link>` is commented as temporary, and production must self-host it. I set Instrument Sans, Schibsted Grotesk, Bricolage Grotesque and Hanken Grotesk side by side at 72px and 19px before choosing:

- At display size, Instrument Sans has the most character without turning into a mannerism. The sharp terminals on a, t and f and the slightly narrow proportions read as a voice. Hanken read as default, Schibsted as a newspaper, and Bricolage as trendy.
- At text size it is calm and open, and it has a real italic. The pull quote needs that, because the brief allows no other device for it.
- The width axis lets the display size run at `wdth 92`. That tightens long headlines without a second family.
- Fallback: `"Helvetica Neue", Helvetica, Arial, sans-serif`. I checked the page with the webfont disabled. It holds up: the scale, rhythm and live sentence still work. Arial is wider, so the headlines take more room and the negative tracking looks a little tight. It stays legible and nothing overflows.

**Accent: vermilion `#b5300b`**, used only for links and for the five values in the live sentence. It is not ink blue, because blue underlined links on an off-white page in a grotesk is exactly the "default browser page" failure the brief warns about. A warm red-orange reads as a proofreader's mark: someone pointing at the number that matters. It keeps the page "never cold", and it fits the content, because the values it marks are the problem being shown.

**Surface `#fcfcfa`, ink `#161614`.** These are the nearest off-white and near-black. There are no other colors.

## 2. Contrast (WCAG 2.x relative luminance)

| Pair | Ratio | Use | Requirement |
| --- | --- | --- | --- |
| Ink `#161614` on paper `#fcfcfa` | 17.64:1 | all body, display, small text, table, labels | 4.5:1, pass |
| Accent `#b5300b` on paper `#fcfcfa` | 6.03:1 | links (text and small size), live-sentence values at display size | 4.5:1, pass |
| Focus outline (ink, 3px, offset 4px) against paper | 17.64:1 | every focusable element | 3:1, pass |
| Ink against accent (adjacent text) | 2.93:1 | values sitting next to ink words, links inside ink text | Not a contrast requirement. The difference never relies on color alone: links are underlined, inputs are bold and underlined, outputs are bold. |

The focus outline has a 4px offset, so the color next to it is always paper, never the accent text it surrounds.

## 3. Signature moves

**Live sentence.** It is set at the display size, directly under a small-size label ("Where the work waits", the figure's h2). It is two paragraphs, the before and the after, taken word for word from BRIEF.md. The values carry three cues:
- All values (`.v`) use the accent, weight 700 against the surrounding 500, and tabular lining numerals.
- The adjustable inputs (5, 1, 2) also get a thick underline.
- The computed outputs (14, 20) get weight only.

So "you can change these" and "this is the result" differ without relying on color, and a grayscale print still shows which is which. The caption, the text equivalent and the real `<table>` (with `<caption>`, `th scope="col"` and `th scope="row"`) follow at text size. The Review row is set in weight 650, and "Constraint: Review." follows the table in small size.

**Production behavior (not built).** The three inputs become inline `<input type="number">` or stepper controls styled as underlined numerals. Each sits inside the sentence and carries its own label, e.g. "developers". The second sentence lives in an `aria-live="polite"` region so screen readers hear the new result.
- With motion allowed: when a value changes, the output numeral rolls vertically (about 180ms, ease-out, clipped to the line box). The underline under the edited input widens briefly so the cause sits visibly next to the effect. Width is reserved with tabular numerals, so the line never reflows during the roll.
- Under `prefers-reduced-motion: reduce`: the numeral swaps instantly, and the change is marked by a 600ms weight step (700 to 800 and back), which is not movement. The live-region announcement is the same in both modes.

**Scale contrast.** There are exactly three sizes:
- display: `clamp(2.25rem, 0.95rem + 5.4vw, 7.5rem)`, which gives 36px at 360, about 57px at 768, about 86px at 1280 and 120px at 1920
- text: `clamp(1.125rem, 1.05rem + 0.3vw, 1.3125rem)`, 18 to 21px
- small: 0.9375rem, 15px, used only for section labels, metadata, the table caption, the constraint line and the footer colophon and links

Section titles (essay title, "Douglas", the essay subheading) stay at text size and are marked by weight. Nothing sits between the two big sizes. Display text uses weight 500, line-height 1.04 and `text-wrap: balance`. Tracking is -0.018em at small viewports and -0.032em from 48rem up, because tight tracking at 36px made "organizations are" collide on mobile.

**Status line.** It is the first line on the page, in text size and ink, with no label or icon. The navigation sits directly under it as a plain inline list, with EN/DE pushed to the right edge. EN is marked `aria-current` (ink, bold, no underline) and DE is an inert link, as content.md specifies.

**Rhythm.** All spacing is a multiple of one text line (`--line` = text size × 1.5):
- paragraphs: 1 line
- parts of a section: 2 lines
- between sections: `clamp(4 lines, 14vw, 8 lines)`

Whitespace is the only grouping device. There are no rules, borders, backgrounds or boxes.

## 4. Self-critique

**Usefulness.** The page answers "who, what, and how would this help my team" in the first screen: the status line, the headline, and a lead that names the role and the offer. The CTA is a plain link at text size, which is faithful to the brief but easy to miss. In production it is the one link I would test for findability. The figure is understandable without the table, and the table and text equivalent are both present. The essay and the work entry read like a letter's later pages: complete but quiet.

**Emotional fit.** Direct and grounded: yes. The voice and the large plain type carry it. "Never cold" is mostly carried by the warm off-white, the vermilion and the italic pull quote. Without the vermilion the page would tip toward austere. It does not read as unfinished at 1280 and 1920, because the scale contrast is too deliberate to be a default. At 768 the headline and live sentence are smaller, and the page is closest to "a nicely set blog".

**Pacing and emphasis at thumbnail scale.** There are two clear peaks: the headline, and the live sentence with its red numerals, which is the strongest single spot on the page and the memory hook. Below the figure the page is one long calm stretch: essay, then work, then footer. That is honest to the brief ("nothing in between"), but at thumbnail the bottom half is a uniform grey texture held apart only by the section gaps. It reads as designed because the gaps are large and consistent. It is still the weakest part of the composition.

**Coherence and resilience.**
- One family, three sizes, one accent and one spacing unit are applied everywhere.
- There is no horizontal scroll at 360, 768, 1280 or 1920 (checked: `scrollWidth == innerWidth`).
- At 200% root font size, simulating text-only zoom at 640px, nothing is lost or overflows. At that size the three-column table cannot fit, so it sits in a focusable, labelled scroll region (`role="region"`, `tabindex="0"`, `aria-labelledby` the caption). This is the two-dimensional scrolling exception WCAG 1.4.10 grants data tables, and at default size it never scrolls.
- Below 30rem the table drops to the small size, so cells do not fold into single words.
- The fallback font keeps the structure.
- `text-wrap: balance` keeps the 360px headline free of orphans ("...one bottleneck, / and it is rarely / the developers."). Browsers without it get ordinary ragged wrapping, which is acceptable at that measure.

## 5. Removal test

Mostly passes, with one honest caveat. Remove "clean.dev", "Martin", "Douglas" and the nouns, and what is left is very large plain statements, a sentence whose numbers are marked as things you could change, and calm long-form text with nothing decorative anywhere. That reads as "someone speaking plainly who shows you the numbers". The "lets you change them" part is only half true in the static specimen. The underlined inputs suggest adjustability, but nothing responds, so a first-time visitor may read the live sentence as an emphasized statement rather than a tool. Without the live behavior, the lower half of the page (essay and work) would pass as a well-set minimal template. The direction depends on the live sentence actually being live in production. If it ships static, it fails the test.

## 6. Disagreements, deviations and things I could not do

- **The underline on static inputs is a false affordance.** Underline means "link" elsewhere on the page, and here the numerals do nothing. I kept it because the brief's memory hook depends on the numbers looking adjustable, and because input numerals are bold as well (links are not). This is one of the two decisions I am least sure about.
- **No "clean.dev" home link in the navigation.** content.md lists only Writing, Work, Lab, Contact. A name link made "Contact" wrap alone at 360px, and the brief allows only the status line and nav as chrome. The name appears in the document title and in the lead. A letter without a letterhead is a defensible reading, but a production site probably needs the name visible at the top.
- **Section titles at text size.** The brief says "headlines very large, nothing in between". I made only the h1 and the live sentence display size. Essay title, company and subheading are text size plus weight, so the page has two peaks rather than five. The cost is a flat lower half (see pacing). This is the other decision I am least sure about. Setting the essay title at display size would give the bottom half a peak but would compete with the live sentence.
- **Small labels I added or reshaped.** "Where the work waits" (the content's figure title) is used as the small-size h2 label above the live sentence. In the work entry I joined Period and Role into one metadata line ("2024 to 2026. React Expert, then Technical Lead, then Solutions Architect."). I dropped the "Mandate:" and "Progression:" labels and kept their content verbatim, with the progression as an ordered list whose role names are bold. The live-sentence copy and the figure "20" come from BRIEF.md, not content.md.
- **Weights as hierarchy.** With one color and three sizes, weight (400, 500, 600, 650, 700) and the italic pull quote do all the remaining work. The pull quote's left indent is whitespace, not a rule.
- **Table scroll region.** This is an addition beyond "no JavaScript, plain table". It exists only for text-only zoom resilience, as described in section 4.
- **Fonts.** Google Fonts is a third-party request and a privacy concern for a DACH audience. It is acceptable for this specimen only, and the comment says so.
