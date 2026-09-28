/**
 * Derives every brand asset in `public/` from `brand/logo-original.png`.
 *
 *   npm i -D sharp imagetracerjs
 *   node scripts/brand/build-brand-assets.mjs
 *   npm uninstall sharp imagetracerjs
 *
 * The outputs are committed, so `sharp` is only needed when the artwork changes.
 *
 *   public/logo.png           full logo, 760 px (2x its largest on-screen size)
 *   public/isotipo.png        head + headband crop, 256 px — the only part of the
 *                             illustration that still reads at 36-72 px
 *   public/icon-192.png       transparent app icon
 *   public/icon-512.png       transparent app icon, high resolution
 *   public/apple-touch-icon.png  180 px on the brand background (iOS ignores transparency)
 *   public/favicon.ico        16 + 32 + 48 px
 *   brand/logo-merch.svg      the original wrapped in an SVG for print layouts
 *   brand/logo-trace.svg      automatic vector trace: real paths, but it posterises the
 *                             gradients — an approximation, not a replacement
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ImageTracer from 'imagetracerjs';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '../..');
const SOURCE = resolve(ROOT, 'brand/logo-original.png');
const BRAND_BACKGROUND = { r: 8, g: 11, b: 16, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/** Twice the largest size the hero renders the logo at. */
const LOGO_WIDTH = 760;

/** Colours the tracer quantises the artwork to. Fewer flattens detail, more adds noise. */
const TRACE_COLOURS = 24;

/** Tracing runs on a downscaled copy and scales the paths back up; 700 px keeps it clean. */
const TRACE_SOURCE_WIDTH = 700;

/**
 * Head, headband and shoulder. The full illustration turns into a blur below ~64 px, and
 * the wordmark starts at y≈730, so anything taller drags text fragments into the icon.
 */
const EMBLEM_CROP = { left: 180, top: 20, width: 620, height: 620 };

const original = sharp(SOURCE);

/** Quantising to a palette cuts these files by ~4x with no visible banding. */
const PNG_OPTIONS = { compressionLevel: 9, palette: true };

await original
  .clone()
  .resize({ width: LOGO_WIDTH })
  .png(PNG_OPTIONS)
  .toFile(out('public/logo.png'));

const emblem = () => sharp(SOURCE).extract(EMBLEM_CROP);

// 256 px covers the largest on-screen use (72 px on login) at 2x.
await emblem().resize(256).png(PNG_OPTIONS).toFile(out('public/isotipo.png'));
await emblem().resize(512).png(PNG_OPTIONS).toFile(out('public/icon-512.png'));
await emblem().resize(192).png(PNG_OPTIONS).toFile(out('public/icon-192.png'));

// iOS renders the icon edge to edge and drops transparency, so it gets its own padding.
await emblem()
  .resize(150)
  .extend({ top: 15, bottom: 15, left: 15, right: 15, background: TRANSPARENT })
  .flatten({ background: BRAND_BACKGROUND })
  .png(PNG_OPTIONS)
  .toFile(out('public/apple-touch-icon.png'));

const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(
  icoSizes.map((size) => emblem().resize(size).png(PNG_OPTIONS).toBuffer()),
);
writeFileSync(out('public/favicon.ico'), buildIco(icoPngs));

writeFileSync(out('brand/logo-merch.svg'), buildMerchSvg());
writeFileSync(out('brand/logo-trace.svg'), await buildTracedSvg());

console.log('logo.png, isotipo.png, icon-192/512.png, apple-touch-icon.png, favicon.ico');
console.log('brand/logo-merch.svg + brand/logo-trace.svg (ver README)');

function out(path) {
  return resolve(ROOT, path);
}

/**
 * SVG container around the original bitmap. It is not a traced vector — it exists so the
 * logo can be placed and scaled in vector tools; see the README for the merch caveats.
 */
function buildMerchSvg() {
  const { width, height } = { width: 1254, height: 1254 };
  const base64 = readFileSync(SOURCE).toString('base64');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Disfrutando del Proceso Fit - logo para maquetado de merch.
  Contiene el PNG original (${width}x${height}) embebido: es escalable como objeto, pero la
  imagen sigue siendo de mapa de bits. Para impresiones grandes o corte de vinilo hace falta
  un vector redibujado. Ver la seccion "Identidad de marca" del README.
-->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <title>Disfrutando del Proceso Fit</title>
  <image x="0" y="0" width="${width}" height="${height}"
         xlink:href="data:image/png;base64,${base64}"/>
</svg>
`;
}

/**
 * Best-effort vector trace. Useful when a printer insists on paths (vinyl cutting, single
 * colour versions); it cannot reproduce the gradients of the original illustration.
 */
async function buildTracedSvg() {
  const { data, info } = await sharp(SOURCE)
    .resize(TRACE_SOURCE_WIDTH)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return ImageTracer.imagedataToSVG(
    { width: info.width, height: info.height, data: new Uint8ClampedArray(data) },
    {
      numberofcolors: TRACE_COLOURS,
      ltres: 1,
      qtres: 1,
      pathomit: 12,
      blurradius: 1,
      strokewidth: 0,
      scale: 1254 / TRACE_SOURCE_WIDTH,
    },
  );
}

/**
 * Minimal ICO container with PNG-compressed entries (supported by every current browser
 * and by Windows since Vista), which avoids pulling in an encoder dependency.
 */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);

  let offset = 6 + pngs.length * 16;
  const entries = pngs.map((png) => {
    const size = png.readUInt32BE(16); // width from the PNG IHDR chunk
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // 0 means 256
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...pngs]);
}
