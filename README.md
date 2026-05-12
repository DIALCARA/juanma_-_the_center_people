# Juanma $ The Center People

Web para una banda peruana de rock pop con galeria interna sincronizada desde
un album publico de Google Photos.

## Ejecutar

```bash
npm start
```

Luego abre `http://localhost:3000`.

## Galeria

La web usa `/api/gallery` para leer el album publico configurado en
`GOOGLE_PHOTOS_ALBUM_URL`. Por defecto usa:

```text
https://photos.app.goo.gl/uwu8JLuMXjuRSUUH7
```

Google Photos no permite incrustar el album en un `iframe`, por eso el servidor
extrae las imagenes publicas y las entrega a la interfaz como una galeria nativa.
El cache dura 10 minutos y puede cambiarse con `GALLERY_CACHE_MS`.

## Personalizar

- Cambia redes sociales en `index.html`.
- Reemplaza el correo `booking@juanmarockpop.pe` en `script.js`.
- Actualiza canciones en el arreglo `tracks` de `script.js`.
