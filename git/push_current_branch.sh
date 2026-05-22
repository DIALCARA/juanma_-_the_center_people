#!/usr/bin/env bash
# =============================================================================
# push_current_branch.sh
#
# Uso:
#   bash scripts/push_current_branch.sh "mensaje de commit"
#
# Flujo:
#   1. git add .
#   2. git commit -m "<mensaje>"
#   3. git push -u origin <rama-actual>
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

[[ $# -lt 1 ]] && error "Debes pasar el mensaje de commit.\nUso: bash scripts/push_current_branch.sh \"mensaje de commit\""

COMMIT_MSG="$1"
REMOTE="${REMOTE:-origin}"

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || error "Ejecuta este script dentro de un repositorio Git."

CURRENT_BRANCH="$(git branch --show-current)"
[[ -z "$CURRENT_BRANCH" ]] && error "Estás en detached HEAD. Cambia a una rama antes de ejecutar el script."

git remote get-url "$REMOTE" >/dev/null 2>&1 || error "No existe el remoto '$REMOTE'."

info "Rama actual      : $CURRENT_BRANCH"
info "Remoto           : $REMOTE"
info "Mensaje commit   : $COMMIT_MSG"
echo ""

warn "Se ejecutará 'git add .'. Revisa que no haya secretos o archivos locales sensibles."
git status --short
echo ""

read -r -p "¿Continuar con add, commit y push? [y/N]: " CONFIRM
case "$CONFIRM" in
    y|Y|yes|YES|Yes) ;;
    *) error "Operación cancelada." ;;
esac

info "1/3 Agregando cambios con git add ."
git add .
success "Cambios agregados."

info "2/3 Creando commit."
if git diff --cached --quiet; then
    warn "No hay cambios staged. No se creó commit."
else
    git commit -m "$COMMIT_MSG"
    success "Commit creado: $(git log -1 --oneline)"
fi

info "3/3 Publicando rama '$CURRENT_BRANCH'."
git push -u "$REMOTE" "$CURRENT_BRANCH"
success "Rama publicada y lista para revisión."

echo ""
echo "La otra persona puede descargarla con:"
echo "  git fetch $REMOTE"
echo "  git checkout -b $CURRENT_BRANCH $REMOTE/$CURRENT_BRANCH"
