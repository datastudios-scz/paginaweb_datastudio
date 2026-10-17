/**
 * El anuncio del Portal BI (/portal-bi/anuncio/): la línea de tiempo.
 *
 * El movimiento vive en CSS (anuncio.css): animaciones con su retardo contado desde el
 * segundo 0. Acá se manejan como un solo video: se pausan y se llevan al instante que se pida
 * (`ir(ms)`), o se reproducen todas juntas. Lo que no puede ser CSS va escrito en función del
 * tiempo — los contadores, la pregunta que se tipea — así cualquier instante sale siempre igual,
 * que es lo que hace falta para grabar a MP4 cuadro por cuadro (scripts/grabar-anuncio.mjs
 * llama a `window.__anuncio.ir`). Y se mide lo que depende del formato: cuánto viaja cada pieza
 * del gancho hasta la ventana que se la traga.
 *
 * CSP: nada de atributos style; las medidas y los textos se cambian por CSSOM/DOM.
 */

const DURACION = 55000;
const FORMATOS = ['9x16', '4x5', '1x1', '16x9'] as const;
type Formato = (typeof FORMATOS)[number];

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
  const parametros = new URLSearchParams(location.search);
  const grabando = parametros.has('render');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (grabando) document.documentElement.classList.add('an-render');

  const acotar = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  const sale = (x: number) => 1 - Math.pow(1 - acotar(x, 0, 1), 3);

  /* ── La línea de tiempo ───────────────────────────────────────────────────────── */
  let t = 0;
  let jugando = false;
  let pedido = 0;

  /* Todas las que se vieron alguna vez, no solo las que devuelve getAnimations(): esa lista deja
     afuera a una animación SIN relleno (fill) cuando ya terminó —deja de ser «relevante»—, y al
     volver atrás el motor ya no la movía. Pasaba con el pulso del botón de enviar del chat y con
     el giro de la tarjeta del login en la segunda vuelta del bucle. Las que CSS cancela (cambiar
     de formato rehace algunas) quedan en 'idle' y se sueltan. */
  const vistas = new Set<Animation>();
  const animaciones = () => {
    for (const a of lienzo.getAnimations({ subtree: true })) vistas.add(a);
    for (const a of vistas) if (a.playState === 'idle') vistas.delete(a);
    return [...vistas];
  };
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

  /* ── Lo que se escribe según el tiempo ────────────────────────────────────────── */
  const kpis = [...lienzo.querySelectorAll<HTMLElement>('[data-a="kpi"]')];
  /* Las preguntas que se tipean: las dos del chat de la toma 6, en el mismo campo */
  const tipeos = [...lienzo.querySelectorAll<HTMLElement>('[data-a="tipeo"]')];

  function dibujar(ms: number) {
    const s = ms / 1000;
    for (const k of kpis) {
      /* Cuentan desde data-desde (los mensajes sin leer del gancho de 3 a 27, el ticket promedio
         de 94 a 118; los indicadores, desde 0) */
      const desdeK = Number(k.dataset.desde ?? 0);
      const hasta = Number(k.dataset.hasta);
      const v = desdeK + (hasta - desdeK) * sale((s - Number(k.dataset.en)) / Number(k.dataset.dur));
      const decimales = k.dataset.hasta!.includes('.') ? 1 : 0;
      k.textContent =
        (k.dataset.signo ?? '') +
        v.toFixed(decimales).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') +
        (k.dataset.sufijo ?? '');
    }
    /* La pregunta se tipea letra por letra y, al enviarla, el campo queda vacío */
    for (const tipeo of tipeos) {
      const texto = tipeo.dataset.texto ?? '';
      const desde = Number(tipeo.dataset.en);
      const hasta = Number(tipeo.dataset.fin);
      tipeo.textContent = s >= hasta + 0.1 ? '' : texto.slice(0, Math.round(texto.length * acotar((s - desde) / (hasta - desde), 0, 1)));
    }
  }

  /* ── El gancho: el portal se traga los reportes ───────────────────────────────── */
  /* Cada pieza de la toma 1 (data-a="absorbe") viaja al centro de la ventana de la toma 2
     (data-a="destino"). La distancia cambia con el formato y con el largo de cada texto, así que
     se mide y se le pasa a anuncio.css como --hx y --hy. Se mide por la caja de diseño
     (offsetLeft/Top), que ninguna animación mueve: da lo mismo en cualquier instante, incluso
     con la pieza a mitad de camino. */
  const destino = $('destino');
  const absorbidos = [...lienzo.querySelectorAll<HTMLElement>('[data-a="absorbe"]')];

  function centro(el: HTMLElement) {
    let x = el.offsetWidth / 2;
    let y = el.offsetHeight / 2;
    for (let e: HTMLElement | null = el; e && e !== lienzo; e = e.offsetParent as HTMLElement | null) {
      x += e.offsetLeft;
      y += e.offsetTop;
    }
    return { x, y };
  }

  function medir() {
    const d = centro(destino);
    for (const el of absorbidos) {
      const p = centro(el);
      el.style.setProperty('--hx', `${(d.x - p.x).toFixed(1)}px`);
      el.style.setProperty('--hy', `${(d.y - p.y).toFixed(1)}px`);
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
      ir(grabando ? 0 : 54000);
      raiz.dataset.pausa = '';
      rotular();
    }
  });
}
