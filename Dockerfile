# Multi-stage Dockerfile for AlgoSeek Web App (React + Express + tRPC)
FROM node:22-slim AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

# Copy dependency definitions
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install all dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY drizzle/ ./drizzle/
COPY data/ ./data/
COPY components.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY drizzle.config.ts ./

# Build client and server bundles
RUN pnpm build

# --- Production Runner Stage ---
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Enable corepack for pnpm in runtime
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts and static assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

EXPOSE 3000

CMD ["node", "dist/index.js"]
