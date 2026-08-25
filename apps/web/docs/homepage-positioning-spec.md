# Lower-homepage positioning, copy, and interaction specification

Status: approved design and copy handoff for implementation issue #92.
Owner of this specification: Claude Opus 5 (product, copy, UX, interaction, responsive, accessibility, bounded visual direction), on behalf of #101.
Parent outcome: #87. Blocks: #92.
Date of specification: 25 August 2026.
Evidence base: repository state at commit `4ed83e1` (main), inspected in a running dev build of `apps/web`.

This document is the single source of truth for the lower homepage. A cold implementation agent
should be able to build the page from this file alone, without reconstructing chat history,
without inventing copy, and without making product, UX, or German-language decisions.

---

## 1. Precedence and supersession

1. This specification supersedes the **May 2026 public-site positioning direction** wherever they
   conflict. That direction is not a separate document; it is carried by the 23 May 2026 commit
   `151d66a` ("Redesign public site") and by the message keys it introduced — specifically
   `home.topics.meta` ("themes, not service packages" / "Themen, keine Servicepakete"),
   `home.position.*` ("this is / this is not"), `home.operating.*`, `home.workbench.*`,
   and `home.fit.*`. Its rule "the homepage must not present a capability catalog" is
   **superseded in its literal form**: the homepage now names three buyer situations, three
   capabilities, and three engagement formats.
   Its *intent* is retained and remains binding: the page must not read as a repetitive card
   catalog or a rigid product/pricing page. Section 9 states how that intent is enforced.
2. The **25 August 2026 positioning brief**, as quoted in issue #101 ("Approved content inputs"),
   is the commercial source of truth. All copy in section 6 either comes from it verbatim, is a
   faithful first-person rendering of it, is a natural German equivalent, or is marked as
   spec-authored connective copy in the copy-source column.
3. `DESIGN_SYSTEM.md` at the repository root is **stale for the public site**. It documents the
   older `--background` / `--accent` HSL token layer and primitives such as `.btn-primary`.
   The public site uses `@/components/site/public-design` and the `--site-*` tokens defined in
   `apps/web/src/app/globals.css`. Implement against the code, not against `DESIGN_SYSTEM.md`.
   Refreshing that document is a **separate follow-up** and is out of scope for #92.
4. Work completed by #89 (hero, proof strip, canonical availability, truthful Articles state,
   primary CTAs), #90 (consolidated Douglas case), and #93 (`/work`) is preserved. This
   specification changes nothing above the proof strip.

---

## 2. What was inspected

| Evidence | Location | What it establishes |
| --- | --- | --- |
| Homepage composition | `apps/web/src/components/home/landing-page.tsx` | Eight rendered `<section>` blocks; hero and proof strip owned by #89 |
| Public primitives | `apps/web/src/components/site/public-design.tsx` | `SiteShell`, `SiteSection`, `SiteContainer`, `SectionHeader`, `Card`, `Tag`, `Eyebrow`, `ButtonLink`, `DefinitionList`, `StatStrip` |
| Navigation | `apps/web/src/components/ui/navigation.tsx`, `navigation-links.tsx`, `apps/web/src/app/layout.tsx` | Sticky header nav from `md`, fixed bottom pill below `md`, items `Work` and `Contact` |
| Anchor precedent | `apps/web/src/app/work/portfolio-view.tsx` | `id` + `scroll-mt-24` on the Douglas case |
| Scroll reset | `apps/web/src/components/route-scroll-reset.tsx` | Homepage scroll reset runs only when `pathname === '/'` **and** there is no hash |
| Motion | `apps/web/src/app/globals.css`, `apps/web/src/components/scroll-reveal.tsx` | `.observe` reveal is opt-in; reduced motion disables reveals, delays, marquee, bounce |
| Availability | `apps/web/src/lib/availability.ts` | Single localized source: September 2026, 2–5 days/week, Munich and remote DACH, DE/EN |
| Tests | `apps/web/e2e/public-site.spec.ts`, `src/test/a11y-source-guards.test.ts`, `src/components/site/public-design.integration.test.tsx` | Existing homepage expectations that must keep passing |

Rendered measurements taken in the dev build (Chromium, light and default themes):

- Sticky header height: **63 px** at 390 px, 768 px, and 1440 px viewports.
- Mobile bottom nav occupies the lowest **66 px**; `body` carries `pb-20` below `md`.
- Homepage document height today: **5,598 px** at 1440 px (EN) / 5,923 px (DE);
  **10,344 px** at 390 px (EN) / 10,746 px (DE). Roughly 4,300 px of that is the lower page.
- The page already overflows horizontally by 15 px (EN) / 22 px (DE) at a 320 px viewport,
  caused by lower-page panels, not by navigation. That is pre-existing; see section 13.

---

## 3. Final page order

The hero and proof strip are unchanged. Everything after them is replaced by the order below.

| # | Section | `id` | Heading (EN / DE) | Origin |
| --- | --- | --- | --- | --- |
| 0a | Hero | — | `home.hero.heading` | #89, unchanged |
| 0b | Proof strip + Douglas outcomes | `home-proof-heading` (h2 id) | Verified enterprise outcomes | #89/#90, unchanged |
| 1 | Buyer situations | `bring-me-in` | Bring me in when / Wann Sie mich dazuholen sollten | New; replaces Thesis |
| 2 | Capabilities | `how-i-help` | How I help / Wie ich helfe | New; replaces Operating model. **Navigation target** |
| 3 | Engagement formats | `ways-to-work` | Ways to work together / Formen der Zusammenarbeit | New |
| 4 | Working principles | `how-i-work` | How I work / Wie ich arbeite | New; absorbs Position |
| 5 | Trust answers | `questions` | Questions I get asked / Häufige Fragen | New |
| 6 | Engagement log | `engagements` | Engagement log / Projektauszug | Existing, kept |
| 7 | Contact close | `contact-cta` | Let's talk / Lassen Sie uns reden | Existing, rewritten |

Rationale for the order: recognise the problem (1), understand the capability (2), see the shape of
a possible engagement (3), understand the person and the way of working (4), resolve the objections
that block a first call (5), verify against real engagements (6), act (7). Proof is deliberately
split: quantified proof stays directly under the hero for the five-second scan, and the engagement
log reinforces it immediately before the call to action.

---

## 4. Decisions for every existing lower-homepage unit

