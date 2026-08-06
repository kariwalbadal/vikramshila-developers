#!/usr/bin/env node
// Phase 0 step 5: re-encode harvested images — strip junk, sensible widths,
// even dimensions, JPEG q~80 for photography, PNG kept only where alpha is
// actually used (logos). Never upscales. Output: images/optimized/<name>.jpg|png
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const POOL = path.join(ROOT, 'assets', 'harvest', '_pool');
const OUT = path.join(ROOT, 'images', 'optimized');
const MAX_DIM = 1920;

fs.mkdirSync(OUT, { recursive: true });

function sh(cmd) { return execSync(cmd, { encoding: 'utf8' }); }

function hasAlpha(file) {
  try {
    const out = sh(`sips -g hasAlpha "${file}"`);
    return /hasAlpha: yes/.test(out);
  } catch { return false; }
}

function dims(file) {
  const out = sh(`sips -g pixelWidth -g pixelHeight "${file}"`);
  const w = +out.match(/pixelWidth: (\d+)/)[1];
  const h = +out.match(/pixelHeight: (\d+)/)[1];
  return { w, h };
}

const files = fs.readdirSync(POOL).filter((f) => /\.(jpe?g|png)$/i.test(f));
let savedTotal = 0, originalTotal = 0;

for (const f of files) {
  const src = path.join(POOL, f);
  const alpha = hasAlpha(src);
  const { w, h } = dims(src);
  const scale = Math.min(1, MAX_DIM / Math.max(w, h));
  let tw = Math.round(w * scale); if (tw % 2) tw -= 1;
  let th = Math.round(h * scale); if (th % 2) th -= 1;

  const base = f.replace(/\.[a-zA-Z0-9]+$/, '');
  const destExt = alpha ? '.png' : '.jpg';
  const dest = path.join(OUT, base + destExt);

  const resizeArgs = scale < 1 ? `--resampleHeightWidth ${th} ${tw}` : '';
  const before = fs.statSync(src).size;

  if (alpha) {
    fs.copyFileSync(src, dest);
    if (resizeArgs) sh(`sips ${resizeArgs} "${dest}" >/dev/null 2>&1`);
  } else {
    // try a couple of quality levels; many harvested JPEGs were already
    // compressed (11zon/Pi7 tools), so re-encoding at a fixed quality can
    // grow the file — keep whichever candidate is actually smaller.
    let bestBuf = null;
    for (const q of [72, 55]) {
      fs.copyFileSync(src, dest);
      sh(`sips -s format jpeg -s formatOptions ${q} ${resizeArgs} "${dest}" >/dev/null 2>&1`);
      const buf = fs.readFileSync(dest);
      if (!bestBuf || buf.length < bestBuf.length) bestBuf = buf;
    }
    // also consider: resize-only, no requality (keeps source encoder quality)
    if (resizeArgs) {
      fs.copyFileSync(src, dest);
      sh(`sips ${resizeArgs} "${dest}" >/dev/null 2>&1`);
      const buf = fs.readFileSync(dest);
      if (buf.length < bestBuf.length) bestBuf = buf;
    }
    // last resort: original file wins (never ship something bigger than source)
    if (bestBuf.length >= before) bestBuf = fs.readFileSync(src);
    fs.writeFileSync(dest, bestBuf);
  }

  const after = fs.statSync(dest).size;
  originalTotal += before; savedTotal += before - after;
  console.log(`${f} -> ${base}${destExt}  ${w}x${h}${scale < 1 ? ` -> ${tw}x${th}` : ''}  ${(before/1024).toFixed(0)}KB -> ${(after/1024).toFixed(0)}KB`);
}

console.log(`\n${files.length} images optimized. Saved ${(savedTotal/1024/1024).toFixed(1)}MB of ${(originalTotal/1024/1024).toFixed(1)}MB original.`);
