# Bitácora de cambios

## 17/10/2026 · El gancho nuevo del anuncio del Portal BI

- **Pedido del dueño**: el gancho de los mil asientos de licencias no se entendía. Hacía falta un gancho que atrape en los primeros 10 s, con neuromarketing de verdad, y que muestre la centralización de los tableros. Estudio y decisión en ADR-019.
- **Los primeros 10 s, en tres tiempos**. De la toma 3 en adelante no cambia nada:
  - **Reconocimiento**: «¿Me pasas el reporte?» en un globo de chat enorme, con los mensajes sin leer subiendo de 3 a 27. Alrededor caen los reportes regados: el Excel «FINAL_v3», el PDF «(2)», el .pbix «FINAL», el «RE: RE: RE:», «¿Cuál es la versión buena?», el aviso de licencia de Power BI Pro y «No me abre el tablero».
  - **Orden**: un portal de luz se los traga en remolino, se abre como un iris y muestra el portal: «Todos tus tableros, en un solo lugar.»
  - **Sorpresa**: «Para 1.000 personas:», «1.000 licencias» tachado, «1 licencia.», con el sello «1 licencia de Power BI» y cuatro caras con «+996».
- **El primer cuadro es la miniatura**, y la portada que graba la Action pasó al segundo 2,45, con el gancho armado.
- **Motor**: sin el lienzo de los asientos. El script mide cuánto viaja cada pieza hasta la ventana, en cada formato. El portal dibujado pasó a un componente, `AnuncioPortal.astro`, que comparten el gancho y la toma 4. La toma 4 se ve igual.
- **Formatos**: las piezas tienen su lugar en cada formato. En 1:1 el pedido va en dos renglones, porque el contador le tapaba el «?», y la ventana va un poco más baja para que las caras no se salgan del cuadro.
- **Banco** (`npm run anuncio:probar`): cinco pruebas nuevas por formato, saboteadas para ver que fallan. Se encontró un defecto real: en 9:16 las caras bajaban del 79 %, porque una regla genérica le ganaba a la del gancho.
- **Prueba de estrés**: 14 instantes del gancho, cada uno desde tres historias, en los cuatro formatos. Encontró cuadros que cambiaban según la historia, y se corrigieron:
  - el giro del remolino pasó a ser una curva;
  - el acercamiento de la ventana pasó a ser un desplazamiento;
  - la apertura de la ventana pasó a ser un iris.
  - Detalle en aprendizajes.
- Banco y QA sin problemas.

## 17/10/2026 · Dos páginas ocultas: /anuncios/ y /propuestas/

- **Pedido del dueño**: tener a mano, escribiendo la dirección, todos los anuncios ordenados y las propuestas a socios, sin buscarlos ni bajar diapositivas. Ninguna de las dos se ve navegando el sitio.
- **`/anuncios/`**: los anuncios para redes, el más nuevo primero. Cada uno lleva su botón «Ver y grabar» y sus MP4 por formato. Hoy está el del Portal BI. Se suman en `src/data/anuncios.ts`.
- **`/propuestas/`**: las propuestas a socios y clientes, la más nueva primero, cada una con su botón. Puede ser una página del sitio (`src/pages/propuestas/<nombre>.astro`, que queda oculta sola), un PDF en `public/propuestas/` o una presentación externa. Hoy está vacía y lo dice. Se suman en `src/data/propuestas.ts`.
- **Una sola lista de páginas ocultas**, `src/data/ocultas.mjs`, la usan:
  - el filtro del sitemap (`astro.config.mjs`), que antes tenía la ruta del anuncio escrita a mano;
  - el QA.
- Las páginas comparten un marco (`PaginaOculta.astro`): sin indexar, con un aviso de que no se llega navegando, y una lista de filas con regla fina (`src/styles/ocultas.css`).
- Los formatos y las direcciones del release del anuncio pasaron a `src/data/anuncios.ts`. La página del anuncio y `/anuncios/` leen de ahí, y el anuncio se ve igual.
- Ícono nuevo, `descargar`.
- **QA**: las dos páginas se revisan en los seis anchos. Al final, el QA comprueba que las ocultas sigan ocultas:
  - ninguna está en el sitemap;
  - todas llevan `noindex`;
  - ninguna página pública las enlaza.
  - Saboteado con el filtro viejo del sitemap y un enlace en la 404: dio las dos rojas esperadas.
- QA y banco del anuncio sin problemas.

## 15/10/2026 · El lema con su «+» y su chip de IA

