# Task: Extract and document core reusable UI primitives

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.3-codex
- **thinking**: medium
- **agent**: worker

## Dependencies
- 004
- 005

## Requirements
Refactor or create shared primitives such as `Button`, `Link`, `Card`, `Section`, `Container`, `Badge`, `Input`, `Table`, `EmptyState`, and navigation/footer components in the common UI module used by both marketing and backoffice screens. Add Storybook stories, interactive states, and usage notes for each component, and replace obvious duplicated UI in existing files where safe; task is done when the base primitives are centrally owned, themed through the token system, and have working stories that capture hover, focus, disabled, and error states.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/006-extract-and-document-core-reusable-ui-primitives/task.md`.
- Write progress updates only to `.pi/tasks/006-extract-and-document-core-reusable-ui-primitives/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/006-extract-and-document-core-reusable-ui-primitives/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/006-extract-and-document-core-reusable-ui-primitives/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
