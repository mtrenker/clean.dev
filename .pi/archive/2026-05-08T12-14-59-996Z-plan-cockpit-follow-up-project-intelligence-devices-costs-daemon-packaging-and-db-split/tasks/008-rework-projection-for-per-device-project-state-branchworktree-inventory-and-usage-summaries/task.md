# Task: Rework projection for per-device project state, branch/worktree inventory, and usage summaries

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 004
- 006
- 007

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 004
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 006
- Read `.pi/tasks/006-upgrade-daemon-git-inventory-to-branchworktree-intelligence-v2/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/006-upgrade-daemon-git-inventory-to-branchworktree-intelligence-v2/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/006-upgrade-daemon-git-inventory-to-branchworktree-intelligence-v2/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/006-upgrade-daemon-git-inventory-to-branchworktree-intelligence-v2/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/006-upgrade-daemon-git-inventory-to-branchworktree-intelligence-v2/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 007
- Read `.pi/tasks/007-add-daemon-side-fleet-runtime-agent-and-approximate-cost-attribution/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/007-add-daemon-side-fleet-runtime-agent-and-approximate-cost-attribution/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/007-add-daemon-side-fleet-runtime-agent-and-approximate-cost-attribution/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/007-add-daemon-side-fleet-runtime-agent-and-approximate-cost-attribution/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/007-add-daemon-side-fleet-runtime-agent-and-approximate-cost-attribution/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Update `packages/cockpit-store/src/projection.ts`, `packages/cockpit-store/src/types.ts`, and repository projection methods so projected state contains per-device freshness, branch/worktree inventory, grouped worktree summaries, active fleet state, archived plan/task/run indexes, task detail/handover fields, agent runtime summaries, engine/model/profile usage, and approximate cost totals. Use Task 006's branch/worktree events and Task 007's fleet detail/archive/usage events, and ensure projection remains deterministic, idempotent, and recoverable from raw events after checkpoint bugs or schema upgrades. The task is done when projection tests cover multi-device observations of the same project, stale devices, dirty/diverged worktrees, running tasks, archived plans, archived tasks, historical run review, task markdown, handover text, model/profile totals, cost estimates, and old v1 events.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/task.md`.
- Write progress updates only to `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/008-rework-projection-for-per-device-project-state-branchworktree-inventory-and-usage-summaries/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
