const site = require('../content/site');
const { esc, u } = require('./layout');

/* ------------------------------------------------------------------ *
 * A project page is a MONUMENT. The order is deliberate:
 *   arrive → orient → understand the home → see it → study it → act.
 * Every number on the page is the developer's own; nothing is invented,
 * and atmosphere imagery is always labelled as atmosphere.
 * ------------------------------------------------------------------ */

function heroSection(p) {
  var waText = "Hello, I'm interested in " + p.name + ', ' + p.location + '.';
  var waHref = site.whatsapp.href.replace(/text=[^&]*/, 'text=' + encodeURIComponent(waText));
  var phone = p.phone || site.phones.primary;
  var phoneHref = p.phone ? 'tel:' + p.phone.replace(/[^\d+]/g, '') : site.phones.primaryHref;
  // set letter by letter so the name can rise as a sequence, not a block
  var letters = p.name.split('').map(function (ch, i) {
    if (ch === ' ') return '<span class="sp">&nbsp;</span>';
    return '<span class="ch" style="--i:' + i + '">' + esc(ch) + '</span>';
  }).join('');

  return `
<section class="proj-hero" data-proj-hero>
  <div class="proj-hero-media">
    <img src="${u('/images/optimized/' + p.heroImage)}" alt="${esc(p.name)}, ${esc(p.location)} — exterior view" fetchpriority="high">
  </div>
  <div class="proj-hero-scrim"></div>
  <div class="proj-hero-inner">
    <div class="wrap">
      <div class="proj-hero-kicker">${esc(p.location)} &middot; ${esc(p.status)}</div>
      <h1 class="proj-hero-name" aria-label="${esc(p.name)}">${letters}</h1>
      <p class="proj-hero-sub">${esc(p.tagline)}</p>
      <div class="proj-hero-actions">
        <a class="btn btn-brass" href="${waHref}" target="_blank" rel="noopener">Enquire on WhatsApp</a>
        <a class="btn btn-ghost" href="${phoneHref}">Call ${esc(phone)}</a>
      </div>
    </div>
  </div>
  <div class="proj-hero-cue"><span>Scroll</span><i></i></div>
</section>`;
}

/* A slim bar that pins under the header: the things a buyer re-checks
   constantly, always in reach, plus a persistent enquire button. */
function vitalsBar(p) {
  var waText = "Hello, I'm interested in " + p.name + ', ' + p.location + '.';
  var waHref = site.whatsapp.href.replace(/text=[^&]*/, 'text=' + encodeURIComponent(waText));
  return `
<div class="vitals" data-vitals>
  <div class="wrap vitals-inner">
    <div class="vitals-set">
      <div class="vital"><span class="k">Location</span><span class="v">${esc(p.location)}</span></div>
      ${p.unitSummary ? `<div class="vital"><span class="k">Configuration</span><span class="v">${esc(p.unitSummary)}</span></div>` : ''}
      <div class="vital"><span class="k">Status</span><span class="v">${esc(p.status)}</span></div>
    </div>
    <a class="btn btn-brass vitals-cta" href="${waHref}" target="_blank" rel="noopener">Enquire</a>
  </div>
</div>`;
}

function statementSection(p) {
  if (!p.description) return '';
  return `
<section class="section section-paper proj-statement">
  <div class="wrap">
    <p class="proj-statement-line reveal">${esc(p.description)}</p>
  </div>
</section>`;
}

/* THE UNIT EXPLORER — the published area schedule, made explorable.
   Every unit becomes a selectable plate showing its type and area beside
   the project's plan. This is what a buyer actually came for, so it gets
   the weight instead of being a spreadsheet. */
