# Task: Publish operator runbook and execute final production validation

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: reviewer

## Dependencies
- 011

## Requirements
Create an operator-facing runbook such as `docs/review-links-runbook.md` that explains invite generation, required environment variables, feature-flag enablement, expected logs/metrics, common failure modes, and the exact rollback procedure. Final validation is done only when a reviewer can follow the runbook to test a real deep link end-to-end in staging or production-like conditions, verify the feature-off rollback, and confirm that no review submission is persisted in application storage.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/012-publish-operator-runbook-and-execute-final-production-validation/task.md`.
- Write progress updates only to `.pi/tasks/012-publish-operator-runbook-and-execute-final-production-validation/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/012-publish-operator-runbook-and-execute-final-production-validation/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/012-publish-operator-runbook-and-execute-final-production-validation/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
