# Task: Scaffold the standalone cockpit daemon CLI app

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.4
- **thinking**: medium
- **agent**: worker

## Dependencies
- 001
- 002

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 001
- Read `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 002
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Create `apps/cockpit-daemon` with `package.json`, `tsconfig.json`, `src/cli.ts`, `src/config.ts`, `src/local-db.ts`, `src/logging.ts`, and root package/turbo scripts needed to build and run it. Implement initial commands `login`, `projects`, `map`, `daemon`, `status`, `preview`, `doctor`, and `logout` as no-surprise CLI entrypoints using the protocol config schema from Task 002; the task is done when `pnpm --filter @cleandev/cockpit-daemon build` succeeds and `pnpm --filter @cleandev/cockpit-daemon start -- doctor` validates the local config path without contacting clean.dev.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/008-scaffold-the-standalone-cockpit-daemon-cli-app/task.md`.
- Write progress updates only to `.pi/tasks/008-scaffold-the-standalone-cockpit-daemon-cli-app/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/008-scaffold-the-standalone-cockpit-daemon-cli-app/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/008-scaffold-the-standalone-cockpit-daemon-cli-app/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
