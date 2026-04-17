# Task: Audit backoffice access boundaries before UI reuse

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: scout

## Dependencies
- 001

## Requirements
Review the admin, client, and invoice surfaces to confirm how authentication, authorization, and route protection currently work in the backoffice modules and whether any UI-layer changes could affect protected navigation. Write findings to `docs/backoffice-access-audit.md`, naming the route guards, middleware, server handlers, or client wrappers involved; task is done when protected surfaces, roles, and any missing protection gaps are documented for follow-up before rollout.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/003-audit-backoffice-access-boundaries-before-ui-reuse/task.md`.
- Write progress updates only to `.pi/tasks/003-audit-backoffice-access-boundaries-before-ui-reuse/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/003-audit-backoffice-access-boundaries-before-ui-reuse/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/003-audit-backoffice-access-boundaries-before-ui-reuse/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
