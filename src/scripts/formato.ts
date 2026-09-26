/**
 * Números con separador de miles "." siempre (convención boliviana).
 * No se usa Intl.NumberFormat('es-BO'): por la regla de agrupación mínima del español
 * escribe "1000" sin punto pero "12.000" con punto, y la calculadora quedaría inconsistente.
 */
export function miles(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const dolares = (n: number): string => `US$ ${miles(n)}`;

/** Costos de la calculadora del Portal BI: N licencias por persona contra una sola. */
export function calcularAhorro(personas: number, precioMensual: number) {
  const anualPorLicencia = precioMensual * 12;
  const conLicencias = personas * anualPorLicencia;
  const conPortal = anualPorLicencia;
  const ahorroAnual = Math.max(0, conLicencias - conPortal);
  return {
    conLicencias,
    conPortal,
    ahorroAnual,
    ahorroMensual: ahorroAnual / 12,
    // Piso visible: a 2.000 personas la proporción real es 0,05 % y una barra de ancho
    // cero se lee como un error, no como "casi nada".
    anchoPortal: Math.max(1.2, (conPortal / conLicencias) * 100),
  };
}
