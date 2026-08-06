const site = require('../content/site');
const { RESIDENTIAL, HOSPITALITY } = require('../content/projects');
const { esc, u } = require('./layout');

function heroSection() {
  return `
<section class="hero" data-signature-hero>
  <div class="hero-media">
    <img src="${u('/images/optimized/hero-monument-clean.jpg')}" alt="Shivalaya residence at dusk, warm-lit windows behind a palm-lined Deoghar street" fetchpriority="high">
  </div>
  <div class="hero-scrim"></div>
  <canvas id="signature-canvas" aria-hidden="true"></canvas>
  <div class="hero-inner">
    <div class="content">
      <div class="hero-kicker">Bihar, Jharkhand &amp; Bengal &middot; Est. over a decade ago</div>
      <h1 class="hero-title">
        <span class="line"><span>Creation,</span></span>
        <span class="line"><span>not construction.</span></span>
      </h1>
      <p class="hero-sub on-ink">Vikramshila Developers builds the homes a family will hand down for generations — named, deliberately, after the university that once made this ground legendary.</p>
      <div class="hero-actions">
        <a class="btn btn-brass" href="${u('/our-projects/')}">View Our Projects</a>
        <a class="btn btn-ghost" href="${site.phones.primaryHref}">Call ${site.phones.primary}</a>
      </div>
    </div>
  </div>
  <div class="hero-scroll-cue on-ink"><span style="font-size:10px;letter-spacing:0.14em;text-transform:uppercase">Scroll</span><span class="stem"></span></div>
</section>`;
}

function marquee() {
  var names = RESIDENTIAL.concat(HOSPITALITY).map((p) => `<span>${esc(p.name)}</span>`).join('');
  return `
<div class="marquee section-paper">
  <div class="marquee-track" data-marquee>${names}</div>
</div>`;
}

function statement() {
  return `
<section class="section-ink statement">
  <div class="wrap">
    <div class="eyebrow" style="margin-bottom:28px">The Namesake</div>
    <p class="statement-line reveal">${esc(site.namesakeShort)}</p>
  </div>
</section>`;
}

function standardsSection() {
  var cards = site.standards.map((s) => `
      <div class="standard-card reveal">
        <span class="n">${esc(s.n)}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.body)}</p>
      </div>`).join('');
  return `
<section class="section-ink standards-pin">
  <div class="wrap standards-grid">
    <div class="standards-sticky reveal">
      <div class="eyebrow">The Standard</div>
      <h2 class="display-2" style="margin-top:18px">What every home gets.</h2>
      <p class="lede" style="margin-top:18px">Six things repeated, unprompted, in the written specifications of every ground we’ve built — not marketing copy. The plan itself.</p>
    </div>
    <div class="standards-list">${cards}</div>
  </div>
</section>`;
}

function featuredProjects() {
  var rows = RESIDENTIAL.slice(0, 6).map((p, i) => `
    <div class="proj-row${i % 2 ? ' flip' : ''} reveal">
      <div class="proj-media parallax"><img src="${u('/images/optimized/' + p.heroImage)}" alt="${esc(p.name)}, ${esc(p.location)} — exterior view" loading="lazy" width="1200" height="900"></div>
      <div class="proj-copy">
        <span class="proj-index-mark">0${i + 1}</span>
        <div class="proj-index">${esc(p.status)}</div>
        <h3 class="proj-name">${esc(p.name)}</h3>
        <div class="proj-loc">${esc(p.location)}</div>
        <div class="proj-tags"><span class="tag">${esc(p.unitSummary)}</span></div>
        <a class="proj-link" href="${u('/' + p.slug + '/')}">View Project <span class="arrow">&rarr;</span></a>
      </div>
    </div>`).join('\n');

  return `
<section class="section section-paper featured-projects">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Featured Developments</div>
      <h2 class="display-2" style="margin-top:18px">Nine grounds. One standard.</h2>
    </div>
    ${rows}
    <div class="reveal" style="margin-top:56px;text-align:center">
      <a class="btn btn-outline" href="${u('/our-projects/')}">See all nine developments</a>
    </div>
  </div>
</section>`;
}

function factVitrine() {
  var cells = site.stats.map((s) => `
      <div class="vitrine-cell">
        <span class="stat" data-countup="${s.value}" data-suffix="${esc(s.suffix)}">0</span>
        <span class="label">${esc(s.label)}</span>
      </div>`).join('');
  return `
<section class="section section-ink">
  <div class="wrap">
    <div class="eyebrow" style="margin-bottom:28px">In Numbers</div>
    <div class="vitrine reveal">${cells}</div>
    <p style="margin-top:20px;font-size:12.5px;color:var(--text-on-ink-soft)">Figures as published by Vikramshila Developers.</p>
  </div>
</section>`;
}

function aboutBand() {
  return `
<section class="section section-paper" style="position:relative;overflow:hidden">
  <div class="wrap about-band">
    <div class="reveal">
      <div class="eyebrow">About Vikramshila</div>
      <h2 class="display-2" style="margin-top:18px">${esc(site.philosophy)}</h2>
      <p class="lede" style="margin-top:22px">${esc(site.aboutCopy[0])}</p>
      <a class="proj-link" href="${u('/about-us/')}" style="margin-top:28px">Our Story <span class="arrow">&rarr;</span></a>
    </div>
    <div class="proj-media reveal" style="aspect-ratio:5/4">
      <img src="${u('/images/optimized/0000_23_Chandeshwar_Apartment-05-01-2_11zon.jpg')}" alt="Chandeshwar Apartment, Bhagalpur" loading="lazy">
    </div>
  </div>
</section>`;
}

function enquiry() {
  return `
<section class="section enquiry section-ink">
  <div class="ghost-word reveal" style="bottom:2%;left:2%">Vikramshila</div>
  <div class="wrap enquiry-grid">
    <div class="reveal">
      <div class="eyebrow">Get In Touch</div>
      <h2 class="display-2" style="margin-top:18px">Let’s talk about your next home.</h2>
      <p class="lede" style="margin-top:18px">Call, WhatsApp, or send an enquiry — a member of the team will get back to you directly.</p>
      <div class="contact-strip">
        <div class="row"><span class="copy-num on-ink">${site.phones.primary}</span><a class="btn btn-ghost" href="${site.phones.primaryHref}">Call</a></div>
        <div class="row"><a class="btn btn-brass" href="${site.whatsapp.href}" target="_blank" rel="noopener">WhatsApp Us</a><a class="btn btn-ghost" href="mailto:${site.email}">${site.email}</a></div>
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
      <p style="margin-top:14px;font-size:12px;color:var(--text-soft)">This opens your email app with the details filled in. Prefer to talk now? Call <a href="${site.phones.primaryHref}" style="text-decoration:underline">${site.phones.primary}</a> or message us on WhatsApp.</p>
    </form>
  </div>
</section>`;
}

module.exports = function homePage() {
  var body = heroSection() + marquee() + statement() + standardsSection() + featuredProjects() + factVitrine() + aboutBand() + enquiry();
  return { body: body, scripts: ['/js/signature.js'] };
};
