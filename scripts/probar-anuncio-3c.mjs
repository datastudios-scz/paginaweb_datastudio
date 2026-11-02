/**
 * Banco del anuncio «A tu Power BI le faltan 3 cosas», sus dos versiones: la A (/anuncios/tres-cosas/)
 * y la B, cinemática (/anuncios/tres-cosas-b/). Ver ADR-022.
 *   1) npm run build && npm run preview   (en otra terminal)
 *   2) npm run anuncio:probar-3c  [-- http://localhost:4321] [--solo A|B]
 *
 * En las dos versiones y en los cuatro formatos comprueba lo que el video necesita y lo que el
 * anuncio promete (la B, además: que el lienzo de partículas dibuje, que la estrella de la
 * revelación se vea y que las tres piezas encajen):
 *  · Cada toma a su tiempo: una sola visible en cada instante.
 *  · El mismo instante da SIEMPRE el mismo cuadro (es lo que permite grabar cuadro por cuadro),
 *    con la misma tolerancia que los otros bancos, incluida la cámara de la toma 4 a mitad de
 *    camino. Y la comparación sabe decir que no: dos instantes distintos se distinguen.
 *  · El primer cuadro ya es el gancho entero: dice «Power BI» y trae los tres renglones.
 *  · La portada (la miniatura): el titular y la lista enteros y adentro, sin pisarse; en 9:16,
 *    sobre el 79 % (más abajo van los botones de Reels y TikTok).
 *  · Cada toma, entera y sin pisar su texto: el medidor con su cuenta en 1; la ventana del
 *    control con el rótulo de lo que ve el cliente; el chat con la cámara adentro, sin tapar el
 *    titular, con la respuesta y el dato; la lista con sus tres tildes; el cierre.
 *  · Sin precios (pedido del dueño) y sin prometer lo que un filtro no da: nada de «seguro»,
 *    «aislado», «protegido» ni «privado» (docs/seguridad.md del portal).
 *  · Ninguna regla de anuncio-3c.css mezcla transform con translate, rotate o scale.
 *  · La página: la duración coincide en el script, el reloj y el título; las descargas van al
 *    release `anuncio-tres-cosas`; se reproduce sola; con movimiento reducido queda el cierre
 *    armado; cero errores de consola y cero violaciones de CSP.
 * Sale con código 1 si algo falla. Usa Edge o Chrome del sistema, como qa.mjs.
 */
import { existsSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const BASE = process.argv.slice(2).find((a) => a.startsWith('http')) ?? 'http://localhost:4321';
const VERSIONES = {
  A: { ruta: '/anuncios/tres-cosas/', archivo: 'tres-cosas', css: 'anuncio-3c.css' },
  B: { ruta: '/anuncios/tres-cosas-b/', archivo: 'tres-cosas-b', css: 'anuncio-3c-b.css' },
};
const i0 = process.argv.indexOf('--solo');
const SOLO = i0 >= 0 ? process.argv[i0 + 1] : null;
const quiere = (v) => !SOLO || SOLO === v;
const FORMATOS = { '9x16': [1080, 1920], '4x5': [1080, 1350], '1x1': [1080, 1080], '16x9': [1920, 1080] };
const DURACION = 24000;

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

/* Casi la misma comparación que los otros bancos: cuenta los píxeles que cambian más de 12
   niveles y exige menos del 0,01 % del cuadro. Los otros descartan las líneas de un píxel (el
   borde de algo rasterizado en otra posición subpíxel); esta, las de hasta DOS: un píxel cuenta
   solo si es parte de una mancha de al menos 3 × 3. Hace falta por la cámara del chat: en 1:1 y
   4:5, con el chat ya agrandado, el borde de arriba de la ventana sale suavizado distinto según
   desde dónde se llega (una línea de 2 px de alto, 500 a 1.100 px; lo mismo en las dos
   versiones, medido con la ventana sin aura y sin chispas). Lo de adentro es idéntico */
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
      const ancho = ia.width;
      const alto = ia.height;
      const cambia = new Uint8Array(ancho * alto);
      for (let k = 0; k < A.length; k += 4) {
        const d = Math.abs(A[k] - B[k]) + Math.abs(A[k + 1] - B[k + 1]) + Math.abs(A[k + 2] - B[k + 2]);
        if (d > 12) cambia[k / 4] = 1;
      }
      let distintos = 0;
      for (let y = 0; y < alto; y++) {
        for (let x = 0; x < ancho; x++) {
          const i = y * ancho + x;
          if (!cambia[i]) continue;
          /* Una tira de tres que pasa por el píxel, a lo alto y a lo ancho */
          const v = (k) => y + k >= 0 && y + k < alto && cambia[i + k * ancho];
          const hz = (k) => x + k >= 0 && x + k < ancho && cambia[i + k];
          const alto3 = (v(-1) && v(1)) || (v(-1) && v(-2)) || (v(1) && v(2));
          const ancho3 = (hz(-1) && hz(1)) || (hz(-1) && hz(-2)) || (hz(1) && hz(2));
          if (alto3 && ancho3) distintos++;
        }
      }
      return { distintos, total: ancho * alto };
    },
    ['data:image/png;base64,' + a.toString('base64'), 'data:image/png;base64,' + b.toString('base64')],
  );
  return { ...r, ok: r.distintos < r.total * 0.0001 };
}

