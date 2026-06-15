# Prompt de implementación para IA

Actúa como arquitecto senior full-stack y generador determinístico de implementación para un proyecto web real.

Vas a implementar el sitio oficial + EPK + CMS de contenido para la banda peruana **Juanma & The Center People**.

Lee todos los archivos `.md` de esta carpeta antes de proponer o escribir código. Respeta las decisiones aprobadas en los documentos. No reemplaces el stack salvo que encuentres una incompatibilidad técnica grave y explícala antes.

## Objetivo

Construir un proyecto con:

- Frontend público en Astro.
- Backend/API CMS en FastAPI.
- Base de datos SQLite.
- Multimedia en filesystem local del VPS.
- Email SMTP con Zoho Mail.
- Analítica con Umami.
- Deploy con Docker Compose y Traefik.
- Inicio por IP y posterior dominio.

## Resultado esperado

Generar un repositorio funcional con esta estructura sugerida:

```txt
juanma-epk/
├── apps/
│   ├── web/
│   └── api/
├── storage/
│   └── media/
├── infra/
│   └── docker-compose.yml
├── docs/
│   └── devspec/
├── scripts/
├── .env.example
└── README.md
```

## Reglas de implementación

1. No mezclar el sitio público con lógica privada del CMS sin separación clara.
2. La web pública debe ser rápida, SEO-friendly y con poco JavaScript.
3. El CMS debe permitir editar contenido, no rediseñar la web.
4. Cada sección debe tener `enabled` y `show_empty_state` cuando aplique.
5. Las categorías multimedia no deben estar hardcodeadas de forma rígida.
6. Las fotos deben generar thumbnails automáticamente.
7. Para videos/reels, permitir thumbnail manual en MVP y dejar preparado FFmpeg para fase posterior.
8. Google Photos debe tratarse como fuente temporal `best effort`, no como storage final obligatorio.
9. Los downloads deben soportar acceso público, privado y bajo solicitud/aprobación.
10. El rider técnico debe poder editarse desde CMS usando plantillas.
11. El formulario de contacto debe guardar mensaje y enviar por SMTP (Zoho Mail).
12. Umami debe medir páginas y eventos personalizados.
13. El sistema debe correr con Docker Compose.
14. Las variables sensibles deben ir en `.env`, nunca hardcodeadas.
15. Preparar el sistema para migrar SQLite a PostgreSQL en el futuro.

## Prioridad de fases

Implementa en este orden:

1. Base del monorepo.
2. API FastAPI + SQLite + modelos.
3. Auth básica CMS.
4. CRUD site settings, sections y media.
5. Upload de imágenes + thumbnails.
6. Astro público con home y páginas principales.
7. CMS básico.
8. Contacto + SMTP (Zoho Mail).
9. Downloads con solicitud/aprobación.
10. Rider técnico editable.
11. Umami.
12. Docker Compose.
13. README de operación.

## Contenido base obligatorio

Usar como datos iniciales:

```txt
band_name = Juanma & The Center People
tagline = Rock alternativo peruano entre la nostalgia, la calle y el ruido interior.
subgenre = Rock alternativo peruano
spotify_url = https://open.spotify.com/intl-es/artist/2lnewal0FLnYLAnziEcIgI?si=B_GwlY5-QPS2YN4Zhd1LbQ
```

Secciones iniciales:

```txt
Inicio
Banda
Música
Fotos
Videos
Reels
Prensa/EPK
Fechas/Eventos
Contacto
```

Categorías multimedia iniciales:

```txt
Fotos: Banda, En vivo, Backstage, Sesiones/Prensa, Flyers, Portadas/Artwork
Videos: Videoclips oficiales, Live sessions, Entrevistas, Ensayos, Teasers
Reels: Promocionales, En vivo, Backstage, Lanzamientos
Descargables: Fotos prensa, Portada/Logo, Rider técnico, EPK PDF
```

## Estilo visual

No usar estética metalera genérica. No usar calaveras, fuego, sangre o clichés de rock duro si no están en identidad real de la banda.

La dirección visual debe ser:

- Rock alternativo peruano.
- Melódica.
- Urbana.
- Nostálgica.
- Editorial.
- Clara para prensa y productores.

## Entregables técnicos esperados

- Código fuente.
- Modelos de datos.
- Endpoints API.
- Pantallas públicas.
- Pantallas CMS.
- Docker Compose.
- `.env.example`.
- Scripts de inicialización.
- README con instrucciones de instalación, ejecución, backup y deploy.

## Criterio de aceptación

El proyecto se considera correcto cuando:

- Puede levantarse localmente con Docker Compose.
- El sitio público muestra contenido desde la API o datos iniciales.
- El CMS permite modificar contenido principal.
- Se pueden subir imágenes y ver thumbnails.
- El formulario de contacto guarda y envía mensaje.
- Las descargas bajo solicitud pueden aprobarse desde CMS.
- Umami queda listo para registrar eventos.
- El sistema puede desplegarse por IP y luego cambiar a dominio.

