# Shared content for the identity specimens

Use this content verbatim. Do not invent additional copy, testimonials, metrics or imagery. If a direction needs a label the content does not provide (for example a figure number), keep it minimal and note it in NOTES.md.

Copy marked "experiment copy" was written for this experiment with Martin's permission and is not published text. The essay excerpt is Martin's own unpublished draft.

## Site

- Name: clean.dev
- Person: Martin Trenker
- Navigation: Writing, Work, Lab, Contact
- Language switch: EN / DE (DE is a non-functional control in the specimen)
- Footer: "Open source and built in public." Links: GitHub, Imprint, Privacy. Colophon line (experiment copy): "Made with a coding agent, reviewed by a human. Every element on this page has a reason you can ask about."

## Homepage intro (experiment copy)

Status line: Currently embedded with a team. Remote in DACH, on-site around Munich.

Heading: Software organizations are factories. Most have one bottleneck, and it is rarely the developers.

Lead: I'm Martin Trenker. I've written software for 25 years, most of them inside organizations where good engineers were slowed down by the system around them. clean.dev is where I work out, in public, how clean code, real agility and AI behave inside a team: not as rituals or tools, but as a factory with constraints you can find and fix.

Second paragraph: I join teams as a technical lead or solutions architect and stay close to the code, because that is where the factory tells the truth. Everything here, including the site itself, is built in the open.

Call to action (plain link, not a button by default): Let's talk about your team.

## Figure: where the work waits (illustrative numbers)

Title: Where the work waits

A delivery system with five stations. Numbers are illustrative.

| Station | Waiting | Capacity |
| --- | --- | --- |
| Ideas | 48 | unlimited |
| Refinement | 12 | 1 product owner |
| Development | 9 in progress | 5 developers |
| Review | 14 | 1 senior reviewer |
| Release | 0 | every 2 weeks |

Constraint: Review.

Caption: Adding two developers here feeds the review queue. The constraint is review capacity, so more developers make the system slower, not faster, until review is relieved.

Text equivalent (must be present in the page for readers who cannot see the figure): Work flows from Ideas through Refinement, Development and Review to Release. The longest queue sits in front of Review, where 14 changes wait for one senior reviewer. Development has 9 changes in progress for 5 developers. Adding developers increases the review queue; the constraint is review capacity.

## Essay excerpt (Martin's draft, unpublished)

Section label: Writing
Title: I'm done with autonomous "Agent Fleets"
Meta: Draft, 2026. About 9 minutes.

I knew I had lost control when I used my agent fleet to build a dashboard for my agent fleet.

The fleet was working. It took large plans, split them into tasks and sent agents into separate workspaces. Code appeared quickly. What I no longer had was any idea what was going on.

So I asked the fleet to build its own "flightdeck": a web app that ingested all the task folders where I logged every agent turn and a summary as JSONL. The dashboard showed a live view of the agents running across my machines. It was read-only at first. Steering from the dashboard would definitely come later.

The result had a lot of information on the screen. It still wasn't what I needed.

Worse, I had no idea what was going on inside the fleet-generated codebase behind it. It looked like all the other AI projects I had seen. It worked, but it felt neither like an achievement nor like something I wanted to use.

Subheading: The cost I hadn't planned for

I have always been proud of the skills I earned over the last 25 years. This "productivity boost" slowly chipped away at that pride and replaced it with anxiety. Worse, it took away my love for coding.

I wasn't building the system anymore. I was watching a system get built.

Pull quote (use at most once): The bottleneck is still me. That's fine. I have to live with the code after the agents move on.

Link: Read the essay

## Work entry (public case copy from the current site)

Section label: Work
Company: Douglas
Period: 2024 to 2026
Role: React Expert, then Technical Lead, then Solutions Architect
Mandate: Modernise the POS/CRM platform from its React frontend to backend services in TypeScript/Node.js and C#/.NET, unify the CRM API landscape, and introduce governed AI tooling.

Progression:
1. React Expert. Joined to modernise the POS software used in more than 1,200 stores across 14 European countries.
2. Technical Lead. Led the move from legacy Angular to maintainable React and shipped the business-critical CRM integration in under a year.
3. Solutions Architect. Took on broader scope across TypeScript/Node.js and C#/.NET backend services to unify the CRM API landscape and introduce governed AI tooling for daily delivery work.

Link: All work

## Figure 2: two ways to work with agents (direction D only, derived from the essay excerpt)

This figure is derived from the essay text above. It adds no claims that are not in the essay.

Title: Two ways to work with agents

Row 1, label "Fleet": Large plan → split into tasks → agents in separate workspaces → code appears → dashboard. No station is marked as the constraint; the row ends in "no understanding" (from the essay: "What I no longer had was any idea what was going on").

Row 2, label "Now": Issue → one small task → worktree (orchestrator, implementer, reviewer) → pull request → review by Martin → merge. The station "review by Martin" is the constraint.

Caption: The bottleneck is still me. That's fine. I have to live with the code after the agents move on.

Text equivalent: In the fleet workflow, a large plan is split into tasks and sent to agents in separate workspaces; code appears quickly and a dashboard shows activity, but understanding is lost. In the current workflow, one groomed issue becomes one small task, worked in a worktree by an orchestrator, an implementer and a reviewer, then crosses as a pull request into Martin's review before it is merged. The constraint is Martin's review, by design.

Note: when Figure 2 uses the pull quote as its caption, do not repeat the pull quote elsewhere in the essay section.
