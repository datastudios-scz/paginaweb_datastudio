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
 *  · Ninguna regla mezcla transform con translate, rotate o scale: el minificador borra la suelta.
 *  · La toma 6 entra en cada formato: sin tapar el subtítulo ni la firma, y en 9:16 sobre el 79 %.
 *  · La página: se reproduce sola, pausa con espacio, cambia de formato sin dejar de reproducir.
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
      .map((e) => [...e.classList].find((c) => /^an-s\d$/.test(c))),
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
   dibujar el gráfico, la licencia abriéndose en la espiral y los asientos llenándose. */
const CHAT = 30.9;
const ESPIRAL = 7.7;
const ASIENTOS = 2.5;
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
  await ir(p, ESPIRAL);
  await ir(p, CHAT);
  const b = await p.screenshot();
  const ab = await iguales(a, b);
  ok(ab.ok, `${formato}: ir a ${coma(CHAT)} s dos veces da el mismo cuadro (${ab.distintos} píxeles distintos en mancha, ${ab.todos} en total, máx. ${ab.maximo})`);
  await ir(p, ESPIRAL);
  const c = await p.screenshot();
  await ir(p, 52.0);
  await ir(p, ESPIRAL);
  const d = await p.screenshot();
  const cd = await iguales(c, d);
  ok(cd.ok, `${formato}: la espiral de las mil personas también, a ${coma(ESPIRAL)} s (${cd.distintos} píxeles distintos en mancha, ${cd.todos} en total)`);
  /* El lienzo tiene dos fases: los asientos (hasta ~6,7 s) y la espiral (desde 7,15 s). En la
     espiral ya no queda ningún asiento: se prueban aparte, mientras se llenan. */
  await ir(p, ASIENTOS);
  const e = await p.screenshot();
  await ir(p, 18.0);
  await ir(p, ASIENTOS);
  const f2 = await p.screenshot();
  const ef = await iguales(e, f2);
  ok(ef.ok, `${formato}: los mil asientos, a ${coma(ASIENTOS)} s, también (${ef.distintos} píxeles distintos en mancha, ${ef.todos} en total)`);
  /* Y la comparación sabe decir que NO: dos instantes distintos tienen que dar distinto */
  const ac = await iguales(a, c);
  ok(!ac.ok, `${formato}: ${coma(CHAT)} s y ${coma(ESPIRAL)} s se distinguen (${ac.distintos} píxeles distintos)`);
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
  await ir(p, 4.5);
  const lineas = await p.evaluate(() => {
    const m = document.querySelector('.an-monto__n');
    const r = m.getBoundingClientRect();
    return Math.round(r.height / parseFloat(getComputedStyle(m).lineHeight || getComputedStyle(m).fontSize));
  });
  ok(lineas <= 1, `la cifra del gancho entra en una línea (${lineas})`);
  await p.context().close();
}

console.log('El CSS que sobrevive al minificador');
{
  /* Lightning CSS (el minificador de Vite) trata transform y las propiedades sueltas (translate,
     rotate, scale) como una sola: en una regla que tiene las dos, borra la suelta o la funde en el
     transform estático, que la animación después reemplaza entero. La lengüeta del chat perdió así
     su translate. La tacha de la toma 1 perdió su giro de −4° desde la primera versión y sale
     derecha: se deja (es la que se aprobó en los videos), pero queda anotada acá. */
  const css = readFileSync(new globalThis.URL('../src/components/anuncio/anuncio.css', import.meta.url), 'utf8');
  const CONOCIDAS = new Set(['.an-tacha']);
  const mezclas = [];
  for (const [, sel, cuerpo] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const props = new Set([...cuerpo.matchAll(/^\s*(translate|rotate|scale|transform)\s*:/gm)].map((m) => m[1]));
    const nombre = sel.trim().split('\n').pop().trim();
    if (props.has('transform') && props.size > 1 && !CONOCIDAS.has(nombre)) mezclas.push(nombre);
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

await comparador.context().close();
await navegador.close();
console.log(fallas ? `\n${fallas} falla(s).` : '\nSin problemas.');
process.exit(fallas ? 1 : 0);
