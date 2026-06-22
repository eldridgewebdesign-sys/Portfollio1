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
  - **Body copy** — `.how-body p` Mulish 400 · `clamp(1rem,1.4vw,1.16rem)` · lh 1.9; `.why-col p` Mulish 400 · .95rem · lh 1.8; `.sc-desc` Mulish 400 · .9rem · lh 1.66.
  - **Buttons** `.btn` — Mulish 500 · .8rem · ls .18em · UPPERCASE.
  - **Nav sign-in** `.signin` — Mulish 500 · .76rem · ls .24em (→ .16em ≤680px) · UPPERCASE.
  - **Labels / kickers** — `.sc-kicker` Mulish 600 · .66rem · ls .22em; `.sc-go` (card-footer link) Mulish 600 · .7rem · ls .16em — all UPPERCASE. (`.sc-soon` was removed in the 2026-06-20 styles-redesign.)
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
- **Grid gaps.** `.why-cols` `clamp(2.2rem,5vw,4.5rem)`. (The `#styles` `.style-grid` was removed in the
  2026-06-20 styles-redesign; the section now uses one centered `.style-one` block, max-width 540px.)
- **Vertical rhythm (intra-block).** body `<p>` mb 1.4rem; `.how-close` mt 1.8rem; `.why-col h3` mb 1.1rem;
  block-start gaps `clamp(2rem,4vw,3rem)` (how/why) and `clamp(2.4rem,4.5vw,3.4rem)` (`.style-one`); card
  internals `.sc-kicker` mb .85rem, `.sc-desc` mt .6rem, `.sc-foot` pt 1.05rem.
- **Component box.** `.style-card` padding 1.7rem 1.6rem 1.45rem · min-height 202px · radius 16px.
  `.btn-sand` padding 1.05rem 2.9rem · radius 100px (pill). `nav` 1rem 2.6rem 1rem 1.6rem (compact .7rem
  when `.scrolled`; .8rem 1.4rem ≤680px).
- **Breakpoints.** 900px (`.why-cols` → 1 col / max 460px) and 680px (compact nav, logo 140×79, tighter
  section padding, hero top 30vh). JS: marine-snow count 14 ≤768px else 24. (The old `.style-grid` column
  breakpoints were removed with the grid; `.style-one` is a single centered block that needs none.)

## Color usage

- Current theme is dark (recent retheme). Accents include a warm "sand" button (`.btn-sand` on the
  homepage) and a muted aqua used inside the laptop-teardown feature.