- **Pedido del dueño**: «Y ahora tus datos hablan» solo no sonaba a plus ni decía que hay IA. Ahora lleva un «+» que llama la atención, «Y ahora tus datos HABLAN» y, en su esquina, un chip «IA» con estrellitas que titilan.
- **Un solo componente, `Lema.astro`**, para la portada y los dos recorridos. Todo va en em, así que toma el tamaño del texto donde se pone. Sus partes:
  - el «+» en el verde de acento, más grande y con brillo;
  - «HABLAN» en mayúsculas por CSS (el lector de pantalla lee la palabra, no las letras);
  - el chip en el índigo de la IA del producto, con tres estrellitas: la de adentro late, y las dos de afuera titilan.
  - Con «reducir movimiento» las estrellitas quedan quietas y visibles. Un lector de pantalla lee «Y ahora tus datos hablan, con IA».
- **Recorridos**: el paso del lema (el 5 en el de tu equipo, el 6 en el del administrador) ya no se narra palabra por palabra.
  - El motor clona el marcado del lema que está en el guion y lo hace entrar entero, porque una ranura le cortaba el chip y las estrellitas.
  - El administrador usa el mismo lema; su «donde tú decides» pasó al detalle.
  - El detalle de cada paso se lee del `<span>` hijo directo. El primer `<span>` del paso ahora estaría dentro del lema.
- **Anuncio**: la toma 6 y el cierre llevan su versión del lema. Las palabras suben de su ranura como todo titular, el «+» entra girando y el chip aparece de golpe, con las estrellitas contadas desde la toma.
  - En el cierre, el lema es más grande que un subtítulo, con tope para que entre en un renglón en 9:16.
  - «HABLAN» y su chip no se separan al cortar el renglón: en 9:16 el chip se había caído solo al renglón de abajo, encima de «datos». Lo mismo en la web.
- **Imagen para compartir**: el mismo lema, con las estrellitas quietas.
- **Medido y arreglado en el camino**:
  - El peso 700 de Poppins no se precarga. En el recorrido del administrador llegaba tarde y el lema pasaba de dos renglones a uno: CLS 0,0101 en el teléfono. El «+» y el chip van en 600 (ver aprendizajes).
  - En la imagen para compartir, una estrellita con la clase «b» tomó el estilo de las barras del gráfico, que ya usaba ese nombre.
- **Banco del anuncio**: el lema del cierre tiene que verse entero en el cuadro quieto: opacidad, chip a escala 1 y «HABLAN» arriba. El chip se mide por su matriz, porque contra `offsetWidth`, que es entero, daba 0,99. Saboteado atrasando el chip: da rojo.
- QA, anuncio y recorridos sin problemas. Los botones de compra siguen donde estaban (829 px en 1440 × 900 y 818 en el teléfono).

## 14/10/2026 · El lema del Portal BI: «Y ahora, tus datos hablan.»

- **Pedido del dueño**: que la portada, los recorridos, el anuncio y la demo tomen algo de «Haz que tus datos hablen», «Ahora tus datos hablan» o «Conversa con tus datos», elegido con criterio de neuromarketing, para que sea el plus del servicio.
- **La frase elegida es «Y ahora, tus datos hablan.»** El porqué está en ADR-018. Forma un sistema de tres frases, una por función:
  - el **lema** es «Y ahora, tus datos hablan.»;
  - la **acción** es «Conversa con tus datos»;
  - la **prueba** es «Pregúntale lo que el tablero no muestra».
- **Portada de `/portal-bi/`**:
  - El titular sigue siendo el gancho del ahorro («Nunca más una licencia por persona»). El lema va debajo, como segunda voz, y la bajada explica las dos promesas.
  - El titular bajó de 64 a 56 px de tope. Con eso pasa de 5 a 4 renglones en escritorio, y los botones de compra terminan más arriba que antes aunque se sumó una línea: en 1440 × 900 y en 1280 × 800, de 875 a 829 px. En el teléfono siguen a la vista (822 px de 844).
  - La sección del chat pasó de «Pregunta en español. Mira la consulta.» a «Conversa con tus datos. Y mira de dónde sale cada número.». El «en español» se mudó a la entrada.
  - La descripción para buscadores y redes nombra el lema (155 caracteres). La imagen para compartir lo suma debajo del titular, con la misma jerarquía que la portada.
- **Recorridos**:
  - En el de tu equipo, el paso del chat se llama «Y ahora, tus datos hablan.», y la portada dice «Del ingreso a conversar con tus datos…».
  - En el del administrador, el paso de la IA es «Tus datos hablan donde tú decides.».
