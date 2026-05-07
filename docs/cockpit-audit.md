# Cockpit MVP Audit: clean.dev Runtime, Auth, Database, Deployment, and .pi File Shapes

**Date:** 2026-05-05  
**Task:** 001 — scout audit  
**Status:** Complete

---

## 1. Auth Model

### Provider and Role Attribution (`apps/web/auth.ts`)

NextAuth v5 (beta.30) — JWT-based, no database adapter for sessions.

| Provider | Condition | Role assigned |
|----------|-----------|---------------|
| GitHub | Login allowed only if `ALLOWED_GITHUB_USERS` contains the GitHub login | `"admin"` |
| LinkedIn | Always allowed (public review identity enrichment) | `"visitor"` |

JWT callback persists `provider`, `role`, and (for LinkedIn) `linkedinSub` into the JWT. The session callback re-exposes these to the client.

Session type extension:
```ts
session.user.provider  // "github" | "linkedin"
session.user.role      // "admin" | "visitor"
session.user.linkedinSub  // string | undefined (LinkedIn only)
```

Required env vars: `AUTH_SECRET`, `AUTH_URL=https://clean.dev`, `AUTH_TRUST_HOST=true`, `GITHUB_ID`, `GITHUB_SECRET`, `ALLOWED_GITHUB_USERS`, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`.

### Authorization Helpers (`apps/web/src/lib/authz.ts`)

```ts
isAdminSession(session)           // returns boolean: role === "admin"
requireAdminSession(session, url) // redirects to sign-in or "/" — throws never
```

All admin-only server actions and route handlers call `requireAdminSession` (or `isAdminSession` + manual 401/403).

### Cockpit Auth Requirement (downstream constraint)

The daemon cannot reuse the browser OAuth session token. Task 005 must implement a separate **device pairing** credential: the browser session approves a pairing code and the daemon exchanges it for a long-lived device token stored locally. All WebSocket ingestion connections authenticate with that device token, **not** with the NextAuth JWT.

---

## 2. Database Layer

### Connection (`apps/web/src/lib/db.ts`)

Singleton `pg.Pool` backed by `DATABASE_URL` env var.

```ts
new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

Exported helpers: `getPool()`, `testConnection()`, `closePool()`. Used by both route handlers and Drizzle ORM.

### ORM (`packages/pm` / Drizzle ORM v0.45+)

`packages/pm/src/db/schema.ts` defines the following tables:

| Table | PK | Notes |
|-------|-----|-------|
| `settings` | `integer default 1` (singleton row) | contractor/bank/VAT settings |
| `clients` | `uuid` (random) | `custom_fields: jsonb` |
| `time_entries` | `uuid` | FK → clients (cascade), FK → invoices (set null) |
| `invoices` | `uuid` | `invoice_number: text unique` |
| `invoice_line_items` | `uuid` | FK → invoices (cascade) |

All tables use `created_at` / `updated_at` timestamps. Numeric monetary columns use `precision 10/12, scale 2`.

Package exports (`packages/pm/src/index.ts`):
```ts
export * from './adapters';   // email + delivery adapters
export * from './types';      // shared TypeScript types
export * from './db/schema';  // all Drizzle table objects + relations
```

### Migration Flow

**Development / CLI path:**
```
pnpm db:generate  →  drizzle-kit generate  (writes .sql to packages/pm/drizzle/)
pnpm db:migrate   →  tsx packages/pm/src/db/migrate.ts  (runs Drizzle migrator)
```
The CLI migrator reads from `./drizzle` (relative to `packages/pm/`).

**Production path:**
`POST /api/admin/migrate` — admin-only HTTP endpoint in `apps/web/src/app/api/admin/migrate/route.ts`. It resolves the migrations folder at runtime:
```ts
path.resolve(process.cwd(), '../..', 'packages/pm/drizzle')
```
This path is valid inside the Kubernetes pod because the standalone Docker image copies the whole `apps/web/.next/standalone/` tree which preserves the monorepo structure. The endpoint is called once after deploying a new image that includes new schema files.

**Existing migrations** (as of this audit):
- `0000_handy_marvel_apes.sql` — initial schema
- `0001_rename_freelancer_add_payment_terms.sql` — rename contractor fields + payment terms

