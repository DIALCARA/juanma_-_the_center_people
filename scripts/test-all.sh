#!/usr/bin/env bash
# test-all.sh — Ejecuta todos los tests de todos los servicios
set -e

echo "=== Tests — Juanma & The Center People ==="

# API tests (Python/pytest)
echo ""
echo "─── API tests ───────────────────────────────────────"
if command -v docker &>/dev/null; then
    docker compose -f infra/docker-compose.yml run --rm api \
        python -m pytest tests/ -v --tb=short
else
    cd apps/api && python -m pytest tests/ -v --tb=short; cd ../..
fi

# Frontend tests (Playwright)
echo ""
echo "─── Frontend tests (Playwright) ─────────────────────"
cd apps/web && npx playwright test --reporter=line; cd ../..

# Admin tests (Jest)
echo ""
echo "─── Admin tests (Jest) ──────────────────────────────"
cd apps/admin && npm test -- --watchAll=false; cd ../..

echo ""
echo "✓ Todos los tests completados."
