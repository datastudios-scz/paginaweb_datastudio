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
 *  · El gancho (ADR-019), en cada formato: el primer cuadro ya es el gancho (es la miniatura);
 *    en la portada nada tapa el pedido ni lo que hay que leer; el portal se traga todo hasta el
 *    centro exacto de su ventana; y las tomas de la ventana entran en el cuadro.
 *  · La letra escala con el lienzo: en la vista achicada de la página el titular mide lo que
 *    le toca. Se rompió una vez: --h1 quedó fijo en 118 px y el video lo tapaba (aprendizajes).
 *  · El aro del toque no se ve antes de tocar (fill-mode `both` lo mostraba toda la toma).
 *  · Ninguna regla mezcla transform con translate, rotate o scale: el minificador borra la suelta.
 *  · La toma 6 entra en cada formato: sin tapar el subtítulo ni la firma, y en 9:16 sobre el 79 %.
 *  · La página: se reproduce sola, pausa con espacio, cambia de formato sin dejar de reproducir.
 *  · La versión para socios (/propuestas/portal-bi-ribentek/, ADR-020): sus tomas a su tiempo,
 *    lo que dura, que no prometa facturar (no se factura), el título, el formato según la pantalla
 *    y las páginas: cada una se arma y se queda quieta, nada avanza solo, y «Siguiente», volver,
 *    los puntos, las flechas y tocar la escena hacen lo que dicen; el final de cada página es una
 *    toma entera, y con movimiento reducido cada una aparece ya armada.
 *  · Cero errores de consola y cero violaciones de la CSP.
 * Sale con código 1 si algo falla. Usa Edge o Chrome del sistema, como qa.mjs.
 */
import { existsSync, readFileSync } from 'node:fs';
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
    (sumando R, G y B) y exige que sean menos del 0,01 % del cuadro.
    Sin contar los que forman una línea de UN píxel (no cambia ningún vecino de arriba o de abajo,
    o ninguno de los costados): eso es el borde de algo que Chrome rasterizó en otra posición
    subpíxel. Con la cámara de la toma 6 pasa según desde dónde se llega al instante —medido: el
    borde de arriba de la ventana, una fila de 480 píxeles con 19 niveles de diferencia—, y no es
    un error de la línea de tiempo. Un error de verdad (un pulso que no se ve, un giro que no
    vuelve, una toma corrida) es una mancha, y una mancha cuenta entera. */
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
      let maximo = 0;
      for (let k = 0; k < A.length; k += 4) {
        const d = Math.abs(A[k] - B[k]) + Math.abs(A[k + 1] - B[k + 1]) + Math.abs(A[k + 2] - B[k + 2]);
        if (d > 12) {
          cambia[k / 4] = 1;
          todos++;
        }
        maximo = Math.max(maximo, d);
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
      return { distintos, todos, maximo, total: ancho * alto };
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
      .map((e) => [...e.classList].find((c) => /^an-s\d+$/.test(c))),
  );

const ESPERADO = [
  [1.0, 'an-s1'],
  [8.5, 'an-s2'],
  [12.5, 'an-s3'],
  [17.0, 'an-s4'],
  [22.0, 'an-s5'],
  [32.0, 'an-s6'],
  [42.5, 'an-s7'],
  [47.0, 'an-s8'],
  [53.0, 'an-s9'],
];

/* Instantes que se prueban dos veces (tienen que dar el mismo cuadro): el chat a mitad de
   dibujar el gráfico, y en el gancho las caras entrando con su número corriendo, los reportes
   cayendo y flotando, y el portal a mitad de tragárselos. */
const CHAT = 30.9;
const LICENCIA = 8.3;
const CAOS = 2.2;
const SUCCION = 3.25;
const coma = (s) => String(s).replace('.', ',');

