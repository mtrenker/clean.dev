# Task: Add manual pruning, basic observability, and operator documentation

## Configuration
- **engine**: claude
- **profile**: balanced
- **model**: sonnet
- **thinking**: medium
- **agent**: worker

## Dependencies
- 004
- 006
- 007
- 014

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

### Upstream Task 007
- Read `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 014
- Read `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Add a manual raw-event prune action for authenticated cockpit owners, basic structured logs around pairing, WebSocket connect/disconnect, validation failures, projection runs, and daemon heartbeat staleness, plus an operator guide in `docs/cockpit-runbook.md`. Use Task 004's pruning repository functions, Task 006's ingestion failure modes, Task 007's projection behavior, and Task 014's UI paths to document and expose the real operational workflow. The runbook must explain how to create projects, pair/revoke a daemon, configure telemetry conservatively, run `preview` before streaming, prune events, and diagnose stale/offline projects; the task is done when a second operator can follow the guide to run the MVP safely.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/016-add-manual-pruning-basic-observability-and-operator-documentation/task.md`.
- Write progress updates only to `.pi/tasks/016-add-manual-pruning-basic-observability-and-operator-documentation/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/016-add-manual-pruning-basic-observability-and-operator-documentation/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/016-add-manual-pruning-basic-observability-and-operator-documentation/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
