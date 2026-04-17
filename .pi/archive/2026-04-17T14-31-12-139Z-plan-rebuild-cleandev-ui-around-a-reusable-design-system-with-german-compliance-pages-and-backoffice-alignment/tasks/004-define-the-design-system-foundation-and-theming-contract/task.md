# Task: Define the design system foundation and theming contract

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 001

## Requirements
Introduce or normalize the shared design-system structure in the frontend codebase by creating a token layer, semantic color roles, typography scale, spacing system, border radius, elevation, and interaction states in the existing style architecture such as `src/styles/tokens.*`, `tailwind.config.*`, CSS variables, or theme modules. Also create `docs/design-system.md` describing how public pages and backoffice screens consume the same tokens and how future themes can override them; task is done when both app areas can import the same theme primitives without copy-pasted style values.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/004-define-the-design-system-foundation-and-theming-contract/task.md`.
- Write progress updates only to `.pi/tasks/004-define-the-design-system-foundation-and-theming-contract/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/004-define-the-design-system-foundation-and-theming-contract/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/004-define-the-design-system-foundation-and-theming-contract/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
