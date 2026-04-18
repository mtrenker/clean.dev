# Task: Write automated tests for token validation, OAuth integration points, and review submission

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.3-codex
- **thinking**: medium
- **agent**: worker

## Dependencies
- 002
- 003
- 005
- 007

## Requirements
Add unit and integration coverage in files such as `apps/web/src/lib/review-links.test.ts`, `apps/web/src/app/reviews/review-flow.integration.test.tsx`, and any auth-specific tests needed around `apps/web/auth.ts`. The test suite must cover valid and expired tokens, tampered signatures, manual-entry fallback when LinkedIn is unavailable, successful submission delivery, rate-limit rejection, and safe handling of malicious HTML input, with done defined as repeatable green test runs in CI or the local project test command.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/009-write-automated-tests-for-token-validation-oauth-integration-points-and-review-submission/task.md`.
- Write progress updates only to `.pi/tasks/009-write-automated-tests-for-token-validation-oauth-integration-points-and-review-submission/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/009-write-automated-tests-for-token-validation-oauth-integration-points-and-review-submission/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/009-write-automated-tests-for-token-validation-oauth-integration-points-and-review-submission/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
