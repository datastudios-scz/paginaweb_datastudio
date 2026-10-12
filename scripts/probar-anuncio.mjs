/**
 * Banco del anuncio del Portal BI (/portal-bi/anuncio/). Ver ADR-016.
 *   1) npm run build && npm run preview   (en otra terminal)
 *   2) npm run anuncio:probar  [-- http://localhost:4321]
 *
 * Cada comprobación cuida algo que se rompió o que el video necesita:
 *  · El mismo instante da SIEMPRE el mismo cuadro (ir a t, ir a otro lado, volver a t).
 *    Es lo que permite grabar cuadro por cuadro. Se compara píxel por píxel con una tolerancia
 *    explícita: Chrome re-rasteriza a veces un degradado con 1-3 niveles de diferencia en un
 *    puñado de píxeles (medido: 33 píxeles, máximo 3 de 765, en el ícono del chat a escala
 *    0,736). Eso es invisible; un error de la línea de tiempo cambia miles.
 *  · Cada toma aparece en su ventana y no fuera de ella.
 *  · La letra escala con el lienzo: en la vista achicada de la página el titular mide lo que
 *    le toca. Se rompió una vez: --h1 quedó fijo en 118 px y el video lo tapaba (aprendizajes).
 *  · El aro del toque no se ve antes de tocar (fill-mode `both` lo mostraba toda la toma).
 *  · La página: se reproduce sola, pausa con espacio, cambia de formato sin dejar de reproducir.
 *  · Cero errores de consola y cero violaciones de la CSP.
 * Sale con código 1 si algo falla. Usa Edge o Chrome del sistema, como qa.mjs.
 */
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const BASE = process.argv.slice(2).find((a) => a.startsWith('http')) ?? 'http://localhost:4321';
const URL = `${BASE}/portal-bi/anuncio/`;
const FORMATOS = { '9x16': [1080, 1920], '4x5': [1080, 1350], '1x1': [1080, 1080], '16x9': [1920, 1080] };

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

