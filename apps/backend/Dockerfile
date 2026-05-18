# syntax=docker/dockerfile:1

# Stage 1: builder — install all deps + compile TypeScript
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Copy workspace manifests first (layer caching)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/
COPY packages/config/package.json packages/config/

RUN pnpm install --frozen-lockfile

# Copy full source
COPY apps/backend apps/backend
COPY packages/config packages/config
COPY turbo.json ./

RUN pnpm --filter @lentil/backend build

# Stage 2: deployer — prune to production-only dependencies
FROM builder AS deployer

RUN pnpm --filter @lentil/backend deploy --prod /deploy

# Stage 3: production — minimal runtime image
FROM node:22-alpine AS production

RUN apk add --no-cache tini wget

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app

COPY --from=deployer --chown=nodejs:nodejs /deploy/dist /app/dist
COPY --from=deployer --chown=nodejs:nodejs /deploy/node_modules /app/node_modules
COPY --from=deployer --chown=nodejs:nodejs /deploy/package.json /app/

RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

USER nodejs
EXPOSE 3850

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3850/health || exit 1
