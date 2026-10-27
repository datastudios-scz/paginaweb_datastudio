# Arquitectura

## Stack

| Pieza | Elección | Motivo |
| --- | --- | --- |
| Generador | **Astro 7.3** (salida 100 % estática) | Cero JavaScript de framework, componentes reutilizables, CSP con hashes y fuentes optimizadas nativas |
| Estilos | CSS propio con tokens (`src/styles/tokens.css`) y estilos con alcance por componente | Sin dependencias; control total del diseño y del peso |
| JavaScript | Scripts TypeScript mínimos por componente (menú, aparición, calculadora, cursor del chat) | Todo funciona y se lee sin JS; el JS solo mejora |
| Fuentes | Poppins (400/500/600/700) y DM Mono (500), woff2 latinos autoalojados | Sin Google Fonts: más rápido, privado y determinista |
| Hosting | GitHub Pages con dominio propio `datastudio.es` | Ya existía; gratis; HTTPS |
| Publicación | GitHub Actions (`.github/workflows/deploy.yml`) en cada push a `main` | Build reproducible con `npm ci` |
| Videos del anuncio | GitHub Actions (`.github/workflows/anuncio.yml`, Windows) → release `anuncio-portal-bi`; el de «Power BI primero», `anuncio-power-bi.yml` → release `anuncio-power-bi` | Fuera del repositorio y del sitio (ADR-016, ADR-021) |
| Node | 24 LTS (`.nvmrc`); Astro 7 exige ≥ 22.12 | Ver [despliegue.md](despliegue.md) para el entorno local |

## Estructura