| Existing unit | Component today | Decision | Reason |
| --- | --- | --- | --- |
| Thesis | `Thesis` (`home.hero.thesis.*`) | **Remove and replace in place** | 66-word abstract essay above the fold of the lower page; delays the buyer's own problem; its CTA duplicates the hero CTA. Its slot becomes section 1. Its amber left-border card grammar is retained for the closing sentence in section 4, so the visual signature survives. |
| Position "this is" | `Position` (`home.position.is.*`) | **Merge into section 4** | The four "this is" items are working principles; the approved brief has a stronger, tighter five-item version. Merged, not duplicated. |
| Position "this is not" | `Position` (`home.position.not.*`) | **Remove** | #92 requires negative positioning to be limited to the approved closing sentence. Four negative bullets plus "less useful for" plus a closing line is three layers of negativity. |
| Operating model — three practice cards | `OperatingModel` (`home.operating.*`) | **Rewrite in place** | Same slot, same three-item rhythm, but the content becomes the approved capabilities and the section becomes the `How I help` navigation target. Body copy is replaced entirely; "Signals:" lines are removed because the approved input defines no measures and none may be invented. |
| Workbench card | `WorkbenchCard` (`home.workbench.*`) | **Remove** | "shaping / reviewing / writing / testing" implies published or forthcoming writing. #89 removed Articles from navigation and CTAs precisely because no substantive posts exist. Keeping this card reintroduces the same trust leak. |
| Topics | `Topics` (`home.topics.*`) | **Remove** | Four cards whose footers read "notes and essays", "operating notes", "ongoing notes", "decision notes" for content that does not exist. Their subject matter is covered by sections 2 and 4. Removing them also removes the fourth consecutive card grid. |
| Engagement log | `EngagementLog` | **Keep, unchanged copy, moved down one slot** | Verified, skimmable proof generated from `projects.ts`; the strongest non-quantitative evidence on the page and the natural bridge to `/work`. |
| Fit grid (4 cells) | `FitAndContact` (`home.fit.*`) | **Remove** | "who this helps" and "where it helps" now duplicate section 1; "how I work" duplicates section 4; "less useful for" is negative positioning that section 4's closing sentence already carries. |
| Contact close (lead, CTA, note, availability card, profile card, socials) | `FitAndContact` | **Keep structure, rewrite lead and note** | The closing block, its dark `--site-panel-deep` surface, the availability card, the profile card, and the social row stay exactly as they are. Only two strings change. |
| Hero, proof strip, Douglas outcomes | `Hero`, `EvidenceStrip` | **Keep, untouched** | Owned by #89/#90. Do not edit. |

---

## 5. Section specifications

Shared rules for sections 1–5:

- Each is a `<section>` rendered through `SiteSection` with `id` and `aria-labelledby`, inside a
  `SiteContainer`, opening with `SectionHeader` (`title`, `meta`, and a new `titleId`).
- `SectionHeader` renders the `h2`. Item titles are `h3`. No `h4` is introduced on the homepage.
- Every section carries `scroll-mt-24` so any future deep link clears the 63 px sticky header.
- No section uses `.observe` / scroll-reveal. Transitions are limited to colour and border on
  hover and focus.
- No fixed heights, no `truncate`, no `line-clamp`: German copy is up to ~40% longer.

### Section 1 — Bring me in when (`id="bring-me-in"`)

Purpose: let a buyer recognise their own situation in under ten seconds.

Layout: one bordered panel (`Card`-equivalent surface: `rounded-[6px] border border-[var(--site-rule)] bg-[var(--site-panel)]`) containing an `ol` of three `li` rows, separated by `border-t border-[var(--site-rule)]` on every row but the first.

- Narrow (`<md`): each row stacks — mono index, then `h3`, then body. Row padding `p-5`.
- Wide (`md+`): each row is `md:grid-cols-[3.5rem_minmax(0,18rem)_minmax(0,1fr)] md:items-start md:gap-6`,
  giving index / title / body columns. Row padding `md:p-6`.
- Index is `font-mono text-[var(--site-rust)]` reading `01`, `02`, `03`.
- `h3`: `text-xl md:text-2xl font-medium tracking-[-0.02em] text-[var(--site-ink)]`.
- Body: `leading-7 text-[var(--site-ink-sec)]`.

Deliberately **not** cards: rows read as a checklist, which is what a self-diagnosing buyer needs,
and it breaks the card rhythm before section 3 uses cards.

### Section 2 — How I help (`id="how-i-help"`, navigation target)

Purpose: name the three capabilities. This is the destination of the `How I help` navigation item
from every public route, so it must be self-explanatory when a visitor lands on it directly with no
prior scroll.

Layout: section header, then a one-sentence lead, then three columns.

- Markup is an `ol` of three `li` items.
- Narrow: single column, items separated by `divide-y divide-[var(--site-rule)]`, each `py-6 first:pt-0`.
- `lg+`: `lg:grid-cols-3 lg:divide-x lg:divide-y-0 divide-[var(--site-rule)]`, each item `lg:px-8 lg:first:pl-0 lg:last:pr-0`.
- Each item: mono index (`01`–`03`, `text-[var(--site-ink-mute)]`), `h3`
  (`text-2xl font-medium tracking-[-0.02em]`), then one paragraph (`mt-3 leading-7 text-[var(--site-ink-sec)]`).
- Lead sits under `SectionHeader`, `max-w-3xl text-lg leading-8 text-[var(--site-ink-sec)]`, and
  is the anti-catalog cue: the mix follows the problem, not a package.

Hairline columns rather than cards keep this section visually distinct from section 3, the only
card grid among the new sections.

Focus and anchor mechanics are specified in section 7.

### Section 3 — Ways to work together (`id="ways-to-work"`)

Purpose: make the engagement shape concrete without becoming a pricing table.

Layout: section header, a mono caveat line, then three `Card`s.

- `Card` grid: single column, `lg:grid-cols-3`, `gap-4`. Card padding `p-6`.
- Card content order: `Tag` (format kind), `h3` (format name), mono cadence line, then a
  `ul` of exactly three lines with `+` markers in `--site-green`, matching the existing
  `EvidenceStrip` / `Position` list grammar.
- Cadence line: `mt-3 font-mono text-xs leading-6 tracking-[0.04em] text-[var(--site-rust)]`.
- The mono caveat line sits directly under `SectionHeader`
  (`font-mono text-xs leading-6 text-[var(--site-ink-mute)]`) and prevents the cadences from
  reading as guaranteed availability.
- No prices, no tiers, no "starting from", no comparison table, no highlighted "recommended" card.
  All three cards use identical visual weight.

### Section 4 — How I work (`id="how-i-work"`)

Purpose: the person and the method, plus the single permitted piece of negative positioning.

Layout:

- Five principles as a `ul` inside a bordered panel: single column at narrow,
  `md:grid-cols-2 md:gap-x-10` at `md+`; each item `grid grid-cols-[1rem_1fr] gap-3 py-3
  text-lg leading-8 text-[var(--site-ink)]` with a `font-mono text-[var(--site-green)]` `+` marker.
  The fifth item spans naturally in the second column; do not pad with a sixth item.
- The closing sentence sits below in its own block reusing the retired Thesis grammar:
  `Card` with `border-l-4 border-l-[var(--site-amber)] p-6 md:p-8`, containing an `Eyebrow tone="amber"`
  and the sentence at `text-xl md:text-2xl font-medium leading-snug tracking-[-0.02em] text-[var(--site-ink)]`.
- No CTA in this section. The page has exactly two primary CTAs: hero and contact close.

### Section 5 — Questions I get asked (`id="questions"`)

Purpose: answer the four objections that otherwise stop a first conversation, including AI trust.

Layout:

- `md:grid-cols-2 gap-x-12 gap-y-8`, four items, no cards.
- Each item: `h3` question (`text-lg font-semibold text-[var(--site-ink)]`), then answer
  (`mt-3 leading-7 text-[var(--site-ink-sec)]`), with `border-t border-[var(--site-rule)] pt-6`
  on each item to keep the hairline grammar.
- Questions are real `h3` headings, not a `dl` and not a disclosure widget: the answers must be
  present in the DOM for search engines, print, and screen-reader heading navigation, and must not
  require interaction.

### Section 6 — Engagement log (`id="engagements"`)

Unchanged from the current implementation, including copy, ordering, Douglas handling, and links to
`/work` and `/work#douglas`. Add `id="engagements"` and `aria-labelledby` for consistency only.

