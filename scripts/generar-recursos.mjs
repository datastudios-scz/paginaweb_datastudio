/**
 * Genera los recursos públicos del sitio a partir del logo vectorial:
 *   public/favicon.svg, favicon.ico, apple-touch-icon.png, icono-192.png, icono-512.png,
 *   public/og/inicio.png y public/og/portal-bi.png (imágenes para compartir, 1200×630).
 *
 * Uso:  npm run recursos
 * Requiere Microsoft Edge o Google Chrome instalado (Playwright usa el navegador del sistema
 * para dibujar las imágenes OG con la tipografía real; no descarga Chromium).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { chromium } from 'playwright-core';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLICO = join(RAIZ, 'public');
const C = { abismo: '#001720', petroleo: '#00394e', verde: '#037a70', salvia: '#ced9bd', verdeClaro: '#4dcfc1' };

// ── Geometría del logo: se lee del componente para tener una sola fuente de verdad ──
const logo = readFileSync(join(RAIZ, 'src/components/Logo.astro'), 'utf8');
const ICONO = logo.match(/const ICONO =\s*'([^']+)'/)[1];
const WORDMARK = logo.match(/const WORDMARK =\s*'([^']+)'/)[1];

// Favicon pequeño: solo las cuatro barras (a 16 px el monitor completo no se lee).
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${C.abismo}"/><g fill="#fff"><rect x="11.25" y="30" width="7" height="18"/><rect x="22.75" y="24" width="7" height="24"/><rect x="34.25" y="18" width="7" height="30"/><rect x="45.75" y="30" width="7" height="18"/></g></svg>`;

// Íconos grandes: el monitor completo, centrado dentro de la zona segura (maskable).
const iconoApp = (lado, escala = 0.56) => {
  const w = lado * escala;
  const h = (w * 1895) / 1893;
  const x = (lado - w) / 2;
  const y = (lado - h) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}"><rect width="${lado}" height="${lado}" fill="${C.abismo}"/><g transform="translate(${x} ${y}) scale(${w / 1893})"><path fill="#fff" fill-rule="evenodd" d="${ICONO}"/></g></svg>`;
};

const png = (svg, lado) => sharp(Buffer.from(svg)).resize(lado, lado).png({ compressionLevel: 9 }).toBuffer();

/** ICO con PNG embebidos (formato admitido por todos los navegadores actuales). */
function ico(imagenes) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0);
  cabecera.writeUInt16LE(1, 2);
  cabecera.writeUInt16LE(imagenes.length, 4);
  let desplazamiento = 6 + 16 * imagenes.length;
  const entradas = imagenes.map(({ lado, datos }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(lado >= 256 ? 0 : lado, 0);
    e.writeUInt8(lado >= 256 ? 0 : lado, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(datos.length, 8);
    e.writeUInt32LE(desplazamiento, 12);
    desplazamiento += datos.length;
    return e;
  });
  return Buffer.concat([cabecera, ...entradas, ...imagenes.map((i) => i.datos)]);
}

// ── Imágenes OG: HTML real con Poppins y DM Mono, capturado a 1200×630 ──
// Fuentes en base64: Chromium no carga fuentes file:// desde una página about:blank.
const fuente = (archivo) =>
  `data:font/woff2;base64,${readFileSync(join(RAIZ, 'src/assets/fuentes', archivo)).toString('base64')}`;
const lockup = `<svg viewBox="0 0 5481 560" height="34" fill="#fff"><g transform="scale(0.29551)"><path fill-rule="evenodd" d="${ICONO}"/></g><g transform="translate(748.4 76.5)"><path d="${WORDMARK}"/></g></svg>`;

