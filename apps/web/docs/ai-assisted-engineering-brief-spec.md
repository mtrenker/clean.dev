# AI-assisted engineering practice brief: content, experience, and print specification

Status: approved. Martin approved this design, copy, information-architecture, print, and client-safety handoff
on 2 September 2026, subject to the corrections recorded in section 16, which are applied here.
Owner of this specification: Claude Opus 5 (product, copy, UX, interaction, visual, responsive, print, accessibility).
Parent outcome: #87. Implements: #116.
Date of specification: 2 September 2026.
Evidence base: repository state at commit `f01186e` in the `issue/116-…` worktree, plus the newest public CV
evidence in the primary checkout's unpushed commit `850e19e` ("Improve CV backend and AWS evidence"), inspected
on 2 September 2026.

This document is the single source of truth for `/work/ai-assisted-engineering`. A cold implementation agent
should be able to build the route, its content module, its screen composition, its print composition, and its
tests from this file alone, without reconstructing chat history, without inventing copy, and without making
product, claim-calibration, or client-safety decisions.

Everything under "Copy" is **exact**. Copy it character for character. Do not paraphrase, expand, reorder, or
"improve" it. Any change to a factual sentence is a claim change and belongs back with Martin.

---

## 1. Precedence, authority, and scope

1. Issue #116 is the scope contract. Where this document is silent, the issue governs. Where this document is
   explicit, it resolves the issue's open questions. Two deliberate deviations from the issue are recorded in
   section 15 and were approved by Martin on 2 September 2026 (decisions D6 and D7).
2. `apps/web/src/app/projects.ts`, `apps/web/src/app/lab.ts`, `apps/web/src/app/work/douglas-case.ts`, and
   `apps/web/src/lib/availability.ts` are the existing public factual record. **No sentence on this page may
   assert more than that record supports.** Where this page names a client outcome, it names one already
   published there.
3. Commit `850e19e` in the primary checkout is not on `origin/main` and not in this worktree. It refines the
   public backend evidence: the agent CLI is described as "Node.js/TypeScript", and the Solutions Architect
   scope now names TypeScript/Node.js (NestJS, Express) alongside C#/.NET. The copy in section 6 is written to
   be true both before and after that commit lands. **Do not cherry-pick it, and do not touch the primary
   checkout.**
4. `DESIGN_SYSTEM.md` at the repository root is **stale for the public site**. It documents the older
   `--background`/`--accent` HSL layer and primitives such as `.btn-primary`. The public site uses
   `@/components/site/public-design` and the `--site-*` tokens defined in `apps/web/src/app/globals.css`.
   Implement against the code and against section 8 of this document.
5. `apps/web/docs/homepage-positioning-spec.md` owns the homepage. `apps/web/docs/search-social-presentation-spec.md`
   owns site-wide metadata, canonical policy, and structured data. This document owns one route and adds one
   entry to the route table those documents established. It changes no existing rendered page content.
6. Private research sources (Martin's vault, the Douglas exit report, and the pi-clean working repository) were
   used to calibrate claims. **They are research, not source text.** Nothing from them appears in this
   repository except claims that survive section 5's safety rules. This document itself is public and is written
   to that same standard.

### Out of scope for #116

- German localisation. Section 7.4 states how the route table and content module accommodate German later.
- Any change to `/work`, its print CV, the homepage, navigation, or the sitemap's public membership.
- Publishing this brief as a blog article, or restoring Articles to navigation. That belongs to #84.
- A downloadable Markdown dossier equivalent to `/work/dossier`. Rejected in section 15.
- Analytics, share buttons, or link-copy affordances.
- A new visual identity or a reusable case-study template. This page establishes one real shape first.

---

## 2. What was inspected

| Evidence | Location | What it establishes |
| --- | --- | --- |
| Public primitives | `apps/web/src/components/site/public-design.tsx` | `SiteShell`, `SiteSection`, `SiteContainer`, `SectionHeader`, `Card`, `Tag`, `Eyebrow`, `ButtonLink`, `DefinitionList`, `PageHero` |
| Route/metadata table | `apps/web/src/lib/site-metadata.ts` | `ROUTES`, `buildRouteMetadata`, canonical, OG/Twitter, `robots`, `sitemap` membership flag |
| Sitemap | `apps/web/src/app/sitemap.ts`, `sitemap.test.ts` | Only `sitemap: true` routes are emitted; the test asserts exactly five static URLs |
| Unlisted-route precedent | `apps/web/src/app/workflow-simulator/page.tsx`, `docs-editor/page.tsx`, `reviews/[token]/page.tsx` | Inline `robots: { index: false, follow: false }` on pages outside `ROUTES` |
| Print system | `apps/web/src/app/globals.css` (`@media print`), `@page { margin: 1.5cm 1.8cm }` | A page providing `[data-print-document]` becomes the sole printed content; every other **direct body child** is hidden; fixed `--print-*` inks independent of site theme |
| Print composition precedent | `apps/web/src/app/work/print-cv.tsx`, `print-cv-data.ts` | Millimetre/point sizing, `PrintLabel` at 7pt mono, `break-inside-avoid`, render-ready model built from shared data |
| Print e2e precedent | `apps/web/e2e/work-print-cv.spec.ts` | Desktop-Chromium-only guard, `emulateMedia({ media: 'print' })`, `page.pdf({ format: 'A4', printBackground: true })`, attaching the PDF |
| Body-level layout | `apps/web/src/app/layout.tsx` | `IntlProviderWrapper` renders no DOM element, so a page's top-level fragment children are **direct body children**. The print CSS depends on this |
| Record/list grammar | `apps/web/src/app/work/portfolio-view.tsx` (`TimelineEntry`) | The site's existing ruled, columnar "record" pattern for chronological facts |
| Claim-calibration grammar | `portfolio-view.tsx` (`CaseEvidenceList`), messages `work.case.measured` / `work.case.observed` | The site already labels claims by evidence strength using `Tag` |
| Motion | `apps/web/src/app/globals.css`, `components/scroll-reveal.tsx` | `.observe` reveal is opt-in; reduced motion neutralises reveals, delays, marquee, bounce |
| A11y guards | `apps/web/src/test/a11y-source-guards.test.ts` | Arbitrary `text-[Npx]`/`text-[Nrem]` below 12px/0.75rem fails the build. **`pt` units are not covered**, which is why the print composition may use 7–9pt |
| Token contrast | `apps/web/src/test/a11y-design-tokens.test.ts` | Contrast maths for `--site-*` pairs; the four `Tag` tones already ship on `/work` |

### Measured colour headroom for the four claim tags

Computed from `globals.css` for both themes, text on `--site-panel`:

| Tag tone | Dark | Light | Role |
| --- | --- | --- | --- |
| green (`--site-green` text) | 6.75:1 | 4.83:1 | Team practice |
| amber (`--site-amber` border, `--site-ink` text) | pass | 4.05:1 border (non-text, needs 3:1) | Pilot |
| rust (`--site-rust` text) | pass | 5.48:1 | My own use |
| muted (`--site-ink-sec` text) | pass | 9.7:1 | Proposed |

All four pass at 12px semibold. **Colour is redundant here**: every tag carries its full word label, so the page
works in grayscale, in print, and for colour-blind readers without any change.

---

## 3. Experience brief

**Person and moment.** A recruiter, an agency intermediary, or a technical hiring manager. They asked Martin a
version of "what was the AI work at Douglas?" and received a link. They open it between other tabs, on a laptop
or a phone. Some will print it or save a PDF to attach to a candidate profile. Some will forward the URL.

**Job to be done.** In one sitting, decide four things: is this person credible about AI or repeating industry
noise; what did they actually do at a real enterprise client; how do they work now; and does a human still own
the result. Then decide whether to forward, book a call, or move on.

**Emotional arc.** They arrive mildly sceptical, because every engineer's profile now claims AI. They should
leave with the feeling of having read an engineer's own account of their work: dated, specific, and calibrated,
including the parts that did not go far. The single most valuable feeling to produce is *this person tells me
what did not work*.

**Anti-feeling.** It must not feel like a product page, a pitch deck, or a capability catalogue. No excitement
about the future, no transformation language, no implied scale that the evidence does not carry.

**Stakes and trust.** High and asymmetric. The repository, its history, this branch, the pull request, and the
issue are all public. A single unsafe client sentence is unrecoverable. A single unsupported number destroys the
page's only real asset, which is calibration.

**Constraints.** Existing `--site-*` tokens and `public-design` primitives. English only in this delivery.
One A4 page in print. Must be readable without the diagram. Must be honest about what "unlisted" means.

**Success signal.** After sixty seconds a cold reader can state, unprompted: the working principle, that Douglas
is the client evidence, that some of it was team practice and some was not, that checks run before a human
reads, and that a person owns the merge.

### Thesis

> This should feel **plain, dated, and calibrated**, because a sceptical hiring reader wants an engineer's own
> record rather than positioning, expressed through **a single reading column, a maturity tag in the left margin
> of every client claim, one structural workflow rail as the only diagram, and a closing block of things Martin
> refuses to claim**.

### Constitution

- **Emotional target:** grounded, specific, unhurried. **Must not feel** promotional, futuristic, or impressive.
- **Centre and intensity:** reading. Expression is welcome in exactly two places: the workflow rail and the
  maturity-tag margin. Everything else recedes to ruled text.
- **Constructive grammar:** one surface (`--site-bg`), panels only where the site already uses them; colour
  budget limited to rust for the accent, green for the deterministic gate, and the four tag tones; hierarchy
  carried by type size, weight, and 1px rules rather than by cards; density moderate on screen and high in
  print; geometry is the site's existing 2px/6px radius and hairline rules; no imagery; **no motion at all**.
- **Signature moves:** (1) the maturity tag column, which is simultaneously the honesty device and the scan
  path; (2) the five-stage rail with a drawn rework loop; (3) a first-person voice that names dates and says
  "I am not claiming".
- **Memory hook:** the rail plus the rework loop. A reader should be able to redraw five boxes and one arrow
  going backwards.
- **Prohibitions:** no tool logos or logo strip; no robot, brain, circuit, or network imagery; no gradient; no
  card grid; no percentage, multiplier, or time-saved claim anywhere in source, copy, metadata, or tests; no
  scroll-reveal animation; no colour-only meaning.

### Removal test

Strip the name and the nouns and the direction still asserts something specific: *client claims carry an
adoption maturity label, and the page ends with what the author will not claim*. That is not a generic
consulting page.

---

## 4. The 60-second scan path

Everything a skimmer needs is a heading, a tag, or a stage label. Nothing load-bearing lives only inside a
paragraph.

| Time | What the eye lands on | What it establishes |
| --- | --- | --- |
| 0–5s | Eyebrow "Practice brief", H1, subtitle | This is an engineering brief, not an AI product page |
| 5–15s | Lead paragraph, then the three principle labels: "Bounded, not autonomous", "Checkable, not trusted", "Owned, not delegated" | The working principle, in three phrases |
| 15–30s | The five rail labels, left to right, and the rework loop | Bounded context, deterministic checks, human review, integration ownership |
| 30–48s | The Douglas section heading, the scope sentence, then the tag column and the eight claim headlines | Martin drove adoption inside one team, and each item is graded rather than asserted |
| 48–55s | "How I work now" item labels | The practice continued and deepened after the client |
| 55–60s | "What I don't claim" heading and its four opening phrases | Calibration, and permission to trust the rest |

The tools section and the lessons section are deliberately **not** on the scan path. They reward the second,
slower read. This is the two-speed requirement: each section survives being skimmed by its heading and one
strong cue, and repays being read.

---

## 5. Client-safety rules (binding)

These rules bind the implementation, the tests, the commit messages, the branch, and the pull request body.

**Never commit, render, or reference:**

1. Names of client-internal repositories, packages, CLIs, platforms, boards, or assistants. Describe them by
   function instead. The public record already does this correctly: "a Node.js/TypeScript agent CLI giving AI
   agents governed access to Jira, Confluence, Azure DevOps, and internal tooling".
2. Names, roles, or characterisations of individual client staff. No engineering manager, no product owner, no
   architect, no board, no stakeholder, named or describable.
3. Internal URLs, hostnames, DevOps organisation paths, ticket identifiers, or document titles.
4. Prompts, instruction files, skill contents, screenshots, slides, or any client artefact.
5. Governance, architecture-board, or decision-process conflict of any kind, including neutral summaries. The
   entire subject is out of scope for this page.
6. Commercial facts: budgets, rates, licence costs, SaaS pricing, approval dates, contract length, contract
   reduction, or cost-cutting.
7. Any quantitative productivity claim: percentages, multipliers, hours saved, velocity, throughput,
   story-point deltas, "faster", or "more productive" as a measured assertion.
8. Any scale figure other than the ones already published on `/work`: "more than 1,200 stores", "14 European
   countries". Larger figures exist in private notes. Do not use them.
9. Any statement that this route is private, protected, hidden, or confidential.

**Maturity discipline.** The Douglas exit report warned that early drafts overstated how mature and team-wide
the AI work was, and it could not settle the team's position. **Martin's firsthand account of 2 September 2026
resolves that and is the source of truth** (decision D10): he drove the adoption inside his own team, and the
team progressed through Copilot, OpenCode, and Pi, settled on Pi, and shipped two production systems with
agents. Every Douglas claim is graded with one of the three labels in section 6.4, and no claim may be
upgraded without new evidence from Martin. The scope boundary is the thing that must never soften: this was
one team, not Douglas.

**Attribution discipline.** Martin's current independent setup (his harness, his extensions, his GitHub
workflow, his second-model review, his local models) is **his**. It must never be rendered inside the Douglas
section, must never share a container with it, and must never be described with "we".

