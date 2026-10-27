/**
 * Banco del anuncio «Power BI primero» (/anuncios/power-bi/ y /anuncios/power-bi-ia/). Ver ADR-021.
 *   1) npm run build && npm run preview   (en otra terminal)
 *   2) npm run anuncio:probar-pbi  [-- http://localhost:4321]
 *
 * En las dos aperturas y en los cuatro formatos comprueba lo que el video necesita y lo que el
 * anuncio promete:
 *  · Cada toma a su tiempo: una sola visible en cada instante.
 *  · El mismo instante da SIEMPRE el mismo cuadro (es lo que permite grabar cuadro por cuadro),
 *    con la misma tolerancia que el banco del de 55 s (scripts/probar-anuncio.mjs). Y la
 *    comparación sabe decir que no: dos instantes distintos se distinguen.
 *  · El primer cuadro ya es el gancho y dice «Power BI»: es la miniatura, y lo que hace que el
 *    video segmente solo (ADR-021).
 *  · La portada (la foto que se ofrece como miniatura): todo lo que hay que leer, entero y
 *    adentro; en 9:16, sobre el 79 % (más abajo van los botones de Reels y TikTok). En la
 *    apertura «ia», el chat con la cámara adentro: entero, sin tapar el titular, con la respuesta
 *    y el dato a la vista; y antes, la pregunta escribiéndose.
 *  · La apertura «ia» dura un segundo más y corre todo el cuerpo ese segundo (--t0): cada
 *    comprobación del cuerpo se corre igual.
 *  · Sin precios: el dueño no quiere que salgan en el anuncio (26/10/2026).
 *  · El portal se traga todo hasta el centro exacto de su ventana (lo mide el script).
 *  · La toma 2: el titular no pisa la ventana, y la gente que entra queda en el cuadro.
 *  · La toma 3: el chat entra entero (con su última fila) y no pisa el titular ni el subtítulo.
 *  · El cierre: el WhatsApp y la dirección, a la vista.
 *  · Ninguna regla de anuncio-pbi.css mezcla transform con translate, rotate o scale.
 *  · La página: la duración coincide en el script, el reloj y el título; las descargas van al
 *    release `anuncio-power-bi` con la apertura que corresponde; se reproduce sola; con
 *    movimiento reducido queda el cierre armado; cero errores de consola y cero violaciones de CSP.
 * Sale con código 1 si algo falla. Usa Edge o Chrome del sistema, como qa.mjs.
 */
import { existsSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const BASE = process.argv.slice(2).find((a) => a.startsWith('http')) ?? 'http://localhost:4321';
const APERTURAS = { licencia: '/anuncios/power-bi/', ia: '/anuncios/power-bi-ia/' };
const FORMATOS = { '9x16': [1080, 1920], '4x5': [1080, 1350], '1x1': [1080, 1080], '16x9': [1920, 1080] };
/* Cuánto se corre el cuerpo en cada apertura (--t0 en anuncio-pbi.css) */
const CORRIDO = { licencia: 0, ia: 1 };

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

/* La misma comparación que el banco del de 55 s: cuenta los píxeles que cambian más de 12 niveles,
   sin las líneas de un píxel (el borde de algo rasterizado en otra posición subpíxel), y exige
   menos del 0,01 % del cuadro */
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
      let todos = 0;
      for (let k = 0; k < A.length; k += 4) {
        const d = Math.abs(A[k] - B[k]) + Math.abs(A[k + 1] - B[k + 1]) + Math.abs(A[k + 2] - B[k + 2]);
        if (d > 12) {
          cambia[k / 4] = 1;
          todos++;
        }
      }
      let distintos = 0;
      for (let y = 0; y < alto; y++) {
        for (let x = 0; x < ancho; x++) {
          const i = y * ancho + x;
          if (!cambia[i]) continue;
          const vertical = (y > 0 && cambia[i - ancho]) || (y < alto - 1 && cambia[i + ancho]);
          const costado = (x > 0 && cambia[i - 1]) || (x < ancho - 1 && cambia[i + 1]);
          if (vertical && costado) distintos++;
        }
      }
      return { distintos, todos, total: ancho * alto };
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
      .map((e) => [...e.classList].find((c) => /^pb-s\d$/.test(c))),
  );

/* Instantes que se prueban dos veces: la gente llegando con su número corriendo (o la cámara
   entrando al chat), el portal a mitad de tragárselos y el gráfico del chat creciendo */
