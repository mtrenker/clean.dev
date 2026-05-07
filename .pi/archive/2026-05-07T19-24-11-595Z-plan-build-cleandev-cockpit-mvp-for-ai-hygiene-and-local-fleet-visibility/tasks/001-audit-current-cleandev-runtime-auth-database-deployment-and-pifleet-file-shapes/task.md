# Task: Audit current clean.dev runtime, auth, database, deployment, and pi/fleet file shapes

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: scout

## Dependencies
None

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

This task has no upstream task dependencies.

## Requirements
Inspect the existing monorepo structure, especially `apps/web/src/lib/authz.ts`, `apps/web/src/lib/db.ts`, `packages/pm/src/db/schema.ts`, `packages/pm/src/db/migrate.ts`, `Dockerfile`, `k8s/*`, `package.json`, `turbo.json`, and existing `.pi` state/archive files. Produce `docs/cockpit-audit.md` documenting the current auth model, DB migration flow, deployment/WebSocket constraints, package conventions, and the exact `.pi` files/fields the daemon can consume for MVP; the task is done when the document names the recommended WebSocket hosting approach and any constraints that downstream tasks must follow.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/task.md`.
- Write progress updates only to `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
