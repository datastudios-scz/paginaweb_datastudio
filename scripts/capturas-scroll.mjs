/**
 * Capturas de pantalla (del viewport, no de página completa) en varias posiciones de scroll,
 * con movimiento activado: sirve para revisar animaciones ligadas al scroll (portada → telón).
 * Uso: node scripts/capturas-scroll.mjs [url] [ruta]   (con `npm run preview` corriendo)
 *      node scripts/capturas-scroll.mjs http://localhost:4321 /
 */
import { mkdirSync, existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const BASE = process.argv[2] ?? 'http://localhost:4321';
const RUTA = process.argv[3] ?? '/';
const VISTAS = [
  { nombre: 'escritorio', width: 1440, height: 900 },
  { nombre: 'movil', width: 390, height: 844 },
];
const POSICIONES = [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1, 1.2];

const ejecutable = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
].find((r) => existsSync(r));

mkdirSync('qa/scroll', { recursive: true });
const navegador = await chromium.launch({ executablePath: ejecutable });

for (const vista of VISTAS) {
  const contexto = await navegador.newContext({ viewport: { width: vista.width, height: vista.height }, deviceScaleFactor: 1 });
  const pagina = await contexto.newPage();
  await pagina.goto(BASE + RUTA, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(2800); // deja terminar la entrada de la portada
  for (const p of POSICIONES) {
    await pagina.evaluate((y) => window.scrollTo(0, y), Math.round(p * vista.height));
    await pagina.waitForTimeout(450);
    const archivo = `qa/scroll/${RUTA.replace(/\//g, '_') || '_'}${vista.nombre}-${String(p).replace('.', '_')}.png`;
    await pagina.screenshot({ path: archivo });
    console.log(archivo);
  }
  await contexto.close();
}
await navegador.close();