const ir = async (p, s) => {
  await p.evaluate((ms) => window.__anuncio.ir(ms), s * 1000);
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
};

const tomaVisible = (p) =>
  p.evaluate(() =>
    [...document.querySelectorAll('.an-escena')]
      .filter((e) => getComputedStyle(e).visibility === 'visible')
      .map((e) => [...e.classList].find((c) => /^(tc-s\d|tcb-s\d|tcb-revela)$/.test(c))),
  );

const coma = (s) => String(Math.round(s * 100) / 100).replace('.', ',');

/* Herramientas que corren en la página: si un rectángulo está adentro (con el piso de 9:16), el
   rectángulo del texto de un bloque (no su caja, que llega hasta el borde) y cuánto se cruzan */
const AYUDA = `
  window.__r = (sel) => document.querySelector(sel).getBoundingClientRect();
  window.__dentro = (b, piso) => b.left >= -1 && b.top >= -1 && b.right <= innerWidth + 1 && b.bottom <= piso + 1;
  window.__texto = (sel) => { const rg = document.createRange(); rg.selectNodeContents(document.querySelector(sel)); return rg.getBoundingClientRect(); };
  window.__cruce = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  window.__escala = (el) => { const t = getComputedStyle(el).transform; return t === 'none' ? 1 : new DOMMatrixReadOnly(t).a; };
`;

