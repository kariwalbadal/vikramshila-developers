const site = require('../content/site');
const { esc } = require('./layout');

function heroSection(p) {
  return `
<section class="hero" style="min-height:82svh">
  <div class="hero-media"><img src="/images/optimized/${p.heroImage}" alt="${esc(p.name)}, ${esc(p.location)} — hero view" fetchpriority="high"></div>
  <div class="hero-scrim"></div>
  <div class="hero-inner">
    <div class="content">
      <div class="hero-kicker">${esc(p.location)} &middot; ${esc(p.status)}</div>
      <h1 class="hero-title" style="font-size:clamp(2.6rem,8vw,6rem)">
        <span class="line"><span>${esc(p.name)}</span></span>
      </h1>
      <p class="hero-sub on-ink">${esc(p.tagline)}</p>
      <div class="hero-actions">
        <a class="btn btn-brass" href="${site.whatsapp.href.replace(/text=[^&]*/, 'text=' + encodeURIComponent(`Hello, I'm interested in ${p.name}, ${p.location}.`))}" target="_blank" rel="noopener">Enquire on WhatsApp</a>
        <a class="btn btn-ghost" href="${p.phone ? 'tel:' + p.phone.replace(/[^\d+]/g, '') : site.phones.primaryHref}">Call ${p.phone || site.phones.primary}</a>
      </div>
    </div>
  </div>
</section>`;
}

function introSection(p) {
  return `
<section class="section section-paper">
  <div class="wrap">
    ${p.description ? `<p class="display-3 reveal" style="font-weight:400;color:var(--text);max-width:60ch">${esc(p.description)}</p>` : ''}
    <div class="trust-line reveal" style="margin-top:${p.description ? '40px' : '0'}">
      <span><strong>Location</strong> &nbsp;${esc(p.location)}</span>
      ${p.unitSummary ? `<span><strong>Configuration</strong> &nbsp;${esc(p.unitSummary)}</span>` : ''}
      <span><strong>Status</strong> &nbsp;${esc(p.status)}</span>
    </div>
  </div>
</section>`;
}

function areaTables(p) {
  if (!p.areaTables || !p.areaTables.length) return '';
  var tables = p.areaTables.map((t) => `
      <div class="table-scroll reveal">
      <table class="area-table">
        <caption>${esc(t.caption)}</caption>
        <thead><tr><th>Unit</th><th>Type</th><th>Area</th></tr></thead>
        <tbody>${t.rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody>
      </table>
      </div>`).join('\n');
  return `
<section class="section section-paper">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">Area Statement</div></div>
    <div class="spec-groups" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">${tables}</div>
  </div>
</section>`;
}

function amenitiesSection(p) {
  if (!p.amenities || !p.amenities.length) return '';
  return `
<section class="section section-ink">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">Amenities</div><h2 class="display-2" style="margin-top:18px">Built around the day.</h2></div>
    <ul class="amenity-list reveal">${p.amenities.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
    ${p.locationPerks ? `<div class="section-head reveal" style="margin-top:56px;margin-bottom:24px"><div class="eyebrow">Location</div></div><ul class="amenity-list reveal">${p.locationPerks.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
  </div>
</section>`;
}

function specSection(p) {
  if (!p.specifications || !p.specifications.length) return '';
  return `
<section class="section section-paper">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">Specifications</div></div>
    <div class="spec-groups reveal" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
      ${p.specifications.map((s) => `<div class="spec-group"><h4>${esc(s.group)}</h4><p>${esc(s.text)}</p></div>`).join('')}
    </div>
  </div>
</section>`;
}

function gallerySection(p) {
  var imgs = (p.gallery || []).map((f) => `<a href="/images/optimized/${f}" target="_blank" rel="noopener"><img src="/images/optimized/${f}" alt="${esc(p.name)} — photograph" loading="lazy"></a>`).join('');
  var plans = (p.floorPlans || []).map((fp) => `<figure><a href="/images/optimized/${fp.file}" target="_blank" rel="noopener"><img src="/images/optimized/${fp.file}" alt="${esc(p.name)} — ${esc(fp.caption)}" loading="lazy"></a><figcaption>${esc(fp.caption)}</figcaption></figure>`).join('');
  var out = '';
  if (imgs) out += `
<section class="section section-ink">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">Gallery</div></div>
    <div class="gallery reveal">${imgs}</div>
  </div>
</section>`;
  if (plans) out += `
<section class="section section-paper">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">Floor Plans</div></div>
    <div class="gallery gallery--plans reveal">${plans}</div>
  </div>
</section>`;
  return out;
}

function roomsSection(p) {
  if (!p.rooms) return '';
  return `
<section class="section section-paper">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">Rooms &amp; Tariffs</div></div>
    <div class="table-scroll reveal">
    <table class="area-table">
      <thead><tr><th>Room Type</th><th>Single Bed</th><th>Double Bed</th><th>Extra Bed</th></tr></thead>
      <tbody>${p.rooms.map((r) => `<tr><td>${esc(r.type)}</td><td>${esc(r.single)}</td><td>${esc(r.double)}</td><td>${esc(r.extra)}</td></tr>`).join('')}</tbody>
    </table>
    </div>
    <p style="margin-top:16px;font-size:13px;color:var(--text-soft)">${esc(p.roomsNote || '')}</p>
  </div>
</section>
<section class="section section-ink">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">Facilities</div></div>
    <ul class="amenity-list reveal">${(p.facilities || []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
  </div>
</section>`;
}

function testimonialsSection(p) {
  if (!p.testimonials || !p.testimonials.length) return '';
  return `
<section class="section section-paper">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">In Their Words</div></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:32px">
      ${p.testimonials.map((t) => `
      <blockquote class="reveal" style="border-top:1px solid var(--border-hairline);padding-top:24px">
        <p style="font-family:var(--font-display);font-style:italic;font-size:1.2rem;line-height:1.5">“${esc(t.quote)}”</p>
        <cite style="display:block;margin-top:16px;font-style:normal;font-size:12.5px;letter-spacing:0.04em;color:var(--text-soft)">— ${esc(t.name)}, ${esc(t.role)}</cite>
      </blockquote>`).join('')}
    </div>
  </div>
</section>`;
}

function contactSection(p) {
  var phone = p.phone || site.phones.primary;
  var phoneHref = p.phone ? 'tel:' + p.phone.replace(/[^\d+]/g, '') : site.phones.primaryHref;
  var email = p.email || site.email;
  var map = p.mapEmbed ? `
    <div class="map-frame reveal" style="margin-top:40px"><iframe src="${p.mapEmbed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${esc(p.name)} location map"></iframe></div>` : '';
  return `
<section class="section section-ink enquiry">
  <div class="wrap enquiry-grid" style="grid-template-columns:1fr">
    <div class="reveal">
      <div class="eyebrow">Enquire About ${esc(p.name)}</div>
      <h2 class="display-2" style="margin-top:18px">Speak to the project team.</h2>
      <p class="lede" style="margin-top:14px">${esc(p.address)}</p>
      <div class="contact-strip">
        <div class="row"><span class="copy-num on-ink" style="user-select:all">${esc(phone)}</span><a class="btn btn-ghost" href="${phoneHref}">Call</a><a class="btn btn-brass" href="${site.whatsapp.href}" target="_blank" rel="noopener">WhatsApp</a></div>
        <div class="row"><a class="btn btn-outline" style="border-color:var(--border-hairline-on-ink);color:var(--text-on-ink)" href="mailto:${email}?subject=Enquiry — ${encodeURIComponent(p.name)}">${esc(email)}</a></div>
        ${(p.extraContacts || []).map((c) => `<div class="row" style="font-size:14px;color:var(--text-on-ink-soft)">${esc(c.name)}: <span style="user-select:all;color:var(--cream)">${esc(c.phone)}</span></div>`).join('')}
      </div>
      ${map}
    </div>
  </div>
</section>`;
}

module.exports = function projectPage(p) {
  var body = heroSection(p) + introSection(p);
  if (p.kind === 'hospitality') {
    body += roomsSection(p) + testimonialsSection(p) + gallerySection(p);
  } else {
    body += areaTables(p) + amenitiesSection(p) + specSection(p) + gallerySection(p);
  }
  body += contactSection(p);
  return { body: body, scripts: [] };
};
