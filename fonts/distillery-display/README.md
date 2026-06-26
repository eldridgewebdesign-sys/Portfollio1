# Distillery Display

An uppercase serif display typeface, vectorized from the specimen sheet at
`fonts/Examples/Distillery.display.font.png`.

The specimen contains two cuts of the alphabet (a primary and a slightly different
alternate). Both were captured:

| Family | Source rows | Files |
| --- | --- | --- |
| **Distillery Display** | rows 1–2 of the sheet | `DistilleryDisplay-Regular.{woff2,otf,ttf}` |
| **Distillery Display Alt** | rows 3–4 of the sheet | `DistilleryDisplayAlt-Regular.{woff2,otf,ttf}` |

- `.woff2` — web use (load via `@font-face`).
- `.otf` — web fallback + desktop install.
- `.ttf` — desktop install (Windows: right-click → Install).

## Coverage

- **A–Z** plus a space.
- Lowercase `a–z` is mapped to the same capital forms, so text renders in caps
  regardless of input case (this is an all-caps display face).
- Digits and punctuation are **not** in the source specimen and are not included;
  unsupported characters fall back to the `.notdef` box.

## Web usage

Link the stylesheet, then set the family:

```html
<link rel="stylesheet" href="fonts/distillery-display/distillery-display.css">
```
```css
.brand-heading { font-family: "Distillery Display", serif; }
.brand-heading--alt { font-family: "Distillery Display Alt", serif; }
```

Or copy the `@font-face` blocks from `distillery-display.css` inline (this project
keeps CSS inline per page). Adjust the `url(...)` paths to be relative to the page.

Open `specimen.html` in a browser to preview both cuts at several sizes.

## How it was made

Pipeline (pure Python, no external binaries):
`Pillow` (load + threshold the PNG) → grid segmentation (4 rows × 13 glyphs) →
`potracer` (raster → smooth Bézier outlines, counters preserved) → per-row
baseline/cap-height normalization and Y-flip into 1000-UPM font space →
`fontTools` (assemble CFF/OTF, convert to TrueType, export WOFF2).

Metrics: 1000 units/em, ~700-unit cap height, uniform 40-unit side bearings.
