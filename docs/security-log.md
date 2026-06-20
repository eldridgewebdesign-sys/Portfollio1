# WebSharke — Security Log

Owned by the **Security** role (Manager may also edit). Read this before any Security task. Record safety
findings here **with evidence**. Newest first. Flag risks; do not make scary claims without evidence, and
do not change payment / auth / Supabase / Stripe logic without a task that requires it.

Security entries use:

```
## YYYY-MM-DD HH:MM - Security - Session Name

Area Reviewed:
Page, component, script, form, link, config, or asset

Finding:
What may be unsafe

Severity:
Low / Medium / High / Critical

Evidence:
What code or behavior showed the risk

Recommendation:
What should happen

Status:
New / Task Created / Fixed / Rejected
```

---

## Findings

### Live audit pass — 2026-06-20 — Security — site-wide-audit-pass

> Read-only sweep of the whole site against the `CLAUDE.md` Security checklist (3 parallel read-only sweeps +
> first-hand reads of the security-sensitive files). Every finding cites `file:line`. **8 entries: 1 High,
> 4 Medium (one conditional, one verify-only), 1 Low, 1 informational bundle, 1 verified-clean baseline.**
> **F1 (High) is the priority for the Manager to cut into a fix task.** No production code was changed.

## 2026-06-20 02:00 - Security - customer-portal-missing-auth-idor

Area Reviewed:
`api/customer-portal.js` (serverless Stripe billing-portal endpoint).

Finding:
The endpoint has **no caller authentication**. It reads `userId` (or `customerId`) directly from the POST
body/query, then uses the **service-role** Supabase key to resolve *any* user's `stripe_customer_id` and
creates a Stripe Billing Portal session for it, returning the hosted portal URL. An unauthenticated caller who
supplies a victim's Supabase `user_id` (or a Stripe `cus_…` id) receives a working billing-portal URL for that
victim — view invoices / payment history, change the payment method, cancel the subscription. This is an IDOR /
broken-access-control on live billing data.

Severity:
High.

Evidence:
`api/customer-portal.js:40-43` reads `customerId`/`userId` from `req.body`/`req.query` with **no `Authorization`
header or token check**. `:48-68` builds a service-role client (`:53-56`) and looks up `stripe_customer_id`
`.eq("user_id", userId)` for the supplied id. `:82-85` `stripe.billingPortal.sessions.create({ customer })`;
`:88` returns `session.url`. CORS is `*` (`:19`). Caveat: exploiting it needs a victim `user_id` (UUIDv4, not
enumerable) or a `cus_…` id — a barrier, but such ids leak (referrers, support, mis-scoped RLS).

Recommendation:
Require a Supabase access token (`Authorization: Bearer …`), verify it server-side with
`supabaseAdmin.auth.getUser(token)`, and confirm the resolved customer belongs to the authenticated caller
(`userId === caller.id`) before creating the portal session — **the exact pattern already implemented in
`api/admin.js:86-103`**. Narrow CORS from `*` to the site origin. Do **not** fix in this audit pass (payment
logic) — Manager to cut a dedicated High-priority fix task.

Status:
Task Created (flag for Manager — High priority; pairs with the checkout finding below).

## 2026-06-20 02:00 - Security - checkout-missing-auth

Area Reviewed:
`api/checkout.js` (Stripe Payment Element client-secret endpoint) + the trust chain into `api/webhook.js`.

Finding:
Like customer-portal, `/api/checkout` has **no caller authentication** — it accepts `priceId`, `userId`, and
`email` from the body (type-checked only) and creates Stripe customers/subscriptions/payment-intents stamped
with `metadata.supabase_user_id = userId` (attacker-supplied). `api/webhook.js` later trusts that metadata to
upsert the `subscriptions` row. So an unauthenticated caller can create junk Stripe customers/subscriptions
(cost, object pollution, email enumeration via `customers.list`) and attribute a real payment to an arbitrary
`user_id`. Lower impact than the customer-portal IDOR because completing a payment still requires a real card.

