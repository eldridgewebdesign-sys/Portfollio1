# Invoices Page — `payment.html`

> The signed-in client's invoice list and the one place invoices (and pending subscriptions) actually get paid. Formerly the Stripe plan-checkout page.

- **File:** `payment.html`
- **Type:** page (static HTML, inline CSS + JS)
- **Route:** `/payment`
- **Last reviewed:** 2026-07-12

## What it does

Despite the filename, this is the **Invoices** page. It shows the signed-in
client a read-only list of the invoices WebSharke has issued them, and lets them
pay any outstanding one with a card. It's reached from the dashboard's Pay Invoice
button and from two deep links: `?invoice_id=…` (auto-open a specific invoice's
payment) and `?subscription_id=…` (activate a pending subscription). After a
successful charge it hands off to `/success`, which verifies the real status in
Supabase before congratulating anyone.

**Important history:** this file **used to be** the self-serve Stripe checkout —
it held the live plan `price_…` IDs and the publishable key and sold plans
directly. That was removed. It's now read-only invoices + pay. The live
plan-purchase surface has no permanent home yet (flagged in the work log).

## How everything inside works

Self-contained page — inline CSS, markup, one inline `<script>`. It loads the
Supabase vendor bundle + `js/supabase-config.js` (the `db` client) **and**
Stripe.js (`https://js.stripe.com/v3/` — the one intentional third-party script).

**Gate.** On load it calls `db.auth.getUser()` then `db.auth.getSession()`; no
user → `replace()` to `/login`.

**Invoice list.** `loadClientInvoices(user)` reads the caller's own `invoices`
(newest first) and all their `invoice_items` in one `.in(...)` query (no N+1) —
both RLS-scoped to `user.id`. `buildClientInvoiceCard` renders each as a read-only
card (reference, dates, a line-item table via `buildClientItemsTable`, totals via
`buildClientTotals`). **All invoice text is inserted via `textContent`/`cinvEl`,
never `innerHTML`, so admin-entered text can't inject markup.** Empty/error states
have their own lines.

**Paying an invoice.** Payable invoices (`PAYABLE_STATUSES`, e.g. issued/overdue)
get a **Pay invoice** button → `payInvoice(invoiceId, btn)`:
1. Verifies the session, POSTs to **`/api/invoices/pay`** with the bearer token.
2. The server creates a PaymentIntent and returns its `clientSecret` **plus the
   publishable key** — Stripe is built lazily from that key (its mode always
   matches the server's secret), so no key is hard-coded here.
3. `mountPayment(clientSecret)` mounts the Stripe **Payment Element** in the
   `#pay-overlay` modal; `paySubmit` calls `stripe.confirmPayment` with a
   `return_url` of `/success?type=invoice&invoice_id=…`.

**Activating a subscription.** The `?subscription_id=…` deep link calls
`activateSubscription()` → POST **`/api/subscriptions/activate`** (the **server**
reads amount + interval from the DB; the client never sends money values) → same
Payment Element modal → `return_url` `/success?type=subscription&subscription_id=…`.
`subRecurringLabel()` formats the modal title ("$25/month" etc.).

**Deep links.** At the end of the script, `?invoice_id=` auto-triggers
`payInvoice` for that invoice; `?subscription_id=` triggers `activateSubscription`.

**Reads:** `invoices` + `invoice_items` (anon client, RLS-scoped). **Server
calls:** `/api/invoices/pay`, `/api/subscriptions/activate` (bearer token). **The
webhook — not any click here — is the only thing that marks an invoice paid or a
subscription active.** No Stripe secret or service-role key is on this page; only
the publishable key the server hands back at runtime.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`.

- **2026-07-17** — Added `<head>` hints only: preconnect to the Supabase origin +
  a preload for Stripe.js (script order and behavior unchanged). _(Session:
  `full-site-optimization-pass`.)_
- **2026-06-30** — Corrected a stale comment claiming the invoice deep-link "also
  drives monthly/annual invoices" (invoices are one-time PaymentIntents; recurring
  is the separate `subscription_id` flow). _(Session: `separate-invoices-from-subscriptions`.)_
- **2026-06-27** — Client invoice card (`buildClientInvoiceCard` /
  `buildClientTotals`) gained the shared billing-type / price-label helpers.
  _(Session: `recurring-invoice-price-labels`.)_
- **2026-06-24** — Added the `?subscription_id=` deep link + `activateSubscription()`
  so a pending subscription can be activated here via `/api/subscriptions/activate`.
  _(Session: `custom-recurring-subscriptions`.)_
- **2026-06-24** — Activated the Stripe Payment Element invoice pay flow (ported
  from the old dashboard modal) and enabled the Pay button; a companion session
  added the `?invoice_id=` auto-open deep link. _(Note: "Pay invoice" was disabled
  until this. Session: `dashboard-pay-to-payment-page`, with `subscription-invoicing-gap`.)_

## Notes & gotchas

- **This is no longer the plan-purchase page.** The live plan/subscription
  self-serve checkout surface still needs a permanent home (flagged in the log).
  Don't assume `/payment` sells plans.
- **All invoice/line-item text is rendered with `textContent`, never
  `innerHTML`** — keep it that way; the data is admin-entered and must not be able
  to inject markup.
- The publishable key comes from the **server response**, not the page. Never
  hard-code Stripe keys or `price_…` IDs back into this file (per `CLAUDE.md`).
- The webhook is the sole writer of paid/active status; a `confirmPayment` success
  only routes to `/success`, which re-checks Supabase. Don't make the browser set
  paid/active.
- If the server can't provide a publishable key, the page shows "Payments aren't
  available right now" rather than crashing — preserve that graceful fallback.
- Stripe.js on `js.stripe.com` is the one allowed third-party script; everything
  else is vendored locally.

## Related parts

- [[invoices-pay]] — the `/api/invoices/pay` route that creates the invoice PaymentIntent.
- [[subscriptions-activate]] — the `/api/subscriptions/activate` route behind the subscription deep link.
- [[webhook]] — the only writer of paid/active status after a charge.
- [[success]] — where a confirmed payment lands; verifies real status before showing success.
- [[dashboard-client]] — the Pay/Activate buttons that link here; also the previous home of this pay modal.
- [[prev-inv]] — the client's paid-invoice history.
- [[db-invoices]] — the `invoices` / `invoice_items` schema this reads (and its RLS).
- [[supabase-config]] — provides the shared `db` client.
