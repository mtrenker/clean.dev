# Task: Define the cockpit fleet observability contract and adapter compatibility strategy

## Configuration
- **engine**: claude
- **profile**: balanced
- **model**: sonnet
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
Create `docs/cockpit-fleet-contract.md` describing the stable local observability contract the fleet system should eventually emit, including `schemaVersion`, `projectId`, `planId`, `runId`, `taskId`, `agentRole`, `provider`, `model`, `status`, `worktreePath`, `branch`, `headSha`, timestamps, progress visibility, and event ids. Use Task 001's audit and Task 002's schemas to specify how the MVP adapter maps current `.pi/tasks/state.json`, `.pi/tasks/*/status.json`, `.pi/tasks/*/progress.jsonl`, `.pi/archive/index.json`, and `.pi/archive/*/archive-summary.json` into semantic events; the task is done when the contract clearly separates current compatibility parsing from the desired future fleet output format.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/003-define-the-cockpit-fleet-observability-contract-and-adapter-compatibility-strategy/task.md`.
- Write progress updates only to `.pi/tasks/003-define-the-cockpit-fleet-observability-contract-and-adapter-compatibility-strategy/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/003-define-the-cockpit-fleet-observability-contract-and-adapter-compatibility-strategy/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/003-define-the-cockpit-fleet-observability-contract-and-adapter-compatibility-strategy/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
