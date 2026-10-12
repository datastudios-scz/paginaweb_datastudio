/**
 * Graba el anuncio del Portal BI a MP4, cuadro por cuadro (ADR-016).
 *   1) npm run build && npm run preview   (en otra terminal)
 *   2) npm run anuncio:video  [-- --formatos 9x16,1x1] [--fps 60] [--crf 18] [--base http://localhost:4321]
 *
 * No graba la pantalla: abre /portal-bi/anuncio/?render=1 en Chrome al tamaño exacto del
 * formato, lleva el anuncio a cada instante (window.__anuncio.ir) y le saca una foto. Así no
 * se pierde ningún cuadro aunque la máquina sea lenta, y el resultado es siempre el mismo.
 * Las fotos van directo a ffmpeg (H.264, yuv420p, faststart: lo que piden Meta, TikTok,
 * YouTube y LinkedIn). Sin audio: la música se pone en cada app.
 *
 * Deja en public/portal-bi/anuncio/:
 *   portal-bi-anuncio-<formato>.mp4   el video
 *   portal-bi-portada-<formato>.jpg   el cuadro del segundo 1, para elegirlo como portada
 *
 * Requiere ffmpeg en el PATH (en Windows: winget install Gyan.FFmpeg) y Edge o Chrome.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const FORMATOS = { '9x16': [1080, 1920], '4x5': [1080, 1350], '1x1': [1080, 1080], '16x9': [1920, 1080] };

const args = process.argv.slice(2);
const opcion = (nombre, porDefecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : porDefecto;
};
const BASE = opcion('base', 'http://localhost:4321');
const FPS = Number(opcion('fps', '60'));
const CRF = Number(opcion('crf', '18'));
const SALIDA = opcion('salida', 'public/portal-bi/anuncio');
const pedidos = opcion('formatos', Object.keys(FORMATOS).join(',')).split(',');

for (const f of pedidos) {
  if (!FORMATOS[f]) {
    console.error(`Formato desconocido: ${f}. Hay: ${Object.keys(FORMATOS).join(', ')}`);
    process.exit(1);
  }
}

if (spawnSync('ffmpeg', ['-version']).status !== 0) {
  console.error('No se encontró ffmpeg en el PATH. En Windows: winget install Gyan.FFmpeg');
  process.exit(1);
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

mkdirSync(SALIDA, { recursive: true });
const navegador = await chromium.launch({ executablePath: ejecutable });

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

  const foto = async (ms, tipo = 'png') => {
    await pagina.evaluate((t) => window.__anuncio.ir(t), ms);
    /* Dos cuadros del navegador: el primero aplica el instante, el segundo lo pinta */
    await pagina.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    return pagina.screenshot(tipo === 'png' ? { type: 'png' } : { type: 'jpeg', quality: 92 });
  };

  /* La portada: el gancho, con la pregunta y los asientos ya a la vista */
  writeFileSync(`${SALIDA}/portal-bi-portada-${formato}.jpg`, await foto(1000, 'jpeg'));

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

  const mb = (statSync(destino).size / 1024 / 1024).toFixed(1);
  const segundos = Math.round((Date.now() - inicio) / 1000);
  console.log(`\r${formato}: ${destino} · ${ancho}×${alto} · ${FPS} cps · ${mb} MB · ${segundos} s de grabación`);
  if (errores.length) console.log(`  ⚠ errores en la página: ${[...new Set(errores)].join(' | ')}`);
}

await navegador.close();
