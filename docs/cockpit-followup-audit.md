# Cockpit Follow-up Audit

_Generated 2026-05-07 by scout agent — read-only reconnaissance_

---

## 1. Event Lifecycle (end-to-end)

```
Daemon process                        Server (Next.js custom-server.js)
─────────────────────────────────     ──────────────────────────────────────────────
reconcileAll()                         CockpitWsServer (cockpit-ws.ts)
  ├─ scanProjectGitWorktrees()          │  onUpgrade → Bearer token lookup (SHA-256)
  │    git worktree list --porcelain    │  onConnection → server_hello
  │    git status --porcelain           │  onMessage:
  │    git rev-list --count             │    client_hello   → createSession()
  │    ──▶ worktree_seen /              │    event_batch    → insertEventBatch()
  │         worktree_changed            │      ├─ INSERT cockpit_raw_events ON CONFLICT DO NOTHING
  ├─ scanProjectPiFleet()               │      ├─ INSERT/UPDATE cockpit_projects (dirty=true)
  │    .pi/tasks/plan-summary.json      │      ├─ INSERT cockpit_projected_project_state (dirty=true)
  │    .pi/tasks/state.json             │      └─ returns EventBatchAck
  │    .pi/tasks/<id>-<slug>/           │    client_heartbeat → touchSession()
  │      progress.jsonl (tailed)        │    server_ping (server → client every 30 s)
  │    .pi/archive/index.json           │
  │    ──▶ plan_seen, task_seen,        │  CockpitProjector (projector.ts)  [poll every 1 s]
  │         task_started,               │    listDirtyProjects(debounce=3s)
  │         task_progressed,            │    for each dirty project:
  │         task_completed,             │      getProjectedProjectStateRecord()
  │         task_failed,                │      listRawEventsSince(afterSequence)
  │         usage_reported              │      foldEventsIntoState()  [pure]
  ├─ project_seen                       │      upsertProjectedProjectState()
  └─ project_heartbeat                  │        → cockpit_projected_project_state.dirty = false
                                        │        → cockpit_projects.projectionDirty = false
DaemonTransport (websocket.ts)
  outbox → event_batch (≤50 events)    UI (Next.js RSC pages — force-dynamic)
  ← event_batch_ack                      listProjects() + getProjectedProjectState()
  ← server_hello                         reads cockpit_projected_project_state.state JSONB
  heartbeat client_heartbeat every 30s   manual RefreshButton triggers router.refresh()
  reconnect: exp backoff 1s–60s
```

### Key sequence numbers

| Location | Meaning |
|---|---|
| `cockpit_projects.latest_event_sequence` | Highest raw event sequence _received_ for this project |
| `cockpit_projected_project_state.latest_event_sequence` | Highest sequence already _projected_ into the snapshot |
| `daemon_state.next_sequence` (SQLite) | Next sequence the daemon will assign to a queued event |
| `daemon_state.last_acked_sequence` (SQLite) | Highest sequence server has acked — outbox reads `> last_acked_sequence` |

The gap between `cockpit_projects.latest_event_sequence` and `cockpit_projected_project_state.latest_event_sequence` is the "projection lag" — events waiting for the debounce + projector cycle.

---

## 2. Projection Checkpoints

### Where `dirty` is set

| Trigger | What changes |
|---|---|
| `insertEventBatch()` in repository.ts | `cockpit_projects.projectionDirty = true`, `dirtyMarkedAt = NOW()` |
| `insertEventBatch()` | `cockpit_projected_project_state.dirty = true` |
| `markProjectDirty()` (manual) | same as above |

### Debounce window
- `CockpitProjector.listDirtyProjects(debounceMs=3000)` only returns projects whose `dirtyMarkedAt ≤ NOW() - 3000 ms`.
- Polling interval is 1 s, so worst-case lag is ~4 s after last event arrival.

### Recovery path (backlog re-fold)
In `projectOne()` there is a recovery for early production builds that accidentally set a high `latestEventSequence` on an empty snapshot:

```ts
const shouldRecoverSkippedBacklog =
  Boolean(record?.dirty) &&
  Boolean(currentState.lastEvent) &&
  !hasProjectedDomainState &&
  (record?.latestEventSequence ?? 0) > 0;

const afterSequence = shouldRecoverSkippedBacklog ? 0 : (record?.latestEventSequence ?? 0);
```

