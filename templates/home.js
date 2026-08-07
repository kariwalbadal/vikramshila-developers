const site = require('../content/site');
const { RESIDENTIAL, HOSPITALITY, STUBS } = require('../content/projects');
const { esc, u } = require('./layout');

/* The home page is the front page of an issue: cover plate, dateline,
   the index of grounds (with a cursor-following preview), one cover story,
   the standard as a spec sheet, the numbers, a letter, the enquiry desk.
   Dense and ruled — information per screen, not air. */

function cover() {
  return `
<section class="cover" data-hero>
  <div class="cover-media">
    <img src="${u('/images/optimized/hero-monument-clean.jpg')}" alt="Shivalaya residence at dusk, warm-lit windows behind a palm-lined Deoghar street" fetchpriority="high">
    <div class="cover-scrim"></div>
    <div class="cover-inner">
      <div>
        <div class="cover-kicker">Vikramshila Developers &middot; Bihar &amp; Jharkhand</div>
        <h1 class="cover-title">
          <span class="line"><span>Creation,</span></span>
          <span class="line"><span>not construction.</span></span>
        </h1>
        <p class="cover-standfirst">Homes a family will hand down for generations — named, deliberately, after the university that once made this ground legendary.</p>
        <div class="cover-actions">
          <a class="btn btn-brass" href="${u('/our-projects/')}">View the Projects</a>
          <a class="btn btn-ghost" href="${site.phones.primaryHref}">Call ${site.phones.primary}</a>
        </div>
      </div>
    </div>
  </div>
  <div class="wrap">
    <div class="plate-cap">
      <span><span class="num">Cover</span> &mdash; Shivalaya, Deoghar, at dusk</span>
      <span>The grounds of Bhagalpur &amp; Deoghar</span>
    </div>
  </div>
</section>`;
}

function dateline() {
  return `
<div class="dateline">
  <div class="wrap dateline-inner">
    <span>Est. over a decade ago</span>
    <span><b>9</b> developments delivered &amp; underway</span>
    <span><b>250</b> satisfied families</span>
    <span><b>1,00,000+</b> sq ft developed</span>
    <span>Bhagalpur &middot; Deoghar</span>
  </div>
</div>`;
}

function indexRow(p, i) {
  return `
    <a class="index-row" href="${u('/' + p.slug + '/')}" data-preview="${u('/images/optimized/' + p.heroImage)}">
      <span class="index-no">${String(i + 1).padStart(2, '0')}</span>
      <span class="index-name">${esc(p.name)}</span>
      <span class="index-meta m1">${esc(p.location)}</span>
      <span class="index-meta m2">${esc(p.unitSummary || '')}</span>
      <span class="index-meta m3">${esc(p.status)}</span>
      <span class="index-arrow" aria-hidden="true">&rarr;</span>
      <img class="index-thumb" src="${u('/images/optimized/' + p.heroImage)}" alt="" aria-hidden="true" loading="lazy">
    </a>`;
}

function indexSection() {
  var rows = RESIDENTIAL.concat(HOSPITALITY).map(indexRow).join('');
  var stubs = STUBS.map((s) => `
    <div class="stub-row">
      <span class="n">${esc(s.name)}</span>
      <span class="d">${esc(s.location)} &middot; ${esc(s.unitSummary)} &middot; call for details</span>
    </div>`).join('');
  return `
<section class="section" data-index>
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">The Index</span>
      <span class="sec-note">Nine grounds &middot; one standard</span>
    </div>
    <div class="index reveal">${rows}</div>
    <div style="margin-top:36px" class="reveal">
      <div class="sec-row" style="margin-bottom:0"><span class="eyebrow">Also named, not yet documented</span></div>
      ${stubs}
    </div>
  </div>
</section>`;
}

