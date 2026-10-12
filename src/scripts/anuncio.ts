/**
 * El anuncio del Portal BI (/portal-bi/anuncio/): la línea de tiempo.
 *
 * El movimiento vive en CSS (anuncio.css): animaciones con su retardo contado desde el
 * segundo 0. Acá se manejan como un solo video: se pausan y se llevan al instante que se pida
 * (`ir(ms)`), o se reproducen todas juntas. Lo que no puede ser CSS va dibujado o escrito en
 * función del tiempo — los mil asientos del lienzo, los contadores, la pregunta que se tipea —
 * así cualquier instante sale siempre igual, que es lo que hace falta para grabar a MP4 cuadro
 * por cuadro (scripts/grabar-anuncio.mjs llama a `window.__anuncio.ir`).
 *
 * CSP: nada de atributos style; el tamaño del lienzo y los textos se cambian por CSSOM/DOM.
 */

import { PRECIO_LICENCIA_USD } from '../data/sitio';

const DURACION = 46000;
const FORMATOS = ['9x16', '4x5', '1x1', '16x9'] as const;
type Formato = (typeof FORMATOS)[number];

const PERSONAS = 1000;
const AMARILLO = '#f2c811';
const TINTA = '#001720';
const VERDE_CLARO = '#4dcfc1';

/* Tiempos del lienzo (s): los mil asientos se llenan, colapsan en una licencia y la licencia
   vuelve a abrirse en mil personas. Tienen que coincidir con las tomas 1 y 2 de anuncio.css. */
const LLENA_DESDE = -0.6;
const LLENA_HASTA = 3.0;
const COLAPSA_DESDE = 6.0;
const COLAPSA_DUR = 0.46;
const ABRE_DESDE = 7.15;
const ABRE_HASTA = 8.05;
const APAGA_DESDE = 9.85;
const APAGA_HASTA = 10.1;

declare global {
  interface Window {
    __anuncio?: { ir: (ms: number) => void; duracion: number; listo: Promise<void>; formato: () => string };
  }
}

const raiz = document.querySelector<HTMLElement>('[data-a="raiz"]');
if (raiz) iniciar(raiz);

