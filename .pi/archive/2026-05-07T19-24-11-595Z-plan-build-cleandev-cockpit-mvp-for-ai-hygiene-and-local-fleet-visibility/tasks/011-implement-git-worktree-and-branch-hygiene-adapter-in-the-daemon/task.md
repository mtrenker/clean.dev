# Task: Implement git worktree and branch hygiene adapter in the daemon

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.4
- **thinking**: medium
- **agent**: worker

## Dependencies
- 008
- 009

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 008
- Read `.pi/tasks/008-scaffold-the-standalone-cockpit-daemon-cli-app/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/008-scaffold-the-standalone-cockpit-daemon-cli-app/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/008-scaffold-the-standalone-cockpit-daemon-cli-app/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/008-scaffold-the-standalone-cockpit-daemon-cli-app/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 009
- Read `.pi/tasks/009-implement-daemon-local-sqlite-state-event-outbox-and-reconnect-safe-sequencing/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/009-implement-daemon-local-sqlite-state-event-outbox-and-reconnect-safe-sequencing/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/009-implement-daemon-local-sqlite-state-event-outbox-and-reconnect-safe-sequencing/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/009-implement-daemon-local-sqlite-state-event-outbox-and-reconnect-safe-sequencing/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Add `apps/cockpit-daemon/src/adapters/git.ts` to discover worktrees via `git worktree list --porcelain`, collect branch name, short HEAD SHA, dirty/clean state, untracked count, ahead/behind status when a remote tracking branch exists, and last observed timestamps. Generate `worktree_seen` and `worktree_changed` events using the schemas from Task 002 and the outbox from Task 009; the task is done when `preview --project <id>` shows all worktrees for a mapped repo and highlights dirty/diverged worktrees without uploading raw absolute paths unless the project telemetry policy allows them.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/011-implement-git-worktree-and-branch-hygiene-adapter-in-the-daemon/task.md`.
- Write progress updates only to `.pi/tasks/011-implement-git-worktree-and-branch-hygiene-adapter-in-the-daemon/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/011-implement-git-worktree-and-branch-hygiene-adapter-in-the-daemon/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/011-implement-git-worktree-and-branch-hygiene-adapter-in-the-daemon/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
