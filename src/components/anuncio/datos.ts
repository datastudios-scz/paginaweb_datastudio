/* Lo que comparten las tomas del anuncio (Anuncio.astro y AnuncioPortal.astro): las tarjetas
   de tableros del portal, con datos de ejemplo (ADR-013), y los trazos de sus íconos. */

/* Las barras amarillas de Power BI (las de las tarjetas del portal) */
export const PBI =
  'M27.6 0h8.3a2.7 2.7 0 0 1 2.7 2.7v36.1a2.7 2.7 0 0 1-2.7 2.7h-8.3a2.7 2.7 0 0 1-2.7-2.7V2.7A2.7 2.7 0 0 1 27.6 0Zm-12.4 11.5h8.3a2.7 2.7 0 0 1 2.7 2.7v24.6a2.7 2.7 0 0 1-2.7 2.7h-8.3a2.7 2.7 0 0 1-2.7-2.7V14.2a2.7 2.7 0 0 1 2.7-2.7ZM2.7 23h8.3a2.7 2.7 0 0 1 2.7 2.7v13.1a2.7 2.7 0 0 1-2.7 2.7H2.7A2.7 2.7 0 0 1 0 38.8V25.7A2.7 2.7 0 0 1 2.7 23Z';

/* La varita del chip «IA» de las tarjetas */
export const VARITA =
  'M7.5 5.6 10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a1 1 0 0 0-1.41 0L1.29 18.96a1 1 0 0 0 0 1.41l2.34 2.34a1 1 0 0 0 1.41 0L16.7 11.05a1 1 0 0 0 0-1.41zm-1.03 5.49-2.12-2.12 2.44-2.44 2.12 2.12z';

export const TARJETAS = [
  { titulo: 'Ventas por sucursal', ia: true },
  { titulo: 'Cumplimiento de metas', ia: true },
  { titulo: 'Cartera y cobranzas', ia: false },
  { titulo: 'Margen por línea', ia: false },
  { titulo: 'Pedidos en curso', ia: false },
  { titulo: 'Indicadores públicos', ia: false },
];
