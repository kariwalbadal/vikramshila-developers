#!/usr/bin/env node
// Phase 5/6 verification: real headless Chrome (puppeteer-core), not file
// re-reading. Screenshots every page at desktop + mobile, checks the craft
// gates from the brief, and reports console/network errors.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const BASE = process.env.BASE_URL || ('http://localhost:8090' + require('../content/site').basePath);
const OUT = path.join(ROOT, 'verify-out');
fs.mkdirSync(OUT, { recursive: true });

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const PAGES = [
  '/', '/our-projects/', '/about-us/', '/contact-us/', '/privacy-policy/', '/terms-conditions/',
  '/sunrise/', '/tejprabharesidency/', '/chandeshwar-apartment/', '/keshavam-apartment/',
  '/ganesh-enclave/', '/shivalaya/', '/annapurna-heights/', '/jagdish-enclave/', '/chinmaye-in/',
];

function findChrome() {
  for (const c of CHROME_CANDIDATES) if (fs.existsSync(c)) return c;
  throw new Error('No Chrome found at known paths: ' + CHROME_CANDIDATES.join(', '));
}

async function checkPage(browser, urlPath, viewport, label) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('requestfailed', (req) => failedRequests.push(req.url() + ' :: ' + (req.failure()?.errorText || 'failed')));
  page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message));

  const resp = await page.goto(BASE + urlPath, { waitUntil: 'networkidle0', timeout: 30000 });
  const status = resp ? resp.status() : 0;
  await new Promise((r) => setTimeout(r, 2600)); // let the signature settle

  // walk the full page in viewport-sized steps so every IO-gated reveal
  // actually gets a chance to fire, same as a real visitor scrolling down.
  // Deliberately does NOT reset scroll to 0 afterward — IntersectionObserver
  // callbacks are batched/async, and snapping back before they run would
  // race them (found via direct repro: same walk + reset -> 0/15 revealed;
  // walk without reset -> all revealed).
  await page.evaluate(async () => {
    const step = window.innerHeight;
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y < max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 180));
    }
    // the stepped loop can stop short of the true bottom, leaving the last
    // section never scrolled into view — land on the bottom explicitly
    window.scrollTo(0, max);
    await new Promise((r) => setTimeout(r, 400));
  });
  await new Promise((r) => setTimeout(r, 400));

  const gates = await page.evaluate(() => {
    const out = {};
    out.scrollWidthOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    // images: max-width/height:auto behaviour + alt text
    // A decorative image SHOULD carry alt="" — flagging that is wrong. Only
    // images that convey content need alt text, so exclude ones explicitly
    // marked decorative (aria-hidden / role=presentation).
    out.imagesMissingAlt = Array.from(document.querySelectorAll('img'))
      .filter((img) => {
        var decorative = img.getAttribute('aria-hidden') === 'true' ||
                         img.getAttribute('role') === 'presentation' ||
                         img.closest('[aria-hidden="true"]');
        if (decorative) return false;
        var alt = img.getAttribute('alt');
        return alt === null || !alt.trim();
      })
      .map((img) => img.src);
    out.imageCount = document.querySelectorAll('img').length;
    // touch targets: buttons/links should be >=44px tall on mobile
    const targets = Array.from(document.querySelectorAll('.btn, .nav-toggle, .main-nav a, .footer-grid a'));
    out.smallTouchTargets = targets.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.height > 0 && r.height < 44;
    }).map((el) => el.className + ' :: ' + (el.textContent || '').trim().slice(0, 30) + ' h=' + Math.round(el.getBoundingClientRect().height));
    // header CTA visible outside collapsible menu
    const call = document.querySelector('.header-cta-call');
    out.headerCtaVisible = call ? getComputedStyle(call).display !== 'none' && call.getBoundingClientRect().width > 0 : false;
    // masked headings: every .mask must be observed / become visible eventually — check none stuck at opacity 0 zero-height after wait
    const unrevealedEls = Array.from(document.querySelectorAll('.reveal:not(.is-visible), .mask:not(.is-visible)'));
    out.unrevealed = unrevealedEls.length;
    out.unrevealedDetail = unrevealedEls.slice(0, 6).map((el) => {
      const r = el.getBoundingClientRect();
      return `${el.tagName}.${el.className} h=${Math.round(r.height)} top=${Math.round(r.top + window.scrollY)}`;
    });
    // buttons are real components — no bare <button> default styling, no <a> pretending via inline color only
    out.bareButtons = Array.from(document.querySelectorAll('button:not([class])')).length;
    // signature canvas shouldn't still be visible/opaque after settle time (should have faded on desktop-capable devices) — informational only
    const canvas = document.getElementById('signature-canvas');
    out.canvasStillVisible = canvas ? getComputedStyle(canvas).display !== 'none' && parseFloat(getComputedStyle(canvas).opacity) > 0.05 : false;
    return out;
  });

  const fileBase = urlPath.replace(/\//g, '_') || '_home';
  const shotPath = path.join(OUT, `${fileBase}${label}.png`);
  await page.screenshot({ path: shotPath, fullPage: true });

  await page.close();
  return { urlPath, viewport: label, status, consoleErrors, failedRequests, gates, screenshot: path.relative(ROOT, shotPath) };
}

(async () => {
  const chromePath = findChrome();
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new', args: ['--force-color-profile=srgb'] });
  const results = [];
  for (const p of PAGES) {
    results.push(await checkPage(browser, p, { width: 1440, height: 900 }, '.desktop'));
    results.push(await checkPage(browser, p, { width: 390, height: 844, isMobile: true }, '.mobile'));
    process.stdout.write('.');
  }
  await browser.close();
  console.log('\n');

  let problems = 0;
  for (const r of results) {
    const issues = [];
    if (r.status >= 400 || r.status === 0) issues.push(`HTTP ${r.status}`);
    if (r.consoleErrors.length) issues.push(`console errors: ${r.consoleErrors.join(' | ')}`);
    if (r.failedRequests.length) issues.push(`failed requests: ${r.failedRequests.join(' | ')}`);
    if (r.gates.scrollWidthOverflow > 0) issues.push(`horizontal overflow: ${r.gates.scrollWidthOverflow}px`);
    if (r.gates.imagesMissingAlt.length) issues.push(`images missing alt: ${r.gates.imagesMissingAlt.join(', ')}`);
    if (r.gates.smallTouchTargets.length) issues.push(`touch targets <44px: ${r.gates.smallTouchTargets.join(' | ')}`);
    if (!r.gates.headerCtaVisible) issues.push('header CTA not visible outside menu');
    if (r.gates.unrevealed > 0) issues.push(`${r.gates.unrevealed} .reveal/.mask elements never became visible :: ${r.gates.unrevealedDetail.join(' ||| ')}`);
    if (r.gates.canvasStillVisible && r.viewport === '.desktop' && r.urlPath === '/') issues.push('signature canvas still visible after settle time');

    if (issues.length) {
      problems++;
      console.log(`\n✗ ${r.urlPath} [${r.viewport}]`);
      issues.forEach((i) => console.log('   - ' + i));
    } else {
      console.log(`✓ ${r.urlPath} [${r.viewport}]`);
    }
  }

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(results, null, 2));
  console.log(`\n${results.length} checks run, ${problems} with issues. Screenshots + report.json in verify-out/`);
  process.exit(problems > 0 ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
