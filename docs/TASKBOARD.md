# WebSharke — Task Board

> One task per session. Mark IN PROGRESS when you start, DONE/BLOCKED when finished.
> Only edit files related to your task. Do not touch payment / Stripe / Supabase / auth.

---

## Task: Replace Styles Tab Dashboard Preview With Laptop Teardown Animation

- **Status:** REVIEW — audit complete, **no code changes needed** (everything verifiable passed; one
  in-browser WebGL eyeball on a Vercel preview is the only item a non-GUI session can't execute)
- **Owner:** Worker — Opus (verify/audit session, 2026-06-19)
- **Created by:** Manager — 2026-06-18
- **Priority:** Medium

> **Claimed files (this session):** `docs/TASKBOARD.md`, `docs/logs.md` only — **no production code was
> edited** because every verification check passed (nothing failed → nothing to harden). Read-only audit
> of `index.html` (#styles), `Animations/laptop-teardown/**`, `vercel.json`. See the 2026-06-19 Worker
> finish entry in `docs/logs.md` for full results.

> ### ⚠️ Current state — READ THIS FIRST
> **The core implementation already landed in commit `772bed3 "wowowowowah"`.** This is **NOT** a
> greenfield build. Before you change anything, confirm what already exists:
>
> - The animation is already copied into the repo at **`Animations/laptop-teardown/`** (git-tracked,
>   fully vendored, no CDN).
> - The Styles section on the homepage (`index.html`) **already has the replacement card** — card `01`
>   "3D Laptop Teardown" is an `<a href="/Animations/laptop-teardown">` (lines ~288–294). The old
>   dashboard-style preview is no longer in the grid.
> - The animation page (`Animations/laptop-teardown/index.html`) already has: `<base href>`, an import
>   map, vendored Three.js/GSAP/fonts, a `file://` guard, an error-capture fallback, and a root-absolute
>   favicon.
>
> **Your job is to verify, audit, and harden the existing implementation against the checklist below —
> and fix only what fails.** Do **not** re-copy the animation or rebuild the card from scratch; that
> risks regressing working, committed code. If you find nothing broken, complete the verification items
> and sign off the audit.

### Goal
Replace the existing dashboard preview/card in the Styles tab with the uploaded 3D laptop teardown
animation. *(Already done in code — confirm it is correct and production-safe.)*

### Why
The Styles tab should showcase a stronger interactive visual instead of the static dashboard preview.

### Files involved (verified to exist)
- **`index.html`** — the Styles section.
  - Markup: the `#styles` section / `.style-grid`, **lines ~283–325**. Card `01` (the teardown link) is
    **lines ~288–294**. Cards `02`–`05` are unrelated "Preview coming soon" placeholders — **leave them
    alone**.
  - Styles: inline `<style>` rules for `#styles` / `.style-grid` / `.style-card` / `.style-card.feat` /
    `.sc-*`, **roughly lines ~144–282**.
- **`Animations/laptop-teardown/`** — the animation itself:
  `index.html`, `style.css`, `script.js`, `vendor/` (three.module.js, gsap.min.js, ScrollTrigger.min.js,
  `jsm/…`, `fonts.css`, `fonts/*.woff2`), `README.txt`.
- **`vercel.json`** — `cleanUrls:true`, `trailingSlash:false`. This is what serves the clean route
  `/Animations/laptop-teardown` → the folder's `index.html`.
- **`dashboard-style.html`** — the old "Sales Dashboard static mockup". Now appears **orphaned** (nothing
  links to it). It was likely the previous preview. Decide keep-vs-remove (removal optional, out of the
  core task — flag, don't delete on a whim).

### Animation source (original drop)
`C:\Users\WEeld\OneDrive\Documents\Eldridge-Web-Designs\Portfollio1-main\Portfollio1-main\Portfollio1\Animations`
— note the live copy now sits in the project-relative `Animations/laptop-teardown/`. The original
absolute-path drop should **not** appear anywhere in production code (verify).

### Implementation requirements (with current status)
- ✅ Copy the animation into the project using a **relative** project folder, not the absolute Windows
  path. — **DONE**: `Animations/laptop-teardown/`, git-tracked.
- ⚠️ Suggested destination was `public/animations/…` or lowercase `animations/…`. Actual is capital-
  **`Animations/`**. It is internally consistent (link, `<base>`, and folder all use capital `A`), so it
  resolves on case-sensitive hosting — but every other top-level asset folder is lowercase
  (`images/`, `api/`, `css/`, `js/`). **Consider** lowercasing to `animations/` for convention + case
  safety. If you rename, update `index.html` (the `href`) and the animation's `<base href>` together.
- ✅ Preserve the animation's vendor file structure. — **DONE** (`vendor/`, `vendor/jsm/…`,
  `vendor/fonts/…` intact).
- ✅ Do not use external CDNs. — **DONE** (three/gsap/fonts vendored; import map points at `./vendor/`).
- ✅ Do not load the full Three.js animation on the homepage. — **DONE**: `index.html` has no
  `type="module"` / no `three` import; the card is a plain `<a>` link. Heavy code loads only on the route.
- ✅ Keep the Styles tab card lightweight. — **DONE** (pure HTML/CSS card).
- ✅ The animation opens from the Styles tab card. — **DONE** (same-tab navigation to the route).
- ✅ The final site must not contain the absolute Windows path. — **DONE/VERIFIED**: repo-wide grep for
  `C:\Users` / `C:/Users` / `file://` returns matches **only** in `docs/**` and as the intentional
  `file://`-guard *strings* in the animation `index.html`/`README.txt` (plus a three.js source comment).
  No absolute Windows path in any production code path.
- ✅ Dashboard preview replaced; unrelated style cards unchanged. — **DONE** (cards 02–05 untouched).

### Security audit requirements (Manager first-pass findings — worker to confirm & sign off)
| Item | Finding | Action |
|---|---|---|
| Unsafe inline scripts | Present **by project convention** (every page inlines JS); no CSP in `vercel.json`. Not a regression. | Note only |
| Unsafe `innerHTML` | Animation `script.js:580` deliberately avoids it (`textContent=''` "build nodes safely (no innerHTML)"). Homepage uses `innerHTML` only for decorative snow/fish from **static constants** (no user input). | OK |
| External CDN usage | **None** in the animation (vendored). | OK |
| Exposed secrets | **None** in animation files (pure frontend; no keys/tokens/`fetch`). | OK |
| `file://` assumptions | **Handled** — animation `index.html` detects `location.protocol==='file:'` and shows a clear message; README documents http(s)-only. | OK |
| Absolute local paths | **None found** (`C:\…`) in production code. | ✅ Verified repo-wide (grep clean; only `docs/**` + `file://`-guard strings) |
| iframe risk | Card is a same-tab `<a>` link, **not** an iframe; animation not embedded. | N/A |
| `target="_blank"` w/o `rel` | Card does **not** use `target="_blank"`. If you switch it to open a new tab, you **must** add `rel="noopener noreferrer"`. | OK now / flag if changed |
| Path traversal in `serve.mjs` | `serve.mjs` / `start-demo.bat` were **not** copied (removed; README "LOCAL PREVIEW" confirms). | N/A — no risk |
| Deployment | `Animations/` is git-tracked at repo root (not gitignored) → Vercel deploys it. `cleanUrls` serves the route; `<base>` covers trailing-slash variance. | ◑ Confirmed locally (static server: `/Animations/laptop-teardown` 301→200 to folder index; all assets 200). Vercel directory-index behaviour is standard + `<base href>` covers slash variance → expected to work; **final eyeball on a real preview still advised** |
| Unnecessary code on main page | **No** — homepage loads no Three.js; ~1.6 MB payload (three.module.js ≈1.2 MB + fonts + gsap) loads **only** on the animation route. | OK |

> ⚠️ **Out-of-scope observation (do NOT fix under this task):** `index.html` line ~31 still loads
> **Google Fonts via CDN** (`fonts.googleapis.com`), which conflicts with the project's "vendor locally"
> stance. Pre-existing and unrelated to the animation — log it as a separate future task, don't touch it
> here.

### Do not touch
Payment logic · Stripe · Supabase · auth/login · unrelated dashboard logic · unrelated design sections ·
unrelated style cards (02–05).

### Completion checklist
- [x] Animation files copied into the project with relative paths — *commit 772bed3*
- [x] Dashboard preview/card in Styles tab replaced — *index.html card 01*
- [x] New card links to / opens the animation — *`<a href="/Animations/laptop-teardown">`*
- [~] Animation page loads **without console errors** — *every statically-provable load path verified on a
      local static server (route 301→200 + **all** vendored assets 200 with correct MIME: `.js`→
      `text/javascript`, `.woff2`→`font/woff2`); `script.js` passes `node --check` as an ES module; import
      map is valid JSON; `file://`+WebGL+6s-fallback+noscript guards present.* **Remaining:** the actual
      in-browser WebGL render/console can't be executed in a non-GUI session — needs a ~60s eyeball on a
      Vercel preview.
- [x] No absolute Windows paths remain in production code — *repo-wide grep clean (matches only in `docs/**`
      and the intentional `file://`-guard strings)*
- [x] No external CDNs added (animation) — *vendored; grep found only license-header comments inside the
      libs, no live `http(s)` asset requests* — but see Google-Fonts out-of-scope note above
- [x] Security audit completed — *worker confirmed & signed off the table below; see logs finish entry*
- [x] Performance checked — *homepage grep shows no three/gsap/module/importmap (only a CSS comment); card
      is a plain `<a>`; ~1.6 MB payload loads only on the route*
- [x] Mobile layout checked *(by CSS inspection, not visually rendered)* — *homepage `.style-grid` 3→2
      (≤900px)→1 (≤680px); animation hides `.side-index` ≤820px, repositions caption ≤600px; `isMobile`
      cuts keycap count + disables shadows/parallax; both pages honor `prefers-reduced-motion`*
- [x] docs/logs.md updated — *worker finish entry appended 2026-06-19*

### Suggested next task (after this)
Vendor the homepage Google Fonts locally to match the project's no-CDN policy (separate task — see
out-of-scope note).

---

## Task: Remove AI Aspects From Laptop Teardown Feature

- **Status:** [REVIEW] — copy/comment cleanup complete 2026-06-19; no behaviour changes, no vendor edits. See `docs/logs.md` FINISH entry.
- **Owner:** Worker · Opus (AI-feel cleanup) · 2026-06-19
- **Created by:** Manager — 2026-06-19
- **Risk:** Medium
- **Files claimed:** `index.html` (card 01 only, ~288–294) · `Animations/laptop-teardown/`{`index.html`,
  `style.css`, `script.js`, `README.txt`} · `docs/`{`taskboard.md`, `logs.md`}.
  **Not** touching `vendor/*`, cards 02–06, payment/Stripe/Supabase/auth.

### Goal
Remove the AI-generated feel from the laptop teardown feature while keeping the animation working.

### Why
The feature should feel intentional, human, and portfolio-ready instead of generic, overhyped, or
obviously AI-written.

### Tone direction
It should read like a real portfolio piece from a small web design business: simple, direct, confident.
- **Good:** "Interactive Laptop Teardown" · "A scroll-based 3D build study." · "Explore the layers of a
  device-style interface as it separates on scroll." · "View Demo"
- **Bad:** "Premium futuristic immersive experience" · "Revolutionary AI-powered visual journey" ·
  "Next-generation digital masterpiece" · "Seamless cutting-edge innovation"

### Files likely involved (verified during inspection)
- **`index.html`** — **only** the teardown card, lines **~288–294** (`sc-kicker` / `sc-title` /
  `sc-desc` / `sc-foot`). Nothing else on this page.
- **`Animations/laptop-teardown/index.html`** — user-facing copy: `<title>`, intro `.eyebrow` / `h1` /
  `.lede`, `#stage-title`, `.scroll-hint`, outro `h2` / `.lede`, the `.btn`, plus loader/error strings.
- **`Animations/laptop-teardown/style.css`** — comment headers + a few effects (the gradient `.btn`,
  glow/box-shadows, big text-shadows).
- **`Animations/laptop-teardown/script.js`** — **header comment only** (line 2). The rest of the comments
  are useful — keep them.
- *(Optional, low priority)* `Animations/laptop-teardown/README.txt` — dev note, not user-facing; only
  touch if it carries hype wording.

### Manager findings — concrete items to address (grounded in inspection)
| Location | Current text / effect | Why it feels AI / off | Direction |
|---|---|---|---|
| `index.html` ~292 (card desc) | "A scroll-driven teardown that lifts a laptop apart layer by layer — screen, board, battery, silicon. **Engineering shown as motion.**" | Over-explained list + slogan tagline | Tighten to one plain line (e.g. a "scroll-based 3D build study"). Title "3D Laptop Teardown" is fine — keep. |
| `index.html` ~293 (card foot) | "View **live** demo" | "live" is mild hype | "View Demo" |
| anim `index.html` `<title>` / `h1` | "Anatomy of a **Build**" / "Anatomy of a build" | Editorial / dramatic | Plainer, e.g. "Interactive Laptop Teardown" |
| anim `.eyebrow` | "WebSharke · **Engineering**" | Inflated dept label for a small studio | Tone down (e.g. "WebSharke" or "Interactive · 3D") |
| anim `.lede` (intro) | "Every site we ship is **engineered in layers — front to back, screen to silicon.** Scroll to take one apart." | Alliterative marketing flourish | Simple, human one-liner |
| anim outro `h2` | "**Built like hardware. Shipped like software.**" | Punchy ad/parallel tagline | Simplify or drop |
| anim outro `.lede` | "The same care, layer by layer, goes into the websites we build for you." | Earnest sales fluff (borders on a fake claim) | Make it plain/honest or remove |
| `style.css` line 2 **and** `script.js` line 2 | "**PREMIUM** LAPTOP TEARDOWN" (comment headers) | Hype word in code comments | "Laptop Teardown — …" |
| `style.css` ~30 / ~42 (comments) | "**Elegant**, simple background" / "**Whisper-faint** vignette" | Cutesy, AI-ish comment voice | Plain wording ("subtle vignette") — optional polish |
| `style.css` `.btn` ~283–288 + text-shadows ~124/184 | Gradient button + coloured glow `box-shadow`, large soft `text-shadow`s | Generic "premium gradient + glow" look | Compare against the **main WebSharke** button/CTA + theme; tone down/replace effects that clash. **Keep** shadows that are doing legibility work over the 3D scene. |

**Keep as-is (already clean, human):** loader "Preparing teardown"; error "Couldn't start the 3D
experience." / "Please refresh to try again."; caption "01 / Assembled"; hint "Scroll to disassemble";
CTA button "Start a Project"; the `<meta name="description">`; the `<noscript>` line.

### ⚠️ Traps — DO NOT over-correct (false positives found during inspection)
A blind find-and-replace on "premium / placeholder / generated" **will break things**. Specifically:
- **`index.html` lines ~304–305 "Premium Dark" / "Dark · Premium"** = the unrelated **style card 03**.
  **Leave it.** It is not part of this feature.
- **`script.js` "PLACEHOLDER GEOMETRY"** (lines ~5, ~141, ~641) = a real **technical** term — the laptop
  is built from procedural meshes that stand in for a future GLTF/GLB model. **Keep the meaning** (it
  prevents future bugs in the "swap in a real model" path); it is *not* marketing placeholder text.
- **`index.html` line ~351 "MARINE SNOW (generated once …)"** = a technical comment, unrelated to AI and
  unrelated to this feature. **Leave it.**
- **The `file://` / http(s) message** (the `FILE_MSG` block) and the **"Animation library failed to load
  (vendor/gsap.min.js)"** string = useful runtime/server notes that prevent support headaches. **Keep.**
- **The `CONFIG` block + "SWAPPING IN A REAL MODEL" notes** in `script.js` = genuinely useful. **Keep.**

### Do not touch
- **Vendor files:** `vendor/gsap.min.js`, `vendor/ScrollTrigger.min.js`, `vendor/three.module.js`,
  `vendor/jsm/environments/RoomEnvironment.js`, `vendor/jsm/geometries/RoundedBoxGeometry.js`.
- Payment logic · Stripe · Supabase · auth/login · unrelated dashboard logic.
- **Unrelated style cards:** the teardown card (01) is in scope; cards **02–05 are not**.
- Unrelated site sections.

### Steps
1. Inspect the laptop teardown card and animation page.
2. Identify copy, styling, labels, comments, or effects that feel AI-generated.
3. Rewrite user-facing copy to sound simple, direct, and human.
4. Reduce or remove unnecessary hype language.
5. Clean related styling only where it affects the laptop teardown feature.
6. Clean custom comments only if they are bloated or obvious.
7. Search for AI-ish terms like AI, generated, premium, revolutionary, cutting-edge, seamless, immersive,
   next-generation, masterpiece, placeholder, and lorem.
8. Only change matches that belong to this feature (see **Traps** above before editing any match).
9. Test the Styles tab, animation link/page, scroll animation, console, and mobile layout.
10. Update `docs/logs.md` and move the task to **[REVIEW]**.

### Completion checklist
- [x] Styles tab card copy feels natural and specific
- [x] Animation page copy feels natural and specific
- [x] No fake client claims remain
- [x] No obvious AI/template wording remains in this feature — *hype-term sweep clean*
- [x] No unrelated style cards changed — *cards 02–06 untouched*
- [x] No vendor files changed — *git confirms zero vendor edits*
- [x] Animation still loads — *ESM syntax OK · all JS DOM hooks present · HTML parses; load path also confirmed by the prior verify pass*
- [~] Scroll animation still works — *GSAP/scroll JS unchanged by this task (comment-only edits); live scroll not eyeballed in a non-GUI session*
- [~] Browser console has no new errors — *ESM syntax valid + no logic change; live console not eyeballed*
- [~] Mobile layout checked — *responsive CSS untouched; only `.btn` shadow alpha changed — not viewed live*
- [x] docs/logs.md updated — *START + FINISH entries*
- [x] Task moved to [REVIEW]
