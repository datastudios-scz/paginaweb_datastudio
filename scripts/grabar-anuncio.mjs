/**
 * Graba el anuncio del Portal BI a MP4, cuadro por cuadro (ADR-016).
 *   1) npm run build
 *   2) npm run anuncio:video  [-- --formatos 9x16,1x1] [--fps 60] [--crf 18] [--salida carpeta] [--base URL]
 *
 * No graba la pantalla: abre /portal-bi/anuncio/?render=1 en Chrome al tamaño exacto del
 * formato, lleva el anuncio a cada instante (window.__anuncio.ir) y le saca una foto. Así no
 * se pierde ningún cuadro aunque la máquina sea lenta, y el resultado es siempre el mismo.
 * Las fotos van directo a ffmpeg (H.264, yuv420p, faststart: lo que piden Meta, TikTok,
 * YouTube y LinkedIn). Sin audio: la música se pone en cada app.
 *
 * Sin --base sirve dist/ desde acá mismo (no hace falta `npm run preview` en otra terminal).
 *
 * Deja en videos-anuncio/ (fuera de git: los videos NO van en el repositorio):
 *   portal-bi-anuncio-<formato>.mp4   el video
 *   portal-bi-portada-<formato>.jpg   el gancho armado (2,45 s), para elegirlo como portada
 * Los que se descargan desde la página los graba .github/workflows/anuncio.yml con este mismo
 * script y los sube al release `anuncio-portal-bi` de GitHub.
 *
 * Sale con código 1 si la página dio errores o si un MP4 no tiene los cuadros o el color que
 * debe: así la Action no publica un video roto.
 *
 * Requiere ffmpeg y ffprobe en el PATH (en Windows: winget install Gyan.FFmpeg) y Chrome o Edge.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright-core';

const FORMATOS = { '9x16': [1080, 1920], '4x5': [1080, 1350], '1x1': [1080, 1080], '16x9': [1920, 1080] };

const args = process.argv.slice(2);
const opcion = (nombre, porDefecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : porDefecto;
};
const FPS = Number(opcion('fps', '60'));
const CRF = Number(opcion('crf', '18'));
const SALIDA = opcion('salida', 'videos-anuncio');
const pedidos = opcion('formatos', Object.keys(FORMATOS).join(',')).split(',');

for (const f of pedidos) {
  if (!FORMATOS[f]) {
    console.error(`Formato desconocido: ${f}. Hay: ${Object.keys(FORMATOS).join(', ')}`);
    process.exit(1);
  }
}

for (const programa of ['ffmpeg', 'ffprobe']) {
  if (spawnSync(programa, ['-version']).status !== 0) {
    console.error(`No se encontró ${programa} en el PATH. En Windows: winget install Gyan.FFmpeg`);
    process.exit(1);
  }
}

const ejecutable = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((r) => existsSync(r));
if (!ejecutable) {
  console.error('No se encontró Chrome ni Edge.');
  process.exit(1);
}

/** Un servidor mínimo de dist/: la página solo pide su HTML, un módulo JS y dos fuentes. */
async function servirDist() {
  const raiz = resolve('dist');
  if (!existsSync(resolve(raiz, 'portal-bi/anuncio/index.html'))) {
    console.error('El sitio no está compilado: corre `npm run build` primero (o pasa --base con un servidor).');
    process.exit(1);
  }
  const TIPOS = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.woff2': 'font/woff2',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
  };
  const servidor = createServer((pedido, respuesta) => {
    let ruta = decodeURIComponent(new URL(pedido.url, 'http://local').pathname);
    if (ruta.endsWith('/')) ruta += 'index.html';
    const archivo = resolve(raiz, `.${ruta}`);
    if (!archivo.startsWith(raiz + sep) || !existsSync(archivo) || statSync(archivo).isDirectory()) {
      respuesta.writeHead(404).end();
      return;
    }
    respuesta.writeHead(200, { 'content-type': TIPOS[extname(archivo)] ?? 'application/octet-stream' });
    createReadStream(archivo).pipe(respuesta);
  });
  await new Promise((listo) => servidor.listen(0, '127.0.0.1', listo));
  return { base: `http://127.0.0.1:${servidor.address().port}`, cerrar: () => servidor.close() };
}

const servido = opcion('base', null) ? null : await servirDist();
const BASE = opcion('base', null) ?? servido.base;

mkdirSync(SALIDA, { recursive: true });
const navegador = await chromium.launch({ executablePath: ejecutable });
const problemas = [];