function unitExplorer(p) {
  if (!p.areaTables || !p.areaTables.length) return '';

  var blocks = p.areaTables.map(function (t, ti) {
    return {
      caption: t.caption,
      ti: ti,
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

  // With a single block its caption is just the table's own title ("Area
  // Statement") and repeating it above the chips and again in the readout is
  // noise. Only name blocks when there is genuinely more than one to tell apart.
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
<section class="section section-ink unit-explorer" data-unit-explorer>
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">The Homes</div>
      <h2 class="display-2" style="margin-top:18px">Every unit, to the square foot.</h2>
      <p class="lede" style="margin-top:16px">${allUnits.length} configurations as published by the developer. Choose one to see its measure.</p>
    </div>
    <div class="ue-grid reveal">
      <div class="ue-left">${chips}</div>
      <div class="ue-right">
        <div class="ue-readout">${panels}</div>
        ${plan ? `<a class="ue-plan" href="${u('/images/optimized/' + plan.file)}" data-lightbox data-caption="${esc(p.name)} — ${esc(plan.caption)}">
          <img src="${u('/images/optimized/' + plan.file)}" alt="${esc(p.name)} — ${esc(plan.caption)}" loading="lazy">
          <span class="ue-plan-tag">${esc(plan.caption)} &middot; tap to enlarge</span>
        </a>` : ''}
      </div>
    </div>
  </div>
</section>`;
}

/* When a project publishes no unit schedule, say so plainly rather than
   leaving a hole — and give the buyer the action that gets them the answer. */
function noScheduleNote(p) {
  if (p.areaTables && p.areaTables.length) return '';
  return `
<section class="section section-ink">
  <div class="wrap" style="max-width:64ch">
    <div class="eyebrow">The Homes</div>
    <h2 class="display-2" style="margin-top:18px">${esc(p.unitSummary || 'Configurations')}</h2>
    <p class="lede" style="margin-top:16px">A unit-by-unit area schedule has not been published for ${esc(p.name)}. Ask us and we will send you the current one.</p>
    <div style="margin-top:28px"><a class="btn btn-brass" href="${site.whatsapp.href}" target="_blank" rel="noopener">Request the area schedule</a></div>
  </div>
</section>`;
}

function amenitiesSection(p) {
  if (!p.amenities || !p.amenities.length) return '';
  var items = p.amenities.map(function (a, i) {
    return `<li class="reveal" style="transition-delay:${Math.min(i * 40, 320)}ms"><span class="am-n">${String(i + 1).padStart(2, '0')}</span><span class="am-t">${esc(a)}</span></li>`;
  }).join('');
  var perks = (p.locationPerks || []).map(function (a, i) {
    return `<li class="reveal" style="transition-delay:${Math.min(i * 40, 320)}ms"><span class="am-n">&mdash;</span><span class="am-t">${esc(a)}</span></li>`;
  }).join('');
  return `
<section class="section section-paper amenities-sec">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Amenities</div>
      <h2 class="display-2" style="margin-top:18px">Built around the day.</h2>
    </div>
    <ul class="am-list">${items}</ul>
    ${perks ? `<div class="section-head reveal" style="margin-top:72px"><div class="eyebrow">The Address</div></div><ul class="am-list">${perks}</ul>` : ''}
  </div>
</section>`;
}

/* Atmosphere band — explicitly labelled. Never a photograph of the project,
   and the band says so itself, unprompted. */
function moodBand(p) {
  var plate = p.moodPlate || 'interior-warm';
  var line = p.moodLine || 'A home is finished long after the structure is. The rest is the part you live in.';
  return `
<section class="mood-band" aria-label="Atmosphere">
  <div class="mood-media parallax">
    <img src="${u('/images/mood/' + plate + '.jpg')}" alt="Interior atmosphere — illustrative, not a photograph of ${esc(p.name)}" loading="lazy">
  </div>
  <div class="mood-inner wrap">
    <p class="mood-line reveal">${esc(line)}</p>
    <p class="mood-disclaimer">Atmosphere only — not a photograph of ${esc(p.name)}.</p>
  </div>
</section>`;
}

function specSection(p) {
  if (!p.specifications || !p.specifications.length) return '';
  return `
<section class="section section-paper">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Specifications</div>
      <h2 class="display-2" style="margin-top:18px">What it is made of.</h2>
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
<section class="section section-ink gallery-sec">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">The Project</div>
      <h2 class="display-2" style="margin-top:18px">Seen from every side.</h2>
    </div>
  </div>
  <div class="gal-stack">
    ${imgs.map(function (f, i) {
      return `<figure class="gal-plate reveal">
        <a href="${u('/images/optimized/' + f)}" data-lightbox data-caption="${esc(p.name)}, ${esc(p.location)}">
          <img src="${u('/images/optimized/' + f)}" alt="${esc(p.name)}, ${esc(p.location)} — view ${i + 1}" loading="lazy">
        </a>
      </figure>`;
    }).join('')}
  </div>
</section>`;
}

function plansSection(p) {
  var plans = p.floorPlans || [];
  // the first plan already appears inside the unit explorer
  var rest = (p.areaTables && p.areaTables.length) ? plans.slice(1) : plans;
  if (!rest.length) return '';
  return `
<section class="section section-paper">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Floor Plans</div>
      <h2 class="display-2" style="margin-top:18px">Room by room.</h2>
    </div>
    <div class="plan-grid reveal">
      ${rest.map(function (fp) {
        return `<figure class="plan-item">
          <a href="${u('/images/optimized/' + fp.file)}" data-lightbox data-caption="${esc(p.name)} — ${esc(fp.caption)}">
            <img src="${u('/images/optimized/' + fp.file)}" alt="${esc(p.name)} — ${esc(fp.caption)}" loading="lazy">
          </a>
          <figcaption>${esc(fp.caption)}</figcaption>
        </figure>`;
      }).join('')}
    </div>
  </div>
</section>`;
}

function roomsSection(p) {
  if (!p.rooms) return '';
  return `
<section class="section section-paper">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Rooms &amp; Tariffs</div>
      <h2 class="display-2" style="margin-top:18px">Where you stay.</h2>
    </div>
    <div class="table-scroll reveal">
      <table class="area-table">
        <thead><tr><th>Room Type</th><th>Single Bed</th><th>Double Bed</th><th>Extra Bed</th></tr></thead>
        <tbody>${p.rooms.map(function (r) {
          return `<tr><td>${esc(r.type)}</td><td>${esc(r.single)}</td><td>${esc(r.double)}</td><td>${esc(r.extra)}</td></tr>`;
        }).join('')}</tbody>
      </table>
    </div>
    <p style="margin-top:16px;font-size:13px;color:var(--text-soft)">${esc(p.roomsNote || '')}</p>
  </div>
</section>
<section class="section section-ink amenities-sec">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">Facilities</div></div>
    <ul class="am-list">${(p.facilities || []).map(function (f, i) {
      return `<li class="reveal"><span class="am-n">${String(i + 1).padStart(2, '0')}</span><span class="am-t">${esc(f)}</span></li>`;
    }).join('')}</ul>
  </div>
</section>`;
}

function testimonialsSection(p) {
  if (!p.testimonials || !p.testimonials.length) return '';
  return `
<section class="section section-paper">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">In Their Words</div></div>
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
  var waText = "Hello, I'm interested in " + p.name + ', ' + p.location + '.';
  var waHref = site.whatsapp.href.replace(/text=[^&]*/, 'text=' + encodeURIComponent(waText));
  var mapQ = encodeURIComponent(p.address + ', India');

  return `
<section class="section proj-close">
  <div class="proj-close-bg"><img src="${u('/images/mood/stone-marble.jpg')}" alt="" aria-hidden="true" loading="lazy"></div>
  <div class="wrap proj-close-inner">
    <div class="reveal">
      <div class="eyebrow">Enquire</div>
      <h2 class="display-1" style="margin-top:14px;font-size:clamp(2.3rem,5.2vw,4.2rem)">See ${esc(p.name)} in person.</h2>
      <p class="lede" style="margin-top:20px">${esc(p.address)}</p>

      <div class="close-actions">
        <a class="btn btn-brass" href="${waHref}" target="_blank" rel="noopener">Enquire on WhatsApp</a>
        <a class="btn btn-ghost" href="${phoneHref}">Call ${esc(phone)}</a>
        <a class="btn btn-ghost" href="https://maps.google.com/?q=${mapQ}" target="_blank" rel="noopener">Get directions</a>
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
  var body = heroSection(p) + vitalsBar(p) + statementSection(p);
  if (p.kind === 'hospitality') {
    body += roomsSection(p) + gallerySection(p) + testimonialsSection(p);
  } else {
    body += unitExplorer(p) + noScheduleNote(p) + gallerySection(p) + moodBand(p) +
            amenitiesSection(p) + specSection(p) + plansSection(p);
  }
  body += closeSection(p);
  return { body: body, scripts: ['/js/project.js'] };
};
