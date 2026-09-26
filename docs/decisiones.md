# Registro de decisiones (ADR)

Formato: contexto → decisión → consecuencias. Las decisiones nuevas van arriba.

## ADR-008 · Página del Portal BI adaptada desde la página de producto del repo del Portal BI (25/09/2026)

- **Contexto**: el dueño entregó `producto.ejs`, una página de producto hecha en el repo del Portal BI, con maquetas fieles del portal y del chat con IA.
- **Decisión**: se reconstruyó como `/portal-bi/` en Astro, con la marca Data Studio (Poppins/DM Mono, paleta, tuteo), estilos en línea convertidos a clases (CSP) y maquetas como componentes reutilizables (`src/components/portal/`). Se conservan dentro de las maquetas el amarillo de Power BI y el índigo de la IA, porque así se ve el producto real. El home resume el producto y enlaza a esta página. El archivo original se borró del repo tras usarlo, a pedido del dueño.
- **Consecuencias**: el home y `/portal-bi/` usan la misma información (sin cifras contradictorias). La página es larga (≈ 900 nodos DOM) pero mantiene 100 en Lighthouse.

## ADR-007 · Sin testimonios, logos de clientes ni cifras inventadas

- **Contexto**: el sitio anterior mostraba logos de clientes que no se pudieron recuperar.
- **Decisión**: no se publica prueba social sin archivo y permiso reales. Las cifras vienen de fuentes documentadas ([contenido.md](contenido.md)).
- **Consecuencias**: menos "prueba social" hoy; se agrega apenas el dueño entregue material real.

## ADR-006 · Tuteo en todo el sitio

- **Contexto**: el sitio anterior usaba tuteo; las páginas legales y la página de producto usaban voseo en partes.
- **Decisión**: tuteo neutro en todo el contenido nuevo (más amplio para Bolivia y el resto de Latinoamérica). Las páginas legales no se tocaron.
- **Consecuencias**: unificar las legales el día que se rediseñen.

## ADR-005 · Signo visual: las cuatro barras del logo son las cuatro soluciones

- **Contexto**: el hero tenía que vender cuatro líneas de negocio sin parecer una plantilla.
- **Decisión**: el gráfico de barras del ícono, a escala y con sus proporciones exactas, funciona como navegación: cada barra es una solución, la más alta es el Portal BI. Crece al cargar; en móvil rota a barras horizontales.
- **Consecuencias**: identidad reconocible y ligada a la marca, sin imágenes (LCP rápido). Si se agrega una quinta línea de negocio, el signo se rompe: habrá que agruparla en una existente o replantear el hero.

## ADR-004 · Rutas legales y de OAuth como HTML estático preservado

- **Contexto**: `/privacidad`, `/terminos`, `/oauth/tiktok` y el archivo de Google están registrados en Google/YouTube, TikTok y Meta.
- **Decisión**: se movieron a `public/` sin cambiar un byte (verificado con hash de git). No usan el diseño nuevo.
- **Consecuencias**: aspecto distinto al resto del sitio. Rediseñarlas es una tarea aparte y cuidadosa (conservar texto, fecha y URL).

## ADR-003 · Publicación con GitHub Actions y verificación de rutas críticas

- **Contexto**: Pages publicaba la raíz de `main` sin compilar (legacy); Astro necesita un build.
- **Decisión**: workflow propio (`npm ci`, build, verificación de rutas, `deploy-pages`), acciones fijadas por SHA, permisos mínimos. Pages pasó a `build_type: workflow` y se forzó HTTPS.
- **Consecuencias**: cada push a `main` publica; un build roto nunca reemplaza al sitio en línea.

## ADR-002 · Fuentes autoalojadas con el proveedor `local` de Astro

- **Contexto**: el proveedor `npm` de Astro reescribe las URLs al CDN de jsdelivr (necesita red en el build) y solo lee el peso 400 del `index.css` de fontsource.
- **Decisión**: woff2 latinos copiados a `src/assets/fuentes/` (con su licencia OFL) y `fontProviders.local()`.
- **Consecuencias**: builds deterministas y sin red; ~60 KB de binarios en el repo.

## ADR-001 · Astro 7 estático + CSS propio (sin Tailwind ni framework JS)

- **Contexto**: sitio de marketing de alto rendimiento que va a crecer (páginas por producto) y se publica en GitHub Pages.
- **Decisión**: Astro 7.3 con salida estática, CSS con tokens y estilos con alcance, scripts mínimos.
- **Consecuencias**: 100 en Lighthouse, muy pocas dependencias (menos superficie de ataque). Requiere Node ≥ 22.12 (se usa 24 LTS).
