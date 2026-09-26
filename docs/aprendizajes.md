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

### `python3` no existe; `python` sí (3.14)
- Y la consola usa cp1252: para imprimir Unicode, `PYTHONIOENCODING=utf-8`.

## Contenido y formato

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
