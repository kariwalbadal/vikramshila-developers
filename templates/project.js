const fs = require('fs');
const path = require('path');
const site = require('../content/site');
const { esc, u } = require('./layout');

// prefer the Real-ESRGAN 4K master when one exists
function plate(file) {
  var base = file.replace(/\.[^.]+$/, '');
  var up = 'images/upscaled/' + base + '-4k.jpg';
  if (fs.existsSync(path.resolve(__dirname, '..', up))) return u('/' + up);
  return u('/images/optimized/' + file);
}

/* ------------------------------------------------------------------ *
 * A project page is a FEATURE ARTICLE: title block, plate, the facts
 * that pin, the body in columns, figures with captions. Every number
 * is the developer's own; nothing is invented, and atmosphere imagery
 * is always labelled as atmosphere.
 * ------------------------------------------------------------------ */

function waLink(p) {
  var waText = "Hello, I'm interested in " + p.name + ', ' + p.location + '.';
  return site.whatsapp.href.replace(/text=[^&]*/, 'text=' + encodeURIComponent(waText));
}

function artHead(p) {
  var phone = p.phone || site.phones.primary;
  var phoneHref = p.phone ? 'tel:' + p.phone.replace(/[^\d+]/g, '') : site.phones.primaryHref;
  return `
<section class="art-head">
  <div class="wrap">
    <div class="art-kicker">
      <span class="k">${esc(p.location)} &middot; ${esc(p.status)}</span>
      ${p.unitSummary ? `<span class="r">${esc(p.unitSummary)}</span>` : ''}
    </div>
    <h1 class="art-title"><span class="line"><span>${esc(p.name)}</span></span></h1>
    <p class="art-standfirst">${esc(p.tagline)}</p>
    <div class="art-actions">
      <a class="btn btn-brass" href="${waLink(p)}" target="_blank" rel="noopener">Enquire on WhatsApp</a>
      <a class="btn btn-outline" href="${phoneHref}">Call ${esc(phone)}</a>
    </div>
  </div>
</section>`;
}

function artPlate(p) {
  return `
<figure style="margin:0" data-proj-hero data-parallax>
  <div class="art-plate">
    <img src="${plate(p.heroImage)}" alt="${esc(p.name)}, ${esc(p.location)} — exterior view" fetchpriority="high">
  </div>
  <figcaption class="wrap"><span class="plate-cap">
    <span><span class="num">Fig. 01</span> &mdash; ${esc(p.name)}, ${esc(p.location)}</span>
    <span>Developer&rsquo;s render</span>
  </span></figcaption>
</figure>`;
}

/* A slim ruled bar that pins under the compact header: the things a buyer
   re-checks constantly, always in reach, plus a persistent enquire button. */
function vitalsBar(p) {
  return `
<div class="vitals" data-vitals>
  <div class="wrap vitals-inner">
    <div class="vitals-set">
      <div class="vital"><span class="k">Location</span><span class="v">${esc(p.location)}</span></div>
      ${p.unitSummary ? `<div class="vital"><span class="k">Configuration</span><span class="v">${esc(p.unitSummary)}</span></div>` : ''}
      <div class="vital"><span class="k">Status</span><span class="v">${esc(p.status)}</span></div>
    </div>
    <a class="btn btn-brass vitals-cta" href="${waLink(p)}" target="_blank" rel="noopener">Enquire</a>
  </div>
</div>`;
}

function statementSection(p) {
  if (!p.description) return '';
  return `
<section class="section-tight">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">The Ground</span>
      <span class="sec-note">${esc(p.location)}</span>
    </div>
    <div class="art-cols reveal"><p>${esc(p.description)}</p></div>
  </div>
</section>`;
}

