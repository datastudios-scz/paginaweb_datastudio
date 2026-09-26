/**
 * QA visual y técnico del sitio compilado.
 *   1) npm run build && npm run preview   (en otra terminal)
 *   2) npm run qa  [-- http://localhost:4321]
 *
 * Por cada página y ancho (320 → 1440 px): captura de página completa en qa/, detecta scroll
 * horizontal y elementos que se salen del viewport, y registra errores de consola y
 * violaciones de la CSP. Sale con código 1 si encuentra problemas.
 * Usa Edge o Chrome del sistema (playwright-core no descarga navegadores).
 */
import { mkdirSync, existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const BASE = process.argv[2] ?? 'http://localhost:4321';
const PAGINAS = ['/', '/portal-bi/', '/no-existe-esta-pagina/'];
const ANCHOS = [1440, 1024, 768, 414, 375, 320];

const ejecutable = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((r) => existsSync(r));

if (!ejecutable) {
  console.error('No se encontró Edge ni Chrome.');
  process.exit(1);
}

mkdirSync('qa', { recursive: true });
const navegador = await chromium.launch({ executablePath: ejecutable });
let problemas = 0;

for (const ruta of PAGINAS) {
  for (const ancho of ANCHOS) {
    // Movimiento reducido: todo aparece en su estado final y la captura es determinista.
    const contexto = await navegador.newContext({
      viewport: { width: ancho, height: 900 },
      reducedMotion: 'reduce',
      deviceScaleFactor: 1,
    });
    const pagina = await contexto.newPage();
    const errores = [];
    const esperado404 = ruta.includes('no-existe');
    pagina.on('console', (m) => {
      if (m.type() !== 'error') return;
      if (esperado404 && m.text().includes('404')) return; // el propio estado 404 es lo esperado
      errores.push(m.text());
    });
    pagina.on('pageerror', (e) => errores.push(e.message));
    await pagina.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (e) => {
        console.error(`CSP: ${e.violatedDirective} bloqueó ${e.blockedURI || 'inline'}`);
      });
    });

    await pagina.goto(BASE + ruta, { waitUntil: 'networkidle' });
    await pagina.evaluate(() => document.fonts.ready);

    const desborde = await pagina.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const fuera = [];
      for (const el of document.querySelectorAll('body *')) {
        // Los hijos de un <svg> se miden en coordenadas propias: se evalúa el <svg> entero.
        if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > vw + 1 || r.left < -1)) {
          const estilo = getComputedStyle(el);
          if (estilo.position === 'fixed' || el.closest('[aria-hidden="true"] .solo-lectores')) continue;
          // Contenido con scroll propio (tablas, código) es aceptable.
          if (el.closest('.mka__tabla, .dax, .pb-terminal__cuerpo')) continue;
          fuera.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} (${Math.round(r.left)}→${Math.round(r.right)})`);
        }
      }
      return { scroll: document.documentElement.scrollWidth > vw, fuera: fuera.slice(0, 8) };
    });

    const nombre = `qa/${ruta.replace(/\//g, '_') || '_'}${ancho}.png`;
    await pagina.screenshot({ path: nombre, fullPage: true });

    const fallas = [];
    if (desborde.scroll) fallas.push('scroll horizontal');
    if (desborde.fuera.length) fallas.push(`fuera del viewport: ${desborde.fuera.join(', ')}`);
    if (errores.length) fallas.push(`consola: ${errores.join(' | ')}`);
    problemas += fallas.length ? 1 : 0;
    console.log(`${fallas.length ? '✗' : '✓'} ${ruta} @${ancho}px${fallas.length ? ' → ' + fallas.join(' · ') : ''}`);
    await contexto.close();
  }
}

await navegador.close();
console.log(problemas ? `\n${problemas} combinación(es) con problemas.` : '\nSin problemas.');
process.exit(problemas ? 1 : 0);