const plantillaOG = ({ rotulo, titulo, acento, barrasEtiquetas }) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Poppins;font-weight:600;src:url(${fuente('poppins-latin-600-normal.woff2')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${fuente('poppins-latin-500-normal.woff2')})}
@font-face{font-family:'DM Mono';font-weight:500;src:url(${fuente('dm-mono-latin-500-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Poppins;color:#fff;
 background:radial-gradient(900px 520px at 88% -10%, rgba(0,57,78,.95), transparent 70%), ${C.abismo};
 padding:64px 72px;display:grid;grid-template-columns:1fr 400px;gap:44px}
.izq{display:flex;flex-direction:column;justify-content:space-between}
.rotulo{font-family:'DM Mono';font-size:18px;letter-spacing:.14em;text-transform:uppercase;color:${C.verdeClaro};margin-top:44px}
h1{font-weight:600;font-size:62px;line-height:1.05;letter-spacing:-.035em;margin-top:18px;text-wrap:balance}
h1 span{color:${C.verdeClaro}}
.pie{font-family:'DM Mono';font-size:18px;color:#a6ae9a;letter-spacing:.06em}
.graf{align-self:end;display:grid;grid-template-columns:repeat(4,1fr);gap:18px;height:420px;align-items:end;
 border-bottom:2px solid rgba(206,217,189,.35);padding-bottom:0;position:relative}
.b{background:${C.petroleo};border-top:5px solid ${C.verdeClaro};position:relative}
.b span{position:absolute;left:8px;right:4px;bottom:12px;font-size:12.5px;font-weight:500;line-height:1.25;color:#ced9bd}
.b3{background:${C.verde};border-top-color:#fff}.b3 span{color:#fff}
.h60{height:60.2%}.h80{height:79.6%}.h100{height:100%}
</style></head><body>
<div class="izq"><div>${lockup}<p class="rotulo">${rotulo}</p><h1>${titulo}${acento ? ` <span>${acento}</span>` : ''}</h1></div>
<p class="pie">datastudio.es · Santa Cruz, Bolivia</p></div>
<div class="graf">
<div class="b h60"><span>${barrasEtiquetas[0]}</span></div><div class="b h80"><span>${barrasEtiquetas[1]}</span></div>
<div class="b b3 h100"><span>${barrasEtiquetas[2]}</span></div><div class="b h60"><span>${barrasEtiquetas[3]}</span></div>
</div></body></html>`;

function rutaNavegador() {
  const candidatos = [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  return candidatos.find((r) => existsSync(r));
}

async function main() {
  mkdirSync(join(PUBLICO, 'og'), { recursive: true });

  writeFileSync(join(PUBLICO, 'favicon.svg'), faviconSvg);
  writeFileSync(
    join(PUBLICO, 'favicon.ico'),
    ico([
      { lado: 16, datos: await png(faviconSvg, 16) },
      { lado: 32, datos: await png(faviconSvg, 32) },
      { lado: 48, datos: await png(faviconSvg, 48) },
    ]),
  );
  writeFileSync(join(PUBLICO, 'apple-touch-icon.png'), await png(iconoApp(180, 0.6), 180));
  writeFileSync(join(PUBLICO, 'icono-192.png'), await png(iconoApp(192), 192));
  writeFileSync(join(PUBLICO, 'icono-512.png'), await png(iconoApp(512), 512));
  console.log('✓ favicons e íconos');

  const ejecutable = rutaNavegador();
  if (!ejecutable) {
    console.warn('! No se encontró Edge/Chrome: se omiten las imágenes OG.');
    return;
  }
  const navegador = await chromium.launch({ executablePath: ejecutable });
  const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const barras = ['Consultoría', 'Social Metrics', 'Portal BI', 'E‑commerce'];
  const imagenes = [
    { archivo: 'inicio.png', rotulo: 'Innovación, analítica &amp; marketing', titulo: 'Datos que toda tu empresa puede usar.' },
    { archivo: 'portal-bi.png', rotulo: 'Portal BI', titulo: 'Power BI para toda la empresa.', acento: 'Una sola licencia.' },
  ];
  for (const img of imagenes) {
    await pagina.setContent(plantillaOG({ ...img, barrasEtiquetas: barras }), { waitUntil: 'load' });
    await pagina.evaluate(() => document.fonts.ready);
    const captura = await pagina.screenshot({ type: 'png' });
    writeFileSync(join(PUBLICO, 'og', img.archivo), await sharp(captura).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer());
    console.log(`✓ og/${img.archivo}`);
  }
  await navegador.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
