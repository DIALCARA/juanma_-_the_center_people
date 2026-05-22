# 00 - Contexto y decisiones aprobadas

## Proyecto

Sitio oficial + EPK profesional + CMS de contenido para la banda peruana:

**Juanma & The Center People**

## Objetivo general

Crear una web oficial moderna, rápida, administrable y visualmente coherente para presentar a la banda ante tres públicos principales:

1. Fans y público general.
2. Prensa, medios y curadores.
3. Productores, bookers, bares, festivales y organizadores.

La web debe permitir que cada perfil encuentre lo que busca sin atravesar contenido que no le corresponde.

## Decisiones ya aprobadas

- Nombre oficial: `Juanma & The Center People`.
- Tipo de sitio: página oficial + EPK profesional.
- Estructura: combinación de one-page con páginas internas.
- Stack aprobado y detallado:
  - Frontend público: Astro en modo **SSR/hybrid** con adapter Node.js.
  - Backoffice CMS: **Next.js 14** (App Router, TypeScript) — subdominio `admin.DOMINIO`.
  - Backend/API: FastAPI (Python).
  - Base de datos API: SQLite (migrable a PostgreSQL).
  - Base de datos Umami: PostgreSQL.
  - Analítica: Umami (self-hosted en el mismo Compose).
  - Email/formulario: Mailgun (cuenta existente del cliente, dominio propio).
  - Proxy/deploy: Docker Compose + **Traefik externo** (instancia existente en VPS, red `nexus_main_net`).
  - Desarrollo local: Docker Compose con puertos directos (sin Traefik).
  - Producción: labels Traefik, certificados Let's Encrypt, subdominio desde el inicio.
- CMS/backoffice: Next.js, subdominio `admin.DOMINIO`, **UI 100% en español**.
- Botón "Publicar" en CMS: guarda en DB → contenido live inmediato (sin rebuild).
- Auth CMS: JWT en **HttpOnly cookie** (seguro, sin impacto en performance).
- Multimedia: alojada en servidor propio, con estructura flexible.
- Google Photos: solo como fuente temporal best-effort; flujo primario es upload ZIP.
- Contenido editable desde CMS: sí.
- Secciones administrables con `enabled`.
- Rider técnico y EPK: incluir plantillas desde CMS (con tabla `rider_hospitality`).
- Downloads: incluir, con posibilidad de descarga pública o bajo solicitud/aprobación.
- Límites de upload: editables desde CMS.
- Imágenes Docker: multi-stage builds (sin dev deps en producción).
- Estilo musical base: rock alternativo peruano.
- Referencias de sensibilidad musical: TK, Libido, Mar de Copas, Zen, Campo de Almas, Fuera del Resto, Hoja de Parra.
- Tagline inicial aprobado:
  - `Rock alternativo peruano entre la nostalgia, la calle y el ruido interior.`
- El CMS debe ofrecer ese tagline, 10 alternativas y opción de texto propio.

## Nota de criterio visual

Evitar estética de rock genérico, agresiva o caricaturesca. No usar clichés visuales como calaveras, fuego, sangre, cadenas o estética metalera si no corresponden a la identidad real de la banda.

La banda se debe tratar como rock alternativo peruano de sensibilidad melódica, urbana, emocional y posiblemente romántica/corta venas. La dirección visual debe ser elegante, nocturna, limeña, nostálgica y editorial.

