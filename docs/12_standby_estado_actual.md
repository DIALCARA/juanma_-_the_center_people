# 12 — Estado del proyecto y plan para retomar

> **Snapshot del:** 2026-05-22
> **Estado:** En standby a la espera de compra de dominio
> **Bloqueante:** Sin dominio no se puede activar HTTPS vía Let's Encrypt ni desplegar con el `docker-compose.prod.yml` actual (que asume `${DOMAIN}` + Traefik con cert resolver).

---

## TL;DR — al retomar, leer esto primero

1. El proyecto está **funcional en local** (API + Web + Admin + DB SQLite con contenido cargado).
2. Lo que falta para verlo online: **comprar dominio + DNS + activar deploy automático** (los scripts ya están listos).
3. Para retomar local: levantar API/Web/Admin (sin Docker o con Docker), las imágenes y datos cargados siguen en tu carpeta de proyecto.
4. Para deployar: ejecutar el plan de la sección "Cuando llegue el dominio" al final de este doc.

---

## Estado por módulo (CMS)

| Módulo | Estado | Notas |
|---|---|---|
| Autenticación (login JWT) | ✅ Validado | HttpOnly cookie, funciona local |
| Configuración del sitio | ✅ Validado | Guarda site_settings incluyendo límites de upload |
| Secciones | ✅ 100% funcional | `is_enabled`, `show_in_home`, `empty_state_message` se respetan en home/header/página individual con `SectionUnavailable` |
| Banda | ✅ 100% funcional | Bio corta/larga, integrantes con foto (vía MediaPicker) + bio breve + bio completa, quick facts. Layout `/banda` centra integrantes en última fila según N (1, 2, 3) |
| Multimedia | ✅ 100% funcional | 3 tipos (image/video/reel), cascada tipo→categoría con selects deshabilitados sin tipo, drag&drop, multi-upload, toggle `is_featured` desde la grilla. Galerías públicas con filtros por categoría |
| Música | ⏳ Sin validar end-to-end | CRUD existe, falta probarlo con datos reales |
| Fechas | ⏳ Sin validar end-to-end | CRUD existe, falta probar countdown del home |
| Prensa/EPK | ⏳ Sin validar end-to-end | CRUD de citas existe |
| Rider técnico | ⏳ Sin validar end-to-end | 9 sub-secciones implementadas |
| Descargas | 🔄 Parcial | Endpoint de upload funciona, MediaPicker para "Elegir de la galería" funciona. Falta validar flujo completo de solicitud + aprobación + email |
| Mensajes | ⏳ Sin validar end-to-end | Bandeja funciona en CMS, faltó probar envío real desde el form público |
| Solicitudes de descarga | ⏳ Sin validar end-to-end | Aprobar/rechazar implementado, falta probar email Mailgun |

## Estado de la home pública

Cinco mejoras de impacto aplicadas (detalle en `03_diseno_visual_identidad.md`):

- **A** Video de fondo en hero (estructura lista, falta cargar `apps/web/public/hero-bg.mp4`)
- **B** Animación de entrada del logo (fade + scale + blur + leve glitch)
- **C** Marquee horizontal con texto dinámico (release destacado / próxima fecha)
- **D** Countdown al próximo show (solo aparece si hay un evento futuro cargado)
- **E** Hover de galería con borde rojo + overlay de título y categoría

## Estado del repo + deploy

| Item | Estado |
|---|---|
| Repo en GitHub | ✅ `main` actualizado con el cleanup, sin large files |
| `.gitignore` | ✅ Cubre DB, media, hero-bg, settings.local, archivos basura |
| Script `git_merge_to_main.sh` | ✅ Hace commit + push + merge + (opcional) deploy SSH al server |
| Script `scripts/deploy-remote.sh` | ✅ Pull + rebuild Docker + health check en el server vía SSH |
| `.env.deploy` (config SSH) | ✅ Configurado para Nexus / 147.93.176.52 / `/opt/services/jtcp` |
| Servidor Nexus | ⚠️ Tiene una versión vieja del repo, Docker + Compose instalados, Traefik corriendo en `nexus_main_net` |
| Dominio | ❌ **Pendiente compra** — bloqueante para deploy |

---

## Cómo retomar el trabajo local (después del standby)

### 1. Reactivar el venv de la API
```powershell
cd "C:\Users\hinop\Desktop\Diego\juanma_-_the_center_people\apps\api"
.\.venv\Scripts\Activate.ps1
```

