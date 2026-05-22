#!/usr/bin/env bash
# =============================================================================
# deploy-remote.sh
# Despliega la versión actual de main en el servidor remoto vía SSH.
#
# Configuración (sobrescribible via env vars o .env.deploy):
#   DEPLOY_SSH_HOST     alias SSH o IP del servidor       (default: Nexus)
#   DEPLOY_SSH_USER     usuario SSH                       (default: root)
#   DEPLOY_SSH_PORT     puerto SSH                        (default: 22)
#   DEPLOY_REMOTE_PATH  path del repo en el server        (default: /opt/services/jtcp)
#   DEPLOY_COMPOSE_FILE archivo compose a usar            (default: infra/docker-compose.prod.yml)
#   DEPLOY_BRANCH       rama a deployar                   (default: main)
#   HEALTH_URL          URL para healthcheck post-deploy  (default: http://localhost:8000/health desde el server)
#
# Uso:
#   bash scripts/deploy-remote.sh
#   o desde git_merge_to_main.sh paso final
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Cargar config desde .env.deploy si existe ────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_DEPLOY="$REPO_ROOT/.env.deploy"

if [[ -f "$ENV_DEPLOY" ]]; then
    info "Cargando configuración desde .env.deploy"
    # shellcheck source=/dev/null
    set -a; source "$ENV_DEPLOY"; set +a
fi

# ── Defaults ──────────────────────────────────────────────────────────────────
DEPLOY_SSH_HOST="${DEPLOY_SSH_HOST:-Nexus}"
DEPLOY_SSH_USER="${DEPLOY_SSH_USER:-root}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
DEPLOY_REMOTE_PATH="${DEPLOY_REMOTE_PATH:-/opt/services/jtcp}"
DEPLOY_COMPOSE_FILE="${DEPLOY_COMPOSE_FILE:-infra/docker-compose.prod.yml}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
HEALTH_URL="${HEALTH_URL:-http://localhost:8000/health}"

info "Servidor : ${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}:${DEPLOY_SSH_PORT}"
info "Path     : $DEPLOY_REMOTE_PATH"
info "Compose  : $DEPLOY_COMPOSE_FILE"
info "Branch   : $DEPLOY_BRANCH"
echo ""

# ── 1. Test SSH ───────────────────────────────────────────────────────────────
info "1/5  Probando conexión SSH..."
if ! ssh -p "$DEPLOY_SSH_PORT" -o BatchMode=yes -o ConnectTimeout=10 \
        "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}" "echo connected" >/dev/null 2>&1; then
    error "No se pudo conectar a ${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}:${DEPLOY_SSH_PORT}.\n  Verifica que la clave SSH esté configurada (sin password)."
fi
success "Conexión SSH OK."

# ── 2. Verificar que el repo exista y tenga main ──────────────────────────────
info "2/5  Verificando estado del repo en el servidor..."
ssh -p "$DEPLOY_SSH_PORT" "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}" \
    "test -d '${DEPLOY_REMOTE_PATH}/.git'" \
    || error "No existe ${DEPLOY_REMOTE_PATH}/.git en el servidor. Cloná el repo primero:\n  ssh ${DEPLOY_SSH_HOST} 'cd $(dirname "$DEPLOY_REMOTE_PATH") && git clone <url-repo> $(basename "$DEPLOY_REMOTE_PATH")'"
success "Repo presente en el servidor."

# ── 3. Pull + rebuild (todo en una sola sesión SSH) ───────────────────────────
info "3/5  Pull + rebuild + recreate de contenedores..."
ssh -p "$DEPLOY_SSH_PORT" "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}" bash <<EOF
set -euo pipefail
cd "${DEPLOY_REMOTE_PATH}"

echo "  → git fetch origin"
git fetch origin --prune

echo "  → reset --hard origin/${DEPLOY_BRANCH}"
git reset --hard "origin/${DEPLOY_BRANCH}"

echo "  → último commit: \$(git log -1 --oneline)"

if [[ ! -f .env ]]; then
    echo "[WARN] .env no existe en el servidor. Copiá .env.example y completalo."
    exit 1
fi

echo "  → docker compose down (graceful)"
docker compose -f "${DEPLOY_COMPOSE_FILE}" down --remove-orphans || true

echo "  → docker compose up -d --build"
docker compose -f "${DEPLOY_COMPOSE_FILE}" up -d --build

echo "  → docker compose ps"
docker compose -f "${DEPLOY_COMPOSE_FILE}" ps
EOF
success "Deploy ejecutado en el servidor."

# ── 4. Health check ───────────────────────────────────────────────────────────
info "4/5  Health check (esperando 15s para que arranquen los contenedores)..."
sleep 15
HEALTH_OK=$(ssh -p "$DEPLOY_SSH_PORT" "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}" \
    "curl -fsS -m 10 '${HEALTH_URL}' 2>/dev/null || echo FAIL")

if [[ "$HEALTH_OK" == "FAIL" || -z "$HEALTH_OK" ]]; then
    warn "El healthcheck a $HEALTH_URL falló. Los contenedores arrancaron pero la API no responde aún."
    warn "Revisá logs con: ssh ${DEPLOY_SSH_HOST} 'cd ${DEPLOY_REMOTE_PATH} && docker compose -f ${DEPLOY_COMPOSE_FILE} logs --tail=50 api'"
else
    success "API responde: $HEALTH_OK"
fi

# ── 5. Resumen ────────────────────────────────────────────────────────────────
info "5/5  Resumen de servicios:"
ssh -p "$DEPLOY_SSH_PORT" "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}" \
    "cd '${DEPLOY_REMOTE_PATH}' && docker compose -f '${DEPLOY_COMPOSE_FILE}' ps --format 'table {{.Service}}\t{{.State}}\t{{.Status}}'"

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  ✓ Deploy remoto completado.${NC}"
echo -e "${GREEN}============================================================${NC}"
