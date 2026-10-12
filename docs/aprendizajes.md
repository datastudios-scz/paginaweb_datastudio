# Aprendizajes y errores (leer antes de tocar código)

Cada entrada: **síntoma → causa → solución → cómo evitarlo**.

## Recorrido del administrador (12/10/2026)

### Cuando la cámara se pega al borde, se corre para el otro lado
- **Síntoma**: en el paso de la marca, el borde izquierdo de la toma partía el menú lateral por la mitad de sus palabras («uarios», «ado AAD»).
- **Causa**: la toma apuntaba a algo cerca del borde derecho con zoom 1,15. Lo visible medía 1.113 px de la pantalla, y al no poder pasarse del borde derecho, la cámara se corrió a la izquierda hasta meterse en el menú.
- **Regla**: en escritorio lo visible mide 1280 / zoom; para no salir del área principal (1018 px, la pantalla sin el menú de 262) el zoom tiene que ser al menos 1280 / 1018 = 1,26. Las tomas del cuadro de asignar quedan con menos: lo que cortan está detrás del velo.

### En el teléfono, la toma del cuadro entero no se lee
- **Síntoma**: el cuadro de asignar entraba entero y su letra quedaba en 9 px.
- **Causa**: la cámara del teléfono se acerca hasta donde el alto lo permite, y el cuadro mide 720 px: por más zoom que se pida, el alto la frena. Angostar el cuadro no cambiaba nada.
- **Solución**: en el teléfono cada toma apunta a lo que se está usando (el campo, la sección, el botón) y, si es ancho, a su parte izquierda, donde empieza lo que se lee. Es el helper `ver()` del guion.

### El tiempo de un recorrido lo pone el viaje del cursor
- La primera versión duraba 93 s, con pasos de 14 a 16. Cada clic cuesta el viaje del cursor (hasta 1,15 s) más la pausa sobre el botón, y el panel tiene botones lejos del menú. Recortar esperas dio poco (81 s); sacar clics que no contaban nada nuevo, algo más (78 s); lo que resolvió fue una mano más rápida para este guion (72 s), que el motor aceptó como opción sin tocar el recorrido de tu equipo.

### «//» con un hueco: la ligadura de la fuente monoespaciada
- En el campo del enlace se veía «https:// app.powerbi.com». Con `--rc-mono`, Chrome en Windows usa Cascadia Code, que dibuja «//» como ligadura. `font-variant-ligatures: none` en los enlaces, los ID y el JSON.

### Partir un CSS compartido se prueba píxel por píxel, y se sabotea la prueba
- Para que la página del administrador no cargue la pantalla de tu equipo, `recorrido.css` se partió en dos. Las reglas se movieron tal cual (un script verificó que no se perdiera ninguna línea), salvo las de movimiento reducido de esa pantalla: tenían que seguir viniendo DESPUÉS de las animaciones que apagan, y van al final del archivo nuevo.
- La prueba: los 20 cuadros de movimiento reducido (10 pasos × escritorio y teléfono) antes y después, idénticos píxel por píxel. Y antes de creerle al «todas idénticas», se le dio un cuadro cambiado: dijo «628.255 píxeles distintos».

### Un chequeo que cuenta cero dice «todo bien»
- **Síntoma**: el script que revisaba las rutas críticas del despliegue dijo «todas están en dist/»… sobre una lista de 0 rutas.
- **Causa**: la expresión regular pasó por bash y por Python, y en el camino perdió sus barras invertidas. El mismo viaje unió dos líneas de `deploy.yml` (se comió la barra y el salto de línea del final de una ruta), y el error era silencioso: el YAML seguía siendo válido.
- **Solución**: el chequeo se rehízo sin expresiones regulares y dice cuántas rutas revisó (15). Los scripts con barras invertidas van a un archivo, no a un heredoc, y después de editar un archivo con barras se mira el resultado (aprendizaje ya escrito en el CLAUDE.md del portal: pasó otra vez).

## Anuncio del Portal BI (11/10/2026)