if (quiere('A')) {
console.log('Versión A, por formato');
for (const [formato, [w, h]] of Object.entries(FORMATOS)) {
  const p = await abrir({ viewport: { width: w, height: h } }, `${BASE}${VERSIONES.A.ruta}?render=1&formato=${formato}`);
  await p.evaluate(AYUDA);
  const piso = formato === '9x16' ? Math.round(h * 0.79) : h;

  const ESPERADO = [[1.0, 'tc-s1'], [4.5, 'tc-s2'], [9.5, 'tc-s3'], [15.0, 'tc-s4'], [19.0, 'tc-s5'], [22.5, 'tc-s6']];
  const mal = [];
  for (const [s, toma] of ESPERADO) {
    await ir(p, s);
    const vis = await tomaVisible(p);
    if (!(vis.length === 1 && vis[0] === toma)) mal.push(`${s} s: ${vis.join(', ') || 'nada'} (debe ser ${toma})`);
  }
  ok(!mal.length, `${formato}: cada toma a su tiempo${mal.length ? ` (${mal.join('; ')})` : ''}`);

  /* Determinismo: el mismo instante, dos veces, con un salto en el medio. 14,2 s es la cámara de
     la toma 4 a mitad de camino y 15,9 s, el chat ya agrandado; 4 s, la cuenta bajando; 9,8 s, el
     filtro; 19 s, las tildes */
  const dosVeces = async (s, otro) => {
    await ir(p, s);
    const a = await p.screenshot();
    await ir(p, otro);
    await ir(p, s);
    return { s, a, r: await iguales(a, await p.screenshot()) };
  };
  const pruebas = [await dosVeces(0.6, 15), await dosVeces(4.0, 20), await dosVeces(9.8, 1.2), await dosVeces(14.2, 6), await dosVeces(15.9, 3), await dosVeces(19.0, 3)];
  ok(pruebas.every((x) => x.r.ok),
    `${formato}: el mismo instante da el mismo cuadro (${pruebas.map((x) => `${coma(x.s)} s: ${x.r.distintos}`).join(', ')} píxeles distintos en mancha)`);
  const distintos = await iguales(pruebas[0].a, pruebas[1].a);
  ok(!distintos.ok, `${formato}: 0,6 s y 4 s se distinguen (${distintos.distintos} píxeles distintos)`);

  /* El primer cuadro ya es el gancho entero: dice Power BI y trae los tres renglones */
  await ir(p, 0);
  const primero = await p.evaluate(() => {
    const t = document.querySelector('.tc-s1-titular');
    return {
      texto: t.innerText.replace(/\s+/g, ' ').trim(),
      dentro: window.__dentro(window.__texto('.tc-s1-titular'), innerHeight),
      renglones: [...document.querySelectorAll('.tc-s1 .tc-item')].filter((el) => Math.abs(window.__escala(el) - 1) < 0.01 && Number(getComputedStyle(el).opacity) === 1).length,
    };
  });
  ok(/Power BI/.test(primero.texto) && primero.dentro && primero.renglones === 3,
    `${formato}: el primer cuadro ya es el gancho («${primero.texto}», ${primero.renglones} renglones${primero.dentro ? '' : ', SE SALE DEL CUADRO'})`);

  /* La portada (1,6 s): el titular y la lista enteros, adentro y sin pisarse */
  await ir(p, 1.6);
  const portada = await p.evaluate((piso) => {
    const t = window.__texto('.tc-s1-titular');
    const l = window.__r('.tc-s1 .tc-lista');
    return {
      lista: window.__dentro(l, piso),
      titulo: window.__dentro(t, piso),
      aire: Math.round(Math.max(l.top - t.bottom, l.left - t.right)),
      abajo: Math.round(l.bottom),
      cuenta: document.querySelector('.tc-s1 .tc-lista__cuenta').textContent.trim(),
    };
  }, piso);
  ok(portada.lista && portada.titulo && portada.aire >= 16 && portada.cuenta === '0 de 3',
    `${formato}: la portada trae el titular y la lista enteros (aire ${portada.aire} px, la lista hasta ${portada.abajo} de ${piso} px, «${portada.cuenta}»)`);

  /* La toma 2 (6,6 s): el medidor entero, la cuenta en 1, el sello adentro, sin pisar el texto */
  await ir(p, 6.6);
  const toma2 = await p.evaluate((piso) => {
    const m = window.__r('.tc-medidor');
    const t = window.__texto('.tc-s2 .an-texto');
    return {
      medidor: window.__dentro(m, piso),
      sello: window.__dentro(window.__r('.tc-sello'), piso),
      cruce: Math.round(window.__cruce(t, m) + window.__cruce(t, window.__r('.tc-sello'))),
      cuenta: document.querySelector('.tc-fila--lic [data-a="kpi"]').textContent.trim(),
      abajo: Math.round(m.bottom),
    };
  }, piso);
  ok(toma2.medidor && toma2.sello && toma2.cruce === 0 && toma2.cuenta === '1',
    `${formato}: la toma 2 entra entera (licencias: ${toma2.cuenta}; el medidor hasta ${toma2.abajo} de ${piso} px; cruce con el texto ${toma2.cruce} px²)`);

  /* La toma 3 (11,5 s): la ventana y las personas adentro, el rótulo del cliente, las páginas
     cerradas y el «Solo lectura» */
  await ir(p, 11.5);
  const toma3 = await p.evaluate((piso) => {
    const v = window.__r('.tc-s3-ventana .an-ui__in');
    const t = window.__texto('.tc-s3 .an-texto');
    const q = window.__r('.tc-quien');
    const visibles = [...document.querySelectorAll('.tc-estado__e')].filter((e) => Number(getComputedStyle(e).opacity) > 0.99);
    return {
      ventana: window.__dentro(v, piso),
      quien: window.__dentro(q, piso),
      cruce: Math.round(window.__cruce(t, v) + window.__cruce(t, q)),
      rotulo: visibles.map((e) => e.textContent.trim()).join(' | '),
      cerradas: [...document.querySelectorAll('.tc-pestana--2, .tc-pestana--3')].every((e) => Number(getComputedStyle(e).opacity) < 0.6),
      lectura: Math.abs(window.__escala(document.querySelector('.tc-lectura')) - 1) < 0.01,
      abajo: Math.round(v.bottom),
    };
  }, piso);
  ok(toma3.ventana && toma3.quien && toma3.cruce === 0 && toma3.rotulo === '2 páginas ocultas · solo lectura' && toma3.cerradas && toma3.lectura,
    `${formato}: la toma 3 entra entera (rótulo «${toma3.rotulo}», páginas cerradas ${toma3.cerradas}, solo lectura ${toma3.lectura}; la ventana hasta ${toma3.abajo} de ${piso} px; cruce ${toma3.cruce} px²)`);

  /* La toma 4: la pregunta se escribe a los 14,3 s; a los 16,6 s, el chat con la cámara adentro:
     entero, sin tapar el titular (ni con el panel ni con la barra de la ventana), con la
     respuesta y el dato a la vista */
  await ir(p, 14.3);
  const escrito = await p.evaluate(() => document.querySelector('.tc-s4 [data-a="tipeo"]').textContent);
  ok(escrito.length > 4 && escrito.length < 25, `${formato}: a 14,3 s la IA está escribiendo la pregunta («${escrito}»)`);
  await ir(p, 16.6);
  const toma4 = await p.evaluate((piso) => {
    const t = window.__texto('.tc-s4-texto');
    const panel = window.__r('.tc-s4 .an-s6-panel');
    const barra = window.__r('.tc-ia__ventana .an-ventana__barra');
    return {
      dentro: window.__dentro(panel, piso),
      pisa: Math.round(window.__cruce(t, panel) + window.__cruce(t, barra)),
      listo:
        Number(getComputedStyle(document.querySelector('.tc-s4 .an-s6-resp')).opacity) === 1 &&
        Math.abs(window.__escala(document.querySelector('.tc-ia__dato')) - 1) < 0.02 &&
        document.querySelector('.tc-s4 [data-a="tipeo"]').textContent === '',
      ancho: Math.round(panel.width),
      abajo: Math.round(panel.bottom),
    };
  }, piso);
  ok(toma4.dentro && toma4.pisa === 0 && toma4.listo,
    `${formato}: el chat entra entero y no tapa el titular (${toma4.listo ? 'respuesta y dato a la vista' : 'SIN RESPUESTA'}; ${toma4.ancho} px de ancho, hasta ${toma4.abajo} de ${piso} px; cruce ${toma4.pisa} px²)`);

  /* La toma 5 (19,8 s): la lista con sus tres tildes, entera y sin pisar el titular */
  await ir(p, 19.8);
  const toma5 = await p.evaluate((piso) => {
    const l = window.__r('.tc-s5 .tc-lista');
    const t = window.__texto('.tc-s5 .an-texto');
    return {
      dentro: window.__dentro(l, piso),
      cruce: Math.round(window.__cruce(t, l)),
      tildes: [...document.querySelectorAll('.tc-s5 .tc-item__caja')].filter((c) => Math.abs(Number(getComputedStyle(c).scale) - 1) < 0.01 || getComputedStyle(c).scale === 'none').length,
      cuenta: document.querySelector('.tc-s5 .tc-lista__cuenta').textContent.trim(),
    };
  }, piso);
  ok(toma5.dentro && toma5.cruce === 0 && toma5.tildes === 3 && toma5.cuenta === '3 de 3',
    `${formato}: la lista vuelve con sus ${toma5.tildes} tildes («${toma5.cuenta}», cruce ${toma5.cruce} px²)`);

  /* El cierre */
  await ir(p, 23.2);
  const cierre = await p.evaluate(() => {
    const cta = document.querySelector('.tc-s6 .an-cta');
    const r = cta.getBoundingClientRect();
    return {
      escala: Math.round((r.width / cta.offsetWidth) * 100) / 100,
      url: Number(getComputedStyle(document.querySelector('.tc-s6 .an-url')).opacity),
      dentro: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
      texto: cta.innerText.trim(),
    };
  });
  ok(cierre.escala === 1 && cierre.url === 1 && cierre.dentro && /\+591 7600 8398/.test(cierre.texto),
    `${formato}: el cierre muestra el WhatsApp y la dirección («${cierre.texto}», escala ${cierre.escala}, dirección con opacidad ${cierre.url})`);
  ok(p.errores.length === 0, `${formato}: sin errores ni CSP${p.errores.length ? ` (${p.errores.join(' | ')})` : ''}`);
  await p.context().close();
}
}

