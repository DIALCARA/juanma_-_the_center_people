# Devspec modular - Juanma & The Center People

Carpeta de especificaciones para implementar el sitio oficial + EPK + CMS de **Juanma & The Center People**.

Este paquete está pensado para que una IA de desarrollo lea los archivos en orden y ejecute la implementación sin mezclar los objetivos de cada público: fans, prensa, bookers/productores y administradores de contenido.

## Orden recomendado de lectura

1. `00_contexto_y_decisiones.md`
2. `01_producto_y_alcance.md`
3. `02_ux_estructura_y_contenido.md`
4. `03_diseno_visual_identidad.md`
5. `04_cms_backoffice.md`
6. `05_multimedia_storage.md`
7. `06_rider_epk_downloads.md`
8. `07_stack_arquitectura.md`
9. `08_modelo_datos_api.md`
10. `09_analytics_seo_accesibilidad.md`
11. `10_deploy_operacion.md`
12. `11_roadmap_checklist.md`
13. `prompt.md`

## Decisión principal

Implementar una web híbrida:

- Home tipo one-page narrativa.
- Páginas internas especializadas.
- CMS/backoffice para autogestión de contenido.
- Multimedia alojada en servidor propio inicialmente.
- Analítica con Umami.
- Deploy inicial por IP en VPS con Traefik, luego dominio.

