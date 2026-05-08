# Task: Extend protocol and database schema for project config, devices, branches, worktrees, and usage/costs

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.4
- **thinking**: medium
- **agent**: worker

## Dependencies
- 002
- 003

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 002
- Read `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 003
- Read `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Extend `packages/cockpit-protocol/src/config.ts`, `packages/cockpit-protocol/src/events.ts`, and `packages/cockpit-protocol/src/messages.ts` with versioned schemas for project observation config, worktree naming/grouping patterns, per-device observation metadata, richer branch upstream details, fleet task detail/handover content, archived plan/task/run metadata, and usage/cost estimate events or payload fields. Extend the new `packages/db` schema and migrations from Task 003 with any required project configuration columns/tables, raw task-detail storage, archive-review fields, and JSONB state fields, then update `packages/cockpit-store/src/types.ts` and repository types to expose the new fields. The task is done when protocol tests cover validation/redaction boundaries, long-text limits for task/handover content, migrations include rollback notes in comments or docs, and old daemon events remain accepted for backward compatibility.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/task.md`.
- Write progress updates only to `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
