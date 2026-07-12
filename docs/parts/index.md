# Homepage — `index.html`

> The public front door: an ocean-descent landing page that sells WebSharke and points visitors to onboarding, login, and the engineering demo.

- **File:** `index.html`
- **Type:** page (static HTML, inline CSS + JS)
- **Route:** `/home` (also served at `/` — `vercel.json` rewrites `/home` → `/index.html`)
- **Last reviewed:** 2026-07-12

## What it does

This is the marketing homepage every first-time visitor lands on. It's built as
one long scroll that reads like descending from a sunlit beach into deep ocean:
a hero, a plain-language "How It Works" pitch, three "Why WebSharke" value cards,
and a "Featured" card that opens the `/engineering` demo. The only actions it
offers are **Start a Project** (→ `/onboarding`) and the nav **Sign In** link
(→ `/login`, which flips to **View Dashboard** for a signed-in client). It reads
Supabase auth only to decide that one nav label — it touches no tables and takes
no payments. It sits at the very top of the flow: `/home` → `/onboarding` or
`/login` → `/dashboard`.

## How everything inside works

One self-contained page — inline `<style>`, markup, then inline `<script>`. The
only external JS is the Supabase client (for the nav label).

**Fonts & tokens (`<style>` top).** Local `@font-face` rules for Distillery
Display and Playfair Display, served from `/fonts` with `font-display:swap` (no
Google Fonts CDN — vendored site-wide). A `:root` block defines an ocean palette
(`--sand`, `--ink`, `--foam`, `--deep`, `--aqua`, `--warm`, etc.) "derived from
the background image itself."

**The ocean scene.** A single full-width background image (`#bg`,
`images/Site_bkg.jpg`, preloaded `fetchpriority="high"` as the LCP) is anchored
top and scrolled through. Layered on top are CSS-driven effects: `#snow` (marine
snow motes, fixed, fade in only once `body.submerged`), `#fish` (fish + one shark
silhouette built from two reusable inline SVG `<symbol>`s), and a drifting
`.school` of small fish. All are `pointer-events:none` and disabled under
`prefers-reduced-motion`.

**Nav.** Fixed `<nav>` with a masked-logo home link and the `#auth-cta` Sign In
link. It's dark over the sand and turns to light glass (`nav.scrolled`) once you
scroll past the waterline.

**Sections (`.sx` scaffold).**
- `#hero` — full-viewport beach headline ("Websites are complicated / Good thing
  we're not") + the sand **Start a Project** button (`/onboarding`). Intro
  animates in after the loader hands off (`body.ready`).
- `#how` — "How It Works" copy blocks.
- `#why` — three **frosted-glass** value cards (Simplicity / Integration /
  Honest), each an image icon + `<h3>` + `<p>`, on a `backdrop-filter` blur panel
  with a 1px gradient frame and a hover float.
- `#featured` — a single large `<a href="/engineering">` card (whole box
  clickable, no button/copy) that recreates the engineering demo's opening frame:
  its wall-gradient, a masked wordmark, an "Engineering" title, over the demo's
  own `teardown-r0_*.v1.webp` still (`object-fit:cover`, lazy, responsive
  `srcset`).
- `#site-footer` — copyright line.

**Scripts (first block).** A preloader IIFE (fades `#loader`, adds `body.ready`);
an `IntersectionObserver` that adds `.on` to `.rv` reveal elements; generators
that inject the marine snow, fish, and school markup; a scroll handler that toggles
`nav.scrolled` / `body.submerged` at the waterline and applies subtle fish
parallax; a "fit background to content" IIFE that clamps `#bg` height to the
footer bottom (so the tall image doesn't create a black void below the content);
and a canvas-based favicon-glow generator.

**Auth-aware nav (second script block).** Loads the supabase-js CDN then
`js/supabase-config.js` (the shared `db` client), calls `db.auth.getSession()`,
and sets `#auth-cta` to **Sign In** → `/login` for visitors or **View Dashboard**
→ `/dashboard` for a signed-in client; `db.auth.onAuthStateChange` keeps it in
sync. This is the only dynamic/back-end touch on the page — no table reads,
no writes.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`.

- **2026-07-02** — Added the `#featured` section (between `#why` and the footer):
  a single lazy, static preview card linking to `/engineering`, built from the
  demo's own opening-frame assets. _(Note: references `/engineering/assets/fallback/teardown-r0_*.v1.webp` read-only — if the demo re-captures stills under new names, update this card. Session: `homepage-featured-engineering`.)_
- **2026-06-28** — Redesigned the "Why WebSharke" cards from weathered-wood
  planks to frosted underwater glass panels (`backdrop-filter` blur, 1px gradient
  frame, hover float); removed all `*-card`/`*-plank` styling. _(Note: this
  removed the wood treatment the two changes below had added/tuned. Session:
  `why-section-frosted-glass`.)_
- **2026-06-27** — Recolored the "Why WebSharke" heading and card text to warm
  cream (`#f1e8d4` / `#e6dcc6`) with a drop shadow. _(Note: superseded by the
  frosted-glass redesign the next day. Session: `why-section-text-color`.)_
- **2026-06-27** — Gave the third "Why" column ("Honest") the same masked-wood
  plank frame as the Simplicity/Integration cards. _(Note: also removed by the
  frosted-glass redesign. Session: `honest-card-wood-frame`.)_
- **2026-06-23** — Added a testing-disclaimer entry gate (four additive pieces,
  no existing logic altered). _(Note: logged by a Designer session; the current
  `index.html` no longer contains this gate, so it was removed in a later change
  not captured in the log. Session: `testing-disclaimer-gate`.)_

## Notes & gotchas

- This page's dynamic surface is tiny — only the auth-aware nav label. Don't
  refactor the `db.auth` logic without a clear bug; it's the same shared `db`
  client the auth pages use.
- Load order matters in the last script block: supabase-js CDN before
  `js/supabase-config.js` before any use of `db`.
- All images must live in `images/` and be referenced with the `images/` prefix
  (`Site_bkg.jpg`, `Main-Logo.png`, `Tab-Logo.png`, the `*-WW.png` icons).
- The `#bg` height is clamped to content height by JS on load/resize/font-ready;
  removing that IIFE reintroduces the black-void-below-the-fold bug.
- Link to **extensionless** routes (`/onboarding`, `/login`, `/dashboard`,
  `/engineering`) per `vercel.json` — don't add `.html` links.

## Related parts

- [[onboarding]] — where the hero **Start a Project** button sends new clients.
- [[login]] — where the nav **Sign In** link goes.
- [[dashboard-client]] — where **View Dashboard** sends a signed-in client.
- [[supabase-config]] — provides the shared `db` client the auth-aware nav uses.
