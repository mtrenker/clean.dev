# Task: Redesign the Cockpit overview UI around projects, branches, devices, agents, and costs

## Configuration
- **engine**: claude
- **profile**: frontend
- **model**: claude-opus-4-7
- **thinking**: high
- **agent**: frontend

## Dependencies
- 002
- 008

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 002
- Read `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 008
- Read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Redesign `apps/web/src/app/cockpit/page.tsx` and components under `apps/web/src/components/cockpit/` so the overview contains separate sections for project health, branch/worktree hygiene, active devices, running agents/tasks, recently completed/archived fleet work, and estimated usage/costs. Build on Task 002's information architecture and Task 008's projected-state shape, keeping the current card view as a compact project summary but adding tables or dense panels for the operational questions Martin raised. The UI must deliberately use the clean.dev hacker/blueprint visual language: dark technical surfaces, subtle blueprint grids, console-window panels, terminal-style labels, and futuristic but readable dashboard density. The task is done when the first screen can answer which projects/devices are active, which branches/worktrees need cleanup, which agents are running, which tasks recently produced handovers, which archived plans are available for review, and which engine/model/profile combinations are consuming the most estimated cost.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/009-redesign-the-cockpit-overview-ui-around-projects-branches-devices-agents-and-costs/task.md`.
- Write progress updates only to `.pi/tasks/009-redesign-the-cockpit-overview-ui-around-projects-branches-devices-agents-and-costs/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/009-redesign-the-cockpit-overview-ui-around-projects-branches-devices-agents-and-costs/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/009-redesign-the-cockpit-overview-ui-around-projects-branches-devices-agents-and-costs/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/009-redesign-the-cockpit-overview-ui-around-projects-branches-devices-agents-and-costs/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
