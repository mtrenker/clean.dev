# Plan: Cockpit follow-up — project intelligence, devices, costs, daemon packaging, and DB split

## Overview

This plan turns Cockpit from a fleet-task card view into a broader private project operations dashboard. The selected depth is **Internal Tool**: the primary user is Martin, but clean.dev is internet-reachable and stores private operational metadata, device tokens, repository branch/worktree state, and approximate usage/cost data, so the work includes schema migration safety, access control, redaction, observability, and operator documentation without trying to build a public multi-tenant product.

The core product change is that fleet output becomes only one part of a project overview, while fleet details become much richer when the user drills in. Cockpit should answer: which projects exist, which devices are observing them, which branches and worktrees exist, which ones are dirty/diverged/stale, which agents are running on which device, what exact task/handover content each fleet task is implementing, which archived plans/tasks/runs are available for review, which engine/model/profile combinations are being used, and what approximate cost/usage profile is accumulating. Project configuration should allow per-project worktree naming/grouping patterns so the UI can distinguish canonical worktrees, feature worktrees, scratch worktrees, and unknown/unmapped ones.

The core architecture change is to extract database ownership out of `@cleandev/pm` into a dedicated package, then extend the Cockpit protocol, daemon, repository, projection, and UI around richer branch/device/fleet-archive/usage state. Since these projects are private and Martin is comfortable treating plan/task/handover text as Cockpit-visible operational data, this plan intentionally includes full plan summaries, task markdown, handover/output summaries, archive metadata, and historical run review views behind the existing private/admin access boundary. Server-side command execution, remote stop/pause controls, public sharing, and exact billing-grade cost accounting are explicitly out of scope for this plan.

## Tasks

### Task 001: Audit current Cockpit data flow, UI gaps, daemon packaging options, and DB ownership

- **engine**: claude
- **profile**: deep
- **thinking**: high
- **agent**: scout
- **depends**: none
- **description**: Inspect the current Cockpit implementation across `apps/web/custom-server.ts`, `apps/web/src/app/cockpit/**`, `apps/web/src/components/cockpit/**`, `apps/web/src/lib/cockpit/**`, `apps/web/src/server/cockpit-ws.ts`, `apps/cockpit-daemon/src/**`, `packages/cockpit-protocol/src/**`, `packages/cockpit-store/src/**`, `packages/pm/src/db/schema.ts`, `packages/pm/drizzle/**`, `Dockerfile`, and `.github/workflows/**`. Produce `docs/cockpit-followup-audit.md` documenting the current event lifecycle, projection checkpoints, UI state shape, device-token model, git adapter capabilities, migration ownership, and daemon packaging constraints; the task is done when downstream tasks can rely on a clear list of files to change and a recommended binary packaging approach.

### Task 002: Define the project overview information architecture and state contract

- **engine**: claude
- **profile**: deep
- **thinking**: high
- **agent**: scout
- **depends**: 001
- **description**: Create `docs/cockpit-overview-model.md` that defines Cockpit’s next overview model: project summary, per-device observations, branch/worktree inventory, live fleet/task activity, exact task detail, handover/output summaries, archived plans/tasks/runs, agent runtime summary, engine/model/profile usage, approximate cost summary, and stale/offline rules. Use Task 001's audit to map each UI requirement to existing or new protocol events and projected-state fields, and explicitly state which values are authoritative versus best-effort observations from one daemon device. The task is done when the document includes wire/state examples and a prioritized UI layout where the current project card becomes one section of a larger overview rather than the whole product, with a separate drilldown model for current and archived fleet review.

### Task 003: Extract shared Drizzle schema, migrations, and migration runner into `packages/db`

