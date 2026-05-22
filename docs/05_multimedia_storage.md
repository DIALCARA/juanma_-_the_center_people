# 05 - Multimedia y almacenamiento

## Objetivo

Tener una biblioteca multimedia ordenada, flexible y servida desde el servidor propio en la primera etapa.

## Modelo de clasificación

Dos dimensiones independientes:

- **Tipo** = formato técnico del archivo (afecta cómo se procesa).
- **Categoría** = propósito/contexto (afecta dónde se muestra en el sitio).

### Tipos (fijos)

```txt
image       Fotos JPG/PNG/WebP. Se generan thumbnail 400x400 y versión web 1920px en WebP.
video       Videos largos. En MVP se cargan como URL externa (YouTube). Sin procesamiento local.
reel        Contenido vertical 9:16 corto. URL externa (Instagram/TikTok/YouTube Shorts).
```

> **Nota:** "Flyer", "Portada/Artwork" y "Descargable" **no** son tipos. Flyer y Portada son categorías dentro de `image`. Los descargables tienen su propia tabla (`download_assets`) con flujo de aprobación.

### Categorías (15 total, editables desde el CMS)

```txt
Imagen
├── Banda                  → fotos grupales oficiales
├── En vivo                → fotos durante shows
├── Backstage              → detrás de escena
├── Sesiones / Prensa      → sesiones formales
├── Flyers                 → arte promocional de eventos
└── Portadas / Artwork     → tapas de música

Video
├── Videoclips oficiales
├── Live sessions
├── Entrevistas
├── Ensayos
└── Teasers

Reel
├── Promocionales
├── En vivo
├── Backstage
└── Lanzamientos
```

## Estructura física en servidor

```txt
/media/juanma-center-people/
├── images/
│   ├── {categoria_slug}/             # PNG/JPG/WebP web (max 1920px)
│   └── ...
├── thumbnails/
│   └── images/                       # WebP 400x400 center crop
├── downloads/                        # Archivos descargables (download_assets)
└── ...
```

Las URLs públicas se construyen con `MEDIA_PUBLIC_URL` + ruta relativa.

## Entidades en base de datos

```txt
media_types          # 3 filas fijas (image, video, reel)
media_categories     # 15 filas seed, editables y extensibles desde CMS
media_items          # Archivos cargados (con type + category + metadata)
download_assets      # Archivos descargables (separado de media_items)
```

## Metadatos de un media_item

```txt
id
media_type_id        FK a media_types
category_id          FK a media_categories (opcional)
title
description
file_url             URL del archivo principal (web)
thumbnail_url        URL del thumbnail 400x400 (solo para imágenes)
source_url           URL externa para video/reel
source_type          upload | youtube | external_url
mime_type
size_bytes
width
height
duration_seconds     (videos/reels)
credit_author
alt_text
tags_json
is_featured          aparece en bloques destacados
is_visible           visible en el sitio público
sort_order
created_at
updated_at
```

## Reglas de optimización de imágenes

Al subir imagen, el backend hace:

1. **Validación**: extensión + MIME (whitelist `jpg/jpeg/png/webp/gif`) + tamaño (`max_image_size_mb` de site_settings).
2. **Original**: se guarda en `images/{categoria}/originals/` (preserva calidad).
3. **Versión web**: WebP, max 1920px de ancho, calidad 85. Guardada en `images/{categoria}/`.
4. **Thumbnail**: WebP, 400x400 center crop, calidad 80. Guardado en `thumbnails/images/`.
5. **Naming**: `YYYYMMDD_type_cat_slug_random6.ext` (sanitizado, sin espacios/acentos).

## Videos y reels

**Decisión: solo URL externa.** Los videos y reels NO se suben al servidor.

Razones:
- YouTube provee streaming adaptativo, CDN global y reproductor móvil optimizado sin costo.
- Hospedear MP4 en el VPS ocupa disco (~500 MB por video HD) y consume ancho de banda en cada reproducción.
- Sin FFmpeg no podemos generar thumbnails ni transcodificar.
- Los videos de bandas casi siempre se publican primero en YouTube de todos modos.

Implementación:
- Endpoint admin: `POST /api/admin/media/video` con `source_url` (YouTube/Vimeo/Instagram) y `media_type_slug` (`video` o `reel`).
- El thumbnail puede setearse manualmente o quedar vacío (se intenta extraer el de YouTube si la URL coincide).
- Sitio público:
  - `/videos` renderiza con `<iframe src="https://www.youtube-nocookie.com/embed/{id}">` (privacy-enhanced).
  - `/reels` muestra tarjetas verticales con link directo a la URL externa.

## Importación batch desde ZIP

Endpoint: `POST /api/admin/media/import/zip`.

- Recibe un archivo ZIP, lo descomprime en memoria.
- Filtra solo imágenes válidas (jpg/png/webp/gif).
- **Protección**: descarta paths con `..` o `/` al inicio (path traversal).
- Cada imagen se procesa como un upload individual (web + thumb).
- Devuelve la cantidad de imágenes importadas.

Tope de tamaño del ZIP: `max_zip_size_mb` de site_settings (default 500 MB).

## Selector de imagen reutilizable (`MediaPicker`)

Componente del admin que permite reutilizar imágenes ya subidas sin duplicar:

- Modal con filtros por tipo/categoría.
- Click en una imagen → devuelve `{ id, file_url, thumbnail_url }`.
- Se usa en:
  - **Banda** → foto de integrante (asigna `photo_media_id`)
  - **Descargas** → "Elegir de la galería" como alternativa a "Subir archivo"
  - Próximo: portadas de música, posters de eventos
