# Task: Map legal and regulatory requirements for a German Einzelunternehmen site

## Configuration
- **engine**: claude
- **profile**: deep
- **model**: sonnet
- **thinking**: high
- **agent**: scout

## Dependencies
- 001

## Requirements
Create `docs/compliance-scope.md` that maps required public-facing pages and disclosures for a German Einzelunternehmen, including at minimum `Impressum` and `Datenschutzerklärung` plus any analytics/contact-form disclosures triggered by the current implementation. The document must tie each legal requirement to concrete frontend locations, required business information, and open questions for owner review; task is done when the required content blocks and routing targets are unambiguous and launch blockers are explicitly listed.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/002-map-legal-and-regulatory-requirements-for-a-german-einzelunternehmen-site/task.md`.
- Write progress updates only to `.pi/tasks/002-map-legal-and-regulatory-requirements-for-a-german-einzelunternehmen-site/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/002-map-legal-and-regulatory-requirements-for-a-german-einzelunternehmen-site/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/002-map-legal-and-regulatory-requirements-for-a-german-einzelunternehmen-site/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
