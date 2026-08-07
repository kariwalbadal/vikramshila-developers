const site = require('../content/site');
const { RESIDENTIAL } = require('../content/projects');
const { esc, u } = require('./layout');

module.exports = function contactPage() {
  var body = `
<section class="page-head">
  <div class="wrap">
    <div class="art-kicker">
      <span class="k">Contact</span>
      <span class="r">Santhalia Market, Bhagalpur</span>
    </div>
    <h1>The enquiry desk.</h1>
    <p class="art-standfirst">Call, WhatsApp, or send an enquiry — a member of the team will get back to you directly.</p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <div class="enquiry-grid">
      <div class="reveal">
        <div class="contact-table">
          <div><span class="k">Sales</span><span class="v"><a href="${site.phones.primaryHref}">${site.phones.primary}</a></span></div>
          <div><span class="k">Office</span><span class="v"><a href="${site.phones.secondaryHref}">${site.phones.secondary}</a></span></div>
          <div><span class="k">General</span><span class="v"><a href="${site.phones.generalHref}">${site.phones.general}</a></span></div>
          <div><span class="k">WhatsApp</span><span class="v"><a href="${site.whatsapp.href}" target="_blank" rel="noopener">${site.whatsapp.label}</a></span></div>
          <div><span class="k">Email</span><span class="v"><a href="mailto:${site.email}">${site.email}</a></span></div>
          <div><span class="k">Office address</span><span class="v" style="max-width:36ch">${esc(site.address.full)}</span></div>
          <div><span class="k">Directions</span><span class="v"><a href="https://maps.google.com/?q=${encodeURIComponent(site.address.full)}" target="_blank" rel="noopener">Open in Google Maps</a></span></div>
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
        <p class="form-note">This opens your email app with the details filled in. Prefer to talk now? Call <a href="${site.phones.primaryHref}">${site.phones.primary}</a> or message us on WhatsApp.</p>
      </form>
    </div>
  </div>
</section>`;
  return { body: body, scripts: [] };
};
