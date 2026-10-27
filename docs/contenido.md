# Contenido y negocio

## Qué es Data Studio

Empresa de soluciones de datos con base en Santa Cruz de la Sierra, Bolivia, que trabaja **100 % en remoto con empresas de cualquier país**. Lema: *Innovación, analítica & marketing*. El sitio no menciona ciudad ni país (decisión del dueño, 27/09/2026; ver ADR-011).

| Línea | Qué vende | Llamado a la acción |
| --- | --- | --- |
| **Portal BI** (producto principal; antes "BI Platform Engineer") | Portal web con marca propia para abrir tableros de Power BI con usuario y contraseña, sin una licencia por persona. Chat con IA sobre el modelo. Se vende como **código + guía de implementación + curso grabado** | "Comprar código + guía" y demo de 30 min (WhatsApp); `/portal-bi/` |
| **Social Metrics BI** | Métricas de Facebook, Instagram, YouTube y TikTok vía APIs oficiales, con histórico, en Power BI (texto del dueño, 27/09/2026) | "Contratar servicio" (WhatsApp); `/social-metrics-bi/` |
| **Tienda e-commerce** | Código fuente de una tienda online + guía de implementación. Pago único, pedidos por WhatsApp | "Comprar código + guía" (WhatsApp); `/tienda-ecommerce/` |
| **Consultoría de datos** | Analítica, ingeniería de datos (ETL), infraestructura, Power BI a medida, integraciones con APIs, automatización de reportes | "Agenda un diagnóstico" (WhatsApp); `/consultoria/` |

## Contacto (fuente: `src/data/sitio.ts`)

- WhatsApp y teléfono: +591 7600 8398 (`wa.me/59176008398`)
- Correo: datastudio.scz@gmail.com
- Facebook: facebook.com/DataStudioscz
- Modalidad: implementación remota en cualquier país (no se publica ubicación)

## Fuentes del contenido

1. **Sitio anterior en Google Sites** (`sites.google.com/view/datastudioscz`): Portal Web BI, Social Metrics BI, tienda e-commerce, políticas ("PDP"). Reemplazado por este sitio.
2. **Texto del dueño sobre el Portal BI** (su Google Sites, entregado el 27/09/2026): cualidades (login, administrador con +3 módulos, menú de botones, apertura híbrida web y con licencia, "nunca más comprarás licencias para cada usuario", descarga de información sin restricción, marca personalizable, dueño del código), requisitos (cuenta de Google y 1 licencia de Power BI), entregables (códigos para despliegue, curso/video detallado, dos formas de desplegar, certificado de implementador) y el cierre "¿Qué esperas para tener tu propio portal? Es hora de innovar".
2b. **Página de producto del Portal BI** preparada en el repositorio de desarrollo del Portal BI (`producto.ejs`, entregada por el dueño el 25/09/2026). Es la fuente más actual del producto: maquetas fieles del portal y del chat con IA, requisitos (Power BI Pro, app de Azure, planilla de Google, servidor), instalación en 2 horas con curso y guía, límites y preguntas. Se adaptó a la marca y a tuteo en `/portal-bi/`. El archivo original se eliminó del repo tras usarlo.
3. **Páginas legales** del repo (`public/privacidad`, `public/terminos`, `public/oauth/tiktok`): describen las integraciones con YouTube, TikTok y Meta y su tratamiento de datos. La sección Social Metrics del home las resume.

## Datos que se muestran y su respaldo