async function abrir(opciones, url) {
  const contexto = await navegador.newContext({ deviceScaleFactor: 1, ...opciones });
  const pagina = await contexto.newPage();
  pagina.errores = [];
  pagina.on('console', (m) => m.type() === 'error' && pagina.errores.push(m.text()));
  pagina.on('pageerror', (e) => pagina.errores.push(e.message));
  await pagina.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP: ${e.violatedDirective}`));
  });
  await pagina.goto(url, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => window.__anuncio.listo);
  return pagina;
}

/** ¿Dos capturas son visualmente iguales? Cuenta los píxeles que cambian más de 12 niveles
    (sumando R, G y B) y exige que sean menos del 0,01 % del cuadro. */
const comparador = await (await navegador.newContext()).newPage();
async function iguales(a, b) {
  const r = await comparador.evaluate(
    async ([da, db]) => {
      const carga = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
      const [ia, ib] = await Promise.all([carga(da), carga(db)]);
      const datos = (i) => {
        const c = document.createElement('canvas');
        c.width = i.width;
        c.height = i.height;
        const g = c.getContext('2d');
        g.drawImage(i, 0, 0);
        return g.getImageData(0, 0, i.width, i.height).data;
      };
      const A = datos(ia);
      const B = datos(ib);
      let distintos = 0;
      let maximo = 0;
      for (let k = 0; k < A.length; k += 4) {
        const d = Math.abs(A[k] - B[k]) + Math.abs(A[k + 1] - B[k + 1]) + Math.abs(A[k + 2] - B[k + 2]);
        if (d > 12) distintos++;
        maximo = Math.max(maximo, d);
      }
      return { distintos, maximo, total: A.length / 4 };
    },
    ['data:image/png;base64,' + a.toString('base64'), 'data:image/png;base64,' + b.toString('base64')],
  );
  return { ...r, ok: r.distintos < r.total * 0.0001 };
}

const ir = async (p, s) => {
  await p.evaluate((ms) => window.__anuncio.ir(ms), s * 1000);
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
};

/* Qué toma se ve en cada instante (por su ventana de visibilidad) */
const tomaVisible = (p) =>
  p.evaluate(() =>
    [...document.querySelectorAll('.an-escena')]
      .filter((e) => getComputedStyle(e).visibility === 'visible')
      .map((e) => [...e.classList].find((c) => /^an-s\d$/.test(c))),
  );

const ESPERADO = [
  [0.5, 'an-s1'],
  [5.5, 'an-s2'],
  [8.0, 'an-s3'],
  [11.0, 'an-s4'],
  [14.0, 'an-s5'],
  [18.0, 'an-s6'],
  [21.5, 'an-s7'],
  [24.0, 'an-s8'],
  [29.0, 'an-s9'],
];

console.log('Modo grabación, por formato');
for (const [formato, [w, h]] of Object.entries(FORMATOS)) {
  const p = await abrir({ viewport: { width: w, height: h } }, `${URL}?render=1&formato=${formato}`);
  for (const [s, toma] of ESPERADO) {
    await ir(p, s);
    const vis = await tomaVisible(p);
    ok(vis.length === 1 && vis[0] === toma, `${formato} · ${s} s: se ve ${vis.join(', ') || 'nada'} (debe ser ${toma})`);
  }
  /* Determinismo: el mismo instante, dos veces, con un salto en el medio */
  await ir(p, 19.3);
  const a = await p.screenshot();
  await ir(p, 5.7);
  await ir(p, 19.3);
  const b = await p.screenshot();
  const ab = await iguales(a, b);
  ok(ab.ok, `${formato}: ir a 19,3 s dos veces da el mismo cuadro (${ab.distintos} píxeles distintos, máx. ${ab.maximo})`);
  await ir(p, 5.7);
  const c = await p.screenshot();
  await ir(p, 27.0);
  await ir(p, 5.7);
  const d = await p.screenshot();
  const cd = await iguales(c, d);
  ok(cd.ok, `${formato}: el lienzo de los mil asientos también, a 5,7 s (${cd.distintos} píxeles distintos)`);
  /* El lienzo tiene dos fases: los asientos (hasta ~4,6 s) y la espiral (desde 5,15 s). A
     los 5,7 s solo se ve la espiral: los asientos se prueban aparte, a los 3 s. */
  await ir(p, 3.0);
  const e = await p.screenshot();
  await ir(p, 12.0);
  await ir(p, 3.0);
  const f2 = await p.screenshot();
  const ef = await iguales(e, f2);
  ok(ef.ok, `${formato}: los mil asientos, a 3 s, también (${ef.distintos} píxeles distintos)`);
  /* Y la comparación sabe decir que NO: dos instantes distintos tienen que dar distinto */
  const ac = await iguales(a, c);
  ok(!ac.ok, `${formato}: 19,3 s y 5,7 s se distinguen (${ac.distintos} píxeles distintos)`);
  ok(p.errores.length === 0, `${formato}: sin errores ni CSP${p.errores.length ? ` (${p.errores.join(' | ')})` : ''}`);
  await p.context().close();
}

console.log('Detalles que ya se rompieron una vez');
{
  const p = await abrir({ viewport: { width: 1080, height: 1920 } }, `${URL}?render=1&formato=9x16`);
  await ir(p, 11.0);
  const aro = await p.evaluate(() => Number(getComputedStyle(document.querySelector('.an-toque')).opacity));
  ok(aro === 0, `el aro del toque no se ve antes de tocar (opacidad ${aro} a los 11 s)`);
  await ir(p, 3.6);
  const lineas = await p.evaluate(() => {
    const m = document.querySelector('.an-monto__n');
    const r = m.getBoundingClientRect();
    return Math.round(r.height / parseFloat(getComputedStyle(m).lineHeight || getComputedStyle(m).fontSize));
  });
  ok(lineas <= 1, `la cifra del gancho entra en una línea (${lineas})`);
  await p.context().close();
}

console.log('La página');
{
  const p = await abrir({ viewport: { width: 1440, height: 900 } }, URL);
  const medidas = await p.evaluate(() => {
    const l = document.querySelector('.an-lienzo');
    const t = document.querySelector('.an-s1-pregunta');
    return { ancho: l.clientWidth, letra: parseFloat(getComputedStyle(t).fontSize) };
  });
  const esperada = (118 * medidas.ancho) / 1080;
  ok(Math.abs(medidas.letra - esperada) < 1, `la letra escala con el lienzo: ${medidas.letra.toFixed(1)} px en ${medidas.ancho} px de ancho (debe ser ${esperada.toFixed(1)})`);
  const reloj = () => p.evaluate(() => document.querySelector('[data-a="reloj"]').getAnimations()[0].currentTime);
  await p.waitForTimeout(400);
  const t1 = await reloj();
  await p.waitForTimeout(1500);
  const t2 = await reloj();
  ok(t2 - t1 > 1000, `se reproduce sola (${Math.round(t1)} → ${Math.round(t2)} ms)`);
  await p.keyboard.press('Space');
  const t3 = await reloj();
  await p.waitForTimeout(700);
  ok((await reloj()) === t3, 'el espacio pausa');
  await p.click('[data-a="pausa"]');
  await p.click('[data-formato-boton="16x9"]');
  const t4 = await reloj();
  await p.waitForTimeout(1500);
  ok((await reloj()) - t4 > 1000, 'cambia a 16:9 sin dejar de reproducir');
  ok(p.errores.length === 0, `sin errores ni CSP${p.errores.length ? ` (${p.errores.join(' | ')})` : ''}`);
  await p.context().close();
}

await comparador.context().close();
await navegador.close();
console.log(fallas ? `\n${fallas} falla(s).` : '\nSin problemas.');
process.exit(fallas ? 1 : 0);
