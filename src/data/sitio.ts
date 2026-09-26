/**
 * Fuente única de verdad del sitio: datos de contacto, enlaces y textos que se
 * repiten en varios componentes. Si cambia un teléfono o un precio, se cambia aquí.
 * Todo dato comercial de este archivo está confirmado en docs/contenido.md.
 */

export const SITIO = {
  nombre: 'Data Studio',
  url: 'https://datastudio.es',
  lema: 'Innovación, analítica & marketing',
  titulo: 'Data Studio | Soluciones de datos y Power BI en Bolivia',
  descripcion:
    'Portal de Power BI para toda tu empresa con una sola licencia, métricas de redes con APIs oficiales, tiendas online y consultoría de datos. Santa Cruz, Bolivia.',
  idioma: 'es',
  locale: 'es_BO',
} as const;

export const CONTACTO = {
  telefono: '+59176018778',
  telefonoVisible: '+591 760 18778',
  whatsapp: '59176018778',
  email: 'datastudio.scz@gmail.com',
  ciudad: 'Santa Cruz de la Sierra',
  region: 'Santa Cruz',
  pais: 'Bolivia',
  codigoPais: 'BO',
  facebook: 'https://www.facebook.com/DataStudioscz',
} as const;

/** Enlace a WhatsApp con un mensaje precargado (formato oficial wa.me). */
export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/** Mensajes precargados por intención: permiten saber desde qué sección llega cada consulta. */
export const MENSAJES = {
  general: 'Hola Data Studio, quiero información sobre sus soluciones de datos.',
  portal: 'Hola Data Studio, quiero una demo de 30 minutos del Portal BI.',
  portalAhorro: 'Hola Data Studio, quiero ver el Portal BI con mis propios tableros de Power BI.',
  social: 'Hola Data Studio, quiero implementar Social Metrics BI en mi empresa.',
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

export const NAVEGACION = [
  { etiqueta: 'Portal BI', href: '/portal-bi/' },
  { etiqueta: 'Social Metrics', href: '/#social-metrics' },
  { etiqueta: 'E-commerce', href: '/#ecommerce' },
  { etiqueta: 'Consultoría', href: '/#consultoria' },
  { etiqueta: 'Preguntas', href: '/#preguntas' },
] as const;

export const LEGALES = [
  { etiqueta: 'Política de Privacidad', href: '/privacidad/' },
  { etiqueta: 'Condiciones del Servicio', href: '/terminos/' },
] as const;

/**
 * Las cuatro soluciones, en el orden de las cuatro barras del logo.
 * `altura` replica la proporción exacta de las barras del ícono (473/626/786/473 px).
 */
export const SOLUCIONES = [
  {
    id: 'consultoria',
    href: '/#consultoria',
    nombre: 'Consultoría de datos',
    resumen: 'Analítica, ingeniería e infraestructura de datos.',
    altura: 'b60',
  },
  {
    id: 'social-metrics',
    href: '/#social-metrics',
    nombre: 'Social Metrics BI',
    resumen: 'Meta, YouTube y TikTok en un solo tablero.',
    altura: 'b80',
  },
  {
    id: 'portal-bi',
    href: '/portal-bi/',
    nombre: 'Portal BI',
    resumen: 'Power BI para toda tu empresa, con una sola licencia.',
    altura: 'b100',
    destacado: 'Producto estrella',
  },
  {
    id: 'ecommerce',
    href: '/#ecommerce',
    nombre: 'Tienda e‑commerce',
    resumen: 'Código fuente propio y pago único.',
    altura: 'b60',
  },
] as const;
