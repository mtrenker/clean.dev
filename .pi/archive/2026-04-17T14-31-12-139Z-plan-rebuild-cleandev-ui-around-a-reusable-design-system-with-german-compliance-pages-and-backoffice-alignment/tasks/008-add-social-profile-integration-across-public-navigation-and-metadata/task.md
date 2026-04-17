# Task: Add social profile integration across public navigation and metadata

## Configuration
- **engine**: codex
- **profile**: fast
- **model**: gpt-5.3-codex-spark
- **thinking**: low
- **agent**: worker

## Dependencies
- 001
- 007

## Requirements
Add the owner’s XING, LinkedIn, and GitHub links to the public layout modules identified in Task 001, specifically the shared header/navigation component, footer component, homepage contact/profile section, and the site metadata or structured-data helper used for social identity. Use secure external-link behavior and accessible labels in those modules, and update the affected route/layout files so the links are rendered consistently across the public site; task is done when all three links are visible in the agreed locations, keyboard accessible, and validated not to break layout on mobile or desktop.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/008-add-social-profile-integration-across-public-navigation-and-metadata/task.md`.
- Write progress updates only to `.pi/tasks/008-add-social-profile-integration-across-public-navigation-and-metadata/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/008-add-social-profile-integration-across-public-navigation-and-metadata/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/008-add-social-profile-integration-across-public-navigation-and-metadata/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
