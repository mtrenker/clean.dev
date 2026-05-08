# Task: Implement project observation configuration APIs and local config sync

## Configuration
- **engine**: claude
- **profile**: balanced
- **model**: sonnet
- **thinking**: medium
- **agent**: worker

## Dependencies
- 004

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 004
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Use Task 004's protocol schemas, repository types, and database fields to add or update authenticated routes/server actions under `apps/web/src/app/api/cockpit/projects/**` and `apps/web/src/app/cockpit/actions.ts` so an admin can configure per-project worktree naming patterns, branch grouping rules, telemetry preferences, and cost-estimation settings. Update `apps/cockpit-daemon/src/api-client.ts`, `apps/cockpit-daemon/src/cli.ts`, and `apps/cockpit-daemon/src/config.ts` so `projects`, `map`, `status`, and `preview` can fetch and display the server-defined config while preserving safe local overrides. The task is done when a project can define patterns such as canonical/scratch/feature worktrees in the UI/API and the daemon status output shows the effective merged config without exposing device tokens.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/task.md`.
- Write progress updates only to `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
