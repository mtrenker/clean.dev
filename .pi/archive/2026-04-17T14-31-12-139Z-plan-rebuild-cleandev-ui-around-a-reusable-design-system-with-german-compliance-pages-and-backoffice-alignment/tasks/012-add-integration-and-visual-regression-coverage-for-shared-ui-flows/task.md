# Task: Add integration and visual regression coverage for shared UI flows

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.3-codex
- **thinking**: medium
- **agent**: worker

## Dependencies
- 006
- 007
- 009
- 010
- 011

## Requirements
Add integration tests for the public navigation, legal-page access, social links, and critical backoffice UI rendering paths in the project’s existing test framework, and add visual regression coverage through Storybook or the current UI test stack where available. The tests must live in the repository’s established test locations and cover both happy paths and visible error/fallback states; task is done when CI can catch broken navigation, missing legal pages, major component regressions, and layout breakage in the refreshed screens.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/012-add-integration-and-visual-regression-coverage-for-shared-ui-flows/task.md`.
- Write progress updates only to `.pi/tasks/012-add-integration-and-visual-regression-coverage-for-shared-ui-flows/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/012-add-integration-and-visual-regression-coverage-for-shared-ui-flows/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/012-add-integration-and-visual-regression-coverage-for-shared-ui-flows/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
