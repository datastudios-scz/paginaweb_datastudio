# Bitácora de cambios

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
