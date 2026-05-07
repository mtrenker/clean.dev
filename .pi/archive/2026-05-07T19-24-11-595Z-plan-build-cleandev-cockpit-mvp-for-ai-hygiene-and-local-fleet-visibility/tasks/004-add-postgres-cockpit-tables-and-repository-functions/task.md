# Task: Add Postgres cockpit tables and repository functions

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.4
- **thinking**: medium
- **agent**: worker

## Dependencies
- 001
- 002

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 001
- Read `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 002
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Extend the existing database layer in `packages/pm/src/db/schema.ts` and related exports in `packages/pm/src/index.ts` with cockpit tables for projects, paired devices, device tokens/sessions, raw events, projected project state, and manual prune metadata. Use Task 001's database/migration audit and Task 002's protocol schemas to align Postgres column names, JSON payload shapes, idempotency keys, and state types with the shared cockpit contract. Add repository functions under `packages/pm/src/adapters/` or a new `packages/pm/src/cockpit/` module for creating/listing projects, creating/revoking devices, inserting idempotent event batches, marking projects dirty, reading projected state, and pruning raw events; the task is done when migrations can be generated with the existing `db:generate` flow and TypeScript builds without breaking existing PM exports.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/task.md`.
- Write progress updates only to `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
