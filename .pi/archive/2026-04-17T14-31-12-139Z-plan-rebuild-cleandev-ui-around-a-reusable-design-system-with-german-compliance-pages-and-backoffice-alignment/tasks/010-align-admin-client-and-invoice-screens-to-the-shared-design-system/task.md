# Task: Align admin, client, and invoice screens to the shared design system

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.3-codex
- **thinking**: medium
- **agent**: worker

## Dependencies
- 003
- 004
- 006

## Requirements
Refactor the backoffice UI files for admin, client, and invoice views to consume the new layout, form, table, and status primitives instead of local styling variants, preserving existing business behavior and route protection. This includes normalizing page shells, spacing, typography, empty/error states, and form/table presentation in the exact backoffice modules identified by the audit; task is done when targeted backoffice screens visibly match the shared system and all protected routes still behave correctly for authorized and unauthorized users.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/010-align-admin-client-and-invoice-screens-to-the-shared-design-system/task.md`.
- Write progress updates only to `.pi/tasks/010-align-admin-client-and-invoice-screens-to-the-shared-design-system/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/010-align-admin-client-and-invoice-screens-to-the-shared-design-system/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/010-align-admin-client-and-invoice-screens-to-the-shared-design-system/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
