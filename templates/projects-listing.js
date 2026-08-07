const { RESIDENTIAL, HOSPITALITY, STUBS } = require('../content/projects');
const { esc, u } = require('./layout');

/* The listing page IS the index — the same ruled table as the front page,
   given the whole page, with the cursor preview. */
module.exports = function projectsListingPage() {
  var rows = RESIDENTIAL.concat(HOSPITALITY).map((p, i) => `
    <a class="index-row" href="${u('/' + p.slug + '/')}" data-preview="${u('/images/optimized/' + p.heroImage)}">
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

  var body = `
<section class="page-head">
  <div class="wrap">
    <div class="art-kicker">
      <span class="k">Our Projects</span>
      <span class="r">Bhagalpur &middot; Deoghar &middot; Residential &amp; Hospitality</span>
    </div>
    <h1>Nine grounds, one standard.</h1>
    <p class="art-standfirst">Every development we have delivered or currently have underway — specifications, floor plans and photography, as published by the developer.</p>
  </div>
</section>

<section class="section-tight" data-index>
  <div class="wrap">
    <div class="index reveal">${rows}</div>
    <div style="margin-top:36px" class="reveal">
      <div class="sec-row" style="margin-bottom:0"><span class="eyebrow">Also named, not yet documented</span>
        <span class="sec-note">Material not yet available &mdash; call us directly</span></div>
      ${stubs}
    </div>
  </div>
</section>`;
  return { body: body, scripts: [] };
};
