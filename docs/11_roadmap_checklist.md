# 11 - Roadmap y checklist de implementación

> Última actualización: 2026-05-21
> Estado: **MVP en pruebas locales · Módulo Secciones validado · Módulo Banda con foto + bio_long completado · Cleanup de tipos de media aplicado**

Leyenda: ✅ Completado · 🔄 Parcial · ⏳ Pendiente

## Cambios técnicos aplicados durante validación local

Estos ajustes nacieron de bugs reales detectados al probar el CMS:

- **Python 3.14 + Windows**: dependencias actualizadas (pydantic≥2.11, pillow≥11.3), `passlib` reemplazado por `bcrypt` directo, `python-magic` removido (no se usaba y rompe instalación en Windows).
- **pyproject.toml**: build backend corregido (`setuptools.build_meta`), config explícita de paquetes para evitar conflicto con `data/`, `alembic/`, `scripts/`.
- **Pydantic Settings**: ahora busca `.env` subiendo desde `apps/api/app/core/config.py` (permite correr desde cualquier cwd).
- **Seed UTF-8**: `sys.stdout.reconfigure(encoding="utf-8")` para evitar `UnicodeEncodeError` en consola Windows.
- **Admin proxy**: `next.config.mjs` usa `127.0.0.1` explícito (Node 18+ resuelve `localhost` como IPv6 y rompe el proxy a uvicorn).
- **Tailwind en admin**: faltaba el `postcss.config.mjs` y las dependencias (`tailwindcss`, `postcss`, `autoprefixer`); agregadas.
- **CSS del sitio público**: removido `@apply group` (no es una utility, debe ir directo en HTML).
- **API responses**: shape unificado `data: { items, total, page, page_size }` para endpoints paginados.
- **Endpoint `/api/admin/band/bio`**: ahora consolida bio + members + quick_facts en un solo round-trip.
- **Endpoints públicos `/band` y `/press-epk`**: shape `bio: { bio_short, bio_long, history }` anidado para coincidir con lo que esperaba el frontend.
- **Resolución de `photo_url`**: el backend resuelve la URL de la foto del integrante desde `photo_media_id` en `/api/admin/band/bio` y `/api/public/band`.
- **Schema `MemberCreate/Update`**: ahora aceptan `is_visible`, `bio_long`, `photo_media_id`. `update_member` usa `exclude_unset` para permitir limpiar la foto con `null`.
- **Schema `AssetCreate`**: `expires_in_days` ahora es `Optional[int]` (acepta null cuando el acceso es público), agregado `is_visible`.
- **Endpoint nuevo `POST /api/admin/download-assets/upload`**: faltaba; ahora sube archivos al backend para descargas.
- **Endpoint `/api/public/sections`**: ahora devuelve TODAS las secciones (incluso deshabilitadas) con su flag `is_enabled` para que cada página decida.
- **Endpoint `/api/public/home`**: incluye mapa `sections` para que el index oculte bloques con `show_in_home=false`.
- **Tipos de media simplificados**: de 6 a 3 (Imagen, Video, Reel). Flyer y Portada/Artwork son categorías dentro de Imagen. Descargable se gestiona en su propia tabla.
- **`/fotos` del sitio**: usaba `type: "foto"` (slug inexistente) → corregido a `type: "image"`.
- **`bio_long` por integrante**: nueva columna en `band_members`. CMS con dos textareas, sitio público con "Leer más" expandible.

## Módulos del CMS validados en pruebas locales

- ✅ **Configuración** — guarda site_settings incluidos límites de carga
- ✅ **Secciones** — `is_enabled`, `show_in_home` y `empty_state_message` se reflejan en el sitio (home + header + página individual con `SectionUnavailable`)
- ✅ **Banda** — bio corta/larga, integrantes con foto + bio breve + bio completa, quick facts
- ✅ **Multimedia** — tipos limpiados a 3 (image/video/reel), cascada tipo→categoría con selects deshabilitados sin tipo, drag&drop, multi-upload, toggle `is_featured` desde la grilla
- ⏳ **Música, Fechas, Prensa, Descargas, Rider, Mensajes, Solicitudes** — falta validar end-to-end

