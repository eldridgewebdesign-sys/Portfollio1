# Checkout API — `api/checkout.js`

> Server-only endpoint that turns a chosen price into a Stripe Payment Element client secret.

- **File:** `api/checkout.js`
- **Type:** Vercel serverless function (`POST /api/checkout`)
- **Secrets used:** `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server env only)
- **Last reviewed:** 2026-07-12

## What it does

This is the server side of buying a plan. The browser sends a `priceId`; this
function verifies the caller is really signed in, asks Stripe to create the right
kind of payment object for that price, and returns the **client secret** the browser
needs to confirm payment with Stripe's Payment Element. It's the only place the
Stripe secret key is used for checkout — that key never reaches the browser.

## How everything inside works

One exported `async (req, res)` handler:

- **CORS + method guards.** Sets CORS headers locked to `https://websharke.com`,
  answers `OPTIONS` with 204, and rejects anything that isn't `POST` (405).
- **Config guard.** 500s early if `STRIPE_SECRET_KEY` or the Supabase env vars are
  missing, with a generic client message and a real `console.error`.
- **Authentication.** Builds a service-role Supabase admin client, reads the
  `Authorization: Bearer <token>` header, and calls `supabaseAdmin.auth.getUser(token)`.
  The `userId` and `email` used for Stripe come from this **verified token**, never
  from the request body — so a caller can only ever check out as themselves. A `userId`
  in the body must match the caller or it's a 403 (defence in depth).
- **Branch on price type.** It retrieves the price (`stripe.prices.retrieve`) and
  branches:
  - **One-time price** (`!price.recurring`) → `stripe.paymentIntents.create` with the
    amount, `receipt_email`, `automatic_payment_methods`, and `metadata.supabase_user_id`
    + `price_id`. Returns `{ clientSecret }`.
  - **Recurring price** → find-or-create a Stripe customer by email, then
    `stripe.subscriptions.create({ payment_behavior: "default_incomplete", expand:
    ["latest_invoice.confirmation_secret"] })`, stamping `metadata.supabase_user_id`.
    Returns `{ clientSecret, subscriptionId, mode: "subscription" }` from the invoice's
    `confirmation_secret.client_secret`.
- **Error handling.** Stripe failures are logged with full detail server-side but the
  browser only ever gets a generic "Could not start checkout" message — no Stripe
  internals or client secrets leak.

The `metadata.supabase_user_id` it attaches is what lets `api/webhook.js` map the
Stripe event back to the right Supabase user later.

## Last five changes

Newest first. From `docs/logs.md`.

- No recent diffs to this file are recorded — across the 2026-06-22→30 payment
  sessions it's repeatedly listed under "NOT touched" and used as the **baseline**
  that newer routes copy (e.g. `api/invoices/pay.js` "mirrors `api/checkout.js`";
  the Bearer→`getUser` auth at lines ~50-56 is cited as the pattern to reuse). Its
  verified-token auth + `confirmation_secret` subscription flow are foundational, not
  a recent edit. _(If you change it, record the change here.)_

## Notes & gotchas

- **Do not change the `price_…` IDs** — those live in `payment.html` and map to live
  Stripe products (`CLAUDE.md`).
- Identity must keep coming from the verified token, not the body — that's the whole
  IDOR defence. Don't "simplify" it to trust a client-supplied `userId`.
- Newer Stripe API versions return the subscription's confirmation secret under
  `latest_invoice.confirmation_secret` (not the older payment-intent path) — this file
  already expands that. `api/webhook.js` has matching cross-version handling.
- Never return Stripe error internals to the client; keep the log-real/return-generic
  split.

## Related parts

- [[payment]] — the browser side that POSTs `priceId` here and confirms the secret.
- [[webhook]] — consumes the `metadata.supabase_user_id` this attaches, to sync status.
- [[customer-portal]] — sibling Stripe endpoint for managing an existing subscription.
