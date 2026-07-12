# Hosting Subscriptions Schema — `db/hosting-subscriptions-schema.sql`

> Additive columns + indexes on the existing `subscriptions` table that let it describe an admin-created, client-activated custom recurring hosting charge.

- **File:** `db/hosting-subscriptions-schema.sql`
- **Type:** schema migration (idempotent, additive; run by hand in the Supabase SQL editor)
- **Last reviewed:** 2026-07-12

## What it does

The `subscriptions` table already existed (for the legacy Stripe-plan hosting rows
the webhook syncs). This migration **adds** the columns needed to also describe a
**custom recurring subscription** — one the admin defines for a client (a custom
amount billed every N months) and the client later activates. It's additive and
idempotent, so it never disturbs the existing plan rows or the webhook. It pairs
with `/api/admin/subscriptions` (admin create/cancel) and
`/api/subscriptions/activate` (client activation), and is read by the client's
Subscriptions tab.

## How everything inside works

**1. Additive columns on `public.subscriptions`** (each `add column if not
exists`): `amount_cents` (exact admin-set recurring amount), `interval_months`
(1–12), `currency` (default `usd`), `category` (`'hosting'` for these rows, NULL
for legacy plans), `activated_at`, `canceled_at`, `current_period_start`,
`updated_at`, `created_by` (admin user id), and `stripe_price_id` (reserved —
inline `price_data` means it's usually NULL).

**2. Partial unique index** `subscriptions_stripe_sub_uniq` on
`stripe_subscription_id` **where it is not null** — gives the webhook's
`upsert(onConflict:"stripe_subscription_id")` a constraint to match, while letting
the many PENDING rows (NULL id until activation) coexist without colliding.

**3. Category index** for the admin "Subscriptions" list filter.

**RLS is unchanged** (it comes from `db/admin-schema.sql`): `sub_owner_select` lets
a client read only their own rows; `sub_admin_all` lets the admin do everything.
There's **no client INSERT/UPDATE policy**, so a client can never create or edit a
subscription from the browser — admin creation and client activation both write
server-side (service role).

**Status has no CHECK constraint**, so the lifecycle values need no schema change:
`pending_activation` (admin created, no Stripe object) → `incomplete` (client
started activation, Stripe sub created, unpaid) → `active`/`trialing` (first
payment succeeded — the webhook is the authority) → `past_due`/`unpaid` (renewal
failed) → `canceled`.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. One real change touches
this file.

- **2026-06-24** — Created the migration: the additive custom-subscription columns
  on `public.subscriptions`, the partial unique index on `stripe_subscription_id`
  (for the webhook upsert), and the category index. _(Note: additive only — the
  legacy plan rows and webhook sync are unaffected. Session: `custom-recurring-subscriptions`.)_

## Notes & gotchas

- **The partial unique index must exist** for the webhook's
  `upsert(onConflict:"stripe_subscription_id")` to work; it's partial so pending
  rows with NULL ids don't collide.
- **`status` has no CHECK on purpose** — don't add one that would reject
  `pending_activation` / `incomplete`.
- RLS has **no client write policy** — only the service-role routes write these
  rows. The webhook is the authority for active/canceled status.
- Additive + idempotent — re-running never drops data. Requires the base
  `subscriptions` table and RLS from `db/admin-schema.sql`.
- The `subscriptions` table is a **Critical constraint** area (billing) — don't
  refactor working columns without an identified bug.

## Related parts

- [[admin-subscriptions]] — admin create/list/cancel; writes `category:"hosting"` pending rows.
- [[subscriptions-activate]] — client activation; stores `stripe_subscription_id` here.
- [[webhook]] — the authority that upserts active/canceled status (matched by the unique index).
- [[dashboard-client]] — reads the user's own subscription rows (Subscriptions tab).
- [[dashboard-admin]] — reads/creates/cancels these rows via the admin routes.
- [[db-invoices]] — the separate one-time invoice schema.
