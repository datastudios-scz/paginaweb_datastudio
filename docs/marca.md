# Marca

## Colores

Hex exactos del manual (no se modifican). Los derivados se calcularon en OKLCH manteniendo el matiz de su color de marca.

| Token | Hex | Uso |
| --- | --- | --- |
| `--color-abismo` | `#001720` | Fondo oscuro principal, texto sobre claro |
| `--color-petroleo` | `#00394e` | Superficie oscura secundaria, barras del gráfico |
| `--color-verde` | `#037a70` | Acción: botones primarios, enlaces sobre claro, barra del producto estrella |
| `--color-salvia` | `#ced9bd` | Fondo de bandas claras, texto secundario sobre oscuro |
| `--color-blanco` | `#ffffff` | Texto sobre oscuro |
| `--color-verde-claro` | `#4dcfc1` | Derivado: acento de texto y líneas sobre fondos oscuros |
| `--color-verde-oscuro` | `#00635b` | Derivado: hover y enlaces sobre fondos claros |
| `--color-papel` / `--color-papel-2` | `#f4f7ef` / `#e6eddb` | Derivado: fondos claros (salvia diluida, no crema) |
| `--color-tinta-suave` | `#314c59` | Derivado: texto secundario sobre claro |
| `--color-salvia-suave` | `#a6ae9a` | Derivado: texto terciario sobre oscuro |

### Contrastes verificados (WCAG 2.2)

| Texto sobre fondo | Ratio | Nivel |
| --- | --- | --- |
| blanco / abismo | 18.37 | AAA |
| salvia / abismo | 12.49 | AAA |
| verde-claro / abismo | 9.63 | AAA |
| verde-claro / petróleo | 6.50 | AA |
| blanco / verde (botón) | 5.22 | AA |
| abismo / papel | 16.96 | AAA |
| tinta-suave / papel | 8.40 | AAA |
| verde / papel (enlaces) | 4.82 | AA |
| abismo / salvia | 12.49 | AAA |
| verde-oscuro / salvia | 4.87 | AA |

**No usar**: verde (`#037a70`) como texto sobre abismo (3.52) ni sobre salvia (3.55); solo sirve como fondo de botón o elemento grande. Salvia sobre verde (3.55) tampoco: sobre verde, todo el texto va en blanco.

## Tipografía

| Rol | Fuente | Dónde |
| --- | --- | --- |
| Logotipo "DATA STUDIO" | **Costa Rica** | Solo en el logo, como vector. Nunca como texto del sitio |
| Titulares y texto | **Poppins** 400 / 500 / 600 / 700 | Todo el sitio. Titulares en 600 con tracking negativo |
| Datos y rótulos | **DM Mono** 500 | Cifras, rótulos de sección, etiquetas técnicas (API, DAX, métricas) |

- Lema "INNOVACIÓN, ANALÍTICA & MARKETING": Poppins en mayúsculas con tracking amplio, como en el logo.
- Titulares siempre rectos (sin itálica). El énfasis va con color (`--acento`), no con cursiva.
- Escala fluida en `tokens.css` (`--text-xs` … `--text-display`). El titular del hero tiene un tope de 72 px para caber en dos líneas en escritorio.
- Las fuentes son woff2 con subconjunto latino (incluye á é í ó ú ñ ü ¿ ¡ – —). **No incluyen flechas ni ✓**: se usan íconos SVG.

## Logo

- Originales en `marca y logos/` (PNG). El maestro vectorial vive en `src/components/Logo.astro`:
  - **Ícono**: reconstrucción geométrica del monitor (pantalla 1893 px, radio 130; barras de 233 px con alturas 473/626/786/473; bisel con 3 pastillas; pie). Coincide en un 99,7 % de píxeles con el PNG negro de 4739 px.
  - **Wordmark**: trazado con potrace del PNG negro + SVGO (1,2 KB de trazado).
  - Variante `horizontal` (encabezado y pie) e `icono`.
- Hereda `currentColor`: blanco sobre oscuro, abismo sobre claro.
- Favicon: solo las 4 barras sobre cuadrado abismo (a 16 px el monitor no se lee). Íconos de app: el monitor completo.
- Para regenerar favicons, íconos e imágenes OG: `npm run recursos`.

## Motivos visuales (con significado)

- **Las cuatro barras del logo = las cuatro soluciones.** En el hero, el gráfico replica la proporción exacta del ícono (0,60 / 0,80 / 1,00 / 0,60). La barra más alta es el Portal BI (producto estrella). En móvil el gráfico rota a barras horizontales.
- **Contenedores = monitor (redondeados); datos = barras (rectos).** Tarjetas y maquetas con radio; barras y celdas de datos sin radio.
- **Botones en pastilla**, como los tres botones del bisel del monitor.
- **Rótulos de informe**: DM Mono en mayúsculas + regla fina, como el encabezado de un reporte de BI.
- Dentro de las maquetas del Portal BI, el amarillo de Power BI (`#f2c811`) y el índigo de la IA (`#4338ca`/`#6366f1`) son colores del producto, no de la marca del sitio.

## Voz

- Español con **tuteo** ("Escríbenos", "Pide una demo"). Registro cercano y concreto.
- Nombrar lo que la persona controla y reconoce; nada de jerga vacía ("soluciones innovadoras de vanguardia").
- Sin cifras, clientes ni testimonios inventados (ver [contenido.md](contenido.md)).
