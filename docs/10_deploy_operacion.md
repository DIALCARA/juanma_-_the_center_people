# 10 - Deploy y operación

## Hosting inicial

Usar VPS propio con Traefik.

Inicio del proyecto:

- Trabajar con IP.
- Luego asociar dominio.

## Dominio técnico

Un dominio técnico es un dominio o subdominio temporal usado para desarrollo, pruebas o staging antes del dominio oficial.

Ejemplos:

```txt
epk-demo.tudominio.com
juanma-demo.tudominio.com
staging-juanma.tudominio.com
```

Sirve para:

- Probar HTTPS.
- Evitar usar IP fea.
- Compartir avance.
- Separar demo de producción.

Si no se tiene dominio técnico, se puede iniciar con IP y puerto.

## IP inicial

Ejemplo:

```txt
http://IP_DEL_VPS:PUERTO
```

Limitaciones:

- No es ideal para marca.
- HTTPS con Let's Encrypt normalmente requiere dominio.
- No es cómodo para compartir.

## Dominio final

Pendiente de definición.

El sistema debe permitir cambiar `PUBLIC_SITE_URL` sin tocar código.

## Docker Compose

Servicios mínimos:

```txt
web
api
umami
umami-db
```

Opcional:

```txt
backup
filebrowser
```

## Volúmenes

```txt
api_data:/app/data
media_data:/media/juanma-center-people
umami_db_data:/var/lib/postgresql/data
```

## Traefik

**Decisión aprobada:** No se despliega un Traefik propio. Se usa la instancia existente en el VPS.

### Instancia existente

```txt
Imagen:      traefik:v3.1
Red Docker:  nexus_main_net (externa)
Provider:    Docker (exposedByDefault=false)
Resolver:    letsencrypt (HTTP challenge)
HTTP→HTTPS:  redirect global ya configurado
```

### Integración de nuestros servicios

Todos los contenedores deben:

1. Conectarse a la red `nexus_main_net`.
2. Tener el label `traefik.enable=true`.
3. Tener labels de router con `Host()` para su subdominio.
4. Tener label del resolver: `tls.certresolver=letsencrypt`.

### Rutas por subdominio

```txt
www.DOMINIO     -> web   (Astro SSR)
admin.DOMINIO   -> admin (Next.js)
api.DOMINIO     -> api   (FastAPI)
```

### Fase sin dominio (IP temporal)

Exponer los servicios por puertos directos en `docker-compose.yml` de desarrollo:

```txt
web:   puerto 3000
admin: puerto 3001
api:   puerto 8000
```

En producción (con dominio), los puertos directos se eliminan y el tráfico pasa exclusivamente por Traefik.

### Labels tipo para cada servicio (en docker-compose.prod.yml)

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.juanma-web.rule=Host(`www.${DOMAIN}`)"
  - "traefik.http.routers.juanma-web.entrypoints=websecure"
  - "traefik.http.routers.juanma-web.tls.certresolver=${CERT_RESOLVER}"
  - "traefik.http.services.juanma-web.loadbalancer.server.port=3000"
  - "traefik.docker.network=${TRAEFIK_NETWORK}"
networks:
  traefik_net:
    external: true
    name: ${TRAEFIK_NETWORK}
```

## Backups

MVP:

- Backup diario de SQLite.
- Backup diario de `/media`.
- Backup de configuración `.env` fuera del repositorio.

Regla:

```txt
backup de db + backup media = sitio recuperable
```

## Logs

Registrar:

- Errores API.
- Intentos de login fallidos.
- Subidas de multimedia.
- Solicitudes de descarga.
- Envíos por Mailgun.

## Seguridad básica

- No subir `.env` al repo.
- Hash de password.
- JWT secret fuerte.
- Rate limit login/formularios.
- Validación de archivos.
- Tamaño máximo de upload.
- Backoffice no indexable.

## Tamaños de subida

Configurables desde CMS (tabla `site_settings`). Valores por defecto:

```txt
max_image_size_mb:    15
max_video_size_mb:    200
max_zip_size_mb:      500
max_download_size_mb: 100
```