console.log('Modo grabación, por formato');
for (const [formato, [w, h]] of Object.entries(FORMATOS)) {
  const p = await abrir({ viewport: { width: w, height: h } }, `${URL}?render=1&formato=${formato}`);
  for (const [s, toma] of ESPERADO) {
    await ir(p, s);
    const vis = await tomaVisible(p);
    ok(vis.length === 1 && vis[0] === toma, `${formato} · ${s} s: se ve ${vis.join(', ') || 'nada'} (debe ser ${toma})`);
  }
  /* Determinismo: el mismo instante, dos veces, con un salto en el medio */
  await ir(p, CHAT);
  const a = await p.screenshot();
  await ir(p, LICENCIA);
  await ir(p, CHAT);
  const b = await p.screenshot();
  const ab = await iguales(a, b);
  ok(ab.ok, `${formato}: ir a ${coma(CHAT)} s dos veces da el mismo cuadro (${ab.distintos} píxeles distintos en mancha, ${ab.todos} en total, máx. ${ab.maximo})`);
  await ir(p, LICENCIA);
  const c = await p.screenshot();
  await ir(p, 52.0);
  await ir(p, LICENCIA);
  const d = await p.screenshot();
  const cd = await iguales(c, d);
  ok(cd.ok, `${formato}: las mil personas entrando también, a ${coma(LICENCIA)} s (${cd.distintos} píxeles distintos en mancha, ${cd.todos} en total)`);
  /* El gancho tiene tres fases que no se parecen: los reportes cayendo y flotando, el portal
     tragándoselos y la ventana. Cada una se prueba aparte, viniendo de otro lado */
  await ir(p, CAOS);
  const e = await p.screenshot();
  await ir(p, 18.0);
  await ir(p, CAOS);
  const f2 = await p.screenshot();
  const ef = await iguales(e, f2);
  ok(ef.ok, `${formato}: los reportes cayendo, a ${coma(CAOS)} s, también (${ef.distintos} píxeles distintos en mancha, ${ef.todos} en total)`);
  await ir(p, SUCCION);
  const g = await p.screenshot();
  await ir(p, 40.0);
  await ir(p, SUCCION);
  const h2 = await p.screenshot();
  const gh = await iguales(g, h2);
  ok(gh.ok, `${formato}: el portal tragándoselos, a ${coma(SUCCION)} s, también (${gh.distintos} píxeles distintos en mancha, ${gh.todos} en total)`);
  /* Y la comparación sabe decir que NO: dos instantes distintos tienen que dar distinto */
  const ac = await iguales(a, c);
  ok(!ac.ok, `${formato}: ${coma(CHAT)} s y ${coma(LICENCIA)} s se distinguen (${ac.distintos} píxeles distintos)`);

  /* ── El gancho (ADR-019) ──
     El primer cuadro es la miniatura del video: tiene que traer el pedido entero, adentro del
     cuadro, y ya algunos reportes a la vista. La escala de cada carta se lee de su matriz (la
     de la carta, que solo escala: el giro es de la capa de afuera) */
  const fondo = formato === '9x16' ? h * 0.79 : h;
  await ir(p, 0);
  const primero = await p.evaluate(() => {
    const g = document.querySelector('.an-s1-globo').getBoundingClientRect();
    const enteras = [...document.querySelectorAll('.an-s1-carta')].filter((c) => {
      const t = getComputedStyle(c).transform;
      return t === 'none' || Math.abs(new DOMMatrixReadOnly(t).a - 1) < 0.01;
    }).length;
    return {
      texto: document.querySelector('.an-s1-pregunta').textContent.trim(),
      opacidad: Number(getComputedStyle(document.querySelector('.an-s1-chat')).opacity),
      dentro: g.left >= 0 && g.top >= 0 && g.right <= innerWidth && g.bottom <= innerHeight,
      aviso: document.querySelector('.an-s1-aviso').textContent.trim(),
      enteras,
    };
  });
  ok(primero.texto === '¿Me pasas el reporte?' && primero.opacidad === 1 && primero.dentro && primero.enteras >= 3 && primero.aviso === '3',
    `${formato}: el primer cuadro ya es el gancho («${primero.texto}»${primero.dentro ? '' : ', SE SALE DEL CUADRO'}, ${primero.enteras} reportes a la vista, ${primero.aviso} sin leer)`);

  /* La portada (la foto que se ofrece como miniatura): los siete reportes enteros y adentro, y
     nada tapa el pedido ni lo que hay que leer (los dos mensajes y el aviso de la licencia).
     Las cajas de lo girado son un poco más grandes que lo que se ve: se tolera un 3 % */
  await ir(p, 2.45);
  const portada = await p.evaluate((piso) => {
    const r = (sel) => document.querySelector(sel).getBoundingClientRect();
    const globo = r('.an-s1-globo');
    const cartas = [...document.querySelectorAll('.an-s1-pieza')].map((pz) => {
      const c = pz.querySelector('.an-s1-carta');
      return { id: pz.className.match(/an-s1-pieza--(\w)/)[1], r: c.getBoundingClientRect(), escala: new DOMMatrixReadOnly(getComputedStyle(c).transform).a };
    });
    const cruce = (a, b) =>
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const leer = { c: '.an-s1-pieza--c .an-s1-msj > span:last-child', e: '.an-s1-pieza--e .an-s1-carta__txt', f: '.an-s1-pieza--f .an-s1-msj > span:last-child' };
    const orden = cartas.map((c) => c.id);
    const tapados = [];
    for (const [id, sel] of Object.entries(leer)) {
      const t = r(sel);
      for (const otra of cartas.slice(orden.indexOf(id) + 1)) {
        const parte = cruce(t, otra.r) / (t.width * t.height);
        if (parte > 0.03) tapados.push(`${id} bajo ${otra.id} (${Math.round(parte * 100)} %)`);
      }
    }
    return {
      enteras: cartas.filter((c) => Math.abs(c.escala - 1) < 0.01).length,
      fuera: cartas.filter((c) => c.r.left < 0 || c.r.top < 0 || c.r.right > innerWidth || c.r.bottom > piso).map((c) => c.id),
      sobreGlobo: cartas.filter((c) => cruce(c.r, globo) > 0).map((c) => c.id),
      tapados,
      aviso: document.querySelector('.an-s1-aviso').textContent.trim(),
    };
  }, fondo);
  ok(portada.enteras === 7 && !portada.fuera.length && !portada.sobreGlobo.length && !portada.tapados.length && portada.aviso === '27',
    `${formato}: la portada trae los ${portada.enteras} reportes adentro${formato === '9x16' ? ' y sobre el 79 %' : ''}, sin pisar el pedido ni lo que hay que leer (${portada.aviso} sin leer` +
      `${portada.fuera.length ? `; afuera: ${portada.fuera.join(', ')}` : ''}${portada.sobreGlobo.length ? `; sobre el globo: ${portada.sobreGlobo.join(', ')}` : ''}${portada.tapados.length ? `; tapado: ${portada.tapados.join(', ')}` : ''})`);

  /* El portal se traga todo hasta el centro EXACTO de su ventana: lo que viaja lo mide el
     script (--hx, --hy) y depende del formato y del largo de cada texto. A los 3,47 s ya
     terminó todo, y la toma 1 se sigue viendo hasta los 3,5 */
  await ir(p, 3.47);
  const tragado = await p.evaluate(() => {
    const centro = (el) => {
      const q = el.getBoundingClientRect();
      return { x: (q.left + q.right) / 2, y: (q.top + q.bottom) / 2 };
    };
    const d = centro(document.querySelector('.an-s2-centro'));
    const piezas = [...document.querySelectorAll('[data-a="absorbe"]')];
    return {
      cuantas: piezas.length,
      lejos: Math.max(...piezas.map((el) => { const c = centro(el); return Math.hypot(c.x - d.x, c.y - d.y); })),
      opacidad: Math.max(...piezas.map((el) => Number(getComputedStyle(el).opacity))),
    };
  });
  ok(tragado.cuantas === 8 && tragado.lejos < 4 && tragado.opacidad < 0.01,
    `${formato}: el portal se traga las ${tragado.cuantas} piezas hasta el centro de su ventana (la más lejana queda a ${tragado.lejos.toFixed(1)} px, opacidad ${tragado.opacidad})`);

  /* La toma de los tableros: el titular no pisa la ventana, y la ventana entra en el cuadro */
  await ir(p, 5.0);
  const tableros = await p.evaluate(() => {
    const rg = document.createRange();
    rg.selectNodeContents(document.querySelector('.an-s2-todos'));
    const t = rg.getBoundingClientRect();
    const v = document.querySelector('.an-s2-ventana .an-ui__in').getBoundingClientRect();
    return {
      aire: Math.round(Math.max(v.top - t.bottom, v.left - t.right)),
      dentro: v.left >= 0 && v.top >= 0 && v.right <= innerWidth && v.bottom <= innerHeight,
    };
  });
  ok(tableros.aire >= 16 && tableros.dentro,
    `${formato}: «Todos tus tableros» no pisa la ventana (aire: ${tableros.aire} px)${tableros.dentro ? '' : ' · LA VENTANA SE SALE DEL CUADRO'}`);

  /* La de la licencia: el sello y las caras entran (en 9:16, sobre el 79 %), el sello no pisa
     el texto, la tacha cruza «1.000 licencias» de punta a punta y el número llegó a +996 */
  await ir(p, 9.0);
  const licencia = await p.evaluate((piso) => {
    const r = (sel) => document.querySelector(sel).getBoundingClientRect();
    const dentro = (b) => b.left >= 0 && b.top >= 0 && b.right <= innerWidth && b.bottom <= piso;
    const sello = r('.an-s2-sello');
    const gente = r('.an-s2-gente');
    const rg = document.createRange();
    rg.selectNodeContents(document.querySelector('.an-s2-lic'));
    const texto = rg.getBoundingClientRect();
    const no = r('.an-s2-no span');
    const tacha = r('.an-s2-tacha');
    return {
      sello: dentro(sello),
      gente: dentro(gente),
      abajo: Math.round(gente.bottom),
      aire: Math.round(Math.max(sello.top - texto.bottom, sello.left - texto.right)),
      tacha: tacha.left <= no.left && tacha.right >= no.right,
      mas: document.querySelector('.an-s2-mas').textContent.trim(),
    };
  }, fondo);
  ok(licencia.sello && licencia.gente && licencia.aire >= 8 && licencia.tacha && licencia.mas === '+996',
    `${formato}: la licencia entra entera (sello ${licencia.sello ? 'adentro' : 'AFUERA'}, caras hasta ${licencia.abajo} de ${Math.round(fondo)} px, aire con el texto ${licencia.aire} px, tacha ${licencia.tacha ? 'de punta a punta' : 'CORTA'}, ${licencia.mas})`);
  /* El encuadre de la toma 6, que se rompió en tres formatos distintos: la mirada a la lengüeta
     tapaba el subtítulo (1:1 y 16:9), la cámara adentro le pasaba por encima a la firma (1:1) y
     en 9:16 dejaba el campo de la pregunta debajo del 79 %, donde van los botones de Reels */
  await ir(p, 25.75);
  const mirada = await p.evaluate(() => {
    const v = document.querySelector('.an-s6-ventana').getBoundingClientRect();
    const rg = document.createRange();
    rg.selectNodeContents(document.querySelector('.an-s6-sub'));
    const s = rg.getBoundingClientRect();
    return Math.round(Math.max(v.top - s.bottom, v.left - s.right));
  });
  ok(mirada >= 16, `${formato}: al mirar la lengüeta, la ventana no tapa el subtítulo (aire: ${mirada} px)`);
  await ir(p, 30.0);
  const adentro = await p.evaluate(() => {
    const v = document.querySelector('.an-s6-ventana').getBoundingClientRect();
    const c = document.querySelector('.an-s6-panel').getBoundingClientRect();
    const firma = Math.max(...[...document.querySelectorAll('.an-firma')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0).map((r) => r.bottom));
    return { arriba: Math.round(v.top - firma), abajo: Math.round(v.bottom), izq: Math.round(c.left), der: Math.round(c.right) };
  });
  const piso = formato === '9x16' ? Math.round(h * 0.79) : h;
  ok(adentro.arriba >= 20 && adentro.abajo <= piso + 1 && adentro.izq >= 0 && adentro.der <= w,
    `${formato}: con la cámara adentro, el chat entra entero (aire con la firma ${adentro.arriba} px · abajo termina en ${adentro.abajo} de ${piso} · panel de ${adentro.izq} a ${adentro.der} px)`);
  ok(p.errores.length === 0, `${formato}: sin errores ni CSP${p.errores.length ? ` (${p.errores.join(' | ')})` : ''}`);
  await p.context().close();
}

