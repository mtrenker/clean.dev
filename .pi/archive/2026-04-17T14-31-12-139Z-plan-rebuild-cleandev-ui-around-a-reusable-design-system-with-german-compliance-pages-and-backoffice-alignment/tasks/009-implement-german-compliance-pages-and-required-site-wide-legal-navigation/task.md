# Task: Implement German compliance pages and required site-wide legal navigation

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 002
- 004
- 006

## Requirements
Create or update the route files and page templates for `Impressum` and `Datenschutzerklärung`, wire them into the global footer and any required navigation surfaces, and ensure page metadata and indexing behavior are appropriate. Use content placeholders or owner-provided business details in clearly marked sections and document required follow-up approval in the page files or `docs/compliance-scope.md`; task is done when both pages are reachable in production navigation, render in the shared design system, and cover all compliance items identified in Task 002.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/009-implement-german-compliance-pages-and-required-site-wide-legal-navigation/task.md`.
- Write progress updates only to `.pi/tasks/009-implement-german-compliance-pages-and-required-site-wide-legal-navigation/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/009-implement-german-compliance-pages-and-required-site-wide-legal-navigation/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/009-implement-german-compliance-pages-and-required-site-wide-legal-navigation/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
