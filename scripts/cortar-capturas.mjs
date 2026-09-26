/**
 * Corta una captura de página completa en tramos para revisarla con detalle.
 * Uso: node scripts/cortar-capturas.mjs qa/_1440.png 1000 qa/tramos/inicio1440
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [, , archivo, alto = '1000', prefijo] = process.argv;
if (!archivo || !prefijo) {
  console.error('Uso: node scripts/cortar-capturas.mjs <captura.png> <alto> <prefijo>');
  process.exit(1);
}
mkdirSync(dirname(prefijo), { recursive: true });
const { width, height } = await sharp(archivo).metadata();
const h = Number(alto);
let i = 0;
for (let y = 0; y < height; y += h) {
  const tramo = Math.min(h, height - y);
  await sharp(archivo).extract({ left: 0, top: y, width, height: tramo }).toFile(`${prefijo}-${String(i++).padStart(2, '0')}.png`);
}
console.log(`${archivo}: ${width}×${height} → ${i} tramos`);