## Mejoras de impacto visual en la home (2026-05-21)

Cinco mejoras en `apps/web/src/pages/index.astro` (detalle completo en `03_diseno_visual_identidad.md`):

- ✅ **A** — Video de fondo en el hero (`<video>` con fallback a gradiente si no existe el archivo)
- ✅ **B** — Animaciones de entrada para logo y texto (CSS keyframes, respeta `prefers-reduced-motion`)
- ✅ **C** — Marquee horizontal con texto dinámico (release destacado / próxima fecha)
- ✅ **D** — Countdown en tiempo real al próximo show (componente `Countdown.astro`)
- ✅ **E** — Hover en galería con borde rojo + overlay con título y categoría

## Pendiente para que el sitio se vea con todo el potencial

- ⏳ Cargar archivo `apps/web/public/hero-bg.mp4` (loop sin sonido, 5-15 seg, ≤10 MB recomendado)
- ⏳ En el CMS: marcar fotos como "Destacadas" (★) para que aparezcan en la home
- ⏳ En el CMS: marcar un release como destacado para que aparezca el embed de Spotify en home
- ⏳ En el CMS: cargar próximas fechas para activar el countdown

---

## Fase 0 — Preparación y estructura ✅

- ✅ Estructura monorepo (`apps/api`, `apps/web`, `apps/admin`, `infra`, `scripts`, `docs`, `storage`)
- ✅ `.gitignore` completo (Python, Node, SQLite, .env, media)
- ✅ `.env.example` con todas las variables (API, JWT, SMTP/Zoho, Umami, Traefik)
- ✅ `.env.deploy.example` para configurar el deploy remoto por SSH
- ✅ `README.md` operacional (setup, deploy, backup, tests)
- ✅ Decisiones documentadas en `docs/00_contexto_y_decisiones.md`
- ✅ Stack documentado en `docs/07_stack_arquitectura.md`
- ✅ Deploy documentado en `docs/10_deploy_operacion.md`

---

## Fase 1 — Backend FastAPI ✅

### Core
- ✅ `apps/api/app/core/config.py` — Pydantic Settings, lru_cache
- ✅ `apps/api/app/core/database.py` — SQLAlchemy + WAL mode + foreign_keys
- ✅ `apps/api/app/core/security.py` — bcrypt + JWT HttpOnly cookie
- ✅ `apps/api/app/core/logging.py` — structured logging

### Modelos (22 clases)
- ✅ `user.py` — User con roles
- ✅ `site_settings.py` — incluyendo límites de carga editables
- ✅ `section.py` — con empty_state_message
- ✅ `band.py` — BandMember, BandBio, QuickFact, SocialLink
- ✅ `music.py` — MusicRelease
- ✅ `media.py` — MediaType, MediaCategory (jerarquía), MediaItem
- ✅ `event.py` — Event
- ✅ `press.py` — PressQuote
- ✅ `rider.py` — RiderProfile + 8 sub-tablas (members, inputs, backline, monitoring, electrical, show_lengths, contacts, hospitality)
- ✅ `download.py` — DownloadAsset + DownloadRequest (token temporal)
- ✅ `contact.py` — ContactMessage

### Routers públicos (11 endpoints)
- ✅ `GET /api/public/site-settings`
- ✅ `GET /api/public/sections`
- ✅ `GET /api/public/home`
- ✅ `GET /api/public/band`
- ✅ `GET /api/public/music`
- ✅ `GET /api/public/media` (paginado, filtrable)
- ✅ `GET /api/public/events`
- ✅ `GET /api/public/press-epk`
- ✅ `POST /api/public/contact` (rate limit 3/min)
- ✅ `POST /api/public/download-requests`
- ✅ `GET /api/public/downloads/{token}` (token temporal)

