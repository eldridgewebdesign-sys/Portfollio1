# 01 — Creative Direction: `/engineering`

- **Owner:** Creative Director
- **Date:** 2026-07-01 · **Status:** Revision 5 (round 4, sequenced citation pass) — the PM's rulings now exist as `decisions.md` D-009–D-017, and this pass replaces every "queued ruling" hedge with the entry number. Every claim this document makes about a neighbor now either cites a D-entry by number or was re-verified against that neighbor's current text on 2026-07-01 (03 §3/§4/§5.2/§7/§9/§11/§12 and 02 §7.2/§10 were read and checked this pass). No design, derivation, or craft content changed.
- **Binding upstream:** `project-vision.md` (esp. §7, §9, §11), `references.md`, `decisions.md` D-001–D-017, `docs/design-guide.md`, `index.html` (live homepage), `review-report.md` (rounds 1–3)
- **Interfaces owned here:** all on-page words (copy deck §8), all visual/taste rules. The Animation
  Director owns beat numbering, scroll ranges, and all timing — this document references 03's own
  slot IDs (`copy.B0`, `copy.B1`, the six teardown cards `copy.B2`–`copy.B6`, `copy.close` /
  `copy.cta` / `copy.signoff`, `label.*`, `R0`–`R4`) and generic phases (*arrival / teardown /
  ending*), and it assigns **no** scroll range and **no clock duration to any scene-anchored
  element**: those transitions are specified as scroll-progress ramps whose widths 03 sets. The
  Technical Architect owns global budgets. The Asset Director owns 3D node/file naming; CSS token
  names below are page CSS, not asset names.

