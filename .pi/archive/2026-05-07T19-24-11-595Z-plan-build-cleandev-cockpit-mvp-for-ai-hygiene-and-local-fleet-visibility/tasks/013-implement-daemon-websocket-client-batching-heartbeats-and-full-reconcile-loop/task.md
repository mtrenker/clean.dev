# Task: Implement daemon WebSocket client, batching, heartbeats, and full reconcile loop

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 006
- 009
- 011
- 012

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 006
- Read `.pi/tasks/006-build-the-websocket-ingestion-endpoint-with-authentication-idempotency-and-acknowledgements/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/006-build-the-websocket-ingestion-endpoint-with-authentication-idempotency-and-acknowledgements/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/006-build-the-websocket-ingestion-endpoint-with-authentication-idempotency-and-acknowledgements/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/006-build-the-websocket-ingestion-endpoint-with-authentication-idempotency-and-acknowledgements/output.jsonl` for the raw engine transcript and final summary.
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

### Upstream Task 012
- Read `.pi/tasks/012-implement-pifleet-file-adapter-in-the-daemon/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/012-implement-pifleet-file-adapter-in-the-daemon/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/012-implement-pifleet-file-adapter-in-the-daemon/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/012-implement-pifleet-file-adapter-in-the-daemon/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Implement `apps/cockpit-daemon/src/transport/websocket.ts` and the main loop in `src/daemon.ts` to connect outbound to clean.dev, send heartbeat messages, batch queued events, process server acknowledgements, apply exponential reconnect backoff, and perform periodic full reconcile in addition to file watching/polling. Use Task 006's server protocol and Task 009's outbox so events survive network loss; the task is done when killing the WebSocket connection and restarting the daemon eventually delivers queued events exactly once and marks projects stale on the server after about one minute without heartbeat.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/013-implement-daemon-websocket-client-batching-heartbeats-and-full-reconcile-loop/task.md`.
- Write progress updates only to `.pi/tasks/013-implement-daemon-websocket-client-batching-heartbeats-and-full-reconcile-loop/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/013-implement-daemon-websocket-client-batching-heartbeats-and-full-reconcile-loop/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/013-implement-daemon-websocket-client-batching-heartbeats-and-full-reconcile-loop/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
