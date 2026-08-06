#!/usr/bin/env node
// Tiny zero-dependency static server for local verification (Phase 5/6).
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = process.argv[2] ? +process.argv[2] : 8080;
// mirror GitHub Pages' project-site layout exactly (served under /<repo>/,
// not domain root) so a page that works here works there — every built
// href/src already carries this same prefix (see content/site.js basePath)
const BASE_PATH = require('../content/site').basePath;
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain' };

http.createServer(function (req, res) {
  var reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (BASE_PATH) {
    if (reqPath === '/' || reqPath === BASE_PATH) {
      res.writeHead(302, { Location: BASE_PATH + '/' });
      return res.end();
    }
    if (!reqPath.startsWith(BASE_PATH + '/')) { res.writeHead(404); return res.end('Not found (outside base path): ' + reqPath); }
    reqPath = reqPath.slice(BASE_PATH.length);
  }
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  var full = path.join(ROOT, reqPath);
  if (!full.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(full, function (err, data) {
    if (err) { res.writeHead(404); return res.end('Not found: ' + reqPath); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, function () { console.log('serving ' + ROOT + ' on http://localhost:' + PORT + BASE_PATH + '/'); });
