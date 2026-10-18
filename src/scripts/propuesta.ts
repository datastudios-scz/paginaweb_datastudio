/**
 * La propuesta a Ribentek (/propuestas/portal-bi-ribentek/): el recorrido en láminas. ADR-020.
 *
 *  - Qué lámina se está viendo: la que cruza el 40 % del alto de la pantalla. Con eso se pinta
 *    la ruta de abajo (las paradas, la línea que se llena, el contador) y la dirección cambia a
 *    #nombre-de-la-lámina, para poder mandar una puntual.
 *  - Cada lámina se arma una vez, cuando entra (.pr-vista). Si el observador no existe o no
 *    dispara, a los 1,5 s se arma lo que está a la vista: una animación nunca puede ser la razón
 *    por la que alguien no lee.
 *  - Ir y volver: los botones de la ruta, sus paradas y el teclado (flechas, avance y retroceso
 *    de página, espacio, Inicio y Fin). El teclado no se roba en los controles: en un deslizador
 *    las flechas lo mueven, y en un botón el espacio lo aprieta.
 *  - La vista por persona cambia sola mientras nadie la toca. La calculadora del margen.
 * CSP: nada de atributos style; el avance de la ruta va por CSSOM.
 */
import { dolares, miles } from './formato';

const raiz = document.querySelector<HTMLElement>('[data-p="raiz"]');
if (raiz) iniciar(raiz);

