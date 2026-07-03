# Medusa v2 backend — production image
# Build context MUST be the monorepo root (so the root pnpm-lock.yaml is available).
# In Coolify: Build Pack = Dockerfile, Base Directory = / , Dockerfile Location = /apps/backend/Dockerfile

# ---------- Builder ----------
# Debian "slim" (not alpine): Medusa relies on native modules that misbehave on musl.
FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app

# Install with the root lockfile. All workspace member manifests must be present
# for a frozen install to resolve, hence copying both apps' package.json.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/storefront/package.json apps/storefront/package.json
RUN pnpm install --frozen-lockfile

# Build the backend -> produces apps/backend/.medusa/server (standalone app + admin)
COPY apps/backend apps/backend
WORKDIR /app/apps/backend
RUN pnpm run build

# ---------- Runner ----------
FROM node:22-slim AS runner

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app
ENV NODE_ENV=production

# The built server is fully self-contained; install only its production deps.
COPY --from=builder /app/apps/backend/.medusa/server ./
RUN pnpm install --prod

EXPOSE 9000

# Migrations are NOT run here — run them manually once (`npx medusa db:migrate`)
# from the container Terminal. The container only starts the HTTP server.
CMD ["npx", "medusa", "start"]
