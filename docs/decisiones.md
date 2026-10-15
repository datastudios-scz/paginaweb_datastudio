# Registro de decisiones (ADR)

Formato: contexto → decisión → consecuencias. Las decisiones nuevas van arriba.

## ADR-018 · El lema del Portal BI: «+ Y ahora tus datos HABLAN» (14/10/2026, revisado el 15/10)

- **Contexto**: el dueño pidió que la portada, los recorridos y el anuncio tomaran algo de «Haz que tus datos hablen», «Ahora tus datos hablan» o «Conversa con tus datos», y que se eligiera con criterio de neuromarketing, para que sea el plus del servicio. El gancho de la página ya era el ahorro («Nunca más una licencia por persona»), y el chat con IA al costado del tablero es lo que el producto tiene de distinto.
- **Decisión**: el lema es **«Y ahora, tus datos hablan.»**. Va con dos frases que cumplen otras funciones: la acción, **«Conversa con tus datos»**, y la prueba, **«Pregúntale lo que el tablero no muestra»**.
- **Por qué esa y no las otras**:
  - «Haz que tus datos hablen» le pasa el trabajo al lector: el cerebro registra el esfuerzo como un costo. Además es una frase muy gastada entre consultoras de BI, y no se distingue.
  - «Conversa con tus datos» es clara, pero es la descripción de la categoría: es lo que dice cualquier herramienta de chat con datos. Sirve para explicar y para invitar, no para diferenciarse.
  - «Ahora» es una señal de novedad, y lo nuevo se atiende primero. También supone un antes (los datos callados) sin tener que decirlo.
  - El presente dice que ya pasó: es un hecho, no una promesa, y no le pide esfuerzo a nadie.
  - Que los datos hablen los convierte en alguien. Una voz se recuerda mejor que una abstracción.
  - «Tus» ata la frase a lo propio, y lo propio se recuerda mejor.
  - Son cinco palabras con el ritmo de un octosílabo, el verso más natural del español: se dice fácil y se repite.
  - La «Y» inicial la vuelve literalmente un plus: se lee después del ahorro, como «y además».
- **Dónde va y cómo**:
  - En la portada, debajo del titular, como segunda voz. El gancho sigue siendo el ahorro, que es lo que decide la compra.
  - Para que entrara, el titular de esta página bajó de 64 a 56 px de tope. Medido: los botones de compra quedaron más arriba que antes (829 px contra 875 en 1440 × 900 y en 1280 × 800), y en el teléfono siguen a la vista.
  - La sección del chat baja el lema a la acción y a la prueba: «Conversa con tus datos. Y mira de dónde sale cada número.».
  - En el anuncio aparece dos veces, porque la repetición fija la frase: la toma 6 lo presenta y el cierre lo firma.
  - En los recorridos, nombra el paso del chat.
  - La imagen para compartir lo lleva debajo del titular, porque es lo que se ve cuando se pasa el enlace por WhatsApp.
- **Revisión del dueño (15/10/2026)**: la frase sola no sonaba a plus ni decía que hay IA. Ahora es **«+ Y ahora tus datos HABLAN»**, sin la coma, con un chip «IA» en la esquina y estrellitas que titilan.
  - El «+» vuelve literal el plus.
  - Las mayúsculas cargan el peso en el verbo, que es la promesa.
  - El chip nombra la IA sin alargar la frase. Lleva el índigo de la IA del producto (el del chat de las maquetas), no el verde de la marca.
  - Es un solo componente (`Lema.astro`) para la portada y los recorridos. El anuncio y la imagen para compartir llevan su versión, con las mismas formas.
  - En el texto plano (descripción, texto alternativo) va «Y ahora tus datos hablan», sin mayúsculas: en un buscador, las mayúsculas gritan.
- **Consecuencias**: el lema es una afirmación sobre el producto. Se sostiene mientras el chat consulte el modelo y responda con sus datos (contenido.md). Fuera de `/portal-bi/` (inicio, menú) no se cambió nada.

## ADR-017 · El recorrido del administrador: otro guion sobre el mismo motor (12/10/2026)

