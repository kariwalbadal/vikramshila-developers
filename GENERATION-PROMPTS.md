# Nano Banana Pro — generation pack v2 (Vikramshila, the home-run build)

Rules for every asset: **no text, no watermark, no people, no logos** in the output.
Return as PNG or max-quality JPG, dropped into an `incoming/` folder in the repo
(or sent in chat), keeping the filenames given below.

---

## PART A — Fidelity-preserving upscales (the most important part)

The new site shows imagery at full viewport, and our current files top out at
1600px (some far worse — Keshavam is 784px). Run each file below through
NB Pro as an **image-to-image enhancement** with this instruction:

> Upscale this architectural render to 4K. Preserve the building's architecture,
> colours, materials, lighting and composition EXACTLY — do not add, remove,
> or redesign any element, do not change the sky or landscaping. Only increase
> resolution, sharpness and clarity; remove JPEG compression artifacts.

**Fidelity matters more than beauty here** — these are real projects and the
renders are the developer's published record. If NB Pro "reimagines" the
building, reject that output and re-run. If a result looks subtly redrawn,
send it anyway and flag it — I will compare against the original pixel by pixel.

Files (all in `images/optimized/` in the repo), in priority order:

| # | File | Current size | Used as |
|---|---|---|---|
| 1 | `hero-monument-clean.jpg` | 1376×654 | Home hero (Shivalaya) — the landing image |
| 2 | `1.png` | **784×588** | Keshavam Apartment hero — worst offender |
| 3 | `annapurna-hero-clean.jpg` | 1000×820 | Annapurna Heights hero |
| 4 | `2-02-3.jpg` | 1600×1131 | Sunrise hero |
| 5 | `2-02-1.jpg` | 1600×1096 | Tejprabha Residency hero |
| 6 | `0000_23_Chandeshwar_Apartment-05-01-2_11zon.jpg` | 1296×936 | Chandeshwar hero |
| 7 | `Jagdish-enclave-1-img_page-0001.jpg` | 1600×1132 | Jagdish Enclave hero |
| 8 | `chinmayePng-scaled-1.jpg` | 1600×1067 | Hotel Chinmaye Inn hero |
| 9 | `Pi7_Image_chandeshwarapartmentnightview_page-00011.jpg` | 1296×936 | About page plate |
| 10 | `all-project-image-04-scaled-1.jpg` | 1600×900 | Listing page plate |
| 11 | `all-project-image-06-scaled-1.jpg` | 1600×900 | Contact page plate |

Name the outputs `<original-name>-4k.<ext>`.

**Note on Ganesh Enclave:** its only "hero" in the harvest is the project's logo —
there is no building image at all. See the client-asks list: only the developer
can supply a render or photo. Until then Ganesh Enclave cannot have a
full-viewport chapter.

## PART B — Ember dust still → `ember-field.png`
**16:9, 2K if available.** First frame for the TopView (MiniMax H3) mood video,
and a reduced-motion backdrop. No monument, no building — pure atmosphere.

> Near-total darkness, deep warm black (#0b0a08). A sparse field of tiny golden
> ember particles drifting at different depths — some sharp points, some soft
> bokeh — like dust catching torchlight in a vast dark hall. Subtle warm amber
> glow (#e8a33d to #c19a4d), gentle volumetric haze lower in the frame,
> photographic, cinematic, extremely restrained, no text, no watermark.

## PART C — Textures
**`texture-brick.png` — 1:1, 1K** (used at 5–8% opacity as a background layer):

> Top-down flat texture of ancient weathered fired-brick masonry, small narrow
> bricks in irregular courses, warm umber and terracotta earth tones, very low
> contrast, even diffuse lighting, edge-to-edge like a material scan, matte,
> no text, no watermark.

**`texture-relief.png` — 16:9, 1K:**

> Flat frontal scan of an ancient terracotta relief panel with shallow carved
> geometric and floral patterns, heavily weathered so details are soft,
> monochromatic warm terracotta-umber palette, very low contrast, even
> lighting, fills the whole frame, matte, no text, no watermark, no faces.

## PART D — Carved mandala medallion → `mandala-medallion.png`
**1:1, 1K.** Reference for the SVG cursor/dividers/glyph style — crisp geometry
matters more than realism.

> A single circular carved stone mandala medallion centered on a plain
> near-black background, concentric rings of simple geometric petals and
> notches, shallow relief lit from one side in warm amber, symmetrical, clean
> silhouette, ancient Indian stone-carving character without any deity or
> face, no text, no watermark.
