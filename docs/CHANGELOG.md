# Changelog

All notable changes to the WebSharke site. Newest first.

## 2026-06-29

### Changed
- **Admin declutter pass 2 — Onboarding/Payments previews + a Settings kill switch.** Continued the cleanup
  across the remaining tabs. _(Files: `dashboard.html`, `api/admin.js`, new `db/platform-settings-schema.sql`.)_
  - **Onboarding Forms** preview trimmed to **Name · Business · Email · Phone + Edit** (every intake answer —
    description, goals, styles, notes, etc. — now lives only in the drawer); CSV export keeps the full record via
    `exportColumns`.
  - **Payments** preview trimmed to **Name (the user) · Client (business name) · Status** — removed the plan,
    amount, billing, website, domain columns and the inline Mark Active/Unpaid/View buttons. The row opens the
    full user drawer (which carries amount/plan/billing + the payment actions). `api/admin.js` `listPayments` now
    returns `user_name` + `business_name`; CSV keeps the full record via `exportColumns`. Removed the now-dead
    `paymentActionsHtml` + `doPayStatus`.
  - **Settings** tab gutted (removed the admin-account + table-density panels) and replaced with a single large
    red **"Disable Everything"** platform kill switch: heading + warning + status line + button, with a required
    confirmation modal. It flips one **reversible** Supabase flag (`platform_settings.disabled`) via two new
    admin-only API actions (`get_platform_status` / `set_platform_disabled`) — **never deletes data**, is logged
    to `admin_activity_log`, and becomes a green **"Re-enable Platform"** when on. New `db/platform-settings-schema.sql`
    creates a single-row `platform_settings` table (public read, `is_admin()`-only write). Non-admin clients hitting
    the dashboard while disabled see a friendly `#maintScreen` maintenance notice (fail-open; the admin gate runs
    first so the admin can never lock himself out).
  - **Drawer** renamed "Project Info" → **Onboarding Details** and added Stripe customer/subscription id +
    last-payment rows to **Hosting / Subscription**.
  - Reviewed via a second 4-dimension adversarial workflow (kill switch · previews/data-shape · reference
    integrity · requirements); **0 real issues** found.
- **Admin dashboard decluttered — Overview, Users tab, and the detail drawer.** Reworked `dashboard.html` (admin
  SPA) + `api/admin.js` so the main admin screens read cleaner and scan faster. _(Files: `dashboard.html`,
  `api/admin.js`.)_
  - **Overview** stripped from a 15-stat-card wall + four Chart.js charts + a recent-activity panel down to
    **exactly three lists**: **New Onboarding** (`#ovOnboarding`), **Current Projects** (`#ovProjects` — shows
    only owner name, business name, date purchased, status), and **Websites This Month** (`#ovMonth` — a real
    list of this-month site records with domain, owner/business, date, status — not a number). Each list row
    opens the relevant drawer; each section has a **View all →** link to the full view. Removed the now-unused
    chart helpers, the `chart.umd.min.js` `<script>` include, and the dead `.adm-cards`/`.adm-card`/
    `.adm-chart-wrap`/`.adm-skel-card` CSS.
  - **`api/admin.js` `getOverview`** now also returns `recentOnboarding`, `projects`, and `websitesThisMonth`,
    built **from the data it already fetches in-memory** (no new queries, no schema change); the existing
    `cards`/`charts`/`recentActivity` keys are untouched.
  - **Users tab** preview rows trimmed to **Name · Business · Email · Phone + an Edit button only**. Suspend/Ban/
    Delete were removed from the row (they live in the drawer now). CSV export keeps the full record set via a new
    `exportColumns` config, so exports lose nothing.
  - **User drawer** reorganised into labelled sections — **Contact Info · Business Info · Project Info · Hosting /
    Subscription · Website / Domain · Admin Actions · Recent Activity** — with destructive actions (Ban · Cancel
    subscription · Delete) grouped in a clearly-labelled red **Danger Zone**. No admin feature was removed; every
    advanced/destructive action moved into the drawer. All saved field ids + action wiring preserved.
- Reviewed via a 4-dimension adversarial workflow (reference integrity, API/data-shape, requirements,
  CSS/responsive); two CSS findings fixed (Danger-Zone heading specificity, orphaned skeleton rule).

## 2026-06-21

### Changed
- **Optimized `images/` (−84% on disk; −94% of what modern browsers fetch).** The 1.5 MB homepage background
  `Site_bkg.png` is now `Site_bkg.webp` (73 KB) with a `Site_bkg.jpg` fallback via `<picture>` (and a WebP
  preload) — the `fetchpriority="high"` LCP image dropped ~95%. The two 1920×1080 logo PNGs were downscaled +
  quantized in place (Tab-Logo 47→3 KB, Main-Logo 39→13 KB) with unchanged filenames, so no page references
  changed. No visible quality loss; optimized directly with Pillow (no build step / dependency). _(Efficiency.)_

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
- **Vendored Chart.js locally on the admin dashboard.** Replaced the jsDelivr `chart.js@4.4.1` `<script>` on
  `dashboard.html` with a local copy at `js/vendor/chart.umd.min.js` (the exact jsDelivr-served UMD file) —
  removes a render-blocking third-party script in the admin context and fixes the Overview charts breaking in
  the user's CDN-blocked browser. Stripe.js intentionally stays on `js.stripe.com`. _(Efficiency — Security F3.)_

### Security
- **Stopped serving internal/sensitive files publicly.** Added a root `.vercelignore` excluding `docs/`
  (task board, work log, **security log**), `db/` (Supabase schema + admin-setup SQL), and `CLAUDE.md` from the
  Vercel deploy — they were otherwise world-readable. _(Efficiency — Security F4; `db`/`CLAUDE.md` flagged as
  extensions beyond the literal docs-only finding.)_

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
