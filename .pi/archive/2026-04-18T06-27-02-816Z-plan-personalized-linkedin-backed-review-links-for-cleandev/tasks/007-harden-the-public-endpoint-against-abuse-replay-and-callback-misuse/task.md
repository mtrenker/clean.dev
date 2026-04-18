# Task: Harden the public endpoint against abuse, replay, and callback misuse

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 002
- 003
- 005

## Requirements
Extend the review submission flow with production-grade protections in files such as `apps/web/src/app/reviews/actions.ts`, `apps/web/proxy.ts`, and any new security helpers under `apps/web/src/lib/`, including per-IP and per-token rate limiting, replay controls appropriate for a stateless invite model, input length caps, HTML escaping, and strict callback/origin validation for OAuth and form posts. The task is complete when the public route cannot be trivially spammed, token tampering and expired links are rejected, open redirects are prevented, and the protection strategy is documented in code comments or a short security note.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/007-harden-the-public-endpoint-against-abuse-replay-and-callback-misuse/task.md`.
- Write progress updates only to `.pi/tasks/007-harden-the-public-endpoint-against-abuse-replay-and-callback-misuse/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/007-harden-the-public-endpoint-against-abuse-replay-and-callback-misuse/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/007-harden-the-public-endpoint-against-abuse-replay-and-callback-misuse/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