- **engine**: claude
- **profile**: deep
- **thinking**: high
- **agent**: worker
- **depends**: 001
- **description**: Use Task 001's audit of current migration ownership, Docker runtime copy paths, and schema imports to create a dedicated database package at `packages/db` with `package.json`, `tsconfig.json`, exported Drizzle schema, migration runner, and the existing `drizzle/` migration directory currently under `packages/pm`. Update imports in `packages/pm`, `packages/cockpit-store`, `apps/web/src/app/api/admin/migrate/route.ts`, `apps/web/src/lib/db.ts` if needed, Docker runtime copy rules, root scripts such as `db:migrate`/`db:generate`, and workspace/turbo configuration so `@cleandev/pm` no longer owns database infrastructure. The task is done when existing migrations still run from the web admin endpoint and CLI, `pnpm --filter @cleandev/db build` succeeds, and no Cockpit or PM code imports schema from `@cleandev/pm` for database ownership.

### Task 004: Extend protocol and database schema for project config, devices, branches, worktrees, and usage/costs

- **engine**: codex
- **profile**: balanced
- **thinking**: medium
- **agent**: worker
- **depends**: 002, 003
- **description**: Extend `packages/cockpit-protocol/src/config.ts`, `packages/cockpit-protocol/src/events.ts`, and `packages/cockpit-protocol/src/messages.ts` with versioned schemas for project observation config, worktree naming/grouping patterns, per-device observation metadata, richer branch upstream details, fleet task detail/handover content, archived plan/task/run metadata, and usage/cost estimate events or payload fields. Extend the new `packages/db` schema and migrations from Task 003 with any required project configuration columns/tables, raw task-detail storage, archive-review fields, and JSONB state fields, then update `packages/cockpit-store/src/types.ts` and repository types to expose the new fields. The task is done when protocol tests cover validation/redaction boundaries, long-text limits for task/handover content, migrations include rollback notes in comments or docs, and old daemon events remain accepted for backward compatibility.

### Task 005: Implement project observation configuration APIs and local config sync

- **engine**: claude
- **profile**: balanced
- **thinking**: medium
- **agent**: worker
- **depends**: 004
- **description**: Use Task 004's protocol schemas, repository types, and database fields to add or update authenticated routes/server actions under `apps/web/src/app/api/cockpit/projects/**` and `apps/web/src/app/cockpit/actions.ts` so an admin can configure per-project worktree naming patterns, branch grouping rules, telemetry preferences, and cost-estimation settings. Update `apps/cockpit-daemon/src/api-client.ts`, `apps/cockpit-daemon/src/cli.ts`, and `apps/cockpit-daemon/src/config.ts` so `projects`, `map`, `status`, and `preview` can fetch and display the server-defined config while preserving safe local overrides. The task is done when a project can define patterns such as canonical/scratch/feature worktrees in the UI/API and the daemon status output shows the effective merged config without exposing device tokens.

### Task 006: Upgrade daemon git inventory to branch/worktree intelligence v2

- **engine**: codex
- **profile**: balanced
- **thinking**: medium
- **agent**: worker
- **depends**: 004, 005
- **description**: Update `apps/cockpit-daemon/src/adapters/git.ts` to emit richer branch and worktree observations: worktree id/name/group derived from Task 005 patterns, repo root, relative worktree path, branch name, upstream tracking branch, remote name, HEAD SHA, dirty state, untracked count, staged/unstaged counts if practical, ahead/behind from upstream, and source/default branch divergence when available. Preserve telemetry redaction rules from `packages/cockpit-protocol` and ensure absolute paths are only sent when the project config allows them; the task is done when unit tests cover clean, dirty, no-upstream, behind-remote, ahead-remote, detached HEAD, and unknown-pattern worktrees.

### Task 007: Add daemon-side fleet runtime, agent, and approximate cost attribution

- **engine**: claude
- **profile**: deep
- **thinking**: high
- **agent**: worker
- **depends**: 004, 005
- **description**: Update `apps/cockpit-daemon/src/adapters/pi-fleet.ts` and related local DB/outbox code so task events consistently include device id, engine, model, profile, thinking level, agent role, task status, usage tokens, exact task markdown from `.pi/tasks/*/task.md`, handover/output summary data where available, and enough source metadata to aggregate runtime by project/device/agent. Extend the adapter to scan `.pi/archive/index.json`, archive summaries, archived task status/progress files, and run/session metadata where present so archived plans/tasks/runs can be reviewed in Cockpit, not only the active plan. Implement approximate cost calculation using configurable rate tables from Task 005, mark all cost fields as estimates, and avoid pretending these values are billing-grade; the task is done when tests cover missing usage, unknown model pricing, multiple devices, active tasks, completed tasks, archived tasks, archived plans, handover text, exact task text, and cost aggregation inputs.

