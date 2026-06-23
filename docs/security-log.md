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

## 2026-06-22 21:10 - Security - stripe-invoice-payment-flow-review

Area Reviewed:
The Stripe custom-invoice **payment** flow (Developer's "connect invoices to Stripe" work), before Reviewer.
Files: `api/invoices/pay.js` (new pay route), `api/webhook.js` (payment_intent handling), `db/invoices-schema.sql`
(new `currency` / `paid_at` / `stripe_payment_intent_id` cols + atomic RPC), `dashboard.html` (Pay-invoice
wiring), `payment.html` (read-only invoices page). Method: full first-hand reads + `node --check` on the 3 API
files + repo-wide secret/grep sweep. **Working-tree code (not yet committed/deployed).**

Finding:
**PASS — the payment flow is secure.** Amount integrity, ownership, status rules, secret handling, and webhook
safety are all correctly implemented; no High/Medium issues. Only minor/informational notes (below).

Severity:
Pass (informational notes only).

Evidence (mapped to the 6 review points):
1. **Client amount control — PASS.** Frontend POSTs ONLY `{ invoice_id }` + bearer token (`dashboard.html:1295`);
   no amount is ever sent. The server reads the amount solely from the DB (`api/invoices/pay.js:103,122-126`,
   `const amount = Number(invoice.total_amount_cents)`), and the webhook re-checks `pi.amount ===
   inv.total_amount_cents` before marking paid (`api/webhook.js:198`).
2. **Invoice ownership — PASS.** `api/invoices/pay.js:110-112` rejects `invoice.client_user_id !== caller.id`
   with 403, so changing `invoice_id` to another client's invoice (paid or unpaid) is blocked. Caller identity
   comes from the verified Supabase token (`:80-85`), not the body.
3. **Status rules — PASS.** Only `issued`/`overdue` are payable (`:39,118-120` → 400 otherwise), so
   draft/void/canceled are refused; `paid` → 409 (`:115-117`); an existing **succeeded** PaymentIntent → 409
   (`:143-146`); the webhook is idempotent so a paid invoice is never re-flipped — no double-pay.
4. **Secret safety — PASS.** `STRIPE_SECRET_KEY` (`pay.js:33`, webhook:15), `STRIPE_WEBHOOK_SECRET`
   (webhook:88), and `SUPABASE_SERVICE_ROLE_KEY` (pay.js:67-71, webhook:23-26) are all `process.env`-only.
   Repo-wide grep: NO `sk_*`/`whsec_`/`service_role` in any `*.html`/`*.js`; the browser only ever receives the
   **publishable** key (returned dynamically by `pay.js:183`) + the Supabase anon key. `.env`/`.env.*` are
   gitignored and untracked; nothing secret committed. API "is not set" logs print the var NAME, never a value.
5. **Webhook safety — PASS.** Signature verified via `constructEvent` on the RAW body with `bodyParser:false`
   (`api/webhook.js:20,83-89`). `paid` is set ONLY by the webhook (`:208-212`) — `pay.js` never marks paid and
   the frontend success handler only redirects (`dashboard.html:1397-1399`), no DB write. `payment_intent.
   succeeded` requires `metadata.invoice_id` (`:181-182`), verifies amount **and** currency match (`:197-206`,
   logs + skips on mismatch), and is idempotent: early-out if already `paid` (`:193`) + `.neq("status","paid")`
   race guard on the update (`:212`).
6. **Stripe CLI / local-testing safety — PASS (with operational reminders).** Code is mode-agnostic and returns
   the publishable key that matches the secret key's mode, so test keys stay self-consistent. No secret values
   are printed. Webhook secret is read from env (never committed). Reminders below.

Notes / non-blocking (for Manager triage; none gate Reviewer/Efficiency):
- **INFO-1 (UX, not security):** `payment.html` still renders a DISABLED "Pay invoice" placeholder
  (`payment.html:458-461`) while the dashboard billing tab is the live pay surface. Two client invoice surfaces,
  only one wired — a Reviewer will notice. Decide: wire `payment.html` the same way, or route clients to the
  dashboard. No security impact (the disabled button can't initiate payment).
- **INFO-2 (defense-in-depth, optional):** the webhook locates the invoice by `metadata.invoice_id` and relies
  on PaymentIntent provenance (only the ownership-gated `pay.js` can mint a PI with that metadata) + the
  amount/currency match — it does not *additionally* assert `metadata.supabase_user_id === invoice.client_user_id`.
  Safe as-is (a client cannot create arbitrary PIs); adding the owner-match is a cheap belt-and-suspenders.
- **INFO-3 (operational, point 6):** confirm the Vercel **test/preview** env uses `sk_test`/`pk_test` + the
  **test-mode** webhook signing secret (`whsec_…` from `stripe listen`/the test endpoint), and switch to live
  keys only at production go-live. When running `stripe listen`, put the printed `whsec_` in `.env.local`
  (gitignored) — never commit it.
- **INFO-4 (pre-Stripe note still open):** `pay.js` does not check `account_status`, so a suspended/banned
  client could still pay their own issued invoice. Allowing payment is likely intended — confirm.
- Idempotency is by invoice status (sufficient for this single transition); if more PI-driven mutations are
  added later, consider deduping on Stripe `event.id`.

Recommendation:
**Safe for Efficiency and Reviewer.** Reviewer should run the live pass in **TEST MODE** after deploy: pay route
401 (no token) / 403 (non-owner invoice_id) / 400 (draft/void/canceled) / 409 (already paid); pay a test card and
confirm the invoice flips to `paid` ONLY after the Stripe `payment_intent.succeeded` webhook (with matching
amount), and that replaying the event / re-clicking Pay does not double-charge or double-apply. Address INFO-1
(the disabled `payment.html` button) so the Reviewer isn't blocked on a dead button.

Status:
Reviewed / PASS (working tree; confirm with a test-mode live pass post-deploy).

## 2026-06-22 15:35 - Security - G3-live-rls-isolation-verified

Area Reviewed:
**LIVE** verification of invoice RLS isolation + the admin route, against the production Supabase project
(`pvamosrjqgzeuymwkruv`) and the deployed `/api/admin/invoices`. Run via the Supabase CLI (logged in) + the
public REST/Auth API as real anon + two freshly-provisioned authenticated clients (email confirmation is OFF).
**Resolves the IV-GATE item below.**

Finding:
**PASS — RLS is enabled and enforcing in production, client isolation holds, clients cannot write, and the admin
route rejects non-admins.** Every G3 sub-check passed against the live system.

Severity:
Resolves the verification gate → confirmed safe (was the one hard Stripe blocker).

Evidence:
- **RLS ON + enforcing on BOTH tables:** anon `INSERT invoices` → 401 Postgres `42501 new row violates
  row-level security policy for "invoices"`; authenticated client `INSERT invoices` → 403 `42501 ... "invoices"`;
  authenticated client `INSERT invoice_items` → 403 `42501 ... "invoice_items"`. (42501 = RLS denial; if RLS were
  disabled these would have succeeded — so RLS is provably live with the policy set active.)
- **Cross-tenant read isolation:** anon read invoices/items → `[]`; authed client A read all invoices → `[]`, all
  invoice_items → `[]`, and `?client_user_id=eq.<B-uuid>` → `[]`; symmetric for client B. No other user's row was
  ever returned.
- **No client writes:** client INSERT (even for self) denied (42501); DELETE of another user's invoices → 204 /
  0 rows (scoped to none). No client INSERT/UPDATE/DELETE policy exists.
- **Admin route:** GET → 405 (deployed); POST no token → 401; POST garbage token → 401; POST with a **valid
  non-admin session token → 403 "admin access required"**. A normal client cannot create invoices via the route.

Recommendation:
G3 is cleared — safe to proceed to Stripe on the isolation front. *Optional 100%-positive flourish:* have the
admin create ONE invoice for a test client via the admin UI, then confirm a different client's session returns 0
rows for it (the policy is already proven active, so this is confirmation, not a gap). **Cleanup required:** 3
throwaway test users were created in production auth and hold no data — delete them (Supabase → Authentication →
Users): `sectest+uyr9el0c@websharke.com`, `sectest+ah1oxgzje@websharke.com`, `sectest+b3sdbm0po@websharke.com`.

Status:
Verified / PASS. Clears IV-GATE; invoice RLS isolation confirmed live in production.

### Invoice system pre-Stripe review — 2026-06-22 — Security — invoice-security-review

> Full security review of the custom-invoice system (phase 1, NO Stripe yet) before moving to payments.
> Reviewed: `api/admin/invoices.js`, `db/invoices-schema.sql`, `db/admin-schema.sql` (`is_admin()`),
> `dashboard.html` (admin builder + client billing tab), `payment.html` (client invoices page). Method: first-
> hand reads of every file + a 5-agent adversarial red-team (client-write, cross-tenant IDOR, money integrity,
> admin-gate bypass, completeness critic) — **0 exploits found**. The build is well-hardened; all findings
> below are **Low / Informational**. **Verdict: SAFE to proceed to Stripe — CONDITIONAL on IV-GATE.**

## 2026-06-22 15:00 - Security - invoice-clean-baseline

Area Reviewed:
The 6 requested invoice review areas — admin-only access, service-role key safety, client invoice access, RLS,
money safety, route safety.

Finding:
**Verified correct.** (1) Admin-only writes: `POST /api/admin/invoices` verifies a Supabase bearer token with the
service role then requires `caller.email === ADMIN_EMAIL` before any write; a normal client's token is rejected
403. (2) Service-role key is server-only (`process.env` in `/api`); no service-role/secret in any frontend file
(frontend has only the anon JWT + `pk_live_`). (3) Clients read only their own invoices/items (anon key + RLS +
explicit `.eq("client_user_id", user.id)`); cannot create/edit/delete (no client write policy + no write route).
(4) RLS on both tables is correctly scoped (owner-SELECT + admin-ALL; items gated through parent-invoice
ownership). (5) Money is recomputed server-side (subtotal = Σ qty×unit, total = subtotal − discount + tax),
client-supplied totals ignored, per-line total is a Postgres GENERATED column; negatives/empty/non-integer
quantities rejected; MAX_CENTS/MAX_QTY caps keep all math inside JS safe-integer range. (6) Route validation is
thorough; writes go through parameterized supabase-js; CORS scoped to the site origin (the token is the control).

Severity:
Low (informational baseline).

Evidence:
`api/admin/invoices.js:263-280` (auth+authZ gate), `:100-240` (validation + server-side recompute), `:201-237`
(subtotal/total never from body); `db/invoices-schema.sql:68` (GENERATED line total), `:92-117` (RLS, no client
write policy); `db/admin-schema.sql:29-38` (`is_admin()` = verified JWT email claim, `stable`, not SECURITY
DEFINER); `dashboard.html:1604-1654` + `payment.html:357-407` (client read: anon `db`, `.eq` + RLS + status
filter, `textContent` via `cinvEl`); `dashboard.html:2824-2838` (`postInvoice` sends `Authorization: Bearer`).

Status:
Reviewed / clean.

## 2026-06-22 15:00 - Security - invoice-gate-rls-must-be-live

Area Reviewed:
The load-bearing precondition for ALL client-isolation guarantees — RLS actually being enabled in the live
Supabase project.

Finding:
The invoice tables have **no** client INSERT/UPDATE/DELETE policy and only owner-SELECT, so **RLS is the entire
control** for anon-key reads, and `is_admin()` is the entire control for the admin policies. None of this is
verifiable from the repo (RLS lives in the Supabase dashboard). If the migrations were not applied, or RLS is
disabled on either table, the anon key would silently return **every** client's invoices + line items (financial
PII) to any logged-in user — a full cross-tenant read break. This is the single highest-impact failure mode in
the feature and it is invisible from source.

Severity:
Medium **as a verification gate** (Low if confirmed live; High impact if RLS is not actually on). Not a code
defect — an operational must-verify.

Evidence:
`db/invoices-schema.sql:92-93` (`enable row level security`) + `:96-117` (policies) exist in the migration, but
the repo cannot prove the migration ran. Ties to the standing F5 `rls-not-verifiable-from-repo`.

Recommendation:
**Before Stripe / before relying on this:** in the Supabase dashboard confirm `rowsecurity = true` on
`public.invoices` AND `public.invoice_items`, that all four policies + `public.is_admin()` exist, and run a live
check — signed in as client A, attempt to read client B's invoice id over the anon key and confirm **0 rows**.

Status:
**Verified live — PASS (2026-06-22 15:35; see the G3 entry above).** RLS confirmed enabled + enforcing on both
tables in production (anon + authenticated INSERTs rejected with Postgres 42501; cross-tenant reads return 0
rows; admin route 401/403). No longer a blocker.

## 2026-06-22 15:00 - Security - invoice-draft-readable-by-client

Area Reviewed:
`db/invoices-schema.sql` `inv_owner_select` vs the client UI draft-hiding.

Finding:
The owner-SELECT policy lets a client read **all** their own invoices, including `status = 'draft'`. The UI hides
drafts (`CLIENT_VISIBLE_STATUSES`, `SHOW_DRAFTS_TO_CLIENTS=false`), but that filter is **client-side only** — a
client querying the anon key directly (e.g. browser console) can read their own draft invoices and amounts before
the admin issues them.

Severity:
Low (it is the client's own data; matters only if drafts hold not-yet-final figures the admin doesn't want seen).

Evidence:
`db/invoices-schema.sql:97-98` (`using (auth.uid() = client_user_id or public.is_admin())` — no status filter);
`dashboard.html:1561-1564,1617` + `payment.html:370` (`.in("status", CLIENT_VISIBLE_STATUSES)` — cosmetic).

Recommendation:
If drafts must stay admin-only until issued, tighten the SELECT policy to
`using ((auth.uid() = client_user_id and status <> 'draft') or public.is_admin())`. Otherwise document that
drafts are intentionally client-visible.

Status:
New (Developer task — RLS tweak — if drafts should be hidden).

## 2026-06-22 15:00 - Security - invoice-builder-trusts-public-project-inquiries

Area Reviewed:
The admin invoice builder's client picker ← `project_inquiries` (public-insert) → admin `innerHTML` trust boundary.

Finding:
The invoice builder's client dropdown is populated from `list_users` → `public.project_inquiries`, which has a
**public INSERT** policy (`with check (true)`, by design — onboarding is a pre-session lead form). So anonymous
internet users can inject arbitrary strings (name/business/etc.) that are later rendered into the **admin**
dashboard via `innerHTML`. **Currently mitigated:** `esc()` is correctly applied at every audited admin render
site (picker options, drawer, rows), so no stored XSS lands today. But this is a standing untrusted-input →
admin-`innerHTML` boundary with **no CSP backstop** (`script-src 'unsafe-inline'`), so any single future missed
`esc()` on an admin-rendered field becomes admin-account stored XSS.

Severity:
Low (mitigated today; defense-in-depth + a caution for future edits, incl. the upcoming Stripe/admin UI work).

Evidence:
`db/admin-schema.sql:158-160` (`piq_public_insert ... with check (true)`); `dashboard.html:2895-2907`
(picker from `list_users`), `esc()` at `:1900-1903`, applied `:2460-2465,2907` (mitigation). Invoice client card
path is 100% `textContent`, and `invItemRow()` builds static markup with no DB data — no injection there.

Recommendation:
Keep the strict `esc()`/`textContent` discipline on every admin-rendered DB value; consider a tighter CSP
(remove `'unsafe-inline'` via hashing/nonces — already a deferred follow-up) as a real XSS backstop.

Status:
New (defense-in-depth note; ties to the deferred full-CSP follow-up).

## 2026-06-22 15:00 - Security - invoice-minor-notes

Area Reviewed:
`api/admin/invoices.js` minor items (bundled).

Finding:
(a) **Non-atomic write:** the invoice row and its items are two separate inserts with a best-effort compensating
delete; if the item insert AND the rollback both fail, an orphaned invoice with no line items (totals not matching
its empty items) remains — logged loudly with its id, requires two DB failures, not attacker-controllable.
(b) **Raw error to admin:** the 500 path returns `err.message` (incl. the orphan invoice UUID) to the caller —
reachable **only** by the authenticated admin, so acceptable, but keep it admin-only. (c) **Email-based admin
identity:** admin is one hardcoded email in both the route (`ADMIN_EMAIL`, env-overridable) and the SQL
`is_admin()` literal — they must stay in sync; a role/`app_metadata` claim would be more robust long-term.
(d) **No rate limiting** — acceptable, the route is admin-only.

Severity:
Low / Informational.

Evidence:
`api/admin/invoices.js:309-349` (two inserts + rollback), `:341-346,376` (raw message), `:61-63,278` +
`db/admin-schema.sql:37` (email identity, two places). Consistent with the existing `api/admin.js` patterns.

Recommendation:
(a) For true atomicity, move the invoice+items insert into a single Postgres RPC/transaction. (b) Optionally
return a generic 500 + log detail. (c) Keep `ADMIN_EMAIL` and the `is_admin()` literal identical; consider a role
claim later. (d) None needed now. **Pre-Stripe:** RLS keys only on `auth.uid() = client_user_id`, never on
`account_status`, so a suspended/banned client still reads (and, once Stripe is wired, could pay) their invoices —
confirm that is intended before checkout goes live, and drive `status → paid` from the webhook, not the manual
admin field.

Status:
New (Low / Informational — optional hardening; the account_status + webhook items are pre-Stripe notes).

### Fix applied — 2026-06-21 — Security — security-headers-vercel-json

## 2026-06-21 12:10 - Security - F6-security-headers-added

Area Reviewed:
`vercel.json` HTTP response headers.

Finding:
**Resolved.** F6 (`missing-security-headers`) is fixed: `vercel.json` now sends a `headers` block on all routes
with `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy:
strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=63072000; includeSubDomains`, a
`Permissions-Policy` deny-list that keeps `payment=(self)`, and a minimal CSP `frame-ancestors 'none';
base-uri 'self'; object-src 'none'`. Clickjacking (the main F6 gap) is closed.

Severity:
Low (defense-in-depth) — now mitigated.

Evidence:
`vercel.json` → `headers[0]` on `source: "/(.*)"` (valid JSON; `cleanUrls`/`trailingSlash`/`rewrites`
unchanged). The minimal CSP **omits** `script-src`/`style-src`/`connect-src` by design, so it cannot block the
pervasive inline scripts/styles, Stripe, or Supabase. Verified safe against the current site (3 read-only
sweeps + Stripe/Supabase/Vercel docs): the only external script origin is `js.stripe.com` (Chart.js + fonts now
vendored locally); `X-Frame-Options: DENY` is safe (Stripe is framed by us, not vice versa); `payment=(self)`
== the current browser default (no wallet regression); the animation's same-origin
`<base href="/Animations/laptop-teardown/">` is compatible with `base-uri 'self'`.

Recommendation:
Verify on a Vercel preview (`curl -sI` shows the 6 headers; sign-in → `/payment` → Payment Element mounts with
**no CSP violations** in the console; "Manage Subscription" opens the portal; the animation renders). Response
headers only take effect on a real deploy.

Deferred follow-up — a **full enforcing CSP**, to be validated via `Content-Security-Policy-Report-Only`
against the live Stripe/Supabase flow **before** enforcing (needs `'unsafe-inline'` until a build step exists,
so its XSS value is limited):
`default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.js.stripe.com;
style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.stripe.com https://websharke.com;
font-src 'self'; connect-src 'self' https://pvamosrjqgzeuymwkruv.supabase.co
wss://pvamosrjqgzeuymwkruv.supabase.co https://api.stripe.com; frame-src https://js.stripe.com
https://*.js.stripe.com https://hooks.stripe.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none';
form-action 'self';` — caveats: Stripe Radar may need `https://*.stripe.network` in `connect-src`; confirm the
Supabase realtime `wss://`; add `maps.googleapis.com` only if the Stripe Address Element is ever added. Extends
the `inline-scripts-no-csp` baseline.

Status:
Fixed (in working tree; verify the headers on a preview before/with deploy). Supersedes the F6 "New" entry below.

### Fix applied — 2026-06-20 — Security — billing-endpoints-auth-fix

## 2026-06-20 10:40 - Security - F1-F2-fixed-pending-live-test

Area Reviewed:
`api/customer-portal.js`, `api/checkout.js` + their frontend callers (`dashboard.html`, `payment.html`).

Finding:
**Resolved (pending live verification).** F1 (`customer-portal-missing-auth-idor`, High) and F2
(`checkout-missing-auth`, Medium) are fixed: both endpoints now require a valid Supabase access token
(`Authorization: Bearer …` → `supabaseAdmin.auth.getUser` → 401) and derive identity from the verified token
instead of the request body — customer-portal acts **only** on the authenticated caller's own Stripe customer
(client `customerId`/`userId` ignored), and checkout uses `caller.id` + `caller.email` (403 if a body `userId`
mismatches). CORS narrowed from `*` to the site origin. The IDOR (any-user billing portal) is closed.

Severity:
High (F1) / Medium (F2) — now mitigated.

Evidence:
Server: `api/customer-portal.js` auth gate + caller-only `subscriptions` lookup; `api/checkout.js` auth gate +
`userId = caller.id` / `email = caller.email`; both mirror `api/admin.js:86-103`. Both pass `node --check`.
Client: the 4 billing fetches now send the token via `db.auth.getSession()` (`dashboard.html` ×3,
`payment.html` ×1), mirroring the existing `adminApi` pattern (`dashboard.html:1509-1517`).

Recommendation:
**Before deploy:** run the live end-to-end flow (sign-in → checkout → manage subscription) and confirm a second
account cannot open the first's portal. Ensure `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set in the
`/api` env (checkout now needs them). **Live billing — owner sign-off required before deploy.**

Status:
Fixed (in working tree; pending live e2e test + owner deploy sign-off). Supersedes the F1/F2 "Task Created"
entries below.

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
