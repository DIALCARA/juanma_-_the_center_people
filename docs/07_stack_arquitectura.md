# 07 - Stack y arquitectura

## Stack aprobado

```txt
Frontend público: Astro (modo SSR/hybrid con adapter Node.js)
Backoffice CMS: Next.js 14 (App Router, TypeScript) — subdominio admin.DOMINIO
Backend/API CMS: FastAPI
Base de datos inicial: SQLite (API) + PostgreSQL (Umami)
Analytics: Umami (self-hosted)
Email: SMTP vía Zoho Mail (cuenta gratuita con dominio propio)
Deploy: Docker Compose + Traefik externo (instancia existente en VPS)
Hosting: VPS propio con Traefik ya corriendo
Red Docker: nexus_main_net (externa, gestionada por el Traefik del VPS)
Dominio: pendiente; se puede usar subdominio técnico desde el inicio
Storage inicial: filesystem en servidor
Idioma UI: español al 100% (web pública y backoffice)
```

## Justificación de Astro SSR

Astro en modo SSR (Server Side Rendering) con hybrid rendering es adecuado porque:

- El contenido es gestionado desde el CMS y debe reflejarse inmediatamente sin rebuild.
- El botón "Publicar" en el CMS equivale a guardar en DB — el contenido queda live al instante.
- Las páginas pueden usar pre-rendering estático por defecto y rendering dinámico donde sea necesario.
- Sigue siendo SEO-friendly, rápido y con poco JavaScript en cliente.
- Compatible con Docker sin pipeline de rebuild.

Usar Astro para:

- Renderizar páginas públicas con contenido live desde API.
- Consumir API del backend (FastAPI).
- Manejar estructura híbrida one-page + páginas internas.
- Usar componentes interactivos solo donde haga falta (islands).

## Justificación de FastAPI

FastAPI será usado para:

- API del CMS.
- Login.
- CRUD de contenido.
- Subida de archivos.
- Gestión de descargas.
- Solicitudes de descarga.
- Formulario de contacto vía SMTP (Zoho Mail).

## Justificación de SQLite

SQLite es suficiente para MVP porque:

- Bajo tráfico inicial.
- Pocos usuarios administradores.
- Menor complejidad operativa.
- Fácil backup.
- Fácil migrar luego a PostgreSQL.

La capa de acceso a datos debe diseñarse para migración futura.

## Dependencias clave del API (Python)

```txt
fastapi>=0.115           framework HTTP
uvicorn[standard]>=0.32  servidor ASGI
sqlalchemy>=2.0          ORM
alembic>=1.14            migraciones
pydantic[email]>=2.11    validación + EmailStr
pydantic-settings>=2.7   config desde .env
python-jose[cryptography]>=3.3   JWT
bcrypt>=4.2,<5.0         hash de passwords (uso directo, sin passlib)
python-multipart>=0.0.12 uploads multipart
pillow>=11.3             procesamiento de imágenes (WebP, thumbnails)
httpx>=0.28              cliente HTTP genérico
slowapi>=0.1.9           rate limiting
aiofiles>=24.1           IO async para archivos
aiosmtplib>=3.0          envío de email SMTP async (Zoho Mail)
```

> **Notas de implementación:**
> - **No usamos `passlib`**: la versión 1.7.4 no es compatible con `bcrypt 5+`. Usamos `bcrypt` directamente en `app/core/security.py`.
> - **Python 3.14**: las versiones de `pydantic-core` y `pillow` deben ser recientes (≥2.46 y ≥11.3) para tener wheels prebuilt.
> - **No usamos `python-magic`**: requiere libmagic en Windows. La validación de tipo de archivo se hace por extensión + magic bytes en código propio.

## Arquitectura lógica

```txt
[Visitante]
    ↓
[Astro Frontend Público]
    ↓ API REST
[FastAPI Backend]
    ↓
[SQLite]
    ↓
[Filesystem /media]

[Admin/Editor]
    ↓
[Backoffice]
    ↓ API REST
[FastAPI Backend]
```

## Backoffice

**Decisión aprobada: Opción B — Frontend admin separado (Next.js)**

- App independiente en `apps/admin/`.
- Framework: Next.js 14 con App Router y TypeScript.
- Accesible por subdominio: `admin.DOMINIO` (no ruta `/admin`).
- UI 100% en español.
- Consume la misma API FastAPI que el frontend público.

## Monorepo aprobado

```txt
juanma-epk/
├── apps/
│   ├── web/              # Astro SSR — sitio público
│   ├── admin/            # Next.js 14 — backoffice CMS
│   └── api/              # FastAPI — backend + API
├── storage/
│   └── media/            # volumen Docker local
├── infra/
│   ├── docker-compose.yml        # desarrollo local
│   └── docker-compose.prod.yml   # producción (con labels Traefik)
├── docs/
│   └── devspec/          # los 12 documentos de especificación
├── scripts/
│   ├── init.sh
│   ├── seed.py
│   ├── backup.sh
│   ├── restore.sh
│   ├── build-prod.sh
│   └── deploy.sh
├── .env.example
├── .env.deploy.example
└── README.md
```

## Servicios Docker

MVP (sin servicio Traefik propio — se usa el existente en el VPS):

```txt
web      # Astro SSR con Node.js
admin    # Next.js 14
api      # FastAPI + SQLite
umami    # Analytics self-hosted
umami-db # PostgreSQL para Umami
```

SQLite vive como volumen del servicio `api`.

Opcional para operación:

```txt
backup   # script periódico de backup
```

## API pública vs privada

API pública:

- Lectura de contenido visible.
- Envío de formulario contacto.
- Solicitud de descarga.

API privada:

- Login.
- CRUD de contenido.
- Uploads.
- Aprobación de descargas.
- Gestión de configuración.

## Variables de entorno

```txt
# General
APP_ENV=development|production
PUBLIC_SITE_URL=https://www.DOMINIO.com
ADMIN_SITE_URL=https://admin.DOMINIO.com
API_BASE_URL=https://api.DOMINIO.com

# Base de datos
DATABASE_URL=sqlite:////app/data/app.db

# Storage
MEDIA_ROOT=/media/juanma-center-people
MEDIA_PUBLIC_URL=https://api.DOMINIO.com/media

# Auth
JWT_SECRET=<string aleatoria 64 chars>
JWT_EXPIRE_MINUTES=1440

# Email SMTP (Zoho Mail)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=noreply@<tu-dominio>
SMTP_PASSWORD=<password de aplicación generado en Zoho>
SMTP_FROM_EMAIL=noreply@<tu-dominio>
SMTP_FROM_NAME=Juanma & The Center People
SMTP_USE_TLS=true
ADMIN_NOTIFICATION_EMAIL=

# Analytics
UMAMI_DB_PASSWORD=
UMAMI_APP_SECRET=

# Traefik (producción)
TRAEFIK_NETWORK=nexus_main_net
DOMAIN=juanma.com
CERT_RESOLVER=letsencrypt

# Admin inicial (solo para seed)
INITIAL_ADMIN_EMAIL=
INITIAL_ADMIN_PASSWORD=
```

## Multiidioma

No implementar todos los idiomas en MVP.

Preparar modelo para:

- Español inicial.
- Inglés fase 2.
- Portugués, Italiano, Francés, Alemán fase posterior.
- Japonés opcional estratégico.

Diseño técnico:

```txt
content_translations
locale
field_name
translated_value
```

O estructura JSON por entidad si se prefiere simplicidad.
