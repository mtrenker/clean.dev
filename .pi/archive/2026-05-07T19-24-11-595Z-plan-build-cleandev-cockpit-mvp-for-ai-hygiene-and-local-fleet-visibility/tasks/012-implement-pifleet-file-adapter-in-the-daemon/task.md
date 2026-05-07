# Task: Implement pi/fleet file adapter in the daemon

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 003
- 009
- 011

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 003
- Read `.pi/tasks/003-define-the-cockpit-fleet-observability-contract-and-adapter-compatibility-strategy/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/003-define-the-cockpit-fleet-observability-contract-and-adapter-compatibility-strategy/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/003-define-the-cockpit-fleet-observability-contract-and-adapter-compatibility-strategy/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/003-define-the-cockpit-fleet-observability-contract-and-adapter-compatibility-strategy/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 009
- Read `.pi/tasks/009-implement-daemon-local-sqlite-state-event-outbox-and-reconnect-safe-sequencing/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/009-implement-daemon-local-sqlite-state-event-outbox-and-reconnect-safe-sequencing/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/009-implement-daemon-local-sqlite-state-event-outbox-and-reconnect-safe-sequencing/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/009-implement-daemon-local-sqlite-state-event-outbox-and-reconnect-safe-sequencing/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 011
- Read `.pi/tasks/011-implement-git-worktree-and-branch-hygiene-adapter-in-the-daemon/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/011-implement-git-worktree-and-branch-hygiene-adapter-in-the-daemon/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/011-implement-git-worktree-and-branch-hygiene-adapter-in-the-daemon/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/011-implement-git-worktree-and-branch-hygiene-adapter-in-the-daemon/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Add `apps/cockpit-daemon/src/adapters/pi-fleet.ts` to parse the current `.pi` files documented by Task 003, including active task state, per-task status, progress JSONL offsets, archive index data, and plan summaries. Associate fleet/task events with the correct worktree from Task 011, respect per-project telemetry policy for progress text/local paths, and emit semantic events such as `plan_seen`, `task_seen`, `task_started`, `task_progressed`, `task_completed`, `task_failed`, and `usage_reported`; the task is done when replaying this repo's archived `.pi` data through `preview` produces stable event batches without reading `node_modules` or `.git` internals unnecessarily.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/012-implement-pifleet-file-adapter-in-the-daemon/task.md`.
- Write progress updates only to `.pi/tasks/012-implement-pifleet-file-adapter-in-the-daemon/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/012-implement-pifleet-file-adapter-in-the-daemon/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/012-implement-pifleet-file-adapter-in-the-daemon/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
