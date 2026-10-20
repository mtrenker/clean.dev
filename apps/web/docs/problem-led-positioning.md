# Problem-led positioning (#125)

Status: working preview for Martin's review, 2026-10-20. Not accepted production copy.
Design owner: Claude Opus 5.5. Inputs: issue #125 and the #125 design folder
(`proposal.md` revision 3, `fable-review-input.md`, `martin-correction-2026-10-20.md`).
This note records the direction chosen for the preview and where it departs from earlier records.

## Direction

A reader should meet Martin as someone who gets to the bottom of a problem and solves it where it
belongs, then see one concrete cross-stack decision with its consequence. Frontend expertise and
the Technical Lead / Solutions Architect roles stay visible; the motivation is stated, not defended.
No "not just frontend" sentence, no new title, tag or years-per-stack claim.

| Surface | What changed |
| --- | --- |
| Homepage hero | Headline states the motivation; lead names the role and the range (React frontend to API, data model and platform). Supporting line, availability and CTAs unchanged |
| Homepage rail | "20+ years of experience" / "20+ Jahre Erfahrung" |
| Homepage proof band | Heading "From POS frontend to CRM API"; lead adds the CRM backend extension and the unified-API consequence; personal ownership shows the shipped API and runtime config |
| Homepage engagement log | Rows from Martin's `spotlight` curation (seven, newest first); Douglas context is the unified-API consequence |
| Homepage closing profile card | Short origin note replaces the generic note |
| `/work` opening | Lead: motivation plus the Douglas example. Profile card gains "What drives me" with the origin story |
| `/work` order | Selected projects → current hands-on systems → timeline (with certifications) → CTA |
| `/work` lab lead | Own products and platform framed as owning every layer, not as grounding for client work |
| Douglas case (card, PDF entry, dossier, homepage) | Evidence picked by statement, not index. Ownership: shipped API, runtime config, NestJS backend, agent CLI. Outcomes add the shortlink/QR service as an unmeasured observation |
| CV page one | About text: thesis and Douglas, then origin, 2006–2008 employment, self-employment since 2008, own platform. The process focus block becomes "Selected examples": two attributed Douglas decisions and the self-funded platform |
| Dossier | `## Summary` / `## Kurzprofil` after the profile: the page-one paragraphs and examples |

## Factual constraints applied

- "20+" counts experience, including development before paid work. It is never labelled paid,
  client, professional or delivery years, and no surface derives a year count from 2006 or 2008.
- Chronology stays in three separate lines: early personal learning (first server as a teenager,
  Linux root servers with mail and web servers, helping on IRC, undated otherwise); two employed
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
- Proposal revision 3's "home hero unchanged" and "no origin on the homepage" do not bind this pass.

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
rebuild) but not the alternatives considered, their costs, or measured business results. Showing
tradeoffs needs that input from Martin; none was inferred.

This supersedes, for these items only, the `/work` hero label from the "recruiter friendly" change,
the homepage rail count in `homepage-positioning-spec.md`, and the `/work` description in
`search-social-presentation-spec.md`.

## Assumptions to confirm

- "I get to the bottom of a problem and solve it where it belongs" / "Ich gehe einem Problem auf
  den Grund und löse es dort, wo es hingehört" is Martin's voice.
- The origin belongs in profile cards and one CV sentence, not in a headline or the hero.
- Both the request-to-production and business-needs clauses of the shortlink record are accurate.

## Preview

Public-site mode, no secrets, no database. From `apps/web`, in a visible Herdr tab:

```bash
# once per fresh worktree: the admin routes import @cleandev/db from its build output
pnpm --filter @cleandev/db build
pnpm dev:raw --webpack --hostname 127.0.0.1 --port 3125   # check the port is free first
```

Stop with Ctrl-C in that tab. Switch locale with the EN/DE control in the header (it sets the
`NEXT_LOCALE` cookie) and the theme with the light/dark control. Run e2e against the running
server with `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3125`.

Review evidence outside the repository, in the #125 design folder under `preview/`: `screens/`
(home and `/work`, EN/DE, 390 and 1440 px, light and dark), `cv/` (Chromium PDFs, page images,
`pdftotext` and `pdffonts` output) and `dossier/` (both locale downloads).
