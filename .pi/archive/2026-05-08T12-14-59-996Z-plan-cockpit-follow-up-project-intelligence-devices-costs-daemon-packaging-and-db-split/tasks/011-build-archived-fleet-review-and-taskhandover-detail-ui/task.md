# Task: Build archived fleet review and task/handover detail UI

## Configuration
- **engine**: claude
- **profile**: frontend
- **model**: claude-opus-4-7
- **thinking**: high
- **agent**: frontend

## Dependencies
- 008
- 010

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 008
- Read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 010
- Read `.pi/tasks/010-add-project-detail-drilldowns-and-configuration-screens/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/010-add-project-detail-drilldowns-and-configuration-screens/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/010-add-project-detail-drilldowns-and-configuration-screens/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/010-add-project-detail-drilldowns-and-configuration-screens/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/010-add-project-detail-drilldowns-and-configuration-screens/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Create dedicated UI components and routes under `apps/web/src/app/cockpit/[projectId]/` and `apps/web/src/components/cockpit/` for reviewing active task detail, exact task markdown, latest handover/output summaries, progress history, archived plans, archived tasks, and historical fleet runs. Build on Task 008's projected archive/task-detail state and Task 010's project detail layout, keeping all content behind the existing Cockpit admin guard because task and plan text may contain private operational information. The review experience should render long task/handover content in readable console/blueprint panes with copy-friendly formatting and clear live-vs-archived affordances. The task is done when Martin can open a project, browse all archived plans, select an archived task/run, read the original task and handover/output summary, and compare it with current live tasks without using the filesystem.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/011-build-archived-fleet-review-and-taskhandover-detail-ui/task.md`.
- Write progress updates only to `.pi/tasks/011-build-archived-fleet-review-and-taskhandover-detail-ui/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/011-build-archived-fleet-review-and-taskhandover-detail-ui/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/011-build-archived-fleet-review-and-taskhandover-detail-ui/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/011-build-archived-fleet-review-and-taskhandover-detail-ui/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
