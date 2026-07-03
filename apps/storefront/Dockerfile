# Next.js storefront — production image
# Build context MUST be the monorepo root (shared pnpm-lock.yaml lives there).
# In Coolify: Build Pack = Dockerfile, Base Directory = / , Dockerfile Location = /apps/storefront/Dockerfile

# ---------- Builder ----------
FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app

# NEXT_PUBLIC_* values are baked into the client bundle at BUILD time.
# In Coolify, add these as env vars marked "Build Variable" so they are passed here.
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_DEFAULT_REGION
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_STRIPE_KEY
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/storefront/package.json apps/storefront/package.json
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter @dtc/storefront...

COPY apps/storefront apps/storefront
WORKDIR /app/apps/storefront
RUN pnpm run build

# ---------- Runner ----------
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8000
ENV HOSTNAME=0.0.0.0

# standalone output already contains a minimal node_modules + server.js
COPY --from=builder /app/apps/storefront/.next/standalone ./
COPY --from=builder /app/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=builder /app/apps/storefront/public ./apps/storefront/public

EXPOSE 8000

CMD ["node", "apps/storefront/server.js"]
