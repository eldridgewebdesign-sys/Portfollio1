# Stripe Webhook — `api/webhook.js`

> Server-only receiver for Stripe events. Verifies signatures and syncs billing state into Supabase.

- **File:** `api/webhook.js`
- **Type:** Vercel serverless function (`POST /api/webhook`), body parser disabled
- **Secrets used:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **Last reviewed:** 2026-07-12

## What it does

This is how the site learns that money actually moved. Stripe POSTs events here
(payment succeeded, subscription updated, invoice paid, etc.); the function verifies
the event is really from Stripe, then updates the `subscriptions` and `invoices`
tables so the dashboard reflects real billing state. It's the **only writer** of
paid/active status into those tables, using the service-role key to bypass RLS. Both
the Stripe secret and the service-role key stay server-side.

## How everything inside works

**Raw-body config.** `const config = { api: { bodyParser: false } }` disables Vercel's
JSON parsing — Stripe signature verification needs the exact raw bytes. `readRawBody`
collects the request into a single Buffer.

**Admin client.** A service-role Supabase client (`supabaseAdmin`) is created once at
module load; it bypasses RLS so the webhook can write any user's row.

**Helpers:**
- `subscriptionRecord(subscription)` — maps a Stripe subscription to the table columns
  (`user_id` from `metadata.supabase_user_id`, `stripe_customer_id`, `stripe_subscription_id`,
  `status`), and best-effort enriches with amount/interval/plan name/website type inside
  a try/catch so a changed Stripe shape can never break the core status sync.
- `resolveInvoiceSubscriptionId(invoice)` — reads the subscription id across Stripe API
  versions (old top-level `invoice.subscription` vs. new
  `invoice.parent.subscription_details.subscription`), normalising to a plain id string.
- `unixToIso` — converts Stripe's unix seconds to ISO timestamps.

**Handler flow:** rejects non-`POST` (405); 500s if env vars missing; verifies the
signature with `stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET)` and
400s on failure. Then a `switch (event.type)`:

- **`checkout.session.completed`** — subscription mode upserts a `subscriptions` row
  (best-effort enriched). One-time payment mode just logs. _(Largely dormant: the
  Payment Element flow doesn't create Checkout Sessions.)_
- **`customer.subscription.updated` / `.created`** — upsert via `subscriptionRecord`.
  For **admin-created** custom subscriptions (`metadata.subscription_row_id`), it also
  stamps `updated_at`/`current_period_start`, and `activated_at` the first time it goes
  active/trialing (guarded by `.is("activated_at", null)`). The upsert preserves
  admin-set label/amount/interval/category. This is the event that actually drives
  normal subscription sync.
- **`customer.subscription.deleted`** — marks `status: "canceled"` (plus `canceled_at`
  for admin custom subs).
- **`invoice.paid` / `invoice.payment_failed`** — for hosting subscriptions, flips status
  to active (+ `last_payment_date`) or `past_due`, resolving the sub id cross-version.
- **`payment_intent.succeeded`** — for **custom invoices** (`metadata.invoice_id`): loads
  the invoice, is idempotent (already-paid = no-op), and only marks paid when the captured
  `amount` **and** `currency` match the invoice exactly (a mismatch is logged loudly and
  NOT paid), with a `.neq("status","paid")` race guard.
- **`payment_intent.payment_failed`** — for custom invoices: logs only; leaves the invoice
  issued/overdue so the client can retry.
- **default** — ignored, still returns 200 so Stripe stops retrying.

Any handler error logs the real error and returns a generic 500.

## Last five changes

Newest first. From `docs/logs.md`.

- **2026-06-24** — `invoice.paid` now also marks the linked **custom invoice** paid
  (matched by resolved subscription id). _(Session: `subscription-invoicing-gap`.)_
- **2026-06-24** — Added `metadata.subscription_row_id`-guarded enrichment: stamp
  activation / period-start timestamps for admin-created custom subscriptions without
  touching the legacy plan path. _(Session: `custom-recurring-subscriptions`.)_
- **2026-06-24** — Recurring-renewal tracking additions to the subscription events.
  _(Session: `recurring-renewal-tracking`.)_
- **2026-06-22** — Added the `payment_intent.succeeded` case, gated on
  `metadata.invoice_id`, so custom-invoice payments mark their invoice paid (with the
  amount/currency match guard) while subscription/plan PIs fall through. _(Session:
  `invoice-stripe-payments`.)_

## Notes & gotchas

- **Never** enable body parsing on this route — it breaks signature verification.
- Mapping to Supabase depends entirely on `metadata.supabase_user_id` (set by
  `api/checkout.js`) and, for custom items, `metadata.invoice_id` /
  `metadata.subscription_row_id`. If those metadata keys change upstream, sync breaks
  silently.
- The amount/currency match in `payment_intent.succeeded` is a real money-integrity
  guard — don't relax it to "just mark it paid."
- Some columns (`canceled_at`, custom-sub fields) only exist once the newer
  `db/*-schema.sql` files are applied; the legacy paths avoid depending on them.

## Related parts

- [[checkout]] — attaches the `metadata.supabase_user_id` this maps on.
- [[customer-portal]] — reads the `subscriptions` rows this writes.
- [[dashboard-client]] — displays the billing state this syncs (admin half: [[dashboard-admin]]).
- [[db-inquiries]] — related Supabase schema (subscriptions/invoices tables live here).