**Downstream constraint (Task 004):** New cockpit tables must be added as new Drizzle migration files under `packages/pm/drizzle/`. The `db:generate` command generates them; no schema bootstrapping outside of this flow is needed. Do not modify existing migrations.

---

## 3. Deployment Architecture

### Container Image

- Base: `node:22-alpine` (multi-stage)
- Build: `corepack enable pnpm && pnpm install --frozen-lockfile && pnpm run build`
- Next.js output mode: **`standalone`** (`apps/web/next.config.js`)
- Production image CMD: `node apps/web/server.js` — Next.js standalone server on `PORT=3000`, `HOSTNAME="0.0.0.0"`
- Non-root user: `nextjs` (uid 1001) in group `nodejs` (gid 1001)
- Image registry: `ghcr.io/mtrenker/clean-dev:<tag>`

Key file copies to runner stage:
```
apps/web/public/
apps/web/.next/standalone/   (includes apps/web/server.js)
apps/web/.next/static/
apps/web/content/
```

`serverExternalPackages: ['pg']` ensures the pg driver is not bundled by Next.js webpack.

### Kubernetes

**Namespace:** `clean-dev`  
**Managed by:** ArgoCD (GitOps) — image tag updated in `k8s/kustomization.yaml` by CI.

**Deployment (`k8s/deployment.yaml`):**
- `replicas: 1` with `RollingUpdate` (maxUnavailable: 0, maxSurge: 1) — zero-downtime deploys
- `readOnlyRootFilesystem: false` — filesystem is writable (required for Next.js cache)
- Init container validates `FEATURE_REVIEW_LINKS` and its dependencies before main pod starts
- Resource requests: 100m CPU / 128Mi RAM; limits: 500m CPU / 512Mi RAM
- Health probes: `GET /api/health` (liveness, 10s period) and `GET /api/ready` (readiness/startup, checks DB)

**Service (`k8s/service.yaml`):** ClusterIP, port 80 → `targetPort: http` (container port 3000).

**Ingress (`k8s/ingress.yaml`):**
- Class: `nginx` (nginx-ingress-controller)
- TLS: cert-manager + letsencrypt-prod, secret `clean-dev-tls`
- Hosts: `clean.dev`, `www.clean.dev` — both routed to same Service
- SSL redirect enforced

**PostgreSQL (`k8s/postgres-cluster.yaml`):** CloudNativePG `Cluster` resource.
- Single instance, database `cleandev`, owner `cleandev`
- Storage: 10Gi on `hcloud-volumes`
- Service DNS: `clean-dev-pg-rw:5432` (read-write primary)
- Connection string assembled in-pod: `postgresql://$(DB_USER):$(DB_PASSWORD)@clean-dev-pg-rw:5432/cleandev`

**Sealed secrets in use:**
| Secret name | Keys |
|-------------|------|
| `clean-dev-pg-app` | `username`, `password` |
| `nextauth-secrets` | `auth-secret`, `github-id`, `github-secret`, `allowed-github-users`, `linkedin-client-id`, `linkedin-client-secret` |
| `clean-dev-smtp` | `host`, `port`, `secure`, `user`, `password`, `from` |
| `review-link-secrets` | `feature-flag`, `signing-secret`, `recipient-email` |

---

## 4. WebSocket Hosting — Recommended Approach

### Constraints

1. Next.js standalone server (`apps/web/server.js`) does **not** expose the `upgrade` event — it cannot handle WebSocket protocol upgrades without modification.
2. The current Kubernetes topology is a single container on port 3000, exposed via ClusterIP → nginx Ingress. There is no secondary port or service.
3. `readOnlyRootFilesystem: false` — the container filesystem is writable, so a custom server.js wrapper can write temporary files.
4. `nginx-ingress-controller` natively proxies WebSocket connections when the `Upgrade: websocket` / `Connection: upgrade` headers are present — **no special annotation is required for basic WebSocket support**, but long-lived connections need timeout overrides.

### Recommendation: Custom Node.js Server Wrapper

**The recommended approach is a thin custom Node.js server file at `apps/web/custom-server.ts`** that:

1. Creates a standard `http.Server` using the imported `createServer` from `node:http`.
2. Passes HTTP requests to the Next.js standalone request handler (imported from `apps/web/server.js` — or replicated from its internals).
3. Attaches a `ws.WebSocketServer` that intercepts `upgrade` events on the path `/api/cockpit/ws` and routes all other upgrades to a 404.
4. Listens on `PORT=3000`.

This is the lowest-friction path because:
- Single port → no Kubernetes Service or Deployment changes required
- Co-located auth (device token lookup via the same Postgres pool)
- No sidecar or separate process
- Only changes needed: `ws` package added to `apps/web/package.json`, `custom-server.ts` added, Dockerfile CMD updated from `node apps/web/server.js` to `node apps/web/custom-server.js`

**Required Ingress annotation** (to prevent nginx from timing out long-lived daemon connections):
```yaml
annotations:
  nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
  nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
```

**Daemon connection:** outbound from daemon to `wss://clean.dev/api/cockpit/ws`, authenticated via `Authorization: Bearer <device-token>` or equivalent WebSocket sub-protocol header.

**Alternative considered and rejected:** A separate Kubernetes Service + Deployment for the WebSocket endpoint would be cleaner architecturally but adds unnecessary K8s surface area for an MVP with a single operator. Revisit at scale.

**Downstream constraints for Task 006:**
- Must modify `Dockerfile` CMD to use the custom server
- Must add `ws` (or compatible library) to `apps/web/package.json`
- Must add WebSocket timeout annotations to `k8s/ingress.yaml`
- Must authenticate via device token (not NextAuth JWT)
- Must NOT break existing Next.js HTTP routing

---

## 5. Package Conventions

| Aspect | Convention |
|--------|------------|
| Package manager | pnpm@10.24.0 |
| Build orchestrator | Turbo v2 — `turbo.json` defines `build`, `dev`, `test`, `lint`, `generate`, `export` tasks |
| Package namespace | `@cleandev/<name>` |
| App location | `apps/<app-name>/` |
| Package location | `packages/<pkg-name>/` |
| TypeScript | All packages; strict mode implied |
| Lint | ESLint 9 + `@cleandev/eslint-config` (`packages/eslint-config/`) |
| Pre-commit | Husky + lint-staged (ESLint --fix on `*.{ts,tsx}`) |
| Test runner | Vitest (unit), Playwright (e2e) in `apps/web` |
| Turbo cache | `build` caches `.next/**` and `dist/**`; `dev`/`storybook` are non-cached persistent |
| Global turbo env | `NODE_ENV`, `BLOG_ENDPOINT`, `BLOG_TOKEN`, `CDK_DEFAULT_ACCOUNT`, `CDK_DEFAULT_REGION` |

**Existing packages:**
| Package | Name | Notes |
|---------|------|-------|
| `packages/eslint-config` | `@cleandev/eslint-config` | Shared ESLint rules |
| `packages/pm` | `@cleandev/pm` | DB schema, Drizzle ORM, invoice/client adapters; builds to `dist/` via tsc |
| `packages/sim` | `@cleandev/sim` | Zero-dependency ECS/state-machine simulation engine; transpiled at import (no dist/) |

**New packages required by this plan:**
- `packages/cockpit-protocol` → `@cleandev/cockpit-protocol` — shared Zod schemas + TypeScript types for daemon↔server messages (Task 002)

**Turbo pipeline constraint:** New packages must add themselves to `pnpm-workspace.yaml` (implicitly via `packages/*` glob — no change needed) and define a `build` script that populates `dist/` so turbo's `^build` dependency works.

---

## 6. .pi Files — Exact Fields the Daemon Can Consume for MVP

The daemon's pi-fleet adapter (Task 012) should parse the following files. All paths are relative to the project root (mapped local repository).

### 6.1 Active Plan State