```
.
├── .github/
│   ├── workflows/deploy.yml     Compila y publica en Pages (acciones fijadas por SHA)
│   ├── workflows/anuncio.yml    Graba el anuncio a MP4 (en Windows) y lo publica en el release anuncio-portal-bi
│   ├── workflows/anuncio-power-bi.yml  Graba el de «Power BI primero» (las dos aperturas) al release anuncio-power-bi
│   └── dependabot.yml           Actualizaciones semanales de npm y acciones
├── docs/                        Esta documentación
├── marca y logos/               Logos originales en PNG (fuente de verdad de la marca)
├── public/                      Se copia tal cual al sitio
│   ├── privacidad/index.html    ⚠ Política de Privacidad (registrada en Google/YouTube, TikTok, Meta)
│   ├── terminos/index.html      ⚠ Condiciones del Servicio (registradas en las plataformas)
│   ├── oauth/tiktok/index.html  ⚠ Redirect URI de OAuth de TikTok
│   ├── google5af846498ca551c6.html  ⚠ Verificación de Search Console
│   ├── CNAME                    ⚠ Dominio de GitHub Pages
│   ├── og/                      Imágenes para compartir (1200×630), generadas
│   ├── favicon.svg/.ico, apple-touch-icon.png, icono-192/512.png, site.webmanifest, robots.txt
├── scripts/
│   ├── generar-recursos.mjs     Favicons, íconos de app e imágenes OG desde el logo vectorial
│   ├── qa.mjs                   QA visual y técnico en 6 anchos (necesita `npm run preview`)
│   ├── probar-recorrido.mjs     Banco de los dos recorridos: estados, teclado, duración de los pasos, CLS con red lenta (`npm run recorrido`)
│   ├── grabar-anuncio.mjs       Graba un anuncio a MP4 cuadro por cuadro con Chrome + ffmpeg; sirve dist/ por su cuenta (`npm run anuncio:video`;
│   │                            el de 55 s por defecto, otro con --pagina, --nombre y --portada)
│   ├── probar-anuncio.mjs       Banco del anuncio de 55 s: tomas en su ventana, cuadros deterministas, escala, página (`npm run anuncio:probar`)
│   ├── probar-anuncio-pbi.mjs   Banco de «Power BI primero»: las dos aperturas en los cuatro formatos (`npm run anuncio:probar-pbi`)
│   ├── capturas-scroll.mjs      Capturas del viewport en varias posiciones de scroll, con movimiento (portada → telón)
│   └── cortar-capturas.mjs      Corta capturas de página completa en tramos
├── src/
│   ├── assets/fuentes/          woff2 + licencias OFL
│   ├── components/
│   │   ├── Encabezado.astro     Barra con enlace activo + cajón lateral (<dialog>); transparente sobre la portada
│   │   ├── PiePagina.astro, Logo.astro, Icono.astro, Preguntas.astro
│   │   ├── Migas.astro          Migas de pan de las subpáginas (con BarrasMarca)
│   │   ├── BarrasMarca.astro    Las 4 barras del logo en miniatura, con la del producto encendida
│   │   ├── inicio/              Portada (sticky), Soluciones (telón + gráfico), Vitrinas, Manifiesto
│   │   ├── portal/              Maquetas del Portal BI (Ventana, MaquetaPortal, MaquetaChat, MaquetaAdmin) y Calculadora;
│   │   │                        Lema.astro: el lema «+ Y ahora tus datos HABLAN» con su chip de IA (portada y recorridos);
│   │   │                        los recorridos animados: RecorridoMarco.astro (el marco de la página, común),
│   │   │                        RecorridoPantalla.astro (tu equipo) y RecorridoAdmin.astro (el administrador), 1280 × 760;
│   │   │                        recorrido.css (lo común), recorrido-pantalla.css y recorrido-admin.css (cada pantalla)
│   │   ├── anuncio/             Anuncio.astro + anuncio.css: el anuncio de 55 s para redes (nueve tomas, cuatro formatos), y su
│   │   │                        variante «socio» de 62 s para quien lo revende (la propuesta a Ribentek, ADR-020);
│   │   │                        AnuncioReporte.astro: el cuerpo del reporte, que comparten la toma 5 y la 6;
│   │   │                        AnuncioPortal.astro: el portal por dentro (menú y tableros), del gancho y la toma 4;
│   │   │                        datos.ts: las tarjetas de ejemplo y los trazos de sus íconos;
│   │   │                        AnuncioPowerBI.astro + anuncio-pbi.css: «Power BI primero», 21 s y dos aperturas
│   │   │                        (ADR-021), sobre la misma base; SalaAnuncio.astro: su página (barra, lienzo y descargas)
│   │   ├── social/              MaquetaTablero (variantes completa, compacta y publicaciones)
│   │   ├── tienda/              Catalogo (tienda de ejemplo, variantes completa y compacta)
│   │   └── consultoria/         Flujo (recorrido de los datos) y Consolidado (héroe: planillas → reporte)
│   ├── data/sitio.ts            ★ Fuente única de verdad: contacto, WhatsApp, navegación, soluciones, precio de licencia
│   ├── data/logo.ts             Trazos del logo (ícono, barras, wordmark): los usan Logo.astro, el anuncio
│   │                            y scripts/generar-recursos.mjs (favicons, íconos e imágenes para compartir)
│   ├── data/admin.ts            El menú del panel de administración (orden, nombres e íconos): MaquetaAdmin y el recorrido
│   ├── data/ocultas.mjs         La lista de páginas ocultas: la leen el filtro del sitemap y scripts/qa.mjs
│   ├── data/anuncios.ts         Los anuncios de /anuncios/, los formatos y los MP4 del release del Portal BI
│   ├── data/propuestas.ts       Las propuestas de /propuestas/ (página, PDF o presentación)
│   ├── layouts/Base.astro       <head> (SEO, OG, JSON-LD, fuentes), encabezado, pie (`inmersiva`: sin encabezado ni pie)
│   ├── pages/                   index, portal-bi, portal-bi/como-funciona (y /administrador), social-metrics-bi, tienda-ecommerce, consultoria, 404
│   ├── scripts/                 formato.ts (miles, cálculo de ahorro), esquemas.ts (JSON-LD), revelar.ts,
│   │                            recorrido-motor.ts (reloj, cámara, cursor, narración y controles de los recorridos),
│   │                            recorrido.ts y recorrido-admin.ts (el guion de cada recorrido),
│   │                            anuncio.ts (línea de tiempo del anuncio: reproducir, pausar, ir a un instante exacto; y por páginas con data-paginas)
│   └── styles/                  tokens.css (diseño), global.css (base y utilidades), producto.css (clases prod-* de las subpáginas),
│                                ocultas.css (clases oc-* de las páginas ocultas, con su marco PaginaOculta.astro)
├── astro.config.mjs             Sitio, fuentes, CSP, sitemap
└── CLAUDE.md                    Reglas para agentes de IA que trabajen en el repo
```

## Páginas

