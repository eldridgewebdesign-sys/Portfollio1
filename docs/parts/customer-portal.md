# Customer Portal API — `api/customer-portal.js`

> Server-only endpoint that opens a Stripe Billing Portal session for the signed-in user.

- **File:** `api/customer-portal.js`
- **Type:** Vercel serverless function (`POST /api/customer-portal`)
- **Secrets used:** `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server env only)
- **Last reviewed:** 2026-07-12

## What it does

Powers the dashboard's "Manage Subscription" button. When a client wants to update a
card, change a plan, or cancel, this creates a Stripe-hosted Billing Portal session
for **their own** Stripe customer and returns the URL for the browser to redirect to.
It resolves the Stripe customer strictly from the authenticated user, so no one can
open someone else's billing.

## How everything inside works

One exported `async (req, res)` handler:

- **CORS + method guards.** CORS locked to `https://websharke.com`, `OPTIONS` → 204,
  non-`POST` → 405.
- **Config guard.** 500s if Stripe/Supabase env vars are missing.
- **Authentication (the key defence).** Reads the `Authorization: Bearer <token>`,
  calls `supabaseAdmin.auth.getUser(token)`, and acts **only** on `caller.id`. It
  deliberately ignores any client-supplied `customerId`/`userId` — the comment spells
  out that trusting those would let anyone open another user's portal (IDOR).
- **Resolve the Stripe customer.** Queries the `subscriptions` table (service role) for
  the row matching `user_id = caller.id` with a non-null `stripe_customer_id`. No row →
  400 "No billing account was found."
- **Build the return URL.** Assembles an absolute URL from `x-forwarded-proto` + `host`
  (Stripe requires a fully-qualified `return_url`), pointing back to `/dashboard.html`.
- **Create + return the session.** `stripe.billingPortal.sessions.create({ customer,
  return_url })` and returns `{ url }`. Errors are logged server-side; the browser gets
  a generic "Could not open billing portal."

## Last five changes

Newest first. From `docs/logs.md`.

- No recent diffs to this file are recorded — it appears across the 2026-06-22→30
  payment sessions under "NOT touched," treated as a stable route. Its
  authenticated-only customer resolution (the anti-IDOR design) is foundational to the
  file rather than a recent edit. _(If you change it, record the change here.)_

## Notes & gotchas

- The `return_url` points at `/dashboard.html` (with extension). Site convention is
  extensionless routes; Vercel 308-redirects `/dashboard.html` → `/dashboard`, so it
  works, but if you ever tighten routing, keep this in mind.
- Access control lives entirely in the token check + `user_id` lookup — don't add a
  path that accepts a customer id from the body.
- Depends on the `subscriptions` table being populated by `api/webhook.js`; a user who
  has never completed a purchase has no `stripe_customer_id` and correctly gets the
  "no billing account" 400.

## Related parts

- [[dashboard-client]] — the "Manage Subscription" / "Change Payment Info" button that calls this.
- [[webhook]] — writes the `subscriptions` rows (incl. `stripe_customer_id`) this reads.
- [[checkout]] — sibling Stripe endpoint that creates the subscription in the first place.