**Public-source safety review gate.** Before the pull request is opened, a human must read every client-specific
sentence in the rendered page, the print output, the metadata, the content module, and the tests, against these
nine rules. This gate is manual by design. Automated tests (section 12) cover the mechanical patterns only;
they cannot cover proper nouns, because listing the forbidden proper nouns in a public test file would publish
them. Do not write such a list.

---

## 6. Copy (exact)

Voice: first person, past tense for the client, present tense for current practice. Plain words. Sentence case
headings. Straight quotes. No em dashes. No exclamation marks. No rhetorical questions.

### 6.1 Header

| Field | Exact value |
| --- | --- |
| Eyebrow | `Practice brief` |
| H1 | `AI-assisted engineering in practice` |
| Subtitle | `From driving team adoption at Douglas to my current multi-harness workflow` |
| Meta line | `Martin Trenker · Technical Lead and Solutions Architect · September 2026` |
| Print action label | `Print or save as PDF` |
| Print action hint | `One A4 page.` |

Lead paragraph:

> `I use coding agents on real delivery work: first driving adoption inside a client team at Douglas, now as the normal way I build, investigate, and review software. This is a short account of what that looks like in practice, what a team adopted, what stayed an experiment, and what I still will not claim.`

### 6.2 Section 2, the working principle

Heading: `The principle I work by`

Body:

> `An agent can produce a change. It cannot be accountable for one. So the work is arranged around the part that does not transfer: a task small enough to state, context narrow enough to check, checks that fail without a human opinion, and a person who reads the diff before it merges.`

Three principles, each a label and one sentence:

| Label | Sentence |
| --- | --- |
| `Bounded, not autonomous` | `An agent gets one stated task at a time, in its own checkout, with the scope written down before it starts.` |
| `Checkable, not trusted` | `Types, lint, tests, and the build run before anyone reads the result. A failing gate ends the run.` |
| `Owned, not delegated` | `Whoever merges a change answers for it. Review capacity, not model output, is what limits how fast this goes.` |

### 6.3 Section 3, the workflow

Heading: `One change, end to end`

Intro:

> `This is the loop, whether the work is mine or a team's. It is deliberately boring, and every stage exists because skipping it produced something nobody could stand behind.`

Five stages. `number` is display-only; `label` is the scan cue; `caption` is one sentence.

| # | Label | Caption |
| --- | --- | --- |
| `01` | `Bounded task and context` | `One issue with stated scope, constraints, and acceptance criteria, plus the part of the system it is allowed to touch.` |
| `02` | `Agent work in isolation` | `The agent works in its own checkout, so a bad run costs a discarded worktree instead of a working copy.` |
| `03` | `Deterministic checks` | `Types, lint, tests, and the build run first. A failing gate ends the run before a human spends attention on it.` |
| `04` | `Human review` | `I read the diff. A change I cannot explain goes back to stage 02, and that loop is normal rather than a failure.` |
| `05` | `Integration` | `A pull request, a merge, and a named person who answers for the result.` |

Loop note (rendered as real text in every viewport and in print, adjacent to the rail):

> `Review sends unclear work back to stage 02. Agents do not merge, approve, or publish reviews.`

Stage `03` is the deterministic gate and is the only stage whose rail tick is drawn in `--site-green`. The
meaning is carried by the caption; the colour is redundant.

### 6.4 Section 4, Douglas

**Superseded, 2 September 2026.** The first version of this section was calibrated from the Douglas
exit report, which warned that early drafts overstated maturity and left the team's position unclear.
Martin's firsthand account resolves that uncertainty and is now the source of truth: he drove the
adoption inside his own team. Decisions D2 and D3 are superseded by D10 in section 16, the four-level
maturity key is replaced by three truthful levels, and the claims below replace the earlier ones.
This is a replacement, not an expansion: the section carries eight claims where it carried nine.

Heading: `Client application: Douglas, 2024 to 2026`

Meta: `React expert to Technical Lead to Solutions Architect · POS and CRM platform`

Intro. The scope boundary is stated in the opening paragraph and must never be softened:

