# Task: Add project detail drilldowns and configuration screens

## Configuration
- **engine**: claude
- **profile**: frontend
- **model**: claude-opus-4-7
- **thinking**: high
- **agent**: frontend

## Dependencies
- 005
- 008
- 009

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 005
- Read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

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

## Requirements
Update `apps/web/src/app/cockpit/[projectId]/page.tsx` and related components so each project has drilldowns for worktrees/branches, devices observing the project, live fleet tasks, archived fleet plans/tasks/runs, exact task markdown, handover/output summaries, agent runtime, cost estimates, and project observation configuration. Use Task 005's config APIs for editing worktree naming patterns and cost settings, and Task 008's projected state for read-only operational data. The screens must feel like a coherent extension of clean.dev’s hacker/blueprint theme, using console-window composition for dense technical detail instead of generic admin tables. The task is done when an admin can inspect why a worktree is dirty/diverged, see which device reported it, open a running task to read the exact task and latest handover/progress, browse archived plans and completed tasks for review, edit pattern configuration, and return to the overview with the grouping reflected after the next daemon observation.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/010-add-project-detail-drilldowns-and-configuration-screens/task.md`.
- Write progress updates only to `.pi/tasks/010-add-project-detail-drilldowns-and-configuration-screens/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/010-add-project-detail-drilldowns-and-configuration-screens/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/010-add-project-detail-drilldowns-and-configuration-screens/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/010-add-project-detail-drilldowns-and-configuration-screens/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