for (const formato of pedidos) {
  const [ancho, alto] = FORMATOS[formato];
  const contexto = await navegador.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
  const pagina = await contexto.newPage();
  const errores = [];
  pagina.on('pageerror', (e) => errores.push(e.message));
  pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  await pagina.goto(`${BASE}/portal-bi/anuncio/?render=1&formato=${formato}`, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => window.__anuncio.listo);
  const duracion = await pagina.evaluate(() => window.__anuncio.duracion);
  const cuadros = Math.round((duracion / 1000) * FPS);

  const ir = async (ms) => {
    await pagina.evaluate((t) => window.__anuncio.ir(t), ms);
    /* Dos cuadros del navegador: el primero aplica el instante, el segundo lo pinta */
    await pagina.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  };
  /* El cuadro, pedido directo a Chrome con su compresión PNG rápida: mismos píxeles (medido: 0
     bytes distintos contra la foto de Playwright) y 2,3 veces más rápido (10,3 cuadros/s contra
     4,5 en 9:16). Pesa casi el doble, pero va directo a ffmpeg y no se guarda. */
  const cdp = await contexto.newCDPSession(pagina);
  const foto = async (ms) => {
    await ir(ms);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
    return Buffer.from(data, 'base64');
  };

  /* La portada: el gancho armado (el pedido y los siete reportes a la vista, antes de que el
     globo vuelva a vibrar a los 2,55 s y el portal se lo trague todo a los 2,9 s). ADR-019 */
  await ir(2450);
  writeFileSync(`${SALIDA}/portal-bi-portada-${formato}.jpg`, await pagina.screenshot({ type: 'jpeg', quality: 92 }));

  const destino = `${SALIDA}/portal-bi-anuncio-${formato}.mp4`;
  const ffmpeg = spawn(
    'ffmpeg',
    [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      /* Colores de la marca exactos: la conversión a YUV y las etiquetas, en BT.709 (sin esto
         los reproductores asumen BT.709 sobre datos en BT.601 y los verdes se corren). Las
         etiquetas van por -x264-params: con -color_primaries/-color_trc no quedaban escritas
         (ffprobe decía "unknown"). */
      '-vf', 'scale=out_color_matrix=bt709:out_range=tv',
      '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', String(CRF),
      '-x264-params', 'colorprim=bt709:transfer=bt709:colormatrix=bt709:range=tv',
      /* --crf 0 es un máster sin pérdida (para recodificar después sin volver a grabar):
         x264 lo hace con su perfil High 4:4:4, así que ahí no se fija perfil ni nivel */
      ...(CRF === 0 ? [] : ['-profile:v', 'high', '-level:v', '4.2']),
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      destino,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  /* Si ffmpeg se cae, que se diga qué pasó en vez de reventar al escribirle */
  let cayo = false;
  ffmpeg.stdin.on('error', () => (cayo = true));
  const termino = new Promise((ok, mal) => {
    ffmpeg.on('error', mal);
    ffmpeg.on('close', (codigo) => (codigo === 0 ? ok() : mal(new Error(`ffmpeg salió con ${codigo}`))));
  });

  const inicio = Date.now();
  for (let i = 0; i < cuadros && !cayo; i++) {
    const png = await foto((i * 1000) / FPS);
    if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once('drain', r));
    if (i % Math.round(cuadros / 10) === 0) {
      process.stdout.write(`\r${formato}: ${Math.round((i / cuadros) * 100)} % (${i}/${cuadros})   `);
    }
  }
  ffmpeg.stdin.end();
  await termino;
  await contexto.close();

  /* El MP4 tiene que tener TODOS los cuadros y el color etiquetado: se lee del archivo */
  const sonda = spawnSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames,color_primaries', '-of', 'json', destino],
    { encoding: 'utf8' },
  );
  const flujo = JSON.parse(sonda.stdout || '{}').streams?.[0] ?? {};
  if (Number(flujo.nb_frames) !== cuadros) problemas.push(`${formato}: ${flujo.nb_frames} cuadros, debían ser ${cuadros}`);
  if (flujo.color_primaries !== 'bt709') problemas.push(`${formato}: color ${flujo.color_primaries ?? 'sin etiqueta'}, debía ser bt709`);
  if (errores.length) problemas.push(`${formato}: errores en la página: ${[...new Set(errores)].join(' | ')}`);

  const mb = (statSync(destino).size / 1024 / 1024).toFixed(1);
  const segundos = Math.round((Date.now() - inicio) / 1000);
  console.log(`\r${formato}: ${destino} · ${ancho}×${alto} · ${flujo.nb_frames} cuadros a ${FPS} cps · ${mb} MB · ${segundos} s de grabación`);
}

await navegador.close();
servido?.cerrar();
if (problemas.length) {
  console.error(`\n${problemas.length} problema(s):\n  ${problemas.join('\n  ')}`);
  process.exit(1);
}
