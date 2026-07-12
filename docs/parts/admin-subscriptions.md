# Admin Subscriptions API — `api/admin/subscriptions.js`

> Admin-only route to define, list, and cancel a client's custom recurring hosting charge. Creating one only makes a pending row — it never charges the client.

- **File:** `api/admin/subscriptions.js`
- **Type:** Vercel serverless function (`POST /api/admin/subscriptions`)
- **Secrets used:** `STRIPE_SECRET_KEY` (for cancel), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (+ optional `ADMIN_EMAIL`)
- **Last reviewed:** 2026-07-12

## What it does

This lets the admin set up a **custom recurring hosting charge** for an existing
client — a custom amount billed every N months. Creating one only inserts a
**pending** `subscriptions` row; it never charges the client and never creates a
Stripe object. The client later activates it on the payment page via
[[subscriptions-activate]], which is what actually creates the Stripe subscription
and takes the first payment. This route also lists and cancels those subscriptions
(cancel is a **real** Stripe cancellation when a Stripe subscription exists).

## How everything inside works

**Auth gate.** Same gate as [[admin]] / [[admin-invoices]]: verify the `Bearer`
token with the service-role key, then require the admin email (401/403 otherwise).

**Body:** `{ action: "create" | "list" | "cancel", payload: {…} }`.
- **create** — `{ client_user_id, name, amount_dollars, interval_months }` →
  inserts a `subscriptions` row with `status:"pending_activation"`,
  `category:"hosting"`. The dollar amount is validated and **converted to cents
  server-side** (the browser's value is never trusted as cents). No Stripe call.
- **list** — returns the `category:"hosting"` rows for the admin table.
- **cancel** — `{ subscription_id }` → if the row has a Stripe subscription, it
  cancels it in **Stripe first**, then marks the row canceled; a still-pending row
  (no Stripe sub) is marked canceled locally. A real cancellation, not just a DB
  flag.

**Reads/writes:** `subscriptions` (service role); Stripe (only on cancel of an
active sub). No Stripe secret or service-role key ever reaches the browser. RLS has
no client INSERT/UPDATE policy on `subscriptions`, so only this route (and the
webhook) writes them.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. Three real changes touch
this file.

- **2026-06-30** — `list` action reverted to `category='hosting'`. _(Note: it's now
  effectively unused — all subscriptions are viewed via the Recent Payments feed.
  Session: `invoice-status-workflow-recent-payments`.)_
- **2026-06-30** — `list` action stopped filtering (removed `.eq("category","hosting")`)
  so it returned every subscription of every status. _(Note: reverted the same day
  by the change above. Session: `admin-invoices-subscriptions-all-time`.)_
- **2026-06-24** — Created the route: the admin-gated `create` / `list` / `cancel`
  actions for custom recurring subscriptions (pending row on create; real Stripe
  cancel). _(Session: `custom-recurring-subscriptions`.)_

## Notes & gotchas

- **Creating a subscription here charges nobody** — it only makes a pending row.
  The first charge happens when the client activates it via
  [[subscriptions-activate]]. Don't add a charge to the create path.
- The amount is validated as dollars and converted to cents server-side — never
  trust a client-supplied cents value.
- Cancel is a **real Stripe cancellation** for live subs — keep the "cancel in
  Stripe, then flip the row" order.
- Same admin security boundary as [[admin]]; the service-role key stays
  server-side.
- Depends on the `subscriptions` schema (`db/hosting-subscriptions-schema.sql` /
  `db/admin-schema.sql`) being applied.

## Related parts

- [[dashboard-admin]] — the Subscriptions tab whose create/cancel form posts here.
- [[subscriptions-activate]] — the client route that turns a pending row into a live Stripe subscription.
- [[admin]] — shares the same auth gate.
- [[webhook]] — the authority that flips a subscription to active/canceled after Stripe events.
- [[db-subscriptions]] — the `subscriptions` (hosting) schema this reads and writes.
