# Task: Final production validation and launch readiness review

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: reviewer

## Dependencies
- 009
- 010
- 011
- 012
- 013
- 014
- 015

## Requirements
Run an end-to-end launch checklist covering public-site UX, social links, legal pages, backoffice access boundaries, responsive behavior, accessibility, test results, observability signals, and GitOps release verification, and capture the result in `docs/launch-checklist.md`. This task is done only when all blocking items are closed or explicitly accepted by the owner, the compliance pages contain reviewed business details, and the updated UI is approved for production release.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/016-final-production-validation-and-launch-readiness-review/task.md`.
- Write progress updates only to `.pi/tasks/016-final-production-validation-and-launch-readiness-review/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/016-final-production-validation-and-launch-readiness-review/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/016-final-production-validation-and-launch-readiness-review/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
