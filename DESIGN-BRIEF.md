# Design Brief — "Vikramshila"

**Client:** Vikramshila Developers Pvt. Ltd., Bhagalpur (Bihar) & Deoghar (Jharkhand)
**Deliverable:** Complete visual + motion redesign of vikramshiladevelopers.in (static site, GitHub Pages)
**Ambition:** A look and feel that maybe one in a million websites has. The visitor should feel something the moment they land — awe first, information second.

---

## 1. The theme (this governs every decision)

**Ancient, as a feeling — not a history lesson.** Vikramshila is an ancient name in this region, and the site should *feel* ancient-rooted: stone, fired brick, terracotta, ember light, carved lines, mineral motion. The old university gets exactly **one light reference** (a single quiet line, e.g. the existing "A university that outlasted empires. We chose the name to promise the same of what we build.") — no dates, no ruins documentary, no narrative arc about the past. The theme lives in *material and motion*, not in copy.

Brand line stays: **"Creation, not construction."**

## 2. The signature moment (hero, full viewport)

WebGL (three.js, already vendored in the repo). An **ancient monument form made of thousands of ember-gold particles** floats in near-darkness — slowly rotating, drifting like dust in torchlight. It breathes; it is alive but calm. (Form options: a literal brick-stupa silhouette, or an abstract carved-stone/mandala mass — client to pick; abstract keeps the university reference lighter.)

Then — on first scroll, or after a held beat — **the particles migrate**: the ancient form dissolves and the *same particles* resettle into the massing of a modern Vikramshila building, which resolves into the real dusk photograph of Shivalaya (already in `/images/optimized/hero-monument-clean.jpg`). One continuous material, ancient → modern. The brand line sets in as the photo resolves.

- Ancient-form geometry: procedural mass (no external 3D asset needed) or generated reference imagery as a sampling target.
- Building target: particles sampled from the photograph's luminance (the sampling pipeline already exists in `js/signature.js`; its past failures — point-size attenuation, density, luminance floor — are known, solved bugs).
- Reduced-motion / no-WebGL / slow devices: a still "ember poster" of the stupa crossfading to the photograph. Mobile: fewer particles, same story.
- Nothing may obscure or delay the page more than ~2.5s; scroll is never hijacked.

## 3. Motion language (sitewide — the feel of running the site)

- **Excavation reveals:** images uncover like sand brushed off a relief (directional clip + grain), hairline rules "carve" themselves in.
- **Dust layer:** faint drifting motes over dark sections; constant, almost subliminal.
- **Seal cursor (desktop):** a small brass mandala ring replaces the cursor; it slowly spins over interactive elements.
- **Page transitions:** stone-slide / dust dissolve between pages (View Transitions API, graceful fallback).
- **Numbers:** count up in Indian grouping (1,00,000+), engraved style.
- **Easing:** one curve everywhere — slow, heavy, mineral. Nothing bouncy, nothing fast.
- Every effect has a reduced-motion fallback. The site must feel *carved*, not animated.

## 4. Art direction

**Two-era palette — the cohesion device:**
- *The ancient register:* excavation dark (deep umber-charcoal), ember gold / brass, terracotta, sandstone, fired brick. Used for the hero, the story interludes, dark sections.
- *The living register:* the company's real brand teal **#1e9fa9** (sampled from their actual VD logo — mark files in `/images/brand/`) + warm plaster paper. Used wherever the *present* speaks: project facts, CTAs, the mark itself.
- Gold = the past. Teal = the present. Every screen knows which era it is in.

**Materials:** fired-brick texture (the real ruins are brick), terracotta relief, palm-leaf manuscript, brass. A faint grain overlay unifies all surfaces.

**Type:** display face should feel *inscriptional/lapidary*, not European-salon (the current Bodoni is elegant but wrong-era). Candidates: Marcellus (inscriptional, free), Rozha One (Devanagari-influenced high contrast). Upright only — no italics anywhere (hard client rule). Body/UI: Inter. Devanagari accent: the word **विक्रमशिला** may appear as an engraved motif (it is the name — factual).
Thin hairline weights failed legibility review on image backgrounds — display type must hold weight; never place high-contrast thin strokes over photography without a solid or heavily scrimmed ground.

**Iconography:** amenities and standards get a **carved-glyph icon set** — single-weight engraved line pictograms (security, generator, lift, water, garden…), consistent stroke, like symbols cut into stone. No emoji, no clip-art, no mixed icon libraries.

## 5. Structure (half the words, twice the feeling)

Cut all copy ~50%. Every section leads with image or motion; text is one carved line + compact facts.

**Home:**
1. Hero — the particle morph (above).
2. *The Name* — ONE quiet excavation-revealed line (the existing namesake sentence). That is the entire university reference on the site.
3. *The Grounds* — the ruled index of all 9 projects (this pattern worked; keep it) restyled to theme, with the cursor-following photo preview.
4. One featured ground (plate + carved fact tablets).
5. *The Standard* — six carved tablets with glyphs, one line each.
6. Numbers row (engraved countup).
7. Enquiry desk (compact; contact table + form).
No letter section, no long paragraphs anywhere on home.

**Project pages:** keep the feature-article bones (title block → plate → pinned vitals → unit explorer → gallery figures → close) but: amenities become glyph tablets, copy tightened, all plates and rules take the excavation treatment, atmosphere imagery stays explicitly labelled.

## 6. Hard constraints (non-negotiable)

- Static site, zero runtime dependencies beyond vendored three.js. GitHub Pages under `/vikramshila-developers/`.
- **No invented facts.** No RERA numbers, prices, dates, or testimonials that aren't in the harvest. The company is "over a decade" old — the *name* is ancient, the company is not; never blur that line.
- Real project photography only in project galleries; generated/stock imagery only as clearly-labelled atmosphere or as texture/motif.
- Accessibility gates stay: 44px touch targets, alt text, reduced-motion, no scroll hijack, mobile action bar.
- Existing verified content model (`content/site.js`, `content/projects.js`) is the single source of facts.

## 7. Assets to produce

Generation runs on **TopView** (budget: 10 credits hard cap, authorized by client). All generation at **≤1K resolution**; anything needing 1080p+ goes through the local upscaler (kinocut) afterwards. Video model: **MiniMax H3** (confirmed available on TopView as image-to-video, 768px ≤1K tier) — workflow is still-first: generate the frame with an image model, then animate it with MiniMax H3.

| Asset | Source |
|---|---|
| Hero ember still (first frame + reduced-motion poster) | TopView image model, 1K |
| Ember-drift video (hero backdrop / mood band) | MiniMax H3 image-to-video @768 → local upscale |
| Terracotta relief + fired-brick textures | TopView image model 1K (texture use only) or Pexels |
| Carved glyph icon set (~14 glyphs) | Hand-drawn SVG, single stroke weight |
| Dust/grain overlays | Procedural (canvas/CSS) |
| Mandala seal cursor | Hand-drawn SVG |

## 8. Build & review order (what changes about process)

1. **Hero prototype first.** Built alone, recorded as a real scrolling video from headless Chrome, sent for approval. Nothing else is built until the hero feels right.
2. Theme system (palette/type/texture/glyphs) applied to ONE project page → second video review.
3. Roll out to all pages; motion checked by watching recordings, not stills.
4. Full verify harness + live deploy.
