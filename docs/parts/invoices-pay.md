# Invoice Pay API — `api/invoices/pay.js`

> Server route that starts a Stripe payment for a client's own custom invoice. Amount comes from the database, never the browser.

- **File:** `api/invoices/pay.js`
- **Type:** Vercel serverless function (`POST /api/invoices/pay`)
- **Secrets used:** `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (+ optional `STRIPE_PUBLISHABLE_KEY`)
- **Last reviewed:** 2026-07-12

## What it does

When a signed-in client clicks "Pay invoice" (on `/payment` or `/prev-inv`), the
browser calls this route. It confirms the invoice really belongs to that client
and is payable, then opens a Stripe PaymentIntent for the amount stored in the
**database** — so the client can never talk the server into charging a different
number. It returns the PaymentIntent's client secret plus the publishable key so
the page can mount the Stripe Payment Element. It **never marks the invoice
paid** — the webhook (and the confirm route) are the only authorities for that.
Invoices are always one-time charges.

## How everything inside works

**Setup.** Builds the Stripe client from `STRIPE_SECRET_KEY` and a service-role
Supabase client. Constants: `PAYABLE_STATUSES = ["issued","overdue"]`,
`MIN_CHARGE_CENTS = 50` (Stripe's floor), `REUSABLE_PI` (PaymentIntent statuses
whose secret can be reused), and a UUID regex. `errorInfo()` builds a
**secret-free** diagnostic (type/code/statusCode/requestId, plus the message only
for Stripe errors, which Stripe guarantees are safe) — the full error is logged
server-side, only the trimmed version goes to the browser.

**Handler flow:**
1. CORS locked to `https://websharke.com`; `OPTIONS` → 204; non-`POST` → 405;
   500 if Stripe/Supabase env vars are missing.
2. **Authenticate** — verify the `Bearer` token with `supabaseAdmin.auth.getUser`;
   no/invalid → 401.
3. **Validate** — `invoice_id` must be a valid UUID.
4. **Load + authorize** — fetch the invoice by id (service role). Not found →
   404. `client_user_id !== caller.id` → 403 (a client may only pay their own).
   Status `paid` → 409; not in `PAYABLE_STATUSES` → 400.
5. **Amount guards** — the amount is read **only** from `invoice.total_amount_cents`;
   must be a positive integer. Non-USD currency is refused (the client UI shows USD
   only, so the confirmed amount always matches the charge). Below the $0.50
   minimum → clear 400.
6. **PaymentIntent** — if the invoice already has a `stripe_payment_intent_id`,
   retrieve it: if it succeeded already → 409; if it's reusable and the
   amount+currency still match → reuse it (so a double-click doesn't stack
   duplicate intents). Otherwise create a new one with
   `metadata: {invoice_id, supabase_user_id, type:"invoice"}`,
   `automatic_payment_methods`, and a receipt email, then persist its id on the
   invoice row for the webhook.
7. **Respond** — return `{clientSecret, publishableKey, invoice:{…display-only…}}`.
   Errors log full detail server-side and return a generic 500 + the secret-free
   `debug`.

**Reads:** the `invoices` row (service role). **Writes:** only
`invoices.stripe_payment_intent_id` (never the paid status). **Stripe:** creates/
retrieves the PaymentIntent.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. Two real changes touch
this file.

- **2026-06-24** — Added a recurring (monthly/annual) branch that created a Stripe
  customer + `default_incomplete` subscription with an inline recurring `price_data`.
  _(Note: the current file is one-time-only again — this recurring branch was
  removed in a later one-time cleanup; recurring billing now lives in the separate
  subscription flow. Session: `subscription-invoicing-gap`.)_
- **2026-06-22** — Created the route: bearer-token auth, ownership +
  payable-status checks, amount read strictly from the DB, PaymentIntent creation,
  and returning the client secret + publishable key. _(Session: `invoice-stripe-payments`.)_

## Notes & gotchas

- **Never trust a client amount.** The charge is always `total_amount_cents` from
  the DB; keep it that way. The USD-only guard exists so the browser-confirmed
  amount can't diverge from the charge — don't loosen it without adding real
  multi-currency display support.
- **This route never marks an invoice paid.** Only the webhook (and the confirm
  route, verifying with Stripe) may write `status:"paid"`.
- Keep the Stripe secret and service-role key server-side only; the browser gets
  just the publishable key at runtime.
- The `errorInfo` diagnostic must stay secret-free — only Stripe messages are
  surfaced to the browser; raw DB/internal messages stay in the logs.
- A prior review noted the PaymentIntent is created without an `idempotencyKey`;
  the reuse-existing-intent logic mitigates duplicate charges on re-click.

## Related parts

- [[payment]] — the Invoices page that calls this route to start a payment.
- [[prev-inv]] — links here (via `/payment?invoice_id=`) to pay an outstanding invoice.
- [[invoices-confirm]] — the on-return reconcile route that verifies the PaymentIntent with Stripe.
- [[webhook]] — the payment authority; marks the invoice paid on `payment_intent.succeeded`.
- [[admin-invoices]] — where the admin creates the invoices this route pays.
- [[db-invoices]] — the `invoices` schema (amount, status, `stripe_payment_intent_id`) and its RLS.