- **Palette tokens (`:root`, documented 2026-06-20). Hex · role · status.**
  - `--sand #f6e8ce` — warm cream (image sand) · **defined, unused in CSS** (the button's light stop is the separate `--warm-lt`, not this token).
  - `--ink #102536` — deep navy, text on sand · used (hero, signin, btn text, logo mask); also as `rgba(16,37,54,α)` shadow literals.
  - `--ink-soft #3a586b` — muted coastal blue, secondary on sand · used (hero eyebrow).
  - `--foam #ecf4f3` — soft off-white, text on water · used widely (body, sec-title, how-close, why h3, sc-title); footer = `rgba(236,244,243,.68)` (foam @ .68).
  - `--mist #aec3c9` — blue-gray muted text · **defined, unused** since the 2026-06-20 styles-redesign removed `.sc-soon` (its only consumer).
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
  (`::before`) wipes across the top edge. `.style-card.feat` (the live teardown sample) = subtle
  aqua-tinted gradient bg + aqua border; since the 2026-06-20 styles-redesign it is the **single featured
  card** in `#styles` (no grid, no numerals), wrapped in `.style-one` (max-width 540px, centered) under a
  `.styles-lede` line. Parts: `.sc-kicker` (aqua label), `.sc-title` (CG 600), `.sc-desc`, `.sc-foot`
  (hairline top border), `.sc-go` (aqua "View demo" + arrow that nudges on hover). (The `.sc-index` numeral,
  `.sc-soon` "coming soon" placeholder, and the `.style-grid` were removed in that redesign.)
- **Nav.** Fixed; transparent over the sand, then a downward teal glass gradient once `.scrolled`. The logo
  is a CSS-masked PNG that recolors `--ink` → `--foam` on scroll. `.signin` underlines on hover/focus.
- **Section scaffold.** `.sx` (flex-centered, clamped padding, `scroll-margin-top`) + `.wrap` (max 1100px,
  centered) + `.sec-title` (h2). All sections share this — keep new sections on it.
- **Reveal / motion.** `.rv` → `.rv.on` (fade + 34px rise) via IntersectionObserver, staggered with
  `.d1`–`.d5` delays; the hero uses `.anim` gated on `body.ready` after the loader. All motion honors
  `prefers-reduced-motion` (content shown instantly). Keep motion as reveal, not spectacle.

---

## Invoice & Billing system — UX direction & buildable spec (2026-06-22)

> Owner-assigned Designer task: design the **Admin Invoice Builder** and **Client Billing Page** for the
> custom-invoice system. **Direction/spec only** — the Developer implements it in `dashboard.html`.
> Visual reference: `docs/mockups/invoice-billing-mockup.html` (non-production sandbox; `docs/` is excluded
> from deploy). Grounded in `db/invoices-schema.sql` + `api/admin/invoices.js` + existing `dashboard.html`.

### Where it lives (reuse, don't reinvent)

- **Admin builder + list** → a NEW `Invoices` item in the admin sidebar (`.adm-nav`) opening a new
  `<section class="adm-view" id="view-invoices">` with two JS-toggled states: **LIST** (default) + **BUILDER**.
- **Client billing** → the EXISTING **Billing** tab (`#tab-billing`); add an "Invoices" block BELOW the
  current subscription controls (`#bill-none` / `#bill-active`) — do not replace them.

### Shared rules (both screens)

- **Money is cents.** Read/store `*_amount_cents` (bigint). Admin enters dollars → convert to integer cents
  **once, at blur** (round half-up); never keep float money in state. Format everywhere with ONE shared
  helper: `Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100)` → `$1,250.00`.
- **Server is authoritative.** `total = subtotal − discount + tax`, recomputed server-side; the UI total is
  a preview computed with the *identical integer-cents algorithm*, reconciled to the 201 response. If it
  differs, say so (toast) — never swap the number silently.
- **Status → client-facing label map (single source of truth):** draft→(never shown to client) ·
  issued→"Awaiting payment" · paid→"Paid" · overdue→"Overdue" · void/canceled→"Canceled — no payment due".
  Badge map: draft `.b-none` · issued `.b-in_progress` · paid `.b-complete` · overdue `.b-past_due` ·
  void/canceled `.b-canceled`. **Status text always inside the pill** (never color-only).
- **"Overdue" is derived, not stored.** Nothing flips `issued`→`overdue` today. Compute urgency at render:
  `overdue = status in (issued,overdue) && due_date && due_date < today`, and drive the red badge/banner off
  that — not off raw stored status.
- **Drafts are admin-only (the draft-leak trap).** `inv_owner_select` RLS scopes by owner only, so a draft IS
  readable by its own client once any read path exists. The client read MUST exclude `status='draft'`
  **server-side** (in the GET route, or as an added RLS condition) — not just in JS.

### Admin Invoice Builder — recommended layout (winner: guided single-column + sticky total bar)

**LIST state:** `.adm-view-head` (`.adm-h1` "Invoices" + `.adm-sub`) with a right-aligned `+ New invoice`
`.adm-btn.primary`; `.adm-cards` KPIs (Outstanding / Overdue / Paid (30 days) / Drafts); a `table.adm-table`
(Invoice · Client · Total · Status · Due · actions) with status `.badge`; `.adm-empty` when zero. Row click →
read-only `.adm-drawer` detail.

**BUILDER state:** header with `‹ Back to invoices`, `.adm-h1`, a status `.badge` AND a plain-language
`.adm-sub` sentence ("Draft — not yet sent" / "Issued — awaiting payment"), then four `.adm-panel-box`
sections using `.adm-fld` fields:

1. **Client & details** — Client (searchable `<select>` → `client_user_id`)*, Title*, Due date, Notes.
2. **Line items** — editable `.adm-table` rows: Item name*, Description, Qty (≥1), Unit price ($), Line total
   (read-only), delete. `+ Add line item` appends a row.
3. **Adjustments** — collapsed disclosure ("+ Add discount or tax") → Discount, Tax. Kept off the simple path.
4. **Totals** — right-aligned Subtotal / Discount− / Tax+ (zero rows hidden) / **TOTAL DUE** (largest type on
   the page) + "recomputed by the server" note + a collapsed "Preview what your client sees".

**TOTAL hard to miss:** shown twice — the big TOTAL DUE in §4 AND the live total in a **sticky action bar**
(built from the `.adm-toolbar` flex primitive) that never scrolls away. **Draft vs issued obvious:** badge +
status sentence + two distinct buttons (ghost **Save as draft** vs `.primary` **Issue invoice**). Issue is
gated behind an `.adm-modal` confirm that **echoes client + total** and states it can't be edited/canceled yet.

**Flow:** Save draft → POST `status:'draft'` (no confirm) → toast "Draft saved". Issue → confirm → POST
`status:'issued'` → toast "Invoice issued". The builder POSTs **only** draft or issued — never paid/void.

### Client Billing Page — recommended layout (winner: Amount-Due hero over quiet history)

Inside `#tab-billing`, below the subscription block: a divider + "Invoices" sub-heading, then:

- **Account banner** (reuse `.pay-banner` classes; see banner-ownership question) — names the total owed +
  overdue count; hidden when nothing's due; `role="status"`.
- **Amount-Due hero** (an inset block inside `.panel`, not a new card style) for the ONE most-urgent invoice
  (oldest overdue, else oldest issued): title, issued date, status badge, **big AMOUNT DUE figure** (largest
  text), due date (+ relative "8 days ago" for overdue), in-place "View line items" expand, an "also due" line
  when more than one is unpaid, and the **Pay placeholder**.
- **All-caught-up** block when nothing's due; **empty** block when the client has zero non-draft invoices.
- **Invoice history** — stacked glass cards (phone-native, no table), sorted overdue → issued → paid/closed.
  Paid cards = "Paid on …" + green badge + **no Pay button** (a finished receipt). Each card expands the
  shared breakdown.
- **Shared breakdown** — item rows ("2 × $250.00 … $500.00", optional description), then Subtotal /
  Discount− / Tax+ (zero rows hidden) / Total (paid → "Total paid").
- **Read-only always:** zero edit/void/status controls; only expanders, the anchor, and the inert Pay button.
- **Error state:** reuse `.bill-error`; on load failure suppress hero + history and the banner's invoice
  contribution (never show "you owe $X" with no invoice rendered below).

### UX problems developers must avoid (from the adversarial review)

**High:**

- **Draft leak** — filter `status='draft'` server-side (route or RLS), never client-only.
- **Zero-total invoices are valid + issuable** (server only rejects total < 0) — admin: disable Issue when
  total ≤ 0; client: a $0 invoice never enters the hero, shows no Pay button, isn't counted as "due".
- **"Overdue" never auto-sets** — derive urgency from `due_date` at render, or a late issued invoice shows a
  calm "Awaiting payment".
- **Issue is irreversible today** (no edit/void/PATCH) — confirm copy must say so + echo client/total; flag to
  the Manager that void/edit/mark-paid endpoints are needed before Issue is production-safe.
- **Sticky bar overlaps content** — reserve bottom padding = bar height; keep the focused field clear of it
  (and clear of the mobile keyboard).
- **Focus & traps** — move focus into the new row on Add and to the previous row on Delete; the
  drawer/confirm/pay modals need focus-in, Escape-to-close, and focus-return to the trigger; confirm modal
  focuses **Cancel**, not the destructive primary.
- **Status by color alone** — every pill carries text; verify 4.5:1 contrast over the *actual glass*, not
  white; don't rely on `.b-none` faint grey — lean on the builder's status sentence.
- **44px touch target + `:focus-visible` on the line-item delete** (`.adm-mini` is ~28px and has no focus
  ring); label it "Remove" on mobile; real `disabled` on the last remaining row.

**Medium / low:** integer-cents math every keystroke (no float drift); don't silently clamp discount — show an
inline error and block Issue when discount > subtotal; per-row `aria-label`s + announce the computed line total
and total changes via a live region; unique ids per breakdown disclosure for `aria-controls`; in-page anchor
must move focus (not just scroll); toasts in an `aria-live` region, errors don't auto-dismiss; the line-item
grid has a ~600–760px dead zone — reflow to cards earlier (~720px); avoid native number-spinner pitfalls
(`inputmode` + JS validation, not just `min`); "Closed" alone is ambiguous → "Canceled — no payment due";
compute the "payable" set ONCE so the banner total always equals the sum of visible amounts; for create-only
ship, show a success panel echoing the 201 instead of dropping to a permanently-empty list (prevents duplicate
re-creation).

### Pay-button copy (a deliberate Designer decision)

The two critics disagreed: keep it an active blue "Pay invoice" (don't look broken) vs. relabel/demote (don't
mislead — there's no checkout yet). **Decision:** keep it visible and active (not greyed) but label it
honestly — **"Request payment link"** — with a visible plain-text line ("Online payment isn't available yet —
WebSharke will email you a secure link to settle this invoice"), and keep it from reading as a dominant
store-style CTA. Swap to a prominent "Pay invoice" only when Stripe is actually wired. (Owner may override the
wording — see open questions.)

### Copy / labels

**Admin:** "Invoices" · "Create and track client invoices." · "+ New invoice" · KPIs "Outstanding / Overdue /
Paid (30 days) / Drafts" · "No invoices yet" / "Create your first invoice to bill a client." · table "Invoice /
Client / Total / Status / Due" · "‹ Back to invoices" · "Select a client…" · "e.g. Website build — Phase 1" ·
"Due date (optional)" · "Notes (optional)" · "Item name / Description (optional) / Qty / Unit price / Line
total" · "+ Add line item" · "+ Add discount or tax" · "Discount can't exceed the subtotal." · "Total due" ·
"Totals are recomputed and confirmed by the server when you save." · "Preview what your client sees" · "Save as
draft" · "Issue invoice" · confirm "Issue this invoice to {client}? They'll see it immediately, and it can't be
edited or canceled from the dashboard yet." · toasts "Draft saved" / "Invoice issued" · badges "Draft / Issued
/ Paid / Overdue / Canceled".

**Client:** "Invoices" · "Invoices billed to you by WebSharke." · "Invoice history" · "Amount due" / "Total
paid" · labels "Awaiting payment / Overdue / Paid / Canceled — no payment due" · "Due {Mon D, YYYY}" / "Paid on
{Mon D, YYYY}" / "No due date" · "View line items" / "View {N} items" · breakdown "Subtotal / Discount / Tax /
Total" · banner "You have $X due across N invoices. M is overdue. View below ↓" (single: "1 invoice needs your
attention — $X due.") · "You also have 1 other invoice due — see below." · "Request payment link" + "Online
payment isn't available yet — WebSharke will email you a secure link to settle this invoice." · "You're all
caught up" / "No invoices need payment right now." · "No invoices yet" / "When WebSharke bills you for a
project, your invoices will appear here." · error "We couldn't load your invoices right now. Please refresh the
page or try again later."

### Open questions / dependency flags (Manager / owner to resolve before the Developer task)

1. **Endpoints.** Only POST create exists. The list, KPIs, detail drawer, edit, mark-paid, and the client read
   all need new routes. Ship create-only first (builder + a success panel echoing the 201, no misleading empty
   list), or scope the read/update routes now?
2. **Client read path.** New `GET /api/invoices` (server filters drafts) vs. anon RLS SELECT (add a
   `status<>'draft'` policy). Determines the Developer task shape.
3. **Banner ownership.** `#client-pay-banner` is account-global + subscription-driven (above all tabs). Extend
   it to factor in invoices, or add a separate invoice-scoped banner inside `#tab-billing`? (Recommend the
   latter — isolates an invoice load failure.)
4. **"Overdue" source** — derive at read time (recommended) or a future scheduled job?
5. **Pay-button wording** — "Request payment link" (recommended) vs. a disabled "Pay" vs. keep "Pay invoice".
6. **Invoice number** — schema has only a uuid; omit a human "#INV-####" (recommended) or add a column later?
7. **Status writer guard** — builder must POST only draft/issued; "paid" must only come from a future
   webhook/mark-paid path, never the form (a "Paid" badge must always mean real settlement).

---

## Open design follow-ups (proposed tasks — Manager to triage)

Found during the 2026-06-20 homepage baseline. **None applied this pass** (each is a visual/behaviour change
that wants its own task + an in-browser eyeball). The one clearly-safe fix done this pass was wiring
`--warm` into `.btn-sand` (byte-identical).

1. **Unify the dim body-text color on `--foam` (Low).** `.how-body p`, `.why-col p` and `.sc-desc` use
   `rgba(240,248,250,.8/.78)` — a *different* base white than `--foam` (236,244,243); the footer correctly
   uses foam @ .68. Propose a `--foam-dim` token derived from `--foam` and normalize the .78/.80 drift.
2. **Resolve unused palette tokens (Low).** `--sand`, `--surf`, `--aqua-d` — and now `--mist` (its only
   user `.sc-soon` was removed in the 2026-06-20 styles-redesign) — are defined but unused; the favicon-glow
   teal is still a bespoke literal (`rgba(46,126,144,.85)` ≈ `--aqua-d`). Either wire them in or remove them
   so the palette is honest. (`--warm` + `--warm-lt` now drive the `.btn-sand` gradient — fully tokenized.)
3. **Tokenize aqua/ink alpha variants (Low, support-gated).** Replace the repeated `rgba(98,182,198,α)` /
   `rgba(16,37,54,α)` literals with `color-mix(in srgb, var(--aqua) X%, transparent)` etc. — only if the
   browser-support target allows `color-mix`. Manager/Efficiency call.
4. **Card keyboard-focus parity (Low, a11y).** `.style-card:focus-visible` shows only an outline while
   hover reveals the aqua `::before` hairline; mirror the existing `.signin:focus-visible` pattern by
   drawing the hairline on focus too (`.style-card:focus-visible::before{transform:scaleX(1)}`). Affects
   only card 01 (the one focusable card).
5. **Normalize the Styles-grid reveal stagger (Low, cosmetic).** Cards run `d1,d2,d3,d1,d3` — row 2 skips
   `d2`. Make the per-row stagger consistent.

Observation — **resolved 2026-06-20 (styles-redesign):** the `#styles` numbered placeholder grid (the
`01–06` cards + the empty-cell asymmetry) was removed per owner feedback ("the 01,02 is ai"). The section
now shows one featured teardown card + an honest "more on the way" lede. See the styles-redesign decision
entry below. (Follow-up #5 — grid reveal stagger — is therefore moot.)

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

## 2026-06-22 17:30 - Designer - retro-vintage-template

Area Reviewed:
New owner-requested deliverable — a vintage/retro-inspired REUSABLE website template, explicitly "no logos
and no name for website". Sandbox prototype: `docs/mockups/retro-template.html`.

Finding:
The brief offered six retro directions (70s editorial, 80s synthwave, 90s web, old diner, classic newspaper,
vintage print ad) and asked to "pick one era and commit" while staying modern, readable, professional, and
NOT a messy costume — and explicitly avoiding generic-AI vintage posters and filter/glow overload. The hard
project constraint (only the vendored Cormorant Garamond + Mulish + system-ui; no CDN; no new display font)
drives the choice: synthwave / diner / 90s all want display faces we can't load and slide toward
costume/cliché, while the print-era directions are exactly the ones a warm serif + clean sans can carry
honestly. A concept panel scored all six; **1970s editorial / magazine ("HARVEST PRESS") won decisively** on
de-AI authenticity + readability because its personality is structural — warm earth ink-on-cream palette, big
Cormorant display, multi-column spread, hairline rules, framed-photo blocks, a dotted-leader "contents/menu"
price bar — not a filter or a gambled font.

Decision (standing direction for retro/vintage demo templates):
- **Era: 1970s editorial print.** Warm cream paper `#F3E8D2` + warm chocolate ink `#2A1E12` (never pure
  `#000`/`#fff`) + rust `#9E3B1F` primary accent/CTA + rationed mustard/surface tones. Re-skin the whole
  template from one `:root` token block.
- **Type:** display mass = Cormorant Garamond 700 at large sizes with tight tracking (the era's magazine
  serif); body/UI = Mulish; editorial accents = CG 500 italic. No installed display font is gambled — the
  look survives any OS (same project rule as the bold template: engineer the look, don't depend on a font).
- **Components:** hairline + bold ink rules, kicker/eyebrow labels, framed-photo placeholder blocks (CSS/SVG
  mat, no raster), a ticket/menu services list with a desktop dotted-leader price bar, press-clipping /
  old-label trust callouts, a high-contrast rust final-CTA band. Decoration is structural, never a glow.
- **No-logo / no-name system (the owner constraint):** brand = a TEXT wordmark in a bracketed `[Brand Name]`
  slot + a CSS/SVG seal/monogram + an inline data-URI SVG favicon — zero raster assets, no baked business
  name. Every editable region marked `SWAP:`. (Same no-logo/no-name direction as the bold demo below.)
- **Texture restraint:** one low-opacity paper grain (data-URI), never under body copy at a level that hurts
  legibility. No heavy filters / fake distressing / AI-poster clichés.

Technical rules recorded (reusable):
- Enforce contrast in CODE, not by eye: small mustard words use a darkened `--mustard-text` (`#7E5410` ≈5.3:1
  on paper) and an even deeper `--mustard-deep` (`#6F4A0E` ≈4.9:1) when they sit on the deeper `--surface`
  mat; cream body copy on the rust band must be full-strength `--paper` (5.58:1), not softened cream
  (.82 ≈4.29:1 fails).
- A 4-child menu row (number / body / dotted-leader / price) needs a **4-track** grid on desktop
  (`auto auto 1fr auto`) with the leader as the elastic column; the leader is `display:none` below the
  breakpoint so the 3-track base grid stays correct (the classic grid child/column-count mismatch — caught
  and fixed in review).
- Reaffirms the project gotchas: CSS `var()` does NOT resolve in SVG presentation attributes (use
  `currentColor` / literal hex); the `../../fonts` paths are relative to the file and resolve to the repo
  `/fonts` from BOTH `docs/mockups/` and `demos/<name>/` (both 2 levels deep), so promotion needs no path
  change.

Notes:
- Sandbox / direction only — NOT production code, NOT wired into any live page (`docs/` is `.vercelignore`'d).
  Pairs with a future **Developer** task IF the owner wants it served (like `demos/corporate/` and
  `demos/bold/`): move under `demos/<name>/`, keep the `../../fonts` paths, and optionally wire it into the
  homepage `#styles` section as a THIRD live demo (the section currently shows teardown + bold).
- Built + adversarially reviewed via an ultracode workflow (6-era concept panel → 2 judges → builder → 4
  critics: retro/de-AI · frontend-QA · a11y/contrast · no-logo/template-conventions → fix). 9 findings
  (6 high/med) applied — the broken desktop menu-row grid + the two contrast misses among them. Inline JS
  compiles, CSS braces balance 201/201, and self-contained / no-CDN / no-raster-logo were verified statically.
- **In-browser eyeball still advised** (render / hover / mobile reflow / console) per the usual non-GUI caveat.
- Owner-direct task, not on the board — the **Manager should mirror it** (the Designer did not edit the board).

## 2026-06-22 17:10 - Designer - bold-demo-nologo

Area Reviewed:
The bold neo-brutalist-pop demo template (`demos/bold/index.html`) — now promoted into the live homepage
`#styles` tab as the second live sample — refined to the owner's hard direction: **no logo and no brand
name anywhere.**

Finding:
The bold "LOUDHAUS" template had been promoted from the sandbox into `demos/bold/` and wired into `#styles`
(the working-tree edit swapped it in where the corporate card was). But it still shipped a brand IDENTITY that
contradicts a logo-free / name-free template and read as unfinished in a live demo: a single-letter **"A"
monogram** in the nav, footer, favicon and hero collage; a **`[Brand Name]`** wordmark in the nav/footer/aria
labels/copyright; and visible `[Industry]` / `[Year]` / `[Client Name]` **bracket placeholders**.

Decision (standing direction for logo-free / name-free demo templates):
- **Ship NO logo, NO monogram, NO wordmark, NO brand name** — none in the nav, footer, `<title>`, meta, aria
  labels or copyright. The template is deliberately identity-less so a brand drops in. Personality is carried
  by **type, colour and shapes**, never a logo.
- **Nav opens straight into the links** (links left, the pop CTA pushed right via `margin-left:auto`,
  hamburger last); the brand slot and its `.brand`/`.mono`/`.name` CSS are removed, not left as dead rules.
  A lone right-aligned hamburger on mobile is acceptable.
- **Favicon = a neutral geometric data-URI mark** (yolk tile + offset siren/cobalt squares) — **no letter, no
  wordmark.** A required browser icon that carries no identity is the compliant way to avoid a `/favicon.ico`
  network request while honouring "no logo."
- **Replace a monogram GLYPH with a decorative shape** — the hero-collage square now shows a `✦` (matching the
  marquee stars), not an "A".
- **Replace visible `[brackets]` with realistic, neutral copy + keep `SWAP:` comments** (matches the
  corporate-demo convention: a finished-looking example, not a bracket-filled skeleton). Eyebrow → "Creative
  studio · Est. 2019"; testimonials use realistic **client** names (Maya Okafor / Daniel Reyes / Priya Anand —
  clients are fine; they are not the site's own brand); footer tagline + copyright carry no name.

Notes:
- `#styles` now shows **two** live samples: the 3D laptop teardown + this bold demo. The working-tree edit
  **replaced** the corporate card rather than adding a third — **Manager/owner to decide** whether to keep
  corporate as a third card (3-up grid) or leave it swapped out. I did not make that call (it's an `index.html`
  scope/IA decision beyond "make the bold demo logo/name-free").
- Verified: grep (zero residual brand/monogram/`[bracket]` tokens, zero dead `.brand`/`.mono`/`.name` refs,
  zero network/CDN calls — only relative `../../fonts` + inline data-URIs), `node --check` on the inline JS
  (passes), tag-balance, and a 3-critic adversarial verification workflow (no-logo completeness / a11y +
  contrast / structure + self-contained). The pass confirmed the template **fully logo/name-free + self-
  contained** (0 findings on those two lenses) and surfaced **one pre-existing contrast nit**: the manifesto
  pull-quote emphasis (`.quote .q`) used bright `--pop1` as TEXT on the sand `--surface` band — 2.52:1, failing
  AA large-text (3:1). Fixed by switching it to the **`--pop1-text`** token (4.25:1) — the exact small/coloured-
  siren-text case that token exists for. That is the only colour change; no other palette values were touched.
- **Live in-browser eyeball still advised** (render / hover / mobile nav / console) per the usual non-GUI
  caveat. **Role note:** owner-direct task — I edited `demos/bold/index.html` + this guide + `docs/logs.md`,
  **not** the taskboard; the **Manager should mirror this onto the board.**

## 2026-06-22 15:30 - Designer - bold-brand-template

Area Reviewed:
New owner-requested deliverable — a bold, colorful, personality-filled REUSABLE website template (no logos,
"feels like a template"). Sandbox prototype: `docs/mockups/bold-brand-template.html`.

Finding:
The brief wanted energetic / memorable / creative with strong contrast and a playful layout, but ALSO polished
(not childish/messy), scannable, accessible, and — per the owner — logo-free and template-like. The trap in
"bold + colorful" is sliding into generic-AI/SaaS vocabulary (gradient-clip headlines, glassy blobs, soft
glows) or into messy/childish. A concept panel scored five divergent bold directions; the neo-brutalist-pop
direction won decisively on de-AI and scannability because its personality lives in pure CSS (thick ink
borders, hard zero-blur offset shadows, exposed structure, rotated stickers, marker swipes, an editorial serif
clash) — which renders identically everywhere and degrades gracefully.

Decision (standing direction for bold/colorful demo templates):
- **"LOUDHAUS" neo-brutalist-pop.** Warm off-white paper `#FFFCF2` + warm near-black ink `#14110A` (never pure
  `#000`) + a rationed 4-pop palette: siren `#FF5747` (shout/CTA), cobalt `#2D7DD2` (accent/large text), yolk
  `#FFD23F` (badges/marker swipes), mint `#1FAE8C` (social-proof band) + a sand surface `#EDE6D4`. Cap at ~5
  colours; **Ink carries small light text** (not the pops). For SMALL siren-coloured text on paper use
  `--pop1-text #C8341F` (bright siren fails 4.5:1).
- **Type:** display MASS is engineered in CSS (`system-ui` 900 + tight tracking + hard shadow), NOT a gambled
  display font, so it survives any OS; body = vendored **Mulish**; editorial accent = vendored **Cormorant
  Garamond** (oversized section numbers + one pull-quote). The serif-vs-brutalist clash is the
  "polished, not childish" lever.
- **Components:** hard offset block-shadows at a fixed angle; a "press" hover (card/button translates into its
  shadow); exposed-but-disciplined layout (8px grid, consistent shadow angle, rationed rotations); brick-
  staggered cards; rotated sticker badges; CSS marquee ribbons; Highlighter-Yolk marker swipes. Decoration is
  structural, never a random glow.
- **No-logo brand system (reusable):** brand = a CSS/SVG single-letter monogram + a bracketed `[Brand Name]`
  text slot + an inline data-URI SVG favicon — zero raster assets. Cards auto-number (CSS `counter()`) and
  auto-cycle accents (`nth-child`) so the set flexes 3–6 unbroken. Re-skin the entire template from one `:root`
  token block.
- **Reuse existing project primitives** (grain data-URI, `.rv` reveal, two-layer focus ring) for cohesion.

Technical rules recorded (reusable):
- Personality must come from CSS, not an installed display font (engineer the mass; don't depend on Arial
  Black / Cooper Black).
- Enforce contrast in CODE, not by eye: Ink on Siren/Yolk/Mint; light text only on Ink or Cobalt-at-large;
  small siren text uses the darker `--pop1-text`.
- Reaffirms the project gotcha: **CSS `var()` does NOT resolve in SVG presentation attributes** — colour inline
  SVG via `fill="currentColor"` (+ a per-element `color`) or a literal hex, never `fill="var(--token)"`.
- Bleeding/rotated elements: `overflow-x:clip` on the section (not `body{overflow:hidden}`, to keep sticky),
  collapse shadows + drop rotations at the smallest breakpoints; marquees freeze under `prefers-reduced-motion`
  and pause on hover/`focus-within`, with `aria-hidden` duplicate halves.

Notes:
- Sandbox / direction only — NOT production code, NOT wired into any live page (`docs/` is `.vercelignore`'d).
  Pairs with a future **Developer** task IF the owner wants it served (move under `demos/`, root-absolute
  `/fonts/`, optional homepage `#styles` wiring as a third demo).
- Built + adversarially reviewed via ultracode workflows (5-concept panel + 2 judges; then 4 critics). The
  template/no-logo critic passed all hard constraints clean; contrast + a couple of swap-robustness fixes were
  applied.
- Owner-direct task; the **Manager should mirror it onto the board**. The Designer did not edit the board
  (role rule).

## 2026-06-22 13:30 - Designer - invoice-billing-ux

Area Reviewed:
New custom-invoice feature — Admin Invoice Builder + Client Billing Page (owner-assigned task).

Finding:
The invoice system needs to feel like a polished business tool (admin) and a trustworthy account statement
(client) — not a spreadsheet, and not a store checkout. The data model (cents money, the status set,
create-only API) and the existing dashboard component system already fix most visual choices; the open work
was information architecture, the build/issue flow, and the money/status/edge-case rules.

Decision:
Documented the full buildable direction in "Invoice & Billing system — UX direction & buildable spec
(2026-06-22)" above, with a visual sandbox mockup at `docs/mockups/invoice-billing-mockup.html`. Admin = a
guided single-column sectioned builder (Client & details → Line items → Adjustments → Totals) with the TOTAL
shown twice (big Total Due + a sticky bar) and draft-vs-issued signaled three ways (badge + status sentence +
distinct Save/Issue buttons), inside a new `view-invoices` admin view with a list + read-only drawer. Client =
an "Amount Due" hero (the one most-urgent invoice + an honest Pay placeholder) over a quiet stacked-card
invoice history, inside the existing Billing tab; read-only, drafts never shown, paid invoices read as finished
receipts. Reuses `.adm-*` (table / cards / badge / drawer / modal / fld) and the client
`.panel`/`.ws-btn`/`.badge`/`.pay-banner` — nothing new invented.

Notes:
- Arrived at via an ultracode design-panel workflow (6 layout explorers → 2 judges → 2 adversarial UX
  critics); the spec's "UX problems to avoid" section is the critique synthesis.
- Spec only — the Developer implements it in `dashboard.html`. Key dependency flags for the Manager: only a
  POST-create endpoint exists (list/read/edit/mark-paid are not built); the client read MUST exclude drafts
  server-side (the draft-leak trap); and "overdue" must be derived from `due_date` (nothing sets it today).
- One genuine design judgment for the owner: the Pay button is a placeholder labeled "Request payment link"
  (honest) rather than a misleading active "Pay invoice" or a broken-looking greyed button.

## 2026-06-21 12:30 - Designer - corporate-demo

Area Reviewed:
New reusable corporate-site demo template (`demos/corporate/index.html`) + the homepage `#styles` section
(linking it as a second live demo).

Finding:
The Styles section showed only the laptop-teardown demo plus a "more on the way" line. The owner asked for a
corporate-site demo to stand alongside it — built as an **unnamed, reusable template** (the way the teardown
is a live demo), not WebSharke's own brand and not a generic AI template.

Decision:
- **Its own brand, on the studio's bones.** The corporate demo gets a distinct identity — an editorial
  "warm paper + ink + one muted forest-teal accent" palette (`--bg #f4f1ea` / `--ink #1a1c1a` /
  `--accent #2f5d52`) — deliberately *not* the homepage ocean palette, so it reads as a different company.
  It still reuses the studio's two vendored families (Cormorant Garamond display + Mulish body/UI) via local
  `@font-face` (root-absolute `/fonts/...`, `font-display:swap`, no CDN) so it inherits the later font swap
  (Task F) for free. The CTA is a considered "paper chip" (inset highlight + layered shadow, no glow) — the
  same physics as the homepage `.btn-sand`, in this brand's palette.
- **No raster, ever.** All visuals are inline SVG / CSS — single-letter monogram, client-logo placeholders,
  consistent 1.75px line icons, hero/work motifs. Standing rule for demo templates: keep them fully
  self-contained (inline CSS/JS, vendored fonts, no CDN/network) so one file is the whole deliverable.
- **Swappable by design.** A single-letter monogram + a bracketed `[Company Name]` slot, realistic
  professional-services copy, and an HTML `SWAP:` comment on every editable region — so a client site is a
  find-and-replace, not a rebuild.
- **Honest Styles section.** Present real demos, not placeholders: the section now shows **two** live samples
  side by side (teardown + corporate) under a plain lede ("both live below"), reusing the canonical
  `.style-card.feat` in a new `.style-two` 2-up grid (collapses to 1 col ≤680px). Continues the
  styles-redesign principle — state things honestly in copy, don't fake them.

Technical rule recorded (reusable):
**CSS `var()` does not resolve inside SVG *presentation attributes*** (e.g. `fill="var(--accent)"`). Inline
SVG that needs to follow tokens must either use `style="fill:var(--accent)"` (CSS context), inherit via
`fill="currentColor"`, or — as done here for the static work-tile motifs — use the literal token hex value
with a comment. Caught + fixed two work-tile SVGs that would otherwise have rendered black/uncolored.

Notes:
- Built ahead of Task F (fonts) per owner direction; forward-compatible because it reuses the CG/Mulish
  family names F will swap site-wide.
- Live in-browser eyeball (render/hover/mobile/console) still advised per the usual non-GUI caveat.

## 2026-06-20 10:53 - Designer - styles-redesign

Area Reviewed:
Homepage `#styles` section (`index.html`) — markup + its inline CSS.

Finding:
The section read as an AI/template grid. Owner: "the styles section looks like ai… the 01,02,etc is ai."
Only card 01 (the live 3D Laptop Teardown) was real; cards 02–06 were empty "Preview coming soon"
placeholders, each stamped with a large `01–06` `.sc-index` numeral — so the section looked unfinished and
generic, the opposite of brand-led/human.

Decision:
Removed the numbered placeholder grid entirely and present the one real sample intentionally:
- Deleted the `.sc-index` numeral motif, the five placeholder cards, and the now-unused `.sc-soon` and
  `.style-grid` rules (incl. the two `.style-grid` responsive overrides).
- New treatment: section title + one honest lede line ("A look at the kinds of sites we build. The first
  one's live — more on the way.") + a single featured card for the teardown, reusing the **canonical
  `.style-card.feat`** component (no new card component invented). Two small layout helpers added:
  `.styles-lede` (centered muted lede) and `.style-one` (max-width 540px, centered block, left-aligned).
- Standing direction for "coming soon" content: **state it honestly in copy, don't fake it with empty
  cards.** One clear focal point per section over a busy grid (the editorial principle in this guide).

Notes:
- The `/Animations/laptop-teardown` link + the card's hover/focus behaviour are unchanged.
- Token knock-on: `--mist` was only used by `.sc-soon`, so it is now **defined-but-unused** (reference
  only) — folds into the existing "resolve unused palette tokens" follow-up.
- Supersedes the earlier in-session card-06 grid rebalance (removed here). The reference sections above
  (type scale / spacing / components) and the old "5-card grid leaves an empty cell" observation are now
  out of date re: `#styles` — the grid/`.sc-index`/`.sc-soon` no longer exist; treat this entry as the
  source of truth for the section until those are refreshed.
- Sequencing: nominally this task follows the typography-restore task; done now per owner direction. It
  uses canonical components + current fonts, so the later site-wide `font-family` swap needs no rework here.
- Live in-browser eyeball (render/hover/mobile) still advised, per the usual non-GUI caveat.

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