console.log('Detalles que ya se rompieron una vez');
{
  const p = await abrir({ viewport: { width: 1080, height: 1920 } }, `${URL}?render=1&formato=9x16`);
  await ir(p, 17.0);
  const aro = await p.evaluate(() => Number(getComputedStyle(document.querySelector('.an-toque')).opacity));
  ok(aro === 0, `el aro del toque no se ve antes de tocar (opacidad ${aro} a los 17 s)`);
  /* El de la lengüeta del chat, tampoco: toca a los 25,75 s */
  await ir(p, 25.5);
  const aroChat = await p.evaluate(() => Number(getComputedStyle(document.querySelector('.an-s6-toque')).opacity));
  ok(aroChat === 0, `el aro de la lengüeta del chat no se ve antes de tocarla (opacidad ${aroChat} a los 25,5 s)`);
  /* Y cuando toca, toca la lengüeta: el minificador le había borrado el translate que la centraba
     y el aro caía medio alto más arriba, en el reporte */
  await ir(p, 25.8);
  const toque = await p.evaluate(() => {
    const a = document.querySelector('.an-s6-toque').getBoundingClientRect();
    const l = document.querySelector('.an-s6-lengueta').getBoundingClientRect();
    return { dy: Math.abs((a.top + a.bottom) / 2 - (l.top + l.bottom) / 2), dx: Math.abs((a.left + a.right) / 2 - (l.left + l.right) / 2), alto: l.height, ancho: l.width };
  });
  ok(toque.dy < toque.alto * 0.1 && toque.dx < toque.ancho * 0.5,
    `el aro del toque cae sobre la lengüeta (corrido ${Math.round(toque.dx)} px y ${Math.round(toque.dy)} px de su centro)`);
  /* Volver atrás trae también las animaciones SIN relleno: getAnimations() deja de listar la que
     ya terminó y el motor la perdía. El pulso del botón de enviar no volvía a verse, ni el giro
     de la tarjeta del login en la segunda vuelta del bucle */
  await ir(p, 52.0);
  await ir(p, 29.33);
  const pulso = await p.evaluate(() => getComputedStyle(document.querySelector('.an-s6-enviar')).backgroundColor);
  await ir(p, 52.0);
  await ir(p, 11.83);
  const giro = await p.evaluate(() => getComputedStyle(document.querySelector('.an-login__giro')).transform);
  ok(pulso !== 'rgb(79, 70, 229)' && giro !== 'none',
    `al volver atrás, las animaciones sin relleno se mueven igual (botón ${pulso} a los 29,33 s; tarjeta ${giro === 'none' ? 'sin girar' : 'girando'} a los 11,83 s)`);
  /* El chat se abre AL COSTADO del tablero (el pedido del dueño): con el panel abierto, su borde
     derecho es el de la ventana y el reporte sigue a la vista a su izquierda */
  await ir(p, 27.0);
  const costado = await p.evaluate(() => {
    const v = document.querySelector('.an-s6-ventana .an-ui__in').getBoundingClientRect();
    const c = document.querySelector('.an-s6-panel').getBoundingClientRect();
    const r = document.querySelector('.an-s6-rep .an-reporte__cuerpo').getBoundingClientRect();
    return { borde: Math.abs(c.right - v.right), reporte: r.right <= c.left + 1 && r.width > 0, panel: c.width / v.width };
  });
  ok(costado.borde < 2 && costado.reporte && costado.panel > 0.4 && costado.panel < 0.5,
    `el panel se abre al costado del reporte (borde a ${costado.borde.toFixed(1)} px, ocupa ${Math.round(costado.panel * 100)} % de la ventana)`);
  /* Y las dos preguntas se tipean en el mismo campo, una después de la otra */
  await ir(p, 28.4);
  const q1 = await p.evaluate(() => [...document.querySelectorAll('.an-s6 [data-a="tipeo"]')].map((t) => t.textContent.length));
  await ir(p, 33.7);
  const q2 = await p.evaluate(() => [...document.querySelectorAll('.an-s6 [data-a="tipeo"]')].map((t) => t.textContent.length));
  ok(q1[0] > 10 && q1[1] === 0 && q2[0] === 0 && q2[1] > 5, `las dos preguntas se tipean por turno (${q1.join('/')} → ${q2.join('/')} letras)`);
  await p.context().close();
}

