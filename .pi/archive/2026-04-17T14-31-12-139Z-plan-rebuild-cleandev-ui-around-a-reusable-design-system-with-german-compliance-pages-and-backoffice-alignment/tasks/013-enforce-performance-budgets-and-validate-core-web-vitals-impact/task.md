# Task: Enforce performance budgets and validate Core Web Vitals impact

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: reviewer

## Dependencies
- 007
- 008
- 009
- 010

## Requirements
Measure the updated UI for bundle size, image weight, hydration cost, and Core Web Vitals risk, then optimize the relevant assets and route implementations by adjusting lazy loading, image handling, fonts, and script usage in the frontend configuration and page files. Record the baseline and post-change metrics in `docs/performance-report.md`; task is done when the refreshed site meets agreed budgets or any remaining regressions are explicitly documented with owner sign-off.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/013-enforce-performance-budgets-and-validate-core-web-vitals-impact/task.md`.
- Write progress updates only to `.pi/tasks/013-enforce-performance-budgets-and-validate-core-web-vitals-impact/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/013-enforce-performance-budgets-and-validate-core-web-vitals-impact/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/013-enforce-performance-budgets-and-validate-core-web-vitals-impact/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
