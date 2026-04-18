# Task: Build the public deep-linked review page and form flow

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.3-codex
- **thinking**: medium
- **agent**: worker

## Dependencies
- 002
- 003

## Requirements
Create the public route files for the new experience, likely `apps/web/src/app/reviews/[token]/page.tsx` plus a client component such as `apps/web/src/app/reviews/[token]/review-form.tsx`, using the current design system components from `apps/web/src/components/ui/*`. The page must validate the invite token on load, render personalized copy, offer a prominent “Continue with LinkedIn” option plus manual fallback fields, and include invalid-link, expired-link, and disabled-feature states. This task is done when a reviewer can verify locally or in preview that a valid token renders the form, an invalid or expired token renders the correct error state, LinkedIn login entry points preserve the review callback, and the localized form can be completed through the UI up to the submission boundary.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/004-build-the-public-deep-linked-review-page-and-form-flow/task.md`.
- Write progress updates only to `.pi/tasks/004-build-the-public-deep-linked-review-page-and-form-flow/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/004-build-the-public-deep-linked-review-page-and-form-flow/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/004-build-the-public-deep-linked-review-page-and-form-flow/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
