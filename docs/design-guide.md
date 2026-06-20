# WebSharke — Design Guide

Owned by the **Designer** role (Manager may also edit). Read this before any Designer task. It holds the
standing design direction plus a dated log of design decisions. Per-decision entries use the format in the
**Design decisions log** section below.

Reference for principles (use for inspiration, do **not** clone):
https://vervaunt.com/examples-of-luxury-brand-led-ecommerce-websites-premium-ecommerce-ux-technology

---

## Design direction

- brand-led
- premium
- restrained
- human-made
- clean visual hierarchy
- strong typography
- intentional spacing
- editorial feel
- subtle motion
- consistent components

## AI-looking patterns to avoid

- generic AI-template layouts
- random glows or decoration
- overhyped / hype-word copy ("premium", "revolutionary", "cutting-edge", "seamless", "immersive",
  "next-generation", "masterpiece")
- fake luxury clichés
- everything dark, glossy, or "premium" with no reason
- heavy animation added just for style

## Luxury / editorial e-commerce principles (applied from the reference — not copied)

- let whitespace and typography carry the page; decoration is the exception, not the rule
- one clear focal point per section; strong hierarchy over busy-ness
- motion is subtle and purposeful (reveal, not spectacle)
- components are consistent and reusable so the brand feels intentional and human

## Typography notes

- Display / headings: **Cormorant Garamond** (used at weight 600, plus 500 italic for eyebrows/accents).
- Body / UI: **Mulish** (400 body, 500 buttons/links, 600 kickers/labels).
- Fonts are being vendored locally (no CDN): homepage done (Task C); remaining pages in progress (Task E).
- **Type scale (documented 2026-06-20 from `index.html`).** Fluid `clamp(min, vw, max)` — the min/max are
  the mobile/desktop ends. Family · weight/style · size · line-height · letter-spacing:
  - **Hero title** `.hero-title` (h1) — CG 600 · `clamp(3.6rem,12vw,8.8rem)` · lh .92 · ls −.01em · on `--ink`. `<em>` → CG italic 500.
  - **Hero eyebrow** `.hero-eyebrow` — CG italic 500 · `clamp(1.35rem,3vw,2.15rem)` · lh 1.32 · ls .004em · `--ink-soft`.
  - **Section title** `.sec-title` (h2) — CG 600 · `clamp(2.3rem,5vw,4rem)` · lh 1.12 · ls .01em · `--foam` · capped 22ch.
  - **How-close** `.how-close` — CG italic 500 · `clamp(1.5rem,2.8vw,2.1rem)` · lh 1.4 · `--foam`.
  - **Why-column head** `.why-col h3` — CG 600 UPPERCASE · `clamp(1.5rem,2.4vw,2rem)` · ls .05em · `--foam`.
  - **Card title** `.sc-title` (h3) — CG 600 · 1.5rem · lh 1.12 · ls .01em · `--foam`.
  - **Card index numeral** `.sc-index` — CG 600 · 2.5rem · lh 1 · aqua @ .16 alpha.
  - **Body copy** — `.how-body p` Mulish 400 · `clamp(1rem,1.4vw,1.16rem)` · lh 1.9; `.why-col p` Mulish 400 · .95rem · lh 1.8; `.sc-desc` Mulish 400 · .9rem · lh 1.66.
  - **Buttons** `.btn` — Mulish 500 · .8rem · ls .18em · UPPERCASE.
  - **Nav sign-in** `.signin` — Mulish 500 · .76rem · ls .24em (→ .16em ≤680px) · UPPERCASE.
  - **Labels / kickers** — `.sc-kicker` Mulish 600 · .66rem · ls .22em; `.sc-go` Mulish 600 · .7rem · ls .16em; `.sc-soon` Mulish 600 · .66rem · ls .16em — all UPPERCASE.
  - **Footer** `#site-footer` — Mulish 400 · .76rem · ls .08em · `--foam` @ .68.
