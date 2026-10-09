# Bitácora de cambios

## 09/10/2026 · Recorrido animado del Portal BI

- **Página nueva `/portal-bi/como-funciona/`**: el Portal BI como lo vive una persona del equipo, en un minuto y en una sola toma. Entra con su usuario (con las olas del login real), encuentra sus tableros en el menú, abre un reporte de Power BI con IA, exporta a Excel, abre el chat al costado y le pregunta; ve la consulta DAX, la tabla, el análisis, y pide el gráfico. Ocho pasos narrados con texto que entra palabra por palabra.
- La pantalla es el portal dibujado en HTML a tamaño real (1280 × 760). Una **cámara** lo encuadra y se acerca a lo que importa, y un cursor viaja en curva y hace clic. Se puede pausar, saltar de paso, volver a empezar y ver a pantalla completa, también con el teclado (espacio y flechas).
- **Escritorio ancho**: la narración va al costado y la ventana crece (en una laptop de 1440 × 790, de ~800 a ~1000 px de ancho). **Escritorio más cuadrado**: narración centrada debajo, como subtítulos. **Teléfono**: la toma llena la ventana y se acerca hasta que se lee; el chat y el visual de barras se angostan para entrar enteros. **Teléfono acostado**: también con la narración al costado (la ventana pasó de 278 a 450 px).
- **Movimiento reducido**: paso a paso con Anterior y Siguiente, hasta el cierre con la compra.
- El héroe de `/portal-bi/` cambia «Pide una demo · 30 min» por **«Mira cómo funciona»**, que abre el recorrido y lo reproduce solo (`#ver`). La demo de 30 minutos sigue más abajo en la página.
- Banco nuevo, `npm run recorrido`: portada, `#ver`, movimiento reducido, teclado, duración de cada paso y CLS con red lenta en cinco tamaños. Probado saboteando: detecta lo que cuida.
- QA 42/42 sin problemas. Lighthouse de `/portal-bi/como-funciona/`: escritorio 100 / 100 / 100 / 100; móvil 100 en 3 de 4 corridas (99 en la otra, por el Speed Index). `/portal-bi/` queda como estaba: 99–100 en móvil con las mismas métricas (LCP 1,7 s), 100 en escritorio.

## 04/10/2026 · Nuevo número de contacto y textos del inicio

- WhatsApp y teléfono: **+591 7600 8398** (`wa.me/59176008398`), en `src/data/sitio.ts`; llega a todo el sitio.
- Inicio: botón del Portal BI "Ver más detalles"; sin la pregunta "¿Cuántas personas…?"; la de Consultoría pasa a "¿Quieres tomar decisiones basadas en datos?"; "planillas" → "Excels".

## 04/10/2026 · Gráfico de soluciones: Portal BI como producto estrella

- Escritorio: barras con tope redondeado y degradado; la del Portal BI es más ancha, verde, con sombra e insignia "Producto estrella".
- Móvil: cada solución es una tarjeta clara con el texto sobre un solo fondo y la barra como franja al pie (antes el relleno partía el texto en dos colores). El Portal BI, tarjeta verde con insignia.

## 04/10/2026 · Ajustes del dueño a las maquetas del Portal BI

- **Chat**: vuelve la maqueta anterior (pregunta, pasos, DAX, mapa de calor, líneas y el cursor que escribe varias preguntas), idéntica a la de `6054a11`. El visor con el reporte al costado se retiró: el dueño prefiere que la sección muestre solo el chat.
- **Marca blanca**: las dos pantallas de ingreso usan Poppins; dos tipografías juntas se veían mal.
- El chat del celular pasó a su propio componente (`MaquetaChatMovil`), sin la vista de consulta que ya no se usa.
- QA 36/36 sin problemas; Lighthouse `/portal-bi/` 100 / 100 / 100 / 100.

## 04/10/2026 · Maquetas del Portal BI fieles al producto real

- Cada maqueta de `/portal-bi/` reproduce **una pantalla real de hoy**, calcada del CSS del portal y comparada contra capturas del portal funcionando con datos de ejemplo: el portal (menú con el color de marca, migas, tarjetas de vidrio, insignia IA), dos **pantallas de ingreso** para la marca blanca (ACME y NORDEX, con otra tipografía), **dos celulares** (tableros y chat con gráfico y micrófono), el **visor con el chat al costado** (reporte de Power BI + pregunta, pasos, DAX, tabla y análisis) y el **panel de administración** (14 módulos, asignaciones agrupadas y el cuadro "Asignar tablero").
- Un solo momento con movimiento: la respuesta del chat se arma sola al entrar en pantalla y el hilo baja hasta el análisis.
- Un mismo set de datos de ejemplo en todas (5.216.100 en 2026, +7,9 %), rotulado en la barra de la ventana.
- La vitrina del inicio hereda la maqueta nueva del portal.
- Componentes nuevos en `src/components/portal/`: `MaquetaVisor`, `MaquetaLogin`, `MaquetaTelefono`, `MaquetaAdmin`, y los tokens compartidos en `maqueta.css`.
- QA 36/36 sin problemas. Lighthouse móvil `/portal-bi/`: 99–100 / 100 / 100 / 100; inicio 100 en todo.

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
