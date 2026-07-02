# Engineering Demo — Technical Architecture

> Owned by the **Technical Architect**. Deliverable for T-03. Governs how `/engineering` is built and how it
> performs. Constraints inherited: D-003 (vanilla HTML/CSS/JS, no build step, no bundler, no CDN request of any
> kind; Three.js + GSAP vendored with pinned versions), D-004 (Distillery Display + Playfair Display from the site
> `/fonts/`), D-007 (progressive enhancement designed, not patched), vision §11 (static Vercel deploy, `cleanUrls`).
>
> Cross-document contracts honored here: the Creative Director owns all words **and all UI design — including the
> loading experience (01 §7.6) and the focus-outline spec (01 §7.9), both implemented here as specified**; the
> Animation Director owns beat numbering, normalized scroll ranges, **the scrub-feel numbers (03 §10.2), and the
> camera spec (03 §5, §12) — this document implements them and defines only the mechanism**; the Asset Director
> owns node and file naming for 3D assets and textures (**04 §2.1's node names are used verbatim below; asset file
> base-names are 04 §6.3's, carried inside this document's `.vN` versioning mechanism — the split recorded as D-011,
> §1.2**) and all model dimensions (**04 §3.1 is the source of truth; `W` = 0.304 m everywhere in this
> document**). This document defines directories, formats, and the global budgets the others must fit inside.
>
> **Revision 2 (2026-07-01) — review-report Round 2, 02 required changes 1–4, all addressed:** §1.2 publishes the
> one asset tree as this document's own mount/versioning decision with 04's current 11-file canon inside it (every
> count and every `assets/` path in the document updated to that tree — 12→11 textures, 14→13 requests); §3.1/§4.3
> publish the ground-shadow rig as this document's final numbers (1.2 × 1.2 m / opacity 0.35 / bias −0.0003) with
> the false cross-attribution deleted; §6.4 corrects `B8` to 0.928 and adds a full transcription audit of every 03
> constant this document carries; §8.1/§8.1a refresh the stale 04 citations (GLB 1.05/1.20 MB; fallback 130 KB /
> 1.6 MB), hold the textures line at 2.8 MB (Seam F), and restate the fallback ceilings as this document's own.
>
> **Revision 3 (2026-07-01) — review-report Round 3, 02 required changes 1–4, all addressed:** §1.2 states the
> packaging seam truthfully — 04 §6.3 as published mounts `assets/v1/` with plain names and a `models/laptop.glb`
> subdirectory, so Revision 2's convergence claim ("same `.vN` scheme … differ in exactly one token") was false and
> is deleted — keeps `.vN` as the mount owner's mechanism around 04's base-name canon, rules explicitly on `models/`
> (none — reason in place), and submits the tree verbatim as the owed PM packaging entry's text (`decisions.md`
> ended at D-008 at that writing; the entry now exists as **D-011** and is cited throughout — Revision 4 below
> retires this hedge); §6.4 corrects `B2` to 0.105 and
> re-runs the transcription audit line-by-line against 03's current text, stating item by item what moved and what
> did not; §4.3 replaces the falsified prediction about 04 §7.3 with the fact of 04's normative deferral; §4.2's
> farthest-pose sentence is corrected to `P0` at 4.15W ≈ 1.26 m. Stale-tense claims about seams the Round-3 review
> verified as healed (F, G, H) in §7.2/§7.6/§8.1/§8.1a are refreshed to match 04 as revised.
>
> **Revision 4 (2026-07-01) — citation pass against the recorded rulings D-009–D-017 (Round 4, sequenced).** No
> design, derivation, or arithmetic changed in this pass. The PM has now recorded the rulings Revision 3 could only
> hedge toward, and every "submitted entry text / entry number cited the moment it exists" clause is replaced by the
> real entry number: the asset tree — flat `engineering/assets/` with `fallback/` as the only subdirectory, per-file
> `.vN` tokens, no `models/` subdirectory, base names 04's canon, geometry at `assets/laptop.v1.glb` — is **D-011**
> (§1.2/§7.6/§12.3 cite it); the B1/B2 boundary 0.105 and the `P0` 4.15W arrival are ratified as **D-010** (§4.2/§6.4
> cite it); the ground-shadow rig is **D-012** with §4.3 as the source of record and 04 §7.3 in normative deferral;
> the no-poster refusal is ratified as **D-013**, which names QA-1 (zero `assets/fallback/` requests in 3d mode) a
> binding acceptance test (§7.2/§8.1/§8.1a/§12.5); the five-still count and addresses are recorded as **D-014(b)**
> (§8.1a/§10.1). Every remaining claim about a neighbor's text was re-verified against that document as it stands
> this pass (04's converged tree, validator path, and rig quotation; 03 §3's beat ranges).
>
> **Revision 5 (2026-07-01) — review-report Round 4, 02 required changes 1–5, all addressed:** Round 4 found that
> revision 4 adopted D-011 in the header and prose but left §1.2's tree diagram and three downstream paths carrying
> revision 3's `textures/` and `env/` subdirectories — an incomplete transcription of the entry this document itself
> quotes. Corrected: §1.2's diagram now transcribes D-011's tree exactly (the 11 KTX2 files and `studio-warm.v1.hdr`
> at the `assets/` root beside `laptop.v1.glb`; `fallback/` the only subdirectory); the Seam-D sentence
> "`textures/`, `env/`, and `fallback/` stand" is restated to the flat truth and the convergence claims re-verified
> against 04 §6.3/§6.4 as published; §7.1's P2 manifest and §4.4's HDR path move to the flat paths, and every
> `assets/…` path in the document is re-checked (the `assets/fallback/` references were already correct); §1.2's
> `models/` paragraph now quotes 04 §6.3 verbatim. No design, derivation, or arithmetic changed in this pass.
>
> **Revision 6 (2026-07-01) — additive completeness pass (post-approval; awaiting its own review round).** Three
> sections are appended after §12 — **§13 Memory management**, **§14 Implementation build order**, **§15 Change
> absorption and future scalability** — plus two QA rows (QA-18, QA-19) and their table-of-contents entries.
> Nothing existing changed: no published number, path, budget, or neighbor-owned value was touched, and the new
> sections set no number of their own — every constant they cite is quoted from this document's §§1–12, a
> neighbor's published section, or a recorded D-entry. §13 consolidates the memory policy previously scattered
> through §3.2/§4.4/§8.2/§9.2 and adds the four rules no project document carried (decoder-worker teardown after
> load, the zero-allocation frame, the parse-reference drop, the no-teardown-handlers lifecycle); §14 sequences
> the implementation round that the master specification specifies but does not order; §15 consolidates the
> change-absorption rules. Section numbers §1–§12 are untouched so every
> existing citation into this document stays valid. Per D-008 discipline, these additions await review and a
> fold-in when 05 is next re-synthesized.

## Table of contents

