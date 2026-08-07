const site = require('../content/site');
const { esc, u } = require('./layout');

module.exports = function aboutPage() {
  var body = `
<section class="page-head">
  <div class="wrap">
    <div class="art-kicker">
      <span class="k">About Vikramshila</span>
      <span class="r">Est. over a decade ago &middot; Bhagalpur</span>
    </div>
    <h1>${esc(site.philosophy)}.</h1>
  </div>
</section>

<figure style="margin:0">
  <div class="art-plate is-loaded">
    <img src="${u('/images/optimized/Pi7_Image_chandeshwarapartmentnightview_page-00011.jpg')}" alt="Chandeshwar Apartment at dusk, Bhagalpur" fetchpriority="high">
  </div>
  <figcaption class="wrap"><span class="plate-cap"><span><span class="num">Fig. 01</span> &mdash; Chandeshwar Apartment, Bhagalpur, at dusk</span><span>Developer&rsquo;s render</span></span></figcaption>
</figure>

<section class="section">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">The Company</span>
      <span class="sec-note">Residential &middot; Commercial &middot; Retail</span>
    </div>
    <div class="letter reveal">
      ${site.aboutCopy.map((p, i) => `<p${i === 0 ? ' class="dropcap"' : ''}>${esc(p)}</p>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="band-relief">
  <div class="bg" aria-hidden="true">
    <img src="${u('/images/generated/relief-torchlight.jpg')}" alt="">
    <video muted loop playsinline preload="none" poster="${u('/images/generated/relief-torchlight.jpg')}" data-ambient-src="${u('/videos/relief-torchlight.mp4')}"></video>
  </div>
  <div class="wrap">
    <div class="pull-quote reveal" style="border-top:0;padding-top:0">
      <p>${esc(site.namesakeShort)}</p>
      <div class="src">The Namesake</div>
    </div>
    <div class="letter reveal">
      <p class="muted" style="color:rgba(255,255,255,0.85)">${esc(site.namesake)}</p>
      <div class="band-note">Carved stone by torchlight &mdash; an evocation, not an artefact</div>
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <div class="sec-row reveal" style="margin-bottom:0;border-top:0;padding-top:0">
      <span class="eyebrow">In Numbers</span>
    </div>
    <div class="numrow reveal" style="margin-top:14px">
      ${site.stats.map((s) => `<div><span class="stat" data-countup="${s.value}" data-suffix="${esc(s.suffix)}">0</span><span class="label">${esc(s.label)}</span></div>`).join('')}
    </div>
    <p style="margin-top:12px;font-size:11px;color:var(--text-soft)">Figures as published by Vikramshila Developers.</p>
  </div>
</section>

<section class="section section-shade">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">Visit</span>
      <span class="sec-note">Or call ahead</span>
    </div>
    <div class="contact-table reveal" style="max-width:640px">
      <div><span class="k">Office</span><span class="v" style="max-width:36ch">${esc(site.address.full)}</span></div>
      <div><span class="k">Phone</span><span class="v"><a href="${site.phones.primaryHref}">${site.phones.primary}</a></span></div>
      <div><span class="k">WhatsApp</span><span class="v"><a href="${site.whatsapp.href}" target="_blank" rel="noopener">${site.whatsapp.label}</a></span></div>
    </div>
  </div>
</section>`;
  return { body: body, scripts: [] };
};
