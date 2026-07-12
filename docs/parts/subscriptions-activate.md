# Subscription Activate API — `api/subscriptions/activate.js`

> Client route that turns an admin-created pending subscription into a live Stripe subscription, taking the first payment. Amount and interval come only from the database.

- **File:** `api/subscriptions/activate.js`
- **Type:** Vercel serverless function (`POST /api/subscriptions/activate`)
- **Secrets used:** `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SUBSCRIPTION_PRODUCT_ID` (+ optional `STRIPE_PUBLISHABLE_KEY`)
- **Last reviewed:** 2026-07-12

## What it does

The admin defines a pending hosting subscription for a client via
[[admin-subscriptions]]; this route is how the **client** activates it. When they
click "Activate Subscription" (deep-linked to `/payment?subscription_id=…`), the
browser calls here. It confirms the subscription really belongs to that client and
is still pending, then creates a recurring Stripe subscription whose amount and
interval come **only** from the database. The first charge is taken immediately and
Stripe auto-renews every `interval_months`. It returns the client secret +
publishable key so the page mounts the Payment Element. It **never marks the
subscription active itself** — the webhook is the only authority for that.

## How everything inside works

**Setup.** Stripe client from `STRIPE_SECRET_KEY`; a service-role Supabase client;
constants: `ACTIVATABLE_STATUSES = ["pending_activation","incomplete"]`,
`REUSABLE_SUB` (statuses whose open confirmation secret can be resumed on a repeat
click), `MAX_INTERVAL_MONTHS = 12` (Stripe caps one recurring interval at a year),
`MIN_CHARGE_CENTS = 50`, a UUID regex, and the same secret-free `errorInfo()`
diagnostic as the invoice routes.

**Handler flow:**
1. CORS locked to the site; `OPTIONS`/method/env guards.
2. **Authenticate** — verify the `Bearer` token (`getUser`); no/invalid → 401.
3. **Validate** — `subscription_id` must be a valid UUID.
4. **Load + authorize** — fetch the subscription row (service role). Not found →
   404; not the caller's → 403; already active → 409; not in
   `ACTIVATABLE_STATUSES` → 400.
5. **Amount/interval from the DB only** — read the stored amount + interval (never
   from the client); enforce USD, the $0.50 minimum, and interval 1–12 months.
6. **Stripe subscription** — create a recurring subscription with an inline
   `price_data` attached to the shared `STRIPE_SUBSCRIPTION_PRODUCT_ID` product
   (`unit_amount` = the DB amount), `default_incomplete` so the first invoice's
   payment is confirmed in the browser; reuse an open one on a repeat click.
   Store the `stripe_subscription_id` on the row before returning (so the webhook
   can match it).
7. **Respond** — `{ clientSecret, publishableKey, subscription:{…display-only…} }`.
   Errors log full detail server-side and return a generic 500 + secret-free `debug`.

**Reads/writes:** the `subscriptions` row (service role); writes only the Stripe
ids (never the active status). **Stripe:** creates/reuses the subscription.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. One real change touches
this file.

- **2026-06-24** — Created the route: client activation of an admin-created custom
  recurring subscription (ownership + pending checks, amount/interval from the DB,
  first charge via a `default_incomplete` Stripe subscription, returns the client
  secret + publishable key). _(Session: `custom-recurring-subscriptions`.)_

## Notes & gotchas

- **Amount and interval come only from the DB** — the client never sends money
  values. Keep the USD-only + $0.50 + 1–12-month guards.
- **This route never marks the subscription active** — only the webhook
  (`customer.subscription.*` / `invoice.paid`) does, matched by the
  `stripe_subscription_id` stored here.
- Requires `STRIPE_SUBSCRIPTION_PRODUCT_ID` to be set in Vercel (the inline
  recurring price attaches to it) — a common reason recurring activation fails if
  unset. `STRIPE_PUBLISHABLE_KEY` should be set too.
- Keep the Stripe secret + service-role key server-side; only the publishable key
  goes to the browser. The `errorInfo` diagnostic must stay secret-free.
- The security pattern here (verify token → load with service role → require
  ownership) is the model [[db-subscriptions]]'s cancel route mirrors.

## Related parts

- [[payment]] — the Invoices page whose `?subscription_id=` deep link calls this route.
- [[admin-subscriptions]] — creates the pending subscription this route activates.
- [[webhook]] — the authority that flips the subscription to active after Stripe confirms.
- [[dashboard-client]] — the "Activate Subscription" action that deep-links here.
- [[db-subscriptions]] — the `subscriptions` schema this reads and stores ids on.