- **Contexto**: después del recorrido de tu equipo (ADR-015) el dueño pidió «la parte de Administrador», reusando formatos e ideas.
- **Decisión**: una página propia (`/portal-bi/como-funciona/administrador/`) con el panel de administración dibujado a tamaño real y su propio guion. Lo que no depende de la pantalla se separó para los dos: el motor (`src/scripts/recorrido-motor.ts`) recibe las duraciones, el guion y lo que hay que volver a su estado al saltar, y le presta al guion sus herramientas (cámara, cursor, esperar, escribir, contar, escena). El marco de la página (`RecorridoMarco.astro`) recibe los textos, la escena inicial y el otro recorrido que se ofrece en el cierre.
- **Por qué no una sola página con los dos**: cargaría las dos pantallas (el HTML y el CSS de las dos, unos 70 KB) para mostrar una, y el enlace de cada una no podría arrancarla sola con `#ver`.
- **Ritmo y encuadre**: el cursor del administrador viaja más (del menú a los botones de la derecha), así que el motor aceptó su velocidad como opción; con la del recorrido de tu equipo duraba 78 s, con una mano más rápida dura 72. En escritorio, toda toma del área principal va con zoom ≥ 1,26: con menos, el borde de la toma parte el menú (ver aprendizajes). En el teléfono, cada toma apunta a lo que se está llenando, no al cuadro entero.
- **Consecuencias**: el panel se dibuja dos veces en el sitio (la maqueta de `/portal-bi/` y esta pantalla) y comparten el menú en `src/data/admin.ts`. Cuando el panel real cambie, hay que actualizar `RecorridoAdmin.astro` (mismas reglas que ADR-014). Cada afirmación de la narración es algo que el panel hace hoy (ver contenido.md).

## ADR-016 · El anuncio se anima en HTML y se graba cuadro por cuadro a MP4 (11/10/2026)

- **Contexto**: el dueño pidió un motion graphics para publicidad en redes, en una URL oculta, "para grabarlo o descargarlo", en varios tamaños y con la mejor calidad posible.
- **Decisión**: el anuncio es HTML/CSS del sitio (las mismas maquetas fieles, la marca, los datos de ejemplo), con TODO el movimiento en `@keyframes` cuyo retardo se cuenta desde el segundo 0. El script pausa todas las animaciones y las lleva al instante pedido (`Animation.currentTime`); lo que no puede ser CSS (los mil asientos del lienzo, los contadores, la pregunta que se tipea) se dibuja en función del tiempo. Con eso, `scripts/grabar-anuncio.mjs` abre `?render=1` al tamaño exacto, recorre los 3.300 cuadros (55 s a 60 cps) y se los pasa a ffmpeg. La página es oculta: `Base` con `indexar={false}` (noindex) y filtrada del sitemap.
- **Por qué no grabar la pantalla**: depende de la máquina (cuadros perdidos, tirones), de la resolución del monitor y de no tocar nada durante 55 s. **Por qué no After Effects o Remotion**: otra herramienta y otra copia de la marca y del producto que mantener; así el anuncio usa el mismo CSS del portal que ya está verificado.
- **Formatos**: 9:16 (1080 × 1920) con la zona segura de Reels y TikTok (nada importante en el 8 % de arriba ni en el 21 % de abajo), 4:5 (1080 × 1350), 1:1 (1080 × 1080) y 16:9 (1920 × 1080). Los tamaños van en `--u` (1/1080 del lado corto), así que es una sola pieza; lo que cambia por formato es dónde va cada bloque.
- **Calidad y peso**: 60 cps y CRF 18 (unos 10 MB por formato cuando duraba 46 s). Las redes recodifican todo lo que se sube: un original más pesado no se ve mejor allá, solo pesa más acá. El flujo es máster sin pérdida (`--crf 0`, en una carpeta temporal) → MP4 de entrega; cambiar el peso no obliga a grabar de nuevo.
- **Entrega (cambiado el 11/10, a pedido del dueño)**: los MP4 NO viven en el repositorio ni en el sitio. Los graba la Action «Grabar el anuncio» (`.github/workflows/anuncio.yml`, en Windows por Segoe UI) cada vez que cambia el anuncio y los publica como archivos del release `anuncio-portal-bi`. La página enlaza ahí, y GitHub los sirve como descarga. Antes vivían en `public/`: la página no los cargaba (solo los enlazaba), pero cada regeneración sumaba ~35 MB a la historia de git y viajaban en cada despliegue.
- **Revisión del dueño (12/10/2026)**: el chat con IA se vendía como otra pantalla. El pedido fue mostrarlo como es en el producto, un botón al costado del tablero que se despliega, y que resolviera dos preguntas difíciles, «aunque se alargue un poquito». La toma 6 pasó de unos 5 a 16,75 s y el anuncio de 46 a 55 s. Acá el reporte queda a la vista a propósito, porque lo que se vende es que la IA vive al lado del tablero. Es otra decisión que la sección del chat de `/portal-bi/` (ADR-014), que va sin el reporte. La cámara de esa toma es un `transform` de la ventana, y cuánto se acerca en cada formato está medido: el banco comprueba que no pise la firma, que no tape el subtítulo y que en 9:16 no baje del 79 %.
- **Consecuencias**: el video tarda lo que tarde la Action en estar al día después de un cambio. Con movimiento reducido el anuncio no se reproduce y queda quieto en el cierre armado: el lienzo lleva `data-movimiento-propio` para que la regla global no le acorte las animaciones. Toda animación nueva tiene que ser un `@keyframes` con retardo absoluto: una `transition` corre en tiempo real y no se puede llevar a un instante. El motor guarda todas las animaciones que vio, no solo las que devuelve `getAnimations()`, que deja afuera a las que terminaron sin relleno (ver aprendizajes).