console.log('El CSS que sobrevive al minificador');
{
  /* Lightning CSS (el minificador de Vite) trata transform y las propiedades sueltas (translate,
     rotate, scale) como una sola: en una regla que tiene las dos, borra la suelta o la funde en el
     transform estático, que la animación después reemplaza entero. La lengüeta del chat perdió así
     su translate, y la tacha del gancho viejo su giro de −4°. Esa tacha se fue con el gancho
     (ADR-019) y con ella la única excepción que había. */
  const css = readFileSync(new globalThis.URL('../src/components/anuncio/anuncio.css', import.meta.url), 'utf8');
  const mezclas = [];
  for (const [, sel, cuerpo] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const props = new Set([...cuerpo.matchAll(/^\s*(translate|rotate|scale|transform)\s*:/gm)].map((m) => m[1]));
    const nombre = sel.trim().split('\n').pop().trim();
    if (props.has('transform') && props.size > 1) mezclas.push(nombre);
  }
  ok(mezclas.length === 0, `ninguna regla mezcla transform con translate, rotate o scale${mezclas.length ? ` (${mezclas.join(', ')})` : ''}`);
}

/* Con movimiento reducido no se reproduce: queda un cuadro quieto, y ese cuadro tiene que ser el
   cierre YA ARMADO. Estuvo roto desde la primera versión, por dos cosas a la vez: la regla global
   de movimiento reducido (global.css) acortaba toda animación a 0,01 ms, así que al ir a cualquier
   instante todas habían terminado y cada toma quedaba oculta (cuadro vacío); y el instante elegido
   (27,5 s) caía antes de que el cierre estuviera armado. El botón y las fichas entran con escala,
   no con opacidad: se mide su escala (ancho dibujado / ancho de caja), porque su opacidad es 1
   siempre y no probaría nada. Y el título se mide con DOMMatrix: Chrome informa la identidad como
   `matrix(1, 0, 0, 1, 0, 0)` y no como `none`, así que comparar el texto daba rojo con el título
   en su lugar.
   Lo primero es QUÉ TOMA se ve: con la regla global encima, cada elemento del cierre termina en
   su estado final (escala 1, opacidad 1) y el cuadro igual sale vacío, porque la toma entera
   quedó oculta. Medir solo los elementos daba verde con el defecto puesto (saboteado). */