**Round-4 (revision 5) citation map** (round-3 required changes, re-scoped against the recorded entries → where fixed):
1. §8.2/§8.3 carry the joint copy deck as recorded in **D-009**, verified cell-by-cell against 03 §7.1 as published this pass; all "PM's copy-slot ruling" phrasing now cites D-009. **D-015** (seated battery label active) is folded in: the label inventory is 9 labels / 14 words, and the word budgets are honestly recounted **113 / 141** (superseding revision 4's 112 / 140, which predated D-015) → §7.5, §8.2, §8.3, §9 rules 4–5.
2. §5.1/§5.2/§5.5 carry the arrival as recorded in **D-010** (62vw / ≈38% at `P0` 4.15W, B1 pure dolly 4.15W → 2.90W, 50vw only at `P5`; the 50vw centered variant retired on the record); numbers re-verified against 03 §5.2/§3 as published.
3. All poster mentions are of the "no poster exists" form and now cite **D-013** → §5.2, §7.6, §8.4.
4. §7.5's joint label policy cites **D-014a** (the round-3 stale note on 03 §7.4 no longer exists; 03 §7.4 was re-read this pass and carries the policy verbatim); §5.4/§7.8 cite **D-014c**/**D-014b**; §7.4 cites **D-014d**.
5. §8.5.2's staged non-copper fallback card is **retired, superseded by D-016** (kept on the record, not deleted); the closing line carries its **D-017** status (adopted; owner sign-off pending) → §8.2, §11.
6. §11's open questions are closed against the entries that resolved them; the one item still open is D-017's owner sign-off.

**Round-3 revision map** (historical — as executed in revision 4, before the entries were recorded):
1. The joint slot→wording table is now **cell-identical with 03 §7.1 as published** (the six merged cards; every window verified against 03 §3), carrying the PM's copy-slot ruling [now recorded as D-009]; `copy.B1` is ruled to **ship** (this document's round-3 non-existence ruling is withdrawn, argued from the real deck); the per-mode word budgets are recounted (112 / 140) [superseded by revision 5's 113 / 141 under D-015] → §8.2, §8.3.
2. The arrival is restated per the PM's arrival ruling [now recorded as D-010] — subject at 62vw / ≈38% frame width, delivered by 03's `P0` at 4.15W, title in the left word column at 50vh, B1 a pure dolly — and every false claim about 03's camera (the 2.60W `P0`, the 50vw-at-`P0` frame, the deleted 50→62vw reframe) is removed → §5.1, §5.2, §5.5.
3. All three loader-poster references are deleted (no poster exists in any document [now recorded as D-013]: 02 §7.2 declines one, 04 §9.3 deleted its designation, and preloading `R0` would violate 02's QA-1); the affected passages are restated without it → §5.2, §7.6, §8.4.
4. The stale note claiming 03 §7.4 still characterizes the withdrawn round-0 one-label-at-a-time rule as current is deleted — 03 §7.4 as revised carries the joint policy verbatim [the policy is now recorded as D-014a] → §7.5.
(Also swept in the same pass: the slow-network status line is **retired** with its reason recorded — 02 §7.2 as published converts a stalled load directly to the static experience, so the line's trigger no longer exists (§7.1, §7.6, §8.2, §8.3); §7.8's still pairings and the 04 capture-address note are updated to 03 §11 / 04 §9.1 as published.)

## Table of contents

1. [Artistic vision](#1-artistic-vision)
2. [Visual identity — a WebSharke page without the ocean](#2-visual-identity)
3. [Color palette](#3-color-palette)
4. [Typography](#4-typography)
5. [Composition and layout](#5-composition-and-layout)
6. [Lighting direction](#6-lighting-direction)
7. [UI design](#7-ui-design)
8. [Copy deck](#8-copy-deck)
9. [Anti-AI-slop rules for this page](#9-anti-ai-slop-rules)
10. [Mood and reference notes](#10-mood-and-reference-notes)
11. [Open questions for the PM](#11-open-questions)

---

## 1. Artistic vision

A quiet, warm room. Morning light through a window somewhere off-frame to the right. In the middle
of the room, a thin silver laptop sits closed on nothing — no table, no hands, no tools — the way a
watch sits on a jeweler's cloth. When the visitor scrolls, the machine takes itself apart, calmly,
one layer at a time, and each piece is named in plain English the moment it is in front of you. At
the end everything hangs in the air in its right place, labeled, and one line closes the loop with
the homepage's promise.

**Temperature:** warm. The room is beige linen and pale oak; the machine is cool aluminum and dark
board. The tension between those two temperatures is the entire visual drama — nothing else competes.

**Light:** one soft daylight key from the upper right, the room itself as the fill. Everything the
light does must be explainable by that one window. No effect on this page glows without a source.

**Pace:** unhurried, and set entirely by the visitor's hand. The scroll is a crank on a well-oiled
machine — heavy, precise, reversible. Nothing on this page moves unless the visitor moves it, except
the light catching an edge. When the visitor stops, the page holds its breath and waits, composed.

**What it must never feel like:** a keynote, a game, a tech demo, an ad. It should feel like being
allowed to watch someone competent work — the vision's watchmaker's bench, filmed at eye level. The
page earns trust by being calm about a complicated thing, because that is the sentence the whole
site is built on: *websites are complicated; good thing we're not.*

## 2. Visual identity

`/engineering` is a page *of* the WebSharke site (vision §11.5), but the ocean stays home. Carrying
water, aqua accents, or fish onto a beige studio page would be theming, not identity. Identity here
is carried by five structural things, each traceable to the live homepage:

1. **The same two fonts, same scale logic** (D-004). Distillery Display carries display lines,
   Playfair Display carries sentences and UI — identical division of labor to `index.html`.
2. **The same nav grammar.** `Main-Logo.png` rendered by CSS `mask` and tinted with a CSS variable,
   exactly the homepage's technique — here tinted `--ink` (§3) to sit on the warm wall. The logo
   links to `/`. There is **no Sign In link** on this page: the homepage's auth CTA serves returning
   clients mid-task; this page sells one feeling and offers one action, at the end. A second CTA in
   the nav would compete with the story for the entire scroll (vision §7: every UI element must
   justify itself). The logo is the only exit, which is enough — it is where visitors came from.
   (Settled: 03 §4-B0 now states the same — logo only, no Sign In on this page.)
3. **The same motion grammar.** Reveal, not spectacle (design-guide law). UI elements fade and rise
   the way `.rv` elements do on the homepage; the 3D scene is scrubbed, never autoplayed.
4. **The sand CTA.** The ending reuses `.btn-sand` byte-for-byte (§7.7). It is deliberately the only
   object in the room that comes from the homepage's beach — the brand literally hands you the next
   step. That is its story sentence.
5. **The same narrative shape.** The homepage is a descent through water, top to bottom, one
   continuous background. This page is a descent through the layers of a machine. Same grammar —
   *scrolling down takes you deeper* — different medium. A visitor who has seen the homepage will
   feel the kinship without one shared pixel.

**Deliberate differences, with reasons:** no aqua accent (an accent must exist in the scene —
vision §7 — and nothing in a beige room or a silver laptop is aqua; the accents here are copper and
contact-gold because the machine physically contains them). No frosted-glass panels (the homepage's
glass cards are underwater objects; in a dry room, glass panels would be template decoration —
labels here are paper tags instead, §7.5). No footer sections — the page ends on the CTA and a
one-line sign-off, the way the homepage ends in deep water (the explicit ruling is in §5.4).

## 3. Color palette

### 3.1 Sampled sources (the palette is measured, not invented)

Sampled with a pixel probe on 2026-07-01. Coordinates are `(x, y)` in each image's native pixels.

| Source | Sample point | Measured hex | Reading |
|---|---|---|---|
| `interior.jpg` (1536×1024) | (1000, 400) | `#e9ddd1` | lit wall under the light ray |
| `interior.jpg` | (760, 300) | `#c9b8a6` | mid wall, ambient |
| `interior.jpg` | (300, 450) | `#bba58d` | wall in shadow, left |
| `interior.jpg` | (200, 1000) | `#a59586` | floor, shadowed foreground |
| `interior.jpg` | (760, 660) | `#fff8ec` | the bright light seam (peak highlight) |
| `interior.jpg` | (80, 300) | `#8d7254` | oak slats, left edge |
| `teardown-4.png` (1366×768) | (683, 140) | `#acacae` | aluminum lid, diffuse |
| `teardown-4.png` | (670, 420) | `#373736` | mainboard surface (render reads neutral) |
| `teardown-4.png` | (780, 320) | `#c3a36f` | gold contact fingers on the Memory (RAM) stick |
| `teardown-4.png` | (590, 290) | `#1b1a19` | Cooling Fan housing (darkest machine value) |

Note for the Asset Director: the reference render's Heat Pipes read graphite, and its mainboard
reads neutral dark, not green. The vision (§7) names copper and dark PCB as palette materials, so
the tokens below specify them; the deviation from the reference is approved as **D-016** (04 §4
builds raw copper), and §8.5.2 carries the settled copy dependency.

### 3.2 Tokens

Defined in the page's own `:root`. Names are page-scoped (this page ships its own inline CSS, so no
collision with the homepage's `--ink`), grouped by which world they belong to.

**The room (warm):**

| Token | Hex | Role | Derivation |
|---|---|---|---|
| `--linen` | `#f2e8da` | lightest surface: label chips, scrim base | light seam `#fff8ec` pulled ~5% toward the wall so no channel hits 255 — "no pure white" holds even at the top of the range |
| `--wall-lit` | `#e9ddd1` | brightest large area; top of `--wall-grad` | direct sample (1000, 400) |
| `--wall` | `#c9b8a6` | the default field behind everything | direct sample (760, 300) |
| `--wall-shade` | `#bba58d` | shadowed wall; base of `--wall-grad`; darkest area text may cross | direct sample (300, 450) |
| `--floor` | `#a59586` | floor-material echo for the 3D ground / contact-shadow grade (§6); **no 2D fill or text use** — same echo status as the machine tokens | direct sample (200, 1000) |
| `--oak` | `#8d7254` | smallest warm doses (leader-line dots at the ending, nothing larger) | direct sample (80, 300) |

**The machine (cool) — these live mostly in the 3D render; the CSS tokens exist so any 2D UI echo of a material matches it exactly:**

| Token | Hex | Role | Derivation |
|---|---|---|---|
| `--alu` | `#acacae` | aluminum diffuse (Lid, Chassis) | direct sample (683, 140) |
| `--alu-lit` | `#d6d6d8` | aluminum specular roll-off | `--alu` +16% lightness, hue held neutral |
| `--pcb` | `#232a26` | Mainboard / Support Boards soldermask: green-black | render sampled `#373736` neutral; production soldermask is specified green-black per vision §7, desaturated so it never reads "hacker green" |
| `--solder` | `#9a9da2` | solder joints, shield cans, screws | cool silver-gray, one step bluer than `--alu` so metalwork separates from panels |
| `--copper` | `#b06c3d` | Heat Pipes material; the scene's only warm metal | physical bare-copper tone, darkened to sit inside the scene's exposure (peak sample logic: must never exceed `--linen` in luminance) |
| `--copper-ink` | `#8a4b26` | text/UI-grade copper: focus accents, loader progress fill | `--copper` darkened until it passes 3:1 on `--wall` (measured 3.5:1) |
| `--gold` | `#c3a36f` | contact fingers, tiny connector glints | direct sample (780, 320) |

**Text and utility:**

| Token | Hex / value | Role | Derivation |
|---|---|---|---|
| `--ink` | `#2b2320` | primary text, logo tint, focus outlines | the Cooling Fan's `#1b1a19` lifted and warmed — the darkest thing on the page is machine-derived, and it is not pure black |
| `--ink-soft` | `#463c33` | secondary text: microtext, sign-off | `--ink` toward `--oak`; chosen over a lighter mix because it still passes AA on `--wall-shade` (4.54:1) |
| `--scrim` | `rgba(242,232,218,.72)` | soft ellipse behind text when the machine crosses a text zone (§4.4); its one scheduled use backs the closing block at the tableau (§5.4) | `--linen` at 72% — the minimum opacity at which `--ink` on the worst blend stays >10:1 |
| `--wall-grad` | `linear-gradient(180deg, var(--wall-lit) 0%, var(--wall) 62%, var(--wall-shade) 100%)` | the room's wall: **both** the loader background (§7.6) and the stage backdrop (§7.1a) | one definition, defined once in `:root`, so the loader→scene handoff is pixel-continuous and the gradient census (§9 rule 1) stays auditable |

### 3.3 Text-on-background pairings (WCAG, measured)

AA requires 4.5:1 (normal text) / 3:1 (large text ≥ 24px, and non-text UI). All values computed
with the WCAG 2.x relative-luminance formula on 2026-07-01.

| Foreground | Background | Ratio | Verdict | Where it happens |
|---|---|---|---|---|
| `--ink #2b2320` | `--wall-lit #e9ddd1` | **11.53:1** | AAA | opening title over the lit upper wall |
| `--ink` | `--wall #c9b8a6` | **7.98:1** | AAA | beat sentences, default field |
| `--ink` | `--wall-shade #bba58d` | **6.51:1** | AA (AAA large) | worst-case wall crossing |
| `--ink` | `--floor #a59586` | **5.31:1** | AA | reserve margin only — after §7.1a no 2D text sits over `--floor` (it is a 3D echo token) |
| `--ink` | `--alu #acacae` | **6.79:1** | AA | if a label chip's text ever overlaps the Lid |
| `--ink` | `--linen #f2e8da` | **12.71:1** | AAA | label chips (active) |
| `--ink` | settled chip over `--wall` blend `#e0d2c3` | **10.39:1** | AAA | settled label text (§7.5) |
| `--ink` | settled chip over `--alu` blend `#d3cdc6` | **9.76:1** | AAA | settled label worst case |
| `--ink` | scrim-over-`--alu` blend `#ded7cd` | **10.78:1** | AAA | scrim worst case (§4.4) |
| `--ink-soft #463c33` | `--wall-lit` | **8.05:1** | AAA | microtext in lit zones |
| `--ink-soft` | `--wall` | **5.57:1** | AA | scroll cue, loading microtext |
| `--ink-soft` | `--wall-shade` | **4.54:1** | AA (floor of use) | darkest permitted `--ink-soft` backing; never on anything darker |
| `--ink-soft` | scrim-over-`--alu` blend `#ded7cd` | **7.54:1** | AAA | sign-off inside the scrim-backed closing block (§5.4) |
| `--copper-ink #8a4b26` | `--linen` | **5.56:1** | AA | copper text only on chips/light zones |
| `--copper-ink` | `--wall` | **3.50:1** | non-text 3:1 pass | loader progress fill on wall |
| `#102536` (homepage ink) | `#e4cfa6` (btn-sand dark stop) | **10.28:1** | AAA | CTA label, worst stop |
| `#102536` | `#f8ecd3` (btn-sand light stop) | **13.38:1** | AAA | CTA label, best stop |

**Hard rules from the table:** body-size `--ink-soft` never sits on anything darker than
`--wall-shade`; body-size `--copper-ink` never sits on anything darker than `--linen`; `--copper`
(the material hex) is never used as text at any size (2.15:1 on `--wall`).

### 3.4 Usage rules

- Every color in the page CSS must be one of the tokens above or an `rgba()` of one. No raw hex
  outside the `:root` block, with exactly one named exemption: the verbatim `.btn-sand` block
  (§7.7), which ships byte-identical to `index.html` and is audited by diff against the homepage,
  not by token audit (checkable — §9 rule 8). Reason: the design guide's documented drift problem
  (unused tokens, duplicated literals) does not get to happen twice.
- The warm tokens paint areas; the cool tokens paint objects. No cool-toned fills in 2D UI, ever —
  the machine is the only cool thing on the page, which is what makes it the focal point.
- Accent budget: `--copper-ink` and `--gold` appear in 2D UI only as ≤2px lines/dots and the loader
  fill. Any accent area larger than that must be *in the render*, where a light source explains it.
- No pure `#000`/`#fff` anywhere, including render output — highlight clamp is `--linen`-adjacent
  `#fff8ec` (§6), shadow floor is `#1b1a19`.

### 3.5 The warm-room / cool-machine contrast engine

The palette has exactly one job: make an aluminum machine unmistakably the subject of a beige room.
Warm hues (linen → oak) carry ~90% of the frame's area and 0% of its saturation contrast; cool hues
(aluminum, PCB, solder) occupy the small center of the frame. The eye resolves this instantly —
small-cool-on-large-warm — with no vignettes, no blur, no darkened corners needed. Copper and gold
are the hinge: warm colors that live *inside* the cool machine, so every teardown beat that exposes
them (Heat Pipes, Memory contacts) visually "warms up" the machine's interior — the deeper you go,
the more the machine belongs to the room. That is the palette telling the story: what looks cold
and sealed is warm inside once someone opens it for you.

## 4. Typography

### 4.1 Families and loading

Distillery Display + Playfair Display only (D-004), self-hosted from `/fonts/`, `font-display:swap`,
declared exactly as `index.html` declares them. Repo inventory, verified against
`/fonts/playfair-display/` on 2026-07-01: Distillery ships one Regular file declared with a
`100 900` weight range; Playfair ships **static upright weights 400–900 (six latin files) and
italics 400–700 (four latin files)** — there are no 800/900 italics in the repo. All Distillery
usage is declared `font-weight:600` — not because the single-master face renders differently, but
so the Playfair fallback in the stack (`'Distillery Display','Playfair Display',serif`) holds a
matching visual weight if Distillery is slow or missing. Same reasoning as the homepage; keep it
identical.

### 4.2 Planning for a caps-only face

Distillery maps lowercase to capital glyphs. Rules that follow from that:

- **Markup is written in sentence case**, with `text-transform:uppercase` on every Distillery
  element. Visual result is identical, but copied text, search indexing, and screen-reader
  pronunciation get real sentences instead of shouting caps.
- **Distillery lines are ≤ 6 words.** All-caps kills reading speed; the face is for lines you take
  in as a shape, not paragraphs. Anything longer is Playfair by rule. (Every Distillery string in
  §8.2 — title, `h2` headings, both closing lines — is ≤ 6 words; checked.)
- **Glyph-coverage check is a build gate:** every character used in Distillery-set copy (A–Z,
  digits, period, comma, apostrophe) must render from the face itself. A missing glyph falls back to
  Playfair mid-line — a ransom-note artifact — so the copy deck avoids exotic punctuation in
  Distillery lines, and §9 rule 13 makes the check explicit.

### 4.3 Type scale

Fluid `clamp(min, preferred, max)`; min = 360px viewport, max = 1440px. Coherent with the site
scale (design-guide 2026-06-20) but the top end is tuned down versus the homepage hero — this
page's title shares the frame with a rendered object, sitting top-center above it (§5.2), and
must never crowd it.

| Role | Family · weight | Size | Line-height | Letter-spacing | Color | Notes |
|---|---|---|---|---|---|---|
| Opening title (`h1`) | Distillery 600 | `clamp(2.4rem, 4.8vw, 4.4rem)` | 1.0 | `.015em` | `--ink` | one word (§8); the 11-glyph caps wordmark measures ≈6.55em with tracking — ≈461px at the 4.4rem max ≈ 32vw at the 1440 reference, inside the word column's 33vw title measure (§5.2), so the title never wraps and never reaches the machine's 43vw silhouette edge; caps faces need slight positive tracking at display size, unlike the homepage's mixed-case −.01em |
| Opening subline | Playfair 500 | `clamp(1rem, 1.5vw, 1.2rem)` | 1.7 | `.01em` | `--ink-soft` | max-width `min(44ch, 33vw)`, left-aligned under the title in the word column (§5.2); mobile max-width 92vw, centered |
| Beat card sentence (`copy.B1`–`copy.B6`, ×6) | Playfair 500 | `clamp(1.15rem, 1.9vw, 1.5rem)` | 1.55 | `.005em` | `--ink` | max-width 34ch; the workhorse voice of the page |
| Component label (chip) | Playfair 600, uppercase | `0.72rem` fixed | 1.2 | `.14em` | `--ink` | fixed size: labels are tags pinned to the scene, not fluid prose. Playfair, not Distillery, because a display face at 11.5px loses its counters; Playfair 600 caps stays crisp |
| Beat heading (`h2`, static/SR modes) | Distillery 600 | `clamp(1.4rem, 2.6vw, 2rem)` | 1.15 | `.02em` | `--ink` | sentence-case markup, uppercase via CSS; **visually hidden (`.sr-only`) in 3d mode** — the overlay cards show only the sentence (§8.2); in static mode these head the article sections |
| Closing line | Distillery 600 | `clamp(1.7rem, 3.2vw, 2.6rem)` | 1.25 | `.01em` | `--ink` | two short lines (§8), each ≤ 6 words; the only Distillery display moment after the title |
| CTA label | Playfair 500, uppercase | `0.8rem` | 1 | `.18em` | `#102536` | verbatim homepage `.btn` spec — identity, not invention |
| Microtext (scroll cue, loading, sign-off, skip link) | Playfair 500, uppercase | `0.72rem` | 1.4 | `.18em` | `--ink-soft` (skip link: `--ink` on its chip) | one visual voice for all whispers |

No italics on this page. The homepage uses Playfair italic for underwater editorial closers; here
the register is technical calm, and roman-only is one more quiet difference that keeps the page
from feeling like a re-skin.

### 4.4 Text over a 3D scene — readability rules

- **Primary defense is composition, not overlays:** beat text lives in a reserved quiet zone
  (§5.3) that the Animation Director must keep the machine's silhouette out of whenever a sentence
  is at opacity > 0. Text on clean wall at 6.51:1 worst case needs no treatment.
- **Secondary defense — the scrim:** if a camera transition must sweep a part behind live text,
  a `--scrim` ellipse (radial, `--scrim` at center → transparent at 70% radius, sized 1.3× the text
  block) may back the text block. Measured worst case (`--ink` on scrim-over-aluminum blend) is
  10.78:1. The scrim is the only permitted "overlay" on the page and may never be a rectangle —
  soft light pooling, not a card. It has exactly one *scheduled* (non-exceptional) use: backing the
  closing block at the tableau, where the machine deliberately fills the frame (§5.4).
- **No text-shadow anywhere.** The homepage needs glow-shadows against deep water; on a pale wall
  they would read as smudge. Zero is the number.

## 5. Composition and layout

### 5.1 Framing principles (all phases)

- One focal point per viewport: the machine, or a text block — never a fight between two.
- The machine never touches a viewport edge during a held moment (in-transition crops are allowed;
  rest states are not) — cropping a rest state reads as an error, not a choice.
- Global safe area: nothing (text, labels, machine rest states) within 24px of any viewport edge;
  on phones respect `env(safe-area-inset-*)` plus that 24px.
- Negative space is load-bearing: the wall is the page's silence, and every beat needs silence
  around its one sentence. If a layout feels empty, the fix is never to add an element (§9 rule 12);
  the inventory is closed.
- **One word column, one late centering (desktop):** everything written on this page is read in
  one place — the left word column (left edge 7vw), tenanted first by the title block at arrival
  and then by every card from `copy.B1` to `copy.B6` (§5.3) — because a single reading place is
  what lets the visitor stop tracking the UI and watch the machine. The subject holds 62vw from
  `P0` through `P4` (**D-010**; 03 §5.2's subject-center rule); the page's only re-composition is
  the B7 pull-back, where the lateral offset eases to zero and the stack centers at 50vw for the
  tableau. Symmetry is spent exactly once, on the finished diagram — the composition itself tells
  the arc: work in progress sits off-center beside its caption; only the whole, understood machine
  earns the centered frame (§5.4). Stated accurately against 03 §5.2 as published (re-verified this
  pass): subject center is 62vw ± 2vw at `P0`–`P4`, 50vw at `P5`; both documents describe the same
  frames, and D-010 records them.

### 5.2 Arrival

**One frame, ruled (Seam B closed — `decisions.md` D-010).** Rounds 2 and 3 produced two fully
designed arrivals — this document's round-2 62vw frame (which 03 consumed and derived its `P0`
camera from) and round-3's centered 50vw frame (adopted here while 03 simultaneously adopted the
other). **D-010** fixes the **62vw arrival** as the page's first frame; it is carried below, and
the centered variant is **retired on the record** (its full design lives in review-report.md Round
2 and returns only with a superseding entry) — with its round-3 arguments answered rather than
deleted:
(a) *"stillness reads strongest in symmetry"* — true, and the ruling spends symmetry where the
stillness matters most: the page's one centered composition is the B8 tableau (§5.1), so an
off-center arrival does not read as started work; it reads as a documentary frame — subject beside
its caption — which is exactly the page this is. (b) *"a reframe gives the first scroll a
consequence beyond proximity"* — 03's pure dolly does the job better: it changes exactly one
thing, so the first gesture's consequence is legible inside 50px of scroll and perfectly
reversible; a simultaneous re-composition would give the first scroll two consequences and teach
neither cleanly. (c) *"the centered frame is the page's postcard"* — the postcard survives intact:
the arrival and the static article's `R0` are still one identical frame (`R0` is captured at
`p = 0.000`), and no other first-frame image exists anywhere (**D-013** — no poster; §7.6).
(d) *"a centered headline is the homepage's arrival grammar"* — the word column is the stronger
native grammar here: the title arrives exactly where every later card will live, so when
`copy.B0` steps aside and `copy.B1` takes the column, the eye never has to move (§5.3). One
reading place for the whole film, established at frame one.

**Desktop (≥1024px):** the closed machine right of center — subject center 62vw, silhouette ≈38%
of frame width, visual center ≈50vh (03's `P0` look-at is the machine's center; the lateral offset
moves it only horizontally). This is the framing **D-010** records and 03 §5.2's `P0` camera
delivers — distance 4.15W ≈ 1.26 m, elevation +22°, solved for exactly the 38% figure; apparent
size is the camera's, not a CSS width. The title block
is the word column's first tenant: `h1` + subline, left-aligned, left edge 7vw, max-width 33vw,
block vertically centered at 50vh. Worked clearance: at `P0` the silhouette spans 43–81vw — 3vw
clear of the title block's 40vw right boundary; during B1's dolly the growing silhouette reaches
40vw only at `p ≈ 0.022`, where the exiting title (out 0.000–0.040, 03 §3) is already below half
opacity — the machine's approach visibly displaces the last of the words, which is B1's
cause-and-effect made compositional (03 §4-B1: the title "steps aside because the machine is about
to speak"). Scroll cue bottom-center, 5vh above the bottom edge. The frame reads: words (left) →
object (right) → invitation (bottom) — the order the visitor needs them, and the caption grammar
the whole film then speaks. On first scroll the title exits upward (03 §4-B1's ramp) while the
camera dollies from 4.15W to the 2.90W working distance — **a pure dolly, per D-010**: no lateral
reframe, 62vw held throughout.

**Mobile (<768px):** per **D-010**, the portrait refit stands as published — 03 §12 relaxes the
62vw rule to this document's mobile composition (one reading place holds on phones too, it is just
the bottom zone instead of a column). Machine on the upper stage, center 50vw / 40vh, framed by 03
§12's portrait refit (≥10% margins, ≤88vw as a composition ceiling). Title + subline centered in the bottom-zone text block (the same block the
beat cards use, §5.3), subline max-width 92vw — the block's bottom edge sits at
`max(5.4rem, env(safe-area-inset-bottom) + 4.4rem)` at arrival, leaving the row beneath it free so
the scroll cue (bottom-center at `max(2.2rem, env(safe-area-inset-bottom) + 1.2rem)`) can appear
and fade without ever moving the text.

### 5.3 Teardown beats

**Desktop:** the machine's working center sits at 62vw so the left third of the frame is calm wall.
Beat sentences live in the word column: left edge 7vw, width `min(34ch, 26vw)`, block vertically
centered at 50vh, left-aligned (a documentary caption, not a headline — the one place this page
breaks the site's centered habit, on purpose). **Quiet-zone contract for the Animation Director:**
the rectangle x ∈ [4vw, 34vw], y ∈ [30vh, 70vh] stays clear of the machine's silhouette whenever
beat text is visible. Labels follow the joint policy in §7.5: at any `p` exactly **one label is
active** (full treatment) while parts already named keep **settled** tags — so each beat has
exactly one sentence card (left) and one active tag (machine side), with the settled tags reading
as quiet diagram residue, not competing focal points.

**Mobile:** machine occupies the upper stage, center 50vw / 40vh, width ≤ 88vw. Beat sentence is a
centered block in the bottom zone: bottom edge at `max(2.2rem, env(safe-area-inset-bottom) + 1.2rem)`,
max-width `min(92vw, 34ch)`. Mobile quiet-zone contract: the bottom 30vh stays clear of the
silhouette while text is visible. Centered alignment here (unlike desktop) because a left-ragged
column at phone width reads as broken, not editorial.

### 5.4 Ending tableau

**Desktop:** the full exploded stack centered at 50vw/50vh — 03 §9.1's published `P5` framing,
consumed as built: the stack (Chassis 0 → Lid +1.08W in uniform 0.36W ranks) spans ≈86vh of screen
height and ≈44vw of width, ≥14% vertical margin (03's framing check, recomputed on 04's real
dimensions). This supersedes round 2's "fits inside the upper 68vh" — a leftover requirement 03's
camera never delivered, corrected here under the same rule as the arrival (no claims about frames
the camera does not produce). The "everything on the mat" destination (iFixit reference) is a
full-frame diagram, held with all labels at active treatment (§7.5). Because the tableau spans the
frame, the closing block necessarily stands **over** the machine — which is the scrim's designed
job (§4.4, its one scheduled use): a single `--scrim` ellipse backs the block. Measured worst
cases behind it: `--ink` closing line over scrim-on-aluminum 10.78:1 (AAA); `--ink-soft` sign-off
over the same blend 7.54:1 (AAA); the CTA is self-backed (§7.7). Layout: closing line centered,
block starting at 74vh — over the Chassis's lower band, so the part that "asks for no credit"
literally carries the closing words; CTA 2.2rem beneath; sign-off microtext 2.6rem beneath the
CTA. The page ends there.

**Footer ruling (settled in both documents):** there is **no footer block** — the scene container
is the document's last element. 03 §9.3 now states the same (verified: no footer, no post-end
content, browser-native overscroll only). The nav logo is already the persistent way home (a
second home link 50vh below the first is redundancy, not identity), and the sign-off line is the
page's only post-CTA text — at rest the tableau, closing line, CTA, and sign-off are simply the
last thing, exactly as the vision's "offered once, at the end" requires. Recorded as
**`decisions.md` D-014c**.

**Mobile:** the stack framed by 03 §12's refit (≥10% margins, portrait FOV rule); labels alternate
left/right of the stack with 45° leader lines to avoid collisions at narrow width (matching 03
§12's alternating rule); closing block scrim-backed over the lower stack, same order, centered,
CTA full-width capped at 320px.

### 5.5 Safe-area and measure summary

| Value | Desktop | Mobile |
|---|---|---|
| Edge safe area | 24px | 24px + `env(safe-area-inset-*)` |
| Machine footprint | arrival silhouette ≈38% of frame width at 62vw (D-010; 03 `P0`, 4.15W) · teardown ≤55vw wide at 62vw (03 §5.2's quiet-zone bound; delivered 54.6vw) · tableau ≈44vw × ≈86vh at 50vw/50vh (03 §9.1) | arrival/teardown upper stage 50vw/40vh, ≤88vw ceiling (D-010; 03 §12 refit, ≥10% margins) · tableau per §5.4 mobile |
| Word column / beat text measure | one column, left edge 7vw: title block max-width 33vw (arrival, centered at 50vh); cards `min(34ch, 26vw)`, centered at 50vh | title + subline centered in the bottom zone at arrival (subline 92vw); cards `min(92vw, 34ch)`, bottom zone |
| Quiet zone (contract) | x 4–34vw, y 30–70vh | bottom 30vh |
| Label chip max width | 12ch | 12ch |

## 6. Lighting direction

This is the mood specification; the Technical Architect and Asset Director implement it. Every item
is stated in art terms plus one number so implementation and review can agree on what "matches."

- **Key:** one soft daylight source, from the camera's upper right, elevated ~40°, slightly behind
  the subject (three-quarter back-right) — the direction `interior.jpg`'s window streak and plant
  shadows already establish. Warm tint, like late-morning sun through glass: white point toward
  `#fff3dd`, never neutral-studio white. Soft because the source is large (window, not spotlight):
  shadow edges spread visibly — penumbra on the chassis contact shadow roughly 8–12% of the
  laptop's width.
- **Fill:** the room itself. Warm bounce from the beige walls and floor, key-to-fill ratio about
  4:1 (two stops). Shadows must stay readable and warm — a shadow that goes black says "void,"
  and this page's whole argument is that nothing inside is a void.
- **Shadows tell the depth order.** During the teardown, each lifted layer casts a soft, offset
  shadow onto the layer below it; the shadow stack is how a non-technical eye reads "this part came
  from above that part." Contact shadow under the Chassis: tight, warm gray (`#8d7f70` region at
  ~35% strength), grounding the machine to an invisible floor plane. No part ever floats
  shadowless — shadowless floating is the first tell of a pasted render.
- **Environment reflection:** the aluminum reflects a *warm room with one bright vertical window
  streak* — never a black-and-white studio HDRI (that instantly reads product-catalog and cools the
  metal to blue). The Lid's reflection is the single most identity-carrying pixel region on the
  page: it must look like it is reflecting *this* room.
- **Material read:** aluminum = broad soft speculars, visible brushed anisotropy at close range;
  PCB = matte, near-zero reflection, its interest is silkscreen and solder detail, not shine;
  copper Heat Pipes = the only strong warm glint in the scene — its highlight is the page's one
  permitted piece of jewelry; `--gold` contacts read as small warm sparks at Memory (RAM) range.
- **Exposure clamps:** highlights never exceed `#fff8ec` (the sampled seam), shadows never crush
  below `#1b1a19`. The "no pure black / no pure white" rule is enforced in the render, not just CSS.
- **What the environment must feel like:** unoccupied, mid-morning, slightly domestic. Not a lab,
  not a void, not a showroom. If a frame could be mistaken for an Apple product void, the fill is
  too low and the wall too far — bring the room back.

## 7. UI design

### 7.1 The closed inventory (every element and its story sentence — vision §9 test)

| # | Element | Story sentence |
|---|---|---|
| 1 | Stage backdrop (§7.1a) | "The room's wall — the machine has to sit somewhere real." |
| 2 | Nav logo (masked, `--ink`) | "This is still WebSharke — and here's your way back." |
| 3 | Scroll cue | "You're the one holding the screwdriver — start whenever." |
| 4 | Opening title + subline (`copy.B0`) | "Here's what you're about to be shown, in one breath." |
| 5 | Beat cards (`copy.B1`–`copy.B6`, ×6) | "This is what's in front of you, in plain words." |
| 6 | Component labels (×9 — BATTERY active per D-015) | "Everything inside has an honest name." |
| 7 | Closing line | "You just watched the promise from the homepage happen." |
| 8 | CTA (`.btn-sand`) | "The one thing to do next, offered once." |
| 9 | Sign-off microtext | "A quiet signature, same as the homepage's baked-in copyright." |
| 10 | Loading screen | "The room was here before you arrived." |
| 11 | Skip link (focus-revealed) | "A keyboard visitor gets to the point as fast as a scroll wheel does." |
| 12 | `file://` guard block (developer-only; unreachable in production) | "A developer opening the file from disk is told exactly what to do instead." |

Anything on screen that is not on this list fails review (§9 rule 12). `ui.progress` is
deliberately absent (§7.4); the nav Sign In and the footer block are deliberately absent
(§2.2, §5.4). The **slow-network status line**, an element of this list through round 2, is
**retired**: 02 §7.2 as published converts a stalled load directly to the static experience
(no progress event for 8 s, or scene-ready absent 20 s after asset fetch starts), so no
intermediate "slow but still coming" state exists to caption — an element whose trigger cannot
occur is clutter in a closed inventory (§7.6 carries the same retirement on the loader side).

### 7.1a The stage backdrop (exact spec)

02 §3.1 renders the canvas transparent and requires the room behind it to be CSS. The backdrop is:

- `#stage { background: var(--wall-grad); }` — the `:root`-defined
  `linear-gradient(180deg, var(--wall-lit) 0%, var(--wall) 62%, var(--wall-shade) 100%)` (§3.2),
  fixed and full-viewport for the page's life (02 §6.3's `#stage` is `position:fixed; inset:0`).
- **Physical cause:** the wall falling from the high window's light into the shadow near the floor —
  the same value structure `interior.jpg` shows top-to-bottom. A gradient with a light source,
  therefore permitted; it is registered in the §9.1 census.
- **Flat vs gradient, decided:** gradient. A flat `--wall` fill would make the 3D scene's lit/shade
  read float free of its background (the render's own values fall top-to-bottom; the wall behind
  must agree or the room splits in two).
- **One definition, two uses:** the loader (§7.6) uses the same `var(--wall-grad)`, which is what
  makes the loader-to-scene handoff read as the room having been there all along — the background
  literally never changes.
- **Text consequence, measured:** the quiet zone (y 30–70vh) spans blends between `--wall-lit` and
  ~21% past `--wall` toward `--wall-shade` — everywhere lighter than `--wall-shade`, so every §3.3
  pairing holds at or above its stated worst case. The closing block's values are in §5.4.
- No image, no noise, no texture overlay — the backdrop is two color stops of the sampled wall and
  nothing else. Detail belongs to the render, where light explains it.

### 7.2 Nav

Fixed, top-left, logo only. CSS-masked `Main-Logo.png` at 150×84px desktop / 120×67px mobile —
smaller than the homepage's 210×118 because this page's nav should whisper. Tint `--ink`; hover
`translateY(-1px)` over 350ms (homepage behavior; hover states are instantaneous input feedback,
clock-exempt by 03 §8's own exemption class). The nav never hides, dims, or transforms during
the teardown: hiding navigation for atmosphere is award-bait (references §5, what-not-to-copy), and
the logo is the page's only exit. No background, no border — the wall is the nav's surface.

### 7.3 Scroll cue

The word "Scroll" (microtext style, `--ink-soft`) above a 1px × 34px vertical hairline in
`rgba(70,60,51,.55)`, bottom-center. It exists because the vision demands the visitor never wonder
what to do, and one dry word is the entire instruction. **When it appears is the Animation
Director's timing:** 03's idle-delay trigger (2400ms after loader hand-off desktop, 1800ms mobile,
only if no scroll input has occurred) is adopted as the joint spec — a visitor who scrolls
immediately never sees the cue at all, which is the cue at its best. The visual and its exit are
mine: it fades in and out over 300ms (a clock is legitimate here — the cue is idle-time UI, 03 §8
exemption 2), **no pulse ever**, and once dismissed by first scroll input it never returns — an
instruction repeated becomes nagging. No bouncing arrow, no mouse icon: the cue is typography,
like everything else here.

### 7.4 Progress indication — decision: none

The state of disassembly **is** the progress indicator. Eight parts, taken off in a known order,
ending in a tableau the opening subline promises ("layer by layer") — the visitor always knows
where they are because the machine shows them, more honestly than a bar could. A progress bar would
also be the page's first app-chrome element, breaking the "scene is the interface" rule (vision
§7). Native scrollbars remain untouched (no scrollbar hiding — that's a cliché and an accessibility
harm). This ruling is recorded as **`decisions.md` D-014d**, and 03 §7.6 consumes it as published:
no slot exists (D-009's table confirms no `ui.progress`), and 03 pre-priced the contingency's
timing (in 0.010–0.020, out 0.973–0.988) to be built only on a future superseding entry.

**Designed contingency (build only if a future review or testing demands it):** a 2px hairline
fixed at the viewport bottom, track transparent, fill `--copper-ink` (3.5:1 on `--wall`, passes
non-text AA) growing left→right with raw scroll progress. No percentage counter in any variant —
counters are a preloader-era Awwwards tic.

### 7.5 Component labels

A label is a **paper tag pinned to the scene**, not a floating UI card. Two treatments, one policy.

**Active treatment** (the most recently entered label):

- Chip: background `rgba(242,232,218,.92)` (`--linen`), border 1px `rgba(43,35,32,.30)`, radius
  3px (a tag, not a pill), padding `.34rem .6rem`, max-width 12ch. Text per §4.3 label spec —
  measured 12.71:1 on its own chip; even if a chip momentarily overlaps aluminum, `--ink` on
  `--alu` is 6.79:1. The chip itself is decorative backing; the information is the text, which
  carries the contrast.
- Leader line: 1px solid `rgba(43,35,32,.55)`, 28–64px long, straight, horizontal or exactly 45° —
  technical-illustration convention, never curved — with a 3px `--ink` dot at the part end. At the
  ending tableau the dot switches to `--oak`, the page's only decorative warmth, ≤3px.

**Settled treatment** (every part named earlier): same geometry and text, quieter paper — chip
background `rgba(242,232,218,.55)`, border `rgba(43,35,32,.18)`, leader `rgba(43,35,32,.28)`, dot
2px at `rgba(43,35,32,.50)`. The text stays full-strength `--ink`: measured **10.39:1** over the
settled chip on `--wall` and **9.76:1** worst case over aluminum — the name never degrades, only
the decoration recedes. That is the honest version of de-emphasis: words don't fade, paper does.

**Transitions — scroll-progress ramps, no clocks.** A label appears as opacity 0→1 with a 6px
rise; a label demotes (active→settled) as a crossfade between the two treatments. Both are ramps
over scroll-progress windows whose widths and in-points are the Animation Director's (03 §7.3–7.4
— its house ramp is 0.015 progress; labels use the same ramp grammar, `TXT-IN`-shaped). The visual
grammar (fade + 6px rise, the two treatments) is mine; the only clock on a scene-anchored element
is the scrollbar. (This replaces round 0's 220ms figure, which was unimplementable on a scrub-pure
timeline.)

**Joint visibility policy** — one policy for both documents, recorded as **`decisions.md`
D-014a**: *labels persist and accumulate through the teardown
exactly as 03's lifecycle schedules them (named on arrival, held to the B7 group exit, re-entering
at B8 as the finished diagram). At any `p`, exactly one label — the most recently entered — carries
the active treatment; every earlier label carries the settled treatment; the demotion ramp runs as
the next label enters. At the B8 tableau re-entry, all labels enter at the active treatment: the
finished diagram is the one moment that has earned full emphasis everywhere.* Why both halves:
03's accumulation builds the diagram the ending pays off; the active/settled hierarchy preserves
one focal point per beat (vision §7) without deleting names the visitor has already earned — and it
resolves the review's B6 worry (seven full-strength chips during the quietest camera move) without
touching 03's timing. Checked against 03 §3 as published: B3's staggered pair (`label.fan` in at
0.238, `label.pipes` at 0.250) yields fan active, then settled the moment pipes enters — never two
active labels; no retiming required. Status against 03, re-verified this pass: **03 §7.4 carries
this joint policy verbatim** — it names this section the spec of record, layers the active/settled
hierarchy onto its persist-and-accumulate schedule, quotes the B8 all-active re-entry in this
document's words, and states that no retiming is required and none is scheduled. The two documents
publish one policy, and D-014a is its entry of record.

Label text is the canon name verbatim, uppercase via CSS: LID · COOLING FAN · HEAT PIPES ·
STORAGE (SSD) · MEMORY (RAM) · SUPPORT BOARDS · MAINBOARD · CHASSIS · BATTERY. No adjectives,
ever. BATTERY is **active, not reserve**, per **D-015** (seated, label-only): `label.battery`
enters alongside `label.chassis` at 0.797 — two parts that never leave, named together — and joins
the B8 diagram and the fallback-still captions. Nine labels, 14 label words, no copy card added.

### 7.6 Loading experience

The loader is designed as **the empty room before the machine is ready** — a continuity cut, not a
curtain:

- Instant first paint from inline CSS (zero asset dependency): full-viewport `var(--wall-grad)` —
  **the same single gradient definition as the stage backdrop (§7.1a)**, so the loader's room and
  the scene's room are pixel-identical by construction.
- Centered: `Main-Logo.png` masked in `--ink` at `min(340px, 56vw)` wide; 2rem below it a 140px ×
  2px progress hairline (track `rgba(43,35,32,.14)`, fill `--copper-ink` left→right, driven by
  **real** asset-loader progress from 02's LoadingManager — a fake-timed bar on an engineering page
  would be a small lie); 1rem below that, microtext "Preparing the machine" in `--ink-soft`
  (5.57:1 on `--wall`). No percentage counter, no spinner, no ellipsis.
- Handoff (the loader is clock-exempt UI — 03 §8 exemption 1 adopts these numbers): fill reaches
  100% → hold 150ms → wordmark + hairline + microtext fade 400ms ease-out → the loader layer
  crossfades out over 600ms. Because its background is the same `--wall-grad` the stage already
  shows, that final crossfade is invisible by construction — the room never changes; the machine
  simply exists in it.
- **Implemented by 02 §7.2 (one loader across documents):** the Technical Architect implements
  this section as written — inline-CSS first paint, byte-weighted real progress across its
  13-entry asset manifest, the 150/400/600 handoff, a warm-up frame synced to the live scroll
  position before the crossfade, scroll never locked. **No poster exists anywhere on the page —
  recorded as `decisions.md` D-013:** 02 §7.2 declines any pre-scene first-frame image (its stated
  reason — two first-frames would be two designs — is right, and 04 §9.3 deleted its poster
  designation to match), and 02's QA-1 forbids fallback-still requests in 3d mode. The loader's
  wall *is* the pre-scene frame; the continuity cut needs nothing else.
- If loading stalls (02's delegated numbers: no progress event for 8 s, or scene-ready absent
  20 s after asset fetch starts), the page falls forward into the static experience (§7.8), in
  place — the fallback is the recovery, so there is no error state and no intermediate "slow"
  state to design. The slow-network status line of earlier rounds is retired with that rule (§7.1):
  until the stall threshold the honest hairline is the status, and past it the visitor gets the
  designed static page, not a caption about lateness.

### 7.7 Ending CTA

Reuse `.btn-sand` **verbatim** from `index.html`: pill radius 100px, padding `1.05rem 2.9rem`,
gradient `linear-gradient(135deg,#f8ecd3,#e4cfa6)`, label `#102536`, inset top highlight
`0 1px 0 rgba(255,255,255,.65)`, layered drop shadows, hover `translateY(-3px)` over 400ms
`cubic-bezier(.16,1,.3,1)` (hover = input feedback, clock-exempt). Reasons: it is the site's single
canonical CTA (design-guide component law: "don't invent new button fills"); its label contrast is
10.28:1 at the worst gradient stop; and narratively it is the beach arriving in the studio (§2.4).
Its fill-to-ground separation on the shaded wall is carried by the layered shadow and the pill
silhouette rather than fill contrast, which is exactly how it already works over the homepage's
sand — identical physics, identical read. Focus state for keyboard users: `outline: 2px solid
var(--ink); outline-offset: 3px` — `--ink` measures ≥6.51:1 against every §7.1a surface the button
can sit on and 10.1:1 against the button's own fill. Label: "Start a Project" → `/onboarding`
(site canon).

### 7.8 Reduced-motion, no-WebGL, no-JS — one designed fallback, three triggers

One static experience serves all three conditions (`prefers-reduced-motion: reduce`, WebGL
unavailable, JS disabled), because three separate degraded designs would triple review surface for
zero visitor benefit. It is a designed longform article, not an apology:

- Same palette, type scale, nav, CTA, copy — every rule in this document applies. The `--wall-grad`
  backdrop runs the article's full height.
- **Five still renders — 03 §11's `R0`–`R4`, the single cross-document count**, recorded as
  **`decisions.md` D-014b**; all four documents state five. The Asset Director produces them at 03
  §11's exact timeline addresses — `p` = 0.000 /
  0.160 / 0.633 / 0.743 / 1.000 (04 §9.1/§9.2/§10.7 capture at exactly these addresses — adopted
  and verified in the round-3 review; 03's are the addresses of record, and they survive 03's
  retimed opening because only 0.000–0.160's interior moved).
- **Article structure** (one source of markup in every mode, per 02 §10.2 — seven sections, each
  headed by its §8.2 `h2`; stills placed where the story has reached their state, pairings per 03
  §11 as published): `R0` in the opening section, pairing `copy.B0` + `copy.B1` (03 §11 — the
  page's one sentence about itself lives beside the closed machine it describes) · `R1` in the Lid
  section (`copy.B2`) · `R2` closing the Support boards section, after `copy.B3`–`copy.B5` (its
  state shows the whole components plane lifted) · `R3` in the Mainboard and chassis section
  (`copy.B6`) · `R4` in the ending section (closing line + CTA + sign-off). The two sections
  without a dedicated still (Cooling fan and heat pipes; Storage and memory) simply carry no
  image — text needs no placeholder.
- Labels/captions on the stills are live HTML (03 §11's rule), positioned by percentage anchors the
  Asset Director delivers with each render — not baked into pixels, so they stay sharp,
  translatable, and screen-readable. Caption inventory, fixed here because it is counted in §8.3:
  each still captions the parts its state newly shows — `R1` LID; `R2` the five component-plane
  names; `R3` MAINBOARD, CHASSIS; `R4` the full canon list as the finished-diagram caption
  (BATTERY included per D-015 — the full list is nine names, 14 words).
- No autoplaying anything; `.rv`-style entrance reveals are also disabled under reduced-motion,
  exactly as the homepage does it (03 §11 permits ≤300ms opacity on scroll-into-view; instant is
  the default and matches the site).
- Alt text per §8.4. Screen-reader order: title → subline → the six cards in beat order
  (`copy.B1` first) → closing → CTA.

### 7.9 Keyboard and focus visuals

Persistent focusable elements are exactly three, in tab order: **skip link → nav logo → ending
CTA** (matching 02 §10.5; `autoAlpha` keeps invisible beats out of the tab order). The skip link is
visually hidden until focused; on focus it renders as a §7.5-style active chip fixed below the nav
(top-left), text per §8.2 — the page's own paper-tag grammar, not a browser-default block. All
focusables get `outline: 2px solid var(--ink); outline-offset: 3px` (7.98:1 on `--wall`). Scrolling
is native; no key hijacking.

## 8. Copy deck

### 8.1 Voice rules (binding on any future edit)

Plain, specific, honest, a little dry (D-006). Short declaratives. No exclamation marks, no
ellipses, no emoji, no rhetorical questions. No invented statistics. Banned-word list is law. The
sentences describe **what is on screen right now** — a sentence that could run under any other
beat's visual is too generic and gets rewritten.

### 8.2 The deck — the joint slot→wording table (the 01↔03 interface of record)

One table. **Slot IDs and windows are the Animation Director's**, transcribed from 03 §7.1/§3 as
published (each window verified against 03 §3's timeline); **wording and word counts are this
document's** — the six teardown sentences are the merged deck this document issued in round 2,
which 03 §7.1 quotes verbatim. **The ruling and its history, recorded once:** round 1 left an
either/or (03 adds slots, or 01 merges sentences); rounds 2 and 3 each took one branch from
opposite sides, swapping positions twice. **`decisions.md` D-009** ends it: **the joint deck is
the six-merged-card structure carrying this document's wording — the table below, cell-identical
with D-009's table of record and with 03 §7.1**. The round-3 eight-card deck is withdrawn; its standalone
sentences are retired except the two that survive verbatim inside the merged deck (`copy.B2` is
the lid sentence, `copy.B5` the support-boards sentence). The merges are motion-shaped, not
compromises: B3 and B4 each carry two parts in one sentence because 03's motion carries them as
one lift (the screwed-together thermal module) and one family (the staggered pair), and the
Chassis line is re-homed into `copy.B6` — a better address than a slot of its own, since its
subject never moves and belongs inside the sentence about the part that lifts away from it.

| Slot | Wording | Words | Window (in / full / out), per 03 §3 |
|---|---|---|---|
| `copy.B0` | title "Engineering" (renders ENGINEERING, Distillery) + subline "A laptop is a complicated thing. It comes apart layer by layer." (Playfair) | 1 + 12 | visible at rest; exits 0.000–0.040 |
| `copy.B1` | That was you. This page only moves when you do. | 10 | 0.040–0.055 / 0.055–0.105 / 0.105–0.120 |
| `copy.B2` | The lid comes off first. It always does. | 8 | 0.124–0.139 / 0.139–0.189 / 0.189–0.204 |
| `copy.B3` | The cooling fan and the copper heat pipes. They carry heat away. | 12 | 0.238–0.253 / 0.253–0.308 / 0.308–0.323 |
| `copy.B4` | Storage and memory. Everything you keep, and everything it's thinking about. | 11 | 0.421–0.436 / 0.436–0.491 / 0.491–0.506 |
| `copy.B5` | Support boards. Power, ports, and signals — small jobs, handled separately. | 10 | 0.612–0.627 / 0.627–0.677 / 0.677–0.692 |
| `copy.B6` | The mainboard lifts away. The chassis stays, and asks for no credit. | 12 | 0.717–0.732 / 0.732–0.862 / 0.862–0.877 |
| `copy.close` | Websites are complicated. / You've seen how we treat complicated. — Distillery, two lines (3 + 6 words, both inside §4.2's ≤6-word caps rule); adopted per **D-017**, owner sign-off pending before implementation | 9 | in 0.973–0.986; persists at 1.000 |
| `copy.cta` | Start a Project (`.btn-sand` §7.7 → `/onboarding`) | 3 | in 0.988–0.998; clickable ≥ 0.992 |
| `copy.signoff` | © 2026 WebSharke (microtext) | 3 | in 0.992–1.000; persists |
| `label.*` ×9 | canon names verbatim (§7.5 list — BATTERY active per D-015; chip and treatment spec §7.5) | 14 total | in-points per 03 §3 (`label.battery` alongside `label.chassis` at 0.797 — D-015); visual grammar this document's |
| `cue.scroll` | Scroll (microtext; visual §7.3) | 1 | clock-based — 03 §8's trigger |

**Status, verified cell-by-cell (2026-07-01, this pass):** every wording string and word count
above is identical with **D-009's table of record**, and every slot ID and window is identical
with 03 §7.1/§3 as published (re-read this pass); the `label.*` and `cue.scroll` rows match; 03
§7.2's reading-floor formula, re-run against exactly these word counts, passes every card
(verified there: floors 0.050 / 0.050 / 0.055 / 0.055 / 0.050 / 0.055 against delivered 0.050 /
0.050 / 0.055 / 0.055 / 0.050 / 0.130). No 03 revision is required for any cell of this table to
be true — the mirror claim rounds 1–3 could not honestly make is now a checkable fact. D-009's
standing rule remains in force: if this document ever edits a sentence, a superseding entry
records it, 03's quoted column updates, and the floor formula re-runs.

**`copy.B1` — ruled: the slot ships (D-009).** This document's round-3 ruling ("the slot does not
exist") is withdrawn per D-009, and the words owner argues the restored slot from the
real deck rather than merely conceding it. The wordless-B1 position held that B1's reversibility
lesson is taught by `copy.B0` visibly walking back in on reverse scroll — that stands, and the
card does not narrate that lesson. What the card states is the one thing no gesture can: the
contract itself — *this page only moves when you do* — the page's only sentence about the page,
read over H1's dead-still frame so the frame proves the sentence while it is being read (03
§4-B1's staging: the gesture first, the sentence after, never the sentence instead of the
gesture). It is also the one claim a visitor can test instantly, by stopping. Every card after it
is about the machine.

**Structure and system states** (every state the other documents require now has wording):

| Slot | Copy | Notes |
|---|---|---|
| `<title>` | WebSharke — Engineering | |
| Beat `h2` headings (02 §10.2; visible in static mode, `.sr-only` in 3d — §4.3) | The machine · Lid · Cooling fan and heat pipes · Storage and memory · Support boards · Mainboard and chassis · The whole machine | seven sections; "The machine" heads the opening section (title, subline, `R0`) and "The whole machine" heads the ending — the bookend is deliberate |
| Skip link (02 §10.5; targets `#ending`) | Skip to the end | 4 words; visually hidden until focused (§7.9) |
| Loading microtext | Preparing the machine | the loader's only words until handoff or the stall fallback (§7.6) |
| `file://` guard block (02 §11.3) | This page runs from a web server, not from a file. From the project root, start any static server (for example, vercel dev), then open /engineering. | developer-only; unreachable on the deployed site — excluded from the word budget with that reason |

**Slots ruled out** (absence is a decision, not an omission): `ui.progress` (**D-014d**, and no
such slot exists in D-009's table; §7.4, 03 §7.6 concurs), the nav Sign In (§2.2; 03 §4-B0
concurs, re-verified this pass), the footer block (**D-014c**; §5.4, 03 §9.3 concurs), and
the slow-network status line (retired — §7.1, §7.6: 02 §7.2's stall rule converts straight
to static, leaving the line no trigger; its wording "Slow connection. Still loading." is withdrawn
unused). No wording exists for them because they do not exist.

**Battery — ruled (D-015):** 04's inventory ships a non-separating `chassis_battery`, and 03
pre-priced both variants. **D-015 activates the seated variant:** label **BATTERY** only, entering
alongside `label.chassis` at 0.797 — no card; it is counted in the deck above and in §8.3. The
**lifted variant is declined** by the same entry and stays staged as reserve copy: label BATTERY
plus card "The battery. One job, and it takes the most room." (10 words, under 03 §7.2's 14-word
cap; its window would be a 03 re-issue, priced there). It returns only with a superseding entry.

### 8.3 Word budget

Recounted against the final deck (D-009) with D-015's battery label active, per mode — the two
modes render different word sets, so one shared number would be either false or padded:

| Block | 3d mode | Static mode |
|---|---|---|
| Title 1 + subline 12 | 13 | 13 |
| Scroll cue | 1 | — (03 §11: the article carries no cue) |
| Cards ×6 (`copy.B1`–`copy.B6`: 10+8+12+11+10+12) | 63 | 63 |
| Labels (9 canon names — D-015) / still captions (`R1` 1 + `R2` 10 + `R3` 2 + `R4` 14 — §7.8, BATTERY in the `R4` list per D-015) | 14 | 27 |
| Beat `h2` headings ×7 | — (`.sr-only`) | 19 |
| Closing 9 + CTA 3 + sign-off 3 | 15 | 15 |
| Skip link 4 · loading 3 | 7 | 4 (skip link only) |
| **Total** | **113** | **141** |

Hard budgets, counted on the rendered page: **≤ 115 in 3d mode, ≤ 145 in static mode** — both
totals hold with D-015's label folded in. The static number is honestly larger for two stated
costs of a self-contained article: seven visible headings, and part names re-printed as still
captions. If a superseding entry ever activates D-015's **declined** lifted-battery variant, that
entry raises the caps to **≤ 125 / ≤ 155** (measured worst cases 123 / 152: +10 card in 3d; +10
card +1 further caption in static, on the 113/141 base). The `file://` guard is excluded
(developer-only, unreachable in production); alt text is not visible and is not counted. Any build
exceeding its mode's cap fails review. The restraint stays checkable: across ~10,800px of scroll
the visitor reads 106 steady words — the homepage hero makes its promise in nine, and this page
must feel like the same author.

### 8.4 Alt and fallback text direction

One alt per still, in the placement §7.8 assigns, at 03 §11's published addresses. Alt text states
what a sighted visitor learns, in the same voice — no "image of," no apology. The live 3D canvas
is inside `#stage`, which is `aria-hidden="true"` (02 §10.3); the story is carried for assistive
tech by the real text in DOM order (§7.8), never by describing the animation. The stills load only
in the static modes — no fallback image is requested in 3d mode (02's QA-1), because no poster
exists (**D-013**; §7.6).

| Still (03 §11 state) | Alt text |
|---|---|
| `R0` (`p` 0.000 — closed, `P0`) | A thin silver laptop, closed, in a warm beige studio. |
| `R1` (`p` 0.160 — Lid lifted, `P1`) | The laptop's lid lifted straight up off the body, hanging above it. |
| `R2` (`p` 0.633 — components lifted, `P3`) | Seen from above, the cooling fan, heat pipes, storage, memory, and support boards all raised off the mainboard, the lid hanging higher still. |
| `R3` (`p` 0.743 — Mainboard lifted, `P4`) | The mainboard lifted a short way off the chassis, a clean gap between them. |
| `R4` (`p` 1.000 — full tableau, `P5`) | The whole laptop taken apart in mid-air: lid, cooling fan, heat pipes, storage, memory, support boards, mainboard, and chassis, each above its place. |

### 8.5 Copy dependencies (interface notes)

1. `copy.B2` assumes the Lid is the **first** teardown beat; `copy.B6` assumes the Mainboard is
   the **last** lift and that the Chassis never moves (03 §6.1 enforces the latter literally).
   Reference art and iFixit order both support this. If 03 reorders either end, those cards must
   be revised with me.
2. `copy.B3` says "copper" — settled by **D-016**: the flagged deviation from the reference
   render's dark/taped pipe is approved, 04 §4 builds raw copper, and the sentence stands. The
   staged fallback card for a non-copper pipe — "The cooling fan and the flat heat pipes. They
   carry heat away." (12 words, count-identical, so 03's floor table would have been untouched) —
   is **retired, superseded by D-016**; it is left on this record deliberately and would return
   only with a superseding entry that changes the material.
3. The subline promises "layer by layer." The constraint this places on 03 — replacing the
   withdrawn round-0 rule that no beat may detach two components simultaneously, which 03's B3/B4
   could not satisfy — is: **the teardown proceeds in layer order** (Lid → components plane →
   Mainboard; Chassis stays), a rigid assembly counts as one piece, and members within a layer may
   stagger per 03 §6.2. Verified against 03 §3 as written: B2 is the Lid layer, B3–B5 all lift
   from the components plane, B6 is the Mainboard, the Chassis never moves — the storyboard already
   satisfies the promise with no retiming.

## 9. Anti-AI-slop rules

Each rule is testable against the final build. A failure of any rule is a review rejection.

1. **Gradient census:** exactly **three gradient definitions** may exist in the page CSS —
   `.btn-sand`'s fill (physical cause: the homepage's sand chip), `--wall-grad` (one `:root`
   definition used twice, loader background and stage backdrop; physical cause: the lit wall
   falling to shadow toward the floor, §7.1a), and the scrim ellipse (pooled light). Grep: exactly
   three occurrences of `gradient(` in the shipped CSS; any fourth fails.
2. **No text-shadow, no `backdrop-filter`, no glassmorphism** anywhere on this page (grep-checkable).
3. **No numbered eyebrows or kicker labels** ("01/02", "CHAPTER", etc.) — owner-rejected pattern
   (D-006).
4. **Labels are canon names verbatim**, zero adjectives, zero marketing names (grep the 9 strings
   — BATTERY active per D-015).
5. **Visible word count within §8.3's mode caps — ≤ 115 in 3d mode, ≤ 145 in static mode** (125 /
   155 only if a superseding entry activates D-015's declined lifted-battery card), counted on the
   rendered page; the `file://` guard is excluded (developer-only, unreachable in production).
6. **Banned-word grep is zero-hit** on the shipped HTML for every word on the design guide's
   banned list (see `docs/design-guide.md`, "AI-looking patterns to avoid" — seven words, quoted
   there and in D-006) — plus no exclamation marks in any visible string.
7. **No emoji, no icon fonts, no decorative SVG icons.** The page's only graphics are the machine,
   the logo, and 1px lines.
8. **Color lockdown:** every color literal in CSS resolves to a §3.2 token or an `rgba()` of one;
   raw hex outside `:root` fails — with one named exemption, the verbatim `.btn-sand` block, which
   must diff byte-identical against `index.html` (§7.7). Render output honors the exposure clamps
   (§6): no pixel at `#000000` or `#ffffff` in delivered frames/stills.
9. **Light audit:** every shadow and reflection in any held frame agrees with the single upper-right
   key. A screenshot with contradictory shadow directions fails.
10. **No particle systems, dust motes, lens flares, vignettes, film grain, or god-rays** in the 3D
    scene or CSS. The homepage's underwater motes belong underwater.
11. **No scroll hijacking:** native scroll position maps to scene state deterministically; the page
    never scrolls itself, never snaps against the visitor's direction, never hides the scrollbar.
12. **Closed inventory:** every on-screen element appears in §7.1 with its story sentence. New
    elements require a PM decision, not a build-time improvisation.
13. **Type audit:** computed `font-family` on every rendered node resolves to Distillery Display or
    Playfair Display (system fallback chains aside); every glyph in Distillery-set copy renders
    from Distillery (no mid-line fallback swaps).
14. **The template-shape test:** the page must not be reducible to hero / cards / CTA. If the 3D
    scene were deleted, what remains must not be a viable generic landing page — the words and
    layout only make sense with the machine present. (Check: read §8.2 against a blank wall — the
    sentences point at things; that is by design.)
15. **No clock on scene-anchored elements:** every transition of a label, card, or part is a
    function of scroll progress (03 §10.1); the only millisecond values on the page belong to 03
    §8's exempt UI class (loader, idle cue, hover/focus feedback). Grep the built CSS/JS for
    durations and check each against that list.

## 10. Mood and reference notes

How each reference shows up here — and where its influence is fenced (per `references.md`):

- **Apple (restraint):** present in the one-idea-per-beat discipline, the deterministic
  scroll-scrub, and the enormous negative space around a single object. Fenced out: the voice (no
  superlatives — our sentences describe, never praise) and the void (our machine lives in a warm
  room with a floor and a window, not floating in white).
- **Framework (honesty):** present in the exploded view *as the argument* and the plain component
  names — STORAGE (SSD) and MEMORY (RAM) are straight from their respect-the-reader naming ethic.
  Fenced out: catalog neutrality (our render is lit and composed like a film frame, not a parts
  listing) and anything commerce-shaped (no specs, no prices).
- **iFixit (order):** present in the disassembly sequence reading as plausible (lid first, chassis
  last, thermal hardware before the board) and in the final laid-out tableau as the destination.
  Fenced out: the workbench documentary kit — no hands, no tools, no step numbers; the machine
  takes itself apart, and the absence of a technician is the quiet magic.
- **Bruno Simon (commitment):** present in the totality — one concept carried through 100% of the
  page, and the input itself (scroll) engineered to feel good the way his driving does. Fenced
  out: free-roam play, toy art direction, and loading-screen tolerance — our loader is designed to
  be left quickly (§7.6), not enjoyed.
- **Awwwards (finish):** present in the places juries look: a designed loading state, designed
  reduced-motion and no-WebGL states, focus states with measured contrast, no jank tolerance.
  Fenced out: the current meta — no marquee text, no cursor followers, no noise overlays, no
  distortion shaders, no smooth-scroll library feel; when jury taste and a small-business owner's
  comprehension conflict, the owner wins.

## 11. Open questions

1. **RESOLVED — the `decisions.md` transcriptions now exist.** Three review rounds named the
   missing entries as the root cause of every re-opened seam; the PM has recorded them, and this
   document cites each by number where the subject is specified:
   (a) **Static-experience still count = five** (`R0`–`R4` at 0.000/0.160/0.633/0.743/1.000) —
   **D-014b** (§7.8).
   (b) **Label policy** (persist-and-accumulate with the active/settled hierarchy) — **D-014a**
   (§7.5; 03 §7.4 carries it verbatim, re-verified this pass).
   (c) **No footer** — **D-014c** (§5.4; 03 §9.3 concurs). No progress bar — **D-014d** (§7.4).
   (d) **The copy-slot table** — **D-009** (§8.2; the six-merged-card structure with this
   document's wording, `copy.B1` shipping; §8.2, 03 §7.1, and the entry are cell-identical).
   (e) **Arrival composition** — **D-010** (§5.1/§5.2/§5.5; subject at 62vw / ≈38% frame width
   from `P0` at 4.15W, title block in the word column at 50vh, B1 a pure dolly, the stack
   centered at 50vw only for the `P5` tableau; the 50vw variant retired on the record).
   Also recorded: **D-013** (no poster — §5.2/§7.6/§8.4) and **D-016** (copper heat pipes —
   §8.5.2).
2. **RESOLVED — battery, ruled by D-015:** the seated, label-only variant is **activated**
   (BATTERY enters alongside `label.chassis` at 0.797; nine labels, 14 label words — §7.5, §8.2,
   §8.3); the lifted variant is **declined** and stays staged as reserve copy in §8.2, with §8.3
   stating exactly how the caps would move under a superseding entry (115/145 → 125/155).
3. **OPEN — closing-line owner sign-off (D-017):** "Websites are complicated. / You've seen how
   we treat complicated." is **adopted for the documentation round per D-017**, with owner
   sign-off pending before implementation (line 2 was shortened from round 0 to sit inside the
   ≤6-word Distillery rule — the shortened form is the joint-table form, §8.2). Because it
   deliberately reuses the homepage hero's first sentence, the owner signs off on it (and on the
   page title "Engineering") before any code is written; a rewrite would be a superseding entry
   and a 03 §7.2 floor re-run. This is the document's one remaining open item.
