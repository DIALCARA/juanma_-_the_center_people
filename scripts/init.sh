#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# init.sh — Primera configuración del proyecto en el servidor
# Ejecutar UNA sola vez antes del primer deploy.
# ─────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Inicializando Juanma & The Center People ==="

# 1. Verificar .env
if [ ! -f "$ROOT_DIR/.env" ]; then
    echo "ERROR: Falta el archivo .env. Copiar .env.example y completarlo."
    echo "  cp .env.example .env && nano .env"
    exit 1
fi

# 2. Crear carpetas de media si no existen
echo "→ Creando estructura de media..."
mkdir -p "$ROOT_DIR/storage/media/images/"{band,live,backstage,press,flyers,covers,misc,misc/originals}
mkdir -p "$ROOT_DIR/storage/media/videos/"{official,live,interviews,rehearsals,misc}
mkdir -p "$ROOT_DIR/storage/media/reels/"{promo,live,backstage,misc}
mkdir -p "$ROOT_DIR/storage/media/downloads/"{public,restricted}
mkdir -p "$ROOT_DIR/storage/media/thumbnails/"{images,videos,reels}
echo "  ✓ Carpetas de media creadas."

# 3. Verificar red Docker (para producción)
if command -v docker &>/dev/null; then
    TRAEFIK_NET="${TRAEFIK_NETWORK:-nexus_main_net}"
    if ! docker network ls | grep -q "$TRAEFIK_NET"; then
        echo "  ⚠ Red Docker '$TRAEFIK_NET' no encontrada."
        echo "    Asegúrate de que Traefik esté corriendo con esa red."
    else
        echo "  ✓ Red Docker '$TRAEFIK_NET' disponible."
    fi
fi

echo ""
echo "✓ Inicialización completa."
echo ""
echo "Siguientes pasos:"
echo "  1. docker compose -f infra/docker-compose.yml up -d"
echo "  2. bash scripts/seed.sh"
echo "  3. Abrir http://localhost:3001 para el CMS"
