# 03 - Diseño visual e identidad

## Dirección visual

La identidad visual debe reflejar rock alternativo peruano, sensibilidad melódica, ciudad, nostalgia y emoción.

Evitar:

- Rock genérico agresivo.
- Estética metalera si no corresponde.
- Calaveras, fuego, cadenas o sangre como recurso automático.
- Saturación visual excesiva.
- Fondos ilegibles.

Buscar:

- Estética nocturna limeña.
- Fotografía editorial.
- Texturas urbanas suaves.
- Contraste elegante.
- Tipografía fuerte pero legible.
- Detalles visuales con alma de afiche musical.

## Nombre oficial

```txt
Juanma & The Center People
```

## Tagline inicial

```txt
Rock alternativo peruano entre la nostalgia, la calle y el ruido interior.
```

## Taglines alternativos para CMS

El CMS debe mostrar el tagline inicial, 10 alternativas y un campo personalizado.

Alternativas sugeridas:

1. Rock peruano de guitarras melódicas, ciudad y memoria emocional.
2. Canciones para cuando Lima baja la luz.
3. Guitarras honestas, melodías de ciudad y corazón amplificado.
4. Rock alternativo con pulso urbano y heridas que cantan.
5. Melodías de barrio, ruido interior y noches largas.
6. Rock peruano entre la emoción frontal y la calle encendida.
7. Canciones de ciudad para corazones que no apagan la radio.
8. Rock alternativo con nostalgia, electricidad y verdad.
9. Guitarras limeñas para historias que todavía arden bajito.
10. Rock de melodía intensa, sombra urbana y voz propia.

Campo adicional:

```txt
tagline_custom
```

## Subgénero aprobado

```txt
Rock alternativo peruano
```

Descripción editorial:

```txt
Rock peruano de guitarras melódicas, pulso urbano y emoción frontal.
```

El subgénero debe ser editable desde CMS.

## Logo / portada / imagen principal

Actualmente no hay logo formal. Hay una imagen tipo portada.

El CMS debe permitir definir:

- Imagen hero desktop.
- Imagen hero mobile.
- Imagen portada/cover.
- Imagen Open Graph.
- Favicon futuro.
- Texto alternativo.

La identidad inicial se debe construir desde la imagen portada disponible.

## Tipografía recomendada

### Opción base

- Títulos: Oswald, Bebas Neue o Archivo Black.
- Texto: Inter, Source Sans 3 o system sans.

Recomendación inicial:

```txt
Headings: Oswald
Body: Inter
```

Motivo:

- Oswald da presencia de cartel/escenario sin ser metalera.
- Inter asegura lectura limpia en textos largos.
- La combinación funciona bien para EPK, prensa y fans.

## Color y tema

Debe soportar tema oscuro como principal.

Tema recomendado:

- Fondo oscuro profundo.
- Texto blanco/hueso.
- Acentos cálidos o rojos apagados.
- Grises urbanos.
- Posibilidad de extraer paleta desde portada principal.

No fijar colores definitivos hasta revisar portada/fotos reales.

## Animaciones

Usar microinteracciones y transiciones suaves.

Permitido:

- Fade entre secciones.
- Transiciones de página con View Transitions API si aplica.
- Hover en cards.
- Reveal suave de contenido.
- Galería con movimiento sobrio.

Evitar:

- Animaciones largas.
- Distorsiones excesivas.
- Efectos que tapen contenido.
- Autoplay agresivo.

### Implementación actual del hero (home)

Cinco mejoras de impacto activas en `apps/web/src/pages/index.astro`:

**A — Video de fondo**
- `<video autoplay muted loop playsinline>` apunta a `apps/web/public/hero-bg.mp4` (y `.webm` opcional).
- Si el archivo no existe, el navegador muestra solo el gradiente oscuro de overlay — el sitio sigue funcionando sin error.
- Poster fallback: `og-default.jpg`.
- El overlay degrada de 55% a 100% (negro al fondo) para garantizar contraste con el wordmark.

**B — Animación de entrada del logo/texto**
- Logo (`.hero-logo`): fade-in + scale + blur-to-clear + leve shake horizontal (efecto "glitch" sutil). 1.6s.
- Texto (`.hero-tagline` / `.hero-subtitle` / `.hero-cta`): cascada fade-up con delays 1s / 1.3s / 1.6s.
- Definido en `apps/web/src/styles/global.css` con `@keyframes hero-logo-in` y `hero-fade-up`.
- Respeta `prefers-reduced-motion` (sin animación si el usuario lo prefiere).

**C — Marquee horizontal infinito**
- Componente `apps/web/src/components/ui/Marquee.astro`, banda roja entre hero y siguiente sección.
- Texto automático según contenido de la DB: anuncia release destacado y/o próxima fecha.
- Pausa al hover. Si no hay nada, muestra el nombre de la banda + género.

**D — Countdown al próximo show**
- Componente `apps/web/src/components/ui/Countdown.astro`, solo aparece si hay `upcoming_events[0]`.
- Cuenta regresiva en tiempo real (días/horas/min/seg) con `setInterval(1s)`.
- Bajo el contador: título del evento + venue + ciudad.

**E — Hover de galería con overlay**
- `.card-media` ahora tiene `::after` con borde rojo al hover.
- `.media-overlay` despliega título + categoría desde el bottom con gradiente negro.
- Mantiene el zoom de `<img>` ya existente.

## Tono visual por página

### Home

Más emocional, visual y narrativa.

### Música

Más directa, centrada en escucha.

### Fotos/Videos/Reels

Más visual, tipo archivo curado.

### Prensa/EPK

Más sobria, clara y descargable.

### Contacto

Simple, confiable y directo.

