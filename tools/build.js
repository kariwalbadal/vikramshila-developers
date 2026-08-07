#!/usr/bin/env node
// Zero-dependency static site build. Reads /content, renders via /templates,
// writes the finished HTML + SEO files to the repo root (served by GitHub
// Pages directly from main). Run: node tools/build.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const site = require('../content/site');
const { RESIDENTIAL, HOSPITALITY, ALL } = require('../content/projects');
const { layout } = require('../templates/layout');
const homePage = require('../templates/home');
const projectPage = require('../templates/project');
const aboutPage = require('../templates/about');
const contactPage = require('../templates/contact');
const projectsListingPage = require('../templates/projects-listing');
const { privacyPolicy, termsConditions } = require('../templates/legal');

function truncate(s, max) {
  if (s.length <= max) return s;
  var cut = s.slice(0, max);
  var lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 0) cut = cut.slice(0, lastSpace);
  return cut.replace(/[,;:—-]+$/, '') + '…';
}

function write(relPath, html) {
  var full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  console.log('wrote', relPath);
}

function realEstateAgentLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: site.company,
    url: site.siteUrl,
    telephone: site.phones.primary,
    email: site.email,
    address: { '@type': 'PostalAddress', streetAddress: site.address.line1, addressLocality: 'Bhagalpur', addressRegion: 'Bihar', addressCountry: 'IN' },
    areaServed: ['Bhagalpur', 'Deoghar'],
    slogan: site.philosophy,
  };
}

function projectLd(p) {
  var type = p.kind === 'hospitality' ? 'Hotel' : 'ApartmentComplex';
  var ld = {
    '@context': 'https://schema.org',
    '@type': type,
    name: p.name,
    description: p.description || p.tagline,
    url: site.siteUrl + '/' + p.slug + '/',
    image: site.siteUrl + '/images/optimized/' + p.heroImage,
    address: { '@type': 'PostalAddress', streetAddress: p.address, addressCountry: 'IN' },
  };
  return ld;
}

var pages = [];

pages.push({ path: '/', out: 'index.html', title: 'Vikramshila Developers — Creation, Not Construction',
  description: 'Real estate developers in Bhagalpur & Deoghar, building homes named after the ancient university of Vikramshila. Nine developments, one standard.',
  ...homePage(), jsonLd: [realEstateAgentLd()] });

pages.push({ path: '/our-projects/', out: 'our-projects/index.html', title: 'Our Projects — Vikramshila Developers',
  description: 'Every Vikramshila Developers residential project in Bhagalpur, Deoghar and beyond — specifications, floor plans and photography.',
  ...projectsListingPage() });

pages.push({ path: '/about-us/', out: 'about-us/index.html', title: 'About Us — Vikramshila Developers',
  description: 'Founded over a decade ago on one philosophy — Creation, Not Construction. The story behind Vikramshila Developers.',
  ...aboutPage() });

pages.push({ path: '/contact-us/', out: 'contact-us/index.html', title: 'Contact — Vikramshila Developers',
  description: 'Call, WhatsApp or write to Vikramshila Developers — Santhalia Market, Bhagalpur.',
  ...contactPage() });

pages.push({ path: '/privacy-policy/', out: 'privacy-policy/index.html', title: 'Privacy Policy — Vikramshila Developers',
  description: 'Privacy Policy for the Vikramshila Developers website.', ...privacyPolicy() });

pages.push({ path: '/terms-conditions/', out: 'terms-conditions/index.html', title: 'Terms & Conditions — Vikramshila Developers',
  description: 'Terms & Conditions for the Vikramshila Developers website.', ...termsConditions() });

ALL.forEach(function (p) {
  pages.push({
    path: '/' + p.slug + '/', out: p.slug + '/index.html',
    title: p.name + ' — ' + p.location + ' | Vikramshila Developers',
    description: truncate(p.description || p.tagline, 155),
    ogImage: '/images/optimized/' + p.heroImage,
    jsonLd: [projectLd(p)],
    ...projectPage(p),
  });
});

pages.forEach(function (pg) {
  var html = layout({
    title: pg.title, description: pg.description, path: pg.path,
    ogImage: pg.ogImage, jsonLd: pg.jsonLd, body: pg.body, scripts: pg.scripts,
    bodyClass: pg.path === '/' ? 'is-home' : '',
  });
  write(pg.out, html);
});

// ---------- ember variant preview (three pages, canonical to the main site,
// excluded from the sitemap) ----------
var kesh = ALL.find(function (p) { return p.slug === 'keshavam-apartment'; });
[
  { path: '/', out: 'variant-1/index.html', title: 'Vikramshila Developers — Variant 1 (River)',
    description: 'Preview variant: horizontal river showcase.', bodyClass: 'is-home', page: homePage({ showcase: 'river' }) },
  { path: '/', out: 'variant-2/index.html', title: 'Vikramshila Developers — Variant 2 (Zoom)',
    description: 'Preview variant: zoom-through showcase.', bodyClass: 'is-home', page: homePage({ showcase: 'zoom' }) },
  { path: '/', out: 'variant-ember/index.html', title: 'Vikramshila Developers — Ember Variant Preview',
    description: 'Preview variant.', bodyClass: 'is-home v-ember', page: homePage() },
  { path: '/about-us/', out: 'variant-ember/about-us/index.html', title: 'About — Ember Variant Preview',
    description: 'Preview variant.', bodyClass: 'v-ember', page: aboutPage() },
  { path: '/' + kesh.slug + '/', out: 'variant-ember/' + kesh.slug + '/index.html', title: kesh.name + ' — Ember Variant Preview',
    description: 'Preview variant.', bodyClass: 'v-ember', page: projectPage(kesh) },
].forEach(function (v) {
  write(v.out, layout({
    title: v.title, description: v.description, path: v.path,
    body: v.page.body, scripts: v.page.scripts, bodyClass: v.bodyClass,
  }));
});

// ---------- sitemap.xml ----------
var urls = pages.map((pg) => `  <url><loc>${site.siteUrl}${pg.path}</loc></url>`).join('\n');
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

// ---------- robots.txt ----------
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`);

// ---------- llms.txt ----------
var llms = `# ${site.company}\n\n> ${site.philosophy}. Real estate developer building residential apartments in Bhagalpur and Deoghar (Bihar/Jharkhand, India), founded over a decade ago.\n\n` +
  `## Contact\n- Phone: ${site.phones.primary}, ${site.phones.secondary}\n- Email: ${site.email}\n- Office: ${site.address.full}\n- WhatsApp: ${site.whatsapp.label}\n\n` +
  `## Projects\n` + RESIDENTIAL.map((p) => `- [${p.name}](${site.siteUrl}/${p.slug}/) — ${p.location}, ${p.status}, ${p.unitSummary}`).join('\n') + '\n\n' +
  `## Hospitality\n` + HOSPITALITY.map((p) => `- [${p.name}](${site.siteUrl}/${p.slug}/) — ${p.location}`).join('\n') + '\n\n' +
  `## Pages\n- [Home](${site.siteUrl}/)\n- [Our Projects](${site.siteUrl}/our-projects/)\n- [About Us](${site.siteUrl}/about-us/)\n- [Contact](${site.siteUrl}/contact-us/)\n\n` +
  `## Notes\nRERA registration numbers are not published on this site pending confirmation from the developer. No facts on this site are invented; figures not stated by the developer are omitted rather than estimated.\n`;
write('llms.txt', llms);

console.log('\nBuild complete:', pages.length, 'pages.');
