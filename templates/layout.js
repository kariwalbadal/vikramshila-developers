const site = require('../content/site');

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// GitHub Pages serves this repo under /vikramshila-developers/, not domain
// root — every same-origin href/src must carry that prefix (see content/site.js).
function u(p) {
  return site.basePath + p;
}

/* The chrome is nearly nothing: a floating mark, three labels, one action.
   It rides above the media transparent-and-light, and gains an ivory glass
   back once the page scrolls (see js/site.js). The media is the page. */
function header(path) {
  var nav = [
    { label: 'Projects', href: '/our-projects/' },
    { label: 'About', href: '/about-us/' },
    { label: 'Contact', href: '/contact-us/' },
  ];
  return `
<div class="scroll-progress"></div>
<header class="chrome" data-chrome>
  <a href="${u('/')}" class="chrome-brand">
    <img src="${u('/images/brand/vd-mark.png')}" alt="" aria-hidden="true" width="412" height="452">
    <span>Vikramshila<br>Developers</span>
  </a>
  <nav class="chrome-nav" aria-label="Primary">
    ${nav.map((n) => `<a href="${u(n.href)}"${n.href === path ? ' class="is-active"' : ''}>${esc(n.label)}</a>`).join('\n    ')}
    <a class="chrome-tel" href="${site.phones.primaryHref}">${site.phones.primary}</a>
    <a class="chrome-cta" href="${u('/contact-us/')}">Enquire</a>
    <button class="nav-toggle" aria-label="Open menu" aria-expanded="false"><span></span></button>
  </nav>
</header>
<div class="mobile-nav">
  <a href="${u('/')}">Home</a>
  ${site.nav.slice(1).map((n) => `<a href="${u(n.href)}">${esc(n.label)}</a>`).join('\n  ')}
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
  var ogImage = opts.ogImage ? site.siteUrl + opts.ogImage : site.siteUrl + '/images/upscaled/hero-monument-clean-4k.jpg';
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
<link rel="preload" href="${u('/fonts/Marcellus-Regular.woff2')}" as="font" type="font/woff2" crossorigin>
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
<script src="${u('/vendor/gsap.min.js')}" defer></script>
<script src="${u('/vendor/ScrollTrigger.min.js')}" defer></script>
<script src="${u('/vendor/lenis.min.js')}" defer></script>
<script src="${u('/js/site.js')}" defer></script>
${scripts.map((s) => `<script src="${u(s)}" defer></script>`).join('\n')}
</body>
</html>`;
}

module.exports = { layout, esc, u };