### Task 008: Rework projection for per-device project state, branch/worktree inventory, and usage summaries

- **engine**: claude
- **profile**: deep
- **thinking**: high
- **agent**: worker
- **depends**: 004, 006, 007
- **description**: Update `packages/cockpit-store/src/projection.ts`, `packages/cockpit-store/src/types.ts`, and repository projection methods so projected state contains per-device freshness, branch/worktree inventory, grouped worktree summaries, active fleet state, archived plan/task/run indexes, task detail/handover fields, agent runtime summaries, engine/model/profile usage, and approximate cost totals. Use Task 006's branch/worktree events and Task 007's fleet detail/archive/usage events, and ensure projection remains deterministic, idempotent, and recoverable from raw events after checkpoint bugs or schema upgrades. The task is done when projection tests cover multi-device observations of the same project, stale devices, dirty/diverged worktrees, running tasks, archived plans, archived tasks, historical run review, task markdown, handover text, model/profile totals, cost estimates, and old v1 events.

### Task 009: Redesign the Cockpit overview UI around projects, branches, devices, agents, and costs

- **engine**: claude
- **profile**: frontend
- **model**: claude-opus-4-7
- **thinking**: high
- **agent**: frontend
- **depends**: 002, 008
- **description**: Redesign `apps/web/src/app/cockpit/page.tsx` and components under `apps/web/src/components/cockpit/` so the overview contains separate sections for project health, branch/worktree hygiene, active devices, running agents/tasks, recently completed/archived fleet work, and estimated usage/costs. Build on Task 002's information architecture and Task 008's projected-state shape, keeping the current card view as a compact project summary but adding tables or dense panels for the operational questions Martin raised. The UI must deliberately use the clean.dev hacker/blueprint visual language: dark technical surfaces, subtle blueprint grids, console-window panels, terminal-style labels, and futuristic but readable dashboard density. The task is done when the first screen can answer which projects/devices are active, which branches/worktrees need cleanup, which agents are running, which tasks recently produced handovers, which archived plans are available for review, and which engine/model/profile combinations are consuming the most estimated cost.

### Task 010: Add project detail drilldowns and configuration screens

- **engine**: claude
- **profile**: frontend
- **model**: claude-opus-4-7
- **thinking**: high
- **agent**: frontend
- **depends**: 005, 008, 009
- **description**: Update `apps/web/src/app/cockpit/[projectId]/page.tsx` and related components so each project has drilldowns for worktrees/branches, devices observing the project, live fleet tasks, archived fleet plans/tasks/runs, exact task markdown, handover/output summaries, agent runtime, cost estimates, and project observation configuration. Use Task 005's config APIs for editing worktree naming patterns and cost settings, and Task 008's projected state for read-only operational data. The screens must feel like a coherent extension of clean.dev’s hacker/blueprint theme, using console-window composition for dense technical detail instead of generic admin tables. The task is done when an admin can inspect why a worktree is dirty/diverged, see which device reported it, open a running task to read the exact task and latest handover/progress, browse archived plans and completed tasks for review, edit pattern configuration, and return to the overview with the grouping reflected after the next daemon observation.

### Task 011: Build archived fleet review and task/handover detail UI

- **engine**: claude
- **profile**: frontend
- **model**: claude-opus-4-7
- **thinking**: high
- **agent**: frontend
- **depends**: 008, 010
- **description**: Create dedicated UI components and routes under `apps/web/src/app/cockpit/[projectId]/` and `apps/web/src/components/cockpit/` for reviewing active task detail, exact task markdown, latest handover/output summaries, progress history, archived plans, archived tasks, and historical fleet runs. Build on Task 008's projected archive/task-detail state and Task 010's project detail layout, keeping all content behind the existing Cockpit admin guard because task and plan text may contain private operational information. The review experience should render long task/handover content in readable console/blueprint panes with copy-friendly formatting and clear live-vs-archived affordances. The task is done when Martin can open a project, browse all archived plans, select an archived task/run, read the original task and handover/output summary, and compare it with current live tasks without using the filesystem.