### La regla global de «reducir movimiento» vacía lo que se maneja por tiempo
- **Síntoma**: con movimiento reducido, el anuncio quedaba quieto en un cuadro con solo el fondo, sin ninguna toma. Medido en el sitio publicado, desde la primera versión.
- **Causa**: `global.css` acorta TODA animación a 0,01 ms con `!important`. El anuncio no se reproduce ahí: lleva su reloj a un instante (`currentTime`) y queda quieto. Con duraciones de 0,01 ms, en cualquier instante todas ya terminaron, y cada toma queda en su estado final, que es oculta. Encima, el instante elegido (27,5 s) caía antes de que el cierre estuviera armado.
- **Solución**: el lienzo lleva `data-movimiento-propio` y la regla global lo excluye (`*:not([data-movimiento-propio], [data-movimiento-propio] *)`). El cuadro quieto pasó a los 45 s, con el cierre entero.
- **Evitarlo**: un componente que maneja su propio movimiento reducido tiene que salir de la regla global, y probarse con `reducedMotion: 'reduce'`.

### Medir los elementos no es medir lo que se ve
- **Síntoma**: la primera prueba del cuadro quieto medía la escala del botón, la opacidad de la URL y la posición del título. Con la regla global puesta de nuevo (sabotaje), dio verde.
- **Causa**: cada elemento terminaba en su estado final, perfecto, dentro de una toma oculta. La prueba miraba las piezas y el defecto estaba en el contenedor.
- **Solución**: preguntar primero QUÉ TOMA se ve (la misma función que usa el resto del banco), y recién después si el cierre está armado. Detalle de paso: Chrome informa la transformación identidad como `matrix(1, 0, 0, 1, 0, 0)`, no como `none`. Comparar el texto daba rojo con el título en su lugar, y por eso se compara con `DOMMatrix.isIdentity`.

### Un video en `public/` pesa aunque la página no lo cargue
- Los MP4 solo estaban enlazados: no hacían más lenta la página. Pero viajaban en el repositorio (~35 MB por cada regeneración, para siempre en la historia) y en cada despliegue de Pages. Un archivo grande que cambia se publica fuera del sitio: acá, como archivo de un release que graba una Action.
- Borrarlos después no los saca de la historia. Eso exige reescribirla con `push --force`, que este repositorio no permite.

### La foto de Playwright comprime el PNG a fondo, y eso es lo que tarda
- `page.screenshot` de un cuadro de 1080 × 1920: 4,5 cuadros por segundo. `Page.captureScreenshot` por CDP con `optimizeForSpeed: true`: 10,3 por segundo, con los mismos píxeles (0 bytes distintos al decodificar). El PNG pesa casi el doble, pero va directo a ffmpeg y no se guarda.

### Una variable CSS sin registrar resuelve el `var()` donde se DECLARA, no donde se usa
- **Síntoma**: en la página del anuncio los textos salían enormes (el titular, 118 px en un lienzo de 453); en el video de 1080 px se veía perfecto.
- **Causa**: `--h1: calc(118 * var(--u))` estaba en el lienzo, y `--u` (registrada con `@property`, se calcula con `cqmin`) recién vale en los HIJOS del lienzo. Una variable sin registrar sustituye sus `var()` en el elemento donde se declara: ahí `--u` tenía su valor inicial, 1px, y `--h1` quedó fija en `118px` para todos. En el video el lienzo mide 1080 y `--u` vale justo 1px: salía bien por casualidad.
- **Solución**: las variables de formato que usan `--u` se declaran en los hijos del lienzo (`.an-lienzo[data-formato] > *`).
- **Evitarlo**: probar la pieza en un tamaño donde la casualidad no tape el error. Que el video final se vea bien no prueba la página.

### `animation-fill-mode: both` muestra el primer cuadro ANTES del retardo
- **Síntoma**: el aro del "toque" sobre la primera tarjeta se veía durante toda la toma, no solo al tocar.
- **Causa**: su `@keyframes` arranca en opacidad 0,9, y con `both` ese primer cuadro se aplica desde el principio, antes de que llegue su momento.
- **Solución**: `forwards` cuando el estado inicial de la animación no es el de reposo del elemento.