If triggered, the projector re-folds all events from sequence 0. This is a one-time correction, not a normal path.

### `state.dirty` vs `cockpit_projects.projectionDirty`

These are **two different "dirty" signals**:

| Field | What it means | Who reads it |
|---|---|---|
| `CockpitProjectedProjectState.dirty` (inside the JSONB blob) | Daemon heartbeat is stale (>60 s since last heartbeat or last event) | UI `HealthIndicator`, `getDaemonHealth()` |
| `cockpit_projected_project_state.dirty` (DB column) | Raw events exist that have not been projected yet | `CockpitProjector` (decides when to re-project) |
| `cockpit_projects.projectionDirty` | Same as above, at the project level; used for projector polling | `listDirtyProjects()` |

---

## 3. UI State Shape

The UI exclusively reads `CockpitProjectedProjectState` (JSONB in `cockpit_projected_project_state.state`):

```typescript
interface CockpitProjectedProjectState {
  schemaVersion: number;          // always cockpitProtocolSchemaVersion = 1
  projectId: string;
  projectName?: string | null;
  projectSlug?: string | null;
  localRootPath?: string | null;
  telemetry?: TelemetryProfile | null;
  dirty: boolean;                 // daemon staleness (not projection staleness!)
  lastEvent?: {                   // metadata of most-recent raw event
    eventId, sequence, occurredAt, type, deviceId, sessionId?, runId?, source
  } | null;
  lastHeartbeat?: {               // most-recent project_heartbeat payload
    occurredAt, daemonVersion?, activePlanId?, activeTaskCount
  } | null;
  worktrees: Record<worktreeId, WorktreeSnapshot>;
  plans: Record<planId, CockpitProjectedPlanState>;
  tasks: Record<taskId, CockpitProjectedTaskState>;
}
```

### What the UI renders

| Component | Source fields |
|---|---|
| `HealthIndicator` / `getDaemonHealth()` | `state.dirty`, `state.lastHeartbeat != null` |
| Daemon status card | `lastHeartbeat.{occurredAt, daemonVersion, activeTaskCount, activePlanId}` |
| Active agents section | tasks where `status === 'running'` |
| Failed tasks section | tasks where `status === 'failed'` |
| Worktrees section | `state.worktrees` values |
| Plans section | `state.plans` values |
| Other tasks section | tasks that are neither running nor failed (pending/done/retrying) |
| Project card summary | runningCount, failedCount, dirtyWorktreeCount (isDirty || aheadCount>0) |

### Current UI gaps

1. **No real-time push** — The browser never receives server-sent events or WebSocket messages. Data freshness depends entirely on a manual `RefreshButton` that calls `router.refresh()`. There is no polling loop or live stream.

2. **Tasks are plan-agnostic in the task view** — `tasks` is a flat `Record<taskId, ...>` across all plans. The UI groups tasks by status (running / failed / other) but not by plan. There is no drill-down to view all tasks for a specific plan.

3. **`retrying` status is invisible in active agents** — `TasksSection` for running agents filters `status === 'running'`; `retrying` tasks appear only in the "other tasks" section.

4. **No usage aggregation** — Token usage is shown per-task only. No total tokens per plan or per project.

5. **No archived plan history view** — The `source` field on events (`live` vs `archive`) is stored but never surfaced in the UI. Archived plans show up in the flat `plans` map but with no distinction.

6. **No worktree detail** — `WorktreeSummary` lists worktrees but there is no drill-down page for a specific worktree or git diff info.

7. **`RefreshButton` is the only auto-update mechanism** — There is no background polling, `EventSource`, or `useInterval` client component.

8. **No device management UI on the overview** — Devices can only be approved at `/cockpit/devices/approve`. There is no page listing all paired devices or tokens, and no "revoke device" button (only a server action `revokeDeviceAction`).

9. **No project search/filter** — The overview grid shows all projects sorted (active first, then alphabetical) but there is no search box.

10. **Projection lag is not surfaced** — When `cockpit_projects.projectionDirty = true` the detail page shows a "Projection: Pending update" stat item, but there is no spinner or auto-refresh.

---

## 4. Device-Token Model

### Pairing flow (3 steps)

