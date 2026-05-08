# Cockpit Overview — Information Architecture & State Contract

_Authored 2026-05-07. Scout task 002. Based on Task 001 audit of `docs/cockpit-followup-audit.md`._

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Terminology](#2-terminology)
3. [Current State Baseline](#3-current-state-baseline)
4. [New Information Architecture](#4-new-information-architecture)
   - 4.1 [Fleet Overview — `/cockpit`](#41-fleet-overview----cockpit)
   - 4.2 [Project Overview — `/cockpit/[projectId]`](#42-project-overview----cockpitprojectid)
   - 4.3 [Plan Drilldown — `/cockpit/[projectId]/plans/[planId]`](#43-plan-drilldown----cockpitprojectidplansplanid)
   - 4.4 [Archive Browser — `/cockpit/[projectId]/archive`](#44-archive-browser----cockpitprojectidarchive)
   - 4.5 [Device Management — `/cockpit/devices`](#45-device-management----cockpitdevices)
5. [Prioritized UI Layout](#5-prioritized-ui-layout)
6. [Extended State Contract](#6-extended-state-contract)
   - 6.1 [Core Fields (unchanged)](#61-core-fields-unchanged)
   - 6.2 [New Fields Required](#62-new-fields-required)
   - 6.3 [Derived / Computed Fields (not stored)](#63-derived--computed-fields-not-stored)
   - 6.4 [Authoritative vs Best-Effort Values](#64-authoritative-vs-best-effort-values)
7. [Protocol Event Mapping](#7-protocol-event-mapping)
   - 7.1 [Existing Events — Coverage Map](#71-existing-events--coverage-map)
   - 7.2 [Gaps — New Events Required](#72-gaps--new-events-required)
8. [New Event Type Specifications](#8-new-event-type-specifications)
9. [Wire & State Examples](#9-wire--state-examples)
10. [Stale / Offline Rules](#10-stale--offline-rules)
11. [Drilldown Model](#11-drilldown-model)
12. [Implementation Priorities](#12-implementation-priorities)

---

## 1. Purpose & Scope

The current Cockpit UI treats each project as the entire product: the overview page is a grid of `ProjectCard` widgets, and clicking one opens a single flat `ProjectDetail` view that mixes running tasks, worktrees, plans, and daemon metadata all on one level.

This document defines the **next overview model** — an information architecture where:

- The project card becomes **one section of a multi-level fleet overview**, not the entire product.
- Each project has a dedicated overview page that surfaces **per-device observations**, **live agent activity**, **branch inventory**, **engine/model/profile breakdown**, and **approximate cost summary** as first-class sections.
- A separate **plan drilldown** shows task-level detail, dependency order, progress history, and handover summaries.
- An **archive browser** provides read-only historical access to completed plans and runs with the same drilldown depth.
- **Stale/offline rules** are explicit and per-device rather than a single project-level boolean.

For each UI requirement the document maps the requirement to existing protocol events and projected-state fields, or specifies what new protocol event or projection field must be added.

---

## 2. Terminology

| Term | Meaning |
|---|---|
| **Device** | A single `cockpit-daemon` installation, identified by `deviceId`. One user may have multiple devices reporting on the same project. |
| **Project** | A repository root tracked by one or more devices. Identified by `projectId`. One row in `cockpit_projects`. |
| **Projected state** | The JSONB snapshot in `cockpit_projected_project_state.state` — the single authoritative read-model the UI consumes. |
| **Plan** | A set of ordered tasks defined in `.pi/tasks/plan-summary.json`. Identified by a slug derived from the plan title. |
| **Task** | A single unit of agent work within a plan. Has a lifecycle: `pending → running → done/failed/retrying`. |
| **Live** | Events with `source = 'live'` — from the currently active `.pi/` workspace. |
| **Archive** | Events with `source = 'archive'` — from `.pi/archive/`. Plans and tasks that have been completed and moved to the archive. |
| **Staleness** | Whether a device's heartbeat is overdue. Distinct from projection lag (unprojected events waiting in the DB). |
| **Authoritative** | A value that is definitively correct based on a signed event from the daemon. |
| **Best-effort** | A value derived by inference (e.g., a computed cost estimate from token counts, or a per-device health score inferred from heartbeat age). |

---

## 3. Current State Baseline

> Source: `docs/cockpit-followup-audit.md` — Task 001 audit (completed 2026-05-07).

### What exists today

| Layer | What it shows | How data arrives |
|---|---|---|
| `/cockpit` (overview) | Grid of `ProjectCard` — project name, health dot, running/failed/dirty-worktree badges | RSC reads `listProjects()` + `getProjectedProjectState()` per project; no push, no poll |
| `/cockpit/[projectId]` (detail) | Flat view: daemon status, running tasks, failed tasks, worktrees, plans (flat list), other tasks, project metadata | Same RSC reads; manual `RefreshButton` only |

### What is missing (gaps from Task 001 audit)

1. No real-time push to the browser (no SSE, no WebSocket, no polling).
2. Tasks are plan-agnostic in the task view — no per-plan grouping or drilldown.
3. `retrying` status is invisible in the active-agents section.
4. No usage aggregation — token usage is only per-task, never per-plan or per-project.
5. No archived plan history view — `source = 'archive'` is stored but never surfaced.
6. No worktree detail or git diff drill-down.
7. No device management list page.
8. No project search/filter.
9. Projection lag is not surfaced with auto-refresh.
10. No per-device health breakdown — a single `dirty` boolean conflates all devices.

---

## 4. New Information Architecture

The new architecture has five levels. The **current `ProjectCard` + `ProjectDetail`** become the project overview section of a larger hierarchy.

```
/cockpit                           ← Level 1: Fleet overview
  ├─ Fleet health strip
  └─ Project card grid (enhanced)

/cockpit/[projectId]               ← Level 2: Project overview (current page, expanded)
  ├─ Project summary header
  ├─ Per-device daemon observations
  ├─ Live fleet/task activity
  ├─ Branch / worktree inventory
  ├─ Current plan section
  ├─ Agent runtime & engine summary
  ├─ Cost summary
  └─ Archive entry point

/cockpit/[projectId]/plans/[planId]  ← Level 3: Plan drilldown (new)
  ├─ Plan header
  ├─ Task list (per-plan, with status)
  ├─ Task detail panel
  ├─ Handover / output summaries
  └─ Plan-level usage / cost

/cockpit/[projectId]/archive         ← Level 4: Archive browser (new)
  └─ Archived plan list → links to per-plan archive view at Level 3

/cockpit/devices                     ← Level 5: Device management (new)
  ├─ Paired device list
  └─ Revoke / manage actions
```

---

### 4.1 Fleet Overview — `/cockpit`

The top-level page shows two things:

#### Fleet health strip (new, top of page)

A single-row summary bar across all projects the user has registered. This is a **computed aggregate** from all projected states — not a new API endpoint; it can be computed client-side from the same `listProjects()` + projected-state data already fetched for the card grid.

| Strip element | Data source | Authoritative? |
|---|---|---|
| Total projects | `listProjects().length` | Authoritative |
| Projects online | Projects where `state.dirty === false` | Best-effort (60s stale window) |
| Total running agents | `sum(tasks.filter(t.status==='running').length)` across all projects | Best-effort (projection lag up to 4 s) |
| Total failed tasks | `sum(tasks.filter(t.status==='failed').length)` across all projects | Best-effort |
| Devices connected | Distinct `deviceId` values across `state.devices` (new field) with recent heartbeat | Best-effort |

#### Enhanced Project Card (replaces current `ProjectCard`)

The project card gains additional data compared to today's three-badge card:

| Card element | Data source | Authoritative? |
|---|---|---|
| Project name + slug | `state.projectName`, `state.projectSlug` | Authoritative |
| Health indicator (per-device) | `state.devices[*].stale` (new) | Best-effort |
| Running agent count | `tasks.filter(status==='running').length` | Best-effort |
| Active plan name | `state.lastHeartbeat.activePlanId` | Best-effort (last heartbeat) |
| Worktree status summary | `worktrees.filter(isDirty \|\| aheadCount>0).length` | Best-effort (60s poll) |
| Token usage (current plan) | `sum(tasks.filter(planId===activePlanId).usage)` | Best-effort |

The card links to `/cockpit/[projectId]`.

---

### 4.2 Project Overview — `/cockpit/[projectId]`

This is the expanded version of the current `ProjectDetail` page. It retains all current sections and adds new ones. Sections are prioritized in the [UI Layout](#5-prioritized-ui-layout) section.

#### Section A — Project Summary Header
| Element | Data source | Authoritative? |
|---|---|---|
| Name, slug, local root path | `state.projectName`, `state.projectSlug`, `state.localRootPath` | Authoritative |
| Overall health dot | Derived from `state.dirty` (any device stale) | Best-effort |
| Project ID, created date | `project.projectId`, `project.createdAt` | Authoritative |

#### Section B — Per-Device Daemon Observations (new)

One row per reporting device in `state.devices` (new field):

| Element | Data source | Authoritative? |
|---|---|---|
| Device name | Looked up from `cockpit_paired_devices.deviceName` via `deviceId` | Authoritative |
| Device ID | `state.devices[deviceId].deviceId` | Authoritative |
| Health status | Derived: `now - lastHeartbeat.occurredAt > 60s` → offline | Best-effort |
| Daemon version | `state.devices[deviceId].lastHeartbeat.daemonVersion` | Authoritative from that device |
| Active plan on this device | `state.devices[deviceId].lastHeartbeat.activePlanId` | Authoritative from that device |
| Active task count on this device | `state.devices[deviceId].lastHeartbeat.activeTaskCount` | Authoritative from that device |
| Last seen at | `state.devices[deviceId].lastHeartbeat.occurredAt` | Authoritative |
| First seen | `state.devices[deviceId].firstSeenAt` | Authoritative |

> **Note:** In the single-device case this section collapses to one row and is styled the same as the current "Daemon status" card. In the multi-device case a table or accordion is more appropriate.

#### Section C — Live Fleet / Task Activity (priority 1)

Replaces the current "Active agents" + "Failed tasks" sections. Shows all non-idle tasks:

| Sub-section | Filter | Elements |
|---|---|---|
| Running | `status === 'running'` | Task name, plan link, agentRole, engine/model/profile, elapsed time (`now - startedAt`), latest progress step |
| Retrying | `status === 'retrying'` | Same as running + retry count |
| Failed | `status === 'failed'` | Task name, plan link, error summary, duration, retry count, usage |

Each task row links to the plan drilldown at `/cockpit/[projectId]/plans/[planId]` and scrolls to the task's detail panel.

#### Section D — Branch / Worktree Inventory

Replaces the current flat `WorktreeSummary` list:

| Element | Data source | Authoritative? |
|---|---|---|
| Worktree path | `worktree.worktreePath` (filtered by `telemetry.worktreePath`) | Authoritative (subject to telemetry gate) |
| Branch | `worktree.branch` | Authoritative (subject to `telemetry.git`) |
| HEAD SHA (short) | `worktree.headSha` | Authoritative (subject to `telemetry.git = full`) |
| Dirty indicator | `worktree.isDirty` | Authoritative from that device |
| Untracked count | `worktree.untrackedCount` | Authoritative from that device |
| Ahead/behind | `worktree.aheadCount`, `worktree.behindCount` | Best-effort (only if upstream branch exists) |
| Last observed | `worktree.lastObservedAt` | Authoritative from that device |
| Observing device | Derived: which device emitted the `worktree_seen`/`worktree_changed` event (currently not in projected state; see [Section 6.2](#62-new-fields-required)) | — |

> **Important caveat:** Worktree snapshots come from one daemon device. If multiple devices are reporting on the same project (e.g., two developers), each device will have its own worktree observations for potentially different local paths. The current projection merges them by `worktreeId` (which is `wt_<SHA256(projectId:absolutePath)>`). Two developers have different absolute paths, so their worktrees don't collide. However, the same worktree seen from two devices would have the same `worktreeId` and the second device's update would overwrite the first — this is correct behavior since they're the same physical worktree.

#### Section E — Current Plan Summary

Shows the plan referenced by `state.lastHeartbeat.activePlanId`. If no plan is active, show the most-recently-seen live plan:

| Element | Data source | Authoritative? |
|---|---|---|
| Plan title | `state.plans[activePlanId].title` | Authoritative |
| Plan overview | `state.plans[activePlanId].overview` | Authoritative |
| Task progress bar | `(done_count / total_count)` from `state.tasks` filtered by `planId` | Best-effort |
| Running count / done count / failed count | Counts from `state.tasks` filtered by `planId` | Best-effort |
| Source plan path | `state.plans[activePlanId].sourcePlanPath` | Authoritative (subject to telemetry) |
| Plan-level usage (new) | `state.plans[activePlanId].usage` (new field) | Best-effort (summed from tasks) |
| → Full plan drilldown link | `/cockpit/[projectId]/plans/[planId]` | — |

#### Section F — Agent Runtime & Engine Summary (new)

A breakdown of agent execution metadata across all tasks for this project:

| Element | Data source | How computed |
|---|---|---|
| Engine breakdown | `tasks[*].execution.engine` group-by count | Summed in projection or computed in UI |
| Model breakdown | `tasks[*].execution.model` group-by count | Summed in projection or computed in UI |
| Profile breakdown | `tasks[*].execution.profile` group-by count | Summed in projection or computed in UI |
| Agent roles observed | `tasks[*].execution.agentRole` distinct | Computed in UI |
| Total runtime (done tasks) | `sum(tasks.filter(status==='done').durationMs)` | Computed in UI |
| Avg task duration | `totalRuntime / completedTaskCount` | Computed in UI |

> **Scope note:** This section should be filterable by plan (show only tasks for the current plan). The per-plan breakdown is a separate panel in the plan drilldown.

#### Section G — Approximate Cost Summary (new)

Token usage and estimated cost, per-plan and project-total:

| Element | Data source | Authoritative? |
|---|---|---|
| Total input tokens | `sum(tasks[*].usage.inputTokens)` | Best-effort (usage events may be partial) |
| Total output tokens | `sum(tasks[*].usage.outputTokens)` | Best-effort |
| Per-plan token totals | `sum(tasks.filter(planId===X).usage.*)` | Best-effort |
| Estimated cost (USD) | Computed from token counts × model pricing table | Best-effort, not authoritative |

> **Authoritativeness note:** Token counts come from `usage_reported` events and `task_completed`/`task_failed` payload `usage` fields. These are emitted by the daemon from the `usage` field in `.pi/tasks/<id>-<slug>/status.json`. They represent what the agent runtime reported — they are accurate for that run but do not account for cache credits, billing discounts, or API-level adjustments. Label them "approximate" in the UI.

> **Cost estimation:** A pricing table must be maintained separately in the UI (not in the protocol). Map `execution.model + execution.provider` to a price-per-1K-tokens. This is a best-effort estimate and should say "~$X.XX" with a disclaimer.

#### Section H — Archived Plans Entry Point (new)

A compact summary row at the bottom of the project overview:

| Element | Data source | Authoritative? |
|---|---|---|
| Archived plan count | `state.plans` filtered by `source === 'archive'` count (new field) | Best-effort |
| Most recently archived | `max(state.plans.filter(source==='archive').lastSeenAt)` | Best-effort |
| → Archive browser link | `/cockpit/[projectId]/archive` | — |

---

### 4.3 Plan Drilldown — `/cockpit/[projectId]/plans/[planId]`

A dedicated page for one plan (live or archived):

#### Plan Header
| Element | Data source | Authoritative? |
|---|---|---|
| Plan title | `state.plans[planId].title` | Authoritative |
| Plan overview | `state.plans[planId].overview` | Authoritative |
| Source plan path | `state.plans[planId].sourcePlanPath` | Authoritative (telemetry gated) |
| Split date | `state.plans[planId].splitAt` | Authoritative (if set) |
| Last seen | `state.plans[planId].lastSeenAt` | Best-effort (last `plan_seen` event) |
| Source (live/archive) | `state.plans[planId].source` (new field) | Authoritative |

#### Task List
Grouped by status (running/retrying → failed → done → pending). Each task row shows:

| Element | Data source | Authoritative? |
|---|---|---|
| Task name | `task.taskName` | Authoritative |
| Task slug | `task.slug` | Authoritative |
| Status badge | `task.status` | Authoritative |
| Agent role | `task.execution.agentRole` | Authoritative from daemon |
| Engine / model / profile | `task.execution.{engine, model, profile, thinking}` | Authoritative from daemon |
| Duration | `task.durationMs` (completed) or `now - task.startedAt` (running) | Authoritative / best-effort |
| Retries | `task.retries` | Authoritative |
| Token usage | `task.usage.{inputTokens, outputTokens}` | Best-effort |
| Latest progress step | `task.latestProgress.step` | Best-effort (last observed) |
| Dependencies | `task.dependsOn` (array of taskIds) | Authoritative |
| Error summary | `task.error` (truncated) | Authoritative |

Clicking a task row expands the task detail panel (see below).

#### Task Detail Panel
| Element | Data source | Authoritative? |
|---|---|---|
| Task ID | `task.taskId` | Authoritative |
| Description | `task.description` | Authoritative |
| Full execution details | `task.execution` (all fields) | Authoritative from daemon |
| Full error message | `task.error` | Authoritative |
| Started at / completed at | `task.startedAt`, `task.completedAt` | Authoritative |
| Progress history | `task.latestProgress` (only latest — see gap below) | Best-effort |
| Handover summary | `task.handoffSummary` (new field — requires new event) | Best-effort |
| Output summary | `task.outputSummary` (new field — requires new event) | Best-effort |

> **Gap:** The current protocol stores only `latestProgress` (one snapshot). A full progress history (all steps from `progress.jsonl`) is not accumulated in the projected state. Adding a `progressHistory: ProgressEntry[]` array (capped at N entries) to `CockpitProjectedTaskState` would allow a timeline view. This requires a projection change, not a new event type.

#### Plan-Level Usage Summary
Computed in the UI from filtered tasks:

```
planInputTokens  = sum(tasks.filter(planId===X).usage.inputTokens)
planOutputTokens = sum(tasks.filter(planId===X).usage.outputTokens)
estimatedCost    = planInputTokens/1000 * inputPrice + planOutputTokens/1000 * outputPrice
```

---

### 4.4 Archive Browser — `/cockpit/[projectId]/archive`

Reads from `state.plans` filtered by `source === 'archive'` (new field). Sorted by `lastSeenAt` descending.

| List element | Data source | Authoritative? |
|---|---|---|
| Plan title | `plan.title` | Authoritative |
| Task count | `plan.taskCount` | Authoritative |
| Completed tasks | `tasks.filter(planId===X && status==='done').length` | Best-effort |
| Failed tasks | `tasks.filter(planId===X && status==='failed').length` | Best-effort |
| Total tokens | `sum(tasks.filter(planId===X).usage.*)` | Best-effort |
| Last activity | `plan.lastSeenAt` | Best-effort |
| Source plan path | `plan.sourcePlanPath` | Authoritative (telemetry gated) |
| → Plan drilldown | `/cockpit/[projectId]/plans/[planId]` | — |

The archive browser links to the same `/plans/[planId]` drilldown as live plans — but the plan detail page shows the `source: 'archive'` badge and all tasks are read-only/historical.

---

### 4.5 Device Management — `/cockpit/devices`

Uses direct DB queries (via existing server actions), not the projected state:

| Element | Data source | Authoritative? |
|---|---|---|
| Device name | `cockpit_paired_devices.deviceName` | Authoritative |
| Device ID | `cockpit_paired_devices.deviceId` | Authoritative |
| Instance name | `cockpit_paired_devices.instanceName` | Authoritative |
| Paired at | `cockpit_paired_devices.pairedAt` | Authoritative |
| Last seen at | `cockpit_paired_devices.lastSeenAt` | Authoritative |
| Revoked at | `cockpit_paired_devices.revokedAt` | Authoritative |
| Active tokens | `cockpit_device_tokens.filter(revokedAt IS NULL)` | Authoritative |
| Active sessions | `cockpit_device_sessions.filter(endedAt IS NULL)` | Authoritative |
| Revoke button | Calls existing `revokeDeviceAction(deviceId)` | — |
| Pair new device | Initiates pairing flow at `/cockpit/devices/approve` | — |

---

## 5. Prioritized UI Layout

The layout below defines the rendering order on each page. Higher priority sections appear first and are never collapsed by default.

### `/cockpit` (fleet overview)

```
┌──────────────────────────────────────────────────────────────────┐
│  [P0] Fleet health strip                                          │
│    N projects · M running · K failed · J devices online          │
└──────────────────────────────────────────────────────────────────┘
┌────────────┐ ┌────────────┐ ┌────────────┐  ← [P1] Project cards
│ Project A  │ │ Project B  │ │ Project C  │
│ ● online   │ │ ◌ offline  │ │ ● online   │
│ 2 running  │ │ Idle       │ │ 1 failed   │
│ 3 dirty wt │ │            │ │ plan: auth │
└────────────┘ └────────────┘ └────────────┘
```

### `/cockpit/[projectId]` (project overview)

```
[P0]  Project summary header
        Name · slug · path · health dots per device · RefreshButton

[P1]  Live activity (if any running/retrying/failed tasks)
        Running agents: task name · plan link · engine/model · elapsed · progress step
        Retrying: same + retry count
        Failed:   task name · error summary · plan link

[P2]  Current plan section
        Plan title · overview · progress bar (done/total)
        Running N / Done N / Failed N    [Tokens: X in, Y out  ~$Z]
        → View full plan ↗

[P3]  Branch / worktree inventory
        One row per worktree: branch · HEAD · dirty · ahead/behind · last observed

[P4]  Per-device daemon observations
        One row per device: name · health · version · active plan · last seen

[P5]  Agent runtime & engine summary  (collapsible if no tasks)
        Engine breakdown table  ·  Model breakdown  ·  Profile breakdown

[P6]  Approximate cost summary  (collapsible)
        Per-plan token totals  ·  Project total  ·  Estimated ~$X.XX

[P7]  Archived plans entry point  (one line, links to archive browser)
        N archived plans  ·  Last archived: <date>  → Browse archive ↗

[P8]  Project metadata  (collapsible)
        projectId · createdAt · latestEventSequence · projectionDirty
```

### `/cockpit/[projectId]/plans/[planId]` (plan drilldown)

```
[P0]  Plan header
        Title · overview · sourcePlanPath · source badge (LIVE / ARCHIVE)
        splitAt · lastSeenAt · [back to overview ←]

[P1]  Running & retrying tasks  (expanded by default)
        Each: name · engine/model/profile · elapsed · latest progress step

[P2]  Failed tasks  (expanded by default if any)
        Each: name · error snippet → expand for full error + execution details

[P3]  Done tasks  (collapsed by default, sorted newest-first)
        Each: name · duration · tokens · retries → expand for detail + handoff

[P4]  Pending tasks  (collapsed by default)
        Each: name · dependsOn list → expand for description

[P5]  Plan usage summary
        Total input tokens · output tokens · estimated cost
        Breakdown by model/engine

[P6]  Task detail panel  (flyout or inline expand on row click)
        Full execution fields · description · progress history (if stored)
        Handover summary (if available)  ·  Output summary (if available)
```

### `/cockpit/[projectId]/archive` (archive browser)

```
[P0]  Archive header  ← project overview
        "N archived plans for Project X"  ·  (sorted newest first)

[P1]  Archive plan list
        Each plan card: title · taskCount · done/failed · tokens · last activity
        → links to /cockpit/[projectId]/plans/[planId] (same drilldown, ARCHIVE badge)
```

---

## 6. Extended State Contract

### 6.1 Core Fields (unchanged)

These fields already exist in `CockpitProjectedProjectState` and require no changes:

```typescript
interface CockpitProjectedProjectState {
  schemaVersion: number;         // always cockpitProtocolSchemaVersion (currently 1)
  projectId: string;
  projectName?: string | null;
  projectSlug?: string | null;
  localRootPath?: string | null;
  telemetry?: TelemetryProfile | null;
  dirty: boolean;                // true = no heartbeat or event in last 60s (ANY device)
  lastEvent?: LastEventMeta | null;
  lastHeartbeat?: LastHeartbeat | null;  // most-recent heartbeat across ALL devices
  worktrees: Record<string, WorktreeSnapshot>;
  plans: Record<string, CockpitProjectedPlanState>;
  tasks: Record<string, CockpitProjectedTaskState>;
}
```

### 6.2 New Fields Required

The following additions are needed to support the new information architecture. All additions are **additive** (no existing field removed or renamed) and require a `schemaVersion` bump to 2.

#### A. `devices` map (new top-level field)

```typescript
interface DeviceObservation {
  deviceId: string;
  firstSeenAt: string;           // ISO, from first event by this deviceId
  lastEventAt: string;           // ISO, timestamp of most recent event from this device
  lastHeartbeat?: {
    occurredAt: string;
    daemonVersion?: string | null;
    activePlanId?: string | null;
    activeTaskCount: number;
  } | null;
}

// Added to CockpitProjectedProjectState:
devices: Record<string, DeviceObservation>;
```

**How populated:** `foldEventsIntoState()` tracks `deviceId` from every event's metadata and updates the per-device observation whenever a `project_heartbeat` arrives.

**Staleness computation:** `deviceObservation.stale = (now - new Date(lastHeartbeat.occurredAt).getTime()) > HEARTBEAT_STALE_MS`. This is computed at read-time, not stored, because the threshold depends on `now`.

#### B. `source` field on plans and tasks (new per-entity field)

```typescript
// Added to CockpitProjectedPlanState:
source: 'live' | 'archive';    // from the source field of the plan_seen event

// Added to CockpitProjectedTaskState:
source: 'live' | 'archive';    // from the source field of the task_seen/task_started event
```

**How populated:** The `source` field is already on every protocol event's metadata. `foldEventsIntoState()` carries it forward into the plan/task snapshot when processing `plan_seen`, `task_seen`, and `task_started`.

**Why needed:** Without this, the archive browser cannot distinguish archived plans from live ones inside the projected state.

#### C. `usage` aggregate on plans (new plan-level field)

```typescript
// Added to CockpitProjectedPlanState:
usage: {
  inputTokens: number;
  outputTokens: number;
};
```

**How populated:** `foldEventsIntoState()` sums `task.usage` into the plan's aggregate whenever a `task_completed`, `task_failed`, or `usage_reported` event is processed. When a task's usage is updated, the parent plan's usage is recalculated from scratch (re-sum all tasks for that planId).

**Authoritativeness:** Best-effort — incomplete if `usage_reported` events are late or missing.

#### D. `handoffSummary` and `outputSummary` on tasks (new task-level fields — requires new protocol events)

```typescript
// Added to CockpitProjectedTaskState:
handoffSummary?: string | null;    // truncated content of handoff.md
outputSummary?: string | null;     // summary from output.jsonl (last N lines)
```

**How populated:** Requires two new protocol event types (see [Section 8](#8-new-event-type-specifications)):
- `task_handoff_seen` — daemon reads `tasks/<id>-<slug>/handoff.md` after task completion and emits this event.
- `task_output_seen` — daemon reads the last N lines of `tasks/<id>-<slug>/output.jsonl` (or a dedicated summary file) and emits this event.

**Authoritativeness:** Best-effort — content is truncated at the daemon before emission per telemetry settings.

#### E. `progressHistory` on tasks (new task-level field — projection change only)

```typescript
// Added to CockpitProjectedTaskState:
progressHistory?: Array<{
  progressStatus: 'running' | 'done' | 'error';
  step?: string | null;
  progressVisible: boolean;
  progressAt: string;
}>;  // Capped at 50 entries (ring buffer); latest entry is also in latestProgress
```

**How populated:** `foldEventsIntoState()` appends to this array when handling `task_progressed`. The array is bounded (50 entries by default; older entries are dropped). No new event type needed.

**Authoritativeness:** Best-effort — steps are omitted when `telemetry.progressText = false`.

#### F. `projectUsage` aggregate (new top-level field)

```typescript
// Added to CockpitProjectedProjectState:
projectUsage: {
  inputTokens: number;
  outputTokens: number;
};
```

**How populated:** Recalculated in `foldEventsIntoState()` by summing all tasks' `usage` fields whenever any task's usage changes.

---

### 6.3 Derived / Computed Fields (not stored)

These values are computed at UI render time from the projected state. They are **not stored** in the JSONB blob.

| Value | Computation | Where computed |
|---|---|---|
| Device staleness | `now - deviceObs.lastHeartbeat.occurredAt > 60s` | UI render |
| Task elapsed time | `now - task.startedAt` (for running/retrying tasks) | UI render |
| Tasks by plan | `tasks.filter(t => t.planId === planId)` | UI render |
| Live plans | `plans.filter(p => p.source === 'live')` | UI render |
| Archive plans | `plans.filter(p => p.source === 'archive')` | UI render |
| Estimated cost | `usage.inputTokens/1000 * priceIn + usage.outputTokens/1000 * priceOut` | UI render, per-model pricing table |
| Fleet totals | Aggregated across all project projected states in the DB | `/cockpit` RSC server component |

---

### 6.4 Authoritative vs Best-Effort Values

| Category | Value | Authoritative? | Reason |
|---|---|---|---|
| Project metadata | `projectId`, `projectName`, `projectSlug` | ✅ Authoritative | From `project_seen` event; signed by daemon |
| Device identity | `deviceId`, `deviceName`, `pairedAt` | ✅ Authoritative | From DB `cockpit_paired_devices` |
| Event ingestion | `cockpit_raw_events` sequence, `eventId` | ✅ Authoritative | Unique index enforces uniqueness |
| Task lifecycle | `task.status` transitions (seen/started/done/failed) | ✅ Authoritative | From daemon reading `.pi/tasks/state.json` + `status.json` |
| Task duration | `task.durationMs` | ✅ Authoritative | From `.pi/tasks/<id>/status.json` |
| Task retries | `task.retries` | ✅ Authoritative | From `status.json` |
| Task error | `task.error` | ✅ Authoritative | From `status.json` |
| Token usage | `task.usage` | ⚠ Best-effort | Reported by the agent runtime; not verified externally |
| Progress steps | `task.latestProgress.step` | ⚠ Best-effort | May be suppressed by `telemetry.progressText=false` |
| Worktree state | `worktree.isDirty`, `branch`, etc. | ⚠ Best-effort | From 60s-poll git commands; up to 60s stale |
| Ahead/behind counts | `worktree.aheadCount`, `behindCount` | ⚠ Best-effort | Only computed if upstream branch exists |
| Head SHA | `worktree.headSha` | ⚠ Best-effort | Only when `telemetry.git=full` |
| Daemon health | `state.dirty`, `device.stale` | ⚠ Best-effort | Inferred from heartbeat age; network lag can cause false offline |
| Active plan | `lastHeartbeat.activePlanId` | ⚠ Best-effort | From last heartbeat only |
| Plan-level usage | `plan.usage` (new) | ⚠ Best-effort | Summed from per-task best-effort values |
| Estimated cost | Computed from token counts | ⚠ Best-effort | External pricing table; billing discounts not reflected |
| Handoff summary | `task.handoffSummary` (new) | ⚠ Best-effort | Requires new event; content truncated |
| Archive plan list | `plans.filter(source='archive')` | ⚠ Best-effort | Archives processed once; re-emission if byte cursor resets |

**Rule of thumb for the UI:**
- ✅ Authoritative values can be displayed as facts.
- ⚠ Best-effort values should carry a tooltip, a "~" prefix (for numbers), or a timestamp showing when the observation was made.

---

## 7. Protocol Event Mapping

### 7.1 Existing Events — Coverage Map

| UI requirement | Existing event(s) | Status |
|---|---|---|
| Project name, slug, local root path | `project_seen.payload.{projectName, localRootPath}` | ✅ Covered |
| Daemon heartbeat (version, active plan, task count) | `project_heartbeat.payload` | ✅ Covered |
| Per-device heartbeat (NEW: devices map) | `project_heartbeat` (deviceId is in event metadata) | ✅ Covered — projection change only |
| Worktree inventory (branch, HEAD, dirty, ahead/behind) | `worktree_seen`, `worktree_changed` | ✅ Covered |
| Plan metadata (title, overview, task count) | `plan_seen` | ✅ Covered |
| Plan source (live vs archive) | `plan_seen.source` (on event metadata) | ✅ Covered — projection change only |
| Task metadata (name, slug, deps, execution, description) | `task_seen` | ✅ Covered |
| Task started (status=running, startedAt, worktreeId) | `task_started` | ✅ Covered |
| Task latest progress step | `task_progressed` | ✅ Covered |
| Task progress history (NEW: ring buffer) | `task_progressed` (multiple events) | ✅ Covered — projection change only |
| Task completed (status, duration, retries, usage) | `task_completed` | ✅ Covered |
| Task failed (status, error, duration, retries, usage) | `task_failed` | ✅ Covered |
| Token usage per task | `usage_reported`, `task_completed.payload.usage`, `task_failed.payload.usage` | ✅ Covered |
| Plan-level usage aggregate (NEW) | Derived from `task_completed`/`task_failed`/`usage_reported` | ✅ Covered — projection change only |
| Project-level usage aggregate (NEW) | Derived from all task usage events | ✅ Covered — projection change only |
| Task source (live/archive on task) | `task_seen.source` (on event metadata) | ✅ Covered — projection change only |
| `retrying` status visibility | `task_seen`/`task_started` — `retrying` is in `taskLifecycleStatusSchema` | ✅ Covered — UI-only fix |
| Handover / output summary | **No existing event** | ❌ Gap — requires new event |
| Agent runtime (elapsed for running tasks) | `task.startedAt` (compute `now - startedAt` in UI) | ✅ Covered — UI-only |
| Engine / model / profile breakdown | `task.execution` fields (already in projected state) | ✅ Covered — UI-only |
| Estimated cost | Token counts × pricing table | ✅ Covered — UI-only, best-effort |

### 7.2 Gaps — New Events Required

| Gap | New event required | Rationale |
|---|---|---|
| Handover summary (`handoff.md`) | `task_handoff_seen` | Daemon must read `.pi/tasks/<id>-<slug>/handoff.md` post-completion and emit content. No existing event covers file content. |
| Output summary (`output.jsonl` tail) | `task_output_seen` | Daemon must read the last N lines of `.pi/tasks/<id>-<slug>/output.jsonl` (or a dedicated `output-summary.md`) and emit a truncated excerpt. |

---

## 8. New Event Type Specifications

Both new events follow the same metadata envelope as existing events (see `eventMetadataSchema` in `packages/cockpit-protocol/src/events.ts`).

### `task_handoff_seen`

Emitted by the pi-fleet adapter after a task transitions to `done` and the daemon observes `tasks/<id>-<slug>/handoff.md`.

```typescript
export const taskHandoffSeenEventSchema = buildEventSchema('task_handoff_seen', {
  planId: identifierSchema,
  taskId: identifierSchema,
  taskName: shortTextSchema,
  // Truncated markdown content of handoff.md.
  // Only emitted if telemetry.progressText !== false (reuse existing gate).
  // Server-side and daemon-side MUST enforce maxLength = 8000 chars.
  handoffContent: z.string().max(8_000).nullable().optional(),
  // SHA-256 hex of the full file (for deduplication — re-emit only if hash changes)
  contentHash: z.string().regex(/^[0-9a-f]{64}$/i).nullable().optional(),
});
```

**Emission logic in daemon (`pi-fleet.ts`):**
1. After `task_completed` is emitted for a task, check for `tasks/<id>-<slug>/handoff.md`.
2. Compute SHA-256 of the file content.
3. Check `observed_files` in SQLite for key `handoff:<taskId>` — compare stored hash.
4. If hash differs (or no stored hash), emit `task_handoff_seen` and update the stored hash.

**Projection handling in `foldEventsIntoState()`:**
```typescript
case 'task_handoff_seen': {
  const existing = s.tasks[event.payload.taskId];
  if (existing) {
    s = { ...s, tasks: { ...s.tasks, [event.payload.taskId]: {
      ...existing,
      handoffSummary: event.payload.handoffContent ?? null,
    }}};
  }
  break;
}
```

---

### `task_output_seen`

Emitted by the pi-fleet adapter when a task's `output.jsonl` has settled (task is `done` or `failed`).

```typescript
export const taskOutputSeenEventSchema = buildEventSchema('task_output_seen', {
  planId: identifierSchema,
  taskId: identifierSchema,
  taskName: shortTextSchema,
  // Last N lines of output.jsonl, concatenated (max 4000 chars).
  // Only emitted if telemetry.progressText !== false.
  outputTail: z.string().max(4_000).nullable().optional(),
  contentHash: z.string().regex(/^[0-9a-f]{64}$/i).nullable().optional(),
});
```

> **Note:** If a project stores structured output in a `output-summary.md` instead of raw JSONL, the event payload would carry that content verbatim. The event type is the same; the emission logic differs per file format. Treat `outputTail` as opaque text.

**Projection handling:**
```typescript
case 'task_output_seen': {
  const existing = s.tasks[event.payload.taskId];
  if (existing) {
    s = { ...s, tasks: { ...s.tasks, [event.payload.taskId]: {
      ...existing,
      outputSummary: event.payload.outputTail ?? null,
    }}};
  }
  break;
}
```

---

## 9. Wire & State Examples

### 9.1 Extended `CockpitProjectedProjectState` (schema version 2)

```json
{
  "schemaVersion": 2,
  "projectId": "my-saas",
  "projectName": "My SaaS",
  "projectSlug": "my-saas",
  "localRootPath": "projects/my-saas",
  "telemetry": {
    "git": "full",
    "worktreePath": "relative",
    "repoRootPath": "basename",
    "progressText": true
  },
  "dirty": false,
  "lastEvent": {
    "eventId": "evt_1a2b3c",
    "sequence": 1042,
    "occurredAt": "2026-05-07T19:30:01Z",
    "type": "task_progressed",
    "deviceId": "dev_aabbcc",
    "sessionId": "sess_xyz",
    "runId": null,
    "source": "live"
  },
  "lastHeartbeat": {
    "occurredAt": "2026-05-07T19:29:55Z",
    "daemonVersion": "1.2.0",
    "activePlanId": "implement-user-auth",
    "activeTaskCount": 2
  },
  "devices": {
    "dev_aabbcc": {
      "deviceId": "dev_aabbcc",
      "firstSeenAt": "2026-05-07T09:00:00Z",
      "lastEventAt": "2026-05-07T19:30:01Z",
      "lastHeartbeat": {
        "occurredAt": "2026-05-07T19:29:55Z",
        "daemonVersion": "1.2.0",
        "activePlanId": "implement-user-auth",
        "activeTaskCount": 2
      }
    }
  },
  "projectUsage": {
    "inputTokens": 145000,
    "outputTokens": 38000
  },
  "worktrees": {
    "wt_f3a1b9d002e41c8a": {
      "worktreeId": "wt_f3a1b9d002e41c8a",
      "worktreePath": "projects/my-saas",
      "repoRootPath": "my-saas",
      "branch": "feat/user-auth",
      "headSha": "a1b2c3d",
      "isDirty": true,
      "untrackedCount": 2,
      "aheadCount": 4,
      "behindCount": 0,
      "lastObservedAt": "2026-05-07T19:20:00Z"
    }
  },
  "plans": {
    "implement-user-auth": {
      "planId": "implement-user-auth",
      "title": "Implement user auth",
      "overview": "JWT-based authentication with refresh tokens and device management.",
      "sourcePlanPath": ".pi/tasks/plan.md",
      "splitAt": null,
      "taskCount": 4,
      "tasks": [
        { "taskId": "001-setup-jwt", "slug": "setup-jwt", "name": "Set up JWT library", "dependsOn": [], "engine": "claude", "model": "sonnet" },
        { "taskId": "002-login-endpoint", "slug": "login-endpoint", "name": "Build login endpoint", "dependsOn": ["001-setup-jwt"], "engine": "claude", "model": "sonnet" }
      ],
      "lastSeenAt": "2026-05-07T18:00:00Z",
      "source": "live",
      "usage": { "inputTokens": 95000, "outputTokens": 24000 }
    },
    "initial-schema-design": {
      "planId": "initial-schema-design",
      "title": "Initial schema design",
      "overview": "Design and migrate the initial PostgreSQL schema.",
      "sourcePlanPath": ".pi/archive/001/plan.md",
      "splitAt": null,
      "taskCount": 3,
      "tasks": [],
      "lastSeenAt": "2026-05-06T14:00:00Z",
      "source": "archive",
      "usage": { "inputTokens": 50000, "outputTokens": 14000 }
    }
  },
  "tasks": {
    "001-setup-jwt": {
      "taskId": "001-setup-jwt",
      "planId": "implement-user-auth",
      "taskName": "Set up JWT library",
      "slug": "setup-jwt",
      "status": "done",
      "dependsOn": [],
      "description": "Install jsonwebtoken, configure RS256 signing.",
      "execution": {
        "agentRole": "implementer",
        "engine": "claude",
        "provider": "anthropic",
        "model": "sonnet",
        "profile": "deep",
        "thinking": "high"
      },
      "startedAt": "2026-05-07T18:05:00Z",
      "completedAt": "2026-05-07T18:12:00Z",
      "durationMs": 420000,
      "retries": 0,
      "error": null,
      "usage": { "inputTokens": 18000, "outputTokens": 5500 },
      "latestProgress": {
        "progressStatus": "done",
        "step": "JWT library configured; RS256 key pair generated and stored in env.",
        "progressVisible": true,
        "progressAt": "2026-05-07T18:12:00Z",
        "latestProgressAt": "2026-05-07T18:12:00Z"
      },
      "progressHistory": [
        { "progressStatus": "running", "step": "Installing jsonwebtoken@9", "progressVisible": true, "progressAt": "2026-05-07T18:05:30Z" },
        { "progressStatus": "running", "step": "Generating RS256 key pair", "progressVisible": true, "progressAt": "2026-05-07T18:10:00Z" },
        { "progressStatus": "done",    "step": "JWT library configured; RS256 key pair generated and stored in env.", "progressVisible": true, "progressAt": "2026-05-07T18:12:00Z" }
      ],
      "source": "live",
      "handoffSummary": "## Changed files\n- `src/lib/jwt.ts` (new)\n- `.env.example` updated with JWT_PRIVATE_KEY, JWT_PUBLIC_KEY\n\n## Known limitations\n- Key rotation not yet implemented\n- No token blacklist (stateless)",
      "outputSummary": null
    },
    "002-login-endpoint": {
      "taskId": "002-login-endpoint",
      "planId": "implement-user-auth",
      "taskName": "Build login endpoint",
      "slug": "login-endpoint",
      "status": "running",
      "dependsOn": ["001-setup-jwt"],
      "description": "POST /api/auth/login returning JWT + refresh token.",
      "execution": {
        "agentRole": "implementer",
        "engine": "claude",
        "provider": "anthropic",
        "model": "sonnet",
        "profile": "deep",
        "thinking": "high"
      },
      "startedAt": "2026-05-07T18:14:00Z",
      "completedAt": null,
      "durationMs": null,
      "retries": 0,
      "error": null,
      "usage": { "inputTokens": 12000, "outputTokens": 3200 },
      "latestProgress": {
        "progressStatus": "running",
        "step": "Writing Zod schema for login request body",
        "progressVisible": true,
        "progressAt": "2026-05-07T19:29:50Z",
        "latestProgressAt": "2026-05-07T19:29:50Z"
      },
      "progressHistory": [
        { "progressStatus": "running", "step": "Creating route handler at src/app/api/auth/login/route.ts", "progressVisible": true, "progressAt": "2026-05-07T18:14:30Z" },
        { "progressStatus": "running", "step": "Writing Zod schema for login request body", "progressVisible": true, "progressAt": "2026-05-07T19:29:50Z" }
      ],
      "source": "live",
      "handoffSummary": null,
      "outputSummary": null
    }
  }
}
```

### 9.2 Wire example: `task_handoff_seen` event

```json
{
  "schemaVersion": 1,
  "eventId": "evt_handoff_001",
  "sequence": 1055,
  "occurredAt": "2026-05-07T18:12:05Z",
  "source": "live",
  "projectId": "my-saas",
  "deviceId": "dev_aabbcc",
  "sessionId": "sess_xyz",
  "runId": null,
  "type": "task_handoff_seen",
  "payload": {
    "planId": "implement-user-auth",
    "taskId": "001-setup-jwt",
    "taskName": "Set up JWT library",
    "handoffContent": "## Changed files\n- `src/lib/jwt.ts` (new)\n- `.env.example` updated with JWT_PRIVATE_KEY, JWT_PUBLIC_KEY\n\n## Known limitations\n- Key rotation not yet implemented\n- No token blacklist (stateless)",
    "contentHash": "a3f1c9e2b4d87610f5e3a2b1c9d8f7e601234567890abcdef01234567890abcd"
  }
}
```

### 9.3 Wire example: `project_heartbeat` (multi-device, existing event)

```json
{
  "schemaVersion": 1,
  "eventId": "evt_hb_002",
  "sequence": 1050,
  "occurredAt": "2026-05-07T19:29:55Z",
  "source": "live",
  "projectId": "my-saas",
  "deviceId": "dev_aabbcc",
  "sessionId": "sess_xyz",
  "runId": null,
  "type": "project_heartbeat",
  "payload": {
    "daemonVersion": "1.2.0",
    "activePlanId": "implement-user-auth",
    "activeTaskCount": 2
  }
}
```

When folded into state, the projection now:
1. Updates `state.lastHeartbeat` (existing behaviour).
2. Also updates `state.devices["dev_aabbcc"].lastHeartbeat` (new behaviour).

### 9.4 Fleet health strip — computed from list endpoint

```json
{
  "totalProjects": 3,
  "projectsOnline": 2,
  "projectsOffline": 1,
  "totalRunningAgents": 4,
  "totalFailedTasks": 1,
  "devicesOnline": 2,
  "computedAt": "2026-05-07T19:30:05Z"
}
```

This is **not a new API endpoint** — it is computed client-side from the array of `{ project, state }` tuples returned by the existing list query. No schema change required.

---

## 10. Stale / Offline Rules

### Device-level staleness

A device is **online** if: `now - deviceObs.lastHeartbeat.occurredAt ≤ HEARTBEAT_STALE_MS` (currently 60 s).

A device is **stale** (warning) if: `60s < now - lastHeartbeat ≤ 120s`.

A device is **offline** if: `now - lastHeartbeat > 120s` OR no heartbeat ever received.

These thresholds use the same `HEARTBEAT_STALE_MS` constant in `packages/cockpit-store/src/projection.ts`. Recommended: introduce `HEARTBEAT_WARN_MS = 2 * HEARTBEAT_STALE_MS`.

| State | Indicator | Condition |
|---|---|---|
| **online** | Green dot | `age ≤ 60s` |
| **stale** | Yellow dot | `60s < age ≤ 120s` |
| **offline** | Red dot (hollow) | `age > 120s` OR no heartbeat |
| **never seen** | Grey dot | `deviceObs.lastHeartbeat === null` |

### Project-level staleness

`state.dirty` is the existing project-level flag. Its meaning is unchanged:
- `true` = no heartbeat or event within `HEARTBEAT_STALE_MS` from ANY device.
- `false` = at least one device has been active within the window.

In the new model, **project-level health** is the aggregate of per-device states:
- Project is **healthy** if ≥1 device is online AND `state.dirty = false`.
- Project is **degraded** if all devices are stale (yellow) OR `state.dirty = true`.
- Project is **offline** if all devices are offline AND `state.dirty = true`.

### Projection lag indicator

`cockpit_projects.projectionDirty = true` signals that raw events exist in the DB that have not yet been folded into the projected state. The current UI shows a static "Projection: Pending update" badge.

**Proposed behavior:** When `projectionDirty = true`, show a spinner icon next to the health indicator and auto-refresh after 4 s (the worst-case projector debounce window of 3 s + 1 s poll interval). If still dirty after 3 retries, show a "Refresh" button.

### Plan staleness

A live plan is **active** if its `planId` matches `state.lastHeartbeat.activePlanId`.

A live plan is **dormant** if it exists in the `plans` map with `source = 'live'` but is not the `activePlanId` and has no running tasks.

An archived plan is never stale — it is always read-only historical data.

### Task staleness rules

| Task status | Running time threshold | UI treatment |
|---|---|---|
| `running` | `> 30 min` | Add a "Long running" badge |
| `running` | `> 2 hours` | Show warning indicator |
| `retrying` | Any | Show retry count badge |
| `failed` | Any | Show in failed section until plan completes |
| `done` | Any | Move to collapsed done section |
| `pending` | Blocked by failed dep | Show "blocked" indicator |

---

## 11. Drilldown Model

### Current fleet drilldown (live projects)

```
/cockpit
  Fleet health strip
  Project card grid ──────────────────────────────────────────────┐
                                                                    ↓
/cockpit/[projectId]                                      ← project overview
  Per-device daemon row
  Live activity (running/retrying/failed tasks with plan links)
  Current plan summary ──────────────────────────────────────────┐
                                                                    ↓
/cockpit/[projectId]/plans/[planId]                       ← plan drilldown
  Task list (running first, then failed, then done, then pending)
  Task row click ────────────────────────────────────────────────┐
                                                                    ↓
  Task detail panel (inline expand or flyout)              ← task detail
    execution metadata · progress history · handoff summary
```

### Archived fleet drilldown (historical)

```
/cockpit/[projectId]
  Archived plans entry point ──────────────────────────────────┐
                                                                  ↓
/cockpit/[projectId]/archive                            ← archive browser
  Archive plan list (newest first)
  Archive plan card click ─────────────────────────────────────┐
                                                                  ↓
/cockpit/[projectId]/plans/[planId]                     ← same plan drilldown
  (Plan shows source=ARCHIVE badge; all tasks historical)
  Task row click ──────────────────────────────────────────────┐
                                                                  ↓
  Task detail panel                                        ← same task detail
    execution metadata · full progress history · handoff summary
```

### Device management drilldown

```
/cockpit  (navigation: "Devices" link in nav)
  ↓
/cockpit/devices
  Device list
  Device row → inline expand or flyout
    pairedAt · active sessions · active tokens · last seen
    [Revoke] button → calls revokeDeviceAction(deviceId)
  [+ Pair new device] → redirects to /cockpit/devices/approve
```

### Data flow contract for each level

| Route | Data fetched | Method |
|---|---|---|
| `/cockpit` | `listProjects()` + `getProjectedProjectState(id)` for each | RSC, DB reads |
| `/cockpit/[projectId]` | `getProjectRecord(projectId)` + `getProjectedProjectState(projectId)` | RSC, DB reads |
| `/cockpit/[projectId]/plans/[planId]` | Same as project overview — plan + tasks extracted from `state.plans[planId]` and `state.tasks.filter(t => t.planId === planId)` | Same RSC data, client-side filter |
| `/cockpit/[projectId]/archive` | Same projected state — filter `state.plans.filter(source='archive')` | Same RSC data, client-side filter |
| `/cockpit/devices` | `listPairedDevicesAction()` (new server action) + `listActiveSessionsAction()` (new) | Server actions, DB reads |

> **Note:** The plan drilldown and archive browser require **no new DB queries** and **no new API routes**. They read the same projected state JSON already fetched for the project overview. The `planId` from the URL is used to filter client-side. This avoids N+1 queries.

---

## 12. Implementation Priorities

The following ordered list prioritizes changes by user value and dependencies:

### Phase 1 — Projection changes only (no new protocol events, no new DB queries)

These changes only touch `foldEventsIntoState()`, `CockpitProjectedProjectState`, and the UI:

1. **Add `source` to plans and tasks** — enables archive/live distinction; prerequisite for archive browser.
2. **Add `devices` map** — enables per-device health display; uses existing heartbeat events.
3. **Add plan-level `usage` aggregate** — enables cost/token rollup per plan; uses existing task events.
4. **Add project-level `projectUsage` aggregate** — same.
5. **Add `progressHistory` ring buffer** — enables timeline view on task detail; uses existing `task_progressed` events.
6. Bump `schemaVersion` to 2; update Zod schemas in `packages/pm/src/db/schema.ts`.

### Phase 2 — UI changes using Phase 1 data

7. **Fleet health strip** on `/cockpit` (computed from existing list data).
8. **Enhanced project card** — add plan name, token count, per-device dots.
9. **Per-device section** on project overview page.
10. **Include `retrying` in active-agents section** (one-line filter change).
11. **Plan drilldown route** `/cockpit/[projectId]/plans/[planId]`.
12. **Archive browser** `/cockpit/[projectId]/archive` + archive entry point on project overview.
13. **Agent runtime + engine/model breakdown** section on project overview.
14. **Cost summary section** on project overview and plan drilldown.

### Phase 3 — New protocol events (requires daemon + protocol changes)

15. **`task_handoff_seen` event** — add Zod schema, emit in pi-fleet adapter, add projection case.
16. **`task_output_seen` event** — same.
17. Bump `cockpitProtocolSchemaVersion` to 2 (coordinated daemon + server release).

### Phase 4 — Real-time push (separate concern, orthogonal to this model)

18. **SSE endpoint** or **WebSocket from server to browser** for live projection updates.
19. Auto-refresh on `projectionDirty` with spinner.
20. **Device management page** `/cockpit/devices`.

---

_End of document. For implementation details and file paths, see `docs/cockpit-followup-audit.md`._
