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
| Node | 24 LTS (`.nvmrc`); Astro 7 exige ≥ 22.12 | Ver [despliegue.md](despliegue.md) para el entorno local |

## Estructura

```
.
├── .github/
│   ├── workflows/deploy.yml     Compila y publica en Pages (acciones fijadas por SHA)
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
│   ├── probar-recorrido.mjs     Banco del recorrido animado: estados, teclado, duración de los pasos, CLS con red lenta (`npm run recorrido`)
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
│   │   ├── portal/              Maquetas del Portal BI (Ventana, MaquetaPortal, MaquetaChat) y Calculadora;
│   │   │                        RecorridoPantalla.astro + recorrido.css: la pantalla del recorrido animado (1280 × 760)
│   │   ├── social/              MaquetaTablero (variantes completa, compacta y publicaciones)
│   │   ├── tienda/              Catalogo (tienda de ejemplo, variantes completa y compacta)
│   │   └── consultoria/         Flujo (recorrido de los datos) y Consolidado (héroe: planillas → reporte)
│   ├── data/sitio.ts            ★ Fuente única de verdad: contacto, WhatsApp, navegación, soluciones, precio de licencia
│   ├── layouts/Base.astro       <head> (SEO, OG, JSON-LD, fuentes), encabezado, pie (`inmersiva`: sin encabezado ni pie)
│   ├── pages/                   index, portal-bi, portal-bi/como-funciona, social-metrics-bi, tienda-ecommerce, consultoria, 404
│   ├── scripts/                 formato.ts (miles, cálculo de ahorro), esquemas.ts (JSON-LD), revelar.ts,
│   │                            recorrido.ts (guion, reloj, cámara y cursor del recorrido animado)
│   └── styles/                  tokens.css (diseño), global.css (base y utilidades), producto.css (clases prod-* de las subpáginas)
├── astro.config.mjs             Sitio, fuentes, CSP, sitemap
└── CLAUDE.md                    Reglas para agentes de IA que trabajen en el repo
```

## Páginas

| Ruta | Archivo | Contenido |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Portada de marca (sticky) → Soluciones: gráfico de 4 barras = 4 soluciones (telón) → Vitrinas por producto → Manifiesto. Solo distribuye: sin WhatsApp |
| `/portal-bi/` | `src/pages/portal-bi.astro` | Producto completo: maquetas del portal y del chat con IA, compra de código + guía, instalación, calculadora de ahorro, requisitos, límites y preguntas |
| `/portal-bi/como-funciona/` | `src/pages/portal-bi/como-funciona.astro` | Recorrido animado de un minuto: la pantalla del portal (`RecorridoPantalla`) con cámara, cursor y narración por pasos. Sin encabezado ni pie (`Base` con `inmersiva`). Con `#ver` arranca solo (ADR-015) |
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
