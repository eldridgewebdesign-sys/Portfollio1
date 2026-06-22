# WebSharke — Work Log

> **Newest entries first** as of the 2026-06-19 role-system redesign. Entries below this banner that
> predate it remain in their original oldest-first order. Entry format: see `CLAUDE.md` → "docs/logs.md
> Format".

---

## 2026-06-22 15:30 - Designer - bold-brand-template

Action:
Finished

Task:
Owner-direct task (not on the board): design + deliver a bold, colorful, personality-filled, REUSABLE website
TEMPLATE — explicitly "no logos" and "feels like a template". Direction + a self-contained sandbox prototype.
→ for the Manager to mirror onto the board + review.

Files claimed / changed:

- `docs/mockups/bold-brand-template.html` — NEW non-production sandbox prototype ("LOUDHAUS" neo-brutalist-pop
  template). Self-contained (inline CSS/JS), NO CDN/network; fonts via relative `../../fonts`. Sections: hero,
  brand-personality/manifesto, services (auto-numbered, flexes 3–6), social proof (count-up stats +
  testimonials), final CTA, footer. NO raster logo anywhere — brand = CSS/SVG monogram + `[Brand Name]` text
  slot + an inline data-URI SVG favicon. Every editable region marked `SWAP:`; re-skins from one `:root` block.
- `docs/design-guide.md` — added a dated Designer decision entry.
- `docs/logs.md` — this entry.

