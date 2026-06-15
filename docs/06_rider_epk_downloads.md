# 06 - Rider, EPK y descargas

## Objetivo

Dar a prensa y productores material profesional sin mezclarlo con la experiencia principal de fans.

## Sección Prensa/EPK

Debe estar en:

```txt
/prensa-epk
```

Debe incluir:

- Quick facts.
- Bio corta.
- Bio larga.
- Música principal.
- Video principal si existe.
- Fotos oficiales.
- Press quotes si existen.
- Downloads.
- Rider técnico.
- Contacto de prensa/booking.

## Rider técnico

El rider es un documento para organizadores, técnicos de sonido, bares, festivales o productoras. No está pensado para el fan común, pero puede estar disponible en la sección EPK.

No requiere login público. Puede manejarse con:

1. Vista resumida pública.
2. Descarga bajo solicitud/aprobación.
3. Envío por correo luego de aprobación desde CMS.

## Plantilla de rider desde CMS

El CMS debe permitir crear/editar rider con estos bloques:

### 1. Integrantes

Campos:

```txt
nombre
rol
instrumento
notas
```

### 2. Input list

Campos:

```txt
numero_canal
fuente
tipo_microfono_o_di
soporte
notas
```

Ejemplos:

```txt
Kick
Snare
Hi Hat
Overhead L/R
Bajo DI
Guitarra mic
Voz principal
Coros
```

### 3. Stage plot

MVP:

- Subir imagen/PDF del stage plot.
- Campo de notas.

Fase posterior:

- Constructor visual simple.

### 4. Backline

Campos:

```txt
equipo
provee: banda | local | por confirmar
cantidad
notas
```

### 5. Monitoreo

Campos:

```txt
musico
necesita_escuchar
monitor_tipo: piso | in-ear | otro
notas
```

### 6. Requerimientos eléctricos

Campos:

```txt
ubicacion
cantidad_tomas
voltaje
notas
```

### 7. Duración del show

Campos:

```txt
tipo_show: promocional | estandar | completo | otro
duracion_minutos
notas
```

### 8. Soundcheck / line check

Campos:

```txt
soundcheck_minutos
linecheck_minutos
horario_preferido
notas
```

### 9. Contacto técnico

Campos:

```txt
nombre
telefono
email
rol
```

### 10. Hospitality básico opcional

Campos:

```txt
agua
espacio_guardado_instrumentos
zona_descarga
camerino
alimentacion
notas
```

## Press quotes

Frases reales de medios, productores, curadores o reseñas.

No inventar.

Campos:

```txt
quote
autor
medio
url
fecha
visible
```

Si no existen, la sección debe ocultarse o mostrar mensaje interno solo en CMS.

## Downloads

Los downloads existen para facilitar a prensa/productores el acceso a material profesional.

Descargas mínimas aceptadas:

1. EPK PDF.
2. Foto oficial alta resolución.
3. Rider técnico básico.
4. Bio corta y larga.

## Tipos de descarga

Cada descarga debe tener:

```txt
access_type: public | request_required | private
```

### public

Se descarga directamente.

### request_required

El visitante solicita acceso dejando email y motivo. Desde CMS se aprueba o rechaza.

### private

Solo visible en CMS, no se muestra públicamente.

## Flujo de solicitud de descarga

1. Visitante abre `/prensa-epk`.
2. Ve un recurso con botón `Solicitar descarga`.
3. Completa:

```txt
nombre
email
organizacion
motivo: prensa | booking | festival | colaboracion | otro
mensaje
```

4. Se registra solicitud en CMS.
5. Admin revisa.
6. Admin aprueba o rechaza.
7. Si aprueba, el sistema envía correo (vía SMTP/Zoho Mail) con enlace temporal o adjunto/enlace protegido.

## Campos de recurso descargable

```txt
id
titulo
descripcion
file_url
thumbnail_url
access_type
is_visible
send_via_email
expires_in_days
created_at
updated_at
```

## Seguridad de enlaces restringidos

Para descargas aprobadas:

- Generar token único.
- Expirar token.
- Registrar descarga.
- No exponer ruta real si es restringida.

