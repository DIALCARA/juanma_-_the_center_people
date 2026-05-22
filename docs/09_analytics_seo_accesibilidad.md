# 09 - Analytics, SEO, accesibilidad y performance

## Analytics

Herramienta aprobada:

```txt
Umami
```

## Métricas a registrar

### Tráfico general

- Visitas.
- Páginas vistas.
- País/ciudad si Umami lo permite según configuración.
- Dispositivo.
- Navegador.
- Fuente de tráfico.

### Eventos personalizados

Registrar eventos para:

**Oficiales (definidos en `apps/web/src/lib/analytics.ts`):**

```txt
# Redes sociales
click_spotify
click_youtube
click_instagram
click_tiktok
click_facebook

# Contacto / Booking
click_contact_booking
click_contact_press
submit_contact_form

# Descargas
request_download
click_download_public
approve_download           (admin dispara al aprobar solicitud)

# Vistas de secciones
view_epk
view_music
view_gallery
```

**Extras de granularidad (también disparados por el sitio):**

```txt
click_release_spotify      (click en Spotify de un release individual)
click_release_youtube
click_reel                 (click en un reel)
click_ticket               (click en entradas de un evento)
```

Mantener los nombres sincronizados entre `data-umami-event` en HTML y el catálogo `Events` de `analytics.ts`.

## UTMs

Preparar soporte para campañas:

```txt
utm_source
utm_medium
utm_campaign
utm_content
utm_term
```

Casos:

- Link en bio de Instagram.
- QR en flyer.
- Lanzamiento de single.
- Nota de prensa.
- Campaña pagada futura.

## SEO

Cada página debe tener:

```txt
title
meta_description
canonical_url
og_title
og_description
og_image
twitter_card
```

Páginas principales:

- Home.
- Música.
- Fotos.
- Videos.
- Reels.
- Prensa/EPK.
- Fechas.
- Contacto.

## Schema.org sugerido

Implementar JSON-LD para:

```txt
MusicGroup
MusicAlbum o MusicRecording si aplica
Event para fechas
WebSite
Organization opcional
```

## Accesibilidad

Objetivo mínimo:

```txt
WCAG 2.2 AA como referencia
```

Requisitos:

- Contraste suficiente.
- Navegación con teclado.
- Foco visible.
- Alt text en imágenes.
- Formularios con labels.
- Botones con área clic/tap cómoda.
- Evitar autoplay con sonido.
- Respetar `prefers-reduced-motion`.

## Performance

Objetivos:

```txt
LCP bueno
INP bajo
CLS mínimo
JS mínimo en páginas públicas
Imágenes optimizadas
Lazy loading multimedia
```

## Reglas de multimedia

- No cargar galerías completas al inicio.
- Usar thumbnails.
- Lazy load.
- Paginación o carga progresiva.
- Embeds externos solo cuando sean necesarios.

## Animaciones

- Suaves.
- Cortas.
- Desactivables con `prefers-reduced-motion`.
- No bloquear interacción.

## Privacidad

- Evitar cookies innecesarias.
- Si se agregan herramientas externas, documentarlas.
- Formulario de contacto con consentimiento básico.
- Descargas bajo solicitud deben explicar uso del email.