- **Anuncio**:
  - La toma 6 presenta el lema como titular («Y ahora, tus datos hablan.» y «A un clic, al lado de tu tablero.»).
  - El cierre lo firma debajo de «Power BI para toda tu empresa.». Va en blanco, porque la salvia no se lee sobre el verde.
  - La Action vuelve a grabar los cuatro videos.
- **Arreglo de paso**: `npm run recursos` estaba roto desde el 11/10. Buscaba los trazos del logo en `Logo.astro` y se habían mudado a `src/data/logo.ts`. Ahora los lee de ahí y, si no los encuentra, lo dice. Al regenerar, solo cambió `og/portal-bi.png`: las otras cuatro imágenes y los íconos salieron idénticos byte por byte.
- **Banco**: el del anuncio comprueba que el lema se vea en el cuadro quieto del cierre. Saboteado atrasando su entrada: da rojo.
  - El de los recorridos encontró un salto de diseño. La primera versión de la portada del recorrido daba CLS 0,0133 con red lenta en 1440 × 790 (ver aprendizajes). Se midieron tres frases nuevas, más la vieja como control, en los cinco tamaños, y se eligió una que no salta.
  - QA, anuncio y recorridos sin problemas.

## 12/10/2026 · El anuncio: la IA al costado del tablero (55 s)

- **Pedido del dueño**: el chat con IA se veía como otra pantalla, y la gracia del producto es que vive al lado del tablero. Es un botón al costado; un clic lo despliega y ahí se conversa con los datos del modelo. «Es la bomba», así que lleva diseño propio, aunque el anuncio se alargue un poco, y tiene que resolver dos preguntas difíciles.
- **La toma 6 nueva (24 – 40,75 s)** arranca con el mismo reporte de la toma 5, sin corte. Se apagan las luces y asoma la lengüeta «Chat IA», con su halo. La cámara la mira, hay un toque, y la lengüeta tira del panel: entra desde el costado mientras el reporte se encaja en lo que queda, como en el portal. Después la cámara entra al panel y el chat resuelve:
  1. **«¿Qué sucursales crecieron más que el promedio contra 2025?»** Muestra los tres pasos del chat real («Leyendo la estructura del modelo», «Redactando la consulta», «Consultando Power BI») y responde «**3 de 7** sucursales crecieron más que el promedio. **Aeropuerto** lidera: **+18,4 %**». El gráfico es de barras divergentes, con un solo eje de −10 a +20 y el promedio (+7,9 %) como línea punteada. Las barras que lo superan van en el violeta de la IA y las demás en gris.
  2. **«¿Y qué explica lo de Aeropuerto?»** Hace tres consultas («Consulta 1 de 3», como las muestra el chat) y responde «Lo explica **el ticket promedio**, no la cantidad de tickets». Lo muestran dos fichas de 2025 contra 2026: el ticket promedio sube de US$ 94 a 118 (+26 %) y los tickets bajan de 7.388 a 6.969 (−6 %).
  Al final la cámara se aleja y quedan el tablero y su IA juntos, con «Pregúntale lo que el tablero no muestra».
- **De 46 a 55 segundos** (3.300 cuadros). Las tomas 7, 8 y 9 no cambian: corren 9 s más tarde.
- **La cámara se mide por formato, no a ojo.** El panel es lo más grande que entra entre la firma de arriba y el borde de abajo. En 9:16 ese borde está en el 79 % del alto, porque más abajo van los botones de Reels y TikTok y ahí quedaba el campo donde se tipea. La mirada a la lengüeta no tapa el subtítulo: en 16:9 la ventana ya no se corre hacia el titular, y el subtítulo va en dos renglones. Los primeros valores, puestos a ojo, rompían tres formatos.
- **Arreglos encontrados en el camino:**
  - **La lengüeta quedaba medio alto más abajo que el aro de su toque.** El minificador borró su `translate` porque la misma regla declaraba `transform`. Ahora se centra con márgenes automáticos. El mismo minificador fundió en el `transform` el giro de −4° de la tacha de la toma 1, y la animación lo pisa: la tacha sale derecha desde la primera versión. No se tocó, porque es la que se aprobó en los videos. Queda anotada en el banco.
  - **Motor: al volver atrás se perdían las animaciones sin relleno** (sin `fill`). `getAnimations()` deja de listarlas cuando terminan. No volvía el pulso del botón de enviar, ni el giro de la tarjeta del login en la segunda vuelta del bucle. Ahora el motor guarda todas las animaciones que vio y suelta las que CSS cancela.
  - **El botón de enviar pulsaba con `scale`.** Eso lo subía a una capa propia, y dentro de la cámara salía nítido o borroso según desde dónde se llegaba al instante. Ahora se oscurece y suelta un anillo, sin capa.
  - **El acento de «Pregúntale» asomaba por la ranura.** La frase final espera 15 s su turno, y la punta del acento dejaba una mota blanca sobre el cielo toda la toma. Ahora no se pinta hasta su turno.
