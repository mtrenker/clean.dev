# Task: Audit the current UI architecture, routes, and compliance-relevant surfaces

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: scout

## Dependencies
None

## Requirements
Inspect the existing frontend and backoffice code to identify the actual app entrypoints, route files, layout components, styling system, and shared UI modules in directories such as `src/`, `app/`, `pages/`, `components/`, `admin/`, or their equivalents. Produce `docs/ui-audit.md` listing the exact files for the public portfolio, admin/client/invoice surfaces, current theme implementation, and every place where legal links, footer navigation, and social links must be added or updated; task is done when a cold agent can use the document to navigate the codebase without further discovery.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/001-audit-the-current-ui-architecture-routes-and-compliance-relevant-surfaces/task.md`.
- Write progress updates only to `.pi/tasks/001-audit-the-current-ui-architecture-routes-and-compliance-relevant-surfaces/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/001-audit-the-current-ui-architecture-routes-and-compliance-relevant-surfaces/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/001-audit-the-current-ui-architecture-routes-and-compliance-relevant-surfaces/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
