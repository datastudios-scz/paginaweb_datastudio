/**
 * El recorrido animado del Portal BI (/portal-bi/como-funciona/).
 *
 * Ocho pasos que mueven un cursor y una "cámara" sobre la pantalla del portal, dibujada a
 * tamaño real (RecorridoPantalla.astro). Todo pasa por un reloj propio: así se puede pausar,
 * saltar de paso y volver a empezar sin que nada quede a medias.
 *
 * Saltar a un paso = volver a dibujar la pantalla y correr el guion "de golpe" (sin esperas ni
 * transiciones) hasta ese paso. El guion es la única fuente de verdad del estado.
 *
 * En un teléfono la pantalla entera no se podría leer: la cámara nunca la muestra completa,
 * la llena sin dejar bandas y se acerca a lo que importa. Ahí el chat se angosta un poco para
 * que entre legible (clase es-angosta).
 *
 * Con movimiento reducido no hay reproducción: cada paso se muestra en su estado final y se
 * avanza con los botones anterior/siguiente, las flechas o los segmentos.
 *
 * CSP: nada de atributos style; la cámara, el cursor y el progreso se mueven por CSSOM.
 */

type Region = { x: number; y: number; w: number; h: number };
type Texto = { n: string; titulo: string; detalle: string };

const ANCHO = 1280;
const ALTO = 760;
const TODO: Region = { x: 0, y: 0, w: ANCHO, h: ALTO };
/** Por debajo de este ancho de vista el chat se angosta para entrar legible en la toma. */
const ANGOSTA = 640;
/** Duración de cada paso (ms), medida corriéndolo: solo sirve para llenar su segmento. */
const DURACION = [7500, 8050, 8100, 9000, 6300, 10500, 7300, 8250];
const CANCELADA = Symbol('cancelada');

const raiz = document.querySelector<HTMLElement>('[data-r="raiz"]');
if (raiz) iniciar(raiz);