| Dato | Respaldo |
| --- | --- |
| Power BI Pro cuesta US$ 14 por usuario al mes | Precio de lista de Microsoft desde abril de 2025 (constante `PRECIO_LICENCIA_USD`) |
| Con el portal basta una licencia (la de la cuenta que publica) | Página de producto del Portal BI |
| +1.000 personas, instalación en 2 horas, no se cobra implementación | Página de producto del Portal BI |
| Solo lectura, cuentas autorizadas, sin redistribución, revocable | Política de Privacidad y Condiciones del Servicio |
| Propuesta a Ribentek (el anuncio para socios): «A ti te cobramos US$ 60 al mes, por cliente», «Tu precio lo pones tú», «La IA la paga cada cliente, a su proveedor» | El trato que definió el dueño (17 y 18/10/2026, ADR-020). No se factura, y la página no lo dice. Es oculta pero no privada: no reenviarla a los clientes de Ribentek |
| Propuesta, la ráfaga: «Nosotros lo instalamos», «Lo dejamos funcionando», «Y lo mantenemos al día», «Tú vendes y cobras» | El trato: Data Studio se encarga de todo lo del Portal BI; Ribentek vende y cobra |
| Propuesta, el título: «Nuevo producto de Data Studio, listo para que Ribentek lo venda.» | Lo pidió el dueño con esas palabras (18/10/2026). «Listo»: el Portal BI está terminado y funcionando, y lo instalamos nosotros. Los nombres de las 17 páginas (`PAGINAS` en la página) dicen lo que muestra cada toma, sin cifras nuevas |
| Anuncio, toma 5: «Abre tu tablero. Completo, con sus filtros.» | El visor del portal muestra el reporte de Power BI entero, con sus filtros y su interacción. Reemplaza a «Power BI de verdad, sin cuenta de Power BI», que al dueño no le gustó (18/10/2026) |
| Anuncio, gancho: «Para 1.000 personas:», «1.000 licencias» tachado, «1 licencia.» y el sello «1 licencia de Power BI» (ADR-019) | La afirmación de la página de producto: con el portal basta una licencia, la de la cuenta que publica. Las 1.000 licencias tachadas son las que harían falta con una licencia Pro por persona. Es una cuenta de licencias, no un monto, y va tachada como lo que no se paga. El anuncio ya no muestra los US$ 14.000 |
| Anuncio, gancho: «¿Me pasas el reporte?», los adjuntos «ventas_FINAL_v3.xlsx», «cierre_marzo (2).pdf» y «tablero_final_FINAL.pbix», «RE: RE: RE: Reporte semanal», «¿Cuál es la versión buena?», «No me abre el tablero» y «Necesitas una licencia de Power BI Pro para ver este reporte» | Escena ilustrativa, no datos: lo que le llega a quien reparte reportes. El aviso resume el que muestra Power BI cuando alguien sin licencia abre un reporte compartido |
| Anuncio: "El código es tuyo", "Excel: tú decides quién descarga", "Lo instalas tú o lo instalamos", "Chat con IA", "En el celular", "Con tu marca" | Lo que el producto hace hoy (dos caminos de compra, opción "Ocultar Exportar datos" por asignación, chat al costado, marca blanca, móvil) |
| El lema «+ Y ahora tus datos HABLAN» con el chip «IA», «Conversa con tus datos» y «Pregúntale lo que el tablero no muestra» (portada, recorridos, anuncio, imagen para compartir; ADR-018) | El chat con IA del portal: se abre al costado del tablero, se le pregunta en español y responde consultando el modelo de Power BI, con la consulta a la vista. Si el dato no está en el modelo, lo dice |
| Anuncio, toma 6: «+ Y ahora tus datos HABLAN» con el chip «IA», «A un clic, al lado de tu tablero», «Pregúntale lo que el tablero no muestra»; los pasos «Leyendo la estructura del modelo», «Redactando la consulta», «Consultando Power BI» y las consultas «Consulta n de 3» | Lo que hace el chat hoy: se abre al costado del tablero y consulta el modelo, no lo que dibuja el reporte. Los rótulos son los del portal, en `views/modules/chat.ejs` (pasos y «Consulta n de total») |
| Datos de la toma 6: crecimiento de siete sucursales contra 2025 (de +18,4 % a −7,4 %, promedio +7,9 %); Aeropuerto, ticket promedio US$ 94 → 118 (+26 %; es +25,5 %, y la ficha decía +25 hasta que se hizo la cuenta) y tickets 7.388 → 6.969 (−6 %) | **Ficticios** y cuadrados entre sí y con el reporte: 7.388 × 94 y 6.969 × 118 dan +18,4 %, el crecimiento de Aeropuerto en el gráfico, y 822.300, sus ventas en el reporte. Las siete suman los US$ 5.216.100 del reporte (Parque Industrial, 177.000, es la que el visual de barras deja afuera), su crecimiento ponderado es el +7,9 % del indicador, y el ticket da los 108. Rotulados "Datos de ejemplo" (ADR-013) |
| Anuncio «Power BI primero» (ADR-021), apertura «licencia»: el aviso «Necesitas una licencia de Power BI Pro / para ver este reporte» con «Actualizar a Pro» y «Cancelar», el reporte borroso detrás y la gente que choca contra él (Ventas, Operaciones, Gerencia y «+997») | Escena ilustrativa: resume el aviso que muestra Power BI a quien abre un reporte compartido sin licencia, como el gancho de ADR-019. 3 personas + 997 = las 1.000 de la cuenta del anuncio |
| Apertura «ia» (revisada el 26/10): «Potencia tu Power BI con IA», la lengüeta «Chat IA», «¿Qué sucursal creció más?», los pasos «Leyendo la estructura del modelo», «Redactando la consulta» y «Consultando Power BI», y «Aeropuerto lidera: +18,4 %, más del doble del promedio.» | El chat del portal: se abre al costado del tablero con su lengüeta y consulta el modelo (como el lema, ADR-018). Los pasos son los rótulos de `views/modules/chat.ejs`. Datos de ejemplo de la toma 6 del de 55 s: +18,4 % contra un promedio de +7,9 % es 2,3 veces |
| Ráfaga de «Power BI primero»: «El código es tuyo.» y «Nunca más una licencia por persona.» | Las mismas frases del de 55 s: el camino de compra del código y la promesa del producto. Sin precios: el dueño los sacó del anuncio (26/10/2026) |
| Datos de las maquetas (tienda de cafetería, ranking de publicaciones, ventas de marzo, chat del portal, recorrido animado: usuaria «mariana.s», sucursales y ventas de septiembre) | **Ficticios**, rotulados "Datos de ejemplo" en cada maqueta (ADR-013) |
| Recorrido del administrador: alta con usuario o correo, sin cuenta de Microsoft ni licencia; el constructor que recorre tabla, columna y valor y arma el filtro; el enlace que el panel revisa antes de guardar; las opciones del tablero (paneles, páginas que no ve, pantalla completa, imprimir, sin «Exportar datos»); el chat por tablero, al costado o en otra pestaña, con su aviso; la marca con vista previa y «menos de un minuto»; los registros de acceso | Lo que hace el panel hoy, leído de sus vistas: `credenciales.ejs`, `powerbi.ejs` (constructor de filtros), `licencia.ejs` + `_opciones-tablero.ejs`, `configuracion.ejs` («Se aplicarán en menos de 60 segundos») y `registros.ejs` |
| Datos del recorrido del administrador: 1.000 usuarios, 2.415 asignaciones, 18.426 accesos en 30 días, la persona «carlos.r», el filtro de la sucursal Norte, la marca «ACME Analytics» | **Ficticios** y cuadrados entre sí (los treinta días suman los accesos del período; los tableros más vistos suman los accesos a tableros), rotulados "Datos de ejemplo" (ADR-013) |