### "El mismo cuadro" no es "los mismos bytes"
- **Síntoma**: el banco exigía que ir dos veces al mismo instante diera un PNG idéntico, y en 1:1 fallaba de a ratos.
- **Causa**: Chrome re-rasteriza a veces un degradado con una diferencia mínima. Medido: 33 píxeles, a lo sumo 3 niveles de 765, todos dentro del ícono del chat (degradado + trazo SVG a escala 0,736). Invisible, y no es un error de la línea de tiempo.
- **Solución**: comparar píxel por píxel con una tolerancia escrita (más de 12 niveles, en menos del 0,01 % del cuadro) y, en la misma prueba, comprobar que dos instantes distintos SÍ se distinguen: una comparación que nunca puede decir "distinto" no prueba nada.

### Un sabotaje que no se puede ver en el instante que mira la prueba no prueba nada
- **Síntoma**: se saboteó el lienzo moviendo un asiento al azar y la prueba de determinismo siguió en verde.
- **Causa**: la prueba miraba los 5,7 s, y a esa altura los asientos ya colapsaron: el lienzo dibuja la espiral. El sabotaje era real pero invisible para esa prueba, y la fase de los asientos no estaba cubierta por nada.
- **Solución**: una comprobación por fase (los asientos a los 3 s, la espiral a los 5,7 s) y un sabotaje en cada una. Con eso, 7 rojas.

### ffmpeg convierte las fotos a YUV en BT.601 y no lo dice
- **Riesgo**: de PNG (RGB) a yuv420p, ffmpeg usa la matriz BT.601 y deja el video sin etiqueta; los reproductores asumen BT.709 para HD y los verdes de la marca se corren.
- **Solución**: `-vf scale=out_color_matrix=bt709:out_range=tv` para convertir, y las etiquetas con `-x264-params colorprim=bt709:transfer=bt709:colormatrix=bt709:range=tv`. Con `-color_primaries/-color_trc` no quedaban escritas: ffprobe decía "unknown". Verificarlo siempre con `ffprobe -show_entries stream=color_space,color_primaries,color_transfer`.

### El modo sin pérdida de x264 no acepta el perfil `high`
- `--crf 0` (máster para recodificar sin volver a grabar) falla en el acto con `-profile:v high`: necesita su perfil High 4:4:4. El script no fija perfil en ese caso, y si ffmpeg se cae, lo dice en vez de reventar al escribirle.

## Recorrido animado del Portal BI (09/10/2026)

### Un `<script is:inline>` dentro de una página lo bloquea la CSP
- **Síntoma**: «Executing inline script violates the following Content Security Policy directive» en `/portal-bi/como-funciona/`.
- **Causa**: Astro no calcula el hash de los `is:inline`. El de `Base.astro` funciona solo porque está ANTES del `<meta>` de la CSP, y una CSP por `<meta>` no alcanza a lo que ya se ejecutó. Pasarlo a una línea no cambia nada: el hash ni siquiera se agrega.
- **Solución**: hacerlo sin script. Para no pintar la portada cuando se llega con `#ver`: `id="ver"` en la raíz y `#ver:target .rc-portada { display: none }` (dentro de `prefers-reduced-motion: no-preference`, porque con movimiento reducido no arranca solo).
- **Evitarlo**: antes de escribir un script en línea, buscar la forma en CSS. Si no la hay, el hash va a mano en `astro.config.mjs`.

### Un `visibility` con retardo en un elemento que lo HEREDA también retrasa su aparición
- **Síntoma**: en el teléfono, al abrir el tablero se asomaba el reporte sin la capa negra de carga, y la capa aparecía un instante después.
- **Causa**: la capa tenía `transition: visibility 0s linear .45s` en su regla de base, pensada para esconderse después del fundido. Pero hereda el `visibility` de la escena, y cuando la escena pasa de oculta a visible ese cambio heredado también transiciona: la capa tardaba 0,45 s en verse.
- **Solución**: el retardo del `visibility` va solo en el estado oculto (`.rc-capa.es-oculta`). Lo mismo en la lengüeta del chat.
- **Evitarlo**: `visibility ... <retardo>` nunca en la regla de base de algo que hereda la visibilidad de un padre que cambia.

