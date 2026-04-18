# Task: Design and implement signed personalized review-link tokens plus feature flag controls

## Configuration
- **engine**: claude
- **profile**: balanced
- **model**: sonnet
- **thinking**: high
- **agent**: worker

## Dependencies
- 001

## Requirements
Add a stateless invite-token module such as `apps/web/src/lib/review-links.ts` that can mint and verify signed, expiring deep-link tokens containing the minimum reviewer context needed for personalization, without database persistence. Update `apps/web/.env.example`, `k8s/deployment.yaml`, and any required sealed secret manifests to include a review-link signing secret and a feature flag like `FEATURE_REVIEW_LINKS`, and define done as successful verification of valid tokens, rejection of expired/tampered tokens, and a clean feature-off behavior that disables the route without redeploying code.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/002-design-and-implement-signed-personalized-review-link-tokens-plus-feature-flag-controls/task.md`.
- Write progress updates only to `.pi/tasks/002-design-and-implement-signed-personalized-review-link-tokens-plus-feature-flag-controls/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/002-design-and-implement-signed-personalized-review-link-tokens-plus-feature-flag-controls/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/002-design-and-implement-signed-personalized-review-link-tokens-plus-feature-flag-controls/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
