// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITIO = 'https://datastudio.es';

export default defineConfig({
  site: SITIO,

  // Reglas de espacio en blanco de HTML (no JSX): evita que se "coman" los espacios
  // entre elementos en línea. Ver docs/aprendizajes.md.
  compressHTML: true,

  build: {
    format: 'directory',
    // CSS en línea: elimina la única petición que bloquea el primer pintado (~8 KB gzip).
    inlineStylesheets: 'always',
  },

  // Sin resaltado de código: Shiki usa estilos en línea incompatibles con la CSP.
  markdown: {
    syntaxHighlight: false,
  },

  integrations: [
    sitemap({
      // Las páginas legales viven en public/ (HTML estático preservado), así que
      // Astro no las conoce: se agregan a mano. /oauth/tiktok/ queda fuera a propósito.
      customPages: [`${SITIO}/privacidad/`, `${SITIO}/terminos/`],
    }),
  ],

  // Fuentes autoalojadas (sin Google Fonts ni CDN): builds deterministas y sin red.
  // Archivos woff2 subconjunto latino, licencia OFL (ver src/assets/fuentes/).
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Poppins',
      cssVariable: '--fuente-poppins',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          { src: ['./src/assets/fuentes/poppins-latin-400-normal.woff2'], weight: 400, style: 'normal' },
          { src: ['./src/assets/fuentes/poppins-latin-500-normal.woff2'], weight: 500, style: 'normal' },
          { src: ['./src/assets/fuentes/poppins-latin-600-normal.woff2'], weight: 600, style: 'normal' },
          { src: ['./src/assets/fuentes/poppins-latin-700-normal.woff2'], weight: 700, style: 'normal' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'DM Mono',
      cssVariable: '--fuente-dm-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          { src: ['./src/assets/fuentes/dm-mono-latin-500-normal.woff2'], weight: 500, style: 'normal' },
        ],
      },
    },
  ],

  // CSP por <meta>: GitHub Pages no permite cabeceras HTTP propias.
  // Astro agrega script-src/style-src con hashes; aquí van el resto de directivas.
  // frame-ancestors no funciona en <meta> (ver docs/seguridad.md).
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "manifest-src 'self'",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'upgrade-insecure-requests',
      ],
    },
  },
});