### 2. Levantar los 3 servicios en terminales separadas

**Terminal 1 — API (FastAPI):**
```powershell
cd "C:\Users\hinop\Desktop\Diego\juanma_-_the_center_people\apps\api"
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Web (Astro):**
```powershell
cd "C:\Users\hinop\Desktop\Diego\juanma_-_the_center_people\apps\web"
$env:API_BASE_URL = "http://127.0.0.1:8000"
npm run dev
```

**Terminal 3 — Admin (Next.js):**
```powershell
cd "C:\Users\hinop\Desktop\Diego\juanma_-_the_center_people\apps\admin"
$env:API_BASE_URL = "http://127.0.0.1:8000"
npm run dev
```

### 3. Acceder

- Web pública: http://localhost:3000
- Admin CMS: http://localhost:3001 (login: `admin@local.dev` / `admin123`)
- API docs: http://localhost:8000/docs

### 4. Datos cargados

La DB local con todo el contenido cargado vive en:
- `apps/api/data/app.db` (SQLite — está en `.gitignore`, no se subió al repo)
- `apps/api/storage/media/` (carpeta con las imágenes procesadas que cargaste — también ignorada)

> ⚠️ **El path `apps/api/storage/media/` es por un bug conocido**: `MEDIA_ROOT=./storage/media` en `.env.local.example` es relativo al cwd donde corre uvicorn (`apps/api/`). En producción Docker queda en `/media/juanma-center-people/` y no hay problema. Para fixearlo en local habría que cambiar a path absoluto en `config.py`. No urgente.

---

## Bloqueante actual: dominio

El proyecto está **listo para deploy** pero el `docker-compose.prod.yml` actual usa labels Traefik con `Host(\`api.${DOMAIN}\`)`, `Host(\`www.${DOMAIN}\`)`, `Host(\`admin.${DOMAIN}\`)` y `tls.certresolver=letsencrypt`. Sin un dominio real, no se puede emitir certificado HTTPS y los hosts no resuelven.

### Alternativas evaluadas mientras esperás el dominio

Se decidió **dejar en standby** en lugar de implementar una solución temporal. Las opciones eran:

- **A** Exponer puertos directos por IP (`http://147.93.176.52:3000` etc.) — funciona pero feo y rompe HTTPS-only del admin
- **B** Usar `nip.io` como dominio fake (`147-93-176-52.nip.io`) — todo el stack de Traefik funcionaría pero sin HTTPS válido
- **C** Dominio real ✅ — elegida

---

## Cuando llegue el dominio: plan de deploy paso a paso

Asumiendo que comprás el dominio `juanma-band.com` (reemplazá por el real):

### 1. Configurar DNS (en tu registrador)

Apuntar todo a la IP del VPS:

```
A     juanma-band.com       → 147.93.176.52
A     www.juanma-band.com   → 147.93.176.52
A     api.juanma-band.com   → 147.93.176.52
A     admin.juanma-band.com → 147.93.176.52
```

Esperar propagación (15 min a 24h). Verificar con:
```powershell
nslookup juanma-band.com
nslookup api.juanma-band.com
```

### 2. Preparar el `.env` del servidor

Conectarse al server y crear el `.env` definitivo:

```bash
ssh Nexus
cd /opt/services/jtcp

# Generar JWT secret nuevo
openssl rand -hex 32   # copiá el output

# Crear/editar .env
nano .env
```

Contenido del `.env` de producción:
```env
APP_ENV=production

# URLs de producción
PUBLIC_SITE_URL=https://www.juanma-band.com
ADMIN_SITE_URL=https://admin.juanma-band.com
API_BASE_URL=https://api.juanma-band.com

# DB
DATABASE_URL=sqlite:////app/data/app.db

# Storage
MEDIA_ROOT=/media/juanma-center-people
MEDIA_PUBLIC_URL=https://api.juanma-band.com/media

# Auth — REEMPLAZAR con el output de openssl
JWT_SECRET=<el-output-de-openssl-rand-hex-32>
JWT_EXPIRE_MINUTES=1440

# Email — completar con cuenta Mailgun real
MAILGUN_API_KEY=key-XXXXXXXX
MAILGUN_DOMAIN=mg.juanma-band.com
MAILGUN_FROM_EMAIL=noreply@mg.juanma-band.com
ADMIN_NOTIFICATION_EMAIL=admin@juanma-band.com

# Umami (opcional — se completa después de crear el sitio en Umami)
UMAMI_DB_PASSWORD=<password-largo-aleatorio>
UMAMI_APP_SECRET=<otro-string-largo-aleatorio>
UMAMI_WEBSITE_ID=

# Admin inicial — para el seed
INITIAL_ADMIN_EMAIL=tu-email-real@juanma-band.com
INITIAL_ADMIN_PASSWORD=<password-seguro>

# Traefik
TRAEFIK_NETWORK=nexus_main_net
DOMAIN=juanma-band.com
CERT_RESOLVER=letsencrypt

# CORS
CORS_ORIGINS=https://www.juanma-band.com,https://admin.juanma-band.com
```

### 3. Actualizar el código del server

Desde tu PC local:

```powershell
cd "C:\Users\hinop\Desktop\Diego\juanma_-_the_center_people"
bash scripts/deploy-remote.sh
```

Esto hace: SSH a Nexus → `git fetch && git reset --hard origin/main` → `docker compose up -d --build` → health check.

### 4. Inicializar la DB (PRIMERA vez en el server)

```bash
ssh Nexus
cd /opt/services/jtcp
docker compose -f infra/docker-compose.prod.yml exec api python scripts/seed.py
```

Esto crea: usuario admin (con `INITIAL_ADMIN_EMAIL/PASSWORD`), 9 secciones, 3 tipos de media, 15 categorías, bio placeholder.

### 5. Subir los logos al server

Los logos están en `.gitignore` y no viajan por git. Subirlos manualmente:

```powershell
scp apps/web/public/logo-light.png Nexus:/opt/services/jtcp/apps/web/public/
scp apps/web/public/logo-dark.png Nexus:/opt/services/jtcp/apps/web/public/
scp apps/web/public/logo-source.png Nexus:/opt/services/jtcp/apps/web/public/
```

Después en el server, recargar el web:
```bash
ssh Nexus 'cd /opt/services/jtcp && docker compose -f infra/docker-compose.prod.yml restart web'
```

### 6. (Opcional) Subir el hero video

Si tenés `hero-bg.mp4` listo:
```powershell
scp apps/web/public/hero-bg.mp4 Nexus:/opt/services/jtcp/apps/web/public/
ssh Nexus 'cd /opt/services/jtcp && docker compose -f infra/docker-compose.prod.yml restart web'
```

### 7. (Opcional) Migrar contenido cargado en local al server

Si querés llevarte la DB + media de pruebas al server (en lugar de cargar todo desde cero):

```powershell
# En local: generar el ZIP de export
powershell -ExecutionPolicy Bypass -File scripts\export-data.ps1

# Subir el ZIP
scp backups/data_export_YYYYMMDD_HHMMSS.zip Nexus:/tmp/
```

```bash
# En el server: descomprimir y mover
ssh Nexus
cd /tmp
unzip data_export_*.zip -d juanma-restore
docker compose -f /opt/services/jtcp/infra/docker-compose.prod.yml down
docker run --rm -v jtcp_api_data:/data -v /tmp/juanma-restore:/restore alpine cp /restore/app.db /data/
docker run --rm -v jtcp_media_data:/media -v /tmp/juanma-restore:/restore alpine cp -r /restore/media/. /media/
docker compose -f /opt/services/jtcp/infra/docker-compose.prod.yml up -d
```

(Los nombres de volumen pueden variar — verificar con `docker volume ls`.)

### 8. Verificar todo funciona

```bash
ssh Nexus 'cd /opt/services/jtcp && docker compose -f infra/docker-compose.prod.yml ps'
curl -I https://www.juanma-band.com
curl -I https://admin.juanma-band.com
curl https://api.juanma-band.com/health
```

### 9. Cambiar la contraseña del admin

Logueate en `https://admin.juanma-band.com` con `INITIAL_ADMIN_EMAIL/PASSWORD` del `.env`, y como **primer paso**, cambiá la contraseña desde el módulo de configuración (si existe) o crear un endpoint para esto. **Actualmente no hay flujo de change password en el CMS** — TODO post-MVP.

### 10. (Opcional) Activar Umami

Levantar el contenedor:
```bash
ssh Nexus 'cd /opt/services/jtcp && docker compose -f infra/docker-compose.prod.yml up -d umami umami-db'
```

Acceder a `https://analytics.juanma-band.com` (o el subdominio que decidas), crear cuenta, crear website, copiar el `data-website-id`, ponerlo en `UMAMI_WEBSITE_ID` del `.env` del server, reiniciar web.

---

## Cosas que recordar / decisiones tomadas

### Arquitectura
- **Stack:** Astro SSR (web) + Next.js 14 (admin) + FastAPI (api) + SQLite + Docker Compose
- **Admin en subdominio** `admin.DOMINIO` (no en `/admin` del público) — decisión final
- **Auth:** JWT en HttpOnly cookie (no localStorage)
- **Botón "Publicar" = no-op** porque Astro es SSR — el contenido es live al guardar en DB
- **Idioma UI:** 100% español

### Multimedia
- **3 tipos fijos:** image / video / reel. Nada más
- **Flyer y Portada/Artwork** son **categorías** de Imagen, no tipos
- **Descargables** se gestionan en su propia tabla `download_assets`, no como `media_items`
- **Videos:** solo por URL externa (YouTube/Vimeo), no se sube MP4. Decisión por costo de ancho de banda
- **Drag & drop** funciona para 1+ imágenes o un ZIP

### Banda
- Cada integrante tiene **bio breve + bio completa** (con "Leer más" expandible en `/banda`)
- Foto del integrante se asigna desde el `MediaPicker` (no es upload directo, reusa lo del módulo Multimedia)
- Layout de integrantes: 3 columnas con centrado de huérfanos en la última fila (1 → col 2, 2 → cols 1 y 3)

### SEO / Analytics
- 13 eventos personalizados oficiales + 4 extras de granularidad (catálogo en `apps/web/src/lib/analytics.ts`)
- Umami pensado como analytics self-hosted, configurable desde `.env`
- robots.txt y sitemap activos
- JSON-LD MusicGroup (no Event ni WebSite — pendientes pero opcionales)

### Bugs conocidos no críticos
- **`MEDIA_ROOT` relativo:** uvicorn local guarda media en `apps/api/storage/` en lugar de `storage/` (raíz). En Docker no aplica porque el path es absoluto
- **No hay UI de cambio de password** en el admin (TODO post-MVP)
- **No hay JSON-LD para eventos individuales** (todos los eventos viven en `/fechas` como lista)
- **`updateMember` envía partial** que actualiza state local — está OK pero podría tener race condition si el usuario edita 2 campos en <100ms (no observado en pruebas)

### Limitaciones del MVP
- **Sin transcodificación de video:** las URLs externas se asume que YouTube las maneja
- **Sin notificaciones in-app:** todo via email Mailgun
- **Sin búsqueda:** las páginas públicas no tienen buscador
- **Sin gestión de tags por foto:** el campo existe en DB pero no hay UI
- **Sin roles múltiples:** solo `admin_editor`

---

## Pendientes post-MVP (cuando ya esté online y validado)

Orden sugerido:

1. **Cambio de password en CMS** (crítico de seguridad)
2. **Validar end-to-end los módulos sin validar** (Música, Fechas, Prensa, Rider, Descargas, Mensajes)
3. **Migración de DB con Alembic real** (no `Base.metadata.create_all` ni scripts ad hoc)
4. **Backups automáticos** vía `scripts/backup.sh` ejecutándose en cron
5. **Configurar Umami** + generar dashboards
6. **Lighthouse + Pagespeed:** medir performance real
7. **Tests E2E con Playwright:** los hay creados pero no se ejecutaron contra producción
8. **Multiidioma:** estructura para inglés (fase 2 según prompt original)
9. **Cuenta de Mailgun con dominio propio** (`mg.juanma-band.com`)
10. **JSON-LD adicionales:** Event, WebSite, BreadcrumbList

---

## Archivos clave a revisar al retomar

- `docs/11_roadmap_checklist.md` — checklist detallado de implementación
- `docs/05_multimedia_storage.md` — modelo de tipos/categorías (importante porque se simplificó)
- `docs/03_diseno_visual_identidad.md` — sección "Implementación actual del hero" con las 5 mejoras
- `docs/04_cms_backoffice.md` — módulos implementados
- `docs/07_stack_arquitectura.md` — versiones de dependencias específicas para Python 3.14
- `.env.example` y `.env.deploy.example` — todas las variables que hay que configurar
- `scripts/deploy-remote.sh` — comando único para desplegar al server

---

## Comando rápido al retomar

Cuando vuelvas del standby, lo primero:

```powershell
cd "C:\Users\hinop\Desktop\Diego\juanma_-_the_center_people"
git pull origin main
git status
```

Si hay cambios remotos, los traés. Si está todo igual, levantás los 3 servicios (sección "Cómo retomar el trabajo local") y revisás este documento.
