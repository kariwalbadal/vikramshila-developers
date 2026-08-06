# THE VIKRAMSHILA COMMISSION
### A complete website reimagining — briefed by Sutra Haus (Sutrahaus LLP)

You are the lead designer-engineer on a commissioned rebuild. Your client is a
real-estate development firm (housing societies, apartment buildings). Their
current website is dated. You will replace it with a website *out of legends* —
one that makes a family about to invest their life savings feel they are buying
into permanence, mastery and myth. Not "another developer website." Not even a
$10,000 developer website. The reference class is Aman Resorts, DLF's Camellias
microsite, OYLA-grade editorial craft — AND the Awwwards tier of interactive
experience studios (Active Theory, Immersive Garden, Obys, Locomotive). The
visitor's first three seconds must contain something they have never seen on
any developer website.

**The single source of truth: https://vikramshiladevelopers.in/**
Everything — every image, project name, specification, phone number, address,
RERA number, map, logo — must be harvested from that site. You invent design,
never facts.

**The gift in the name:** Vikramshila was the great ancient university of
Bihar — a real, legendary seat of mastery. The brand is *named after a legend*.
Use that as the design story: monumental, scholarly, enduring. Stone, brass,
manuscript, monument. Do not write fake history about the company; let the
namesake's grandeur shape the *aesthetic*, and the company's real facts carry
the content.

---

## PHASE 0 — HARVEST (do this before any design)
1. Mirror the site: crawl every internal page (follow nav, footers, project
   detail pages, galleries). Save raw HTML of each page.
2. Download EVERY image at maximum available resolution. Check: `srcset`,
   `data-src`/`data-lazy` attributes, CSS `background-image`, slider/carousel
   JSON, favicons, the logo (get the sharpest variant; screenshot-crop it from
   the site at 2× if no clean file exists). Organize into
   `assets/harvest/<page>/...` with an inventory manifest (source URL, size,
   what it shows).
3. Extract ALL text into a single `HARVEST.md`: company story, project names,
   locations, unit types (2BHK/3BHK etc.), areas in sq ft, floors, amenities,
   possession/completion status, prices if listed, RERA registration numbers,
   phone numbers, WhatsApp numbers, email, office address, Google Maps embeds,
   social links, testimonials if any.
4. Screenshot the ORIGINAL site (desktop + mobile, top + full-page) — these
   become the "before" record and prove what existed.
5. Improve what you harvested: re-encode images (strip junk, JPEG q~80,
   sensible widths, `-2` even dimensions), and where originals are small,
   present them small-but-sharp rather than upscaled-and-soft. Never crop
   through text or faces; never mirror images.

## PHASE 1 — STUDY
Write a one-page read of the business from the harvest: what they build, for
whom, in which city, what their strongest projects and photographs are, what
trust markers exist (RERA, years, delivered projects). Decide the ONE hero
asset (their best photograph or a project montage) before designing anything.

## THE SIGNATURE — the landing moment (this is the whole point)
The brief's core demand: the instant a visitor lands, they experience
something novel — the kind of opening only very highly paid agencies ship.
Design ONE signature experience and engineer it properly. It must be
INVENTED for this brand (monument / stone / legacy / the ancient Vikramshila
university), not assembled from common scroll patterns. Candidate directions
— pick one and push it to excellence, or invent something better:
- A WebGL/canvas "monument rise": the flagship building assembled from
  thousands of particles/shards of light that converge as the visitor
  arrives or scrolls, resolving into the real harvested photograph.
- A scroll-driven image-sequence build (pre-rendered frames from harvested
  photos, canvas-scrubbed like Apple product pages): the tower constructs
  floor by floor as you scroll, facts annotating each stage.
- A portal/mask opening: the logo mark as a clipping mask that scales to
  swallow the screen and reveal the world inside.
- A living blueprint: architectural line-drawing (SVG stroke animation) of
  the flagship project drawing itself, then cross-fading into photography.
Rules for the signature: 60fps on a mid-range phone (test it), graceful
degradation (static hero + masked text when WebGL/canvas is unavailable or
`prefers-reduced-motion` is set), never block content longer than ~2.5s,
always skippable by scroll. For this ONE moment you MAY vendor a single
runtime library into the repo (e.g. three.min.js or gsap.min.js — no CDNs,
no frameworks, no build toolchain); everything else stays vanilla. The rest
of the site's motion (Phase 4) is the floor — the signature is the ceiling,
and it is not optional.

## PHASE 2 — DESIGN LANGUAGE ("out of legends")
- Typography: one editorial display serif with optical sizing (e.g. Fraunces
  opsz, weight ~330–400, tight leading, italic accents) + one quiet neutral
  sans for labels/UI. Letterspaced 10–11px caps labels. Nothing default.
- Palette: derive from the harvested logo and photography — likely a deep
  monument tone (stone/ink/deep green or maroon) + one metallic accent
  (brass/gold) + a paper-light band for facts. One accent color, used with
  discipline. Never purple-on-black AI-slop gradients.
- Signature moves that have proven to read as luxury (adapt, don't copy):
  full-bleed hero media with a *light* scrim (raw imagery, text-anchored
  bottom; strengthen scrim only under text and on mobile via media query);
  glass header pill; hairline-bordered stat cells (units, sq ft, floors,
  years) like a jeweler's vitrine; a pinned split section (text pins left,
  fact-cells slide right); a ghost outlined wordmark behind the contact
  section; masked line-rise headline reveals; a 2px scroll-progress hairline;
  count-up numerals for REAL numbers only.
