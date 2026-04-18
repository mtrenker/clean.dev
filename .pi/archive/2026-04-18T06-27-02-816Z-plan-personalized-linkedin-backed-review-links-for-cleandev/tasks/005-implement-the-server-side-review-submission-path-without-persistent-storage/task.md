# Task: Implement the server-side review submission path without persistent storage

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 002
- 004

## Requirements
Add a submission handler in `apps/web/src/app/reviews/actions.ts` or an API route under `apps/web/src/app/api/reviews/submit/route.ts` that verifies the signed token again, validates/sanitizes reviewer input, includes LinkedIn-derived identity when present, and forwards the review to the selected delivery sink using `apps/web/src/lib/email.ts` or a dedicated delivery helper such as `apps/web/src/lib/review-delivery.ts`. The feature is done when submissions are never written to the application database, malformed input is rejected safely, successful submissions reach the configured destination, and the user receives a clear success or failure state.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/005-implement-the-server-side-review-submission-path-without-persistent-storage/task.md`.
- Write progress updates only to `.pi/tasks/005-implement-the-server-side-review-submission-path-without-persistent-storage/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/005-implement-the-server-side-review-submission-path-without-persistent-storage/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/005-implement-the-server-side-review-submission-path-without-persistent-storage/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
