# Task: Add debounced projection from raw cockpit events to current project state

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 004
- 006

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 004
- Read `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 006
- Read `.pi/tasks/006-build-the-websocket-ingestion-endpoint-with-authentication-idempotency-and-acknowledgements/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/006-build-the-websocket-ingestion-endpoint-with-authentication-idempotency-and-acknowledgements/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/006-build-the-websocket-ingestion-endpoint-with-authentication-idempotency-and-acknowledgements/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/006-build-the-websocket-ingestion-endpoint-with-authentication-idempotency-and-acknowledgements/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Implement a projection module under `apps/web/src/lib/cockpit/` or `packages/pm/src/cockpit/` that folds unprojected raw events into current project state records for projects, worktrees, plans, tasks, agents, health indicators, and last activity. Use Task 004's raw event and projected-state tables as the storage boundary, and use Task 006's ingestion acknowledgement/dirty-project behavior to decide which projects need debounced projection. Use a debounce window of a few seconds for active projects and mark daemon/project state stale after one minute without heartbeat; the task is done when repeated event batches update a single current-state snapshot deterministically and the UI/query layer can read that snapshot without scanning the entire raw event log.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/task.md`.
- Write progress updates only to `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
