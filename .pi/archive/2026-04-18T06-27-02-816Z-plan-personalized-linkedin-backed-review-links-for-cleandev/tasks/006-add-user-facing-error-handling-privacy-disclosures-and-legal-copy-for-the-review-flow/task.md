# Task: Add user-facing error handling, privacy disclosures, and legal copy for the review flow

## Configuration
- **engine**: claude
- **profile**: balanced
- **model**: sonnet
- **thinking**: medium
- **agent**: worker

## Dependencies
- 004
- 005

## Requirements
Update the new review route components plus the shared message catalogs in `apps/web/src/messages/en.json` and `apps/web/src/messages/de.json`, and amend `apps/web/src/app/privacy/page.tsx` if needed to describe LinkedIn login, outbound delivery, and the no-persistent-storage behavior accurately. Acceptance requires explicit UX for invalid tokens, expired links, LinkedIn failure fallback, submission failure, and reviewer consent language that is legally consistent with what the system actually processes.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/006-add-user-facing-error-handling-privacy-disclosures-and-legal-copy-for-the-review-flow/task.md`.
- Write progress updates only to `.pi/tasks/006-add-user-facing-error-handling-privacy-disclosures-and-legal-copy-for-the-review-flow/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/006-add-user-facing-error-handling-privacy-disclosures-and-legal-copy-for-the-review-flow/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/006-add-user-facing-error-handling-privacy-disclosures-and-legal-copy-for-the-review-flow/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
