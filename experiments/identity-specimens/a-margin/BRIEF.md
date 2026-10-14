# Direction A: Margin

## Thesis
This should feel like reading the notebook of a senior engineer who annotates systems as they read them: unhurried, precise, personal, never slick. The reader trusts marginal honesty over claims, so the page shows Martin's second thoughts beside the main text instead of hiding them.

## Emotional target
Trusted, calm, curious. Must not feel like a brochure, a Medium post, or a "tasteful developer blog" template.

## Center and intensity
Reading. Expression is welcome in the margins and in figures. It recedes completely in navigation, footer and links.

## Constructive grammar
- Surface: one paper-like surface for the whole page. Off-white with a slightly cool cast, not beige. No panels, no cards, no second surface color anywhere.
- Color: ink (near-black, not pure black) plus exactly one annotation color, used only for margin notes, figure strokes and link underlines. Choose it as a reviewer's pen would be chosen (a red-orange ink or a blue pencil), state the choice and the reason in NOTES.md.
- Type: a serious text serif for body and headings (candidates: Source Serif 4, Literata, Newsreader; load it, do not assume it). A humanist sans for margin notes, labels and metadata (Source Sans 3 is available in the repo at apps/web/src/app/_fonts/ and may be referenced by relative path, or loaded the same way as the serif). Body measure 60 to 70 characters. Hierarchy by size and space, not by weight extremes. Headline sizes should be large but still bookish, not poster-scale.
- Space and density: book-like rhythm. Generous vertical space between sections; tight, consistent paragraph spacing inside them.
- Geometry: none. No radius, no borders, no shadows. A thin ink rule is allowed only where a figure or table needs it.
- Imagery: line figures drawn in the annotation color, hand-set feel (SVG with 1px to 1.5px strokes, simple shapes, labels in the sans). No charts, no icons, no photos in this specimen.
- Motion: none beyond focus and link states.
- Voice: first person, candid, specific.

## Signature
1. Margin notes. On wide screens, notes sit in a true margin column beside the paragraph they comment on. On narrow screens they become inline asides that are visibly distinct from body text. They must carry real content: use them for Martin's counterpoint or caveat (for example beside the figure: "Software teams are not factories. The metaphor is useful, not complete." and beside the fleets excerpt: "Fleets still work for disposable prototypes. They stopped working when I had to own the result."). Never use a margin note for decoration.
2. Numbered figures with book-style captions ("Fig. 1  Where the work waits").
3. A colophon in the footer, set small, that says what the page is made of and why.

Memory hook: the margin note.

## Prohibitions
- No cards, no hero image, no gradients, no icon set, no badges or pills.
- No section may be a visual repeat of the previous one; vary density and scale deliberately.
- No "tracked uppercase label" eyebrow pattern.

## Removal test
If the name and nouns vanished, the page should still read as "someone who annotates systems and shows their working". If it reads as "nice blog", the direction has failed and NOTES.md should say so.
