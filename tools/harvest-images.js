#!/usr/bin/env node
// Extracts every on-domain (vikramshiladevelopers.in) image URL referenced across
// the mirrored HTML pages + the sitemap, resolves each to its highest-resolution
// variant, downloads once into a shared pool, then links into per-page folders
// with a manifest. Run: node tools/harvest-images.js

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'harvest', 'raw');
const POOL_DIR = path.join(ROOT, 'assets', 'harvest', '_pool');
const MANIFEST_PATH = path.join(ROOT, 'assets', 'harvest', 'manifest.json');
const DOMAIN = 'vikramshiladevelopers.in';

fs.mkdirSync(POOL_DIR, { recursive: true });

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function fetchOnce(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (harvest-bot)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(fetchOnce(new URL(res.headers.location, url).toString()));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return resolve({ ok: false, status: res.statusCode });
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ ok: true, buf: Buffer.concat(chunks) }));
    });
    req.on('error', () => resolve({ ok: false, status: 'error' }));
    req.setTimeout(20000, () => { req.destroy(); resolve({ ok: false, status: 'timeout' }); });
  });
}

async function fetchBuffer(url) {
  const backoffs = [0, 1200, 3000, 6000];
  let last;
  for (const delay of backoffs) {
    if (delay) { console.log(`  retry ${url} after ${delay}ms`); await sleep(delay); }
    last = await fetchOnce(url);
    if (last.ok) return last;
  }
  return last;
}

function pageKeyFromFile(f) {
  return f.replace(/\.html$/, '');
}