const coma = (s) => String(Math.round(s * 100) / 100).replace('.', ',');

for (const [apertura, ruta] of Object.entries(APERTURAS)) {
  console.log(`Apertura «${apertura}», por formato`);
  const T0 = CORRIDO[apertura];
  const DURACION = 21000 + T0 * 1000;
  const ESPERADO = [
    [1.0, 'pb-s1'],
    [5.0 + T0, 'pb-s2'],
    [10.5 + T0, 'pb-s3'],
    [13.7 + T0, 'pb-s4'],
    [16.5 + T0, 'pb-s4'],
    [20.0 + T0, 'pb-s5'],
  ];
  const LLEGA = apertura === 'licencia' ? 1.7 : 1.1;
  const TRAGA = apertura === 'licencia' ? 2.6 : 3.5;
  const TRAGADO = apertura === 'licencia' ? 2.99 : 3.95;
  const PORTADA = apertura === 'licencia' ? 2.0 : 3.2;
  const GRAFICO = 10.6 + T0;
  for (const [formato, [w, h]] of Object.entries(FORMATOS)) {
    const p = await abrir({ viewport: { width: w, height: h } }, `${BASE}${ruta}?render=1&formato=${formato}`);
    const piso = formato === '9x16' ? Math.round(h * 0.79) : h;
    const mal = [];
    for (const [s, toma] of ESPERADO) {
      await ir(p, s);
      const vis = await tomaVisible(p);
      if (!(vis.length === 1 && vis[0] === toma)) mal.push(`${s} s: ${vis.join(', ') || 'nada'} (debe ser ${toma})`);
    }
    ok(!mal.length, `${formato}: cada toma a su tiempo${mal.length ? ` (${mal.join('; ')})` : ''}`);

    /* Determinismo: el mismo instante, dos veces, con un salto en el medio */
    const dosVeces = async (s, otro) => {
      await ir(p, s);
      const a = await p.screenshot();
      await ir(p, otro);
      await ir(p, s);
      return { a, r: await iguales(a, await p.screenshot()) };
    };
    const llega = await dosVeces(LLEGA, 15.0);
    const traga = await dosVeces(TRAGA, 9.0);
    const grafico = await dosVeces(GRAFICO, 1.2);
    ok(llega.r.ok && traga.r.ok && grafico.r.ok,
      `${formato}: el mismo instante da el mismo cuadro a ${coma(LLEGA)}, ${coma(TRAGA)} y ${coma(GRAFICO)} s (${llega.r.distintos}, ${traga.r.distintos} y ${grafico.r.distintos} píxeles distintos en mancha)`);
    const distintos = await iguales(llega.a, grafico.a);
    ok(!distintos.ok, `${formato}: ${coma(LLEGA)} s y ${coma(GRAFICO)} s se distinguen (${distintos.distintos} píxeles distintos)`);

    /* El primer cuadro ya es el gancho, y dice «Power BI» */
    await ir(p, 0);
    const primero = await p.evaluate((apertura) => {
      const sel = apertura === 'licencia' ? '.pb-aviso__caja' : '.pb-s1-titular';
      const el = document.querySelector(sel);
      const r = el.getBoundingClientRect();
      return {
        texto: el.innerText.replace(/\s+/g, ' ').trim(),
        opacidad: Number(getComputedStyle(apertura === 'licencia' ? el : document.querySelector('.pb-s1-texto')).opacity),
        dentro: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
      };
    }, apertura);
    ok(/Power BI/.test(primero.texto) && primero.opacidad === 1 && primero.dentro,
      `${formato}: el primer cuadro ya es el gancho y dice Power BI («${primero.texto.slice(0, 60)}»${primero.dentro ? '' : ', SE SALE DEL CUADRO'})`);

    /* En la apertura «ia», la pregunta se escribe letra por letra antes de enviarse */
    if (apertura === 'ia') {
      await ir(p, 1.5);
      const escrito = await p.evaluate(() => document.querySelector('.pb-s1--ia [data-a="tipeo"]').textContent);
      ok(escrito.length > 4 && escrito.length < 25, `${formato}: a 1,5 s la IA está escribiendo la pregunta («${escrito}»)`);
    }

    /* La portada: lo que hay que leer, entero y adentro */
    await ir(p, PORTADA);
    const portada = await p.evaluate(([apertura, piso]) => {
      const dentro = (r) => r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= piso + 1;
      const escala = (el) => {
        const t = getComputedStyle(el).transform;
        return t === 'none' ? 1 : new DOMMatrixReadOnly(t).a;
      };
      const piezas =
        apertura === 'licencia'
          ? ['.pb-aviso__caja', ...[1, 2, 3, 4].map((k) => `.pb-persona--${k} .pb-persona__in`)]
          : ['.pb-s1--ia .an-s6-panel'];
      const fuera = [];
      const chicas = [];
      for (const sel of piezas) {
        const el = document.querySelector(sel);
        if (!dentro(el.getBoundingClientRect())) fuera.push(sel);
        if (apertura === 'licencia' && Math.abs(escala(el) - 1) > 0.03) chicas.push(sel);
      }
      if (apertura === 'licencia') {
        return { fuera, chicas, dato: document.querySelector('.pb-persona--4 [data-a="kpi"]').textContent.trim(), pisa: 0 };
      }
      /* El chat con la cámara adentro no tapa el titular: ni el panel ni la barra de la ventana */
      const rg = document.createRange();
      rg.selectNodeContents(document.querySelector('.pb-s1-titular'));
      const t = rg.getBoundingClientRect();
      const barra = document.querySelector('.pb-ia__ventana .an-ventana__barra').getBoundingClientRect();
      const panel = document.querySelector('.pb-s1--ia .an-s6-panel').getBoundingClientRect();
      const cruce = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const datoEl = document.querySelector('.pb-ia__dato');
      const listo =
        Number(getComputedStyle(document.querySelector('.pb-s1--ia .an-s6-resp')).opacity) === 1 &&
        Math.abs(escala(datoEl) - 1) < 0.02 &&
        document.querySelector('.pb-s1--ia [data-a="tipeo"]').textContent === '';
      return { fuera, chicas, dato: listo ? 'respuesta y dato a la vista' : 'SIN RESPUESTA', pisa: Math.round(cruce(t, barra) + cruce(t, panel)) };
    }, [apertura, piso]);
    const datoBien = apertura === 'licencia' ? portada.dato === '+997' : portada.dato === 'respuesta y dato a la vista';
    ok(!portada.fuera.length && !portada.chicas.length && datoBien && portada.pisa === 0,
      `${formato}: la portada trae todo entero y adentro${formato === '9x16' ? ', sobre el 79 %' : ''} (${portada.dato}` +
        `${portada.fuera.length ? `; afuera: ${portada.fuera.join(', ')}` : ''}${portada.chicas.length ? `; a medio entrar: ${portada.chicas.join(', ')}` : ''}${portada.pisa ? `; TAPA EL TITULAR: ${portada.pisa} px²` : ''})`);

    /* La apertura «ia» no se la traga el portal: sube y se apaga (ver anuncio-pbi.css). A los
       3,95 s tiene que haberse ido entera, titular y chat */
    if (apertura === 'ia') {
      await ir(p, TRAGADO);
      const fuera = await p.evaluate(() => ({
        chat: Number(getComputedStyle(document.querySelector('.pb-ia')).opacity),
        titular: Number(getComputedStyle(document.querySelector('.pb-s1-texto')).opacity),
      }));
      ok(fuera.chat < 0.01 && fuera.titular < 0.01, `${formato}: el gancho se fue antes de que se abra el portal (opacidad del chat ${fuera.chat}, del titular ${fuera.titular})`);
    }

    /* El portal se traga todo hasta el centro exacto de su ventana */
    await ir(p, TRAGADO);
    const tragado = apertura === 'ia' ? null : await p.evaluate(() => {
      const centro = (el) => {
        const q = el.getBoundingClientRect();
        return { x: (q.left + q.right) / 2, y: (q.top + q.bottom) / 2 };
      };
      const d = centro(document.querySelector('.pb-s2-centro'));
      const piezas = [...document.querySelectorAll('[data-a="absorbe"]')];
      return {
        cuantas: piezas.length,
        lejos: Math.max(...piezas.map((el) => { const c = centro(el); return Math.hypot(c.x - d.x, c.y - d.y); })),
        opacidad: Math.max(...piezas.map((el) => Number(getComputedStyle(el).opacity))),
      };
    });
    if (tragado) {
      ok(tragado.cuantas >= 3 && tragado.lejos < 4 && tragado.opacidad < 0.01,
        `${formato}: el portal se traga las ${tragado.cuantas} piezas hasta el centro de su ventana (la más lejana a ${tragado.lejos.toFixed(1)} px, opacidad ${tragado.opacidad})`);
    }

    /* La toma 2: el titular no pisa la ventana; la ventana, el sello y la gente, en el cuadro */
    await ir(p, 6.0 + T0);
    const toma2 = await p.evaluate((piso) => {
      const r = (sel) => document.querySelector(sel).getBoundingClientRect();
      const dentro = (b) => b.left >= 0 && b.top >= 0 && b.right <= innerWidth && b.bottom <= piso + 1;
      const rg = document.createRange();
      rg.selectNodeContents(document.querySelector('.pb-s2 .an-texto'));
      const t = rg.getBoundingClientRect();
      const v = r('.pb-s2-ventana .an-ui__in');
      return {
        aire: Math.round(Math.max(v.top - t.bottom, v.left - t.right)),
        ventana: dentro(v),
        sello: dentro(r('.pb-sello')),
        gente: dentro(r('.pb-adentro')),
        abajo: Math.round(r('.pb-adentro').bottom),
        resto: document.querySelector('.pb-adentro [data-a="kpi"]').textContent.trim(),
      };
    }, piso);
    ok(toma2.aire >= 16 && toma2.ventana && toma2.sello && toma2.gente && toma2.resto === '+997',
      `${formato}: la toma 2 entra entera (aire con el titular ${toma2.aire} px, gente hasta ${toma2.abajo} de ${piso} px, ${toma2.resto})`);

    /* La toma 3: el chat entero en el cuadro, con su última fila, y sin pisar el texto */
    await ir(p, 12.5 + T0);
    const toma3 = await p.evaluate((piso) => {
      const r = (sel) => document.querySelector(sel).getBoundingClientRect();
      const chat = r('.pb-s3-chat');
      const caja = r('.pb-s3-chat__in');
      const ultima = r('.pb-s3 .an-s6-fila--7');
      const rep = r('.pb-s3-rep');
      const rg = document.createRange();
      rg.selectNodeContents(document.querySelector('.pb-s3 .an-texto'));
      const t = rg.getBoundingClientRect();
      const cruce = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return {
        dentro: chat.left >= 0 && chat.top >= 0 && chat.right <= innerWidth + 1 && chat.bottom <= piso + 1,
        abajo: Math.round(chat.bottom),
        fila: ultima.bottom <= caja.bottom + 1 && ultima.height > 0,
        pisa: Math.round(cruce(t, chat) + cruce(t, rep)),
        letra: parseFloat(getComputedStyle(document.querySelector('.pb-s3 .an-s6-yo')).fontSize),
      };
    }, piso);
    ok(toma3.dentro && toma3.fila && toma3.pisa === 0,
      `${formato}: el chat entra entero con su última fila y no pisa el texto (termina en ${toma3.abajo} de ${piso} px, letra de la pregunta ${toma3.letra.toFixed(1)} px, cruce ${toma3.pisa} px²)`);

    /* El cierre */
    await ir(p, 20.0 + T0);
    const cierre = await p.evaluate(() => {
      const cta = document.querySelector('.pb-s5 .an-cta');
      const url = document.querySelector('.pb-s5 .an-url');
      const r = cta.getBoundingClientRect();
      return {
        escala: Math.round((r.width / cta.offsetWidth) * 100) / 100,
        url: Number(getComputedStyle(url).opacity),
        dentro: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
        texto: cta.innerText.trim(),
      };
    });
    ok(cierre.escala === 1 && cierre.url === 1 && cierre.dentro && /\+591 7600 8398/.test(cierre.texto),
      `${formato}: el cierre muestra el WhatsApp y la dirección («${cierre.texto}», escala ${cierre.escala}, dirección con opacidad ${cierre.url})`);
    ok(p.errores.length === 0, `${formato}: sin errores ni CSP${p.errores.length ? ` (${p.errores.join(' | ')})` : ''}`);
    await p.context().close();
  }

  console.log(`Apertura «${apertura}», la página`);
  {
    const p = await abrir({ viewport: { width: 1440, height: 900 } }, `${BASE}${ruta}`);
    const dice = await p.evaluate(() => ({
      script: window.__anuncio.duracion,
      reloj: Number(document.querySelector('[data-a="reloj"]').getAnimations()[0].effect.getTiming().duration),
      titulo: document.querySelector('.an-barra__nombre').textContent.replace(/\s+/g, ' ').trim(),
      descargas: [...document.querySelectorAll('.an-descarga')].map((a) => a.href),
      actual: document.querySelector('.an-aperturas [aria-current="page"]')?.getAttribute('href'),
      aperturas: document.querySelectorAll('.an-aperturas a').length,
      /* Un precio, no un rótulo: el reporte de ejemplo dice «Ventas (US$)» y eso no es un precio */
      precio: /US\$\s*\d|\bal mes\b|\/\s*mes\b|pago único/i.test(document.querySelector('.an-lienzo').textContent),
    }));
    ok(!dice.precio, 'el anuncio no muestra ningún precio (pedido del dueño)');
    ok(dice.script === DURACION && dice.reloj === DURACION && dice.titulo.endsWith(`${DURACION / 1000} s`),
      `la duración coincide: script ${dice.script} ms, reloj ${dice.reloj} ms, título «${dice.titulo}»`);
    const molde = new RegExp(`^https://github\\.com/[^/]+/[^/]+/releases/download/anuncio-power-bi/power-bi-${apertura}-anuncio-(9x16|4x5|1x1|16x9)\\.mp4$`);
    ok(dice.descargas.length === 4 && dice.descargas.every((h) => molde.test(h)), `los cuatro botones bajan el MP4 de esta apertura del release (${dice.descargas.length} enlaces)`);
    ok(dice.aperturas === 2 && dice.actual === ruta, `el selector de apertura marca esta página (${dice.actual})`);
    const reloj = () => p.evaluate(() => document.querySelector('[data-a="reloj"]').getAnimations()[0].currentTime);
    await p.waitForTimeout(400);
    const t1 = await reloj();
    await p.waitForTimeout(1500);
    const t2 = await reloj();
    ok(t2 - t1 > 1000, `se reproduce sola (${Math.round(t1)} → ${Math.round(t2)} ms)`);
    ok(p.errores.length === 0, `sin errores ni CSP${p.errores.length ? ` (${p.errores.join(' | ')})` : ''}`);
    await p.context().close();

    /* Con movimiento reducido no se reproduce: queda el cierre ya armado */
    const q = await abrir({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, `${BASE}${ruta}`);
    const vis = await tomaVisible(q);
    const quieto = await q.evaluate(() => {
      const cta = document.querySelector('.pb-s5 .an-cta');
      return {
        pausa: document.querySelector('[data-a="raiz"]').hasAttribute('data-pausa'),
        boton: Math.round((cta.getBoundingClientRect().width / cta.offsetWidth) * 100) / 100,
        url: Number(getComputedStyle(document.querySelector('.pb-s5 .an-url')).opacity),
      };
    });
    ok(vis.join() === 'pb-s5' && quieto.pausa && quieto.boton === 1 && quieto.url === 1,
      `con movimiento reducido queda el cierre armado (se ve ${vis.join(', ') || 'nada'}, botón a escala ${quieto.boton}, dirección ${quieto.url})`);
    ok(q.errores.length === 0, `con movimiento reducido, sin errores ni CSP${q.errores.length ? ` (${q.errores.join(' | ')})` : ''}`);
    await q.context().close();
  }
}

console.log('El CSS que sobrevive al minificador');
{
  /* Lightning CSS trata transform y las propiedades sueltas (translate, rotate, scale) como una
     sola: en una regla con las dos borra la suelta (ver el banco del de 55 s y aprendizajes) */
  const css = readFileSync(new globalThis.URL('../src/components/anuncio/anuncio-pbi.css', import.meta.url), 'utf8');
  const mezclas = [];
  for (const [, sel, cuerpo] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const props = new Set([...cuerpo.matchAll(/^\s*(translate|rotate|scale|transform)\s*:/gm)].map((m) => m[1]));
    const nombre = sel.trim().split('\n').pop().trim();
    if (props.has('transform') && props.size > 1) mezclas.push(nombre);
  }
  ok(mezclas.length === 0, `ninguna regla de anuncio-pbi.css mezcla transform con translate, rotate o scale${mezclas.length ? ` (${mezclas.join(', ')})` : ''}`);
}

await comparador.context().close();
await navegador.close();
console.log(fallas ? `\n${fallas} falla(s).` : '\nSin problemas.');
process.exit(fallas ? 1 : 0);