## ADR-015 · El recorrido del Portal BI es el portal dibujado y una cámara, no un video (09/10/2026)

- **Contexto**: el dueño pidió cambiar «Pide una demo» por un botón que muestre, a pantalla completa, el flujo entero como si fuera el portal real, con una narración muy animada.
- **Decisión**: una página propia (`/portal-bi/como-funciona/`) con la pantalla del portal en HTML a tamaño real (1280 × 760) y una cámara (transform por CSSOM) que encuadra y se acerca, como una grabación de pantalla. Un guion de ocho pasos con reloj propio: se pausa, se salta de paso y se reinicia sin que nada quede a medias, porque saltar es volver a dibujar y correr el guion «de golpe» hasta ahí. Desde el botón del héroe (`#ver`) arranca solo; entrando directo, espera Reproducir. La narración va al costado donde así la ventana sale más grande (escritorios de 5/3 o más y teléfonos acostados) y debajo en lo demás. En el teléfono la cámara nunca muestra la pantalla entera: la llena y se acerca hasta que se lee.
- **Por qué no un video**: pesaría megas contra un presupuesto de 150 KB por página, no se vería nítido en todos los tamaños, el texto no sería texto (ni accesible ni traducible), no respetaría «reducir movimiento», y habría que regrabarlo con cada cambio del producto. Así la página pesa ~80 KB y el guion se edita como código.
- **Lo que se acomoda alrededor de la ventana lo resuelve el CSS, no el script**: el script corre después del primer pintado, y cuando angostaba la narración al ancho de la ventana, la página saltaba (ver aprendizajes).
- **Consecuencias**: la pantalla repite el producto. Cuando el portal cambie, hay que actualizar `RecorridoPantalla.astro` (mismas reglas que ADR-014). El DOM llega a ~900 nodos porque la medida invisible de la narración repite los diez textos. Las duraciones de los pasos (`DURACION`, lo que llena cada segmento) se controlan con `npm run recorrido`.

## ADR-014 · Las maquetas del Portal BI copian pantallas reales, no las resumen (04/10/2026)

- **Contexto**: las maquetas eran esquemas (menú plano, un chat con mapa de calor que el producto ya no tiene, una tabla de asignaciones que no existe). El dueño pidió diseños "más reales y más visuales".
- **Decisión**: una pantalla real por sección, con sus mismas palabras y colores por defecto, y un único set de datos de ejemplo. La marca blanca se muestra con dos pantallas de ingreso (la pantalla más "de marca"). Un solo momento animado (la respuesta del chat). Desviaciones a propósito: grises terciarios subidos a AA, la fuente del chat (Inter) por la de sistema, y "análisis listo" sin el "· 0 ms" que el portal muestra siempre.
- **Revisión del dueño (el mismo día)**: la sección del chat vuelve a la maqueta anterior y se retira el visor con el reporte al costado: la sección tiene que centrarse solo en el chat, con movimiento, varias preguntas y gráficos. Las dos pantallas de ingreso van en Poppins: una tipografía distinta por marca se veía mal.
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
