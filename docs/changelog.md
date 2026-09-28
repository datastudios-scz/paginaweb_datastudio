# Bitácora de cambios

## 27/09/2026 · Portada de marca, subpáginas por producto y menú lateral

- **Portada** a pantalla completa: el logo se arma (monitor, cuatro barras, wordmark "DATA STUDIO"), lema y "Bienvenido, ¿estás preparado para innovar?", sobre un tablero de datos en perspectiva hecho en código. Al bajar, las soluciones suben como un telón y las barras del logo pasan al gráfico de soluciones (CSS scroll-driven, sin JS).
- **Inicio** que distribuye: gráfico de 4 barras = 4 soluciones (con el bisel del monitor), una vitrina por producto con las barras del logo marcando la suya, y manifiesto de trabajo remoto. Sin WhatsApp en el inicio.
- **Subpáginas nuevas**: `/social-metrics-bi/` (con el contenido del dueño, vista de publicaciones, recorrido de los datos, tablero completo, acceso, implementación y tratamiento de datos), `/tienda-ecommerce/` (maqueta de tienda de ejemplo con productos y precios) y `/consultoria/` (héroe "tres planillas, tres cifras → un reporte" y recorrido de los datos).
- **Portal BI** también se vende como compra de código + guía de implementación + curso grabado (sección `#compra`); promesas sin confirmar dichas una sola vez.
- **Navegación**: enlace activo en escritorio (`aria-current`) y menú móvil como cajón lateral con `<dialog>`. Migas de pan en cada subpágina.
- **Público internacional**: fuera ciudad y país; "Implementación remota en cualquier país".
- Nuevas imágenes OG por subpágina; CI verifica también las tres rutas nuevas.
- QA 36/36 sin problemas (6 páginas × 6 anchos); Lighthouse móvil 100/100/100/100 en las 5 páginas; detector de diseño sin hallazgos.

## 25/09/2026 · Publicación y ajustes de CI

- GitHub Pages pasó de "rama main" (legacy) a **GitHub Actions** y se **forzó HTTPS**. Primer despliegue exitoso (27 s); verificado en producción: rutas legales idénticas, callback de TikTok con query string, HTTP → HTTPS, QA sin problemas en 18 combinaciones de página y ancho.
- Runner del workflow fijado en `ubuntu-24.04`.

## 25/09/2026 · Nuevo sitio en Astro: inicio y página del Portal BI

- Migración de HTML suelto (GitHub Pages legacy) a **Astro 7.3** con build en GitHub Actions.
- **Inicio** nuevo: hero con las cuatro barras del logo como las cuatro soluciones; secciones de Portal BI (con maqueta del portal), Social Metrics BI (con la descripción pública de las integraciones y del tratamiento de datos), Tienda e-commerce, Consultoría de datos (capacidades y proceso), preguntas frecuentes y llamado final.
- **Página `/portal-bi/`** adaptada a la marca desde la página de producto del repo del Portal BI: maquetas del portal, marca blanca, celular, chat con IA (DAX, mapa de calor, líneas), panel de administración, instalación con verificación, calculadora de ahorro, requisitos, límites, preguntas y cierre.
- Página 404 propia.
- Logo vectorial: ícono geométrico exacto + wordmark trazado. Favicons, íconos de app e imágenes OG generados (`npm run recursos`).
- Fuentes Poppins y DM Mono autoalojadas.
- SEO: canónicas, Open Graph, JSON-LD (Organization, WebSite, FAQPage, BreadcrumbList), sitemap, robots.
- Seguridad: CSP con hashes, acciones fijadas por SHA, permisos mínimos, Dependabot, HTTPS forzado, verificación de rutas críticas en CI.
- Páginas legales, callback de TikTok y verificación de Google preservadas byte a byte en `public/`.
- QA: sin scroll horizontal ni errores de consola/CSP de 320 a 1440 px; Lighthouse 100/100/100/100 en ambas páginas.
- Documentación inicial en `/docs` y `CLAUDE.md`.
