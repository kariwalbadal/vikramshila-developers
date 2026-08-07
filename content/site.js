// Site-wide facts — every value here is traceable to HARVEST.md. Nothing invented.
const SITE_URL = 'https://kariwalbadal.github.io/vikramshila-developers';
// GitHub Pages project sites are served under /<repo>/, not domain root — every
// same-origin href/src in the templates must carry this prefix or it 404s live
// while looking fine on a local server mounted at root. Derived once, here,
// so there is exactly one place that knows the deployment path.
const BASE_PATH = new URL(SITE_URL).pathname.replace(/\/$/, '');

module.exports = {
  siteUrl: SITE_URL,
  basePath: BASE_PATH,
  company: 'Vikramshila Developers Pvt. Ltd.',
  shortName: 'Vikramshila Developers',
  philosophy: 'Creation, Not Construction',
  aboutCopy: [
    'Founded over a decade ago and guided by a simple yet profound philosophy — ‘Creation, Not Construction’ — Vikramshila Developers Pvt. Ltd. is one of the foremost real estate companies in Bihar and Jharkhand, with over 1,00,000 sq ft of landmark developments in Bhagalpur and Deoghar.',
    'Vikramshila Developers has, to date, built projects across residential, commercial and retail segments — homes extraordinary in location, engineering, design and amenities. The company holds an uninterrupted record of completing projects on time, and carries the confidence of the families who now call those projects home.',
  ],
  namesake: 'Vikramshila was the great ancient university of Bihar — one of the two most important centres of Buddhist learning in early medieval India, founded by Emperor Dharmapala. The name is a deliberate inheritance: a promise of permanence and mastery carried from a legendary seat of learning into the buildings a family will call home.',
  namesakeShort: 'A university that outlasted empires. We chose the name to promise the same of what we build.',
  // Exactly the three figures the developer publishes — no derived counts.
  stats: [
    { value: 250, label: 'Satisfied Families', suffix: '' },
    { value: 5, label: 'Active Projects', suffix: '' },
    // 1 lac, written as the full numeral so the count-up sweeps the whole
    // figure (rendered with en-IN digit grouping: 1,00,000+)
    { value: 100000, label: 'Sq Ft Developed', suffix: '+' },
  ],
  phones: {
    primary: '+91 8873101010',
    primaryHref: 'tel:+918873101010',
    secondary: '+91 9304139148',
    secondaryHref: 'tel:+919304139148',
    general: '+91 8405005081',
    generalHref: 'tel:+918405005081',
  },
  whatsapp: {
    number: '918873101010',
    href: 'https://api.whatsapp.com/send?phone=918873101010&text=Hello%2C%20I%27d%20like%20to%20know%20more%20about%20your%20projects.',
    label: '+91 8873101010',
  },
  email: 'indiavdpl@gmail.com',
  address: {
    line1: 'Santhalia Market, 1st Floor, Marwari Tola Lane',
    line2: 'Bhagalpur, Bihar 812002',
    full: 'Vikramshila Developers Private Limited, Santhalia Market, 1st Floor, Marwari Tola Lane, Bhagalpur, Bihar 812002',
  },
  social: [], // none found anywhere in the harvest — confirmed absent, see HARVEST.md §7.6
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Our Projects', href: '/our-projects/' },
    { label: 'About Us', href: '/about-us/' },
    { label: 'Contact', href: '/contact-us/' },
  ],
  // Every line here is a fact independently repeated in the written
  // specifications/amenities of at least half our documented projects —
  // not a slogan, a pattern in what we've actually built. See content/projects.js.
  standards: [
    { n: '01', title: 'Earthquake-resistant framing', body: 'Not an upgrade — the frame every one of our recent structures is engineered to first, in a state that feels it.' },
    { n: '02', title: 'Round-the-clock security', body: 'CCTV surveillance and trained security are written into the plan before the first flat is sold, not added after residents ask.' },
    { n: '03', title: 'Generator backup, every home', body: 'Common areas, lifts and individual flats — power stays on, on every ground we build.' },
    { n: '04', title: 'Granite, not laminate', body: 'Kitchen platforms in granite with steel sinks — the specification sheet, not the brochure copy, is where this is decided.' },
    { n: '05', title: 'Vitrified tile flooring', body: 'Throughout, not just in the rooms a buyer walks during a site visit.' },
    { n: '06', title: 'Rain water harvesting', body: 'Where the site allows it, it goes in — a small line item that outlasts most of what gets marketed harder.' },
  ],
  needsClientInput: [
    'RERA registration numbers — not published anywhere in the source for the company or any of the 9 projects.',
    'Confirmed prices for residential units (only the hotel property lists tariffs).',
    'Exact company founding year (source only says "over a decade ago").',
    'Real "Our Team" member names, titles and photos — the old site’s cards were unfilled placeholders.',
    'Real testimonials for the company or any residential project (only 3 genuine reviews exist, and they’re for the hotel).',
    'Confirmation of a monitored WhatsApp Business number (one wa.me link exists, unconfirmed as actively staffed).',
    'Shivalaya’s correct site address — the old site shows two conflicting addresses (Bhagalpur vs Deoghar).',
    'Jagdish Enclave’s true completion status — nav said "Completed," body copy said flats are still "coming up."',
    'Any material on Devpreet Vikramshila, Shyamri Tower and Astha Garden — named only in a listing grid, no page, specs or photos exist in the harvest.',
    'Unit-area (sqft) figures for Tejprabha Residency, Chandeshwar Apartment and Ganesh Enclave — not published.',
    'Floor/tower counts for Sunrise, Tejprabha Residency, Chandeshwar Apartment, Ganesh Enclave and Shivalaya.',
    'A Google Maps pin for the head office or for any residential project (only the hotel has one).',
    'Better-resolution photography generally — harvested renders top out around 1300–1600px.',
  ],
};
