# Task: Upgrade daemon git inventory to branch/worktree intelligence v2

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.4
- **thinking**: medium
- **agent**: worker

## Dependencies
- 004
- 005

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 004
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/004-extend-protocol-and-database-schema-for-project-config-devices-branches-worktrees-and-usagecosts/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 005
- Read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/005-implement-project-observation-configuration-apis-and-local-config-sync/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Update `apps/cockpit-daemon/src/adapters/git.ts` to emit richer branch and worktree observations: worktree id/name/group derived from Task 005 patterns, repo root, relative worktree path, branch name, upstream tracking branch, remote name, HEAD SHA, dirty state, untracked count, staged/unstaged counts if practical, ahead/behind from upstream, and source/default branch divergence when available. Preserve telemetry redaction rules from `packages/cockpit-protocol` and ensure absolute paths are only sent when the project config allows them; the task is done when unit tests cover clean, dirty, no-upstream, behind-remote, ahead-remote, detached HEAD, and unknown-pattern worktrees.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/006-upgrade-daemon-git-inventory-to-branchworktree-intelligence-v2/task.md`.
- Write progress updates only to `.pi/tasks/006-upgrade-daemon-git-inventory-to-branchworktree-intelligence-v2/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/006-upgrade-daemon-git-inventory-to-branchworktree-intelligence-v2/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/006-upgrade-daemon-git-inventory-to-branchworktree-intelligence-v2/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/006-upgrade-daemon-git-inventory-to-branchworktree-intelligence-v2/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
