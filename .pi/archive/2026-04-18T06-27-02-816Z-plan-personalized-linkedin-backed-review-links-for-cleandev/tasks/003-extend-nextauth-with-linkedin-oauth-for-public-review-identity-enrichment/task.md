# Task: Extend NextAuth with LinkedIn OAuth for public review identity enrichment

## Configuration
- **engine**: claude
- **profile**: balanced
- **model**: sonnet
- **thinking**: medium
- **agent**: worker

## Dependencies
- 001

## Requirements
Modify `apps/web/auth.ts` and any related auth route wiring in `apps/web/src/app/api/auth/[...nextauth]/route.ts` so the app supports LinkedIn as an authentication provider alongside the existing GitHub setup. The implementation must shape session/profile data for the review flow, validate allowed callback behavior for the public review route, add the required environment variables to `apps/web/.env.example` and `k8s/deployment.yaml`, and be considered done when LinkedIn login can return reviewer name/profile information without weakening existing admin/login behavior.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/003-extend-nextauth-with-linkedin-oauth-for-public-review-identity-enrichment/task.md`.
- Write progress updates only to `.pi/tasks/003-extend-nextauth-with-linkedin-oauth-for-public-review-identity-enrichment/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/003-extend-nextauth-with-linkedin-oauth-for-public-review-identity-enrichment/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/003-extend-nextauth-with-linkedin-oauth-for-public-review-identity-enrichment/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
