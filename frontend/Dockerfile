# Dockerfile — Frontend Next.js
# Multi-stage build untuk production image yang kecil

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies dulu (cache layer)
COPY package*.json ./
RUN npm ci

# Copy semua source
COPY . .

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root untuk security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy hasil build
# folder public dibuat manual karena Next.js tidak wajib punya folder public
RUN mkdir -p ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]