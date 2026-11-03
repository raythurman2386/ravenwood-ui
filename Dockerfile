# Production image for Ravenwood UI (docs site + shadcn registry, Next.js standalone output).
# Single container, listens on port 3000. Needs no env vars or secrets.
#
#   docker build -t ravenwood-ui .
#   docker run --rm -p 3000:3000 ravenwood-ui
#
# No BuildKit-only syntax (RUN --mount, heredocs): GoForge builds with the classic builder.

ARG NODE_VERSION=24

# ---- deps: install node_modules from the lockfile ----
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable
# package.json pins pnpm via "packageManager"; corepack fetches that exact version.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- builder: maplibre worker copy + shadcn build + next build (standalone) ----
FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app
RUN corepack enable
ENV NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---- runner: minimal runtime ----
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# public/ comes from the builder: it holds the generated public/maplibre worker
# and the freshly built public/r registry items.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/r/registry.json').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
