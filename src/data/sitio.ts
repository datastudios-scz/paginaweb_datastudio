/**
 * Fuente única de verdad del sitio: datos de contacto, enlaces y textos que se
 * repiten en varios componentes. Si cambia un teléfono o un precio, se cambia aquí.
 * Todo dato comercial de este archivo está confirmado en docs/contenido.md.
 *
 * Público internacional y trabajo 100 % remoto: el sitio no se presenta como local
 * (sin ciudad ni país en textos visibles). Ver PRODUCT.md.
 */

export const SITIO = {
  nombre: 'Data Studio',
  url: 'https://datastudio.es',
  lema: 'Innovación, analítica & marketing',
  titulo: 'Data Studio | Soluciones de datos, Power BI y analítica de redes',
  descripcion:
    'Power BI para toda tu empresa con una sola licencia, métricas de redes con APIs oficiales, tiendas con código propio y consultoría de datos. 100 % remoto.',
  idioma: 'es',
  locale: 'es_LA',
} as const;

export const CONTACTO = {
  telefono: '+59176008398',
  telefonoVisible: '+591 7600 8398',
  whatsapp: '59176008398',
  email: 'datastudio.scz@gmail.com',
  facebook: 'https://www.facebook.com/DataStudioscz',
  modalidad: 'Implementación remota en cualquier país',
} as const;

/** Enlace a WhatsApp con un mensaje precargado (formato oficial wa.me). */
export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/** Mensajes precargados por intención: permiten saber desde qué página llega cada consulta. */
export const MENSAJES = {
  general: 'Hola Data Studio, quiero información sobre sus soluciones de datos.',
  portal: 'Hola Data Studio, quiero una demo de 30 minutos del Portal BI.',
  portalCompra: 'Hola Data Studio, quiero comprar el código del Portal BI y la guía de implementación.',
  portalAhorro: 'Hola Data Studio, quiero ver el Portal BI con mis propios tableros de Power BI.',
  portalImplementacion: 'Hola Data Studio, quiero contratar la implementación del Portal BI en mi empresa.',
  social: 'Hola Data Studio, quiero contratar Social Metrics BI para mi empresa.',
  ecommerce: 'Hola Data Studio, quiero comprar el código de la tienda e-commerce y la guía de implementación.',
  consultoria: 'Hola Data Studio, quiero agendar un diagnóstico de datos para mi empresa.',
} as const;

/**
 * Portal de prueba del sitio anterior (Google Apps Script) con credenciales públicas.
 * Hoy NO se enlaza: la página del Portal BI ofrece una demo guiada de 30 minutos.
 * Pendiente de confirmar si esta versión sigue representando al producto (docs/contenido.md).
 */
export const DEMO_PORTAL = {
  url: 'https://script.google.com/macros/s/AKfycbxBc8K2hbeIkotRRVKdpfo0mxa2vVYyu22U3cylmsfcz1UI1OdioMdKbyc-iWMt7q6u9g/exec',
  usuario: 'data_studio',
  contrasena: 'data_studio',
} as const;

/**
 * Referencia de la calculadora de ahorro: precio de lista de Power BI Pro
 * (US$14 por usuario al mes desde abril de 2025). Revisar si Microsoft lo cambia.
 */
export const PRECIO_LICENCIA_USD = 14;

/**
 * Las cuatro soluciones, en el orden de las cuatro barras del logo.
 * `altura` replica la proporción exacta de las barras del ícono (473/626/786/473 px).
 * `href` apunta a la subpágina de cada producto: el inicio solo distribuye.
 */
export const SOLUCIONES = [
  {
    id: 'consultoria',
    href: '/consultoria/',
    nombre: 'Consultoría de datos',
    corto: 'Consultoría',
    resumen: 'Tus datos en orden, tus reportes al día.',
    menu: 'Integramos tus fuentes y automatizamos tus reportes.',
    icono: 'analitica',
    altura: 'b60',
  },
  {
    id: 'social-metrics',
    href: '/social-metrics-bi/',
    nombre: 'Social Metrics BI',
    corto: 'Social Metrics',
    resumen: 'Todas tus redes en un solo tablero, sin copiar números.',
    menu: 'Facebook, Instagram, YouTube y TikTok en un tablero que se actualiza solo.',
    icono: 'redes',
    altura: 'b80',
  },
  {
    id: 'portal-bi',
    href: '/portal-bi/',
    nombre: 'Portal BI',
    corto: 'Portal BI',
    resumen: 'Power BI para toda tu empresa, sin una licencia por persona.',
    menu: 'Tus tableros para toda la empresa. Nunca más una licencia por persona.',
    icono: 'portal',
    altura: 'b100',
    /** La barra más alta del logo, en verde: el producto principal, sin rótulo que lo grite. */
    destacado: true,
  },
  {
    id: 'ecommerce',
    href: '/tienda-ecommerce/',
    nombre: 'Tienda e‑commerce',
    corto: 'E‑commerce',
    resumen: 'Tu tienda con código propio, sin mensualidades.',
    menu: 'Tu tienda online con código propio: pagas una vez y es tuya.',
    icono: 'tienda',
    altura: 'b60',
  },
] as const;

/**
 * Menú principal y pie: los productos, con el principal primero. El gráfico del inicio es el
 * único lugar con el orden del logo, porque ahí las alturas de las barras son el mensaje.
 * `etiqueta` (corta) solo para la barra de escritorio; en el resto va `nombre` completo.
 */
export const NAVEGACION = ['portal-bi', 'social-metrics', 'ecommerce', 'consultoria'].map((id) => {
  const s = SOLUCIONES.find((x) => x.id === id)!;
  return { id: s.id, etiqueta: s.corto, nombre: s.nombre, href: s.href, descripcion: s.menu, icono: s.icono };
});

export const LEGALES = [
  { etiqueta: 'Política de Privacidad', href: '/privacidad/' },
  { etiqueta: 'Condiciones del Servicio', href: '/terminos/' },
] as const;
