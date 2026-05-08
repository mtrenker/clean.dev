# Task: Define the project overview information architecture and state contract

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: scout

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
Create `docs/cockpit-overview-model.md` that defines Cockpit’s next overview model: project summary, per-device observations, branch/worktree inventory, live fleet/task activity, exact task detail, handover/output summaries, archived plans/tasks/runs, agent runtime summary, engine/model/profile usage, approximate cost summary, and stale/offline rules. Use Task 001's audit to map each UI requirement to existing or new protocol events and projected-state fields, and explicitly state which values are authoritative versus best-effort observations from one daemon device. The task is done when the document includes wire/state examples and a prioritized UI layout where the current project card becomes one section of a larger overview rather than the whole product, with a separate drilldown model for current and archived fleet review.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/task.md`.
- Write progress updates only to `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/002-define-the-project-overview-information-architecture-and-state-contract/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