### Routers admin (autenticados)
- ✅ `POST /api/auth/login` (rate limit 5/min, HttpOnly cookie)
- ✅ `POST /api/auth/logout`
- ✅ `GET /api/auth/me`
- ✅ Admin site-settings (GET/PUT)
- ✅ Admin sections (GET, PUT, reorder bulk)
- ✅ Admin band (bio GET/PUT, members CRUD, quick-facts CRUD)
- ✅ Admin music (CRUD)
- ✅ Admin events (CRUD)
- ✅ Admin press-quotes (CRUD)
- ✅ Admin media (GET paginado, upload single, upload múltiple, import ZIP, video URL, PUT, DELETE, types, categories)
- ✅ Admin download-assets (CRUD)
- ✅ Admin download-requests (GET filtrado, PUT aprobar/rechazar → envía email)
- ✅ Admin contact-messages (GET filtrado, PUT status)
- ✅ Admin rider (profile CRUD + 8 sub-secciones PUT)
- ✅ Admin publish (POST no-op registra timestamp, GET status)

### Servicios
- ✅ `services/email.py` — SMTP via aiosmtplib (Zoho Mail) — contact notification + download approved
- ✅ `services/media_processing.py` — validación MIME/ext, WebP web (1920px), WebP thumbnail (400x400 center crop), ZIP con path traversal prevention

### Infraestructura API
- ✅ Alembic configurado (`alembic/env.py`)
- ✅ `scripts/seed.py` — user admin, site_settings, 9 secciones, 6 media types, 19 categorías, bio placeholder
- ✅ `apps/api/Dockerfile` — multi-stage (builder + production)
- ✅ `apps/api/pyproject.toml` — todas las dependencias

### Tests API
- ✅ `tests/conftest.py` — SQLite in-memory, TestClient, auth_client, seed fixtures
- ✅ `tests/routers/test_auth.py` — 5 casos (login ok, credenciales incorrectas, usuario inexistente, /me sin autenticar, logout)
- ✅ `tests/routers/test_public.py` — 11 casos (health, site_settings, sections, home, media paginación, events empty state, contact submit, contact tipo inválido, download token inexistente)
- ✅ `tests/routers/test_admin_settings.py` — 4 casos (auth check, empty 404, update settings, update upload limits)
- ✅ `tests/routers/test_admin_events.py` — 5 casos (CRUD completo + auth check)
- ✅ `tests/services/test_media_processing.py` — 8 casos (validación imagen, extensión inválida, MIME inválido, tamaño excedido, process_image genera archivos, ZIP solo imágenes, ZIP path traversal)

---

## Fase 2 — Frontend público Astro SSR ✅

### Setup
- ✅ `apps/web/package.json` — Astro 4.x + @astrojs/node + tailwind + sitemap + playwright
- ✅ `apps/web/astro.config.mjs` — SSR standalone, sitemap, port 3000
- ✅ `apps/web/tailwind.config.mjs` — paleta completa (black, bone, red-band, urban grays, Oswald + Inter)
- ✅ `apps/web/src/styles/global.css` — Google Fonts, variables, .btn-*, .card-media, .reveal, prefers-reduced-motion
- ✅ `apps/web/src/lib/api.ts` — apiFetch helper + todas las funciones públicas
- ✅ `apps/web/src/lib/analytics.ts` — trackEvent + 12 Events constants
- ✅ `apps/web/Dockerfile` — multi-stage Node 20 slim

### Layouts y componentes base
- ✅ `src/layouts/BaseLayout.astro` — SSR site_settings fetch, SEO, Umami (solo prod), skip link, Header, Footer, IntersectionObserver reveal
- ✅ `src/components/SEO.astro` — title, canonical, OG, Twitter Card, JSON-LD MusicGroup
- ✅ `src/components/Header.astro` — fixed, desktop nav, mobile hamburger, aria-current
- ✅ `src/components/Footer.astro` — socials filtrados, booking/press emails

