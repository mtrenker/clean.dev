# Task: Add observability, recovery, and manual re-projection tooling

## Configuration
- **engine**: claude
- **profile**: balanced
- **model**: sonnet
- **thinking**: medium
- **agent**: worker

## Dependencies
- 008
- 009
- 012

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 008
- Read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 009
- Read `.pi/tasks/009-redesign-the-cockpit-overview-ui-around-projects-branches-devices-agents-and-costs/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/009-redesign-the-cockpit-overview-ui-around-projects-branches-devices-agents-and-costs/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/009-redesign-the-cockpit-overview-ui-around-projects-branches-devices-agents-and-costs/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/009-redesign-the-cockpit-overview-ui-around-projects-branches-devices-agents-and-costs/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/009-redesign-the-cockpit-overview-ui-around-projects-branches-devices-agents-and-costs/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 012
- Read `.pi/tasks/012-improve-device-and-token-management-for-multi-device-operation/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/012-improve-device-and-token-management-for-multi-device-operation/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/012-improve-device-and-token-management-for-multi-device-operation/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/012-improve-device-and-token-management-for-multi-device-operation/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/012-improve-device-and-token-management-for-multi-device-operation/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Add structured logs and admin-only recovery tools for Cockpit projection and ingestion, including a manual reproject action for a project, projection status in the UI, and clearer log events in `apps/web/src/lib/cockpit/projector.ts`, `apps/web/src/server/cockpit-ws.ts`, and `packages/cockpit-store/src/repository.ts`. Use Task 008's projection state and Task 012's device/session data so operators can distinguish daemon offline, ingestion stopped, projection delayed, and UI cache/staleness problems. The task is done when an admin can force reproject a project, see the latest raw sequence versus projected sequence, and follow documented recovery steps without direct database access.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/014-add-observability-recovery-and-manual-re-projection-tooling/task.md`.
- Write progress updates only to `.pi/tasks/014-add-observability-recovery-and-manual-re-projection-tooling/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/014-add-observability-recovery-and-manual-re-projection-tooling/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/014-add-observability-recovery-and-manual-re-projection-tooling/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/014-add-observability-recovery-and-manual-re-projection-tooling/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