### Section 7 — Contact close (`id="contact-cta"`)

Unchanged except:

- The four-cell fit grid is removed.
- `home.contact.lead` and `home.contact.note` are rewritten (section 6 copy tables).
- Everything else stays: `--site-panel-deep` surface, `SectionHeader`, the large lead, the
  `ButtonLink` to `/contact`, the availability card, the profile card, and the social row.
- With the fit grid gone, the left column is `lg:grid-cols-[1fr_24rem]` as today; the lead keeps
  `max-w-4xl` so it does not stretch into a single long line.

---

## 6. Exact copy

Format: message key, English string, German string, and the copy source.
Source values are: **brief** (verbatim from the approved 25 August 2026 inputs quoted in #101),
**brief, first person** (same content, rendered in the homepage's first-person voice),
**brief, natural DE** (German that carries the same commercial meaning rather than a literal
translation), or **spec** (connective copy authored here; contains no new factual claim).

All strings are plain text. No emoji, no exclamation marks, no bold inside message values.
New English strings use a straight apostrophe (`'`), matching `home.contact.heading`
("Let's talk"); do not introduce typographic quotation marks in either locale.

### 6.1 Navigation

**`nav.howIHelp`**
- EN: `How I help`
- DE: `Wie ich helfe`
- Source: brief (navigation section) / brief, natural DE

### 6.2 Section 1 — Bring me in when

**`home.situations.heading`**
- EN: `Bring me in when`
- DE: `Wann Sie mich dazuholen sollten`
- Source: brief / brief, natural DE. The English heading completes into each item title; the German
  heading is a standalone commercial line because German subordinate word order would otherwise
  force unnatural item titles.

**`home.situations.meta`**
- EN: `typical starting points`
- DE: `typische ausgangslagen`
- Source: spec

**`home.situations.momentum.title`**
- EN: `A critical modernisation is losing momentum`
- DE: `Eine kritische Modernisierung verliert an Fahrt`
- Source: brief / brief, natural DE

**`home.situations.momentum.body`**
- EN: `The architecture is becoming harder to change, business logic is duplicated, releases are risky, or the team is trapped between old and new systems.`
- DE: `Die Architektur wird immer schwerer zu ändern, Geschäftslogik liegt mehrfach vor, Releases sind riskant, oder das Team steckt zwischen altem und neuem System fest.`
- Source: brief / brief, natural DE

**`home.situations.strategy.title`**
- EN: `Strategy is not surviving contact with delivery`
- DE: `Strategie kommt in der Delivery nicht an`
- Source: brief / brief, natural DE

**`home.situations.strategy.body`**
- EN: `Leadership intent is clear in meetings, but ownership, priorities, planning, reviews, and technical decisions pull in different directions.`
- DE: `Die Absicht der Führung ist im Meeting klar, aber Verantwortung, Prioritäten, Planung, Reviews und technische Entscheidungen ziehen in unterschiedliche Richtungen.`
- Source: brief / brief, natural DE

**`home.situations.ai.title`**
- EN: `AI experiments need to become dependable work`
- DE: `KI-Experimente sollen verlässliche Arbeit werden`
- Source: brief / brief, natural DE

**`home.situations.ai.body`**
- EN: `The team has tools or pilots, but lacks governed access, useful context, review points, repeatable workflows, or clear ownership.`
- DE: `Das Team hat Tools oder Pilotprojekte, aber es fehlen geregelte Zugriffe, nutzbarer Kontext, Review-Punkte, wiederholbare Abläufe und klare Verantwortung.`
- Source: brief / brief, natural DE

### 6.3 Section 2 — How I help

**`home.help.heading`**
- EN: `How I help`
- DE: `Wie ich helfe`
- Source: brief / brief, natural DE. Must match `nav.howIHelp` exactly so the navigation label and
  the landing target read as the same thing.

**`home.help.meta`**
- EN: `architecture · leadership · ai workflows`
- DE: `architektur · führung · ki-workflows`
- Source: spec

**`home.help.lead`**
- EN: `Most engagements combine two of these. The mix follows the problem in front of the team, not a fixed package.`
- DE: `Meist greifen zwei davon ineinander. Die Mischung richtet sich nach dem konkreten Problem des Teams, nicht nach einem festen Paket.`
- Source: spec

**`home.help.architecture.title`**
- EN: `Architecture and safer change`
- DE: `Architektur und sichere Veränderung`
- Source: brief / brief, natural DE

**`home.help.architecture.body`**
- EN: `I clarify boundaries and ownership, reduce duplicated business logic, improve testability, observability, and recovery, and make releases and future changes safer.`
- DE: `Ich kläre Grenzen und Verantwortlichkeiten, reduziere doppelte Geschäftslogik, verbessere Testbarkeit, Observability und Wiederherstellbarkeit und mache Releases wie spätere Änderungen sicherer.`
- Source: brief, first person / brief, natural DE

**`home.help.leadership.title`**
- EN: `Embedded technical leadership`
- DE: `Eingebundene technische Führung`
- Source: brief / brief, natural DE

**`home.help.leadership.body`**
- EN: `I make decisions with the team, align architecture, product priorities, and delivery, mentor engineers and improve review quality, and keep leadership intent connected to implementation.`
- DE: `Ich treffe Entscheidungen gemeinsam mit dem Team, richte Architektur, Produktprioritäten und Delivery aufeinander aus, begleite Engineers, hebe die Review-Qualität und halte die Absicht der Führung mit der Umsetzung verbunden.`
- Source: brief, first person / brief, natural DE

**`home.help.aiWorkflows.title`**
- EN: `AI-enabled engineering workflows`
- DE: `KI-gestützte Engineering-Workflows`
- Source: brief / brief, natural DE

**`home.help.aiWorkflows.body`**
- EN: `I identify work that benefits from assistants or agents, connect tools to approved systems with controlled access, add deterministic checks and human review, and build practices the team can understand and own.`
- DE: `Ich identifiziere Arbeit, die von Assistenten oder Agenten profitiert, binde Tools mit kontrolliertem Zugriff an freigegebene Systeme an, ergänze deterministische Prüfungen und menschliches Review und baue Praktiken auf, die das Team versteht und selbst verantwortet.`
- Source: brief, first person / brief, natural DE

### 6.4 Section 3 — Ways to work together

**`home.formats.heading`**
- EN: `Ways to work together`
- DE: `Formen der Zusammenarbeit`
- Source: brief / brief, natural DE

**`home.formats.meta`**
- EN: `three shapes / one conversation`
- DE: `drei formate / ein gespräch`
- Source: spec

**`home.formats.note`**
- EN: `Cadence and duration are agreed per engagement and depend on current availability.`
- DE: `Takt und Dauer werden je Engagement vereinbart und hängen von der aktuellen Verfügbarkeit ab.`
- Source: spec. Required: it prevents the cadence lines from reading as guaranteed availability or
  as hidden parallel employment. Do not remove it.

**`home.formats.embedded.tag`**
- EN: `embedded`
- DE: `embedded`
- Source: spec

**`home.formats.embedded.title`**
- EN: `Embedded Technical Lead or Solutions Architect`
- DE: `Embedded Technical Lead oder Solutions Architect`
- Source: brief / brief, natural DE (role titles stay English; they are the market terms in DACH)

**`home.formats.embedded.cadence`**
- EN: `3–5 days per week · typically 3–9 months`
- DE: `3–5 Tage pro Woche · typischerweise 3–9 Monate`
- Source: brief / brief, natural DE. Use the en dash `–`, matching `availability.ts`.

**`home.formats.embedded.1`**
- EN: `Hands-on architecture and implementation`
- DE: `Hands-on in Architektur und Umsetzung`
- Source: brief / brief, natural DE

**`home.formats.embedded.2`**
- EN: `Team leadership, mentoring, and delivery improvement`
- DE: `Teamführung, Mentoring und bessere Delivery`
- Source: brief / brief, natural DE

**`home.formats.embedded.3`**
- EN: `Best for modernisation, integration, or recovery work`
- DE: `Passt zu Modernisierung, Integration oder Projektsanierung`
- Source: brief / brief, natural DE

**`home.formats.assessment.tag`**
- EN: `assessment`
- DE: `assessment`
- Source: spec

**`home.formats.assessment.title`**
- EN: `Architecture and Delivery Assessment`
- DE: `Architektur- und Delivery-Assessment`
- Source: brief / brief, natural DE

**`home.formats.assessment.cadence`**
- EN: `usually 5–10 working days`
- DE: `in der Regel 5–10 Arbeitstage`
- Source: brief / brief, natural DE

**`home.formats.assessment.1`**
- EN: `Interviews, code and architecture review, delivery-system review`
- DE: `Interviews, Code- und Architektur-Review, Review des Delivery-Systems`
- Source: brief / brief, natural DE

**`home.formats.assessment.2`**
- EN: `Prioritised findings and practical next steps`
- DE: `Priorisierte Ergebnisse und konkrete nächste Schritte`
- Source: brief / brief, natural DE

**`home.formats.assessment.3`**
- EN: `Optional implementation follow-through`
- DE: `Auf Wunsch Begleitung in der Umsetzung`
- Source: brief / brief, natural DE

**`home.formats.advisory.tag`**
- EN: `advisory`
- DE: `advisory`
- Source: spec

**`home.formats.advisory.title`**
- EN: `AI-enabled Engineering Advisory`
- DE: `KI-Beratung für Engineering-Teams`
- Source: brief / brief, natural DE

**`home.formats.advisory.cadence`**
- EN: `usually 1 day per week or a fixed-scope package`
- DE: `in der Regel 1 Tag pro Woche oder ein fest umrissenes Paket`
- Source: brief / brief, natural DE

**`home.formats.advisory.1`**
- EN: `Use-case selection, workflow design, access and review model`
- DE: `Auswahl der Use Cases, Workflow-Design, Zugriffs- und Review-Modell`
- Source: brief / brief, natural DE

**`home.formats.advisory.2`**
- EN: `Agent or assistant prototypes where appropriate`
- DE: `Prototypen für Agenten oder Assistenten, wo es sinnvoll ist`
- Source: brief / brief, natural DE

**`home.formats.advisory.3`**
- EN: `Team enablement and governance close to actual delivery`
- DE: `Enablement und Governance nah an der tatsächlichen Delivery`
- Source: brief / brief, natural DE

### 6.5 Section 4 — How I work

**`home.principles.heading`**
- EN: `How I work`
- DE: `Wie ich arbeite`
- Source: brief / brief, natural DE

**`home.principles.meta`**
- EN: `working style / what stays behind`
- DE: `arbeitsweise / was bleibt`
- Source: spec

**`home.principles.1`**
- EN: `Embedded closely enough to understand the actual constraints.`
- DE: `Nah genug am Team, um die tatsächlichen Rahmenbedingungen zu verstehen.`
- Source: brief / brief, natural DE

**`home.principles.2`**
- EN: `Direct with sponsors and respectful of the people doing the work.`
- DE: `Klar gegenüber Auftraggebern und respektvoll gegenüber den Menschen, die die Arbeit machen.`
- Source: brief / brief, natural DE

**`home.principles.3`**
- EN: `Hands-on with architecture, code, reviews, and delivery.`
- DE: `Hands-on in Architektur, Code, Reviews und Delivery.`
- Source: brief / brief, natural DE

**`home.principles.4`**
- EN: `Pragmatic about Agile and AI: use what improves the system, discard what does not.`
- DE: `Pragmatisch mit Agile und KI: nutzen, was das System verbessert, weglassen, was nicht hilft.`
- Source: brief / brief, natural DE

**`home.principles.5`**
- EN: `Focused on leaving clearer ownership and stronger capability behind.`
- DE: `Mit dem Anspruch, klarere Verantwortung und mehr Können im Team zu hinterlassen.`
- Source: brief / brief, natural DE

**`home.principles.closing.label`**
- EN: `what this is not /`
- DE: `was es nicht ist /`
- Source: spec (`Eyebrow tone="amber"`, mirrors the retired `home.hero.thesis.label` grammar)

**`home.principles.closing`**
- EN: `No transformation theatre, detached slideware, or AI adoption for its own sake.`
- DE: `Kein Transformationstheater, keine praxisfernen Foliensätze, keine KI-Einführung als Selbstzweck.`
- Source: brief / brief, natural DE. This is the **only** negative statement permitted on the
  homepage. Do not add further "this is not" content anywhere on the page.

### 6.6 Section 5 — Questions I get asked

**`home.questions.heading`**
- EN: `Questions I get asked`
- DE: `Häufige Fragen`
- Source: spec / spec

**`home.questions.meta`**
- EN: `ai, hands-on, cadence, location`
- DE: `ki, hands-on, takt, ort`
- Source: spec

**`home.questions.ai.q`**
- EN: `How do you use AI in client work?`
- DE: `Wie setzen Sie KI in Kundenprojekten ein?`
- Source: brief / brief, natural DE

**`home.questions.ai.a`**
- EN: `Only within the client's approved security and data-handling constraints. I separate client environments, control tool access, keep important actions reviewable, and use deterministic checks around model output. AI supports engineering judgment; it does not replace accountability.`
- DE: `Nur innerhalb der freigegebenen Sicherheits- und Datenschutzvorgaben des Kunden. Ich trenne Kundenumgebungen, steuere Tool-Zugriffe, halte wichtige Aktionen überprüfbar und sichere Modellausgaben mit deterministischen Prüfungen ab. KI unterstützt technisches Urteilsvermögen, sie ersetzt keine Verantwortung.`
- Source: brief, first person / brief, natural DE

**`home.questions.handsOn.q`**
- EN: `Are you still hands-on?`
- DE: `Arbeiten Sie weiterhin hands-on?`
- Source: brief / brief, natural DE

**`home.questions.handsOn.a`**
- EN: `Yes. The work includes architecture, code, reviews, debugging, delivery practices, mentoring, and stakeholder alignment. I am most useful where technical decisions and team execution need to improve together.`
- DE: `Ja. Dazu gehören Architektur, Code, Reviews, Debugging, Delivery-Praktiken, Mentoring und die Abstimmung mit Stakeholdern. Am nützlichsten bin ich dort, wo technische Entscheidungen und die Umsetzung im Team gemeinsam besser werden müssen.`
- Source: brief, first person / brief, natural DE

**`home.questions.partTime.q`**
- EN: `Do you work part-time?`
- DE: `Arbeiten Sie auch in Teilzeit?`
- Source: brief / brief, natural DE

**`home.questions.partTime.a`**
- EN: `Yes. Embedded engagements can be structured from two to five days per week when responsibilities, meeting cadence, and response expectations are explicit.`
- DE: `Ja. Embedded-Engagements lassen sich von zwei bis fünf Tagen pro Woche gestalten, wenn Verantwortlichkeiten, Meeting-Takt und Erwartungen an Reaktionszeiten ausdrücklich vereinbart sind.`
- Source: brief / brief, natural DE

**`home.questions.onsite.q`**
- EN: `Do you work onsite?`
- DE: `Arbeiten Sie vor Ort?`
- Source: brief / brief, natural DE

**`home.questions.onsite.a`**
- EN: `I am based in Munich and work remotely across DACH, with planned onsite work where it materially improves the engagement.`
- DE: `Ich bin in München ansässig und arbeite remote im DACH-Raum, mit geplanten Vor-Ort-Terminen, wo sie das Engagement spürbar besser machen.`
- Source: brief, first person / brief, natural DE

### 6.7 Section 7 — Contact close (rewritten strings only)

**`home.contact.lead`** (replaces the current value)
- EN: `Send a short description of the team, the system, and what needs to change. You get a direct answer about fit, not a pitch.`
- DE: `Schicken Sie mir eine kurze Beschreibung von Team, System und dem, was sich ändern soll. Sie bekommen eine direkte Einschätzung zur Passung, kein Verkaufsgespräch.`
- Source: spec

**`home.contact.note`** (replaces the current value)
- EN: `Enquiries in German or English.`
- DE: `Anfragen gern auf Deutsch oder Englisch.`
- Source: spec. The previous note duplicated the lead. Do not replace it with a response-time
  promise; none is verified.

Unchanged in this section: `home.contact.heading`, `home.contact.meta`, `home.contact.cta`,
`home.profileCard.*`, and everything sourced from `getConsultingAvailability()`.

### 6.8 Message keys to delete

Remove from both `en.json` and `de.json`, in both files identically:

`home.hero.thesis.label`, `home.hero.thesis.body`, `home.hero.thesis.meta`,
`home.position.heading`, `home.position.meta`, `home.position.is.label`, `home.position.is.1`–`.4`,
`home.position.not.label`, `home.position.not.1`–`.4`,
`home.operating.heading`, `home.operating.meta`, `home.operating.practice`,
`home.operating.embed.title|body|measure`, `home.operating.system.title|body|measure`,
`home.operating.ai.title|body|measure`,
`home.workbench.label`, `home.workbench.status`, `home.workbench.one|two|three|four.time|verb|text`,
`home.topics.heading`, `home.topics.meta`, `home.topics.cleanCode|agile|aiDelivery|leadership.status|title|body|count`,
`home.fit.buyer|shape|mode|not.label|body`.

Also delete the already-unused `home.stats.years.value|label`, `home.stats.engagements.value|label`,
`home.stats.companies.value|label` — nothing references them since the #89 hero rework.

Key ordering: keep the new keys grouped in page order (`nav.*`, `footer.*`, `home.hero.*`,
`home.proof.*`, `home.profileCard.*`, `home.situations.*`, `home.help.*`, `home.formats.*`,
`home.principles.*`, `home.questions.*`, `home.engagements.*`, `home.contact.*`, then `work.*`),
and keep `en.json` and `de.json` in identical key order so diffs stay reviewable.

---

## 7. Navigation and fragment mechanics

### 7.1 Items, labels, order

Primary navigation becomes three items in this order, identical at every width:

| Position | Label EN | Label DE | `href` |
| --- | --- | --- | --- |
| 1 | Work | Projekte | `/work` |
| 2 | How I help | Wie ich helfe | `/#how-i-help` |
| 3 | Contact | Kontakt | `/contact` |

The `clean.dev` brand link remains the Home affordance (`href="/"`), as permitted by the approved
input. No separate `Home` item is added: at narrow widths the three-item pill is already at the
edge of its budget (measurements below), and the brand is the conventional home target.

`How I help` is a section link, not a route. It must not render an active state: the existing
`isActivePath` helper compares `pathname` with `href`, so `/#how-i-help` never matches and no
`aria-current` is emitted. Keep that behaviour; do not add hash-aware active logic.

### 7.2 Breakpoint change (required)

Today the header nav appears from `md` (768 px) and the fixed bottom pill is shown below `md`.
With three items the German header nav does not fit at 768 px. Measured label widths in the real
navigation font (IBM Plex Mono, 10.88 px desktop / 10.56 px mobile, `tracking` 0.18em / 0.13em):

| Label | Text width |
| --- | --- |
| WORK | 30 px |
| CONTACT | 52 px |
| HOW I HELP | 74 px |
| PROJEKTE | 59 px |
| KONTAKT | 52 px |
| WIE ICH HELFE | 96 px |

At 768 px the header row needs `112` (px-14 padding) + `130` (brand) + nav + `183` (theme,
language) + `32` (grid gaps). Measured German nav width with two items is 212 px; the third item
adds ~132 px, giving **801 px against 768 px available**.

Required change: move the header navigation to `lg` and the bottom pill to below `lg`.

- `apps/web/src/components/ui/navigation.tsx`: header `<nav>` wrapper `hidden justify-self-center md:block` → `hidden justify-self-center lg:block`; bottom `<nav>` `md:hidden` → `lg:hidden`.
- `apps/web/src/app/layout.tsx`: `body` class `pb-20 md:pb-0` → `pb-20 lg:pb-0`.
- The social-icon list in the header is already `hidden lg:flex`; it appears at the same breakpoint
  as the nav, so the 1024 px header holds brand (130) + nav (~300 DE) + socials and controls
  (~290) + padding and gaps (144) ≈ 864 px against 1024 px — comfortable.

Rejected alternative, recorded for traceability: keeping `md` and reducing the header padding to
`md:px-8 lg:px-14` fits German by ~15 px. That margin is too small to survive a fallback font, and
it misaligns the brand with `SiteContainer`. A second rejected alternative was shortening the
German label to `Leistungen` (74 px); it fits, but "services" reintroduces exactly the catalog
framing this positioning avoids, and it stops matching the section heading.

### 7.3 Narrow-width fit

Mobile pill, three items, `min-w-[5.4rem] px-3` per item, `gap-1`, list padding `p-1.5`:

- German total: 86.4 + 120 + 86.4 + 8 + 12 = **313 px**; available at 360 px viewport is 336 px. Fits.
- At a 320 px viewport the same total exceeds the 296 px available. Add a narrow-width rule to the
  mobile variant in `navigation-links.tsx`: `max-[359px]:min-w-0 max-[359px]:px-2.5`, which yields
  59+20 + 96+20 + 52+20 + 8 + 12 = **287 px** ≤ 296 px. Tap targets stay ≥ 44 px wide and keep
  their current 40 px height.
- Supported layout floor for this feature is **360 px**. The pre-existing 320 px horizontal overflow
  comes from lower-page panels, not navigation, and is tracked separately (section 13).

### 7.4 Target element

The `How I help` section is the fragment target:

```tsx
<SiteSection
  id="how-i-help"
  tabIndex={-1}
  aria-labelledby="home-help-heading"
  className="scroll-mt-24 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--site-rust)]"
>
```

- `id="how-i-help"` — stable, lowercase, hyphenated, matching the `/work#douglas` precedent.
- `tabIndex={-1}` — **required**. Without it the section is not focusable and focus stays on
  `<body>` after a client-side navigation, which strands keyboard users at the top of the document.
- `scroll-mt-24` (96 px) — the same offset `/work` uses. Measured result: the section top lands
  **96 px** from the viewport top, i.e. 33 px clear of the 63 px sticky header, at 390 px, 768 px,
  and 1440 px.
- `aria-labelledby="home-help-heading"` — points at the `h2` rendered by `SectionHeader`
  (`titleId="home-help-heading"`), so the focused region announces as "How I help, region".
- Focus ring uses `focus-visible`, not `focus`, and is drawn **inset**: the section is full-bleed,
  so an offset ring would sit partly outside the viewport. Verified in Chromium against
  Next 16.2.11: pointer activation focuses the section without matching `:focus-visible`; keyboard
  activation and direct URL entry both match it. Mouse users see no ring; keyboard users see the
  rust ring drawn just inside the section edge.

### 7.5 Verified navigation behaviour

Measured against Next.js 16.2.11 (the version in `pnpm-lock.yaml`) with a sticky 63 px header, a
`tabIndex={-1}` target and `scroll-margin-top: 96px`. Next's App Router calls `scrollIntoView()`
and then `focus()` on the hash target (`next/dist/client/components/layout-router.js`); the newer
non-focusing handler is behind `experimental.appNewScrollHandler`, which defaults to `false` and is
not enabled in this repository.

| Path | URL after | Scroll result | Focus after | Next Tab reaches |
| --- | --- | --- | --- | --- |
| From `/work` or `/contact`, pointer click | `/#how-i-help` | section top at 96 px | the section | the first link after the section in DOM order |
| From `/work` or `/contact`, keyboard `Enter` | `/#how-i-help` | section top at 96 px | the section, ring visible | the first link after the section in DOM order |
| From `/` itself (same-page hash) | `/#how-i-help` | section top at 96 px | the section | the first link after the section in DOM order |
| Direct URL entry or reload of `/#how-i-help` | `/#how-i-help` | section top at 96 px | the section, ring visible | the first link after the section in DOM order |
| Browser Back after a cross-route jump | previous route | previous scroll position restored | `<body>` | document order |
| Browser Back after a same-page jump | `/` with no hash | previous homepage scroll position restored | the navigation link | navigation |
| Browser Forward after that Back | `/#how-i-help` | section top at 96 px | navigation link keeps focus | navigation |

Section 2 contains no interactive elements, so "the first link after the section" is the first link
in section 3 or later. This is correct and expected: the visitor is placed at the start of the
content they asked for, and continues forward from there.

How these rows were established: the scroll offset and the sticky-header clearance were measured on
the running site using the equivalent `/work#douglas` anchor (target top at exactly 96 px, header
63 px). Focus, `:focus-visible`, Back, and Forward were measured in an isolated Next 16.2.11
harness that reproduces this specification's sticky header, `tabIndex={-1}` target, and
`scroll-margin-top: 96px`. `RouteScrollReset` does not interfere in the same-page case because
`pathname` does not change, so its effect does not re-run; in the cross-route case it returns early
because a hash is present.

No custom scroll or focus JavaScript is required, and none may be added. In particular:

- Do not add `scroll-behavior: smooth`; the site does not use it and it fights reduced-motion.
- Do not call `scrollIntoView` or `focus` manually in a `useEffect`.
- Do not change `RouteScrollReset`. It already returns early when a hash is present, so a hard load
  of `/#how-i-help` is not yanked back to the hero. Verified in source and in the running app.

---

## 8. Responsive, semantic, motion, and localization rules

### 8.1 Responsive

- Supported range for this work: **360 px to 1920 px**. Layouts are validated at 360, 390, 768,
  1024, 1280, and 1440 px.
- Breakpoints used: default (narrow) → `md` (768) → `lg` (1024). Do not introduce new breakpoints
  other than the documented `max-[359px]` navigation rule.
- Every section stays inside `SiteContainer` (`max-w-[90rem]`, `px-5 md:px-14`).
- No element may exceed the viewport width. The Playwright overflow check must stay at
  `scrollWidth - clientWidth <= 1` for `/` in both locales.
- Grids collapse to a single column below `md`, except section 2 which stays single column until
  `lg` because its paragraphs need width.
- No fixed heights, no equalised card heights via absolute values; cards stretch with content.

### 8.2 Semantics

- One `h1` (hero). Section titles are `h2` via `SectionHeader`. Item titles are `h3`. No level is
  skipped and no heading is used for decoration.
- Each section is a `<section>` with `aria-labelledby` referencing its `h2` id. Use exactly these
  pairs, which follow the existing `home-proof-heading` convention and match the message-key
  prefixes:

  | Section id | Heading id |
  | --- | --- |
  | `bring-me-in` | `home-situations-heading` |
  | `how-i-help` | `home-help-heading` |
  | `ways-to-work` | `home-formats-heading` |
  | `how-i-work` | `home-principles-heading` |
  | `questions` | `home-questions-heading` |
  | `engagements` | `home-engagements-heading` |
  | `contact-cta` | `home-contact-heading` |
- Lists are real lists: buyer situations and capabilities are `ol` (they carry visible indices),
  format bullets and principles are `ul`. Question and answer pairs are `h3` + `p`.
- Mono index labels (`01`, `02`, `03`) that duplicate `ol` numbering must be `aria-hidden="true"`,
  so screen readers hear the list position once.
- The decorative corner block pattern used in the retired Thesis card keeps `aria-hidden="true"`
  wherever it is reused.

### 8.3 Keyboard and focus

- Tab order follows DOM order; nothing on the lower page is removed from the tab order.
- The only element with `tabIndex={-1}` is the `how-i-help` section.
- Every interactive element keeps a visible `focus-visible` ring in both themes. Reuse the existing
  pattern: `focus-visible:ring-[var(--site-rust)] focus-visible:ring-offset-[var(--site-bg)]`.
- Engagement-log rows remain single links with their full row as the target, as today.
- No new interactive element is introduced by this specification: no accordions, tabs, carousels,
  filters, or disclosure widgets. Every answer and every capability is visible in the DOM.

### 8.4 Motion

- The new sections do not use `.observe` / `ScrollReveal`. The current lower homepage does not use
  it either; adding it now would make the longest part of the page animate on every scroll.
- Permitted transitions: `transition` on colour and border for hover and focus on links and cards,
  matching the engagement-log row and card hover styles already in use.
- Under `prefers-reduced-motion: reduce`, nothing on the lower page may move. Because no reveal or
  transform animation is introduced, this holds without new CSS.

### 8.5 Localization and long-copy resilience

- English and German must be commercially equivalent, not literal translations. German uses formal
  address (`Sie`) wherever the visitor is addressed, consistent with the existing catalog.
- Longest strings to lay out against: `home.questions.ai.a` (DE, 308 characters),
  `home.help.aiWorkflows.body` (DE, 267 characters), `home.help.leadership.body` (DE, 226
  characters), and `home.formats.embedded.title` (46 characters, which must be allowed to wrap to
  two or three lines inside its card without changing card padding).
- Compound German nouns must be allowed to break: apply `hyphens-auto` with `lang` already set on
  `<html>` where a heading could otherwise overflow at 360 px (`home.help.aiWorkflows.title`,
  `home.formats.assessment.title`).
- Mono meta lines set by `SectionHeader` are hidden below `md`, so their length is not a narrow-
  width risk; keep them short anyway.
- Both catalogs must contain the same key set. A missing key renders the key id in production and
  is treated as a build-blocking defect.

---

## 9. Visual grammar and how repetition is avoided

Keep the recognisable clean.dev public grammar: warm paper and ink `--site-*` tokens, hairline
rules, mono eyebrows and meta lines in uppercase with wide tracking, rust as the single accent,
6 px card radius, and generous section padding (`py-12 md:py-16`).

The five new sections deliberately use five different information shapes, so nothing reads as a
repeated card catalog:

| Section | Shape | Distinguishing cue |
| --- | --- | --- |
| 1 Bring me in when | Bordered panel, three full-width rows | Rust index, situation titles a buyer recognises |
| 2 How I help | Three hairline-divided columns, no card borders | Muted index, single paragraph each |
| 3 Ways to work together | Three bordered cards | `Tag` + rust cadence line + `+` bullets |
| 4 How I work | Two-column list plus amber-bordered closing card | Green `+` markers, amber accent |
| 5 Questions I get asked | Two-column question and answer pairs | Bold question headings, no borders except top hairlines |

Additional guardrails:

- Among the new sections, `Card` is used only by the three format cards in section 3 and by the
  closing-sentence block in section 4. Sections 1, 2, and 5 must not use it. The existing contact
  aside keeps its cards.
- At most one `Tag` per card, and only in section 3.
- No icons or illustrations are introduced. The site has none on the public pages today.
- No pricing, no tier comparison, no "most popular" emphasis, no testimonial, no logo wall.
- The word "package" appears only in `home.help.lead` (negated) and in the advisory cadence line,
  where it comes from the approved input.

### Pacing: skim path and read path

The page must work at two speeds, and the implementation must preserve both.

**Skim path** (headings plus one strong cue per section, in this order):

| Section | Heading | The one cue a skimmer must catch |
| --- | --- | --- |
| 1 | Bring me in when | The three situation titles |
| 2 | How I help | The three capability titles |
| 3 | Ways to work together | The three cadence lines |
| 4 | How I work | The amber closing sentence |
| 5 | Questions I get asked | The four question headings |
| 6 | Engagement log | The org column |
| 7 | Let's talk | The primary action |

Every cue in that column is a heading, a mono line, or a button — all of them visually louder than
the body copy around them. A visitor who reads only that column still learns the situation, the
capability, the shape, the stance, the objection answers, the evidence, and the next step.

**Read path**: exactly one paragraph or one short list per item, never both, and never a nested
disclosure. Authored lower-page copy comes to roughly 505 English words, against roughly 573 today
(both counts exclude the engagement log, which renders project data). The page therefore gets more
commercially useful without getting longer, because the length moves from manifesto prose to the
buyer's problem and the engagement shape.

**Rhythm rule**: no two adjacent sections may use the same information shape (see the table above),
and no section may present more than three primary items. Section 5 is the single exception with
four, and it uses the quietest shape on the page.

### Bounded component additions

Only these primitive changes are authorised. Everything else is composed locally inside
`landing-page.tsx`.

1. `SiteSection` in `apps/web/src/components/site/public-design.tsx` gains three optional props:

```tsx
export const SiteSection = ({
  children, className, border = true, id, ariaLabelledBy, tabIndex,
}: {
  children: ReactNode;
  className?: string;
  border?: boolean;
  id?: string;
  ariaLabelledBy?: string;
  tabIndex?: number;
}) => (
  <section
    id={id}
    aria-labelledby={ariaLabelledBy}
    tabIndex={tabIndex}
    className={clsx('py-12 md:py-16', border && 'border-b border-[var(--site-rule)]', className)}
  >
    {children}
  </section>
);
```

2. `SectionHeader` gains an optional `titleId` that is applied to the rendered `h2`, so sections can
   reference it from `aria-labelledby`.

3. New presentational components live in `landing-page.tsx` and are not exported:
   `BuyerSituations`, `HowIHelp`, `WaysToWork`, `HowIWork`, `Questions`. They follow the existing
   file conventions: arrow-function components, `msg(intl, id)` for copy, `const` id tuples at the
   top of the file (replacing `PRACTICES`, `TOPICS`, `FIT`, `WORKBENCH_ROWS`).

No change to `Card`, `Tag`, `Eyebrow`, `ButtonLink`, `DefinitionList`, `StatStrip`, `PageHero`, or
the `--site-*` token set is authorised by this specification.

---

## 10. Content guardrails

- Every quantitative or client-specific claim on the homepage continues to come from
  `apps/web/src/app/projects.ts` through the proof strip and the engagement log. The new sections
  introduce **no numbers** other than the approved cadences and durations in section 3.
- No client names beyond those already rendered by the engagement log; no internal client tool
  names; no confidential architecture, prompts, credentials, or data.
- No testimonials, no logos, no certifications, no rates, no discount or urgency language.
- Availability is rendered only by `getConsultingAvailability()` in the hero and the contact aside.
  The new sections describe cadence, never a start date, and `home.formats.note` makes the
  dependency on current availability explicit.
- Cadence copy must never imply parallel full-time employment: three to five days per week for an
  embedded engagement plus one day per week advisory is not presented as a simultaneous total.
  Keep `home.formats.note` adjacent to the cadence lines.
- AI content states, in the visitor's own reading order: what work AI is used for (section 2),
  and that use is bounded by client approval, controlled access, deterministic checks, and human
  review (section 5). Neither may be softened into "AI-powered" marketing language.
- First person throughout ("I"), consistent with the hero. Third-person "Martin" appears only in
  the profile card, where it already does.

---

## 11. Implementation acceptance criteria for #92

A cold agent can treat this as the definition of done.

1. The lower homepage renders exactly seven sections in the order of section 3 of this document,
   with the ids listed there.
2. Thesis, Position, Operating model, Workbench, Topics, and the fit grid no longer render, and
   their message keys are deleted from `en.json` and `de.json` per section 6.8.
3. Every string in section 6 is present in both catalogs with the exact value given, and no other
   homepage string changes.
4. `nav.howIHelp` appears in the primary navigation in position two, at every width, with
   `href="/#how-i-help"` and no active state.
5. Header navigation appears from `lg`; the bottom pill appears below `lg`; `body` padding follows
   the same breakpoint.
6. At 360 px the three-item mobile pill fits without page-level horizontal overflow in both locales;
   the `max-[359px]` rule is present.
7. Activating `How I help` from `/`, `/work`, and `/contact`, with pointer and with keyboard, lands
   on `/#how-i-help`, positions the section 96 px from the viewport top, and leaves
   `document.activeElement` equal to the `#how-i-help` element.
8. Keyboard activation and direct URL entry show a visible rust focus ring on the section; pointer
   activation does not.
9. Browser Back after a cross-route jump returns to the previous route and position; Back after a
   same-page jump removes the hash and restores the previous homepage position.
10. Heading order on `/` is h1 → h2 (proof) → h2/h3 pairs per section, with no skipped level, in
    both locales.
11. Axe reports no WCAG 2.1/2.2 A or AA violations on `/` in both themes and both locales
    (`landmark-unique` remains the only disabled rule).
12. `scrollWidth - clientWidth <= 1` on `/` at 390 px and 412 px in both locales.
13. Under `prefers-reduced-motion: reduce`, no element on the lower homepage animates or transforms.
14. German and English pages carry the same sections, the same order, and commercially equivalent
    meaning; no German string overflows its container at 360 px.
15. The hero, proof strip, Douglas evidence, availability source, CTA behaviour, themes, and
    `/work` remain unchanged.
16. `pnpm --filter @cleandev/web test`, the Playwright public-site suite, and `next build` pass with
    no new failures relative to the recorded baseline (section 13).

---

## 12. Route, component, and test impact map

### Files to change

| File | Change |
| --- | --- |
| `apps/web/src/components/home/landing-page.tsx` | Remove `Thesis`, `Position`, `OperatingModel`, `WorkbenchCard`, `Topics`, and the fit grid inside `FitAndContact`; add `BuyerSituations`, `HowIHelp`, `WaysToWork`, `HowIWork`, `Questions`; add ids and `aria-labelledby`; update the `const` id tuples; keep `Hero`, `EvidenceStrip`, `EngagementLog`, `ProfileCard`, `AvailabilityCard` untouched |
| `apps/web/src/components/site/public-design.tsx` | `SiteSection` gains `id`, `ariaLabelledBy`, `tabIndex`; `SectionHeader` gains `titleId` |
| `apps/web/src/components/ui/navigation.tsx` | Header nav `md:block` → `lg:block`; bottom pill `md:hidden` → `lg:hidden` |
| `apps/web/src/components/ui/navigation-links.tsx` | Mobile item classes gain `max-[359px]:min-w-0 max-[359px]:px-2.5` |
| `apps/web/src/app/layout.tsx` | Add the `How I help` item in position two; `pb-20 md:pb-0` → `pb-20 lg:pb-0` |
| `apps/web/src/messages/en.json` | Add section 6 keys, delete section 6.8 keys, reorder to page order |
| `apps/web/src/messages/de.json` | Same, in the same key order |

### Files that must not change

`apps/web/src/app/page.tsx`, `src/lib/availability.ts`, `src/app/projects.ts`, `src/app/lab.ts`,
`src/app/work/**`, `src/app/contact/**`, `src/components/route-scroll-reset.tsx`,
`src/components/scroll-reveal.tsx`, `src/app/globals.css`, `src/styles/tokens.css`,
`DESIGN_SYSTEM.md`.

### Tests to add

In `apps/web/e2e/public-site.spec.ts`:

1. `homepage presents the approved lower-page sections in order` — assert `h2` text sequence on `/`
   contains, in order: proof heading, `Bring me in when`, `How I help`, `Ways to work together`,
   `How I work`, `Questions I get asked`, `Engagement log`, `Let's talk`.
2. `How I help is reachable from every public route with pointer and keyboard` — for `/`, `/work`,
   `/contact`: click the nav item, expect URL `/#how-i-help`, expect the section top within 1 px of
   96 px, expect `document.activeElement.id === 'how-i-help'`; repeat with `focus()` + `Enter` and
   additionally assert `document.querySelector('#how-i-help').matches(':focus-visible')`.
3. `browser back after How I help restores the previous view` — cross-route case returns to the
   previous route; same-page case leaves `location.hash === ''`.
4. `engagement formats state cadence without promising availability` — assert the three format
   titles, the three cadence strings, and `home.formats.note` are visible.
5. `AI trust content states client-approved and reviewable use` — assert the AI question and answer
   text on `/` in English and German.
6. `German lower homepage matches the approved copy` — assert the German section headings, the
   closing sentence, and the three German format titles.
7. `the three-item navigation fits the narrowest supported width` — inside the existing
   `public site mobile friendliness` block, set `page.setViewportSize({ width: 360, height: 800 })`,
   load `/` in German, and assert both `document.documentElement.scrollWidth - clientWidth <= 1`
   and that the mobile pill's bounding width is ≤ `clientWidth - 24`.

In `apps/web/src/components/site/public-design.integration.test.tsx`:

8. `SiteSection exposes an addressable, focusable region` — render with `id`, `ariaLabelledBy`,
   `tabIndex={-1}`; assert the attributes land on the `<section>`.

### Existing tests that must keep passing unchanged

- `public site accessibility` for `/` (Axe, both themes).
- `homepage presents core navigation and CTAs on mobile` — note the added third nav item; the
  existing `primaryTapTargets` matchers still resolve because they use `.first()`.
- `primary homepage actions are visible without scrolling and have comfortable targets`.
- `homepage leads with verified project evidence and does not promote an empty blog` — the strings
  it asserts all live in the hero, proof strip, and engagement log, none of which change.
- `Douglas is one targetable progression case in English and German` — the exact-match `Douglas`
  link in the proof strip is untouched.
- `German positioning preserves the approved commercial facts`.
- `skip link moves keyboard users to the main content`.
- `src/test/a11y-source-guards.test.ts` — already failing (section 13), but do not add to it: no
  new `text-[…rem]` below `0.75rem` and no `text-[…px]` below `12px`. New body copy uses `text-sm`
  or larger; mono meta lines use `text-xs`.
- `src/components/ui/shell.integration.test.tsx` — already failing for unrelated reasons; the
  breakpoint change must not make its snapshot or assertions worse.

---

## 13. Known baseline, risks, and follow-ups

Recorded so that #92 does not chase pre-existing failures:

- `pnpm lint` in `apps/web` is broken independently of this work (`next lint` was removed in
  Next 16). Do not treat it as a regression; do not fix it in #92.
- Verified unit-test baseline on this tree (`npx vitest run`, 25 August 2026, commit `4ed83e1`):
  **24 files, 198 tests, 3 failing in 2 files.**
  - `src/test/a11y-source-guards.test.ts` — sub-12 px arbitrary text sizes introduced by the
    May 2026 redesign.
  - `src/components/ui/shell.integration.test.tsx` — two failures caused by `usePathname()`
    returning `undefined` under jsdom in `navigation-links.tsx`, plus one obsolete snapshot in
    `__snapshots__/shell.integration.test.tsx.snap` that still describes the pre-redesign header.
  #92 must not fix these and must not regenerate that snapshot as a side effect of the breakpoint
  change; leave it obsolete or track it as separate cleanup. Anything else failing after the change
  is a genuine regression.
- The homepage overflows horizontally by 15–22 px at a 320 px viewport today, caused by lower-page
  panels. Sections 1–5 replace several of those panels, so this may improve incidentally; it is not
  a #92 acceptance criterion and must not be chased into a layout rewrite.
- `DESIGN_SYSTEM.md` is stale for the public site. Track a documentation refresh separately; #92
  must not broaden into it.
- Risk: if `experimental.appNewScrollHandler` is ever enabled, Next stops focusing hash targets and
  blurs instead. Acceptance criterion 7 asserts `document.activeElement`, so the suite fails loudly
  if that happens; the fix would then be an explicit focus call, not a silent regression.
- Risk: adding a third navigation item reduces header headroom. If a fourth item is ever needed
  (for example when Articles returns via #84), the pill needs a different pattern, not smaller type.

---

## 14. Approval

Issue #101 requires Martin's approval of the rendered-content direction before #92 returns to Ready.
Two points are worth an explicit yes or no before implementation starts:

1. **Navigation breakpoint.** Tablet widths (768–1023 px) move from the top navigation to the
   bottom pill so the German three-item navigation always fits (section 7.2).
2. **Removal of Topics and the Workbench card.** They are the last homepage traces of a writing
   practice that has no published content; removing them is consistent with #89's Articles decision
   but it does visibly shorten the page's editorial character.

Everything else in this document is a design decision taken under the authority of #101 and does
not need a separate confirmation.