> `I joined Douglas to modernise the point-of-sale and CRM software used in more than 1,200 stores across 14 European countries, and stayed for two and a half years, ending as Solutions Architect. I drove the adoption of AI-assisted engineering inside my team: securing access, introducing terminal agents, setting up the weekly slot where we compared tools, and connecting all of it to what we shipped. That was my team, not Douglas as a whole, and this section is about what the team did rather than what the company did.`

**Maturity key.** Three levels, because three are true. The earlier `My own use` and `Proposed`
levels described a Martin-only demonstration and a handover proposal that the corrected account and
Martin's removal instruction have both taken off the page; keeping them to preserve a four-label
pattern would be decoration.

| Label | Definition (exact) | Tone |
| --- | --- | --- |
| `Adopted` | `Settled into how the team worked.` | green |
| `Tried` | `Tested deliberately in the weekly workshop. Not everything was kept.` | amber |
| `Shipped` | `Went to production with the team accountable for it.` | rust |

**Eight claims.** Print renders the label and `sentences[0]` of the selected ones.

**C1 · Adopted · `I got the whole team access.`**
1. `When Douglas announced its Copilot pilot I secured licences for every engineer on my team, and the product owner.`
2. `Tooling that only some people have is not adoption. It stays a pocket of practice and it leaves when that person leaves.`

**C2 · Adopted · `A weekly workshop is where adoption actually happened.`**
1. `We kept two hours a week to compare tools, workflows, and whatever was new, together rather than alone.`
2. `That standing slot is what turned scattered experiments into a shared way of working, and it is the first thing I would set up again.`

**C3 · Tried · `Out of the editor and into the terminal.`**
1. `I introduced terminal agents, and we worked through Copilot in VS Code, then OpenCode, then Pi.`
2. `Moving out of the editor changes review from approving each edit to judging the intent, the run, and the result. Not everything we tried in those sessions survived them.`

**C4 · Adopted · `We settled on Pi for that period.`**
1. `It was the most flexible of the three and the one that left us feeling we understood what we owned.`
2. `A harness small enough to read is a harness a team can argue about, extend, and be responsible for.`

**C5 · Adopted · `Shared agent resources, versioned like code.`** (unchanged)

**C6 · Adopted · `Controlled access, not open access.`** (unchanged)

**C7 · Shipped · `The short-link and QR service, in weeks.`**
1. `The team used agents both to learn the ground and to build it, and it went from request to production in weeks.`
2. `It replaced a third-party service that no longer fitted the business need. It is in my project record as a delivery outcome, not as an AI result.`

**C8 · Shipped · `The unified CRM API, designed by the team.`**
1. `The team designed the gateway that put the microservice landscape behind one REST and GraphQL interface.`
2. `Agents wrote the implementation end to end. The architecture, the reviews, and the production result stayed with the team, which is the only arrangement I would put a system like this into production under.`

Section-closing line, which carries the scope boundary a second time and the personal learning that is
no longer a claim of its own:

> `All of this happened inside my team rather than across Douglas. It is also where I learned C# and .NET with agent help while delivering the API, which I mention as part of how the work happened rather than as a claim of accumulated depth.`

**Replaced or removed.** `editor-first` and `learning-session` are replaced by C1 and C2, which say
who acted rather than what happened. `terminal-agents` is rewritten to name Martin as the person who
introduced them and to carry the full progression. `planning-slicing` is removed as generic
experimentation. `agent-supported-delivery` is split into C7 and C8 so each production system carries
its own concrete outcome. `learning-dotnet` moves into the closing line. `handover-proposals` is
removed on Martin's instruction: it diluted the adoption and delivery story.


### 6.5 Section 5, current independent practice

Heading: `How I work now`

Meta: `Independent practice, 2026`

Intro:

> `Since the engagement ended, this has become the normal way I work, on my own products and on client work. It is my setup rather than a client's, and it is where the practice went deeper than a team could reasonably be asked to go.`

Seven items, each a label and one or two sentences. **Print renders the label and the first sentence only.**

**P1 · `One issue, one worktree, one pull request.`**
1. `Work is admitted from a GitHub issue that states scope and acceptance criteria, and gets its own isolated checkout.`
2. `A script creates it, so parallel work never shares a working copy. That is what makes it safe to let a run go wrong.`

**P2 · `A harness small enough to read.`**
1. `Four tools by default, read, write, edit, and shell, extended with my own TypeScript.`
2. `Knowing what the harness actually contributes, from the system prompt to the tool-call loop, is what makes the output judgeable instead of magic.`

**P3 · `Guardrails instead of permission prompts.`**
1. `A guard inspects tool calls and refuses secrets files and destructive shell commands before they run.`
2. `I am not clicking approve all day in order to feel safe, because a prompt you approve two hundred times a day is not a control.`

**P4 · `Sessions I can watch.`**
1. `Agents run in visible terminal sessions I can focus, interrupt, and take over.`
2. `An agent that is blocked is something to look at, not something to wait out.`