console.log('Con movimiento reducido');
{
  const p = await abrir({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, URL);
  const vis = await tomaVisible(p);
  ok(vis.length === 1 && vis[0] === 'an-s9', `se ve el cierre (se ve ${vis.join(', ') || 'nada'})`);
  const quieto = await p.evaluate(() => {
    const escala = (s) => {
      const el = document.querySelector(s);
      return Math.round((el.getBoundingClientRect().width / el.offsetWidth) * 100) / 100;
    };
    const ultima = [...document.querySelectorAll('.an-s9-titulo .an-p > span')].at(-1);
    const t = getComputedStyle(ultima).transform;
    return {
      pausa: document.querySelector('[data-a="raiz"]').hasAttribute('data-pausa'),
      boton: escala('.an-cta'),
      ficha: escala('.an-fichas li:last-child'),
      url: Number(getComputedStyle(document.querySelector('.an-url')).opacity),
      lema: Number(getComputedStyle(document.querySelector('.an-s9-lema')).opacity),
      lemaTexto: document.querySelector('.an-s9-lema').innerText.replace(/\s+/g, ' ').trim(),
      /* Por la matriz: el ancho contra offsetWidth (entero) daba 0,99 por redondeo */
      chip: (() => {
        const t = getComputedStyle(document.querySelector('.an-s9-lema .an-chip-ia')).transform;
        return t === 'none' || new DOMMatrixReadOnly(t).isIdentity ? 1 : t;
      })(),
      hablan: (() => {
        const t = getComputedStyle(document.querySelector('.an-s9-lema .an-lema__hablan > span')).transform;
        return t === 'none' || new DOMMatrixReadOnly(t).isIdentity;
      })(),
      titulo: t === 'none' || new DOMMatrixReadOnly(t).isIdentity,
      tituloTexto: t,
    };
  });
  ok(quieto.pausa, 'no se reproduce solo');
  ok(quieto.boton === 1 && quieto.ficha === 1, `el cierre está armado: botón y última ficha a escala ${quieto.boton} y ${quieto.ficha} (deben ser 1)`);
  ok(quieto.url === 1, `la URL se ve (opacidad ${quieto.url})`);
  /* El lema del producto firma el cierre (ADR-018) */
  ok(quieto.lema === 1 && quieto.chip === 1 && quieto.hablan,
    `el lema se ve entero: «${quieto.lemaTexto}» (opacidad ${quieto.lema}, chip de IA a escala ${quieto.chip}, «HABLAN» ${quieto.hablan ? 'arriba' : 'sin subir'})`);
  ok(quieto.titulo, `el título terminó de subir (${quieto.tituloTexto})`);
  ok(p.errores.length === 0, `sin errores ni CSP${p.errores.length ? ` (${p.errores.join(' | ')})` : ''}`);
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
  /* La duración vive en tres lugares (el reloj de anuncio.css, DURACION de anuncio.ts y el título
     de la página) y al alargar el anuncio hubo que cambiar los tres: si uno queda atrás, el
     video se corta o el reloj se adelanta, sin ningún error */
  const dur = await p.evaluate(() => ({
    script: window.__anuncio.duracion,
    reloj: Number(document.querySelector('[data-a="reloj"]').getAnimations()[0].effect.getTiming().duration),
    titulo: document.querySelector('.an-barra__nombre').textContent.trim(),
  }));
  ok(
    dur.script === dur.reloj && dur.titulo.endsWith(`${dur.script / 1000} s`),
    `la duración coincide: script ${dur.script} ms, reloj ${dur.reloj} ms, título «${dur.titulo}»`,
  );
  /* Los videos se descargan del release de GitHub, no del sitio (ADR-016) */
  const enlaces = await p.evaluate(() => [...document.querySelectorAll('.an-descarga')].map((a) => a.href));
  ok(
    enlaces.length === 4 && enlaces.every((h) => /^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\/anuncio-portal-bi\/portal-bi-anuncio-(9x16|4x5|1x1|16x9)\.mp4$/.test(h)),
    `los cuatro botones bajan el MP4 del release (${enlaces.length} enlaces)`,
  );
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

/* La versión para quien revende (ADR-020): el mismo anuncio, con lo que hacemos nosotros en la
   ráfaga, lo que le cobramos (la toma 10) y el cierre firmado para el socio. Dura más */
console.log('La versión para socios');
{
  const SOCIO = `${BASE}/propuestas/portal-bi-ribentek/`;
  const ESPERADO_SOCIO = [
    [1.0, 'an-s1'],
    [8.5, 'an-s2'],
    [17.0, 'an-s4'],
    [22.0, 'an-s5'],
    [32.0, 'an-s6'],
    [47.0, 'an-s8'],
    [53.0, 'an-s10'],
    [59.5, 'an-s9'],
  ];
  for (const [formato, [w, h]] of Object.entries({ '9x16': FORMATOS['9x16'], '16x9': FORMATOS['16x9'] })) {
    const p = await abrir({ viewport: { width: w, height: h } }, `${SOCIO}?render=1&formato=${formato}`);
    const mal = [];
    for (const [t, toma] of ESPERADO_SOCIO) {
      await ir(p, t);
      const vis = await tomaVisible(p);
      if (!(vis.length === 1 && vis[0] === toma)) mal.push(`${t} s: ${vis.join(', ') || 'nada'} (debe ser ${toma})`);
    }
    ok(!mal.length, `${formato}: cada toma a su tiempo, con la del precio antes del cierre${mal.length ? ` (${mal.join('; ')})` : ''}`);
    await ir(p, 51.2);
    const a = await p.screenshot();
    await ir(p, 20.0);
    await ir(p, 51.2);
    const b = await p.screenshot();
    const ab = await iguales(a, b);
    ok(ab.ok, `${formato}: el precio entrando, a 51,2 s, da el mismo cuadro dos veces (${ab.distintos} píxeles distintos en mancha)`);
    ok(p.errores.length === 0, `${formato}: sin errores ni CSP${p.errores.length ? ` (${p.errores.join(' | ')})` : ''}`);
    await p.context().close();
  }
  /* Lo que dice, y lo que no: el dueño no factura, así que la página no lo puede prometer */
  const p = await abrir({ viewport: { width: 1440, height: 900 } }, SOCIO);
  const dice = await p.evaluate(() => ({
    script: window.__anuncio.duracion,
    reloj: Number(document.querySelector('[data-a="reloj"]').getAnimations()[0].effect.getTiming().duration),
    titulo: document.querySelector('.an-barra__titulo').textContent.replace(/\s+/g, ' ').trim(),
    cortes: [...document.querySelectorAll('.an-corte .an-h1')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()),
    precio: document.querySelector('.an-precio__n').textContent.replace(/\s+/g, ''),
    firma: document.querySelector('.an-url').textContent.trim(),
    factura: /factur/i.test(document.body.innerText + document.body.innerHTML),
    formato: document.querySelector('.an-lienzo').dataset.formato,
  }));
  ok(dice.script === 62000 && dice.reloj === 62000, `dura lo mismo para el script y el reloj (${dice.script} ms, ${dice.reloj} ms)`);
  ok(dice.titulo.startsWith('Nuevo producto de Data Studio') && dice.titulo.includes('Ribentek'),
    `el título de arriba dice qué es y para quién («${dice.titulo}»)`);
  ok(dice.cortes.join(' | ') === 'Nosotros lo instalamos. | Lo dejamos funcionando. | Y lo mantenemos al día. | Tú vendes y cobras.',
    `la ráfaga cuenta lo que hacemos nosotros («${dice.cortes.join(' | ')}»)`);
  ok(dice.precio === 'US$60' && dice.firma === 'Data Studio × Ribentek', `el precio y la firma del socio (${dice.precio}, «${dice.firma}»)`);
  ok(!dice.factura, 'no dice «factura» en ninguna parte (no se factura)');
  ok(dice.formato === '16x9', `en una pantalla acostada elige 16:9 solo (${dice.formato})`);

  /* Por páginas (el dueño, 18/10: «que ellos decidan cuándo avanzar de escena o volver»): cada
     página se arma desde donde terminó la anterior y se queda quieta en su final */
  const estado = (q) =>
    q.evaluate(() => ({
      t: Math.round(document.querySelector('[data-a="reloj"]').getAnimations()[0].currentTime),
      quieta: document.querySelector('[data-a="raiz"]').hasAttribute('data-pausa'),
      pagina: window.__anuncio.paginas.actual(),
      cuenta: document.querySelector('[data-a="pagina-actual"]').textContent,
      punto: [...document.querySelectorAll('[data-a="pagina"]')].findIndex((b) => b.getAttribute('aria-current') === 'step'),
      sinAnterior: document.querySelector('[data-a="anterior"]').disabled,
      sinSiguiente: document.querySelector('[data-a="siguiente"]').disabled,
    }));
  const cuadro = (q) => q.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const paradas = await p.evaluate(() => document.querySelector('[data-a="raiz"]').dataset.paginas.split(',').map(Number));
  const nPuntos = await p.evaluate(() => document.querySelectorAll('[data-a="pagina"]').length);
  ok(paradas.length === nPuntos && paradas.every((s, k) => s > (paradas[k - 1] ?? 0)) && paradas.at(-1) * 1000 < dice.script,
    `${paradas.length} páginas en orden, un punto por página y todas antes del final (${paradas.join(', ')})`);

  await p.waitForTimeout(3300);
  let e = await estado(p);
  await p.waitForTimeout(800);
  const rato = await estado(p);
  ok(e.t === 2500 && e.quieta && rato.t === 2500 && e.pagina === 0 && e.sinAnterior && !e.sinSiguiente,
    `la primera página se arma y se queda quieta en su final, sin seguir sola (${e.t} ms, y ${rato.t} ms un rato después)`);

  await p.click('[data-a="siguiente"]');
  await p.waitForTimeout(400);
  const armando = await estado(p);
  await p.waitForTimeout(3600);
  e = await estado(p);
  ok(!armando.quieta && armando.t > 2500 && armando.t < 6100 && e.t === 6100 && e.quieta && e.cuenta === '2' && e.punto === 1 && !e.sinAnterior,
    `«Siguiente» arma la segunda página y se queda en su final (${armando.t} → ${e.t} ms, contador ${e.cuenta}, punto ${e.punto + 1})`);

  await p.click('[data-a="siguiente"]');
  await p.waitForTimeout(300);
  await p.click('[data-a="siguiente"]');
  e = await estado(p);
  ok(e.t === 9900 && e.quieta && e.pagina === 2, `«Siguiente» con la página a medio armar la completa, no la salta (${e.t} ms, página ${e.pagina + 1})`);

  /* El foco quedó en «Siguiente» después del clic: las flechas tienen que servir igual */
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(300);
  const vuelve = await estado(p);
  await p.waitForTimeout(3700);
  e = await estado(p);
  ok(!vuelve.quieta && vuelve.t >= 2500 && vuelve.t < 6100 && e.t === 6100 && e.pagina === 1,
    `la flecha izquierda vuelve y arma de nuevo la página anterior, con el foco en un botón (${vuelve.t} → ${e.t} ms)`);

  await p.click('.an-lienzo');
  await p.waitForTimeout(4200);
  e = await estado(p);
  ok(e.t === 9900 && e.pagina === 2, `tocar la escena es seguir (${e.t} ms, página ${e.pagina + 1})`);

  await p.click('[data-a="pagina"] >> nth=15');
  await p.waitForTimeout(300);
  e = await estado(p);
  ok(e.pagina === 15 && e.t > 50000 && e.t < 55600 && e.cuenta === '16' && e.punto === 15,
    `un punto abre su página desde el principio de ella (${e.t} ms, contador ${e.cuenta})`);

  await p.keyboard.press('End');
  await cuadro(p);
  e = await estado(p);
  const alFinal = await tomaVisible(p);
  ok(e.t === 61900 && e.quieta && e.sinSiguiente && alFinal.join() === 'an-s9',
    `Fin va al cierre armado y apaga «Siguiente» (${e.t} ms, ${alFinal.join(', ') || 'nada'})`);

  await p.keyboard.press('Home');
  await p.waitForTimeout(200);
  e = await estado(p);
  ok(e.pagina === 0 && e.t < 2500 && !e.quieta && e.sinAnterior, `Inicio vuelve a la primera y la arma (${e.t} ms)`);

  /* El final de cada página es un cuadro para leer: una toma entera, nunca el cruce de dos. Los
     cortes de PAGINAS se eligieron mirándolos; esto avisa si una toma se corre y deja uno a medias */
  const TOMA_DE_PAGINA = ['an-s1', 'an-s2', 'an-s2', 'an-s3', 'an-s4', 'an-s5', 'an-s6', 'an-s6', 'an-s6', 'an-s6', 'an-s7', 'an-s8', 'an-s8', 'an-s8', 'an-s8', 'an-s10', 'an-s9'];
  const cruces = [];
  for (let k = 0; k < paradas.length; k++) {
    await p.evaluate((k) => window.__anuncio.paginas.abrir(k, false), k);
    await cuadro(p);
    const vis = await tomaVisible(p);
    if (vis.join() !== TOMA_DE_PAGINA[k]) cruces.push(`página ${k + 1} (${paradas[k]} s): ${vis.join(', ') || 'nada'}`);
  }
  ok(!cruces.length && paradas.length === TOMA_DE_PAGINA.length,
    `cada página termina en su toma, entera${cruces.length ? ` (${cruces.join('; ')})` : ''}`);
  ok(p.errores.length === 0, `sin errores ni CSP${p.errores.length ? ` (${p.errores.join(' | ')})` : ''}`);
  await p.context().close();

  /* El formato y la barra de páginas según cómo se tenga el teléfono. Acostado, las páginas van
     a una columna al costado: abajo le quitaban al anuncio la altura que ahí es lo que falta */
  for (const [w, h, esperado] of [[320, 568, '9x16'], [390, 844, '9x16'], [844, 390, '16x9']]) {
    const tel = await abrir({ viewport: { width: w, height: h } }, SOCIO);
    const m = await tel.evaluate(() => {
      /* Por el borde de cada pieza, no por el scrollWidth del documento: el sitio recorta con
         overflow-x: clip, y el documento mide lo que la pantalla aunque algo se salga. Medido así,
         a 320 px se veía «320» con la barra ensanchando la página a 322 */
      /* Los puntos escondidos en el teléfono miden 0 y quedan afuera */
      const cajas = [...document.querySelectorAll('.an-barra, .an-sala, .an-paginas, .an-barra button, .an-paginas button')]
        .map((el) => el.getBoundingClientRect())
        .filter((c) => c.width > 0);
      const sig = document.querySelector('[data-a="siguiente"]').getBoundingClientRect();
      return {
        formato: document.querySelector('.an-lienzo').dataset.formato,
        izquierda: Math.round(Math.min(...cajas.map((c) => c.left))),
        derecha: Math.round(Math.max(...cajas.map((c) => c.right))),
        abajo: Math.round(sig.bottom),
        alto: Math.round(document.querySelector('.an-lienzo').getBoundingClientRect().height),
      };
    });
    ok(m.formato === esperado && m.izquierda >= 0 && m.derecha <= w && m.abajo <= h,
      `${w}×${h}: elige ${esperado} y nada se sale de la pantalla (${m.formato}, de ${m.izquierda} a ${m.derecha} px, «Siguiente» hasta ${m.abajo})`);
    if (w > h) ok(m.alto >= 300, `${w}×${h}: acostado, el anuncio usa la altura (${m.alto} px de alto)`);
    await tel.context().close();
  }

  /* Con movimiento reducido cada página aparece ya armada, y nada se mueve */
  const quieto = await abrir({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, SOCIO);
  await cuadro(quieto);
  const q1 = await estado(quieto);
  const v1 = await tomaVisible(quieto);
  await quieto.click('[data-a="siguiente"]');
  const q2 = await estado(quieto);
  await quieto.keyboard.press('End');
  await cuadro(quieto);
  const v3 = await tomaVisible(quieto);
  const firma = await quieto.evaluate(() => Number(getComputedStyle(document.querySelector('.an-url')).opacity));
  ok(q1.t === 2500 && q1.quieta && v1.join() === 'an-s1' && q2.t === 6100 && q2.quieta,
    `con movimiento reducido cada página aparece ya armada (${q1.t} ms, y con «Siguiente» ${q2.t} ms al instante)`);
  ok(v3.join() === 'an-s9' && firma === 1, `y Fin muestra el cierre con su firma (${v3.join(', ') || 'nada'}, opacidad ${firma})`);
  await quieto.context().close();
}

await comparador.context().close();
await navegador.close();
console.log(fallas ? `\n${fallas} falla(s).` : '\nSin problemas.');
process.exit(fallas ? 1 : 0);
