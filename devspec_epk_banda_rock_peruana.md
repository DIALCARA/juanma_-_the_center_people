# DEVSPEC.md

## Proyecto: Página EPK para banda de rock peruana

**Estado:** punto de partida  
**Tipo de proyecto:** Electronic Press Kit / sitio promocional para banda musical  
**Stack:** pendiente de definición  
**Prioridad inicial:** diseño, contenido, estructura, UX, performance, SEO y escalabilidad futura  
**Última actualización:** 2026-05-18

---

## 1. Objetivo del proyecto

Crear una página EPK profesional para una banda de rock peruana que funcione como carta de presentación para prensa, promotores, venues, festivales, radios, curadores de playlists, marcas y potenciales aliados.

La web debe transmitir identidad artística, facilitar contacto comercial y entregar información descargable de manera rápida, clara y confiable.

El sitio no debe comportarse como una web corporativa genérica. Debe sentirse como una extensión visual y sonora de la banda: directa, intensa, editorial, rápida y usable.

---

## 2. Principios rectores

1. **Experiencia limpia, rápida y con propósito.**
   Cada sección debe tener una función concreta. Nada de fuegos artificiales digitales si no venden, informan o emocionan.

2. **Primero el EPK, luego el decorado.**
   La prioridad es que un booker, periodista o productor encuentre lo que necesita en menos de 30 segundos.

3. **Identidad rockera sin sacrificar legibilidad.**
   Se puede tener filo visual sin convertir el texto en un solo de guitarra ilegible a las 3 a. m.

4. **Performance como parte de la marca.**
   Una banda que carga lento pierde antes de sonar.

5. **Accesibilidad desde el diseño.**
   Contraste, foco visible, navegación clara, tamaños táctiles correctos y contenido entendible.

6. **Mobile-first real.**
   Muchos contactos vendrán desde Instagram, WhatsApp, TikTok, YouTube o un link abierto en celular.

---

## 3. Audiencias principales

### 3.1 Booker / promotor / festival

Necesita confirmar rápidamente:

- Quién es la banda.
- Género y propuesta.
- Trayectoria.
- Material en vivo.
- Fotos oficiales.
- Rider técnico.
- Contacto de booking.
- Redes y plataformas.

### 3.2 Prensa / medios / blogs

Necesita:

- Bio corta y bio extendida.
- Fotos descargables.
- Notas de prensa.
- Lanzamientos recientes.
- Frases destacadas.
- Links oficiales.
- Contacto de prensa.

### 3.3 Fans nuevos

Necesitan:

- Escuchar música rápido.
- Ver videos.
- Entender la personalidad de la banda.
- Seguir redes.
- Ver próximas fechas.

### 3.4 Marcas / aliados / sponsors

Necesitan:

- Imagen profesional.
- Alcance y presencia digital.
- Estilo visual claro.
- Posibles formatos de colaboración.

---

## 4. Alcance inicial del sitio

### 4.1 Secciones obligatorias

1. **Hero / portada**
   - Nombre de la banda.
   - Claim breve.
   - Imagen o video visual fuerte.
   - CTA principal: “Descargar EPK” o “Contactar booking”.
   - CTA secundario: “Escuchar ahora”.

2. **Resumen EPK**
   - Descripción de una línea.
   - Género.
   - Ciudad / país.
   - Estado actual: activo, gira, lanzamiento, booking abierto, etc.
   - Links rápidos a música, video, press kit y contacto.

3. **Bio**
   - Bio corta: 60-80 palabras.
   - Bio media: 150-250 palabras.
   - Bio extendida: 400-600 palabras.
   - Versión descargable o copiable para prensa.

4. **Música**
   - Último lanzamiento destacado.
   - Embed de Spotify / Apple Music / Bandcamp / SoundCloud según corresponda.
   - Links a plataformas.
   - Discografía básica.

5. **Videos**
   - Video principal recomendado.
   - Videos en vivo.
   - Videoclips oficiales.
   - Entrevistas o sesiones si existen.

6. **Fotos oficiales**
   - Galería optimizada.
   - Descarga de fotos en alta.
   - Créditos de fotógrafo.
   - Separar fotos horizontales, verticales y prensa.

