#!/usr/bin/env node
// Quick full-page screenshots for design iteration (desktop + mobile).
// Usage: node tools/shots.js [/path1 /path2 ...]  — defaults to home + one project.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const BASE = process.env.BASE_URL || ('http://localhost:8090' + require('../content/site').basePath);
const OUT = path.join(ROOT, 'verify-out', 'shots');
fs.mkdirSync(OUT, { recursive: true });

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/keshavam-apartment/'];

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  for (const p of pages) {
    for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
      const page = await browser.newPage();
      await page.setViewport(vp);
      await page.goto(BASE + p, { waitUntil: 'networkidle0', timeout: 30000 });
      // walk the page so reveals fire, then return to top
      await page.evaluate(async () => {
        document.documentElement.style.scrollBehavior = 'auto';
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
        // design-review shots want every section visible — force any reveal
        // the robot-speed walk raced past (humans scroll slower; verify.js
        // checks real reveal completion separately)
        document.querySelectorAll('.reveal,.mask').forEach(el => el.classList.add('is-visible'));
      });
      await new Promise(r => setTimeout(r, 900));
      const name = (p === '/' ? 'home' : p.replace(/\//g, '')) + '-' + label + '.png';
      await page.screenshot({ path: path.join(OUT, name), fullPage: true });
      console.log('shot', name);
      await page.close();
    }
  }
  await browser.close();
})();
