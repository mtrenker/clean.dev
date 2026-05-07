# Task: Implement clean.dev cockpit project management and device pairing APIs

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 004

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 004
- Read `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Add authenticated server actions or route handlers under `apps/web/src/app/cockpit/` and `apps/web/src/app/api/cockpit/` for creating/listing cockpit projects, starting a daemon pairing flow, approving a device from the browser session, exchanging the device code for a daemon credential, and revoking devices. Build on Task 004's cockpit tables and repository functions for project persistence, device creation, token/session storage, and revocation, while also following the existing NextAuth/GitHub session and `apps/web/src/lib/authz.ts` patterns documented by Task 001. Ensure anonymous users cannot create projects, approve devices, or ingest events; the task is done when a logged-in user can create a project id in the UI/API and pair a named daemon device without reusing the browser session token.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/task.md`.
- Write progress updates only to `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
