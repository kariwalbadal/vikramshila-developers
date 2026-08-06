const site = require('../content/site');
const { RESIDENTIAL } = require('../content/projects');
const { esc, u } = require('./layout');

module.exports = function contactPage() {
  var body = `
<section class="hero" style="min-height:52svh">
  <div class="hero-media"><img src="${u('/images/optimized/all-project-image-06-scaled-1.jpg')}" alt="A Vikramshila Developers residence" fetchpriority="high"></div>
  <div class="hero-scrim"></div>
  <div class="hero-inner">
    <div class="content">
      <div class="hero-kicker">Contact</div>
      <h1 class="hero-title">Let’s talk.</h1>
    </div>
  </div>
</section>

<section class="section section-paper enquiry">
  <div class="wrap enquiry-grid">
    <div class="reveal">
      <div class="eyebrow">Reach Us Directly</div>
      <h2 class="display-2" style="margin-top:18px">Bhagalpur office</h2>
      <p class="lede" style="margin-top:14px">${esc(site.address.full)}</p>
      <div class="contact-strip">
        <div class="row"><span class="copy-num" style="user-select:all">${site.phones.primary}</span><a class="btn btn-outline" href="${site.phones.primaryHref}">Call</a></div>
        <div class="row"><span class="copy-num" style="user-select:all">${site.phones.secondary}</span><a class="btn btn-outline" href="${site.phones.secondaryHref}">Call</a></div>
        <div class="row"><a class="btn btn-brass" href="${site.whatsapp.href}" target="_blank" rel="noopener">WhatsApp ${site.whatsapp.label}</a></div>
        <div class="row"><a class="btn btn-ghost" style="border-color:var(--border-hairline);color:var(--text)" href="mailto:${site.email}">${site.email}</a></div>
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
      <div class="field"><label for="message">Message</label><textarea id="message" name="message" rows="4"></textarea></div>
      <button class="btn btn-brass" type="submit" style="width:100%">Send Enquiry</button>
      <p style="margin-top:14px;font-size:12px;color:var(--text-soft)">This opens your email app with the details filled in. Prefer to talk now? Call <a href="${site.phones.primaryHref}" style="text-decoration:underline">${site.phones.primary}</a> or message us on WhatsApp.</p>
    </form>
  </div>
</section>`;
  return { body: body, scripts: [] };
};