7. **Fechas / shows**
   - Próximas fechas.
   - Historial destacado.
   - Formato: fecha, venue, ciudad, país, link de tickets.

8. **Prensa / highlights**
   - Notas destacadas.
   - Frases citables.
   - Logos de medios si aplica.
   - Logros: festivales, aperturas, premios, playlists, radios.

9. **Rider y material técnico**
   - Rider técnico descargable.
   - Stage plot.
   - Backline básico.
   - Contacto técnico.

10. **Contacto**
    - Booking.
    - Prensa.
    - Management.
    - Redes sociales.
    - Formulario simple.
    - WhatsApp opcional.

### 4.2 Secciones opcionales

- Merch.
- Newsletter.
- Blog / noticias.
- Letras.
- Historia visual / timeline.
- Integración con Songkick, Bandsintown o similar.
- Kit para sponsors.
- Página privada con material adicional.

---

## 5. Estructura de navegación

### Navegación principal recomendada

- Inicio
- Bio
- Música
- Videos
- Fotos
- Shows
- Prensa
- Rider
- Contacto

### Navegación sticky

Usar navegación sticky solo si no invade la experiencia mobile. En móvil, preferir menú compacto con CTA visible.

### CTA persistente recomendado

- Desktop: botón “Booking” o “Descargar EPK”.
- Mobile: botón flotante discreto o CTA fijo inferior solo si no afecta UX.

---

## 6. Identidad visual base

### 6.1 Dirección artística

La web debe sentirse:

- Peruana sin caer en postal turística.
- Rockera sin parecer plantilla de bar genérico.
- Profesional sin perder carácter.
- Editorial, intensa, fotográfica y directa.

### 6.2 Mood visual sugerido

- Fondo oscuro dominante.
- Alto contraste.
- Texturas sutiles: grano, papel gastado, concreto, metal, cinta, escenario, humo o luz de ensayo.
- Uso controlado de rojo, crema, blanco roto, plata o amarillo tungsteno.
- Fotografía grande y protagonista.
- Animaciones pequeñas, no circo de JavaScript.

### 6.3 Paleta preliminar sugerida

```css
:root {
  --color-bg: #0B0B0D;
  --color-surface: #151519;
  --color-text: #F2EEE7;
  --color-muted: #A8A29A;
  --color-primary: #C1121F;
  --color-secondary: #D6A23A;
  --color-border: #2A2A30;
}
```

### 6.4 Modo claro / oscuro

El modo principal debe ser oscuro. Se puede implementar modo claro automático o alternativo, pero no debe ser prioridad visual del MVP salvo que la banda lo pida.

---

## 7. Tipografía recomendada

### 7.1 Criterio de selección

Para una EPK de rock, la tipografía debe resolver tres necesidades:

1. **Impacto en titulares.**
2. **Legibilidad en bio, prensa y rider.**
3. **Personalidad sin sacrificar performance.**

La tipografía no debe depender de archivos pesados ni de muchas familias externas. Idealmente usar máximo dos familias tipográficas.

### 7.2 Combinación recomendada inicial

#### Opción principal

- **Titulares:** `Oswald`, `Bebas Neue` o `Archivo Black`.
- **Texto:** `Inter`, `Source Sans 3` o `IBM Plex Sans`.

#### Recomendación para punto de partida

Usar:

- **Titulares:** `Oswald`.
- **Texto:** `Inter`.

Motivo:

- `Oswald` tiene presencia condensada, útil para títulos de rock, fechas, headlines y CTAs.
- `Inter` es limpia, moderna, altamente legible y funciona bien en interfaces digitales.
- La combinación permite una web intensa pero profesional.

### 7.3 Alternativas según personalidad de banda

| Personalidad de banda | Titular | Texto | Sensación |
|---|---|---|---|
| Rock clásico / hard rock | Oswald | Inter | Directa, potente, sobria |
| Punk / garage | Bebas Neue | Source Sans 3 | Cruda, rápida, callejera |
| Rock alternativo / indie | Space Grotesk | Inter | Moderna, editorial |
| Metal / heavy | Archivo Black | IBM Plex Sans | Pesada, compacta |
| Rock fusión peruano | Barlow Condensed | Atkinson Hyperlegible | Cálida, clara, distintiva |

### 7.4 Reglas tipográficas

