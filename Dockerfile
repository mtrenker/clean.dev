# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY apps/web/package.json ./apps/web/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/db/package.json ./packages/db/
COPY packages/pm/package.json ./packages/pm/

RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Reinstall to ensure workspace links are properly established (uses cache from deps stage)
RUN corepack enable pnpm && pnpm install --frozen-lockfile
RUN pnpm run build
# Compile the custom server (TypeScript → CommonJS for production use)
RUN pnpm --filter @cleandev/web run build:server

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/content ./apps/web/content

# Custom server entry point (TypeScript compiled to JS) and its runtime modules.
# The standalone output does not trace files outside Next.js routes, so we copy
# the compiled server and the ws WebSocket library explicitly.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/custom-server.js ./apps/web/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/src/server/cockpit-ws.js ./apps/web/src/server/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/src/lib/cockpit-repo.js ./apps/web/src/lib/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/src/lib/db.js ./apps/web/src/lib/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/src/lib/logger.js ./apps/web/src/lib/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/src/lib/cockpit/projector.js ./apps/web/src/lib/cockpit/
# Runtime modules used only by the custom server may not be included in the
# Next standalone trace. Copy them explicitly so custom-server.js can resolve
# cockpit WS/repository dependencies at startup.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/next ./node_modules/next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/ws ./node_modules/ws
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/zod ./node_modules/zod
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg ./node_modules/pg
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg-cloudflare ./node_modules/pg-cloudflare
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg-connection-string ./node_modules/pg-connection-string
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg-int8 ./node_modules/pg-int8
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg-pool ./node_modules/pg-pool
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg-protocol ./node_modules/pg-protocol
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg-types ./node_modules/pg-types
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pgpass ./node_modules/pgpass
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/postgres-array ./node_modules/postgres-array
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/postgres-bytea ./node_modules/postgres-bytea
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/postgres-date ./node_modules/postgres-date
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/postgres-interval ./node_modules/postgres-interval
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/split2 ./node_modules/split2
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/xtend ./node_modules/xtend
COPY --from=builder --chown=nextjs:nodejs /app/packages/cockpit-protocol/package.json ./node_modules/@cleandev/cockpit-protocol/package.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/cockpit-protocol/dist ./node_modules/@cleandev/cockpit-protocol/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/cockpit-store/package.json ./node_modules/@cleandev/cockpit-store/package.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/cockpit-store/dist ./node_modules/@cleandev/cockpit-store/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/db/package.json ./node_modules/@cleandev/db/package.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/db/dist ./node_modules/@cleandev/db/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/pm/package.json ./node_modules/@cleandev/pm/package.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/pm/dist ./node_modules/@cleandev/pm/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/db/drizzle ./packages/db/drizzle

# Build-time smoke for custom-server-only modules that Next standalone tracing
# does not validate. This catches missing explicit COPY entries before deploy.
RUN node -e "require('./apps/web/src/server/cockpit-ws.js'); require('./apps/web/src/lib/cockpit-repo.js'); require('./apps/web/src/lib/cockpit/projector.js')" \
  && test -f ./packages/db/drizzle/meta/_journal.json

USER nextjs

EXPOSE 3000

ENV PORT=3000

# Custom server handles both HTTP (via Next.js) and WebSocket (/api/cockpit/ws).
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/custom-server.js"]
