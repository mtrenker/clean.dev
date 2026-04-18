# Task: Prepare deployment manifests, feature-flag rollout, and rollback controls

## Configuration
- **engine**: codex
- **profile**: balanced
- **model**: gpt-5.3-codex
- **thinking**: medium
- **agent**: worker

## Dependencies
- 008
- 010

## Requirements
Update deployment assets such as `k8s/deployment.yaml`, `k8s/kustomization.yaml`, relevant sealed secrets, and `.github/workflows/deploy.yaml` if necessary so the review-link feature can be enabled in production behind `FEATURE_REVIEW_LINKS` with the new LinkedIn and signing-secret configuration. The task is complete when there is a documented canary-style rollout order, configuration validation in deployment manifests, and an immediate rollback path that consists of switching the feature flag off and confirming the route returns a controlled disabled state.

## Workspace Rules
- Work only inside the current working directory.
- Use relative paths from cwd; do not assume absolute paths like `/root/project`.
- Your task instructions are in `.pi/tasks/011-prepare-deployment-manifests-feature-flag-rollout-and-rollback-controls/task.md`.
- Write progress updates only to `.pi/tasks/011-prepare-deployment-manifests-feature-flag-rollout-and-rollback-controls/progress.jsonl`; never create or append to a repo-root `progress.jsonl`.
- Raw engine output is captured separately in `.pi/tasks/011-prepare-deployment-manifests-feature-flag-rollout-and-rollback-controls/output.jsonl`.
- Prefer targeted searches with exclusions (exclude `node_modules`, `.git`, and `.pi/archive` unless the task explicitly needs them).
- Avoid broad repo-wide scans such as `**/*.md` when a narrower path or pattern will do.
- If you already have enough context, stop exploring and produce the deliverable.

## Progress Tracking
Append one JSON line to `.pi/tasks/011-prepare-deployment-manifests-feature-flag-rollout-and-rollback-controls/progress.jsonl` after each significant step:
{"ts":"<ISO timestamp>","step":"<description>","status":"done"|"running"|"error"}