### El script corre después del primer pintado: si acomoda el diseño, la página salta
- **Síntoma**: CLS 0,027 en Lighthouse de escritorio, y 0,066 al llamarlo antes. Medido desde adentro con red lenta: la narración se corría 92 px y la ventana se achicaba.
- **Causa**: el script angostaba la narración al ancho de la ventana (`--rc-ancho`) y la subía en las tabletas (`--rc-hueco`). Con red lenta llega después del primer pintado. Peor: angostar la narración la hacía más alta, eso achicaba la ventana, y eso volvía a angostar la narración.
- **Solución**: todo en CSS. Escritorio más cuadrado: la narración centrada debajo, como subtítulos (no depende del ancho de la ventana). Tableta parada: el escenario mide justo la ventana, con una fórmula que solo usa el ancho de la pantalla, y dos espacios iguales centran el conjunto. Y la barra de progreso, que nace vacía y el script llena con 8 segmentos, tiene su alto reservado (eran 10 px de salto). CLS: de 0,066 a ≤ 0,0007 en cinco tamaños.
- **Evitarlo**: lo que el script agrega o mide no puede mover lo que ya se pintó. Y medir con la red lenta: en local el script llega antes del pintado y el salto no aparece. `npm run recorrido` lo mide así (CDP, 150 ms de latencia).

### El minificador escribe `8000` como `8e3`
- **Síntoma**: el banco buscaba el arreglo de duraciones en el JS publicado con `\d{4,5}` y no lo encontraba.
- **Solución**: el script publica lo que el banco necesita (`data-duraciones` en la raíz). No leer constantes del código compilado.

### Una prueba que compara dos vacíos pasa sin probar nada
- **Síntoma**: «en pausa no se escribe nada ("" = "")» en verde. Pausaba antes de que el cursor empezara a escribir.
- **Solución**: esperar a que el campo tenga texto y pausar a mitad del tipeo; la aserción exige además que no esté completo. Y otra tenía un `|| true` olvidado. Con sabotaje (el reloj sin pausa, el chat sin abrirse) las dos dan rojo.
- **Evitarlo**: cada aserción tiene que poder fallar. Probarlo rompiendo lo que cuida.

### Las capturas de una corrida con sabotaje pisan las buenas
- **Síntoma**: en las capturas del modo reducido el chat no aparecía abierto, y parecía un error del recorrido.
- **Causa**: eran de la corrida con el sabotaje puesto (sin abrir el chat), que escribió en la misma carpeta. El código restaurado estaba bien.
- **Evitarlo**: después de restaurar un sabotaje, volver a correr antes de mirar capturas, o guardarlas en otra carpeta.

## Astro

### Estilos con alcance que no llegan a componentes hijos
- **Síntoma**: el logo del encabezado no se veía y las flechas de las barras del hero salían gigantes.
- **Causa**: los estilos de un `.astro` tienen alcance: `.x svg` solo aplica a elementos escritos en ese mismo archivo. Un `<Icono class="x">` o `<Logo>` renderiza su `<svg>` en otro componente, sin el atributo de alcance del padre.
- **Solución**: `.padre :global(svg)` o `.padre :global(.clase-del-hijo)`.
- **Evitarlo**: siempre que se estilice algo que dibuja otro componente, usar `:global()` acotado a un contenedor propio.

### `compressHTML: 'jsx'` (valor por defecto de Astro 7) come espacios
- **Riesgo**: con reglas JSX se elimina el espacio entre elementos en línea en distintas líneas (`</strong>\n texto` → "negritatexto").
- **Solución**: `compressHTML: true` (reglas HTML) en `astro.config.mjs`.

### Astro 7 usa un compilador en Rust más estricto
- Etiquetas sin cerrar o HTML inválido ahora son error de compilación (antes se corregían solas). Escribir HTML válido.

### La CSP no aplica en `astro dev`
- Probar siempre con `npm run build && npm run preview`. `npm run qa` reporta violaciones.