```
Daemon CLI                                  Server API                    Browser
──────────────────────────────────────      ──────────────────────────    ─────────────────────
cockpit-daemon login --device-name X
  POST /api/cockpit/devices/pair            createDevicePairing()         
  { deviceId, deviceName, instanceName }      deviceCodeHash=SHA256(deviceCode)
  ← { deviceCode, userCode, verificationUri,  userCode=XXXXX-YYYYY (10-char)
      expiresIn }                             expiresAt=+5min
                                              status='pending'
                                                                          /cockpit/devices/approve
                                                                          ?userCode=XXXXX-YYYYY
                                            approveDevicePairing()
                                              status → 'approved'
  poll POST /api/cockpit/devices/exchange   exchangeDevicePairing()
  { deviceCode, deviceId }                    INSERT cockpit_paired_devices
                                              INSERT cockpit_device_tokens
  ← { status:'approved', token, deviceId }      tokenHash=SHA256(rawToken)
                                              status → 'exchanged'
  saves credential to ~/.config/clean.dev/
    cockpit-daemon/config.json
    { deviceId, deviceName, token, issuedAt }
```

### Token storage

| Value | Stored where | Format |
|---|---|---|
| `rawToken` | Returned once by exchange endpoint; saved in daemon config.json | 64 hex chars (32 random bytes) |
| `tokenHash` | `cockpit_device_tokens.token_hash` | SHA-256 hex of rawToken |
| WS auth | `Authorization: Bearer <rawToken>` | Bearer scheme |

### Token lifecycle
- **Active**: `revokedAt IS NULL AND (expiresAt IS NULL OR expiresAt > now)`
- **Revoked**: `revokeDevice()` sets `cockpit_device_tokens.revokedAt` + ends all active sessions
- **Looked up on each WS upgrade**: `findActiveTokenByHash()` also updates `lastUsedAt`
- **No built-in expiry rotation** — tokens are perpetual unless explicitly revoked or given an `expiresAt`

### Schema tables

| Table | Purpose |
|---|---|
| `cockpit_paired_devices` | One row per daemon device (deviceId primary key) |
| `cockpit_device_tokens` | One or more tokens per device (multiple can be active) |
| `cockpit_device_pairings` | Temporary pairing request (expires after 5 min, status: pending→approved→exchanged) |
| `cockpit_device_sessions` | One row per daemon WebSocket session (startedAt, lastSeenAt, endedAt, lastAckedSequence) |

---

## 5. Git Adapter Capabilities

Located in `apps/cockpit-daemon/src/adapters/git.ts`.

### What it does

| Git command | Purpose | Event emitted |
|---|---|---|
| `git worktree list --porcelain` | List all worktrees for the repo | (raw data) |
| `git status --porcelain --untracked-files=all` | Detect dirty / untracked files | `isDirty`, `untrackedCount` |
| `git rev-list --left-right --count @{upstream}...HEAD` | Divergence from upstream | `aheadCount`, `behindCount` |
| `git rev-parse --path-format=absolute --git-common-dir` | Resolve repo root | `repoRootPath` |
| `git rev-parse --abbrev-ref --symbolic-full-name @{upstream}` | Check if upstream exists | (guard for above) |

### Event emission logic

1. First time a worktree is seen → `worktree_seen`
2. Snapshot hash changed (any field) → `worktree_changed` (includes `previousHeadSha` if telemetry=full)
3. No change → no event (deduplication via `observed_worktrees` in SQLite)

### Telemetry filtering (per `MappedProject.telemetry`)

| Telemetry field | Controls |
|---|---|
| `worktreePath`: off/basename/relative/full | What path info appears in `WorktreeSnapshot.worktreePath` |
| `repoRootPath`: off/basename/relative/full | What path info appears in `WorktreeSnapshot.repoRootPath` |
| `git`: off/branch-only/full | Whether branch + head SHA + ahead/behind are included |

### Limitations

- **No file-system watching** — the git adapter is polled every 60 s (`RECONCILE_INTERVAL_MS`), not inotify/FSEvents driven. Changes between reconcile windows are not immediately visible.
- **No submodule support** — `git worktree list` only lists the main repo and linked worktrees; submodules are not scanned separately.
- **Detached HEAD** — `branch` is `null` for detached-HEAD worktrees; `headSha` is available if telemetry=full.
- **GIT_OPTIONAL_LOCKS=0** — read-only safety env is set correctly.
- **worktreeId** is derived as `wt_<SHA256(projectId:absolutePath)[0:16]>` — stable as long as the path doesn't change.

