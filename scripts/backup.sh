#!/usr/bin/env bash
# backup.sh — Backup de SQLite + media
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "=== Backup Juanma EPK — $TIMESTAMP ==="

# Backup SQLite (desde volumen Docker o path local)
DB_PATH="./apps/api/data/app.db"
if command -v docker &>/dev/null && docker compose -f infra/docker-compose.yml ps api 2>/dev/null | grep -q "running"; then
    echo "→ Copiando SQLite desde contenedor..."
    docker compose -f infra/docker-compose.yml exec api cp /app/data/app.db /tmp/backup.db
    docker compose -f infra/docker-compose.yml cp api:/tmp/backup.db /tmp/app_backup.db
    DB_PATH="/tmp/app_backup.db"
fi

# Crear tar.gz con DB + media
echo "→ Comprimiendo backup..."
tar -czf "$BACKUP_FILE" \
    -C / \
    --exclude="*/originals/*" \
    "$DB_PATH" \
    "$(pwd)/storage/media" 2>/dev/null || true

# Limpar backups con más de 7 días
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +7 -delete 2>/dev/null || true

echo "✓ Backup guardado en: $BACKUP_FILE"
ls -lh "$BACKUP_FILE"