```css
:root {
  --font-display: "Oswald", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;

  --text-xs: clamp(0.75rem, 0.72rem + 0.15vw, 0.82rem);
  --text-sm: clamp(0.875rem, 0.84rem + 0.2vw, 0.95rem);
  --text-base: clamp(1rem, 0.96rem + 0.25vw, 1.08rem);
  --text-lg: clamp(1.2rem, 1.08rem + 0.55vw, 1.5rem);
  --text-xl: clamp(1.6rem, 1.25rem + 1.6vw, 2.4rem);
  --text-hero: clamp(3rem, 1.8rem + 6vw, 7.5rem);
}
```

### 7.5 Uso tipográfico

- Hero: display uppercase, tracking moderado.
- Secciones: títulos condensados, alto contraste.
- Bio: texto amplio, interlineado cómodo.
- Fechas: números y ciudad con jerarquía clara.
- CTA: display o body semibold, nunca decorativa ilegible.

---

## 8. Componentes principales

### 8.1 HeroEPK

**Propósito:** dar impacto inmediato y acceso a acciones principales.

Campos:

- `bandName`
- `tagline`
- `heroImage`
- `heroVideo` opcional
- `primaryCta`
- `secondaryCta`
- `socialLinks`

Reglas:

- El hero no debe bloquear la carga inicial con video pesado.
- En móvil, priorizar imagen optimizada.
- Video de fondo solo si está comprimido y no rompe LCP.

### 8.2 QuickFacts

**Propósito:** resumen escaneable.

Campos:

- Género.
- Ciudad.
- País.
- Año de formación.
- Integrantes.
- Último lanzamiento.
- Contacto booking.

### 8.3 BioBlock

Debe permitir tres versiones:

- `shortBio`
- `mediumBio`
- `longBio`

Debe incluir botón “copiar bio” para prensa si el stack lo permite sin sobrecargar.

### 8.4 MusicEmbed

Debe soportar:

- Spotify.
- Apple Music.
- YouTube Music.
- Bandcamp.
- SoundCloud.
- Links manuales.

Regla: los embeds externos no deben cargarse todos de golpe. Usar carga diferida o interacción previa.

### 8.5 VideoGrid

Debe soportar:

- Video principal.
- Videoclips.
- Videos en vivo.
- Shorts / reels opcionales.

Regla: usar thumbnails locales optimizados y cargar iframe solo al interactuar.

### 8.6 PhotoGallery

Debe incluir:

- Visualización rápida.
- Descarga individual.
- Descarga ZIP opcional.
- Créditos.
- Alt text.

### 8.7 PressQuotes

Campos:

- Medio.
- Cita.
- Fecha.
- URL.
- Logo opcional.

### 8.8 ShowsList

Campos:

- Fecha.
- Venue.
- Ciudad.
- País.
- Estado: próximo, pasado, agotado, cancelado.
- Link de ticket.

### 8.9 Downloads

Archivos:

- EPK PDF.
- Rider técnico.
- Stage plot.
- Logo.
- Fotos alta calidad.
- Press release.

### 8.10 ContactPanel

Campos:

- Booking email.
- Management email.
- Press email.
- WhatsApp opcional.
- Redes.
- Formulario.

Regla: evitar formularios innecesariamente largos. Nombre, email, asunto, mensaje y tipo de consulta es suficiente.

---

## 9. Modelo de contenido preliminar

```ts
export type BandProfile = {
  name: string;
  tagline: string;
  country: "Perú" | string;
  city: string;
  genres: string[];
  formedYear?: number;
  members: BandMember[];
  bios: BandBios;
  socialLinks: SocialLink[];
  contact: BandContact;
};

export type BandMember = {
  name: string;
  role: string;
  photo?: string;
};

export type BandBios = {
  short: string;
  medium: string;
  long: string;
};

export type SocialLink = {
  platform: "instagram" | "youtube" | "spotify" | "tiktok" | "facebook" | "x" | "bandcamp" | "website";
  url: string;
};

export type BandContact = {
  bookingEmail?: string;
  pressEmail?: string;
  managementEmail?: string;
  whatsapp?: string;
};

export type Release = {
  title: string;
  type: "single" | "ep" | "album" | "live";
  releaseDate: string;
  coverImage: string;
  links: SocialLink[];
  description?: string;
};

export type Show = {
  date: string;
  venue: string;
  city: string;
  country: string;
  ticketUrl?: string;
  status: "upcoming" | "past" | "sold_out" | "cancelled";
};

export type PressItem = {
  outlet: string;
  title?: string;
  quote?: string;
  url?: string;
  date?: string;
  logo?: string;
};

export type DownloadAsset = {
  title: string;
  type: "epk_pdf" | "rider" | "stage_plot" | "photo" | "logo" | "press_release" | "zip";
  url: string;
  size?: string;
  updatedAt?: string;
};
```

