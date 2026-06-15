# Juanma & The Center People — Sitio oficial + EPK + CMS

Sitio web oficial, EPK profesional y CMS de contenido para la banda peruana **Juanma & The Center People**.

## Estructura del proyecto

```
juanma-epk/
├── apps/
│   ├── web/      # Sitio público (Astro SSR)
│   ├── admin/    # Backoffice CMS (Next.js 14)
│   └── api/      # Backend + API (FastAPI)
├── storage/
│   └── media/    # Multimedia (montado como volumen Docker)
├── infra/        # Docker Compose (dev y producción)
├── scripts/      # Scripts operacionales
├── docs/         # Especificaciones del proyecto
├── .env          # Config real usada por Docker/app (no versionar)
├── .env.example  # Plantilla para crear .env
└── .env.deploy.example # Plantilla opcional para deploy remoto SSH
```

## Archivos de entorno

- `.env`: único archivo real que usa la app en local y producción. Docker Compose lo carga con `--env-file .env` y `env_file: ../.env`.
- `.env.example`: plantilla de variables de la app. Se copia como `.env` y se completa.
- `.env.deploy.example`: plantilla para crear `.env.deploy`, usada solo por `scripts/deploy-remote.sh` para datos SSH/path del servidor. No la usa la app.

## Requisitos

- Docker Desktop (o Docker Engine + Docker Compose v2)
- Git

## Instalación y arranque local

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd juanma-epk

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales

# 3. Inicializar proyecto (primera vez)
bash scripts/init.sh

# 4. Poblar datos iniciales
bash scripts/seed.sh

# 5. Levantar todos los servicios
docker compose -f infra/docker-compose.yml up -d

# 6. Acceder
# Sitio público: http://localhost:3000
# Admin CMS:     http://localhost:3001
# API:           http://localhost:8000
# API Docs:      http://localhost:8000/docs
```

## Deploy en producción (VPS con Traefik)

```bash
# 1. Copiar .env al VPS y configurar con valores de producción
# 2. Asegurarse de que la red nexus_main_net existe en Docker
# 3. Ejecutar deploy
bash scripts/deploy.sh
```

Ver [docs/10_deploy_operacion.md](docs/10_deploy_operacion.md) para instrucciones completas.

## Backup y restore

```bash
# Crear backup (SQLite + media)
bash scripts/backup.sh

# Restaurar desde backup
bash scripts/restore.sh backups/backup_20260519_120000.tar.gz
```

## Tests

```bash
# API
cd apps/api && python -m pytest tests/ -v

# Frontend público
cd apps/web && npx playwright test

# Admin CMS
cd apps/admin && npm test
```

## Documentación técnica

Ver la carpeta [docs/](docs/) para las especificaciones completas del proyecto.
