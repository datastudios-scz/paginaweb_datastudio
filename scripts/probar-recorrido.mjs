/**
 * Banco de los recorridos animados del Portal BI: el de tu equipo (/portal-bi/como-funciona/)
 * y el del administrador (/portal-bi/como-funciona/administrador/). Comparten el marco y el
 * motor, así que se prueban igual; cambian los textos, el tipeo y lo que hace el paso 5.
 *   1) npm run build && npm run preview   (en otra terminal)
 *   2) npm run recorrido  [-- http://localhost:4321]  [--rapido]  [--solo equipo|administrador]
 *
 * Lo que comprueba, cada cosa por algo que pasó (docs/aprendizajes.md):
 *  · Entrada directa: la portada espera Reproducir y no arranca sola.
 *  · Desde el botón que lo enlaza (#ver): arranca solo, la portada no se ve, los 8 pasos duran
 *    lo que dice DURACION (el progreso se llena con eso) y termina en el cierre con la compra.
 *    Con --rapido no se corre entero (tarda más de un minuto cada uno).
 *  · Movimiento reducido: «Ver paso a paso», el foco pasa a Siguiente, los 8 pasos en orden,
 *    después el cierre, y Anterior vuelve. Antes no había forma de llegar al botón de compra.
 *  · Teclado: espacio arranca y pausa (la pausa se prueba A MITAD del tipeo: con el campo vacío
 *    la comparación pasaría sin probar nada), las flechas cambian de paso.
 *  · CLS con red lenta en cinco tamaños: la página no puede saltar cuando llega el script.
 *  · Cero errores de consola y cero violaciones de la CSP en todo lo anterior.
 * Sale con código 1 si algo falla. Usa Edge o Chrome del sistema, como qa.mjs.
 */
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const BASE = args.find((a) => a.startsWith('http')) ?? 'http://localhost:4321';
const RAPIDO = args.includes('--rapido');
const SOLO = args.includes('--solo') ? args[args.indexOf('--solo') + 1] : null;

/** Lo propio de cada recorrido: sus textos, el campo que se tipea y lo que pasa en el paso 5. */
const RECORRIDOS = {
  equipo: {
    ruta: '/portal-bi/como-funciona/',
    primero: 'Cada persona',
    ultimo: 'dibujado',
    cierre: 'Todo esto',
    sinJs: [/Cada persona entra con su usuario/, /Todo esto, con una sola licencia/],
    /* El usuario del ingreso, en el paso 1: 'mariana.s' */
    tipeo: 'usuario-txt',
    largo: 9,
    esperaTipeo: 10000,
    paso5: () => document.querySelector('.rc-pantalla').dataset.escena === 'visor' && document.querySelector('.rc-visor')?.classList.contains('es-chat'),
    paso5Txt: 'el paso 5 abre el chat al costado',
    duracion: [50000, 75000],
  },
  administrador: {
    ruta: '/portal-bi/como-funciona/administrador/',
    primero: 'Un panel',
    ultimo: 'quién entra',
    cierre: 'Toda tu empresa',
    sinJs: [/Das de alta a una persona/, /Toda tu empresa, desde un panel/],
    /* El usuario nuevo, en el paso 2: 'carlos.r' */
    tipeo: 'mu-usuario-txt',
    largo: 8,
    esperaTipeo: 20000,
    paso5: () => document.querySelector('.rc-pantalla').dataset.escena === 'licencia' && document.querySelector('[data-r="ma-opciones"]')?.classList.contains('es-abierto'),
    paso5Txt: 'el paso 5 abre las opciones del tablero',
    duracion: [50000, 75000],
  },
};

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

let fallas = 0;
const ok = (cond, txt) => {
  console.log(`${cond ? '  ✓' : '  ✗ FALLA'} ${txt}`);
  if (!cond) fallas++;
};

const navegador = await chromium.launch({ executablePath: ejecutable });