- **Type rules (observed — keep new work on these):** serif (CG) carries display + editorial accents
  (italic 500 = eyebrows/closers); sans (Mulish) carries body + UI. Display = tight tracking
  (−.01em….01em) + tight leading (.92–1.12); uppercase labels = wide tracking (.16em–.24em); body = loose
  leading (1.66–1.9). Don't introduce a third family or off-scale sizes.

## Spacing rules

- **Direction:** intentional, generous, consistent — no cramped cards, no arbitrary one-off gaps.
- **Section rhythm (documented 2026-06-20).** Scaffold `.sx` = vertical `clamp(5rem,10vh,8rem)`, horizontal
  `clamp(1.5rem,5vw,3rem)`, `scroll-margin-top:120px`. `#hero` top `clamp(6.5rem,17vh,9.5rem)`. `#styles`
  overrides to top `clamp(5.5rem,11vh,8.5rem)` / bottom `clamp(4rem,7vh,5.5rem)`. ≤680px the scaffold
  tightens to `clamp(3.5rem,9vh,5rem)` / 1.4rem and `#hero` top → 30vh.
- **Containers.** `.wrap` max-width 1100px (centered); `#how` narrows to 680px; `.why-cols` max 1080px;
  `.sec-title` capped at 22ch for a balanced measure.
- **Grid gaps.** `.why-cols` `clamp(2.2rem,5vw,4.5rem)`; `.style-grid` `clamp(1rem,1.6vw,1.4rem)`.
- **Vertical rhythm (intra-block).** body `<p>` mb 1.4rem; `.how-close` mt 1.8rem; `.why-col h3` mb 1.1rem;
  block-start gaps `clamp(2rem,4vw,3rem)` (how/why) and `clamp(2.4rem,4.5vw,3.4rem)` (style grid); card
  internals `.sc-kicker` mb .85rem, `.sc-desc` mt .6rem, `.sc-foot` pt 1.05rem.
- **Component box.** `.style-card` padding 1.7rem 1.6rem 1.45rem · min-height 202px · radius 16px.
  `.btn-sand` padding 1.05rem 2.9rem · radius 100px (pill). `nav` 1rem 2.6rem 1rem 1.6rem (compact .7rem
  when `.scrolled`; .8rem 1.4rem ≤680px).
- **Breakpoints.** 900px (`.why-cols` → 1 col / max 460px; `.style-grid` → 2 col) and 680px (compact nav,
  logo 140×79, `.style-grid` → 1 col, tighter section padding, hero top 30vh). JS: marine-snow count 14
  ≤768px else 24.

## Color usage

- Current theme is dark (recent retheme). Accents include a warm "sand" button (`.btn-sand` on the
  homepage) and a muted aqua used inside the laptop-teardown feature.
