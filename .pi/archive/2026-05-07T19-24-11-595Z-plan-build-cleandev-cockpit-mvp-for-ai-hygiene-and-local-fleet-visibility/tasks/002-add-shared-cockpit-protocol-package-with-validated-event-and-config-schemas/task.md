# Task: Add shared cockpit protocol package with validated event and config schemas

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.4
- **thinking**: medium
- **agent**: worker

## Dependencies
- 001

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 001
- Read `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/001-audit-current-cleandev-runtime-auth-database-deployment-and-pifleet-file-shapes/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Create `packages/cockpit-protocol` with `package.json`, `tsconfig.json`, `src/index.ts`, `src/events.ts`, `src/messages.ts`, `src/config.ts`, and a small test file if the repo test setup supports it. Use Task 001's findings to define Zod schemas and TypeScript types for daemon config, telemetry profiles, project/worktree/task/plan events, WebSocket client/server messages, event batch acknowledgements, and schema versioning; the task is done when `pnpm --filter @cleandev/cockpit-protocol build` succeeds and both daemon/backend code can import the package.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/task.md`.
- Write progress updates only to `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