Severity:
Medium.

Evidence:
`api/checkout.js:39-51` destructures `priceId/userId/email` from the body and validates type only — no auth.
`:57` `stripe.prices.retrieve(priceId)`; `:64-75` and `:87-117` create the paymentIntent / customer /
subscription with `metadata.supabase_user_id: userId` (`:68-69`, `:97-99`, `:110-113`). `api/webhook.js:34`
reads `subscription.metadata.supabase_user_id` to write `subscriptions.user_id`.

Recommendation:
Same bearer-token verification + `userId === caller.id` check as `api/admin.js:86-103`; consider basic
rate-limiting on this unauthenticated, secret-key-backed endpoint. Group the fix with the customer-portal
finding (shared root cause and fix).

Status:
Task Created (flag for Manager — pairs with the customer-portal IDOR).

## 2026-06-20 02:00 - Security - chartjs-jsdelivr-cdn

Area Reviewed:
`dashboard.html` admin analytics — external script load.

Finding:
The admin dashboard loads Chart.js from the jsDelivr CDN with no Subresource Integrity hash. It executes in the
**admin** context (which renders all clients' PII), so a compromised CDN/package would run script over admin
data (supply-chain risk). It also breaks for the site owner: per `[[cdn-blocked-vendor-locally]]` the user's
environment blocks jsDelivr, so the charts won't load.

Severity:
Medium.

Evidence:
`dashboard.html:830` — `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js">`; no
`integrity`/`crossorigin`. The version is pinned (`@4.4.1`), which limits but does not remove the risk.

Recommendation:
Vendor chart.js locally (matches the no-CDN policy already applied to fonts / three.js / gsap), or add an SRI
`integrity` + `crossorigin` attribute. **Do NOT** apply this to Stripe.js (`dashboard.html:828`,
`payment.html:477`, `https://js.stripe.com/v3/`) — Stripe requires loading from their domain and does not
support SRI; that load is correct by design. Relates to the `third-party-font-cdn` entry below.

Status:
Task Created (likely Efficiency owns the vendoring; Manager to assign).

## 2026-06-20 02:00 - Security - docs-folder-publicly-served

Area Reviewed:
Deployment surface — `docs/`, `vercel.json`, `.vercelignore`.

Finding:
The `docs/` folder (task board, work log, and this security log) is git-tracked and there is no `.vercelignore`
or build/output-dir config, so a static Vercel deploy serves `/docs/*` publicly. That publishes an
attacker-readable roadmap of known, unfixed weaknesses — including the customer-portal IDOR above. No
secrets/PII live in docs, but it is an information-disclosure / opsec leak.

Severity:
Medium if `docs/` is publicly served (verify on a preview); Low otherwise.

Evidence:
`docs/CHANGELOG.md` / `TASKBOARD.md` / `logs.md` are git-tracked; the new role logs are untracked-but-will-be-
committed. Glob for `**/.vercelignore` → none found. `vercel.json` sets only `cleanUrls` / `trailingSlash` /
`rewrites` — no `outputDirectory` / `functions` build that would exclude static files — so `/docs/security-log.md`
is expected to be fetchable. (A non-GUI session cannot fetch to confirm.)

Recommendation:
Add a `.vercelignore` listing `docs/` (or move docs outside the deployed root), then confirm on a preview that
`/docs/security-log.md` returns 404.

Status:
Task Created (Manager + Efficiency — deploy config).

## 2026-06-20 02:00 - Security - rls-not-verifiable-from-repo

Area Reviewed:
Supabase access model — `js/supabase-config.js` (anon key) + `dashboard.html` per-user reads.

Finding:
Frontend data isolation depends entirely on Supabase Row Level Security, but no RLS policy definitions exist in
the repo, so they cannot be verified from source. The anon key is exposed in the frontend (by design) and the
dashboard reads `project_inquiries`/`subscriptions` with it — if RLS is missing or mis-scoped, the anon key
could read other users' rows. This is a load-bearing control that is currently unverifiable here (framed as
"confirm", not "broken").

