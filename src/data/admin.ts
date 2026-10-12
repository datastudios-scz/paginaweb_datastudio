/**
 * El panel de administración del Portal BI: su menú, en el orden y con los nombres reales
 * (views/admin-layout.ejs), y un ícono por módulo. Lo usan la maqueta del panel en /portal-bi/
 * (MaquetaAdmin.astro) y el recorrido del administrador (RecorridoAdmin.astro).
 */

export interface ItemMenuAdmin {
  /** El rótulo de una sección del menú (va en mayúsculas por CSS). */
  seccion?: string;
  /** Un módulo: su clave, su nombre y su ícono (24 × 24). */
  clave?: string;
  nombre?: string;
  ico?: string;
}

export const MENU_ADMIN: ItemMenuAdmin[] = [
  { clave: 'tablero', nombre: 'Dashboard', ico: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zm3.9 3.1 1 .9-3.4 3.9a1.9 1.9 0 1 1-1-1z' },
  { seccion: 'Usuarios' },
  { clave: 'usuarios', nombre: 'Gestión de Usuarios', ico: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7.5-1a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6zM2 19c0-3.3 3.1-6 7-6s7 2.7 7 6v1H2zm15.5 1v-1c0-1.9-.7-3.6-1.9-4.9 3.7-.3 6.4 1.9 6.4 4.9v1z' },
  { seccion: 'Asignaciones' },
  { clave: 'lectura', nombre: 'Tableros Solo Lectura', ico: 'M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z' },
  { clave: 'licencia', nombre: 'Tableros con Licencia AAD', ico: 'M6 3h12l4 6-10 12L2 9zm1.2 2L5 8.5h4L10 5zM14 5l1 3.5h4L16.8 5z' },
  { clave: 'modelos', nombre: 'Modelos Semánticos', ico: 'M12 2 3 6.5v11L12 22l9-4.5v-11zm0 2.3 6.4 3.2L12 10.7 5.6 7.5zM5 9.1l6 3v7.4l-6-3zm8 10.4v-7.4l6-3v7.4z' },
  { clave: 'herramientas', nombre: 'Herramientas', ico: 'M9 3h6a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v4H2V9a2 2 0 0 1 2-2h3V5a2 2 0 0 1 2-2zm0 4h6V5H9zM2 14.5h8v1.5h4v-1.5h8V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z' },
  { seccion: 'Power BI' },
  { clave: 'workspaces', nombre: 'Workspaces / Tableros', ico: 'M3 3h2.5v15.5H21V21H3zm5 9h2.5v4.5H8zm4.5-5H15v9.5h-2.5zm4.5 3h2.5v6.5H17z' },
  { clave: 'gobierno', nombre: 'Gobierno de Datos', ico: 'M9.5 2h5v5h-1.2v3H19v4h1.5v5h-5v-5H17v-2H7v2h1.5v5h-5v-5H5v-4h5.8V7H9.5z' },
  { seccion: 'Auditoría' },
  { clave: 'registros', nombre: 'Registros', ico: 'M9 2h6v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3zm0 8v2h6v-2zm0 4v2h6v-2z' },
  { seccion: 'Sistema' },
  { clave: 'conexiones', nombre: 'Conexiones', ico: 'M8 2h2.5v5h3V2H16v5h2v4a6 6 0 0 1-4.8 5.9V22h-2.4v-5.1A6 6 0 0 1 6 11V7h2z' },
  { clave: 'ia', nombre: 'Proveedores de IA', ico: 'M3 19.6 14.2 8.4l1.4 1.4L4.4 21zM15.6 7l1.4-1.4 1.4 1.4-1.4 1.4zM8 2l.7 1.8 1.8.7-1.8.7L8 7l-.7-1.8-1.8-.7 1.8-.7zM19 11l.6 1.4 1.4.6-1.4.6L19 15l-.6-1.4L17 13l1.4-.6z' },
  { clave: 'personalizacion', nombre: 'Personalización', ico: 'M12 2a10 10 0 0 0 0 20c1.4 0 2.2-1 2.2-2.1 0-.6-.2-1-.5-1.4a1.8 1.8 0 0 1 1.4-3H17a5 5 0 0 0 5-5C22 6 17.5 2 12 2zM6.5 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z' },
  { clave: 'setup', nombre: 'Setup / Diagnóstico', ico: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.5 14.2-4.2-4.2 1.7-1.7 2.5 2.5 5.5-5.5 1.7 1.7z' },
];

/** La varita de la IA, la misma del portal */
export const VARITA =
  'M3 19.6 14.2 8.4l1.4 1.4L4.4 21zM15.6 7l1.4-1.4 1.4 1.4-1.4 1.4zM8 2l.7 1.8 1.8.7-1.8.7L8 7l-.7-1.8-1.8-.7 1.8-.7zM19 11l.6 1.4 1.4.6-1.4.6L19 15l-.6-1.4L17 13l1.4-.6zM20 1.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z';