if (quiere('B')) {
console.log('Versión B (cinemática), por formato');
for (const [formato, [w, h]] of Object.entries(FORMATOS)) {
  const p = await abrir({ viewport: { width: w, height: h } }, `${BASE}${VERSIONES.B.ruta}?render=1&formato=${formato}`);
  await p.evaluate(AYUDA);
  const piso = formato === '9x16' ? Math.round(h * 0.79) : h;

  const ESPERADO = [[1.0, 'tcb-s1'], [4.5, 'tcb-s2'], [9.5, 'tc-s3'], [12.4, 'tcb-revela'], [15.0, 'tc-s4'], [19.2, 'tcb-s5'], [22.5, 'tc-s6']];
  const mal = [];
  for (const [s, toma] of ESPERADO) {
    await ir(p, s);
    const vis = await tomaVisible(p);
    if (!(vis.length === 1 && vis[0] === toma)) mal.push(`${s} s: ${vis.join(', ') || 'nada'} (debe ser ${toma})`);
  }
  ok(!mal.length, `${formato}: cada toma a su tiempo${mal.length ? ` (${mal.join('; ')})` : ''}`);

  /* Determinismo, en lo que más se mueve: el tablero que orbita, las licencias llegando e
     implotando, los anillos, el filtro, la revelación, la cámara, la cuenta del dato y las
     piezas en el aire */
  const dosVeces = async (s, otro) => {
    await ir(p, s);
    const a = await p.screenshot();
    await ir(p, otro);
    await ir(p, s);
    return { s, a, r: await iguales(a, await p.screenshot()) };
  };
  const pruebas = [];
  for (const [s, otro] of [[0.6, 15], [3.6, 20], [4.3, 1], [6.2, 12.3], [9.8, 1.2], [12.3, 6], [14.2, 6], [16.6, 3], [18.75, 9]]) pruebas.push(await dosVeces(s, otro));
  ok(pruebas.every((x) => x.r.ok),
    `${formato}: el mismo instante da el mismo cuadro (${pruebas.map((x) => `${coma(x.s)} s: ${x.r.distintos}`).join(', ')} píxeles distintos en mancha)`);
  const distintos = await iguales(pruebas[0].a, pruebas[2].a);
  ok(!distintos.ok, `${formato}: 0,6 s y 4,3 s se distinguen (${distintos.distintos} píxeles distintos)`);

  /* El lienzo dibuja: la grilla de licencias a 3,6 s y los anillos de gente a 6,2 s */
  const tinta = async (s) => {
    await ir(p, s);
    return p.evaluate(() => {
      const c = document.querySelector('canvas[data-fx="mil"]');
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let k = 3; k < d.length; k += 16) if (d[k] > 40) n++;
      return Math.round((n / (d.length / 16)) * 1000) / 10;
    });
  };
  const grilla = await tinta(3.6);
  const anillos = await tinta(6.2);
  ok(grilla > 8 && anillos > 1, `${formato}: el lienzo dibuja las licencias (${grilla} % pintado a 3,6 s) y la gente (${anillos} % a 6,2 s)`);

  /* El primer cuadro ya es el gancho: el titular dice Power BI y el tablero trae sus tres huecos */
  await ir(p, 0);
  const primero = await p.evaluate(() => ({
    texto: document.querySelector('.tcb-s1 .tc-s1-titular').innerText.replace(/\s+/g, ' ').trim(),
    dentro: window.__dentro(window.__texto('.tcb-s1 .tc-s1-titular'), innerHeight),
    huecos: [...document.querySelectorAll('.tcb-s1 .tcb-hueco')].filter((e) => Number(getComputedStyle(e).opacity) === 1).length,
  }));
  ok(/Power BI/.test(primero.texto) && primero.dentro && primero.huecos === 3,
    `${formato}: el primer cuadro ya es el gancho («${primero.texto}», ${primero.huecos} huecos${primero.dentro ? '' : ', SE SALE DEL CUADRO'})`);

  /* La portada (1,6 s): el titular y el tablero (girado) enteros, adentro y sin pisarse */
  await ir(p, 1.6);
  const portada = await p.evaluate((piso) => {
    const t = window.__texto('.tcb-s1 .tc-s1-titular');
    const v = window.__r('.tcb-s1 .tcb-tablero > .an-ui__in');
    return { tablero: window.__dentro(v, piso), titulo: window.__dentro(t, piso), cruce: Math.round(window.__cruce(t, v)), abajo: Math.round(v.bottom) };
  }, piso);
  ok(portada.tablero && portada.titulo && portada.cruce === 0,
    `${formato}: la portada trae el titular y el tablero enteros (el tablero hasta ${portada.abajo} de ${piso} px, cruce ${portada.cruce} px²)`);

  /* El ahorro (6,4 s): la licencia, el sello y la gente adentro; la cuenta ya se fue */
  await ir(p, 6.4);
  const toma2 = await p.evaluate((piso) => {
    const t = window.__texto('.tcb-s2 .an-texto');
    const l = window.__r('.tcb-licencia');
    const g = window.__r('.tcb-gente');
    const s = window.__r('.tcb-sello');
    return {
      dentro: [l, g, s].every((b) => window.__dentro(b, piso)),
      cruce: Math.round(window.__cruce(t, l) + window.__cruce(t, s) + window.__cruce(l, g)),
      cuenta: Number(getComputedStyle(document.querySelector('.tcb-cuenta')).opacity),
      licencia: document.querySelector('.tcb-licencia b').textContent.trim(),
    };
  }, piso);
  ok(toma2.dentro && toma2.cruce === 0 && toma2.cuenta < 0.01 && toma2.licencia === '1 licencia',
    `${formato}: el ahorro entra entero («${toma2.licencia}», la cuenta con opacidad ${toma2.cuenta}, cruces ${toma2.cruce} px²)`);

  /* El control (11,5 s): «Tú» y sus cables, la ventana y el rótulo del cliente, sin pisar el texto */
  await ir(p, 11.5);
  const toma3 = await p.evaluate((piso) => {
    const v = window.__r('.tcb-s3 .tc-s3-ventana .an-ui__in');
    const t = window.__texto('.tcb-s3 .an-texto');
    const red = window.__r('.tcb-red');
    const visibles = [...document.querySelectorAll('.tcb-s3 .tc-estado__e')].filter((e) => Number(getComputedStyle(e).opacity) > 0.99);
    return {
      dentro: window.__dentro(v, piso) && window.__dentro(red, piso),
      cruce: Math.round(window.__cruce(t, v) + window.__cruce(t, red)),
      rotulo: visibles.map((e) => e.textContent.trim()).join(' | '),
      cerradas: [...document.querySelectorAll('.tcb-s3 .tc-pestana--2, .tcb-s3 .tc-pestana--3')].every((e) => Number(getComputedStyle(e).opacity) < 0.6),
      abajo: Math.round(v.bottom),
    };
  }, piso);
  ok(toma3.dentro && toma3.cruce === 0 && toma3.rotulo === '2 páginas ocultas · solo lectura' && toma3.cerradas,
    `${formato}: el control entra entero (rótulo «${toma3.rotulo}», páginas cerradas ${toma3.cerradas}; la ventana hasta ${toma3.abajo} de ${piso} px; cruce ${toma3.cruce} px²)`);

  /* La revelación (12,35 s): la estrella se ve, en el centro */
  await ir(p, 12.35);
  const estrella = await p.evaluate(() => {
    const e = document.querySelector('.tcb-estrella');
    const b = e.getBoundingClientRect();
    return { ancho: Math.round(b.width), x: Math.round((b.left + b.right) / 2 - innerWidth / 2), op: Number(getComputedStyle(e).opacity) };
  });
  const u = Math.min(w, h) / 1080;
  ok(estrella.ancho > 150 * u && Math.abs(estrella.x) < 4 && estrella.op > 0.5,
    `${formato}: la estrella de la revelación se ve en el centro (${estrella.ancho} px de ancho, corrida ${estrella.x} px, opacidad ${estrella.op})`);

  /* La IA: la pregunta se escribe a los 14,9 s; a los 17,2 s, el chat entero, sin tapar el
     titular, con la respuesta y el dato ya contado */
  await ir(p, 14.9);
  const escrito = await p.evaluate(() => document.querySelector('.tcb-s4 [data-a="tipeo"]').textContent);
  ok(escrito.length > 4 && escrito.length < 25, `${formato}: a 14,9 s la IA está escribiendo la pregunta («${escrito}»)`);
  await ir(p, 17.2);
  const toma4 = await p.evaluate((piso) => {
    const t = window.__texto('.tcb-s4 .tc-s4-texto');
    const panel = window.__r('.tcb-s4 .an-s6-panel');
    const barra = window.__r('.tcb-s4 .tc-ia__ventana .an-ventana__barra');
    return {
      dentro: window.__dentro(panel, piso),
      pisa: Math.round(window.__cruce(t, panel) + window.__cruce(t, barra)),
      resp: Number(getComputedStyle(document.querySelector('.tcb-s4 .an-s6-resp')).opacity),
      dato: document.querySelector('.tcb-s4 .tc-ia__dato [data-a="kpi"]').textContent.trim(),
      campo: document.querySelector('.tcb-s4 [data-a="tipeo"]').textContent,
      abajo: Math.round(panel.bottom),
    };
  }, piso);
  ok(toma4.dentro && toma4.pisa === 0 && toma4.resp === 1 && toma4.dato === '+18,4 %' && toma4.campo === '',
    `${formato}: el chat entra entero y no tapa el titular (dato «${toma4.dato}», hasta ${toma4.abajo} de ${piso} px; cruce ${toma4.pisa} px²)`);

  /* Ahora sí (19,9 s): las tres piezas encajadas con su tilde, el tablero adentro y sin pisar el titular */
  await ir(p, 19.9);
  const toma5 = await p.evaluate((piso) => {
    const v = window.__r('.tcb-s5 .tcb-tablero > .an-ui__in');
    const t = window.__texto('.tcb-s5 .an-texto');
    /* Quieta: sin transformación (Chrome devuelve la matriz identidad, no «none») */
    const quieta = (e) => {
      const t = getComputedStyle(e).transform;
      const m = new DOMMatrixReadOnly(t === 'none' ? undefined : t);
      return m.isIdentity || [m.a - 1, m.b, m.c, m.d - 1, m.e, m.f].every((x) => Math.abs(x) < 1e-3);
    };
    const quietas = [...document.querySelectorAll('.tcb-pieza')].filter((e) => quieta(e) && Number(getComputedStyle(e).opacity) === 1).length;
    const tildes = [...document.querySelectorAll('.tcb-pieza__ok')].filter((e) => Math.abs(window.__escala(e) - 1) < 0.01).length;
    return { dentro: window.__dentro(v, piso), cruce: Math.round(window.__cruce(t, v)), quietas, tildes };
  }, piso);
  ok(toma5.dentro && toma5.cruce === 0 && toma5.quietas === 3 && toma5.tildes === 3,
    `${formato}: las ${toma5.quietas} piezas encajan con su tilde (${toma5.tildes}), el tablero adentro (cruce ${toma5.cruce} px²)`);

  /* El cierre */
  await ir(p, 23.2);
  const cierre = await p.evaluate(() => {
    const cta = document.querySelector('.tc-s6 .an-cta');
    const r = cta.getBoundingClientRect();
    return {
      escala: Math.round((r.width / cta.offsetWidth) * 100) / 100,
      url: Number(getComputedStyle(document.querySelector('.tc-s6 .an-url')).opacity),
      dentro: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
      texto: cta.innerText.trim(),
    };
  });
  ok(cierre.escala === 1 && cierre.url === 1 && cierre.dentro && /\+591 7600 8398/.test(cierre.texto),
    `${formato}: el cierre muestra el WhatsApp y la dirección («${cierre.texto}», escala ${cierre.escala}, dirección con opacidad ${cierre.url})`);
  ok(p.errores.length === 0, `${formato}: sin errores ni CSP${p.errores.length ? ` (${p.errores.join(' | ')})` : ''}`);
  await p.context().close();
}
}

