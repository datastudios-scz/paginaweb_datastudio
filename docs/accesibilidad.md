# Accesibilidad (objetivo: WCAG 2.2 AA)

Lighthouse: 100 en `/` y `/portal-bi/` (25/09/2026). Lighthouse no lo detecta todo: revisar también con teclado y lector de pantalla.

## Aplicado

- **Contraste**: todas las combinaciones de texto verificadas (tabla en [marca.md](marca.md)). Cada sección declara su tema y hereda colores seguros.
- **Teclado**: enlace "Saltar al contenido", orden de foco natural, `:focus-visible` con anillo de 2 px (≥ 3:1) que aparece al instante.
- **Menú móvil**: botón con `aria-expanded` y `aria-controls`; se cierra con Escape (devuelve el foco al botón), al elegir un enlace y al pasar a escritorio.
- **Estructura**: landmarks (`header`, `nav` con `aria-label`, `main`, `footer`), un `h1` por página, secciones con `aria-labelledby`.
- **Preguntas frecuentes**: `<details>/<summary>` nativo (teclado y lector sin JS).
- **Calculadora**: `<label for>` en el control deslizante; el ahorro se anuncia con `aria-live="polite"`.
- **Maquetas del Portal BI**: son ilustraciones. Van en `<figure>` con `<figcaption>` solo para lectores y el cuerpo con `aria-hidden="true"` (un lector no recorre un menú falso).
- **Íconos**: decorativos (`aria-hidden`) cuando hay texto al lado; los enlaces que abren pestaña nueva lo anuncian donde el texto no lo dice.
- **Movimiento**: con `prefers-reduced-motion: reduce` no hay animaciones (barras, aparición, cursor del chat); todo se muestra en su estado final.
- **Sin JS**: el contenido completo se ve igual (la aparición al hacer scroll solo se activa con la clase `.js`).
- **Objetivos táctiles**: botones ≥ 48 px de alto; enlaces del menú y del pie ≥ 44 px.
- **Texto de botones sin cortes**: `white-space: nowrap` y botones a ancho completo en móvil (probado a 320 px).

## Verificación manual recomendada

1. Recorrer cada página solo con Tab / Shift+Tab / Enter / Escape.
2. NVDA (Windows) o VoiceOver (iOS): navegar por encabezados y landmarks.
3. Zoom del navegador al 200 %: sin pérdida de contenido ni scroll horizontal.
4. Activar "reducir movimiento" en el sistema y recargar.