**P5 · `More than one harness, on purpose.`** (replaces the earlier "The author is not the only
reviewer", which presented a second model as a rule for every change. It is not one.)
1. `Pi is the harness I extend, Claude Code does most of the coding, and Codex covers general work.`
2. `When a change matters I have a different model look at it, because the one that wrote it is a poor judge of whether it was a good idea. That is a decision per change rather than a ritual.`

**P6 · `Design has a named owner.`**
1. `Product, interaction, and architecture decisions are written down before implementation starts.`
2. `They are assigned deliberately, and an implementing agent that reaches an unresolved design question stops and hands it back rather than inventing one. That is the single rule that keeps this from producing confident nonsense.`

**P7 · `Nothing irreversible without me.`**
1. `Agents do not merge, approve, delete branches, or take any other protected remote action on their own.`
2. `The local permissions are relaxed so that routine reads and tests do not interrupt me. The remote ones are not.`

### 6.6 Section 6, tools

Heading: `The tools, and what each one was for`

Intro:

> `I have used these in real work rather than evaluated them for a comparison. Each one is here because it changed something, and each entry is dated because this landscape does not hold still.`

Six entries, rendered as a dated record list, never as logos or cards. Fields: `name`, `context`, and
`sentences`; `+` in the table separates the sentences, and print renders the first as the tool's
purpose, so every tool prints with a role rather than a name and a date.

| Name | Context | Role (exact) |
| --- | --- | --- |
| `GitHub Copilot` | `2025 · client team` | `Where the team started, inside VS Code, after I had already been using it on my own projects.` + `It made assistance normal, and it showed the limit of approving every edit by hand.` |
| `OpenCode` | `2026 · client team` | `The first step out of the editor and into a terminal agent.` + `It moved review from each edit to the intent, the run, and the result, and it raised the question of how to share agent resources across repositories and tools.` |
| `Pi` | `2026 · client team, then mine` | `A deliberately small harness with four default tools and extensions written in TypeScript.` + `The team settled on it because it was the most flexible of the three, and it is still the harness I extend.` |
| `Claude Code` | `2026 · my own work` | `My main coding agent, and where larger implementation work happens.` + `The design is written down before any code, with an explicit review pass afterwards.` |
| `Codex` | `2026 · my own work` | `General work, and a second environment and model when a different angle helps.` + `Sometimes that angle is a review of something another agent wrote, which is a choice per change rather than a rule.` |
| `Local models` | `2026 · my own work` | `Run on my own machine for privacy-sensitive experimentation and to evaluate what smaller local models can and cannot do.` + `They are not what I reach for on client delivery.` |

Evidence link (approved, decision D5). Render one line below the list, on screen only:

> `My own harness extensions are public: github.com/mtrenker/pi-clean`

### 6.7 Section 7, lessons

Heading: `What I take from it`

Five numbered lessons. **Print renders the label and the first sentence only.**

**L1 · `Context beats prompting.`** `Most bad agent output is missing context, not a weak model. The work that pays off is deciding what the agent is allowed to see and telling it what already exists.`

**L2 · `Slice for the reviewer, not the agent.`** `If a change is too large for a person to review honestly, it was cut for the wrong reader. An agent will happily accept a task nobody can check.`

**L3 · `Review capacity is the real limit.`** `Generating more changes than a team can review moves the queue, not the work. Two pull requests waiting on a human is already a full pipeline.`

**L4 · `Deterministic tooling is what makes any of this checkable.`** `Types, tests, and a command-line interface with a documented contract turn "looks right" into "passes". Without them there is nothing to disagree with.`

**L5 · `Ownership does not transfer.`** `The person who merges a change answers for it, in review, in an incident, and a year later.` `That does not become less true because a model wrote the first draft.`

### 6.8 Section 8, what is not claimed

Heading: `What I don't claim`

Four items, each a label and one sentence. This block is rendered as a single bordered note, not as cards.

| Label | Sentence |
| --- | --- |
| `I am not an ML researcher.` | `I do not train, fine-tune, or evaluate models. I build software and use these tools to do it.` |
| `I have no productivity number.` | `The teams I worked with did not measure one, and a percentage without a baseline is decoration.` |
| `Nothing here merged unattended.` | `Every change went through deterministic checks and a person before it merged.` |
| `This was one team, not Douglas.` | `I drove this inside my own team. Nothing here says the company adopted it, and the labels say how far each item got.` |

### 6.9 Colophon and close

Colophon note (rendered near the end on screen, and as the print footer's first line):

> `This page is not in the site navigation and asks search engines not to index it. That is not privacy. The URL, this site, and its source history are public, so everything here is written to be safe in the open.`

Close (screen only):

> `The engagement record behind this page, with the projects, dates, and outcomes it refers to, is on the work page.`

Two links, in this order:

| Label | Href | Variant |
| --- | --- | --- |
| `See the engagement record` | `/work#douglas` | secondary |
| `Get in touch` | `/contact` | primary |

Print footer line (after the colophon note):

> `Martin Trenker · clean.dev · info@clean.dev`

---

## 7. Route, metadata, and indexing policy

### 7.1 Route

`/work/ai-assisted-engineering`, implemented at
`apps/web/src/app/work/ai-assisted-engineering/page.tsx`. No dynamic segment exists under `/work`, so there is
no routing conflict. The path is stable and must not change after the pull request merges; it is the shareable
identity of the page.

### 7.2 Route table entry

Add one entry to `ROUTES` in `apps/web/src/lib/site-metadata.ts` with a new `RouteKey` of `aiPractice`:

```ts
aiPractice: {
  path: '/work/ai-assisted-engineering',
  sitemap: false,
  robots: { index: false, follow: false },
  copy: { en: { … }, de: { … } },
},
```

| Field | Exact value (both locales, see 7.4) |
| --- | --- |
| `title` | `AI-assisted engineering in practice \| clean.dev` |
| `description` | `How AI-assisted engineering worked inside a client team at Douglas, and how coding agents fit into my daily work: bounded tasks, deterministic checks, human review.` |
| `ogTitle` | `AI-assisted engineering in practice` |

`buildRouteMetadata('aiPractice', locale)` then supplies the canonical (`/work/ai-assisted-engineering`), the
existing shared OG/Twitter image, and `robots`. Adding the route this way, rather than hand-writing inline
metadata like `/workflow-simulator` does, is deliberate: it makes the indexing policy declarative, puts the copy
under the existing `site-metadata.test.ts` loop, and keeps the sitemap decision in one table.

### 7.3 Indexing, sitemap, navigation

- `sitemap: false` keeps the route out of `sitemap.ts`, whose filter is `route.sitemap === true`. The existing
  `sitemap.test.ts` assertion that exactly five static URLs are emitted keeps passing and becomes a regression
  guard. Add an explicit `not.toContain` assertion anyway (section 12).
- `robots: { index: false, follow: false }` emits `<meta name="robots" content="noindex, nofollow">`.
  `follow: false` matches the other unlisted routes. Every outbound link on the page points at pages that are
  already indexed, so nothing is lost.
- `apps/web/src/app/robots.ts` is **not** changed. Adding the path to `disallow` would make the route more
  discoverable, not less, because `robots.txt` is itself public and enumerates what it names.
- The route appears in **no** navigation: not in `AppNavigation` items, not in `AppFooter` links, not on the
  homepage, not on `/work`, not in the RSS feed, not in structured data. `/work` must not link to it.
- **No JSON-LD.** The layout already emits site-level `Person`/`WebSite` structured data. This page adds none.
- The honest boundary is stated in the copy (section 6.9) and must not be softened. The page never says
  private, hidden, confidential, or protected.

### 7.4 English-only delivery and the German seam

The page is English. The route table requires both locales, so the `de` entry carries the **identical English
strings**, with a code comment stating that this is intentional for the first delivery and that German copy
replaces it when localisation lands. `site-metadata.test.ts` asserts the two are identical, so the decision is
visible rather than accidental.

The content module (section 9) uses **plain English strings**, not `{ en, de }` maps. A half-filled locale map
would encode a promise the delivery does not keep. Adding German later means introducing the map in one module
and one view, which is a bounded change.

`SiteShell` gains an optional `lang` prop, and this page passes `lang="en"` so the `<main>` element declares its
language while the surrounding chrome stays in the visitor's locale. The print document root carries `lang="en"`
too. Without this, a German visitor's screen reader pronounces the entire brief with German phonetics.

---

## 8. Visual system

No new tokens, no new colours, no new fonts.

| Role | Value |
| --- | --- |
| Page surface | `--site-bg` via `SiteShell` |
| Panels | `--site-panel` via `Card`, used only for the maturity key and the "What I don't claim" note |
| Rules | `--site-rule` hairlines; `--site-ink` for section-header underlines (existing `SectionHeader`) |
| Body text | `--site-ink-sec` |
| Headings, labels | `--site-ink` |
| Accent | `--site-rust` for the eyebrow, rail ticks, numbers, and the primary link |
| Gate | `--site-green` for stage 03's rail tick only |
| Mono | numbers, labels, tags, meta lines, tool contexts |

Type scale on screen:

| Element | Size |
| --- | --- |
| H1 | `text-[clamp(2.4rem,5.5vw,4rem)]`, `font-medium`, `tracking-[-0.045em]`, `leading-[0.98]` |
| Subtitle | `text-xl md:text-2xl`, `--site-ink-sec` |
| Lead | `text-lg leading-8`, `--site-ink-sec`, capped at `max-w-[46rem]` |
| Section headings | existing `SectionHeader` (`text-3xl md:text-5xl`) |
| Claim headline | `text-base font-semibold`, `--site-ink` |
| Body sentences | `text-base leading-7`, `--site-ink-sec` |
| Labels, tags, meta | `font-mono text-xs uppercase tracking-[0.16em]` |

The H1 is one step smaller than `PageHero`'s `clamp(3.2rem,8vw,6.5rem)`. `PageHero` is tuned for a landing
gesture; this is a document, and a document that shouts at the top reads as marketing.

**Reading measure.** All sustained prose is capped at `max-w-[46rem]`, roughly 68 characters at the site's body
size. The rail, the claim list, and the tool record use the full `SiteContainer narrow` width of `62rem`.

**No `.observe`, no `delay-*`, anywhere on this page.** A brief that people print, screenshot, and scan must be
complete at first paint. This also makes the reduced-motion behaviour trivially correct: there is no motion to
reduce. The only transitions are the inherited hover and focus transitions on links and the print button. This
is a deliberate, documented departure from the other public pages.

---

## 9. Structured content source

One module, `apps/web/src/app/work/ai-assisted-engineering/practice-brief.ts`, is the single factual source for
both compositions. Neither composition may hard-code a fact.

```ts
export type ClaimMaturity = 'team' | 'pilot' | 'mine' | 'proposed';

export interface MaturityDefinition {
  id: ClaimMaturity;
  label: string;      // 'Team practice'
  definition: string; // 'Part of how the team worked.'
  tone: 'green' | 'amber' | 'rust' | 'muted';
}

export interface LabelledItem {
  id: string;
  label: string;
  sentences: [string, ...string[]]; // print renders sentences[0] only
}

export interface Claim extends LabelledItem {
  maturity: ClaimMaturity;
}

export interface WorkflowStage {
  number: string;   // '01'
  label: string;
  caption: string;
  gate?: true;      // stage 03 only
}

export interface ToolEntry {
  id: string;
  name: string;
  context: string;  // '2025 · client team'
  role: string;
}

export interface PracticeBrief {
  eyebrow: string;
  title: string;
  subtitle: string;
  lead: string;
  meta: string;
  print: { action: string; hint: string; footer: string };
  principle: { heading: string; body: string; items: LabelledItem[] };
  workflow: { heading: string; intro: string; stages: WorkflowStage[]; loopNote: string };
  client: {
    heading: string;
    meta: string;
    intro: string;
    maturities: MaturityDefinition[];
    claims: Claim[];
    closing: string;
  };
  practice: { heading: string; meta: string; intro: string; items: LabelledItem[] };
  tools: { heading: string; intro: string; entries: ToolEntry[]; evidenceLink?: { label: string; href: string } };
  lessons: { heading: string; items: LabelledItem[] };
  limits: { heading: string; items: LabelledItem[] };
  colophon: string;
  close: { body: string; links: Array<{ label: string; href: string; variant: 'primary' | 'secondary' }> };
}

export const practiceBrief: PracticeBrief = { … };
```

Rules the module must satisfy, enforced by tests in section 12:

- `client.claims` has eight entries and covers all three maturity values it declares.
- Every `sentences[0]` in `client.claims`, `practice.items`, and `lessons.items` is at most **120 characters**,
  the print standalone budget.
- The module exports `PRINT_SELECTION` (claim, practice, and lesson ids) and `buildPrintBrief`, which projects
  the printed sheet. Every string the projection returns is lifted verbatim from `practiceBrief`; the test
  asserts it, which is the contract that stops screen and print drifting apart.
- `tools.entries` carry `sentences` like every other item, so print takes the first as the tool's purpose.
- `workflow.stages` has exactly five entries; exactly one carries `gate: true`; it is `03`.
- `tools.entries` has exactly six entries whose `name` values are, in order: GitHub Copilot, OpenCode, Pi,
  Claude Code, Codex, Local models.
- The module exports `APPROVED_DISCLAIMERS`, the exact sentences that are permitted to name a quantitative
  concept in order to deny it. It contains exactly the two approved disclaimers:
  `I have no productivity number.` and
  `The teams I worked with did not measure one, and a percentage without a baseline is decoration.`
- After those exact strings are removed, no remaining string in the serialised module matches `/\d+\s*%/`,
  `/\b\d+\s*x\b/i`, or `/\b(productivity|efficiency|velocity|throughput|faster|quicker|time saved)\b/i`.
  Guarding assertions rather than vocabulary is what lets the page deny a productivity number without the
  guard rejecting the denial. Adding a sentence to `APPROVED_DISCLAIMERS` is a deliberate, reviewable act.

---

## 10. Screen composition

Component seams:

| File | Responsibility |
| --- | --- |
| `.../ai-assisted-engineering/page.tsx` | Server component. `generateMetadata` via `buildRouteMetadata('aiPractice', locale)`. Returns a **fragment** whose children are the screen view and the print document. |
| `.../practice-brief.ts` | The structured source (section 9) |
| `.../practice-brief-view.tsx` | Screen composition. Server component, no state |
| `.../practice-brief-print.tsx` | Print composition, `data-print-document` |
| `.../workflow-rail.tsx` | The five-stage rail, `variant: 'screen' \| 'print'` |
| `.../print-action.tsx` | `'use client'`, the only client component on the route |

**The fragment matters.** `IntlProviderWrapper` renders no DOM element, so page children are direct body
children, which is what the `@media print` rule in `globals.css` selects against. Wrapping the two compositions
in a `<div>` breaks printing site-wide for this route. `apps/web/src/app/work/page.tsx` is the working
precedent; copy its shape.

Section order and structure, top to bottom:

1. **Header.** `SiteSection className="py-10 md:py-14"` + `SiteContainer narrow`. `Eyebrow` → H1 → subtitle →
   lead → meta line → print action. The print action sits on the meta row, right-aligned from `md`, stacked
   below on narrow. It carries `print:hidden`.
2. **The principle I work by.** `SectionHeader` + body paragraph + a three-item `<dl>`, `md:grid-cols-3`,
   separated by top rules rather than card borders.
3. **One change, end to end.** `SectionHeader` + intro + `WorkflowRail variant="screen"` + loop note.
4. **Client application: Douglas, 2024 to 2026.** `SectionHeader` with `meta`. Intro. Maturity key in a single
   `Card` (`p-5`), rendered as a `<dl>` of four label/definition pairs, `sm:grid-cols-2 lg:grid-cols-4`. Then
   the claim list, then the closing line.
5. **How I work now.** `SectionHeader` with `meta`. Intro. A `<dl>`, `md:grid-cols-2`, ruled rows.
6. **The tools, and what each one was for.** `SectionHeader`. Intro. An `<ol>` in the site's existing record
   grammar: `md:grid-cols-[11rem_9rem_1fr]`, rows separated by `border-t border-[var(--site-rule)]`, name in
   `--site-ink` semibold, context in mono `--site-ink-mute`, role in `--site-ink-sec`. Optional evidence link
   below.
7. **What I take from it.** `SectionHeader`. An `<ol>` with mono rust numbers, `lg:grid-cols-2`.
8. **What I don't claim.** `SectionHeader`. One `Card` with `border-l-4 border-l-[var(--site-rust)] p-6`,
   containing a `<dl>` of four label/sentence pairs.
9. **Close.** `SiteSection border={false}`. Colophon note in mono `text-sm`, `--site-ink-mute`, then the close
   paragraph, then the two `ButtonLink`s.

### The claim list, the signature composition

```
md and up:            below md:
┌──────────┬────────┐ ┌────────────────┐
│ Tag      │ Head   │ │ Tag            │
│ (9rem)   │ …sent. │ │ Headline       │
└──────────┴────────┘ │ …sentences     │
                      └────────────────┘
```

A `<ul>`. Each `<li>` is a grid, `md:grid-cols-[9rem_1fr] md:gap-6`, with a top rule and `py-5`. The left cell
holds the existing `Tag` component at the mapped tone. The right cell holds the headline (`font-semibold`,
`--site-ink`) followed by the sentences as separate paragraphs at `max-w-[46rem]`.

Putting the tags in a fixed left column is the whole point: it creates a vertical scan strip where a reader
sees the adoption grading before reading a word of the claim. Below `md` the tag stacks above the headline and
keeps its full text label.

### The workflow rail, screen

```
   ══════════════════════════════════════════════════════════   ← 2px --site-rule
    ▌01          ▌02          ▌03(green)    ▌04          ▌05    ← ticks
    Bounded      Agent work   Deterministic Human        Integration
    task and     in           checks        review
    context      isolation
    caption      caption      caption       caption      caption

         ┌───────────────────────────────────┐
         └── rework ─────────────────────────┘                  ← dashed U, 04 → 02
```

- `<ol>` with `lg:grid-cols-5 gap-6`. Each `<li>` is a stage.
- The rule is a `border-t-2 border-[var(--site-rule)]` on the `<ol>` itself.
- Each tick is a `2px × 10px` block in `--site-rust` (`--site-green` when `gate`), rendered with `aria-hidden`,
  sitting flush under the rule.
- The rework path is a single `aria-hidden` div spanning grid columns 2 to 4, with dashed left, bottom, and
  right borders in `--site-ink-faint` and a centred mono `rework` label on the bottom edge. Rendered at `lg`
  only.
- The loop note (section 6.3) is **always rendered as text**, at every viewport and in print. It is not a
  caption for a picture; it is the statement, and the drawn shape is the decoration.
- Below `lg` the `<ol>` becomes a single column with a `border-l-2` running down the left and each tick
  becoming a left marker. The rail reads top to bottom. It is not a shrunken horizontal diagram.

**Accessibility position:** the diagram is an ordered list of real headings and sentences. There is no image,
no `<svg>`, no canvas, and therefore no alt text to keep in sync. Screen readers get the five stages as list
items in order, plus the loop note as a paragraph. This satisfies "readable without the diagram" by construction
rather than by duplication.

### Responsive behaviour

| Viewport | Behaviour |
| --- | --- |
| `< 640px` | Everything single column. Tags above headlines. Rail vertical. Print action full width under the meta line. No horizontal overflow at 320px, which is an explicit test |
| `640–1024px` | Two columns for principles, practice items, and lessons. Rail still vertical below `lg` |
| `≥ 1024px` | Rail horizontal with the drawn rework loop. Claim tag column at `9rem`. Section-header meta text becomes visible (existing `SectionHeader` hides `meta` below `md`) |
| `≥ 1440px` | No change. `SiteContainer narrow` caps at `62rem` and the page stays a document rather than stretching |

### Interaction, focus, and states

- The only interactive elements are the print button and five links (two closing links, the optional evidence
  link, and any inline link). All are native `<button>`/`<a>`.
- Focus uses the site's existing `focus-visible` ring. The print button gets
  `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-rust)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--site-bg)]`,
  matching `ButtonLink`.
- Tab order follows the DOM, which follows the reading order. No `tabindex` above 0. No focus traps.
- There is no loading, empty, error, or offline state. The page is static content rendered on the server. That
  is a design decision, not an omission: a document that people forward must not depend on client behaviour.
- The print button is progressive enhancement. If JavaScript does not run, the browser's own print command still
  produces the correct one-page output, because the print composition is server-rendered HTML and CSS.

### Print action

`print-action.tsx`:

```tsx
'use client';
// A button, not a link. It triggers the browser's print dialog and is
// removed from the printed output by `print:hidden`.
<button type="button" onClick={() => window.print()} className="… print:hidden">
  Print or save as PDF
</button>
<span className="… print:hidden">One A4 page.</span>
```

Styled as `ButtonLink` `variant="secondary"`. Accessible name is exactly `Print or save as PDF`. The hint is a
sibling `<span>`, not `aria-describedby`, because it is useful to everyone.

---

## 11. Print composition

Target: **exactly one A4 page.** `@page { margin: 1.5cm 1.8cm }` is already global, giving a content area of
**174mm × 267mm**.

### Composition

```
┌──────────────────────────────────────────────────────────────┐  174mm
│ / clean.dev                        PRACTICE BRIEF · SEP 2026 │  8mm   masthead, border-b-2
├──────────────────────────────────────────────────────────────┤
│ AI-assisted engineering in practice                          │
│ From team adoption at Douglas to my daily agent workflow     │  22mm  title block
│ ▬▬▬  lead paragraph, two lines                               │
├──────────────────────────────────────────────────────────────┤
│ WORKING PRINCIPLE                                            │
│ Bounded…        Checkable…        Owned…                     │  16mm  bordered band, 3 cols
├──────────────────────────────────────────────────────────────┤
│ ONE CHANGE, END TO END                                       │
│ ══════════════════════════════════════════════════════════   │  24mm  rail, 5 cols
│ 01 …  02 …  03 …  04 …  05 …   └ rework ┘                    │
├───────────────────────────────────┬──────────────────────────┤
│ CLIENT APPLICATION: DOUGLAS       │ HOW I WORK NOW           │
│ 2024 to 2026                      │ Independent practice     │
│ key: team / pilot / mine / prop.  │                          │ 104mm  two columns
│ TEAM      Editor assistance…      │ One issue, one worktree… │        96mm / 70mm
│ TEAM      Shared agent resources… │ A harness small enough…  │
│ …nine claims…                     │ …seven items…            │
├───────────────────────────────────┴──────────────────────────┤
│ THE TOOLS   Copilot · OpenCode · Pi · Claude Code · …        │  18mm  3 cols × 2 rows
├──────────────────────────────────────────────────────────────┤
│ WHAT I TAKE FROM IT   L1 … L2 … L3 … L4 … L5 …               │  12mm  labels, 2 cols
├──────────────────────────────────────────────────────────────┤
│ WHAT I DON'T CLAIM  (bordered note, four compact lines)      │  14mm
├──────────────────────────────────────────────────────────────┤
│ not indexed is not privacy · Martin Trenker · clean.dev · …  │  6mm   footer
└──────────────────────────────────────────────────────────────┘
```

Budget: 8 + 22 + 16 + 24 + 104 + 18 + 12 + 14 + 6 = **224mm**, plus eight 5mm section gaps = **264mm** against
267mm available. This is tight and **must be verified against a generated PDF**, not assumed.

### Density budget and the ordered trim list

The budget assumes:

- Douglas column at 96mm, 8.5pt/1.35 leading (about 4.0mm per line), each claim rendering as one bold headline
  line plus one sentence line, 9 × 9.5mm = 86mm, plus a 9mm heading and a 9mm maturity key.
- Practice column at 70mm, each item as one label line plus a two-line sentence, 7 × 13mm = 91mm, plus headings.
  The columns are deliberately unequal so the client evidence, which is the lead evidence, takes the wider one.

If the generated PDF exceeds one page, apply these trims **in this order** and re-measure after each:

1. Drop the third sentence of the lead paragraph.
2. Render `lessons` as labels only, without sentences.
3. Reduce each tool entry to `name` and `context`, dropping `role`.
4. Render claim C9 (`Proposed`) as its headline only.
5. Reduce the section gap from 5mm to 4mm.

**Never** reduce type below 7pt, change `@page` margins, or use `break-before-page`. If five trims are not
enough, stop and return the density question to Martin rather than shrinking the page.

### The curated print subset, approved 2 September 2026

The first budget was calibrated against the wrong width. It assumed roughly one printed line per
sentence in the client column; at 8pt in a 96mm column a line holds about 62 characters, not 120, so
every sentence wrapped and every claim cost 14.9mm rather than 9.5mm. Measured at the true A4 content
width of 174mm, the full brief needed **425.3mm** against the 267mm available, and even stripping
every sentence off the page left **316.2mm**. The ordered trim list could not close that.

Martin's decision: **keep the one-A4-page criterion, keep the screen page complete, and print a
curated subset.** The subset is declared as ids in `PRINT_SELECTION` and projected by
`buildPrintBrief` in `practice-brief.ts`, so the print composition never authors a sentence. That is
the anti-drift contract, and `practice-brief.test.ts` enforces it: every string the projection
renders must appear verbatim in `practiceBrief`.

#### What prints, and why

| Section | Printed | Rationale |
| --- | --- | --- |
| Working principle | All 3, with sentences | Required on the page; it is the first thing a 60-second scan must yield |
| Workflow rail | All 5 stages, with captions, plus the rework loop and loop note | The memory hook, and the only place bounded context, the deterministic gate, human review, and integration ownership appear together |
| Douglas claims | 5 of 8 | See below |
| Current practice | 4 of 7 | The four the rail cannot already state |
| Tools | All 6, each with a purpose | Issue requirement: a role, never names or contexts alone |
| Lessons | 3 of 5 | The three that appear nowhere else on the sheet |
| What I don't claim | All 4, labels only | The labels are the claim; the sentences elaborate and the screen carries them |
| Colophon, subset note, contact | All | Honesty travels with the document |

**The five client claims** are the five moves the corrected adoption story turns on: securing access
for the whole team (C1), the weekly learning loop (C2), introducing terminal agents and the
progression through them (C3), and the two systems that reached production (C7, C8). They cover all
three maturity levels:

| Claim | Maturity |
| --- | --- |
| I got the whole team access | Adopted |
| A weekly workshop is where adoption actually happened | Adopted |
| Out of the editor and into the terminal | Tried |
| The short-link and QR service, in weeks | Shipped |
| The unified CRM API, designed by the team | Shipped |

Dropped from print, kept on screen: `settled-on-pi`, whose substance is in C3's progression and in
the Pi tools row; `shared-resources`; and `controlled-access`, whose guardrails half is carried by the
practice column. The un-tagged closing line prints in full, so the scope boundary reaches the sheet
twice, in the intro and at the close.

**The four practice items** are `multi-harness`, `small-harness`, `guardrails`, and `design-owner`.
`multi-harness` replaced the earlier `independent-review` in the selection because Martin's current
setup is the thing the subtitle now promises. Dropped: `issue-worktree-pr`, which is rail stages 01
and 02; `visible-sessions`; and `nothing-irreversible`, whose substance is already in the loop note
("Agents do not merge, approve, or publish reviews").

**The three lessons** are `context`, `slicing`, and `ownership`. Dropped: `review-capacity`, stated
verbatim in the principle band, and `deterministic-tooling`, which is rail stage 03.

#### Revised composition and measured budget

Layout, top to bottom: masthead; title, subtitle and lead; bordered principle band in three columns;
the workflow rail; a two-column band with the client record on the left and Martin's own voice on the
right (current practice, then "What I don't claim"); tools in three columns by two rows; lessons in
three columns; footer. Grouping practice and the limits block in one column is editorial, not
convenience: the left column is the client record and the right column is first-person present tense.

Measured from the implemented composition at 174mm, after the 2 September content revision:

| Block | Height |
| --- | --- |
| Masthead | 7.0mm |
| Title, subtitle, lead | 26.2mm |
| Principle band | 21.3mm |
| Workflow rail with captions, rework loop, loop note | 42.0mm |
| Client record and current practice, two columns | 83.7mm |
| Tools | 28.5mm |
| Lessons | 17.4mm |
| Footer | 11.4mm |
| Seven 2.5mm section gaps | 17.5mm |
| **Total** | **256.6mm** |
| **A4 content height** | **267mm** |
| **Slack** | **10.4mm** |

`page.pdf({ format: 'A4', printBackground: true })` produces **one page**, asserted by
`apps/web/e2e/ai-practice-brief.spec.ts`.

Douglas remains the lead evidence: its column is 102.8mm of the 167mm evidence band, 62% of that
band, it is the single largest block on the sheet, and it prints five claims against the practice
column's four items.

The revision removed one claim from the page and split another in two, so the evidence band lost
5.5mm and the title block gained 3.7mm from the longer subtitle. Slack moved from 11.4mm to 10.4mm.
Density did not increase and no type size changed.

#### Type floor, revised

The earlier rule was "never below 7pt". The revised floor is **6.5pt for prose** and **5.5pt for
short mono uppercase micro-labels** (maturity tags, tool context, the document label), which are set
in caps with tracking and are two or three words long. Body prose on the sheet is 7 to 8pt, matching
the print CV. Do not go below these.

#### If the sheet grows past one page

Change `PRINT_SELECTION` in `practice-brief.ts`, and record the change here. Do not shrink type below
the floor above, do not change `@page` margins, do not use `break-before-page`, and do not add a
sentence to the print composition that is not in `practiceBrief`.

### Print rules

- Root: `<div data-print-document lang="en" className="hidden bg-white font-sans text-[var(--print-ink)] print:block">`.
- Screen view: `SiteShell className="print:hidden"`, matching `PortfolioView`.
- Inks: the existing `--print-ink`, `--print-ink-sec`, `--print-ink-mute`, `--print-rule`, `--print-rust`,
  supplied by the `@media print` block for any `[data-print-document]`. Do not introduce new print colours.
- Every block group carries `break-inside-avoid`. Nothing carries `break-before-page`.
- No image. No photo. The CV carries the portrait; the brief carries text.
- Maturity tags print as 7pt uppercase mono in `--print-ink-mute` with a 1px `--print-rule` border, using the
  same words as on screen. No abbreviations, no colour dependency.
- Stage 03's gate is expressed in print by a filled 1px tick and its caption only. Green is not used.
- The rework loop prints as the same dashed U in `--print-rule` with a 7pt `rework` label, plus the loop note as
  text.
- Backgrounds carry no meaning, so grayscale printing and "print backgrounds off" both stay legible.

### What differs between screen and print, and why

| Aspect | Screen | Print | Reason |
| --- | --- | --- | --- |
| Items | Every claim, practice item, and lesson | A curated selection, declared in `PRINT_SELECTION` | One A4 page. The selection and its rationale are above |
| Facts | All sentences | Label plus `sentences[0]` for the selected items | The first sentence is authored to stand alone under a tested budget |
| Words | From `practiceBrief` | From `practiceBrief`, via `buildPrintBrief` | Print authors nothing. The test proves every printed string is verbatim |
| Print action | Present | Absent | It is a screen affordance |
| Close and links | Present | Absent | Links are not actionable on paper; the footer carries the site and email |
| Colophon | Present | Present, joined with the subset note | The honesty statement travels with the document, and the sheet says it is a selection |
| Section order | Identical | Identical | A reader comparing the two must not have to re-find anything |
| Colour | Site theme, four tag tones | Fixed print inks, no tag colour | Theme independence and grayscale safety |
| Layout | One reading column | Two columns for the evidence band, three for tools and lessons | A4 width is wasted on a single column at 8pt |

The sheet states that it is a selection and where the full brief is, so a reader is never left
believing the paper version is complete.

## 12. Tests

### 12.1 Content invariants

`apps/web/src/app/work/ai-assisted-engineering/practice-brief.test.ts`

- eight claims; every `maturity` is one of the three declared values; every declared value occurs at least once
- every `sentences[0]` in claims, practice items, and lessons is ≤ 120 characters
- exactly five workflow stages; exactly one `gate`; it is stage `03`
- six tools, names in the exact order given in section 6.6, each with a non-empty `role`
- the three maturity definitions are present, in order, each with a distinct `tone`
- **projection guard:** the print projection carries five claims covering all three maturity levels, four
  practice items, three lessons, six tools each with a purpose, and four limit labels; every selected id exists;
  and every string the projection renders appears verbatim in the serialised `practiceBrief`
- **quantitative-claim guard:** every entry of `APPROVED_DISCLAIMERS` occurs verbatim in the serialised
  `practiceBrief`; after removing those exact strings, the remainder matches none of `/\d+\s*%/`,
  `/\b\d+\s*x\b/i`, `/\b(productivity|efficiency|velocity|throughput|faster|quicker|time saved)\b/i`.
  The guard therefore blocks an unsupported positive claim while leaving the approved denial expressible
- **scale guard:** any store or country figure present is exactly `1,200` or `14`, matching `projects.ts`
- **scope guard:** the source matches none of `company-wide`, `organisation-wide`, `organization-wide`,
  `rolled out across`, `throughout Douglas`, `Douglas adopted`; the intro claims adoption inside Martin's team
  and says it was not Douglas as a whole; the limits block carries `This was one team, not Douglas.`
- **corrected-account guard:** both production outcomes are graded `shipped`, the API claim says the team
  designed it and that architecture, reviews, and the production result stayed with the team, Pi's tool context
  names the client team, and the multi-harness item does not present a second model as a rule
- the colophon contains neither `private`, `confidential`, `hidden`, nor `protected`

Do **not** write a test that lists forbidden client proper nouns. That would publish them. Proper-noun safety is
the manual gate in section 5.

### 12.2 Metadata and indexing

- `apps/web/src/lib/site-metadata.test.ts`: extend `expected` with `aiPractice` for both locales using the
  section 7.2 strings; add an assertion that the `en` and `de` copy objects are deeply equal, with a comment
  naming this as intentional for the English-only delivery; assert
  `metadata.robots` equals `{ index: false, follow: false }`.
- `apps/web/src/app/sitemap.test.ts`: add
  `expect(result.map((e) => e.url)).not.toContain('https://clean.dev/work/ai-assisted-engineering')`.

### 12.3 Rendering

`apps/web/src/app/work/ai-assisted-engineering/practice-brief-view.integration.test.tsx` (vitest + Testing
Library, following `apps/web/src/app/contact/page.integration.test.tsx`):

- the H1, subtitle, and all seven section headings render
- the workflow renders as an ordered list with five items in order, and the loop note is present as text
- every claim renders its maturity label as visible text
- the print button renders with the accessible name `Print or save as PDF`
- no element in the screen view carries `data-print-document`

### 12.4 End to end

`apps/web/e2e/ai-practice-brief.spec.ts`:

- **Screen:** `[data-print-document]` is hidden; the print button is visible; `h1` is visible.
- **Print media** (`emulateMedia({ media: 'print' })`): the print document is visible; `body > header`,
  `body > footer`, and `#main-content` are hidden; the print button is hidden.
- **Print text:** `printDocument.innerText()` contains the H1, subtitle, subset note, all five stage labels, all
  four maturity labels, all six tool names and purposes, every selected claim, practice item, lesson, and limit
  label, `Douglas`, and `info@clean.dev`. It must **not** contain the labels of unselected claims, which proves
  the curation is real rather than incidental.
- **One A4 page** (desktop Chromium only, mirroring `work-print-cv.spec.ts`'s skip guard):
  `const pdf = await page.pdf({ format: 'A4', printBackground: true, path })`, then assert exactly one page.
  Count with `pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length === 1` and additionally assert the
  page-tree `/Count 1`. Attach the PDF with `testInfo.attach` so a human can inspect it.
  Extracting text from the PDF itself would require a new dependency and font-subset decoding; the print-media
  `innerText` assertion covers key content from the same DOM the PDF is rendered from. This tradeoff is
  deliberate and should be recorded in the pull request.
- **Indexing:** `meta[name="robots"]` content contains `noindex`.
- **Not linked:** on `/`, `/work`, and `/contact`, `a[href*="ai-assisted-engineering"]` has count 0.
- **Narrow viewport** (mobile-chromium project): `document.documentElement.scrollWidth <= clientWidth` at
  320px, and the rail renders vertically.
- **Keyboard:** tabbing reaches the print button and `document.activeElement` matches it.
- **Accessibility:** add `/work/ai-assisted-engineering` to `publicRoutes` in
  `apps/web/e2e/public-site.spec.ts` so the existing axe sweep covers it in both themes.

---

## 13. Acceptance criteria mapped to the issue

| Issue criterion | Where it is satisfied |
| --- | --- |
| Martin approved the Opus specification before implementation | Approved 2 September 2026; decisions and required corrections recorded in section 16 |
| Stable shareable URL, identifies as an engineering brief | Section 7.1; eyebrow `Practice brief`, H1, section 6.1 |
| 60-second scan reveals principle, Douglas, current workflow, review/ownership, tools | Section 4 scan path |
| Douglas is lead evidence and visually and semantically separate | Section 10 order and the two-column print split; section 5 attribution discipline |
| Every Douglas statement classified | Section 6.4, eight claims, three maturities, tested in 12.1 |
| Six tools with concise real roles, not a logo strip | Section 6.6 record list; prohibition in section 3 |
| Workflow shows bounded context, deterministic checks, human review, integration ownership | Section 6.3 stages 01, 03, 04, 05 |
| No confidential material or unsupported quantitative claim in source, HTML, metadata, structured data, tests, or print | Section 5 rules; 12.1 guards; no JSON-LD (7.3) |
| Absent from navigation and sitemap, emits noindex, states no false privacy | Section 7.3; copy 6.9; tests 12.2 and 12.4 |
| Responsive, keyboard accessible, readable without the diagram, coherent with reduced motion | Sections 10 responsive, interaction, and the text-first rail; no motion at all |
| One readable A4 page from desktop Chromium, nothing clipped, orphaned, duplicated, or screen-only | Section 11 budget and trim list; test 12.4 |
| Screen and print from one structured source, textually consistent | Section 9 module; deterministic print subset; test 12.1 |
| Automated coverage for route, content, indexing, print action, one-page PDF | Section 12 |

---

## 14. Validation plan

1. `pnpm lint` and `pnpm test` from the repository root.
2. `pnpm --filter @cleandev/web test:e2e` for the full Playwright matrix, and inspect the attached PDF.
3. Open the generated PDF at full size and at thumbnail scale. At thumbnail scale the five rail stages, the tag
   column, and the "What I don't claim" block must still be identifiable as three distinct textures.
4. Render at 320px, 390px, 768px, 1024px, and 1440px in both site themes. Confirm no horizontal overflow, the
   rail's orientation change, and the tag column's stacking.
5. Keyboard-only pass: tab through the page, confirm visible focus on every interactive element and that the
   order matches the reading order.
6. Zoom text to 200% and confirm no clipped or overlapping content.
7. Chromium print preview at A4: exactly one page, no clipped content, no orphaned heading, no print button.
   Repeat with backgrounds disabled and with grayscale.
8. Cold 60-second recruiter scan by a person who has not read the source, followed by asking them to state the
   working principle, what Douglas covered, and one thing Martin does not claim.
9. Deeper technical-hiring-manager read for credibility and for anything that reads as marketing.
10. **The section 5 manual safety gate**, sentence by sentence, before the pull request is opened.

---

## 15. Chosen direction, alternatives rejected, tradeoffs

### Deviations from the issue, approved as D6 and D7

**D-A. The workflow moves ahead of Douglas.** The issue's structure list places the compact workflow fourth,
after the independent workflow section. This specification places it third, immediately after the principle,
before both evidence sections. Reason: the loop is the shared spine that both the client application and the
current practice instantiate. Read first, it makes the two evidence sections legible as "here is how that loop
looked there, and here is how it looks now". Read fourth, the reader has to hold two undifferentiated lists in
mind and then retrofit a structure onto them. It also puts the memory hook on the 60-second scan path and gives
the A4 sheet a full-width band that separates the title block from the two-column body. Screen and print keep
identical order either way.

**D-B. Print renders a deterministic subset.** Nine claims, seven practice items, and five lessons cannot fit on
one A4 page at full length. Print renders headline plus first sentence. The alternative, a second hand-written
short copy, would drift from the long copy within one edit. The 120-character rule on `sentences[0]` is what
makes the subset readable rather than truncated.

### Alternatives considered and rejected

| Alternative | Why rejected |
| --- | --- |
| A Douglas-only AI one-pager, which is literally what the recruiter asked for | Less reusable, and it drops the strongest credibility signal, which is that the practice continued and deepened after the client. The Douglas section still takes the larger share |
| Appending a page to the existing `/work` print CV | The CV is deliberately multi-page and starts its history on a fresh sheet. The brief must be one standalone sheet with its own shareable URL |
| A tool comparison table, a capability matrix, or a logo strip | Prohibited by the issue and by the site's positioning. Replaced by a dated record list where each entry states what changed |
| An SVG or image diagram | It would need an alt text that duplicates the captions and then drifts, it scales badly at 320px, and it risks grayscale and print-background failures. Ruled HTML text is the diagram and its own text equivalent |
| Scroll-reveal animation, consistent with other public pages | A document people print, screenshot, and forward must be complete at first paint. Opting out also makes the reduced-motion behaviour correct by construction |
| A downloadable Markdown dossier, like `/work/dossier` | The print PDF already covers the portable case. A second artefact is a second thing to keep consistent |
| Inline metadata like `/workflow-simulator`, keeping the route out of `ROUTES` | It would lose the canonical, the share image, and test coverage, and it would put the indexing decision somewhere the sitemap does not look |
| Adding the path to `robots.txt` `disallow` | `robots.txt` is public and enumerates what it names. It would increase discoverability |
| Authentication or an obscure token URL | The page must be shareable by link. The honest answer is to say plainly what unlisted means and to write only publishable sentences |
| German in this delivery | Out of scope per the issue. Section 7.4 keeps the seam explicit rather than faking a locale map |

### Consequential tradeoffs

1. **Naming live tools dates the page.** Every tool entry carries a year and a context so the page ages as a
   record rather than as a stale recommendation.
2. **The maturity tags reduce apparent scale.** Four of nine claims are not full team practice, and saying so
   costs some impressiveness. That cost is the point; it is the page's only differentiated asset.
3. **The print subset means the paper version is less complete than the screen version.** Accepted, and the
   subset is deterministic and tested rather than editorial.
4. **The one-page budget is tight.** The ordered trim list exists so that an implementer never has to invent a
   content cut under pressure.
5. **`noindex` on a shareable page reduces reach.** That is the issue's decision. The page compensates by being
   forwardable and printable rather than findable.

---

## 16. Decisions of record

Martin settled every open decision on 2 September 2026. They are binding for implementation and for any later
change to this page. Do not reopen one without him.

| # | Decision | Settled outcome |
| --- | --- | --- |
| D1 | Naming the client's API | Use **"unified CRM API"** throughout, matching the published record in `projects.ts`. The internal product name is not used |
| D2 | Pi's maturity at Douglas | ~~Classified as `My own use` plus a demonstration~~. **Superseded by D10:** Pi was part of the team's progression and the harness the team settled on for that period |
| D3 | The `Proposed` claim, C9 | ~~Kept~~. **Superseded by D10:** removed from the page and the sheet because it diluted the adoption and delivery story |
| D4 | Local models | **Kept, with revised framing** (section 6.6): privacy-sensitive experimentation and evaluating what smaller local models can and cannot do, explicitly not reached for on client delivery |
| D5 | Linking `github.com/mtrenker/pi-clean` | **Included.** It is a public MIT repository and the only externally verifiable evidence on the page |
| D6 | The workflow moves ahead of Douglas (deviation D-A) | **Approved** |
| D7 | Print renders headline plus first sentence (deviation D-B) | **Approved** |
| D8 | The blunt colophon, "That is not privacy." | **Kept as written** |
| D9 | The print composition, after the one-page budget failed | **One A4 page kept as an acceptance criterion; the screen page stays complete; print carries a curated deterministic subset modelled in the shared source.** Settled 2 September 2026. See section 11 |
| D10 | Douglas maturity, after Martin's firsthand account | **Supersedes D2 and D3.** Martin drove the adoption inside his own team, explicitly not across Douglas. Pi was part of the team's tool progression and the option the team settled on for that period, not a Martin-only demonstration. The handover proposal is removed from the page. The maturity key drops from four levels to the three that are true: Adopted, Tried, Shipped. Settled 2 September 2026 |

### Corrections applied at approval

Martin required six corrections before implementation. All are applied in this document, and the copy in
section 6 is the corrected copy.

1. **Status.** This document records approval on 2 September 2026 subject to these corrections, rather than
   presenting itself as awaiting one.
2. **The quantitative-claim guard no longer rejects the approved disclaimer.** The first draft banned the word
   `productivity` outright, which would have made the exact sentence `I have no productivity number.`
   impossible to ship. The guard now removes the exact strings in `APPROVED_DISCLAIMERS` before scanning, so it
   blocks an unsupported positive or quantitative claim while leaving the denial expressible. See sections 9
   and 12.1.
3. **The lead no longer asserts a duration.** "I have spent the last two years" is replaced by "I use coding
   agents on real delivery work", because the two-year figure was not supported by the record.
4. **`Nothing here ran unattended.` became `Nothing here merged unattended.`** Agents do run without a human
   watching every step; what never happens unattended is the merge. The explanatory sentence about
   deterministic checks and a person before merge is unchanged.
5. **The July 2026 demonstration drops the stakeholder detail.** It now reads "at Douglas" rather than naming
   an audience within the client, and it no longer speculates about what they would see or do afterwards.
6. **C8 drops the speed wording.** "become productive in it faster" became "learn it while delivering", and
   the follow-up sentence now denies both accumulated depth and measured speed rather than asserting learning
   speed.

### Claims omitted or softened, for the record

| Source material | Disposition |
| --- | --- |
| Architecture and governance conflict, board decisions, named objections | Omitted entirely. Not a claim this page needs |
| ~1,800 stores and 26 countries from private notes | Softened to the published 1,200 stores and 14 countries |
| "Pi became our main harness in April 2026" | ~~Softened to my own use plus a demonstration~~. Restored as team practice per Martin's firsthand account (D10): the team progressed to Pi and settled on it for that period |
| Internal repository, CLI, platform, board, and assistant names | Omitted; described by function only, matching `projects.ts` |
| The client's own AI assistant rollout | Omitted entirely |
| SaaS licence costs, approval dates, and the budget path for the short-link service | Omitted |
| Contract length, contract reduction, and cost-cutting context | Omitted |
| Individual team members, the engineering manager, and their development | Omitted. The product owner appears once, unnamed and by role only, in the claim that licences reached the whole team, because who got access is the point of that claim |
| Any productivity, speed, or quality percentage | Omitted, and guarded by a test |
| Causation between AI use and the shipped outcomes | C7 states the outcome is in the project record "as a delivery outcome, not as an AI result", and "What I don't claim" repeats that no productivity number exists |
| Any adoption claim beyond Martin's team | Omitted and guarded by a test. The scope boundary appears in the section intro, the closing line, and the limits block |
| The team's process-experimentation platform and pulse measurement | Omitted; client-internal product work, not this page's subject |

---

## 17. Implementation boundaries

Do:

- create only the files listed in section 10, plus the tests in section 12
- add exactly one `ROUTES` entry and one optional `lang` prop to `SiteShell`
- move `CONTACT_EMAIL` from `apps/web/src/app/work/print-cv-data.ts` into `apps/web/src/lib/site-metadata.ts`
  and import it in both places, so the brief's print footer and the CV share one constant

Do not:

- change `/work`, the homepage, navigation, the footer, `robots.ts`, or the sitemap's public membership
- change `DESIGN_SYSTEM.md`, existing tokens, or existing components beyond the one `SiteShell` prop
- add a dependency, a font, an image, or a JSON-LD block
- cherry-pick `850e19e` or touch the primary checkout
- push, open a pull request, comment on or edit issue #116, or perform any protected remote mutation without
  Martin's authorisation

If implementation reveals a material design gap, in particular if the print page cannot reach one sheet after
all five trims, stop that part and return the decision here rather than improvising a content cut.