1. [File and URL structure](#1-file-and-url-structure)
2. [Module strategy without a build step](#2-module-strategy-without-a-build-step)
3. [Rendering pipeline](#3-rendering-pipeline)
4. [Scene architecture](#4-scene-architecture)
5. [Camera system](#5-camera-system)
6. [GSAP architecture](#6-gsap-architecture)
7. [Asset loading](#7-asset-loading)
8. [Performance budgets](#8-performance-budgets)
9. [Mobile strategy](#9-mobile-strategy)
10. [Accessibility and fallback matrix](#10-accessibility-and-fallback-matrix)
11. [Error handling and resilience](#11-error-handling-and-resilience)
12. [Build organization and QA](#12-build-organization-and-qa)
13. [Memory management](#13-memory-management)
14. [Implementation build order](#14-implementation-build-order)
15. [Change absorption and future scalability](#15-change-absorption-and-future-scalability)

---

## 1. File and URL structure

### 1.1 Where the page lives: `engineering/index.html` (a directory, not a root file)

The site has two patterns: root files served by `cleanUrls` (`login.html` → `/login`) and self-contained directory
pages (`Animations/laptop-teardown/index.html`). `/engineering` uses the **directory pattern** because: (1) the page
brings ~60 files of its own (vendored libraries, decoders, the GLB and its 11 external textures, environment,
fallback stills, modules) — a directory keeps
them under one root instead of scattering `vendor/` and `assets/` through the site root, matching the predecessor's
precedent; (2) everything inside references siblings relatively (`./vendor/…`), so the page is movable — the only
root-absolute paths are the shared items D-004 and site identity require (`/fonts/…`, `/images/Main-Logo.png`,
`/images/Tab-Logo.png`, the CTA link `/onboarding`); (3) routing already works — with `cleanUrls: true` +
`trailingSlash: false`, Vercel serves `engineering/index.html` at `/engineering` and 308-redirects `/engineering/`.
No `vercel.json` routing change is needed. Folder casing matters on Vercel's Linux servers (predecessor README
documents the trap): the directory is lowercase `engineering/` and every path in the page is case-exact.
`middleware.js` gates only `/dashboard`; `/engineering` is public and needs no middleware entry.

### 1.2 Full file tree

```
engineering/
├── index.html                      # markup, inline gate script, import map, critical CSS incl. the loader (§7.2)
├── css/
│   └── engineering.css             # non-critical styles (story-section layout, overlay mode)
├── js/                             # our code — ES modules, one file per concern (§12.1)
│   ├── main.js                     # ~2 KB entry; reads the mode gate, dynamic-imports the rest
│   ├── loader.js                   # LoadingManager, byte-weighted progress, retry, loader handoff (§7)
│   ├── scene.js                    # scene graph assembly, lights, environment (§4)
│   ├── camera-rig.js               # camera proxy, pose application, viewport fit (§5)
│   ├── timeline.js                 # master timeline, the ScrollTrigger, the progress smoother (§6)
│   ├── quality.js                  # tier detection, DPR policy, adaptive degradation (§3.2, §9)
│   ├── fallback.js                 # static-mode wiring, context-loss swap (§10, §11)
│   └── debug.js                    # stats overlay, lazy-imported only when ?debug=1 (§12.4)
├── vendor/                         # version in every directory name — see the versioning rule below
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
│   │       └── environments/RoomEnvironment.js # coded fallback if the HDR fails (§11.1)
│   ├── gsap-3.13.0/                # GSAP 3.13.0 (GSAP Standard License — §1.3)
│   │   ├── LICENSE.txt             # license text copied verbatim at vendoring time
│   │   ├── gsap.min.js             # UMD build → global `gsap`
│   │   ├── CustomEase.min.js       # ships 03 §1's exact cubic-bezier curves (free since 3.13)
│   │   └── ScrollTrigger.min.js    # UMD build → global `ScrollTrigger`
│   ├── decoders-r180/              # decoder binaries from the same pinned three release
│   │   ├── draco/draco_wasm_wrapper.js + draco_decoder.wasm   # wasm only; no asm.js fallback (§7.4)
│   │   └── basis/basis_transcoder.js + basis_transcoder.wasm
│   └── README.md                   # vendor manifest: exact versions, source URLs, per-file SHA-256
└── assets/                         # flat per D-011 — mount + versioning: this document's; base names: 04 §6.3's
    ├── laptop.v1.glb               # Draco geometry; textures external via KHR_texture_basisu (04 §6.1);
    │                               #   at the assets/ root — no models/ subdirectory (D-011; ruling below)
    ├── aluminum_base.v1.ktx2       aluminum_orm.v1.ktx2
    ├── mainboard_base.v1.ktx2      mainboard_normal.v1.ktx2     mainboard_orm.v1.ktx2
    ├── modules_base.v1.ktx2        modules_normal.v1.ktx2       modules_orm.v1.ktx2
    ├── thermal_base.v1.ktx2        thermal_normal.v1.ktx2       thermal_orm.v1.ktx2
    │                               # ↑ the 11 KTX2 files (04 §5.1 — atlas A deliberately ships no normal
    │                               #   map), at the assets/ root — no textures/ subdirectory (D-011)
    ├── studio-warm.v1.hdr          # 1024×512 RGBE (§4.4), at the assets/ root — no env/ subdirectory (D-011);
    │                               #   no resolution token in the name (04's rule, adopted)
    └── fallback/                   # the ONLY subdirectory (D-011): the 5 static-experience stills × 4 encodes
                                    #   = 20 files, teardown-r{0..4}_{1280|2560}.v1.{avif|webp} (04 §9.3; §8.1a)
```

Fonts are **not** duplicated here: `index.html` declares the same `@font-face` rules as the homepage, pointing at
`/fonts/distillery-display/DistilleryDisplay-Regular.woff2` and the `/fonts/playfair-display/latin-*.woff2` files —
a visitor from the homepage already has them cached, and D-004 forbids a second copy or a third family.

**Versioning rule (no build step = no content hashing) — the mechanism is this document's own decision, as mount
and versioning owner, now recorded as `decisions.md` D-011**, the packaging entry owed since Round 1
(cross-finding 11 / Round-2 Seam D / Round-3 Seam D). D-011 is the interface of record for the tree: all runtime
assets mount at `engineering/assets/`, flat, with exactly one subdirectory (`fallback/`); versioning is per-file
`.vN` tokens, immutable once shipped; there is no `models/` subdirectory and no `v1/` version directory; base
names are the Asset Director's canon; geometry lives at `engineering/assets/laptop.v1.glb`. The diagram above is
that entry transcribed exactly — every file at the `assets/` root except the twenty stills under `fallback/` —
and 04 §6.3/§6.4 carry the identical tree under the same number (verified this pass: same root-level files, same
single subdirectory, same validator path).
One principle — a change is always a **new URL**, never an in-place edit (otherwise the §7.6 immutable headers
would serve stale bytes for up to a year) — applied at two scopes:

- **Assets: per-file `.vN` version token** (`laptop.v1.glb` → `laptop.v2.glb`), immutable once shipped. Why
  per-file beats the previous revision's `v1/` version directory (withdrawn): invalidation is per-file —
  re-mastering one texture re-downloads one file instead of a whole directory whose URLs all changed (~5 MB of
  still-valid cache thrown away per edit); and the loader already carries a 13-entry per-file manifest (§7.2), so
  per-file versions cost one name edit and zero new machinery. Discipline: **no file may live under `assets/`
  without a `.vN` token** — the §7.6 header marks the whole subtree immutable, so an unversioned file there would
  cache stale forever.
- **Vendored libraries: version in the directory name** (`three-r180/`, `gsap-3.13.0/`, `decoders-r180/`). The
  asymmetry is deliberate: a library upgrades as one unit — its internal relative imports (`three.module.min.js`
  → `./three.core.min.js`) must stay mutually consistent — so a pin upgrade is a new directory and new
  import-map/script paths, never a per-file bump.

File **base-names** inside `assets/` are 04 §6.3's canon, verbatim (interface d): **11 KTX2 textures** (atlas A
ships no normal map — 04 §5.1's reasoned deletion of `aluminum_normal`, absorbed everywhere in this document);
04's HDR-naming rule adopted with its rationale — **no resolution token in `studio-warm.v1.hdr`'s base name** (the
name states the file's role; its resolution is a property recorded in 04's provenance manifest, and a `_1k` token
would lie the moment 04 §5.3's 768×384 ladder step ships); and the twenty still names
`teardown-r{0..4}_{1280|2560}` in a **`fallback/`** directory — the tree's one subdirectory per D-011 (04 §6.3's
current text keeps its former `posters/` name withdrawn — read this pass — and §7.2's no-poster refusal is
ratified as D-013).

**Seam D, closed by D-011:** three rounds of parallel revision produced two published trees (Round 3 found this
document's flat `.vN` tree against 04's then-published `assets/v1/models/` variant — built as written, every asset
fetch 404'd, the same failure shape as Round 1's node-name break), and Round 4 found the last iteration inside
this section itself — a diagram still drawing `textures/` and `env/` against the entry this same section quotes
(corrected in revision 5; the diagram above is now the entry's). D-011 records the resolution this section
proposed: **mechanism is the mount owner's — per-file `.vN` stands** (rationale: the invalidation bullet above);
**base names are 04's canon**; and the tree is **flat** — `fallback/` is the only subdirectory, so the earlier
revisions' `textures/` and `env/` groupings do not exist: the 11 KTX2 files and the HDR sit at the `assets/` root
beside the GLB, per the entry's exactly-one-subdirectory clause. 04 §6.3/§6.4 as they stand this pass carry the
identical tree — geometry at `assets/laptop.v1.glb`, the 11 KTX2 files and `studio-warm.v1.hdr` at the same root,
`fallback/` the only subdirectory, `.vN` in every file name, `models/` withdrawn, and the validator command
reading `npx gltf-validator engineering/assets/laptop.v1.glb` (verified against 04's current text, not asserted
from memory). One tree, one entry, cited from both sides.

**The `models/` ruling (the joint question, answered from the mount-owner side and recorded in D-011):** there is
**no `models/` subdirectory — `laptop.v1.glb` sits at the `assets/` root.** Reason: the tree holds exactly one
model and no second is designed (the lifted-battery variant is declined in D-015; were a superseding entry ever to
revive it, the result is a re-export of the *same* GLB shipping as `laptop.v2.glb`, never a second file — §4.1),
and the GLB's URL is the most-referenced asset path in the project (the §7.2 loader manifest, QA-1/QA-17, 04 §6.4's
validator command) — a one-file directory adds a permanent path token to every one of those references and groups
nothing. D-011 records the ruling jointly, and 04 §6.3 states it from its own side — "ruled out by D-011,
concurred with on the merits", and "this document concurs, not merely by deferral" (04's current text, quoted
verbatim, read this pass).

The provenance manifest is deliberately **not** in this tree: it lives at
`docs/engineering-demo/asset-source/MANIFEST.md` (04 §6.3/§6.5) because it changes with every re-export, and a
mutable process document must never sit in an immutable-cached, publicly deployed directory.

### 1.3 Vendored libraries — pinned versions and licenses

| Library | Pinned version | Files vendored | License — verified for this use |
|---|---|---|---|
| Three.js | **r180** (Sep 2025 release) | `three.module.min.js`, `three.core.min.js`, 7 addon files, Draco + Basis decoder binaries — all from the same release tag | **MIT.** Vendoring and redistribution permitted. `LICENSE` copied into `vendor/three-r180/`. |
| GSAP core + CustomEase | **3.13.0** | `dist/gsap.min.js`, `dist/CustomEase.min.js` | **GSAP Standard License** (the "no charge" license). Since GSAP 3.13 (April 30, 2025, after the Webflow acquisition) GSAP is free for all use including commercial — **including every formerly-Club plugin, which is why CustomEase can be vendored** — and **self-hosting is expressly permitted**, which is what makes D-003's no-CDN rule satisfiable. Its one restriction — using GSAP to build a product competing with Webflow's site-building tools — does not apply to a portfolio demo page. GSAP is source-available, not open source: files may be vendored as-is, not modified or re-published as a derivative library. The full license text ships in `vendor/gsap-3.13.0/LICENSE.txt`. CustomEase exists here for one reason: 03 §1 specifies its four motion curves as exact cubic-beziers (`CAM`, `LIFT`, `TXT-IN`, `TXT-OUT`), and GSAP core cannot express an arbitrary cubic-bezier without it — approximating the storyboard's curves with power eases would make 03's numbers lies. |
| ScrollTrigger | **3.13.0** (must match core exactly) | `dist/ScrollTrigger.min.js` | Same GSAP Standard License; ScrollTrigger has always been in the free tier. |

Why these pins: r180 is a mature release with the `three.core` split, `scene.environmentIntensity`, and ACES/AgX tone
mapping all stable; 3.13.0 is the first fully-free GSAP release, so pinning it removes any ambiguity about older
Club-plugin terms. Exact versions, download URLs, and SHA-256 of every vendored file are recorded in
`vendor/README.md` so the pin is auditable. Pins are frozen for the life of the page unless a decision-log entry
supersedes them — "newer exists" is not a reason on a no-build static page.

**Zero third-party requests.** No Supabase, no analytics, nothing external; the ending CTA is a plain
`<a href="/onboarding">`. (If the Creative Director's nav spec later requires the homepage's auth-aware CTA, the
client must come from the already-vendored `/js/vendor/supabase.min.js`, never a CDN.)

---

## 2. Module strategy without a build step

### 2.1 The hybrid: GSAP as classic scripts, Three.js + our code as ES modules via import map

Three.js r160+ ships **only** ES-module builds, and its addons import the bare specifier `'three'`. Without a
bundler there are three options: hand-rewrite the addons' imports (modifies vendored files, breaks SHA auditing),
concatenate (a build step in disguise), or an **import map**. We use the import map:

```html
<script type="importmap">
{ "imports": {
    "three": "./vendor/three-r180/three.module.min.js",
    "three/addons/": "./vendor/three-r180/addons/" } }
</script>
```

`three.module.min.js` imports `./three.core.min.js` relatively, so the core needs no map entry — the files just sit
side by side. GSAP ships UMD, so it loads as two classic `defer` scripts exposing the `gsap` / `ScrollTrigger`
globals, which our modules read directly. This is the supported no-bundler pattern for both libraries, and no
vendored file is ever edited.

### 2.2 Script load order in `index.html`

```html
<head>
  1. inline GATE script (classic, ~30 lines)  — sets documentElement.dataset.mode BEFORE first
                                                 paint, so there is no flash of the wrong mode
  2. critical inline CSS                       — static layout + the complete 01 §7.6 loader
                                                 (gradient wall, logo mask, hairline) + [data-mode] switches
  3. <script type="importmap">                 — must precede any module script (spec rule)
  4. <link rel="preload"> /images/Main-Logo.png (the loader mask, §7.2) + 2 font files
  5. <link rel="stylesheet" href="css/engineering.css">
</head>
<body>
  … semantic story markup (§10.2) …
  6. <script defer src="vendor/gsap-3.13.0/gsap.min.js">
  7. <script defer src="vendor/gsap-3.13.0/CustomEase.min.js">
     <script defer src="vendor/gsap-3.13.0/ScrollTrigger.min.js">  — both after core (register on it)
  8. <script type="module" src="js/main.js">                 — deferred by nature; runs after 6–7
</body>
```

`main.js` is ~2 KB: read `data-mode`; if not `"3d"`, dynamic-import `fallback.js` (~3 KB) and return. Only in `3d`
mode does it `await import('./timeline.js')` — a static-mode visitor never downloads Three.js, the decoders, or the
GLB. Dynamic import is what makes the heavy graph opt-in without a bundler.

### 2.3 The gate script (mode detection, runs before paint)

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

### 2.4 Why this survives old browsers

Import maps: Chrome/Edge 89+ (2021), Firefox 108+ (2022), Safari 16.4+ (2023). Three.js r180 requires WebGL2 anyway
(WebGL1 was dropped in r163), and browsers lacking import maps overlap almost completely with browsers lacking solid
WebGL2 — so there is **one** capability cliff, not two, and everything below it gets the designed static experience
(§10): same content, no error. Browsers so old they ignore `type="module"` never run `main.js` and keep the default
static layout. No polyfill: es-module-shims is a third-party dependency, and since the fallback is designed, a shim
buys nothing.

---

## 3. Rendering pipeline

### 3.1 Renderer configuration

```js
new THREE.WebGLRenderer({
  canvas,                       // <canvas id="gl"> inside the fixed #stage
  antialias: quality.msaa,      // §3.2: true below effective DPR 2, false at ≥ 2
  alpha: true,                  // transparent canvas — the warm room is CSS, not geometry
  powerPreference: 'high-performance',
  stencil: false,
  preserveDrawingBuffer: false, // nothing reads the buffer back
});
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;   // r180 default — stated so nobody "fixes" it
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

**Transparent canvas, backdrop in CSS — why.** The warm studio backdrop (the `interior.jpg` direction) is a CSS
treatment on `#stage`. Its visual spec is the Creative Director's: the review requires 01 to add the backdrop to
its §7.1 inventory (01 required-change 6), and 04 §7.1 defers to the same owner — architecture requires only that
it be CSS, not geometry, and paints nothing until 01's spec lands.
Three reasons: the backdrop stays crisp at any DPR because it never passes through the 3D resolution scaler; DOM
text sits on the same surface, so text contrast is a CSS decision, not a renderer fight; and the GPU draws only the
laptop and its shadow — on phones, skipping full-screen backdrop fill at retina resolution is the difference between
hitting and missing the frame budget.

**Tone mapping: ACES Filmic, exposure 1.05 — why.** The scene lives or dies on aluminum reading as aluminum (vision
§7: light is the material's proof). ACES's filmic shoulder rolls the key light's specular highlights off gently
instead of clipping them to flat white — exactly what brushed metal under a warm key needs. AgX (also in r180) was
evaluated and rejected: its stronger desaturation dulls the copper heat pipes (raw copper per D-016), the one warm accent inside
the machine that the "warm room, cool machine" palette depends on. 1.05 is the handoff value; the Creative Director grades from
there and the final number lands in the master spec.

**Shadow strategy.** Exactly one shadow-casting light (the key, §4.3), PCFSoft, map size 2048 (tier A) / 1024
(tiers B–C). One `ShadowMaterial` ground plane (1.2 × 1.2 m, `opacity: 0.35`, receive-only — this document's
final rig numbers; derivation and reconciliation in §4.3) at y = 0 keeps the machine and its lifted parts
physically anchored — parts that cast no shadow float, and floating is the predecessor's documented failure
smell. `shadowMap.autoUpdate = true` costs
nothing under render-on-demand: frames only happen when something moved (§3.4).

### 3.2 Device-pixel-ratio and antialiasing policy

`renderer.setPixelRatio(Math.min(window.devicePixelRatio, cap))`:

| Tier (§9.1) | DPR cap | Reason |
|---|---|---|
| A — desktop/laptop | **2.0** | Above 2.0 the sharpness gain is invisible at viewing distance; fill cost grows quadratically. |
| B — capable phone/tablet | **1.75** | A 3× phone at 1.75 renders ~34% of native pixels — the biggest mobile GPU lever — while text stays in DOM at native DPR, so nothing readable softens. |
| C — weak/old device | **1.5** | Floor tier before static mode; pairs with `antialias: false`. |

MSAA (`antialias: true`) when effective DPR < 2, off at ≥ 2 — supersampling already exceeds what 4× MSAA adds there,
and a multisampled retina framebuffer is the page's largest single GPU allocation. Set once at init from the tier: a
renderer cannot toggle MSAA without recreation, and recreation mid-visit is never worth it.

### 3.3 Resize handling

- `resize` + `orientationchange`, debounced **150 ms**, plus one immediate render at the new size so the debounce
  window never shows a stretched frame.
- **iOS URL-bar rule:** a resize is *ignored* unless the width changed or the height changed by more than **120 px**.
  Safari fires resize as its toolbar collapses during scroll; re-allocating the drawing buffer mid-scrub is a visible
  hitch. 120 px exceeds any toolbar delta but is below any real orientation/window change.
- On accepted resize: renderer size, DPR re-clamp, camera aspect + portrait fit (§5.4), one frame.
  `ScrollTrigger.refresh()` runs via its own handler with `ScrollTrigger.config({ ignoreMobileResize: true })` set
  for the same URL-bar reason.

### 3.4 Render-on-demand (the battery rule)

A scroll-scrubbed page is idle most of its life. **Frames render only when something changed:**

```js
let raf = 0, last = 0;
function frame(now) {
  raf = 0;
  scrub.step(Math.min((now - last) / 1000, 0.1)); last = now;  // §6.2 — the single smoothing stage
  camRig.apply();                       // read proxy → camera (§5)
  renderer.render(scene, camera);
  if (scrub.pending()) request();       // smoother still converging → keep going
}
function request() { if (!raf) raf = requestAnimationFrame(frame); }
```

`request()` is called from exactly five places, nowhere else: (1) the ScrollTrigger's `onUpdate` (scroll moved);
(2) `scrub.pending()` — true while `|scrub.raw − scrub.smooth| > 0.0005` (below that the delta is sub-pixel);
(3) an accepted resize; (4) loader milestones (first scene-ready frame, environment applied, the §7.2 handoff
crossfade); (5) WebGL context restoration (§11.2). When scrolling stops, the loop drains within **≈ 290 ms** —
the §6.2 smoother tail: from the worst-case clamped error of 0.030 progress down to the 0.0005 render threshold
takes τ·ln(0.030/0.0005) = 70 ms × 4.09 ≈ 287 ms — and the page costs **zero** GPU/CPU until the next input.
(03 §10.2's settle guarantee, |smooth − raw| < 0.001 within 250 ms, is met earlier on that same decay — the math
is in §6.2.) Verification: a 10-second idle DevTools trace must show no rAF activity (QA-6).

---

## 4. Scene architecture

### 4.1 Scene graph

One root, eight part nodes. **Node names are 04 §2.1's canon, adopted verbatim — naming is interface (d), owned by
the Asset Director.** The loader binds to these strings and never reaches deeper; sub-meshes inside each part
(`lid_shell`, `cooling_fan_rotor`, …) and the `locators` group are also 04's, and the runtime touches only
`laptop_root`, the eight part nodes, and — if a hinge tilt is ever choreographed — `loc_lid_hinge` (04 §2.3).

```
Scene
├── laptop_root           (from the GLB — the only thing beats transform besides the camera)
│   ├── lid
│   ├── cooling_fan
│   ├── heat_pipes
│   ├── storage_ssd
│   ├── memory_ram
│   ├── support_boards
│   ├── mainboard
│   ├── chassis           (contains 04's non-separating chassis_battery, speakers, feet)
│   └── locators          (loc_lid_hinge, loc_ground_center — 04 §2.1/§2.3)
├── ground_shadow         (ShadowMaterial plane, built at runtime — §4.3)
├── key_light (+ target)
└── bounce_fill
```

Pivots and assembled-pose origins are 04 §2.3's: each part's node origin sits at the geometric center of its own
bounding box in the assembled pose, with the measured rest coordinates published in 04's provenance manifest
(`docs/engineering-demo/asset-source/MANIFEST.md` — 04 §6.5/§10.4). The
timeline therefore never assumes zeroed transforms: at bind time each part's rest position is captured
(`part.userData.rest = part.position.clone()`) and every beat writes `rest + Δ`, where Δ is the storyboard's
vertical offset in `W` (03 §3) converted once via `W = 0.304 m` (04 §3.1). The export contract the GLB must satisfy
(no baked shadows or lighting, no cameras/lights/animations in the file, ≤ 24 meshes, 4 materials, true separation
with all hidden faces modeled) is 04 §2.4/§3.2/§3.3's and is verified by 04 §10's checklist plus init step 5
(§12.2). The battery ruling is absorbed: `chassis_battery` is non-separating inside `chassis`, seated and label-only for
the whole timeline (D-015; 04 §1.3); if a future superseding entry ever promotes it to a moving part, it joins as
a ninth node under 04's naming — the architecture is indifferent to the count.

### 4.2 Units and scale

**1 unit = 1 meter** — glTF's native unit, so nothing rescales on import. **All dimensions are 04 §3.1's; that
table is the source of truth.** The laptop is **0.304 m wide** (closed body 304 × 212 × 15.6 mm), and the
storyboard's subject unit `W` resolves to exactly 0.304 m (03 §1 asks 04 to publish `W`; 04 §3.1 does).
`laptop_root` rests on y = 0 at world origin (04 §2.2). Camera near/far: **0.05 / 12** — tight enough for clean
depth precision at this scale, far enough that no pose ever clips: the farthest pose is **`P0` at 4.15W ≈ 1.26 m**
(03 §5.2's derived arrival distance, ratified as D-010; the previous revision's "farthest is `P5` at 3.00W"
predates that derivation and is corrected — `P5` remains 3.00W ≈ 0.91 m, no longer the far extreme), and even the worst-case
§5.4 portrait fit (a 390 × 844 viewport, aspect ≈ 0.46, pushes `P0`'s horizontal fit to ≈ 4.3 m) leaves the deepest
rendered fragment under 5 m — better than 2.5× inside the far plane.

### 4.3 Lighting rig (starting values — 01 §6 is the mood spec; the Creative Director grades; finals land in 05)

**Axis convention — 04 §2.2, adopted:** +Y up, meters; **+Z is the laptop's front edge** (toward the viewer's
default side), +X the viewer's right; hinge line at z = −0.106 m. Every coordinate below is in that frame, so the
light positions are interpretable against 04's model with no translation.

The rig implements 01 §6 literally: **one window, and the room it lights.** Key from the upper right, elevated
~40°, slightly behind the subject (three-quarter back-right); fill is *the room itself* — warm bounce from the
beige walls and floor, key-to-fill ≈ 4:1; no other source. The rejected draft's cool `#cfe0ea` fill and separate
rim light are gone: a cool fill would visibly argue with the warm room every frame (review, cross-finding 5), and
a rim is a second source no window explains — edge separation now comes from the key's back-right placement itself.
Physical light units (r180 default).

| Light | Type | Color | Intensity | Position (m) | Shadows |
|---|---|---|---|---|---|
| `key_light` | `DirectionalLight` | `#fff3dd` (01 §6's white point — late-morning sun through glass, never neutral-studio white) | 2.4 | **(2.0, 2.05, −1.4)**, target = `laptop_root`. Elevation = atan(2.05 / √(2.0² + 1.4²)) ≈ **40°** (01 §6); horizontal bearing 55° off the rear axis toward +X — the **right-rear quadrant**, agreeing with 04 §7.2's HDR window hot spot (+55°, right-rear) so the runtime shadow and every IBL reflection tell one light direction | **yes** — map 2048 (tier A) / 1024 (tiers B–C), PCFSoft, ortho frustum ±0.45 m around the laptop (the caster set's light-space extent at the B8 tableau is ≈ ±0.36 m — stack top 0.335 m projected at the 40° key — so the frustum holds with ~20% margin), `bias −0.0003`, `normalBias 0.02` — this document's rig numbers (reconciliation in the ground paragraph below): −0.0003 kills acne on the 1.2–6.6 mm plates at *both* map sizes, where the withdrawn −0.0002 was safe only at 2048 — a bias that only works on tier A would make phones the acne testbed |
| `bounce_fill` | `DirectionalLight` | `#e9ddd1` (01's `--wall-lit` — the room's own lit-wall color, so the fill is literally the wall bouncing back) | 0.6 | (−1.6, 0.9, 1.2) — front-left, low: the lit wall and floor opposite the window | no |
| Environment | IBL (§4.4) | 04's warm-room HDR — the rest of the room | `scene.environmentIntensity = 0.5` | — | — |

Key-to-fill check: key 2.4 against bounce 0.6 + the IBL's ambient term lands at 01 §6's ≈ 4:1 (two stops), graded
against an 18% gray probe sphere in the `?debug=1` overlay rather than by eye. Ground: one `ShadowMaterial` plane
(`ground_shadow`) **1.2 × 1.2 m, opacity 0.35**, receive-only, at y = 0 — **this document's final rig numbers,
recorded as D-012 with this section as the source of record**: plane 1.2 × 1.2 m, opacity 0.35, PCFSoft, shadow
map 2048 (tier A) / 1024 (tiers B–C), ortho frustum ±0.45 m, bias −0.0003, normalBias 0.02. Per D-012, 04 §7.3
defers normatively and quotes exactly these values — which 04's current text does (read this pass, not asserted
from memory). Why these and not
the withdrawn 0.9 m / 0.32: opacity 0.35 is the mood owner's number made literal (01 §6 specifies the contact
shadow at "~35% strength"); and the plane must hold the tableau's shadows — the Lid's final rank is +1.08W =
0.328 m (03 §9.1), and under the 40°-elevation key its shadow lands ≈ 0.328 m ÷ tan 40° + the lid's ≈ 0.14 m
footprint half-extent ≈ **0.53 m from center**, inside a 1.2 m plane's 0.60 m half-size with margin but clipped
by a 0.9 m plane's 0.45 m. The plane keeps the machine and its lifted parts physically anchored (parts that cast
no shadow float, the predecessor's documented failure smell). The acceptance criterion is the mood owner's, in
the mood owner's units: contact-shadow penumbra
≈ 8–12% of the laptop's width (= 24–36 mm at W 0.304 m, 01 §6), shadows warm and readable, never crushed below
`#1b1a19` (01 §6's exposure clamp). `shadowMap.autoUpdate = true` costs nothing under render-on-demand (§3.4).

No `AmbientLight`: the IBL is the ambient term, and a flat ambient is exactly the "glows without a light source"
failure the vision bans.

### 4.4 Environment (IBL)

A real environment map, not a procedural one, because aluminum's character comes almost entirely from what it
reflects: **`assets/studio-warm.v1.hdr`** (04 §6.3's base name inside this document's `.vN` token, at the
`assets/` root per D-011's flat tree — no `env/` subdirectory, no resolution token, §1.2), **1024×512
equirectangular RGBE (.hdr), file budget ≤ 1.0 MB** (this document's line; 04 §7.2 now caps at the same 1.0 MB,
expected 0.85 MB — the Round-1 1.2 MB disagreement is closed), authored by the Asset Director per 04 §7.2 to
match the warm-beige studio of `interior.jpg`
(window softbox right-rear at +55°, agreeing with §4.3's key). Loaded with the vendored `RGBELoader`, run once
through `PMREMGenerator`, assigned
to `scene.environment` only (never `scene.background` — the backdrop is CSS, §3.1); source texture and generator are
then disposed. 1024×512 is enough: the map is only ever seen as blurred reflections on metal, and 2048 doubles
memory for no visible gain at ≤ 2K screens. If the HDR fails, vendored `RoomEnvironment` substitutes at the same
intensity so the page never ships a black-metal laptop (§11.1).

---

## 5. Camera system

### 5.1 Rig: keyframed poses on the master timeline — not a spline path

The camera is driven by a plain proxy tweened on the master timeline:

```js
const camRig = { px, py, pz,    // camera position (m)
                 tx, ty, tz };  // look-at target (m)
```

Each storyboard beat contributes tweens between **poses** (position + target — nothing else; FOV is fixed by 03
and deliberately not representable in the proxy, §5.2). `camRig.apply()` runs once per rendered frame:
`camera.position.set(px,py,pz)`, `camera.lookAt(tx,ty,tz)`. `updateProjectionMatrix()` runs only at init and on
accepted resize, the only times FOV or aspect can change.

**Why poses, not a spline.** The storyboard grammar (one idea per viewport — the Apple reference) is *move → hold →
move*: each beat is a composition the Animation Director frames like a shot, holds while the copy lands, then
leaves. Pose keyframes map one-to-one onto those shots — each individually art-directable, each carrying its own
storyboard ease, and editing one beat cannot disturb its neighbors. A Catmull-Rom path couples every control point
to its neighbors (moving one bows the curve through three beats), reads as continuous travel rather than framed
shots, and makes holds awkward (zero-length segments). If a beat needs an arcing move, that beat gets an
intermediate pose — a local fix, not a global path.

### 5.2 Field of view — consumed from 03, not defined here

The camera spec is the choreography owner's (03 §5); this rig implements it. Vertical FOV is **24°, fixed for the
entire page** (≈ 55 mm full-frame equivalent — 03 §5.1's product-photography grammar), **never animated** (03 §5.1
and §6.3 ban FOV animation outright: "a focal-length change mid-move is a music-video tic"), widening to **30°**
only on portrait viewports with aspect < 0.75 (03 §12) — evaluated at init and on accepted resize, never per
frame. The rejected draft's 32° base and 24–45° tween-and-clamp policy are deleted; the proxy carries no `fov`
field (§5.1), so a build cannot animate what the data cannot express.

### 5.3 How the storyboard maps on

03 §5.2 specifies six named positions `P0`–`P5` in spherical coordinates (azimuth / elevation / distance in `W`,
look-at targets on the component under discussion); 03 §3 assigns each camera move its window and the `CAM` ease.
`timeline.js` transcribes these into one `CAM_POSES` table (a plain array literal — data, not logic): each named
position converted once to Cartesian meters via `W = 0.304 m` (04 §3.1) using 03 §5.2's azimuth convention, each
tween laid onto the master timeline at 03's addresses. The architecture guarantees any pose expressible as the
proxy is achievable; nothing else about camera motion is decided here.

### 5.4 Viewport fit — 03 §12's rule, implemented

03 §12 owns the responsive framing rule (the rejected draft's dolly-only formula was its opposite and is
withdrawn). Implementation, in 03's order:

```
1. framing box per pose, computed once at the 16:9 reference (FOV 24°):
     halfH = d · tan(12°)            // d = the pose's 03 §5.2 distance, in meters
     halfW = halfH · (16 / 9)
2. on aspect < 0.75: vfov = 30°  (03 §12 — BEFORE the distance fit, so portrait
   distances don't balloon); otherwise vfov = 24°
3. effective distance = max(dV, dH), where
     hfov = 2·atan(tan(vfov/2) · aspect)
     dV   = halfH / (0.90 · tan(vfov/2))      // box fits with ≥ 10% margin,
     dH   = halfW / (0.90 · tan(hfov/2))      // both axes (03 §12)
   position vector scaled away from the target along the view ray to that distance
```

Azimuth, elevation, and targets are never touched — 03 §12: the camera grammar is device-independent. Applied per
pose at load and on accepted resize (then one frame renders, §3.3). Perspective character shifts only by the
sanctioned 24→30° portrait step; the Creative Director's portrait layout re-flows only text, never re-frames the
machine (§9.4).

### 5.5 Damping — one smoothing source only

All smoothing lives in the §6.2 progress smoother and **nowhere else** — no per-frame camera lerp, no smoothing on
the target. Two damping stages in series create exactly the drift/desync the vision forbids ("reversing scroll
reverses the scene exactly"); with a single stage, scene state is a pure function of the smoothed playhead —
03 §10.1's model, verbatim — which converges exactly to the scroll position at rest. The "heavy, well-damped
machine" feel is entirely the smoother's time constant, **τ = 70 ms**, chosen to sit inside 03 §10.2's lag budget
(≤ 120 ms, target 80 ms) with the full derivation in §6.2. Feel is the timing owner's; this rig only carries it.

---

## 6. GSAP architecture

### 6.1 One master timeline

```js
gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create('CAM', '0.45,0.00,0.25,1.00');    // 03 §1's curves, registered once, names verbatim
CustomEase.create('LIFT', '0.30,0.00,0.12,1.00');
CustomEase.create('TXT-IN', '0.16,1.00,0.30,1.00');
const master = gsap.timeline({ paused: true, defaults: { ease: 'none' } });  // total duration 1.0
// … tweens + labels laid at 03 §3's normalized addresses …
ScrollTrigger.create({
  trigger: '#scroll-track',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate:  (self) => { scrub.raw = self.progress; request(); },  // §3.4 — the render driver during scroll
  onRefresh: (self) => { scrub.raw = self.progress; request(); },
});
```

Everything scrubs from this one timeline: camera proxy, the eight part nodes, DOM text reveals. The timeline is
**paused and exactly 1.0 s long by construction**, so timeline time = normalized progress and every 03 §3 address
transcribes with zero arithmetic. The ScrollTrigger carries **no `scrub` value and no tween of its own** — it only
reports raw progress into `scrub.raw`; the §6.2 smoother is the single stage that moves the playhead
(`master.progress(scrub.smooth)` inside the render loop). GSAP's built-in numeric scrub is not used because its
catch-up constant is seconds-scale and cannot meet 03 §10.2's millisecond budgets (the rejected 0.7 s draft missed
the lag budget ~6× — review, problem 02-1). One timeline makes "the scrollbar is the timeline" literally true —
one source of truth, perfectly reversible, and a single number (`master.progress()`) describes the whole page state
for debugging and QA. `defaults: { ease: 'none' }` keeps the scroll→time mapping linear; expressive shaping comes
from 03 §1's named curves, registered above via the vendored CustomEase so the storyboard's exact cubic-beziers
ship, not approximations (a shaped default would silently bend every beat and make the storyboard's stated eases
lies; `TXT-OUT` is `'none'` — linear — and needs no registration).

### 6.2 The progress smoother — 03 §10.2 implemented, with the math shown

Timing is the Animation Director's; 03 §10.2 states it as numbers: smoothed `p` trails raw `p` by **≤ 120 ms
(target 80 ms) and never more than 0.030 progress** at a sustained 1080 px/s scroll; after input stops,
**|smooth − raw| < 0.001 within 250 ms**; **critically damped, zero overshoot**; native scroll only. The
implementation is ours (~8 lines in `timeline.js`), stepped from the render loop (§3.4):

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

Each constant, verified against each 03 §10.2 line:

- **First-order exponential lag, τ = 70 ms.** Under sustained scrolling the smoothed value trails the raw value by
  exactly τ in time: **70 ms ≤ the 120 ms budget, under the 80 ms target.** A first-order lag approaches its
  target monotonically — **zero overshoot by construction** (it is the fastest non-oscillating case, i.e. the
  degenerate limit of critical damping), so the playhead can never carry the scene past a hold boundary and back.
- **Progress drift.** At 1080 px/s on the 10,800 px reference track (03 §1), raw velocity is 0.100 progress/s;
  steady-state drift = v·τ = **0.007 ≪ 0.030**. The explicit **± 0.030 clamp** makes 03's drift cap unconditional
  at *any* speed (even a 03 §10.3 flick at 0.25 progress/s, which would drift only 0.0175 unclamped) instead of
  merely argued.
- **Settle.** When input stops, the worst possible error is the clamp value 0.030; first-order decay reaches 0.001
  in τ·ln(0.030/0.001) = 70 ms × 3.40 = **238 ms ≤ 250 ms**. The render loop draws slightly longer, to the
  sub-pixel 0.0005 threshold: 70 ms × 4.09 ≈ 287 ms — §3.4's ≈ 290 ms drain figure.
- **Frame-rate independence.** `1 − exp(−dt/τ)` with the real rAF `dt` converges identically in wall time at 30,
  60, or 120 Hz — 03 §10.1's determinism cannot depend on refresh rate. (`dt` is capped at 100 ms so a background
  tab resuming doesn't integrate one giant step.)
- **One constant everywhere.** No coarse/fine-pointer fork (the rejected 0.7/0.4 split is gone): 03 §12 states its
  timing budgets are ms/progress and already device-agnostic, and touch momentum arrives pre-smoothed by the OS —
  τ = 70 ms reads as the same damped machine on both.

`scrub: true`-style raw 1:1 (no smoothing) fails the damped-machine requirement; a Lenis-style smooth-scroll
library is rejected twice over — it is a scroll hijack (vision ban) and a listed Awwwards cliché. Verification is
**QA-16**: a scripted 1080 px/s scroll with the debug overlay logging `(raw − smooth)` must show time-lag ≤ 120 ms,
drift ≤ 0.030, settle-to-0.001 ≤ 250 ms, and no sign change in `(raw − smooth)` after input stops (zero overshoot).

### 6.3 Pinning strategy: fixed stage + scroll track — no ScrollTrigger `pin`

The canvas never scrolls, so nothing needs pinning:

- `#stage` — `position: fixed; inset: 0; z-index: 0` — holds the canvas and the CSS backdrop for the page's life
  (plus the §7.2 loader overlay while it lives).
- `#scroll-track` — a normal-flow element of height `TRACK_VH`: **1300vh desktop / 1700vh mobile**, transcribed
  from the storyboard's *travel* numbers — 03 §1 specifies 1200vh of scroll travel (desktop) and 03 §12 specifies
  1600vh (mobile); with `start: 'top top'` / `end: 'bottom bottom'`, travel = track height − 100vh of viewport,
  hence 1300/1700. (Stated as the travel-to-container arithmetic on purpose: 03's own revision list flags its
  mixed container/travel wording, and the travel numbers are the ones its pacing math is built on.) The track
  contains the story sections (§10.2) and drives the single ScrollTrigger.

Reason over `pin: true`: pinning re-parents into a pin-spacer and applies per-frame transforms — extra layout work
in the scroll path and the historical source of iOS toolbar-resize jumps — and buys nothing when the pinned element
would be full-viewport for ~100% of the page anyway. The predecessor's sticky stage is the same idea; `fixed` +
track is its cleanest form. Nav sits above at `z-index: 1000` (site pattern); story text overlays at `z-index: 2`.

### 6.4 Labels — the Animation Director's beat IDs, verbatim

One label per storyboard beat at 03 §3's start address, named `B0`–`B8` exactly as 03 names them (the timeline is
1.0 long, §6.1, so addresses transcribe unchanged). The full set — written out in full precisely because elision
hides transcription errors: the Round-2 pass hid `B8` 0.918 (03: 0.928), and the Round-3 pass carried `B2` 0.075
across 03's opening retime (03: **0.105**, the new B1/B2 boundary, Lid part window 0.105–0.145 — since ratified as
**D-010**, which retires every 0.075 variant on the record) while its audit claimed a re-verification it had not
run for that constant — the exact failure the audit was added to prevent. Corrected in revision 3, the audit run
item by item, and re-confirmed this pass against 03 §3 as D-010 ratifies it:

> `B0` 0.000 · `B1` 0.000 (B0 is the arrival *state*, B1 the first range — they legitimately share the address,
> 03 §3) · **`B2` 0.105 (D-010)** · `B3` 0.160 · `B4` 0.343 · `B5` 0.569 · `B6` 0.648 · `B7` 0.865 · `B8` 0.928

This document invents no ranges: every number in `timeline.js`'s data tables is a transcription from 03 §3,
reviewable line-by-line against it. **Transcription audit — every 03 constant this document carries, each item
re-read this pass at its cited 03 section (result stated per item, not asserted in bulk):** the nine label
addresses above against 03 §3's beat ranges (B1 0.000–0.105 · B2 0.105–0.160 · B3 0.160–0.343 · B4 0.343–0.569 ·
B5 0.569–0.648 · B6 0.648–0.865 · B7 0.865–0.928 · B8 0.928–1.000 — only `B2` moved in the opening retime,
corrected above; the 0.105 boundary and the 0.105–0.145 Lid window are D-010's recorded values); scroll travel 1200vh/1600vh → containers 1300vh/1700vh in §6.3 (03 §1/§12 — unchanged); the
10,800 px reference track and the 0.25 progress/s flick bound in §6.2's derivations (03 §1/§10.3 — unchanged);
03 §10.2's four scrub numbers in §6.2 (lag ≤ 120 ms target 80 ms, drift ≤ 0.030, settle 250 ms, zero overshoot —
unchanged); the text-ramp grammar — 0.015 progress, 16 px rise, `TXT-IN` in, linear out — in §6.5 (03 §7.3 —
unchanged); the four ease beziers in §6.1 (03 §1 — unchanged); the farthest-pose figure in §4.2 (**`P0` 4.15W** —
03 §5.2's derived arrival distance, ratified as D-010; corrected in revision 3 from the stale "`P5` 3.00W is
farthest"); the Lid
tableau rank +1.08W and stack top 1.102W ≈ 0.335 m in §4.3 (03 §3-B7/§9.1 — unchanged); and the still addresses
`R0`–`R4` = 0.000/0.160/0.633/0.743/1.000 in §8.1a/§10.2 (03 §11 — unchanged, and now recorded as D-014(b); 03
states they survive the retime because only 0.000–0.160's interior moved and `R1` sits on the untouched 0.160
boundary). Labels are the shared
vocabulary: QA jumps to them (`master.seek('B4')` in the debug console), text tweens anchor to them, and review
verifies the built timeline against the storyboard label by label.

### 6.5 DOM text synced to the 3D timeline

Beat copy (the Creative Director's words, referenced by slot) lives in real DOM (§10.2) and is revealed by
`gsap.to(el, { autoAlpha, y })` tweens placed on the **same master timeline** at 03 §3's slot addresses — 0.015
progress ramps, `TXT-IN` in / linear out, 16 px rise, exactly 03 §7.3's grammar. Same timeline ⇒ same smoothed
playhead ⇒ text and machine cannot desync by construction, and text reverses with the scene. `autoAlpha`
specifically (opacity + `visibility: hidden` at 0): invisible text drops out of the tab order and the accessibility
tree, which §10.5 depends on. IntersectionObserver reveals (the homepage `.rv` pattern) are **not** used inside the
track — they key off raw scroll, not the damped playhead, and would visibly lead the scene by up to the smoother's
lag.

### 6.6 Scroll normalization and the no-hijack rule

**Native scroll only.** No `preventDefault` on wheel or touch, no `ScrollTrigger.normalizeScroll(true)` (it
intercepts native scrolling — the same hijack by another name), no synthetic scrolling. Wheel detents, trackpad
glides, touch momentum, keyboard (space/arrows/PageDown), and scrollbar drags all work because the browser handles
them; per-device delta differences are absorbed by the smoother, which is the point of having it (03 §10.2's
native-scroll line lands here).
`history.scrollRestoration = 'manual'` + scroll-to-top on load and `pageshow` (the site's existing pattern in
`index.html`) guarantees every visit starts at beat zero with the closed machine.

**Jump rule:** for programmatic jumps (skip link §10.5, anchors) where `|targetProgress − currentProgress| > 0.25`,
the smoother is bypassed (`scrub.smooth = scrub.raw` before the next frame) instead of damped — even at τ = 70 ms
a damped fast-forward through half the teardown flashes intermediate states the visitor never asked to see; a skip
should land, not travel.

---

## 7. Asset loading

### 7.1 Loading manager and phases

One `THREE.LoadingManager` wraps GLTFLoader (+ DRACOLoader + KTX2Loader) and RGBELoader.

| Phase | What | When | Bytes (budgets §8) |
|---|---|---|---|
| P0 | HTML + inline gate/CSS (including the complete 01 §7.6 loader — gradient wall, logo mask, hairline: CSS only) + preloaded `Main-Logo.png` + 2 fonts | 0 ms | ≤ 300 KB critical path |
| P1 | GSAP ×3 (defer), `main.js`, then dynamic import of the module graph incl. Three.js | after HTML parse, only in `3d` mode | ≤ 1.13 MB raw JS |
| P2 | `laptop.v1.glb` + the 11 `*.v1.ktx2` textures + `studio-warm.v1.hdr` — all at the `assets/` root (flat tree, D-011, §1.2) — fetched **in parallel**: 13 requests, HTTP/2-multiplexed; external textures are 04 §6.1's packaging, adopted (§1.2), so geometry parses while textures stream; Draco + Basis workers instantiate concurrently with the first fetches | immediately after P1 resolves | GLB ≤ 1.8 MB, textures ≤ 2.8 MB, HDR ≤ 1.0 MB, decoders ≤ 1.4 MB |
| P3 | scene assembly, PMREM, warm-up render, loader handoff (§7.2) | when P2 completes | 0 network |

Prioritization: the GLB and atlas B (the mainboard's maps — 04's largest) are the long poles, so nothing queues
ahead of P2's fetches; decoder wasm compiles while bytes stream (why the workers start first). External textures
are also what lets a texture arrive late without blocking geometry — the scene can assemble and the handoff simply
waits for the manager's `onLoad`. Lazy: `debug.js` (only `?debug=1`), `fallback.js` (only non-3d modes), and the
static-experience stills — referenced only by static-mode markup, so the 3d path never fetches them
(`loading="lazy"` on each as a second guard; QA-1 verifies zero `assets/fallback/` requests in 3d mode, a binding
acceptance test per D-013).

### 7.2 The loading experience — 01 §7.6's designed loader, implemented (one loader across documents)

Loading UI is the Creative Director's; 01 §7.6 designs it ("the empty room before the machine is ready") and this
section implements it, adding only the mechanics 01 delegates. The rejected draft's poster-first design — and its
"no progress bar" stance — is **withdrawn** (review, cross-finding 6: one loading experience, 01 owns it). **This
section's no-poster refusal is ratified as D-013:** no poster image exists anywhere on the page; the loading
experience is 01's inline-CSS empty-room design; the first rendered frame of the 3D scene is the first image the
visitor sees; and `R0` is never requested in 3d mode. D-013 names **QA-1 — zero `assets/fallback/` requests in
3d mode — as a binding acceptance test** (§12.5). The reasoning D-013 records is this section's: a poster
duplicates the first frame at real download cost, and two first frames would be two designs.

- **At 0 ms / first paint:** 01's loader, entirely from inline CSS with one image dependency: the three-stop
  gradient wall (`--wall-lit` → `--wall` at 62% → `--wall-shade`), the CSS-masked `Main-Logo.png` wordmark at
  `min(340px, 56vw)` in `--ink`, the 140 × 2 px progress hairline (track `rgba(43,35,32,.14)`, fill
  `--copper-ink`), microtext "Preparing the machine" (copy deck). `Main-Logo.png` is `<link rel="preload">`ed
  (§2.2) and is already cached for any homepage arrival. No percentage counter, no spinner (01's rules).
- **The hairline is real, byte-weighted** (01: "driven by real asset-loader progress — a fake-timed bar on an
  engineering page would be a small lie"): fill = `Σ loadedBytes / Σ expectedBytes` across the P2 manifest, using
  each loader's `onProgress` `ProgressEvent` (`loaded/total` from Content-Length) where the browser exposes it and
  the file's expected size — a 13-entry table (the GLB, 11 textures, the HDR) transcribed from 04 §5.3 into
  `loader.js` — as denominator and fallback. Byte-weighting is what makes the bar honest: an item-count bar would
  leap ~8% per file and stall visibly on the GLB.
- **Handoff — 01 §7.6's timings, verbatim:** fill reaches 100% → hold **150 ms** → wordmark + hairline + microtext
  fade **400 ms** ease-out → loader background crossfades into the live scene over **600 ms**. Before the
  crossfade begins, the scene has rendered one warm-up frame synced to the *live* scroll position
  (`scrub.smooth = scrub.raw`, once) — a visitor who scrolled during loading lands mid-story with no rewind and no
  snap. Because the loader's gradient is the scene's own wall palette, the cut reads as the room having been there
  all along (01's continuity intent). The crossfade is `request()` call site 4 (§3.4).
- **Scroll is never locked** during loading: the track and story text exist in HTML from 0 ms, the loader overlay
  intercepts no input, and native scroll accumulates raw progress throughout (§7.3).
- **Stall → static, with the numbers 01 delegates** ("the Technical Architect's timeout budget"): if **no progress
  event arrives for 8 s**, or scene-ready has not occurred **20 s** after P2 starts, `fallback.js` converts the
  page to the static experience in place (§10) — 01 §7.6: "the fallback is the recovery, so there is no error
  state to design." Why these numbers: at even 1 Mbps the GLB alone emits progress every second, so an 8 s silence
  means a dead edge, not a slow one; 20 s is 5× the tier-A scene-ready target, past which stills now beat 3D later.
- **Scene-ready target: ≤ 4.0 s at 10 Mbps** (§8.2, QA-2) — the handoff starts the moment the warm-up frame
  exists, so the loader's designed life is short by construction (01 §10: a loader "designed to be left quickly";
  the Bruno reference's loading *tolerance* is explicitly fenced out).

### 7.3 Scroll before ready

The page scrolls natively from 0 ms (track and text exist in HTML; the loader overlay intercepts no input). Raw
progress accumulates while the machine loads; at handoff the playhead syncs (`scrub.smooth = scrub.raw`) before
the first visible frame (§7.2), so the scene appears already at the visitor's position. If loading falls to static
mode instead (§7.2 stall rule), the visitor is already at their scroll offset in the designed static page — the
predecessor's static-first principle carried forward.

### 7.4 Decoder vendoring (no CDN)

`DRACOLoader.setDecoderPath('./vendor/decoders-r180/draco/')` + `setDecoderConfig({ type: 'wasm' })` — wasm only;
the ~800 KB asm.js fallback decoder is not vendored because every browser passing the §2.3 gate has WebAssembly.
`KTX2Loader.setTranscoderPath('./vendor/decoders-r180/basis/')`, `workerLimit = min(4, navigator.hardwareConcurrency)` —
four transcode workers saturate the win on desktop without starving a phone's main thread. No cross-origin isolation
is needed (no SharedArrayBuffer), so Vercel's default headers suffice.

### 7.5 Content-Security-Policy constraint

The site CSP (`vercel.json`) sets no `script-src`, so wasm compiles fine today. **Standing rule:** if a `script-src`
is ever added site-wide, it must include `'self'` and `'wasm-unsafe-eval'`, or both decoders die at runtime.
Recorded here because that failure would surface months later looking like an asset bug.

### 7.6 Cache headers

Vercel's static default is `cache-control: public, max-age=0, must-revalidate` + ETag — right for HTML, wasteful for
6+ MB of immutable versioned binaries (every revisit pays a revalidation round-trip per file). The implementation
round adds to `vercel.json` (illustrative):

```json
{ "source": "/engineering/(vendor|assets)/(.*)",
  "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
```

Safe because of §1.2's versioning rule (this document's, as mount owner — recorded as D-011): every binary under
the pattern carries its version in its URL — assets per file (`.vN`), vendored libraries per directory
(`three-r180/`) — so a change is always a new URL and the old one may be cached forever without risk. The pattern
covers the whole asset tree because D-011 mounts it at `engineering/assets/`; the only scheme it would not have
covered — 04's Round-1 repo-root mount, under which every multi-megabyte binary would have revalidated on each
visit — is retired with the rest of the pre-D-011 variants.
`index.html`, `css/`, `js/` keep the revalidating default so logic fixes ship instantly.

---

## 8. Performance budgets

Sizes are raw bytes on disk (verify: `ls -l`); wire cost is lower where Vercel compresses. Every budget has an owner
and a verification method; the Reviewer checks that the Asset Director's per-asset budgets in 04 sum inside these.

### 8.1 Payload

| Item | Budget | Reason | Verification |
|---|---|---|---|
| Critical path to first paint (HTML + inline CSS/gate + `Main-Logo.png` + 2 fonts) | **≤ 300 KB** | ≤ 1.0 s first paint at 10 Mbps — the "visitor gives us seconds" rule; the loader is CSS + one already-cached logo (no poster exists — D-013, §7.2), so the old 400 KB line tightens rather than gaining slack | DevTools Network, cache disabled; DOMContentLoaded + loader rendered |
| Three.js (`three.module.min.js` + `three.core.min.js`) | **≤ 750 KB** | r180's actual build size + slack; a future pin exceeding this means the pin is wrong, not the budget | file sizes |
| Addons (7 files) | **≤ 180 KB** | GLTF/Draco/KTX2/RGBE loaders + utils are ~150 KB in r180 | file sizes |
| GSAP core + CustomEase + ScrollTrigger | **≤ 140 KB** | 3.13.0 minified ≈ 72 + 9 + 45 KB | file sizes |
| Our JS (`js/*.js` excl. debug.js) | **≤ 60 KB** | eight small modules; growth past this signals logic that belongs in data tables | file sizes |
| Decoders (draco wrapper + wasm, basis js + wasm) | **≤ 1.4 MB** | published binary sizes + slack; wasm brotli-compresses ~2:1 on the wire | file sizes |
| GLB (`laptop.v1.glb` — Draco geometry only; textures external per 04 §6.1, adopted §1.2) | **≤ 1.8 MB** | geometry's line alone — there is **no joint "model + textures" line** (the split exists so neither can hide inside the other; stated bluntly because 04's Round-2 §5.3 derived against a joint 5.0 MB line this document never published). Deliberately looser than the asset owner's working numbers (04 §6.2: expected 1.05 MB, cap 1.20 MB) so a geometry change — e.g. a battery promotion (declined in D-015, but pre-priced — §4.1) — is absorbed here, not renegotiated | file size |
| Textures (11 KTX2 files) | **≤ 2.8 MB** | the remainder of the ≈ 5.6 MB asset envelope after GLB + HDR. **Held — and Seam F is now closed:** budgets are this document's, and no PM re-split was needed — 04 §5.3 as revised bakes its ladder's steps 1–2 (the two normals to 512, at costs 04 itself prices as shading softness only, never text or silhouettes) into its baseline: expected texture total 2.48 MB, inside this line with ≈ 0.3 MB headroom, and its atlas caps sum to 2.80 MB = this line exactly. The only mechanism that can move this split is a PM decision-log entry | Σ file sizes |
| Environment HDR | **≤ 1.0 MB** | 1024×512 RGBE ceiling (§4.4); 04 §7.2 caps at the same 1.0 MB (expected 0.85 MB) — the Round-1 disagreement is closed | file size |
| Static-experience stills | **see §8.1a** | fallback branch only — never fetched in 3d mode, outside this total | 3d-mode Network audit (QA-1) |
| **Total, 3d mode, cold cache** | **≤ 8.5 MB** | ~7 s background load at 10 Mbps behind the designed loader (§7.2) | DevTools Network total |

**Which number governs (review problem 02-10, answered):** both, because they can no longer conflict — the
per-line caps above sum to **8.43 MB ≤ 8.5 MB** (0.30 + 0.75 + 0.18 + 0.14 + 0.06 + 1.40 + 1.80 + 2.80 + 1.00),
so every line can hit cap simultaneously without breaching the total (the rejected draft's lines summed to
≈ 8.92 MB). Standing rule for future edits: a line cap may be raised only if the new sum still fits under the
total; wherever a conflict is ever discovered, **the 8.5 MB total governs** and the lines are re-fit before
anything ships. QA-1 checks the lines *and* the sum. Note also that caps are ceilings, not targets: the 4.0 s
scene-ready figure (§8.2) is computed against *expected* sizes (P2 ≈ 4.4 MB: GLB 1.05 MB + textures 2.48 MB —
both 04 §5.3 as revised — + HDR 0.85 MB → ≈ 3.5 s of transfer at 10 Mbps, plus decode); a build that
passes every cap but misses QA-2's stopwatch still fails QA.

### 8.1a Static-experience stills (fallback branch only)

- **Count: five — `R0`–`R4` at 03 §11's exact timeline states, `p` = 0.000 / 0.160 / 0.633 / 0.743 / 1.000,
  recorded as D-014(b)** (exactly five, rendered from the production model and lighting per 04 §9 — never AI
  composites, never the legacy reference slices; 03 §11 verifies the addresses survive its opening retime because
  only 0.000–0.160's interior moved and `R1` sits on the untouched 0.160 boundary). This section and §10.2 carry
  D-014(b)'s numbers verbatim.
- **Formats: AVIF + WebP, no JPEG tier** (04 §9.3, adopted — resolving review problem 02-9; the AVIF+JPEG line
  died with the poster). Delivered via `<picture>` + `srcset`, which works with JS disabled.
- **Budgets — this document's lines, which 04 §9.3 already cites and builds against:** per file **≤ 220 KB**
  (static mode has no designed loader, so every still must arrive fast enough to need none — 220 KB ≈ 0.18 s at
  10 Mbps); full 20-file set (5 frames × 4 variants) **≤ 1.6 MB** repo weight. 04's current encode caps sit well
  inside both (largest variant, the 2560 WebP, capped at 130 KB; set 1.60 MB at cap, expected ≈ 1.21 MB).
  Single-visitor fallback download = one format at one width per frame: **≤ 0.65 MB worst case** (5 × 130 KB
  WebP-2560 at 04's caps; the typical AVIF path ≈ 0.35 MB). Outside the 8.5 MB 3d total because the two branches
  are mutually exclusive — QA-1's 3d-mode Network audit must show zero `assets/fallback/` requests (binding
  acceptance test per D-013).

### 8.2 Runtime

| Metric | Tier A (desktop) | Tier B (phone) | Verification |
|---|---|---|---|
| Frame rate during scrub | 60 fps; p95 frame ≤ 20 ms | 60 fps target; p5 floor ≥ 30 fps, never < 30 for over 250 ms | DevTools Performance trace over a scripted full-track scroll; on-device for tier B |
| Main-thread JS per frame during scroll | ≤ 4 ms p95 | ≤ 6 ms p95 | same trace, Scripting self-time |
| Long tasks after boot | none > 50 ms | none > 50 ms | trace, Long Tasks lane |
| Draw calls | ≤ 60 | ≤ 40 | `renderer.info.render.calls` in debug overlay at the heaviest beat (full explosion) |
| Triangles | ≤ 350 k scene total | same GLB | `renderer.info.render.triangles`; per-part split owned by 04 |
| Texture GPU memory (KTX2 stays GPU-compressed: BC7 desktop / ASTC-ETC2 mobile) | ≤ 96 MB | ≤ 48 MB | debug-overlay estimate Σ(w×h×bytes-per-texel×1.33) + `renderer.info.memory.textures` |
| Materials / programs | ≤ 16 unique | same | `renderer.info.programs.length` |
| Scene-ready, cold cache | ≤ 4.0 s @ 10 Mbps | ≤ 6.0 s @ 4G profile | throttled DevTools/WebPageTest run, timestamp of the loader handoff's fill-100% event (§7.2) |
| Idle cost (no input 10 s) | 0 rendered frames | 0 | trace shows no rAF (§3.4) |

Reference hardware for "tier B / two-year-old phone" (vision §5): iPhone 13 (Safari) and Pixel 7 (Chrome). The
DevTools proxy is 6× CPU throttle + 4G, but sign-off requires the real devices (§12.5).

---

## 9. Mobile strategy

### 9.1 Quality tiers and detection

Capability-based, once, at boot in `quality.js` — no user-agent parsing:

| Tier | Detection (in order) | Gets |
|---|---|---|
| A | fine pointer AND `min(screen.w,h) ≥ 900` CSS px AND WebGL2 | DPR cap 2.0, MSAA on (< 2 DPR), shadow map 2048 |
| B | coarse pointer AND WebGL2 AND `deviceMemory` (where available) ≥ 4 AND `hardwareConcurrency ≥ 4` | DPR cap 1.75, MSAA per §3.2, shadow map 1024 |
| C | WebGL2 but fails a tier-B check | DPR cap 1.5, `antialias: false`, shadow map 1024, governor armed at a stricter 28 ms |
| static | fails the §2.3 gate, or reduced motion, or no WebGL2 | the designed static experience (§10) |

`navigator.deviceMemory` is Chromium-only; where absent (Safari) the check is skipped and iOS devices land in B —
correct, since every iPhone with WebGL2 + Safari 16.4 clears tier B comfortably.

### 9.2 What degrades first (fixed order, adaptive at runtime)

A rolling 30-frame average is kept while scrolling. If it exceeds **24 ms** (tier C: 28 ms): (1) DPR steps down 0.25
(repeatable, floor 1.0) — the biggest lever, invisible on small screens; (2) shadow map to 512; (3) shadows off (the
CSS backdrop keeps the scene grounded enough to survive it). One step per violation, 2 s cooldown, and **no
automatic re-upgrade** — oscillating quality is more visible than stable-lower quality. Geometry and textures never
degrade at runtime: swapping them mid-scroll causes exactly the hitch the governor exists to prevent.

### 9.3 Touch scroll behavior

Native momentum scrolling, untouched — §6.6 with no mobile exceptions. The canvas has `touch-action: pan-y` so
vertical gestures over it are never candidates for browser gesture interception, and no touch listener ever calls
`preventDefault`. URL-bar growth/shrink is absorbed by §3.3's 120 px rule and `ignoreMobileResize`.

### 9.4 Layout interaction with the Creative Director's mobile composition

Architecture supplies the guarantees mobile composition needs: the machine is framed by 03 §12's fit rule (§5.4),
so portrait layouts re-flow only text, never the subject; text is DOM at native DPR (§3.1), so type stays sharp
regardless of canvas resolution; overlay text position is plain CSS on the story sections, so breakpoint work never
touches `timeline.js`. The breakpoints themselves (the site uses 900/680 px) are the Creative Director's to set.

---

## 10. Accessibility and fallback matrix

### 10.1 The matrix

| Condition | Detection | Experience |
|---|---|---|
| `prefers-reduced-motion: reduce` | gate script (§2.3); a live `change` listener switches mode at the next visit-to-top | **Static mode.** No scrubbed animation, no parallax, nothing moves without input. The page renders as 03 §11's linear article — the five stills `R0`–`R4` at frame-accurate timeline states (count and addresses per D-014(b), §8.1a) inside 01 §7.8's designed longform layout. Architecture guarantees zero motion, full content, zero 3D downloads. |
| No JavaScript | nothing to detect — static IS the default document | The identical designed static page: semantic sections, headings, copy, `<img>` renders. `data-mode` never gets set, and all 3d styling is scoped under `[data-mode="3d"]`, so the no-JS document is simply never altered. |
| No WebGL2 / no import maps | gate script | Static mode. No error message — this is a designed track, nothing is broken. |
| `file://` | gate script | File-guard mode (§11.3). |
| Asset failure at runtime | loader (§11.1) | Downgrade to static mode in place. |
| Keyboard-only | — | Fully usable: native scroll keys drive the story because scroll is never hijacked (§6.6). Tab order: skip link → nav logo → ending CTA (§10.5). |
| Screen reader | — | Canonical narrative block (§10.3). |

### 10.2 Semantic document (the no-JS backbone)

The HTML is a real document in story order, independent of mode:

```html
<main>
  <h1>…page title (copy deck)…</h1>
  <div id="scroll-track">
    <section data-beat="B0">                      <!-- aria-hidden set only in 3d mode -->
      <h2>…beat heading (copy deck)…</h2> <p>…beat copy…</p>
      <picture> …AVIF + WebP sources (04 §9.3)…
        <img src="assets/fallback/…" alt="…" loading="lazy"> </picture>
    </section>
    … one section per beat, DOM order = story order; the five stills R0–R4 sit at 03 §11's
      pairings (R0 0.000 → opening, R1 0.160 → Lid, R2 0.633 → components, R3 0.743 →
      Mainboard, R4 1.000 → ending tableau) — beat sections between stills carry copy only …
    <section id="ending"> …closing line + <a class="btn-sand" href="/onboarding">…CTA…</a>… </section>
  </div>
</main>
```

In static modes this renders as the designed longform page (01 §7.8's reading column, 03 §11's still states). In
3d mode, CSS scoped to `[data-mode="3d"]` hides the `<picture>`s and positions the sections as overlays the
timeline reveals (§6.5). One source of truth for content in every mode — the copy can never fork.

### 10.3 Screen reader structure

- `#stage` (the canvas and its backdrop) is `aria-hidden="true"` — a visual rendering of the story, not the story.
- In 3d mode the overlay sections are also `aria-hidden="true"` (their visibility flaps with scroll — a churning
  accessibility tree is noise), and one **visually-hidden canonical narrative block** (the complete beat copy in
  order; standard `.sr-only` clip technique, never `display:none`) is the single SR-readable story. In static modes
  the sections themselves are the narrative and `fallback.js` sets the sr-only block `hidden` (no double reading).
- No `aria-live` tied to scroll — announcements driven by a scrubbed timeline would spam every gesture.
- Alt text policy: each of the five stills carries an `alt` stating what the image shows using canon component
  names, written by the Creative Director in the copy deck beside the beat copy (04 §9.5 supplies drafts; the
  words are 01's; the requirement that every still carries state-specific alt is architecture's).
- Heading order strict: one `h1`, `h2` per beat, no skips.

### 10.4 The ending CTA

A plain `<a href="/onboarding">` styled per the site's `.btn-sand` spec — a real link in every mode, focusable,
working without JS. It participates in the timeline only as an `autoAlpha` reveal at the ending beat.

### 10.5 Focus management around the pinned scene

- First tab stop is a **skip link** (wording per copy deck) targeting `#ending`. The native anchor jump moves
  scroll; §6.6's jump rule snaps the playhead so the machine lands instantly in its final exploded state — the skip
  is honest, not a fast-forward blur.
- `autoAlpha` (§6.5) removes invisible beats from the tab order, so tabbing can never scroll-jack to a hidden
  element. Persistent focusables: skip link, nav logo, ending CTA — nothing else.
- The canvas is not focusable (no `tabindex`), has no key handlers, and never traps focus.
- Focus visibility: 01 §7.9's spec, verbatim — `outline: 2px solid var(--ink); outline-offset: 3px` on every
  focusable (01 measures ≥ 5.31:1 against every surface it can cross; cool tones are banned in this page's 2D UI,
  so no site-side aqua convention applies here).

---

## 11. Error handling and resilience

### 11.1 Asset load failure

- Any failed fetch retries **once** with a cache-busting query (`?r=1`) after 500 ms — clears transient edge/radio
  failures without a retry storm.
- **GLB fails twice:** `fallback.js` converts the page to static mode in place (loader dissolves to the static
  layout, sections un-overlay, stills load). The visitor gets the designed static page, not an apology.
  Console-logged with URL + status; no error UI.
- **Any of the 11 KTX2 textures fails twice:** treated as GLB failure → static mode. A gray-material laptop is
  exactly the "rendered, not photographed" failure the vision bans, and the stills are the better page.
- **HDR fails twice:** proceed with vendored `RoomEnvironment` through PMREM at the same `environmentIntensity`
  (0.5) — slightly less warm reflections, still physical; not worth abandoning 3d mode.
- **Decoder wasm fails:** treated as GLB failure (neither geometry nor textures can parse without them) → static
  mode.
- **Font files fail:** `font-display: swap` (site pattern) → fallback serif renders; no action.

### 11.2 WebGL context loss

```js
canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stopLoop(); });
canvas.addEventListener('webglcontextrestored', () => { rebuild(); });
```

`preventDefault` on loss signals intent to restore. `rebuild()` re-runs PMREM (compiled render targets don't survive
loss), lets Three.js re-upload geometry/textures on the next render, and renders one frame at the current playhead.
If restoration hasn't fired within **4000 ms** (GPU crash, iOS tab reclaim), swap to static mode via `fallback.js` —
the story continues either way. Verified in QA with the `WEBGL_lose_context` extension (QA-12).

### 11.3 The `file://` guard (predecessor precedent)

ES modules and `fetch` are blocked by CORS under `file://`, which reads as a silently broken page. The gate script
detects `location.protocol === 'file:'` and sets `data-mode="file"`, revealing a single plain instruction block
(wording per copy deck) telling the developer to serve from the project root (`vercel dev` or any static server) —
the predecessor's guard, kept because it costs 3 lines and saves every future developer the same confusion.

### 11.4 Refresh/restore correctness

`scrollRestoration = 'manual'` + scroll-to-top on load and `pageshow` (§6.6, site pattern) means reload and bfcache
restore always restart at beat zero — scene state can never disagree with a browser-restored scroll position it
hasn't seen.

---

## 12. Build organization and QA

### 12.1 Code organization without a bundler

- **ES modules, one file per concern** (§1.2 tree) — eight files, each under ~10 KB. No IIFE-and-globals for our
  code (the gate script is the single deliberate exception: it must run inline before paint). §2's import map
  already commits us to module loading, so modules with real imports are the consistent choice.
- **Data over logic:** everything the storyboard/creative documents own lands in plain data tables at the top of
  `timeline.js` (`CAM_POSES`, beat labels/ranges, text-reveal offsets), so revisions to those documents become data
  edits reviewable line-by-line against their source.
- **No hidden shared state:** modules communicate through explicit exports; the only shared mutables are `scene`,
  `camera`, `camRig`, `master`, created in `main.js` and passed down.
- Comments only where a reason is non-obvious (site rule); each module opens with a two-line header naming its
  owning section in this document.

### 12.2 Initialization order (in `main.js`, 3d mode)

1. Read `data-mode`; bail to `fallback.js` unless `"3d"`.
2. `quality.js` → tier, DPR cap, flags (§9.1) — before any GL allocation, since renderer creation consumes the
   antialias/DPR decisions.
3. Dynamic-import the graph; create renderer + scene + lights (§3, §4).
4. `loader.js` P2: decoders + GLB + 11 KTX2 textures + HDR in parallel (§7.1), the loader hairline wired to
   byte-weighted progress (§7.2).
5. On loaded: bind `laptop_root` and the eight part nodes **by 04 §2.1's names, byte-for-byte** (`lid`,
   `cooling_fan`, `heat_pipes`, `storage_ssd`, `memory_ram`, `support_boards`, `mainboard`, `chassis` — the same
   lookup 04's QA §10.3 runs) and capture each part's rest position (§4.1) — **throw → static mode if any name is
   missing** (a malformed GLB must fail loudly at integration, not ship a partial teardown).
6. `camera-rig.js`: build `CAM_POSES` from 03 §5.2 (§5.3), set FOV 24°/30° by aspect, apply the §5.4 fit, set `P0`.
7. `timeline.js`: register 03's eases (CustomEase), build master timeline + `B0`–`B8` labels + text tweens; create
   the ScrollTrigger; `ScrollTrigger.refresh()`.
8. Sync `scrub.smooth = scrub.raw`; warm-up render; loader handoff 150/400/600 ms (§7.2).
9. Arm resize (§3.3), context loss (§11.2), adaptive governor (§9.2).

Order rationale: nothing user-visible depends on a later step — the loader covers 1–8 and scroll works natively
throughout.

### 12.3 Conventions

- Filenames lowercase kebab-case (`camera-rig.js`) for our code; binary assets are immutable once shipped and
  carry a `.vN` version token in the file name — this document's mechanism, recorded as D-011 — on 04 §6.3's base
  names, with the GLB at the `assets/` root (no `models/` subdirectory — D-011, §1.2); vendor directories carry
  their version in their names (§1.2).
- All paths inside `engineering/` relative; only `/fonts/`, `/images/` (logo), `/onboarding` root-absolute (§1.1);
  paths case-exact always (Vercel Linux).
- No `console.log` on shipped paths; `console.warn/error` only in §11 failure branches.

### 12.4 Debug instrumentation

`?debug=1` lazy-imports `debug.js`: an overlay showing fps, frame ms, `renderer.info` draw calls / triangles /
textures / programs, texture-memory estimate, tier, DPR, `master.progress()`, and the nearest beat label. It exists
so every §8 number is *observable* on the real page, not inferred. It ships (a static site ships everything) but is
inert and never imported without the flag.

### 12.5 Pre-ship QA checklist (each row maps to a budget or a designed branch)

| # | Check | Pass condition |
|---|---|---|
| QA-1 | Cold-cache payload audit (DevTools Network, 3d mode) | within every §8.1 line AND the 8.5 MB sum (§8.1 governing rule); zero requests to `assets/fallback/` (binding acceptance test per D-013) |
| QA-2 | First paint on throttled 10 Mbps | loader (wall + wordmark + hairline) ≤ 1.0 s; scene-ready ≤ 4.0 s; handoff plays 01 §7.6's 150/400/600 ms |
| QA-3 | Full-track scripted scroll trace, tier-A hardware | 60 fps, p95 ≤ 20 ms, JS ≤ 4 ms/frame, no long task > 50 ms |
| QA-4 | Same on iPhone 13 (Safari) + Pixel 7 (Chrome) | §8.2 tier-B row holds; touch momentum native; no URL-bar hitch |
| QA-5 | Debug overlay at the heaviest beat | draw calls, triangles, materials, texture memory within §8.2 |
| QA-6 | Idle test: 10 s no input | zero rendered frames in trace |
| QA-7 | Scrub determinism: 5 marked scroll positions, screenshot, reverse, re-screenshot | pixel-identical pairs (no drift) |
| QA-8 | Reduced-motion ON | static mode renders; nothing moves; zero 3D bytes fetched |
| QA-9 | JavaScript disabled | full story readable, the five stills present via `<picture>`, CTA works |
| QA-10 | WebGL2 blocked (browser flag) | static mode, no error surfaced |
| QA-11 | Keyboard-only pass | space/arrows traverse the story; tab order = skip link → logo → CTA; skip lands on the exploded state instantly |
| QA-12 | Context loss via `WEBGL_lose_context.loseContext()/restoreContext()` | recovery renders the current beat; forced non-restore swaps to static within 4 s |
| QA-13 | Screen reader pass (VoiceOver + NVDA) | one coherent narrative, no churn while scrolling, headings in order |
| QA-14 | `file://` open and `/engineering/` trailing-slash request | guard message shows; 308 lands on `/engineering` |
| QA-15 | Vendor audit | file SHA-256s match `vendor/README.md`; no request leaves the origin (Network tab, full session) |
| QA-16 | Scrub-timing audit (§6.2): scripted 1080 px/s scroll + hard stop, debug overlay logging `(raw − smooth)` per frame | time-lag ≤ 120 ms; drift ≤ 0.030 at all speeds; settle to \|raw − smooth\| < 0.001 within 250 ms of input stop; zero sign changes in `(raw − smooth)` after the stop (no overshoot) — 03 §10.2's four numbers, measured |
| QA-17 | Node-name bind check | `scene.getObjectByName` returns non-null for `laptop_root` + all eight 04 §2.1 part names on the shipped GLB (mirrors 04 QA §10.3 from the runtime side) |
| QA-18 | Post-load teardown (§13.2): the DevTools Sources panel's Threads list (or a Performance trace's thread lanes) checked after the loader handoff completes | no decoder/transcoder worker threads remain; then QA-12's context-loss recovery still passes in the same session — geometry, textures, and the rebuilt environment (teardown must not break any re-upload path) |
| QA-19 | Allocation discipline (§13.3): allocation-sampling trace over QA-3's full-track scripted scroll | zero sampled allocations whose allocating function is in `js/` frame-path code (`frame`, `scrub.step`, `camRig.apply`, or any `js/` helper they call); vendored callees are judged by QA-3's frame budget, not this row (§13.3) |

A release failing any row does not ship; budget rows are re-negotiated only through a decision-log entry, never by
editing this table at review time.

---

## 13. Memory management

### 13.1 The model: allocate at load, hold for the page's life

The page's working set is fixed the moment the loader hands off: one GLB, eleven GPU-resident compressed textures,
one PMREM environment, one shadow map, the drawing buffer. Nothing is fetched later (§7.1's single P2 phase),
nothing streams, and no beat adds geometry. So the memory policy is the simplest one that is actually correct:
**allocate once during load, hold everything for the page's life, allocate nothing per frame.** Reclamation
machinery — caches with eviction, texture streaming, scene rebuilds — serves pages whose working set changes; on a
page whose working set cannot change, that machinery is pure risk, because every reclamation is a potential
mid-scrub hitch and the scrub budgets (§6.2, §8.2) have no room for one. Stability is the optimization. The §8.2
GPU rows (≤ 96 MB tier A / ≤ 48 MB tier B) are the ceilings this model must fit under, and 04 §5.3's computed
texture-memory plan sits inside them with a wide margin — holding everything resident is affordable precisely
because the Asset Director's budgets made the working set small. (The drawing buffer sits outside those rows and
is governed by §3.2's DPR policy instead.)

### 13.2 Load-time transients — created during P2/P3, torn down at handoff

Three load-time allocations end their useful life at handoff. Each is released at a named moment — and each
release is checked against the one consumer that could still need it, §11.2's context-loss rebuild:

| Transient | Torn down by | When | Why it is safe |
|---|---|---|---|
| HDR source texture + `PMREMGenerator` | `.dispose()` on both (§4.4 — the policy's first published instance); the source's **JS reference is retained** | immediately after `scene.environment` is assigned | `dispose()` frees GPU memory only — the source `DataTexture`'s CPU-side pixels survive as long as `scene.js` keeps the reference, and it must keep it: §11.2's `rebuild()` re-runs PMREM after a context loss, re-uploading the retained source through a freshly created generator. Torn down fully, the environment could not be rebuilt (§13.1 rules out re-fetching); retained CPU-side, it costs one small heap block and keeps §11.2 honest |
| Draco decode + Basis transcode worker pools | `dracoLoader.dispose()` + `ktx2Loader.dispose()` | in the LoadingManager's `onLoad`, after init step 5's node bind succeeds (§12.2) | decoding happens exactly once — no later fetch exists for the workers to serve (§7.1). Disposing the *loaders* terminates their workers and frees the wasm heaps; it does **not** touch the parsed `BufferGeometry` or `CompressedTexture` data, whose CPU-side copies Three.js retains — which is what §11.2's context-restore re-upload depends on, so the recovery path survives the teardown (QA-18 tests exactly this pairing) |
| The parsed glTF result object | its only reference dropped | at bind time (init step 5) — extract `laptop_root` and the part nodes, keep no reference to the loader's result | the wrapper holds the parse's intermediate JSON and arrays; dropping the reference makes them collectable at handoff instead of resident for the page's life |

Why the worker teardown earns its two lines: the worker pools' wasm heaps are real memory on exactly the devices
that have the least of it, and memory pressure is what gets a backgrounded phone tab reclaimed — the failure §11.2
can only mitigate after the fact. And why the workers are not simply created lazily instead: they must exist
*before* the first GLB bytes arrive — §7.1 starts them concurrently with the fetches on purpose, so teardown after
`onLoad` is the only end of their life that costs nothing.

### 13.3 Steady state — the zero-allocation frame

The hot path — `frame()`, `scrub.step()`, `camRig.apply()` (§3.4) — allocates nothing: no `new`, no arrays, no
closures, no string building. Everything it needs exists before the first frame: `CAM_POSES` already carries
meters — §5.3's conversion happens when the table is transcribed from 03, not at runtime — the smoother is a
handful of numbers (§6.2), and any vector temp the rig needs is a module-level scratch object reused every frame.
The reason is §8.2's arithmetic: tier A allows ≤ 4 ms of JS per frame, and a garbage-collection pause spends that
budget on nothing — per-frame garbage converts directly into the scrub hitches the whole §6.2 design exists to
prevent, and unlike a slow function it does so intermittently, which makes it the worst kind of bug to find at
review. The rule scopes to our code: the three functions' own bodies and any `js/` helper they call. Vendored
callees — `renderer.render()`'s internals, GSAP's tween updates (its DOM style writes allocate transiently by
design) — are outside it: D-003 pins them uneditable, and their cost is already gated by QA-3's per-frame budgets.
Enforced by inspection at code review (three short functions to read) and by measurement as QA-19, which filters
the allocation trace to `js/` frames for exactly this reason.

### 13.4 GPU steady state

Textures upload once and stay GPU-compressed for the page's life (KTX2 transcoded to BC7 / ASTC-ETC2, §8.2) —
no mipmap streaming, no re-transcode, no format changes. Geometry and textures never swap at runtime (§9.2's rule:
swapping mid-scroll causes exactly the hitch the governor exists to prevent). After load, GPU allocations change
only at named, bounded events, never per frame: the drawing buffer re-sizes on an accepted resize (§3.3) and on
the governor's DPR step-down (§9.2 — one step per violation, 2 s cooldown: a priced hitch traded for sustained
frame rate); the shadow-map target is re-created at 512 and later freed outright if the governor reaches its
second and third levers (§9.2); and a context-loss rebuild re-uploads everything (§11.2 — the browser has already
discarded the old allocations by then). The drawing buffer is where the page's largest GPU allocation lives,
which is why §3.2's DPR-and-MSAA policy exists to cap it — MSAA only below retina DPR, because the
multisampled-retina combination that policy forbids would be the worst case (§3.2's own superlative) — and why
the DPR cap is the governor's first lever.

### 13.5 Page lifecycle — deliberately no teardown handlers

No `unload`/`beforeunload` cleanup is registered, and no manual `scene`/`renderer` disposal runs at navigation: an
`unload` handler makes the page ineligible for bfcache in Chromium and Firefox, and on a real navigation the
browser reclaims the GL context, workers, and heap anyway — a manual teardown would spend bfcache eligibility
(which §11.4's `pageshow` handling depends on) to free memory the browser was already taking back. A hidden tab
costs nothing by construction: rendering is input-driven (§3.4), so there is no loop to pause and no
`visibilitychange` "optimization" should ever be added — it would duplicate §3.4 and create a second render
gatekeeper to keep consistent.

---

## 14. Implementation build order

§12.2 orders what the code does at *runtime*; this section orders what the engineer does across the
*implementation round*, so the round's first week is not spent re-deriving the dependency graph the documents
already imply. It creates no new design: every milestone's content is specified elsewhere (the build source is
`05-master-specification.md`, per D-008); this section only sequences the work and names each milestone's exit
test — from the §12.5 checklist wherever a row exists; M4 is the one exception, verified against 03 §5.2 directly,
because no QA row frames camera poses (QA-7 checks scrub determinism, not composition). None of it starts before
the owner sign-offs the master specification records as blocking — D-017 chief among them, per D-008. The ten
low-severity audit notes recorded at synthesis (task board, T-08) are swept where their files are first built:
most in M1–M2, the enter-window item with `timeline.js` in M5, the ship-time audit rules in M8.

Two tracks run in parallel: **code** (the table below) and **assets** (04's pipeline, from `laptop.blend` to the
validated GLB + KTX2 + HDR set). They meet at two integration points: the real asset set lands at M3, and the five
fallback stills are captured *last, from the finished scene* at 03 §11's addresses (04 §9.2's rule — never Blender
re-renders), which is why the static experience receives its final images only at M7.

| # | Milestone | Builds | Depends on | Done when |
|---|---|---|---|---|
| M0 | Vendor pass | `engineering/` skeleton; `vendor/` (three-r180, gsap-3.13.0, decoders-r180) + `vendor/README.md` with SHA-256s (§1.2, §1.3) | the recorded owner sign-offs (D-017 chief among them) | QA-15 passes: SHAs match, zero off-origin requests |
| M1 | The static document | `index.html` — semantic story markup (§10.2), gate script (§2.3), critical CSS incl. the 01 §7.6 loader, `css/engineering.css`, fonts, routing (§1.1) | M0 | QA-9 (JS disabled) and QA-14 (routing + `file://` guard) pass with placeholder stills; a deployed preview serves `/engineering` |
| M2 | Boot spine + instrumentation | `main.js` mode routing, `quality.js` tiers (§9.1), `fallback.js` skeleton, `debug.js` (§12.4) | M1 | each forced mode lands correctly (the detection legs of QA-8/QA-10); the `?debug=1` overlay renders |
| M3 | The lit scene, standing still | `loader.js` (P2 manifest, byte-weighted progress), `scene.js` (renderer §3.1, rig §4.3, IBL §4.4, ground plane), node bind (§12.2 step 5) against the real `laptop.v1.glb` | M2 + the asset track's validated GLB/KTX2/HDR | QA-17 binds; §8.2's draw-call/triangle/texture-memory rows read inside budget in the overlay; key-to-fill checks against the 18% gray probe (§4.3) |
| M4 | Camera rig | `camera-rig.js` — the proxy, `CAM_POSES` transcribed from 03 §5.2, FOV + portrait fit (§5.2, §5.4) | M3 | every pose `P0`–`P5` is screenshot-verified against 03 §5.2's framing table — subject center 62vw at `P0`–`P4`, 50vw at the `P5` tableau (D-010) — with the quiet zone clear wherever beat text shows |
| M5 | The timeline | `timeline.js` — master timeline, `B0`–`B8` labels, part + text tweens, the smoother, the ScrollTrigger (§6) | M4 | QA-7 (determinism), QA-16 (scrub numbers), QA-3 (tier-A trace) pass |
| M6 | Loading experience + failure branches | the §7.2 handoff (150/400/600 ms), stall→static, §11's retry / context-loss / in-place static conversion, §13.2's teardown | M5 | QA-2, QA-12, QA-18 pass |
| M7 | Static experience, finished | capture the five stills from the built scene at 03 §11's addresses (04 §9.1–9.2), wire the `<picture>` sets, captions + alt (01 §7.8, §8.4), sr-only narrative + skip link (§10.3, §10.5) | M5 (the scene must be final first) | QA-8, QA-9 re-run with real stills, QA-11, QA-13 pass |
| M8 | Ship gate | cache headers (§7.6), real-device runs (§8.2's named hardware), the full §12.5 sweep | M6 + M7 | all QA rows green; §8.1's cold-cache sum measured ≤ 8.5 MB |

Why this order and not another: the static document comes first because it is the default document every other
mode decorates (§10.1) — building it first makes D-007's "designed, not patched" an ordering fact rather than a
review hope, and M1 needs no assets, so it starts the day the round opens. Instrumentation (M2) precedes the scene
because every §8 number must be observable *while the scene is being built*, not reconstructed at review — §12.4
says the overlay exists to make the budgets observable; that is only true if it exists before the things it
observes. The camera (M4) precedes the timeline (M5) because a tween between unverified poses cannot be reviewed
against 03 — a framing error found at M5 would implicate two systems instead of one. The asset track's only hard
gate is M3; if the real GLB is late, M3–M5 may proceed against a development stand-in that carries 04 §2.1's exact
node names and §3.1's dimensions (gray materials, no textures) — scaffolding, never committed, and no milestone
counts as done until re-run against the real set (QA-17 exists precisely to catch that swap).

---

## 15. Change absorption and future scalability

How this architecture takes the changes that are actually coming — stated so a future engineer edits the right
file and re-runs the right checks instead of guessing. The standing rule everywhere: **a change is a superseding
`decisions.md` entry plus the owning document's re-checks — never a quiet edit.** (The master specification's
standing-obligations appendix records the same rule from its side; §12.5's closing rule is this document's local
instance.)

### 15.1 The playbook

| Change | Absorbed by | What re-runs |
|---|---|---|
| Copy edit (incl. whatever the owner's D-017 sign-off returns) | text is DOM (§6.5) and timing is data (§12.1) — a wording change is an HTML edit, a window change is a table edit in `timeline.js` | 03 §7.2's reading floor for the touched slot; 01's word budgets |
| Asset re-master | a new `.vN` URL (§1.2) plus one line in the §7.2 loader manifest | 04 §6.4's validation gates; the touched §8.1 line; caches cannot serve stale bytes by construction (§7.6) |
| A part added or promoted (e.g. the declined lifted-battery variant, D-015) | §4.1's bind is indifferent to the node count; the new node follows 04's naming; its motion is new table rows | 03 re-issues its §3 ranges (its pre-priced variant already exists on the record); §6.3's track heights re-transcribe from 03's new travel numbers; QA-17's name list grows by one |
| Beats retimed | the `B0`–`B8` addresses and tween windows are data, not logic (§6.4) | the §6.4 transcription audit, line by line against 03 — the mechanism review already used to catch two stale constants |
| Library pin upgrade | a new `vendor/<lib>-<version>/` directory + import-map/script-path edits (§1.2's per-directory rule) | §1.3's license check and SHA-256 manifest; the full §12.5 sweep — and "newer exists" is still not a reason (§1.3) |
| Budget change | a decision-log entry (§12.5's rule) | §8.1's sum check: the 8.5 MB total governs and the lines re-fit under it |
| A second experience page reusing this system | copy the *mechanism*, not the files: fixed stage + track (§6.3), the smoother (§6.2), the pose table (§5), the gate + mode matrix (§2.3, §10.1). The page directory is self-contained by design (§1.1), so a new page re-vendors its own `vendor/` at its own pins | everything — it is a new page with its own documents; this one is its precedent, not its parent |

### 15.2 Non-goals — what this architecture deliberately does not scale to

Stated so future ambition lands in a redesign where one is owed, not a hack where it isn't. **Free camera input:**
the proxy has no input path and no `fov` field on purpose (§5.1, §5.2); a user-steered camera is a different page
with different vision rules, not a feature flag on this one. **A second concurrent subject:** one GLB, one
timeline, one scene graph is the design (§4.1; D-011's one-model tree) — a second machine on screen is a second
architecture round. **Unbounded copy growth:** the word budgets are 01's hard caps and 03 §7.2's reading-floor
math is what makes them load-bearing — text does not scale, by design. **A bundler or a CDN:** banned by D-003; if
the site ever adopts a build step globally, that supersedes this document wholesale rather than amending it.

### 15.3 Extension seams already on the record

Four future capabilities are deliberately parked, priced, and owed nothing: the Lid hinge locator and fan-rotor
pivot (04 §2.3 — capability offered is not motion owed), the progress-hairline contingency (D-014d — timing
pre-priced by 03), the lifted-battery variant (D-015 — declined with its full cost recorded), and
`EXT_meshopt_compression` as a Draco alternative (04 §6.2's noted-and-rejected option: one pipeline flag plus a
reasoned case). Future work on any of them starts from a recorded design and a superseding decision entry, not
from a blank page — which is the cheapest kind of scalability this project can own.
