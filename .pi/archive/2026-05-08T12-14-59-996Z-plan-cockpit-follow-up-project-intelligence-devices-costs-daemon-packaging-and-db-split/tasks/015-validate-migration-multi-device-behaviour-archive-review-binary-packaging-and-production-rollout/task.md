# Task: Validate migration, multi-device behaviour, archive review, binary packaging, and production rollout

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: reviewer

## Dependencies
- 003
- 011
- 012
- 013
- 014

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 003
- Read `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/003-extract-shared-drizzle-schema-migrations-and-migration-runner-into-packagesdb/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 011
- Read `.pi/tasks/011-build-archived-fleet-review-and-taskhandover-detail-ui/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/011-build-archived-fleet-review-and-taskhandover-detail-ui/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/011-build-archived-fleet-review-and-taskhandover-detail-ui/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/011-build-archived-fleet-review-and-taskhandover-detail-ui/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/011-build-archived-fleet-review-and-taskhandover-detail-ui/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 012
- Read `.pi/tasks/012-improve-device-and-token-management-for-multi-device-operation/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/012-improve-device-and-token-management-for-multi-device-operation/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/012-improve-device-and-token-management-for-multi-device-operation/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/012-improve-device-and-token-management-for-multi-device-operation/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/012-improve-device-and-token-management-for-multi-device-operation/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 013
- Read `.pi/tasks/013-package-the-daemon-as-a-simple-local-binary-distribution/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/013-package-the-daemon-as-a-simple-local-binary-distribution/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/013-package-the-daemon-as-a-simple-local-binary-distribution/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/013-package-the-daemon-as-a-simple-local-binary-distribution/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/013-package-the-daemon-as-a-simple-local-binary-distribution/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 014
- Read `.pi/tasks/014-add-observability-recovery-and-manual-re-projection-tooling/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/014-add-observability-recovery-and-manual-re-projection-tooling/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/014-add-observability-recovery-and-manual-re-projection-tooling/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/014-add-observability-recovery-and-manual-re-projection-tooling/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/014-add-observability-recovery-and-manual-re-projection-tooling/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Use the DB extraction from Task 003, the archive/task UI from Task 011, the multi-device management from Task 012, the daemon binary from Task 013, and the recovery tooling from Task 014 to add or update tests across `packages/db`, `packages/cockpit-protocol`, `packages/cockpit-store`, `apps/cockpit-daemon`, and `apps/web`. Cover DB-package migration compatibility, protocol backward compatibility, branch/worktree projection, multi-device visibility, archived plan/task/run projection, exact task/handover rendering, token redaction, cost-estimate labelling, and daemon binary smoke usage. Perform a production-style validation: run migrations, pair at least two daemon configurations or simulated devices, map overlapping projects, send branch/worktree/fleet/archive events, verify overview/detail/archive-review UI state, force a reprojection, revoke one device, and document results in `docs/cockpit-runbook.md`. The plan is complete when targeted builds/tests pass, Docker runtime smoke still starts the custom server/projector/WebSocket path, and the runbook contains rollback steps for the DB extraction and UI/projection rollout.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/015-validate-migration-multi-device-behaviour-archive-review-binary-packaging-and-production-rollout/task.md`.
- Write progress updates only to `.pi/tasks/015-validate-migration-multi-device-behaviour-archive-review-binary-packaging-and-production-rollout/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/015-validate-migration-multi-device-behaviour-archive-review-binary-packaging-and-production-rollout/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/015-validate-migration-multi-device-behaviour-archive-review-binary-packaging-and-production-rollout/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/015-validate-migration-multi-device-behaviour-archive-review-binary-packaging-and-production-rollout/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
