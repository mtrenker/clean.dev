# Task: Validate GitOps deployment and rollback behavior for the UI refresh

## Configuration
- **engine**: pi
- **profile**: balanced
- **model**: anthropic/claude-sonnet-4-6
- **thinking**: medium
- **agent**: reviewer

## Dependencies
- 012
- 013
- 014

## Requirements
Verify that the existing ArgoCD-based deployment path can promote the refreshed frontend container cleanly and that rolling back to the previous revision restores the prior UI without manual intervention. Document the minimal release notes and rollback checkpoints in `docs/release-validation.md`, including which app to watch in ArgoCD and what smoke checks must pass after deploy and after rollback; task is done when the deployment path is confirmed against the current GitOps workflow without introducing any new operational process.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/015-validate-gitops-deployment-and-rollback-behavior-for-the-ui-refresh/task.md`.
- Write progress updates only to `.pi/tasks/015-validate-gitops-deployment-and-rollback-behavior-for-the-ui-refresh/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/015-validate-gitops-deployment-and-rollback-behavior-for-the-ui-refresh/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/015-validate-gitops-deployment-and-rollback-behavior-for-the-ui-refresh/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
