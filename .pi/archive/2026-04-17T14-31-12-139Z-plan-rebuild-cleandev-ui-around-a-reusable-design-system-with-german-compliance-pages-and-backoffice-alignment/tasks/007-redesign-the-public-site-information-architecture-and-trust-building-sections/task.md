# Task: Redesign the public site information architecture and trust-building sections

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 001
- 004
- 006

## Requirements
Update the public portfolio route modules and page sections to present a clearer client-oriented narrative, including a stronger hero, service/value framing, proof elements, contact calls to action, and cleaner navigation hierarchy. The implementation must modify the actual public page files identified in Task 001 and reuse shared design-system components rather than page-specific one-offs; task is done when the public pages communicate services and credibility more clearly, render consistently across breakpoints, and contain no duplicated styling logic that should live in the design system.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/007-redesign-the-public-site-information-architecture-and-trust-building-sections/task.md`.
- Write progress updates only to `.pi/tasks/007-redesign-the-public-site-information-architecture-and-trust-building-sections/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/007-redesign-the-public-site-information-architecture-and-trust-building-sections/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/007-redesign-the-public-site-information-architecture-and-trust-building-sections/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