NOT touched: any production page (index/dashboard/payment/onboarding/login), payment/Stripe/Supabase/auth,
`api/*`, `db/*`, vendor files. (Designer role = direction + sandbox only; `docs/` is `.vercelignore`'d.)

Process (ultracode):
- Concept-panel workflow: 5 explorers across distinct bold directions (neo-brutalist / retro / editorial-
  maximalist / memphis / electric-gradient) → 2 judges. **Unanimous winner: neo-brutalist pop** ("LOUDHAUS";
  de-AI 10/10, scannable 9–10). Folded in judge grafts: engineer display mass in CSS (no Arial-Black gamble)
  so it survives any OS; `:root` token re-skin; CSS `counter()` card numbering; per-card shape motif (meaning
  not by colour alone); `currentColor` SVG (dodges the `var()`-in-SVG trap); reused grain + `.rv` + focus-ring
  primitives; count-up stats; brick-stagger cards.
- Adversarial-review workflow: 4 critics (de-AI/brand, frontend-QA, a11y/contrast, template/no-logo). The
  **template/no-logo critic PASSED clean** (all 5 hard constraints verified). Fixed every confirmed defect.

Testing:
- CSS braces balanced (238/238); inline IIFE `node --check` PASS; 0 `<img>`; 5 sections; no `fill="var(...)"`
  in any SVG; no magic-number positions left.
- Contrast (computed from real hex): fixed paper-on-cobalt body text (4.11/3.73:1 → that tile moved to
  paper-on-Ink ≈18:1, cobalt kept as the top cap); fixed small siren-on-paper text (3.05:1 → new
  `--pop1-text #C8341F` ≈5.2:1 for eyebrow numbers + rating stars); final-CTA headline switched from
  paper+`-webkit-text-stroke` (3.05:1, stroke-dependent) to Ink-on-Siren (≈6:1) + paper hard-shadow. Added a
  `forced-colors` focus fallback (the box-shadow ring is dropped in Windows high-contrast).
- Robustness: marquees rebuilt as two equal `.mgroup` halves (gap-proof −50% loop on wide screens); CTA
  sticker re-anchored to the button (was a viewport magic number that broke on label swap); stat marker made
  consistent; "Work" nav/footer label → "Proof"; 380px hero headroom; footer touch targets.
- **NOT run (non-GUI):** live in-browser eyeball (open `docs/mockups/bold-brand-template.html` via `file://`)
  — desktop hover/press, marquee loop, mobile reflow at 320/375px, reduced-motion, console-clean. ~1-min look
  recommended before any reuse.

Risks / Notes:
- **Sandbox only — NOT wired into any production page.** If the owner wants it served (like `demos/corporate/`),
  that's a follow-up **Developer** task: move under `demos/`, switch fonts to root-absolute `/fonts/`, and
  optionally wire it into the homepage `#styles` section as a third demo.
- Owner-direct task, not on the board — **Manager to mirror it** (Designer didn't edit the board, role rule).
- Reusable by find-and-replace: swap `[Brand Name]`/`[Industry]`/`[Year]`, the monogram letter, copy, and
  re-skin the whole thing from the `:root` token block (palette + border/shadow/radius).

## 2026-06-22 14:45 - Developer - fix-onboarding-access

Action:
Finished

Task:
Fix the site so onboarding works (owner-direct task — not on the board; Manager to record board status).
New clients could not onboard at all. → ready for [REVIEW].

Files claimed / changed:

- `middleware.js` — removed `/onboarding` from the server-side auth gate: dropped it from both
  `protectedRoutes` (now `["/dashboard"]`) and the edge `config.matcher` (now `["/dashboard"]`), and added a
  comment explaining onboarding is the public signup page and must never be gated.
- `onboarding.html` — **client signup success path only** (the `if (session)` branch of the submit handler):
  set the `ws_session=1` cookie (mirroring `login.html`'s `goToDashboard()` exactly — `path=/; SameSite=Lax;
  Secure; max-age=604800`) immediately before `window.location.replace("/dashboard")`. No other logic touched.
- `login.html` — comment-only accuracy fix: the `goToDashboard()` comment said the cookie gates
  "/dashboard and /onboarding"; corrected to "/dashboard" to match the middleware change. No code change.
- `docs/logs.md` — START (below) + this FINISH.

NOT touched: Stripe / payment logic, `payment.html`, price IDs, `api/*`, `js/supabase-config.js`, the
Supabase anon config, vendor files, the admin/client invoice work, or any other page.

Root cause (two bugs, both from the recently-added server-side auth gate — commit `06795b6`
"add server-side auth gate"):
1. **Onboarding was unreachable.** `middleware.js` listed `/onboarding` as a protected route requiring the
   `ws_session=1` cookie. A first-time visitor (the only kind of person who uses onboarding) has no session,
   so the edge middleware 302-redirected every prospective client from `/onboarding` → `/login` before the
   intake form ever rendered. Onboarding is the public signup entry point (it calls `db.auth.signUp`), like
   `/login`, and must not be gated.
2. **Successful signup bounced to /login.** Only `login.html:189` sets `ws_session=1`; onboarding never did.
   With email confirmation OFF, a successful `signUp` returns a session and onboarding does
   `window.location.replace("/dashboard")` — but `/dashboard` is still gated, so the brand-new (and actually
   signed-in) client was redirected to `/login` instead of landing on their dashboard. Fixed by setting the
   same cookie login sets before the redirect.

Testing:
- `node --check` on `middleware.js` as an ES module (it uses `export default` — copied to a `.mjs` so node
  parses it as ESM, the way Vercel runs it) → passes.
- Extracted + `vm.Script`-compiled every inline `<script>` in `onboarding.html` and `login.html` → 0 syntax
  errors.
- `git diff` scope check: only the 3 files above; +14/−3 lines; no payment/Stripe/auth-config/vendor file
  touched; the onboarding edit is confined to the `if (session)` success branch.
- Traced the full flow by reading the code: visit `/onboarding` (now passes middleware) → loads
  `js/vendor/supabase.min.js` + `js/supabase-config.js` (both present; CSP allows `script-src 'self'
  'unsafe-inline'` and `connect-src https://*.supabase.co`) → `signUp` → set cookie → `/dashboard` passes
  the gate.
- **NOT run (needs a browser + a real deploy/preview, since `ws_session` is `Secure` so it only works over
  HTTPS, not `vercel dev` on http):** the live click-through — load `/onboarding` unauthenticated, submit a
  real signup, confirm it lands on `/dashboard`. → Reviewer (live) + Security (the gate change).

Risks / Notes:
- **Security review wanted (touches the auth gate).** Removing `/onboarding` from the gate is *restoring*
  intended behavior, not a regression: onboarding serves only a blank intake form (no per-user data), exactly
  like the already-ungated `/login`. The client-side and (for `/dashboard`) server-side gates are unchanged.
  Flagging for Security + Manager per the role rules since `middleware.js` is a security-sensitive file.
- **Pre-existing, NOT fixed here (Supabase-dashboard config, not in the repo — flag for the Manager/owner):**
  if Supabase "Confirm email" is ON, `signUp` returns no session, so the `project_inquiries` insert runs with
  `auth.uid()` null and will fail unless RLS allows it (see the open task "Verify Supabase RLS policies",
  taskboard ~`:1055`, and `CLAUDE.md`'s onboarding note). The page already surfaces that insert error
  gracefully. This code change does not affect that path; it only fixes page access + the
  email-confirmation-OFF redirect. Confirm the email-confirmation setting + RLS in the Supabase dashboard.
- Did NOT `git commit` or deploy. Developer does not edit the board — **Manager: please record this
  owner-direct task → [REVIEW]** (Security to confirm the gate change, Reviewer to click through live).

## 2026-06-22 14:40 - Developer - fix-onboarding-access

Action:
Started

Task:
Fix the site so onboarding works (owner-direct task). Symptom: new clients cannot complete onboarding.

Files claimed:

- `middleware.js` (the server-side auth gate)
- `onboarding.html` — the client signup `<script>` success branch only
- `login.html` — a comment only (documents the middleware behavior being changed)
- `docs/logs.md` (START + FINISH)

NOT touching: Stripe/payment logic, `payment.html`, price IDs, `api/*`, `js/supabase-config.js`, the
Supabase anon config, vendor files, or the in-flight invoice work in `dashboard.html`.

Summary:
Diagnosed two breakages introduced by the recent server-side auth gate: (1) `middleware.js` gates
`/onboarding`, so first-time visitors (no session cookie) are redirected to `/login` and never see the
signup form; (2) onboarding redirects to the gated `/dashboard` on success without setting the `ws_session=1`
cookie that `login.html` sets, bouncing the new client back to `/login`. Fixing both.

Testing:
None yet (START).

Risks / Notes:
`middleware.js` is security-sensitive — flag for Security review. The Supabase email-confirmation/RLS insert
path is a separate, pre-existing dashboard-config concern (not changed here).

---

## 2026-06-22 13:42 - Developer - client-billing-invoices-ui

Action:
Finished

Task:
Task 5 — Implement the Client Billing Invoice List (owner-assigned directly as "Developer 3"). Read-only
client view of admin-created invoices. Phase 1, NO Stripe. → ready for [REVIEW] (Manager to record the
board status; I do not edit the board).

Files claimed / changed:

- `dashboard.html` — **CLIENT billing region only** (3 disjoint blocks):
  1. Client inline `<style>`: a namespaced `.cinv-*` style block (invoice cards, status badges, line-item
     table, totals, notes, disabled Pay button, + a `@media(max-width:560px)` stacked-table mobile layout).
  2. `#tab-billing` markup: a `#cinv-block` invoices section (heading, load-error line, loading line,
     empty state, and an `aria-live` `#cinv-list` the cards render into) — inserted after the existing
     subscription/hosting blocks, before `#tab-domain`. The existing plan/subscribe + Stripe UI is untouched.
  3. Client inline `<script>`: `loadClientInvoices()` + render helpers (`buildClientInvoiceCard`,
     `buildClientItemsTable`, `buildClientTotals`, `cinvMetaItem`, `cinvNumCell`, `cinvTotalRow`,
     `cinvEl`/`cinvMoney`/`cinvDate`/`cinvRef`) and config (`SHOW_DRAFTS_TO_CLIENTS`,
     `CLIENT_VISIBLE_STATUSES`, `PAYABLE_STATUSES`, `CLIENT_STATUS_LABEL`), plus one `loadClientInvoices(user)`
     call appended to the existing page-load IIFE (after `renderClientPayBanner(sub)`).
- `docs/logs.md` — START (13:18) + this FINISH.

NOT touched: the admin `.adm-*` region / admin IIFE (Task 3, the concurrent `admin-invoice-ui` session);
payment / Stripe / Supabase-auth logic (`/api/checkout`, `/api/customer-portal`, the Payment Element modal,
`manage-sub`/`cancel-hosting`); `api/*`, `db/*`, `js/supabase-config.js`, `payment.html`, price IDs, vendor.

How invoices are fetched (the core of the task):
- Reuses the existing global anon Supabase client `db` (`js/supabase-config.js`) — same pattern as the
  dashboard's `project_inquiries` / `subscriptions` reads. NO service-role key in the browser.
- Query 1 (invoices): `db.from("invoices").select(<explicit cols>).eq("client_user_id", user.id)
  .in("status", CLIENT_VISIBLE_STATUSES).order("created_at",{ascending:false})`. `user` is the
  already-gated signed-in user from the page-load IIFE. `CLIENT_VISIBLE_STATUSES` =
  issued/paid/overdue/void/canceled (draft EXCLUDED — see RLS note). Newest-first.
- Query 2 (items): collect the returned invoice ids, then ONE `db.from("invoice_items")
  .select(<cols>).in("invoice_id", ids)` — no N+1 — grouped client-side by `invoice_id`.
- Rendering is 100% `textContent` via `cinvEl()` (a `createElement`+`textContent` helper); NO `innerHTML`
  of any DB value, so admin-entered title/notes/item text cannot inject markup.
- Money: integer cents → `Intl.NumberFormat(USD)` on `cents/100`, straight from the server-computed
  `*_amount_cents` columns (never recomputed in the browser). `due_date` (a DATE) is formatted
  component-wise to avoid a timezone off-by-one.
- Per invoice: title, short ref from the UUID `id`, status badge, due/created dates, line-item table
  (name+desc, qty, unit, amount), subtotal/discount/tax/total, notes, and a **disabled** placeholder Pay
  button shown ONLY for `issued`/`overdue`. Independent error/empty/loading states; a failure here never
  affects the rest of the dashboard (un-awaited call + internal try/catch).

RLS / permission findings (for Security — Task 6):
- **Read isolation is sound and defence-in-depth.** The query filters `client_user_id = user.id`, AND RLS
  `inv_owner_select` (db/invoices-schema.sql:91-92) independently restricts SELECT to `auth.uid() =
  client_user_id`. Items: `ids` is derived only from the already-owner-scoped invoices, AND
  `invitem_owner_select` (schema:100-107) independently restricts items to invoices owned by the caller.
  No cross-client leak path even if one layer were removed.
- **No write/mutate/delete path** exists from this client code (no insert/update/delete/upsert), and RLS has
  no client write policy — so requirements 7/8/9 (can't edit / delete / change prices) hold at both the UI
  and DB layers. The only action is the inert, disabled Pay button.
- **Draft-hiding is a UI control:** RLS lets a client read their OWN drafts, so the `.in(status,…)` filter
  (not RLS) is what hides them — flagged by the Designer too. A `SHOW_DRAFTS_TO_CLIENTS` flag documents the
  opt-in.
- **Prerequisite:** the `db/invoices-schema.sql` migration (tables + RLS + `public.is_admin()`) must be
  APPLIED in the live Supabase project, else both queries error → the UI shows its load-error line
  gracefully (no crash). Same prerequisite the Task 1 route flagged.

Testing:
- `node --check` on the EXTRACTED on-disk client-invoice JS (post-edit) → passes.
- Adversarial 5-lens review (ultracode workflow: security/RLS · XSS · schema · requirements ·
  scope/concurrency). Verdict: **no critical/high/medium defects.** 4 low findings, all actioned:
  (1+3) "paid date" reads a non-existent `paid_at`/`paid_date` column → kept as a clearly-commented,
  forward-compatible stub that renders nothing today (never fakes a date) + explicit "to enable, add the
  column to the schema/admin route AND the SELECT" note; (2) relabelled "Issued" → "Created" because
  `created_at` is row-creation time, not issuance time; (4) namespaced the generic global helpers
  (`mkEl`→`cinvEl`, etc.) to remove any same-file collision surface with the concurrent admin builder.
- Static checks: CSS `.cinv-*` namespaced (0 `.inv-*` collisions; brace balance 881/881); 2/2 `<style>`
  tags; structural placement confirmed (`#tab-billing` → `#cinv-block` → `#tab-domain`); JS consts/helpers
  defined before the IIFE that calls them (no TDZ).
- **NOT run (needs a browser + `vercel dev` + the migration applied + a real signed-in client with seeded
  invoices):** live render, the disabled-Pay/empty/mobile eyeball, console-clean, and the cross-account
  "account B cannot see account A's invoices" isolation check. → Reviewer (Task 8) + Security (Task 6).

Risks / Notes:
- **Concurrency (the shared-`dashboard.html` case the Manager flagged):** I ran the client region (Task 5)
  CONCURRENTLY with the `admin-invoice-ui` session (Task 3), against the Manager's "T3 first, not
  concurrent" sequencing — done per the owner's direct assignment. Collision was avoided by construction:
  disjoint blocks (client `<style>`/`#tab-billing`/client `<script>` vs admin `<style>`/`.adm-*`/admin
  IIFE) + my CSS/ids namespaced `.cinv-*`/`#cinv-*` vs their `.inv-*`. The working tree now holds BOTH
  Developers' changes to `dashboard.html` (expected; same pattern as prior concurrent sessions).
- **Schema gaps for the Manager / Devs 1-2:** (a) no `paid_at`/`paid_date` column → "paid date if paid"
  can't render until one is added (to BOTH the schema/admin writer AND the client SELECT); (b) no
  human invoice-number column → the UI shows a short ref from the UUID `id`. Neither blocks this phase.
- Ran ahead of the Designer's Task 4 spec (still being written in `docs/`); built on the existing client
  billing design language (the Designer's own stated grounding) so it's forward-compatible. Flag for a
  Designer review pass once their spec lands.
- The old plan/subscribe UI + `payment.html` are left intact this phase (per Task 5 notes); whether the
  invoice list replaces them is a Phase-2 / Manager decision.

## 2026-06-22 13:40 - Developer - admin-invoice-ui

Action:
Finished

Task:
Task 3 — Implement the Admin Invoice Builder (owner-assigned as "Developer 2") → ready for [REVIEW].

Files changed:

- `dashboard.html` — **admin region only**, purely additive (no existing logic modified). Added:
  1. an "Invoices" nav button (`data-view="invoices"`, after Payments) + a `#view-invoices` section
     (Invoice details: client `<select>`, title, optional notes, optional due date; a Line-items panel with
     an add/remove repeater; a sticky Summary card with live subtotal/total + Save-as-draft / Issue actions);
  2. a scoped `.inv-*` `<style>` block (reuses `.adm-panel-box`/`.adm-fld`/`.adm-btn`/`.adm-mini`; ledger-style
     line-item grid, not a spreadsheet; responsive at 1040/560px);
  3. a JS module (`const INV`, `centsToUsd`, `dollarsToCents`, `invItemRow`/`addInvItem`, `recomputeInvoice`,
     `collectInvoice`, `setInvBusy`, `postInvoice`, `runInvoiceSubmit`, `resetInvoiceForm`,
     `loadInvoiceClients`, `initInvoices`) + one `switchView` branch (`viewId === "invoices"`).
- `docs/logs.md` — START + this FINISH.

Summary:
Built the admin create-invoice screen wired to Developer 1's `POST /api/admin/invoices`. The client dropdown
is populated from the existing `list_users` admin action (uses `user_id` = the auth UUID = `client_user_id`,
deduped + name-sorted client-side). The form sends the admin's Supabase bearer token to the route and posts
ONLY: `client_user_id`, `title`, `status` (`draft`|`issued`), optional `notes`/`due_date`, and `items[]`
(`name`, `description|null`, integer `quantity`, integer `unit_amount_cents`). Dollars → integer cents via
`Math.round(n*100)`. Client-side guards (defence-in-depth; server is authoritative): require a client + a
title; ≥1 line item; non-empty item names; integer qty ≥1; non-negative prices; reject >2-decimal/scientific
prices. The on-screen subtotal/total are a LIVE ESTIMATE only — never sent; on success the screen shows the
server-computed `total_amount_cents`. Save-as-draft vs Issue (Issue is gated by a confirm modal); success +
error states via the inline `#inv-msg` region and the existing `toast()`.

Testing:
- Static: extracted every inline `<script>` and compiled each with Node `vm.Script` → **0 syntax errors**
  on the COMBINED file (mine + the concurrent Task 5 client-billing module — no redeclaration collision in
  the shared IIFE; verified no duplicate `function/const` names; `INV` declared once). CSS braces 344/344
  balanced. All new IDs unique. `git diff` confirms admin-region-only, additive.
- Contract: re-read `api/admin/invoices.js` — the request body matches `parseInvoiceBody` exactly; `draft`/
  `issued` are in `ALLOWED_STATUS`; the UI never sends subtotal/total/discount/tax (server owns the total).
- Adversarial review: ran a 4-lens ultracode review (contract / correctness / security / UX). Security:
  clean (esc() on all client/server strings; bearer token only; no service-role; no direct browser writes;
  trust boundary intact; no Stripe/schema/billing-tab changes). Applied all real findings: **[med]** closed a
  double-submit window (a keyboard action during the Issue confirm could create 2 invoices) by holding the
  submit lock across validate→confirm→POST (`runInvoiceSubmit`); **[med]** validation errors now also raise a
  toast so they're visible on stacked/mobile layouts where the summary drops to the bottom; **[low]** reject
  >2-decimal prices instead of silently rounding; **[low]** fixed success copy, un-clipped the Amount column,
  and made errors `aria-live=assertive`.
- **NOT run (needs `vercel dev` + a browser + live Supabase/admin login):** the live e2e — create a draft +
  an issued invoice, confirm rows land with correct cents, and a clean console. This is the GUI/deploy item
  for the reviewer (same non-GUI limitation prior sessions signed off with).

Risks / Notes:
- **Concurrent shared-file edit:** the **Task 5 — Client Billing UI** Developer session is editing
  `dashboard.html` at the same time (the board said Task 3 and Task 5 should NOT run concurrently). Our edits
  are in disjoint regions (admin `.adm-*` view vs the client `data-tab="billing"` region) with no ID or
  function-name collision — verified by re-compiling the combined inline scripts (0 errors) and a duplicate-
  declaration scan. Both change-sets coexist in the working tree; a commit picks up both. Flagging for the
  Manager.
- **Designer spec (Task 2) was not yet published** when this was built (owner assigned the build directly; the
  Designer `invoice-billing-ux` spec finished right after). Built on the existing admin design language
  (`.adm-*`) — the Designer's own stated grounding — so it is forward-compatible. **Needs the Designer review
  pass** to reconcile against the now-published spec.
- **Backend route notes (Developer 1):** route is solid and matches the task contract. Two small observations
  for whoever owns it — (a) on a partial DB failure it best-effort-deletes the invoice (no SQL transaction);
  a Postgres RPC would make create atomic. (b) `client_user_id` is validated against `auth.users`, but the
  dropdown is sourced from `project_inquiries.user_id`; a client who exists in auth but has no inquiry row
  won't appear in the picker (acceptable — every onboarded client has an inquiry row).
- Carry-forward for **Task 5**: the Designer flagged that the client billing page must filter out `draft`
  invoices (RLS lets a client read their own rows regardless of status). Not this task's file.
- Did NOT `git commit` or deploy. Developer does not edit the board — **Manager: please record Task 3 →
  [REVIEW]**.

---

## 2026-06-22 14:00 - Designer - invoice-billing-ux

Action:
Finished

Task:
Design the admin invoice builder + client billing page experience → direction/spec delivered.

Files changed:

- `docs/design-guide.md` — added the section "Invoice & Billing system — UX direction & buildable spec
  (2026-06-22)" (where it lives; shared money/status/draft rules; admin builder layout; client billing
  layout; UX problems to avoid; full copy/labels; open questions) + a dated decision-log entry.
- `docs/mockups/invoice-billing-mockup.html` — NEW non-production sandbox prototype (Admin list / Admin
  builder / Client billing) reusing the real `dashboard.html` tokens + components; file://-safe, no CDN.
- `docs/logs.md` — START (below) + this FINISH.

Summary:
Delivered both screens as a buildable Designer spec (NOT production code). Admin Invoice Builder = guided
single-column sectioned form (Client & details → Line items → Adjustments → Totals) with the total shown
twice (large Total Due + a sticky bar on `.adm-toolbar`) and draft-vs-issued signaled by badge + status
sentence + distinct Save/Issue buttons; in a new `view-invoices` admin view with list + KPIs + read-only
drawer. Client Billing = an "Amount Due" hero (single most-urgent invoice + an honest Pay placeholder) over
a quiet stacked-card invoice history, inside the existing Billing tab; read-only, drafts never shown, paid
invoices read as finished receipts. Reuses existing components only (`.adm-table`/`.adm-card`/`.badge`/
`.adm-drawer`/`.adm-modal`/`.adm-fld`; client `.panel`/`.ws-btn`/`.pay-banner`).

Process:
ultracode design-panel workflow (6 layout explorers → 2 judges → 2 adversarial UX critics). The spec's "UX
problems developers must avoid" section is the critique synthesis.

Testing:
Design artifacts only — no production code touched. Cross-checked the spec against the real components
(`dashboard.html` admin `.adm-*` shell + client Billing tab + badge palette + forms + drawer/modal) and the
data model (`db/invoices-schema.sql`, `api/admin/invoices.js`). Mockup is self-contained (inline CSS/JS,
fonts via relative `../../fonts/`, no CDN/fetch). **Not run (non-GUI):** in-browser eyeball — recommend
opening `docs/mockups/invoice-billing-mockup.html` (render, line-item live-total math, issue-confirm + pay
placeholder, mobile reflow).

⚠️ Concurrency discovered at hand-off:
Two Developer sessions are ALREADY building this in `dashboard.html` — **admin-invoice-ui** (Task 3, admin
region) and **client-billing-invoices-ui** (Task 5, client region) — both started ~13:17/13:18, before this
spec published, building on the existing `.adm-*`/client design language (my stated grounding), so they
should be largely forward-compatible. They both asked for a **Designer review pass once the spec publishes**.
No code conflict with me (I only touched `docs/`). Next Designer action: once both Dev tasks reach [REVIEW],
review their build against this spec (esp. the "UX problems to avoid" list — draft-leak server-side filter,
zero-total handling, derived `overdue`, total visibility, focus/a11y, honest Pay-button copy).

Risks / Notes:

- **Blocking dependency flags for the Manager:** only `POST /api/admin/invoices` (create) exists — the
  list/KPIs, detail drawer, edit, mark-paid, and the client read endpoint are NOT built; the client read MUST
  exclude `status='draft'` **server-side** (draft-leak trap; the Dev currently hides drafts in UI only via a
  flag — confirm a server-side filter too); `'overdue'` must be derived from `due_date` (nothing sets it);
  the builder must POST only `draft`/`issued` (never `paid`). Also flagged by Task 5 Dev: no `paid_date` and
  no human invoice-number column in the schema — the spec degrades gracefully (omit paid date; short ref from
  uuid) but a future schema task could add them.
- One owner decision in the spec: Pay-button placeholder wording ("Request payment link" recommended).
- **Direct owner task, not on the board** — the Manager should mirror it and reconcile it with the Task 3/5
  builds already in flight. The Designer did not edit the board (role rule).
- No backend, Stripe, payment flow, or unrelated dashboard pages were touched (per the task's "do not" list).

## 2026-06-22 13:18 - Developer - client-billing-invoices-ui

Action:
Started

Task:
Task 5 — Implement the Client Billing Invoice List (owner-assigned directly as "Developer 3"). Show the
signed-in client the invoices an admin created for them: read-only, phase 1, NO Stripe. Owner-direct
assignment ran ahead of the Manager's T4→T3→T5 sequence — flagged for the Manager to record the board
status ([IN PROGRESS] · Owner: Developer).

Files claimed:

- `dashboard.html` — the **CLIENT** billing region ONLY: the `#tab-billing` markup (add a read-only
  invoices block), the **client** inline `<style>` block (the one ending ~`:233`, before the admin theme),
  and the **client** inline `<script>` IIFE (add `loadClientInvoices()` + render helpers and one call
  inside the existing page-load IIFE). NOT the admin `.adm-*` region, NOT the admin IIFE.
- `docs/logs.md` (START + FINISH).

NOT touching: the admin invoice builder region (Task 3); `window.initAdmin` / `.adm-*` UI/styles; payment /
Stripe / Supabase-auth logic (Payment Element modal, `/api/checkout`, `/api/customer-portal`,
`manage-sub`/`cancel-hosting`, `payment.html`); `api/*`, `db/*`, `js/supabase-config.js`, price IDs, vendor.

⚠️ Concurrency (the exact shared-file case the Manager flagged): a **Developer - admin-invoice-ui** session
(Task 3) started 13:17 and is editing the **admin** region of `dashboard.html`; a **Designer -
invoice-billing-ux** session is writing the Task 4/2 spec into `docs/` (no code). To avoid collision while
both Devs touch `dashboard.html`:
- I claim only the **client** region (disjoint blocks from Task 3's admin region — verified `dashboard.html`
  is unmodified on disk at my start).
- Task 3 is adding a `.inv-*` `<style>` block → I namespace **all** my client classes/ids as **`.cinv-*` /
  `#cinv-*`** (never `.inv-*`, no generic class names) so the two CSS sets cannot interfere in either
  direction. JS does not collide (their `initInvoices` is admin-IIFE-local; mine are client-script globals).
- I re-read each target region of `dashboard.html` immediately before editing it.

Summary:
Backend exists (Task 1, [REVIEW]): `db/invoices-schema.sql` (`invoices` + `invoice_items`; RLS owner-read,
no client write) + `api/admin/invoices.js` (service-role writer). This task is the client READ UI only.
Fetch the caller's own invoices (`.eq('client_user_id', user.id)` + `.in('status', CLIENT_VISIBLE_STATUSES)`
— drafts hidden per the cross-session draft-leak flag) and their items (one `.in('invoice_id', ids)` query,
no N+1), render invoice cards (title, ref, status badge, due/issued dates, line-item breakdown,
subtotal/discount/tax/total, notes) via DOM `textContent` only (no `innerHTML` of DB data), with a disabled
placeholder Pay button for `issued`/`overdue` only.

Testing:
Planned: `node --check` on the extracted new JS; static scope diff (client billing region only); column
cross-check vs `db/invoices-schema.sql`; adversarial multi-lens review (RLS leakage / XSS / schema / requirements
/ regression). Live signed-in render with seeded invoices + the cross-account isolation check are the GUI/`vercel
dev` items a non-GUI session can't run — flagged for Security (Task 6) + Reviewer (Task 8).

Risks / Notes:
- Schema gaps surfaced for the Manager / Devs 1-2: **no `paid_date`/`paid_at` column** (so a real paid date
  can't be shown until one is added — UI omits it gracefully) and **no human invoice-number column** (UI shows
  a short ref derived from the UUID `id`). Detailed in the FINISH entry.
- Draft-hiding is a UI control (RLS lets a client read their own drafts), via a `SHOW_DRAFTS_TO_CLIENTS` flag.

## 2026-06-22 13:17 - Developer - admin-invoice-ui

Action:
Started

Task:
Task 3 — Implement the Admin Invoice Builder (owner-assigned as "Developer 2"). Build the admin invoice
creation UI in `dashboard.html`, wired to Developer 1's `POST /api/admin/invoices`.

Files claimed:

- `dashboard.html` — the **admin** (`.adm-*`) region ONLY: a new "Invoices" nav button + `#view-invoices`
  section (details form + line items + live totals + actions), a scoped `.inv-*` `<style>` block, an
  `initInvoices()` / submit JS module, and one `switchView` branch. NOT the client billing region (Task 5),
  NOT payment/Stripe/Supabase/auth logic.
- `docs/logs.md` — this entry.

Files changed:

- (in progress — see the FINISH entry)

Summary:
Claimed Task 3. Inspected the backend first per the task ("inspect the current implementation before
wiring"): `api/admin/invoices.js` is done + in `[REVIEW]` (Task 1) — admin-gated, recomputes all money
server-side, body shape matches the task. Also read `db/invoices-schema.sql` and the existing admin shell
(`switchView`, `adminApi`, `toast`, `confirmAction`, the `.adm-*` styles, `list_users` for the client
dropdown). Building a new admin view that reuses those exact patterns.

Coordination:
- A concurrent **Designer** session (`invoice-billing-ux`) is writing the Task 2 spec into
  `docs/design-guide.md` + `docs/mockups/` — it did NOT claim `dashboard.html`, so no code conflict.
- Task 3 nominally depends on Task 2; the owner assigned this build directly before the spec landed. Built
  on the existing `.adm-*` design language (the Designer's own stated grounding) so it is forward-compatible
  — flag for a Designer review pass once their spec publishes.

Testing:
None yet (START).

Risks / Notes:
- Posts to the SEPARATE endpoint `/api/admin/invoices` (not the `adminApi` `/api/admin` `{action,payload}`
  helper); reuses the same Supabase bearer-token auth pattern.
- Out of scope per the task: no Stripe checkout / pay buttons, no DB schema change, no direct browser writes
  to Supabase. The browser sends only line items in cents; the server owns the authoritative total.
- Designer flag noted: the client *billing page* (Task 5, not this task) must filter out `draft` invoices —
  carried forward for whoever builds Task 5.

---

## 2026-06-22 - Designer - invoice-billing-ux

Action:
Started

Task:
Design the admin invoice builder + client billing page experience (owner-assigned direct task — not
yet on the board). Direction/spec only; no production code.

Files claimed:

- `docs/design-guide.md` (new Designer decision entry + invoice/billing component spec)
- `docs/mockups/` (NEW — clearly non-production sandbox prototype; `docs/` is in `.vercelignore`, never deployed)
- `docs/logs.md` (this entry)

Files NOT touched (out of scope per the task + Designer role):

- `dashboard.html` and all production HTML/CSS/JS (Developer applies the spec later)
- `api/admin/invoices.js`, `db/invoices-schema.sql`, payment/Stripe/Supabase/auth logic (no backend change; no Stripe flow yet)

Summary:
Owner asked for the design of two screens for the custom-invoice system: (1) Admin Invoice Builder and
(2) Client Billing Page. Grounded the design in the EXISTING system: read `db/invoices-schema.sql` +
`api/admin/invoices.js` (data model: cents money; statuses draft/issued/paid/overdue/void/canceled;
server recomputes all totals; only a create endpoint exists — save-draft vs issue = status on POST) and
the `dashboard.html` design language (admin `.adm-*` app shell + the client dashboard's existing
**Billing** tab, `.badge` status pills, `.adm-table`, `.adm-card`, `.adm-drawer`, `.pay-banner`). The
invoice screens reuse these so they feel native, not bolted on. Executing via an ultracode design-panel
workflow (explore divergent layouts → judge vs. requirements → adversarial UX critique), then writing the
spec + a sandbox mockup.

Testing:
None yet (START).

Risks / Notes:
- **Draft-leak trap (flag for Developer):** RLS `inv_owner_select` lets a client read their OWN invoices
  regardless of status, so a `draft` would appear on the client page unless the client query filters
  `status <> 'draft'`. Design assumes drafts are admin-only.
- Money is stored in **cents**; admin enters dollars → the Developer must convert (×100, integer) and the
  client page must format cents → `$x.xx`. Server is the source of truth for subtotal/total.
- This is a direct owner task; the Manager should mirror it onto the board (Developer implementation task
  to follow from this spec).

## 2026-06-22 13:10 - Manager - invoice-phase-tasks

Action:
Planned

Task:
Create the "Custom invoice / payment system" phase (8 tasks); record Task 1's board status from the concurrent
Developer FINISH

Files claimed:

- docs/taskboard.md
- docs/logs.md

Files changed:

- docs/taskboard.md — added a "🧾 PHASE — Custom invoice / payment system (started 2026-06-22) — CURRENT
  FOCUS" section near the top: grounding (authoritative schema/columns, the admin-auth pattern to reuse, RLS,
  where the UIs live), a sequence/dependency map, the 8 owner-requested tasks in the CLAUDE.md format, and a
  DEFERRED Phase-2 (Stripe) note. **Recorded Task 1 → [REVIEW]** (Owner: the Developer admin-invoices-route
  session) per its FINISH below.
- docs/logs.md — this entry.

Summary:
Per the owner: replace the old fixed-payment (plan/subscribe) setup with an **admin-issued invoice system** —
clients can only pay invoices an admin creates/assigns. Authored 8 tasks across the 6 current roles (Manager
orchestrates; Designer ×2 specs, Developer ×3 builds, Security/Efficiency/Reviewer review). Grounded every task
in the real codebase:
- **Schema is in the repo** (`db/invoices-schema.sql`) — used its EXACT columns (`client_user_id`,
  `subtotal_amount_cents`, `unit_amount_cents`, `line_total_cents`, `total_amount_cents`, status enum incl.
  `canceled`). Route `api/admin/invoices.js` → `/api/admin/invoices`, the only writer.
- **Admin auth**: reuse the `api/admin.js` Bearer→getUser→admin-email gate (`:79-101`, service-role `:44`).
- **Both billing UIs live in `dashboard.html`** (client `data-tab="billing"` ~`:639`; admin `.adm-*` views
  ~`:702-710`) → Task 3 (admin) + Task 5 (client) edit the same file → sequenced (T3 first), claim regions.
- **No-Stripe gate** in every task + a deferred Phase-2 note; the live Stripe flow is do-not-touch this phase.

Board sync (new Manager duty): a Developer session finished the Task 1 work concurrently (see the 13:03 FINISH
below) — `api/admin/invoices.js` + `db/invoices-schema.sql`, matching the Task 1 spec (reused admin gate,
server-side totals, client-exists check, no Stripe, `node --check` + self-adversarial-reviewed). Recorded
**Task 1 → [REVIEW]** with that session as Owner. Pending before [DONE]: Security review (Task 6), live e2e
(`vercel dev`), and confirming the migration is applied in Supabase.

Testing:
Docs only — no website code changed by the Manager. Specs self-verified against `db/invoices-schema.sql`,
`api/admin.js`, and `dashboard.html` (greps + reads). Did not run a separate multi-agent review of the task
specs (Task 1 was already implemented + adversarially self-reviewed by the Developer; the remaining specs are
standard and grounded).

Risks / Notes:
- **Prerequisite (Manager/owner):** confirm `db/invoices-schema.sql` (tables + RLS + `public.is_admin()`) is
  actually APPLIED in the live Supabase project, not just committed. Tasks 1, 5, 6 depend on it; the Developer
  flagged a live insert could 500 until the columns line up.
- **Security review of the new route is recommended** (it touches the service-role key + admin gate) — that is
  Task 6 in this phase.
- "6 of 8 roles": the system currently defines exactly six roles; this phase uses all six.
- The old plan/subscribe UI is left intact this phase; replacing it is a Phase-2 / Manager decision.
- Concurrency: the Developer + my Manager edits touched different files (api/db vs docs) — no conflict.

## 2026-06-22 13:03 - Developer / Implementation - admin-invoices-route

Action:
Finished

Task:
Add an admin-only API route to create client invoices + line items (owner-directed; no
pre-existing board task — Manager to record board status).

Files claimed:

- api/admin/invoices.js (new)
- db/invoices-schema.sql (new)

Files changed:

- api/admin/invoices.js — new serverless route `POST /api/admin/invoices`. Reuses the EXACT admin
  auth gate from `api/admin.js` (Bearer token → `supa.auth.getUser` → `caller.email === ADMIN_EMAIL`,
  service-role key only; 401 missing/invalid token, 403 non-admin). Validates the body, verifies
  `client_user_id` exists via `supa.auth.admin.getUserById` (404 if missing), recomputes
  subtotal/line-totals/total server-side (never trusts client amounts), defaults discount/tax to 0,
  inserts `invoices` + `invoice_items`, best-effort rollback of the invoice if items fail, writes an
  `admin_activity_log` audit row, returns `{ invoice, items }` (201).
- db/invoices-schema.sql — new idempotent migration creating `public.invoices` + `public.invoice_items`
  with the exact columns the route writes, indexes, and RLS (client reads own; admin all; no client
  insert/update — only the service-role route writes). Mirrors `db/admin-schema.sql` and reuses
  `public.is_admin()`.

Summary:
Owner asked for the next step of the custom invoice system: an admin-only route the admin dashboard
calls to create invoices. Built `/api/admin/invoices` reusing the established admin pattern rather than
inventing new auth. Payment/Stripe flow untouched (no Checkout added). Because the live `invoices` /
`invoice_items` column names are not in the repo, the route is written against a conventional schema and
the matching migration is shipped so the columns are guaranteed to line up (run it, or rename live
columns to match).

Testing:
- `node --check api/admin/invoices.js` → passes (twice: before and after review fixes).
- Adversarial multi-agent review (security / spec-compliance / data-integrity lenses, each finding
  independently verified): 3 confirmed findings, all fixed —
  (1) rollback delete result now checked + orphan logged with id + actionable admin message;
  (2) `getUserById` transient errors now propagate to 500 instead of masquerading as 404;
  (3) `discount_amount_cents > subtotal` now rejected (400).
- `git status` scope check: only `api/admin/` + `db/invoices-schema.sql` added; no payment/auth/Stripe/
  vendor file touched. (Pre-existing uncommitted docs edits were already present at session start.)
- NOT run: live `vercel dev` / real Supabase call (needs deploy-preview + env vars) — see Risks.

Risks / Notes:
- **Schema must match.** The route writes exactly the columns in `db/invoices-schema.sql`. If the live
  tables differ (e.g. `user_id` vs `client_user_id`), run the migration (additive/idempotent) or rename
  columns. Until then an insert could 500 (the route surfaces the real DB error to the admin to make
  this obvious).
- **No DB transaction.** Invoice + items are two inserts with a compensating delete; true atomicity
  would need a Postgres RPC (noted in code + schema). Orphan only on a double failure, now logged.
- **Env vars:** reuses `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (already set); optional `ADMIN_EMAIL`.
  Nothing new required.
- Auth uses the existing 401/403 split (not the spec's literal "401 for non-admin") because the owner
  asked to reuse, not replace, the admin auth pattern. Trivial to collapse to 401 if preferred.
- Manager: please record board status for this owner-directed task; Security review recommended since it
  touches the service-role key + admin gate (already self-reviewed adversarially).

## 2026-06-22 09:00 - Manager - add-developer-role

Action:
Planned

Task:
Add a dedicated Developer / Implementation role + re-activate Reviewer; update the workflow docs

Files claimed:

- CLAUDE.md
- docs/taskboard.md
- docs/reviewer-log.md
- docs/logs.md

Files changed:

- CLAUDE.md — added "Developer / Implementation" + "Reviewer" to Allowed roles; added a "Workflow order"
  section (the 7-step Manager→Designer→Developer→Efficiency→Security→Reviewer→Manager pipeline); added a
  Global Rule that design and implementation stay separate; added a File-Claiming exception (Developer
  claims via a logs.md START entry, Reviewer files findings, the Manager records board status); rewrote the
  **Designer** role to direction-only (no production code — owns docs/design-guide.md specs); added the full
  **Developer / Implementation** role section; added the **Reviewer** role section; updated the task-format
  "Assigned Role" line + a design-vs-implementation task-writing note; expanded the Role Review Flow
  (Developer + Reviewer); updated the End-Of-Session rule (Developer/Reviewer don't edit the board).
- docs/taskboard.md — updated the intro to the six-role system; added a "Role-system update — 2026-06-22"
  section (Designer is direction-only, Developer owns implementation, Reviewer is active, design/impl is a
  hard split when writing tasks); marked the 2026-06-19 "Reviewer retired / reviewer-log deprecated" banner
  as superseded.
- docs/reviewer-log.md — added a "Status: ACTIVE (re-activated 2026-06-22)" note.
- docs/logs.md — this entry.

Summary:
Per the owner: the Designer was doing too much (design + coding + cleanup mixed together). Split the
workflow so the Designer defines visual/UX direction only and a new **Developer / Implementation** role
applies the actual code changes after the Manager's task and the Designer's spec. Also **re-activated the
Reviewer** role (tests the live site like a customer, logs findings) per the owner's stated 7-step
workflow — reversing the 2026-06-19 retirement. Owner-confirmed decisions: re-activate Reviewer, and a
**strict** Designer/Developer split (the Designer no longer edits production HTML/CSS/JS). The Developer
reports in docs/logs.md and does **not** edit the task board (owner rule); the Manager records its status.

Testing:
Docs/workflow only — no website code touched. Cross-checked that the six roles are consistent across
CLAUDE.md (Allowed roles, per-role sections, reading lists, review flow, end-of-session rule), the
taskboard intro + 2026-06-22 section, and the reviewer log. `git status` scope check: only CLAUDE.md
(gitignored) + the three docs changed; no production / payment / auth / vendor file touched.

Risks / Notes:
- **CLAUDE.md is gitignored** — the role system is live on disk for local sessions but will not commit /
  won't survive a fresh clone. Flagged before; say the word to mirror it into a tracked `docs/ROLES.md`.
- **Coordination:** because the Developer doesn't edit the board, a Developer session needs a Manager to
  mark [IN PROGRESS]/[REVIEW] around its work — keep a Manager in the loop when a Developer is active.
- Existing open tasks keep their owners; the Manager re-cuts any still-open "design + build" task into a
  Designer spec task + a Developer implementation task when it is picked up.
- **Out-of-scope items noticed during ground-truth checks** (NOT part of this task — flagged for later
  Manager triage): `node_modules/` is committed to git (HEAD `4369bb2` "restore: recover all files");
  a new `middleware.js` server-side auth gate exists that no role log documents; docs are tracked as
  `docs/TASKBOARD.md` (capital) while the role system references `docs/taskboard.md` (case mismatch — a risk
  on case-sensitive hosting like Vercel/Linux); the four Mulish woff2 weights are byte-identical (md5
  `50220d0057de…`, confirmed) so no Mulish weight renders distinctly. Each wants its own task.

Adversarial review + fixes (ultracode workflow — appended after the edits above):
- Reviewed the new role docs with 3 independent lenses (faithfulness · internal consistency · completeness/
  edge cases). **Faithfulness: PASS.** Consistency + completeness surfaced real gaps my first pass
  introduced; all high/medium findings fixed:
  - **Claim/status deadlock (high):** the Developer can't edit the board, but [IN PROGRESS] only lived on the
    board → double-claim risk. Fixed: the **Manager assigns + marks [IN PROGRESS] before the Developer
    starts**; the Developer then adds a START log entry. Documented in File Claiming Rules + the Developer
    role + Manager responsibilities.
  - **BLOCKED path impossible for Developer/Reviewer (high):** they now record the blocker in their log
    (`Action: Blocked` / reviewer-log) and the Manager flips the board to [BLOCKED] for them.
  - **Code-ownership overlap (high):** softened the Developer "only role" wording and stated once that
    Efficiency/Security edit code for their **own** assigned fixes; anything else they find becomes a
    Developer task (added to both role intros).
  - **Board-sync trigger + mapping (medium):** the Manager must each session scan docs/logs.md + reviewer-log
    and sync the board, using `Started→[IN PROGRESS]`, `Finished→[REVIEW]`, `Blocked→[BLOCKED]`.
  - **Reviewer loop (medium):** spelled out the full status set + the [NEEDS RECHECK]→Reviewer re-test→
    Manager [RESOLVED] path; made the reviewer-log heading the canonical status (no dual-source drift).
  - Low/cheap: Designer review block reworded + given a defect channel (`Developer bug:` note); Developer
    conventions note (no npm build/dev/test → `node --check` / `vercel dev`; capital-A `Animations/`);
    Reviewer live-env caveat (needs a browser/preview, else defer).
- Re-verified clean: grep finds no stale "four-role" / 4-only role lists outside historical log entries.

---

## 2026-06-21 12:30 - Designer - corporate-demo

Action:
Finished

Task:
Designer: Create a corporate-style demo site (single self-contained reusable template) → [REVIEW]

Files claimed:

- `demos/corporate/index.html` (new — the template page)
- `index.html` — the `#styles` section only (markup + a small `.style-two` CSS rule)
- `docs/design-guide.md`, `docs/logs.md`, `docs/taskboard.md` (this task's status only)

Files changed:

- `demos/corporate/index.html` — built/finalized a self-contained, **unnamed/reusable** corporate-site
  template (served at `/demos/corporate` via cleanUrls; `<base href="/demos/corporate/">`, root-absolute
  favicon `/images/Tab-Logo.png`). Editorial "warm paper + ink + one forest-teal accent" brand — its OWN
  palette, not the homepage ocean theme. Reuses the vendored CG + Mulish woff2 via `@font-face` with
  root-absolute `/fonts/...` paths (`font-display:swap`, no CDN). All visuals are inline SVG / CSS (monogram,
  client-logo placeholders, line icons, hero/work motifs) — no raster images, no emoji. Sections: header/nav
  (sticky + mobile panel), hero, trust strip, practice cards, approach + stats, selected work, testimonial,
  insights, closing CTA, contact (INERT form — `preventDefault`, inline "demo" notice, no fetch/XHR/endpoint),
  footer. A11y: `<html lang="en">`, semantic landmarks, aria-labels, labelled inputs, two-layer
  `:focus-visible`, skip link, `<noscript>` keeps reveal content visible. Reveal-on-scroll via
  IntersectionObserver; `prefers-reduced-motion` shows everything immediately. 22 `SWAP:` markers flag every
  swappable region; brand is a single-letter monogram + a `[Company Name]` slot.
  - **Bug fixed this session:** the two "selected work" SVG motifs used `fill="var(--surface-2)"` /
    `stroke="var(--line)"` / `fill="var(--accent)"` — CSS `var()` does **not** resolve in SVG *presentation
    attributes*, so those charts would have rendered with default (black/none) colors. Replaced with the
    literal token hex values (`#f0ece2` / `#d8d3c7` / `#2f5d52`) + an explanatory comment.
- `index.html` — `#styles` section: extended the single featured teardown card to a **2-up** layout. Added
  `.style-two` (`grid-template-columns:1fr 1fr`, max-width 760px) + a `@media(max-width:680px)` 1-col
  override; replaced the `.style-one` wrapper with `.style-two` holding both cards — the existing teardown
  card (`feat rv d2`) + a new corporate card (`feat rv d3` → `/demos/corporate`, kicker "Corporate ·
  Template", title "Corporate Site"). Updated the `.styles-lede` copy to "A couple of the kinds of sites we
  build — both live below." (honest: two live demos). `.style-one` left defined (now unused).
- `docs/design-guide.md` — added a `corporate-demo` decision entry (style direction + the SVG-`var()` rule).
- `docs/taskboard.md` — task [IN PROGRESS] → [REVIEW] + checklist; `docs/logs.md` — START (11:35) + this FINISH.

Summary:
Delivered the owner-requested corporate demo as a polished, reusable, unnamed template and wired it into the
homepage Styles section as the second real demo (the section now shows two live samples instead of one + "more
on the way"). The template matches the studio's craft level (considered paper-chip CTA, restrained glass-free
cards with hover lift + accent underline, reveal-on-scroll) while wearing its own brand so it reads as a real
corporate site, not WebSharke's and not a generic AI template.

Testing:
- `demos/corporate/index.html`: grep — **0** remaining `var()` in SVG presentation attrs (post-fix); all 7
  `@font-face` `src` refs resolve to files in `/fonts`; `<base>` + root-absolute favicon + `<html lang="en">`
  present; landmarks balanced (1 header/main/footer, 4 nav, 9 section open=close); 22 `SWAP:` markers;
  `prefers-reduced-motion` + `<noscript>` present; CSS braces balanced (net 0); no `http(s)://` except the SVG
  `xmlns` namespace in an inline `data:` URI (not a network request) — no CDN/fetch/XHR/external `.src`/SRI.
- `index.html`: `git diff` confirms my hunks are the `.style-two` CSS rule + the `#styles` markup only; `.d3`
  delay class exists (line 121); the `Site_bkg` `<picture>`/WebP hunks are the **concurrent Efficiency
  session's**, not mine (different region, no conflict).
- **Not run (non-GUI):** a live in-browser render of `/demos/corporate` and the homepage 2-up Styles grid
  (desktop hover lift + accent underline, mobile 1-col reflow at ≤680px, `:focus-visible` rings, inert-form
  notice, clean console). Recommend a ~1-min eyeball before deploy.

Risks / Notes:
- Built **ahead of Task F** (fonts) per owner direction; reuses the vendored families so it inherits the new
  fonts when F lands (the `@font-face` family names — Cormorant Garamond / Mulish — are what F will swap).
- Extends the Task S `#styles` redesign from one demo to two real demos (the intended end state). No new
  external links/forms/scripts beyond the same-origin `/demos/corporate` link + the page's own inert form →
  Security/Efficiency review is light, but flag per the task's review requirements.
- Concurrent sessions are editing `index.html` (Efficiency `Site_bkg`) and several docs (Security/Manager) —
  my edits are scoped to non-overlapping regions; no textual conflict observed.
- Not touched: payment/Stripe/Supabase/auth, other features' vendor JS, the laptop-teardown files.

Adversarial review + fixes (ultracode workflow — appended after the build/integrate notes above):
- Reviewed by 3 independent lenses (brand/de-AI · front-end QA · security/scope) — **all pass**. 7 findings
  were applied to `demos/corporate/index.html`:
  - **[high] Removed `<base href="/demos/corporate/">`** — this **corrects the "base present" note above**.
    Combined with fragment-only `<use href="#icon">` refs, `<base>` makes WebKit/Firefox resolve the icon
    refs against the base URL and blank **every** SVG icon. All asset paths are already root-absolute
    (`/fonts`, `/images`) and in-page links are pure `#fragments`, so `<base>` was unnecessary — removed
    (an HTML comment warns not to re-add it). Verified on disk: no `<base>` element remains.
  - **[medium]** Monogram was hardcoded `M` while the wordmark is `[Company Name]` → set to a neutral `A`
    with a SWAP comment on both the header and footer marks (swap name + monogram together).
  - **[low ×4]** De-clichéd the demo: dropped the hand-drawn hero underline; named concrete
    disciplines/sectors in the copy; renamed/trimmed the placeholder client logos + added a
    "(placeholder logos)" caption; bracketed the illustrative stat/result figures with SWAP notes.
- **⚠ Cross-role flag (Manager → Efficiency; NOT fixed — out of Designer scope, shared `/fonts`):** the
  vendored **Mulish woff2 are byte-identical across all four weights** — `mulish-400/500/600/700.woff2` all
  hash to md5 `50220d0057de0b9e5dc8b4fb36ee97a9` (29,968 B each). So **no Mulish weight renders distinctly
  anywhere on the site** (homepage included), not just this demo. Recommend Efficiency re-vendor genuine
  Mulish 500 / 600 / 700 woff2. Both the corporate demo and the homepage reference these weights and will
  render correctly once real files land.

---

## 2026-06-21 11:48 - Efficiency - image-optimization

Action:
Finished

Task:
Efficiency: Image / asset optimization audit → [REVIEW]

Files changed:

- `images/Site_bkg.png` (1,542,028 B) **deleted** → `images/Site_bkg.webp` (73,072 B, q82) +
  `images/Site_bkg.jpg` (165,215 B, q84 fallback), both 1366×4182.
- `images/Tab-Logo.png` 46,981 → **2,972 B** (256×144, quantized) — favicon + dashboard fin mask.
- `images/Main-Logo.png` 39,154 → **13,224 B** (1280×720, quantized) — wordmark mask + loader img.
- `index.html` — preload `<link>` → WebP (`type="image/webp"`); `<img id="bg">` → `<picture>` (WebP source +
  JPEG fallback `<img>`, `id="bg"` kept). No other markup.
- Docs: `docs/performance-log.md`, `docs/CHANGELOG.md`, `docs/taskboard.md` (→ [REVIEW] + checklist),
  `docs/logs.md` (START + this FINISH).

Result:
`images/` on disk **1,628,163 → 254,483 B (−84.4%)**. What a modern browser actually fetches (WebP bg + the two
logos) = **89,268 B vs 1,628,163 (−94.5%)**; the 165 KB JPEG is fetched only by the ~3% without WebP. Site_bkg
(the LCP / `fetchpriority="high"` hero) went **1.5 MB → 73 KB (−95.3%)**.

Tooling / how:
No ImageMagick (the `convert` on PATH is the Windows NTFS tool — avoided). Used **Pillow 12.2.0** (already
installed → no build step, no `package.json` change) via one-shot `python -` scripts; temp candidates cleaned up.

Testing — "no visible quality loss" (the acceptance bar):
- **Visual:** built side-by-side crops, viewed original vs optimized. Site_bkg across 3 gradient regions
  (beach/foam, mid dark-teal gradient, near-black bottom) at q70/q78 → **no banding/artifacts**; shipped q82
  (above the proven-clean q78). Logos viewed at render size (favicon fin; wordmark on white at the 420px loader)
  → **identical**; the alpha silhouette the CSS masks use is preserved.
- **Quantitative:** mean abs pixel diff for the WebP ≈ 1/255 per channel.
- **Functional:** zero remaining `Site_bkg.png` refs (grep); `<picture>`/preload correct; logos keep their exact
  paths so all 8 pages + `demos/corporate` resolve unchanged; `#bg` is `position:absolute` → the `<picture>`
  wrapper is layout-inert; every final file re-opens valid (correct mode/dims).
- **Scope:** `git status` = the 3 image files (+2 new) + `index.html` + docs only.

Risks / Notes:
- ~3% old browsers get the JPEG via `<picture>` (handled). Native dims kept on Site_bkg (no resize) → no
  softness/layout risk.
- Out of scope (flag for Manager): `demos/corporate/` (new, still being built) wasn't audited — a future asset
  pass could cover it once finalized.
- Reviews: **Manager** + **Designer** (confirm no visible quality regression — a GUI eyeball; everything
  statically/visually checkable here passed).

---

## 2026-06-21 12:15 - Security - security-headers-vercel-json

Action:
Finished

Task:
Security: Add security response headers in vercel.json (audit F6) → [REVIEW]

Files claimed:

- vercel.json, docs/security-log.md, docs/logs.md, docs/taskboard.md (status only)

Files changed:

- vercel.json — added a `headers` block on `source: "/(.*)"` with 6 headers: `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`
  (`max-age=63072000; includeSubDomains`), `Permissions-Policy` (deny camera/mic/geo/usb/serial; `payment=(self)`),
  and a minimal CSP (`frame-ancestors 'none'; base-uri 'self'; object-src 'none'`). `cleanUrls`/`trailingSlash`/
  `rewrites` untouched.
- docs/security-log.md — F6 → Fixed; recorded the deferred full-CSP allowlist for the follow-up.
- docs/taskboard.md — task → [REVIEW] + checklist; docs/logs.md — START + this FINISH.

Summary:
Shipped the safe, non-breaking defense-in-depth header set (audit F6). The minimal CSP deliberately omits
`script-src`/`style-src`/`connect-src`, so it cannot block the pervasive inline scripts/styles, Stripe, or
Supabase — it only adds clickjacking protection (`frame-ancestors`/XFO), blocks `<base>` injection
(`base-uri 'self'`, verified compatible with the animation's same-origin `<base>`), and blocks plugins
(`object-src 'none'`). The full enforcing CSP is documented as a deferred follow-up (needs `'unsafe-inline'` +
report-only validation against live Stripe/Supabase first).

Testing:
- `vercel.json` is valid JSON (node parse); 6 headers present on `/(.*)`; routing keys preserved.
- Header presence + a live regression check (Payment Element mounts, no CSP violations, portal opens, animation
  renders) need a Vercel preview (`curl -sI` + the browser pass) — NOT runnable headless. Fold into the F1/F2
  preview check already in progress.
- `git` scope: only `vercel.json` + 3 docs changed.

Risks / Notes:
- Response headers only exist on a real deploy. Did NOT `git commit` or deploy.
- Vercel already auto-applies HSTS; the explicit value here matches it (no `preload` → no permanent commitment;
  the owner can opt into preload later).
- If the owner ever enables Stripe Express Checkout wallets needing cross-origin delegation, change
  `payment=(self)` → `payment=(self "https://js.stripe.com")` — not needed for the current Payment Element.
- Remaining open Security tasks: F7 admin hardening (`docs/taskboard.md:1097`) and the post-brand re-audit.

---

## 2026-06-21 12:00 - Security - security-headers-vercel-json

Action:
Started

Task:
Security: Add security response headers in vercel.json (audit F6)

Files claimed:

- vercel.json
- docs/security-log.md
- docs/logs.md
- docs/taskboard.md (this task's status only)

Files changed:

- (in progress — see the FINISH entry)

Summary:
Claimed the F6 task ([TODO] → [IN PROGRESS]). Adding a `headers` block to vercel.json with the safe,
non-breaking defense-in-depth set: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`, a `Permissions-Policy`
deny-list that keeps `payment=(self)`, and a minimal CSP (`frame-ancestors 'none'; base-uri 'self';
object-src 'none'`). The full enforcing CSP is deferred (inline scripts everywhere + no build step) and
documented for a follow-up task.

Research:
Read-only sweep (3 Explore agents + Stripe/Supabase/Vercel docs) confirmed: the only external script origin is
`js.stripe.com` (Chart.js + Google Fonts are now vendored locally); `X-Frame-Options: DENY` / `frame-ancestors
'none'` are safe with Stripe (Stripe is framed by us, not vice versa); `payment=(self)` preserves the current
wallet default (no regression); the animation's `<base href="/Animations/laptop-teardown/">` is same-origin, so
`base-uri 'self'` is compatible.

Testing:
Planned: JSON validity (node). Header presence + a live regression check (Payment Element mounts, no CSP
violations) require a Vercel preview — folded into the F1/F2 browser pass; not runnable headless. Will NOT
commit or deploy.

Risks / Notes:
Headers only take effect on a real deploy. The minimal CSP deliberately omits `script-src`/`style-src`/
`connect-src`, so it cannot block inline code, Stripe, or Supabase. Task will move to [REVIEW].

---

## 2026-06-21 11:40 - Efficiency - image-optimization

Action:
Started

Task:
Efficiency: Image / asset optimization audit

Files claimed:

- `images/` (optimize `Site_bkg.png`, `Tab-Logo.png`, `Main-Logo.png`)
- `index.html` (only the bg `<img>`→`<picture>` + the preload `<link>`)
- `docs/performance-log.md`, `docs/logs.md`, `docs/taskboard.md` (status), `docs/CHANGELOG.md`

Summary:
Audited `images/` (3 files, 1.6 MB). `Site_bkg.png` is 1.5 MB / 96% — a 1366×4182 **RGB** PNG used as the
homepage full-bleed `<img id="bg">` (preloaded `fetchpriority="high"`); PNG is the wrong format. Optimizing with
**Pillow** (already installed → no build step / no new dependency; the `convert` on PATH is the Windows NTFS
tool, not ImageMagick):
- Site_bkg → WebP q82 (~62 KB) + JPEG q84 fallback (~165 KB) via `<picture>`; delete the 1.5 MB PNG.
- Tab-Logo (favicon + fin mask) → 256px quantized PNG (~3 KB), in place.
- Main-Logo (wordmark mask + visible loader img) → 1280px quantized PNG (~13 KB), in place.

Visually verified each candidate vs the original (Site_bkg across 3 gradient regions; logos at their render
size) — **no visible quality loss**. Logos keep their filenames/paths → no per-page edits; only `index.html`'s
bg markup changes.

Risks / Notes:
- Concurrent sessions are churning docs/`index.html` — will re-read on any conflict.
- `images/` masks (`Main-Logo`/`Tab-Logo`) use relative `mask-size`, so downscaling is layout-safe.

---

## 2026-06-21 11:35 - Designer - corporate-demo

Action:
Started

Task:
Designer: Create a corporate-style demo site (single self-contained reusable template)

Files claimed:

- `demos/corporate/index.html` (new — the template page)
- `index.html` — the `#styles` section only (markup + a small `.style-two` CSS rule), to link the demo
- `docs/design-guide.md`
- `docs/logs.md`
- `docs/taskboard.md` (this task's status only)

Files changed:

- (START — none yet; see the FINISH entry)

Summary:
Claimed the owner-requested corporate-demo task ([TODO] → [IN PROGRESS]). Plan: build one self-contained,
**unnamed/reusable** corporate-site template at `demos/corporate/index.html` (served at `/demos/corporate`
via cleanUrls — no `vercel.json` change, mirrors the teardown), then link it from the redesigned `#styles`
as a second real demo (the section currently shows only the teardown). "Editorial corporate" direction:
light/paper, its own brand, reusing the vendored Cormorant Garamond + Mulish families (inherits Task F's
fonts later), restrained palette, SVG icons, subtle reveal — no generic AI-template look. Self-contained:
inline CSS/JS, `@font-face` → `/fonts`, all visuals inline SVG/CSS (no raster images), no CDN, responsive,
reduced-motion, a11y, inert contact form (no backend/leak).

Execution: ultracode Workflow (design panel → build → integrate → adversarial verify → fix); docs finalized
in the main loop.

Testing:
None yet (START).

Risks / Notes:

- Built **ahead of Task F** (fonts) per owner direction; reuses the vendored families so it inherits the new
  fonts when F lands. Flag for Manager.
- Touches the `#styles` section that's currently in `[REVIEW]` (Task S) — extends it from one demo to two
  real demos (the intended end state of removing the placeholders).
- Not touching: payment/Stripe/Supabase/auth, other features' vendor JS, the teardown files.

---

## 2026-06-21 11:12 - Manager - round2-tasks-plus-corporate

Action:
Planned

Task:
Give every role more tasks (round 2) + a Designer corporate-site template task

Files claimed:

- docs/taskboard.md
- docs/logs.md

Files changed:

- docs/taskboard.md — added "# More tasks — 2026-06-20 (round 2)" with 8 tasks (2 per role); refined the
  corporate-site task to the owner-confirmed scope.
- docs/logs.md — this entry.

Summary:
Per the owner ("give everyone more tasks" + "give the designer a task to create a corporate site"), added 8
tasks:
- **Manager:** clean & archive the board + "Current focus" list; start `docs/DECISIONS.md`.
- **Designer:** create a corporate-style demo site — scope confirmed as a **single self-contained page built
  as an unnamed, reusable template** with swappable placeholder content (pairs with Task S); extend the
  design system to the inner pages.
- **Efficiency:** image/asset optimization audit; prune the unused CG/Mulish woff2 after Task F.
- **Security:** harden the admin-API F7 minor items; re-audit external requests after the brand changes land.

Testing:
Docs only — no website code changed.

Risks / Notes:

- Several round-2 tasks depend on **Task F** (fonts) or land after **S / T / D1** — sequencing noted on each.
- The board is now large; the Manager "clean & archive" round-2 task is meant to tame it — run it when no
  other session is mid-edit.
- Concurrent sessions are active (a Designer just finished `styles-redesign`; an Efficiency `deploy-hygiene`
  session ran earlier). I touched only docs. A later Manager pass should confirm the styles redesign was
  done on the new type system (Task F → S order) or flag rework.
- **Next:** Task F (fonts) is the foundation for the brand work; F1 (High billing-auth) remains the top
  security priority.

---

## 2026-06-20 11:00 - Designer - styles-redesign

Action:
Finished

Task:
Designer: Redesign the Styles section (remove the AI numbered placeholder grid) → [REVIEW]

Files claimed:

- `index.html` (#styles markup + its inline `<style>` rules) · `docs/design-guide.md` · `docs/logs.md` ·
  `docs/taskboard.md` (status only)

Files changed:

- `index.html` — redesigned `#styles`. Removed the `.style-grid` 3-col grid, all six `01–06` `.sc-index`
  numerals, the five "Preview coming soon" placeholder cards, and the now-unused `.sc-soon` rule + the two
  `.style-grid` responsive overrides. Added one honest `.styles-lede` line + a single featured
  `.style-card.feat` (the teardown) wrapped in a centered `.style-one` block. `git diff` = +10 / −51, scoped
  entirely to the Styles CSS + markup (no JS / payment / auth hunks).
- `docs/design-guide.md` — added the `styles-redesign` decision entry; updated the type-scale, color
  (`--mist` now unused), spacing/grid, breakpoint, and component sections to match; marked the old
  "5-card grid empty cell" observation + follow-up #5 resolved.
- `docs/taskboard.md` — task [TODO]→[IN PROGRESS]→[REVIEW] + checklist.
- `docs/logs.md` — START + this FINISH.

Summary:
Acted on owner feedback ("the styles section looks like ai… the 01,02,etc is ai"). The `#styles` section
now presents the one real sample — the 3D Laptop Teardown — as a single featured card (reusing the
canonical `.style-card.feat`, no new component) under a plain, honest lede ("A look at the kinds of sites we
build. The first one's live — more on the way."). No numbered placeholder grid, no fake "coming soon" cards.

Testing:
- grep: `.sc-index` / `.sc-soon` / `.style-grid` / "Preview coming soon" → **0** remaining in `index.html`;
  exactly **1** `.style-card`; teardown `href="/Animations/laptop-teardown"` intact.
- Pre-edit grep confirmed those selectors were CSS/markup-only (no JS hooks) → safe removal; the
  `#styles`/`#site-footer` offset JS + `.rv` reveal observer are unaffected.
- CSS brace balance in `<style>` = 124/124 (BALANCED). `git diff` hunks all within the Styles region.
- **Not** run (non-GUI): the live in-browser render — recommend a ~30s eyeball (section renders one card,
  hover lift + aqua hairline + arrow nudge, `:focus-visible` ring, mobile reflow, clean console).

Risks / Notes:

- Superseded the earlier in-session card-06 grid rebalance (removed here). The already-DONE
  `--warm`/`--warm-lt` button token fix (now in HEAD) is untouched.
- **Scope flag for Manager:** this task nominally sequences *after* the typography-restore task; done now
  per owner direction. It uses canonical components + current fonts, so the later site-wide `font-family`
  swap needs no rework here. Also `#styles` markup line ranges shifted — later tasks should re-grep.
- Token knock-on: `--mist` is now defined-but-unused (folded into the unused-token follow-up).
- `docs/design-guide.md` saw "modified since read" churn during the session (OneDrive sync); all edits were
  re-verified on disk after landing.
- Review: Manager (scope + sequencing flag). Security/Efficiency not triggered (no new links/forms/scripts;
  net markup/CSS removed).

---

## 2026-06-20 10:53 - Designer - styles-redesign

Action:
Started

Task:
Designer: Redesign the Styles section (remove the AI numbered placeholder grid)

Files claimed:

- `index.html` — the `#styles` section markup + its inline `<style>` rules (`.style-grid`, `.style-card`,
  `.sc-*`, the two `.style-grid` responsive overrides). No JS, no other section.
- `docs/design-guide.md`
- `docs/logs.md`
- `docs/taskboard.md` (this task's status only)

Files changed:

- (START — none yet; see the FINISH entry)

Summary:
Claimed the owner-driven Styles redesign ([TODO] → [IN PROGRESS]). Owner feedback: "the styles section
looks like ai… the 01,02,etc is ai." Plan: remove the `01–06` `.sc-index` numerals + the five "Preview
coming soon" placeholder cards (and the `.sc-soon` / `.style-grid` rules), and present the one real sample
(the 3D Laptop Teardown) intentionally — a single featured card (reusing the canonical `.style-card.feat`)
plus one honest lede line ("more on the way"). Keep the `/Animations/laptop-teardown` link working.

Pre-edit verification (read-only): grep confirms `.sc-index` / `.sc-soon` / `.style-grid` are referenced
only in the `#styles` CSS + markup — **no JS selectors** use them, so removal is safe. The `#styles` /
`#site-footer` offset JS and the `.rv` reveal observer are unaffected.

Testing:
None yet (START).

Risks / Notes:

- Supersedes the card-06 / `.sc-soon`-size edits left in the working tree from the earlier in-session grid
  rebalance — those are removed by this rewrite. The already-DONE `--warm`/`--warm-lt` token fix stays.
- Sequencing: this task nominally runs after the typography-restore task; doing it now is forward-compatible
  (canonical components + current fonts; the later font swap sweeps `font-family` site-wide). Flag to Manager.
- Not touching: payment/Stripe/Supabase/auth, the teardown animation files, vendor files, other sections.

---

## 2026-06-20 10:50 - Efficiency - deploy-hygiene

Action:
Finished

Task:
Two Efficiency fixes from the Security triage → both **[REVIEW]**: **F4** `.vercelignore` (stop serving
internal files) + **F3** vendor Chart.js locally.

Files changed:

- **`.vercelignore`** (new) — excludes `docs`, `db`, `CLAUDE.md` from the Vercel deploy. `docs/` holds the task
  board / work log / **security log** (F4); `db/admin-schema.sql` + `ADMIN_SETUP.md` is the same class of schema
  leak (not separately in the audit — flagged); `CLAUDE.md` is belt-and-suspenders (also gitignored).
- **`js/vendor/chart.umd.min.js`** (new) — Chart.js 4.4.1 UMD, 205 KB, the exact jsDelivr-served file.
- **`dashboard.html`** — swapped the Chart.js `<script src>` from the jsDelivr URL to
  `js/vendor/chart.umd.min.js` (+ updated its comment). **Only those 2 lines are mine.**
- **`js/vendor/README.md`** — documented the Chart.js vendoring; removed the stale "Chart.js still loads from
  jsdelivr" note.
- Docs: `docs/performance-log.md` (deploy-hygiene entry), `docs/CHANGELOG.md`, `docs/taskboard.md` (both →
  [REVIEW] + checklists), `docs/logs.md` (START + this FINISH).

⚠️ Coordination — shared file:
`dashboard.html` also carries the **concurrent Security session's F1/F2 client-auth changes** (the
`db.auth.getSession()` + `Authorization: Bearer <token>` additions on the billing fetches). Those are **not
mine** — a different region of the file, no textual conflict; both edits coexist in the working tree, so a
commit picks up both. Flagged so the Chart.js change isn't conflated with the billing fix.

Testing:
- Chart.js: `dashboard.html` grep-clean of `jsdelivr`/`cdn.` (only `js.stripe.com` remains — required); vendored
  file is 205 KB, contains "Chart.js v4.4.1", passes `node --check` (defines the `Chart` global the inline code
  uses, guarded by `if(!window.Chart)`). Same bytes jsDelivr served → identical behavior.
- `.vercelignore`: no site page or `/api` references `docs/` or `db/` at runtime (only Stripe-SDK doc-comments
  under `node_modules` — irrelevant) → excluding them can't break the site. `package.json` kept (Vercel needs it
  for `/api` deps).
- Scope: `git status` = new `.vercelignore`, new `js/vendor/chart.umd.min.js`, modified `dashboard.html` +
  `js/vendor/README.md`. No payment/Stripe/Supabase/auth **logic** touched by me.

Risks / Notes:
- `db/` + `CLAUDE.md` in `.vercelignore` go beyond the literal docs-only F4 — flagged for Security/Manager;
  trivially trimmable, safe to exclude.
- Live items for review (non-GUI): `/docs/*` + `/db/*` → 404 on a Vercel preview (Security); admin charts render
  from the local file (admin-login GUI). Consistent with prior non-GUI sign-offs.
- Reviews: **Manager** (scope) + **Security** (CDN gone / 404s).

---

## 2026-06-20 10:40 - Manager - create-designer-brand-tasks

Action:
Planned

Task:
Create three Designer tasks (de-AI the brand) from the owner's request

Files claimed:

- docs/taskboard.md
- docs/logs.md

Files changed:

- docs/taskboard.md — added a "Designer queue — brand de-AI (2026-06-20)" block with three `[TODO]` tasks.
- docs/logs.md — this entry.

Summary:
Owner flagged that the site reads as AI-generated and wants its intended identity back. Authored three
Designer tasks (planned in `~/.claude/plans/zany-questing-simon.md`, approved):
- **Task F — typography (High):** headers → **Distillery Display** (download & self-host), subtext/body →
  **Playfair Display** (OFL, vendored), site-wide, no CDN.
- **Task S — Styles section (Medium):** **full redesign** — remove the AI `01–06` `.sc-index` numbering and
  the five empty "Preview coming soon" placeholder cards (`index.html:296–331`); only card 01 is real.
- **Task T — laptop-teardown (Medium):** de-AI / on-theme pass — align fonts, colors, copy, and the CTA
  (`.btn` → `.btn-sand`) to the brand; inventory findings in `docs/design-guide.md`.

Owner decisions: download & self-host Distillery Display (commercial — task flags using a licensed web
font); full Styles-section redesign.

Testing:
Docs/planning only — no website code changed. Confirmed `.sc-index` numbering at `index.html:296–331`;
`git log -S` confirms Distillery/Playfair never existed in the repo (fresh vendor, not a revert).

Risks / Notes:

- **Sequence F → S → T**, one Designer at a time. **F and S both rewrite `index.html` — never concurrently.**
  S and T depend on F's new fonts.
- **Task F is potentially BLOCKED** on sourcing a legitimate Distillery Display web font — if a proper woff2
  can't be obtained, the Designer flags it to the owner.
- These are brand changes, not the security fixes — the **F1 (High) billing-auth IDOR** remains the top
  overall priority on the board.
- **Next:** run **Task F** (fonts) first; then S, then T. (An Efficiency session is concurrently handling the
  `docs/` deploy-hygiene fix.)

---

## 2026-06-20 10:36 - Efficiency - deploy-hygiene

Action:
Started

Task:
Two Efficiency fixes from the 2026-06-20 Security triage — **F4** (`.vercelignore` to stop serving `docs/`) and
**F3** (vendor Chart.js locally on the dashboard). Doing F4 first.

Files claimed:

- new `.vercelignore`; `docs/`, `db/` (deploy-exclusion scope only)
- `dashboard.html` (the Chart.js `<script src>` only, ~line 832); new `js/vendor/chart.umd.min.js`;
  `js/vendor/README.md`
- `docs/performance-log.md`, `docs/logs.md`, `docs/taskboard.md` (status), `docs/CHANGELOG.md`,
  `docs/security-log.md` (note F3/F4 addressed)

Files changed (so far):

- `js/vendor/chart.umd.min.js` — downloaded Chart.js 4.4.1 UMD (205 KB; the exact jsDelivr-served file —
  banner says "already minified … chart.umd.js"; `node --check` OK; contains "Chart.js v4.4.1").

Summary:
F4: no `.vercelignore` exists → a Vercel deploy serves `/docs/*` (incl. the security log with the F1 IDOR
write-up). Found `db/admin-schema.sql` + `db/ADMIN_SETUP.md` is the same class of leak → excluding both. F3:
`dashboard.html:832` loads Chart.js from jsDelivr (breaks in the user's CDN-blocked browser); vendoring it to
`js/vendor/` (matching the existing `js/vendor/supabase.min.js`) and pointing the `<script>` at it. Stripe.js
(`dashboard.html:830`) left untouched — it must stay on `js.stripe.com`.

Risks / Notes:
- `.vercelignore` includes `db/` (+ `CLAUDE.md`) beyond the literal docs-only F4 wording — same opsec fix,
  flagged for Security/Manager; reviewer can trim. Excluding them is safe (not referenced at runtime).
- No collision: the concurrent Security session is editing `api/*` (F1/F2 auth), not these files.

---

## 2026-06-20 10:45 - Security - billing-endpoints-auth-fix

Action:
Finished

Task:
Security: Add caller authentication to the unauthenticated billing endpoints (customer-portal + checkout) → [REVIEW]

Files claimed:

- api/customer-portal.js, api/checkout.js, dashboard.html, payment.html
- docs/security-log.md, docs/logs.md, docs/taskboard.md (status only)

Files changed:

- api/customer-portal.js — added a Supabase bearer-token auth gate (mirrors `api/admin.js:86-103`); now
  resolves the Stripe customer ONLY from the authenticated `caller.id` (client `customerId`/`userId` ignored);
  CORS narrowed `*` → site origin + `OPTIONS` 204. Closes the F1 IDOR.
- api/checkout.js — added `require("@supabase/supabase-js")` (already a dependency), the same auth gate, and
  derives identity from the token (`userId = caller.id`, `email = caller.email`; 403 if a body `userId`
  mismatches); keeps the client `priceId`; CORS narrowed. Closes F2.
- dashboard.html — the 2 `/api/customer-portal` fetches + the `/api/checkout` fetch now send
  `Authorization: Bearer <access_token>` (token via `db.auth.getSession()`); bodies simplified (server derives
  identity). No other dashboard logic touched.
- payment.html — the `/api/checkout` fetch now sends the bearer token; body trimmed to `priceId` only.
- docs/security-log.md — added a "Fix applied" entry marking F1/F2 Fixed (pending live test).
- docs/taskboard.md — task → `[REVIEW]` + checklist; docs/logs.md — START + this FINISH.

Summary:
Implemented the F1/F2 fix. Root cause: both billing endpoints trusted a client-supplied `userId`/`customerId`
with no authentication, letting anyone open a victim's Stripe Billing Portal (F1 IDOR) or attribute Stripe
objects to an arbitrary user (F2). The fix mirrors the project's own working pattern in `api/admin.js`: verify
the Supabase access token server-side, then act only as the authenticated user. Additive gate — Stripe price
IDs, the webhook, and the Payment Element / subscription flow are unchanged.

Testing:
- `node --check api/customer-portal.js` and `node --check api/checkout.js` → both OK.
- Static trace: with no/invalid token → 401 before any Stripe/service-role call; body `userId` ≠ `caller.id`
  → 403 (checkout). Positive path: legit callers send their own session token + (for checkout) their own id,
  so behaviour is unchanged.
- `git diff` scope: only the 4 code files + 3 docs; no webhook, no price IDs, no vendor files.
- **NOT run (needs a browser + env + live keys): the full e2e flow** (sign-in → checkout → manage
  subscription) and the cross-account "can't open another user's portal" check. Required before deploy.

Risks / Notes:
- **LIVE billing.** Did NOT `git commit` or deploy. Task is `[REVIEW]`, not `[DONE]` — needs the live e2e test
  + owner deploy sign-off (the task's Review requirements).
- `checkout.js` now reads `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — confirm they're set on Vercel before
  deploy (already set for webhook/customer-portal/admin).
- CORS is now `https://websharke.com`; same-origin calls are unaffected. If production also serves from `www.`
  or another origin, confirm/adjust (CORS isn't the access control here — the token is — so it won't break the
  same-origin flow).
- Follow-on Security task still open: F6 "Add security response headers in vercel.json" (Low).

---

## 2026-06-20 10:20 - Security - billing-endpoints-auth-fix

Action:
Started

Task:
Security: Add caller authentication to the unauthenticated billing endpoints (customer-portal + checkout)

Files claimed:

- api/customer-portal.js
- api/checkout.js
- payment.html (the `/api/checkout` fetch only)
- dashboard.html (the 2 `/api/customer-portal` fetches + the `/api/checkout` fetch only)
- docs/security-log.md
- docs/logs.md
- docs/taskboard.md (this task's status only)

Files changed:

- (in progress — see the FINISH entry)

Summary:
Claimed the High-priority F1/F2 fix (`[TODO]` → `[IN PROGRESS]`). Adding a Supabase bearer-token auth gate to
`api/customer-portal.js` and `api/checkout.js` (mirroring `api/admin.js:86-103`), deriving identity from the
verified token (customer-portal acts only on `caller.id`; checkout uses `caller.id` + `caller.email`), and
updating the 4 frontend callers to send the access token (mirroring the dashboard `adminApi` pattern). Additive
auth gate only — no change to Stripe price IDs, the webhook, or the Payment Element / subscription logic.

Concurrency:
Efficiency's font task already finished on `payment.html` / `dashboard.html` (head-only). I touch only the
billing fetch call sites (well below the head) → no collision. This task was triaged by the Manager from the
2026-06-20 security audit.

Testing:
Planned: `node --check` on both API files + a static negative/positive-path trace. **Live end-to-end (sign-in
→ checkout → manage subscription) + owner sign-off are required before deploy — not runnable headless.** Will
NOT `git commit` or deploy.

Risks / Notes:
Touches LIVE billing. `checkout.js` now also needs `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in the `/api`
env (already set for webhook/customer-portal/admin). Task will move to `[REVIEW]`, not `[DONE]`.

---

## 2026-06-20 09:57 - Manager - review-and-triage-role-tasks

Action:
Reviewed

Task:
Review the three finished role tasks (Designer / Efficiency / Security) and triage the Security audit findings

Files claimed:

- docs/taskboard.md
- docs/logs.md

Files changed:

- docs/taskboard.md — moved Designer, Efficiency, and Security tasks `[REVIEW]` → `[DONE]` (each with a
  Manager review note); added "Fix tasks triaged from the 2026-06-20 Security audit" (5 tasks).
- docs/logs.md — this entry.

Summary:
All three specialist tasks are complete and verified in scope:
- **Designer → DONE** — documented the full homepage design system in `docs/design-guide.md`; one safe
  `--warm`/`--warm-lt` token substitution in `index.html` (visually identical).
- **Efficiency → DONE** — vendored fonts on the 6 remaining pages; `git diff` confirms **head/font-only**
  changes (incl. `payment.html` / `dashboard.html`), no payment/auth logic touched. Site is now CDN-free for
  fonts. Supersedes legacy Task E. Residual: a GUI type-render eyeball (non-blocking).
- **Security → DONE** — read-only audit, no code changed; 8 evidence-cited findings.

Triaged the Security findings into 5 fix tasks (severity-ordered). **Headline: F1 (High) —
`api/customer-portal.js` has no caller auth → IDOR on live billing** (an unauthenticated request with a
victim's `user_id`/`cus_…` returns a working Stripe Billing Portal URL). Cut as the top-priority fix
(paired with F2 checkout). Others: docs/ served publicly on Vercel (F4), Chart.js jsDelivr CDN in the admin
context (F3), Supabase RLS verification (F5), missing security headers (F6).

Testing:
Docs/triage only — the Manager changed no website code. Verified role-edit scope via `git status` +
`git diff HEAD -- payment.html dashboard.html` (font-only).

Risks / Notes:

- **F1 is a live-billing vulnerability** — prioritize it; the fix touches live payment endpoints, so it
  needs careful end-to-end testing and owner awareness before deploy.
- **F4** means the security log itself (with the F1 write-up) is likely world-readable on the deployed site
  — the `.vercelignore` task is a quick, high-value win; do it before/with any public deploy.
- The laptop-teardown `[REVIEW]` cluster still awaits the GUI live-render (Task A) — not closed this round.
- **Next:** assign **F1 (Security, High)** and the **`.vercelignore` (Efficiency)** first.

---

## 2026-06-20 00:40 - Efficiency - no-cdn-fonts-remaining-pages

Action:
Finished

Task:
Efficiency: Finish the site-wide no-CDN web fonts (remaining pages) → [REVIEW]

Files changed:

- `dashboard.html`, `login.html`, `payment.html`, `onboarding.html`, `success.html`, `cancel.html` — removed
  the 2 `preconnect`s + the Google Fonts CDN `<link>` (+ the stale "Same brand fonts…" comment) from `<head>`;
  added a tailored inline `@font-face` block at the top of each page's existing `<style>` (`font-display:swap`,
  `src:url(fonts/…)`). Head/font region only — no JS / markup / logic changed.
- `fonts/` — added `cormorantgaramond-700.woff2` (downloaded, Google latin subset) + `mulish-700.woff2`
  (copied from `Animations/laptop-teardown/vendor/fonts/`).
- `docs/performance-log.md` (finding → Fixed + completion entry), `docs/CHANGELOG.md`, `docs/taskboard.md`
  (→ [REVIEW] + checklist), `docs/logs.md` (START + this FINISH).

Per-page `@font-face` sets (only the faces each page actually renders):
- dashboard — CG 600/700 + Mulish 400/500/600/700 (6; CG-700 + Mulish-500 are admin-panel only)
- login — CG 600 + Mulish 400 (2)
- payment / onboarding / cancel — CG 600 + Mulish 400/600/700 (4 each)
- success — CG 600 + Mulish 400/600 (3)

Why these faces (audited each page; didn't trust the CDN URL):
The shared CDN URL requested 12 faces; the pages render ≤6. **No italic** on any of these pages (onboarding's
lone `<em>` is overridden to `font-style:normal`), so CG-500-italic (homepage-only) was omitted. **Mulish-800**
(dashboard cards/badges) already mapped to 700 under the CDN, so providing Mulish-700 keeps it identical — no
800 face. **CG-700** is dashboard-admin-only (`.adm-h1`/`.adm-panel-box h3`/`.adm-drawer-title`/`.adm-modal h3`
+ the UA-bold `.adm-empty h4`); the CDN served it, so it had to be preserved → the one download.

Testing:
- Grep: **zero** `googleapis`/`gstatic`/`preconnect` across all 6 pages.
- Fonts: both new files start with `wOF2` magic; `mulish-700` is `cmp`-identical to its vendor source;
  `cormorantgaramond-700` = 22,340 B (the same Google latin-subset woff2 the CDN serves today). Every
  `src:url(fonts/X.woff2)` resolves to a file now in `/fonts` (no 404); no `/fonts` file is unreferenced.
- Per-page `@font-face` counts match the audit (6 / 2 / 4 / 4 / 3 / 4).
- Scope: `git diff --stat` = 29 ins / 29 del, head/font lines only; diff body is only font tags + `@font-face`
  + a CSS comment — no logic. Vendored fonts untouched. Working copies are consistently CRLF (repo `autocrlf`;
  HEAD is LF) — not mixed; git diff is clean.

Risks / Notes:
- **Did not run a live HTTP server / browser.** These are plain static files at correct relative paths
  (`fonts/…` → `/fonts/…`) — the same pattern already live on the homepage (Task C) — so file-existence +
  path-match prove resolution. The in-browser **type-renders-unchanged + Network shows local woff2 / no CDN**
  eyeball is the GUI-only item left for review (same limitation Task C signed off with).
- Review per the task: **Security** (head/font tags only on the auth/payment pages), **Manager** (scope),
  **Designer** (type unchanged). Absorbs legacy **Task E**.

---

## 2026-06-20 00:24 - Efficiency - no-cdn-fonts-remaining-pages

> (Concurrent multi-session run — other sessions' clocks read ahead of this one; timestamp is this session's
> own clock, matching the new `fonts/*.woff2` mtimes. Newest by write order.)

Action:
Started

Task:
Efficiency: Finish the site-wide no-CDN web fonts (remaining pages)

Files claimed:

- `dashboard.html`, `login.html`, `payment.html`, `onboarding.html`, `success.html`, `cancel.html` — head
  font `<link>`s + top of the inline `<style>` only
- `fonts/` (added woff2)
- `docs/performance-log.md`, `docs/logs.md`, `docs/taskboard.md` (status), `docs/CHANGELOG.md`

Files changed (so far):

- `fonts/mulish-700.woff2` — copied from `Animations/laptop-teardown/vendor/fonts/` (byte-identical; `cmp` OK)
- `fonts/cormorantgaramond-700.woff2` — downloaded (Google Fonts latin subset, v21) — the only download

Summary:
Picking up the Efficiency task to finish the no-CDN font policy on the 6 non-homepage pages. Audited each
page's real usage (every `font-family`/`font-weight`/`font-style` + a `<strong>`/`<b>`/heading sweep). Union of
faces actually rendered = **CG-600, CG-700, Mulish-400/500/600/700** — no italic on these pages (onboarding's
only `<em>` is overridden to `font-style:normal`), and no real Mulish-800 face needed (800 already maps to 700,
matching today's CDN behaviour). `/fonts` was missing exactly two of those: `mulish-700` (present in the
animation vendor set → copied) and `cormorantgaramond-700` (used only by the dashboard admin panel —
`.adm-h1`/`.adm-panel-box h3`/`.adm-drawer-title`/`.adm-modal h3` + the UA-bold `.adm-empty h4`; not vendored
anywhere → downloaded the Google latin-subset woff2, the same file the CDN serves today). Next: replace each
page's CDN `<link>` + preconnects with a per-page inline `@font-face` block (only the faces that page renders),
matching the homepage (Task C) convention.

Testing (so far):
`head -c 4` → `wOF2` on both new files; `cmp` confirms `mulish-700` is byte-identical to its vendor source;
`cormorantgaramond-700` is 22,340 B (sane for a CG latin subset). Page edits + grep/serve verification to
follow in the FINISH entry.

Risks / Notes:
- Reserves the 6 page `<head>`s. Verified **no collision** with the concurrent Designer session (edited only
  `index.html` `.btn-sand` + `--warm`, no font tags) or the read-only Security audit pass.
- Auth/payment pages: only the `<head>` font tags + the `@font-face` `<style>` block change — no logic edits.

---

## 2026-06-20 02:10 - Security - site-wide-audit-pass

Action:
Finished

Task:
Security: Run a site-wide security audit pass and populate the security log

Files claimed:

- docs/security-log.md
- docs/logs.md
- docs/taskboard.md (Security task status line only)

Files changed:

- docs/security-log.md — added 8 evidence-backed findings (F1–F8) under a new "Live audit pass — 2026-06-20"
  subsection, above the migrated baseline.
- docs/taskboard.md — Security task [TODO] → [REVIEW]; Owner set; completion checklist ticked.
- docs/logs.md — START + this FINISH entry.

Summary:
Completed the read-only, site-wide security audit (the CLAUDE.md Security checklist) and populated
docs/security-log.md. Recorded **8 findings: 1 High, 4 Medium (one conditional, one verify-only), 1 Low, plus
an informational bundle and a verified-clean baseline.** Headline — **F1: `api/customer-portal.js` has no
caller authentication and uses the service-role key to mint a Stripe Billing Portal session for any supplied
`user_id`/`customer_id` → IDOR on live billing data (High).** F2: `api/checkout.js` shares the same
missing-auth pattern (Medium). F3: Chart.js is loaded from jsDelivr on the admin dashboard (supply-chain +
blocked-CDN, Medium). F4: `docs/` is served publicly (Medium/verify). F5: RLS is unverifiable from the repo
(Medium/confirm). F6: no security response headers (Low). F7: low/informational bundle. F8: documents what is
correct — secret handling, webhook signature verification, admin server-side authZ, and XSS-safe escaping. No
production code was touched.

Testing:
Read-only audit only. Method: 3 parallel read-only sweeps (frontend HTML / API + config / repo-wide patterns)
plus first-hand reads of api/customer-portal.js, api/admin.js, api/checkout.js, api/webhook.js, the
dashboard.html innerHTML/esc() surface, vercel.json, and .gitignore. Every finding cites file:line and the
evidence was re-grep-confirmed. `git status` shows only the three docs files changed — no code/vendor/payment/
auth files.

Risks / Notes:
- **For the Manager:** cut a High-priority fix task for **F1** (pair **F2**) — add Supabase bearer-token
  verification + a caller-identity (`userId === caller.id`) check, reusing the pattern already implemented in
  `api/admin.js:86-103`. The fix touches payment/Stripe/auth logic, so it must be its own task with explicit
  approval (not done in this audit pass, per the global rules). Security can implement it once that task exists.
- **F4** (is `/docs/security-log.md` actually fetchable?) and **F5** (RLS state) need a real Vercel preview /
  the Supabase dashboard — a non-GUI session can't confirm them.
- This pass is read-only on code, so it does not collide with the Designer / Efficiency font/design work.

---

## 2026-06-20 01:45 - Security - site-wide-audit-pass

Action:
Started

Task:
Security: Run a site-wide security audit pass and populate the security log

Files claimed:

- docs/security-log.md
- docs/logs.md
- docs/taskboard.md (Security task status line only)

Files changed:

- (none at start — read-only audit; findings recorded in the FINISH entry above)

Summary:
Claimed the Security audit task ([TODO] → [IN PROGRESS]). Read-only sweep of the whole site against the
CLAUDE.md Security checklist: all root *.html, js/supabase-config.js, api/*.js, vercel.json, .gitignore,
Animations/**. Audit-only — no production code edited; findings go to docs/security-log.md for the Manager to
triage. (Audit performed in plan mode; edits applied after plan approval.)

Testing:
N/A at start (read-only). Evidence gathered via Grep + direct file Reads; see the FINISH entry for results.

Risks / Notes:
Read-only on code → no collision with concurrent Designer/Efficiency work. Will hand findings to the Manager;
will not fix payment/auth logic in this pass.

---

## 2026-06-20 01:10 - Designer - homepage-design-baseline

Action:
Finished

Task:
Designer: Establish the homepage design baseline and fix obvious visual inconsistencies → [REVIEW]

Files claimed:

- `index.html` (inline `<style>` only) · `docs/design-guide.md` · `docs/logs.md` · `docs/taskboard.md` (status only)

Files changed:

- `index.html` — 2 lines in the inline `<style>`: wired the unused `--warm` token into the `.btn-sand`
  gradient (`#e4cfa6` → `var(--warm)`, byte-identical) and made the `--warm` token comment self-documenting.
  No other CSS, no markup, no JS touched.
- `docs/design-guide.md` — filled all four "to document" placeholders with the real system (10 `:root`
  tokens + a used/unused audit, the Cormorant Garamond / Mulish type scale per element + breakpoints, the
  spacing/rhythm scale, the canonical component inventory); added an "Open design follow-ups" section (5
  proposed tasks) + a dated Designer decision entry; removed 2 now-redundant summary bullets.
- `docs/taskboard.md` — Designer task [TODO] → [IN PROGRESS] → [REVIEW]; Owner set; checklist filled.
- `docs/logs.md` — START + this FINISH.

Summary:
Documentation-first baseline. The homepage design system was already sound and consistent — the gap was that
it wasn't written down. Catalogued it into `docs/design-guide.md` so future Designer work stays on-brand.
Applied exactly one clearly-safe consistency fix (the `--warm` tokenization) and deliberately left every
value-changing item (off-white unification, unused-token cleanup, alpha tokenization, focus parity, reveal
stagger) as proposed follow-ups — matching the task's "document + propose; only trivially-safe fixes" scope.

Testing:

- `index.html`: grep confirms `#e4cfa6` now appears once (the `:root` definition) and `var(--warm)` once
  (the gradient); the `--warm` definition (line 51) precedes `.btn-sand` (line 106) so the property
  resolves. The swap is byte-identical by construction → no rendered difference. No `googleapis`/`gstatic`
  introduced (fonts untouched).
- `design-guide.md`: grep confirms zero "To document" placeholders remain; re-read for coherence (sections
  flow, no orphaned headers / duplicate `---`; component dedup done).
- `git status`: only in-scope files in my change set; `script.js` / `dashboard-style.html` / `CHANGELOG.md`
  / untracked docs + `fonts/` were all pre-existing from other sessions, not this one.
- Not run (non-GUI session): a live browser render — N/A for a byte-identical token swap, but a reviewer
  with a browser can confirm the CTA + type render unchanged in ~20 s.

Risks / Notes:

- Review per the task: **Manager (scope)**. Efficiency/Security review is **not** triggered — no assets,
  scripts, links, forms, or iframes added; CSS-only, no new colors invented (`--warm` already existed).
- The 5 "Open design follow-ups" in `docs/design-guide.md` are for the Manager to triage into formatted
  tasks; each changes a rendered value or behaviour and wants its own pass + an in-browser eyeball.
- No collision with the Efficiency font task: I edited only the `.btn-sand` rule + the `--warm` comment, no
  font `<link>`/`@font-face`. Line ranges don't overlap if Efficiency picks up the homepage head.
- During review the `.btn-sand` **upper** stop was also tokenized (a new `--warm-lt:#f8ecd3` added alongside
  my `--warm` wiring), so the gradient is now fully `linear-gradient(135deg,var(--warm-lt),var(--warm))` —
  byte-identical, the button is fully palette-driven. `docs/design-guide.md` updated to match (token list,
  component entry, and follow-up #2).

---

## 2026-06-20 00:35 - Designer - homepage-design-baseline

Action:
Started

Task:
Designer: Establish the homepage design baseline and fix obvious visual inconsistencies

Files claimed:

- `index.html` — inline `<style>` only (the `:root` token block + the `.btn-sand` rule; read-only on the rest)
- `docs/design-guide.md`
- `docs/logs.md`
- `docs/taskboard.md` (this task's status only)

Files changed:

- (START — none yet; see the FINISH entry)

Summary:
Claimed the Designer baseline task ([TODO] → [IN PROGRESS]). Read `index.html` in full. Plan: document the
real design system (the 10 `:root` color tokens with a used/unused audit, the Cormorant Garamond / Mulish
type scale per element + breakpoint, the spacing/rhythm scale, and the canonical `.btn-sand` / `.style-card`
/ nav / section-scaffold components) into `docs/design-guide.md`, replacing its "to document" placeholders.
Then apply only clearly-safe consistency fixes and write anything larger up as proposed follow-ups.

Pre-edit audit (evidence from the full read): `--sand`, `--surf`, `--aqua-d`, `--warm` are all defined but
never referenced via `var()`; `.btn-sand` hardcodes `#e4cfa6`, which is exactly `--warm`. Body copy uses
`rgba(240,248,250,.8/.78)` — a different base white than `--foam` (`#ecf4f3`).

Testing:
None yet (START).

Risks / Notes:

- The Efficiency font task may also read page `<head>`s. This session edits only `index.html`'s inline
  `<style>` (the `:root` `--warm` comment + the `.btn-sand` gradient) — **no** font `<link>`/`@font-face`
  changes, so no collision with Efficiency's scope.
- Not touching: payment/Stripe/Supabase/auth (incl. the auth-cta script), vendor files, `Animations/`
  internals, the `#styles` "Preview coming soon" cards 02–05, and every other page. No large redesign.

---

## 2026-06-20 00:02 - Manager - assign-tasks-per-role

Action:
Planned

Task:
Create one task per role (Manager, Designer, Efficiency, Security)

Files claimed:

- docs/taskboard.md
- docs/logs.md

Files changed:

- docs/taskboard.md — added an "Active tasks (new role system)" section with four `[TODO]` tasks in the
  `CLAUDE.md` format, one per role. Legacy task bodies below are unchanged.
- docs/logs.md — this entry.

Summary:
Gave every role a concrete, grounded first task:
- **Manager** — Triage the three role logs and drive the laptop-teardown `[REVIEW]` cluster to closure
  (via Task A live-verify + Task B closeout). Risk Low.
- **Designer** — Establish the homepage design baseline: document the real tokens (color / type scale /
  spacing / components) into `docs/design-guide.md`, then apply only clearly-safe consistency fixes. Risk
  Medium.
- **Efficiency** — Finish the site-wide no-CDN web fonts on the 6 remaining pages (dashboard, login,
  payment, onboarding, success, cancel), reusing `/fonts`. Absorbs legacy Task E. Risk Medium.
- **Security** — Run a read-only site-wide audit pass and populate `docs/security-log.md` with
  evidence-backed findings; propose fixes as tasks, change no code. Risk Low.

Testing:
Docs-only. Verified each task carries all required fields (Assigned Role, Owner, Risk, Goal, Why, Files,
Do not touch, Steps, Completion checklist, Review requirements, Notes) and a new role owner. No website
code touched.

Risks / Notes:

- The Designer and Efficiency tasks both may read page `<head>`s — each must claim files in a START log
  entry first to avoid a collision.
- The Efficiency task supersedes the legacy **Task E** further down the board (single source of truth =
  the new-format task). Legacy Task E left in place as history.
- Security task is read-only on code → safe to run first / in parallel with the others.
- Suggested order to run: **Security** (read-only, no collision) and **Efficiency** (Task E) first;
  **Designer** baseline next; **Manager** triages results and runs Task A/B once a GUI session is available.

---

## 2026-06-19 23:46 - Manager - role-system-redesign

Action:
Planned

Task:
Replace the Manager/Worker/Reviewer workflow with the Manager/Designer/Efficiency/Security role system

Files claimed:

- CLAUDE.md
- docs/taskboard.md
- docs/logs.md
- docs/design-guide.md (new)
- docs/performance-log.md (new)
- docs/security-log.md (new)

Files changed:

- CLAUDE.md — replaced the working-rules/role section with the new four-role system; preserved the
  architecture + critical-constraints content as a "Project Reference" section.
- docs/taskboard.md — new role-system header + pointer to the `CLAUDE.md` status labels/format; added a
  "Role-system migration" banner that reassigns every open task to a new role; removed the obsolete
  reviewer-sourced template. Legacy task bodies kept as history.
- docs/design-guide.md — **created** (Designer log): design direction, AI-patterns-to-avoid, typography/
  spacing/color/component notes, entry format, and one migrated decision (laptop-teardown AI cleanup).
- docs/performance-log.md — **created** (Efficiency log): entry format + migrated findings (homepage loads
  no Three.js = baseline; Google Fonts CDN still on 7 pages = Task E).
- docs/security-log.md — **created** (Security log): entry format + migrated findings (teardown audit
  baseline clean; inline-scripts/no-CSP hardening note; third-party font CDN).
- docs/logs.md — this entry (logs are now newest-first).

Summary:
Redesigned the multi-session workflow. **New roles: Manager, Designer, Efficiency, Security.** Manager
organizes; Designer owns visual design/UX/copy; Efficiency owns performance/loading/code weight; Security
audits and fixes safety issues. **How tasks are assigned now:** specialists log findings to their own role
log (design-guide / performance-log / security-log); the Manager reads those logs, groups/prioritizes, and
cuts specific, role-tagged tasks into `docs/taskboard.md` using the `CLAUDE.md` task format (assigned role,
risk, goal, why, files, do-not-touch, steps, checklist, review requirements). Roles claim one task, mark it
[IN PROGRESS] with a START log entry, and never edit another role's claimed files. Workflow/docs only this
session — no website code, CSS, JS, animation, vendor, payment, Stripe, Supabase, or auth touched.

Testing:
Docs-only change. Verified `CLAUDE.md` header structure (role sections + preserved architecture reference);
confirmed the three new role logs exist; confirmed the taskboard migration banner reassigns each open task
(Tasks A/B/C/E, the two teardown [REVIEW] tasks, the 3D-model [REVIEW] task, the `Animations/` backlog) to a
new role, with Task D left [DONE].

Risks / Notes:

- **`CLAUDE.md` is gitignored** (`.gitignore:9`) — the role system is live on disk for local sessions but
  will not commit / won't survive a fresh clone. Flagged previously; say the word to track it (un-ignore or
  mirror into a tracked `docs/ROLES.md`).
- **`docs/reviewer-log.md` is deprecated** (empty, superseded). Left in place as history, noted in the
  migration banner; not deleted.
- **Logs ordering switched to newest-first** as of this entry; older entries below remain oldest-first.
- Concurrent sessions have been active (Tasks C/D/E + the 3D-model redesign). I edited only docs + CLAUDE.md,
  so there should be no collision with their code edits.
- **Next:** run **Security** (quick site-wide audit pass → seed `docs/security-log.md`) or **Efficiency**
  (pick up Task E to finish the no-CDN font policy). Designer can take Task A (live-verify) once a GUI/browser
  session is available. Manager should then triage the new role-log findings into formatted tasks.

---

## 2026-06-18 — Manager — Inspect project & write "Laptop Teardown in Styles tab" task

**Role:** Manager (inspection + task authoring only; no website code edited).

### Files / areas inspected
- `docs/TASKBOARD.md`, `docs/CHANGELOG.md` — both were **empty**. (No `docs/logs.md` existed; created it
  with this entry. `CHANGELOG.md` left untouched.)
- Root HTML pages: `index.html`, `dashboard.html`, `dashboard-style.html`, `login.html`,
  `onboarding.html`, `payment.html`, `success.html`, `cancel.html`.
- `index.html` `#styles` section (markup ~283–325; inline CSS ~144–282) and its page scripts.
- `Animations/laptop-teardown/` — `index.html`, `README.txt`, `script.js`, `style.css`, and the full
  `vendor/` tree (three.module.js ≈1.2 MB, gsap.min.js, ScrollTrigger.min.js, `jsm/…`, `fonts.css`,
  `fonts/*.woff2`).
- `vercel.json` (routing) and `.gitignore`.
- Git: `git show --stat HEAD` and `git ls-files Animations`.

### Where the "Styles tab" is
There is no separate tab page — it's the **`#styles` section on the homepage `index.html`** ("Styles" —
a curated gallery of the kinds of sites WebSharke builds), a `.style-grid` of `.style-card`s.

### Where the "dashboard preview" was
The standalone `dashboard-style.html` ("Sales Dashboard — static visual mockup, non-functional") was the
preview. It is now **orphaned** (nothing links to it) — consistent with its Styles-grid card having been
replaced by the teardown card.

### 🔴 Key finding (discrepancy with the request)
**The feature is already implemented and committed** — commit `772bed3 "wowowowowah"`. That commit:
- Added the whole `Animations/laptop-teardown/` tree (vendored, git-tracked).
- Rewrote the homepage Styles card `01` into a "3D Laptop Teardown" `<a href="/Animations/laptop-teardown">`.
- Also modified `dashboard-style.html`, `dashboard.html`, `payment.html`, `login.html`,
  `onboarding.html`, `api/checkout.js`, and **deleted** the old space-background assets
  (`css/space-bg.css`, `js/space-bg.js`, `js/planets.js`, `css/portal.css`) — those are unrelated to this
  task and were not reviewed in depth.

So I did **not** write a build-from-scratch task. I wrote a **VERIFY / AUDIT / HARDEN** task instead, so a
worker confirms the committed implementation is correct and production-safe rather than re-doing (and
risking regressing) working code.

### Task added to docs/TASKBOARD.md
"**Replace Styles Tab Dashboard Preview With Laptop Teardown Animation**" — with goal, why, verified file
list, implementation-requirement status, a first-pass security audit table, do-not-touch list, and a
completion checklist marking what's already done vs. what still needs live verification.

### Manager first-pass audit result (clean)
- No external CDN in the animation (three/gsap/fonts vendored; import map → `./vendor/`).
- No secrets, no `fetch`/`eval`, no `innerHTML` of dynamic data (`script.js:580` builds DOM via
  `textContent`). No absolute `C:\…` paths in production code.
- `file://` is handled with a clear message; root-absolute favicon avoids a `/favicon.ico` 404.
- Homepage does **not** load Three.js — card is a plain link; the ~1.6 MB payload loads only on the route.
- `serve.mjs` / `start-demo.bat` were removed → no path-traversal surface.

### Risks the worker should know
1. **Live routing is the main unknown.** Confirm a real Vercel preview serves `/Animations/laptop-teardown`
   (directory-index under `cleanUrls`) with no console errors — the one thing not provable from source.
2. **Capital `Animations/`** vs. the otherwise-lowercase asset folders. Internally consistent so it works,
   but consider lowercasing for convention/case-safety; if renamed, change the `href` **and** the
   `<base href>` together.
3. **Out of scope:** `index.html` ~line 31 still uses the **Google Fonts CDN**, which conflicts with the
   project's vendor-locally policy (see `[[cdn-blocked-vendor-locally]]`). Do not fix under this task —
   logged as a suggested follow-up task.
4. Decide whether to keep or remove the now-orphaned `dashboard-style.html` (low priority; flag, don't
   delete casually).
5. Still-open checklist items needing a human/worker: console-error check, mobile layout, and final
   audit sign-off.

---

## 2026-06-19 — Worker (Opus) — START: Verify / Audit / Harden the laptop-teardown task

**Role:** Worker. Claimed the task "Replace Styles Tab Dashboard Preview With Laptop Teardown
Animation" (was TODO / unassigned → now IN PROGRESS). This is a **verify/audit/harden** pass on the
already-committed implementation (commit `772bed3`), **not** a rebuild — per the task board I will not
re-copy the animation or rebuild the card, and will edit a code file only if a check actually fails.

**Claimed files:** `docs/TASKBOARD.md`, `docs/logs.md`. Read-only audit of `index.html` (#styles),
`Animations/laptop-teardown/**`, `vercel.json`.

**Plan for this session:** (1) confirm structure & no absolute paths / no CDN [done so far — clean];
(2) start a local static server from the project root and verify the `/Animations/laptop-teardown`
route + every vendored asset returns 200 with correct content-type; (3) syntax-check `script.js` as a
module; (4) re-confirm the homepage loads no Three.js; (5) sign off the security audit table or fix
what fails. Finish entry (with results) appended on completion.

---

## 2026-06-19 — Manager — Write "Remove AI Aspects From Laptop Teardown Feature" task

**Role:** Manager (inspection + task authoring only; no website code edited). Note: a Worker session is
concurrently handling the verify/audit task above — this new task is **separate** and should be picked up
after, to avoid two sessions editing the same animation/Styles-card files at once.

### Files inspected
- `docs/taskboard.md`, `docs/logs.md` (current state, to append).
- `index.html` — the `#styles` section / teardown card (lines ~288–294) and a term-grep across the page.
- `Animations/laptop-teardown/index.html` — all user-facing copy (title, intro, stage, outro, loader,
  error, button, noscript).
- `Animations/laptop-teardown/style.css` (full) — comment voice + effects (gradient `.btn`, glows,
  text-shadows, background gradient/vignette).
- `Animations/laptop-teardown/script.js` (header + CONFIG block) — comment tone.
- Grep for AI/hype terms (AI, generated, premium, revolutionary, cutting-edge, seamless, immersive,
  next-generation, masterpiece, placeholder, lorem, etc.) across the feature files.

### Where the feature lives
- **Card:** homepage `index.html`, the `#styles` grid, card `01` (lines ~288–294).
- **Animation page:** `Animations/laptop-teardown/` — copy in `index.html`, styling in `style.css`,
  comments in `script.js`.

### Task added
"**Remove AI Aspects From Laptop Teardown Feature**" — Risk: Medium. Includes goal/why, tone direction
with good/bad examples, the verified file list, a concrete findings table (exact strings/lines + why +
direction), a "Keep as-is" list, a **Traps** section, do-not-touch list, the 10 steps, and the completion
checklist. Status `[TODO]`; worker moves it to `[REVIEW]` on completion.

### What actually reads as AI / overhyped (the real targets)
- "PREMIUM" in the `style.css` and `script.js` header comments.
- Slogan/marketing copy: "Anatomy of a build", "Built like hardware. Shipped like software.",
  "Engineering shown as motion.", "engineered in layers — front to back, screen to silicon", and
  "The same care … goes into the websites we build for you."
- Generic "premium gradient + glow" `.btn` and large soft text-shadows — review against the main site.
- Cutesy comment voice ("Whisper-faint vignette", "Elegant, simple background").

### Risks the worker should know
1. **Do not blind find-replace.** Several term hits are false positives that must be preserved:
   - `index.html` "Premium Dark" / "Dark · Premium" = **unrelated style card 03** — leave it.
   - `script.js` "PLACEHOLDER GEOMETRY" = a real technical term (procedural meshes standing in for a
     GLTF model) — keep the meaning; not marketing placeholder text.
   - `index.html` "MARINE SNOW (generated once …)" = technical, unrelated — leave it.
2. **Keep useful notes:** the `file://` / http(s) message and the vendor-load error string prevent
   support issues; the `CONFIG` + "SWAPPING IN A REAL MODEL" comments are genuinely helpful.
3. **Don't strip legibility:** the subtle background gradient/vignette are whisper-faint and on-brand;
   some text-shadows exist to keep titles readable over the live 3D scene. Tone only what clashes.
4. **Scope discipline:** only the teardown card (01) is in scope on `index.html`; cards 02–05 and all
   vendor files are off-limits.
5. **Concurrency:** a verify/audit Worker is active on the same files — sequence this task after it (or
   coordinate) so the two sessions don't collide.
6. Copy is subjective — the task gives good/bad examples so the worker rewrites toward the intended tone
   rather than just deleting words.

---

## 2026-06-19 — Worker (Opus) — START: Remove AI Aspects From Laptop Teardown Feature

**Role:** Worker. Claimed "Remove AI Aspects From Laptop Teardown Feature" (was [TODO]/unassigned →
[IN PROGRESS]). Copy/tone + comment cleanup only — no behaviour changes, no re-copying the animation.

**Concurrency:** the verify/audit Worker that was active on these files has **finished** (its task is now
REVIEW — docs-only, no production code edited), so there is no longer a collision risk on the
animation / Styles-card files. Proceeding.

**Files claimed:** `index.html` (teardown card 01 only, ~288–294) · `Animations/laptop-teardown/`
{`index.html`, `style.css`, `script.js`, `README.txt`} · `docs/taskboard.md`, `docs/logs.md`.
**Not touching:** `vendor/*`, style cards 02–06, payment/Stripe/Supabase/auth, unrelated sections.

**Plan (follows the Manager's findings table + Traps):**
1. Card 01 — drop "Engineering shown as motion." + the over-explained list → one plain line; "View live
   demo" → "View demo". Keep the title "3D Laptop Teardown".
2. Animation page copy — `<title>`/`h1` "Anatomy of a Build" → "Interactive Laptop Teardown"; eyebrow
   "WebSharke · Engineering" → "WebSharke"; intro lede → one plain human line; outro h2 slogan +
   sales-fluff lede → simple/honest. **Keep** loader "Preparing teardown", error "Couldn't start the 3D
   experience.", caption, hint, CTA "Start a Project", meta description, noscript (Manager: keep).
3. Comments — "PREMIUM" headers (style.css + script.js line 2) → "Laptop teardown — …"; "Elegant" /
   "Whisper-faint" / "product reveal" → plain. **Keep** CONFIG / SWAP-IN / file:// notes + "PLACEHOLDER
   GEOMETRY".
4. `.btn` / text-shadows — light tone-down of the aqua glow only; keep legibility shadows over the 3D scene.
5. Grep sweep for hype terms in the feature files; confirm the animation still parses; finish entry → REVIEW.

---

## 2026-06-19 — Worker (Opus) — FINISH: Verify / Audit / Harden laptop-teardown → REVIEW

> Note: this finishes the **verify/audit** task. A separate session's "Remove AI Aspects" START entry was
> appended above mine while I was wrapping up — that's a different task; my pass was read-only on the same
> files (docs-only edits) so there was no collision.

**Role:** Worker. Outcome: **the committed implementation (commit `772bed3`) passed every check I could
run; nothing failed, so no production code was changed.** Task moved `IN PROGRESS → REVIEW`.

### Files changed (this session)
- `docs/TASKBOARD.md` — status → REVIEW; marked the absolute-path requirement DONE; completed the checklist
  (honest `[~]` on the in-browser-render item); signed off two "Verify" cells in the audit table.
- `docs/logs.md` — START entry + this FINISH entry.
- **No website/animation/config code edited** — every check passed, so there was nothing to harden, and
  the board forbids rebuilding working committed code.

### What I verified (and how)
**Structure / paths**
- Animation lives at `Animations/laptop-teardown/` (git-tracked); `find` shows **no** loose files in
  `Animations/` and **no** `serve.mjs`/`start-demo.bat` (no local-server/path-traversal surface).
- Repo-wide grep for `C:\Users` / `C:/Users` / `file://`: matches **only** in `docs/**` and the intentional
  `file://`-guard strings (animation `index.html`/`README.txt`) + one three.js comment → **no absolute
  Windows path in production code.**
- Vendored libs are real, not stubs: `three.module.js` 1,272,972 B · `gsap.min.js` 72,214 B ·
  `ScrollTrigger.min.js` 43,380 B · `jsm/RoomEnvironment.js` + `jsm/RoundedBoxGeometry.js` present ·
  9 `*.woff2` fonts with valid `wOF2` magic bytes.

**No external CDN**
- Grep of `Animations/**` for `http(s)`/cdn/googleapis/unpkg/jsdelivr/cdnjs/esm.sh/skypack → **only
  license-header comments inside the libs**, no live asset requests. Three.js via import map → `./vendor/`;
  GSAP/ScrollTrigger local `<script>`; fonts via local `vendor/fonts.css` → `./fonts/*`.

**Live route + asset load (local `python -m http.server` from project root)**
- `/Animations/laptop-teardown` → **301 → `/…/` → 200 `text/html`** (resolves to the folder index.html).
- **All** assets 200 with correct MIME: `style.css`→`text/css`; `script.js` + all `vendor/*.js`→
  `text/javascript` (required for ES modules); `fonts.css`→`text/css`; `*.woff2`→`font/woff2`; favicon
  `/images/Tab-Logo.png`→`image/png`; homepage `/`→200. `vendor/jsm/loaders/GLTFLoader.js`→404 **as
  expected** (only referenced in a *comment* as a future upgrade path — not imported).
- `script.js` passes `node --check` as an ES module; the import map is valid JSON with correct mappings.

**Performance / homepage stays light**
- Grep of `index.html` for `three|gsap|scrolltrigger|type="module"|importmap` → only a CSS **comment**
  ("three plain text columns"). Homepage loads **no** Three.js; card is a plain `<a>`; the ~1.6 MB payload
  loads **only** on the animation route.

**Robustness / a11y / mobile (code-verified)**
- Guards: `file://` detection, `error`/`unhandledrejection` capture, 6 s load fallback, WebGL `try/catch`
  into the loader error state, `<noscript>` on both pages.
- Safe DOM: `script.js` builds the side index via `textContent`/`createElement` (no `innerHTML` of dynamic
  data); homepage `innerHTML` is decorative snow/fish from static constants (no user input).
- Responsive (CSS inspected): homepage grid 3→2 (≤900px)→1 (≤680px); animation hides `.side-index` ≤820px,
  repositions caption ≤600px; `isMobile` cuts keycaps + disables shadows/parallax; both honor
  `prefers-reduced-motion`.

### Security audit summary — SIGNED OFF (clean)
No external CDN · no secrets/keys/`fetch`/`eval` · no unsafe `innerHTML` of dynamic data · no absolute
Windows paths in prod · `file://` handled · card is a same-tab `<a>` (no iframe; no `target="_blank"` →
no missing `rel`) · no `serve.mjs`/`start-demo.bat` (no traversal surface) · homepage ships no heavy JS.
Pre-existing, by-convention (NOT regressions, not fixed here): inline scripts + no CSP across the site.

**Security issues found:** none requiring a fix. **Fixed:** none (nothing failed).

### Remaining risks / for the reviewer
1. **In-browser WebGL render** — not executable in a non-GUI session. Everything that *gates* the load
   passes; recommend a ~60 s eyeball on a Vercel preview: open `/Animations/laptop-teardown`, scroll the
   pinned stage, confirm a clean console. (Checklist item left `[~]`.)
2. **Vercel directory-index** — confirmed locally; standard Vercel behavior + `<base href>` make it
   expected to work, but only a real deploy fully proves it.
3. **Capital `Animations/`** vs. lowercase asset folders — works and is internally consistent;
   **deliberately NOT renamed** (regression risk on a case-insensitive Windows FS; directive is "fix only
   what fails"). Flagged convention item.
4. **`dashboard-style.html`** — confirmed orphaned (referenced only in `docs/**`). Flagged, **not deleted**.
5. **Out of scope, untouched:** homepage Google-Fonts CDN (`index.html` ~line 31) — see
   `[[cdn-blocked-vendor-locally]]`; covered by the Manager's suggested follow-up.

### Suggested next task
"Remove AI Aspects From Laptop Teardown Feature" is already being handled by a concurrent session. After
that, vendor the homepage Google Fonts locally (no-CDN policy).

---

## 2026-06-19 — Worker (Opus) — FINISH: Remove AI Aspects From Laptop Teardown Feature

**Role:** Worker. Task → **[REVIEW]**. Copy/tone + comment cleanup only; **no behaviour changes**, no files
re-copied, no vendor edits. (The concurrent verify/audit session finished docs-only before these edits, so
no collision occurred.)

### Files changed (6)
- `index.html` — teardown **card 01 only** (desc + foot). Cards 02–06 untouched.
- `Animations/laptop-teardown/index.html` — `<title>`, intro eyebrow / `h1` / lede, outro `h2` / lede.
- `Animations/laptop-teardown/style.css` — header comment, 2 comment phrasings, `.btn` shadow tone-down.
- `Animations/laptop-teardown/script.js` — 4 comment edits (header + 3 adjectives). No code.
- `Animations/laptop-teardown/README.txt` — 1 phrasing.
- `docs/taskboard.md`, `docs/logs.md` — task claimed + this entry.

### AI-like copy removed
- Card 01: slogan "Engineering shown as motion." + over-explained part list →
  "A scroll-based 3D build study — a laptop coming apart, layer by layer."; "View **live** demo" → "View demo".
- Anim page: `<title>`/`h1` "Anatomy of a Build" → "Interactive Laptop Teardown"; eyebrow
  "WebSharke · Engineering" → "WebSharke"; intro lede "engineered in layers — front to back, screen to
  silicon…" → "A scroll-based 3D build study. Keep scrolling to take the laptop apart, one layer at a
  time."; outro slogan "Built like hardware. / Shipped like software." → "Like the way this is built?";
  outro sales-fluff lede → "We put the same care into the websites we build."

### AI-like comments / styling removed
- "PREMIUM LAPTOP TEARDOWN" headers (`style.css` + `script.js`) → "Laptop teardown — …".
- "Elegant, simple background" → "Simple background"; "Whisper-faint vignette" → "Subtle vignette";
  `script.js` "the whole experience" → "the teardown", "whisper-faint accent" → "faint accent", "elegant
  CSS background" → "CSS background"; README `dark "product reveal" styling` → "dark teardown styling".
- `.btn`: reduced the aqua "premium glow" (0.22/0.32 → 0.16/0.24, smaller spread) + added the inset
  highlight the homepage `.btn-sand` uses → matches the main site button instead of a generic glow.

### Kept on purpose (Manager "keep" list + Traps)
Error "Couldn't start the 3D experience." / "Please refresh…"; loader "Preparing teardown"; caption
"01 / Assembled"; hint "Scroll to disassemble"; CTA "Start a Project"; meta description; noscript.
`PLACEHOLDER GEOMETRY`, the `CONFIG` + "SWAPPING IN A REAL MODEL" notes, the `file://` guard message, and
the vendor-load error string — left intact. Card 03 "Premium Dark" and the homepage "MARINE SNOW
(generated…)" comment left untouched (unrelated).

### Tested
- Hype-term sweep across the 4 custom feature files → **clean** (only legitimate `PLACEHOLDER GEOMETRY`).
- `script.js` ESM syntax **OK** (checked as a module); both `index.html` files parse; `style.css` braces
  balanced (57/57).
- All 10 JS-referenced DOM hooks (`#loader`, `#webgl`, `#stage`, `#stage-title`, `#index`, `#cap-num`,
  `#cap-name`, `#hint`, `#bar`, `#err-detail`) still present → animation logic intact.
- Homepage loads **no** Three.js / `type=module` (perf intact); card still a same-tab
  `<a href="/Animations/laptop-teardown">` (no `target=_blank`). **No vendor files changed.**

### Remaining risks / for the reviewer
1. **In-browser WebGL + scroll** not run in a non-GUI session (same limitation the verify pass noted). All
   changes are textual/comment + 2 shadow values and cannot affect WebGL or scroll behaviour; a ~30 s
   eyeball on a Vercel preview is still worth it.
2. Copy is subjective — rewrites follow the task's tone examples; the reviewer may want to fine-tune voice
   (e.g. the outro headline "Like the way this is built?").

---

## 2026-06-19 — Manager — Block request moot (task already done); queued next tasks (A–D + backlog)

**Role:** Manager (docs only).

### Block request
The instruction to hold "Remove AI Aspects From Laptop Teardown Feature" as `[BLOCKED — waiting on audit]`
**arrived after the task was already complete.** A Worker had finished it → `[REVIEW]` (copy/comment
cleanup, no vendor edits), and the verify/audit task is **also** `[REVIEW]` (no code changes). So "waiting
on audit" is satisfied on both fronts.
- **Decision:** did **not** revert it to BLOCKED — that would undo finished work and contradict the board.
  Left it in `[REVIEW]`; it can be bounced to `[TODO]`/`[BLOCKED]` only if the review wants rework.

### Concurrency outcome
The collision risk I flagged did happen in *timing* (both sessions ran on the same files) but caused **no
conflict**: the verify/audit pass was read-only on code (docs-only edits), so the cleanup worker's edits
stand clean. Lesson reinforced in the new tasks: claim files in a START entry; don't run two `index.html`
editors at once.

### State
Both original tasks are in `[REVIEW]`. Only open item across both = the in-browser WebGL/scroll eyeball on
a real preview (every load-gating check already passed in code).

### Tasks queued (all `[TODO]`)
- **A — Live-verify on a real preview** [High] — the outstanding GUI-only item; closes the loop for A+B.
- **B — Review & close out the two `[REVIEW]` tasks** [High] — diff/scope/Traps check + tone call →
  move both to `[DONE]` or bounce.
- **C — Vendor homepage Google Fonts locally** [Medium] — homepage still uses `fonts.googleapis.com`;
  reuse the woff2 already vendored under the animation. (`[[cdn-blocked-vendor-locally]]`.)
- **D — Resolve orphaned `dashboard-style.html`** [Low] — confirmed unreferenced; keep-or-remove
  (confirm before delete).
- **Backlog (optional)** — lowercase `Animations/` → `animations/` for case-safety.

### Sequencing
A = read-only/ops · B = docs-only · C edits `index.html` · D edits only `dashboard-style.html` · backlog
rename edits `index.html`. → **C and the rename must not run concurrently.**

---

## 2026-06-19 — Worker (Opus) — START: Task C — Vendor the homepage Google Fonts locally

**Role:** Worker. Claimed **Task C** ([TODO]/unassigned → [IN PROGRESS]). Replace the homepage Google
Fonts CDN `<link>` with locally-vendored `@font-face`, matching the project's vendor-locally policy
(`[[cdn-blocked-vendor-locally]]` — the user's browser blocks CDNs, so today's homepage type likely
isn't even loading for them).

**Files claimed:** `index.html` (the `<link …googleapis…>` + 2 `preconnect`s near line 29–31, and the
inline `<style>`), a new top-level `fonts/` folder (woff2 **copies** only). Docs: `taskboard.md`,
`logs.md`, `CHANGELOG.md`. **Not touching** the animation's vendored fonts (read-only source), any other
page, payment/Stripe/Supabase/auth, or style cards 02–06.

**Audit done before editing — exact font usage on `index.html` (every `font-family`/`font-weight`/
`font-style` + a bold/`<strong>`/`<b>`/heading sweep):**
- **Mulish** — 400, 500, 600 only (body default 400; `.signin`/`.btn` 500; `.sc-kicker`/`.sc-go`/
  `.sc-soon` 600; `.how-body p`/`.why-col p`/`.sc-desc`/`#site-footer` 400). **No 300, no 700.**
- **Cormorant Garamond** — normal **600** (`.sec-title`, `.hero-title`, `.why-col h3`, `.sc-index`,
  `.sc-title`) and **italic 500** (`.hero-eyebrow`, `.hero-title em`, `.how-close`). **No 400/700 normal,
  no 400i/600i.** All `<h1>`–`<h3>` are explicitly CG-600 (no UA-default-bold leaking in); no `<strong>`/
  `<b>`/`bold`/700 anywhere.
- → The CDN URL **over-requests** (CG 0,400;500;600;700 / 1,400;500;600 and Mulish 300;400;500;600;700),
  but the page only ever renders **5 faces**: CG-600, CG-500i, Mulish-400/500/600 — **all already vendored**
  under `Animations/laptop-teardown/vendor/fonts/`. Per the task's own wording ("download only any weight
  the vendored set lacks **if the homepage uses it**"), **nothing needs downloading**; I copy the 5 used
  files into `fonts/` and define exactly those 5 `@font-face`s. Unused requested weights are intentionally
  omitted (they never render → identical output, less dead weight).

**Plan:** (1) `fonts/` ← copy the 5 used woff2; (2) `index.html`: delete the 2 `preconnect`s + the CDN
`<link>`, add 5 inline `@font-face` rules (`font-display:swap`, `src:url(fonts/…)`); (3) verify no
`googleapis`/`gstatic` remains + the 5 woff2 are valid (`wOF2` magic); (4) FINISH log + CHANGELOG +
Task C → [REVIEW]. **Out-of-scope finding to file:** the **other 7 pages** also load the same CDN
(`dashboard`, `login`, `payment`, `onboarding`, `success`, `cancel`, `dashboard-style`) — will add a
follow-up task, not fix here.

---

## 2026-06-19 — Worker (Opus) — FINISH: Task C — Vendor the homepage Google Fonts locally → REVIEW

**Role:** Worker. **Task C → [REVIEW].** The homepage no longer depends on the Google Fonts CDN; the 5
faces it renders are served from a local `/fonts` folder. No visual change intended; no payment/auth/other
pages touched.

### Files changed
- **`index.html`** — removed the Google Fonts `<link>` + both `preconnect`s (old lines 29–31); added 5
  inline `@font-face` rules at the top of the existing `<style>` (`font-display:swap`, `src:url(fonts/…)`).
  Net **+9 / −3**. The bg-image preload `<link>` and the rest of `<head>` are untouched.
- **`fonts/` (new)** — 5 woff2 **copied** from `Animations/laptop-teardown/vendor/fonts/` (originals
  untouched): `cormorantgaramond-600.woff2`, `cormorantgaramond-500i.woff2`, `mulish-400.woff2`,
  `mulish-500.woff2`, `mulish-600.woff2`.
- **`docs/CHANGELOG.md`** — created (was 0 bytes) + first entry.
- **`docs/taskboard.md`** — Task C → [REVIEW] + checklist filled; filed follow-up **Task E**.
- **`docs/logs.md`** — START + this FINISH.

### Why only 5 faces (the CDN URL listed 12)
Audited every `font-family`/`font-weight`/`font-style` on the page plus a `<strong>`/`<b>`/`bold`/heading
sweep. The page only ever renders **Cormorant Garamond 600 + 500-italic** and **Mulish 400/500/600** (all
`<h1>`–`<h3>` are explicitly CG-600, so no UA-default-bold leaks in; no `<strong>`/`<b>`/`bold`/700/300
anywhere). The old URL over-requested CG 400/500/700-normal, CG 400i/600i, and Mulish 300/700 — none are
used, so omitting them is byte-for-byte identical output with no dead weight, and meant **zero downloads**
(all 5 used faces were already vendored under the animation; the 3 weights the vendored set lacks —
CG-700/400i/600i — aren't used by the homepage anyway).

### Verified
- Grep of `index.html` for `googleapis|gstatic|preconnect|fonts.google` → **zero**. With no CDN URL left,
  no such Network request can be made.
- All 5 `/fonts/*.woff2` have valid `wOF2` magic bytes; sizes match their source copies.
- `@font-face` family names (`'Cormorant Garamond'`, `'Mulish'`) match the CSS `font-family` declarations
  exactly.
- `git status`: only `index.html`, the new `fonts/`, and docs changed — no other production files.

### Remaining for reviewer
1. **~30 s eyeball** on a preview: homepage type renders identically and DevTools→Network shows the 5 local
   woff2 (200) and **no** `googleapis`/`gstatic` request. (Provable from source — no CDN URL remains — but
   not visually rendered in a non-GUI session, so checklist item left `[~]`.)
2. **Optional perf:** could add `<link rel="preload" as="font" crossorigin>` for the 2–3 above-the-fold
   faces (hero = CG-600, CG-500i, Mulish-500) to offset losing `preconnect`. Left out to keep scope tight;
   `font-display:swap` already prevents invisible text.

### Out-of-scope finding filed → Task E
The **other 7 pages** still load the same Google Fonts CDN (grep-confirmed): `dashboard`, `login`,
`payment`, `onboarding`, `success`, `cancel`, `dashboard-style`. Not fixed here (Task C is homepage-only)
— added as **Task E**. ⚠️ Those pages need a **per-page weight audit**; some may use faces the homepage
doesn't (e.g. Mulish-700 bold, CG italic 400/600) that are **not** in `/fonts` yet and that the animation's
vendored set also lacks → may require downloading a few woff2.

### Suggested next task
**Task E** (finish the no-CDN font policy on the remaining 7 pages — same pattern, reuses `/fonts`). Or
**Task A** (the GUI-only live-verify of the laptop teardown) if a browser session is available, which then
unblocks **Task B**.

---

## 2026-06-19 — Manager — Add Reviewer role + reviewer-log system (workflow/docs only)

**Role:** Manager (workflow/documentation only — **no** website code, CSS, JS, animation, vendor, payment,
Stripe, Supabase, or auth files touched).

### Files changed
- **`CLAUDE.md`** — restructured **# Claude Working Rules** to name **three roles** (Manager / Worker /
  Reviewer) and separate them clearly; fixed the stale pre-work reading list to point at the docs that
  actually exist (`taskboard.md`, `logs.md`, `reviewer-log.md`, `CHANGELOG.md` — the old list referenced
  `PROJECT_STATE.md` / `TASK_BOARD.md` / `DECISIONS.md`, which don't exist); added three sections:
  **Reviewer Role**, **Manager Responsibility For Reviewer Log**, **Worker Relationship To Reviewer Log**.
- **`docs/reviewer-log.md`** — **created.** Customer-style UX feedback log: purpose, the Status set
  (`[NEW]`→`[TRIAGED]`→`[ACCEPTED]`→`[CONVERTED]` / `[DUPLICATE]` / `[REJECTED]` / `[NEEDS RECHECK]` /
  `[RESOLVED]`), the Severity scale (Low/Medium/High/Critical), the required per-finding **Finding format**
  template, and an empty **Findings** section seeded to start at `REVIEW-0001`.
- **`docs/taskboard.md`** — added a **Task format (reviewer-sourced)** template near the top (carries a
  `Source: Reviewer Log REVIEW-####` line) so Manager-created tasks trace back to a reviewer finding; added
  a board-intro pointer to it. Existing tasks untouched.
- **`docs/logs.md`** — this entry.

### Reviewer role added
The Reviewer behaves like a **real customer**, not a developer: tests the live experience (first
impression, visual design, mobile layout, buttons/links/tabs/forms, animations, copy, loading/error
states, trust/professional feel, and anything that looks AI-generated, generic, broken, confusing, slow,
or unfinished) and **writes findings only** — it does not code. The Reviewer may edit just
`docs/reviewer-log.md` + `docs/logs.md`; production code, CSS, JS, animation, vendor, payment, Stripe,
Supabase, and auth are all off-limits. Findings must use the required format and avoid vague asks like
"make design better."

### `docs/reviewer-log.md` created
Single home for that feedback. Each finding gets a sequential `REVIEW-####` ID, a Severity, a
**Manager Status**, and the structured fields (User Experience / Issue / Why It Matters / Steps /
Expected / Actual / Suggested Fix). Currently empty — awaiting the first Reviewer session.

### How Managers triage reviewer feedback
The **Manager owns `docs/reviewer-log.md`.** Regularly review new `[NEW]` findings and set each one's
**Manager Status**: accepted task / rejected / duplicate / needs more testing / low-priority note /
already fixed. For accepted findings, **convert** them into clean tasks on `docs/taskboard.md` using the
new **Task format (reviewer-sourced)** (cite the `REVIEW-####` ID in **Source**), then set the finding to
`[CONVERTED]` and record the task title under **Converted Task**. Do **not** blindly copy complaints into
the board — clean them up, group duplicates, prioritize, and make them actionable for Workers.

### How Workers reference reviewer issues
Workers don't manage the reviewer log (read-only, for context) and only work tasks the Manager has placed
on `docs/taskboard.md`. When a task originated from a reviewer finding, the **Worker cites the reviewer
issue ID (`REVIEW-####`) in its `docs/logs.md` entry** — closing the loop finding → task → fix.

### Suggested next task
Run a **Reviewer session** against the live site (start with the homepage and the laptop-teardown route on
mobile) and file the first findings as `REVIEW-0001+`; the Manager then triages them into Worker tasks.

---

## 2026-06-19 — Worker (Opus) — START: Redesign Laptop Teardown 3D Model

**Role:** Worker. Created + claimed "Redesign Laptop Teardown 3D Model" (new task → [IN PROGRESS]). Goal:
make the assembled laptop read as a thin, premium, **unbranded** ultrabook; thin/aligned internals; no
clipping/phasing in the assembled OR exploded state; premium aluminium materials — without breaking the
scroll teardown framework or touching vendor files.

**Files claimed:** `Animations/laptop-teardown/script.js` (procedural model: builders, `ASSEMBLED{}`
layout, `CONFIG` materials/spacing) · `Animations/laptop-teardown/style.css` (only if framing needs a
nudge) · `docs/taskboard.md`, `docs/logs.md`. **Not** touching `vendor/*`, the homepage style cards,
payment/Stripe/Supabase/auth, or unrelated sections.

**Concurrency:** the two earlier teardown tasks are both [REVIEW] (no active editor on these files) and
Tasks A–E are unassigned or homepage-scoped (Task C/E touch fonts/`index.html`, not `script.js`), so no
session currently holds `script.js`. Proceeding. Flagged on the board that this redesign **supersedes the
model** those REVIEW tasks examined → Task A (live WebGL/scroll eyeball) should re-run against the new
model.

**Findings from inspecting the current model (the targets):**
- **Branding:** `buildBackCover()` adds a metal logo disc on the lid → violates "unbranded / no Apple
  logo". Remove it.
- **Too thick:** the assembled base stack spans Y ≈ −0.06 → 0.34 over a 3.2-wide body (ratio ~0.125 — an
  ultrabook is ~0.04–0.05). ~2.5× too chunky.
- **Clipping:** motherboard chips reach Y ≈ 0.26 into the keyboard deck (0.21–0.31); cooling-fan top
  (0.23) clips the deck underside (0.21). Internals intersect the deck.

**Plan:** (1) ✅ confirmed `RoundedBoxGeometry` clamps `radius` to the shortest half-dim (vendor file
line 49) → thin parts are safe. (2) refine `CONFIG.col` + materials toward anodised aluminium / dark
glass / muted board. (3) rewrite the 13 builders thinner + drop the lid logo. (4) recompute `ASSEMBLED{}`
for a slim base: bottom-shell floor top ≈ 0.045, a clean internal cavity 0.045–0.155, deck plate
0.155–0.205, keys just proud, trackpad inset — no part crosses the deck underside. (5) retune exploded
`layer`/`spacing` so thin layers stay separated. (6) `node --check` + local static-serve load check.
(7) FINISH entry → [REVIEW].

---

## 2026-06-19 — Worker (Opus) — FINISH: Redesign Laptop Teardown 3D Model → REVIEW

**Role:** Worker. Task → **[REVIEW]**. Redesigned the procedural laptop into a thin, unbranded aluminium
ultrabook. **Only** `Animations/laptop-teardown/script.js` was edited for the model — `style.css` needed
no change, and no vendor / homepage / cards / payment / auth files were touched.

### Files changed
- `Animations/laptop-teardown/script.js` — materials (`CONFIG.col` + `buildMaterials`), all 13 component
  builders, and the `ASSEMBLED{}` transform table. All 13 part **names** unchanged → the scroll timeline
  (which references them by name) is untouched.
- `docs/taskboard.md` — status → [REVIEW] + checklist filled.
- `docs/logs.md` — START + this FINISH.

### 3D redesign — what changed
**Unbranded:** removed the lid logo disc (was a `CircleGeometry` / `M.metal` mark in `buildBackCover`); the
back cover is now a blank anodised panel. Grep confirms no `CircleGeometry` / `logo` geometry remains.

**Thinner everything (real ultrabook silhouette):** the assembled base stack went from y ≈ −0.06 → 0.34
(ratio ~0.125 over the 3.2-wide body — chunky) to **−0.03 → 0.22** at the deck top (keys to ~0.25 → ratio
~0.078). Per part: lid 0.09→0.05 thick; screen bezel slimmed + glass near edge-to-edge; deck plate
0.10→0.05; keycaps 0.05→0.025 (low-profile); trackpad enlarged 1.06→1.20 wide and thinned 0.03→0.02;
battery cells 0.10→0.05 (thin/flat/wide); logic board 2.70×0.78×0.05 → 1.70×0.62×0.03 with low chips;
CPU/GPU spreaders lowered; cooling fan Ø1.04→Ø0.64 and 0.12→0.05 thick with a thin 0.028 heat-pipe;
speakers → slim 0.24-wide bars; ports thinned; bottom shell turned from a 0.12 slab into a slim **unibody
tray** (0.06 floor + 0.14 perimeter rim walls + feet) so the slim side profile reads solid.

**Clipping / phasing fixed (the old model intersected itself):**
- *Old:* motherboard chips reached y≈0.26 **into** the keyboard deck (0.21–0.31); the cooling-fan top
  (0.23) clipped the deck underside (0.21).
- *New:* one clean internal cavity (floor-top **0.03** → deck-underside **0.17**); every internal part is
  thinned + placed to top-out below 0.17 (tallest internals: CPU/GPU lid ≈0.15, heat-pipe ≈0.16). The deck
  plate caps 0.17→0.22; keys/trackpad rest just proud (no intersection). Footprints are **zoned** so no two
  internals overlap: battery centre-front · speakers front-sides · board centre-back · fan back-right ·
  ports back-left · screws in the corners — all inside the rim walls (x≤±1.54, z≤±1.0 vs rim inner
  ±1.55/±1.02). The lid was lifted so it hinges from the **back of the deck** (bottom ≈0.21) instead of
  passing down through it.
- *Exploded view:* `layer`/`spacing` (0.52) left as-is, but since parts are now much thinner the layers
  read with more air. Traced every adjacent pair → **min gap ≈0.14** (keys↔deck), others 0.2–0.6, so thin
  layers don't merge. Each part still recenters to x0/z0 and lies flat (rot 0).

**Materials (premium, restrained):** shell → space-grey aluminium `0x4a4e55` (metalness 0.95 / roughness
0.35); deck a touch darker; screen bezel now dark (`M.key`) for a black-bezel look; glass near-black
`0x0a0c11`; board muted deep teal-green `0x163a31` (not neon); brushed `M.metal` + desaturated copper kept.
No neon, no glow parts.

**Performance:** geometry stayed light — kept InstancedMesh for keys/screws/fan-blades, lowered some
segment counts (fan 44→40, screws 18→16), trimmed board chips; net add is ~8 small tray/rim/foot boxes. No
new libraries, no textures, no model downloads.

### Tested
- `node --check` on `script.js` (as an ES module) → **OK**.
- All 13 `explode('…')` timeline calls map 1:1 to `ASSEMBLED{}` keys (grep) → timeline intact.
- `CircleGeometry` / `logo` geometry → **gone** (grep; only "no logo" comments remain).
- Local static server (project root): `/Animations/laptop-teardown` **200 text/html**; `script.js` **200
  text/javascript** (ESM MIME) with the new code served; `style.css` 200; `vendor/three.module.js` 200.
- Only `script.js` + docs changed — **no vendor files touched.**

### Remaining risks / for the reviewer
1. **In-browser WebGL + scroll eyeball is the one thing a non-GUI session can't run.** The "thin/premium"
   look and the no-clip claims come from geometry math (cavity clearances + exploded-layer tracing), not a
   rendered frame. **Re-run Task A** on this new model: confirm the assembled laptop looks thin / premium /
   unbranded, scrub the full teardown for any part passing through another, and check the console.
2. This redesign **supersedes** the model the two earlier teardown `[REVIEW]` tasks examined. Their copy /
   audit findings still stand (copy untouched), but the *visual* sign-off should be against this model.
3. `CONFIG` camera/spacing left as-is to avoid reframing risk; the lid is slightly taller (top ≈2.24 vs
   2.06). Expected to stay in frame (assembled framing had headroom) — worth a glance in Task A.

### Suggested next task
Re-run **Task A** (live WebGL/scroll verify) on the new model; then **Task B** can close out the teardown
review tasks.

---

## 2026-06-19 — Worker (Opus) — FINISH: Task D — Resolve orphaned `dashboard-style.html` → DONE

**Role:** Worker. Picked up **Task D** — the only board task that is non-GUI, unblocked, and not held by
another session: Task A/B need a real browser (live WebGL eyeball), Task C and the 3D-model redesign are
already `[REVIEW]`, and Task E depends on D. Task → **[DONE]**.

**What I found:** `dashboard-style.html` was **already removed and staged for deletion** by an earlier
session — `git status` shows `D dashboard-style.html` (gone from the working tree + index, still in HEAD so
recoverable). Task D step 3 requires user/Manager sign-off **before** removal is final, and that
confirmation had never been recorded — so I treated the staged deletion as *unratified* and got it
confirmed rather than rubber-stamping another session's unconfirmed delete.

**Verification (read-only):** repo-wide grep for `dashboard-style` → **every** match is inside `docs/**`;
**zero** inbound links, JS redirects, or `vercel.json` rewrites anywhere in production code. Confirmed
genuinely orphaned (it was the old "Sales Dashboard" mockup, replaced by the teardown card).

**Decision / action:** user **confirmed removal** (2026-06-19). Left the file staged-deleted — did **not**
restore it, did **not** `git commit` (no commit was requested). Recoverable via
`git checkout HEAD -- dashboard-style.html` if ever wanted.

**Files changed (this session):** `docs/taskboard.md` (Task D → DONE + checklist), `docs/CHANGELOG.md`
(Removed entry), `docs/logs.md` (this entry). **No production code touched** — the removal was already on
disk; I verified + ratified + recorded it.

**Knock-on:** Task E's page list drops `dashboard-style.html` → now **6 pages** (`dashboard`, `login`,
`payment`, `onboarding`, `success`, `cancel`).

**Suggested next task:** **Task E** — vendor Google Fonts on those 6 remaining pages (same pattern as
Task C, reuses `/fonts`; needs a per-page weight audit, since some pages may use faces not yet in `/fonts`,
e.g. Mulish-700 / CG-italic). Task A (GUI live-verify) is the other open item but needs a browser session.