- **Banco** (`npm run anuncio:probar`) con comprobaciones nuevas:
  - el encuadre de la toma 6 en los cuatro formatos: la mirada no tapa el subtítulo, y adentro el chat entra entero, sin pisar la firma y, en 9:16, sobre el 79 %;
  - el aro cae sobre la lengüeta;
  - al volver atrás, las animaciones sin relleno se mueven;
  - ninguna regla mezcla `transform` con `translate`, `rotate` o `scale`.
  - El comparador del «mismo cuadro» ya no cuenta las líneas de un píxel, que son bordes rasterizados en otra posición subpíxel. Una mancha sigue contando entera.
- **Sabotajes**:
  - con la cámara vieja del 1:1, 2 rojas;
  - sin el arreglo del motor, 1 roja (el botón y la tarjeta);
  - el comparador, con imágenes sintéticas, ignora la fila y la columna de un píxel y cuenta la mancha de 40 × 40 y la fila de 2 px;
  - la regla nueva, sobre el CSS anterior, señala la lengüeta.
- QA 54/54 y banco del anuncio sin problemas.

## 12/10/2026 · Recorrido del administrador del Portal BI

- **Página nueva `/portal-bi/como-funciona/administrador/`**: el Portal BI como lo maneja quien lo administra, en una toma de 72 s y ocho pasos. Muestra el panel con todos sus módulos y el alta de una persona (con su usuario o con su correo). Sigue con su vista armada en el constructor, que recorre el modelo de tabla a columna y valor y devuelve el JSON. Después el tablero asignado, con el enlace que el panel lee en palabras, y las opciones del tablero (una página oculta y sin «Exportar datos»). Termina con el chat con IA al costado (con el aviso de lo que podrá consultar), la marca con su vista previa y los registros de acceso.
- La pantalla es el panel real dibujado a 1280 × 760 (`RecorridoAdmin.astro`), calcado de `admin.css` y de las vistas del portal, con sus palabras en tuteo. Los grises de los textos chicos suben a AA.
- **Comparte todo con el recorrido de tu equipo**: el motor (`recorrido-motor.ts`: reloj, cámara, cursor, narración y controles) y el marco de la página (`RecorridoMarco.astro`). Cada uno trae su pantalla y su guion. El CSS se partió en lo común (`recorrido.css`), la pantalla de tu equipo (`recorrido-pantalla.css`) y la del administrador (`recorrido-admin.css`): ninguna página carga la pantalla de la otra.
- El recorrido de tu equipo quedó idéntico: sus 20 cuadros de movimiento reducido comparados píxel por píxel contra los de antes (el comparador se saboteó para ver que sabe decir «distinto»), y sus pasos duran lo mismo.
- Se llega desde la sección del panel en `/portal-bi/` («Mira cómo se administra») y desde el cierre de cada recorrido, que ahora ofrece el otro.
- Banco: `npm run recorrido` prueba los dos (o uno con `--solo equipo|administrador`). QA 54/54. Lighthouse del recorrido nuevo: 100 / 100 / 100 / 100 en móvil (LCP 1,4 s) y en escritorio; `/portal-bi/` sigue en 100 en móvil (LCP 1,7 s).
- De paso, la página del anuncio dice cuánto tarda de verdad la Action en grabar los videos: unos 25 minutos (medido: 24,6).

## 11/10/2026 · El anuncio, más lento; los videos, fuera del repositorio