// --- 1. collect raw candidate URLs per page -------------------------------
const files = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith('.html'));
const perPageUrls = {}; // pageKey -> Set(url)
const urlRe = /(?:https?:)?\/\/[a-zA-Z0-9.\-]*vikramshiladevelopers\.in\/wp-content\/uploads\/[^\s"'()<>]+|\/wp-content\/uploads\/[^\s"'()<>]+/g;

for (const f of files) {
  const html = fs.readFileSync(path.join(RAW_DIR, f), 'utf8');
  const key = pageKeyFromFile(f);
  const set = new Set();
  let m;
  while ((m = urlRe.exec(html))) {
    let u = m[0];
    if (u.startsWith('//')) u = 'https:' + u;
    else if (u.startsWith('/wp-content')) u = 'https://' + DOMAIN + u;
    u = u.replace(/^http:/, 'https:').replace(/[)"'\s]+$/, '');
    set.add(u);
  }
  perPageUrls[key] = set;
}

// sitemap
const sitemapPath = path.join(RAW_DIR, 'page-sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  // crude block split by <url>...</url>
  const blocks = xml.split('<url>').slice(1);
  for (const block of blocks) {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
    if (!locMatch) continue;
    const pageUrl = locMatch[1];
    const slug = pageUrl.replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '') || 'index';
    const key = slug === '' ? 'index' : slug;
    if (!perPageUrls[key]) perPageUrls[key] = new Set();
    const imgRe = /<image:loc>([^<]+)<\/image:loc>/g;
    let im;
    while ((im = imgRe.exec(block))) {
      perPageUrls[key].add(im[1].replace(/^http:/, 'https:'));
    }
  }
}

// --- 2. build logical-image groups -----------------------------------------
// logical id = filename with WxH size suffix and "-scaled" stripped
function logicalId(u) {
  const fname = decodeURIComponent(u.split('/').pop());
  const ext = fname.match(/\.[a-zA-Z0-9]+$/)?.[0] || '';
  let base = fname.slice(0, fname.length - ext.length);
  base = base.replace(/-\d+x\d+$/, ''); // strip WP thumbnail size suffix
  base = base.replace(/-scaled$/, '');
  return base + ext.toLowerCase();
}

const allUrls = new Set();
for (const set of Object.values(perPageUrls)) for (const u of set) allUrls.add(u);

const groups = {}; // logicalId -> { candidates: Set(url), pages: Set }
for (const [page, set] of Object.entries(perPageUrls)) {
  for (const u of set) {
    const id = logicalId(u);
    if (!groups[id]) groups[id] = { candidates: new Set(), pages: new Set() };
    groups[id].candidates.add(u);
    groups[id].pages.add(page);
    // also propose the un-suffixed / un-scaled base URL as a higher-res candidate
    const fname = decodeURIComponent(u.split('/').pop());
    const ext = fname.match(/\.[a-zA-Z0-9]+$/)?.[0] || '';
    let base = fname.slice(0, fname.length - ext.length);
    const dir = u.slice(0, u.length - fname.length);
    if (/-\d+x\d+$/.test(base)) {
      groups[id].candidates.add(dir + base.replace(/-\d+x\d+$/, '') + ext);
    }
    if (/-scaled$/.test(base)) {
      groups[id].candidates.add(dir + base.replace(/-scaled$/, '') + ext);
    }
  }
}

console.log(`Found ${Object.keys(groups).length} logical images across ${files.length} pages (from ${allUrls.size} raw refs).`);

// --- 3. download all candidates, pick the largest by byte size -------------
function sipsDims(file) {
  try {
    const out = require('child_process').execSync(`sips -g pixelWidth -g pixelHeight "${file}"`, { encoding: 'utf8' });
    const w = out.match(/pixelWidth: (\d+)/)?.[1];
    const h = out.match(/pixelHeight: (\d+)/)?.[1];
    return w && h ? { width: +w, height: +h } : null;
  } catch { return null; }
}

async function run() {
  let manifest = { generatedAt: null, images: {} };
  if (fs.existsSync(MANIFEST_PATH)) {
    try { manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')); } catch {}
  }
  const entries = Object.entries(groups);
  let i = 0;
  for (const [id, g] of entries) {
    i++;
    if (manifest.images[id] && fs.existsSync(path.join(POOL_DIR, id))) {
      manifest.images[id].pages = [...new Set([...manifest.images[id].pages, ...g.pages])].sort();
      console.log(`[${i}/${entries.length}] SKIP  ${id} (already in pool)`);
      continue;
    }
    let best = null; // { url, buf, size }
    for (const url of g.candidates) {
      await sleep(150);
      const res = await fetchBuffer(url);
      if (res.ok && res.buf.length > 300) { // skip tiny/broken placeholders
        if (!best || res.buf.length > best.size) best = { url, buf: res.buf, size: res.buf.length };
      }
    }
    if (!best) {
      console.log(`[${i}/${entries.length}] MISS  ${id}`);
      continue;
    }
    const destExt = path.extname(id) || path.extname(best.url) || '.jpg';
    const destName = id.endsWith(destExt) ? id : id.replace(/\.[a-zA-Z0-9]+$/, destExt);
    const destPath = path.join(POOL_DIR, destName);
    fs.writeFileSync(destPath, best.buf);
    const dims = sipsDims(destPath);
    manifest.images[destName] = {
      wonUrl: best.url,
      candidatesTried: [...g.candidates],
      bytes: best.size,
      width: dims?.width || null,
      height: dims?.height || null,
      pages: [...g.pages].sort(),
    };
    console.log(`[${i}/${entries.length}] OK    ${destName}  (${(best.size / 1024).toFixed(0)}KB${dims ? ', ' + dims.width + 'x' + dims.height : ''})  <- ${best.url}`);
  }

  manifest.generatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  // link into per-page folders
  for (const [name, info] of Object.entries(manifest.images)) {
    for (const page of info.pages) {
      const pageDir = path.join(ROOT, 'assets', 'harvest', page);
      fs.mkdirSync(pageDir, { recursive: true });
      const dest = path.join(pageDir, name);
      try { fs.linkSync(path.join(POOL_DIR, name), dest); }
      catch { fs.copyFileSync(path.join(POOL_DIR, name), dest); }
    }
  }

  console.log(`\nDone. ${Object.keys(manifest.images).length} images in pool. Manifest: ${MANIFEST_PATH}`);
}

// Node have fake Date.now issues in workflow scripts, but this runs via Bash, fine.
run();
