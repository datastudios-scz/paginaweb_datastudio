# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Equipos de gerencia, marketing y BI de empresas de cualquier país que necesitan ver y usar sus datos: compartir tableros de Power BI con mucha gente, medir sus redes sociales, vender en línea o poner orden en sus datos. Llegan buscando una solución concreta y deciden si escribir o pedir una demo. (Confirmado por el dueño el 25/09/2026.)

## Product Purpose

Data Studio vende soluciones basadas en datos y el sitio existe para que cada visitante encuentre la suya y dé el siguiente paso (WhatsApp o demo). El inicio presenta la marca y distribuye hacia una subpágina por producto; cada subpágina explica y lleva a la acción.

## Positioning

- **Portal BI**: Power BI para toda la empresa con una sola licencia (la de la cuenta que publica); portal con marca propia, chat con IA sobre el modelo. Se vende como **compra de código + guía de implementación** (y curso grabado).
- **Social Metrics BI**: métricas de redes sociales desde las APIs oficiales (Meta; también YouTube y TikTok según la política de privacidad vigente) en un tablero de Power BI, con histórico y actualizaciones programadas. Se contrata como servicio.
- **Tienda e-commerce**: código fuente + guía de implementación, pago único, pedidos por WhatsApp.
- **Consultoría de datos**: analítica, ingeniería de datos, infraestructura, Power BI a medida, integraciones con APIs, automatización de reportes.

## Operating Context

Todo se vende e implementa **de forma remota**. El contacto comercial es por WhatsApp (+591 760 18778) y correo (datastudio.scz@gmail.com). El sitio no debe presentar a la empresa como local de Santa Cruz o Bolivia: el público es internacional.

## Capabilities and Constraints

- Sitio estático Astro 7 en GitHub Pages, CSP estricta (sin estilos en línea ni recursos externos).
- Rutas registradas en plataformas que no se pueden romper: `/privacidad/`, `/terminos/`, `/oauth/tiktok/`, archivo de Google.
- Precios: no confirmados, no se publican.

## Brand Commitments

- Nombre: Data Studio. Lema: "Innovación, analítica & marketing".
- Colores de marca: #001720, #00394e, #037a70, #ced9bd, #ffffff.
- Tipografías: Costa Rica solo para el wordmark "DATA STUDIO" (vector); Poppins para el resto.
- Logo: monitor con cuatro barras (originales en `marca y logos/`).
- Voz: español con tuteo, directo y concreto.

## Evidence on Hand

- Logos oficiales (PNG) y logo vectorial en `src/components/Logo.astro`.
- Portal de prueba en Google Apps Script (vigencia sin confirmar).
- Maquetas fieles del Portal BI y su chat con IA (de la página de producto del repo del Portal BI).
- **No hay** testimonios, logos de clientes, casos ni precios confirmados: no se inventan.

## Product Principles

1. El inicio presenta y distribuye; la explicación y los botones de WhatsApp viven en cada subpágina.
2. Mostrar el producto funcionando (maquetas fieles) antes que describirlo.
3. Solo afirmaciones respaldadas; los datos de ejemplo se rotulan como ejemplo.
4. Internacional y remoto: nada de localismos en la presentación.