| Ruta | Archivo | Contenido |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Portada de marca (sticky) → Soluciones: gráfico de 4 barras = 4 soluciones (telón) → Vitrinas por producto → Manifiesto. Solo distribuye: sin WhatsApp |
| `/portal-bi/` | `src/pages/portal-bi.astro` | Producto completo: maquetas del portal y del chat con IA, compra de código + guía, instalación, calculadora de ahorro, requisitos, límites y preguntas |
| `/portal-bi/como-funciona/` | `src/pages/portal-bi/como-funciona.astro` | Recorrido animado de un minuto: la pantalla del portal (`RecorridoPantalla`) con cámara, cursor y narración por pasos. Sin encabezado ni pie (`Base` con `inmersiva`). Con `#ver` arranca solo (ADR-015) |
| `/portal-bi/como-funciona/administrador/` | `src/pages/portal-bi/como-funciona/administrador.astro` | Recorrido animado del administrador (72 s): el panel (`RecorridoAdmin`) con el mismo motor y el mismo marco. Se llega desde la sección del panel en `/portal-bi/` y desde el cierre del otro recorrido; con `#ver` arranca solo (ADR-017) |
| `/anuncios/` | `src/pages/anuncios/index.astro` | **Oculta**: los anuncios para redes, el más nuevo primero, con «Ver y grabar» y los MP4 (`src/data/anuncios.ts`) |
| `/anuncios/power-bi/` y `/anuncios/power-bi-ia/` | `src/pages/anuncios/power-bi.astro`, `power-bi-ia.astro` | **Ocultas**: el anuncio «Power BI primero» (21 s; 22 s con la apertura «ia») con su apertura «licencia» o «ia», en los cuatro formatos, con las descargas del release `anuncio-power-bi` (ADR-021) |
| `/propuestas/portal-bi-ribentek/` | `src/pages/propuestas/portal-bi-ribentek.astro` | **Oculta**: la propuesta a Ribentek para revender el Portal BI: el anuncio en su versión para socios, en 17 páginas que avanza quien mira (ADR-020) |
| `/propuestas/` | `src/pages/propuestas/index.astro` | **Oculta**: las propuestas a socios y clientes, cada una con su botón (`src/data/propuestas.ts`). Las páginas propias van en `src/pages/propuestas/` y quedan ocultas solas |
| `/portal-bi/anuncio/` | `src/pages/portal-bi/anuncio.astro` | **Oculta** (noindex, fuera del sitemap, sin enlaces): el anuncio de 55 s para redes en 9:16, 4:5, 1:1 y 16:9, con las descargas en MP4 del release `anuncio-portal-bi` de GitHub (ADR-016) |
| `/social-metrics-bi/` | `src/pages/social-metrics-bi.astro` | Métricas de redes en Power BI: vista de publicaciones, recorrido de los datos, tablero completo, acceso, implementación, tratamiento de datos y preguntas |
| `/tienda-ecommerce/` | `src/pages/tienda-ecommerce.astro` | Código de tienda online + guía, pago único, pedidos por WhatsApp |
| `/consultoria/` | `src/pages/consultoria.astro` | Consultoría de datos: planillas → reporte, recorrido de los datos, qué resolvemos, proceso y preguntas |
| `/404.html` | `src/pages/404.astro` | Página de error con enlaces a las soluciones (GitHub Pages la sirve sola) |
| `/privacidad/`, `/terminos/`, `/oauth/tiktok/` | `public/…` | HTML estático preservado byte a byte. **No reemplazar por páginas Astro sin revisar [seguridad.md](seguridad.md).** |

## Rutas críticas (no romper)

GitHub Pages redirige `/privacidad` → `/privacidad/` (301) y **conserva el query string**, por lo que `/oauth/tiktok?code=…` llega a `/oauth/tiktok/?code=…`. Esto funciona porque cada ruta es una carpeta con `index.html`. El workflow falla si alguna de estas rutas falta en `dist/`.

## Patrones del código

- **Datos**: todo dato comercial (teléfono, mensajes de WhatsApp, precio de Power BI Pro) vive en `src/data/sitio.ts`.
- **Temas por sección**: cada `<section>` declara `data-tema="oscuro | petroleo | claro | blanco | salvia | verde"` y hereda colores con contraste verificado desde `tokens.css`.
- **Estilos con alcance**: una clase pasada a un componente hijo (p. ej. `<Icono class="x">`) **no** recibe el estilo con alcance del padre. Usar `.padre :global(.x)`. Ver [aprendizajes.md](aprendizajes.md).
- **CSP estricta**: nada de atributos `style="…"` en el HTML ni scripts externos. Para valores dinámicos, clases o `element.style` desde JS (CSSOM, permitido).
- **Aparición al hacer scroll**: agregar `data-revelar` a un bloque. Sin JS o con movimiento reducido, todo se ve de inmediato.
- **Animaciones ligadas al scroll** (portada y gráfico): CSS `animation-timeline` con `@supports` y `prefers-reduced-motion`. La línea de tiempo y el rango van en una regla aparte del atajo `animation` (ver [aprendizajes.md](aprendizajes.md)).
- **Orden de los productos**: el gráfico del inicio usa el orden del logo (alturas 60/80/100/60); menú, pie y vitrinas usan `NAVEGACION` (Portal BI primero).
