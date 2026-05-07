# Task: Build mobile-first cockpit overview and project detail UI

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 005
- 007

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 005
- Read `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/005-implement-cleandev-cockpit-project-management-and-device-pairing-apis/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 007
- Read `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Add private cockpit pages under `apps/web/src/app/cockpit/` with reusable components under `apps/web/src/components/cockpit/` for the project overview, health indicators, worktree/branch summary, active agents/tasks, failed/stale signals, and project detail views. Use the projected state from Task 007 rather than raw events, follow existing design-system components from `apps/web/src/components/ui/`, and ensure the first screen answers which projects are active, where agents are working, what failed, and which worktrees need cleanup; the task is done when the dashboard is usable on a mobile viewport and unauthenticated users cannot access private cockpit data.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/task.md`.
- Write progress updates only to `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