---

## 6. Pi-Fleet Adapter Capabilities

Located in `apps/cockpit-daemon/src/adapters/pi-fleet.ts`.

### Files read (under `<project.localRootPath>/.pi/`)

| File | Purpose |
|---|---|
| `tasks/plan-summary.json` | Active plan metadata + task list → `plan_seen` + `task_seen` |
| `tasks/state.json` | Current task statuses → `task_started`, `task_completed`, `task_failed` |
| `tasks/<id>-<slug>/progress.jsonl` | Progress entries for running tasks → `task_progressed` (tailed from byte offset) |
| `tasks/<id>-<slug>/status.json` | Authoritative completion data (duration, retries, error, usage) |
| `archive/index.json` | List of archived plans |
| `archive/<id>/archive-summary.json` | Per-archive plan + task data |

### Plan ID derivation

Plan IDs are **not** taken from the file; they are derived from the plan title:

```ts
deriveActivePlanId(title) = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
```

This means if two different plans have the same title, they collide. There is no UUID in plan-summary.json used as planId.

### Progress.jsonl tailing

- Stores a byte cursor per `(projectId, cursorKey)` in `observed_files.byte_offset`
- Reads only new lines from the stored offset
- Each `ProgressEntry` → one `task_progressed` event
- `step` text is suppressed if `telemetry.progressText = false`
- `progressVisible = telemetry.progressText && entry.step != null`

### Archive processing

- Archives are marked as processed with sentinel snapshotHash `"1"` in `observed_files`
- Events are emitted with `source: 'archive'` not `'live'`
- Archive events are deduplicated by source key; once all events for an archive are emitted, the sentinel prevents re-processing

---

## 7. Migration Ownership

### Migration files

| File | Contents |
|---|---|
| `packages/pm/drizzle/0000_handy_marvel_apes.sql` | Base tables (settings, clients, time_entries, invoices, invoice_line_items) |
| `packages/pm/drizzle/0001_rename_freelancer_add_payment_terms.sql` | PM table alterations |
| `packages/pm/drizzle/0002_colossal_titanium_man.sql` | **All cockpit tables added in one migration** (7 tables + all indexes + FK constraints) |
| `packages/pm/drizzle/0003_wealthy_kronos.sql` | `cockpit_device_pairings` table (pairing flow) |

All migrations live in **`packages/pm/drizzle/`**. The schema source of truth is **`packages/pm/src/db/schema.ts`**.

### Who runs migrations

- The Dockerfile copies `packages/pm/drizzle/` into the container image (`COPY ... ./packages/pm/drizzle`)
- **There is no automatic migration runner in the Dockerfile or entrypoint** — migrations must be run separately (e.g. via a Kubernetes Job or manual `drizzle-kit migrate`)
- The Dockerfile smoke-test checks `test -f ./packages/pm/drizzle/meta/_journal.json` but does not run migrations

### Key constraint

`cockpit_raw_events` has a unique index on `(projectId, deviceId, sequence)` — this is the idempotency guarantee at the DB level. The `ON CONFLICT DO NOTHING` in `insertEventBatch()` relies on this.

---

## 8. Daemon Packaging Constraints

### Current state

The daemon is a TypeScript CLI (`apps/cockpit-daemon/`) compiled to CommonJS (`tsc`). It is:
- **Not published to npm** (marked `"private": true` in package.json)
- **Not included in the Docker image** (the Dockerfile only builds `apps/web`)
- Distributed only as source in the monorepo

### Runtime dependencies

| Dependency | Version | Role |
|---|---|---|
| `node:sqlite` | Node.js 22 built-in | Local SQLite outbox (no npm package needed) |
| `ws` | ^8.18.0 | WebSocket client |
| `@cleandev/cockpit-protocol` | workspace:* | Zod schemas + types |
| `zod` | (transitive) | Schema validation |

### Packaging options

#### Option A — npm publish (recommended for developer install)
- Remove `"private": true`, bump version, publish `@cleandev/cockpit-daemon` to npm.
- End users: `npm install -g @cleandev/cockpit-daemon`
- **Requires Node 22+** (for `node:sqlite` built-in)
- No bundle step needed; `dist/cli.js` + `node_modules` are the deliverable
- `@cleandev/cockpit-protocol` must also be published (or bundled into the dist)

