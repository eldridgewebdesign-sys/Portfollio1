# Changelog

All notable changes to the WebSharke site. Newest first.

## 2026-06-20

### Changed
- **Remaining pages' fonts vendored locally — site-wide no-CDN policy complete.** Replaced the Google Fonts
  CDN `<link>` + two `preconnect`s on `dashboard.html`, `login.html`, `payment.html`, `onboarding.html`,
  `success.html`, and `cancel.html` with tailored inline `@font-face` rules served from `/fonts`
  (`font-display: swap`). Each page declares only the faces it actually renders. Added the two faces not yet
  vendored: `mulish-700` (copied from the laptop-teardown vendor set) and `cormorantgaramond-700` (downloaded,
  Google latin subset — used by the dashboard admin panel). No visual change intended; finishes removing the
  site's last third-party font requests, which the user's browser blocks. _(Efficiency task — files: the 6
  pages + `fonts/`.)_

## 2026-06-19

### Changed
- **Homepage fonts vendored locally (no CDN).** Replaced the Google Fonts `<link>` (Cormorant Garamond +
  Mulish) and its two `preconnect`s in `index.html` with inline `@font-face` rules served from a new
  top-level `/fonts` folder (`font-display: swap`). Only the 5 faces the page actually renders are included
  — Cormorant Garamond 600 + 500-italic and Mulish 400/500/600 — reusing the woff2 already vendored under
  the laptop-teardown animation (zero downloads). No visual change intended; removes the homepage's last
  CDN dependency, which the user's browser environment blocks. _(Task C — files: `index.html`, new
  `fonts/`.)_

### Removed
- **Deleted the orphaned `dashboard-style.html`.** The old non-functional "Sales Dashboard" static mockup,
  superseded by the laptop-teardown card and referenced nowhere outside `docs/` (no inbound links, JS
  redirects, or `vercel.json` rewrites). Recoverable from git history if ever needed. _(Task D —
  user-confirmed removal.)_
