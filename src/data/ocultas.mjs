/**
 * Las páginas ocultas del sitio: no están en el menú, no se enlazan desde ninguna página
 * pública, no se indexan (Base con indexar={false}) y quedan fuera del sitemap.
 * Las conoce solo quien tiene la dirección.
 *
 * Es JavaScript plano (no TypeScript) porque lo leen dos lugares que no pasan por Astro:
 * astro.config.mjs (el filtro del sitemap) y scripts/qa.mjs (que comprueba que sigan ocultas).
 *
 * No se nombran en robots.txt: un Disallow las anunciaría, porque ese archivo es público.
 * Oculta no es privada: quien tiene la dirección la abre. Nada confidencial va acá.
 */
export const PAGINAS_OCULTAS = [
  '/anuncios/', // los anuncios para redes, ordenados (src/data/anuncios.ts)
  '/propuestas/', // las propuestas a socios y clientes (src/data/propuestas.ts)
  '/portal-bi/anuncio/', // la herramienta del anuncio del Portal BI (ADR-016)
];

/** ¿Esta dirección (absoluta o relativa) cae dentro de una página oculta? */
export const esOculta = (direccion) => {
  const ruta = new URL(direccion, 'https://datastudio.es').pathname;
  return PAGINAS_OCULTAS.some((p) => ruta === p || ruta.startsWith(p));
};
