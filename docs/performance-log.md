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

## 2026-06-23 21:52 - Efficiency - premature-payment-success-fix (efficiency rationale)

Area Reviewed:
The payment-success verification fix in `dashboard.html` (shared Payment Element flow) + `success.html`. (Full
change record is in `docs/logs.md` 2026-06-23 21:52 — this entry only captures the Efficiency-relevant design
choice. The fix itself was owner-directed code work, normally a Developer task.)

Finding:
The "verify before showing success" requirement could have been met by adding a new `/api/payment-status`
serverless route that calls Stripe. That would add network surface (a new endpoint + extra Stripe API calls per
payment) for no benefit, because the Stripe **webhook** (service-role, server-only) already writes the
authoritative paid/active status into `invoices`/`subscriptions`, and the browser can read its own rows via the
anon key + RLS.

Impact:
Low (efficiency/maintainability — avoided unnecessary work).

Recommendation:
**Done** — no new endpoint. Verification reuses the existing `pollInvoicePaid` DB-poll pattern (mirrored as
`pollSubscriptionActive`): one indexed PK/`user_id`-scoped read per ~2s tick, capped at ~30s, no busy-loop, no
full-page reload on the in-page path, no new dependency/CDN. Net new network cost is a few small Supabase reads
only while a payment is settling — strictly cheaper than per-payment Stripe calls from a new route.

Status:
Fixed (code change logged in docs/logs.md; Manager to record board status — not a board task).

---

## 2026-06-23 21:28 - Efficiency - style-demos-perf-review

Area Reviewed:
The six style-demo pages (`demos/bold|cards|corporate|dark|photo|vintage/index.html`, 46–61 KB each,
self-contained) — the current "Demo Cleanup Round" focus, which had **never had an Efficiency pass**. Owner
directed an Efficiency-role review this session; it is **not** a board-assigned task (the cleanup round assigns
no Efficiency task), so per role rules I logged findings here and did **not** touch the taskboard — Manager to
triage. **Review only — no code changed.** Method: per-demo static audit of external requests, font loading,
inline JS behavior (scroll/resize handlers, observers, timers), and data-URI weight.

Finding:
**The demos are in good efficiency shape — PASS, no High/Medium.** Confirmed strengths (do not regress):

- **Fully CDN-free.** Zero external `<script>`/CDN/`googleapis`/`jsdelivr`/`unpkg` references and **zero
  `<img>`** across all six (only tiny inline `data:` SVG favicons). No Three.js / GSAP — the ~1.6 MB animation
  payload stays confined to `/Animations/laptop-teardown` (baseline preserved). Matches the project's
  vendor-locally / CDN-blocked constraint.
- **Fonts vendored + lazy.** All faces load from `../../fonts/` with `font-display:swap`; `--mono` resolves to
  the system monospace stack (no woff2). Browsers fetch each woff2 only when a glyph uses it.
- **Cheap runtime.** Each page has exactly one `scroll` listener, all registered `{passive:true}`, and each
  `onScroll` does only a single `classList.toggle('scrolled', scrollY > N)` — no `getBoundingClientRect` or
  layout work in the scroll path. Reveals use `IntersectionObserver` (not scroll-driven); count-ups use
  `requestAnimationFrame`. **No `setInterval`/`setTimeout` polling loops** anywhere. `corporate` is the leanest
  (~2 KB inline JS); the others 31–51 KB inline JS, all gzipped by Vercel and loaded only when that demo is
  opened.

Confirmed issues, by impact:

- **[Low — rendering quality, flag to Designer] `demos/dark` uses Cormorant Garamond at `font-weight:700`
  (KPI values, stat figures, testimonial author names — 4 CSS sites) but only declares the CG **600** + **500i**
  `@font-face`s — it never vendors `cormorantgaramond-700.woff2`.** So those bold serif headings render with
  browser **faux-bold synthesis** of the 600 face. The 700 woff2 already exists in `/fonts` and **every other
  demo declares it**, so the fix is a one-line `@font-face` add (no new asset, no new download burden — if
  anything it's a quality fix, not a weight cost). This is a visual-quality nit more than an efficiency cost, so
  it's a **Designer/Developer** item — flagged for Manager triage, not an Efficiency fix.
- **[Informational] Per-demo CG `@font-face` sets are inconsistent.** `bold` declares exactly the two it uses
  (500i + 700 — the ideal minimal set); `dark` declares 600 + 500i (missing 700, above); the other four declare
  all three (500i/600/700). Because woff2 are lazy-fetched per glyph, a *declared-but-unused* face costs only a
  few bytes of CSS parse and **no download** — so this is not worth churning files over; recorded only so a
  future maintainer knows the variance is harmless, not a bug.
- **[Informational] No `<link rel="preload">` for the serif faces.** With `font-display:swap` this is fine
  (text paints immediately in the fallback, swaps in CG when ready). These are click-through demo pages, not
  LCP-critical production, so preload is optional polish — do **not** add it speculatively.

Impact:
**0 High / 0 Medium / 1 Low (rendering quality, → Designer) / Informational (the rest).** Nothing blocks the
demos; they are CDN-free, library-free, and have a near-zero continuous runtime cost.

Recommendation:
**Optional, low priority:** add the missing `cormorantgaramond-700` `@font-face` to `demos/dark/index.html`
(file already in `/fonts`) so its bold serif headings stop synthesizing — a **Designer/Developer** task, not an
Efficiency one. Otherwise **no action**: do not "optimize" the font declarations (lazy-loaded, harmless) and do
not add font preloads to these demo pages. **Flagged to the Manager** to triage the dark-CG-700 item (and, if
desired, fold it into the existing "Demo Cleanup Round" since dark is already being edited there).

Status:
New (findings recorded; review-only, owner-directed — not a board task, so no taskboard edit made; Manager to
triage the one Low item into the Demo Cleanup Round / a Designer task).

---

## 2026-06-22 21:30 - Efficiency - invoice-stripe-payment-review

Area Reviewed:
The Stripe invoice-**payment** implementation (Task S8) — `api/invoices/pay.js` (NEW pay endpoint),
`api/webhook.js` (added `payment_intent.succeeded` + `payment_intent.payment_failed`),
`db/invoices-schema.sql` (`currency`/`paid_at`/`stripe_payment_intent_id` columns + the G1 atomic-create RPC),
and `dashboard.html` (the client billing pay flow: `let stripe` lazy-init, `payInvoice()`, the reused Payment
Element modal + shared `confirmPayment`), with `api/checkout.js`/`api/admin.js` as the comparison baseline.
**Review only — no code changed.** Method: a 5-area fan-out (endpoint quality · Payment Element integration ·
webhook quality · DB usage · future maintainability) with every finding adversarially re-verified against
source (23 agents; 18 findings confirmed, 32 positives). Per-area verdict: **Endpoint PASS-with-nits ·
Payment Element FAIL (one concurrency bug) · Webhook PASS · DB PASS-with-nits · Future-maintainability PASS.**

Finding:
**Overall: PASS on code quality / performance / maintainability — and READY for Reviewer live testing (test
mode), with ONE bug to fix before switching to live keys.** Confirmed strengths (do not regress): the amount +
currency are read ONLY from the DB row, never the client (`pay.js:122-136`); the webhook is the SOLE authority
for "paid" and re-verifies `pi.amount`+`currency` against the invoice before flipping it (`webhook.js:197-206`),
with two-layer idempotency (`status==='paid'` early break `:193` + `.neq('status','paid')` race guard `:212`);
subscription/portal flow is intact and uncollided (plan PIs carry no `metadata.invoice_id`, so they fall
through — confirmed in `checkout.js`); DB usage is tight (PK `.eq("id")` + `.maybeSingle()` + explicit columns,
**`invoice_items` correctly NOT fetched** on the pay path, 1 SELECT +(conditional)1 UPDATE); the Payment
Element modal is reused cleanly (one modal, one teardown path, `let stripe` lazy-init doesn't disturb the plan
flow); loading/error states are handled; and my earlier Phase-1 Medium (atomic create) was implemented as the
`create_invoice_with_items` RPC.

Confirmed issues, by impact:

- **[Medium — BUG] Concurrent double-charge: no idempotency key on PaymentIntent create**
  (`api/invoices/pay.js:160-176`). On a first-ever pay, `invoice.stripe_payment_intent_id` is null so the
  reuse branch (`:140`) is skipped and `stripe.paymentIntents.create()` runs with **no `idempotencyKey`**; the
  follow-up UPDATE (`:173-176`) is scoped only by `id` (no `IS NULL` guard). Two **concurrent** requests (two
  tabs / two page loads) both see null, both create a distinct PI, the second overwrites the row's PI id, and
  if the user confirms card entry in **both** Element sessions Stripe captures **both** → a real double charge.
  The webhook's invoice-row idempotency keeps the *data* correct (paid once) but **cannot refund the second
  charge**, and the status enum has no `refunded` state to even represent it. *Verification narrowed the
  scope:* the single-tab vector is neutralised (button disables in-flight at `dashboard.html:1284`; the shared
  modal tears down prior mounts at `:1244-1256`), so this needs the deliberate two-tab + double-confirm path —
  hence **Medium, and NOT a Reviewer-blocker** (a normal one-browser customer can't hit it). → **One-line fix:**
  pass a deterministic key — `stripe.paymentIntents.create({...}, { idempotencyKey: "inv_" + invoice.id })`
  (`pay.js:161`); Stripe then returns the SAME PI for concurrent first-pay requests. Optionally also scope the
  UPDATE with `.is("stripe_payment_intent_id", null)`. No new deps, no schema, no UI change. **Do this before
  going live with real cards.**
- **[Low] Auth/CORS/env/service-role boilerplate duplicated across ~5 `/api` routes** (`pay.js:46-85`,
  `checkout.js:17-61`, `customer-portal.js`, `admin.js`, `admin/invoices.js`; `adminClient()` is byte-identical
  in two of them). → Extract a small **CommonJS** `api/_lib/` helper (`applyCors`, `adminClient`,
  `requireUser`/`requireEnv([...])`) — `require()` needs no build step; migrate one route at a time, no behavior
  change. **Caveat (from verification):** preserve per-route differences — `admin.js` CORS is `*` (not the site
  origin) and the 401 messages differ per route — so the helper must parameterise, not flatten.
- **[Low] `currency` is written/enforced server-side but never read by the client display** — `pay.js:127-136`
  refuses non-USD and `webhook.js:197-206` cross-checks it, but the dashboard `.select()` (`:1678`) omits it and
  the formatter hardcodes USD (`:1635`). Safe **today** (no non-USD invoice can ever be paid), but a latent
  coupling. → Add a one-line comment noting the USD assumption mirrors the `pay.js` guard; if multi-currency is
  ever enabled, select + read `invoice.currency`.
- **[Low] Status vocabulary duplicated in 4+ places** (schema CHECK `:30`, `ALLOWED_STATUS`
  `admin/invoices.js:66`, two `PAYABLE_STATUSES`, `CLIENT_VISIBLE_STATUSES`/`CLIENT_STATUS_LABEL`) with no
  `refunded`. Same root cause flagged in the Phase-1 review. → Adding refunds later means a coordinated CHECK +
  allow-list edit; the CHECK is the real enforcement, the JS lists are display/gating. Reciprocal "keep in sync"
  comments.
- **[Informational]** (record, no action this phase): a dead `|| iv.paid_date` fallback in the client render
  (`dashboard.html:1745` — `paid_date` is never selected and no such column exists; also present at
  `payment.html:436`) → drop the term, `paid_at` already covers it; the **"no `metadata.invoice_id` ⇒ not an
  invoice PI"** routing contract is documented only at the webhook consumer → add a mirror comment at
  `checkout.js:101` + `pay.js:164` so a future edit can't silently cross the flows; a reused PI is abandoned
  (not cancelled) only if an invoice amount ever changed after the intent opened — **can't happen today**
  (amounts are immutable post-create); no Stripe event-id dedup ledger, but the amount/currency re-verify +
  status guard make a stale-PI success harmless; the webhook pre-SELECT is partly redundant with the `.neq`
  guard but **justified** (it supplies the amount/currency for the defence-in-depth check) — keep both, and a
  future editor must NOT delete the `.neq('status','paid')`; `stripe_payment_intent_id` is client-write-only by
  design.

Future maintainability (Area 5 — all PASS; "name the path, do NOT build now"):
- **deposits / partial payments / payment history** want a child **`public.invoice_payments`** table keyed by
  the PaymentIntent id (FK + cascade, mirroring `invoice_items`), instead of the single
  `invoices.stripe_payment_intent_id` column (one-payment-per-invoice today). The `metadata.invoice_id` join key
  already exists end-to-end, so it's purely additive; nothing in the current code blocks it.
- **refunds** need a NEW `case "charge.refunded"` + a `refunded` status — the webhook switch is additive-safe.
  (Verification note: a `charge.refunded` event's object is a **Charge**, not a PaymentIntent, so the handler
  must resolve the invoice via `charge.payment_intent` / a DB lookup, not read `metadata.invoice_id` off the
  charge.)
- **failed-payment display**: `payment_intent.payment_failed` is intentionally log-only (no invented column);
  the failure event is already received + parsed (`pi.last_payment_error`), so a future column/table is the
  only addition needed.
- **status transitions** (issued→overdue, void, manual mark-paid) have no route yet (only writers are create +
  webhook) — a future admin `case` in `api/admin.js` reusing `logActivity` is the clean path.
- The total migration surface for all of the above is tiny — **2 server PI-writes (`pay.js:175`,
  `webhook.js:210`) + 1 client read** — which is a positive: the structure does not paint the project into a
  corner.

Impact:
**1 Medium bug** (concurrent double-charge — fix before live keys) / **3 Low** (boilerplate dedup, currency
display coupling, status duplication) / Informational (the rest). **0 Reviewer-blockers.** No High.

Recommendation:
**Fix before live cards:** the `idempotencyKey` one-liner in `pay.js` (closes both the two-tab and any
fast-double-submit race via Stripe's native dedupe). **Good cheap wins:** drop the dead `paid_date` fallback;
add the cross-flow `invoice_id` comment; the `_lib/` auth-helper extraction; the currency-display + status-sync
comments. All respect the project constraints (CommonJS `require()`, inline-per-page, no new deps, no Stripe
feature-creep, no UI redesign, subscription/portal flow untouched). **Flagged to the Manager to triage into
Developer fix tasks** — the idempotencyKey is the one to schedule before flipping to live keys.

Status:
New (findings recorded; Task S8 → [REVIEW]; **ready for Reviewer live test S9 in TEST MODE** — the double-charge
bug is not reproducible by a single normal customer; Manager to cut the idempotencyKey Developer fix before
production/live keys).

---

## 2026-06-22 17:05 - Efficiency - invoice-system-review

Area Reviewed:
The Phase-1 custom invoice system (Task 7) — `api/admin/invoices.js` (admin create route),
`db/invoices-schema.sql` (tables / indexes / RLS), and `dashboard.html` (client billing **read** region
~1540–1882 + admin invoice-**builder** region ~2680–2928), with `api/admin.js`
(`listUsers`/`enrichUsers`/`applyListOpts`) as supporting context. **Review only — no code changed.**
Method: a 5-dimension fan-out (query efficiency · client-page perf · admin-builder code quality · API
quality · maintainability) where every candidate finding was adversarially re-verified against the actual
source before being recorded (28 agents; 22 findings confirmed, 35 positives noted). Duplicate findings about
the same root cause are merged below.

Finding:
**The invoice system is in good shape overall.** Confirmed strengths (do not regress): the client billing
page is **N+1-free** — all visible invoices in one scoped+indexed query, then **all** line items in one
batched `.in("invoice_id", ids)` query (`dashboard.html:1631-1635`), grouped in JS; explicit column lists
(no `SELECT *`) on the client reads; the per-line total is a **STORED GENERATED** column so it never drifts
and is never recomputed; the create route **batch-inserts** all items in one statement; money is **integer
cents end-to-end with the server as the sole authority** (client total is an explicit estimate); the builder
has solid **double-submit** protection (lock held across validate→confirm→POST) and robust busy-state
restore; rendering is XSS-safe `textContent` via a `DocumentFragment` (one layout pass); the dashboard
**reuses its single `project_inquiries` fetch** for both Business + Project sections (no redundant round-trip).

Confirmed issues, by impact:

- **[Medium] No atomic invoice create — invoice + items are two non-atomic writes** (`api/admin/invoices.js:309-349`).
  The header inserts (310-314), then items insert separately (321-324); on item failure a best-effort
  *compensating delete* (330) cleans up, but if that delete also fails the route knowingly leaves an
  **orphaned invoice with no line items that the client can read via RLS** (`inv_owner_select`,
  schema 96-98). Only manifests on a double-failure (narrow), hence Medium not High. The code + schema
  already name the fix. → Before Stripe, move steps 5–6 into one Postgres RPC
  (`create_invoice_with_items(...)` via `supa.rpc(...)`) so header+items commit/roll back atomically; keep
  `parseInvoiceBody` as-is.
- **[Low] Admin client-picker over-fetches** (`dashboard.html:2895` → `api/admin.js:284-308`). Opening the
  Invoices view calls `list_users` with `limit:100000`, which runs `SELECT *` over all of `project_inquiries`
  **plus two enrichment joins** (`subscriptions`, `websites` via `.in(ids)`) — every column of three tables —
  to populate a `<select>` that uses only `user_id, full_name, business_name, email`. Cached per page-load
  (`INV.clientsLoaded`) and admin-only, so current cost is minor; it scales badly. → Cap the limit to a
  realistic value (e.g. 1000) and/or add a lean `list_clients` admin action selecting only those 4 columns
  with no enrichment. (Same root cause surfaced under 4 dimensions — recorded once here.)
- **[Low] Client invoice + item queries are unbounded** (`dashboard.html:1613-1635`, no `.limit()`/pagination).
  Every visible invoice (incl. void/canceled, never pruned) + all items load and render on each dashboard
  load — fine now, grows without bound for a long-lived client. → Add `.limit(50)` after `.order(...)` at
  `:1618` (the items query is then naturally bounded). Pagination can wait.
- **[Low] Invoices load eagerly on every dashboard load even though Billing is not the default tab**
  (`dashboard.html:1859`; default tab is Account, tab-switching is pure CSS). 2 queries + a DOM build run for
  clients who never open Billing. The call is already non-blocking, so this is opportunistic. → Optionally
  lazy-load on first Billing open (once-guarded) in the nav handler.
- **[Low] Page-load fetches run strictly serially, delaying when the invoice load can start**
  (`dashboard.html:1781→1787→1812→1830→1859`). `loadClientInvoices` only needs `user.id` but is gated behind
  two unrelated profile round-trips. → Start it **right after the admin gate (after `:1804`** — *not* after
  the session gate, or it would fire a client query for the admin too) so it overlaps the profile/sub
  fetches; optionally `Promise.all` the two independent profile queries (1812-1837). (`getUser` must stay
  before the gate.)
- **[Low] Live total can disagree with what Save accepts on fractional quantity** (`dashboard.html:2764` vs
  `2794-2795`). `recomputeInvoice` *floors* qty (`Math.floor`) so "2.7" shows a coherent line amount, but
  `collectInvoice` *rejects* non-integers — the on-screen amount looks fine, then Save errors. → Make
  `recomputeInvoice` treat a non-integer qty the way `collectInvoice` does (compute 0 / show a dash) so the
  estimate signals the same problem. Pure client-side.
- **[Low] Two divergent cents→USD formatters** — `cinvMoney` (`:1574`, `Intl.NumberFormat`, finite-guarded)
  vs `centsToUsd` (`:2692`, `toLocaleString`, **no NaN guard** → `"$NaN"` on `undefined`/non-numeric). They
  live in separate `<script>` scopes (client block ends 1882; admin IIFE 1893+) so cannot call each other.
  No live call path triggers `"$NaN"` today (latent). → Add a finite guard to `centsToUsd` mirroring
  `cinvMoney`; only hoist a single shared helper if a future task already touches both regions.
- **[Low] Two same-named `fmtDate` with different contracts** — `:1359` returns `null` + `month:"long"`;
  `:1912` (admin IIFE) returns `"—"` + `month:"short"`. Not interchangeable (the client card relies on the
  null contract). A maintainer searching `function fmtDate` gets two hits. → Add a one-line comment on each
  noting client-region vs admin-region variant; optionally rename the admin one `fmtDateShort` later.
- **[Low] Status vocabulary duplicated in 3 layers** — `db/invoices-schema.sql:30` CHECK,
  `api/admin/invoices.js:66` `ALLOWED_STATUS`, `dashboard.html:1562-1570` client consts — with nothing tying
  them together. A shared module is impossible without a build step. → Add reciprocal "keep in sync with …"
  comments at the three sites.
- **[Informational]** Several by-design / future-only observations: `invoices_status_idx` is currently
  unused by the only status-filtered query (keep it as a forward bet, **don't** remove); `invoice_items`
  `.order(created_at)` isn't index-covered (negligible at tiny per-invoice counts; a `(invoice_id,
  created_at)` composite only if volume grows); the create route's extra `getUserById` existence check is a
  worthwhile round-trip (clean 404 vs raw FK error — keep); `discount`/`tax` are fully validated server-side
  **and wired into the client read**, but the builder has no UI for them, so the Subtotal and Total summary
  rows always render the same number (intentional placeholder — worth a comment so it doesn't read as a bug);
  `due_date` isn't checked against the past (back-dating is legitimate — revisit when `overdue` drives Stripe
  automation); money/qty caps exist only server-side so an over-cap invoice fails late with a toast instead of
  an inline field error (optional parity); `dashboard.html` is ~3100 lines of inline HTML/CSS/JS — that is the
  **project convention** (do **not** split it), but it is the root cause of the duplicate helpers above.
  **One refuted item:** the 500 handler returning raw `err.message` (`:376`) is **by design and correct** —
  it mirrors `api/admin.js:140-143` exactly and is reachable only by the authenticated admin; "hardening" it
  would diverge from the established convention and reduce admin debuggability, so **no change is recommended**.

Impact:
Medium (1 — non-atomic create) / Low (8) / Informational (the rest). **No High.** Nothing blocks the Phase-1
invoice display, which works and is efficient.

Recommendation:
**Fix before Stripe:** the atomic-create RPC (Medium) — once a payment/total is tied to an invoice row, a
header-with-no-items orphan must be impossible. **Good cheap wins any time:** `.limit(50)` on the client
invoice query; cap the `list_users` picker limit (or add a lean `list_clients` action); align the
fractional-qty estimate; add the finite guard to `centsToUsd`; the sync/clarifying comments (status list,
`fmtDate`, discount/tax placeholder). Everything else is informational. All recommendations respect the
project constraints (inline per page, no build, no new deps, no Stripe, no UI redesign) and are small.
**Flagged to the Manager to triage into Developer fix tasks** — the Efficiency role does not edit production
code outside its own assigned fix task, and Task 7 is review-only.

Status:
New (findings recorded; Task 7 → [REVIEW]; Manager to triage into Developer tasks — the atomic-create RPC is
the one to schedule ahead of Phase-2 Stripe).

---

## 2026-06-21 11:48 - Efficiency - image-optimization

Area Reviewed:
`images/` (3 files, 1.6 MB) — esp. the homepage full-bleed background.

Finding:
`Site_bkg.png` was a **1.5 MB** (96% of `images/`) 1366×4182 **RGB** PNG used as the homepage `<img id="bg">`
(preloaded `fetchpriority="high"`, the LCP element) — PNG is the wrong format for a photographic/gradient
background. The two logos were 1920×1080 PNGs used only at small sizes (favicon, ≤420px loader, CSS masks).

Impact:
High (LCP / mobile) for `Site_bkg`; Low for the logos.

Recommendation / done:
Re-encoded with Pillow (no build step): Site_bkg → WebP q82 (**73 KB**) + JPEG q84 fallback via `<picture>`
(PNG deleted); Tab-Logo → 256px quantized (**3 KB**); Main-Logo → 1280px quantized (**13 KB**). Before/after:
`images/` **1,628,163 → 254,483 B (−84.4%)**; modern-browser image payload **89 KB (−94.5%)**; Site_bkg
**−95.3%**. No visible quality loss (multi-region visual + quantitative-diff verification).

Status:
Fixed (→ [REVIEW]). GUI eyeball for final sign-off (Designer/Manager).

---

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