/** Abre la página y junta errores de consola, de página y de CSP. */
async function abrir(opciones, url, antes = null) {
  const contexto = await navegador.newContext({ deviceScaleFactor: 1, ...opciones });
  const pagina = await contexto.newPage();
  pagina.errores = [];
  pagina.on('console', (m) => m.type() === 'error' && pagina.errores.push(m.text()));
  pagina.on('pageerror', (e) => pagina.errores.push(e.message));
  await pagina.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP: ${e.violatedDirective}`));
  });
  if (antes) await pagina.addInitScript(antes);
  await pagina.goto(url, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(300);
  return pagina;
}

const visible = (p, sel) =>
  p.evaluate((s) => {
    const e = document.querySelector(s);
    if (!e) return false;
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden';
  }, sel);
const estado = (p) => p.evaluate(() => document.querySelector('[data-r="raiz"]').dataset.estado ?? '');
const texto = (p, r) => p.textContent(`[data-r="${r}"]`);
const sinErrores = (p, que) => ok(p.errores.length === 0, `${que}: sin errores ni CSP${p.errores.length ? ` (${p.errores.join(' | ')})` : ''}`);
const cerrar = (p) => p.context().close();

const ESCRITORIO = { viewport: { width: 1440, height: 790 } };
const TELEFONO = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };

for (const [clave, R] of Object.entries(RECORRIDOS)) {
  if (SOLO && SOLO !== clave) continue;
  const URL = `${BASE}${R.ruta}`;
  console.log(`\n═══ ${R.ruta} ═══`);

  console.log('Entrada directa');
  for (const [nombre, vp] of [['escritorio', ESCRITORIO], ['teléfono', TELEFONO]]) {
    const p = await abrir({ ...vp, reducedMotion: 'no-preference' }, URL);
    ok(await visible(p, '[data-r="reproducir"]'), `${nombre}: la portada muestra Reproducir`);
    ok((await estado(p)) === '', `${nombre}: no arranca sola`);
    sinErrores(p, nombre);
    await cerrar(p);
  }
  {
    const p = await abrir({ ...ESCRITORIO, javaScriptEnabled: false }, URL);
    const todo = await p.evaluate(() => document.body.innerText);
    ok(R.sinJs.every((r) => r.test(todo)), 'sin JS: se lee el guion entero y el cierre');
    ok(!(await visible(p, '.rc-ventana')), 'sin JS: no se dibuja una ventana que no se puede reproducir');
    await cerrar(p);
  }

  console.log(`Desde el botón que lo enlaza (#ver)${RAPIDO ? ' — sin la corrida entera (--rapido)' : ''}`);
  {
    /* El registro de pasos se instala ANTES de cargar y se toma desde adentro de la página:
       sondear de afuera cada pocos milisegundos puede tumbar lo que se mide. */
    const registrar = () => {
      window.__pasos = [];
      new MutationObserver(() => {
        const c = document.querySelector('[aria-current="step"]');
        const i = c ? [...c.parentNode.children].indexOf(c) : -1;
        const e = document.querySelector('[data-r="raiz"]')?.dataset.estado;
        const u = window.__pasos.at(-1);
        if (!u || u.i !== i || u.e !== e) window.__pasos.push({ i, e, t: performance.now() });
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['aria-current', 'data-estado'] });
    };
    const p = await abrir({ ...ESCRITORIO, reducedMotion: 'no-preference' }, `${URL}#ver`, RAPIDO ? null : registrar);
    ok(!(await visible(p, '[data-r="portada"]')), 'la portada no se ve');
    ok((await estado(p)) === 'reproduciendo', 'arranca solo');
    if (!RAPIDO) {
      await p.waitForFunction(() => document.querySelector('[data-r="raiz"]').dataset.estado === 'final', null, { timeout: 150000 });
      const pasos = await p.evaluate(() => window.__pasos);
      const duracion = (await p.getAttribute('[data-r="raiz"]', 'data-duraciones'))?.split(' ').map(Number) ?? [];
      ok(duracion.length === 8, 'la página publica la duración de sus 8 pasos');
      const inicio = (i) => pasos.find((x) => x.i === i && x.e === 'reproduciendo')?.t;
      const fin = pasos.find((x) => x.e === 'final')?.t;
      for (let i = 0; i < duracion.length; i++) {
        const real = (i < 7 ? inicio(i + 1) : fin) - inicio(i);
        const desvio = Math.abs(real - duracion[i]) / duracion[i];
        ok(desvio < 0.2, `paso ${i + 1}: dura ${Math.round(real)} ms, su segmento se llena en ${duracion[i]} (${Math.round(desvio * 100)} %)`);
      }
      const total = fin - inicio(0);
      ok(total > R.duracion[0] && total < R.duracion[1], `el recorrido entero dura ${Math.round(total / 1000)} s (la página promete un minuto)`);
      ok(await visible(p, '[data-r="final"]'), 'termina en el cierre, con los botones a la vista');
      /* La narración cambia 320 ms después: primero sale la frase del paso 8. */
      const cierre = await p
        .waitForFunction((c) => document.querySelector('[data-r="titular"]').textContent.includes(c), R.cierre, { timeout: 3000 })
        .then(() => true, () => false);
      ok(cierre, 'la narración dice el cierre');
    }
    sinErrores(p, '#ver');
    await cerrar(p);
  }

  console.log('Movimiento reducido');
  for (const [nombre, vp] of [['escritorio', ESCRITORIO], ['teléfono', TELEFONO]]) {
    const p = await abrir({ ...vp, reducedMotion: 'reduce' }, `${URL}#ver`);
    ok(await visible(p, '[data-r="portada"]'), `${nombre}: con #ver no arranca solo`);
    ok((await texto(p, 'reproducir')).includes('Ver paso a paso'), `${nombre}: el botón dice Ver paso a paso`);
    await p.focus('[data-r="reproducir"]');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(250);
    ok(await p.evaluate(() => document.activeElement?.dataset.r === 'siguiente'), `${nombre}: el foco pasa a Siguiente`);
    const titulos = [];
    for (let i = 0; i < 9; i++) {
      await p.waitForTimeout(250);
      titulos.push(await texto(p, 'titular'));
      await p.click('[data-r="siguiente"]');
    }
    await p.waitForTimeout(400);
    titulos.push(await texto(p, 'titular'));
    ok(titulos[0].includes(R.primero) && titulos[7].includes(R.ultimo), `${nombre}: los 8 pasos en orden`);
    ok(titulos[9].includes(R.cierre) && (await visible(p, '[data-r="final"]')), `${nombre}: después del 8 viene el cierre con los botones`);
    await p.click('[data-r="anterior"]');
    await p.waitForTimeout(300);
    ok((await texto(p, 'titular')).includes(R.ultimo) && !(await visible(p, '[data-r="final"]')), `${nombre}: Anterior desde el cierre vuelve al paso 8`);
    sinErrores(p, nombre);
    await cerrar(p);
  }

  console.log('Teclado');
  {
    const p = await abrir({ ...ESCRITORIO, reducedMotion: 'no-preference' }, URL);
    await p.keyboard.press('Space');
    await p.waitForTimeout(400);
    ok((await estado(p)) === 'reproduciendo', 'espacio arranca desde la portada');
    await p.waitForFunction((r) => (document.querySelector(`[data-r="${r}"]`).textContent ?? '').length >= 3, R.tipeo, { timeout: R.esperaTipeo });
    await p.keyboard.press('Space');
    const antes = await texto(p, R.tipeo);
    await p.waitForTimeout(1500);
    const despues = await texto(p, R.tipeo);
    ok(antes.length >= 3 && antes.length < R.largo && antes === despues, `en pausa no se escribe nada ("${antes}" = "${despues}")`);
    ok((await p.getAttribute('[data-r="pausa"]', 'aria-label')) === 'Seguir', 'el botón de pausa ahora dice Seguir');
    await p.keyboard.press('Space');
    /* El paso siguiente al del tipeo (en el de tu equipo es el 1; en el del administrador, el 2) */
    const actual = Number((await texto(p, 'numero')).slice(0, 2));
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(500);
    const siguiente = String(actual + 1).padStart(2, '0');
    ok((await texto(p, 'numero')).startsWith(siguiente), `flecha derecha: paso ${actual + 1}`);
    /* Hasta el paso 5, a flechazos */
    for (let i = actual + 1; i < 5; i++) await p.keyboard.press('ArrowRight');
    await p.waitForFunction(R.paso5, null, { timeout: 20000 }).catch(() => {});
    ok(await p.evaluate(R.paso5), `y con flechas hasta el 5: ${R.paso5Txt}`);
    sinErrores(p, 'teclado');
    await cerrar(p);
  }

  console.log('Saltos de diseño (CLS) con red lenta');
  for (const [w, h, movil] of [[1440, 790], [1350, 940], [1024, 900], [820, 1100, true], [390, 844, true]]) {
    const contexto = await navegador.newContext({ viewport: { width: w, height: h }, isMobile: Boolean(movil), hasTouch: Boolean(movil) });
    const p = await contexto.newPage();
    const cdp = await contexto.newCDPSession(p);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await p.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__cls += e.value))).observe({ type: 'layout-shift', buffered: true });
    });
    await p.goto(URL, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    const cls = await p.evaluate(() => window.__cls);
    ok(cls < 0.01, `${w}×${h}: CLS ${cls.toFixed(4)}`);
    await contexto.close();
  }
}

await navegador.close();
console.log(fallas ? `\n${fallas} falla(s).` : '\nSin problemas.');
process.exit(fallas ? 1 : 0);
