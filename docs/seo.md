# SEO

## Por página

| Página | `<title>` | Descripción | Imagen OG |
| --- | --- | --- | --- |
| `/` | Data Studio \| Soluciones de datos y Power BI en Bolivia | Portal de Power BI para toda tu empresa con una sola licencia, métricas de redes con APIs oficiales, tiendas online y consultoría de datos. Santa Cruz, Bolivia. | `/og/inicio.png` |
| `/portal-bi/` | Portal BI \| Power BI para toda la empresa con una sola licencia · Data Studio | Tus tableros de Power BI, asignados por persona y por empresa, en un portal con tu marca… | `/og/portal-bi.png` |

Todo se define desde `Base.astro` (props `titulo`, `descripcion`, `imagen`). Valores por defecto en `src/data/sitio.ts`.

## Implementado

- `lang="es"`, canónica absoluta por página, `robots: index, follow, max-image-preview:large`.
- Open Graph y Twitter Card (`summary_large_image`) con imágenes de 1200×630 generadas por `npm run recursos`.
- **JSON-LD** (`@graph`): `Organization` (contacto, dirección de Santa Cruz, Facebook), `WebSite`, `FAQPage` en `/` y `/portal-bi/`, `BreadcrumbList` en `/portal-bi/`.
- `sitemap-index.xml` (integración `@astrojs/sitemap`) con `/`, `/portal-bi/`, `/privacidad/` y `/terminos/`. Excluye la 404 y `/oauth/tiktok/` (que además tiene `noindex`).
- `robots.txt` permite todo y apunta al sitemap.
- Encabezados jerárquicos: un solo `h1` por página, `h2` por sección.
- Enlaces internos descriptivos (sin "clic aquí"); el Portal BI enlaza desde el menú, el hero, su sección y el pie.

## Palabras clave objetivo (orientativas)

- Portal Power BI sin licencias por usuario · Power BI Embedded Bolivia · compartir tableros Power BI sin licencia
- Métricas de redes sociales en Power BI · dashboard Facebook Instagram YouTube TikTok
- Consultoría de datos Santa Cruz Bolivia · ingeniería de datos Bolivia · Power BI Bolivia
- Tienda online código fuente pago único

## Pendientes

- [ ] Enviar el sitemap en Google Search Console (la propiedad ya está verificada con `google5af846498ca551c6.html`).
- [ ] Crear o actualizar el Perfil de Empresa de Google (Santa Cruz de la Sierra) con el enlace a datastudio.es.
- [ ] Actualizar el enlace del sitio en Facebook (DataStudioscz) e Instagram.
- [ ] Redirigir o dar de baja el Google Sites anterior para no competir consigo mismo (Google Sites no permite 301: poner un aviso con enlace a datastudio.es).
- [ ] Páginas dedicadas para Social Metrics BI, Tienda e-commerce y Consultoría (hoy son secciones del home) cuando haya contenido propio.
- [ ] Testimonios reales → posibilidad de `Review` en JSON-LD (solo con reseñas verificables).