### Atributos `style` bloqueados por la CSP
- Nada de `style="…"` en el HTML ni `define:vars`. Para alturas de barras se usan clases (`.barra--b60`); para la barra de la calculadora, `element.style.width` desde JS (CSSOM sí está permitido).

### El minificador mete `animation-timeline` dentro del atajo `animation` (y Chrome lo descarta)
- **Síntoma**: las animaciones ligadas al scroll (portada → telón) no corrían en el build, aunque en el código estaban bien.
- **Causa**: si `animation: x linear both` y `animation-timeline: --telon` están en la misma regla, el minificador de CSS las fusiona en `animation: x linear both --telon`. Chrome no acepta la línea de tiempo dentro del atajo y descarta la declaración entera.
- **Solución**: el atajo en una regla y `animation-timeline` + `animation-range` en otra regla aparte, más específica y posterior (`.portada .x { animation-timeline: … }`). El atajo reinicia `animation-range`: por eso la regla del rango debe ganar en especificidad.
- **Evitarlo**: tras el build, `grep -o 'animation-timeline:--' dist/index.html` debe contar las reglas esperadas y `grep -oE 'animation:[^;}]*--' dist/index.html` debe dar 0.

### Animaciones que dependen de una línea de tiempo de otra sección
- Una línea de tiempo con nombre (`view-timeline: --grafico`) solo la ven los descendientes. Para que la portada (hermana) la use, el ancestro común declara `timeline-scope: --telon, --grafico` (en `index.astro`, `.telon`).

### Lecturas de layout al iniciar un script (forced reflow)
- **Síntoma**: Lighthouse marcaba "forced reflow" y el inicio bajó a 98.
- **Causa**: el encabezado llamaba a `getBoundingClientRect()` y leía `scrollY` al cargar, antes del primer pintado.
- **Solución**: sin lecturas de layout al iniciar; el primer callback del `IntersectionObserver` trae las medidas (`boundingClientRect`, `rootBounds`) y fija el estado.

### Fundidos de pantalla completa al cargar
- Un fundido de entrada de la escena de fondo subió el Speed Index a 3,8 s. En el primer pantallazo nada de opacidad 0 → 1 a pantalla completa; solo animaciones de piezas pequeñas (barras, trazos).

