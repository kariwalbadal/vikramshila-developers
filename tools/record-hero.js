#!/usr/bin/env node
// Record the hero experience as a real video: CDP screencast frames from
// headless Chrome, assembled by ffmpeg with true frame timings.
// Usage: node tools/record-hero.js [outName] [width height]
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const BASE = process.env.BASE_URL || ('http://localhost:8090' + require('../content/site').basePath);
const OUT = path.join(ROOT, 'verify-out', 'video');
const FRAMES = path.join(OUT, 'frames');
fs.rmSync(FRAMES, { recursive: true, force: true });
fs.mkdirSync(FRAMES, { recursive: true });

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const outName = process.argv[2] || 'hero-desktop';
const W = parseInt(process.argv[3] || '1440', 10);
const H = parseInt(process.argv[4] || '900', 10);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--force-color-profile=srgb', '--disable-gpu-vsync'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

  const cdp = await page.target().createCDPSession();
  const frames = [];
  cdp.on('Page.screencastFrame', async (ev) => {
    frames.push({ data: ev.data, ts: ev.metadata.timestamp });
    try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) {}
  });

  await page.goto(BASE + (process.argv[5] || '/'), { waitUntil: 'networkidle0', timeout: 30000 });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: W, maxHeight: H, everyNthFrame: 1 });

  // swirl ~2.2s + canvas fade, then a settle beat
  await new Promise((r) => setTimeout(r, 4600));

  // then ride the whole film: steady human-speed wheel through every chapter
  for (let i = 0; i < 135; i++) {
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: W / 2, y: H / 2, deltaX: 0, deltaY: 150 });
    await new Promise((r) => setTimeout(r, 110));
  }
  await new Promise((r) => setTimeout(r, 1400));

  await cdp.send('Page.stopScreencast');
  await browser.close();

  if (frames.length < 10) { console.error('too few frames:', frames.length); process.exit(1); }

  // write frames + a concat list with real durations
  let list = '';
  frames.forEach((f, i) => {
    const name = `f${String(i).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(FRAMES, name), Buffer.from(f.data, 'base64'));
    const dur = i < frames.length - 1 ? Math.max(0.008, frames[i + 1].ts - f.ts) : 0.04;
    list += `file '${name}'\nduration ${dur.toFixed(4)}\n`;
  });
  list += `file 'f${String(frames.length - 1).padStart(5, '0')}.jpg'\n`;
  fs.writeFileSync(path.join(FRAMES, 'list.txt'), list);

  const mp4 = path.join(OUT, outName + '.mp4');
  execSync(`ffmpeg -y -f concat -safe 0 -i list.txt -vf "fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -crf 19 -preset medium "${mp4}"`, { cwd: FRAMES, stdio: 'pipe' });
  console.log('frames:', frames.length, 'span:', (frames[frames.length - 1].ts - frames[0].ts).toFixed(1) + 's');
  console.log('video:', path.relative(ROOT, mp4));
})();
