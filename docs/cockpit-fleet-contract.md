# Cockpit Fleet Observability Contract

**Date:** 2026-05-05  
**Task:** 003 — worker  
**Schema version:** 1  
**Status:** Authoritative MVP definition

---

## Overview

This document defines the **stable local observability contract** that the cockpit fleet system emits and the server stores. It has two distinct layers:

1. **Target contract (§1–§3)** — the desired future format: clean, versioned, self-contained events that are independent of how the pi-fleet runtime happens to store data on disk. Any daemon implementation, regardless of underlying technology, must produce events that satisfy this contract.

2. **MVP adapter (§4)** — how the current pi-fleet file system (`state.json`, `status.json`, `progress.jsonl`, archive files) maps into the target event types for v1. This layer is explicitly marked as compatibility parsing; it will be discarded when the fleet runtime emits structured events directly.

All Zod schemas referenced here are the authoritative source of truth defined in `packages/cockpit-protocol/src/` (`@cleandev/cockpit-protocol`).

---

## 1. Target Event Schema

### 1.1 Universal Metadata Fields

Every event carries the following envelope fields (defined in `eventMetadataSchema`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schemaVersion` | `1` (literal) | yes | Protocol version — currently always `1`; increment only for breaking changes |
| `eventId` | `string` (non-empty) | yes | Globally unique event identifier; UUID v4 recommended |
| `sequence` | `number` (int ≥ 0) | yes | Monotonically increasing per-device counter; used for deduplication and gap detection |
| `occurredAt` | ISO 8601 datetime with offset | yes | When the condition that triggered the event was observed locally |
| `source` | `"live"` \| `"archive"` | yes (default `"live"`) | `"archive"` for events synthesised from historical `.pi/archive/` data |
| `projectId` | `string` (non-empty) | yes | Stable identifier assigned when the daemon first maps a local repo to a cockpit project |
| `deviceId` | `string` (non-empty) | yes | Stable identifier of the daemon installation |
| `sessionId` | `string` (non-empty) | optional | Connection session identifier; set after the WebSocket handshake |
| `runId` | `string` (non-empty) \| `null` | optional | Identifies a continuous daemon run; reset on daemon restart |

### 1.2 Event Catalog

#### `project_seen`
Emitted once per daemon start per mapped project, and again whenever the daemon reconnects.

```ts
payload: {
  projectName?: string | null   // human-readable name from daemon config
  telemetry: TelemetryProfile   // active telemetry settings
  localRootPath?: string | null // see §3 for redaction rules
}
```

#### `project_heartbeat`
Emitted periodically (server dictates interval via `server_hello.heartbeatIntervalMs`) to signal the daemon is alive.

```ts
payload: {
  daemonVersion?: string | null
  activePlanId?: string | null   // planId of the currently executing plan, if any
  activeTaskCount: number        // count of currently running tasks
}
```

#### `worktree_seen`
Emitted when the daemon first observes a worktree, or after reconnect.

```ts
payload: {
  worktree: WorktreeSnapshot     // see §1.3
}
```

#### `worktree_changed`
Emitted when `headSha`, `branch`, or `isDirty` changes on an observed worktree.

```ts
payload: {
  worktree: WorktreeSnapshot
  previousHeadSha?: string | null
}
```

#### `plan_seen`
Emitted when the daemon first discovers a plan (from `plan-summary.json` or an archive entry). Also emitted on reconnect for the active plan.

```ts
payload: {
  planId: string                 // derived from plan title slug or archive id
  title: string
  overview?: string | null
  sourcePlanPath?: string | null // e.g., "PLAN.md"
  splitAt?: string | null        // ISO timestamp when plan was split from source
  taskCount: number
  tasks: PlanTaskSummary[]       // array of task descriptors (see §1.4)
}
```

#### `task_seen`
Emitted per-task when a plan is first parsed, before the task starts running.

```ts
payload: {
  planId: string
  taskId: string                 // numeric id from pi-fleet, e.g., "001"
  taskName: string
  slug?: string                  // folder slug, e.g., "audit-current-..."
  dependsOn: string[]
  description?: string | null
  execution: TaskExecution       // see §1.5
}
```

#### `task_started`
Emitted when a task transitions to `status: "running"`.

```ts
payload: {
  planId: string
  taskId: string
  taskName: string
  status: "running"
  startedAt: string              // ISO datetime
  worktreeId?: string | null     // id of the worktree this task runs in, if applicable
  execution: TaskExecution
}
```

#### `task_progressed`
Emitted for each new line appended to `progress.jsonl`. One event per JSONL line.

```ts
payload: {
  planId: string
  taskId: string
  taskName: string
  progressStatus: "running" | "done" | "error"
  step?: string | null           // raw step text; null when telemetry.progressText === false
  progressVisible: boolean       // false when step is redacted
  progressAt: string             // ISO datetime of this progress entry
  latestProgressAt?: string | null
}
```

#### `task_completed`
Emitted when a task transitions to `status: "done"`.

```ts
payload: {
  planId: string
  taskId: string
  taskName: string
  status: "done"
  startedAt?: string | null
  completedAt: string            // ISO datetime
  durationMs?: number | null
  retries: number
  usage?: TokenUsage             // optional; only when telemetry.usage === true
}
```

#### `task_failed`
Emitted when a task transitions to `status: "failed"`.

```ts
payload: {
  planId: string
  taskId: string
  taskName: string
  status: "failed"
  startedAt?: string | null
  completedAt?: string | null
  durationMs?: number | null
  retries: number
  error: string                  // error message from status.json
  usage?: TokenUsage
}
```

#### `usage_reported`
Emitted after `task_completed` or `task_failed` to carry token usage independently (allows the server to aggregate usage without coupling it to lifecycle events).

```ts
payload: {
  planId?: string | null
  taskId?: string | null
  status?: TaskLifecycleStatus
  usage: TokenUsage              // { inputTokens: number, outputTokens: number }
}
```

### 1.3 `WorktreeSnapshot` Shape

```ts
{
  worktreeId: string             // stable id, e.g., hash of localRootPath
  repoRootPath?: string | null   // see telemetry.repoRootPath redaction
  worktreePath?: string | null   // see telemetry.worktreePath redaction
  branch?: string | null         // see telemetry.git redaction
  headSha?: string | null        // 7–40 hex chars; see telemetry.git
  isDirty: boolean
  untrackedCount: number
  aheadCount?: number | null
  behindCount?: number | null
  lastObservedAt?: string        // ISO datetime
}
```

### 1.4 `PlanTaskSummary` Shape

```ts
{
  taskId: string
  slug?: string
  name: string
  dependsOn: string[]
  description?: string | null
  // merged from TaskExecution:
  agentRole?: string | null
  engine?: string | null
  provider?: string | null
  model?: string | null
  profile?: string | null
  thinking?: string | null
}
```

### 1.5 `TaskExecution` Shape

```ts
{
  agentRole?: string | null      // "worker" | "scout" | etc.
  engine?: string | null         // "claude" | "codex" | etc.
  provider?: string | null       // future: "anthropic" | "openai"
  model?: string | null          // "sonnet" | "haiku" | "gpt-5.4" | etc.
  profile?: string | null        // "fast" | "balanced" | "deep"
  thinking?: string | null       // "low" | "medium" | "high"
}
```

---

## 2. Event Identifiers and Idempotency

### 2.1 `eventId`

Generated by the daemon as UUID v4 at the time the event is constructed. The server deduplicates on `eventId`; a server that sees the same `eventId` twice must accept the second silently (idempotent write) and not double-count the event.

### 2.2 `sequence`

Monotonically increasing integer maintained per device across restarts (persisted in the daemon's local SQLite outbox). The server uses the sequence to:
- Detect gaps (missed events)
- Efficiently acknowledge batches (`ackedThroughSequence`)
- Order events when `occurredAt` timestamps collide

### 2.3 `planId`

For live plans: derived from `plan-summary.json → title` converted to a slug, or a UUID generated and persisted by the daemon the first time it observes the plan.

For archived plans: use the archive folder name (e.g., `2026-04-17T14-31-12-139Z-plan-...`) as a stable `planId`.

Idempotency key for archive ingestion: `projectId + archiveId + taskId`.

### 2.4 `runId`

Optional; identifies a continuous daemon run (reset on process restart). Allows the server to detect unexpected daemon restarts.

---

## 3. Telemetry and Privacy Redaction

All sensitive local data passes through a `TelemetryProfile` filter before being included in events. The profile is set per-project in daemon config and reported in `project_seen`.

| Profile field | Type | Effect |
|---------------|------|--------|
| `worktreePath` | `"off"` \| `"basename"` \| `"relative"` \| `"full"` | Controls how `WorktreeSnapshot.worktreePath` is reported: omit, filename only, relative to repo root, or absolute |
| `repoRootPath` | `"off"` \| `"basename"` \| `"relative"` \| `"full"` | Controls `WorktreeSnapshot.repoRootPath` — default `"off"` |
| `git` | `"off"` \| `"branch-only"` \| `"full"` | `"off"`: omit all git fields; `"branch-only"`: include branch only; `"full"`: include branch + headSha + ahead/behind |
| `progressText` | `boolean` | When `false`, `task_progressed.step` is set to `null` and `progressVisible` to `false` |
| `usage` | `boolean` | When `false`, omit `usage` from `task_completed`, `task_failed`, and `usage_reported` events |
| `planText` | `boolean` | When `false`, omit `overview` and `description` from `plan_seen` and `task_seen` |
| `taskDescription` | `boolean` | When `false`, omit `description` from `task_seen` |

**Hard-blocked fields** — never transmitted regardless of telemetry settings:

- `status.json → pid` — OS process id; privacy risk
- `fleet.json → engines[].command` / `engines[].args` — local command invocation (may contain API keys)
- `fleet.json → agents[].prompt` — operator system prompts; proprietary

**Preset profiles:**

| Name | `worktreePath` | `git` | `progressText` | `planText` |
|------|---------------|-------|----------------|------------|
| `minimal` | `"off"` | `"branch-only"` | `false` | `false` |
| `balanced` (default) | `"relative"` | `"full"` | `false` | `true` |
| `full` | `"full"` | `"full"` | `true` | `true` |

---

## 4. MVP Adapter: Mapping Current .pi Files to Events

This section describes the **compatibility parsing layer** for v1 of the daemon. It is explicitly a stopgap: the pi-fleet runtime does not yet emit structured events, so the daemon polls and diffs file system state. When the fleet runtime gains a structured event emitter, this section becomes obsolete and the adapter is removed.

### 4.1 Source Files and Polling Strategy

| Source file | Poll interval | Adapter action |
|-------------|---------------|----------------|
| `.pi/tasks/plan-summary.json` | On start + file change (fs watch) | Emit `plan_seen` + `task_seen` per task |
| `.pi/tasks/state.json` | Every 2–5 s (configurable) | Diff against last snapshot → emit lifecycle events |
| `.pi/tasks/<slug>/status.json` | On-demand (read when `state.json` diff flags a change) | Cross-reference for detailed per-task metadata |
| `.pi/tasks/<slug>/progress.jsonl` | Tail with byte-offset tracking | Emit `task_progressed` per new line |
| `.pi/archive/index.json` | On start + periodic (60 s) | Detect new archives → back-fill historical events |
| `.pi/archive/<id>/archive-summary.json` | On-demand after index detects new archive | Emit historical `task_completed`/`task_failed` + `usage_reported` per task |

The daemon persists byte offsets for `progress.jsonl` files in its local SQLite outbox so progress events are never re-emitted after restart.

### 4.2 `.pi/tasks/plan-summary.json` → `plan_seen` + `task_seen`

```
Source field                  → Target field
─────────────────────────────────────────────────────
(derived slug from title)     → planId
title                         → payload.title
overview                      → payload.overview  (if telemetry.planText)
sourcePlanPath                → payload.sourcePlanPath
splitAt                       → payload.splitAt
taskCount                     → payload.taskCount
tasks[]                       → payload.tasks[]

Per task:
  id                          → taskId
  slug                        → slug
  name                        → taskName / name
  depends                     → dependsOn
  description                 → description  (if telemetry.taskDescription)
  agent                       → execution.agentRole
  engine                      → execution.engine
  model                       → execution.model
  profile                     → execution.profile
  thinking                    → execution.thinking
  (engine → provider mapping) → execution.provider  (see §4.6)
```

Emit one `plan_seen` event (with embedded `tasks` array) immediately on parse, then emit individual `task_seen` events for each task.

### 4.3 `.pi/tasks/state.json` → Lifecycle Events (Polling Diff)

The adapter maintains a snapshot of the previous `state.json` content. On each poll it reads the file and compares per-task `status` and `latestProgressAt` fields.

#### Status transition mapping

| Previous status | New status | Event emitted |
|-----------------|-----------|---------------|
| `pending` / `null` | `running` | `task_started` |
| `running` | `done` | `task_completed` |
| `running` | `failed` | `task_failed` |
| `running` | `retrying` | `task_failed` (with `error: "retrying"`) then `task_started` on next `running` |
| any | `done` (no prior `running` seen) | `task_completed` (source: from status.json) |
| any | `failed` (no prior `running` seen) | `task_failed` |

#### Field mapping for `task_started`

```
state.json task entry          → payload field
─────────────────────────────────────────────
id                             → taskId
name                           → taskName / slug
startedAt                      → startedAt
"running" (literal)            → status
agent, engine, model, ...      → execution.* (from state.json or plan-summary.json)
```

#### Field mapping for `task_completed` / `task_failed`

Read `.pi/tasks/<slug>/status.json` for authoritative values:

```
status.json field              → payload field
─────────────────────────────────────────────
id                             → taskId
name                           → taskName / slug
status                         → status
startedAt                      → startedAt
completedAt                    → completedAt
duration                       → durationMs
retries                        → retries
error                          → error  (task_failed only)
usage.inputTokens              → usage.inputTokens  (if telemetry.usage)
usage.outputTokens             → usage.outputTokens
pid                            → EXCLUDED — never transmitted
```

After emitting `task_completed` or `task_failed`, also emit `usage_reported` with the same `usage` values if `telemetry.usage === true`.

#### `latestProgressAt` change → re-tail progress

When `state.json` shows a new `latestProgressAt` for a running task, the adapter re-tails that task's `progress.jsonl` from its stored byte offset.

### 4.4 `.pi/tasks/<slug>/progress.jsonl` → `task_progressed`

Each line is a JSON object:

```
progress.jsonl field           → payload field
─────────────────────────────────────────────
ts                             → progressAt (and occurredAt on the event envelope)
status                         → progressStatus
step (if telemetry.progressText) → step
(not present)                  → progressVisible = telemetry.progressText
```

**Byte-offset tracking:** The adapter stores `{ taskSlug, byteOffset }` in its local SQLite outbox. On startup it resumes from the stored offset. When a task completes, the final offset is stored; when the task folder is archived, the offset record is cleaned up.

**Step text redaction:** If `telemetry.progressText === false`, `step` is set to `null` and `progressVisible` to `false` before the event is enqueued.

### 4.5 `.pi/archive/index.json` + `archive-summary.json` → Historical Events

On daemon start (and every 60 s), the adapter reads `.pi/archive/index.json`. For each archive entry whose `id` has not been processed (tracked in the local SQLite outbox table `processed_archives`):

1. Read `.pi/archive/<id>/archive-summary.json`.
2. Emit `plan_seen` for the archived plan.
3. For each task in `archive-summary.json`:
   a. Emit `task_seen` (with `source: "archive"`).
   b. Emit `task_started` with `startedAt` (if present).
   c. Emit `task_completed` or `task_failed` based on `status`.
   d. Emit `usage_reported` (if `telemetry.usage`).
4. Mark archive `id` as processed in the outbox.

**Idempotency key:** `projectId + archiveId + taskId`. The server deduplicates on `eventId` (UUID per event), so the adapter must generate deterministic or stored event IDs for archive events (e.g., UUID v5 derived from `projectId + archiveId + taskId + eventType`).

**Note:** Archive events never re-read individual `progress.jsonl` files — only `archive-summary.json.tasks[].progressEntries` (count) and `lastProgress` (truncated text) are available. `task_progressed` events are **not** synthesised from archives.

#### Field mapping for archive `plan_seen`

```
archive-summary.json field     → payload field
─────────────────────────────────────────────
(archiveId used as planId)     → planId
plan.title                     → title
plan.overview                  → overview  (if telemetry.planText)
plan.sourcePlanPath            → sourcePlanPath
plan.splitAt                   → splitAt
plan.taskCount                 → taskCount
tasks[]                        → tasks[]  (as PlanTaskSummary)
```

#### Field mapping for archive `task_completed` / `task_failed`

```
archive-summary.json task[]    → payload field
─────────────────────────────────────────────
id                             → taskId
name                           → taskName / slug
status ("done"/"failed")       → status
startedAt                      → startedAt
completedAt                    → completedAt
duration                       → durationMs
retries                        → retries
error                          → error  (task_failed only)
usage.inputTokens/outputTokens → usage.*  (if telemetry.usage)
```

`occurredAt` on archive events is set to `completedAt` (or `archivedAt` from the index if `completedAt` is absent).

### 4.6 Engine → Provider Mapping

The pi-fleet `engine` field maps to the `execution.provider` field in events:

| `engine` value | `execution.provider` |
|---------------|----------------------|
| `"claude"` | `"anthropic"` |
| `"codex"` | `"openai"` |
| `"gemini"` | `"google"` |
| (unknown) | `null` |

This mapping lives in the adapter layer only; the target contract accepts `provider` as a free-form string.

### 4.7 `planId` Derivation Strategy

Because `plan-summary.json` does not contain a stable UUID, the adapter derives `planId` as follows:

1. **Active plan:** Compute `slugify(plan-summary.json → title)` and persist it in the local outbox on first observation. Reuse on subsequent polls.
2. **Archived plan:** Use the archive folder name (e.g., `2026-04-17T14-31-12-139Z-plan-foo`) directly as `planId`. This is already stable and unique.

When the fleet runtime adds a `planId` field to `plan-summary.json`, the adapter should prefer that value and fall back to the derived slug.

---

## 5. Transport Layer Summary

The adapter feeds events into the daemon's outbox (SQLite). The WebSocket client (Task 013) drains the outbox and sends `event_batch` messages to `wss://clean.dev/api/cockpit/ws`. The server acknowledges via `event_batch_ack`.

```
.pi files
  │
  ▼
MVP Adapter (Task 012)
  │  polls + diffs + tails
  ▼
SQLite Outbox (local, per-device)
  │  sequence numbers assigned here
  ▼
WebSocket Client (Task 013)
  │  event_batch messages (up to N events per batch)
  ▼
wss://clean.dev/api/cockpit/ws
  │  authenticated via device token (not NextAuth JWT)
  ▼
Server Projection (Task 007)
  │  deduplicates on eventId
  ▼
PostgreSQL (clean-dev cluster via CloudNativePG)
```

Batch size and retry policy are daemon-internal; the server only requires that `sequence` values are monotonically increasing per device across batches.

---

## 6. Contract Stability Guarantees

### 6.1 Backwards-compatible changes (no `schemaVersion` bump)

- Adding **optional** fields to any event payload
- Adding new event types to the union
- Expanding enum values with new members (existing members remain)
- Changing default values of optional fields

### 6.2 Breaking changes (require `schemaVersion` bump)

- Removing or renaming required fields
- Narrowing a field's type (e.g., `string` → `string | null` is fine; `string | null` → `string` is breaking)
- Removing event types from the union
- Changing `eventId` uniqueness semantics

### 6.3 Adapter compatibility layer lifecycle

The MVP adapter described in §4 should be considered **deprecated on creation**. It exists only because the pi-fleet runtime does not yet emit events directly. The adapter is ready for removal when:

1. The pi-fleet runner writes a `cockpit-events.jsonl` or similar structured event log alongside task state files, **or**
2. The pi-fleet runner integrates the `@cleandev/cockpit-protocol` package and emits events directly to the outbox.

Until that point, the adapter is the only supported ingestion path, and all downstream tasks (004, 005, 006, 007, 008, 010, 012, 013, 014) must treat the event schemas in `@cleandev/cockpit-protocol` — not the `.pi` file shapes — as the stable interface.

---

## 7. Cross-Reference with Upstream Deliverables

| Artifact | Location | Relationship |
|----------|----------|--------------|
| `.pi` file shapes (authoritative) | `docs/cockpit-audit.md` §6 | Source for §4 adapter field mappings |
| Event Zod schemas | `packages/cockpit-protocol/src/events.ts` | Canonical type definitions; §1–§2 summarise them |
| Config + telemetry schemas | `packages/cockpit-protocol/src/config.ts` | Canonical telemetry profile; §3 summarises |
| WebSocket message schemas | `packages/cockpit-protocol/src/messages.ts` | Transport framing; §5 summarises |
| Auth constraint (device token) | `docs/cockpit-audit.md` §1 | WebSocket auth must use device token, not NextAuth JWT |
| DB migration constraint | `docs/cockpit-audit.md` §2 | Task 004 must add tables via Drizzle migration in `packages/pm/drizzle/` |
| WebSocket hosting constraint | `docs/cockpit-audit.md` §4 | Single custom Node.js server on port 3000; nginx timeout annotations required |
