const site = require('../content/site');

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function navLink(item, path) {
  var active = item.href === path ? ' is-active' : '';
  return `<a href="${item.href}" class="${active.trim()}">${esc(item.label)}</a>`;
}

function header(path) {
  return `
<div class="scroll-progress"></div>
<header class="site-header">
  <div class="header-pill">
    <a href="/" class="brand">${site.shortName}<small>Bihar, Jharkhand &amp; Bengal</small></a>
    <nav class="main-nav" aria-label="Primary">
      ${site.nav.map((n) => navLink(n, path)).join('\n      ')}
    </nav>
    <div class="header-cta">
      <a class="btn btn-ghost header-cta-call" href="${site.phones.primaryHref}" aria-label="Call ${site.phones.primary}"><span aria-hidden="true">&#9742;</span><span class="label">${site.phones.primary}</span></a>
      <a class="btn btn-brass" href="/contact-us/">Enquire</a>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
        <span></span>
      </button>
    </div>
  </div>
</header>
<div class="mobile-nav">
  ${site.nav.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join('\n  ')}
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
  <div class="wrap footer-grid">
    <div>
      <div class="footer-brand">${site.shortName}</div>
      <p style="margin-top:14px;max-width:34ch;color:var(--text-on-ink-soft);font-size:14px">${esc(site.philosophy)} — real estate developers building across Bihar, Jharkhand and West Bengal for over a decade.</p>
    </div>
    <div>
      <h5>Explore</h5>
      ${site.nav.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join('\n      ')}
      <a href="/chinmaye-in/">Hospitality — Hotel Chinmaye Inn</a>
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
      <p style="font-size:14px;line-height:1.7">${esc(site.address.line1)}<br>${esc(site.address.line2)}</p>
      <a href="https://maps.google.com/?q=${encodeURIComponent(site.address.full)}" target="_blank" rel="noopener">Get directions</a>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>&copy; ${new Date().getFullYear()} Vikramshila Developers Pvt. Ltd.</span>
    <span><a href="/privacy-policy/">Privacy Policy</a> &middot; <a href="/terms-conditions/">Terms &amp; Conditions</a></span>
    <span style="flex:1 1 100%;color:var(--text-on-ink-soft)">RERA registration numbers for these developments are not yet published here — please ask us for the current registration status of any project before you book.</span>
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
  var hasSignature = scripts.indexOf('/js/signature.js') !== -1;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${hasSignature ? `<script>(function(){
  var d=document.documentElement,ok=false;
  try{var c=document.createElement('canvas');ok=!!(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl')));}catch(e){}
  if(ok&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){
    d.classList.add('sig-pending');
    setTimeout(function(){d.classList.remove('sig-pending');},4000);
  }
})();</script>` : ''}
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
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
<link rel="preload" href="/fonts/Fraunces-Roman-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/site.css">
${jsonLd.map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`).join('\n')}
${extraHead}
</head>
<body class="${bodyClass}">
${header(path)}
${opts.body}
${footer()}
${mobileActionBar()}
<script src="/js/site.js" defer></script>
${scripts.map((s) => `<script src="${s}" defer></script>`).join('\n')}
</body>
</html>`;
}

module.exports = { layout, esc };
