# Problem-led positioning (#125)

Status: accepted by Martin on 2026-10-20 ("looking good") on the rendered preview at `021df86`.
Design owner: Claude Opus 5.5. This note is the source of truth for #125. The #125 design folder
(`proposal.md` revision 3, `fable-review-input.md`, `martin-correction-2026-10-20.md`) is historical
input; where it differs, this note wins.

## Direction

A reader should meet Martin through what drives him: improving digital systems and products for
the people who work with and use them. Getting to the bottom of a problem and solving it where it
belongs is how he does that; one concrete cross-stack decision shows it with its consequence. The
teenage server and IRC story is background, never the motivation (see "Motivation hierarchy").
Frontend expertise and the Technical Lead / Solutions Architect roles stay visible; the motivation
is stated, not defended.
No "not just frontend" sentence, no new title, tag or years-per-stack claim.

| Surface | What changed |
| --- | --- |
| Homepage hero | Headline states the purpose; lead names the role, the method and the range (React frontend to API, data model and platform). Supporting line, availability and CTAs unchanged |
| Homepage rail | "20+ years of experience" / "20+ Jahre Erfahrung" |
| Homepage proof band | Heading "From POS frontend to CRM API"; lead adds the CRM backend extension and the unified-API consequence; personal ownership shows the shipped API and runtime config |
| Homepage engagement log | Rows from Martin's `spotlight` curation (seven, newest first); Douglas context is the unified-API consequence |
| Homepage closing profile card | Method note: understand the problem, solve it for the team and the people who work with the product. No origin story |
| `/work` opening | Lead: method plus the Douglas example. Profile card gains "What drives me": purpose, then method, then one origin sentence |
| `/work` order | Selected projects → current hands-on systems → timeline (with certifications) → CTA |
| `/work` lab lead | Own products and platform framed as owning every layer, not as grounding for client work |
| Douglas case (card, PDF entry, dossier, homepage) | Evidence picked by statement, not index. Ownership: shipped API, runtime config, NestJS backend, agent CLI. Outcomes add the shortlink/QR service as an unmeasured observation |
| CV page one | About text: purpose, method and Douglas, then one origin clause, 2006–2008 employment, self-employment since 2008, own platform. The process focus block becomes "Selected examples": two attributed Douglas decisions and the self-funded platform |
| Dossier | `## Summary` / `## Kurzprofil` after the profile: the page-one paragraphs and examples |

## Factual constraints applied

- "20+" counts experience, including development before paid work. It is never labelled paid,
  client, professional or delivery years, and no surface derives a year count from 2006 or 2008.
- Chronology stays in three separate lines: early personal learning (first server as a teenager,
  Linux root servers with mail and web servers, helping on IRC, undated otherwise; the surfaces now
  use only the first server and IRC); two employed
  developer positions 2006–2008 (no names, titles or technologies, no entries of their own);
  self-employed client work since 2008 (`projects.ts`).
- IRC is one example of early activity, never the origin of his development experience.
- The client technology range in the about text names only systems in client records
  (PHP/Oracle at McKinsey, React, .NET at Douglas).
- Attribution labels: "client work", "self-funded"; team contribution stays in its own group.
  The shortlink/QR service is an observation, not personal ownership, because its record does not
  say Martin built it alone.

## Narrow supersessions

- `homepage-positioning-spec.md`: hero heading and lead, proof-band heading and lead, rail label,
  engagement-log Douglas context and row rule, and `home.profileCard.note`. Its lower sections
  are unchanged.
