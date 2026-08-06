const site = require('../content/site');
const { esc } = require('./layout');

module.exports = function aboutPage() {
  var body = `
<section class="hero" style="min-height:64svh">
  <div class="hero-media"><img src="/images/optimized/Pi7_Image_chandeshwarapartmentnightview_page-00011.jpg" alt="Chandeshwar Apartment at dusk, Bhagalpur" fetchpriority="high"></div>
  <div class="hero-scrim"></div>
  <div class="hero-inner">
    <div class="content">
      <div class="hero-kicker">About Vikramshila</div>
      <h1 class="hero-title">${esc(site.philosophy)}</h1>
    </div>
  </div>
</section>

<section class="section section-paper">
  <div class="wrap">
    ${site.aboutCopy.map((p) => `<p class="lede reveal" style="max-width:60ch;margin-bottom:24px;font-size:1.1rem">${esc(p)}</p>`).join('\n')}
  </div>
</section>

<section class="section section-ink" style="position:relative;overflow:hidden">
  <div class="ghost-word reveal" style="bottom:4%;right:2%">Legend</div>
  <div class="wrap" style="position:relative;z-index:1">
    <div class="eyebrow" style="margin-bottom:24px">The Namesake</div>
    <p class="display-3 reveal" style="font-weight:400;max-width:60ch">${esc(site.namesake)}</p>
  </div>
</section>

<section class="section section-paper">
  <div class="wrap">
    <div class="eyebrow" style="margin-bottom:28px">In Numbers</div>
    <div class="vitrine reveal">
      ${site.stats.map((s) => `<div class="vitrine-cell"><span class="stat" data-countup="${s.value}" data-suffix="${esc(s.suffix)}">0</span><span class="label">${esc(s.label)}</span></div>`).join('')}
    </div>
    <p style="margin-top:20px;font-size:12.5px;color:var(--text-soft)">Figures as published by Vikramshila Developers.</p>
  </div>
</section>

<section class="section section-ink enquiry">
  <div class="wrap">
    <div class="eyebrow">Get In Touch</div>
    <h2 class="display-2" style="margin-top:18px">Visit the office, or call ahead.</h2>
    <p class="lede" style="margin-top:14px">${esc(site.address.full)}</p>
    <div class="contact-strip">
      <div class="row"><span class="copy-num on-ink" style="user-select:all">${site.phones.primary}</span><a class="btn btn-ghost" href="${site.phones.primaryHref}">Call</a><a class="btn btn-brass" href="${site.whatsapp.href}" target="_blank" rel="noopener">WhatsApp</a></div>
    </div>
  </div>
</section>`;
  return { body: body, scripts: [] };
};
