# Rendimiento

## Presupuesto (por página)

| Recurso | Presupuesto | Actual (25/09/2026) |
| --- | --- | --- |
| Peso total transferido | ≤ 150 KB | 72 KB (inicio) · 79 KB (portal-bi) |
| HTML + CSS en línea (gzip) | ≤ 40 KB | ~24 KB |
| JavaScript | ≤ 10 KB, nunca bloqueante | ~3 KB, módulos diferidos |
| Fuentes precargadas | 2 archivos (Poppins 400 y 600) | 2 (~16 KB) |
| Imágenes en el primer pantallazo | 0 rasters | 0 (hero en HTML/CSS/SVG) |
| LCP (móvil, Lighthouse) | ≤ 2,0 s | 1,4–1,5 s (`/portal-bi/`: 1,5–1,7 s) |
| HTML + CSS de `/portal-bi/` (gzip) | ≤ 40 KB | **~45 KB, excedido a propósito** por las maquetas fieles (04/10/2026, ADR-014). Bajar de ~43,8 KB ahorra un viaje de TCP en la simulación |
| CLS | ≤ 0,05 | 0 |
| TBT | ≤ 100 ms | 0–10 ms |

## Resultados de Lighthouse 12 (móvil simulado, build local)

Medición del 27/09/2026 (Edge del sistema, `lighthouse@12`):

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | TBT | CLS | Speed Index |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 100 | 100 | 1,5 s | 0 ms | 0,001 | 1,2 s |
| `/portal-bi/` | 100 | 100 | 100 | 100 | 1,5 s | 40 ms | 0 | 1,2 s |
| `/social-metrics-bi/` | 100 | 100 | 100 | 100 | 1,5 s | 10 ms | 0 | 1,2 s |
| `/tienda-ecommerce/` | 100 | 100 | 100 | 100 | 1,5 s | 0 ms | 0 | 1,2 s |
| `/consultoria/` | 100 | 100 | 100 | 100 | 1,4 s | 0 ms | 0 | 1,2 s |

La portada llegó a 98 (Speed Index 3,8 s por un fundido de toda la escena y "forced reflow" del encabezado); ver [aprendizajes.md](aprendizajes.md).

### Recorrido animado (`/portal-bi/como-funciona/`, 09/10/2026, Chrome del sistema, `lighthouse@12.8`)

| Medición | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | TBT | CLS | Speed Index |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Móvil (4 corridas) | 99–100 | 100 | 100 | 100 | 1,4 s | 0–90 ms | 0–0,004 | 1,1–2,5 s |
| Escritorio | 100 | 100 | 100 | 100 | 0,4 s | 0 ms | ≤ 0,001 | 0,4 s |

- HTML + CSS en línea: 25,8 KB comprimido. Script del recorrido: 4,8 KB comprimido (11,9 KB sin comprimir), módulo diferido.
- DOM de ~900 nodos: la medida invisible de la narración repite los diez textos para que la ventana no cambie de tamaño entre un paso y otro. Lighthouse lo marca como diagnóstico; no afecta el puntaje.
- El CLS se mide también con red lenta (`npm run recorrido`): con la red rápida de una prueba local el script llega antes del primer pintado y un salto real no aparece. Ver [aprendizajes.md](aprendizajes.md).

## Decisiones que sostienen el resultado

1. **Cero JS de framework**: Astro estático; los scripts son módulos pequeños por componente.
2. **CSS en línea** (`build.inlineStylesheets: 'always'`): sin petición que bloquee el primer pintado.
3. **Fuentes locales** con `font-display: swap`, subconjunto latino, solo 4+1 pesos; precarga de 400 y 600 (texto y titulares). Astro genera fuentes de respaldo con métricas ajustadas (CLS 0).
4. **Sin imágenes en la portada**: logo, wordmark y escena de fondo son SVG/HTML en línea. Sin fundidos a pantalla completa al cargar.
4b. **Scroll sin JS**: el telón y el traspaso de las barras usan CSS scroll-driven animations (hilo del compositor), no listeners de `scroll`.
5. **SVG en línea** para logo e íconos (sin peticiones). Las maquetas del portal son HTML/CSS, no capturas.
6. **Animaciones solo de `transform` y `opacity`**; se desactivan con `prefers-reduced-motion`.
7. La aparición al hacer scroll usa `IntersectionObserver`, no escucha el evento `scroll`.

## Cómo medir

```bash
npm run build
npm run preview                  # sirve dist/ en http://localhost:4321 con la CSP activa
npm run qa                       # capturas y chequeos (otra terminal)

# Lighthouse con el Chrome del sistema:
CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" \
  npx lighthouse@12 http://localhost:4321/ --chrome-flags="--headless=new" --output=html --output-path=qa/lighthouse/inicio.html
```

En producción, revisar también PageSpeed Insights (datos reales de Chrome UX Report cuando haya tráfico suficiente).

## Pendientes / ideas

- [ ] Medir en producción con PageSpeed Insights una vez publicado.
- [ ] Si se agregan fotos o capturas reales, usar `<Image>`/`<Picture>` de `astro:assets` (AVIF/WebP, `srcset`, `loading="lazy"` fuera del primer pantallazo).
- [ ] Si se agrega analítica, que sea liviana y sin cookies (ver [seguridad.md](seguridad.md) por la CSP).
