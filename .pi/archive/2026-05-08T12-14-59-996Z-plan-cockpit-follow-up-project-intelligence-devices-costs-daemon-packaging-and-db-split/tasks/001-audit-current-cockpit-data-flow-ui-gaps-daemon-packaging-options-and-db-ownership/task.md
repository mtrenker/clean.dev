# Task: Audit current Cockpit data flow, UI gaps, daemon packaging options, and DB ownership

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
Inspect the current Cockpit implementation across `apps/web/custom-server.ts`, `apps/web/src/app/cockpit/**`, `apps/web/src/components/cockpit/**`, `apps/web/src/lib/cockpit/**`, `apps/web/src/server/cockpit-ws.ts`, `apps/cockpit-daemon/src/**`, `packages/cockpit-protocol/src/**`, `packages/cockpit-store/src/**`, `packages/pm/src/db/schema.ts`, `packages/pm/drizzle/**`, `Dockerfile`, and `.github/workflows/**`. Produce `docs/cockpit-followup-audit.md` documenting the current event lifecycle, projection checkpoints, UI state shape, device-token model, git adapter capabilities, migration ownership, and daemon packaging constraints; the task is done when downstream tasks can rely on a clear list of files to change and a recommended binary packaging approach.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/task.md`.
- Write progress updates only to `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
