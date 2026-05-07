# Task: Add integration tests and final MVP validation

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: reviewer

## Dependencies
- 010
- 013
- 014
- 015
- 016

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 010
- Read `.pi/tasks/010-implement-daemon-authentication-and-project-mapping-flow/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/010-implement-daemon-authentication-and-project-mapping-flow/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/010-implement-daemon-authentication-and-project-mapping-flow/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/010-implement-daemon-authentication-and-project-mapping-flow/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 013
- Read `.pi/tasks/013-implement-daemon-websocket-client-batching-heartbeats-and-full-reconcile-loop/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/013-implement-daemon-websocket-client-batching-heartbeats-and-full-reconcile-loop/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/013-implement-daemon-websocket-client-batching-heartbeats-and-full-reconcile-loop/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/013-implement-daemon-websocket-client-batching-heartbeats-and-full-reconcile-loop/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 014
- Read `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 015
- Read `.pi/tasks/015-add-demo-mode-with-synthetic-or-sanitized-public-cockpit-streams/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/015-add-demo-mode-with-synthetic-or-sanitized-public-cockpit-streams/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/015-add-demo-mode-with-synthetic-or-sanitized-public-cockpit-streams/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/015-add-demo-mode-with-synthetic-or-sanitized-public-cockpit-streams/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 016
- Read `.pi/tasks/016-add-manual-pruning-basic-observability-and-operator-documentation/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/016-add-manual-pruning-basic-observability-and-operator-documentation/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/016-add-manual-pruning-basic-observability-and-operator-documentation/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/016-add-manual-pruning-basic-observability-and-operator-documentation/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Add or update tests across `packages/cockpit-protocol`, `apps/cockpit-daemon`, `packages/pm`, and `apps/web` to cover schema validation, event idempotency, projection determinism, device auth rejection, telemetry policy redaction, and mobile cockpit rendering. Use Task 010's pairing/mapping flow, Task 013's daemon streaming loop, Task 014's private UI, Task 015's demo mode, and Task 016's runbook/pruning behavior as the acceptance surface for final validation. Perform a final end-to-end validation using this repo's `.pi/archive` data: create a clean.dev project, map the local repo, run daemon `preview`, stream events, confirm project/worktree/task state in the UI, disconnect the daemon long enough to trigger one-minute stale health, and document any remaining MVP gaps in `docs/cockpit-runbook.md`; the plan is complete when these checks pass and root `pnpm lint`, targeted builds, and relevant tests are green or any pre-existing unrelated failures are clearly documented.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/017-add-integration-tests-and-final-mvp-validation/task.md`.
- Write progress updates only to `.pi/tasks/017-add-integration-tests-and-final-mvp-validation/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/017-add-integration-tests-and-final-mvp-validation/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/017-add-integration-tests-and-final-mvp-validation/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
