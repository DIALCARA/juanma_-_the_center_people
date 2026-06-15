# 02 - UX, estructura y contenido

## Arquitectura del sitio público

Estructura híbrida:

```txt
/
/musica
/fotos
/videos
/reels
/banda
/prensa-epk
/fechas
/contacto
```

## Home tipo one-page

La página inicial debe resumir todo sin reemplazar a las páginas internas.

### Secciones del home

1. Hero principal.
2. Música destacada.
3. Banda / resumen breve.
4. Multimedia destacada.
5. Próximas fechas.
6. Bloque EPK/prensa.
7. Contacto rápido.

## CTA principales

CTA significa `Call To Action`, es decir, llamado a la acción. En la interfaz se expresa como botones o enlaces importantes.

CTA principales:

- Escuchar en Spotify.
- Ver videos.
- Ver fotos.
- Contactar para booking.
- Ir a Prensa/EPK.
- Descargar EPK.
- Seguir en redes.

## Menú principal

```txt
Inicio
Banda
Música
Fotos
Videos
Reels
Prensa/EPK
Fechas
Contacto
```

## Secciones y comportamiento

Cada sección debe tener control `enabled` desde CMS.

Campos base por sección:

```txt
id
slug
titulo
descripcion
enabled
orden
mostrar_en_home
created_at
updated_at
```

## Sección Inicio

Debe mostrar una síntesis del proyecto:

- Imagen principal/portada.
- Nombre de banda.
- Tagline.
- CTA a Spotify.
- CTA a contacto.
- Accesos rápidos.

## Sección Banda

Debe incluir:

- Bio corta.
- Bio larga.
- Integrantes.
- Género/subgénero editable.
- Ciudad/país.
- Historia.
- Influencias o referencias si la banda desea mostrarlas.

## Sección Música

Debe incluir:

- Spotify embed.
- Link externo a Spotify.
- Canción/lanzamiento destacado.
- Portada del lanzamiento.
- Texto breve del lanzamiento.
- YouTube opcional si existe video.

## Sección Fotos

Debe dividirse en:

- Fotos de la banda.
- Fotos en vivo.
- Fotos backstage.
- Fotos de prensa/sesiones.
- Flyers.
- Portadas/artwork.

Nota: el usuario indicó que fotos incluirá fotos de la banda y fotos de flyers. El sistema debe aceptar más subcategorías sin rediseño.

## Sección Videos

Debe incluir:

- Videoclips oficiales.
- Live sessions.
- Ensayos.
- Entrevistas.
- Teasers.
- Videos embebidos desde YouTube.

## Sección Reels

Debe incluir:

- Clips verticales.
- Fragmentos en vivo.
- Detrás de cámaras.
- Promocionales.
- Lanzamientos.

## Sección Prensa/EPK

Debe estar orientada a medios y productores.

Debe incluir:

- Quick facts.
- Bio corta.
- Bio larga.
- Fotos oficiales destacadas.
- Música/video principal.
- Press quotes si existen.
- Rider técnico.
- Descargas.
- Contacto prensa/booking.

## Quick facts

Datos rápidos editables:

```txt
Nombre: Juanma & The Center People
País: Perú
Ciudad base: Lima
Género: Rock alternativo peruano
Idioma principal: Español
Estado: Banda activa
Lanzamiento actual: canción publicada en Spotify
Formato: editable desde CMS
Contacto: editable desde CMS
Redes: editable desde CMS
```

## Sección Fechas/Eventos

Debe mostrar:

- Próximos eventos.
- Eventos pasados opcionales.

Si no hay eventos próximos, la sección debe mostrarse con un mensaje editable:

```txt
No hay próximas fechas anunciadas por ahora.
```

No ocultar necesariamente la sección si no hay eventos. El CMS debe permitir elegir:

```txt
show_empty_state: true/false
empty_state_message
```

## Sección Contacto

Debe incluir:

- Formulario con envío SMTP (Zoho Mail).
- Redes sociales.
- Correo público si se decide mostrar.
- Motivo de contacto.
- Mensaje de confirmación.

Tipos de contacto:

```txt
booking
prensa
colaboracion
fan
otro
```

