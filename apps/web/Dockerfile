# ── builder ──────────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build

# ── production ────────────────────────────────────────────────────────────────
FROM node:20-slim AS production

ENV NODE_ENV=production
WORKDIR /app

# Astro standalone adapter output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "./dist/server/entry.mjs"]
