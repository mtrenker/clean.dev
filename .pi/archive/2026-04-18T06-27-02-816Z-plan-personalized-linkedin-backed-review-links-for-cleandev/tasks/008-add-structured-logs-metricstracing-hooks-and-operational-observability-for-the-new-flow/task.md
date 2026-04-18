# Task: Add structured logs, metrics/tracing hooks, and operational observability for the new flow

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 005
- 007

## Requirements
Introduce observability for the review journey by adding structured logging in the new review modules, and, if absent, create instrumentation files such as `apps/web/instrumentation.ts` or a shared logger module under `apps/web/src/lib/` to emit counters/timers around token validation, LinkedIn auth starts/failures, and delivery success/failure. Done means operators can answer from logs/metrics whether invites are being opened, LinkedIn is failing, submissions are succeeding, and abuse protections are triggering, without logging full review content or sensitive token material.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/008-add-structured-logs-metricstracing-hooks-and-operational-observability-for-the-new-flow/task.md`.
- Write progress updates only to `.pi/tasks/008-add-structured-logs-metricstracing-hooks-and-operational-observability-for-the-new-flow/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/008-add-structured-logs-metricstracing-hooks-and-operational-observability-for-the-new-flow/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/008-add-structured-logs-metricstracing-hooks-and-operational-observability-for-the-new-flow/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