function coverStory() {
  var p = RESIDENTIAL.find((x) => x.slug === 'keshavam-apartment') || RESIDENTIAL[0];
  var facts = [
    ['Location', p.location],
    ['Status', p.status],
    ['Configuration', p.unitSummary || '—'],
  ];
  return `
<section class="section section-shade">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">From the Grounds</span>
      <span class="sec-note">Featured development</span>
    </div>
    <div class="story reveal">
      <figure class="story-media" style="margin:0">
        <img src="${u('/images/optimized/' + p.heroImage)}" alt="${esc(p.name)}, ${esc(p.location)} — exterior view" loading="lazy" width="1200" height="900">
        <figcaption class="plate-cap" style="margin-top:0;padding-top:10px">
          <span><span class="num">Fig. 01</span> &mdash; ${esc(p.name)}, ${esc(p.location)}</span>
          <span>Developer&rsquo;s render</span>
        </figcaption>
      </figure>
      <div class="story-body">
        <h3>${esc(p.name)}</h3>
        <div class="loc">${esc(p.location)}</div>
        <dl class="story-facts" style="margin-top:18px">
          ${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
        </dl>
        ${p.description ? `<p class="txt">${esc(p.description)}</p>` : ''}
        <a class="link-more" href="${u('/' + p.slug + '/')}" style="margin-top:18px">Read the full page <span class="arrow">&rarr;</span></a>
      </div>
    </div>
  </div>
</section>`;
}

function standardSheet() {
  var items = site.standards.map((s) => `
      <div class="std-item reveal">
        <span class="n">${esc(s.n)}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.body)}</p>
      </div>`).join('');
  return `
<section class="section">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">The Standard</span>
      <span class="sec-note">Written into every specification &mdash; not marketing copy</span>
    </div>
    <div class="std-sheet">${items}</div>
  </div>
</section>`;
}

function numbers() {
  var cells = site.stats.map((s) => `
      <div>
        <span class="stat" data-countup="${s.value}" data-suffix="${esc(s.suffix)}">0</span>
        <span class="label">${esc(s.label)}</span>
      </div>`).join('');
  return `
<section class="section-tight">
  <div class="wrap">
    <div class="numrow reveal">${cells}</div>
    <p style="margin-top:12px;font-size:11px;color:var(--text-soft)">Figures as published by Vikramshila Developers.</p>
  </div>
</section>`;
}

function letter() {
  return `
<section class="section">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">From the Name</span>
      <span class="sec-note">Why Vikramshila</span>
    </div>
    <div class="letter reveal">
      <p class="dropcap">${esc(site.aboutCopy[0])}</p>
      <p class="muted">${esc(site.namesakeShort)}</p>
      <a class="link-more" href="${u('/about-us/')}">Our story <span class="arrow">&rarr;</span></a>
    </div>
  </div>
</section>`;
}

function enquiry() {
  return `
<section class="section section-shade">
  <div class="wrap">
    <div class="sec-row reveal">
      <span class="eyebrow">The Enquiry Desk</span>
      <span class="sec-note">A member of the team replies directly</span>
    </div>
    <div class="enquiry-grid">
      <div class="reveal">
        <div class="contact-table">
          <div><span class="k">Sales</span><span class="v"><a href="${site.phones.primaryHref}">${site.phones.primary}</a></span></div>
          <div><span class="k">Office</span><span class="v"><a href="${site.phones.secondaryHref}">${site.phones.secondary}</a></span></div>
          <div><span class="k">WhatsApp</span><span class="v"><a href="${site.whatsapp.href}" target="_blank" rel="noopener">${site.whatsapp.label}</a></span></div>
          <div><span class="k">Email</span><span class="v"><a href="mailto:${site.email}">${site.email}</a></span></div>
          <div><span class="k">Office address</span><span class="v" style="max-width:34ch">${esc(site.address.line1)}, ${esc(site.address.line2)}</span></div>
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
        <p class="form-note">This opens your email app with the details filled in. Prefer to talk now? Call <a href="${site.phones.primaryHref}">${site.phones.primary}</a> or message us on WhatsApp.</p>
      </form>
    </div>
  </div>
</section>`;
}

module.exports = function homePage() {
  var body = cover() + dateline() + indexSection() + coverStory() + standardSheet() + numbers() + letter() + enquiry();
  return { body: body, scripts: [] };
};
