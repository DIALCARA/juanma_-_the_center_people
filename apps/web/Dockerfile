# ── builder ──────────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Build-time args: necesarios para que Astro embeba la URL correcta
# en canonicals, sitemap.xml, og:url, etc.
ARG PUBLIC_SITE_URL=http://localhost:3000
ARG API_BASE_URL=http://api:8000
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}
ENV API_BASE_URL=${API_BASE_URL}

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
