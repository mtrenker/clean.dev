# Task: Add demo mode with synthetic or sanitized public cockpit streams

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.4
- **thinking**: medium
- **agent**: worker

## Dependencies
- 002
- 007
- 014

## Dependency Handoff
Before starting substantive work, inspect every upstream task referenced above and use its outputs as direct inputs to this task. Do not redo discovery work that an upstream task already completed unless its output is missing or clearly insufficient.

### Upstream Task 002
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/002-add-shared-cockpit-protocol-package-with-validated-event-and-config-schemas/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 007
- Read `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/007-add-debounced-projection-from-raw-cockpit-events-to-current-project-state/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

### Upstream Task 014
- Read `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/task.md` for the original scope, required deliverable, and any file paths it was supposed to touch.
- Read `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/status.json` to confirm whether the task completed successfully and when.
- Read `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/progress.jsonl` for concise execution notes and intermediate findings.
- Read `.pi/tasks/014-build-mobile-first-cockpit-overview-and-project-detail-ui/output.jsonl` for the raw engine transcript and final summary.
- Reuse concrete outputs from this dependency instead of rediscovering context. If it created files, changed APIs, made decisions, or identified constraints, treat those as authoritative inputs for your work and reference them in your own progress updates.

## Requirements
Implement a demo data source under `apps/web/src/lib/cockpit/demo.ts` or a similar module that generates synthetic cockpit events or replays sanitized public-project archive data using Task 002's `packages/cockpit-protocol` schemas. Use Task 007's projection shape and Task 014's cockpit components so demo data exercises the same state model and UI paths as the private dashboard. Keep demo data isolated from private cockpit tables unless Task 001 recommends a safe tagged-table approach, and add a public/demo route or component that cannot accidentally render real user project data; the task is done when the public demo can show a believable streamed project/fleet overview without requiring a daemon or exposing private records.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/015-add-demo-mode-with-synthetic-or-sanitized-public-cockpit-streams/task.md`.
- Write progress updates only to `.pi/tasks/015-add-demo-mode-with-synthetic-or-sanitized-public-cockpit-streams/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/015-add-demo-mode-with-synthetic-or-sanitized-public-cockpit-streams/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/015-add-demo-mode-with-synthetic-or-sanitized-public-cockpit-streams/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