- **De 30 a 46 segundos**, a pedido del dueño ("está muy rápido, no da tiempo de leer"). Cada titular queda entre 3 y 4,5 s a la vista. La pregunta del gancho se lee 3,2 s. Cada persona de "cada uno ve lo suyo" tiene un segundo (antes 0,6). El chat deja la respuesta con su gráfico 2,4 s antes de irse. Cada razón de la ráfaga dura un segundo y medio (antes 0,8), y la última —«Nunca más una licencia por persona», el remate— 2,2. Los cortes siguen cayendo en la grilla de 120 BPM.
- **Los MP4 ya no están en el repositorio ni en el sitio.** Los graba la Action «Grabar el anuncio» (`.github/workflows/anuncio.yml`) cada vez que cambia el anuncio, y los sube al release `anuncio-portal-bi` de GitHub. Los botones de la página enlazan ahí y el clic baja el archivo. La Action corre en Windows porque las maquetas usan Segoe UI, que en Linux no existe.
- Los MP4 de 30 s se borraron de `public/`. Siguen en la historia de git (`446168c`): sacarlos de ahí exige reescribir la historia con `push --force`, que este repositorio no permite.
- `npm run anuncio:video` ya no necesita `npm run preview` en otra terminal: sirve `dist/` por su cuenta. Deja los videos en `videos-anuncio/` (ignorada por git) y lee cada MP4 con ffprobe para confirmar que tiene todos los cuadros y el color BT.709. Si algo falla, sale con error, y así la Action no publica un video roto. Además graba 2,3 veces más rápido, porque le pide el cuadro a Chrome con su compresión PNG rápida (los mismos píxeles, medido). En esta laptop, el 9:16 se graba en 4 min 15 s (antes habrían sido unos 10).
- **Arreglo: con "reducir movimiento" el anuncio salía vacío**, solo con el fondo, desde la primera versión. Había dos causas a la vez. La regla global de movimiento reducido acortaba toda animación a 0,01 ms, así que al llevar el reloj a cualquier instante cada toma ya había terminado y quedaba oculta. Y el cuadro elegido (27,5 s) caía antes de que el cierre estuviera armado. Ahora el lienzo lleva `data-movimiento-propio`, que lo saca de la regla global, y el cuadro quieto es el cierre entero (45 s).
- Banco: `npm run anuncio:probar` con los tiempos nuevos. Agrega el cuadro quieto de movimiento reducido (qué toma se ve y que el cierre esté armado), que la duración coincida en sus tres lugares y que los botones bajen del release. Saboteado de dos formas, sacando la exclusión y adelantando el cuadro: las dos dan rojo.
- QA 48/48 sin problemas; banco del recorrido sin problemas.

## 11/10/2026 · Anuncio del Portal BI para redes (página oculta)

- **`/portal-bi/anuncio/`**, sin enlaces, sin indexar y fuera del sitemap: un anuncio de 30 segundos para vender el Portal BI en redes, en cuatro formatos (9:16 Reels/TikTok/historias, 4:5 y 1:1 feed, 16:9 YouTube/LinkedIn). Se ve en la página, se graba en pantalla completa o se descargan los MP4.
- **El guion, pensado para vender**: el primer cuadro ya dice el dolor ("¿Pagas Power BI por cada persona?") mientras se llenan mil asientos con licencia; el costo sube hasta US$ 14.000 al mes y se tacha en rojo ("sin el portal pagarías", regla del dueño); los mil colapsan en una sola licencia que se vuelve verde y se abre en mil personas. Después, una idea por toma: tu marca (la misma pantalla con tres empresas), cada persona ve solo sus tableros, Power BI de verdad sin cuenta de Power BI, el chat con IA respondiendo, el celular, una ráfaga de cuatro razones y el cierre con el logo, las fichas y el WhatsApp.
- **Cuadro por cuadro**: todo el movimiento es CSS con una línea de tiempo que el script puede llevar a cualquier instante exacto. `npm run anuncio:video` abre la página en Chrome al tamaño de cada formato, saca una foto por cuadro (60 por segundo) y `ffmpeg` arma el MP4 H.264 con color BT.709. Ningún cuadro se pierde, y el resultado es siempre el mismo.
- Sin audio: en las redes casi todo se mira sin sonido y la música se elige en la app. Los cortes caen cada medio segundo (120 BPM).
- Los datos del reporte y del chat son los de las maquetas, rotulados "Datos de ejemplo".
- **Los cuatro MP4 ya están generados** en `public/portal-bi/anuncio/`: 30,000 s, 1.800 cuadros a 60 cps, H.264 High con color BT.709, entre 7,4 y 9,5 MB cada uno (CRF 18), más una portada JPEG por formato. Se grabó primero un máster sin pérdida y de ahí se recodificó, así que se puede elegir otro peso sin volver a grabar.
- Banco nuevo, `npm run anuncio:probar`: cada toma en su ventana en los cuatro formatos, el mismo instante da el mismo cuadro (también en las dos fases del lienzo), la letra escala con el lienzo, el aro del toque no se adelanta, y la página reproduce, pausa y cambia de formato. Saboteado: detecta lo que cuida. QA 48/48 sin problemas.
- Arreglo de paso: los trazos del logo pasaron a `src/data/logo.ts` para animar el ícono por separado; el `Logo.astro` dibuja exactamente lo mismo (comparado byte a byte).

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
