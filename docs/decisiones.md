# Registro de decisiones (ADR)

Formato: contexto → decisión → consecuencias. Las decisiones nuevas van arriba.

## ADR-014 · Las maquetas del Portal BI copian pantallas reales, no las resumen (04/10/2026)

- **Contexto**: las maquetas eran esquemas (menú plano, un chat con mapa de calor que el producto ya no tiene, una tabla de asignaciones que no existe). El dueño pidió diseños "más reales y más visuales".
- **Decisión**: una pantalla real por sección, con sus mismas palabras y colores por defecto, y un único set de datos de ejemplo. La marca blanca se muestra con dos pantallas de ingreso (la pantalla más "de marca"). Un solo momento animado (la respuesta del chat). Desviaciones a propósito: grises terciarios subidos a AA, la fuente del chat (Inter) por la de sistema, y "análisis listo" sin el "· 0 ms" que el portal muestra siempre.
- **Consecuencias**: el documento comprimido pasó de 37 a ~45 KB (encima del presupuesto de 40 KB) y el DOM de ~1.170 a ~1.615 nodos. Se compensó con `content-visibility` en las maquetas de abajo y estilos globales en las maquetas (ver aprendizajes). Cuando el producto cambie, hay que volver a fotografiarlo y comparar.

## ADR-013 · Maquetas con datos de ejemplo rotulados (27/09/2026)

- **Contexto**: la revisión de diseño marcó que la maqueta de la tienda (líneas grises y formas) no mostraba nada, y que los héroes de Social Metrics y Consultoría repetían el diagrama de más abajo.
- **Decisión**: las maquetas muestran contenido de ejemplo creíble (una cafetería con productos y precios, un ranking de publicaciones, tres planillas que no cuadran frente a un reporte único), siempre con el rótulo "Datos de ejemplo". Lo que no se inventa son afirmaciones comerciales: clientes, testimonios, precios reales, cifras de resultados.
- **Consecuencias**: cada héroe enseña algo distinto a su sección principal. Si llega material real (capturas, clientes), reemplaza a la maqueta.

## ADR-012 · Menú móvil como cajón lateral con `<dialog>` (27/09/2026)

- **Contexto**: el menú móvil anterior se abría de arriba abajo y se sentía básico.
- **Decisión**: cajón lateral con `<dialog>` + `showModal()` (foco atrapado, Esc, fondo inerte gratis), entrada con `@starting-style`, cierre con clic en el fondo, bloqueo del scroll y "Estás aquí" en la página actual. En escritorio, el enlace activo lleva `aria-current="page"` y subrayado.
- **Consecuencias**: sin librerías; funciona con teclado y lector de pantalla. Requiere navegadores de 2023 en adelante para la animación (sin ella, abre igual).

## ADR-011 · Público internacional y trabajo 100 % remoto (27/09/2026)

- **Contexto**: el dueño aclaró que sus clientes son de todo el mundo y que todo se implementa en remoto.
- **Decisión**: se quitaron ciudad y país del sitio nuevo (textos, pie, JSON-LD); `CONTACTO.modalidad` = "Implementación remota en cualquier país"; `areaServed: 'Worldwide'`; locale `es_LA`. Las páginas legales no se tocan.
- **Consecuencias**: el teléfono sigue siendo boliviano (+591); es el canal real.

## ADR-010 · El inicio distribuye; cada producto tiene su subpágina (27/09/2026)

- **Contexto**: el inicio explicaba los cuatro productos a fondo y competía con sus propias páginas.
- **Decisión**: inicio = marca + índice. Portada → gráfico de soluciones → una vitrina por producto (nombre, frase, 3 puntos, enlace) → manifiesto de trabajo remoto. Los botones de WhatsApp viven solo en las subpáginas (`/portal-bi/`, `/social-metrics-bi/`, `/tienda-ecommerce/`, `/consultoria/`), que comparten `src/styles/producto.css`. El orden del logo (Consultoría, Social, Portal, Tienda) solo se usa en el gráfico; menú, pie y vitrinas usan el orden comercial (Portal BI primero).
- **Consecuencias**: el inicio mantiene la descripción de las integraciones con redes y el enlace a la Política de Privacidad (requisito de las plataformas) en la vitrina de Social Metrics.

## ADR-009 · Portada de marca a pantalla completa con telón y scroll (27/09/2026)

- **Contexto**: el dueño pidió que el inicio empiece con la marca, como la portada del Google Sites, con animación al bajar.
- **Decisión**: portada `sticky` (100svh) con el ícono y el wordmark en SVG que se arman al cargar, y un tablero en perspectiva hecho en HTML/SVG de fondo. La sección de soluciones sube como un telón; con CSS scroll-driven animations las barras del logo se vacían en el mismo tramo de scroll en que se llenan las cuatro barras del gráfico (línea de tiempo `--grafico`). Sin soporte (Firefox) o con movimiento reducido, todo queda quieto y visible.
- **Consecuencias**: cero JS para el efecto y 100 en Lighthouse. Reemplaza al hero de ADR-005: el signo de las cuatro barras sigue, ahora como sección bajo la portada, con el bisel del monitor del logo como base.

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
