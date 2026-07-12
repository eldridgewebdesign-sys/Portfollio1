# Invoices Schema — `db/invoices-schema.sql`

> The Supabase tables, RLS, and atomic-create RPC behind custom invoices. Invoices are one-time only.

- **File:** `db/invoices-schema.sql`
- **Type:** schema / RLS / RPC migration (idempotent, run by hand in the Supabase SQL editor)
- **Last reviewed:** 2026-07-12

## What it does

This defines the two tables that hold custom client invoices — `invoices`
(headers) and `invoice_items` (line items) — plus their RLS and the atomic
`create_invoice_with_items` RPC. It pairs with the `/api/admin/invoices` route
(the only writer, service role) and is read by the client's Invoices/Previous
Invoices pages and paid via `/api/invoices/pay`. It's a hand-run, idempotent
migration, not something the app executes.

## How everything inside works

**1. `invoices`** — one row per invoice: `id`, `client_user_id` (→ `auth.users`,
`on delete cascade`), `title`, `notes`, `due_date`, `status` (CHECK: draft /
issued / paid / overdue / void / canceled / **in_progress / finished / live**),
`currency` (default `usd`), the cents columns (`subtotal_/discount_/tax_/total_amount_cents`,
each `>= 0`), and Stripe payment state (`paid_at`, `stripe_payment_intent_id`).
Idempotent `add column if not exists` guards, plus indexes on client/status/created.
**One-time cleanup:** the file explicitly `drop column if exists billing_type` /
`stripe_customer_id` / `stripe_subscription_id` / `stripe_invoice_id` /
`next_payment_at` — invoices are one-time only; recurring billing lives in
`subscriptions`.

**2. `invoice_items`** — line items: `invoice_id` (→ `invoices`, cascade), `name`,
`description`, `quantity`, `unit_amount_cents`, and **`total_amount_cents` as a
STORED GENERATED column** (`quantity * unit_amount_cents`) — the DB computes it, so
the route never inserts it and it can't drift. `sort_order` preserves the admin's
entered order. It also `drop table if exists public.invoice_payments` (the old
recurring-renewal table, now redundant).

**3. RLS** — both tables enabled. A client may **read** only their own invoices /
items (`auth.uid() = client_user_id`, or the item's parent invoice belongs to
them); the admin (`public.is_admin()`) can do everything. **No client
INSERT/UPDATE/DELETE policy** — the anon key can't create or edit invoices; the
server route uses the service-role key (RLS is defence-in-depth).

**4. `create_invoice_with_items` RPC** — a plpgsql function that inserts the header
+ all items in **one transaction** (no orphan header if an item fails). Money
fields are computed + validated by the route and passed in (the DB doesn't
re-derive them). **EXECUTE is revoked from PUBLIC and granted only to
`service_role`**, so browser keys can never call it. A `notify pgrst, 'reload
schema'` avoids a first-call `PGRST202`. (An `update_invoice_with_items` RPC lives
alongside it / in `db/invoices-update.sql` for edits.)

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. Some recurring-billing
additions were later removed as invoices returned to one-time-only.

- **2026-06-30** — Widened the inline `status` CHECK to include
  in_progress/finished/live. _(Session: `invoice-status-workflow-recent-payments`.)_
- **2026-06-24** — Added `billing_type` (one_time/monthly/annual),
  `stripe_customer_id`, `stripe_subscription_id`, and extended the RPC signature.
  _(Note: these recurring columns are **dropped** in the current file — invoices
  are one-time-only again. Session: `subscription-invoicing-gap`.)_
- **2026-06-24** — Added the `invoice_payments` renewal-tracking table. _(Note:
  that table is now **dropped** in this file. Session: `recurring-renewal-tracking`.)_
- **2026-06-22** — Added the atomic `create_invoice_with_items` plpgsql RPC (+
  `sort_order`), with EXECUTE granted only to `service_role`. _(Session: `g1-atomic-invoice-rpc`.)_
- **2026-06-22** — `invoices` gained `currency` (default `usd`), `paid_at`, and
  `stripe_payment_intent_id`. _(Session: `invoice-stripe-payments`.)_

## Notes & gotchas

- **Line-item `total_amount_cents` is a GENERATED column** — never insert it; the
  DB derives it so it can't diverge from qty × unit.
- **The create RPC is `service_role`-only.** Re-running `create or replace
  function` resets EXECUTE to PUBLIC — you must re-run the revoke/grant block with
  it, or the RPC becomes callable by anon/authenticated (RLS still backstops, but
  don't rely on that).
- **Invoices are one-time only.** This file drops the recurring columns/tables;
  recurring billing is [[db-subscriptions]].
- RLS has **no client write policy** — only the service-role route writes these
  tables. Verify the live RLS in Supabase when reasoning about access.
- Requires `public.is_admin()` from `db/admin-schema.sql` — run that first.
  Idempotent and safe to re-run.

## Related parts

- [[admin-invoices]] — the only writer (service role) of these tables, via the RPCs.
- [[invoices-pay]] — creates the PaymentIntent; writes `stripe_payment_intent_id`.
- [[invoices-confirm]] / [[webhook]] — write `paid_at` / `status:"paid"` after Stripe confirms.
- [[payment]] / [[prev-inv]] — the client pages that read these tables (RLS-scoped).
- [[db-subscriptions]] — the separate recurring-billing schema.
