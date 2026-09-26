# Contenido y negocio

## Qué es Data Studio

Empresa de soluciones de datos de **Santa Cruz de la Sierra, Bolivia**. Lema: *Innovación, analítica & marketing*.

| Línea | Qué vende | Llamado a la acción |
| --- | --- | --- |
| **Portal BI** (producto estrella; antes "BI Platform Engineer") | Portal web con marca propia para abrir tableros de Power BI con usuario y contraseña, sin una licencia por persona. Chat con IA sobre el modelo | Demo de 30 min por WhatsApp; página `/portal-bi/` |
| **Social Metrics BI** | Métricas de Facebook, Instagram, YouTube y TikTok vía APIs oficiales, con histórico, en Power BI | "Implementar Social Metrics BI" (WhatsApp) |
| **Tienda e-commerce** | Código fuente de una tienda online + guía de implementación. Pago único, pedidos por WhatsApp | "Comprar código + guía" (WhatsApp) |
| **Consultoría de datos** | Analítica, ingeniería de datos (ETL), infraestructura, Power BI a medida, integraciones con APIs, automatización de reportes | "Agenda un diagnóstico" (WhatsApp) |

## Contacto (fuente: `src/data/sitio.ts`)

- WhatsApp y teléfono: +591 760 18778 (`wa.me/59176018778`)
- Correo: datastudio.scz@gmail.com
- Facebook: facebook.com/DataStudioscz
- Ubicación: Santa Cruz de la Sierra, Bolivia

## Fuentes del contenido

1. **Sitio anterior en Google Sites** (`sites.google.com/view/datastudioscz`): Portal Web BI, Social Metrics BI, tienda e-commerce, políticas ("PDP"). Reemplazado por este sitio.
2. **Página de producto del Portal BI** preparada en el repositorio de desarrollo del Portal BI (`producto.ejs`, entregada por el dueño el 25/09/2026). Es la fuente más actual del producto: maquetas fieles del portal y del chat con IA, requisitos (Power BI Pro, app de Azure, planilla de Google, servidor), instalación en 2 horas con curso y guía, límites y preguntas. Se adaptó a la marca y a tuteo en `/portal-bi/`. El archivo original se eliminó del repo tras usarlo.
3. **Páginas legales** del repo (`public/privacidad`, `public/terminos`, `public/oauth/tiktok`): describen las integraciones con YouTube, TikTok y Meta y su tratamiento de datos. La sección Social Metrics del home las resume.

## Datos que se muestran y su respaldo

| Dato | Respaldo |
| --- | --- |
| Power BI Pro cuesta US$ 14 por usuario al mes | Precio de lista de Microsoft desde abril de 2025 (constante `PRECIO_LICENCIA_USD`) |
| Con el portal basta una licencia (la de la cuenta que publica) | Página de producto del Portal BI |
| +1.000 personas, instalación en 2 horas, no se cobra implementación | Página de producto del Portal BI |
| Solo lectura, cuentas autorizadas, sin redistribución, revocable | Política de Privacidad y Condiciones del Servicio |

## Pendientes de confirmar con el dueño

- [ ] **Logos de clientes y testimonios** (el sitio anterior decía "Grandes empresas ya confían en nuestra solución" con logos que no se pudieron recuperar). Se necesita el archivo de cada logo y **permiso** del cliente. No se inventan.
- [ ] **Portal de prueba** en Google Apps Script (usuario `data_studio`): ¿sigue representando al producto actual? Hoy no se enlaza; la página ofrece demo guiada de 30 min.
- [ ] Cifras del Portal BI tomadas de la página de producto: "+1.000 personas", "2 horas", "no cobramos implementación". El sitio anterior decía "+100 usuarios" y ofrecía contratar la implementación.
- [ ] Pasos del proceso de consultoría (Diagnóstico → Propuesta → Implementación → Acompañamiento): redactados como proceso estándar; validar.
- [ ] Precios (tienda, portal, servicios): no se publican hasta tenerlos confirmados.
- [ ] ¿Tuteo o voseo? Se eligió tuteo (como el sitio anterior). Las páginas legales usan voseo en partes; unificar cuando se rediseñen.
- [ ] Nombre de la app en las consolas de Google, TikTok y Meta ("DataStudio" o "Data Studio"): conviene que coincida con el del sitio.
