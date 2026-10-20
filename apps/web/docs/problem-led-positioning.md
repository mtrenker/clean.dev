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