#### `.pi/tasks/plan-summary.json`
```jsonc
{
  "version": 1,
  "title": "Plan: ...",
  "overview": "...",
  "splitAt": "2026-05-05T19:46:45.293Z",   // ISO timestamp
  "sourcePlanPath": "PLAN.md",
  "taskCount": 17,
  "tasks": [{
    "id": "001",                             // numeric string, zero-padded
    "slug": "audit-current-...",
    "name": "Audit current ...",
    "engine": "claude",
    "model": "sonnet",
    "profile": "deep",
    "thinking": "high",
    "agent": "scout",
    "depends": [],                           // array of id strings
    "description": "..."
  }]
}
```
**Daemon use:** emit `plan_seen` event; provides planId (`title` or derived slug), task list for pre-population.

#### `.pi/tasks/state.json`
```jsonc
{
  "updatedAt": "2026-05-05T19:51:38.825Z",
  "tasks": [{
    "id": "001",
    "name": "audit-current-...",
    "agent": "scout",
    "engine": "claude",
    "model": "sonnet",
    "status": "running",                     // "pending"|"running"|"done"|"failed"|"retrying"
    "startedAt": "2026-05-05T19:51:11.403Z", // null if not started
    "completedAt": null,                     // null if not finished
    "latestProgressAt": "...",               // null or ISO
    "latestProgressMessage": "...",          // null or short string
    "lastProgress": "...",                   // null or longer string
    "blockedBy": null,                       // null or array of id strings
    "usage": {
      "inputTokens": 1446,
      "outputTokens": 55
    }
  }],
  "summary": {
    "total": 17,
    "pending": 16,
    "running": 1,
    "done": 0,
    "failed": 0,
    "retrying": 0,
    "totalInputTokens": 1446,
    "totalOutputTokens": 55
  }
}
```
**Daemon use:** primary polling target; diff against last seen snapshot to emit `task_started`, `task_progressed`, `task_completed`, `task_failed`, `usage_reported` events.

#### `.pi/tasks/<task-slug>/status.json`
```jsonc
{
  "id": "001",
  "name": "audit-current-...",
  "status": "running",
  "engine": "claude",
  "model": "sonnet",
  "profile": "deep",
  "thinking": "high",
  "agent": "scout",
  "depends": [],
  "startedAt": "2026-05-05T19:51:11.403Z",
  "completedAt": null,
  "duration": null,                         // ms or null
  "retries": 0,
  "pid": 308338,                            // OS pid (do not upload — privacy)
  "error": null,                            // null or error string
  "usage": { "inputTokens": 0, "outputTokens": 0 },
  "latestProgressAt": null,
  "latestProgressMessage": null
}
```
**Daemon use:** per-task status; cross-reference with `state.json`. Omit `pid` from any uploaded event payload.

#### `.pi/tasks/<task-slug>/progress.jsonl`
One JSON object per line:
```jsonc
{"ts":"2026-05-05T19:51:16.263Z","step":"...description...","status":"running"}
{"ts":"2026-05-05T19:51:16.631Z","step":"...description...","status":"done"}
```
Valid `status` values: `"running"`, `"done"`, `"error"`.  
**Daemon use:** tail-read with offset tracking (store last byte offset in SQLite outbox); emit `task_progressed` events for new lines. Respect per-project telemetry policy — `step` text may contain local paths and should be redacted if `telemetry.progressText === false`.

### 6.2 Fleet Config

#### `.pi/fleet.json`
```jsonc
{
  "simulate": { "taskDurationMs": [4000,10000], "progressIntervalMs": 1200, "failureRate": 0.2 },
  "concurrency": 2,
  "planPath": "PLAN.md",
  "tasksDir": ".pi/tasks",
  "defaults": { "engine": "claude", "model": "sonnet", "agent": "worker" },
  "engines": {
    "claude": { "command": "claude", "args": ["-p","--output-format","stream-json","--dangerously-skip-permissions"] }
  },
  "profiles": {
    "fast": { "claude": { "model": "haiku", "thinking": "low" } },
    "balanced": { "claude": { "model": "sonnet", "thinking": "medium" } },
    "deep": { "claude": { "model": "sonnet", "thinking": "high" } }
  },
  "agents": {
    "worker": { "prompt": "...", "tools": null },
    "scout":  { "prompt": "...", "tools": ["read","grep","find","ls","bash"] }
  }
}
```
**Daemon use:** `concurrency` informs how many simultaneous `running` tasks are expected; `tasksDir` tells the daemon where to look for task folders; `defaults` provides fallback model/engine metadata for events. Do not upload `engines[].command/args` or `agents[].prompt` — those are local operator secrets.

