/**
 * Los anuncios para redes. La página oculta /anuncios/ los lista, del más nuevo al más viejo.
 *
 * Para sumar uno: una entrada más en ANUNCIOS. `pagina` es donde se ve y se graba (por ejemplo
 * /anuncios/<nombre>/ o la del producto); `descargas`, los MP4 listos, si ya existen.
 * `fecha` es la de la última versión: cuando el anuncio cambia, se actualiza acá.
 *
 * Los MP4 no viven en el repositorio: los graba una Action y quedan en un release de GitHub
 * (ADR-016). Los botones enlazan ahí, y el clic baja el archivo.
 */

/** Los cuatro formatos para redes, en el orden en que se ofrecen. */
export const FORMATOS = [
  { id: '9x16', nombre: '9:16', uso: 'Reels, TikTok, historias y Shorts', px: '1080 × 1920' },
  { id: '4x5', nombre: '4:5', uso: 'Feed de Instagram y Facebook', px: '1080 × 1350' },
  { id: '1x1', nombre: '1:1', uso: 'Feed cuadrado', px: '1080 × 1080' },
  { id: '16x9', nombre: '16:9', uso: 'YouTube, LinkedIn y presentaciones', px: '1920 × 1080' },
] as const;

export type Formato = (typeof FORMATOS)[number]['id'];

/** El release donde la Action «Grabar el anuncio» deja los videos del Portal BI. */
const RELEASE_PORTAL_BI = 'https://github.com/datastudios-scz/paginaweb_datastudio/releases/download/anuncio-portal-bi';
export const videoPortalBi = (f: string) => `${RELEASE_PORTAL_BI}/portal-bi-anuncio-${f}.mp4`;
export const portadaPortalBi = (f: string) => `${RELEASE_PORTAL_BI}/portal-bi-portada-${f}.jpg`;

export interface Anuncio {
  /** Identificador estable (se usa como ancla: /anuncios/#portal-bi). */
  id: string;
  /** El producto o la campaña, como rótulo corto. */
  producto: string;
  titulo: string;
  descripcion: string;
  /** Fecha de la última versión, AAAA-MM-DD. */
  fecha: string;
  duracion: string;
  /** Dónde se ve, se graba en pantalla completa y se elige el formato. */
  pagina: string;
  /** Los MP4 por formato, si ya están grabados. */
  descargas?: { formato: string; uso: string; px: string; href: string }[];
}

export const ANUNCIOS: Anuncio[] = [
  {
    id: 'portal-bi',
    producto: 'Portal BI',
    titulo: 'Power BI para toda tu empresa, con una sola licencia',
    descripcion:
      'Arranca con «¿Me pasas el reporte?» y los reportes regados que el portal se traga: todos los tableros en un solo lugar, una licencia para mil personas, tu marca, la IA al costado del tablero y el cierre con el WhatsApp.',
    fecha: '2026-10-17',
    duracion: '55 s',
    pagina: '/portal-bi/anuncio/',
    descargas: FORMATOS.map((f) => ({ formato: f.nombre, uso: f.uso, px: f.px, href: videoPortalBi(f.id) })),
  },
];
