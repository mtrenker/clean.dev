# Cockpit Operator Runbook

This guide is the authoritative reference for running the cockpit MVP safely.
Follow it end-to-end when setting up a new environment, and consult individual
sections when diagnosing issues.  A second operator who has never seen this
system should be able to follow it from start to finish.

---

## Table of contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Creating a project](#3-creating-a-project)
4. [Pairing a daemon device](#4-pairing-a-daemon-device)
5. [Configuring telemetry conservatively](#5-configuring-telemetry-conservatively)
6. [Validating with `preview` before streaming](#6-validating-with-preview-before-streaming)
7. [Pruning raw events](#7-pruning-raw-events)
8. [Diagnosing stale or offline projects](#8-diagnosing-stale-or-offline-projects)
9. [Revoking a device](#9-revoking-a-device)
10. [Observability — structured logs](#10-observability--structured-logs)
11. [Failure modes and remedies](#11-failure-modes-and-remedies)

---

## 1. Overview

The cockpit is a real-time project dashboard.  Daemon processes running on
developer machines send telemetry events over a WebSocket connection
(`/api/cockpit/ws`) or the HTTP fallback (`POST /api/cockpit/events`).  The
server ingests events idempotently, projects them into a per-project state
snapshot (the *projected state*), and serves that snapshot to the UI at
`/cockpit`.

```
 Daemon (developer machine)
   │
   │  WebSocket  Bearer token
   │  /api/cockpit/ws
   ▼
 Server (Node.js custom-server.ts)
   │
   │  cockpit_raw_events (Postgres)
   │  cockpit_projected_project_state (Postgres)
   │
   ▼
 UI  /cockpit
     /cockpit/[projectId]
```

Key components:

| Component | File | Role |
|-----------|------|------|
| Custom server | `apps/web/custom-server.ts` | HTTP + WebSocket entry point |
| WS handler | `apps/web/src/server/cockpit-ws.ts` | Auth, sessions, event ingestion |
| Projector | `apps/web/src/lib/cockpit/projector.ts` | Debounced projection from raw events |
| Repository | `packages/pm/src/cockpit/repository.ts` | All DB operations |
| UI pages | `apps/web/src/app/cockpit/` | Browser dashboard |
| Server actions | `apps/web/src/app/cockpit/actions.ts` | Authenticated mutations |

---

## 2. Prerequisites

- PostgreSQL database running with migrations applied (`pnpm db:migrate` or
  `drizzle-kit push`).
- `DATABASE_URL` environment variable set on the server process.
- `NEXTAUTH_URL` (or `NEXT_PUBLIC_APP_URL`) pointing to the public hostname
  — this is embedded in the verification URI shown to the daemon during pairing.
- An admin GitHub account: sign in at `/api/auth/signin` to get a browser
  session that can approve pairings and call server actions.

Environment variables for the custom server:

```bash
PORT=3000               # HTTP port (default 3000)
HOSTNAME=0.0.0.0        # Bind address
COCKPIT_WS_ENABLED=true # Set false to disable WebSocket server
DATABASE_URL=postgres://user:pass@host/db
NEXTAUTH_URL=https://your-domain.example.com
NEXTAUTH_SECRET=<strong-secret>
GITHUB_CLIENT_ID=…
GITHUB_CLIENT_SECRET=…
```

Start the custom server:

```bash
node apps/web/custom-server.js   # production build
# or in development
pnpm --filter @cleandev/web dev
```

---

## 3. Creating a project

A *project* is the top-level unit — it corresponds to a single software
repository the daemon monitors.  Projects can be created explicitly or are
auto-created the first time an event arrives for a new `projectId`.

### Via the UI (recommended)

1. Open `/cockpit` and sign in with an admin account.
2. Use the **Create project** form (if present) or call the server action
   directly from a client form that calls `createProjectAction`.

### Via the server action directly (script/REPL)

```typescript
import { createProjectAction } from '@/app/cockpit/actions';

await createProjectAction({
  projectId:    'my-repo',          // stable slug-style ID
  projectSlug:  'my-repo',          // URL-safe identifier shown in UI
  projectName:  'My Repository',    // human-friendly name
  localRootPath: '/home/dev/my-repo',
});
```

`projectId` is the immutable primary key — choose it carefully.  It never
changes even if the repo is renamed.  A good choice is the GitHub
`owner/repo` slug or a UUID.

---

## 4. Pairing a daemon device

Pairing uses a device-code flow (RFC 8628).  The daemon never needs a
browser session — it only needs an operator to approve the pairing once.

### Step 1 – Daemon requests a pairing code

The daemon calls:

```http
POST /api/cockpit/devices/pair
Content-Type: application/json

{
  "deviceId":    "martin-mbp-01",         // stable ID, daemon-chosen
  "deviceName":  "Martin's MacBook Pro",  // displayed in UI
  "instanceName": "dev"                   // optional environment label
}
```

Response:

```json
{
  "deviceCode":      "a3f4…",          // secret; daemon polls with this
  "userCode":        "ABCDE-FGHIJ",   // short code for the human to enter
  "verificationUri": "https://your-domain.example.com/cockpit/devices/approve?userCode=ABCDE-FGHIJ",
  "expiresIn":       300              // seconds; default 5 minutes
}
```

### Step 2 – Operator approves in the browser

1. Open the `verificationUri` (or navigate to `/cockpit/devices/approve`).
2. Sign in with the admin GitHub account if not already signed in.
3. Enter or confirm the `userCode` and click **Approve**.

Internally this calls `approveDeviceAction({ userCode: 'ABCDE-FGHIJ' })`,
which creates the device record and generates a one-time bearer token.

### Step 3 – Daemon exchanges the device code for the bearer token

The daemon polls:

```http
POST /api/cockpit/devices/exchange
Content-Type: application/json

{ "deviceCode": "a3f4…" }
```

Response (while still pending):
```json
{ "status": "pending" }
```

Response (after approval):
```json
{
  "status": "approved",
  "token":  "3b9d…"       // 64-character hex bearer token
}
```

The daemon stores this token and uses it for all subsequent API calls:

```http
Authorization: Bearer 3b9d…
```

> **Security note:** The raw token is held in server memory for at most
> 2 minutes after approval.  If the daemon misses the exchange window it must
> restart the pairing flow.  Tokens are stored only as SHA-256 hashes in the
> database — the server never persists the plaintext.

---

## 5. Configuring telemetry conservatively

Each project has a *telemetry profile* that controls how much information the
daemon sends.  Start with the `minimal` preset to avoid transmitting paths or
progress text, then relax settings as needed.

### Presets

| Preset | Worktree path | Repo root path | Git | Progress text | Plan text | Task description |
|--------|--------------|----------------|-----|---------------|-----------|-----------------|
| `minimal` | off | off | branch-only | false | false | false |
| `balanced` *(default)* | relative | off | full | false | true | true |
| `full` | full | relative | full | true | true | true |

**Recommendation for new projects:** start with `balanced`.  Switch to
`minimal` if the project root path or task descriptions are considered
sensitive.  Never use `full` unless you actively need `progressText` (raw LLM
token-by-token output) in the dashboard.

### Applying a profile

When creating or updating a project pass the telemetry object:

```typescript
import { telemetryProfilePresets } from '@cleandev/cockpit-protocol';

await createProjectAction({
  projectId: 'my-repo',
  // ... other fields ...
});
// telemetry defaults to 'balanced'; to override, update the record via
// the repository directly (no UI form yet for this edge case).
```

The daemon config (`daemon.config.json`) also sets a per-project telemetry
override.  The server always uses the telemetry stored in the DB; the daemon
config value is only a hint the daemon uses to pre-filter events before
sending.

---

## 6. Validating with `preview` before streaming

Before enabling live streaming for a new project, use the HTTP events endpoint
to send a test batch and verify that:

1. Auth works (token is valid).
2. Events parse correctly.
3. The projection runs and produces a sane state.

### Send a preview batch

```bash
TOKEN=3b9d…   # bearer token from pairing
curl -s -X POST https://your-domain.example.com/api/cockpit/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": "test-preview-001",
    "sentAt":  "'"$(date -u +%FT%TZ)"'",
    "events": [
      {
        "eventId":       "preview-evt-001",
        "schemaVersion": 1,
        "projectId":     "my-repo",
        "deviceId":      "martin-mbp-01",
        "sessionId":     null,
        "sequence":      1,
        "occurredAt":    "'"$(date -u +%FT%TZ)"'",
        "source":        "live",
        "runId":         null,
        "type":          "project_seen",
        "payload": {
          "projectName":   "My Repository",
          "localRootPath": "/home/dev/my-repo",
          "telemetry": {
            "worktreePath": "relative",
            "repoRootPath": "off",
            "git":          "full",
            "progressText": false,
            "usage":        true,
            "planText":     true,
            "taskDescription": true
          }
        }
      }
    ]
  }'
```

Expected response:

```json
{
  "batchId":              "test-preview-001",
  "ackedThroughSequence": 1,
  "acceptedCount":        1,
  "duplicateCount":       0,
  "rejected":             [],
  "serverTime":           "2026-05-05T21:00:00.000Z"
}
```

If `acceptedCount` is 1, the event was stored.  Open `/cockpit/my-repo` —
within about 3 seconds (the default debounce window) the projected state
should appear.

### Check the projection

```bash
# Open the project detail page in the browser:
open https://your-domain.example.com/cockpit/my-repo

# Or query the projected state directly (admin session required):
# The state will show lastEvent.type = "project_seen"
```

Once the preview looks correct, configure the daemon to open the WebSocket
connection and start sending live events.

---

## 7. Pruning raw events

Raw events accumulate in `cockpit_raw_events` as the daemon streams data.
The projected state snapshot in `cockpit_projected_project_state` is a compact
summary — the raw events are only needed if you want to re-project from
scratch.  Prune them regularly to control storage growth.

> **Safety:** Pruning is non-destructive to the projected state.  After
> pruning you will not be able to re-project deleted events, but the current
> snapshot in the UI is unaffected.  The projection must be up-to-date
> (non-dirty) before pruning by sequence number.

### Via the UI

1. Navigate to `/cockpit/[projectId]`.
2. Scroll to **Operator tools → Prune raw events**.
3. Choose a prune mode:
   - **Age (days):** deletes all events older than N days.  Safe at any time.
   - **Sequence number:** deletes all events with sequence ≤ N.  Use the
     project's `latestEventSequence` (shown in the UI under Project metadata)
     only *after* verifying the projection is clean.
4. Add an optional reason (stored in the audit log).
5. Click **Prune events**.

The success banner shows how many events were deleted and the audit run ID.

### Via the server action (script)

```typescript
import { pruneProjectEventsAction } from '@/app/cockpit/actions';

// Prune events older than 30 days for a specific project:
const result = await pruneProjectEventsAction({
  projectId:      'my-repo',
  occurredBefore: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  reason:         'monthly storage cleanup',
});

console.log(result.deletedEventCount, 'events deleted');
console.log('Prune run ID:', result.pruneRunId);

// Prune by sequence (use with care — verify projection is current first):
await pruneProjectEventsAction({
  projectId:        'my-repo',
  throughSequence:  12_500,
  reason:           'post-projection cleanup',
});
```

### Audit trail

Every prune is recorded in `cockpit_manual_prune_runs`:

```sql
SELECT prune_run_id, project_id, requested_by, deleted_event_count,
       pruned_before, pruned_through_sequence, created_at
FROM cockpit_manual_prune_runs
ORDER BY created_at DESC
LIMIT 20;
```

### Recommended retention policy

| Scenario | Suggested cutoff |
|----------|-----------------|
| Active project, pruning weekly | Events older than 7 days |
| Active project, pruning monthly | Events older than 30 days |
| Decommissioned project | Prune through `latestEventSequence` then delete the project row |

---

## 8. Diagnosing stale or offline projects

### Symptoms

| UI indicator | Meaning |
|---|---|
| Health badge: **Offline** | No projection data exists yet |
| Health badge: **Stale** | Last heartbeat or event is older than 60 seconds |
| Health badge: **Active** | Daemon connected and sending within the last 60 seconds |
| "Projection: Pending update" in metadata | Events arrived but projector hasn't run yet |

### Diagnosis steps

**1. Check if the daemon is connected via WebSocket**

Look for `cockpit.ws.connected` or `cockpit.ws.disconnected` log entries:

```bash
# If using Docker / Kubernetes, stream the server logs and grep:
kubectl logs -l app=web -f | grep '"event":"cockpit.ws'
```

Expected on successful connection:
```json
{"level":"info","ts":"…","event":"cockpit.ws.connected","connectionId":"…","deviceId":"martin-mbp-01"}
{"level":"info","ts":"…","event":"cockpit.ws.paired","connectionId":"…","sessionId":"…"}
```

**2. Check event ingestion**

Look for `cockpit.ws.batch_ingested` entries to confirm events are arriving:

```json
{"level":"info","ts":"…","event":"cockpit.ws.batch_ingested","batchId":"…","accepted_count":5,"duplicate_count":0}
```

If `accepted_count` is always 0 (all duplicates) the daemon may be
re-sending old events without incrementing the sequence.

**3. Check the projector**

Projector cycles are logged at `info` level only when ≥1 projects were
projected.  Look for:

```json
{"level":"info","ts":"…","event":"cockpit.projector.cycle_complete","projected":1,"skipped":0}
```

If `skipped > 0`, check for `cockpit.projector.project_error` entries:

```json
{"level":"error","ts":"…","event":"cockpit.projector.project_error","projectId":"my-repo","error":"…"}
```

**4. Check the database directly**

```sql
-- Is the project marked dirty?
SELECT project_id, projection_dirty, dirty_marked_at, latest_event_sequence
FROM cockpit_projects
WHERE project_id = 'my-repo';

-- When was the last event received?
SELECT MAX(occurred_at) AS last_event, MAX(received_at) AS last_received
FROM cockpit_raw_events
WHERE project_id = 'my-repo';

-- What is the projected state's dirty flag?
SELECT project_id, dirty, latest_event_sequence, projected_at
FROM cockpit_projected_project_state
WHERE project_id = 'my-repo';
```

**5. Force a re-projection (break-glass)**

If the projector is stuck, mark the project dirty manually:

```sql
UPDATE cockpit_projects
SET projection_dirty = true,
    dirty_marked_at  = now() - interval '10 seconds'
WHERE project_id = 'my-repo';
```

The projector polls every 1 second and will pick this up within its
debounce window (default 3 seconds).

### Common causes of stale state

| Cause | Remedy |
|-------|--------|
| Daemon process crashed or network lost | Restart daemon; it will reconnect and resume from `lastAckedSequence` |
| Bearer token revoked | Re-pair the device (see §4) |
| DB connectivity issue | Check `DATABASE_URL`, Postgres logs |
| Projector not running | Ensure the custom server is used (not `next start`); check for `cockpit.projector.started` in logs |
| Project dirty but debounce window not elapsed | Wait 3 s after the last event; or check `dirty_marked_at` in the DB |

---

## 9. Revoking a device

Revocation immediately invalidates the device's bearer token and closes any
open sessions in the DB.  The daemon will receive an `HTTP 401` on its next
request and must be re-paired.

### Via the UI

Navigate to `/cockpit/devices` and click **Revoke** next to the device.

### Via the server action

```typescript
import { revokeDeviceAction } from '@/app/cockpit/actions';

await revokeDeviceAction({
  deviceId: 'martin-mbp-01',
  reason:   'Developer left the team',
});
```

### What happens

1. `cockpit_paired_devices.revoked_at` is set to now.
2. All active tokens for the device are revoked in `cockpit_device_tokens`.
3. All open sessions are closed in `cockpit_device_sessions`.
4. The next WS upgrade or HTTP request with the old token returns `401`.

The daemon's in-flight events that were already acknowledged before revocation
remain in the DB and will be projected normally.

---

## 10. Observability — structured logs

All cockpit components emit JSON-lines to stdout using the shared `logger`
from `apps/web/src/lib/logger.ts`.  Each line has `level`, `ts`, `event`, and
domain-specific fields.

### Log format

```json
{
  "level": "info",
  "ts":    "2026-05-05T21:00:00.000Z",
  "event": "cockpit.ws.batch_ingested",
  "connectionId": "550e8400-e29b-41d4-a716-446655440000",
  "batchId":      "batch-001",
  "accepted_count":  10,
  "duplicate_count": 0,
  "acked_through_sequence": 142
}
```

### Event catalogue

#### WebSocket (`cockpit.ws.*`)

| Event | Level | Key fields | Trigger |
|-------|-------|-----------|---------|
| `cockpit.ws.upgrade_rejected` | warn | `reason` | Missing or revoked bearer token |
| `cockpit.ws.token_lookup_error` | error | `error` | DB error during token lookup |
| `cockpit.ws.connected` | info | `connectionId`, `deviceId` | WS upgrade succeeded |
| `cockpit.ws.disconnected` | info | `connectionId`, `deviceId`, `last_acked_sequence` | WS closed |
| `cockpit.ws.socket_error` | error | `connectionId`, `error` | `ws` library socket error |
| `cockpit.ws.invalid_json` | warn | `connectionId` | Message body not valid JSON |
| `cockpit.ws.validation_failed` | warn | `connectionId`, `failed_fields` | Zod schema validation failure |
| `cockpit.ws.pairing_mismatch` | warn | `connectionId`, `expected_device_id`, `got_device_id` | `client_hello` deviceId ≠ token deviceId |
| `cockpit.ws.paired` | info | `connectionId`, `deviceId`, `sessionId`, `instance_name` | `client_hello` accepted |
| `cockpit.ws.session_create_error` | error | `connectionId`, `error` | DB error creating session |
| `cockpit.ws.batch_ingested` | info | `batchId`, `accepted_count`, `duplicate_count`, `acked_through_sequence` | Event batch stored |
| `cockpit.ws.batch_insert_error` | error | `connectionId`, `error` | DB error inserting events |
| `cockpit.ws.touch_session_error` | error | `connectionId`, `context`, `error` | DB error updating session |

#### Projector (`cockpit.projector.*`)

| Event | Level | Key fields | Trigger |
|-------|-------|-----------|---------|
| `cockpit.projector.started` | info | `debounce_ms`, `poll_interval_ms`, `heartbeat_stale_ms` | `start()` called |
| `cockpit.projector.stopped` | info | — | `stop()` called |
| `cockpit.projector.cycle_complete` | info | `projected`, `skipped` | Cycle with ≥1 projections |
| `cockpit.projector.project_error` | error | `projectId`, `error` | Single-project projection failed |
| `cockpit.projector.projected` | debug | `projectId`, `new_events`, `latest_sequence`, `daemon_stale` | One project projected |

#### Operator actions (`cockpit.device.*`, `cockpit.prune.*`)

| Event | Level | Key fields | Trigger |
|-------|-------|-----------|---------|
| `cockpit.device.revoked` | info | `deviceId`, `reason` | Operator revoked a device |
| `cockpit.prune.completed` | info | `project_id`, `deleted_event_count`, `projects_affected`, `prune_run_id` | Operator pruned events |

### Querying logs (example — Loki / Grafana)

```logql
# All cockpit errors in the last hour
{app="web"} | json | event =~ "cockpit\\..*" | level = "error"

# WS connection rate
count_over_time({app="web"} | json | event = "cockpit.ws.connected" [5m])

# Projection activity
{app="web"} | json | event = "cockpit.projector.cycle_complete"
  | unwrap projected [5m] | sum by () (sum_over_time)
```

---

## 11. Failure modes and remedies

| Symptom | Likely cause | Remedy |
|---------|-------------|--------|
| WS upgrade returns `HTTP 401` | Token invalid, revoked, or expired | Re-pair the device (§4) |
| WS upgrade returns `HTTP 500` | DB connectivity issue | Check `DATABASE_URL`, Postgres health |
| `cockpit.ws.validation_failed` log entries | Daemon protocol version mismatch | Update daemon to match server's `cockpitProtocolSchemaVersion` |
| `acceptedCount: 0` in every ack | Daemon re-sending already-stored events | Daemon should advance `lastAckedSequence` on reconnect |
| Projected state never updates | Projector not running | Use `custom-server.ts` not `next start`; check `cockpit.projector.started` log |
| `daemon_stale: true` in projected state | No heartbeat in >60 s | Daemon may have crashed; check daemon process |
| Prune action fails with "Provide throughSequence or occurredBefore" | Both fields left blank | Set at least one prune criterion |
| Prune deleted 0 events | No events matched the criteria | Verify the project ID and adjust the cutoff |
| UI shows "No projection data" | Project exists but no events yet | Send a preview batch (§6) |
