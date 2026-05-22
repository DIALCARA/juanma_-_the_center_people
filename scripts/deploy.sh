#!/usr/bin/env bash
# deploy.sh — Deploy en producción (VPS con Traefik)
set -e

echo "=== Deploy Juanma & The Center People — PRODUCCIÓN ==="

# Verificar .env
if [ ! -f ".env" ]; then
    echo "ERROR: Falta .env"
    exit 1
fi

# Build de imágenes de producción
echo "→ Construyendo imágenes..."
docker compose -f infra/docker-compose.prod.yml build --no-cache

# Levantar servicios
echo "→ Levantando servicios..."
docker compose -f infra/docker-compose.prod.yml up -d

# Esperar que la API esté lista
echo "→ Esperando API..."
sleep 5
docker compose -f infra/docker-compose.prod.yml exec api curl -sf http://localhost:8000/health || echo "  ⚠ API no responde aún"

echo ""
echo "✓ Deploy completado."
echo "  Web:     https://www.\${DOMAIN}"
echo "  Admin:   https://admin.\${DOMAIN}"
echo "  API:     https://api.\${DOMAIN}"
echo "  Umami:   https://analytics.\${DOMAIN}"
