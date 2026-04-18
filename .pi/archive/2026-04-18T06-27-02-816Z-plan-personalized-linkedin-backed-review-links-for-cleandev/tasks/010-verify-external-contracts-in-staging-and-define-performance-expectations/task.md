# Task: Verify external contracts in staging and define performance expectations

## Configuration
- **engine**: claude
- **profile**: balanced
- **model**: sonnet
- **thinking**: medium
- **agent**: reviewer

## Dependencies
- 003
- 005
- 008
- 009

## Requirements
Run a staging verification of the full review flow against the real LinkedIn OAuth app configuration and the chosen outbound delivery provider, using the deployed auth route at `apps/web/src/app/api/auth/[...nextauth]/route.ts`, the LinkedIn provider setup in `apps/web/auth.ts`, the review submission path in `apps/web/src/app/reviews/actions.ts` or `apps/web/src/app/api/reviews/submit/route.ts`, and the Kubernetes environment wiring in `k8s/deployment.yaml`. Document the exact callback URLs, required scopes, env vars, and observed failure behaviors, then establish a lightweight load/performance expectation for invite opens and submissions—e.g. responsive render and submission handling under a small burst of concurrent traffic. Acceptance criteria: execute and record an end-to-end staging test covering valid invite open, LinkedIn login callback, manual fallback path, successful delivery, and one induced failure case; confirm measured behavior stays within the stated expectation; and attach the verification notes so third-party contract assumptions are proven rather than implied.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/010-verify-external-contracts-in-staging-and-define-performance-expectations/task.md`.
- Write progress updates only to `.pi/tasks/010-verify-external-contracts-in-staging-and-define-performance-expectations/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/010-verify-external-contracts-in-staging-and-define-performance-expectations/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/010-verify-external-contracts-in-staging-and-define-performance-expectations/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
