# 05 — Master Specification: `/engineering`

- **Owner:** Project Manager (synthesis of all approved specialist documents)
- **Date:** 2026-07-01 · **Status:** Synthesis draft for the D-008 completeness/consistency audit
- **Sources synthesized:** `project-vision.md` · `decisions.md` D-001–D-017 (binding) ·
  `01-creative-direction.md` (rev 5, Approved) · `02-technical-architecture.md` (rev 5, Approved) ·
  `03-animation-storyboard.md` (rev 5, Approved) · `04-asset-pipeline.md` (rev 4.1, Approved) ·
  `review-report.md` Round 5 (final round: all four documents Approved, required changes none;
  no open seam findings)
- **Review round reflected:** Round 5 (2026-07-01). The two optional Round-4/5 notes carried
  forward here: pairing terminology between 01 §7.8 and 03 §11 is unified in §10 of this document;
  03 §7.2's reading floor must be re-run if the owner's D-017 sign-off rewrites the closing line
  (§14.4).

---

## 0. How to use this document

This is the single source of truth for building the page at `/engineering`. An implementation
engineer builds the **complete** page — markup, CSS, JS, 3D assets, fallback art, QA — from this
document alone. Nothing here requires opening another document; every number, path, string, and
curve from the four specialist documents is carried here in full.

Rules of precedence, inherited and unchanged:

1. `decisions.md` (D-001–D-017) and `project-vision.md` rule over any conflicting text. Every seam
   the review rounds found is ruled and recorded; §14 lists each ruling and its entry.
2. Every number in this document is a commitment. Changes go through a superseding `decisions.md`
   entry and review — never a quiet edit.
3. **The D-008 gate:** no production code until this document passes its completeness and
   consistency audit, and **no implementation until the owner signs off on D-017** (the closing
   line and the page title — §14.5).
4. The banned-word list is law for all page copy (D-006): the seven words enumerated verbatim in
   §3's voice rules (this document carries the list so no other file is needed to run the audit),
   no exclamation marks, no fake statistics, no numbered "01/02" eyebrow labels. Beat IDs
   (`B0`–`B8`) and slot IDs (`copy.B2` etc.) are documentation/code identifiers only and never
   appear on screen.