function iniciar(raiz: HTMLElement) {
  const $ = <T extends Element = HTMLElement>(clave: string, base: ParentNode = raiz) =>
    base.querySelector(`[data-p="${clave}"]`) as T;
  const deck = $('deck');
  const laminas = [...deck.querySelectorAll<HTMLElement>('.pr-lamina')];
  const paradas = [...raiz.querySelectorAll<HTMLAnchorElement>('[data-p="parada"]')];
  const lista = $('paradas');
  const contador = $('actual');
  const anterior = $<HTMLButtonElement>('anterior');
  const siguiente = $<HTMLButtonElement>('siguiente');
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let actual = -1;

  /* ── Dónde estamos ─────────────────────────────────────────────────────────────── */
  const cual = () => {
    const y = deck.scrollTop + deck.clientHeight * 0.4;
    let i = 0;
    for (let k = 0; k < laminas.length; k++) if (laminas[k].offsetTop <= y) i = k;
    return i;
  };

  function marcar(i: number) {
    if (i === actual) return;
    actual = i;
    paradas.forEach((p, k) => {
      if (k === i) p.setAttribute('aria-current', 'step');
      else p.removeAttribute('aria-current');
      p.classList.toggle('es-pasada', k < i);
    });
    lista.style.setProperty('--avance', String(laminas.length > 1 ? i / (laminas.length - 1) : 0));
    contador.textContent = String(i + 1);
    anterior.disabled = i === 0;
    siguiente.disabled = i === laminas.length - 1;
    history.replaceState(null, '', i === 0 ? location.pathname : `#${laminas[i].id}`);
  }

  function ir(i: number, suave = !quieto) {
    const k = Math.max(0, Math.min(laminas.length - 1, i));
    deck.scrollTo({ top: laminas[k].offsetTop, behavior: suave ? 'smooth' : 'auto' });
  }

  let pendiente = 0;
  deck.addEventListener(
    'scroll',
    () => {
      if (pendiente) return;
      pendiente = requestAnimationFrame(() => {
        pendiente = 0;
        marcar(cual());
      });
    },
    { passive: true },
  );

  /* ── Cada lámina se arma al entrar, una vez ────────────────────────────────────── */
  const armar = (l: Element) => l.classList.add('pr-vista');
  if (quieto || !('IntersectionObserver' in window)) {
    laminas.forEach(armar);
  } else {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            armar(e.target);
            observador.unobserve(e.target);
          }
        }
      },
      { root: deck, threshold: 0.18 },
    );
    laminas.forEach((l) => observador.observe(l));
    setTimeout(() => {
      for (const l of laminas) {
        const r = l.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) armar(l);
      }
    }, 1500);
  }

  /* ── Ir y volver ───────────────────────────────────────────────────────────────── */
  anterior.addEventListener('click', () => ir(cual() - 1));
  siguiente.addEventListener('click', () => ir(cual() + 1));
  for (const b of raiz.querySelectorAll<HTMLElement>('[data-p="avanzar"]')) b.addEventListener('click', () => ir(cual() + 1));

  const porId = (id: string) => laminas.findIndex((l) => l.id === id);
  for (const a of [...paradas, $<HTMLAnchorElement>('parada-marca')]) {
    a.addEventListener('click', (e) => {
      const k = porId(a.hash.slice(1));
      if (k < 0) return;
      e.preventDefault();
      ir(k);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const objetivo = e.target as HTMLElement;
    if (objetivo.closest('input, textarea, select, [contenteditable="true"]')) return;
    const aprieta = objetivo.closest('button, a, summary');
    const i = cual();
    let k = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') k = i + 1;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') k = i - 1;
    else if (e.key === ' ' && !aprieta) k = e.shiftKey ? i - 1 : i + 1;
    else if (e.key === 'Home') k = 0;
    else if (e.key === 'End') k = laminas.length - 1;
    if (k < 0 || k >= laminas.length) return;
    e.preventDefault();
    ir(k);
  });

  /* Si llegó con una lámina en la dirección, arranca ahí */
  const pedida = porId(decodeURIComponent(location.hash.slice(1)));
  if (pedida > 0) {
    ir(pedida, false);
    armar(laminas[pedida]);
  }
  marcar(cual());

  /* ── La vista por persona: cambia sola hasta que alguien la toca ───────────────── */
  const vista = $('vista');
  if (vista) {
    const botones = [...vista.querySelectorAll<HTMLButtonElement>('[data-p="persona"]')];
    const poner = (id: string) => {
      vista.dataset.persona = id;
      for (const b of botones) b.setAttribute('aria-pressed', String(b.dataset.id === id));
    };
    let tocada = false;
    let reloj = 0;
    for (const b of botones) {
      b.addEventListener('click', () => {
        tocada = true;
        clearInterval(reloj);
        poner(b.dataset.id ?? 'gerencia');
      });
    }
    const lamina = vista.closest('.pr-lamina');
    if (!quieto && lamina && 'IntersectionObserver' in window) {
      new IntersectionObserver(
        ([e]) => {
          clearInterval(reloj);
          if (!e.isIntersecting || tocada) return;
          reloj = window.setInterval(() => {
            const k = botones.findIndex((b) => b.getAttribute('aria-pressed') === 'true');
            poner(botones[(k + 1) % botones.length].dataset.id ?? 'gerencia');
          }, 3200);
        },
        { root: deck, threshold: 0.3 },
      ).observe(lamina);
    }
  }

  /* ── La calculadora del margen ─────────────────────────────────────────────────── */
  const margen = $('margen');
  if (margen) {
    const licencia = Number(margen.dataset.licencia) || 14;
    const costo = Number(margen.dataset.costo) || 0;
    const entrada = (n: string) => margen.querySelector<HTMLInputElement>(`[data-entrada="${n}"]`)!;
    const salida = (n: string) => margen.querySelector<HTMLElement>(`[data-salida="${n}"]`)!;
    const calcular = () => {
      const personas = Number(entrada('personas').value);
      const precio = Number(entrada('precio').value);
      const clientes = Number(entrada('clientes').value);
      const licencias = personas * licencia;
      const ahorro = licencias - precio;
      const tuyo = precio - costo;
      salida('personas').textContent = miles(personas);
      salida('precio').textContent = dolares(precio);
      salida('clientes').textContent = String(clientes);
      salida('licencias').textContent = dolares(licencias);
      salida('cobro').textContent = dolares(precio);
      salida('ahorro').textContent = dolares(Math.max(0, ahorro));
      salida('margen').textContent = dolares(Math.max(0, tuyo));
      salida('n').textContent = String(clientes);
      salida('mes').textContent = dolares(Math.max(0, tuyo) * clientes);
      salida('anio').textContent = dolares(Math.max(0, tuyo) * clientes * 12);
      salida('aviso-cliente').hidden = ahorro > 0;
      salida('aviso-socio').hidden = tuyo > 0;
    };
    margen.addEventListener('input', calcular);
    calcular();
  }
}
