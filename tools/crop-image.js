#!/usr/bin/env node
// Arbitrary-offset crop via a headless-Chrome canvas (sips only crops centered).
// Usage: node tools/crop-image.js <src> <dest> <sx> <sy> <sw> <sh> [quality=85]
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const [, , src, dest, sxA, syA, swA, shA, qA] = process.argv;
const sx = +sxA, sy = +syA, sw = +swA, sh = +shA, quality = qA ? +qA : 85;

(async () => {
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const page = await browser.newPage();
  const srcData = 'data:image/jpeg;base64,' + fs.readFileSync(src).toString('base64');
  const dataUrl = await page.evaluate(async (srcData, sx, sy, sw, sh, quality) => {
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = srcData; });
    const canvas = document.createElement('canvas');
    canvas.width = sw; canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    return canvas.toDataURL('image/jpeg', quality / 100);
  }, srcData, sx, sy, sw, sh, quality);
  await browser.close();
  const b64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(b64, 'base64'));
  console.log(`cropped ${src} [${sx},${sy},${sw}x${sh}] -> ${dest} (${(fs.statSync(dest).size / 1024).toFixed(0)}KB)`);
})();
