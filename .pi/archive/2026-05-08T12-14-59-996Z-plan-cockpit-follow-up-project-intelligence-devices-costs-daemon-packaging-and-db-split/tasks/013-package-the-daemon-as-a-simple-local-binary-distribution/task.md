# Task: Package the daemon as a simple local binary distribution

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.4
- **thinking**: medium
- **agent**: worker

## Dependencies
- 001
- 006
- 007

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 001
- Read `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/handoff.md` first if it exists; it is the compact authoritative summary for downstream tasks.
- Read `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/progress.jsonl` only if the handoff is missing or unclear.
- Do not read `.pi/tasks/001-audit-current-cockpit-data-flow-ui-gaps-daemon-packaging-options-and-db-ownership/output.jsonl` unless debugging a failed task or explicitly searching for a missing detail with a targeted command.
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
Based on Task 001's packaging recommendation, implement daemon distribution scripts for a single-command local install path, using a practical approach such as Node SEA, esbuild plus a pinned Node runtime wrapper, or another maintained binary packaging tool compatible with Node 22 and `node:sqlite`. Update `apps/cockpit-daemon/package.json`, root scripts, `.github/workflows/**`, and `docs/cockpit-runbook.md` so release artifacts can be built for Martin’s target environment first, with clear notes for unsupported platforms. The task is done when a fresh shell can run a built artifact such as `cockpit-daemon status`, `cockpit-daemon login`, and `cockpit-daemon daemon` without invoking `pnpm` directly.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/013-package-the-daemon-as-a-simple-local-binary-distribution/task.md`.
- Write progress updates only to `.pi/tasks/013-package-the-daemon-as-a-simple-local-binary-distribution/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/013-package-the-daemon-as-a-simple-local-binary-distribution/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/013-package-the-daemon-as-a-simple-local-binary-distribution/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}

## Completion Handoff
Before finishing, write `.pi/tasks/013-package-the-daemon-as-a-simple-local-binary-distribution/handoff.md` with:
- changed files
- important APIs/contracts
- tests run
- known limitations
- follow-up context for dependent tasks
