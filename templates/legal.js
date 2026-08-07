const site = require('../content/site');
const { esc } = require('./layout');

function legalPage(opts) {
  var body = `
<section class="page-head">
  <div class="wrap" style="max-width:760px">
    <div class="art-kicker"><span class="k">${esc(opts.eyebrow)}</span><span class="r">Last updated: ${esc(opts.updated)}</span></div>
    <h1>${esc(opts.title)}</h1>
  </div>
</section>
<section class="section-tight">
  <div class="wrap" style="max-width:760px">
    <div style="color:var(--text-soft);line-height:1.8;font-size:14.5px">${opts.html}</div>
  </div>
</section>`;
  return { body: body, scripts: [] };
}

function privacyPolicy() {
  return legalPage({
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    updated: 'May 02, 2024',
    html: `
      <p>This Privacy Policy describes how ${esc(site.company)} ("we," "us," or "our") collects, uses and discloses information in connection with your use of this website.</p>
      <p>We collect information you provide directly to us when you fill in an enquiry form — such as your name, phone number and message — for the sole purpose of responding to your enquiry about our developments. This site has no server-side backend: enquiry forms compose an email in your own email application, and no form data is transmitted to or stored on our servers.</p>
      <p>We do not sell, rent or share your personal information with third parties for their marketing purposes.</p>
      <p>Country: Bihar, India. For any privacy-related questions, write to us at <a href="mailto:${site.email}" style="text-decoration:underline">${site.email}</a>.</p>`,
  });
}

function termsConditions() {
  return legalPage({
    eyebrow: 'Legal',
    title: 'Terms &amp; Conditions',
    updated: 'May 02, 2024',
    html: `
      <p>These Terms &amp; Conditions govern your use of this website, operated by ${esc(site.company)}.</p>
      <p>All project information, specifications, floor plans and imagery on this site are provided for general informational purposes and are subject to change without notice. They do not constitute a legal offer or contract. Please confirm current specifications, pricing and availability directly with our sales team before making any decision.</p>
      <p>All content on this site — text, photography and renders — is the property of ${esc(site.company)} unless otherwise noted, and may not be reproduced without permission.</p>
      <p>Country: Bihar, India. Questions about these terms can be sent to <a href="mailto:${site.email}" style="text-decoration:underline">${site.email}</a>.</p>`,
  });
}

module.exports = { privacyPolicy, termsConditions };