## Pendientes de confirmar con el dueño

- [ ] **Logos de clientes y testimonios** (el sitio anterior decía "Grandes empresas ya confían en nuestra solución" con logos que no se pudieron recuperar). Se necesita el archivo de cada logo y **permiso** del cliente. No se inventan.
- [ ] **Portal de prueba** en Google Apps Script (usuario `data_studio`): ¿sigue representando al producto actual? Hoy no se enlaza; la página ofrece demo guiada de 30 min.
- [ ] Cifras del Portal BI tomadas de la página de producto: "+1.000 personas", "2 horas", "no cobramos implementación". El sitio anterior decía "+100 usuarios" y ofrecía contratar la implementación. Hoy se dicen una vez (sección de instalación y pregunta frecuente).
- [x] ¿Existe un **servicio de implementación del Portal BI**? **Sí** (dueño, 27/09/2026): "Puedes contratar nuestra solución o implementa tú mismo esta solución en tu empresa o proyecto". El Portal BI se vende por dos caminos. Precio y alcance del servicio: sin publicar.
- [ ] Nombre exacto del certificado que se entrega con la compra (el sitio anterior decía "Certificado Implementador BI Platform Engineer"; el producto hoy se llama Portal BI).
- [ ] "Dos formas de desplegar": ¿cuáles son (p. ej. servidor propio o nube)? Hoy se dice sin detallar.
- [ ] Tienda de ejemplo (cafetería, productos y precios en US$): es ilustrativa. Si hay una tienda real hecha con la plantilla y permiso, conviene mostrarla.
- [ ] Pasos del proceso de consultoría (Diagnóstico → Propuesta → Implementación → Acompañamiento): redactados como proceso estándar; validar.
- [ ] Precios (tienda, portal, servicios): no se publican hasta tenerlos confirmados. **Los del Portal BI ya lo están** (dueño, 23/10/2026): US$ 400 el código y la guía grabada, pago único, y quien compra puede usarlo en las empresas que quiera, modificarlo y revenderlo; US$ 59 al mes el plan en que Data Studio lo despliega y lo mantiene. No se publican: el dueño los sacó del anuncio «Power BI primero» (26/10/2026) y se dan en el chat. Falta alinear en `/portal-bi/` «Contrata la implementación» con el plan mensual. Pendiente también si el plan mensual tiene permanencia mínima.
- [ ] ¿Tuteo o voseo? Se eligió tuteo (como el sitio anterior). Las páginas legales usan voseo en partes; unificar cuando se rediseñen.
- [ ] Nombre de la app en las consolas de Google, TikTok y Meta ("DataStudio" o "Data Studio"): conviene que coincida con el del sitio.