function iniciar(raiz: HTMLElement) {
  const $ = <T extends Element = HTMLElement>(r: string, base: ParentNode = raiz) =>
    base.querySelector(`[data-a="${r}"]`) as T;
  const lienzo = $('lienzo');
  const reloj = $('reloj');
  const canvas = $<HTMLCanvasElement>('canvas');
  const ctx = canvas.getContext('2d')!;
  const parametros = new URLSearchParams(location.search);
  const grabando = parametros.has('render');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (grabando) document.documentElement.classList.add('an-render');

  const acotar = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  const sale = (x: number) => 1 - Math.pow(1 - acotar(x, 0, 1), 3);
  const entra = (x: number) => Math.pow(acotar(x, 0, 1), 3);
  const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  /* ── La línea de tiempo ───────────────────────────────────────────────────────── */
  let t = 0;
  let jugando = false;
  let pedido = 0;

  const animaciones = () => lienzo.getAnimations({ subtree: true });
  const tiempoReloj = () => {
    const a = reloj.getAnimations()[0];
    return a ? Number(a.currentTime ?? t) : t;
  };

  /** Lleva todo el anuncio al instante `ms`, quieto. */
  function ir(ms: number) {
    t = acotar(ms, 0, DURACION);
    for (const a of animaciones()) {
      a.pause();
      a.currentTime = t;
    }
    dibujar(t);
  }

  function jugar() {
    if (jugando) return;
    jugando = true;
    if (t >= DURACION - 20) ir(0);
    for (const a of animaciones()) {
      a.currentTime = t;
      a.play();
    }
    delete raiz.dataset.pausa;
    rotular();
    const cuadro = () => {
      if (!jugando) return;
      t = tiempoReloj();
      if (t >= DURACION) {
        /* Como en las redes: vuelve a empezar solo */
        ir(0);
        for (const a of animaciones()) a.play();
      }
      dibujar(t);
      pedido = requestAnimationFrame(cuadro);
    };
    pedido = requestAnimationFrame(cuadro);
  }

  function pausar() {
    if (!jugando) return;
    jugando = false;
    cancelAnimationFrame(pedido);
    ir(tiempoReloj());
    raiz.dataset.pausa = '';
    rotular();
  }

  /* ── Lo que se dibuja o se escribe según el tiempo ────────────────────────────── */
  const personas = $('personas');
  const costo = $('costo');
  const kpis = [...lienzo.querySelectorAll<HTMLElement>('[data-a="kpi"]')];
  const tipeo = $('tipeo');

  function dibujar(ms: number) {
    const s = ms / 1000;
    personas.textContent = miles(cuantosHay(s));
    costo.textContent = miles(PERSONAS * PRECIO_LICENCIA_USD * sale((s - 3.5) / 0.75));
    for (const k of kpis) {
      const hasta = Number(k.dataset.hasta);
      const v = hasta * sale((s - Number(k.dataset.en)) / Number(k.dataset.dur));
      const decimales = k.dataset.hasta!.includes('.') ? 1 : 0;
      k.textContent =
        (k.dataset.signo ?? '') +
        v.toFixed(decimales).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') +
        (k.dataset.sufijo ?? '');
    }
    /* La pregunta se tipea letra por letra y, al enviarla, el campo queda vacío */
    const texto = tipeo.dataset.texto ?? '';
    const desde = Number(tipeo.dataset.en);
    const hasta = Number(tipeo.dataset.fin);
    tipeo.textContent = s >= hasta + 0.1 ? '' : texto.slice(0, Math.round(texto.length * acotar((s - desde) / (hasta - desde), 0, 1)));
    pintarLienzo(s);
  }

  /* ── El lienzo: mil asientos con licencia ─────────────────────────────────────── */
  type Caja = { x: number; y: number; w: number; h: number };
  let zona: Caja = { x: 0, y: 0, w: 1, h: 1 };
  let centro = { x: 0, y: 0 };
  let tam = 10;
  let radioEspiral = 100;
  let escala = 1;
  let posiciones: { x: number; y: number }[] = [];
  let aparece: number[] = [];
  let sprite: HTMLCanvasElement | null = null;
  let vacio = false;

  /* Un orden al azar pero fijo: los asientos aparecen salteados, siempre igual */
  const azar = (() => {
    let a = 0x2f6b9d1;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let r = Math.imul(a ^ (a >>> 15), 1 | a);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  })();
  const orden = Array.from({ length: PERSONAS }, (_, i) => i);
  for (let i = orden.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  /* Pocos al principio y una avalancha al final: el costo se siente crecer */
  aparece = orden.map((rango) => LLENA_DESDE + (LLENA_HASTA - LLENA_DESDE) * Math.pow(rango / PERSONAS, 1 / 1.6));
  const cuantosHay = (s: number) => {
    if (s >= LLENA_HASTA) return PERSONAS;
    let n = 0;
    for (const a of aparece) if (a <= s) n++;
    return n;
  };

  function caja(el: Element): Caja {
    const base = lienzo.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
  }

  /** Mide la zona de los asientos y el centro de la licencia (cambia con el formato). */
  function medir() {
    const dpr = grabando ? 1 : Math.min(2, window.devicePixelRatio || 1);
    const w = lienzo.clientWidth;
    const h = lienzo.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    escala = dpr;
    zona = caja($('asientos'));
    const lic = caja($('licencia'));
    centro = { x: lic.x + lic.w / 2, y: lic.y + lic.h / 2 };
    const columnas = Math.max(1, Math.round(Math.sqrt((PERSONAS * zona.w) / zona.h)));
    const filas = Math.ceil(PERSONAS / columnas);
    const celda = Math.min(zona.w / columnas, zona.h / filas);
    tam = celda * 0.8;
    const x0 = zona.x + (zona.w - celda * columnas) / 2 + celda / 2;
    const y0 = zona.y + (zona.h - celda * filas) / 2 + celda / 2;
    posiciones = Array.from({ length: PERSONAS }, (_, i) => ({
      x: x0 + (i % columnas) * celda,
      y: y0 + Math.floor(i / columnas) * celda,
    }));
    /* La espiral de las mil personas: llena la zona de la licencia sin pisar el texto */
    radioEspiral = Math.min(lic.w, lic.h) * 0.56;
    sprite = hacerSprite(Math.max(8, Math.round(tam * dpr)));
    vacio = false;
  }

  /** Un asiento: el cuadrito amarillo de Power BI con una persona adentro. */
  function hacerSprite(lado: number) {
    const c = document.createElement('canvas');
    c.width = lado;
    c.height = lado;
    const g = c.getContext('2d')!;
    const r = lado * 0.22;
    g.fillStyle = AMARILLO;
    g.beginPath();
    g.roundRect(0, 0, lado, lado, r);
    g.fill();
    g.save();
    g.beginPath();
    g.roundRect(0, 0, lado, lado, r);
    g.clip();
    g.fillStyle = 'rgba(0, 23, 32, 0.82)';
    g.beginPath();
    g.arc(lado * 0.5, lado * 0.38, lado * 0.17, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(lado * 0.5, lado * 0.96, lado * 0.33, lado * 0.3, 0, Math.PI, 0);
    g.fill();
    g.restore();
    return c;
  }

  function pintarLienzo(s: number) {
    if (s > APAGA_HASTA + 0.05) {
      if (!vacio) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        vacio = true;
      }
      return;
    }
    vacio = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(escala, 0, 0, escala, 0, 0);

    /* 1 · Los asientos se llenan (y la toma se acerca despacio: la presión sube);
       2 · colapsan hacia la licencia */
    if (s < COLAPSA_DESDE + COLAPSA_DUR + 0.2 && sprite) {
      const acerca = 1 + 0.04 * sale(s / 6);
      const zx = zona.x + zona.w / 2;
      const zy = zona.y + zona.h / 2;
      for (let i = 0; i < PERSONAS; i++) {
        const desde = aparece[i];
        if (s < desde) continue;
        const base = posiciones[i];
        const pos = { x: zx + (base.x - zx) * acerca, y: zy + (base.y - zy) * acerca };
        const pop = acotar((s - desde) / 0.18, 0, 1);
        let lado = acerca * tam * (pop < 0.7 ? sale(pop / 0.7) * 1.15 : 1.15 - 0.15 * ((pop - 0.7) / 0.3));
        let x = pos.x;
        let y = pos.y;
        let alfa = 1;
        if (s > COLAPSA_DESDE) {
          /* Los de cerca de la licencia salen un poco antes: se ve como una implosión */
          const dist = Math.hypot(pos.x - centro.x, pos.y - centro.y);
          const k = entra((s - COLAPSA_DESDE - dist * 0.00012) / COLAPSA_DUR);
          x = pos.x + (centro.x - pos.x) * k;
          y = pos.y + (centro.y - pos.y) * k;
          lado *= 1 - 0.7 * k;
          alfa = 1 - Math.pow(k, 4);
        }
        if (alfa <= 0.01) continue;
        ctx.globalAlpha = alfa;
        ctx.drawImage(sprite, x - lado / 2, y - lado / 2, lado, lado);
      }
      ctx.globalAlpha = 1;
    }

    /* 3 · La licencia, ya verde, se abre en mil personas (una espiral de girasol) */
    if (s >= ABRE_DESDE) {
      const apagado = 1 - acotar((s - APAGA_DESDE) / (APAGA_HASTA - APAGA_DESDE), 0, 1);
      const paso = radioEspiral / Math.sqrt(PERSONAS);
      const r0 = paso * 4.5;
      for (let i = 0; i < PERSONAS; i++) {
        const desde = ABRE_DESDE + (ABRE_HASTA - ABRE_DESDE) * Math.pow(i / PERSONAS, 0.85);
        if (s < desde) break;
        const k = sale((s - desde) / 0.35);
        const ang = i * 2.39996323;
        const radio = (r0 + paso * Math.sqrt(i)) * (0.35 + 0.65 * k);
        const x = centro.x + Math.cos(ang) * radio;
        const y = centro.y + Math.sin(ang) * radio * 0.92;
        ctx.globalAlpha = apagado * (0.25 + 0.75 * k);
        ctx.fillStyle = i % 9 === 0 ? '#ffffff' : VERDE_CLARO;
        ctx.beginPath();
        ctx.arc(x, y, paso * 0.36 * k, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ── Formato ──────────────────────────────────────────────────────────────────── */
  const botonesFormato = [...raiz.querySelectorAll<HTMLButtonElement>('[data-formato-boton]')];

  function ponerFormato(f: Formato) {
    lienzo.dataset.formato = f;
    for (const b of botonesFormato) b.setAttribute('aria-pressed', String(b.dataset.formatoBoton === f));
    for (const a of document.querySelectorAll<HTMLAnchorElement>('[data-a="descarga-actual"]')) {
      a.href = a.dataset.molde!.replace('{f}', f);
    }
    /* Cambiar de formato rehace algunas animaciones de CSS: se vuelve a sincronizar todo */
    requestAnimationFrame(() => {
      medir();
      const seguia = jugando;
      jugando = false;
      cancelAnimationFrame(pedido);
      ir(t);
      if (seguia) jugar();
    });
  }

  for (const b of botonesFormato) {
    b.addEventListener('click', () => {
      const f = b.dataset.formatoBoton as Formato;
      ponerFormato(f);
      const url = new URL(location.href);
      url.searchParams.set('formato', f);
      history.replaceState(null, '', url);
    });
  }

  new ResizeObserver(() => {
    medir();
    dibujar(t);
  }).observe(lienzo);

  /* ── Controles ────────────────────────────────────────────────────────────────── */
  const botonPausa = $<HTMLButtonElement>('pausa');
  function rotular() {
    const accion = jugando ? 'Pausar' : 'Reproducir';
    botonPausa.setAttribute('aria-label', accion);
    botonPausa.title = `${accion} (espacio)`;
  }
  botonPausa.addEventListener('click', () => (jugando ? pausar() : jugar()));
  $('reiniciar').addEventListener('click', () => {
    const seguia = jugando;
    pausar();
    ir(0);
    if (seguia || reducido) jugar();
  });
  $('completa').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else lienzo.requestFullscreen().catch(() => {});
  });
  if (!document.fullscreenEnabled) $('completa').hidden = true;
  document.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).closest('button, a, input') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === ' ') {
      e.preventDefault();
      if (jugando) pausar();
      else jugar();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const seguia = jugando;
      pausar();
      ir(t + (e.key === 'ArrowRight' ? 1000 : -1000));
      if (seguia) jugar();
    }
  });

  /* ── Arranque ─────────────────────────────────────────────────────────────────── */
  const pedido0 = parametros.get('formato') as Formato | null;
  const formato: Formato = pedido0 && FORMATOS.includes(pedido0) ? pedido0 : '9x16';
  lienzo.dataset.formato = formato;
  for (const b of botonesFormato) b.setAttribute('aria-pressed', String(b.dataset.formatoBoton === formato));
  for (const a of document.querySelectorAll<HTMLAnchorElement>('[data-a="descarga-actual"]')) {
    a.href = a.dataset.molde!.replace('{f}', formato);
  }

  const listo = document.fonts.ready.then(
    () =>
      new Promise<void>((ok) =>
        requestAnimationFrame(() => {
          medir();
          ir(0);
          requestAnimationFrame(() => ok());
        }),
      ),
  );

  window.__anuncio = { ir, duracion: DURACION, listo, formato: () => lienzo.dataset.formato ?? '' };

  listo.then(() => {
    raiz.dataset.listo = '';
    /* En la página se reproduce solo (es un video); grabando o con movimiento reducido, no */
    if (!grabando && !reducido) jugar();
    else {
      /* Con movimiento reducido queda quieto en el cierre ya armado: logo, fichas, botón y URL */
      ir(grabando ? 0 : 45000);
      raiz.dataset.pausa = '';
      rotular();
    }
  });
}