- Radius system: exactly two values (small UI ~4px, media ~10px). One shadow
  style. One easing curve (`cubic-bezier(0.19,1,0.22,1)`).
- Each project page is a MONUMENT: giant serif project name, full-bleed
  gallery, spec vitrine (bordered cells), amenities as an elegant list — not
  icon-grid clip-art — location map, RERA line, and one clear enquiry block.

## PHASE 3 — ARCHITECTURE
Pages: Home · one page per project (every project found in the harvest) ·
About/Legacy · Contact. Home = hero → statement → featured projects (large,
editorial, one per row with parallax media) → fact vitrine (real numbers
from harvest) → about band → enquiry. India-real-estate essentials, all from
harvest only: RERA numbers displayed plainly (families check), click-to-call
`tel:` links, WhatsApp `wa.me` link if a number exists on the old site,
Google Maps embed/link per project, enquiry form (no backend exists: build a
clean form that composes a prefilled mailto AND show the phone number as
copyable text beside it — never a bare mailto-only path).
SEO: per-page titles/descriptions, canonical, JSON-LD (`RealEstateAgent` +
`ApartmentComplex`/`Residence` per project with address + RERA in
`identifier`), `sitemap.xml`, `robots.txt` pointing at the sitemap on the URL
that actually serves the site, `llms.txt` fact sheet, og:image generated from
the new design (verify the URL resolves).

## PHASE 4 — MOTION (the floor, beneath the signature)
Vanilla JS + CSS for everything except the vendored signature library. Include: load choreography on the hero (word-masked or
char-cascade headline — if char-cascade, wrap each word in a
`display:inline-block; white-space:nowrap` span or it WILL break mid-word on
mobile); IntersectionObserver line-mask reveals for all major headings (and
OBSERVE every element you mask — a masked heading with no observer renders
never); subtle parallax on media (disable ≤980px); pinned scroll reveal with
~150–165vh total height (280vh is dead scroll, 110vh skips the effect;
~130vh on mobile); marquee rows that self-heal short lists (repeat until
≥10 tiles); full `prefers-reduced-motion` fallbacks for every effect; cap
concurrent playing videos at 5 if you use video tiles.

## PHASE 5 — CRAFT GATES (hard-won; violating any = not done)
1. After EVERY CSS patch, verify the computed style in a real headless
   browser (puppeteer-core + installed Chrome), not by re-reading the file —
   we have shipped CSS that silently never applied.
2. `img { max-width:100%; height:auto }` — the missing `height:auto` distorts
   every image with HTML width/height attributes.
3. Never let a padding shorthand on a `.wrap`-combined class eat the
   horizontal gutters (`.section .wrap { padding: X 0 }` kills them).
4. Buttons are real components: filled pills with hover states — never bare
   text links as CTAs, never a default OS `<button>`.
5. Mobile: 390px check with in-page JS (`scrollWidth === clientWidth`), 44px
   minimum touch targets, header CTA visible OUTSIDE the collapsible menu,
   readable text over media (add scrim under text on mobile).
6. Scope any mobile-only control styling inside its media query — a stray
   `display:flex` appended at file end resurrects mobile controls on desktop.
7. Descriptive `alt` on every harvested image (project + what it shows). No
   `aria-hidden` on content that IS the portfolio.
8. Total page weight sane: hero media ≤1.5MB, lazy-load below the fold,
   `preload="metadata"` on videos, poster images for all video.
9. No invented facts, stats, testimonials, awards, or completion claims.
   Facts appear exactly as harvested. If a fact is unclear, omit it.
10. Fast: aim Lighthouse 90s mobile. Verify, don't assume.

## PHASE 6 — VERIFY LIKE AN ENEMY
1. Self-verify visually: build → serve locally → headless-Chrome screenshot
   desktop (1440×900 + full-page) and mobile (390×844) of EVERY page → READ
   the screenshots → fix → repeat until you find nothing.
2. Then run an adversarial loop: spawn an independent reviewer agent (Opus,
   fresh context) with instructions to capture the site itself, score 1–10 on
   first impression / clarity / craft / media / conversion / copy / motion /
   mobile, benchmark against the best real-estate and studio sites alive, and
   list top issues with exact fixes. Fix everything fixable. Re-run with a
   fresh reviewer. Minimum two rounds; stop only when a fresh reviewer finds
   no critical or high issue and design axes average ≥8 — honestly, never by
   arguing the score up.
3. Report scores and trajectory truthfully in your final summary, including
   anything that is capped until the client supplies assets.

## PHASE 7 — SHIP
Build in `/Users/badal/Desktop/Workspace/vikramshila-developers/` as a static site (a
tiny zero-dependency `node build.js` is fine if it helps; no frameworks, no
npm dependencies for the runtime page). Push to a new GitHub repo
`kariwalbadal/vikramshila-developers`, enable GitHub Pages, verify the LIVE URL renders
(screenshot it), and ensure canonical/og/sitemap all point at the URL that
actually serves the site. Do not touch the client's live domain or DNS. Final
deliverable: live preview URL + before/after screenshots + the honest review
scores + a list of anything needing client input (better photography, missing
RERA data, WhatsApp number confirmation).

**The bar:** when the client's family opens this on a phone, their first
words should be "yeh humari company hai?" — *this* is our company? Build the
website their name deserves.
