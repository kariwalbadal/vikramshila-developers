const site = require('../content/site');
const { RESIDENTIAL, HOSPITALITY, STUBS } = require('../content/projects');
const { esc, u } = require('./layout');

/* The listing page IS the index — the same ruled table as the front page,
   given the whole page, with the cursor preview. */
module.exports = function projectsListingPage() {
  var all = RESIDENTIAL.concat(HOSPITALITY);
  var rows = all.map((p, i) => `
    <a class="index-row" href="${u('/' + p.slug + '/')}" data-preview="${u('/images/optimized/' + p.heroImage)}">
      <span class="index-no">${String(i + 1).padStart(2, '0')}</span>
      <span class="index-name">${esc(p.name)}</span>
      <span class="index-meta m1">${esc(p.location)}</span>
      <span class="index-meta m2">${esc(p.unitSummary || '')}</span>
      <span class="index-meta m3">${esc(p.status)}</span>
      <span class="index-arrow" aria-hidden="true">&rarr;</span>
      <img class="index-thumb" src="${u('/images/optimized/' + p.heroImage)}" alt="" aria-hidden="true" loading="lazy">
    </a>`).join('');

  // developments named by the developer without a documented page yet —
  // same ruled rows, same numbering, no link to pretend otherwise
  var statics = STUBS.map((s, i) => `
    <div class="index-row index-static">
      <span class="index-no">${String(all.length + i + 1).padStart(2, '0')}</span>
      <span class="index-name">${esc(s.name)}</span>
      <span class="index-meta m1">${esc(s.location || '—')}</span>
      <span class="index-meta m2">${esc(s.unitSummary || '')}</span>
      <span class="index-meta m3">${esc(s.status || 'Details on request')}</span>
      <span class="index-arrow" aria-hidden="true"></span>
    </div>`).join('');

  var body = `
<section class="page-head">
  <div class="wrap">
    <div class="art-kicker">
      <span class="k">Our Projects</span>
      <span class="r">Bihar &middot; Jharkhand &middot; West Bengal &middot; Residential &amp; Hospitality</span>
    </div>
    <h1>Twelve grounds, one standard.</h1>
    <p class="art-standfirst">Every development we have delivered or currently have underway — specifications, floor plans and photography, as published by the developer.</p>
  </div>
</section>

<section class="section-tight" data-index>
  <div class="wrap">
    <div class="index reveal">${rows}${statics}</div>
    <p class="index-footnote reveal">Devpreet Vikramshila, Shyamri Tower and Astha Garden await full documentation — call <a href="${site.phones.primaryHref}">${site.phones.primary}</a> for details.</p>
  </div>
</section>`;
  return { body: body, scripts: [] };
};