#### Option B — esbuild/ncc single-file bundle (recommended for distribution)
- Bundle everything except `node:*` built-ins into a single `cockpit-daemon.cjs` file
- Distribute as a GitHub Releases binary or downloadable script
- `node:sqlite` and `ws` are handled naturally (built-in vs bundled)
- Example build step: `esbuild src/cli.ts --bundle --platform=node --target=node22 --outfile=dist/cockpit-daemon.cjs`
- Produces a ~1 MB self-contained file; install is `curl … | node` or just download + `node cockpit-daemon.cjs`

#### Option C — Single Executable Application (Node SEA)
- Use Node.js 22's built-in SEA feature (`node --experimental-sea-config`) to create a true binary
- Requires a bundled JS file first (Option B), then wrap in a Node 22 binary
- Most complex but gives a zero-Node-required binary for the target platform
- OS-specific: need separate builds for macOS/Linux/Windows
- Recommended only if the target user base does not have Node installed

#### Option D — Docker sidecar image
- Build a separate `Dockerfile.daemon` that runs `cockpit-daemon daemon`
- Suitable for server-side or containerised deployments
- Uses the same Node 22 Alpine base as the web image

### Recommended approach

**Option B (esbuild bundle) for Phase 1.** It:
- Works with `node:sqlite` (built-in, excluded from the bundle automatically with `--external:node:*`)
- Produces a single JS file that any Node 22+ user can run
- Does not require publishing to npm or maintaining a registry
- Can be gated behind GitHub Releases with checksums
- Can later be wrapped into a SEA binary (Option C) without changing source

Build command to add to `apps/cockpit-daemon/package.json`:
```json
"build:bundle": "esbuild src/cli.ts --bundle --platform=node --target=node22 --external:node:* --outfile=dist/cockpit-daemon.cjs --format=cjs"
```

### Critical constraint: `node:sqlite`

`node:sqlite` (`DatabaseSync`) is available only in **Node 22.5+ (stable in 22.x)**. Any packaging approach that strips `node:` prefixes (e.g. `pkg`) will break unless it ships its own Node 22 binary. If targeting a lower Node version, the local DB must be replaced with a pure-JS SQLite library (e.g. `better-sqlite3`).

---

## 9. Files to Change (by concern)

### Real-time UI push
| File | Change needed |
|---|---|
| `apps/web/src/app/cockpit/page.tsx` | Add server-sent events or polling (e.g. 10s `useInterval` + router.refresh) |
| `apps/web/src/app/cockpit/[projectId]/page.tsx` | Same — or add an SSE stream endpoint |
| `apps/web/src/components/cockpit/refresh-button.tsx` | Could add auto-poll mode |

### Per-plan task view
| File | Change needed |
|---|---|
| `apps/web/src/components/cockpit/project-detail.tsx` | Group tasks by planId; add plan-specific drill-down |
| `apps/web/src/app/cockpit/[projectId]/page.tsx` | Add `[planId]` sub-route for plan detail |

### Retrying task surfacing
| File | Change needed |
|---|---|
| `apps/web/src/components/cockpit/tasks-section.tsx` | Include `retrying` in the active agents filter |
| `apps/web/src/components/cockpit/project-detail.tsx` | Change `status === 'running'` filter to `['running', 'retrying'].includes(status)` |

### Usage totals
| File | Change needed |
|---|---|
| `apps/web/src/components/cockpit/project-detail.tsx` | Aggregate token usage across tasks for plan / project totals |

### Device management UI
| File | Change needed |
|---|---|
| `apps/web/src/app/cockpit/layout.tsx` | Add a "Devices" nav link |
| `apps/web/src/app/cockpit/devices/page.tsx` | New file — list all paired devices + revoke button |
| `apps/web/src/app/cockpit/actions.ts` | Already has `revokeDeviceAction` and `listPendingPairingsAction` |

### Daemon packaging
| File | Change needed |
|---|---|
| `apps/cockpit-daemon/package.json` | Remove `"private": true`, add `build:bundle` script |
| `apps/cockpit-daemon/tsconfig.json` | Verify `moduleResolution: node` for esbuild compat |
| Root `turbo.json` | Add `build:bundle` to pipeline if needed |
| `.github/workflows/deploy.yaml` | Add daemon build + release step |