---

## 10. Requisitos de UX

### 10.1 Carga inicial

La primera pantalla debe responder rápido y mostrar:

- Nombre de la banda.
- Identidad visual.
- CTA principal.
- Acceso a música o EPK.

### 10.2 Escaneo rápido

Un usuario debe poder encontrar en menos de 30 segundos:

- Bio.
- Música.
- Fotos.
- Rider.
- Contacto.

### 10.3 Mobile-first

Prioridades mobile:

- Hero compacto.
- CTA visible.
- Audio/video no invasivo.
- Fotos optimizadas.
- Contacto directo.

### 10.4 Accesibilidad

- Contraste mínimo AA.
- Foco visible.
- Navegación por teclado.
- Botones con área táctil adecuada.
- Alt text en imágenes.
- No depender solo del color.
- Respeto a `prefers-reduced-motion`.

---

## 11. Requisitos de diseño web moderno

Tomar como base las siguientes prácticas:

### 11.1 Micro-animaciones con propósito

Usar transiciones suaves para:

- Entrada de secciones.
- Cambio de filtros.
- Apertura de galería.
- Menú mobile.
- Estados hover/focus.

Evitar animaciones excesivas que parezcan intro de DVD abandonado en 2004.

### 11.2 View Transitions API

Uso opcional según stack y soporte:

- Transiciones entre secciones o páginas.
- Apertura de foto/video.
- Cambio de layout en galería.

Debe existir fallback sin romper experiencia.

### 11.3 Container Queries

Usar para:

- Cards de música.
- Galería.
- Shows.
- Bloques de prensa.
- Downloads.

Cada componente debe adaptarse al espacio disponible, no solo al viewport.

### 11.4 CSS moderno

Usar:

- Design tokens.
- CSS nesting si el stack lo soporta.
- `:has()` para estados condicionales donde aporte.
- `clamp()` para escalas fluidas.
- `light-dark()` solo si se decide tema dual.

### 11.5 Arquitectura Islands / Partial Hydration

Recomendación futura si se usa Astro, Qwik o arquitectura similar:

- HTML estático para la mayoría de secciones.
- Hidratación solo en galería, reproductores, formulario y filtros.
- Evitar cargar frameworks completos para contenido casi estático.

---

## 12. Performance y Core Web Vitals

### 12.1 Objetivos técnicos

- INP objetivo: menor o igual a 200 ms en el 75% de usuarios.
- LCP objetivo: menor o igual a 2.5 s.
- CLS objetivo: menor o igual a 0.1.
- JS inicial mínimo.
- Imágenes optimizadas y con dimensiones definidas.

### 12.2 Reglas para medios

- Usar formatos modernos: WebP / AVIF cuando sea posible.
- No cargar iframes de Spotify/YouTube de inmediato si hay varios.
- Usar thumbnails y lazy loading.
- Hero video solo si está muy optimizado.
- Descargas pesadas separadas del render inicial.

---

## 13. SEO y metadata

### 13.1 SEO base

Cada página o sección relevante debe tener:

- Title.
- Meta description.
- Open Graph.
- Twitter/X card.
- Imagen social.
- Canonical si aplica.

### 13.2 Keywords iniciales

- banda de rock peruana
- rock peruano
- banda peruana
- EPK banda rock
- música independiente peruana
- conciertos rock Perú
- booking banda rock Perú

Estas keywords deben ajustarse según nombre real, género exacto y ciudad.

### 13.3 Datos estructurados

Evaluar JSON-LD:

- `MusicGroup`
- `MusicAlbum`
- `MusicRecording`
- `Event`
- `Organization`

---

## 14. Privacidad y analítica

