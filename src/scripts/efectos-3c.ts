/**
 * Lo que la versión cinemática de «A tu Power BI le faltan 3 cosas» dibuja en un <canvas>
 * (AnuncioTresCosasB.astro, ADR-022): las chispas de fondo, las que convergen en la revelación de
 * la IA, y en la toma del ahorro las mil licencias que implotan en una y las mil personas que se
 * encienden alrededor.
 *
 * Todo es función del segundo que le pasa el motor (anuncio.ts llama a window.__efectos en cada
 * cuadro, también al grabar): ni el reloj de la máquina ni azar en tiempo de ejecución. Los
 * números «al azar» salen de una semilla fija, así el mismo instante da siempre el mismo cuadro.
 *
 * Tamaños en u = 1/1080 del lado corto del lienzo, como el CSS. CSP: el lienzo se mide por
 * atributos (width/height), nunca con style.
 */

/* Una semilla fija: la misma secuencia en cada carga (mulberry32) */
function semilla(s: number) {
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const acotar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const saleCubica = (x: number) => 1 - Math.pow(1 - acotar(x), 3);
const entraCubica = (x: number) => Math.pow(acotar(x), 3);
/* Un resorte que se pasa un poco y vuelve (como --resorte del CSS) */
const resorte = (x: number) => {
  const k = acotar(x);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};

/* El lienzo del tamaño de su caja (por la densidad de la pantalla: nítido en un teléfono, 1:1 al
   grabar) y limpio. Devuelve con qué dibujar y la unidad u */
function preparar(c: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const w = c.clientWidth;
  const h = c.clientHeight;
  const W = Math.round(w * dpr);
  const H = Math.round(h * dpr);
  if (c.width !== W || c.height !== H) {
    c.width = W;
    c.height = H;
  }
  const g = c.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  const lienzo = c.closest<HTMLElement>('.an-lienzo')!;
  const u = Math.min(lienzo.clientWidth, lienzo.clientHeight) / 1080;
  return { g, w, h, u };
}

/* ── Las chispas de fondo, y las que convergen en la estrella de la IA ─────────────────────── */
const azar = semilla(20261102);
const CHISPAS = Array.from({ length: 64 }, () => ({
  x: azar(),
  y: azar(),
  v: 0.012 + azar() * 0.03,
  r: 1.4 + azar() * 2.6,
  w: 0.6 + azar() * 1.4,
  f: azar() * Math.PI * 2,
}));
const CONVERGEN = Array.from({ length: 150 }, () => ({
  a: azar() * Math.PI * 2,
  d: 0.45 + azar() * 0.5,
  t: azar() * 0.25,
  r: 1.2 + azar() * 2.2,
}));

/* La revelación de la IA: la estrella está en el centro, al 48 % del alto (anuncio-3c-b.css) */
const REVELA = { desde: 11.9, hasta: 12.55, y: 0.48 };

function chispas(c: HTMLCanvasElement, s: number) {
  const { g, w, h, u } = preparar(c);
  /* En la toma de la IA, el violeta; en el resto, el verde de la marca */
  const ia = s >= 11.9 && s < 18.3;
  g.fillStyle = ia ? '#a5b4fc' : '#4dcfc1';
  g.shadowColor = ia ? '#8b5cf6' : '#4dcfc1';
  g.shadowBlur = 8 * u;
  for (const p of CHISPAS) {
    const y = (((p.y - p.v * s) % 1) + 1) % 1;
    const x = p.x + 0.012 * Math.sin(s * p.w + p.f);
    g.globalAlpha = 0.18 + 0.32 * (0.5 + 0.5 * Math.sin(s * p.w * 2.2 + p.f));
    g.beginPath();
    g.arc(x * w, y * h, p.r * u, 0, Math.PI * 2);
    g.fill();
  }
  /* Convergen: de un anillo grande al centro, cada vez más rápido, con su estela */
  if (s >= REVELA.desde && s <= REVELA.hasta) {
    const cx = w / 2;
    const cy = h * REVELA.y;
    const radio = Math.max(w, h);
    g.strokeStyle = '#c7d2fe';
    g.shadowColor = '#8b5cf6';
    for (const p of CONVERGEN) {
      const k = (s - REVELA.desde - p.t) / (REVELA.hasta - REVELA.desde - 0.25);
      if (k <= 0 || k >= 1) continue;
      const lejos = (e: number) => radio * p.d * (1 - entraCubica(e));
      const ang = p.a + entraCubica(k) * 0.9;
      const d1 = lejos(k);
      const d0 = lejos(Math.max(0, k - 0.12));
      g.globalAlpha = 0.85 * Math.sin(Math.PI * k);
      g.lineWidth = p.r * u;
      g.beginPath();
      g.moveTo(cx + Math.cos(ang - 0.05) * d0, cy + Math.sin(ang - 0.05) * d0);
      g.lineTo(cx + Math.cos(ang) * d1, cy + Math.sin(ang) * d1);
      g.stroke();
    }
  }
  g.globalAlpha = 1;
  g.shadowBlur = 0;
}

/* ── El ahorro: mil licencias que implotan en una, y mil personas alrededor ───────────────────
   Los tiempos, desde el comienzo de la toma (A = 2,25 s, la --a de .tcb-s2): las licencias
   llegan en ola 0,35 – 1,45 · implotan 1,75 – 2,45 · destello 2,4 · la gente, anillo por anillo,
   2,6 – 3,6, y los anillos giran hasta el final. La licencia que queda (la tarjeta) y los textos
   son del DOM; el centro de todo es el de la tarjeta: 50 %, 56 % de la zona */
const A = 2.25;
const COLS = 40;
const FILAS = 25;
const CENTRO_Y = 0.56;
const azarMil = semilla(1000);
const LICENCIAS = Array.from({ length: COLS * FILAS }, (_, k) => ({
  i: k % COLS,
  j: Math.floor(k / COLS),
  t: azarMil() * 0.12,
  b: 0.85 + azarMil() * 0.3,
}));
const ANILLOS = 6;
const GENTE = (() => {
  /* Mil puntos repartidos en seis anillos, más en los de afuera (proporcional al radio) */
  const pesos = Array.from({ length: ANILLOS }, (_, a) => 0.72 + (0.28 * a) / (ANILLOS - 1));
  const suma = pesos.reduce((x, y) => x + y, 0);
  let quedan = 1000;
  return pesos.map((p, a) => {
    const n = a === ANILLOS - 1 ? quedan : Math.round((1000 * p) / suma);
    quedan -= n;
    return { a, n, f: semilla(77 + a)() * Math.PI * 2 };
  });
})();

function mil(c: HTMLCanvasElement, s: number) {
  const t = s - A;
  if (t < 0 || t > 5.2) {
    if (c.width) preparar(c);
    return;
  }
  const { g, w, h, u } = preparar(c);
  const cx = w / 2;
  const cy = h * CENTRO_Y;

  /* La grilla, debajo de la cuenta (se mide su alto: cambia con el formato) y hasta el borde */
  const cuenta = c.parentElement!.querySelector<HTMLElement>('.tcb-cuenta')!;
  const arriba = cuenta.offsetHeight + 18 * u;
  const alto = h - arriba - 6 * u;
  const paso = Math.min((w * 0.94) / COLS, alto / FILAS);
  const lado = paso * 0.68;
  const x0 = cx - (paso * (COLS - 1)) / 2;
  const y0 = arriba + (alto - paso * (FILAS - 1)) / 2;
  const radioMax = Math.hypot((paso * COLS) / 2, (paso * FILAS) / 2);

  if (t < 2.5) {
    for (const p of LICENCIAS) {
      const llega = 0.35 + 1.1 * ((p.i / (COLS - 1)) * 0.62 + (p.j / (FILAS - 1)) * 0.38);
      const k = acotar((t - llega) / 0.18);
      if (k <= 0) continue;
      const px = x0 + p.i * paso;
      const py = y0 + p.j * paso;
      /* Implotan: las de cerca primero, todas con un giro y cada vez más rápido */
      const lejos = Math.hypot(px - cx, py - cy) / radioMax;
      const e = entraCubica((t - 1.75 - (1 - lejos) * 0.15 - p.t) / 0.55);
      const dibuja = (ee: number, alfa: number) => {
        const giro = ee * 1.5;
        const dx = (px - cx) * (1 - ee);
        const dy = (py - cy) * (1 - ee);
        const x = cx + dx * Math.cos(giro) - dy * Math.sin(giro);
        const y = cy + dx * Math.sin(giro) + dy * Math.cos(giro);
        const l = lado * (0.35 + 0.65 * resorte(k)) * (1 - 0.6 * ee);
        g.globalAlpha = alfa * k * (1 - Math.pow(ee, 6));
        g.fillRect(x - l / 2, y - l / 2, l, l);
      };
      g.fillStyle = e > 0 ? '#ffe27a' : `rgb(242 ${Math.round(200 * p.b)} 17)`;
      if (e > 0 && e < 1) {
        dibuja(Math.max(0, e - 0.08), 0.18);
        dibuja(Math.max(0, e - 0.04), 0.35);
      }
      dibuja(e, 1);
    }
  }

  /* El destello y la onda cuando queda una */
  const kd = (t - 2.4) / 0.65;
  if (kd > 0 && kd < 1) {
    const r = saleCubica(kd) * Math.max(w, h) * 0.6;
    const luz = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, r));
    luz.addColorStop(0, `rgb(255 248 214 / ${0.85 * (1 - kd)})`);
    luz.addColorStop(0.4, `rgb(242 200 17 / ${0.45 * (1 - kd)})`);
    luz.addColorStop(1, 'rgb(242 200 17 / 0)');
    g.globalAlpha = 1;
    g.fillStyle = luz;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = `rgb(255 226 122 / ${1 - kd})`;
    g.lineWidth = 6 * u * (1 - kd);
    g.beginPath();
    g.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
    g.stroke();
  }

  /* La gente: mil puntos en seis anillos alrededor de la tarjeta, que giran despacio */
  if (t >= 2.6) {
    const rMax = Math.min(w / 2, h * (1 - CENTRO_Y)) * 0.94;
    const rMin = rMax * 0.68;
    g.shadowColor = '#4dcfc1';
    g.shadowBlur = 6 * u;
    for (const an of GENTE) {
      const radio = rMin + ((rMax - rMin) * an.a) / (ANILLOS - 1);
      const sentido = an.a % 2 ? -1 : 1;
      const giro = an.f + sentido * 0.22 * (t - 2.6);
      const r = Math.max(1.6, 3.2 * u * (radio / rMax));
      for (let k = 0; k < an.n; k++) {
        const frac = k / an.n;
        const aparece = acotar((t - 2.6 - an.a * 0.13 - frac * 0.3) / 0.16);
        if (aparece <= 0) continue;
        const ang = giro + frac * Math.PI * 2;
        g.globalAlpha = 0.9 * aparece;
        g.fillStyle = k % 9 === 0 ? '#ffffff' : '#4dcfc1';
        g.beginPath();
        g.arc(cx + Math.cos(ang) * radio, cy + Math.sin(ang) * radio, r * (0.6 + 0.4 * resorte(aparece)), 0, Math.PI * 2);
        g.fill();
      }
    }
    g.shadowBlur = 0;
  }
  g.globalAlpha = 1;
}

/* Los efectos que el motor llama en cada cuadro: uno por <canvas data-fx="…"> de la página */
const DIBUJOS: Record<string, (c: HTMLCanvasElement, s: number) => void> = { chispas, mil };
const lienzos = [...document.querySelectorAll<HTMLCanvasElement>('canvas[data-fx]')];
window.__efectos = lienzos.map((c) => (s: number) => DIBUJOS[c.dataset.fx!]?.(c, s));
