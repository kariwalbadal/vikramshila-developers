const { RESIDENTIAL, HOSPITALITY, STUBS } = require('../content/projects');
const { esc, u } = require('./layout');

module.exports = function projectsListingPage() {
  var cards = RESIDENTIAL.concat(HOSPITALITY).map((p, i) => `
    <a href="${u('/' + p.slug + '/')}" class="proj-row reveal" style="text-decoration:none;grid-template-columns:1fr;display:grid">
      <div class="proj-media"><img src="${u('/images/optimized/' + p.heroImage)}" alt="${esc(p.name)}" loading="lazy"></div>
      <div class="proj-copy" style="margin-top:20px">
        <div class="proj-index">0${i + 1} &middot; ${esc(p.status)}</div>
        <h3 class="proj-name" style="font-size:1.7rem;margin-top:10px">${esc(p.name)}</h3>
        <div class="proj-loc">${esc(p.location)}</div>
      </div>
    </a>`).join('\n');

  var stubs = STUBS.map((s) => `
    <div class="vitrine-cell" style="border-left:1px solid var(--border-hairline)">
      <span style="font-family:var(--font-display);font-style:italic;font-size:1.3rem">${esc(s.name)}</span>
      <span class="label" style="margin-top:8px">${esc(s.location)} &middot; ${esc(s.unitSummary)}</span>
    </div>`).join('');

  var body = `
<section class="hero" style="min-height:56svh">
  <div class="hero-media"><img src="${u('/images/optimized/all-project-image-04-scaled-1.jpg')}" alt="A Vikramshila Developers residence" fetchpriority="high"></div>
  <div class="hero-scrim"></div>
  <div class="hero-inner">
    <div class="content">
      <div class="hero-kicker">Our Projects</div>
      <h1 class="hero-title">Nine grounds, one standard.</h1>
    </div>
  </div>
</section>

<section class="section section-paper">
  <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:48px 32px">
    ${cards}
  </div>
</section>

<section class="section section-ink">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Also Named, Not Yet Documented</div>
      <p class="lede" style="margin-top:16px">These developments are named on our records but the material to build a full project page for them — specifications, floor plans, photography — isn’t available yet. Call us directly for details.</p>
    </div>
    <div class="vitrine reveal" style="border-color:var(--border-hairline-on-ink)">${stubs}</div>
  </div>
</section>`;
  return { body: body, scripts: [] };
};