### Lighthouse revisa el contraste también dentro de maquetas `aria-hidden`
- El distintivo del chat en la maqueta del portal (#6366f1 sobre #eef2ff, 3,99:1) bajó la accesibilidad a 96. El texto de las maquetas también debe cumplir AA.

### El proveedor de fuentes `npm` no es "local"
- Reescribe las URLs al CDN de jsdelivr y solo encuentra el peso 400 del `index.css`. Se usa `fontProviders.local()` con los woff2 en el repo.

### Maquetas grandes: el costo es estilo y layout, y el diferido tiene una trampa
- **Síntoma**: con las maquetas nuevas, el trabajo de estilo y layout al cargar se duplicó (592 → 1.175 ms en el teléfono simulado) y el Speed Index pasó de 1,2 a 2,4 s.
- **Solución**: `content-visibility: auto` en las maquetas que no están en el primer pantallazo (clase `.mq-diferida`, con su alto de reserva).
- **La trampa**: `contain-intrinsic-size: auto 34rem` reserva **ancho y alto**. En una grilla de una columna el ancho reservado ensanchó el bloque a 544 px y rompió el teléfono. Se reserva solo el alto: `contain-intrinsic-block-size`.

### Un documento que cruza ~44 KB comprimidos paga un viaje más de TCP en Lighthouse
- **Síntoma**: FCP 1,2 → 1,4 s y LCP 1,5 → 1,7 s con 46 KB; quitando una maqueta (42 KB) volvía a 1,2 / 1,5. La simulación arranca TCP con ~14,6 KB y duplica: con ~43,8 KB entra en dos viajes, con más hace falta un tercero.
- **Qué se hizo**: las maquetas usan `<style is:global>` (sus clases llevan prefijo propio: `mp-`, `mc-`, `mv-`, `ma-`, `ml-`, `tel`). Con estilos con alcance Astro marca cada elemento con `data-astro-cid-…`, y eso solo eran ~1,4 KB comprimidos. Medido A/B intercalado: global y con alcance cuestan lo mismo en estilo.
- **Ojo al medir**: en esta máquina la misma versión da 96 o 100 según la carga del momento. Comparar siempre intercalando versiones, nunca contra una corrida de otro momento.

### Un contenedor no puede consultarse a sí mismo
- `@container` evalúa contra un **ancestro**: la regla que cambia la grilla del propio contenedor no aplica nunca. La grilla va en un hijo (`.mp-rejilla`, `.ma-escena__rejilla`).

## Entorno Windows

### Saltos de línea
- **Síntoma**: al clonar, git marcó como modificados archivos intactos.
- **Causa**: `core.autocrlf` global convirtió LF → CRLF.
- **Solución**: `git config core.autocrlf false` en el repo y `.gitattributes` con `* text=auto eol=lf`. Verificar archivos críticos con `git hash-object` contra `origin/main`.

### Node 20 global vs Node 24
- Astro 7 exige Node ≥ 22.12. No cambiar el Node global (lo usan otros proyectos): usar el de nvm solo en la terminal (ver [despliegue.md](despliegue.md)).

### Borrados con comodines
- Los `rm` con comodines en rutas relativas los bloquea la verificación de seguridad del agente. Sobrescribir archivos o borrar rutas exactas.

### Git Bash convierte en ruta de Windows todo argumento que empieza con `/`
- `node script.mjs http://localhost:4321 /` recibía `C:/Program Files/Git/`. Anteponer `MSYS_NO_PATHCONV=1` al comando.

### Heredocs largos con comillas mezcladas fallan en la herramienta Bash del agente
- Para ediciones grandes, escribir el script de Python en un archivo (carpeta temporal del agente) y ejecutarlo.

### Agentes en paralelo (workflows) que se cortan a mitad
- Varios agentes se detuvieron por el límite de la sesión, pero habían escrito casi todo. Antes de confiar en su trabajo: build, QA, revisión visual y revisión de los archivos que tocaron.

### `python3` no existe; `python` sí (3.14)
- Y la consola usa cp1252: para imprimir Unicode, `PYTHONIOENCODING=utf-8`.

## Contenido y formato

### El público es internacional
- Los clientes son de cualquier país y todo se implementa en remoto. No escribir "Santa Cruz" ni "Bolivia" en el sitio nuevo (sí siguen en las páginas legales, que no se tocan). JSON-LD con `areaServed: 'Worldwide'`.

### Cifras sin confirmar repetidas en todas partes
- "Dos horas" y "no cobramos implementación" llegaron a aparecer 6 veces en negrita en `/portal-bi/`. Una promesa se dice una vez, donde se respalda (la sección de instalación) y en la pregunta frecuente. Sigue pendiente de confirmar ([contenido.md](contenido.md)).

### `Intl.NumberFormat('es-BO')` no agrupa los miles de 4 cifras
- Por la regla de agrupación mínima del español: `1000` → "1000" pero `12000` → "12.000". Se usa `miles()` en `src/scripts/formato.ts` (siempre con punto).

### Cortes feos de línea
- "e-commerce" se partía en el guion → guion no separable (U+2011) en nombres. "100 %" se partía → `100&nbsp;%`.

### Titular del hero en 3 líneas
- A 76 px "empresa puede usar." no cabía en la columna de 768 px. Tope de `--text-display` en 72 px.

## GitHub Actions

- `ubuntu-latest` cambia de versión mayor sin aviso en el workflow (migra a Ubuntu 26 el 19/10/2026). El workflow usa `ubuntu-24.04` fijo; actualizarlo a mano cuando convenga, probando el build.

## Imágenes OG con Playwright

- Chromium no carga fuentes `file://` desde una página `about:blank` (`setContent`): la imagen salía en Times. Solución: fuentes en base64 (`data:`) en la plantilla.
- No descarga Chromium: usa el Edge/Chrome del sistema (`executablePath`).

## Google Sites

- Las URLs de imágenes `sitesv-images-rt` expiran y devuelven 403 al rato: no sirven para recuperar material. Pedir los originales al dueño.
