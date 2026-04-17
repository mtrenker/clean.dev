# Task: Harden responsive behavior, accessibility, and interaction quality

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 007
- 008
- 009
- 010

## Requirements
Audit the updated public and backoffice surfaces for keyboard navigation, focus visibility, semantic headings, landmark roles, color contrast, reduced-motion handling, and responsive layout issues, then implement fixes in the relevant components and page files. Add or update automated checks where the stack supports them and record any accepted exceptions in `docs/accessibility-notes.md`; task is done when key user journeys on both the public site and backoffice pass manual keyboard testing and no critical accessibility defects remain open.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/011-harden-responsive-behavior-accessibility-and-interaction-quality/task.md`.
- Write progress updates only to `.pi/tasks/011-harden-responsive-behavior-accessibility-and-interaction-quality/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/011-harden-responsive-behavior-accessibility-and-interaction-quality/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/011-harden-responsive-behavior-accessibility-and-interaction-quality/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
