# ── builder ──────────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Build-time args. En modo `output: "standalone"` Next.js evalúa los rewrites
# y NEXT_PUBLIC_* en BUILD time, no runtime. Necesitamos pasarlos como ARG.
ARG API_BASE_URL=http://api:8000
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV API_BASE_URL=${API_BASE_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build

# ── production ────────────────────────────────────────────────────────────────
FROM node:20-slim AS production

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
