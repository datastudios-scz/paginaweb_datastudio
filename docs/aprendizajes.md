# Aprendizajes y errores (leer antes de tocar código)

Cada entrada: **síntoma → causa → solución → cómo evitarlo**.

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