### Task 012: Improve device and token management for multi-device operation

- **engine**: claude
- **profile**: balanced
- **thinking**: medium
- **agent**: worker
- **depends**: 004, 008, 009
- **description**: Use Task 004's device/session schema additions, Task 008's per-device projected state, and Task 009's overview layout to extend the device UI/API under `apps/web/src/app/cockpit/devices/**`, `apps/web/src/app/api/cockpit/devices/**`, and `packages/cockpit-store/src/repository.ts` so Cockpit shows paired devices, active sessions, last heartbeat, last event sequence, observed project count, token label, token age, and revoked/expired state. Ensure token values are never displayed after exchange, revocation is audited, and per-device project observations are visible without allowing one device to impersonate another. The task is done when multiple daemon devices can be paired, listed, distinguished in project views, and revoked safely with tests for unauthorized access and token redaction.

### Task 013: Package the daemon as a simple local binary distribution

- **engine**: codex
- **profile**: balanced
- **thinking**: medium
- **agent**: worker
- **depends**: 001, 006, 007
- **description**: Based on Task 001's packaging recommendation, implement daemon distribution scripts for a single-command local install path, using a practical approach such as Node SEA, esbuild plus a pinned Node runtime wrapper, or another maintained binary packaging tool compatible with Node 22 and `node:sqlite`. Update `apps/cockpit-daemon/package.json`, root scripts, `.github/workflows/**`, and `docs/cockpit-runbook.md` so release artifacts can be built for Martin’s target environment first, with clear notes for unsupported platforms. The task is done when a fresh shell can run a built artifact such as `cockpit-daemon status`, `cockpit-daemon login`, and `cockpit-daemon daemon` without invoking `pnpm` directly.

### Task 014: Add observability, recovery, and manual re-projection tooling

- **engine**: claude
- **profile**: balanced
- **thinking**: medium
- **agent**: worker
- **depends**: 008, 009, 012
- **description**: Add structured logs and admin-only recovery tools for Cockpit projection and ingestion, including a manual reproject action for a project, projection status in the UI, and clearer log events in `apps/web/src/lib/cockpit/projector.ts`, `apps/web/src/server/cockpit-ws.ts`, and `packages/cockpit-store/src/repository.ts`. Use Task 008's projection state and Task 012's device/session data so operators can distinguish daemon offline, ingestion stopped, projection delayed, and UI cache/staleness problems. The task is done when an admin can force reproject a project, see the latest raw sequence versus projected sequence, and follow documented recovery steps without direct database access.

### Task 015: Validate migration, multi-device behaviour, archive review, binary packaging, and production rollout

- **engine**: claude
- **profile**: deep
- **thinking**: high
- **agent**: reviewer
- **depends**: 003, 011, 012, 013, 014
- **description**: Use the DB extraction from Task 003, the archive/task UI from Task 011, the multi-device management from Task 012, the daemon binary from Task 013, and the recovery tooling from Task 014 to add or update tests across `packages/db`, `packages/cockpit-protocol`, `packages/cockpit-store`, `apps/cockpit-daemon`, and `apps/web`. Cover DB-package migration compatibility, protocol backward compatibility, branch/worktree projection, multi-device visibility, archived plan/task/run projection, exact task/handover rendering, token redaction, cost-estimate labelling, and daemon binary smoke usage. Perform a production-style validation: run migrations, pair at least two daemon configurations or simulated devices, map overlapping projects, send branch/worktree/fleet/archive events, verify overview/detail/archive-review UI state, force a reprojection, revoke one device, and document results in `docs/cockpit-runbook.md`. The plan is complete when targeted builds/tests pass, Docker runtime smoke still starts the custom server/projector/WebSocket path, and the runbook contains rollback steps for the DB extraction and UI/projection rollout.
