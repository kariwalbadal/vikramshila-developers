#!/usr/bin/env node
// Fetch several candidates per concept into a scratch dir so they can be
// eyeballed before any are promoted into the site. Nothing here is committed.
// Key is read at runtime; never written to disk. Usage:
//   PEXELS_API_KEY=... node tools/pexels-candidates.js
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const OUT = '/tmp/pexels-candidates';
fs.mkdirSync(OUT, { recursive: true });

function readKey() {
  if (process.env.PEXELS_API_KEY) return process.env.PEXELS_API_KEY;
  const local = path.join(process.env.HOME, 'Desktop/Workspace/chinmaye/.env');
  if (fs.existsSync(local)) {
    const m = fs.readFileSync(local, 'utf8').match(/PEXELS_API_KEY\s*=\s*"?([^"\n]+)"?/);
    if (m) return m[1].trim();
  }
  throw new Error('No Pexels API key.');
}
const KEY = readKey();

function get(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: headers || {} }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); return resolve(get(res.headers.location, headers));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, buf: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

const CONCEPTS = [
  { slug: 'interior', q: 'luxury modern living room interior warm natural light' },
  { slug: 'material', q: 'marble stone texture background elegant' },
  { slug: 'geometry', q: 'modern architecture facade abstract minimal concrete' },
  { slug: 'light',    q: 'soft sunlight shadow on plain wall minimal' },
];

(async () => {
  const meta = [];
  for (const c of CONCEPTS) {
    const url = 'https://api.pexels.com/v1/search?per_page=5&orientation=landscape&query=' + encodeURIComponent(c.q);
    const res = await get(url, { Authorization: KEY });
    if (res.status !== 200) { console.log('FAIL', c.slug, res.status); continue; }
    const photos = JSON.parse(res.buf.toString()).photos || [];
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      const img = await get(p.src.large);
      const dest = path.join(OUT, `${c.slug}-${i}.jpg`);
      fs.writeFileSync(dest, img.buf);
      execSync(`sips --resampleWidth 640 "${dest}" --out "${dest}" >/dev/null 2>&1`);
      meta.push({ file: `${c.slug}-${i}`, id: p.id, photographer: p.photographer, url: p.url, alt: p.alt, src: p.src.large2x });
      console.log(`${c.slug}-${i}`, '|', (p.alt || '').slice(0, 90));
    }
  }
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 2));
})();
