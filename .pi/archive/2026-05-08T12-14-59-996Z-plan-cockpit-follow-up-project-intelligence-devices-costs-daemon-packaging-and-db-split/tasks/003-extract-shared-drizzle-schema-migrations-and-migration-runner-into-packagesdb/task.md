# Task: Extract shared Drizzle schema, migrations, and migration runner into `packages/db`

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 001

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 001
- Read `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Use Task 001's audit of current migration ownership, Docker runtime copy paths, and schema imports to create a dedicated database package at `packages/db` with `package.json`, `tsconfig.json`, exported Drizzle schema, migration runner, and the existing `drizzle/` migration directory currently under `packages/pm`. Update imports in `packages/pm`, `packages/cockpit-store`, `apps/web/src/app/api/admin/migrate/route.ts`, `apps/web/src/lib/db.ts` if needed, Docker runtime copy rules, root scripts such as `db:migrate`/`db:generate`, and workspace/turbo configuration so `@cleandev/pm` no longer owns database infrastructure. The task is done when existing migrations still run from the web admin endpoint and CLI, `pnpm --filter @cleandev/db build` succeeds, and no Cockpit or PM code imports schema from `@cleandev/pm` for database ownership.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/task.md`.
- Write progress updates only to `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
