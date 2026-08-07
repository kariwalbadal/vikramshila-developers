const fs = require('fs');
const path = require('path');
const site = require('../content/site');
const { RESIDENTIAL, HOSPITALITY, STUBS } = require('../content/projects');
const { esc, u } = require('./layout');

/* The home page is one continuous film on a white stage.
   Full-viewport chapters stack and slide over one another as the visitor
   scrolls (Lenis inertia + scrubbed parallax, see js/site.js); each chapter
   is a single huge photograph and a few words. The chrome floats. */

// prefer the Real-ESRGAN 4K master when one exists
function plate(file) {
  var base = file.replace(/\.[^.]+$/, '');
  var up = 'images/upscaled/' + base + '-4k.jpg';
  if (fs.existsSync(path.resolve(__dirname, '..', up))) return u('/' + up);
  return u('/images/optimized/' + file);
}

function cover() {
  var guard = `<script>(function(){
  try{var c=document.createElement('canvas');
  if(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl'))&&!(matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){
    document.documentElement.classList.add('h3-pending');
    setTimeout(function(){document.documentElement.classList.remove('h3-pending');},5000);
  }}catch(e){}
})();</script>`;
  return `${guard}
<section class="chapter chapter-hero cover" data-hero data-hero3d>
  <div class="cover-media">
    <img src="${plate('hero-monument-clean.jpg')}" alt="Shivalaya residence at dusk, warm-lit windows behind a palm-lined Deoghar street" fetchpriority="high">
    <canvas id="hero3d-canvas" aria-hidden="true"></canvas>
    <div class="cover-scrim"></div>
    <div class="cover-inner">
      <div>
        <div class="cover-kicker">Bihar &amp; Jharkhand &middot; Est. over a decade ago</div>
        <h1 class="cover-title">
          <span class="line"><span>Creation,</span></span>
          <span class="line"><span>not construction.</span></span>
        </h1>
        <p class="cover-standfirst">Homes a family will hand down for generations.</p>
        <div class="cover-actions">
          <a class="btn btn-brass" href="${u('/our-projects/')}">The Projects</a>
          <a class="btn btn-ghost" href="${site.whatsapp.href}" target="_blank" rel="noopener">WhatsApp Us</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function showcasePicks() {
  var order = ['keshavam-apartment', 'sunrise', 'tejprabharesidency', 'chandeshwar-apartment', 'jagdish-enclave', 'annapurna-heights'];
  var all = RESIDENTIAL.concat(HOSPITALITY);
  return order.map((slug) => all.find((p) => p.slug === slug)).filter(Boolean);
}

/* THE RIVER — properties drift left to right; vertical scroll carries the
   stream, the centered card holds focus, the rest soften into depth. */
function riverShowcase() {
  var items = showcasePicks().map((p, i) => `
      <div class="river-card" data-river-item>
        <a class="plate" href="${u('/' + p.slug + '/')}">
          <img src="${plate(p.heroImage)}" alt="${esc(p.name)}, ${esc(p.location)} — exterior view" loading="lazy">
          <span class="rc-scrim"></span>
          <span class="rc-copy">
            <span class="rc-meta">${String(i + 1).padStart(2, '0')} &middot; ${esc(p.location)} &middot; ${esc(p.status)}</span>
            <span class="rc-name">${esc(p.name)}</span>
            <span class="rc-go">View the ground <span class="arrow">&rarr;</span></span>
          </span>
        </a>
      </div>`).join('');
  return `
<section class="river ember-host" data-river>
  <div class="ember-bg" aria-hidden="true">
    <img src="${u('/images/generated/ember-field.jpg')}" alt="">
    <video muted loop playsinline preload="none" poster="${u('/images/generated/ember-field.jpg')}" data-ambient-src="${u('/videos/ember-field.mp4')}"></video>
  </div>
  <div class="river-head">
    <span class="eyebrow">The Grounds</span>
    <span class="sec-note">Six developments &middot; a stream of its own &middot; drag to travel, rest to hold</span>
  </div>
  <div class="river-track" data-river-track>${items}</div>
</section>`;
}

/* THE ZOOMER — scroll carries you INTO each building; passing inside
   arrives at the next ground. */
/* THE ZOOMER — scroll WALKS you toward each building on its own generated
   dolly footage (scrubbed frame-by-frame), then passes through to the next. */
function zoomShowcase() {
  var picks = showcasePicks();
  var scenes = picks.map(function (p, i) {
    var walk = 'videos/walk/' + p.slug + '.mp4';
    var hasWalk = fs.existsSync(path.resolve(__dirname, '..', walk));
    return `
    <div class="zoom-scene" data-zoom-scene style="z-index:${picks.length - i}">
      <div class="zs-media">
        <img src="${plate(p.heroImage)}" alt="${esc(p.name)}, ${esc(p.location)} — exterior view" ${i > 1 ? 'loading="lazy"' : ''}>
        ${hasWalk ? `<video class="zs-video" muted playsinline preload="${i === 0 ? 'auto' : 'metadata'}" src="${u('/' + walk)}" data-walk aria-hidden="true"></video>` : ''}
      </div>
      <div class="zs-scrim"></div>
      <div class="zs-copy">
        <div class="zs-meta">${String(i + 1).padStart(2, '0')} / ${picks.length} &middot; ${esc(p.location)} &middot; ${esc(p.status)}</div>
        <h2 class="zs-name"><a href="${u('/' + p.slug + '/')}">${esc(p.name)}</a></h2>
        <a class="zs-go" href="${u('/' + p.slug + '/')}">View the ground <span class="arrow">&rarr;</span></a>
      </div>
    </div>`;
  }).join('');
  return `
<section class="zoomer" data-zoomer>
  <div class="zoomer-stage" data-zoomer-stage>
    ${scenes}
    <div class="zoom-progress" data-zoom-progress>01 / ${String(picks.length).padStart(2, '0')}</div>
  </div>
</section>`;
}

function numbersChapter() {
  return `
<section class="chapter chapter-paper" data-chapter-static>
  <div class="wrap numbers-stage">
    <div class="numbers-line reveal">
      ${site.stats.map((s) => `
      <div class="bignum">
        <span class="stat" data-countup="${s.value}" data-suffix="${esc(s.suffix)}">0</span>
        <span class="label">${esc(s.label)}</span>
      </div>`).join('')}
    </div>
    <p class="numbers-note reveal">Figures as published by Vikramshila Developers. ${esc(site.namesakeShort)}</p>
  </div>
</section>`;
}

function ledger() {
  var all = RESIDENTIAL.concat(HOSPITALITY);
  var rows = all.map((p, i) => `
    <a class="index-row" href="${u('/' + p.slug + '/')}" data-preview="${plate(p.heroImage)}">
      <span class="index-no">${String(i + 1).padStart(2, '0')}</span>
      <span class="index-name">${esc(p.name)}</span>
      <span class="index-meta m1">${esc(p.location)}</span>
      <span class="index-meta m2">${esc(p.unitSummary || '')}</span>
      <span class="index-meta m3">${esc(p.status)}</span>
      <span class="index-arrow" aria-hidden="true">&rarr;</span>
      <img class="index-thumb" src="${u('/images/optimized/' + p.heroImage)}" alt="" aria-hidden="true" loading="lazy">
    </a>`).join('');
  var stubs = STUBS.map((s) => `
    <div class="stub-row">
      <span class="n">${esc(s.name)}</span>
      <span class="d">${esc(s.location)} &middot; ${esc(s.unitSummary)} &middot; call for details</span>
    </div>`).join('');
  return `
<section class="section index-ember" data-index>
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">Every Development</span>
      <span class="sec-note">Nine grounds &middot; one standard</span>
    </div>
    <div class="index reveal">${rows}</div>
    ${stubs}
  </div>
</section>`;
}

function enquiry() {
  return `
<section class="chapter-dusk">
  <div class="bg" aria-hidden="true">
    <img src="${u('/images/generated/dusk-sky.jpg')}" alt="">
    <video muted loop playsinline preload="none" poster="${u('/images/generated/dusk-sky.jpg')}" data-ambient-src="${u('/videos/dusk-sky.mp4')}"></video>
  </div>
  <div class="wrap" style="padding-block:clamp(56px,9vh,96px)">
    <h2 class="close-line reveal">See it in person.</h2>
    <div class="enquiry-grid" style="margin-top:clamp(28px,4vw,52px)">
      <div class="reveal">
        <div class="contact-table on-dark">
          <div><span class="k">Sales</span><span class="v"><a href="${site.phones.primaryHref}">${site.phones.primary}</a></span></div>
          <div><span class="k">WhatsApp</span><span class="v"><a href="${site.whatsapp.href}" target="_blank" rel="noopener">${site.whatsapp.label}</a></span></div>
          <div><span class="k">Email</span><span class="v"><a href="mailto:${site.email}">${site.email}</a></span></div>
          <div><span class="k">Office</span><span class="v" style="max-width:34ch">${esc(site.address.line1)}, ${esc(site.address.line2)}</span></div>
        </div>
      </div>
      <form class="enquiry-form reveal" action="mailto:${site.email}" method="get" enctype="text/plain">
        <div class="field"><label for="name">Full name</label><input id="name" name="name" required></div>
        <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" required></div>
        <div class="field"><label for="project">Interested in</label>
          <select id="project" name="project" required>
            <option value="" selected disabled>Select a project</option>
            ${RESIDENTIAL.map((p) => `<option>${esc(p.name)}</option>`).join('')}
            <option>Not sure yet</option>
          </select>
        </div>
        <div class="field"><label for="message">Message</label><textarea id="message" name="message" rows="3"></textarea></div>
        <button class="btn btn-brass" type="submit" style="width:100%">Send Enquiry</button>
        <p class="form-note">Opens your email app with the details filled in. Prefer to talk? Call <a href="${site.phones.primaryHref}">${site.phones.primary}</a>.</p>
      </form>
    </div>
  </div>
</section>`;
}

module.exports = function homePage(opts) {
  opts = opts || {};
  var showcase = opts.showcase === 'zoom' ? zoomShowcase() : riverShowcase();
  var body = cover() + showcase + numbersChapter() + ledger() + enquiry();
  return { body: body, scripts: ['/js/hero3d.js'] };
};
