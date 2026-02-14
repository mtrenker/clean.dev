# Copilot Instructions for clean.dev

## Architecture Overview

This is a **Next.js 16 App Router** monorepo managed by **TurboRepo** and **pnpm workspaces**. The application is a personal portfolio/consulting site with GitHub OAuth authentication and PostgreSQL backend, deployed to Kubernetes.

### Monorepo Structure
- **apps/web** - Main Next.js application (standalone output mode)
- **packages/eslint-config** - Shared ESLint configurations extending Vercel style guide
- **k8s/** - Kubernetes manifests using Kustomize with sealed secrets
- **scripts/** - Secret generation scripts for deployment

## Critical Development Patterns

### React Components
- **Always use arrow functions** for named components: `const MyComponent: React.FC = () => {}`
- Enforced by ESLint rule: `react/function-component-definition`
- Use `'use client'` directive when using hooks or browser APIs (see [apps/web/src/app/bill/page.tsx](apps/web/src/app/bill/page.tsx))

### Authentication System
Authentication uses **NextAuth v5 (beta)** with GitHub OAuth and a user allowlist:
- Config in [apps/web/auth.ts](apps/web/auth.ts) exports `auth`, `signIn`, `signOut`, and `handlers`
- Middleware in [apps/web/middleware.ts](apps/web/middleware.ts) protects all routes by default
- Allowlist via `ALLOWED_GITHUB_USERS` env var (comma-separated GitHub usernames)
- API routes at `/api/auth/[...nextauth]` delegate to exported `handlers`

### Database Access
- PostgreSQL connection via `pg` library with connection pooling
- Pool singleton pattern in [apps/web/src/lib/db.ts](apps/web/src/lib/db.ts): `getPool()` function
- Database is **optional** - check `process.env.DATABASE_URL` before querying
- Health checks gracefully handle missing database (see [apps/web/src/app/api/health/route.ts](apps/web/src/app/api/health/route.ts))

### TypeScript Configuration
- Strict mode enabled in all packages
- Path alias: `@/*` maps to `./src/*` in Next.js app
- Next.js config sets `output: 'standalone'` and `serverExternalPackages: ['pg']`

### Styling & Formatting
- Tailwind CSS with custom configuration
- **German locale (de-DE)** for number/date formatting: `Intl.NumberFormat('de-DE')`, see [apps/web/src/app/bill/page.tsx](apps/web/src/app/bill/page.tsx)
- Prefer double quotes for JSX attributes (enforced by ESLint)

## Development Workflows

### Running Locally
```bash
pnpm dev              # Starts Next.js dev server via TurboRepo (loads .env via dotenv-cli)
pnpm build            # Build all apps for production
pnpm lint             # Run ESLint across workspace
```

**Important**: All commands use `dotenv-cli` to load environment variables from `.env` file.

### Environment Variables
Required variables (see [apps/web/.env.example](apps/web/.env.example)):
- `AUTH_SECRET` - NextAuth session encryption key
- `GITHUB_ID` / `GITHUB_SECRET` - GitHub OAuth app credentials
- `ALLOWED_GITHUB_USERS` - Comma-separated list of allowed GitHub usernames
- `DATABASE_URL` - PostgreSQL connection string (optional)

### Docker & Deployment
- Multi-stage Dockerfile optimized for standalone Next.js output
- Image runs as non-root user (uid 1001) with security constraints
- **GitOps workflow**: Changes to `k8s/` manifests are deployed via ArgoCD (app-of-apps pattern in separate repo)
- Kubernetes deployment uses:
  - Health probes at `/api/health` (liveness) and `/api/ready` (readiness/startup)
  - Sealed secrets via Bitnami sealed-secrets
  - CloudNativePG operator for PostgreSQL cluster

### Adding New API Routes
Follow the pattern in [apps/web/src/app/api/health/route.ts](apps/web/src/app/api/health/route.ts):
1. Export `GET`, `POST`, etc. as async functions returning `NextResponse`
2. Use proper TypeScript types: `Promise<NextResponse>`
3. Include error handling with appropriate HTTP status codes
4. If querying database, check `process.env.DATABASE_URL` first

### Adding Database Queries
```typescript
import { getPool } from '@/lib/db';

const pool = getPool();
const client = await pool.connect();
try {
  const result = await client.query('SELECT * FROM table');
  // ... handle result
} finally {
  client.release();
}
```

## Project-Specific Conventions

- **No default exports** except in App Router files (pages, layouts, route handlers)
- **Server components by default** - only add `'use client'` when necessary
- **No emojis or informal language** in user-facing content
- **Security first**: Non-root containers, capability dropping, minimal privileges
- **Monorepo coordination**: Use TurboRepo `dependsOn` for task ordering

## Common Tasks

### Adding a New Page
1. Create `apps/web/src/app/[route]/page.tsx`
2. Use arrow function: `const PageName: NextPage = () => { ... }`
3. Export as default: `export default PageName`
4. If using client features, add `'use client'` at top

### Updating Dependencies
```bash
pnpm add <package> --filter @cleandev/web    # Add to Next.js app
pnpm add <package> -w                        # Add to workspace root
```

### Kubernetes Manifest Updates
1. Edit manifests in `k8s/` directory
2. For secrets, use scripts in `scripts/`:
   - `generate-nextauth-secrets.sh` - Creates sealed secret for NextAuth
   - `generate-postgres-secrets.sh` - Creates sealed secret for PostgreSQL
3. Commit changes to git - ArgoCD will automatically sync (GitOps workflow)
4. **Never use `kubectl apply` directly** - always follow GitOps for reproducibility
