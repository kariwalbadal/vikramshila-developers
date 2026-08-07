const site = require('../content/site');

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// GitHub Pages serves this repo under /vikramshila-developers/, not domain
// root — every same-origin href/src must carry that prefix (see content/site.js).
function u(p) {
  return site.basePath + p;
}

function navLink(item, path, cls) {
  var active = item.href === path ? ' class="is-active"' : '';
  return `<a href="${u(item.href)}"${active}>${esc(item.label)}</a>`;
}

/* The masthead is the front page of a journal: an info bar, the company's own
   mark and wordmark, then a ruled nav rail. It scrolls away; a compact bar
   slides in once it's gone (see js/site.js). */
function header(path) {
  return `
<div class="scroll-progress"></div>
<header>
  <div class="topbar">
    <div class="wrap topbar-inner">
      <span>Bhagalpur &middot; Deoghar &mdash; Bihar &amp; Jharkhand</span>
      <span class="t-mid">Est. over a decade ago</span>
      <a href="${site.phones.primaryHref}">Call ${site.phones.primary}</a>
    </div>
  </div>
  <div class="masthead">
    <a class="masthead-mark" href="${u('/')}" aria-label="Vikramshila Developers — home">
      <img src="${u('/images/brand/vd-mark.png')}" alt="Vikramshila Developers mark — a teal bird over the letters VD" width="412" height="452">
    </a>
    <div class="masthead-word">Vikramshila Developers</div>
    <div class="masthead-motto">Creation &middot; Not &middot; Construction</div>
  </div>
  <nav class="nav-rail" aria-label="Primary">
    <div class="wrap nav-rail-inner">
      ${site.nav.map((n) => navLink(n, path)).join('\n      ')}
    </div>
  </nav>
</header>
<div class="compact-bar" data-compact>
  <div class="wrap compact-inner">
    <a href="${u('/')}" class="cb-brand">
      <img src="${u('/images/brand/vd-mark.png')}" alt="" aria-hidden="true" width="412" height="452">
      <span>Vikramshila Developers</span>
    </a>
    <nav class="cb-nav" aria-label="Primary, compact">
      ${site.nav.map((n) => navLink(n, path)).join('\n      ')}
    </nav>
    <div class="cb-cta">
      <a class="btn btn-brass" href="${u('/contact-us/')}">Enquire</a>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
        <span></span>
      </button>
    </div>
  </div>
</div>
<div class="mobile-nav">
  ${site.nav.map((n) => `<a href="${u(n.href)}">${esc(n.label)}</a>`).join('\n  ')}
  <div class="mobile-cta">
    <a class="btn btn-brass" href="${site.phones.primaryHref}">Call ${site.phones.primary}</a>
    <a class="btn btn-ghost" href="${site.whatsapp.href}" target="_blank" rel="noopener">WhatsApp</a>
  </div>
</div>`;
}

function mobileActionBar() {
  return `
<div class="mobile-actionbar">
  <a class="btn btn-ghost" href="${site.phones.primaryHref}">Call</a>
  <a class="btn btn-brass" href="${site.whatsapp.href}" target="_blank" rel="noopener">WhatsApp</a>
</div>`;
}

function footer() {
  return `
<footer class="site-footer">
  <div class="colophon-top">
    <div class="wrap">
      <img src="${u('/images/brand/vd-mark-teal.png')}" alt="" aria-hidden="true" width="196" height="253">
      <span class="name">Vikramshila Developers</span>
      <span class="motto">Creation &middot; Not &middot; Construction</span>
    </div>
  </div>
  <div class="wrap footer-grid">
    <div>
      <p>Real estate developers building across Bihar, Jharkhand and West Bengal for over a decade — named after the ancient university that once made this ground legendary.</p>
    </div>
    <div>
      <h5>Explore</h5>
      ${site.nav.map((n) => `<a href="${u(n.href)}">${esc(n.label)}</a>`).join('\n      ')}
      <a href="${u('/chinmaye-in/')}">Hotel Chinmaye Inn</a>
    </div>
    <div>
      <h5>Contact</h5>
      <a href="${site.phones.primaryHref}">Sales &middot; ${site.phones.primary}</a>
      <a href="${site.phones.secondaryHref}">Office &middot; ${site.phones.secondary}</a>
      <a href="mailto:${site.email}">${site.email}</a>
      <a href="${site.whatsapp.href}" target="_blank" rel="noopener">WhatsApp Us</a>
    </div>
    <div>
      <h5>Office</h5>
      <p>${esc(site.address.line1)}<br>${esc(site.address.line2)}</p>
      <a href="https://maps.google.com/?q=${encodeURIComponent(site.address.full)}" target="_blank" rel="noopener">Get directions</a>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>&copy; ${new Date().getFullYear()} Vikramshila Developers Pvt. Ltd.</span>
    <span><a href="${u('/privacy-policy/')}">Privacy Policy</a> &nbsp;&middot;&nbsp; <a href="${u('/terms-conditions/')}">Terms &amp; Conditions</a></span>
    <span style="flex:1 1 100%">RERA registration numbers for these developments are not yet published here — please ask us for the current registration status of any project before you book.</span>
  </div>
</footer>`;
}

function layout(opts) {
  var title = opts.title;
  var description = opts.description;
  var path = opts.path;
  var canonical = site.siteUrl + path;
  var ogImage = opts.ogImage ? site.siteUrl + opts.ogImage : site.siteUrl + '/images/optimized/hero-monument-clean.jpg';
  var jsonLd = opts.jsonLd || [];
  var bodyClass = opts.bodyClass || '';
  var extraHead = opts.extraHead || '';
  var scripts = opts.scripts || [];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.shortName)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogImage}">
<link rel="preload" href="${u('/fonts/BodoniModa-Roman-Variable.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${u('/fonts/Inter-Variable.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${u('/css/tokens.css')}">
<link rel="stylesheet" href="${u('/css/site.css')}">
${jsonLd.map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`).join('\n')}
${extraHead}
</head>
<body class="${bodyClass}">
${header(path)}
<main>
${opts.body}
</main>
${footer()}
${mobileActionBar()}
<script src="${u('/js/site.js')}" defer></script>
${scripts.map((s) => `<script src="${u(s)}" defer></script>`).join('\n')}
</body>
</html>`;
}

module.exports = { layout, esc, u };