### 6.3 Archive State

#### `.pi/archive/index.json`
```jsonc
{
  "version": 1,
  "archives": [{
    "id": "2026-04-17T14-31-12-139Z-plan-...",
    "archivedAt": "2026-04-17T14:31:12.139Z",
    "reason": "manual",
    "title": "Plan: ...",
    "taskCount": 16,
    "archivePath": ".pi/archive/2026-04-17T14-31-12-139Z-...",
    "taskFolders": ["001-...", "002-..."],
    "summary": { "total":16, "done":16, "failed":0, "totalInputTokens":10175152, "totalOutputTokens":326678, ... }
  }]
}
```
**Daemon use:** `plan_seen` events for each unprocessed archive entry; `archivedAt` as the plan completion timestamp; token usage for `usage_reported` events.

#### `.pi/archive/<archive-id>/archive-summary.json`
```jsonc
{
  "version": 1,
  "summarizedAt": "...",
  "plan": { "title":"...", "overview":"...", "splitAt":"...", "taskCount":12 },
  "summary": { "total":12, "done":12, ... },
  "tasks": [{
    "id": "001",
    "name": "...",
    "agent": "scout",
    "engine": "claude",
    "model": "sonnet",
    "profile": "deep",
    "thinking": "high",
    "status": "done",
    "depends": [],
    "retries": 0,
    "startedAt": "...",
    "completedAt": "...",
    "duration": 163199,          // ms
    "error": null,
    "progressEntries": 37,
    "lastProgress": "...",        // truncated summary
    "usage": { "inputTokens": 15, "outputTokens": 7963 }
  }]
}
```
**Daemon use:** emit `task_completed`/`task_failed` + `usage_reported` events for each archived task; idempotency key = `archiveId + taskId`.

#### `.pi/archive/<archive-id>/tasks/<task-slug>/status.json`
Same schema as the active per-task `status.json` (see §6.1).

#### `.pi/archive/<archive-id>/tasks/<task-slug>/progress.jsonl`
Same schema as active progress JSONL (see §6.1).

### 6.4 Files to Exclude from Scanning

The daemon **must not** recurse into these paths when discovering `.pi` content:
- `node_modules/`
- `.git/`
- `.pi/archive/` — only read archive index; scan individual archive folders on-demand via the index

---

## 7. Downstream Task Constraints Summary

| Task | Constraint from this audit |
|------|---------------------------|
| **002** (cockpit-protocol) | Zod schemas must cover all fields in §6 above; mark `pid` as excluded from events |
| **003** (fleet contract) | Map `.pi/tasks/state.json` diff → semantic events; archive data maps via `archiveId+taskId` idempotency key |
| **004** (DB schema) | New tables added as Drizzle migration files in `packages/pm/drizzle/`; existing schema exports must not break |
| **005** (pairing APIs) | Must issue device tokens separate from NextAuth JWT; admin session required to create/approve devices |
| **006** (WebSocket endpoint) | Use custom Node.js server wrapper on same port 3000; update Dockerfile CMD; add ingress timeout annotations; authenticate via device token |
| **007** (projection) | Can use same `pg.Pool` and Drizzle from `packages/pm`; migration precedes projection |
| **008** (daemon scaffold) | New app at `apps/cockpit-daemon`, `@cleandev/cockpit-daemon`; add to `apps/*` workspace; Turbo build script required |
| **010** (daemon auth) | Daemon credential stored locally (not browser session); connect to pairing API added in Task 005 |
| **012** (pi-fleet adapter) | Parse files described in §6; skip `pid` in uploads; respect `telemetry.progressText` policy for `step` text; use byte-offset tracking for progress JSONL |
| **013** (daemon WS client) | Daemon connects outbound to `wss://clean.dev/api/cockpit/ws`; bearer token auth |
| **014** (cockpit UI) | Admin-only (GitHub session, role === "admin"); shares existing auth helpers from `apps/web/src/lib/authz.ts` |
| **016** (runbook) | Document `POST /api/admin/migrate` as the production migration path; document WebSocket timeout ingress annotations |