### 14.1 Analítica

Pendiente definir herramienta:

- Plausible.
- Umami.
- Matomo.
- Google Analytics.
- Analítica propia.

Recomendación inicial: usar analítica ligera, privada y sin exceso de cookies.

### 14.2 Formularios

- Consentimiento claro.
- Anti-spam.
- No recolectar datos innecesarios.
- Mensaje de éxito claro.
- Mensaje de error entendible.

---

## 15. Descargas y assets

### 15.1 Estructura sugerida

```txt
/public
  /assets
    /images
      /hero
      /press
      /gallery
      /covers
    /downloads
      epk.pdf
      rider-tecnico.pdf
      stage-plot.pdf
      press-kit.zip
    /logos
      logo-light.svg
      logo-dark.svg
      logo-mark.svg
```

### 15.2 Convenciones de nombre

```txt
banda-nombre-foto-prensa-01.webp
banda-nombre-foto-prensa-01-hires.jpg
banda-nombre-rider-tecnico-2026.pdf
banda-nombre-stage-plot-2026.pdf
banda-nombre-epk-2026.pdf
```

---

## 16. Stack pendiente de definición

Todavía no se define stack. Este devspec no impone tecnología.

### 16.1 Opciones candidatas

#### Opción A: Astro

Buena opción si el sitio será mayormente estático, rápido, SEO-friendly y con pocas partes interactivas.

Pros:

- Ideal para EPK.
- Islands architecture nativa.
- Muy buen performance.
- Fácil despliegue estático.
- Buen manejo de Markdown/MDX.

Contras:

- Si luego se vuelve una plataforma compleja, podría requerir backend aparte.

#### Opción B: Next.js

Buena opción si se espera crecimiento hacia CMS, panel administrativo, rutas dinámicas, autenticación o integraciones más complejas.

Pros:

- Ecosistema amplio.
- SSR/SSG.
- Integración con APIs.
- Escalable.

Contras:

- Puede ser más pesado si se usa sin control.

#### Opción C: HTML/CSS/JS estático

Buena opción para MVP ultra simple.

Pros:

- Rápido.
- Barato.
- Fácil de hostear.

Contras:

- Menos mantenible si el contenido cambia mucho.
- Sin estructura moderna si crece.

#### Opción D: WordPress / Headless CMS

Buena opción si la banda o manager necesita actualizar contenido sin tocar código.

Pros:

- Edición simple.
- Plugins.
- Familiar para muchos usuarios.

Contras:

- Más mantenimiento.
- Mayor riesgo de performance pobre si se sobrecarga.

### 16.2 Recomendación inicial

Para este caso, la recomendación preliminar es:

**Astro + Markdown/Content Collections + componentes ligeros + despliegue estático.**

Motivo:

- Un EPK es principalmente contenido, media, SEO y velocidad.
- Permite usar islands solo donde haya interacción.
- Reduce JavaScript innecesario.
- Facilita mantener el sitio con archivos de contenido.

Esta recomendación puede cambiar si se confirma que habrá panel administrativo, login, CMS, tienda o contenido muy dinámico.

---

## 17. CMS pendiente

Opciones:

1. Sin CMS: contenido en Markdown/JSON.
2. CMS Git-based: Decap CMS.
3. Headless CMS: Strapi, Directus, Sanity, Contentful.
4. WordPress Headless.
5. Panel propio.

Recomendación preliminar:

- MVP: Markdown/JSON.
- Fase 2: CMS si la banda necesita autogestión frecuente.

---

## 18. Hosting y despliegue pendiente

Opciones candidatas:

- Cloudflare Pages.
- Vercel.
- Netlify.
- VPS propio con Docker + Traefik.
- Hosting tradicional.

Recomendación preliminar:

- Para MVP: Cloudflare Pages o Vercel.
- Para infraestructura propia: Docker + Traefik si forma parte de un ecosistema mayor.

Requisitos deseables:

- HTTPS automático.
- HTTP/3 si está disponible.
- CDN.
- Cache eficiente.
- Deploy desde Git.

---

## 19. Roadmap sugerido

### Fase 0: Definición

- Responder preguntas abiertas.
- Definir nombre de banda, género, tono y assets disponibles.
- Elegir stack.
- Elegir hosting.
- Definir si habrá CMS.

