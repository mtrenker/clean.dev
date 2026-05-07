# Task: Implement daemon authentication and project mapping flow

## Configuration
- **engine**: claude
- **profile**: balanced
- **model**: sonnet
- **thinking**: medium
- **agent**: worker

## Dependencies
- 005
- 008
- 009

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 005
- Read `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 008
- Read `.pi/tasks/008-scaffold-the-standalone-cockpit-daemon-cli-app/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/008-scaffold-the-standalone-cockpit-daemon-cli-app/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/008-scaffold-the-standalone-cockpit-daemon-cli-app/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/008-scaffold-the-standalone-cockpit-daemon-cli-app/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 009
- Read `.pi/tasks/009-implement-daemon-local-sqlite-state-event-outbox-and-reconnect-safe-sequencing/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/009-implement-daemon-local-sqlite-state-event-outbox-and-reconnect-safe-sequencing/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/009-implement-daemon-local-sqlite-state-event-outbox-and-reconnect-safe-sequencing/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/009-implement-daemon-local-sqlite-state-event-outbox-and-reconnect-safe-sequencing/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Wire `apps/cockpit-daemon` commands to the clean.dev device pairing APIs from Task 005, storing the daemon credential in local state/config and fetching UI-defined cockpit projects for mapping. The `map <project-id> <path>` command must validate that the project exists remotely, that the local path exists, and that telemetry settings are explicit or default-conservative; the task is done when a fresh daemon can log in, list remote projects, map one repo path, and show that mapping in `status` without exposing the browser OAuth session token.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/010-implement-daemon-authentication-and-project-mapping-flow/task.md`.
- Write progress updates only to `.pi/tasks/010-implement-daemon-authentication-and-project-mapping-flow/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/010-implement-daemon-authentication-and-project-mapping-flow/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/010-implement-daemon-authentication-and-project-mapping-flow/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
