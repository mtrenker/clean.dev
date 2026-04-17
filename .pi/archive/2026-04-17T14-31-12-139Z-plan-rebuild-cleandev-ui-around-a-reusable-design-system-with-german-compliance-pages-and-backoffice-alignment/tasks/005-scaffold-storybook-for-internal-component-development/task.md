# Task: Scaffold Storybook for internal component development

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.3-codex
- **thinking**: medium
- **agent**: worker

## Dependencies
- 004

## Requirements
Add Storybook configuration to the repository using the framework already present in the app, including global theme providers, token previews, viewport settings, and accessibility/test addons in `.storybook/*` and initial stories under the shared component directory. This task must explicitly keep Storybook internal for now while structuring stories and build scripts so a later publication step will not require reorganization; task is done when Storybook runs locally, renders the shared theme correctly, and documents at least the base layout and typography primitives.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/005-scaffold-storybook-for-internal-component-development/task.md`.
- Write progress updates only to `.pi/tasks/005-scaffold-storybook-for-internal-component-development/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/005-scaffold-storybook-for-internal-component-development/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/005-scaffold-storybook-for-internal-component-development/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