function iniciar(raiz: HTMLElement) {
  const $ = <T extends Element = HTMLElement>(r: string, base: ParentNode = raiz) =>
    base.querySelector(`[data-r="${r}"]`) as T;
  const dos = (n: number) => String(n).padStart(2, '0');

  const vista = $('vista');
  const P = $('pantalla');
  const molde = P.innerHTML;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const leer = (el: Element, n: string): Texto => ({
    n,
    titulo: el.querySelector('strong')?.textContent ?? '',
    detalle: el.querySelector('span')?.textContent ?? '',
  });
  const items = [...$('guion').querySelectorAll('li')];
  const pasos = items.map((li, i) => leer(li, `${dos(i + 1)} / ${dos(items.length)}`));
  const cierre = leer($('cierre'), $('cierre').dataset.n ?? '');
  /* Lo de adentro de la pantalla se busca SIEMPRE de nuevo: al saltar de paso se vuelve a dibujar. */
  const p = (r: string) => $(r, P);
  const tel = () => vista.clientWidth < ANGOSTA;

  /* ── El reloj ─────────────────────────────────────────────────────────────────── */
  let tiempo = 0;
  let previo = performance.now();
  let pausado = false;
  let instante = false;
  let corrida = 0;
  const esperas: { fin: number; listo: () => void }[] = [];
  const vivas = new Set<Animation>();

  const bucle = (ahora: number) => {
    /* Con la pestaña oculta el navegador no llama: el recorrido se queda donde estaba. */
    if (!pausado) tiempo += Math.min(ahora - previo, 64);
    previo = ahora;
    for (let i = esperas.length - 1; i >= 0; i--) {
      if (esperas[i].fin <= tiempo) esperas.splice(i, 1)[0].listo();
    }
    pintarProgreso();
    requestAnimationFrame(bucle);
  };
  requestAnimationFrame(bucle);

  /** Espera en tiempo del recorrido. Si mientras tanto empezó otra corrida, esta se corta. */
  const esperar = (ms: number) => {
    const id = corrida;
    const listo = instante || ms <= 0
      ? Promise.resolve()
      : new Promise<void>((r) => esperas.push({ fin: tiempo + ms, listo: r }));
    return listo.then(() => {
      if (id !== corrida) throw CANCELADA;
    });
  };

  const animar = (el: Element, cuadros: Keyframe[], ms: number, curva = 'ease') => {
    if (instante) return;
    const a = el.animate(cuadros, { duration: ms, easing: curva });
    if (pausado) a.pause();
    vivas.add(a);
    a.finished.then(() => vivas.delete(a), () => vivas.delete(a));
  };

  /* ── La cámara: encuadra una región de la pantalla en la ventana ──────────────── */
  type Destino = Element | Region | (() => Region);
  let cam = { x: 0, y: 0, s: 1 };
  let destinoFoco: Destino = TODO;
  let zoomFoco = 1;
  let tam = 0;

  const transformar = (c: typeof cam) => `translate(${c.x}px, ${c.y}px) scale(${c.s})`;
  const acotar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  /** Región de un elemento, en las coordenadas de la pantalla (1280 × 760). */
  const region = (el: Element, borde = 28): Region => {
    const caja = P.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const s = caja.width / ANCHO;
    return {
      x: (r.left - caja.left) / s - borde,
      y: (r.top - caja.top) / s - borde,
      w: r.width / s + borde * 2,
      h: r.height / s + borde * 2,
    };
  };

  const union = (a: Element, b: Element): Region => {
    const ra = region(a);
    const rb = region(b);
    const x = Math.min(ra.x, rb.x);
    const y = Math.min(ra.y, rb.y);
    return { x, y, w: Math.max(ra.x + ra.w, rb.x + rb.w) - x, h: Math.max(ra.y + ra.h, rb.y + rb.h) - y };
  };

  /** El panel del chat por su lugar en el layout (mientras entra, su caja todavía está corrida). */
  const regionChat = (): Region => {
    const w = p('chat').offsetWidth;
    return { x: ANCHO - w, y: 0, w, h: ALTO };
  };

  const resolver = (d: Destino): Region =>
    typeof d === 'function' ? d() : d instanceof Element ? region(d) : d;

  const encuadre = (r: Region, zoom: number) => {
    const W = vista.clientWidth;
    const H = vista.clientHeight;
    const base = Math.min(W / ANCHO, H / ALTO);
    /* Si la pantalla entera no se podría leer (un teléfono), la toma la llena sin dejar
       bandas, y cuando señala algo (zoom > 1) se acerca hasta que se lea. Las tomas
       generales (zoom 1) muestran todo en un escritorio y lo que rodea a la región en un
       teléfono. */
    const chica = base < 0.45;
    const cubre = Math.max(W / ANCHO, H / ALTO);
    const ajuste = Math.min(W / r.w, H / r.h);
    let s: number;
    if (!chica) {
      s = Math.max(base, Math.min(ajuste, base * zoom));
    } else if (zoom > 1) {
      const piso = Math.max(cubre, Math.min(0.72, W / 520));
      s = Math.max(piso, Math.min(ajuste, (piso / 1.3) * zoom));
    } else {
      /* Toma general en un teléfono: llena la ventana, y si la región pide un poco más de
         ancho se aleja apenas (la franja que queda es del color de la escena: no se nota). */
      s = r === TODO ? cubre : Math.max(cubre * 0.92, Math.min(ajuste, cubre));
    }
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    return {
      s,
      x: ANCHO * s <= W ? (W - ANCHO * s) / 2 : acotar(W / 2 - cx * s, W - ANCHO * s, 0),
      y: ALTO * s <= H ? (H - ALTO * s) / 2 : acotar(H / 2 - cy * s, H - ALTO * s, 0),
    };
  };

  /** Dónde está la cámara AHORA, aunque esté a mitad de un movimiento: si dos tomas se pisan,
      la segunda arranca desde ahí y no da un salto. */
  const actual = () => {
    const m = new DOMMatrixReadOnly(getComputedStyle(P).transform);
    return { x: m.e, y: m.f, s: m.a || cam.s };
  };

  const camara = (destino: Destino, zoom = 1.3, ms = 1150) => {
    destinoFoco = destino;
    zoomFoco = zoom;
    const desde = instante ? cam : actual();
    const nueva = encuadre(resolver(destino), zoom);
    animar(P, [{ transform: transformar(desde) }, { transform: transformar(nueva) }], ms, 'cubic-bezier(.65,0,.35,1)');
    cam = nueva;
    P.style.transform = transformar(cam);
  };

  /* La ventana cambia de tamaño (rotar el teléfono, pantalla completa): se reencuadra al
     instante. Lo que se acomoda alrededor de la ventana lo resuelve el CSS solo: si el script
     lo moviera, lo haría después del primer pintado y la página saltaría (CLS medido: la
     narración se corría 92 px al angostarse). */
  const acomodar = () => {
    const medida = vista.clientWidth * 10000 + vista.clientHeight;
    if (medida === tam) return;
    tam = medida;
    P.classList.toggle('es-angosta', tel());
    cam = encuadre(resolver(destinoFoco), zoomFoco);
    P.style.transform = transformar(cam);
    P.classList.add('es-lista');
  };
  /* La primera vez, ya: el observador recién avisa en el cuadro siguiente. */
  acomodar();
  new ResizeObserver(acomodar).observe(vista);

  /* ── El cursor ────────────────────────────────────────────────────────────────── */
  let cx = 700;
  let cy = 640;

  const ponerCursor = (x: number, y: number) => {
    p('cursor').style.transform = `translate(${x}px, ${y}px)`;
  };

  /** Viaja en una curva suave, como una mano, y tarda según la distancia. */
  const moverCursor = async (x: number, y: number) => {
    const cursor = p('cursor');
    cursor.classList.add('es-visible');
    const d = Math.hypot(x - cx, y - cy);
    const ms = Math.min(1150, 420 + d * 0.5);
    const mx = (cx + x) / 2 + (y - cy) * 0.18;
    const my = (cy + y) / 2 - (x - cx) * 0.18;
    const cuadros: Keyframe[] = [];
    for (let k = 0; k <= 10; k++) {
      const t = k / 10;
      const u = 1 - t;
      cuadros.push({
        transform: `translate(${u * u * cx + 2 * u * t * mx + t * t * x}px, ${u * u * cy + 2 * u * t * my + t * t * y}px)`,
      });
    }
    animar(cursor, cuadros, ms, 'cubic-bezier(.45,.05,.25,1)');
    ponerCursor(x, y);
    cx = x;
    cy = y;
    await esperar(ms);
  };

  const irA = (el: Element, fx = 0.5, fy = 0.5) => {
    const r = region(el, 0);
    return moverCursor(r.x + r.w * fx, r.y + r.h * fy);
  };

  const clic = async (el?: Element | null) => {
    const cursor = p('cursor');
    cursor.classList.add('es-clic');
    el?.classList.add('es-presionado');
    if (!instante) {
      const onda = document.createElement('span');
      onda.className = 'rc-onda';
      onda.style.left = `${cx}px`;
      onda.style.top = `${cy}px`;
      P.appendChild(onda);
      onda.addEventListener('animationend', () => onda.remove());
    }
    await esperar(170);
    cursor.classList.remove('es-clic');
    el?.classList.remove('es-presionado');
    await esperar(140);
  };

  const pasar = (el: Element | null, si = true) => el?.classList.toggle('es-hover', si);

  /** Escribe como una persona: con un ritmo parejo pero no de máquina. */
  const escribir = async (el: HTMLElement, texto: string, cadencia = 60, oculto = false) => {
    if (instante) {
      el.textContent = oculto ? '•'.repeat(texto.length) : texto;
      return;
    }
    for (let i = 1; i <= texto.length; i++) {
      el.textContent = oculto ? '•'.repeat(i) : texto.slice(0, i);
      await esperar(cadencia + ((i * 37) % 7) * 7 + (texto[i - 1] === ' ' ? 40 : 0));
    }
  };

  /** Las cifras de los indicadores suben hasta su valor, como un reporte que termina de cargar. */
  const contar = async (el: HTMLElement) => {
    const fin = Number(el.dataset.contar);
    const decimales = el.dataset.contar?.includes('.') ? 1 : 0;
    const formato = (v: number) =>
      (el.dataset.signo ?? '') +
      v.toFixed(decimales).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') +
      (el.dataset.sufijo ?? '');
    for (let k = 1; k <= 24 && !instante; k++) {
      const t = 1 - Math.pow(1 - k / 24, 3);
      el.textContent = formato(fin * t);
      await esperar(34);
    }
    el.textContent = formato(fin);
  };

  const escena = (nombre: string, url: string) => {
    P.dataset.escena = nombre;
    vista.dataset.escena = nombre;
    $('url').textContent = url;
  };

  const bajarHilo = () => {
    const hilo = p('hilo');
    hilo.scrollTo({ top: hilo.scrollHeight, behavior: instante ? 'instant' : 'smooth' });
  };

  /* ═══ EL GUION ══════════════════════════════════════════════════════════════════ */
  const GUION: (() => Promise<void>)[] = [
    /* 1 · Ingresa con su usuario */
    async () => {
      escena('ingreso', 'portal.tuempresa.com');
      camara(TODO, 1, 0);
      await esperar(1300);
      camara(p('login'), 1.35, 1400);
      await irA(p('usuario'), 0.25, 0.55);
      await clic();
      p('usuario').classList.add('es-foco');
      await escribir(p('usuario-txt'), 'mariana.s', 95);
      await irA(p('clave'), 0.25, 0.55);
      await clic();
      p('usuario').classList.remove('es-foco');
      p('clave').classList.add('es-foco');
      await escribir(p('clave-txt'), 'xxxxxxxxxx', 70, true);
      await irA(p('ingresar'), 0.5, 0.55);
      pasar(p('ingresar'));
      await esperar(200);
      await clic(p('ingresar'));
      p('clave').classList.remove('es-foco');
      p('ingresar').classList.add('es-enviando');
      await esperar(1300);
    },

    /* 2 · Encuentra lo suyo en el menú */
    async () => {
      escena('portal', 'portal.tuempresa.com/home');
      camara(p('bienvenida'), 1, 900);
      await esperar(1500);
      const menu = p('menu-tableros');
      camara({ x: 0, y: 60, w: 420, h: 380 }, 1.3, 1200);
      await irA(menu, 0.45);
      pasar(menu);
      await esperar(250);
      await clic(menu);
      pasar(menu, false);
      menu.classList.add('es-abierto');
      p('menu-sub').classList.add('es-abierto');
      await esperar(750);
      const comercial = p('menu-comercial');
      await irA(comercial, 0.4);
      pasar(comercial);
      await esperar(200);
      await clic(comercial);
      pasar(comercial, false);
      comercial.classList.add('es-activo');
      p('migas').textContent = 'Comercial';
      $('url').textContent = 'portal.tuempresa.com/tableros?empresa=Comercial';
      p('bienvenida').classList.add('es-fuera');
      p('tarjetas').classList.add('es-visible');
      const tarjetas = p('tarjetas').children;
      /* En un teléfono entran dos tarjetas: las de la izquierda, donde está la que se abre. */
      camara(tel() ? union(tarjetas[0], tarjetas[1]) : p('tarjetas'), 1.15, 1300);
      await esperar(1100);
      if (!tel()) {
        await irA(tarjetas[2], 0.5, 0.55);
        pasar(tarjetas[2]);
        await esperar(500);
        pasar(tarjetas[2], false);
      }
      await irA(tarjetas[1], 0.5, 0.55);
      pasar(tarjetas[1]);
      await esperar(tel() ? 700 : 450);
      pasar(tarjetas[1], false);
    },

    /* 3 · Abre el tablero con IA */
    async () => {
      const tarjeta = p('tarjeta-ventas');
      await irA(tarjeta, 0.5, 0.55);
      pasar(tarjeta);
      await esperar(650);
      await clic(tarjeta);
      escena('visor', 'portal.tuempresa.com/tableros/visor?nombre=Ventas%20por%20sucursal');
      camara(TODO, 1, 900);
      await moverCursor(1020, 600);
      await esperar(1300);
      p('capa').classList.add('es-oculta');
      p('pbi').classList.add('es-dibujado');
      /* Escritorio: el tablero entero. Teléfono: la mitad de las barras. */
      camara(p('vis-barras'), 1, 1000);
      await Promise.all([...p('pbi').querySelectorAll<HTMLElement>('[data-contar]')].map(contar));
      await esperar(2900);
    },

    /* 4 · Descarga los datos */
    async () => {
      const visual = p('vis-barras');
      camara(visual, 1.45, 1300);
      await irA(visual, 0.62, 0.55);
      pasar(visual);
      await esperar(500);
      const mas = p('vis-mas');
      await irA(mas);
      pasar(mas);
      await clic(mas);
      p('menu-pbi').classList.add('es-abierto');
      await esperar(550);
      const exportar = p('exportar');
      await irA(exportar, 0.3);
      pasar(exportar);
      await esperar(350);
      await clic(exportar);
      p('menu-pbi').classList.remove('es-abierto');
      pasar(mas, false);
      p('dialogo').classList.add('es-abierto');
      camara(p('dialogo-caja'), 1.5, 1100);
      await esperar(1200);
      const boton = p('dialogo-exportar');
      await irA(boton);
      pasar(boton);
      await esperar(200);
      await clic(boton);
      p('dialogo').classList.remove('es-abierto');
      pasar(visual, false);
      const descarga = $('descarga');
      descarga.classList.add('es-visible');
      camara(visual, 1, 1200);
      await esperar(1300);
      descarga.classList.add('es-lista');
      await esperar(1400);
    },

    /* 5 · Abre el chat al costado: el chip es el protagonista, la cámara va hasta él */
    async () => {
      const lengueta = p('lengueta');
      lengueta.classList.add('es-llamando');
      camara({ x: 980, y: 230, w: 300, h: 300 }, 2.4, 1300);
      await esperar(1600);
      await irA(lengueta, 0.5, 0.45);
      pasar(lengueta);
      await esperar(600);
      await clic(lengueta);
      lengueta.classList.remove('es-llamando');
      P.querySelector('.rc-visor')?.classList.add('es-chat');
      camara(regionChat, 1, 1200);
      await moverCursor(900, 470);
      await esperar(2400);
    },

    /* 6 · Pregunta */
    async () => {
      const campo = p('campo');
      /* La toma va a la izquierda del campo, donde aparece lo que se escribe: centrar el
         campo entero dejaba el texto afuera en un teléfono. */
      const r = region(campo);
      camara({ ...r, w: Math.min(r.w, 500) }, 2, 1200);
      await irA(campo, 0.3, 0.5);
      await clic();
      campo.classList.add('es-foco', 'es-escribiendo');
      const pregunta = '¿Cuáles fueron las 5 sucursales que más vendieron en septiembre?';
      await escribir(p('pregunta'), pregunta, 40);
      await irA(p('enviar'));
      await clic(p('enviar'));
      p('pregunta').textContent = '';
      campo.classList.remove('es-foco', 'es-escribiendo');
      p('yo-txt').textContent = pregunta;
      p('hola').classList.add('es-fuera');
      p('yo').classList.add('es-visible');
      p('bot').classList.add('es-visible');
      camara(p('hilo'), 1.3, 1100);
      await moverCursor(1180, 690);
      for (const [n, ms] of [[1, 700], [2, 1500], [3, 900]] as const) {
        const paso = p(`paso-${n}`);
        paso.classList.add('es-activo');
        await esperar(ms);
        paso.classList.replace('es-activo', 'es-ok');
      }
      await esperar(300);
    },

    /* 7 · Responde y muestra la consulta */
    async () => {
      const dax = p('dax');
      dax.classList.add('es-visible');
      void dax.offsetHeight;
      dax.classList.add('es-abierto');
      camara(dax, 1.35, 1100);
      await esperar(2300);
      p('tabla').classList.add('es-visible');
      bajarHilo();
      /* La cámara espera a que el hilo termine de bajar: si no, apunta a donde estaba la tabla. */
      await esperar(450);
      camara(p('tabla'), 1.4, 1100);
      await esperar(1500);
      p('analisis').classList.add('es-visible');
      p('acciones').classList.add('es-visible');
      bajarHilo();
      await esperar(450);
      camara(p('analisis'), 1.4, 1000);
      await esperar(2600);
    },

    /* 8 · Lo dibuja */
    async () => {
      const generar = p('generar');
      await irA(generar);
      pasar(generar);
      await esperar(300);
      await clic(generar);
      pasar(generar, false);
      p('grafico').classList.add('es-visible');
      bajarHilo();
      await esperar(500);
      camara(p('grafico'), 1.35, 1100);
      await esperar(2200);
      const copiar = p('copiar-imagen');
      await irA(copiar);
      pasar(copiar);
      await esperar(250);
      await clic(copiar);
      pasar(copiar, false);
      copiar.classList.add('es-copiado');
      p('copiar-txt').textContent = 'Imagen copiada';
      await esperar(1500);
      camara(regionChat, 1, 1400);
      await esperar(1700);
    },
  ];

  /* ═══ LA NARRACIÓN Y EL PROGRESO ════════════════════════════════════════════════ */
  const total = GUION.length;
  let paso = -1;
  let inicioPaso = 0;

  const progreso = $('progreso');
  const segmentos = pasos.map((ps, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rc-progreso__paso';
    b.setAttribute('aria-label', `Paso ${i + 1} de ${total}: ${ps.titulo}`);
    b.title = ps.titulo;
    b.append(document.createElement('i'));
    b.addEventListener('click', () => ir(i));
    progreso.append(b);
    return b;
  });

  function pintarProgreso() {
    segmentos.forEach((b, i) => {
      const v = i < paso ? 1 : i > paso ? 0 : reducido ? 1 : Math.min(1, (tiempo - inicioPaso) / DURACION[i]);
      b.style.setProperty('--p', String(v));
      if (i === paso) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
  }

  /** Palabras sueltas: el titular sube de a una desde su ranura; el detalle las sigue. */
  const trozar = (texto: string, ranura: boolean) => {
    const partes = texto.split(' ');
    return partes.flatMap((palabra, k) => {
      const s = document.createElement('span');
      s.textContent = palabra;
      s.style.setProperty('--k', String(k));
      let nodo: HTMLElement = s;
      if (ranura) {
        nodo = document.createElement('span');
        nodo.className = 'rc-p';
        nodo.append(s);
      } else {
        s.className = 'rc-d';
      }
      return k < partes.length - 1 ? [nodo, ' '] : [nodo];
    });
  };

  let salida = 0;
  const narrar = (t: Texto) => {
    const caja = $('narracion');
    const poner = () => {
      caja.classList.remove('es-saliendo', 'es-entrando');
      $('numero').textContent = t.n;
      $('titular').replaceChildren(...trozar(t.titulo, true));
      const detalle = $('detalle');
      detalle.replaceChildren(...trozar(t.detalle, false));
      detalle.style.setProperty('--base', `${260 + t.titulo.split(' ').length * 55}ms`);
      void caja.offsetWidth;
      caja.classList.add('es-entrando');
    };
    clearTimeout(salida);
    if (reducido) return poner();
    caja.classList.add('es-saliendo');
    salida = window.setTimeout(poner, 320);
  };

  /* ═══ LA CORRIDA ════════════════════════════════════════════════════════════════ */
  const redibujar = () => {
    vivas.forEach((a) => a.cancel());
    vivas.clear();
    esperas.length = 0;
    P.innerHTML = molde;
    P.dataset.escena = 'ingreso';
    vista.dataset.escena = 'ingreso';
    $('descarga').classList.remove('es-visible', 'es-lista');
    cx = 700;
    cy = 640;
    ponerCursor(cx, cy);
  };

  /** Corre el guion desde el principio; los pasos anteriores a `desde`, de golpe. */
  async function correr(desde: number, soloHasta = total - 1) {
    corrida++;
    const id = corrida;
    redibujar();
    $('final').hidden = true;
    raiz.dataset.estado = 'reproduciendo';
    try {
      for (let i = 0; i <= soloHasta; i++) {
        instante = i < desde || reducido;
        P.classList.toggle('es-instante', instante);
        if (i >= desde) {
          paso = i;
          inicioPaso = tiempo;
          narrar(pasos[i]);
        }
        await GUION[i]();
        if (id !== corrida) return;
      }
      instante = false;
      P.classList.remove('es-instante');
      if (!reducido) terminar();
    } catch (e) {
      if (e !== CANCELADA) throw e;
    }
  }

  /** El cierre: la narración dice lo último y la pantalla, velada, ofrece qué hacer. */
  function terminar() {
    paso = total;
    raiz.dataset.estado = 'final';
    narrar(cierre);
    $('final').hidden = false;
    rotularPausa();
  }

  /** Ir a un paso: con movimiento, se reproduce desde ahí; sin, se muestra ese paso quieto
      (y después del último viene el cierre). */
  function ir(i: number) {
    seguir();
    $('portada').hidden = true;
    if (reducido && i >= total) {
      if (paso !== total) terminar();
      return;
    }
    const destino = acotar(i, 0, total - 1);
    if (reducido) correr(destino, destino);
    else correr(destino);
    rotularPausa();
  }

  /* ── Controles ────────────────────────────────────────────────────────────────── */
  const botonPausa = $<HTMLButtonElement>('pausa');

  /* Un solo botón con tres acciones: reproducir (antes de empezar y al terminar), pausar y
     seguir. La etiqueta dice siempre la que va a hacer. */
  function rotularPausa() {
    const accion = raiz.dataset.estado !== 'reproduciendo' ? 'Reproducir' : pausado ? 'Seguir' : 'Pausar';
    botonPausa.setAttribute('aria-label', accion);
    botonPausa.title = `${accion} (espacio)`;
  }

  function pausar() {
    if (pausado || raiz.dataset.estado !== 'reproduciendo') return;
    pausado = true;
    vivas.forEach((a) => a.pause());
    raiz.dataset.pausa = '';
    rotularPausa();
  }

  function seguir() {
    if (!pausado) return;
    pausado = false;
    vivas.forEach((a) => a.play());
    delete raiz.dataset.pausa;
    rotularPausa();
  }

  /* El botón que se tocó desaparece con su capa: el foco pasa al control que sigue
     teniendo sentido, en vez de perderse en la página. */
  const empezar = (boton: HTMLElement) => {
    const tenia = document.activeElement === boton;
    ir(0);
    if (tenia) (reducido ? $('siguiente') : botonPausa).focus({ preventScroll: true });
  };

  botonPausa.addEventListener('click', () => {
    if (raiz.dataset.estado !== 'reproduciendo') ir(0);
    else if (pausado) seguir();
    else pausar();
  });
  $('reiniciar').addEventListener('click', () => ir(0));
  $('reproducir').addEventListener('click', (e) => empezar(e.currentTarget as HTMLElement));
  $('otra-vez').addEventListener('click', (e) => empezar(e.currentTarget as HTMLElement));
  $('anterior').addEventListener('click', () => paso > 0 && ir(paso - 1));
  $('siguiente').addEventListener('click', () => ir(paso + 1));

  const botonCompleta = $<HTMLButtonElement>('completa');
  if (!document.fullscreenEnabled) botonCompleta.hidden = true;
  botonCompleta.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else raiz.requestFullscreen().catch(() => {});
  });
  document.addEventListener('fullscreenchange', () => {
    const si = Boolean(document.fullscreenElement);
    botonCompleta.setAttribute('aria-label', si ? 'Salir de pantalla completa' : 'Pantalla completa');
    botonCompleta.title = botonCompleta.getAttribute('aria-label')!;
  });

  document.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('button, a, input, textarea, select') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === ' ') {
      if (!raiz.dataset.estado) {
        e.preventDefault();
        ir(0);
      } else if (raiz.dataset.estado === 'reproduciendo' && !reducido) {
        e.preventDefault();
        if (pausado) seguir();
        else pausar();
      }
    } else if (e.key === 'ArrowRight' && paso >= 0) {
      ir(paso + 1);
    } else if (e.key === 'ArrowLeft' && paso > 0) {
      ir(paso - 1);
    }
  });

  /* ── Arranque ─────────────────────────────────────────────────────────────────── */
  /* Desde el botón «Mira cómo funciona» (#ver) arranca solo: la persona ya pidió verlo
     (y un script en línea ya escondió la portada antes de pintarla). Si se entra directo,
     la portada espera el botón. Con movimiento reducido, paso a paso y a mano. */
  ponerCursor(cx, cy);
  rotularPausa();
  /* Para el banco (scripts/probar-recorrido.mjs): compara cuánto dura cada paso de verdad con
     lo que llena su segmento. */
  raiz.dataset.duraciones = DURACION.join(' ');
  if (reducido) {
    $('reproducir').querySelector('span')!.textContent = 'Ver paso a paso';
    $('atajos').textContent = 'Las flechas cambian de paso';
    botonPausa.hidden = true;
    $('reiniciar').hidden = true;
    $('anterior').hidden = false;
    $('siguiente').hidden = false;
  }
  if (location.hash === '#ver' && !reducido) ir(0);
}
