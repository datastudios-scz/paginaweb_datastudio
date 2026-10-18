/**
 * Las propuestas a socios y clientes. La página oculta /propuestas/ las lista, de la más nueva a
 * la más vieja, cada una con su botón.
 *
 * Para sumar una: una entrada más en PROPUESTAS. Según dónde viva:
 *  - tipo 'pagina': una página del sitio en src/pages/propuestas/<nombre>.astro, con
 *    href '/propuestas/<nombre>/'. Queda oculta sola, porque /propuestas/ ya lo está.
 *  - tipo 'pdf': el archivo en public/propuestas/<nombre>.pdf, con href '/propuestas/<nombre>.pdf'.
 *    Pesar poco: se publica con el sitio en cada despliegue.
 *  - tipo 'presentacion' o 'enlace': la dirección externa (Google Slides, Canva, etc.). Abre en
 *    otra pestaña.
 * `fecha` es AAAA-MM-DD.
 *
 * Oculta no es privada: quien tiene la dirección la abre. Nada confidencial va acá.
 */

export type TipoPropuesta = 'pagina' | 'pdf' | 'presentacion' | 'enlace';

export interface Propuesta {
  /** Identificador estable (se usa como ancla: /propuestas/#nombre). */
  id: string;
  titulo: string;
  /** Para quién es: el socio o el cliente. */
  para: string;
  /** Fecha de la propuesta, AAAA-MM-DD. */
  fecha: string;
  /** Una línea con lo que propone. */
  descripcion?: string;
  tipo: TipoPropuesta;
  href: string;
}

export const PROPUESTAS: Propuesta[] = [
  {
    id: 'portal-bi-ribentek',
    titulo: 'Portal BI para Ribentek',
    para: 'Ribentek',
    fecha: '2026-10-17',
    descripcion:
      'Que Ribentek revenda el Portal BI a sus clientes: el ahorro de licencias, los tableros en un solo lugar, la IA al costado del tablero, cómo trabajamos juntos y su margen. Un recorrido en 12 láminas.',
    tipo: 'pagina',
    href: '/propuestas/portal-bi-ribentek/',
  },
];