- **Palette tokens (`:root`, documented 2026-06-20). Hex · role · status.**
  - `--sand #f6e8ce` — warm cream (image sand) · **defined, unused in CSS** (the button's light stop is the separate `--warm-lt`, not this token).
  - `--ink #102536` — deep navy, text on sand · used (hero, signin, btn text, logo mask); also as `rgba(16,37,54,α)` shadow literals.
  - `--ink-soft #3a586b` — muted coastal blue, secondary on sand · used (hero eyebrow).
  - `--foam #ecf4f3` — soft off-white, text on water · used widely (body, sec-title, how-close, why h3, sc-title); footer = `rgba(236,244,243,.68)` (foam @ .68).
  - `--mist #aec3c9` — blue-gray muted text · used (`.sc-soon`).
  - `--deep #030d16` — page base / deepest water · used (body + loader bg).
  - `--surf #0a3d50` — surface teal · **defined, unused.**
  - `--aqua #62b6c6` — soft aqua accent · used (kicker, sc-go, focus outlines); alpha variants as `rgba(98,182,198,α)` literals (index numeral, hover border, `::before` hairline, loader glow).
  - `--aqua-d #2c7e90` — deeper teal · **defined, unused** (the favicon-glow JS uses a near-identical literal `rgba(46,126,144,.85)`).
  - `--warm #e4cfa6` — warm sand accent · **wired 2026-06-20** as the `.btn-sand` gradient lower stop (was a duplicated `#e4cfa6` literal).
  - `--warm-lt #f8ecd3` — light warm cream · **wired 2026-06-20** as the `.btn-sand` gradient upper stop (added during review; the button is now fully tokenized).
- **Usage rule:** dark page (`--deep` base, `--foam` text) on water; text switches to `--ink` over the sand
  band at the top. Accent = `--aqua` (+ its alphas); the only warm accent is the sand CTA. **Prefer the
  tokens over raw hex/rgba** so the palette stays honest — see the unused-token follow-up below.

## Component style rules

- **Buttons.** Base `.btn` = pill (radius 100px), UPPERCASE Mulish 500, ls .18em. Canonical CTA `.btn-sand`
  = warm sand gradient (`var(--warm-lt)` → `var(--warm)`) on `--ink` text, with a layered shadow that includes a
  top inset highlight (`inset 0 1px 0 rgba(255,255,255,.65)`) — a soft, physical sand chip, **not** a neon
  glow. Hover lifts −3px and deepens the shadow. New CTAs reuse `.btn-sand`; don't invent new button fills.
- **Cards.** `.style-card` is the canonical card: glass surface (`rgba(174,195,201,.05)` bg, 1px
  `rgba(174,195,201,.14)` border, `backdrop-filter:blur(13px) saturate(140%)`, inset top highlight + soft
  drop shadow), radius 16px, min-height 202px. Hover: lift −5px, aqua-tinted border, and an aqua hairline
  (`::before`) wipes across the top edge. `.style-card.feat` (the one live sample, card 01) = subtle
  aqua-tinted gradient bg + aqua border. Parts: `.sc-index` (quiet CG numeral, aqua @ .16), `.sc-kicker`
  (aqua label), `.sc-title` (CG 600), `.sc-desc`, `.sc-foot` (hairline top border), `.sc-go` (aqua
  "View demo" + arrow that nudges on hover), `.sc-soon` (mist "Preview coming soon").
- **Nav.** Fixed; transparent over the sand, then a downward teal glass gradient once `.scrolled`. The logo
  is a CSS-masked PNG that recolors `--ink` → `--foam` on scroll. `.signin` underlines on hover/focus.
- **Section scaffold.** `.sx` (flex-centered, clamped padding, `scroll-margin-top`) + `.wrap` (max 1100px,
  centered) + `.sec-title` (h2). All sections share this — keep new sections on it.
- **Reveal / motion.** `.rv` → `.rv.on` (fade + 34px rise) via IntersectionObserver, staggered with
  `.d1`–`.d5` delays; the hero uses `.anim` gated on `body.ready` after the loader. All motion honors
  `prefers-reduced-motion` (content shown instantly). Keep motion as reveal, not spectacle.

---

## Open design follow-ups (proposed tasks — Manager to triage)

Found during the 2026-06-20 homepage baseline. **None applied this pass** (each is a visual/behaviour change
that wants its own task + an in-browser eyeball). The one clearly-safe fix done this pass was wiring
`--warm` into `.btn-sand` (byte-identical).

1. **Unify the dim body-text color on `--foam` (Low).** `.how-body p`, `.why-col p` and `.sc-desc` use
   `rgba(240,248,250,.8/.78)` — a *different* base white than `--foam` (236,244,243); the footer correctly
   uses foam @ .68. Propose a `--foam-dim` token derived from `--foam` and normalize the .78/.80 drift.
2. **Resolve unused palette tokens (Low).** `--sand`, `--surf`, `--aqua-d` are defined but unused; the
   favicon-glow teal is still a bespoke literal (`rgba(46,126,144,.85)` ≈ `--aqua-d`). Either wire them in
   or remove them so the palette is honest. (`--warm` + `--warm-lt` now drive the `.btn-sand` gradient —
   the button is fully tokenized.)
3. **Tokenize aqua/ink alpha variants (Low, support-gated).** Replace the repeated `rgba(98,182,198,α)` /
   `rgba(16,37,54,α)` literals with `color-mix(in srgb, var(--aqua) X%, transparent)` etc. — only if the
   browser-support target allows `color-mix`. Manager/Efficiency call.
4. **Card keyboard-focus parity (Low, a11y).** `.style-card:focus-visible` shows only an outline while
   hover reveals the aqua `::before` hairline; mirror the existing `.signin:focus-visible` pattern by
   drawing the hairline on focus too (`.style-card:focus-visible::before{transform:scaleX(1)}`). Affects
   only card 01 (the one focusable card).
5. **Normalize the Styles-grid reveal stagger (Low, cosmetic).** Cards run `d1,d2,d3,d1,d3` — row 2 skips
   `d2`. Make the per-row stagger consistent.

Observation (not a task): the `#styles` 3-column grid holds 5 cards, leaving one empty cell on row 2. The
"Preview coming soon" placeholders (cards 02–05) are intentional and out of scope; revisit the grid only
when real previews replace them.

---

## Design decisions log

Newest first. Designer entries use:

```
## YYYY-MM-DD HH:MM - Designer - Session Name

Area Reviewed:
Page or component

Finding:
What felt off or what was improved

Decision:
What design direction should be followed

Notes:
Anything the Manager or future Designer should know
```

## 2026-06-20 00:55 - Designer - homepage-design-baseline

Area Reviewed:
Homepage `index.html` — the full inline design system (color tokens, type scale, spacing, components).

Finding:
The design system is sound and consistent but was undocumented (this guide held "to document"
placeholders), and a few palette tokens had drifted: `--sand`, `--surf`, `--aqua-d` and `--warm` were
defined but unused — the `.btn-sand` gradient duplicated `--warm` as a raw `#e4cfa6` literal — and body copy
uses a slightly different off-white (`rgba(240,248,250,…)`) than the `--foam` token the rest of the page
derives from.

Decision:
Documented the real tokens / type scale / spacing scale / canonical components in the reference sections
above (source of truth = `index.html`). Applied one clearly-safe consistency fix — wired `--warm` into the
`.btn-sand` gradient (byte-identical, zero visual change) so the warm CTA references the palette; during
review the upper stop was tokenized too (`--warm-lt`), so the button is now fully palette-driven. Logged the
rest (foam-dim unification, remaining unused-token cleanup, alpha tokenization, card focus parity,
reveal-stagger) as "Open design follow-ups" rather than changing rendered values in a baseline pass.

Notes:
The two-family type system (Cormorant Garamond display + Mulish body/UI) and the aqua/sand accent split are
the spine of the brand — keep new work on them. The `.btn-sand` sand-chip (inset highlight, no glow) and the
glass `.style-card` are the canonical components; match them instead of inventing new ones. The follow-ups
each need an in-browser eyeball, so they're left for the Manager to triage into tasks.

### Migrated decisions (from the retired Worker/Reviewer system — recorded for continuity)

## 2026-06-19 (migrated) - Designer - laptop-teardown-ai-cleanup

Area Reviewed:
Laptop Teardown feature — homepage Styles card 01 + `Animations/laptop-teardown/` copy & demo button.

Finding:
Copy read as AI / overhyped ("Anatomy of a Build", "Built like hardware. Shipped like software.",
"Engineering shown as motion."); the demo button used a generic aqua "premium glow" gradient.

Decision:
Use plain, human, specific copy (e.g. "Interactive Laptop Teardown", "A scroll-based 3D build study").
Tone the demo button to match the homepage `.btn-sand` (reduced glow + inset highlight) rather than a
generic premium gradient. This is the standing tone + component direction for the feature.

Notes:
Done under the old system (task "Remove AI Aspects From Laptop Teardown Feature", now [REVIEW]). Keep the
useful technical strings (loader/error text, the `file://` guard). The 3D model was later redesigned to a
thin, unbranded ultrabook (separate [REVIEW] task) — re-confirm the visuals when Task A (live render) runs.
