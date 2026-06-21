# WebSharke — Performance Log

Owned by the **Efficiency** role (Manager may also edit). Read this before any Efficiency task. Record
performance / loading / code-weight / maintainability findings here. **Newest first.**

Efficiency entries use:

```
## YYYY-MM-DD HH:MM - Efficiency - Session Name

Area Reviewed:
Page, component, script, or asset

Finding:
What is inefficient

Impact:
Low / Medium / High

Recommendation:
What should happen

Status:
New / Task Created / Fixed / Rejected
```

---

## Findings

## 2026-06-20 10:50 - Efficiency - deploy-hygiene

Area Reviewed:
Deploy configuration (`.vercelignore`) + the admin dashboard's third-party `<script>`s.

Finding:
(1) No `.vercelignore` → a Vercel deploy serves `/docs/*` and `/db/*` publicly (internal logs/board, the
security log, and the Supabase schema). (2) `dashboard.html` loaded Chart.js 4.4.1 from jsDelivr — a
render-blocking third-party script in the admin (PII) context that also breaks in the user's CDN-blocked
browser (the Overview charts silently no-op).

Impact:
Medium — opsec/info-disclosure (F4) + a broken admin feature & supply-chain surface in the user's environment (F3).

Recommendation:
Done — added `.vercelignore` (`docs`, `db`, `CLAUDE.md`); vendored Chart.js to `js/vendor/chart.umd.min.js` (the
exact jsDelivr-served file) and pointed the dashboard `<script>` at it. Stripe.js left on its CDN (required).

Status:
Fixed (both tasks → [REVIEW]). Live checks pending review: `/docs/*` + `/db/*` → 404 on a Vercel preview; admin
charts render from the local copy.

---

## 2026-06-20 00:40 - Efficiency - no-cdn-fonts-remaining-pages

Area Reviewed:
Web-font loading on the 6 non-homepage pages (`dashboard`, `login`, `payment`, `onboarding`, `success`,
`cancel`).

Finding:
These pages still loaded Cormorant Garamond + Mulish from the Google Fonts CDN (2 `preconnect`s + 1
render-blocking `<link>`), which also fails in the user's CDN-blocked browser. Per-page audit: the shared CDN
URL over-requested (12 faces) but the pages render ≤6 — union = CG 600/700, Mulish 400/500/600/700 (no italic
on these pages; no real 800 — it maps to 700).

Impact:
Medium — render-blocking third-party request, and broken fonts in the user's environment.

Recommendation:
Done — replaced each page's CDN tags with a tailored inline `@font-face` block reusing `/fonts`; added the only
two missing faces (`mulish-700` copied from the animation vendor set; `cormorantgaramond-700` downloaded as the
Google latin subset — dashboard admin panel only). No visual change intended.

Status:
Fixed (this task → [REVIEW]; the site is now CDN-free for fonts). Live in-browser type-render eyeball pending
review.

---

### Migrated findings (from the retired Worker/Reviewer audit — recorded for continuity)

## 2026-06-19 (migrated) - Efficiency - homepage-weight-baseline

Area Reviewed:
Homepage (`index.html`) vs. the laptop-teardown route.

Finding:
The homepage loads **no** Three.js / GSAP — the ~1.6 MB animation payload (three.module.js ≈1.2 MB + gsap +
fonts) loads **only** on `/Animations/laptop-teardown`. The Styles card is a plain `<a>` link, not an
embedded module.

Impact:
Low — this is the desired state; recorded as a baseline so it is not regressed.

Recommendation:
Keep it this way. Any future change that imports Three.js / GSAP on the homepage is a regression and should
be rejected unless lazy-loaded behind interaction.

Status:
Fixed / by-design.

## 2026-06-19 (migrated) - Efficiency - google-fonts-cdn

Area Reviewed:
Web-font loading across all pages.

Finding:
The homepage's Google Fonts CDN `<link>` was replaced with local `@font-face` (Task C). The **other 7
pages** still load `fonts.googleapis.com` / `fonts.gstatic.com` — a render-blocking third-party request
that also fails in the user's CDN-blocked environment.

Impact:
Medium.

Recommendation:
Finish vendoring site-wide (Task E): per-page face audit, reuse the `/fonts` folder, download only the
weights a page actually uses that aren't already vendored.

Status:
**Fixed** — homepage via Task C; the 6 remaining pages vendored 2026-06-20 (this Efficiency task → [REVIEW]).
The site is now CDN-free for fonts. See the 2026-06-20 completion entry above.