for (const [v, cfg] of Object.entries(VERSIONES)) {
  if (!quiere(v)) continue;
  console.log(`Versión ${v}, la página`);
  const p = await abrir({ viewport: { width: 1440, height: 900 } }, `${BASE}${cfg.ruta}`);
  const dice = await p.evaluate(() => {
    const texto = document.querySelector('.an-lienzo').textContent;
    return {
      script: window.__anuncio.duracion,
      reloj: Number(document.querySelector('[data-a="reloj"]').getAnimations()[0].effect.getTiming().duration),
      titulo: document.querySelector('.an-barra__nombre').textContent.replace(/\s+/g, ' ').trim(),
      descargas: [...document.querySelectorAll('.an-descarga')].map((a) => a.href),
      /* Un precio, no un rótulo: el reporte de ejemplo dice «Ventas (US$)» y eso no es un precio */
      precio: /US\$\s*\d|\bal mes\b|\/\s*mes\b|pago único/i.test(texto),
      /* Lo que un filtro de Power BI no garantiza (docs/seguridad.md del portal) */
      promete: texto.match(/segur\w*|aislad\w*|protegid\w*|privad\w*/gi) ?? [],
    };
  });
  ok(!dice.precio, 'el anuncio no muestra ningún precio (pedido del dueño)');
  ok(dice.promete.length === 0, `el anuncio no promete seguridad que un filtro no da${dice.promete.length ? ` (dice: ${dice.promete.join(', ')})` : ''}`);
  ok(dice.script === DURACION && dice.reloj === DURACION && dice.titulo.endsWith(`${DURACION / 1000} s`),
    `la duración coincide: script ${dice.script} ms, reloj ${dice.reloj} ms, título «${dice.titulo}»`);
  const molde = new RegExp(`^https://github\\.com/[^/]+/[^/]+/releases/download/anuncio-tres-cosas/${cfg.archivo}-anuncio-(9x16|4x5|1x1|16x9)\\.mp4$`);
  ok(dice.descargas.length === 4 && dice.descargas.every((h) => molde.test(h)), `los cuatro botones bajan el MP4 del release (${dice.descargas.length} enlaces)`);
  const reloj = () => p.evaluate(() => document.querySelector('[data-a="reloj"]').getAnimations()[0].currentTime);
  await p.waitForTimeout(400);
  const t1 = await reloj();
  await p.waitForTimeout(1500);
  const t2 = await reloj();
  ok(t2 - t1 > 1000, `se reproduce sola (${Math.round(t1)} → ${Math.round(t2)} ms)`);
  ok(p.errores.length === 0, `sin errores ni CSP${p.errores.length ? ` (${p.errores.join(' | ')})` : ''}`);
  await p.context().close();

  /* Con movimiento reducido no se reproduce: queda el cierre ya armado */
  const q = await abrir({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, `${BASE}${cfg.ruta}`);
  const vis = await tomaVisible(q);
  const quieto = await q.evaluate(() => {
    const cta = document.querySelector('.tc-s6 .an-cta');
    return {
      pausa: document.querySelector('[data-a="raiz"]').hasAttribute('data-pausa'),
      boton: Math.round((cta.getBoundingClientRect().width / cta.offsetWidth) * 100) / 100,
      url: Number(getComputedStyle(document.querySelector('.tc-s6 .an-url')).opacity),
    };
  });
  ok(vis.join() === 'tc-s6' && quieto.pausa && quieto.boton === 1 && quieto.url === 1,
    `con movimiento reducido queda el cierre armado (se ve ${vis.join(', ') || 'nada'}, botón a escala ${quieto.boton}, dirección ${quieto.url})`);
  ok(q.errores.length === 0, `con movimiento reducido, sin errores ni CSP${q.errores.length ? ` (${q.errores.join(' | ')})` : ''}`);
  await q.context().close();
}

console.log('El CSS que sobrevive al minificador');
{
  /* Lightning CSS trata transform y las propiedades sueltas (translate, rotate, scale) como una
     sola: en una regla con las dos borra la suelta (ver los otros bancos y aprendizajes) */
  for (const cfg of Object.values(VERSIONES)) {
  const css = readFileSync(new globalThis.URL(`../src/components/anuncio/${cfg.css}`, import.meta.url), 'utf8');
  const mezclas = [];
  for (const [, sel, cuerpo] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const props = new Set([...cuerpo.matchAll(/^\s*(translate|rotate|scale|transform)\s*:/gm)].map((m) => m[1]));
    const nombre = sel.trim().split('\n').pop().trim();
    if (props.has('transform') && props.size > 1) mezclas.push(nombre);
  }
  ok(mezclas.length === 0, `ninguna regla de ${cfg.css} mezcla transform con translate, rotate o scale${mezclas.length ? ` (${mezclas.join(', ')})` : ''}`);
  }
}

await comparador.context().close();
await navegador.close();
console.log(fallas ? `\n${fallas} falla(s).` : '\nSin problemas.');
process.exit(fallas ? 1 : 0);