Reading order for a first pass: §1 (what and why) → §7 (the timeline — the page's spine) → §6
(the scene under it) → §2/§5 (files and assets) → §8 (the runtime that drives it) → §3/§4 (words
and tokens) → §9–§12 (responsive, fallbacks, budgets, loading) → §13–§14 (how it is judged, and
what was ruled).

---

## 1. Project summary and the story

### 1.1 What gets built

A single page at `/engineering`. A photoreal thin silver laptop sits closed in a warm beige studio.
As the visitor scrolls, it takes itself apart — lid, cooling fan and copper heat pipes, storage and
memory, support boards, mainboard — one layer at a time, each part named in plain English the
moment it is in front of the visitor, until the whole machine hangs in a labeled exploded tableau.
One closing line, one CTA, one sign-off. The scroll wheel is the only input; the scrollbar is the
timeline; scrolling backward reverses time exactly.

Technology (D-003): real-time 3D — Three.js r180 + GSAP 3.13.0 ScrollTrigger, both vendored
locally, no build step, no bundler, no CDN request of any kind. Pure static deployment on Vercel
(`cleanUrls` maps `engineering/index.html` → `/engineering`). The existing
`Animations/laptop-teardown/` page stays live and untouched (D-002).

### 1.2 The narrative spine

The homepage promise is **"Websites are complicated. Good thing we're not."** This page dramatizes
it: the most complicated object on most desks, taken apart calmly until it makes sense — which is
what WebSharke does with websites. The metaphor is the message; the demonstration is the sales
pitch; the confidence is in the calm. Every element on the page must be traceable to a sentence of
this story (vision §9 test) — anything without a sentence is cut.

The emotional arc, in scroll order (vision §4):

| Stage | Feeling | Produced by |
|---|---|---|
| Arrival (B0) | Stillness — "this is different" | one closed machine, warm light, almost no UI |
| First movement (B1) | Surprise — "wait, I'm doing this" | the first scroll visibly moves the scene; `copy.B1` states the contract on a still frame |
| The teardown (B2–B6) | Curiosity → understanding | each layer reveals something half-recognized and names it plainly |
| The ending (B7–B8) | Trust | the full exploded view held in silence, one plain closing line, one unhurried CTA |

Temperature: warm, precise, unhurried — a master watchmaker's bench, filmed at eye level. Never a
keynote, a game, a tech demo, or an ad.

### 1.3 Audiences

- **Primary — small-business owners (non-technical).** Plain component names, plain sentences, no
  jargon. Takeaway: *if WebSharke sweats this hard over a demo, imagine my website.*
- **Secondary — peers, developers, judges.** The page must survive expert scrutiny: clean scroll
  binding, no jank, honest 3D, no stock effects. When the two audiences conflict, the owner wins.

### 1.4 Success criteria (vision §12 — restated as the page's contract; checkable form in §13)

1. A non-technical visitor scrolls to the end unprompted and can say what the page was about.
2. A developer's first reaction includes "how was this made?"
3. The owner would show it to a prospective client from their phone, on the spot, without caveats.
4. Every element traces to a story sentence.
5. Frame-rate and payload budgets hold on mid-range hardware (§11).
6. Reduced-motion and no-WebGL experiences read as designed, not broken (§10).
7. Nobody can plausibly say "AI made this" about any element.
8. It makes someone want WebSharke to build their website.

---

## 2. File tree and routing

### 2.1 URL and routing

- The page lives at **`engineering/index.html`** (directory pattern, like the predecessor). With
  the site's existing `cleanUrls: true` + `trailingSlash: false`, Vercel serves it at
  **`/engineering`** and 308-redirects `/engineering/`. **No `vercel.json` routing change is
  needed.**
- Directory name is lowercase `engineering/`; **every path in the page is case-exact** (Vercel
  serves from Linux — casing bugs are the predecessor's documented trap).
- `middleware.js` gates only `/dashboard`; `/engineering` is public — no middleware entry.
- All paths inside `engineering/` are relative (`./vendor/…`, `./assets/…`), so the page is
  movable. The only root-absolute paths are the shared site items: `/fonts/…`,
  `/images/Main-Logo.png`, `/images/Tab-Logo.png`, and the CTA link `/onboarding`.
- **Zero third-party requests** of any kind: no CDN, no Supabase, no analytics. The CTA is a plain
  `<a href="/onboarding">`. (If a future revision ever requires the homepage's auth-aware CTA, the
  client must come from an already-vendored `supabase.min.js`, never a CDN.)

### 2.2 Full file tree (every file the implementation creates)

```
engineering/
├── index.html                      # markup, inline gate script, import map, critical CSS incl. the loader (§12)
├── css/
│   └── engineering.css             # non-critical styles (story-section layout, overlay mode)
├── js/                             # ES modules, one file per concern (§8.1)
│   ├── main.js                     # ~2 KB entry; reads the mode gate, dynamic-imports the rest
│   ├── loader.js                   # LoadingManager, byte-weighted progress, retry, loader handoff
│   ├── scene.js                    # scene graph assembly, lights, environment
│   ├── camera-rig.js               # camera proxy, pose application, viewport fit
│   ├── timeline.js                 # master timeline, the ScrollTrigger, the progress smoother
│   ├── quality.js                  # tier detection, DPR policy, adaptive degradation
│   ├── fallback.js                 # static-mode wiring, context-loss swap
│   └── debug.js                    # stats overlay, lazy-imported only when ?debug=1
├── vendor/                         # version in every directory name (§2.4 versioning rule)
│   ├── three-r180/                 # Three.js r180 (MIT)
│   │   ├── LICENSE                 # MIT text, copied from the release
│   │   ├── three.module.min.js     # ES-module entry (imports ./three.core.min.js relatively)
│   │   ├── three.core.min.js       # the bulk of the library — must sit beside the entry
│   │   └── addons/                 # from examples/jsm of the SAME release (paths preserved)
│   │       ├── loaders/GLTFLoader.js
│   │       ├── loaders/DRACOLoader.js
│   │       ├── loaders/KTX2Loader.js
│   │       ├── loaders/RGBELoader.js
│   │       ├── utils/BufferGeometryUtils.js    # imported internally by GLTFLoader
│   │       ├── utils/WorkerPool.js             # imported internally by KTX2Loader
│   │       ├── environments/RoomEnvironment.js # coded fallback if the HDR fails (§10.2)
│   │       └── libs/…                          # ONLY if the §2.3 transitive-import gate finds
│   │                                           #   r180 loader imports (e.g. ktx-parse, zstddec)
│   ├── gsap-3.13.0/                # GSAP 3.13.0 (GSAP Standard License)
│   │   ├── LICENSE.txt             # license text copied verbatim at vendoring time
│   │   ├── gsap.min.js             # UMD build → global gsap
│   │   ├── CustomEase.min.js       # ships 03's exact cubic-bezier curves (free since 3.13)
│   │   └── ScrollTrigger.min.js    # UMD build → global ScrollTrigger
│   ├── decoders-r180/              # decoder binaries from the same pinned three release
│   │   ├── draco/draco_wasm_wrapper.js + draco_decoder.wasm   # wasm only; no asm.js fallback
│   │   └── basis/basis_transcoder.js + basis_transcoder.wasm
│   └── README.md                   # vendor manifest: exact versions, source URLs, per-file SHA-256
└── assets/                         # flat per D-011 — fallback/ is the ONLY subdirectory
    ├── laptop.v1.glb               # Draco geometry; textures external via KHR_texture_basisu
    ├── aluminum_base.v1.ktx2       # atlas A base (atlas A deliberately ships NO normal map)
    ├── aluminum_orm.v1.ktx2
    ├── mainboard_base.v1.ktx2
    ├── mainboard_normal.v1.ktx2
    ├── mainboard_orm.v1.ktx2
    ├── modules_base.v1.ktx2
    ├── modules_normal.v1.ktx2
    ├── modules_orm.v1.ktx2
    ├── thermal_base.v1.ktx2
    ├── thermal_normal.v1.ktx2
    ├── thermal_orm.v1.ktx2         # ↑ the 11 KTX2 files, all at the assets/ root (D-011)
    ├── studio-warm.v1.hdr          # 1024×512 RGBE environment; no resolution token in the name
    └── fallback/                   # static-experience stills: 5 frames × 4 encodes = 20 files
        └── teardown-r{0..4}_{1280|2560}.v1.{avif|webp}
```

Per D-011 (binding): all runtime assets mount at `engineering/assets/`, **flat**, with exactly one
subdirectory (`fallback/`). There is **no `models/` subdirectory** and no `v1/` version directory.
Geometry lives at `engineering/assets/laptop.v1.glb`.

**Fonts are NOT duplicated here** (D-004): `index.html` declares the same `@font-face` rules as the
homepage, pointing at `/fonts/distillery-display/DistilleryDisplay-Regular.woff2` and the
`/fonts/playfair-display/latin-*.woff2` files (`font-display: swap`). Repo inventory: Distillery
ships one Regular file declared with a `100 900` weight range; Playfair ships static upright
weights 400–900 (six latin files) and italics 400–700 (four latin files). All Distillery usage is
declared `font-weight: 600` so the Playfair fallback in the stack
(`'Distillery Display','Playfair Display',serif`) holds a matching visual weight.

**Asset source files (never deployed):** `laptop.blend`, `studio-warm.blend`, PNG texture masters,
and the provenance manifest `MANIFEST.md` all live in `docs/engineering-demo/asset-source/` —
inside `docs/`, which `.vercelignore` excludes from the deploy (D-001's mechanism). The manifest is
deliberately not in the served tree: it changes with every re-export and must never sit in an
immutable-cached public directory.

### 2.3 Vendored libraries — pinned versions and licenses

| Library | Pinned version | Files vendored | License |
|---|---|---|---|
| Three.js | **r180** (Sep 2025 release) | `three.module.min.js`, `three.core.min.js`, 7 addon files (+ any transitive `libs/` files the vendoring gate below finds), Draco + Basis decoder binaries — all from the same release tag | **MIT.** Vendoring and redistribution permitted; `LICENSE` copied into `vendor/three-r180/`. |
| GSAP core + CustomEase | **3.13.0** | `dist/gsap.min.js`, `dist/CustomEase.min.js` | **GSAP Standard License** — free for all use incl. commercial since 3.13 (Apr 30, 2025), self-hosting expressly permitted (what makes D-003 satisfiable), formerly-Club plugins included (why CustomEase can be vendored). Source-available, not open source: vendor as-is, never modify or republish. Full text in `vendor/gsap-3.13.0/LICENSE.txt`. Its one restriction (competing with Webflow site-builders) does not apply. |
| ScrollTrigger | **3.13.0** (must match core exactly) | `dist/ScrollTrigger.min.js` | Same GSAP Standard License (always free tier). |

CustomEase exists for one reason: the storyboard's four motion curves are exact cubic-beziers
(§7.2) and GSAP core cannot express an arbitrary cubic-bezier without it — approximating them with
power eases would make the storyboard's numbers lies.

Why these pins: r180 is a mature release with the `three.core` split,
`scene.environmentIntensity`, and ACES tone mapping stable; 3.13.0 is the first fully-free GSAP
release. Exact versions, download URLs, and SHA-256 of every vendored file are recorded in
`vendor/README.md` (audited by QA-15). Pins are frozen for the life of the page unless a
decision-log entry supersedes them — "newer exists" is not a reason on a no-build static page.

Also from-release requirements: `DistilleryDisplay` addons are **from the same r180 tag** as the
core (addons import the bare specifier `'three'` resolved by the import map — §8.3); Draco and
Basis decoder binaries are from the same pinned release.

**Transitive-import verification (a vendoring gate — §14.3(n)):** the seven-addon list is a
verified minimum, not an assumption. Addon files import relative siblings that must also be
vendored — `KTX2Loader` in particular has, across three.js releases, imported
`../libs/ktx-parse.module.js` and `../libs/zstddec.module.js`; whether r180's does is checked
against the actual tag, never assumed. At vendoring time: copy the listed files, serve the page
locally, load `/engineering` in 3d mode through a full asset load (including a KTX2 transcode),
and confirm **zero 404s in the module graph** (DevTools Network, JS filter). Any additional
transitive file found (e.g., `addons/libs/*`) is copied from the same r180 tag at its
release-relative path, added to the §2.2 tree, counted inside §11.1's addons line, and recorded
in `vendor/README.md` with its SHA-256 — QA-15 then audits it like every other vendored file. A
missing transitive file is a total failure mode (the module graph 404s and every visitor silently
drops to static mode), which is why this is a gate and not a note.

### 2.4 Versioning and cache headers

One principle: **a change is always a new URL, never an in-place edit.** Applied at two scopes:

- **Assets: per-file `.vN` version token** (`laptop.v1.glb` → `laptop.v2.glb`), immutable once
  shipped. Discipline (D-011): **no file may live under `assets/` without a `.vN` token** — the
  subtree is immutable-cached, so an unversioned file there would cache stale forever. Per-file
  invalidation: re-mastering one texture re-downloads one file, not a directory.
- **Vendored libraries: version in the directory name** (`three-r180/`, `gsap-3.13.0/`,
  `decoders-r180/`) — a library upgrades as one unit because its internal relative imports must
  stay mutually consistent.

The implementation round adds to `vercel.json`:

```json
{ "source": "/engineering/(vendor|assets)/(.*)",
  "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
```

`index.html`, `css/`, `js/` keep Vercel's revalidating default (`public, max-age=0,
must-revalidate` + ETag) so logic fixes ship instantly.

**CSP standing rule:** the site currently sets no `script-src`, so the decoder wasm compiles fine.
If a `script-src` is ever added site-wide, it must include `'self'` and `'wasm-unsafe-eval'`, or
both decoders die at runtime. No cross-origin isolation is needed (no SharedArrayBuffer).

---

## 3. The complete copy deck

Every word on the page. Wording is the Creative Director's, verbatim from the D-009 table of
record; slot IDs and windows are the Animation Director's (windows repeated in §7). Voice rules
binding on any future edit: plain, specific, honest, a little dry; short declaratives; no
exclamation marks, no ellipses, no emoji, no rhetorical questions, no invented statistics; each
sentence describes what is on screen right now. **The seven banned words (D-006's list from
`docs/design-guide.md`, transcribed here verbatim so this document alone can run the §13.3
audit): "premium", "revolutionary", "cutting-edge", "seamless", "immersive", "next-generation",
"masterpiece"** — zero occurrences permitted in any shipped visible string, including any future
copy edit and the meta description. If any sentence is ever edited: superseding decision entry +
re-run of the §7.4 reading-floor formula.

### 3.1 The scrubbed copy (D-009, verbatim)

| Slot | Wording (final) | Words | Window (in / full / out) |
|---|---|---|---|
| `copy.B0` | title **"Engineering"** (renders ENGINEERING — Distillery) + subline **"A laptop is a complicated thing. It comes apart layer by layer."** (Playfair) | 1 + 12 | visible at rest; exits 0.000–0.040 |
| `copy.B1` | **"That was you. This page only moves when you do."** | 10 | 0.040–0.055 / 0.055–0.105 / 0.105–0.120 |
| `copy.B2` | **"The lid comes off first. It always does."** | 8 | 0.124–0.139 / 0.139–0.189 / 0.189–0.204 |
| `copy.B3` | **"The cooling fan and the copper heat pipes. They carry heat away."** | 12 | 0.238–0.253 / 0.253–0.308 / 0.308–0.323 |
| `copy.B4` | **"Storage and memory. Everything you keep, and everything it's thinking about."** | 11 | 0.421–0.436 / 0.436–0.491 / 0.491–0.506 |
| `copy.B5` | **"Support boards. Power, ports, and signals — small jobs, handled separately."** | 10 | 0.612–0.627 / 0.627–0.677 / 0.677–0.692 |
| `copy.B6` | **"The mainboard lifts away. The chassis stays, and asks for no credit."** | 12 | 0.717–0.732 / 0.732–0.862 / 0.862–0.877 |
| `copy.close` | **"Websites are complicated."** / **"You've seen how we treat complicated."** — Distillery, two lines (3 + 6 words, both inside the ≤ 6-word caps rule). **Adopted per D-017; owner sign-off pending before implementation** (§14.5) | 9 | in 0.973–0.986; persists at 1.000 |
| `copy.cta` | **"Start a Project"** (`.btn-sand` → `/onboarding`) | 3 | in 0.988–0.998; clickable ≥ 0.992 |
| `copy.signoff` | **"© 2026 WebSharke"** (microtext) | 3 | in 0.992–1.000; persists |
| `label.*` ×9 | canon names verbatim (§3.2) | 14 total | in-points per §7.3; lifecycle §7.6 |
| `cue.scroll` | **"Scroll"** (microtext) | 1 | clock-based idle trigger (§7.7) |

`copy.B1` ships (D-009): it is the page's only sentence about the page — the contract itself —
read over a dead-still frame that proves it while it is being read. Every card after it is about
the machine.

### 3.2 Component labels (D-015: BATTERY is active)

Canon names verbatim, uppercase via CSS (markup in sentence case), zero adjectives, zero marketing
names — nine labels, 14 label words:

> **LID · COOLING FAN · HEAT PIPES · STORAGE (SSD) · MEMORY (RAM) · SUPPORT BOARDS · MAINBOARD ·
> CHASSIS · BATTERY**

`label.battery` enters alongside `label.chassis` at 0.797, sharing its stagger slot (two parts
that never leave, named together — D-015), joins the B8 diagram re-entry and the fallback-still
captions. The battery itself never moves (the model's `chassis_battery` is non-separating).

### 3.3 Structure and system states

| Slot | Copy | Notes |
|---|---|---|
| `<title>` | **WebSharke — Engineering** | |
| Meta description | **"A laptop comes apart layer by layer as you scroll. Every part named in plain English. This is how we treat complicated things."** | authored during synthesis (no source document specified one); requires CD/owner sign-off alongside D-017 (§14.3, §14.5). Not visible on the page — excluded from the word budget |
| Beat `h2` headings (×7; visible in static mode, `.sr-only` in 3d mode) | **The machine · Lid · Cooling fan and heat pipes · Storage and memory · Support boards · Mainboard and chassis · The whole machine** | "The machine" heads the opening section (title, subline, `R0`); "The whole machine" heads the ending — the bookend is deliberate |
| Skip link (targets `#ending`) | **Skip to the end** | 4 words; visually hidden until focused (§8.9) |
| Loading microtext | **Preparing the machine** | the loader's only words until handoff or the stall fallback |
| `file://` guard block (developer-only, unreachable in production) | **"This page runs from a web server, not from a file. From the project root, start any static server (for example, vercel dev), then open /engineering."** | excluded from the word budget for that reason |

**Slots ruled out (absence is a decision, not an omission):** `ui.progress` (D-014d — no progress
bar; the machine's state of disassembly is the progress indicator), the nav Sign In link (01 §2.2 —
the logo is the page's only exit), the footer block (D-014c — the scene container is the
document's last element), and the slow-network status line (retired — 02's stall rule converts
straight to static, leaving the line no trigger; its wording "Slow connection. Still loading." is
withdrawn unused). No wording exists for them because they do not exist.

### 3.4 Alt text for every fallback still (final wording — 01 §8.4)

One alt per still. Alt text states what a sighted visitor learns, in the same voice — no "image
of," no apology. Stills load only in static modes (QA-1 forbids any `assets/fallback/` request in
3d mode; no poster exists anywhere — D-013).

| Still (state) | Alt text |
|---|---|
| `R0` (`p` 0.000 — closed, `P0`) | **A thin silver laptop, closed, in a warm beige studio.** |
| `R1` (`p` 0.160 — Lid lifted, `P1`) | **The laptop's lid lifted straight up off the body, hanging above it.** |
| `R2` (`p` 0.633 — components lifted, `P3`) | **Seen from above, the cooling fan, heat pipes, storage, memory, and support boards all raised off the mainboard, the lid hanging higher still.** |
| `R3` (`p` 0.743 — Mainboard lifted, `P4`) | **The mainboard lifted a short way off the chassis, a clean gap between them.** |
| `R4` (`p` 1.000 — full tableau, `P5`) | **The whole laptop taken apart in mid-air: lid, cooling fan, heat pipes, storage, memory, support boards, mainboard, and chassis, each above its place.** |

Still captions (counted in the static budget): `R1` — LID; `R2` — the five component-plane names
(COOLING FAN, HEAT PIPES, STORAGE (SSD), MEMORY (RAM), SUPPORT BOARDS); `R3` — MAINBOARD, CHASSIS,
BATTERY; `R4` — the full nine-name canon list as the finished-diagram caption. Captions are live
HTML beside/below each still (selectable, translatable, screen-readable), positioned by percentage
anchors delivered with each render — never baked into pixels.

**Caption-anchor delivery (the mechanism — §14.3(h)):** the still-capture process (§5.1 row
14–33) writes one sidecar file per render pass, `caption-anchors.json`, into
`docs/engineering-demo/asset-source/` beside the PNG masters (inside `docs/`, never deployed —
D-011's `assets/` law is untouched because nothing new lands in the served tree). Schema: one
entry per still, one anchor per caption, x/y as percentages of the still's width/height from the
top-left, marking the named part —

```json
{ "version": "v1", "stills": [
  { "still": "r2", "anchors": [ { "caption": "COOLING FAN", "x": 41.2, "y": 33.8 }, … ] } ] }
```

The implementation **transcribes** these values into the static markup as inline custom
properties on each caption element inside the still's `<figure>` —
`<span class="still-caption" style="--ax:41.2%;--ay:33.8%">Cooling fan</span>` (sentence case in
markup, uppercase via CSS, like every label) — positioned by CSS
(`left: var(--ax); top: var(--ay)` plus a fixed translate so the text sits beside the mark, not
on it). No runtime fetch, no JavaScript: the no-JS article renders complete from markup alone.
`R4` carries nine anchored entries (it is the finished diagram); `R1`/`R2`/`R3` carry their §10.2
caption sets. A re-render regenerates the sidecar and the markup values are updated in the same
change; §5.6 gate 7's CD sign-off covers caption **positions** as well as wording.

### 3.5 On-asset text (render content, not page copy — CD signs off before texture lock)

- Board silkscreen: plain reference designators (R101, C204, J1 …) + one board ID near the front
  edge: **`WEBSHARKE ENG-01 · REV A`**.
- SSD label: matte paper, plain dark-gray text **`NVMe SSD`** / **`1 TB`**, thin keyline — no
  brands, no fake barcodes or certification marks.
- Battery label: **`Li-ion — 54 Wh`**, same honest-label rules.
- Keycap legends: standard ANSI, low-contrast (10% lighter than the cap).
- Typeface on textures: **D-DIN Regular** (SIL OFL 1.1) — used only in texture authoring,
  rasterized into baseColor masters, **never shipped as a font file** (D-004's two-font rule
  untouched). Source URL + SHA-256 logged in the provenance manifest.

### 3.6 Word budget (hard caps, counted on the rendered page)

| Block | 3d mode | Static mode |
|---|---|---|
| Title 1 + subline 12 | 13 | 13 |
| Scroll cue | 1 | — (the article carries no cue) |
| Cards ×6 (10+8+12+11+10+12) | 63 | 63 |
| Labels (9 canon names) / still captions (`R1` 1 + `R2` 10 + `R3` 3 + `R4` 14 — BATTERY captions `R3` per D-015, §14.3(m)) | 14 | 28 |
| Beat `h2` headings ×7 | — (`.sr-only`) | 19 |
| Closing 9 + CTA 3 + sign-off 3 | 15 | 15 |
| Skip link 4 · loading 3 | 7 | 4 (skip link only) |
| **Total** | **113** | **142** |

**Hard budgets: ≤ 115 words in 3d mode, ≤ 145 in static mode.** The `file://` guard is excluded
(developer-only, unreachable in production); alt text is not visible and not counted. Any build
exceeding its mode's cap fails review. (If a future superseding entry ever activates D-015's
declined lifted-battery variant, that entry raises the caps to ≤ 125 / ≤ 155.)

---

## 4. Design tokens

### 4.1 Palette (defined in the page's own `:root`; page-scoped names, no collision with the homepage)

The palette is measured, not invented — sampled with a pixel probe from `images/Laptop/interior.jpg`
and `images/Laptop/teardown-4.png` (references only, D-005). The third D-005 reference image,
**`images/Laptop/closed.png`** (site-root path; a 1366×768 frame of the closed silver laptop on
the warm backdrop, silhouette spanning ≈ x 382–978 / y 278–497 — the predecessor page's real
closed-laptop start frame), is the **silhouette standard** for §5.6 gate 6 and the bead-blasted
material read in §14.3(b). Warm tokens paint **areas**; cool tokens paint **objects**. No
cool-toned fills in 2D UI, ever. No pure `#000`/`#fff` anywhere, including render output.

**The room (warm):**

| Token | Hex | Role |
|---|---|---|
| `--linen` | `#f2e8da` | lightest surface: label chips, scrim base |
| `--wall-lit` | `#e9ddd1` | brightest large area; top of `--wall-grad` |
| `--wall` | `#c9b8a6` | the default field behind everything |
| `--wall-shade` | `#bba58d` | shadowed wall; base of `--wall-grad`; darkest area text may cross |
| `--floor` | `#a59586` | floor-material echo for the 3D ground / contact-shadow grade only; **no 2D fill or text use** |
| `--oak` | `#8d7254` | smallest warm doses (leader-line dots at the ending tableau, ≤ 3px, nothing larger) |

**The machine (cool) — these live mostly in the 3D render; the CSS tokens exist so any 2D UI echo
of a material matches it exactly:**

| Token | Hex | Role |
|---|---|---|
| `--alu` | `#acacae` | aluminum diffuse (Lid, Chassis) |
| `--alu-lit` | `#d6d6d8` | aluminum specular roll-off |
| `--pcb` | `#232a26` | Mainboard / Support Boards soldermask: desaturated green-black (never "hacker green") |
| `--solder` | `#9a9da2` | solder joints, shield cans, screws |
| `--copper` | `#b06c3d` | Heat Pipes material echo; the scene's only warm metal. **Never used as text at any size** (2.15:1 on `--wall`) |
| `--copper-ink` | `#8a4b26` | text/UI-grade copper: loader progress fill, focus accents (3.5:1 on `--wall` — non-text AA pass) |
| `--gold` | `#c3a36f` | contact fingers, tiny connector glints (2D use: ≤ 2px lines/dots only) |

**Text and utility:**

| Token | Value | Role |
|---|---|---|
| `--ink` | `#2b2320` | primary text, logo tint, focus outlines (machine-derived; not pure black) |
| `--ink-soft` | `#463c33` | secondary text: microtext, sign-off |
| `--scrim` | `rgba(242,232,218,.72)` | soft ellipse behind text when the machine crosses a text zone; its one scheduled use backs the closing block at the tableau |
| `--wall-grad` | `linear-gradient(180deg, var(--wall-lit) 0%, var(--wall) 62%, var(--wall-shade) 100%)` | the room's wall: **both** the loader background and the stage backdrop — one definition in `:root`, used twice, so the loader→scene handoff is pixel-continuous |

**Color lockdown rule:** every color literal in the page CSS resolves to one of these tokens or an
`rgba()` of one; raw hex outside `:root` fails review — with exactly one named exemption: the
verbatim `.btn-sand` block, which must diff byte-identical against `index.html`.

**Accent budget:** `--copper-ink` and `--gold` appear in 2D UI only as ≤ 2px lines/dots and the
loader fill. Any larger accent area must be in the render, where a light source explains it.

### 4.2 Text-on-background pairings (WCAG 2.x relative luminance, measured)

AA requires 4.5:1 (normal text) / 3:1 (large text ≥ 24px and non-text UI).

| Foreground | Background | Ratio | Verdict | Where |
|---|---|---|---|---|
| `--ink` | `--wall-lit` | **11.53:1** | AAA | opening title over the lit upper wall |
| `--ink` | `--wall` | **7.98:1** | AAA | beat sentences, default field |
| `--ink` | `--wall-shade` | **6.51:1** | AA (AAA large) | worst-case wall crossing |
| `--ink` | `--floor` | **5.31:1** | AA | reserve margin only — no 2D text sits over `--floor` |
| `--ink` | `--alu` | **6.79:1** | AA | if a label chip's text ever overlaps the Lid |
| `--ink` | `--linen` | **12.71:1** | AAA | label chips (active) |
| `--ink` | settled chip over `--wall` (blend `#e0d2c3`) | **10.39:1** | AAA | settled label text |
| `--ink` | settled chip over `--alu` (blend `#d3cdc6`) | **9.76:1** | AAA | settled label worst case |
| `--ink` | scrim-over-`--alu` (blend `#ded7cd`) | **10.78:1** | AAA | scrim worst case; closing line at the tableau |
| `--ink-soft` | `--wall-lit` | **8.05:1** | AAA | microtext in lit zones |
| `--ink-soft` | `--wall` | **5.57:1** | AA | scroll cue, loading microtext |
| `--ink-soft` | `--wall-shade` | **4.54:1** | AA (floor of use) | darkest permitted `--ink-soft` backing |
| `--ink-soft` | scrim-over-`--alu` (blend `#ded7cd`) | **7.54:1** | AAA | sign-off inside the closing block |
| `--copper-ink` | `--linen` | **5.56:1** | AA | copper text only on chips/light zones |
| `--copper-ink` | `--wall` | **3.50:1** | non-text 3:1 pass | loader progress fill on wall |
| `#102536` (homepage ink) | `#e4cfa6` (btn-sand dark stop) | **10.28:1** | AAA | CTA label, worst stop |
| `#102536` | `#f8ecd3` (btn-sand light stop) | **13.38:1** | AAA | CTA label, best stop |

Hard rules from the table: body-size `--ink-soft` never sits on anything darker than
`--wall-shade`; body-size `--copper-ink` never sits on anything darker than `--linen`; `--copper`
is never text.

### 4.3 Type scale (fluid `clamp(min, preferred, max)`; min = 360px viewport, max = 1440px)

Distillery Display + Playfair Display only (D-004). Distillery is caps-only: **markup in sentence
case with `text-transform: uppercase`**; Distillery lines ≤ 6 words by rule; glyph coverage (A–Z,
digits, period, comma, apostrophe) is a build gate — no mid-line fallback swaps. **No italics
anywhere on this page.** No text-shadow anywhere — zero is the number.

| Role | Family · weight | Size | Line-height | Letter-spacing | Color |
|---|---|---|---|---|---|
| Opening title (`h1`) | Distillery 600 | `clamp(2.4rem, 4.8vw, 4.4rem)` | 1.0 | `.015em` | `--ink` |
| Opening subline | Playfair 500 | `clamp(1rem, 1.5vw, 1.2rem)` | 1.7 | `.01em` | `--ink-soft` |
| Beat card sentence (×6) | Playfair 500 | `clamp(1.15rem, 1.9vw, 1.5rem)` | 1.55 | `.005em` | `--ink` |
| Component label (chip) | Playfair 600, uppercase | `0.72rem` fixed | 1.2 | `.14em` | `--ink` |
| Beat heading (`h2` — static/SR modes; `.sr-only` in 3d) | Distillery 600 | `clamp(1.4rem, 2.6vw, 2rem)` | 1.15 | `.02em` | `--ink` |
| Closing line (two lines) | Distillery 600 | `clamp(1.7rem, 3.2vw, 2.6rem)` | 1.25 | `.01em` | `--ink` |
| CTA label | Playfair 500, uppercase | `0.8rem` | 1 | `.18em` | `#102536` |
| Microtext (scroll cue, loading, sign-off, skip link) | Playfair 500, uppercase | `0.72rem` | 1.4 | `.18em` | `--ink-soft` (skip link: `--ink` on its chip) |

Notes: the title's 11-glyph caps wordmark measures ≈ 6.55em with tracking (≈ 461px at the 4.4rem
max ≈ 32vw at 1440) — inside the word column's 33vw measure, so it never wraps and never reaches
the machine's silhouette. Subline max-width `min(44ch, 33vw)` desktop / 92vw centered mobile. Card
max-width 34ch. Labels are fixed-size tags pinned to the scene, not fluid prose (Playfair, not
Distillery, because a display face at 11.5px loses its counters).

### 4.4 Spacing, layout measures, and composition values

| Value | Desktop (≥1024px) | Mobile (<768px) |
|---|---|---|
| Edge safe area | 24px | 24px + `env(safe-area-inset-*)` |
| Machine footprint | arrival silhouette ≈ 38% of frame width, subject center 62vw (D-010) · teardown ≤ 55vw wide at 62vw (delivered 54.6vw) · tableau ≈ 44vw × ≈ 86vh at 50vw/50vh | arrival/teardown upper stage: center 50vw / 40vh, ≤ 88vw ceiling, ≥ 10% margins · tableau per refit rule |
| Word column / beat text | one column, left edge 7vw: title block max-width 33vw, block centered at 50vh; cards `min(34ch, 26vw)`, centered at 50vh, left-aligned | title + subline centered in the bottom zone (subline 92vw); cards centered, `min(92vw, 34ch)`, bottom edge `max(2.2rem, env(safe-area-inset-bottom) + 1.2rem)` |
| Quiet zone (contract — silhouette stays out whenever a card is at opacity > 0) | x ∈ [4vw, 34vw], y ∈ [30vh, 70vh] | bottom 30vh |
| Label chip max width | 12ch | 12ch |
| Arrival title-block bottom edge (mobile) | — | `max(5.4rem, env(safe-area-inset-bottom) + 4.4rem)` |
| Scroll cue position | bottom-center, 5vh above the bottom edge | bottom-center at `max(2.2rem, env(safe-area-inset-bottom) + 1.2rem)` |
| Closing block (tableau) | closing line centered, block starts at 74vh; CTA 2.2rem beneath; sign-off 2.6rem beneath the CTA; single `--scrim` ellipse backs the block | same order, centered, scrim-backed over the lower stack; CTA full-width capped at 320px |

Framing principles (binding): one focal point per viewport; the machine never touches a viewport
edge during a held moment; the fix for an "empty" layout is never a new element — the inventory is
closed (§13.2).

### 4.5 UI component specs

- **Stage backdrop:** `#stage { background: var(--wall-grad); }` — fixed, full-viewport, two color
  stops of the sampled wall and nothing else (no image, no noise, no texture overlay). One
  definition, two uses (loader + stage) — the loader-to-scene handoff is pixel-continuous by
  construction.
- **Nav:** fixed, top-left, logo only. CSS-masked `Main-Logo.png` at 150×84px desktop / 120×67px
  mobile, tinted `--ink`, links to `/`; hover `translateY(-1px)` over 350ms. Never hides, dims, or
  transforms. No background, no border. **No Sign In link.**
- **Scroll cue:** the word "Scroll" (microtext) above a 1px × 34px vertical hairline in
  `rgba(70,60,51,.55)`, bottom-center. Fades in/out over 300ms; **no pulse, no bounce, no loop**;
  once dismissed by first scroll input it never returns. Trigger timing in §7.7.
- **Component labels — two treatments, one policy (D-014a).** *Active* (most recently entered):
  chip background `rgba(242,232,218,.92)`, border 1px `rgba(43,35,32,.30)`, radius 3px, padding
  `.34rem .6rem`, max-width 12ch; leader line 1px solid `rgba(43,35,32,.55)`, 28–64px long,
  straight, horizontal or exactly 45°, never curved, with a 3px `--ink` dot at the part end (dot
  switches to `--oak` at the ending tableau). *Settled* (every part named earlier): same geometry
  and text, quieter paper — chip `rgba(242,232,218,.55)`, border `rgba(43,35,32,.18)`, leader
  `rgba(43,35,32,.28)`, dot 2px `rgba(43,35,32,.50)`; **text stays full-strength `--ink`** (words
  don't fade, paper does). Appear = opacity 0→1 + 6px rise; demote = crossfade between treatments;
  both over 0.015 scroll-progress ramps (§7.5) — no clocks.
- **Scrim:** radial ellipse, `--scrim` at center → transparent at 70% radius, sized 1.3× the text
  block. Never a rectangle. One scheduled use: the closing block at the tableau.
- **Ending CTA:** `.btn-sand` **verbatim** from `index.html` (byte-identical, diff-audited): pill
  radius 100px, padding `1.05rem 2.9rem`, gradient `linear-gradient(135deg,#f8ecd3,#e4cfa6)`,
  label `#102536`, inset top highlight `0 1px 0 rgba(255,255,255,.65)`, layered drop shadows,
  hover `translateY(-3px)` over 400ms `cubic-bezier(.16,1,.3,1)`. Label "Start a Project" →
  `/onboarding`.
- **Focus visuals:** every focusable gets `outline: 2px solid var(--ink); outline-offset: 3px`
  (≥ 6.51:1 against every surface it can cross; 10.1:1 against the CTA's own fill). Skip link is
  visually hidden until focused; on focus it renders as an active-treatment chip fixed below the
  nav (top-left).
- **Gradient census (grep-checkable):** exactly **three** `gradient(` definitions may exist in the
  shipped CSS — `.btn-sand`'s fill, `--wall-grad` (one definition, two uses), and the scrim
  ellipse. Any fourth fails review. No `backdrop-filter`, no glassmorphism, no text-shadow.

---

## 5. Asset manifest

### 5.1 Every asset file (exact D-011 path · format · budget · pipeline step · acceptance test)

Budgets are raw bytes on disk (`ls -l`). "Expected" is the encoder-realistic target; "cap" is the
per-file law. All runtime assets carry `.vN` tokens and are immutable once shipped.

| # | Path (under `engineering/`) | Format | Expected / cap | Pipeline step | Acceptance test |
|---|---|---|---|---|---|
| 1 | `assets/laptop.v1.glb` | glTF 2.0 Binary, Draco-compressed geometry, external textures via `KHR_texture_basisu` | 1.05 MB / **1.20 MB** (inside 02's ≤ 1.8 MB line) | Blender 4.x LTS export (+Y up, apply modifiers, tangents ✓, no vertex colors/animations/cameras/lights) → `gltf-transform draco laptop.glb laptop.glb --quantize-position 14 --quantize-normal 10 --quantize-texcoord 12` | `npx gltf-validator engineering/assets/laptop.v1.glb` — zero errors, zero warnings; `gltf-transform inspect` — tris ≤ 150,000, 4 materials, ≤ 24 meshes, Draco + tangents present; node-name bind (QA-17); bbox 0.304 × 0.0156 × 0.212 m ± 1 mm |
| 2 | `assets/aluminum_base.v1.ktx2` | KTX2, 2048², ETC1S (sRGB) | atlas A total 0.62 / **0.70 MB** | 16-bit PNG master → `toktx --t2 --genmipmap --assign_oetf srgb --encode etc1s --clevel 5 --qlevel 220` | resolves in harness; keycap legends readable at 200 mm (§5.6 gate) |
| 3 | `assets/aluminum_orm.v1.ktx2` | KTX2, 1024², ETC1S (linear; R=AO, G=roughness, B=metallic) | (in atlas A total) | same `toktx` recipe, `--assign_oetf linear` | AO shows self-occlusion only (isolated bake — §5.7) |
| 4 | `assets/mainboard_base.v1.ktx2` | KTX2, 2048², ETC1S (sRGB) | atlas B total 1.00 / **1.13 MB** | silkscreen authored for ETC1S: strokes ≥ 2 texels (≥ 0.26 mm at 7.8 px/mm), pale-on-dark luminance contrast | board ID `WEBSHARKE ENG-01 · REV A` + designators readable at 80 mm, 1080p, no severed strokes |
| 5 | `assets/mainboard_normal.v1.ktx2` | KTX2, 512², UASTC (linear) | (in atlas B total) | `toktx --t2 --genmipmap --assign_oetf linear --encode uastc --uastc_quality 3 --uastc_rdo_l 0.75 --zcmp 19` | no visible banding on curved metal |
| 6 | `assets/mainboard_orm.v1.ktx2` | KTX2, 1024², ETC1S (linear) | (in atlas B total) | as #3 | as #3 |
| 7 | `assets/modules_base.v1.ktx2` | KTX2, 1024², ETC1S (sRGB) | atlas C total 0.47 / **0.53 MB** | text strokes ≥ 2 texels (0.2 mm at 10 px/mm) | SSD label `NVMe SSD` / `1 TB` readable at 80 mm |
| 8 | `assets/modules_normal.v1.ktx2` | KTX2, 512², UASTC (linear) | (in atlas C total) | as #5 | as #5 |
| 9 | `assets/modules_orm.v1.ktx2` | KTX2, 512², ETC1S (linear) | (in atlas C total) | as #3 | as #3 |
| 10 | `assets/thermal_base.v1.ktx2` | KTX2, 1024², ETC1S (sRGB) | atlas D total 0.39 / **0.44 MB** | as #2 | copper/plastic read per material table §5.5 |
| 11 | `assets/thermal_normal.v1.ktx2` | KTX2, 512², UASTC (linear) | (in atlas D total) | as #5 | no banding on the copper pipe (the worst case) |
| 12 | `assets/thermal_orm.v1.ktx2` | KTX2, 512², ETC1S (linear) | (in atlas D total) | as #3 | as #3 |
| 13 | `assets/studio-warm.v1.hdr` | 1024×512 equirectangular Radiance HDR (RGBE) | 0.85 / **1.0 MB** | authored in Blender (`studio-warm.blend`) — beige plaster walls, warm pale floor, one large window softbox camera-right-rear at azimuth +55° / elevation 40°, white point toward `#fff3dd` (≈ 4,900 K), key-to-ambient 4:1, wood-slat feature strip camera-left; 2,000 samples + denoise | loads via RGBELoader; wall-vs-reflection room match in the visual pass; highlights ≤ `#fff8ec`, shadows ≥ `#1b1a19` bind the render |
| 14–33 | `assets/fallback/teardown-r{0..4}_{1280|2560}.v1.{avif|webp}` (20 files) | AVIF + WebP, 2 widths | per variant: 2560 AVIF ~70/**100 KB** · 2560 WebP ~105/**130 KB** · 1280 AVIF ~28/**40 KB** · 1280 WebP ~38/**50 KB**; set ≤ **1.6 MB** (expected ≈ 1.21 MB) | capture from the **production three.js scene** (never Blender re-renders, never AI, never legacy slices): drive the master timeline to each D-014b address, render at 2560×1600, DPR 1, `preserveDrawingBuffer` in a capture-only flag, save PNG masters → `avifenc -j all -s 4 --min 16 --max 32` / `cwebp -q 78 -m 6 -sharp_yuv` | all 20 present + named exactly; each within cap; logged `master.progress()` equals its address exactly (0.000/0.160/0.633/0.743/1.000); logged scene-build hash matches the shipped build; **no baked text in any frame** |

**The 13-entry loader manifest (per-file expected sizes — the §12/P2 byte-weighting denominators,
transcribed into `loader.js`; replaced by measured encode sizes at export per §14.3(f)):**

| File | Expected (MB) | File | Expected (MB) |
|---|---|---|---|
| `laptop.v1.glb` | 1.05 | `modules_base.v1.ktx2` | 0.28 |
| `aluminum_base.v1.ktx2` | 0.40 | `modules_normal.v1.ktx2` | 0.14 |
| `aluminum_orm.v1.ktx2` | 0.22 | `modules_orm.v1.ktx2` | 0.05 |
| `mainboard_base.v1.ktx2` | 0.70 | `thermal_base.v1.ktx2` | 0.20 |
| `mainboard_normal.v1.ktx2` | 0.14 | `thermal_normal.v1.ktx2` | 0.14 |
| `mainboard_orm.v1.ktx2` | 0.16 | `thermal_orm.v1.ktx2` | 0.05 |
| `studio-warm.v1.hdr` | 0.85 | **Σ (= 3D-path expected total)** | **4.38** |

Per-atlas sums check: A 0.40 + 0.22 = 0.62 · B 0.70 + 0.14 + 0.16 = 1.00 · C 0.28 + 0.14 + 0.05 =
0.47 · D 0.20 + 0.14 + 0.05 = 0.39 — the atlas totals in the table above, exactly.

**Texture subtotal:** 11 KTX2 files, expected **2.48 MB**, atlas caps sum to **2.80 MB** = 02's
texture line exactly. **3D-path asset total:** expected 4.38 MB, cap 5.00 MB. **GPU texture memory**
(ETC1S → 4 bpp, UASTC → 8 bpp, ×1.33 mips): A ≈ 3.5 + B ≈ 3.8 + C ≈ 1.2 + D ≈ 1.2 + PMREM ≈ 4.2 →
**≈ 14 MB** (cap 24 MB; tier-B line is 48 MB).

**Downscale ladder** (applies in order only if a measured file exceeds its cap; nothing else may be
silently resized): (1) environment → 768×384, shipping as `studio-warm.v2.hdr` (−0.35 MB); (2)
atlas A base → 1024 ETC1S (−0.22 MB; re-run legend check); (3) atlas B base → 1024 ETC1S
(−0.45 MB) — **last resort**, requires relaxing the closest board approach to 120 mm: a joint
change request, never a silent decision. **Upgrade ladder** (only via a superseding decision entry
that re-splits 02's budget lines): (1) atlas B normal → 1024 UASTC (+0.41 MB payload / +1.04 MB
GPU); (2) atlas D normal → 1024 UASTC (+0.34 MB / +1.04 MB GPU).

**Fallback-still encode contingency** (in order): (1) WebP `-q 78 → 70` / AVIF `--max 32 → 36`,
re-encode; (2) if still over, the large tier drops 2560 → 2048×1280 **for all frames**
(mixed-resolution sets read as an error). The set cap is the law.

### 5.2 Component hierarchy — exact node names and pivots (canon; runtime binds by string)

Naming rules: `snake_case`, ASCII, no spaces, sub-meshes prefixed by parent. **Byte-exact — a
one-letter drift is a bug** (init throws → static mode if any top-level name is missing).

```
laptop_root                      (empty; origin = footprint center on the ground plane, y = 0)
├─ lid                           Lid — entire upper clamshell half, sealed (display back on top,
│   ├─ lid_shell                   keyboard deck + trackpad on its underside — moves as one unit)
│   ├─ lid_deck
│   ├─ lid_deck_keys             keycap field, one merged mesh (78 keys)
│   └─ lid_deck_trackpad
├─ cooling_fan                   Cooling Fan
│   ├─ cooling_fan_housing
│   └─ cooling_fan_rotor         39-blade rotor (own spindle pivot — capability only; never spun)
├─ heat_pipes                    Heat Pipes — one assembly
│   ├─ heat_pipes_pipe           flattened 8 mm pipe run
│   ├─ heat_pipes_coldplate
│   └─ heat_pipes_finstack       45 fins
├─ storage_ssd                   Storage (SSD) — M.2 2280, one mesh
├─ memory_ram                    Memory (RAM) — SO-DIMM, one mesh
├─ support_boards                Support Boards (group of 3)
│   ├─ support_board_io          64 × 28 mm
│   ├─ support_board_wireless    30 × 26 mm (M.2 2230)
│   └─ support_board_aux         46 × 20 mm
├─ mainboard                     Mainboard — one mesh incl. all permanently-soldered parts
├─ chassis                       Chassis
│   ├─ chassis_tub
│   ├─ chassis_battery           non-separating battery pack (D-015 — never moves; labeled)
│   ├─ chassis_speaker_l         58 × 18 × 5 mm
│   ├─ chassis_speaker_r
│   └─ chassis_feet              4 rubber feet, merged
└─ locators
    ├─ loc_lid_hinge             empty at (0, 9.0, −106.0) mm — hinge axis (capability; unused)
    └─ loc_ground_center         empty at world origin (capture/QA registration)
```

20 renderable meshes (cap 24). **Pivot rule:** every top-level part's node origin sits at the
geometric center of its own bounding box in the assembled pose, ±0.5 mm, axes world-aligned. Two
exceptions: `cooling_fan_rotor` (origin on the spindle axis at blade mid-height) and the
`loc_lid_hinge` locator. The timeline never assumes zeroed transforms: at bind time each part's
rest position is captured (`part.userData.rest = part.position.clone()`) and every beat writes
`rest + Δ`.

**Assembled-pose origins** (world mm, ±1 mm; final measured values are written to the provenance
manifest by QA and are what the implementation reads):

| Node | x | y | z |
|---|---|---|---|
| `lid` | 0 | 12.3 | 0 |
| `cooling_fan` | −92 | 8.3 | −58 |
| `heat_pipes` | −10 | 10.6 | −72 |
| `storage_ssd` | −18 | 9.6 | −18 |
| `memory_ram` | 62 | 9.7 | −8 |
| `support_boards` | −98 | 8.9 | 38 |
| `mainboard` | 0 | 7.1 | −22 |
| `chassis` | 0 | 5.1 | 0 |

**The GLB must NOT contain:** cameras, lights, baked animation tracks, or skins — any of these
fails QA.

### 5.3 Real-world dimensions (the model's chosen numbers; 1 unit = 1 m in the file)

| Part | w × d × h (mm) | Notes |
|---|---|---|
| Closed body | **304 × 212 × 15.6** | 14.4 body + 1.2 feet; lid/base seam at y 9.0 |
| Lid (upper half) | 304 × 212 × 6.6 | shell 1.8 thick |
| Chassis (tub) | 304 × 212 × 7.8 | walls 1.6; port cutouts left wall |
| Mainboard PCB | 262 × 158 × 1.2 | components up to 4.5 above board |
| Cooling Fan | 64 × 58 × 6.2 | rotor Ø 45, 39 blades |
| Heat Pipes assembly | 176 span; pipe 8 w × 3 h | coldplate 38 × 32 × 2; finstack 55 × 11.5 × 6.5 |
| Storage (SSD) | 80 × 22 × 3.6 | M.2 2280 |
| Memory (RAM) | 69.6 × 30 × 3.9 | 8 DRAM packages |
| Support boards | 64 × 28 / 30 × 26 / 46 × 20 | io / wireless / aux |
| Battery | 190 × 92 × 5.4 | in-chassis, non-separating |

The storyboard's subject unit **`W` = 0.304 m** (laptop width); depth = 0.697W; closed height
0.051W; Lid thickness 0.022W.

### 5.4 Polycount budget (triangles)

| Node | Budget | Note |
|---|---|---|
| `lid` (all) | 24,000 | keys ~180 tris/key × 78 ≈ 14 k; real 0.4 mm key chamfers |
| `chassis` (all) | 26,000 | interior detail is geometry (camera passes over it at the tableau) |
| `mainboard` | 38,000 | closest-approach hero; sockets/connectors/choke fields as real merged geometry |
| `cooling_fan` | 16,000 | 39 blades × ~300 tris (double-sided thin shells) + housing 4 k |
| `heat_pipes` | 12,000 | pipe 24-segment sweep; 45 real fins at 1.2 mm pitch |
| `storage_ssd` | 5,000 | |
| `memory_ram` | 5,500 | |
| `support_boards` (3) | 9,000 | 3 k each |
| **Total** | **135,500** | **hard cap 150,000** (02's scene line is ≤ 350 k) |

Hard-surface standards: no visible faceting on aluminum at 150 mm; all visible edges get real
chamfers ≥ 0.3 mm (2 segments) with weighted normals; no normal baking on aluminum bodies;
cylinder segments: heat pipe 24, rotor hub 32, screw heads 12, feet 16; every part fully modeled
on all faces including those hidden in the assembled pose (true separation — no holes when
isolated). UV: one set per mesh; texel density baseColor — board 7.8 px/mm, aluminum 3.2 px/mm,
modules 10 px/mm (± 10%); ORM at half baseColor density on atlases A/B; seams only on hidden
edges; island gutter ≥ 8 px at 2048; mirroring only on symmetric supporting sub-meshes, never on
silkscreened surfaces.

**Minimum camera distances (contract with the timeline — going closer is a change request):**
80 mm — mainboard, heat pipes, cooling fan, SSD, RAM; 150 mm — lid exterior, chassis exterior;
200 mm — lid underside (deck/keys/trackpad), support boards, chassis interior. The storyboard's
closest approach is 2.90W = 882 mm — 11× the tightest floor.

### 5.5 PBR material table (glTF metallic-roughness; 12 logical materials → 4 glTF materials, one per atlas)

| # | Material (region) | Atlas | baseColor (sRGB) | Metallic | Roughness | Notes |
|---|---|---|---|---|---|---|
| 1 | Anodized aluminum (lid, chassis) | A | `#c8cbce` | 1.0 | 0.42–0.50 (noise-varied) | **Bead-blasted anodize — ruled in §14.3(b): not brushed, no anisotropy extension.** Micro-noise in roughness breaks up reflections |
| 2 | PCB solder mask (all boards) | B / C | `#0d1412` | 0.0 | 0.60 | dark green-black; silkscreen `#c9ccc4` |
| 3 | Solder pads / joints | B / C | `#b9bec2` | 1.0 | 0.35 | metallic-mask regions on the board atlases |
| 4 | Copper heat pipes + fins | D | `#c87d52` | 1.0 | 0.32 | **Raw copper — approved deviation from the reference's dark/taped pipe (D-016).** `copy.B3`'s "copper" stands |
| 5 | Silicon die (SoC) | B | `#3a3f46` | 0.0 | 0.15 | on a `#123018` substrate |
| 6 | Chip packages (NAND, DRAM, VRM) | B / C | `#16181a` | 0.0 | 0.75 | matte epoxy; laser-etch text `#8d9094` |
| 7 | Gold edge fingers (RAM, wireless) | C | `#d4af6a` | 1.0 | 0.25 | restrained — never jewelry-bright |
| 8 | SSD label | C | `#ded9cf` | 0.0 | 0.85 | honest unbranded label (§3.5) |
| 9 | Fan plastic (housing, rotor) | D | `#1b1d1f` | 0.0 | housing 0.60 / rotor 0.45 | glass-filled nylon look |
| 10 | Steel shields / brackets | C | `#9ea3a6` | 1.0 | 0.35 | stamped shields on support boards |
| 11 | Rubber feet | A | `#2a2c2d` | 0.0 | 0.90 | dead matte |
| 12 | Thermal paste imprint | B (board) + D (coldplate) | `#b9bdc0` | 0.0 | 0.35 | visible on die and coldplate when pipes lift — mirrored imprints |
| — | Trackpad glass | A | `#3f4548` | 0.0 | 0.20 | inset on `lid_deck_trackpad` |
| — | Battery pouch | A | `#33363a` | 0.0 | 0.65 | label `Li-ion — 54 Wh` |

**No emissive anywhere** (nothing is powered; no glow without a light source). **No
transmission/clearcoat/anisotropy extensions** — every extension is transcoder/loader surface.

The mainboard mesh carries only permanently-soldered parts (SoC substrate + die, VRM chokes and
capacitor fields, M.2 socket + standoff, SO-DIMM socket with latches modeled **open**, two USB-C
shells + one audio jack aligned to the chassis wall cutouts, empty fan/battery headers, screw
bosses, paste imprint on the die). Lift any module and the board honestly shows the empty seat —
never a painted-on duplicate. Not modeled, by decision: display internals, cables/flex ribbons
(headers modeled empty), Wi-Fi antennas, webcam, separate screws (heads modeled in place).

### 5.6 Asset QA gates (a failed line is a rejected asset)

1. **No baked shadows/lighting:** all materials swapped to `MeshBasicMaterial` with only `base`
   maps → albedo shows zero directional shading, no shadow gradients, no neighbor silhouettes.
   Each ORM red channel in isolation shows self-occlusion only.
2. **True separation:** isolate each of the 8 top-level nodes (`node.visible`), orbit 360° — no
   holes, no fragments of any other part. With all modules hidden, the mainboard shows its empty
   seats.
3. **Pivots/hierarchy:** `Box3.setFromObject(part).getCenter()` vs node world origin ≤ 0.5 mm
   (except the rotor); all 20 mesh names + 2 locators resolve via `scene.getObjectByName`;
   `loc_lid_hinge` at (0, 9.0, −106.0) ± 0.5 mm.
4. **Scale/registration:** bbox 0.304 × 0.0156 × 0.212 m ± 1 mm; assembled-pose origins within
   ±1 mm of §5.2's table; measured values written back to the manifest.
5. **Budgets/legibility:** per-mesh tris ≤ §5.4; file sizes ≤ §5.1 caps; texel densities ± 10%;
   the ETC1S text-legibility gate (§5.1 rows 4/7) — a failure triggers the ladder discussion,
   never a silent re-encode.
6. **Load hygiene/visual match:** validator zero errors/warnings; harness load zero console
   warnings; all 11 KTX2 resolve; draw calls ≤ 24; silhouette overlay vs
   `images/Laptop/closed.png` (the D-005 closed-machine reference — §4.1) rendered from `P0` at
   1366×768 — max edge deviation ≤ 8 px; no faceting at 150 mm; no visible UV seam on hero surfaces;
   contact-shadow penumbra 24–36 mm measured against a 10 mm-grid QA plane; backdrop-vs-reflection
   room match confirmed.
7. **Fallback art:** per §5.1 row 14–33's acceptance column, plus CD sign-off on captions/alt
   recorded before ship.

**Image-generation prohibition (project-wide):** no AI-generated imagery anywhere in the
production path — not textures, not the HDRI, not fallback frames, not "a base to paint over."
Permitted texture sources: procedural authoring, hand-painting, CC0 photo sources (Poly Haven,
ambientCG) as surface grain — each logged in the provenance manifest with URL. Per-part AO is
baked **with every other part hidden** (self-occlusion only); never bake AO of the assembled
stack.

---

## 6. Scene specification

### 6.1 Units, axes, world scale

- **1 unit = 1 meter** (glTF native — nothing rescales on import). `W` = **0.304 m**.
- **+Y up; +Z is the laptop's front edge** (toward the viewer's default side); +X the viewer's
  right; hinge line at z = −0.106 m. `laptop_root` rests on y = 0 at world origin.
- Camera near/far: **0.05 / 12** m. Farthest pose is `P0` at 4.15W ≈ 1.26 m; the worst-case
  portrait fit (390 × 844 viewport, aspect ≈ 0.46, pushes `P0`'s horizontal fit to ≈ 4.3 m) leaves
  the deepest rendered fragment under 5 m — 2.5× inside the far plane.

### 6.2 Renderer configuration (transcribe exactly)

```js
new THREE.WebGLRenderer({
  canvas,                       // <canvas id="gl"> inside the fixed #stage
  antialias: quality.msaa,      // true below effective DPR 2, false at ≥ 2 (set once at init)
  alpha: true,                  // transparent canvas — the warm room is CSS, not geometry
  powerPreference: 'high-performance',
  stencil: false,
  preserveDrawingBuffer: false, // true only under the capture-only flag for still production
});
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;   // r180 default — stated so nobody "fixes" it
renderer.toneMapping = THREE.ACESFilmicToneMapping; // AgX evaluated and rejected (dulls the copper)
renderer.toneMappingExposure = 1.05;                // the number of record — §14.3(c)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;   // shadowMap.autoUpdate = true (free under render-on-demand)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, tierCap));  // §8.7
```

The backdrop is CSS on `#stage` (`--wall-grad`), never `scene.background` and never geometry:
backdrop stays crisp at any DPR, text contrast is a CSS decision, and the GPU draws only the
laptop and its shadow.

**Exposure clamps (enforced in the render, not just CSS):** highlights never exceed `#fff8ec`;
shadows never crush below `#1b1a19`. No pixel at `#000000` or `#ffffff` in delivered frames or
stills.

### 6.3 Lighting rig (implements 01 §6's one-window room; physical light units)

| Light | Type | Color | Intensity | Position (m) | Shadows |
|---|---|---|---|---|---|
| `key_light` | `DirectionalLight` | `#fff3dd` (late-morning sun through glass — never neutral-studio white) | **2.4** | **(2.0, 2.05, −1.4)**, target = `laptop_root`. Elevation ≈ **40°**; horizontal bearing 55° off the rear axis toward +X — right-rear quadrant, agreeing with the HDR's window hot spot (+55°) so runtime shadow and every IBL reflection tell one light direction | **yes** — the only shadow caster. Map **2048 (tier A) / 1024 (tiers B–C)**, PCFSoft, ortho frustum **±0.45 m** (caster extent at the tableau ≈ ±0.36 m → ~20% margin), **bias −0.0003, normalBias 0.02** |
| `bounce_fill` | `DirectionalLight` | `#e9ddd1` (the room's own lit-wall color — the fill is literally the wall bouncing back) | **0.6** | (−1.6, 0.9, 1.2) — front-left, low | no |
| Environment | IBL | `assets/studio-warm.v1.hdr` | `scene.environmentIntensity = 0.5` | — | — |

- **No `AmbientLight`** — the IBL is the ambient term; a flat ambient is the "glows without a
  light source" failure the vision bans. No rim light, no cool fill.
- Key-to-fill ≈ **4:1 (two stops)** — graded against an 18% gray probe sphere in the `?debug=1`
  overlay, not by eye.
- Mood acceptance (in the mood owner's units): contact-shadow penumbra ≈ **8–12% of the laptop's
  width = 24–36 mm**; shadows warm and readable, never crushed below `#1b1a19`; each lifted layer
  casts a soft offset shadow onto the layer below (the shadow stack is how a lay eye reads depth
  order); no part ever floats shadowless. The room must feel unoccupied, mid-morning, slightly
  domestic — never a lab, a void, or a showroom.

### 6.4 Environment / IBL

`assets/studio-warm.v1.hdr` — 1024×512 equirectangular RGBE, ≤ 1.0 MB (expected 0.85 MB), authored
per §5.1 row 13. Loaded with the vendored `RGBELoader`, run once through `PMREMGenerator`,
assigned to **`scene.environment` only** (never `scene.background`); source texture and generator
disposed after. If the HDR fails twice, vendored `RoomEnvironment` substitutes through PMREM at
the same intensity (0.5) — the page never ships a black-metal laptop.

### 6.5 Ground rig (D-012 — the numbers of record)

One `ShadowMaterial` plane (`ground_shadow`), built at runtime: **1.2 × 1.2 m, opacity 0.35,
receive-only, at y = 0**, PCFSoft, shadow map **2048 (tier A) / 1024 (tiers B–C)**, ortho frustum
**±0.45 m**, **bias −0.0003, normalBias 0.02**. Derivation (why 1.2 m): the tableau Lid's final
rank +1.08W = 0.328 m casts its shadow ≈ 0.53 m from center under the 40° key — outside a 0.9 m
plane's 0.45 m half-size, inside a 1.2 m plane's 0.60 m. Opacity 0.35 is 01 §6's "~35% strength"
made literal.

### 6.6 Scene graph at runtime

```
Scene
├── laptop_root      (from the GLB — the only thing beats transform besides the camera)
│   └── …the eight part nodes + locators (§5.2)…
├── ground_shadow    (ShadowMaterial plane — §6.5)
├── key_light (+ target)
└── bounce_fill
```

The runtime touches only `laptop_root`, the eight part nodes, **plus the three `support_board_io`
/ `support_board_wireless` / `support_board_aux` children — B5 drives them individually (staggered
starts 0.569/0.581/0.593, §7.3), the one sanctioned sub-node animation (§14.3(l))** — and (if
ever choreographed) `loc_lid_hinge`. Never any other sub-mesh (`chassis_battery` is read for its
label anchor Box3 only, §7.5 — never animated).

### 6.7 Camera rig

- **One camera. Vertical FOV 24°, fixed for the entire page** (≈ 55 mm full-frame equivalent —
  product-photography grammar). **FOV never animates.** Single exception: portrait viewports with
  aspect < 0.75 widen to **30°** — evaluated at init and on accepted resize only (a layout rule,
  never a scroll-driven animation). Camera up vector is world-vertical at all times (**no roll**).
- **Rig = keyframed poses on the master timeline, not a spline.** A plain proxy
  `camRig = { px, py, pz, tx, ty, tz }` (position + look-at target; deliberately **no `fov`
  field**, so a build cannot animate what the data cannot express) is tweened between poses;
  `camRig.apply()` runs once per rendered frame (`camera.position.set(...)`,
  `camera.lookAt(...)`); `updateProjectionMatrix()` only at init and accepted resize.
- Poses are transcribed once into a `CAM_POSES` data table (plain array literal), each spherical
  pose converted to Cartesian meters via W = 0.304 m.

**Named positions** (spherical about the scene origin — center of the Chassis footprint at ground
level. Azimuth 0° faces the laptop's front edge (+Z); positive = toward its left side. The camera
never crosses to azimuth < 0° — one side of the line for the whole film):

| Pose | Azimuth | Elevation | Distance | Look-at target | Subject center | Serves | Reads as |
|---|---|---|---|---|---|---|---|
| `P0` | +24° | **+22°** | **4.15W** (≈ 1.26 m) | machine center (+0.02W), lateral offset | **62vw** (D-010) | B0 | across the room: the object at rest |
| `P1` | +24° | +22° | 2.90W | machine center (+0.02W), lateral offset | 62vw | B1–B2 | working distance: the object as subject |
| `P2` | +38° | +9° | 2.95W | thermal plane (+0.10W), lateral offset | 62vw | B3 | low profile: **mechanism** |
| `P3` | +30° | +48° | 2.95W | components plane (+0.14W), lateral offset | 62vw | B4–B5 | high angle: **layout / map** |
| `P4` | +24° | +24° | 2.90W | board–chassis gap (+0.11W), lateral offset | 62vw | B6 | mid three-quarter: **separation** |
| `P5` | +24° | +26° | 3.00W | stack midpoint (+0.55W), **no offset** | **50vw** | B7–B8 | pulled back: **the whole, understood** |

Distances are derived, not eyeballed (at 24° vFOV, 16:9: frame width at the look-at plane =
0.756 × distance; silhouette horizontal extent = `W·cos(az) + 0.697W·sin(az)`): `P0` solves the
D-010 arrival — extent at +24° = 1.197W; d = 1.197 / (0.38 × 0.756) ≈ 4.17W → **4.15W delivers
38.2%**. `P1`–`P4` solve the quiet-zone bound (silhouette ≤ 55vw wide at a 62vw center → d ≥
extent/(0.55 × 0.756): 2.90W at +24°, 2.95W at +38°/+30°; delivered ≈ 54.6vw) and the no-crop
bound (worst case `P1`: half-frame-height 0.617W vs Lid top 0.502W → **18.6% headroom**). `P5`
solves the tableau framing check (§7.9).

**Subject-center mechanism:** a lateral look-at offset of magnitude
`0.12 × (2 · distance · tan(hFOV/2))` — the 12vw shift in world units at each pose's distance
(worked: `P0` ≈ 0.376W; `P1` ≈ 0.263W). During B1's dolly the offset is **recomputed per frame
from the live distance** so the 62vw center holds while only proximity changes. During B7 the
offset eases to zero (re-centering to 50vw) across the same window as the retreat. The rule
(62vw ± 2vw at `P0`–`P4`, 50vw at `P5`) is binding; offset values follow from it at the live
viewport.

**Vertical framing (the same mechanism, second axis — §14.3(p)):** the subject's vertical screen
center is a screen-space framing offset exactly like the lateral one — **never a change to the
named targets**. Desktop centers the subject at ≈ 50vh: vertical offset zero. The mobile upper
stage (§9.2's 40vh center) is delivered by a vertical look-at offset of magnitude
`0.10 × (2 · distance · tan(vFOV/2))` — the 10vh shift in world units at the pose's live
distance — signed so the look-at point drops *below* the subject center by that amount, which
raises the subject to 40vh in frame. It is computed in the same places as the lateral offset
(per frame during B1's dolly, at load/accepted-resize fit otherwise), applies at `P0`–`P4` when
the mobile composition is active (§9.1), and eases to zero across B7's window together with the
lateral offset — so the `P5` tableau centers at 50vw/50vh under the fit rule on every device.
The binding rule: subject vertical center ≈ 50vh desktop / 40vh mobile upper stage; the offset
value follows from it at the live viewport.

**Movement rules (binding):** single mover — camera or part, never both (one exception: B7);
camera moves precede part moves within a beat; exactly **5 camera moves** on the whole page (B1,
B3, B4, B6, B7); magnitude caps — azimuth ≤ 14°/move, elevation ≤ 39°/move, distance ratio ≤
1.8×/move; look-at always on the component under discussion, moving only during camera windows,
`CAM`-eased, in sync with position.

**Viewport fit (applied per pose at load and on accepted resize — never per frame):**

```
1. framing box per pose at the 16:9 reference (FOV 24°):
     halfH = d · tan(12°)          // d = the pose's distance in meters
     halfW = halfH · (16 / 9)
2. if aspect < 0.75: vfov = 30° (BEFORE the distance fit); else vfov = 24°
3. effective distance = max(dV, dH), where
     hfov = 2·atan(tan(vfov/2) · aspect)
     dV   = halfH / (0.90 · tan(vfov/2))   // box fits with ≥ 10% margin,
     dH   = halfW / (0.90 · tan(hfov/2))   // both axes
   position scaled away from the target along the view ray to that distance
```

Azimuth, elevation, and targets are never touched — the camera grammar is device-independent.

**Damping:** all smoothing lives in the single progress smoother (§8.5) and **nowhere else** — no
per-frame camera lerp, no smoothing on the target. Scene state is a pure function of the smoothed
playhead; τ = 70 ms is the entire "heavy, well-damped machine" feel.

---

## 7. THE MASTER TIMELINE

This is the page. One GSAP timeline, `paused: true`, duration exactly **1.0** by construction
(timeline time = normalized progress `p`; every address below transcribes with zero arithmetic),
`defaults: { ease: 'none' }` (linear scroll→time mapping; shaping comes only from the named
curves). Reference viewport for px figures: **1440 × 900** — 1200vh travel = **10,800 px**, so
0.01 p = 108 px = 12vh. Target engaged pass: 60–90 s (120–180 px/s).

### 7.1 Beat labels (the beat-label scheme; GSAP labels named exactly `B0`–`B8`)

| Label | Address | Label | Address | Label | Address |
|---|---|---|---|---|---|
| `B0` | 0.000 (state) | `B3` | 0.160 | `B6` | 0.648 |
| `B1` | 0.000 | `B4` | 0.343 | `B7` | 0.865 |
| `B2` | **0.105** (D-010) | `B5` | 0.569 | `B8` | 0.928 |

`B0` is the arrival *state*, `B1` the first range — they legitimately share address 0.000. Beat
ranges: B1 0.000–0.105 · B2 0.105–0.160 · B3 0.160–0.343 · B4 0.343–0.569 · B5 0.569–0.648 · B6
0.648–0.865 · B7 0.865–0.928 · B8 0.928–1.000. Generic mapping: opening = B0–B1 · teardown =
B2–B6 · ending = B7–B8. Beat IDs never appear on screen (D-006). QA and debugging jump by label
(`master.seek('B4')`).

**Still addresses (D-014b):** `R0` 0.000 · `R1` 0.160 · `R2` 0.633 · `R3` 0.743 · `R4` 1.000.

### 7.2 Named easing curves (registered once via vendored CustomEase, names verbatim)

| Name | cubic-bezier | Used for | Character |
|---|---|---|---|
| `CAM` | `(0.45, 0.00, 0.25, 1.00)` | all camera moves | fluid tripod head: symmetric ease-in-out, no whip |
| `LIFT` | `(0.30, 0.00, 0.12, 1.00)` | all part travel | machined rails: decisive break from rest, long asymptotic settle, **zero overshoot** |
| `TXT-IN` | `(0.16, 1.00, 0.30, 1.00)` | text entrances | the site's house reveal curve |
| `TXT-OUT` | `linear` | text exits | exits should be unnoticeable (needs no registration) |

Curves apply to segment-local progress: for window `[a, b]`, eased value =
`curve((p − a) / (b − a))` clamped to [0, 1] — identical math forward and backward.

**The arrival anchor** (all label/card in-points are computed, never eyeballed): a part is named
when it has covered 80% of its eased travel; solving `LIFT` gives the anchor
**`a + 0.47 × (b − a)`** for part window `[a, b]`.

### 7.3 The master timeline table (code from this)

Camera moves use `CAM`; part travel uses `LIFT` (pure vertical +Y translation of the named node,
Δ from captured rest, in W; **zero rotation, zero scale, ever**); text uses `TXT-IN` in /
`TXT-OUT` out. Holds = camera and parts both at rest (text may enter/exit inside a hold — reading
is what holds are for).

| Beat | Range (p) | ≈px | Camera (why) | Parts (node · Δ · window) | Text events | Hold |
|---|---|---|---|---|---|---|
| **B0** | 0.000 (state) | 0 | at `P0` | all assembled, still | `copy.B0` visible (title + subline in the word column); `cue.scroll` per §7.7 | — until first scroll |
| **B1** | 0.000–0.105 | 0–1134 | `P0 → P1` **pure dolly** 0.000–0.050, distance 4.15W → 2.90W; azimuth +24° and elevation +22° fixed; lateral offset recomputed per frame so the subject holds 62vw (why: walk toward the workbench — the first scroll's response is the camera, subject untouched; the move changes exactly one thing, so cause-and-effect is legible in 50 px and perfectly reversible) | none | `copy.B0` **exits 0.000–0.040** — the one visible exit: 30px rise (`LIFT`) + linear fade (the title steps aside; scroll back and it walks back in — reversibility made demonstrable). `copy.B1` in 0.040–0.055 / full 0.055–0.105 / out 0.105–0.120 (out-ramp overlaps the Lid's first 0.015) | **H1** 0.050–0.105 (0.055) — read `copy.B1` over a dead-still frame that proves it |
| **B2** | 0.105–0.160 | 1134–1728 | holds at `P1` (why: the first part move must own the frame alone) | **`lid` +0.50W**, window **0.105–0.145** (travel = 152 mm ≈ 23× the Lid's 6.6 mm thickness — unmistakably removed, not ajar; 18.6% headroom in frame; no tilt — no technician exists) | `label.lid` in 0.124–0.139; `copy.B2` in 0.124–0.139 / full 0.139–0.189 / out 0.189–0.204 (persists into B3's camera window) | **H2** 0.145–0.160 (0.015) |
| **B3** | 0.160–0.343 | 1728–3704 | `P1 → P2` 0.160–0.205: azimuth +24°→+38°, elevation +22°→+9°, distance 2.90→2.95W, target rises to the thermal plane +0.10W; runs under `copy.B2`'s tail (why: heat pipes are best read in profile — their rise is invisible from above; at +9° the profile is the whole frame) | **`cooling_fan` + `heat_pipes`** (two sibling nodes, **one shared transform** — physically one screwed-together module) **+0.28W**, window **0.205–0.275** | `label.fan` in 0.238–0.253; `label.pipes` in 0.250–0.265 (fan demotes to settled as pipes enters); `copy.B3` in 0.238–0.253 / full 0.253–0.308 / out 0.308–0.323 | **H3** 0.275–0.343 (0.068) |
| **B4** | 0.343–0.569 | 3704–6145 | `P2 → P3` 0.343–0.388 (card-free window): elevation +9°→+48°, azimuth +38°→+30°, distance 2.95W held, target the components plane +0.14W (why: flat sticks are edge-on slivers from low; from +48° their slots and the empty sockets read like a floor plan — the meaning change is entirely angular) | **`storage_ssd` +0.28W**, 0.388–0.433; **`memory_ram` +0.28W**, 0.400–0.445 (+0.012 stagger — two parts, one family) | `label.storage` in 0.409–0.424; `label.memory` in 0.421–0.436; `copy.B4` in 0.421–0.436 / full 0.436–0.491 / out 0.491–0.506 (anchor computed on the last family member) | **H4** 0.445–0.569 (0.124) — the longest hold: the mid-story exhale after the recognition beat |
| **B5** | 0.569–0.648 | 6145–6998 | holds at `P3` (why: same layout question, same lens; a move here would be decoration) | **`support_board_io` / `_wireless` / `_aux` +0.28W each**; starts **0.569 / 0.581 / 0.593** (left→right physical order), windows 0.040 each (ends 0.609/0.621/0.633). Generalization: for n boards, starts at 0.569 + 0.012k, window 0.040; if n > 4 the offsets compress so the group completes by 0.633 | `label.support` (one group label) in 0.612–0.627; `copy.B5` in 0.612–0.627 / full 0.627–0.677 / out 0.677–0.692 | **H5** 0.633–0.648 (0.015) |
| **B6** | 0.648–0.865 | 6998–9342 | `P3 → P4` 0.648–0.693 (runs under `copy.B5`'s tail): elevation +48°→+24°, azimuth +30°→+24°, distance 2.95→2.90W, target the board/chassis gap +0.11W (why: the gap about to open is a vertical event — it needs a near-horizontal lens) | **`mainboard` +0.14W**, window **0.693–0.743** (deliberately less than the components' +0.28W so it hangs below the parts that came off it; ≈ 0.13W measured clearance) | `copy.B6` in 0.717–0.732 / full 0.732–0.862 / out 0.862–0.877 (the longest-lived card — its second clause is read while the emptied Chassis carries the frame); `label.mainboard` in 0.717–0.732; **`label.chassis` + `label.battery` in 0.797–0.812, one shared slot (D-015)** — named while they sit | **H6** 0.743–0.865 (0.122) |
| **B7** | 0.865–0.928 | 9342–10022 | `P4 → P5` retreat 0.865–0.928; the lateral offset eases to zero across the same window, re-centering the stack 62vw → 50vw (why: the subject is no longer one part but the whole constellation; the retreat and the spread are one exhale — **the one sanctioned dual-mover exception**) | all planes glide to final ranks, staggered bottom-to-top, 0.007 offsets: **`mainboard` → +0.36W** (0.865–0.910); **components plane as one group → +0.72W** (0.872–0.916); **`lid` → +1.08W** (0.879–0.922); **`chassis` stays 0**. Arrivals land 0.910/0.916/0.922 — a chord, not an arpeggio | **all 9 labels out 0.862–0.877** (BATTERY rides the Chassis slot), concurrent with `copy.B6`'s out — one clearing gesture (labels tracking moving anchors read as noise; the diagram re-assembles fresh on arrival) | — (the beat is one continuous gesture) |
| **B8** | 0.928–1.000 | 10022–10800 | holds at `P5` for the whole beat (why: the destination earns stillness; the 0.928–0.930 sliver before the label re-entry is the hold's first breath) | none — nothing moves again | 9 labels re-enter **0.930–0.957** in 8 stagger slots (stagger 0.003/slot, ramps 0.006, top-of-stack first: Lid → Cooling Fan → Heat Pipes → Storage → Memory → Support Boards → Mainboard → Chassis + Battery shared); **all enter at the active treatment** — the finished diagram has earned full emphasis everywhere. **H7 silence 0.957–0.973** (nothing enters, exits, or moves — 173 px ≈ 1.0–1.4 s). `copy.close` in 0.973–0.986; `copy.cta` in 0.988–0.998, **clickable ≥ 0.992**; `copy.signoff` in 0.992–1.000. All three persist at 1.000 | **H7** 0.957–0.973 (0.016); terminal rest at 1.000 |

### 7.4 Reading floors (verified; re-run on any copy edit)

Every card is fully visible (in-ramp end → out-ramp start) for ≥ 0.050 p = 540 px ≥ 3.0 s at the
fastest engaged pace (180 px/s). Per-card floor = `max(0.050, 0.00455 × words)`, rounded up to the
next 0.005. Word cap per card: **14** (floor 0.065).

| Card | Words | Fully visible | Width | Floor | Verdict |
|---|---|---|---|---|---|
| `copy.B1` | 10 | 0.055 → 0.105 | 0.050 | 0.050 | ✓ |
| `copy.B2` | 8 | 0.139 → 0.189 | 0.050 | 0.050 | ✓ |
| `copy.B3` | 12 | 0.253 → 0.308 | 0.055 | 0.055 | ✓ |
| `copy.B4` | 11 | 0.436 → 0.491 | 0.055 | 0.055 | ✓ |
| `copy.B5` | 10 | 0.627 → 0.677 | 0.050 | 0.050 | ✓ |
| `copy.B6` | 12 | 0.732 → 0.862 | 0.130 | 0.055 | ✓ |

Labels are held ≥ 0.040 before any exit (worst case, the shared chassis/battery slot: in-ramp ends
0.812, exit begins 0.862 → 0.050 ✓). If a copy edit widens a floor, the width comes out of the
host hold's stillness (H3/H4/H6 carry 0.068/0.124/0.122); if a hold cannot cover it, the change is
a timeline re-issue — never a silent stretch.

### 7.5 Text enter/exit grammar

- **Enter:** opacity 0→1 + translateY 16px→0 over **0.015 p** (≈ 162 px), curve `TXT-IN`. Labels:
  fade + 6px rise over the same 0.015; the active→settled demotion crossfade also runs over 0.015,
  concurrent with the next label's in-ramp.
- **Exit:** opacity 1→0 over 0.015, **no movement**, linear. One sanctioned exception:
  `copy.B0`'s exit keeps a 30px rise over a wider 0.040 window.
- **Persistence:** a card enters at its part's arrival anchor; its out-ramp begins no later than
  the next beat's part-window start. Cards may persist through and enter during *camera* windows
  (screen-fixed UI; a walking lens does not compete for reading); a card's out-ramp may overlap
  the next part's first 0.015. **Maximum one copy card on screen at any `p`** — ramps may abut
  exactly (B0-out ends 0.040 = B1-in start), never overlap. Gaps between adjacent cards: B1→B2
  0.004, B2→B3 0.034, B3→B4 0.098, B4→B5 0.106, B5→B6 0.025, B6→close 0.096.
- **Anchor exception:** `copy.B1` has no part — its in-point is the dolly's settle (0.040), timed
  so its full window sits entirely on a still frame.
- **Placement:** cards in the desktop word column / mobile bottom zone (§4.4). Labels are
  3D-anchored — projected from an anchor point on each part's near edge, drawn in screen space
  (no perspective distortion on type). The complete anchor and placement system follows.

**Label anchors (the geometry of record — §14.3(g)).** Each label's anchor is the midpoint of its
part's bounding-box face on the assigned world-X side, at the part's mid-height and mid-depth,
**computed at bind time** (`Box3.setFromObject(part)` in the rest pose, face midpoint stored as a
local offset in `part.userData.labelAnchor` beside `userData.rest`). Parts only ever translate
(§7.3: zero rotation, zero scale), so the anchor's world position each rendered frame is the
stored local offset plus the node's live position; it is projected to screen space in the same
rAF that renders the frame. The 3px dot sits on the projected anchor; the leader runs dot → chip.
Because the camera holds azimuth +24°…+38° on the positive side for the whole film (§6.7), world
+X projects screen-right and world −X screen-left at every pose — the side mapping never flips.
Expected local offsets (from §5.3's dimensions; the bind-time Box3 measurement is authoritative,
QA cross-check ±2 mm):

| Label | Anchor node | Face | Expected local offset (mm) | Desktop side |
|---|---|---|---|---|
| LID | `lid` | +X | (+152, 0, 0) | screen-right |
| COOLING FAN | `cooling_fan` | −X | (−32, 0, 0) | screen-left |
| HEAT PIPES | `heat_pipes` | +X | (+88, 0, 0) | screen-right |
| STORAGE (SSD) | `storage_ssd` | −X | (−40, 0, 0) | screen-left |
| MEMORY (RAM) | `memory_ram` | +X | (+34.8, 0, 0) | screen-right |
| SUPPORT BOARDS | `support_boards` | −X | group Box3 −X face (measured at bind; the three boards' layout defines it) | screen-left |
| MAINBOARD | `mainboard` | +X | (+131, 0, 0) | screen-right |
| CHASSIS | `chassis` | −X | (−152, 0, 0) | screen-left |
| BATTERY | `chassis_battery` (read-only Box3 — the mesh is never animated) | +X | (+95, 0, 0) from the battery mesh's own center | screen-right |

Side assignment is fixed for the life of the page and was chosen so no beat's simultaneous
entries share a side: B3's pair splits (fan left, pipes right), B4's pair splits (storage left,
memory right), B6's shared slot splits (chassis left, battery right, mainboard already right but
lifted +0.14W above the battery's height). Desktop totals at the B8 tableau: 4 chips left, 5
chips right.

**Desktop chip placement rule (teardown accumulation and the B8 diagram — one rule):**

1. **Ideal position:** the chip is vertically centered on its projected anchor, on its assigned
   side, with a horizontal leader at the nominal 36 px (clamped to the 28–64 px law).
2. **Collision test:** chips never overlap; minimum clearance between chip rectangles is 8 px
   (padded-rect intersection in screen px).
3. **Slot ladder (deterministic):** placement runs in priority order — the *active* label first
   at its ideal position, then settled labels newest-entry-first. A chip whose ideal position
   intersects an already-placed chip tries, in order: (a) extend the horizontal leader toward
   64 px; (b) leader at exactly 45° upward, up to 64 px (chip up to 45 px above anchor height);
   (c) leader at exactly 45° downward, same reach. First clear slot wins. The search is a pure
   function of the visible label set and the projected anchors, so the same `p` always renders
   the same layout, forward and backward.
4. **Boundaries:** a chip may never cross x = 34vw leftward while any copy card is at
   opacity > 0 (the quiet-zone contract) and never crosses the 24px edge safe area; a placement
   that would cross either boundary takes the next ladder slot instead. Chips MAY overlap the
   machine's silhouette — §4.2 pre-clears the contrast (`--ink` on `--alu` 6.79:1).
5. **Worked worst case:** the only same-side anchors that project near-coincident are COOLING FAN
   and SUPPORT BOARDS (−X faces ≈ 6 mm apart, same plane height from B5 on). The ladder resolves
   it at slot (b): the 45°-up chip clears the horizontally-placed one by ≥ 8 px (chip height
   ≈ 25 px at one line, ≤ 34 px wrapped at the 12ch cap, both < the 45 px reach). Every other
   same-side pair is separated ≥ 0.36W in rank height or ≥ 60 mm laterally at every pose.

At B8 all nine chips re-enter (active treatment) into the same rule — sides per the table, ladder
resolving the components-plane cluster; the mobile tableau instead uses §9.2's alternate-left/
right rule. During B2–B6 a label tracks its (possibly still-moving) anchor per frame; all labels
exit 0.862–0.877 before B7's glide, so chips never track the tableau re-rank (§7.3-B7's reason).

### 7.6 Label lifecycle (D-014a + D-015)

Named on arrival (the `a + 0.47 × (b − a)` anchor) → persist and accumulate through all following
beats → group exit 0.862–0.877 → full re-entry at B8 as the finished diagram. At any `p` exactly
one label (the most recently entered) is *active*; every earlier label is *settled*; the demotion
runs as the next label enters. At B8 all nine enter active. `label.chassis` + `label.battery`
alone enter during a hold (0.797) because their parts never move. Verified: B3's stagger yields
fan active → settled as pipes enters — never two active labels.

### 7.7 Clock-based exemptions (UI only — the timeline itself owns no clock)

1. **Loader handoff:** fill 100% → hold **150 ms** → wordmark/hairline/microtext fade **400 ms**
   ease-out → loader wall crossfades into the live scene over **600 ms**. The scene beneath is
   already composed at the live playhead — the scene itself never fades, scales, or moves during
   handoff.
2. **`cue.scroll`:** appears only if `p < 0.005` and no scroll input has occurred **2400 ms**
   after the handoff crossfade completes (**1800 ms** mobile). 300 ms ease-out fades in/out; once
   dismissed by first scroll input it never returns.
3. **CTA hover / focus feedback:** instantaneous input feedback, exempt by definition (hover
   350/400 ms specs in §4.5).

No other millisecond value may exist on the page (grep-checkable — §13.3 rule 15).

### 7.8 Scrub determinism and fast-scroll rules

Scene state = `f(smooth(p_raw))` — pure function. No accumulators, no velocity branches, no
"played once" flags, no randomness (all staggers are the fixed constants above). Reverse scroll is
the exact mirror; thresholds are 0.015 ramps, not steps, so edge oscillation produces stable
partial opacity, never flicker; a reload at any offset reconstructs the identical frame. At flick
speeds (|dp/dt| > 0.25/s): frames may be skipped but never interpolated with motion blur or
ghosting; the smoother must not overshoot at flick-terminal velocity; a card flicked past is
recoverable by scrolling back. **The motion ban list:** no bounce/elastic/spring, no teleporting,
no part rotation, no turntables or orbits-for-flavor, no motion blur or speed lines, no
crossing paths, no scale animation, no idle/breathing loops, no camera roll, no FOV animation, no
per-session randomness.

### 7.9 Ending geometry (the tableau, verified)

Final ranks from the Chassis floor: **Chassis 0 · Mainboard +0.36W · components plane +0.72W ·
Lid +1.08W** — uniform 0.36W gaps, derived: from `P5` (elevation 26°) a vertical gap g projects to
≈ g·cos 26° = 0.324W of screen height while a slab's footprint projects to ≈ 0.697W·sin 26° =
0.306W — at g = 0.36W adjacent layers clear with ≈ 0.018W of visible daylight. Parts keep their
true XZ positions — nothing is rearranged into decorative ranks. Framing check: stack top = 1.08W
+ 0.022W ≈ 1.102W (0.335 m); at 3.00W with 24° FOV, visible half-height = 0.638W → vertical margin
≈ **14%** (> the 10% floor); side margins ≥ 25%. **Past the end:** the scene container is the
document's last element (D-014c) — no footer, no snap, no scroll trap; overscroll is the
browser's own; scrolling back re-enters the timeline exactly where it rested.

---

## 8. Runtime architecture

### 8.1 Module responsibilities (ES modules, one file per concern, each under ~10 KB)

| File | Responsibility |
|---|---|
| `js/main.js` | ~2 KB entry: read `data-mode`; if not `"3d"`, dynamic-import `fallback.js` (~3 KB) and return; only in 3d mode `await import('./timeline.js')` and run the §8.10 init order. Creates the only shared mutables (`scene`, `camera`, `camRig`, `master`) and passes them down |
| `js/loader.js` | `THREE.LoadingManager` wrapping GLTFLoader (+DRACOLoader +KTX2Loader) and RGBELoader; the 13-entry byte-weighted manifest; retry; stall detection; loader handoff |
| `js/scene.js` | scene graph assembly, lights, ground plane, environment/PMREM |
| `js/camera-rig.js` | `camRig` proxy, `CAM_POSES` table, pose application, viewport fit |
| `js/timeline.js` | master timeline + `B0`–`B8` labels + part/camera/text tweens (all storyboard data as plain tables at the top of the file), the ScrollTrigger, the progress smoother |
| `js/quality.js` | tier detection, DPR policy, adaptive governor |
| `js/fallback.js` | static-mode wiring (un-overlay sections, load stills) and the §10.4 mid-session conversion (re-hide `#sr-story`, lift `aria-hidden`, restore the CTA, beat-range scroll remap), context-loss swap |
| `js/debug.js` | `?debug=1` overlay: fps, frame ms, `renderer.info` calls/triangles/textures/programs, texture-memory estimate, tier, DPR, `master.progress()`, nearest beat label, 18% gray probe. Ships but is inert without the flag |

No hidden shared state; comments only where a reason is non-obvious; no `console.log` on shipped
paths (`console.warn/error` only in failure branches). Data over logic: storyboard/creative
revisions become data-table edits reviewable line-by-line.

### 8.2 `index.html` load order (exact)

```html
<head>
  1. inline GATE script (classic, ~30 lines)   — sets documentElement.dataset.mode BEFORE first paint
  2. critical inline CSS                        — static layout + the COMPLETE loader (gradient wall,
                                                  logo mask, hairline) + [data-mode] switches
  3. <script type="importmap">                  — must precede any module script
  4. <link rel="preload"> /images/Main-Logo.png + the 2 font files
  5. <link rel="stylesheet" href="css/engineering.css">
</head>
<body>
  … semantic story markup (§10.3) …
  6. <script defer src="vendor/gsap-3.13.0/gsap.min.js">
  7. <script defer src="vendor/gsap-3.13.0/CustomEase.min.js">
     <script defer src="vendor/gsap-3.13.0/ScrollTrigger.min.js">   — both after core
  8. <script type="module" src="js/main.js">                        — runs after 6–7
</body>
```

### 8.3 Import map + gate script (transcribe exactly)

```html
<script type="importmap">
{ "imports": {
    "three": "./vendor/three-r180/three.module.min.js",
    "three/addons/": "./vendor/three-r180/addons/" } }
</script>
```

```js
(function () {
  var mode = 'static';
  try {
    var im  = 'supports' in HTMLScriptElement && HTMLScriptElement.supports('importmap');
    var rm  = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gl2 = !!document.createElement('canvas').getContext('webgl2');
    if (location.protocol === 'file:') mode = 'file';
    else if (!rm && im && gl2)         mode = '3d';
  } catch (e) { /* any throw ⇒ static */ }
  document.documentElement.dataset.mode = mode;
})();
```

GSAP loads as classic `defer` scripts (UMD globals); Three.js and our code load as ES modules via
the import map — the supported no-bundler pattern; no vendored file is ever edited. One capability
cliff: browsers lacking import maps (Chrome/Edge <89, Firefox <108, Safari <16.4) overlap almost
completely with browsers lacking WebGL2 (required by r180), and everything below the cliff gets
the designed static experience. No es-module-shims polyfill.

### 8.4 Render-on-demand (the battery rule)

```js
let raf = 0, last = 0;
function frame(now) {
  raf = 0;
  scrub.step(Math.min((now - last) / 1000, 0.1)); last = now;  // the single smoothing stage
  camRig.apply();
  renderer.render(scene, camera);
  if (scrub.pending()) request();
}
function request() { if (!raf) raf = requestAnimationFrame(frame); }
```

`request()` is called from **exactly five places**: (1) the ScrollTrigger's `onUpdate`; (2)
`scrub.pending()` — true while `|raw − smooth| > 0.0005`; (3) an accepted resize; (4) loader
milestones (first scene-ready frame, environment applied, handoff crossfade); (5) WebGL context
restoration. When scrolling stops the loop drains within ≈ 290 ms (τ·ln(0.030/0.0005) ≈ 287 ms)
and the page costs **zero** GPU/CPU until the next input (QA-6: a 10 s idle trace shows no rAF).

### 8.5 The progress smoother (the scrub feel — transcribe exactly)

```js
const scrub = {
  raw: 0, smooth: 0, TAU: 0.070, CLAMP: 0.030,
  pending() { return Math.abs(this.raw - this.smooth) > 0.0005; },
  step(dt) {                                        // dt in seconds from the rAF timestamp
    this.smooth += (this.raw - this.smooth) * (1 - Math.exp(-dt / this.TAU));
    this.smooth  = Math.max(this.raw - this.CLAMP, Math.min(this.raw + this.CLAMP, this.smooth));
    master.progress(this.smooth);
  },
};
```

Verified against the timing budgets: τ = 70 ms lag ≤ the 120 ms budget (target 80 ms); first-order
lag is monotonic — **zero overshoot by construction**; steady-state drift at 1080 px/s on the
10,800 px track = v·τ = 0.007 ≪ 0.030, and the explicit ±0.030 clamp makes the cap unconditional
at any speed; settle after input stops: 70 ms × ln(0.030/0.001) = **238 ms ≤ 250 ms**;
`1 − exp(−dt/τ)` converges identically at 30/60/120 Hz (dt capped at 100 ms for background-tab
resume). **One constant everywhere** — no coarse/fine-pointer fork. Raw 1:1 scrub fails the
damped-machine requirement; a Lenis-style smooth-scroll library is banned twice over (hijack +
cliché). Measured by QA-16.

### 8.6 ScrollTrigger configuration (no pin, no scrub value)

```js
gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create('CAM',   '0.45,0.00,0.25,1.00');
CustomEase.create('LIFT',  '0.30,0.00,0.12,1.00');
CustomEase.create('TXT-IN','0.16,1.00,0.30,1.00');
const master = gsap.timeline({ paused: true, defaults: { ease: 'none' } });  // duration 1.0
ScrollTrigger.create({
  trigger: '#scroll-track',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate:  (self) => { scrub.raw = self.progress; request(); },
  onRefresh: (self) => { scrub.raw = self.progress; request(); },
});
ScrollTrigger.config({ ignoreMobileResize: true });
```

- **No ScrollTrigger `pin`** — instead: `#stage` is `position: fixed; inset: 0; z-index: 0`
  (canvas + CSS backdrop + loader overlay while it lives); `#scroll-track` is a normal-flow
  element of height **1300vh desktop / 1700vh mobile** (= 1200vh / 1600vh of scroll *travel* plus
  the 100vh viewport; with `start: 'top top'` / `end: 'bottom bottom'`, travel = track − 100vh).
  Pinning re-parents into a pin-spacer and does per-frame transform work — the historical source
  of iOS toolbar-resize jumps — and buys nothing for a full-viewport stage.
- The ScrollTrigger carries **no `scrub` value and no tween of its own** — it only reports raw
  progress; the §8.5 smoother is the single stage that moves the playhead. GSAP's built-in numeric
  scrub is seconds-scale and cannot meet the millisecond budgets.
- Z-stack: `#stage` 0 → story text overlays 2 → nav 1000.
- DOM text is revealed by `gsap.to(el, { autoAlpha, y })` tweens **on the same master timeline**
  (same smoothed playhead ⇒ text and machine cannot desync; text reverses with the scene).
  `autoAlpha` specifically: invisible text drops out of the tab order and the accessibility tree.
  **One sanctioned exception:** `#ending`'s closing line, CTA, and sign-off tween `opacity` only —
  §10.1's ARIA design keeps them in the accessibility tree at every `p`; the CTA's tab-order and
  click gating is the `p ≥ 0.992` `tabindex`/`pointer-events` rule (§10.1). IntersectionObserver
  reveals are **not** used inside the track (they key off raw scroll and would lead the scene by
  the smoother's lag).

### 8.7 Resize + DPR policy

- `resize` + `orientationchange`, debounced **150 ms**, plus one immediate render at the new size.
- **iOS URL-bar rule:** a resize is ignored unless the width changed or the height changed by more
  than **120 px** (exceeds any toolbar delta, below any real orientation change).
- On accepted resize: renderer size, DPR re-clamp, camera aspect + portrait fit, one frame.
  `ScrollTrigger.refresh()` runs via its own handler with `ignoreMobileResize: true`.
- DPR caps: tier A **2.0** · tier B **1.75** · tier C **1.5**. MSAA on when effective DPR < 2, off
  at ≥ 2 — set once at init (a renderer cannot toggle MSAA without recreation).

### 8.8 Quality tiers and adaptive degradation

Capability-based, once, at boot — no user-agent parsing:

| Tier | Detection (in order) | Gets |
|---|---|---|
| A | fine pointer AND `min(screen.w,h) ≥ 900` CSS px AND WebGL2 | DPR cap 2.0, MSAA (< 2 DPR), shadow map 2048 |
| B | coarse pointer AND WebGL2 AND (`deviceMemory` ≥ 4 where available) AND `hardwareConcurrency ≥ 4` | DPR cap 1.75, MSAA per rule, shadow map 1024 |
| C | WebGL2 but fails a tier-B check | DPR cap 1.5, `antialias: false`, shadow map 1024, governor armed at 28 ms |
| static | fails the gate, or reduced motion, or no WebGL2 | the designed static experience (§10) |

(`deviceMemory` is Chromium-only; where absent — Safari — the check is skipped and iOS lands in B.)

**Governor:** rolling 30-frame average while scrolling; if it exceeds **24 ms** (tier C: 28 ms):
(1) DPR steps down 0.25 (repeatable, floor 1.0); (2) shadow map → 512; (3) shadows off. One step
per violation, 2 s cooldown, **no automatic re-upgrade**. Geometry and textures never degrade at
runtime.

### 8.9 Scroll normalization, jumps, focus

- **Native scroll only.** No `preventDefault` on wheel/touch, no
  `ScrollTrigger.normalizeScroll(true)`, no synthetic scrolling, no scrollbar hiding. Canvas has
  `touch-action: pan-y` and no touch listener ever calls `preventDefault`.
- `history.scrollRestoration = 'manual'` + scroll-to-top on load and `pageshow` — every visit
  starts at beat zero.
- **Jump rule:** for programmatic jumps (skip link, anchors) where |Δprogress| > 0.25, bypass the
  smoother (`scrub.smooth = scrub.raw` before the next frame) — a skip should land, not travel.
- Tab order: **skip link → nav logo → ending CTA** — nothing else (the CTA joins the tab order
  at `p ≥ 0.992`, the same threshold that makes it clickable — §10.1's `tabindex` rule; `#sr-story`
  contains no focusable elements). Skip link targets `#ending` (never `aria-hidden` — §10.1); the
  native anchor jump + jump rule lands the machine instantly in its final exploded state. The
  canvas is not focusable (no `tabindex`), has no key handlers, never traps focus. Focus visuals
  per §4.5.

### 8.10 Initialization order (`main.js`, 3d mode)

1. Read `data-mode`; bail to `fallback.js` unless `"3d"`.
2. `quality.js` → tier, DPR cap, flags — before any GL allocation.
3. Dynamic-import the graph; create renderer + scene + lights.
4. `loader.js` P2: decoders + GLB + 11 KTX2 + HDR in parallel; hairline wired to byte-weighted
   progress. `DRACOLoader.setDecoderPath('./vendor/decoders-r180/draco/')` +
   `setDecoderConfig({ type: 'wasm' })`;
   `KTX2Loader.setTranscoderPath('./vendor/decoders-r180/basis/')`,
   `workerLimit = min(4, navigator.hardwareConcurrency)`.
5. On loaded: bind `laptop_root`, the eight part nodes, **and the three `support_board_io` /
   `support_board_wireless` / `support_board_aux` children (B5 drives them individually — §6.6)
   by name, byte-for-byte**; capture rest positions for all eleven bound parts; **throw → static
   mode if any name is missing** (a malformed GLB fails loudly at integration, never ships a
   partial teardown).
6. `camera-rig.js`: build `CAM_POSES`, set FOV 24°/30° by aspect, apply the fit, set `P0`.
7. `timeline.js`: register the eases, build master timeline + labels + text tweens; create the
   ScrollTrigger; `ScrollTrigger.refresh()`.
8. Apply the 3d-mode ARIA/focus state (§10.1): remove `hidden` from `#sr-story`, set
   `aria-hidden="true"` on the `data-beat` sections (never on `#ending`), set the CTA's initial
   `tabindex="-1"` + `pointer-events: none`. Sync `scrub.smooth = scrub.raw`; warm-up render;
   loader handoff 150/400/600 ms.
9. Arm resize, context loss, adaptive governor, and the reduced-motion `change` listener (§10.1).

Nothing user-visible depends on a later step — the loader covers 1–8 and scroll works natively
throughout.

---

## 9. Responsive specification

### 9.1 Breakpoints (synthesis ruling — see §14.3(d))

One rule stated first, because it overrides width: **coarse-pointer portrait at any width gets
BOTH the mobile composition and the mobile track** — 03 §12's trigger switches composition as
well as track, so a portrait tablet (a 768–1023px or wider portrait iPad included) is a
mobile-composition device, full stop. The width rows below therefore apply to fine-pointer
devices (and to coarse-pointer *landscape*, which follows width like a desktop window):

| Range (fine pointer, or coarse-pointer landscape) | Composition | Scroll travel / track |
|---|---|---|
| **≥ 1024px** (desktop) | D-010 arrival + word-column layout (§4.4 desktop column) | 1200vh travel / 1300vh track |
| **768–1023px** (small landscape / tablet-landscape) | desktop word-column composition; the camera fit rule alone absorbs the narrower frame | 1200vh / 1300vh |
| **681–767px** (fine-pointer narrow window) | **mobile composition** (D-010's < 768px composition trigger: upper stage 50vw/40vh ≤ 88vw; title + cards centered in the bottom zone) | 1200vh / 1300vh — 03 §12's track trigger is not yet met; a desktop-class window keeps desktop-class px travel |
| **≤ 680px** (any pointer) | mobile composition | **1600vh travel / 1700vh track** |
| **coarse-pointer portrait, ANY width** (03 §12's trigger) | mobile composition | **1600vh / 1700vh** |

Rationale for the mobile track: flick momentum covers absolute pixels, not vh — desktop travel is
10,800 px; a 660px-tall phone at 1200vh would give only 7,920 px, so one hard flick (≈ 2,000–
2,500 px) would cross a whole chapter. At 1600vh × 660px = 10,560 px, absolute travel matches
desktop within 3%, so **every hold and reading floor keeps its px-and-seconds value with no change
to any normalized range** — one timeline of record for all devices.

### 9.2 Per-breakpoint composition changes

- **Desktop arrival (D-010):** closed machine right of center — subject center **62vw**,
  silhouette ≈ 38% of frame width, visual center ≈ 50vh, delivered by `P0` (4.15W, +22°). Title
  block is the word column's first tenant (left edge 7vw, max-width 33vw, centered at 50vh).
  Worked clearance: silhouette spans 43–81vw — 3vw clear of the title block's 40vw right boundary;
  during B1's dolly the growing silhouette reaches 40vw only at p ≈ 0.022, where the exiting title
  is already below half opacity. Scroll cue bottom-center, 5vh above the bottom edge. The frame
  reads: words (left) → object (right) → invitation (bottom).
- **Desktop teardown:** subject center holds 62vw ± 2vw through `P0`–`P4`; the quiet zone
  (x ∈ [4vw, 34vw], y ∈ [30vh, 70vh]) stays clear of the silhouette whenever a card is visible.
  The page's only re-composition is B7's ease to 50vw for the tableau — symmetry spent exactly
  once, on the finished diagram.
- **Mobile arrival/teardown:** machine on the upper stage, center 50vw / 40vh (the 40vh delivered
  by §6.7's vertical framing offset — a screen-space look-at offset, not a target change), width
  ≤ 88vw, ≥ 10% margins. Title + subline centered in the bottom-zone text block (subline 92vw; block
  bottom edge `max(5.4rem, env(safe-area-inset-bottom) + 4.4rem)` at arrival); scroll cue at
  `max(2.2rem, env(safe-area-inset-bottom) + 1.2rem)` — the cue appears and fades without ever
  moving the text. Cards centered (a left-ragged column at phone width reads as broken); mobile
  quiet zone = the bottom 30vh.
- **Mobile tableau:** stack framed by the fit rule; labels keep 3D anchors but **alternate
  screen-left/screen-right of the stack with 45° leader lines** so all nine fit a 390px width;
  closing block scrim-backed over the lower stack, same order, centered; CTA full-width capped at
  320px.
- **Camera refit is a framing rule, not new positions:** each pose's 16:9 framing box must fit
  with ≥ 10% margins on both axes (the §6.7 fit formula); on aspect < 0.75 the vFOV widens 24° →
  **30°** before the distance fit. Azimuth/elevation/named targets untouched — §6.7's lateral and
  vertical framing offsets are screen-space look-at offsets layered on the named targets, not
  target changes. Portrait layouts re-flow
  only text, never re-frame the machine; text is DOM at native DPR, so type stays sharp regardless
  of canvas resolution; overlay text position is plain CSS — breakpoint work never touches
  `timeline.js`.
- **Nav:** logo 150×84px desktop / 120×67px mobile.
- **`cue.scroll` idle delay:** 2400 ms desktop → **1800 ms** mobile.

### 9.3 Touch behavior

Native momentum scrolling, untouched — no mobile exceptions. `touch-action: pan-y` on the canvas;
no `preventDefault` anywhere; URL-bar growth/shrink absorbed by the 120 px resize rule +
`ignoreMobileResize`. Touch momentum arrives pre-smoothed by the OS; the one smoother constant
(τ = 70 ms) reads as the same damped machine on both input classes.

**What does not change on any device:** beat order and count, all normalized ranges and holds, all
easing curves, all part transforms in W, the stagger constants, the single-mover rule, the text
hand-off rule, the lag budgets (ms/progress — already device-agnostic), and the reduced-motion
article.

---

## 10. Fallback matrix

One designed static experience serves reduced-motion, no-JS, and no-WebGL2 (three separate
degraded designs would triple review surface for zero visitor benefit). It is a designed longform
article, not an apology.

### 10.1 The matrix (one row per branch)

| Condition | Detection | Exact experience | Assets used | Text presentation |
|---|---|---|---|---|
| `prefers-reduced-motion: reduce` | gate script at load; in 3d mode a live `change` listener is also armed. **Lifecycle (defined — §14.3(k)):** when the query flips **to** `reduce` mid-session, the page converts to static via the §10.4 procedure at the next moment `scrollY === 0` — checked immediately on the flip (already at top ⇒ convert now) and then on each ScrollTrigger update until it fires. Waiting at rest is safe: all motion is scroll-driven, so nothing moves while the visitor isn't scrolling. The reverse flip (`reduce` → `no-preference`) **never upgrades mid-session** — the static page stays; 3d applies at the next full page load when the gate script re-evaluates | **Static mode** — the linear article (§10.2). No scrubbed animation, no parallax, nothing moves without input; the only motion permitted anywhere is opacity ≤ 300 ms on scroll-into-view, and instant is the default. Zero 3D downloads | the five stills `R0`–`R4` via `<picture>` (AVIF+WebP, 1280/2560 `srcset`) | full article: 7 headed sections, all copy, captions, CTA |
| No JavaScript | nothing to detect — **static IS the default document**; `data-mode` never gets set, and all 3d styling is scoped under `[data-mode="3d"]` | the identical designed static page, byte-for-byte the same markup | same five stills (`<picture>` works without JS) | same |
| No WebGL2 / no import maps | gate script | Static mode. **No error message** — a designed track, nothing is broken | same | same |
| Load failure at runtime | loader: any failed fetch retries **once** with `?r=1` after 500 ms. GLB fails twice → static; **any** KTX2 fails twice → static (a gray-material laptop is banned); decoder wasm fails → static; HDR fails twice → stay in 3d with vendored `RoomEnvironment` at intensity 0.5; font file fails → `font-display: swap` fallback serif, no action. Stall rule: no progress event for **8 s**, or scene-ready absent **20 s** after asset fetch starts → static | `fallback.js` converts in place via the **§10.4 procedure**: loader dissolves to the static layout, sections un-overlay, stills load, and the visitor's scroll position is remapped to the article section whose beat range contains their recorded progress. Console-logged URL + status; **no error UI** | stills fetched only now | same |
| WebGL context loss | `webglcontextlost` (preventDefault + stop loop) / `webglcontextrestored` | `rebuild()`: re-run PMREM, let three re-upload on next render, render one frame at the current playhead. If restoration hasn't fired within **4000 ms** → static mode in place via the §10.4 procedure | — | story continues either way |
| Keyboard-only | — | fully usable: space/arrows/PgDn drive the same timeline because scroll is never hijacked. Tab order: skip link → nav logo → ending CTA; skip lands instantly on the exploded state (jump rule) | — | focus visuals per §4.5 |
| Screen reader | — | `#stage` is `aria-hidden="true"`. **ARIA design of record (§14.3(i)):** in 3d mode, `aria-hidden="true"` is applied by the 3d init (never in shipped markup) to the beat overlay sections `data-beat="B0"`–`B6` only — **`#ending` never receives `aria-hidden` in any mode**, so the skip link always targets a non-hidden element and the CTA never sits in a hidden subtree. `#ending`'s three items (closing line, CTA, sign-off) are the one sanctioned exception to §8.6's `autoAlpha` rule: they tween `opacity` only, staying in the accessibility tree at every `p`. The visually-hidden **canonical narrative block** `#sr-story` (title, subline, and the six beat cards in order; `.sr-only` clip technique while active) **ships with the `hidden` attribute in markup** — correct by default for static and no-JS modes, where the sections themselves are the narrative (no double reading, and no JS is needed to prevent it); the 3d init removes `hidden` (JS is guaranteed present in 3d mode), and a mid-session 3d→static conversion re-adds it (§10.4). The block deliberately excludes the closing/CTA/sign-off — those are always SR-readable in `#ending`, never duplicated. **Keyboard/focus:** the CTA is focusable exactly when it is clickable — the markup ships it plain (correct for static/no-JS); the 3d init sets `tabindex="-1"` + `pointer-events: none`, and a `timeline.js` `onUpdate` threshold check flips both to `tabindex="0"` + `pointer-events: auto` at `p ≥ 0.992` (a pure function of `p`, deterministic both directions); below the threshold, keyboard visitors reach the end via the skip link, which lands where the CTA is focusable. **No `aria-live` tied to scroll.** Heading order strict: one `h1`, `h2` per beat, no skips | — | SR order: title → subline → the six cards in beat order (all from `#sr-story`) → closing → CTA → sign-off (from `#ending`, in DOM order) |
| `file://` | gate script (`location.protocol === 'file:'`) | developer-only guard block with the §3.3 wording; unreachable in production | — | — |

### 10.2 The static article (the one structure, used by every static trigger)

Seven sections, each headed by its `h2` (§3.3); stills placed where the story has reached their
state. **The unified pairing table** (this document's single statement of 01 §7.8 = 03 §11 —
review's optional note resolved):

| Section (`h2`) | Copy | Still |
|---|---|---|
| The machine | `copy.B0` title + subline, then `copy.B1`'s sentence in the same opening section | `R0` (p 0.000, `P0`) |
| Lid | `copy.B2` | `R1` (p 0.160, `P1`) + caption LID |
| Cooling fan and heat pipes | `copy.B3` | — (text needs no placeholder) |
| Storage and memory | `copy.B4` | — |
| Support boards | `copy.B5` | `R2` closes the section (p 0.633, `P3`) + the five component-plane captions |
| Mainboard and chassis | `copy.B6` | `R3` (p 0.743, `P4`) + captions MAINBOARD, CHASSIS, BATTERY |
| The whole machine | closing line + CTA (normal in-flow `.btn-sand`) + sign-off | `R4` (p 1.000, `P5`) + the full nine-name caption list |

The `--wall-grad` backdrop runs the article's full height; same palette, type scale, nav, CTA. The
scroll cue does not exist in static mode. `.rv`-style entrance reveals are disabled under
reduced-motion. Alt text per §3.4. The five stills are rendered from the production model and
lighting (D-014b) — never AI composites, never the legacy reference slices.

### 10.3 Semantic document (the no-JS backbone — one source of markup in every mode)

```html
<main>
  <h1>…Engineering (title + subline block)…</h1>
  <div id="sr-story" class="sr-only" hidden> …canonical narrative: title, subline, six beat
    cards (§10.1) — hidden is the shipped default; 3d init removes it… </div>
  <div id="scroll-track">
    <section data-beat="B0">                      <!-- aria-hidden set only in 3d mode -->
      <h2>…beat heading…</h2> <p>…beat copy…</p>
      <picture> …AVIF + WebP sources, 1280/2560 srcset…
        <img src="assets/fallback/…" alt="…" loading="lazy"> </picture>
    </section>
    … one section per beat, DOM order = story order; stills at the §10.2 pairings …
    <section id="ending"> …closing line + <a class="btn-sand" href="/onboarding">Start a Project</a>
      + sign-off… </section>
  </div>
</main>
```

In static modes this renders as the designed longform page. In 3d mode, CSS scoped to
`[data-mode="3d"]` hides the `<picture>`s and positions the sections as overlays the timeline
reveals. One source of truth for content in every mode — the copy can never fork. `loading="lazy"`
on each still is the second guard behind QA-1 (zero `assets/fallback/` requests in 3d mode —
binding per D-013). The `#sr-story` canonical narrative block (§10.1) sits inside `<main>` before
`#scroll-track` and ships with the `hidden` attribute.

### 10.4 Mid-session 3d → static conversion (the exact procedure — §14.3(j))

Used by the load-failure/stall branch, the 4 s context-loss timeout, and the reduced-motion flip.
The un-overlaid article's natural height is nothing like the 1300vh/1700vh track, so the visitor's
absolute scroll offset is **remapped by beat, never left to the browser's clamp**:

1. Record `p` — `scrub.raw` if the ScrollTrigger is live, else the ScrollTrigger-equivalent
   `scrollY / (track height − viewport height)` clamped to [0, 1].
2. Kill the ScrollTrigger and the rAF loop; set `documentElement.dataset.mode = 'static'` — the
   `[data-mode="3d"]` overlay CSS stops applying, the sections return to normal flow, the
   `<picture>` stills become visible (and only now fetch), and the track collapses to the
   article's natural height.
3. Re-add `hidden` to `#sr-story`; remove `aria-hidden` from the beat sections; restore the CTA
   to its plain markup state (remove the `tabindex`/`pointer-events` management) — the static
   page's ARIA/focus state is exactly the no-JS page's.
4. Instant-scroll (no smooth behavior) to `section.offsetTop` of the article section whose beat
   range contains the recorded `p`: p < 0.105 → "The machine" · 0.105–0.160 → "Lid" ·
   0.160–0.343 → "Cooling fan and heat pipes" · 0.343–0.569 → "Storage and memory" ·
   0.569–0.648 → "Support boards" · 0.648–0.865 → "Mainboard and chassis" · ≥ 0.865 → "The whole
   machine". The visitor lands on the same chapter of the story they were watching.

---

## 11. Performance budgets and verification

Sizes are raw bytes on disk (`ls -l`); wire cost is lower where Vercel compresses. Caps are
ceilings, not targets. Budget rows are re-negotiated only through a decision-log entry, never by
editing tables at review time.

### 11.1 Payload (3d mode, cold cache)

| Item | Budget | Verification |
|---|---|---|
| Critical path to first paint (HTML + inline CSS/gate + `Main-Logo.png` + 2 fonts) | **≤ 300 KB** | DevTools Network, cache disabled; DOMContentLoaded + loader rendered |
| Three.js (`three.module.min.js` + `three.core.min.js`) | **≤ 750 KB** | file sizes |
| Addons (7 files + any §2.3-gate-verified transitive `libs/` files) | **≤ 180 KB** | file sizes |
| GSAP core + CustomEase + ScrollTrigger | **≤ 140 KB** (≈ 72 + 9 + 45 KB) | file sizes |
| Our JS (`js/*.js` excl. `debug.js`) | **≤ 60 KB** | file sizes |
| Decoders (draco wrapper + wasm, basis js + wasm) | **≤ 1.4 MB** | file sizes |
| GLB (`laptop.v1.glb`) | **≤ 1.8 MB** (asset-side cap 1.20 MB, expected 1.05 MB) | file size |
| Textures (11 KTX2) | **≤ 2.8 MB** (atlas caps sum to 2.80 exactly; expected 2.48 MB) | Σ file sizes |
| Environment HDR | **≤ 1.0 MB** (expected 0.85 MB) | file size |
| Static-experience stills | fallback branch only — **never fetched in 3d mode**, outside this total | QA-1 Network audit |
| **Total, 3d mode, cold cache** | **≤ 8.5 MB** | DevTools Network total |

The per-line caps sum to **8.43 MB ≤ 8.5 MB** (0.30 + 0.75 + 0.18 + 0.14 + 0.06 + 1.40 + 1.80 +
2.80 + 1.00), so every line can hit cap simultaneously. Standing rule: a line cap may be raised
only if the new sum still fits; wherever a conflict is ever discovered, **the 8.5 MB total
governs** and the lines are re-fit. Expected P2 transfer ≈ 4.4 MB (GLB 1.05 + textures 2.48 + HDR
0.85) → ≈ 3.5 s at 10 Mbps plus decode; a build that passes every cap but misses QA-2's stopwatch
still fails.

**Stills (fallback branch):** per file **≤ 220 KB** (≈ 0.18 s at 10 Mbps — static mode has no
designed loader, so every still must arrive fast enough to need none); 20-file set **≤ 1.6 MB**
repo weight (expected ≈ 1.21 MB); worst single-visitor download 5 × 130 KB = **0.65 MB** (typical
AVIF path ≈ 0.35 MB). Formats AVIF + WebP, **no JPEG tier**, delivered via `<picture>` + `srcset`.

### 11.2 Runtime

| Metric | Tier A (desktop) | Tier B (phone) | Verification |
|---|---|---|---|
| Frame rate during scrub | 60 fps; p95 frame ≤ 20 ms | 60 fps target; p5 floor ≥ 30 fps, never < 30 for over 250 ms | DevTools Performance trace over a scripted full-track scroll; on-device for tier B |
| Main-thread JS per frame during scroll | ≤ 4 ms p95 | ≤ 6 ms p95 | same trace, Scripting self-time |
| Long tasks after boot | none > 50 ms | none > 50 ms | trace, Long Tasks lane |
| Draw calls | ≤ 60 | ≤ 40 | `renderer.info.render.calls` in debug overlay at the heaviest beat (full explosion) |
| Triangles | ≤ 350 k scene total (model ≤ 150 k) | same GLB | `renderer.info.render.triangles` |
| Texture GPU memory (KTX2 stays GPU-compressed: BC7 desktop / ASTC-ETC2 mobile) | ≤ 96 MB | ≤ 48 MB (computed plan ≈ 14 MB, asset cap 24 MB) | debug-overlay estimate Σ(w×h×bpt×1.33) + `renderer.info.memory.textures` |
| Materials / programs | ≤ 16 unique (model ships 4) | same | `renderer.info.programs.length` |
| Scene-ready, cold cache | ≤ 4.0 s @ 10 Mbps | ≤ 6.0 s @ 4G profile | throttled DevTools/WebPageTest, timestamp of the fill-100% event |
| Idle cost (no input 10 s) | 0 rendered frames | 0 | trace shows no rAF |

Reference hardware for tier B: **iPhone 13 (Safari)** and **Pixel 7 (Chrome)**. The DevTools proxy
is 6× CPU throttle + 4G, but sign-off requires the real devices.

### 11.3 Pre-ship QA checklist (a release failing any row does not ship)

| # | Check | Pass condition |
|---|---|---|
| QA-1 | Cold-cache payload audit (DevTools Network, 3d mode) | within every §11.1 line AND the 8.5 MB sum; **zero requests to `assets/fallback/` (binding acceptance test per D-013)** |
| QA-2 | First paint on throttled 10 Mbps | loader (wall + wordmark + hairline) ≤ 1.0 s; scene-ready ≤ 4.0 s; handoff plays 150/400/600 ms |
| QA-3 | Full-track scripted scroll trace, tier-A hardware | 60 fps, p95 ≤ 20 ms, JS ≤ 4 ms/frame, no long task > 50 ms |
| QA-4 | Same on iPhone 13 (Safari) + Pixel 7 (Chrome) | tier-B row holds; touch momentum native; no URL-bar hitch |
| QA-5 | Debug overlay at the heaviest beat | draw calls, triangles, materials, texture memory within §11.2 |
| QA-6 | Idle test: 10 s no input | zero rendered frames in trace |
| QA-7 | Scrub determinism: 5 marked scroll positions, screenshot, reverse, re-screenshot | pixel-identical pairs (no drift) |
| QA-8 | Reduced-motion ON | static mode renders; nothing moves; zero 3D bytes fetched |
| QA-9 | JavaScript disabled | full story readable, five stills present via `<picture>`, CTA works |
| QA-10 | WebGL2 blocked (browser flag) | static mode, no error surfaced |
| QA-11 | Keyboard-only pass | space/arrows traverse the story; tab order = skip link → logo → CTA; skip lands on the exploded state instantly |
| QA-12 | Context loss via `WEBGL_lose_context.loseContext()/restoreContext()` | recovery renders the current beat; forced non-restore swaps to static within 4 s |
| QA-13 | Screen reader pass (VoiceOver + NVDA) | one coherent narrative, no churn while scrolling, headings in order |
| QA-14 | `file://` open and `/engineering/` trailing-slash request | guard message shows; 308 lands on `/engineering` |
| QA-15 | Vendor audit | file SHA-256s match `vendor/README.md`; no request leaves the origin (Network tab, full session) |
| QA-16 | Scrub-timing audit: scripted 1080 px/s scroll + hard stop, debug overlay logging `(raw − smooth)` per frame | time-lag ≤ 120 ms; drift ≤ 0.030 at all speeds; settle to \|raw − smooth\| < 0.001 within 250 ms of stop; zero sign changes after stop (no overshoot) |
| QA-17 | Node-name bind check | `scene.getObjectByName` returns non-null for `laptop_root`, all eight part names, **and the three `support_board_io`/`support_board_wireless`/`support_board_aux` children (twelve names — B5 animates the three boards individually, §6.6)** on the shipped GLB |

Asset-side QA gates are §5.6 (run per export, before integration). Copy/design audits are §13.3.

---

## 12. Loading sequence (request → scene-ready)

No poster image exists anywhere on the page (D-013). The loading experience is the empty room
before the machine is ready — a continuity cut, not a curtain. **Scroll is never locked**: the
track and story text exist in HTML from 0 ms, the loader overlay intercepts no input, and raw
progress accumulates throughout.

| Phase | What loads / happens | When | Visible to the visitor |
|---|---|---|---|
| **P0** | HTML + inline gate/CSS (the complete loader) + preloaded `Main-Logo.png` + 2 fonts (≤ 300 KB critical path) | 0 ms | **Instant first paint from inline CSS, zero asset dependency:** full-viewport `var(--wall-grad)` wall; centered CSS-masked `Main-Logo.png` wordmark in `--ink` at `min(340px, 56vw)` wide; 2rem below it a **140 × 2 px progress hairline** (track `rgba(43,35,32,.14)`, fill `--copper-ink` left→right); 1rem below that, microtext **"Preparing the machine"** in `--ink-soft`. No percentage counter, no spinner, no ellipsis |
| **P1** | GSAP ×3 (defer), `main.js`, then dynamic import of the module graph incl. Three.js (≤ 1.13 MB raw JS) — only in 3d mode | after HTML parse | loader unchanged; hairline at 0 |
| **P2** | `laptop.v1.glb` + 11 KTX2 + `studio-warm.v1.hdr` — **13 requests, fetched in parallel** (HTTP/2-multiplexed; external textures let geometry parse while textures stream); Draco + Basis workers instantiate concurrently with the first fetches | immediately after P1 resolves | **the hairline fills with real, byte-weighted progress**: fill = Σ loadedBytes / Σ expectedBytes across a 13-entry manifest (per-file expected sizes transcribed from §5.1's 13-entry manifest table into `loader.js` as denominator and fallback), using each loader's `onProgress` where the browser exposes Content-Length. Byte-weighting is what makes the bar honest — an item-count bar would leap ~8% per file and stall on the GLB |
| **P3** | scene assembly, PMREM, node bind + rest capture, warm-up render, handoff | when P2 completes (0 network) | fill reaches 100% → hold **150 ms** → wordmark + hairline + microtext fade **400 ms** ease-out → loader layer crossfades out over **600 ms**. Before the crossfade, one warm-up frame is rendered **synced to the live scroll position** (`scrub.smooth = scrub.raw`, once) — a visitor who scrolled during loading lands mid-story, no rewind, no snap. Because the loader's background is the same `--wall-grad` the stage shows, the crossfade is invisible by construction — the room never changes; the machine simply exists in it |

- **A static-mode visitor never downloads Three.js, the decoders, or the GLB** (the gate +
  dynamic import make the heavy graph opt-in).
- **Stall → static:** no progress event for **8 s**, or scene-ready absent **20 s** after P2
  starts → `fallback.js` converts to the static experience in place via the §10.4 procedure
  (scroll remapped to the article section whose beat range contains the visitor's progress). The fallback is the recovery — no error state, no intermediate "slow" caption
  (the slow-network status line is retired; its trigger cannot occur). Why these numbers: at even
  1 Mbps the GLB alone emits progress every second, so 8 s of silence means a dead edge; 20 s is
  5× the tier-A scene-ready target, past which stills-now beat 3D-later.
- **Targets:** loader visible ≤ 1.0 s; scene-ready ≤ 4.0 s @ 10 Mbps (tier A) / ≤ 6.0 s @ 4G
  (tier B). The loader is designed to be left quickly.

---

## 13. Acceptance criteria

### 13.1 Vision §12, turned into checkable items

| # | Criterion | Check |
|---|---|---|
| 1 | A non-technical visitor scrolls to the end unprompted and can say what the page was about | moderated hallway test, ≥ 3 first-time non-technical visitors: no prompts beyond the URL; afterward ask "what was that page about?" — answers must name the taking-apart and/or the promise |
| 2 | A developer asks "how was this made?" | ≥ 1 developer walkthrough; note first reaction |
| 3 | The owner would demo it from their phone without caveats | owner runs the full page on their own phone (tier-B class), signs off in writing |
| 4 | Every element traces to a story sentence | audit the build against the closed inventory (§13.2) — any on-screen element not on the list fails |
| 5 | Frame-rate and payload budgets hold | QA-1…QA-6, QA-16 all green (§11.3) |
| 6 | Reduced-motion and no-WebGL read as designed | QA-8…QA-10, QA-13 green; reviewer judges the static page as a page, not a fallback |
| 7 | Nobody can plausibly say "AI made this" | §13.3 audits all green; reviewer's judgment recorded |
| 8 | It makes someone want WebSharke to build their website | the standing test for every remaining dispute — the tie-breaker question |

### 13.2 The closed inventory (every on-screen element and its story sentence)

1. Stage backdrop — "The room's wall — the machine has to sit somewhere real."
2. Nav logo (masked, `--ink`) — "This is still WebSharke — and here's your way back."
3. Scroll cue — "You're the one holding the screwdriver — start whenever."
4. Opening title + subline — "Here's what you're about to be shown, in one breath."
5. Beat cards ×6 — "This is what's in front of you, in plain words."
6. Component labels ×9 — "Everything inside has an honest name."
7. Closing line — "You just watched the promise from the homepage happen."
8. CTA (`.btn-sand`) — "The one thing to do next, offered once."
9. Sign-off microtext — "A quiet signature, same as the homepage's baked-in copyright."
10. Loading screen — "The room was here before you arrived."
11. Skip link (focus-revealed) — "A keyboard visitor gets to the point as fast as a scroll wheel."
12. `file://` guard block (developer-only) — "A developer opening the file from disk is told
    exactly what to do instead."

Anything on screen not on this list fails review. New elements require a PM decision, not a
build-time improvisation. Deliberately absent: progress bar, nav Sign In, footer, slow-network
status line, poster.

### 13.3 Anti-AI-slop audits (each testable against the final build; any failure = rejection)

1. **Gradient census:** exactly three `gradient(` occurrences in shipped CSS (§4.5).
2. **No text-shadow, no `backdrop-filter`, no glassmorphism** (grep).
3. **No numbered eyebrows or kicker labels** ("01/02", "CHAPTER" — owner-rejected, D-006).
4. **Labels are the 9 canon names verbatim** — zero adjectives (grep the strings).
5. **Word count within mode caps** — ≤ 115 (3d) / ≤ 145 (static), counted on the rendered page.
6. **Banned-word grep zero-hit** on shipped HTML — the seven words, enumerated in §3's voice
   rules: "premium", "revolutionary", "cutting-edge", "seamless", "immersive",
   "next-generation", "masterpiece" — plus no exclamation marks in any visible string.
7. **No emoji, no icon fonts, no decorative SVG icons** — the only graphics are the machine, the
   logo, and 1px lines.
8. **Color lockdown** (§4.1) + render exposure clamps (no `#000000`/`#ffffff` pixels).
9. **Light audit:** every shadow and reflection in any held frame agrees with the single
   upper-right key; contradictory shadow directions fail.
10. **No particles, dust motes, lens flares, vignettes, film grain, or god-rays** in scene or CSS.
11. **No scroll hijacking:** native position maps deterministically to scene state; the page never
    scrolls itself, never snaps against intent, never hides the scrollbar.
12. **Closed inventory** (§13.2).
13. **Type audit:** computed `font-family` resolves to Distillery Display or Playfair Display;
    every Distillery-set glyph renders from Distillery (no mid-line fallback).
14. **Template-shape test:** delete the 3D scene mentally — what remains must not be a viable
    generic landing page; the sentences point at things.
15. **No clock on scene-anchored elements:** every label/card/part transition is a function of
    scroll progress; the only millisecond values on the page belong to §7.7's exempt list (grep
    durations and check each).

### 13.4 The review's global-question standards (the bar the build is judged against)

- **Handcrafted?** Specific easing, framing, and words with recorded reasons — down to derived
  camera distances and computed anchors.
- **AI-generated look?** Zero-hit on every audit above, at page level and process level.
- **Every animation purposeful?** The 24-row purpose audit stands — every mover has its sentence;
  a motion that cannot fill a sentence is cut.
- **Pacing engaging?** Every card clears its reading floor at the fastest engaged pace; the
  recognition beat sits mid-story; the 0.016 designed silence survives; 60–90 s engaged pass.
- **Distracting?** Nothing — one focal point per viewport, decoration is the exception.
- **Client-impressive?** The owner's phone demo (13.1.3) is the test.
- **Competes with Bruno Simon?** On discipline and input feel, not novelty — zero overshoot, zero
  drift, zero third-party bytes, zero unexplained light, measured by QA-16.
- **Competes for Awwwards SOTD?** Credibly — every finish-depth surface juries probe (loading,
  reduced-motion, no-JS, keyboard, focus, determinism, budgets) is designed and verified. When
  jury taste and a small-business owner's comprehension conflict, the owner wins.

---

## 14. Reconciliations appendix

### 14.1 Every seam and its ruling (the decision entries this document carries)

| Seam / question | Ruling | Entry | Where in this document |
|---|---|---|---|
| The copy deck (slot structure, wording, does `copy.B1` ship?) | six merged teardown cards + `copy.B1` ships; wording is 01's, windows are 03's; no `ui.progress` slot | **D-009** | §3.1, §7.3 |
| The arrival composition (62vw vs centered 50vw) | 62vw arrival is live (`P0` 4.15W / +22°, silhouette ≈ 38%); **B1 is a pure dolly** 4.15W → 2.90W; B1/B2 boundary 0.105; 50vw only at the `P5` tableau; the 50vw-centered variant retired on the record (full design preserved in review-report Round 2) | **D-010** | §6.7, §7.1, §7.3, §9.2 |
| Asset packaging (two published trees) | flat `engineering/assets/` with per-file `.vN` tokens; `fallback/` the only subdirectory; no `models/`, no `v1/` | **D-011** | §2.2, §2.4, §5.1 |
| Ground-shadow rig numbers | plane 1.2 × 1.2 m, opacity 0.35, PCFSoft, map 2048/1024, frustum ±0.45 m, bias −0.0003, normalBias 0.02 | **D-012** | §6.5 |
| Loader poster | none exists anywhere; QA-1 (zero `assets/fallback/` requests in 3d mode) is a binding acceptance test | **D-013** | §12, §11.3 |
| Label policy | named on arrival (the 0.47 anchor); persist-and-accumulate; one active label at a time with active→settled demotion; group exit 0.862–0.877; B8 re-entry all-active | **D-014a** | §7.6, §4.5 |
| Fallback stills | exactly five, at p = 0.000/0.160/0.633/0.743/1.000, rendered from the production model and lighting | **D-014b** | §5.1, §10 |
| Footer | none — the scene container is the document's last element | **D-014c** | §7.9, §3.3 |
| Progress bar | none — the machine's state of disassembly is the indicator; the 2px hairline contingency stays unbuilt (pre-priced timing: in 0.010–0.020, out 0.973–0.988) unless a future entry activates it | **D-014d** | §3.3, §13.2 |
| Battery | ships seated (`chassis_battery`, non-separating) and **named**: `label.battery` enters with `label.chassis` at 0.797; 9 labels / 14 words; the lifted variant declined (pre-priced: card "The battery. One job, and it takes the most room.", track 1300vh desktop travel / 1400vh container, 04 re-export — returns only with a superseding entry) | **D-015** | §3.2, §5.2, §7.3 |
| Copper heat pipes | raw copper approved (`#c87d52`, metallic 1.0, roughness 0.32), deviating from the reference's dark/taped pipe; `copy.B3`'s "copper" stands; 01's staged non-copper fallback sentence retired | **D-016** | §5.5, §3.1 |
| Closing line | "Websites are complicated. / You've seen how we treat complicated." adopted; **owner sign-off pending before implementation** (it reuses the homepage headline — the owner's voice, the owner's call) | **D-017** | §3.1, §14.5 |

Also inherited and binding: D-001 (docs live in `docs/engineering-demo/`, never deployed), D-002
(the predecessor page stays live and untouched), D-003 (Three.js + GSAP vendored, no build, no
CDN), D-004 (two fonts, self-hosted), D-005 (reference images are references only), D-006 (voice
and anti-hype rules), D-007 (progressive enhancement designed and reviewed), D-008 (no code until
this document passes its audit).

### 14.2 Where this document's numbers come from (ownership, for future edits)

Wording and visual/taste rules — 01. Beat numbering, ranges, timing, camera choreography — 03.
Budgets, mechanisms, mount/versioning — 02. Node/file naming, dimensions, materials — 04. An owner
may revise its own cells only together with a superseding decision entry; this document then
re-issues.

### 14.3 Resolved during synthesis (new rulings made here)

None of these changes an approved timeline, camera, or budget commitment; the one corrected
number is (m)'s static word total, where two approved documents disagreed and D-015 decides.

(a) **Meta description** — no source document specified one; §3.3 authors it ("A laptop comes
apart layer by layer as you scroll. Every part named in plain English. This is how we treat
complicated things."). Written inside D-006's voice rules; zero banned words. **Requires CD/owner
sign-off alongside D-017 before implementation.**

(b) **Brushed vs bead-blasted aluminum** — 04 §4 flagged the one wording tension left between 01
§6 ("visible brushed anisotropy at close range") and 04's spec (bead-blasted, no anisotropy
extension) for reconciliation in this document. **Ruled: bead-blasted ships** (§5.5 material #1).
Reasons: the reference art reads bead-blasted; the closest aluminum approach is 150 mm, where
anisotropic streaking would be sub-visible; the anisotropy extension adds transcoder/loader
surface for nothing; and 01 §6's underlying intent — aluminum with visible micro-character at
close range, broad soft speculars — is delivered by the noise-varied roughness (0.42–0.50). 01
§6's "brushed" word is read as material-character direction, satisfied, not as a spec.

(c) **Tone-mapping exposure** — 02 shipped 1.05 as the handoff value and delegated the final
number to this document. **Ruled: `toneMappingExposure = 1.05` is the number of record** (§6.2).
The Creative Director grades at integration against the 18% gray probe and the exposure clamps;
any change from 1.05 is a decision-log entry with CD sign-off, never a silent tweak.

(d) **Breakpoint gap** — 01/D-010 define desktop composition at ≥ 1024px and mobile at < 768px;
03 §12's pacing trigger is ≤ 680px or coarse-pointer portrait; 02 left breakpoints to the CD
(site convention 900/680). No document specified 768–1023px, and no document said whether 03
§12's trigger switches composition or only the track. **Ruled (§9.1):** coarse-pointer portrait
at any width gets **both** the mobile composition and the mobile track (1600vh/1700vh) — a
portrait iPad at 768–1023px+ is a mobile-composition device; composition and track never split on
a physical portrait device. Fine-pointer devices (and coarse-pointer landscape) split by width
alone: desktop word-column composition at ≥ 768px (the camera fit rule absorbs 768–1023px),
mobile composition below 768px — so a fine-pointer 681–767px window runs the mobile composition
on the **desktop** track, and ≤ 680px runs it on the mobile track. Normalized timeline ranges are
identical everywhere, so no combination can desync the story.

(e) **Pairing terminology** (review Round 4/5 optional note) — 01 §7.8 and 03 §11 describe the
same still/copy pairings in different vocabulary; §10.2's table is this document's single unified
statement. No content changed.

(f) **Loader manifest sizes** — the 13-entry byte-weight table in `loader.js` (§12/P2) transcribes
§5.1's explicit 13-entry per-file manifest table (per-file expected sizes for the GLB, all 11
KTX2 files, and the HDR — carried from 04's payload table so no denominator is invented) as
denominators/fallbacks; when measured encode sizes land at export, the manifest is updated to the
measured values (a data edit, not a design change).

(g) **Label anchor and desktop placement system (§7.5)** — no source document specified per-part
anchor points, desktop side assignment, or a collision rule (01 owned chip treatment, 03 owned
timing; both said only "an anchor point on each part's near edge"). Authored here: bind-time Box3
face-midpoint anchors on assigned ±X faces, a fixed side table (4 left / 5 right, chosen so no
beat's simultaneous entries share a side), and the deterministic three-slot ladder with 8 px
clearance, quiet-zone and safe-area boundaries. Constraints honored unchanged: 28–64 px leaders,
horizontal or exactly 45°, 12ch chips, §4.2 contrast pairs, §7.8 determinism.

(h) **Still-caption anchor delivery (§3.4)** — 01 §7.8 required percentage-anchor positioning but
named no mechanism. Authored here: the capture process writes `caption-anchors.json` (schema in
§3.4) to `docs/engineering-demo/asset-source/` (never deployed — D-011 untouched); values are
transcribed into the static markup as inline `--ax`/`--ay` custom properties, so the no-JS
article renders complete with zero runtime fetches.

(i) **`#ending` ARIA + `#sr-story` default state (§10.1, §10.3)** — two latent conflicts no source
document addressed: (1) an sr-only block that JS must hide cannot be hidden in the no-JS branch —
ruled: it ships with `hidden` in markup and the 3d init (where JS is guaranteed) removes it;
(2) a focusable CTA inside an `aria-hidden` overlay is an ARIA violation — ruled: `#ending` is
excluded from the 3d-mode `aria-hidden` set, its three items tween `opacity` only (the one
sanctioned `autoAlpha` exception, §8.6), and the CTA's focusability rides the existing
`p ≥ 0.992` clickability threshold via `tabindex`.

(j) **Mid-session 3d→static scroll mapping (§10.4)** — "converts in place at the visitor's scroll
offset" was undefined against an article whose height differs from the track. Ruled: record `p`,
convert, then instant-scroll to the section whose beat range contains `p` (map in §10.4) — never
the browser's clamp.

(k) **Reduced-motion `change` lifecycle (§10.1)** — "next visit-to-top" defined as the next
`scrollY === 0` (checked immediately, then per scroll update); the reverse flip never upgrades
mid-session — 3d returns only on the next full load.

(l) **B5's board sub-nodes sanctioned (§6.6, §8.10, QA-17)** — inherited seam, not caught in any
review round: 03 §3-B5 animates `support_board_io`/`_wireless`/`_aux` individually while 02 §4.1
said "never sub-meshes" and the bind/QA lists named only the eight top-level parts — a name drift
on a board child would have passed QA-17 and silently broken B5. Ruled: the three
`support_board_*` children are sanctioned animatable nodes, bound and rest-captured at §8.10 step
5 (eleven parts), and name-checked by QA-17 (twelve names).

(m) **BATTERY captions `R3` (§3.4, §3.6, §10.2)** — 01 §7.8/§8.3 gave `R3` only MAINBOARD,
CHASSIS (static total 141) while D-015 and 03 §11 put `label.battery` in `R3`'s caption set.
Decisions rule over specialist text: **BATTERY captions `R3`** — `R3` = 3 caption words, captions
total 28, static total **142** (≤ the 145 cap; the 3d total 113 is unaffected).

(n) **Transitive-import vendoring gate (§2.3)** — the 7-addon list is asserted by 02 but loader
addons carry release-specific relative imports (`addons/libs/*`); ruled: a zero-404 module-graph
check at vendoring time is a gate, and any verified transitive file joins the tree, the §11.1
addons line, and `vendor/README.md`.

(o) **`closed.png` given identity (§4.1, §5.6)** — §5.6 gate 6's silhouette standard now has a
full path (`images/Laptop/closed.png`), a description, and membership in the D-005 reference
list; the gate is executable from this document alone.

(p) **Vertical framing offset (§6.7)** — the mobile 40vh subject center had no mechanism; ruled:
a screen-space vertical look-at offset mirroring the lateral 62vw rule
(`0.10 × (2 · d · tan(vFOV/2))`, easing to zero across B7), never a change to the named targets.
Also transcribed here for self-containment: the seven banned words now appear verbatim in §3's
voice rules (list unchanged from D-006 / `docs/design-guide.md`).

### 14.4 Standing obligations on future edits

- Any copy edit → superseding decision entry + re-run of §7.4's reading-floor formula (and if a
  widened floor cannot come out of its host hold, a timeline re-issue).
- **If the owner's D-017 sign-off rewrites the closing line → re-run the §7.4 floor for
  `copy.close`** and re-check the ≤ 6-word Distillery caps rule per line (review's carried note).
- Any budget change → decision entry; the 8.5 MB total governs; line caps re-fit.
- Any asset re-master → new `.vN` URL, manifest update, §5.6 gates re-run.
- Library pin change → new vendor directory, new decision entry, SHA-256 manifest update.

### 14.5 Open questions for the owner (the only items blocking implementation)

1. **D-017 sign-off (required before any code):** the closing line — "Websites are complicated." /
   "You've seen how we treat complicated." — deliberately echoes the homepage headline. The owner
   approves it, rewrites it (→ superseding entry + floor re-run per §14.4), or replaces it. The
   same sign-off covers the page title **"Engineering"** / `<title>` **"WebSharke — Engineering"**.
2. **Meta description sign-off** (§14.3(a)) — new copy authored in synthesis; approve or rewrite
   with the CD.
3. **Whether the predecessor `Animations/laptop-teardown` page is later retired or redirected to
   `/engineering`** — explicitly an owner decision for the implementation round (D-002); nothing
   in this specification depends on the answer.

### 14.6 Out of scope (declined or deferred on the record — do not build)

- The lifted-battery variant (declined, D-015; pre-priced in §14.1's battery row).
- The progress-bar contingency (unbuilt, D-014d; pre-priced timing recorded).
- The 50vw-centered arrival variant (retired, D-010; full design preserved in review-report
  Round 2).
- The slow-network status line (retired — no trigger exists; wording withdrawn unused).
- A poster/preload of `R0` (refused, D-013).
- A hinge tilt of the Lid and a spinning fan rotor (capabilities the model offers via
  `loc_lid_hinge` and the rotor pivot; **no beat uses them** — capability offered is not motion
  owed).
- An auth-aware nav CTA (no Sign In on this page; if ever revisited, vendored client only).
- `EXT_meshopt_compression` (noted alternative to Draco; switching is one pipeline flag + a
  reasoned case, not a default).
- Any modification to `Animations/laptop-teardown/` (D-002).

---

*End of master specification. Every number above is a commitment; changes go through a
superseding `decisions.md` entry and review — never a quiet edit. Next step per D-008: the
completeness/consistency audit of this document, then the owner sign-offs in §14.5, then
implementation.*