- #90 Douglas selection (`douglas-case.ts`): additions and order only; the C#/.NET sentence stays.
- #93 `/work`: hero lead, lab lead, and lab position (now before the timeline).
- `work.about.p1/p2` and the print focus block (`work.section.*`, removed) had no approved owner.
- Project data: the shortlink highlight now carries the same facts in both locales ("from request
  to production" and "no longer met business needs" were each in one locale only); "mandator
  configuration" reads "tenant configuration".
- Proposal revision 3's "home hero unchanged" does not bind #125. The homepage now carries no
  origin story (see "Motivation hierarchy").

## Voice and audience review (2026-10-20)

Martin on the preview: "recruiter summary for example. i'm not catering to recruiters", then "i
like 20+ years but the 20 clients are also a bit odd as this number does not really sound
impressive". The pages describe his work; they do not address or name a reader group. Review lenses
(not page labels): senior developers look for technical understanding, concrete decisions,
hands-on work and operational consequences; decision makers look for the business need,
responsibility and what changed.

| Where | Before | After |
| --- | --- | --- |
| `/work` hero eyebrow | Recruiter summary / verified project data · Recruiter-Überblick / verifizierte Projektdaten | Work / 20+ years of experience · Projekte / 20+ Jahre Erfahrung |
| `/work` stat strip | 20+ years · 20 client engagements · 16 companies · projects since 2008 | Removed; the years moved into the eyebrow |
| Homepage rail | 20+ years of experience · 20 client engagements | 20+ years of experience |
| Print CV page one | Four-cell evidence strip with the same counts | "20+ years of experience" label under the role |
| `/work` metadata description | "20 client engagements, from React expert…" · "20 Kundenprojekte, vom React-Experten…" | "From React expert…" · "Vom React-Experten…" |
| `/work` selected-projects lead | Three recent engagements showing architecture modernisation, delivery responsibility, and knowledge transfer inside active teams. | Names the three cases: one CRM API instead of duplicated logic, the agency-to-in-house Next.js handover during active delivery, the AngularJS workflow rebuilt on a state machine |
| `/work` evidence note | Recorded counts … no business KPI is implied. | Counts and periods from the project records are marked as measured facts. What I observed but did not measure is marked as an observation. |

The engagement and company counts measure activity, not depth, and "projects since 2008" beside
"20+ years" invited readers to subtract. No substitute metric was added.

Kept: the measured/observed tags and the own-system, client-work and team-contribution groups (real
distinctions); 1,200 stores and 14 countries (they explain the Douglas case); "Client relevance"
on own systems (commercial usefulness, not an audience label). Not reviewed here, candidates for a
later pass: "real engagements, newest first" (timeline and print meta) and the homepage supporting
line "Inside the work. Sharper delivery. AI with judgment."

Gap: the records state decisions and their consequences (one API instead of duplicated logic,
runtime config without a release, an in-house shortlink service instead of SaaS, a state-machine
rebuild) but not the alternatives considered, their costs, or measured business results. For the
unified Douglas API, Martin has since supplied the rationale (below); the other decisions still lack
it, and none was inferred.

### Douglas API decision (Martin, 2026-10-20)

Martin: "we had a few options, including extend an existing api but it was nestjs and typescript
and internally there was a movement to use c# on the backend since this was the most well
understood and supported setup. also just adding another controller to an existing api that wasn't
built from the ground up with the required resilience and scaling was shoehorning it"

Presented once as `decision` in the Douglas case copy (`douglas-case.ts`), a curated statement
like the mandate and progression and not a project-record highlight. The `/work` case card shows it
as its own section after the role progression; the print CV adds it as a highlight group after the
progression; the dossier adds it after the mandate. The homepage proof band does not repeat it.

- EN "Why a separate C#/.NET API": Extending the existing NestJS/TypeScript API was one of a few
  options. Internally, though, there was a move towards C# on the backend, because it was the best
  understood and supported setup. The existing API was also not built from the ground up for the
  resilience and scaling the unified API required; adding another controller to it would have
  meant shoehorning those requirements in. I continued to maintain the production TypeScript API.
- DE "Warum eine eigene C#/.NET-API": Eine von mehreren Optionen war, die bestehende
  NestJS-/TypeScript-API zu erweitern. Intern gab es aber eine Bewegung hin zu C# im Backend, weil
  dieses Setup am besten verstanden und unterstützt wurde. Außerdem war die bestehende API nicht von
  Grund auf für die Resilienz und Skalierung gebaut, die die einheitliche API brauchte; einen
  weiteren Controller dort hinzuzufügen, hätte bedeutet, diese Anforderungen hineinzuzwängen. Die
  produktive TypeScript-API habe ich weiter gewartet.

This is rationale and requirements, not a result. The text does not claim a mandate, a language
being better, resilience delivered by C#, a criticism of the existing API beyond its fit, other
named alternatives, scale figures or a migration of other APIs.

This supersedes, for these items only, the `/work` hero label from the "recruiter friendly" change,
the homepage rail count and the `StatStrip` primitive in `homepage-positioning-spec.md`, and the
`/work` description and `home.proof.engagements` source in `search-social-presentation-spec.md`.
The homepage rail now reads `work.experience`, the same string as the `/work` eyebrow and print CV.

## Motivation hierarchy (Martin, 2026-10-20)

Martin: "now i feel like the what drives me section says that my teenage experience drives me,
which sounds weird. what drives me is improving the digitalization and the lives of people who work
with and use the systems and products. the server story is an annectode, not my main pitch"

Order everywhere: purpose (better digital systems and products for the people who work with and
use them) → method (get to the bottom of a problem, solve it where it belongs, across the stack) →
origin as optional background. No measured improvement for people or businesses is claimed.

| Surface | Purpose | Method | Origin |
| --- | --- | --- | --- |
| Homepage headline | "I improve digital systems and products for the people who work with and use them." / "Ich verbessere digitale Systeme und Produkte für die Menschen, die damit arbeiten und sie nutzen." | In the lead, with the role and the stack range | None |
| Homepage profile card note | Implied by the people named | "I understand a problem first, then find the best way to solve it, for the team that builds the product and the people who work with it." | Removed |
| `/work` "What drives me" | First sentence | Second sentence | Last sentence, framed as where the problem-solving habit started |
| CV page one and dossier summary (`work.about.p1/p2`) | Opens p1 | Second sentence of p1, then Douglas | One clause opening p2 ("My experience goes back to renting my first server as a teenager"), then the unchanged chronology |

The `/work` hero lead (method plus Douglas) is unchanged; the purpose sits beside it in the profile
card. This supersedes the earlier direction that led with problem-solving and the earlier
assumption that the origin story belonged in the motivation note.

## Open point

Martin accepted the rendered preview as a whole. The shortlink record's "from request to
production" and "no longer met business needs" clauses were not confirmed separately.

## Preview

Public-site mode, no secrets, no database. From `apps/web`, in a visible Herdr tab:

```bash
# once per fresh worktree: the admin routes import @cleandev/db from its build output
pnpm --filter @cleandev/db build
pnpm dev:raw --webpack --hostname 127.0.0.1 --port 3125   # check the port is free first
```

Stop with Ctrl-C in that tab. Switch locale with the EN/DE control in the header (it sets the
`NEXT_LOCALE` cookie) and the theme with the light/dark control. Run e2e against the running
server with `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3125`; CI runs browser tests with one worker,
and parallel workers against the dev server can time out on cold routes. While a dev server runs,
`tsc --noEmit` also reads the generated `.next/dev/types` and reports the non-route export
`PROTON_BOOKING_URL` in `contact/page.tsx` (on `main` since `463f489`); a fresh CI checkout has no
`.next` and passes.

Review evidence for the first preview (`82abec3`) is outside the repository, in the #125 design
folder under `preview/`.