/* THE UNIT EXPLORER — the published area schedule, made explorable. */
function unitExplorer(p) {
  if (!p.areaTables || !p.areaTables.length) return '';

  var blocks = p.areaTables.map(function (t, ti) {
    return {
      caption: t.caption,
      units: t.rows.map(function (r, ri) {
        return { id: r[0], type: r[1], area: r[2], key: ti + '-' + ri };
      }),
    };
  });

  var allUnits = [];
  blocks.forEach(function (b) {
    b.units.forEach(function (unit) { allUnits.push(Object.assign({ block: b.caption }, unit)); });
  });

  var plan = (p.floorPlans && p.floorPlans[0]) ? p.floorPlans[0] : null;
  var named = blocks.length > 1;

  var chips = blocks.map(function (b) {
    return `
      <div class="ue-block">
        ${named ? `<div class="ue-block-name">${esc(b.caption)}</div>` : ''}
        <div class="ue-chips">
          ${b.units.map(function (unit) {
            return `<button type="button" class="ue-chip" data-ue-key="${esc(unit.key)}" aria-label="Unit ${esc(unit.id)}, ${esc(unit.type)}, ${esc(unit.area)}">
              <span class="ue-chip-id">${esc(unit.id)}</span>
              <span class="ue-chip-type">${esc(unit.type)}</span>
            </button>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');

  var panels = allUnits.map(function (unit, i) {
    return `
    <div class="ue-panel${i === 0 ? ' is-active' : ''}" data-ue-panel="${esc(unit.key)}">
      <div class="ue-panel-id">${esc(unit.id)}</div>
      <div class="ue-panel-type">${esc(unit.type)}</div>
      <div class="ue-panel-area">${esc(unit.area)}</div>
      ${named ? `<div class="ue-panel-block">${esc(unit.block)}</div>` : ''}
    </div>`;
  }).join('');

  return `
<section class="section section-shade unit-explorer" data-unit-explorer>
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">The Homes</span>
      <span class="sec-note">${allUnits.length} configurations, as published &mdash; to the square foot</span>
    </div>
    <div class="ue-grid reveal">
      <div class="ue-left">${chips}</div>
      <div class="ue-right">
        <div class="ue-readout">${panels}</div>
        ${plan ? `<a class="ue-plan" href="${u('/images/optimized/' + plan.file)}" data-lightbox data-caption="${esc(p.name)} — ${esc(plan.caption)}">
          <img src="${u('/images/optimized/' + plan.file)}" alt="${esc(p.name)} — ${esc(plan.caption)}" loading="lazy">
          <span class="ue-plan-tag">${esc(plan.caption)} &mdash; all units shown &middot; tap to enlarge</span>
        </a>` : ''}
      </div>
    </div>
  </div>
</section>`;
}

function noScheduleNote(p) {
  if (p.areaTables && p.areaTables.length) return '';
  return `
<section class="section-tight section-shade">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">The Homes</span>
    </div>
    ${p.unitSummary ? `<p class="lede reveal">${esc(p.unitSummary)}</p>` : ''}
    <p class="lede reveal" style="margin-top:12px">A unit-by-unit area schedule has not been published for ${esc(p.name)}. Ask us and we will send you the current one.</p>
    <div style="margin-top:22px" class="reveal"><a class="btn btn-brass" href="${site.whatsapp.href}" target="_blank" rel="noopener">Request the area schedule</a></div>
  </div>
</section>`;
}

function amenitiesSection(p) {
  if (!p.amenities || !p.amenities.length) return '';
  var items = p.amenities.map(function (a, i) {
    return `<li class="reveal" style="transition-delay:${Math.min(i * 30, 240)}ms"><span class="am-n">${String(i + 1).padStart(2, '0')}</span><span class="am-t">${esc(a)}</span></li>`;
  }).join('');
  var perks = (p.locationPerks || []).map(function (a, i) {
    return `<li class="reveal" style="transition-delay:${Math.min(i * 30, 240)}ms"><span class="am-n">&mdash;</span><span class="am-t">${esc(a)}</span></li>`;
  }).join('');
  return `
<section class="section-tight">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">Amenities</span>
      <span class="sec-note">${p.amenities.length} items, as specified</span>
    </div>
    <ul class="am-list">${items}</ul>
    ${perks ? `<div class="sec-row reveal" style="margin-top:44px"><span class="eyebrow">The Address</span><span class="sec-note">What the location itself provides</span></div><ul class="am-list">${perks}</ul>` : ''}
  </div>
</section>`;
}

/* Atmosphere — explicitly labelled. Never a photograph of the project,
   and the caption line says so itself, unprompted. */
/* The moodLine stays as a purely typographic moment. The generated
   "atmosphere" plates are gone — a generated image is not the atmosphere of
   a real project, and pretending otherwise reads exactly as fake. */
function moodBand(p) {
  var line = p.moodLine || 'A home is finished long after the structure is. The rest is the part you live in.';
  return `
<section class="section-tight">
  <div class="wrap">
    <div class="pull-quote reveal">
      <p>${esc(line)}</p>
      <div class="src">Vikramshila Developers</div>
    </div>
  </div>
</section>`;
}

function specSection(p) {
  if (!p.specifications || !p.specifications.length) return '';
  return `
<section class="section-tight">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">Specifications</span>
      <span class="sec-note">What it is made of</span>
    </div>
    <div class="spec-vitrine reveal">
      ${p.specifications.map(function (s) {
        return `<div class="spec-cell"><h4>${esc(s.group)}</h4><p>${esc(s.text)}</p></div>`;
      }).join('')}
    </div>
  </div>
</section>`;
}

function gallerySection(p) {
  var imgs = (p.gallery || []);
  if (!imgs.length) return '';
  return `
<section class="section-tight">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">The Project</span>
      <span class="sec-note">${imgs.length} plate${imgs.length > 1 ? 's' : ''}</span>
    </div>
    <div class="gal-stack">
      ${imgs.map(function (f, i) {
        var fig = 'Fig. ' + String(i + 2).padStart(2, '0');
        return `<figure class="gal-plate reveal" data-parallax>
          <a href="${plate(f)}" data-lightbox data-caption="${esc(p.name)}, ${esc(p.location)}">
            <img src="${plate(f)}" alt="${esc(p.name)}, ${esc(p.location)} — view ${i + 1}" loading="lazy">
          </a>
          <figcaption class="plate-cap"><span><span class="num">${fig}</span> &mdash; ${esc(p.name)}, ${esc(p.location)}</span><span>Tap to enlarge</span></figcaption>
        </figure>`;
      }).join('')}
    </div>
  </div>
</section>`;
}

function plansSection(p) {
  var plans = p.floorPlans || [];
  // the first plan already appears inside the unit explorer
  var rest = (p.areaTables && p.areaTables.length) ? plans.slice(1) : plans;
  if (!rest.length) return '';
  return `
<section class="section-tight">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">Floor Plans</span>
      <span class="sec-note">Room by room</span>
    </div>
    <div class="plan-grid reveal">
      ${rest.map(function (fp, i) {
        return `<figure class="plan-item">
          <a href="${u('/images/optimized/' + fp.file)}" data-lightbox data-caption="${esc(p.name)} — ${esc(fp.caption)}">
            <img src="${u('/images/optimized/' + fp.file)}" alt="${esc(p.name)} — ${esc(fp.caption)}" loading="lazy">
          </a>
          <figcaption><span style="color:var(--accent-text)">Plan ${String(i + 1).padStart(2, '0')}</span> &mdash; ${esc(fp.caption)}</figcaption>
        </figure>`;
      }).join('')}
    </div>
  </div>
</section>`;
}

function roomsSection(p) {
  if (!p.rooms) return '';
  return `
<section class="section-tight">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">Rooms &amp; Tariffs</span>
      <span class="sec-note">As published by the hotel</span>
    </div>
    <div class="table-scroll reveal">
      <table class="area-table">
        <thead><tr><th>Room Type</th><th>Single Bed</th><th>Double Bed</th><th>Extra Bed</th></tr></thead>
        <tbody>${p.rooms.map(function (r) {
          return `<tr><td>${esc(r.type)}</td><td>${esc(r.single)}</td><td>${esc(r.double)}</td><td>${esc(r.extra)}</td></tr>`;
        }).join('')}</tbody>
      </table>
    </div>
    <p style="margin-top:14px;font-size:12.5px;color:var(--text-soft)">${esc(p.roomsNote || '')}</p>
  </div>
</section>
<section class="section-tight">
  <div class="wrap">
    <div class="sec-row reveal"><span class="eyebrow">Facilities</span><span class="sec-note">Everything on site</span></div>
    <ul class="am-list">${(p.facilities || []).map(function (f, i) {
      return `<li class="reveal"><span class="am-n">${String(i + 1).padStart(2, '0')}</span><span class="am-t">${esc(f)}</span></li>`;
    }).join('')}</ul>
  </div>
</section>`;
}

function testimonialsSection(p) {
  if (!p.testimonials || !p.testimonials.length) return '';
  return `
<section class="section-tight">
  <div class="wrap">
    <div class="sec-row reveal"><span class="eyebrow">In Their Words</span><span class="sec-note">Guest reviews</span></div>
    <div class="quote-grid">
      ${p.testimonials.map(function (t) {
        return `<blockquote class="quote-card reveal">
          <p>&ldquo;${esc(t.quote)}&rdquo;</p>
          <cite>${esc(t.name)}, ${esc(t.role)}</cite>
        </blockquote>`;
      }).join('')}
    </div>
  </div>
</section>`;
}

function closeSection(p) {
  var phone = p.phone || site.phones.primary;
  var phoneHref = p.phone ? 'tel:' + p.phone.replace(/[^\d+]/g, '') : site.phones.primaryHref;
  var email = p.email || site.email;
  var mapQ = encodeURIComponent(p.address + ', India');

  return `
<section class="section proj-close">
  <div class="wrap">
    <div class="reveal">
      <span class="eyebrow">Enquire</span>
      <h2 style="margin-top:14px">See ${esc(p.name)} in person.</h2>
      <p class="lede" style="margin-top:14px">${esc(p.address)}</p>

      <div class="close-actions">
        <a class="btn btn-brass" href="${waLink(p)}" target="_blank" rel="noopener">Enquire on WhatsApp</a>
        <a class="btn btn-outline" href="${phoneHref}">Call ${esc(phone)}</a>
        <a class="btn btn-outline" href="https://maps.google.com/?q=${mapQ}" target="_blank" rel="noopener">Get directions</a>
      </div>

      <div class="close-meta">
        <div class="cm"><span class="k">Speak to</span><span class="v" style="user-select:all">${esc(phone)}</span></div>
        <div class="cm"><span class="k">Write to</span><span class="v"><a href="mailto:${esc(email)}?subject=${encodeURIComponent('Enquiry — ' + p.name)}">${esc(email)}</a></span></div>
        ${(p.extraContacts || []).map(function (c) {
          return `<div class="cm"><span class="k">${esc(c.name)}</span><span class="v" style="user-select:all">${esc(c.phone)}</span></div>`;
        }).join('')}
      </div>

      <p class="close-rera">RERA registration for ${esc(p.name)} is not published on this site. Please ask us for its current registration status before you book.</p>
    </div>
  </div>
</section>`;
}

module.exports = function projectPage(p) {
  var body = artHead(p) + artPlate(p) + vitalsBar(p) + statementSection(p);
  if (p.kind === 'hospitality') {
    body += roomsSection(p) + gallerySection(p) + testimonialsSection(p);
  } else {
    body += unitExplorer(p) + noScheduleNote(p) + gallerySection(p) + moodBand(p) +
            amenitiesSection(p) + specSection(p) + plansSection(p);
  }
  body += closeSection(p);
  return { body: body, scripts: ['/js/project.js'] };
};
