# 04 - CMS / Backoffice

## Objetivo

Permitir que la banda o la persona designada actualice contenido sin depender de cambios de código.

## Decisiones aprobadas

- **Framework:** Next.js 14 con App Router y TypeScript.
- **Acceso:** subdominio `admin.DOMINIO` (no ruta `/admin` del sitio público).
- **Idioma UI:** 100% español en todos los textos, labels, botones y mensajes del sistema.
- **Botón "Publicar":** guarda en DB — contenido live inmediato (Astro SSR, sin rebuild).
- **Auth:** JWT en HttpOnly cookie para máxima seguridad sin impactar performance.
- **Límites de upload:** editables desde el CMS vía tabla `site_settings`.

## Principio

El CMS edita contenido, no diseño estructural profundo.

El diseño debe estar protegido. El usuario puede cambiar textos, multimedia, enlaces, secciones y orden básico, pero no romper layout.

## Roles

Por ahora se considera suficiente un solo perfil con acceso.

Rol inicial:

```txt
admin_editor
```

Permisos:

- Crear/editar/eliminar contenido.
- Subir multimedia.
- Activar/desactivar secciones.
- Aprobar solicitudes de descarga.
- Editar datos de contacto.
- Editar redes.
- Editar configuración SEO básica.

Preparar estructura para roles futuros:

```txt
admin
editor
viewer
```

Pero no implementarlos obligatoriamente en MVP si aumenta complejidad.

## Módulos del CMS (implementados)

1. **Dashboard** — grilla de accesos rápidos.
2. **Configuración del sitio** — datos generales, redes, emails, límites de carga.
3. **Secciones** — habilitar/deshabilitar, controlar visibilidad en home y mensajes de "estado vacío".
4. **Banda** — tabs: bio (corta/larga/historia), integrantes (con foto vía MediaPicker, bio breve + bio completa), datos rápidos.
5. **Música** — CRUD de lanzamientos.
6. **Multimedia** — Fotos / Videos / Reels en un solo módulo con filtros tipo + categoría. Tabs: subir imagen, importar ZIP, agregar URL de video.
7. **Fechas** — CRUD de eventos.
8. **Prensa** — CRUD de citas de prensa.
9. **Rider técnico** — 9 sub-secciones (general, integrantes, inputs, backline, monitoreo, eléctrico, shows, contactos, hospitalidad).
10. **Descargas** — CRUD de assets descargables. Soporta subir archivo nuevo **o** elegir de la galería de Multimedia (MediaPicker).
11. **Mensajes** — bandeja de mensajes de contacto recibidos (filtros: no leído / leído / archivado).
12. **Solicitudes de descarga** — aprobar/rechazar; aprobar envía email con token temporal.

## Componentes UI compartidos

- `PageHeader`, `FormField`, `Alert`, `ConfirmDialog`
- `MediaPicker` — modal reutilizable para seleccionar archivos de la biblioteca de Multimedia (filtros tipo/categoría, grilla de miniaturas, click para seleccionar). Usado en Banda (foto de integrante) y Descargas (elegir archivo de galería).

## Configuración general

Campos:

```txt
band_name
tagline_selected
tagline_custom
subgenre
country
city
language_default
spotify_url
youtube_url
instagram_url
tiktok_url
facebook_url
contact_email
booking_email
press_email
```

## Gestión de secciones

Cada sección debe tener:

```txt
id
slug
titulo
descripcion
enabled
mostrar_en_home
show_empty_state
empty_state_message
orden
created_at
updated_at
```

El CMS debe mostrar ejemplos de qué contenido va en cada sección.

Ejemplo:

- Fotos: imágenes de banda, vivo, flyers, backstage.
- Videos: YouTube, videoclips, live sessions.
- Reels: clips verticales, teasers.
- Prensa/EPK: bio, quick facts, rider, descargas.

## Gestión de contenido textual

Debe permitir editar:

- Bio corta.
- Bio larga.
- Historia.
- Quick facts.
- Descripciones de secciones.
- Mensajes cuando no hay contenido.
- Textos SEO.

## Gestión multimedia

Debe permitir:

- Subir foto por foto.
- Subir múltiples archivos.
- Importar temporalmente desde URL de Google Photos si es viable.
- Crear thumbnails automáticamente para imágenes.
- Asociar archivo a categoría y subcategoría.
- Marcar destacado.
- Marcar visible/no visible.
- Ordenar contenido.

## Importación desde Google Photos

Objetivo:

Permitir pegar una URL pública de Google Photos y obtener una carga temporal para selección.

Flujo deseado:

1. Admin pega URL de Google Photos.
2. Sistema intenta leer/listar elementos públicos.
3. Sistema muestra una grilla temporal.
4. Admin selecciona elementos útiles.
5. Admin asigna categoría/subcategoría.
6. Sistema descarga/copia al servidor propio si técnicamente es posible.
7. Sistema genera thumbnails.
8. Sistema guarda metadatos.

Nota técnica:

Google Photos no siempre es ideal para extracción programática desde enlaces compartidos. Implementar esta función como `best effort`. Si no es estable, dejar alternativa manual:

- Descargar lote desde Google Photos.
- Subir ZIP al CMS.
- Procesar ZIP en servidor.

## Thumbnails

Para imágenes:

- Generar thumbnail automático.
- Generar versión web optimizada.
- Mantener original si se requiere.

Para videos/reels:

- Si son URLs externas de YouTube/Instagram/TikTok, usar thumbnail externo si disponible.
- Si son archivos subidos, generar thumbnail desde frame inicial con FFmpeg en fase posterior.
- Para MVP, permitir subir thumbnail manual para videos/reels.

## Seguridad CMS

- Login obligatorio.
- Sesión segura.
- Hash de password.
- CSRF si aplica por tipo de frontend.
- Rate limit en login.
- Backoffice no indexable.
- URL admin no enlazada públicamente.

## Auditoría básica

Guardar:

```txt
created_at
updated_at
created_by
updated_by
```

Como por ahora habrá un solo perfil, puede guardarse el usuario admin por defecto.

