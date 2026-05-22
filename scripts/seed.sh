#!/usr/bin/env bash
# seed.sh — Poblar la base de datos con datos iniciales
set -e

echo "=== Ejecutando seed de datos iniciales ==="

# Detectar si está corriendo en Docker o localmente
if command -v docker &>/dev/null && docker compose -f infra/docker-compose.yml ps api 2>/dev/null | grep -q "running"; then
    echo "→ Ejecutando seed via Docker..."
    docker compose -f infra/docker-compose.yml exec api python scripts/seed.py
else
    echo "→ Ejecutando seed localmente..."
    cd apps/api && python scripts/seed.py
fi

echo "✓ Seed completado."
