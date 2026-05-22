#!/usr/bin/env bash
# =============================================================================
# git_merge_to_main.sh
# Uso: bash git/git_merge_to_main.sh "mensaje de commit"
#
# Flujo:
#   1. git add -A
#   2. git commit -m "<mensaje>"
#   3. git push origin <rama-actual>
#   4. git checkout main && git pull origin main
#   5. git merge --no-ff <rama-actual> -m "Merge branch '<rama-actual>'"
#   6. git push origin main
#   7. docker compose up -d --build (LOCAL — skip por default)
#   8. deploy remoto vía SSH (scripts/deploy-remote.sh)
#
# Flags via env vars:
#   SKIP_DOCKER_LOCAL=true    (default true)  No rebuilear Docker en tu PC
#   SKIP_DEPLOY_REMOTE=true   (default false) No hacer deploy al servidor
# =============================================================================

set -euo pipefail

# ── Helpers ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Validaciones previas ──────────────────────────────────────────────────────
[[ $# -lt 1 ]] && error "Debes pasar el mensaje de commit como argumento.\n  Uso: bash scripts/git_merge_to_main.sh \"mensaje de commit\""

COMMIT_MSG="$1"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
REPO_ROOT=$(git rev-parse --show-toplevel)
SKIP_DOCKER_LOCAL="${SKIP_DOCKER_LOCAL:-true}"
SKIP_DEPLOY_REMOTE="${SKIP_DEPLOY_REMOTE:-false}"
# Compat con flag viejo: si SKIP_DOCKER=true, respeta ambos.
if [[ "${SKIP_DOCKER:-false}" == "true" ]]; then
    SKIP_DOCKER_LOCAL="true"
fi

[[ "$CURRENT_BRANCH" == "main" ]] && error "Ya estás en 'main'. Cambia a una rama de trabajo antes de ejecutar este script."

info "Rama de trabajo : $CURRENT_BRANCH"
info "Mensaje commit  : $COMMIT_MSG"
echo ""

# ── 1. git add ────────────────────────────────────────────────────────────────
info "1/7  Agregando todos los cambios (git add -A)..."
git add -A
success "git add completado."

# ── 2. git commit ─────────────────────────────────────────────────────────────
info "2/7  Creando commit..."
if git diff --cached --quiet; then
    warn "No hay cambios en el stage. Se omite el commit."
else
    git commit -m "$COMMIT_MSG"
    success "Commit creado: $(git log -1 --oneline)"
fi

# ── 3. git push rama actual ───────────────────────────────────────────────────
info "3/7  Pushing '$CURRENT_BRANCH' a origin..."
git push origin "$CURRENT_BRANCH"
success "Push completado."

# ── 4. Actualizar main local ──────────────────────────────────────────────────
info "4/7  Cambiando a 'main' y actualizando..."
git checkout main
git pull origin main --ff-only
success "main local actualizado."

# ── 5. Merge ──────────────────────────────────────────────────────────────────
info "5/7  Mergeando '$CURRENT_BRANCH' en 'main'..."
git merge --no-ff "$CURRENT_BRANCH" -m "Merge branch '$CURRENT_BRANCH'"
success "Merge completado."

# ── 6. Push main ──────────────────────────────────────────────────────────────
info "6/7  Pushing 'main' a origin..."
git push origin main
success "main publicado en origin."

# ── 7. Rebuild Docker LOCAL (opcional, OFF por default) ──────────────────────
if [[ "$SKIP_DOCKER_LOCAL" == "true" ]]; then
    info "7/8  Skip Docker LOCAL (SKIP_DOCKER_LOCAL=true)."
else
    info "7/8  Reconstruyendo Docker en LOCAL (docker compose up -d --build)..."
    (
        cd "$REPO_ROOT"
        docker compose -f infra/docker-compose.yml up -d --build
    )
    success "Docker local actualizado."
fi

# ── 8. Deploy REMOTO vía SSH ──────────────────────────────────────────────────
if [[ "$SKIP_DEPLOY_REMOTE" == "true" ]]; then
    info "8/8  Skip deploy REMOTO (SKIP_DEPLOY_REMOTE=true)."
else
    info "8/8  Deploy en el servidor remoto..."
    bash "$REPO_ROOT/scripts/deploy-remote.sh"
fi

# ── Resultado ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  ✓ Todo listo. main sincronizado con origin.${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "  Último commit en main:"
git log -1 --oneline
echo ""
echo "  Docker local:  $( [[ "$SKIP_DOCKER_LOCAL" == "true" ]] && echo "omitido" || echo "rebuild ejecutado" )"
echo "  Deploy remoto: $( [[ "$SKIP_DEPLOY_REMOTE" == "true" ]] && echo "omitido" || echo "ejecutado" )"
echo ""
echo "  Para crear una nueva rama de trabajo:"
echo "    git checkout -b nombre-de-tu-nueva-rama"
echo "    git push -u origin nombre-de-tu-nueva-rama"
