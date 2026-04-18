# Task: Audit the existing web app, auth stack, and no-storage constraints

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: scout

## Dependencies
None

## Requirements
Inspect the existing `apps/web` application structure, with specific focus on `apps/web/auth.ts`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/contact/*`, `apps/web/src/lib/email.ts`, `apps/web/.env.example`, and the Kubernetes manifests under `k8s/`. Produce an implementation note that identifies the exact files to extend for a new `/reviews/[token]` flow, confirms how NextAuth v5 is currently wired, documents what “we won’t store any data” allows for cookies/logs/email retention, and defines the acceptance criteria for the production feature.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/001-audit-the-existing-web-app-auth-stack-and-no-storage-constraints/task.md`.
- Write progress updates only to `.pi/tasks/001-audit-the-existing-web-app-auth-stack-and-no-storage-constraints/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/001-audit-the-existing-web-app-auth-stack-and-no-storage-constraints/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/001-audit-the-existing-web-app-auth-stack-and-no-storage-constraints/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