Severity:
Medium (verification needed).

Evidence:
`js/supabase-config.js` exposes `SUPABASE_URL` + the anon key and creates the global `db` client; `dashboard.html`
queries per-user rows gated only by RLS. No `*.sql` / policy files exist in the repo. `CLAUDE.md` itself notes
RLS is "not visible in this repo — verify in the Supabase dashboard", and flags the onboarding `signUp`→insert
path where `auth.uid()` may be null if email confirmation is ON.

Recommendation:
In the Supabase dashboard, confirm RLS is ON for `project_inquiries` and `subscriptions`, scoped to
`auth.uid()`, and that the anon key cannot read other users' rows. Re-check the onboarding insert path under
the current email-confirmation setting.

Status:
New (verification item for the Manager).

## 2026-06-20 02:00 - Security - missing-security-headers

Area Reviewed:
`vercel.json` — HTTP response headers.

Finding:
No security response headers are configured. Missing `X-Frame-Options` (or CSP `frame-ancestors`) leaves the
auth/payment pages frameable (clickjacking); also missing `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
`Strict-Transport-Security`, and `Permissions-Policy`. Defense-in-depth gap, not an active exploit.

Severity:
Low.

Evidence:
`vercel.json` contains only `cleanUrls` / `trailingSlash` / `rewrites` — no `headers` block.

Recommendation:
Add a `headers` block applying `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (or CSP
`frame-ancestors 'none'`), `Referrer-Policy: strict-origin-when-cross-origin`, and HSTS. A full script-`src`
CSP is harder because every page inlines its scripts — see the `inline-scripts-no-csp` entry below, which this
**extends** (it does not duplicate it; that entry covers the CSP/inline-script angle).

Status:
New (hardening; Manager to schedule).

## 2026-06-20 02:00 - Security - low-and-informational

Area Reviewed:
`dashboard.html`, `api/admin.js`, `api/checkout.js` — minor items (bundled).

Finding:
(a) The admin account email is disclosed in frontend code, telling an attacker which account to target.
(b) `api/admin.js` returns raw error messages to the client and builds PostgREST `.or()` filters by
string-interpolating the search term. (c) `api/checkout.js` deduplicates Stripe customers by email, so two app
users sharing an email share one Stripe customer.

Severity:
Low / informational.

Evidence:
(a) `dashboard.html` ~`:1365` `ADMIN_EMAIL = "weeldridge09@gmail.com"` (also the public `SUPPORT_EMAIL` +
mailto/tel links, so the address is intentionally public — only the *admin-account* linkage is the note).
(b) `api/admin.js:143` returns `err.message`; `:245`, `:516`, `:521` interpolate the search term into `.or()`
filters (stripping `%,`) — both reachable **only by the authenticated admin**, so impact is minimal.
(c) `api/checkout.js:87-101` `customers.list({ email })` then create — `metadata.supabase_user_id` keeps the app
mapping correct, so this is a business-logic note, not a data leak.

Recommendation:
(a) keep, but protect the admin account with a strong password / 2FA (real enforcement is server-side in
`admin.js`). (b) parameterize/escape `.or()` inputs and return generic admin errors as defense-in-depth.
(c) document the unique-email expectation. None are urgent.

Status:
New (informational).

## 2026-06-20 02:00 - Security - verified-clean-baseline

Area Reviewed:
Site-wide — the checklist items that are implemented correctly (recorded so the clean posture is on file).

Finding:
Checked and correct: (1) **secret handling** — server secrets only via `process.env`, never returned/logged to
the client; the frontend exposes only the allowed Stripe **publishable** key + Supabase **anon** key, with no
secret/service-role/webhook secret anywhere in frontend. (2) **Stripe webhook signature verification** is
correct (raw body + `constructEvent`). (3) The **admin API enforces auth server-side** (token + admin-email)
before every action — the frontend admin gate is only UX. (4) The **admin dashboard escapes all
attacker-controlled onboarding data** before `innerHTML`, so no stored-XSS surface was found. (5) Misc clean
items as below.

