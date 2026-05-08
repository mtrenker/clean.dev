# Task: Add daemon-side fleet runtime, agent, and approximate cost attribution

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 004
- 005

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 004
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 005
- Read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Update `apps/cockpit-daemon/src/adapters/pi-fleet.ts` and related local DB/outbox code so task events consistently include device id, engine, model, profile, thinking level, agent role, task status, usage tokens, exact task markdown from `.pi/tasks/*/task.md`, handover/output summary data where available, and enough source metadata to aggregate runtime by project/device/agent. Extend the adapter to scan `.pi/archive/index.json`, archive summaries, archived task status/progress files, and run/session metadata where present so archived plans/tasks/runs can be reviewed in Cockpit, not only the active plan. Implement approximate cost calculation using configurable rate tables from Task 005, mark all cost fields as estimates, and avoid pretending these values are billing-grade; the task is done when tests cover missing usage, unknown model pricing, multiple devices, active tasks, completed tasks, archived tasks, archived plans, handover text, exact task text, and cost aggregation inputs.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/007-add-daemon-side-fleet-runtime-agent-and-approximate-cost-attribution/task.md`.
- Write progress updates only to `.pi/tasks/007-add-daemon-side-fleet-runtime-agent-and-approximate-cost-attribution/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/007-add-daemon-side-fleet-runtime-agent-and-approximate-cost-attribution/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/007-add-daemon-side-fleet-runtime-agent-and-approximate-cost-attribution/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/007-add-daemon-side-fleet-runtime-agent-and-approximate-cost-attribution/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
