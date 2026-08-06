#!/usr/bin/env node
// Pulls atmosphere/interior plates from Pexels for the labelled "mood" bands.
//
// SECURITY: the API key is read at runtime from PEXELS_API_KEY (or a local
// .env outside this repo) and is never written to any file this tool creates.
// Do not hardcode it here — this file is committed.
//
// Usage: PEXELS_API_KEY=... node tools/fetch-pexels.js
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'images', 'mood');
fs.mkdirSync(OUT, { recursive: true });

function readKey() {
  if (process.env.PEXELS_API_KEY) return process.env.PEXELS_API_KEY;
  // fall back to a developer-local env file that lives OUTSIDE this repo
  const local = path.join(process.env.HOME, 'Desktop/Workspace/chinmaye/.env');
  if (fs.existsSync(local)) {
    const m = fs.readFileSync(local, 'utf8').match(/PEXELS_API_KEY\s*=\s*"?([^"\n]+)"?/);
    if (m) return m[1].trim();
  }
  throw new Error('No Pexels API key. Set PEXELS_API_KEY in the environment.');
}
const KEY = readKey();

function get(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: headers || {} }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(get(res.headers.location, headers));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, buf: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

// Each plate is chosen to read as ATMOSPHERE, not as "this is the flat you
// are buying" — architectural light, material, texture, threshold. They are
// rendered under an explicit "not this project" label in the template.
const PLATES = [
  { slug: 'light-interior',  q: 'sunlight through window empty room interior', orientation: 'landscape' },
  { slug: 'marble-detail',   q: 'polished marble stone surface macro',          orientation: 'landscape' },
  { slug: 'stair-geometry',  q: 'minimal concrete staircase architecture',      orientation: 'landscape' },
  { slug: 'balcony-evening', q: 'apartment balcony railing evening city',       orientation: 'landscape' },
  { slug: 'doorway-warm',    q: 'warm lit doorway corridor architecture',       orientation: 'landscape' },
  { slug: 'brass-texture',   q: 'brass metal texture gold surface',             orientation: 'landscape' },
];

(async () => {
  const credits = [];
  for (const plate of PLATES) {
    const url = 'https://api.pexels.com/v1/search?per_page=1&orientation=' +
      plate.orientation + '&query=' + encodeURIComponent(plate.q);
    const res = await get(url, { Authorization: KEY });
    if (res.status !== 200) { console.log('SEARCH FAIL', plate.slug, res.status); continue; }
    const json = JSON.parse(res.buf.toString());
    const photo = json.photos && json.photos[0];
    if (!photo) { console.log('NO RESULT', plate.slug); continue; }

    const src = photo.src.large2x || photo.src.large;
    const img = await get(src);
    const dest = path.join(OUT, plate.slug + '.jpg');
    fs.writeFileSync(dest, img.buf);
    execSync(`sips -s format jpeg -s formatOptions 62 --resampleWidth 1500 "${dest}" --out "${dest}" >/dev/null 2>&1`);

    credits.push(`${plate.slug}.jpg — photo by ${photo.photographer} (${photo.photographer_url}) via Pexels — ${photo.url}`);
    console.log('OK', plate.slug, (fs.statSync(dest).size / 1024).toFixed(0) + 'KB', '|', photo.alt || '');
  }

  fs.writeFileSync(path.join(OUT, 'CREDITS.txt'),
    'Atmosphere plates used as clearly-labelled mood imagery only — never as a\n' +
    'depiction of an actual Vikramshila Developers property.\n' +
    'Pexels License: free to use, attribution not required (given anyway).\n\n' +
    credits.join('\n') + '\n');
  console.log('\nWrote', credits.length, 'plates to images/mood/');
})();