### Componentes UI
- ✅ `src/components/ui/EmptyState.astro`
- ✅ `src/components/ui/MediaCard.astro`
- ✅ `src/components/ui/SpotifyEmbed.astro`
- ✅ `src/components/ui/YouTubeEmbed.astro` (privacy-enhanced con youtube-nocookie.com)
- ✅ `src/components/ui/EventCard.astro`
- ✅ `src/components/ui/QuoteCard.astro`

### Páginas (9)
- ✅ `src/pages/index.astro` — Hero, Música, Banda resumen, Galería, Fechas, Prensa/EPK CTA, Contacto CTA
- ✅ `src/pages/banda.astro` — bio, datos rápidos, integrantes
- ✅ `src/pages/musica.astro` — Spotify embed, lanzamientos
- ✅ `src/pages/fotos.astro` — grilla paginada + lightbox con teclado (← → Esc)
- ✅ `src/pages/videos.astro` — grilla paginada con YouTube embeds
- ✅ `src/pages/reels.astro` — grilla vertical 9:16 paginada
- ✅ `src/pages/prensa-epk.astro` — bio, datos, citas, descargas, contacto prensa
- ✅ `src/pages/fechas.astro` — lista eventos + CTA booking
- ✅ `src/pages/contacto.astro` — formulario con validación HTML5 + preselección por ?tipo=
- ✅ `src/pages/prensa-epk/solicitar/[id].astro` — formulario solicitud de descarga

### API routes proxy
- ✅ `src/pages/api/submit-contact.ts`
- ✅ `src/pages/api/submit-download-request.ts`

### SEO / Accesibilidad / Analytics (DOC-09)
- ✅ Canonical URLs en SEO.astro
- ✅ OG tags (title, description, image, url, type, locale, site_name)
- ✅ Twitter Card summary_large_image
- ✅ JSON-LD MusicGroup con sameAs
- ✅ Sitemap via @astrojs/sitemap
- ✅ `public/robots.txt`
- ✅ aria-labels en todas las sections
- ✅ Skip link "Ir al contenido principal"
- ✅ aria-current="page" en navegación
- ✅ prefers-reduced-motion en global.css
- ✅ focus-visible outline (accesibilidad teclado)
- ✅ Umami script solo en producción (isProd check)
- ✅ 13 eventos oficiales en `analytics.ts` + 4 extras de granularidad (`click_release_spotify`, `click_release_youtube`, `click_reel`, `click_ticket`)
- ✅ `data-umami-event` en todos los CTAs sincronizados con el catálogo
- ✅ Evento `approve_download` disparado en el admin al aprobar solicitudes
- ✅ Aviso de privacidad en formulario de contacto
- ✅ Aviso de privacidad en formulario de solicitud de descarga
- ⏳ JSON-LD `WebSite` y `Event` (marcados como sugeridos en DOC-09, no obligatorios — pendiente para futuras iteraciones)

### Tests Playwright (9 archivos)
- ✅ `tests/pages/home.spec.ts` — 8 casos
- ✅ `tests/pages/banda.spec.ts` — 4 casos
- ✅ `tests/pages/musica.spec.ts` — 3 casos
- ✅ `tests/pages/fotos.spec.ts` — 5 casos (incluye lightbox)
- ✅ `tests/pages/videos.spec.ts` — 3 casos
- ✅ `tests/pages/reels.spec.ts` — 3 casos
- ✅ `tests/pages/prensa-epk.spec.ts` — 4 casos
- ✅ `tests/pages/fechas.spec.ts` — 4 casos
- ✅ `tests/pages/contacto.spec.ts` — 7 casos (incluye mock API, preselección, validación, error handling)

---

## Fase 3 — CMS Admin Next.js 14 ✅