### Fase 1: MVP EPK

- Home one-page.
- Bio.
- Música.
- Videos.
- Fotos.
- Descargas.
- Contacto.
- SEO base.
- Performance base.

### Fase 2: Profesionalización

- Press kit descargable.
- JSON-LD.
- Galería avanzada.
- Analítica.
- Optimización de Core Web Vitals.
- Formulario con anti-spam.

### Fase 3: Crecimiento

- CMS.
- Shows dinámicos.
- Blog/noticias.
- Integraciones con plataformas.
- Merch.
- Newsletter.

---

## 20. Definition of Done inicial

El MVP se considera listo cuando:

- La web carga correctamente en mobile y desktop.
- El hero comunica quién es la banda.
- Se puede escuchar música en máximo 2 clics.
- Se puede contactar booking en máximo 2 clics.
- Se puede descargar EPK/rider/fotos.
- Las imágenes están optimizadas.
- Existe metadata social.
- La navegación es accesible.
- El sitio no depende de JavaScript pesado para mostrar contenido crítico.
- Lighthouse no muestra problemas graves de performance/accesibilidad/SEO.

---

## 21. Preguntas abiertas para cerrar dudas

1. ¿Cuál es el nombre de la banda y ya existe logo oficial?
2. ¿Qué subgénero representa mejor a la banda: rock clásico, alternativo, punk, metal, grunge, indie rock, fusión u otro?
3. ¿La web será solo EPK profesional o también página oficial para fans?
4. ¿Ya existen fotos profesionales, press kit, rider técnico y stage plot?
5. ¿Cuál será el CTA principal: contratar, descargar EPK, escuchar música o anunciar nuevo lanzamiento?
6. ¿La banda tiene un lanzamiento reciente o próximo que deba dominar la portada?
7. ¿El sitio debe estar solo en español o también en inglés?
8. ¿Quién actualizará el contenido: desarrollador, manager, integrante de la banda o nadie después del lanzamiento?
9. ¿Se quiere una web one-page o varias páginas internas?
10. ¿Hay preferencia de stack, hosting o dominio, o se definirá desde cero?

---

## 22. Decisiones pendientes

| Tema | Estado | Decisión provisional |
|---|---:|---|
| Stack | Pendiente | Astro recomendado como base inicial |
| CMS | Pendiente | Markdown/JSON para MVP |
| Hosting | Pendiente | Cloudflare Pages / Vercel |
| Idioma | Pendiente | Español por defecto |
| Tipografía | Propuesta | Oswald + Inter |
| Modo visual | Propuesta | Oscuro principal |
| Analítica | Pendiente | Plausible / Umami sugeridos |
| Formulario | Pendiente | Simple con anti-spam |
| Descargas | Pendiente | EPK PDF, rider, fotos, stage plot |

---

## 23. Notas para desarrollo futuro

- No implementar stack hasta cerrar decisiones de Fase 0.
- No usar librerías de animación pesadas sin justificación.
- No cargar múltiples embeds externos en el render inicial.
- No usar imágenes sin compresión.
- No diseñar solo para desktop.
- No sacrificar legibilidad por estética rockera.
- No esconder contacto, rider ni descargas.

---

## 24. Prompt base para IA/desarrollador

```md
Actúa como arquitecto frontend senior y diseñador UX/UI. Usa este DEVSPEC.md como fuente de verdad para construir una página EPK de una banda de rock peruana. Antes de implementar, identifica decisiones pendientes, propone estructura de carpetas según el stack elegido y genera componentes reutilizables. Prioriza performance, SEO, accesibilidad WCAG 2.2, mobile-first, contenido EPK claro y estética rockera profesional. No inventes datos de la banda: usa placeholders donde falte información.
```

---

## 25. Resumen ejecutivo

Este proyecto busca construir una EPK web moderna para una banda de rock peruana. La dirección inicial prioriza velocidad, claridad, SEO, accesibilidad y una identidad visual oscura, editorial y potente. La recomendación preliminar es usar Astro si el proyecto se mantiene como sitio EPK mayormente estático. La tipografía inicial sugerida es Oswald para titulares e Inter para texto. El stack, CMS, hosting, dominio, contenido real y flujo de actualización quedan pendientes de definición.
