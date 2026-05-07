# Task: Build the WebSocket ingestion endpoint with authentication, idempotency, and acknowledgements

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 002
- 004
- 005

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 002
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 004
- Read `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/004-add-postgres-cockpit-tables-and-repository-functions/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 005
- Read `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Implement the WebSocket ingestion runtime in the location recommended by Task 001, using Task 002's `packages/cockpit-protocol` message schemas to validate daemon traffic and Task 004's `packages/pm` repository functions to persist raw event batches. Use Task 005's paired device credential model to authenticate daemon connections, reject unknown/revoked devices, enforce event idempotency by `deviceId`/`projectId`/`sequence` or `eventId`, send acknowledgements with the last accepted sequence, and log validation/auth failures without storing invalid payloads; the task is done when a test client can connect, send a valid batch, receive an ack, and see raw events stored once even after retry.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/006-build-the-websocket-ingestion-endpoint-with-authentication-idempotency-and-acknowledgements/task.md`.
- Write progress updates only to `.pi/tasks/006-build-the-websocket-ingestion-endpoint-with-authentication-idempotency-and-acknowledgements/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/006-build-the-websocket-ingestion-endpoint-with-authentication-idempotency-and-acknowledgements/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/006-build-the-websocket-ingestion-endpoint-with-authentication-idempotency-and-acknowledgements/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