### Setup
- ✅ `apps/admin/package.json` — Next.js 14 + React 18 + SWR + react-hook-form + Testing Library + Jest
- ✅ `apps/admin/next.config.mjs` — standalone output + rewrites proxy a API + remotePatterns
- ✅ `apps/admin/tsconfig.json` — strict, paths @/*
- ✅ `apps/admin/tailwind.config.ts`
- ✅ `apps/admin/jest.config.ts` — next/jest + jsdom + setupFilesAfterEnv
- ✅ `apps/admin/Dockerfile` — multi-stage standalone Node 20 slim

### Auth
- ✅ `src/middleware.ts` — protege todas las rutas excepto /login y /api, redirige a /login
- ✅ `src/hooks/useAuth.ts` — SWR GET /api/auth/me
- ✅ `src/lib/api.ts` — get, post, put, del, upload helpers con ApiError
- ✅ `src/app/login/page.tsx` — formulario, error handling, redirect post-login

### Layout
- ✅ `src/app/layout.tsx` — root layout, noindex, Inter font
- ✅ `src/app/page.tsx` — redirect a /dashboard
- ✅ `src/app/dashboard/layout.tsx` — Sidebar + TopBar + main
- ✅ `src/components/Sidebar.tsx` — navegación agrupada, active state
- ✅ `src/components/TopBar.tsx` — email del usuario + logout

### Componentes UI admin
- ✅ `src/components/ui/PageHeader.tsx`
- ✅ `src/components/ui/FormField.tsx`
- ✅ `src/components/ui/Alert.tsx` (success, error, info)
- ✅ `src/components/ui/ConfirmDialog.tsx`

### Módulos CMS (11 páginas)
- ✅ `dashboard/page.tsx` — grilla de accesos rápidos
- ✅ `dashboard/configuracion/page.tsx` — site_settings completo (general, redes, emails, límites MB)
- ✅ `dashboard/secciones/page.tsx` — habilitar/deshabilitar, show_in_home, empty_state_message
- ✅ `dashboard/banda/page.tsx` — tabs: bio / integrantes / datos rápidos con CRUD inline
- ✅ `dashboard/musica/page.tsx` — CRUD lanzamientos con formulario inline
- ✅ `dashboard/fechas/page.tsx` — CRUD eventos con formulario inline
- ✅ `dashboard/prensa/page.tsx` — CRUD citas de prensa
- ✅ `dashboard/media/page.tsx` — tabs: upload single / ZIP / video URL, grilla con filtros por tipo/categoría
- ✅ `dashboard/descargas/page.tsx` — CRUD download assets con subida de archivo
- ✅ `dashboard/mensajes/page.tsx` — bandeja de mensajes (no leído/leído/archivado), detalle + mailto
- ✅ `dashboard/solicitudes/page.tsx` — aprobar/rechazar solicitudes de descarga por estado
- ✅ `dashboard/rider/page.tsx` — 9 tabs: general, integrantes, inputs (tabla), backline, monitoring, eléctrico, shows, contactos, hospitalidad

### Tests Jest (6 archivos)
- ✅ `tests/jest.setup.ts` — @testing-library/jest-dom
- ✅ `tests/components/Alert.test.tsx` — 4 casos
- ✅ `tests/components/ConfirmDialog.test.tsx` — 4 casos
- ✅ `tests/components/FormField.test.tsx` — 4 casos
- ✅ `tests/components/PageHeader.test.tsx` — 4 casos
- ✅ `tests/lib/api.test.ts` — 7 casos (get, post, put, del, ApiError status, ApiError mensaje)
- ✅ `tests/pages/login.test.tsx` — 4 casos (render, título, submit con API, error handling)

---

## Fase 4 — Contacto y Email SMTP (Zoho) ✅ (integrado en API)

- ✅ Formulario público en /contacto con validación HTML5
- ✅ `POST /api/public/contact` guarda en DB + llama send_contact_notification
- ✅ SMTP via aiosmtplib en `services/email.py` (Zoho Mail)
- ✅ Vista de mensajes en CMS con cambio de estado

---

## Fase 5 — Descargas con aprobación ✅ (integrado en API)

- ✅ Downloads públicos (descarga directa si access_type=public)
- ✅ Formulario de solicitud en /prensa-epk/solicitar/[id]
- ✅ `POST /api/public/download-requests` guarda solicitud
- ✅ Bandeja de solicitudes en CMS con filtros
- ✅ Aprobar → genera UUID token + expiry + envía email con link
- ✅ Rechazar → marca status rejected
- ✅ `GET /api/public/downloads/{token}` valida token/expiry, registra descarga

---

## Fase 6 — Umami ✅

- ✅ Servicio `umami` en docker-compose (puerto 3002)
- ✅ `umami-db` PostgreSQL 15 para Umami
- ✅ Script Umami insertado en BaseLayout.astro (solo en producción)
- ✅ `UMAMI_WEBSITE_ID` y `UMAMI_URL` en .env.example
- ✅ `src/lib/analytics.ts` con 12 eventos personalizados
- ✅ `data-umami-event` en todos los CTAs de las 9 páginas

---

## Fase 7 — Deploy Docker ✅ (listo para ejecutar)

- ✅ `infra/docker-compose.yml` — 5 servicios dev (api, web, admin, umami, umami-db)
- ✅ `infra/docker-compose.prod.yml` — 5 servicios prod con labels Traefik
- ✅ `scripts/init.sh` — verifica .env, crea directorios media, verifica nexus_main_net
- ✅ `scripts/seed.sh` — ejecuta seed.py dentro de Docker o local
- ✅ `scripts/backup.sh` — backup SQLite + media con rotación 7 días
- ✅ `scripts/deploy.sh` — build prod images + up -d + health check
- ✅ `scripts/test-all.sh` — pytest + playwright + jest secuenciales

---

## Fase 8 — Dominio final ⏳ (pendiente del usuario)

- ⏳ Comprar / asignar dominio
- ⏳ Configurar DNS → IP del VPS
- ⏳ Traefik ya configurado en VPS (nexus_main_net) — solo actualizar `DOMAIN` en .env
- ⏳ Actualizar `PUBLIC_SITE_URL`, `ADMIN_SITE_URL` en .env de producción
- ⏳ Verificar SEO/OpenGraph con dominio real

---

## Definition of Done MVP — Estado actual

| Criterio | Estado |
|---|---|
| Sitio público carga correctamente | ✅ Código listo — pendiente deploy |
| CMS permite editar contenido principal | ✅ 11 módulos implementados |
| Se pueden subir fotos y generar thumbnails | ✅ WebP web + WebP thumb 400x400 |
| Spotify aparece correctamente | ✅ Embed con artist ID |
| YouTube soportado | ✅ youtube-nocookie.com embeds |
| Sección Fotos con galería | ✅ Con lightbox paginado |
| Sección Prensa/EPK | ✅ Bio + citas + descargas + rider |
| Rider técnico editable | ✅ 9 sub-secciones en CMS |
| Descargas públicas y bajo solicitud | ✅ Con token temporal y email |
| Contacto envía por SMTP (Zoho Mail) | ✅ |
| Umami registra visitas y eventos | ✅ 12 eventos personalizados |
| Todo corre con Docker Compose | ✅ Dev + prod listos |
| Backup de SQLite y media | ✅ scripts/backup.sh |

---

## Pendientes de contenido real (no técnicos)

- ⏳ Imagen hero desktop/mobile (reemplazar og-default.jpg)
- ⏳ Fotos finales seleccionadas para cargar desde CMS
- ⏳ Bio corta y bio larga reales
- ⏳ Lista de integrantes con nombres y fotos
- ⏳ Rider técnico real completado desde CMS
- ⏳ URLs de redes sociales reales (Spotify, Instagram, YouTube, TikTok)
- ⏳ Emails definitivos (booking, prensa, contacto general)
- ⏳ Dominio final configurado
- ⏳ Variables de producción en .env del VPS

---

## Pasos para el próximo deploy

```bash
# 1. Clonar el repo en el VPS
git clone ... && cd juanma_-_the_center_people

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con valores reales de producción

# 3. Verificar red de Traefik
bash scripts/init.sh

# 4. Iniciar servicios
bash scripts/deploy.sh

# 5. Poblar base de datos inicial
bash scripts/seed.sh

# 6. Acceder al CMS y cargar contenido
# https://admin.TU_DOMINIO
```