Severity:
Low (informational baseline).

Evidence:
Secrets via `process.env`: `api/checkout.js:13`, `api/customer-portal.js:14,54-55`, `api/webhook.js:15,23-26`,
`api/admin.js:43-44`; generic client errors + `console.error` (`checkout.js:158-167`, `webhook.js:90-92,182-185`,
`customer-portal.js:89-92`). Frontend keys: `payment.html:480` (`pk_live_…` publishable), `js/supabase-config.js`
(anon JWT, `role:"anon"`). Webhook: `api/webhook.js:20` (`bodyParser:false`), `:83-89` (`constructEvent` on the
raw body), `:190` (config exported). Admin authZ: `api/admin.js:86-98` (token → 401), `:100-103` (admin email →
403) before the action switch. XSS-safe rendering: `dashboard.html:1465-1467` (`esc()`), `:1876` (default
path), `:1571-1679` (every column `render()` escapes); a grep for raw `'…' + r.field` concatenation → no
matches. Clean misc: `dashboard.html:667` (`target="_blank" rel="noopener"`); no `iframe`/`eval`/`new Function`;
no `serve.mjs`/`*.bat` shipped; `.gitignore` ignores `.env*`; the animation is fully vendored with a `file://`
guard; no absolute `C:\…` paths in production code.

Status:
Reviewed / clean.

### Migrated findings (from the retired Worker/Reviewer audit — recorded for continuity)

## 2026-06-19 (migrated) - Security - laptop-teardown-audit-baseline

Area Reviewed:
`Animations/laptop-teardown/**`, the homepage Styles card, `vercel.json`.

Finding:
The prior audit signed off **clean**: no external CDN (three / gsap / fonts vendored), no
secrets/keys/`fetch`/`eval`, no unsafe `innerHTML` of dynamic data (`script.js` builds DOM via
`textContent`), no absolute `C:\…` paths in production, `file://` handled with a guard, the card is a
same-tab `<a>` (no `target="_blank"` → no missing `rel`), and `serve.mjs` / `start-demo.bat` were removed
(no path-traversal surface).

Severity:
Low (informational baseline).

Evidence:
Documented in `docs/logs.md` (2026-06-19 verify/audit FINISH entry) and the taskboard audit table.

Recommendation:
Keep as the baseline. If the teardown card ever switches to `target="_blank"`, add
`rel="noopener noreferrer"`. Re-audit if the redesigned 3D model introduced any new external/asset code.

Status:
Reviewed / clean.

## 2026-06-19 (migrated) - Security - inline-scripts-no-csp

Area Reviewed:
All HTML pages + `vercel.json`.

Finding:
Every page inlines its `<script>` / `<style>` (project convention) and there is **no Content-Security-Policy**
header. Not a regression, but a standing hardening opportunity — inline scripts are incompatible with a
strict CSP.

Severity:
Low.

Evidence:
`vercel.json` has no `headers` block; pages use inline `<script>` per the documented convention.

Recommendation:
Future hardening task (Manager to schedule): consider a CSP that fits the inline-by-convention setup (e.g.
hashes / nonces) without breaking working pages. Not urgent.

Status:
New.

## 2026-06-19 (migrated) - Security - third-party-font-cdn

Area Reviewed:
Web-font loading on the 7 non-homepage pages.

Finding:
Those pages still request fonts from `fonts.googleapis.com` / `fonts.gstatic.com` — a third-party request
on otherwise self-hosted pages. Being removed for performance / no-CDN reasons (Task E), which also reduces
third-party exposure.

Severity:
Low.

Evidence:
Grep of the 7 pages shows the Google Fonts `<link>` (tracked under Task E).

Recommendation:
Vendor fonts locally (Task E). No secret / PII exposure; low severity.

Status:
Task Created (Task E).
