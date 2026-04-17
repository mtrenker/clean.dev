# Task: Validate observability, error handling, and user-visible failure states

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: reviewer

## Dependencies
- 010
- 011
- 012

## Requirements
Validate observability and failure handling in the concrete Next.js app-router files that serve the refreshed UI, including `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`, `apps/web/src/app/contact/page.tsx`, `apps/web/src/app/contact/actions.ts`, `apps/web/src/app/admin/page.tsx`, `apps/web/src/app/clients/page.tsx`, and `apps/web/src/app/invoices/page.tsx`. Add or update branded error surfaces in `apps/web/src/app/global-error.tsx` and `apps/web/src/app/not-found.tsx` if they do not yet exist, and wire any required logging or telemetry hooks through the web app’s existing Next.js application layer so public and backoffice failures are observable; task is done when these routes emit observable failures through the current platform and users see intentional error states instead of raw crashes.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/014-validate-observability-error-handling-and-user-visible-failure-states/task.md`.
- Write progress updates only to `.pi/tasks/014-validate-observability-error-handling-and-user-visible-failure-states/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/014-validate-observability-error-handling-and-user-visible-failure-states/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/014-validate-observability-error-handling-and-user-visible-failure-states/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
