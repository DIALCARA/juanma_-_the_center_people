#!/usr/bin/env bash
# =============================================================================
# new_branch.sh
# Uso: bash scripts/new_branch.sh
#
# Flujo interactivo:
#   1. Selecciona el tipo de acción (lista numerada)
#   2. Ingresa descripción en lenguaje libre
#   3. El script formatea el nombre y crea + publica la rama
# =============================================================================

set -euo pipefail

# ── Colores ───────────────────────────────────────────────────────────────────
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

# ── Tipos de acción disponibles ───────────────────────────────────────────────
ACTIONS=(
    "feat      │ Nueva funcionalidad"
    "fix       │ Corrección de bug"
    "refactor  │ Refactorización sin cambio funcional"
    "chore     │ Tareas de mantenimiento / configs"
    "test      │ Agregar o corregir tests"
    "docs      │ Solo documentación"
    "style     │ Formato / estilo (sin lógica)"
    "perf      │ Mejora de performance"
    "ci        │ Cambios en CI/CD / pipelines"
    "hotfix    │ Fix urgente en producción"
)

# ── Formatear descripción al estándar git ────────────────────────────────────
# Reglas: minúsculas, sin tildes/eñes, espacios → guiones,
#         solo alfanuméricos y guiones, sin guiones al inicio/fin,
#         sin guiones dobles.
format_slug() {
    local input="$1"
    local slug

    # Convertir a minúsculas
    slug="${input,,}"

    # Reemplazar caracteres acentuados y ñ
    slug=$(echo "$slug" | sed \
        -e 's/[áàäâã]/a/g' \
        -e 's/[éèëê]/e/g' \
        -e 's/[íìïî]/i/g' \
        -e 's/[óòöôõ]/o/g' \
        -e 's/[úùüû]/u/g' \
        -e 's/ñ/n/g' \
        -e 's/ç/c/g')

    # Espacios y guiones bajos → guiones
    slug="${slug//[_ ]/-}"

    # Eliminar cualquier carácter que no sea alfanumérico o guion
    slug=$(echo "$slug" | tr -cd '[:alnum:]-')

    # Colapsar guiones múltiples en uno
    slug=$(echo "$slug" | sed 's/-\{2,\}/-/g')

    # Eliminar guiones al inicio y al final
    slug="${slug#-}"
    slug="${slug%-}"

    echo "$slug"
}

# ── Header ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║        Crear nueva rama de trabajo       ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Mostrar rama actual
CURRENT=$(git rev-parse --abbrev-ref HEAD)
echo -e "  Rama actual: ${YELLOW}$CURRENT${NC}"
echo ""

# ── Paso 1: Selección de acción ───────────────────────────────────────────────
echo -e "${BOLD}Paso 1/2 — Tipo de acción:${NC}"
echo ""

for i in "${!ACTIONS[@]}"; do
    printf "  ${CYAN}%2d)${NC}  %s\n" "$((i+1))" "${ACTIONS[$i]}"
done

echo ""
while true; do
    read -rp "  Selecciona una opción [1-${#ACTIONS[@]}]: " choice
    if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= ${#ACTIONS[@]} )); then
        break
    fi
    echo -e "  ${YELLOW}Opción inválida. Ingresa un número del 1 al ${#ACTIONS[@]}.${NC}"
done

# Extraer solo el nombre de la acción (antes del │)
ACTION_FULL="${ACTIONS[$((choice-1))]}"
ACTION=$(echo "$ACTION_FULL" | awk -F'│' '{print $1}' | tr -d ' ')

echo ""

# ── Paso 2: Descripción ───────────────────────────────────────────────────────
echo -e "${BOLD}Paso 2/2 — Descripción de la rama:${NC}"
echo -e "  ${CYAN}(Puede contener espacios, tildes, mayúsculas — se formateará automáticamente)${NC}"
echo ""

while true; do
    read -rp "  Descripción: " description
    [[ -n "$description" ]] && break
    echo -e "  ${YELLOW}La descripción no puede estar vacía.${NC}"
done

# ── Formatear y construir nombre ──────────────────────────────────────────────
SLUG=$(format_slug "$description")
BRANCH_NAME="${ACTION}/${SLUG}"

echo ""
echo -e "  Nombre de rama generado: ${GREEN}${BOLD}${BRANCH_NAME}${NC}"
echo ""

# ── Confirmación ──────────────────────────────────────────────────────────────
read -rp "  ¿Crear y publicar esta rama? [Y/n]: " confirm
confirm="${confirm:-Y}"

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "  ${YELLOW}Cancelado.${NC}"
    exit 0
fi

# ── Asegurar que estamos en main actualizado ──────────────────────────────────
echo ""
echo -e "  Actualizando main antes de crear la rama..."
git checkout main --quiet
git pull origin main --ff-only --quiet

# ── Crear y publicar rama ─────────────────────────────────────────────────────
git checkout -b "$BRANCH_NAME"
git push -u origin "$BRANCH_NAME"

echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║  ✓ Rama '$BRANCH_NAME' creada y publicada.${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Cuando termines tu trabajo, ejecuta:"
echo ""
echo "    bash scripts/git_merge_to_main.sh \"tu mensaje de commit\""
echo ""