### Migration runner
| File | Change needed |
|---|---|
| `Dockerfile` | Add a migration runner stage or init-container step |
| `k8s/` | Add a Kubernetes Job for drizzle migrations before rollout |

---

## 10. Architecture Summary Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  cockpit-daemon (Node 22, local machine)                        │
│                                                                  │
│  DaemonConfig (config.json)                                     │
│    credential: { deviceId, token }                              │
│    projects: [{ projectId, localRootPath, telemetry }]          │
│                                                                  │
│  LocalDaemonDb (SQLite3)                                        │
│    daemon_state | configured_projects | observed_worktrees       │
│    observed_files | outbound_events | server_acknowledgements   │
│                                                                  │
│  reconcileAll() every 60s                                       │
│    scanProjectGitWorktrees() → worktree_seen / _changed         │
│    scanProjectPiFleet()      → plan/task/progress events        │
│    project_seen + project_heartbeat                             │
│                         ▼                                        │
│  DaemonTransport (WebSocket client)                             │
│    → event_batch (50 events max) ────────────────────────────┐  │
└─────────────────────────────────────────────────────────────┐│──┘
                                                              ││
                                  wss://clean.dev/api/cockpit/ws
                                                              ││
┌─────────────────────────────────────────────────────────────▼▼──┐
│  Next.js custom-server.js                                        │
│                                                                  │
│  CockpitWsServer                                                 │
│    Bearer → SHA-256 → cockpit_device_tokens lookup               │
│    client_hello → cockpit_device_sessions                        │
│    event_batch → cockpit_raw_events (ON CONFLICT DO NOTHING)     │
│               → cockpit_projects.projectionDirty = true          │
│               → cockpit_projected_project_state.dirty = true     │
│                                                                  │
│  CockpitProjector (poll 1s, debounce 3s)                        │
│    listDirtyProjects() → listRawEventsSince() →                  │
│    foldEventsIntoState() → upsertProjectedProjectState()         │
│                                                                  │
│  PostgreSQL                                                      │
│    cockpit_projects (8 rows × project)                          │
│    cockpit_raw_events (append-only event log)                    │
│    cockpit_projected_project_state (JSONB snapshot)              │
│    cockpit_paired_devices / _tokens / _sessions / _pairings      │
│                                                                  │
│  Next.js RSC (force-dynamic)                                     │
│    /cockpit         → listProjects() + getProjectedProjectState()│
│    /cockpit/[id]    → getProjectedProjectState(projectId)        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. Cross-Cutting Observations

### What's solid
- **Idempotent ingestion**: `ON CONFLICT DO NOTHING` on `event_id` + unique index on `(projectId, deviceId, sequence)` means retried batches are harmless
- **Pure projection**: `foldEventsIntoState()` is a deterministic pure function with no I/O; safe to call multiple times
- **Two-way sequence tracking**: daemon-side SQLite outbox + server-side projection checkpoint are independent, making crash recovery straightforward
- **Telemetry gating**: all sensitive data (file paths, progress text, usage) is filtered at the daemon before events are sent
- **Device pairing flow**: clean device-code OAuth-style flow with 5-minute TTL and explicit exchange step

### Known limitations / risks
1. **Projection lag is real**: With the current 1s poll + 3s debounce, the UI can be 4s behind the most recent event. For actively running tasks this is noticeable.
2. **No streaming to UI**: All data freshness depends on manual refresh. A live dashboard impression requires adding SSE or WebSocket from server to browser.
3. **`planId` from title slug**: If a plan is renamed, its projectedState tasks accumulate under a new planId while the old planId's tasks remain. No deduplication or consolidation.
4. **Sequence is per-device global**: `sequence` is a monotone counter across all projects for a single device. High-volume projects share the sequence space with low-volume ones.
5. **Progress JSONL tailing uses mutable cursor**: If `progress.jsonl` is truncated (e.g. log rotation), the byte cursor points past the new EOF and no new events are queued. There is no reset trigger.
6. **No migration runner in CI**: The Dockerfile does not run `drizzle-kit migrate`. A separate deployment step is required and not currently codified.
7. **Daemon is undistributed**: End-users must build from source. There is no public npm package or binary release.
8. **No token rotation / refresh**: Bearer tokens have no built-in rotation mechanism. Long-lived tokens accumulate risk.
