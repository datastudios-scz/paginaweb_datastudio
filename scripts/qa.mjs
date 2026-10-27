/**
 * QA visual y técnico del sitio compilado.
 *   1) npm run build && npm run preview   (en otra terminal)
 *   2) npm run qa  [-- http://localhost:4321]
 *
 * Por cada página y ancho (320 → 1440 px): captura de página completa en qa/, detecta scroll
 * horizontal y elementos que se salen del viewport, y registra errores de consola y
 * violaciones de la CSP. Al final comprueba que las páginas ocultas (src/data/ocultas.mjs) sigan
 * ocultas: fuera del sitemap, con noindex y sin un solo enlace desde una página pública.
 * Sale con código 1 si encuentra problemas.
 * Usa Edge o Chrome del sistema (playwright-core no descarga navegadores).
 */
import { mkdirSync, existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { PAGINAS_OCULTAS, esOculta } from '../src/data/ocultas.mjs';

const BASE = process.argv[2] ?? 'http://localhost:4321';
const PAGINAS = ['/', '/portal-bi/', '/portal-bi/como-funciona/', '/portal-bi/como-funciona/administrador/', '/portal-bi/anuncio/', '/anuncios/power-bi/', '/anuncios/power-bi-ia/', '/social-metrics-bi/', '/tienda-ecommerce/', '/consultoria/', '/anuncios/', '/propuestas/', '/propuestas/portal-bi-ribentek/', '/no-existe-esta-pagina/'];
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
          if (el.closest('.mka__tabla, .dax, .pb-terminal__cuerpo, .prod-terminal__cuerpo, .mqt-pestanas')) continue;
          // Decoración recortada a propósito por un ancestro visible (overflow hidden/clip)
          // que sí cabe en la pantalla: no se ve ni produce scroll.
          let recortado = false;
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const o = getComputedStyle(a);
            if (/(hidden|clip)/.test(o.overflowX + o.overflow)) {
              const ra = a.getBoundingClientRect();
              if (ra.left >= -1 && ra.right <= vw + 1) {
                // Dentro de una maqueta: si se recorta un control, es un defecto visible; se reporta.
                recortado = !a.closest('.ventana');
                break;
              }
            }
          }
          if (recortado) continue;
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

/* Las páginas ocultas siguen ocultas. Todo se pide desde el navegador (fetch en la página), no
   desde Node: en una red que inspecciona HTTPS, Node no confía en el certificado y Chrome sí. */
{
  console.log('\nPáginas ocultas');
  const contexto = await navegador.newContext();
  const p = await contexto.newPage();
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const texto = (u) => p.evaluate(async (x) => {
    const r = await fetch(x);
    return r.ok ? r.text() : '';
  }, u);
  const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const comprobar = (ok, txt) => {
    console.log(`${ok ? '✓' : '✗'} ${txt}`);
    if (!ok) problemas++;
  };

  /* El sitemap trae direcciones absolutas del sitio publicado: se piden por su ruta, a esta base */
  const urls = [];
  for (const mapa of locs(await texto('/sitemap-index.xml'))) urls.push(...locs(await texto(new URL(mapa).pathname)));
  const enSitemap = urls.filter(esOculta);
  comprobar(urls.length > 0 && enSitemap.length === 0,
    `ninguna está en el sitemap (${urls.length} direcciones${enSitemap.length ? `; se colaron: ${enSitemap.join(', ')}` : ''})`);

  for (const ruta of PAGINAS_OCULTAS) {
    await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' });
    const robots = await p.evaluate(() => document.querySelector('meta[name="robots"]')?.content ?? '');
    comprobar(/noindex/.test(robots), `${ruta} no se indexa (robots: «${robots}»)`);
  }

  /* Enlaces a otros sitios (y mailto/tel) no cuentan: solo los que llevan a una página oculta */
  const enlaces = [];
  for (const ruta of PAGINAS.filter((r) => !esOculta(r))) {
    await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' });
    const hrefs = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
    for (const h of hrefs) {
      if (/^(mailto:|tel:|#)/.test(h)) continue;
      if (/^https?:\/\//.test(h) && !h.startsWith('https://datastudio.es')) continue;
      if (esOculta(h)) enlaces.push(`${ruta} → ${h}`);
    }
  }
  comprobar(enlaces.length === 0, `ninguna página pública las enlaza${enlaces.length ? ` (${enlaces.join(', ')})` : ''}`);
  await contexto.close();
}

await navegador.close();
console.log(problemas ? `\n${problemas} combinación(es) con problemas.` : '\nSin problemas.');
process.exit(problemas ? 1 : 0);
