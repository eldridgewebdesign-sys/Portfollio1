# Admin Invoices API — `api/admin/invoices.js`

> Admin-only route that creates (and updates) a client's custom invoice. Totals are computed server-side; the browser's amounts are never trusted.

- **File:** `api/admin/invoices.js`
- **Type:** Vercel serverless function (`POST /api/admin/invoices`)
- **Secrets used:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (+ optional `ADMIN_EMAIL`)
- **Last reviewed:** 2026-07-12

## What it does

This is how the admin bills a client. From the admin dashboard's Invoices tab, the
owner builds an invoice (title, line items, optional discount/tax/due date) and
POSTs it here; the route writes the `invoices` + `invoice_items` rows. Clients
can't create or edit invoices — RLS has no client INSERT/UPDATE policy on those
tables, so only this server route (service role) writes them. It's the create/edit
counterpart to [[invoices-pay]] (which is how the client pays what's created here).

## How everything inside works

**Auth gate.** Reuses the exact gate from [[admin]]: verify the `Bearer` token
with the service-role key, then require the caller's email to equal `ADMIN_EMAIL`
(missing/invalid → 401; valid non-admin → 403). `logActivity` writes a best-effort
`admin_activity_log` entry.

**Validation (`parseInvoiceBody`).** Requires `client_user_id` + `title` and at
least one line item; optional `notes`, `due_date`, `status` (validated against
`ALLOWED_STATUS` = draft/issued/paid/overdue/void/canceled/in_progress/finished/live,
default `draft`), `discount_amount_cents`, `tax_amount_cents`. `isCents` enforces
integer cents. **Amounts are recomputed server-side:** subtotal =
Σ(quantity × unit_amount_cents), total = subtotal − discount + tax. Each line
item's own `total_amount_cents` is a **Postgres GENERATED column**, so the DB
computes it and the route must not insert it.

**Write path.** Creation calls the `create_invoice_with_items` Postgres **RPC**
(one atomic transaction — invoice + all items together, so a payable invoice can
never be left half-written); the update path calls `update_invoice_with_items`.
Both handle the "migration not applied" case (`PGRST202` / missing-function) by
returning a clear error (e.g. 503) instead of a raw 500. On success it returns
`201 { invoice, items }`.

**Reads/writes:** writes `invoices` + `invoice_items` via the RPCs (service role);
logs to `admin_activity_log`. No Stripe here — this route only defines the
invoice; payment happens through [[invoices-pay]] + the webhook.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`.

- **2026-06-30** — `ALLOWED_STATUS` extended with in_progress/finished/live (single
  source of truth; creation still only uses draft/issued). _(Session: `invoice-status-workflow-recent-payments`.)_
- **2026-06-24** — Validate + store a `billing_type` (whitelist, default
  `one_time`) and pass `p_billing_type` to the RPC; return a clear 503 when the
  migration isn't applied. _(Note: invoices later became one-time-only again.
  Session: `subscription-invoicing-gap`.)_
- **2026-06-22** — Switched creation to the atomic `create_invoice_with_items`
  RPC so the invoice and its items are written in one transaction (no half-written
  payable invoice). _(Session: `g1-atomic-invoice-rpc`.)_
- **2026-06-22** — Fixed the line-item total to use the DB-generated
  `total_amount_cents` column instead of a client-supplied `line_total_cents`.
  _(Session: `invoice-line-total-fix`.)_
- **2026-06-22** — Created the route: the admin-gated invoice-creation endpoint.
  _(Session: `admin-invoices-route`.)_

## Notes & gotchas

- **Never trust client amounts.** Subtotal/total are recomputed here; line-item
  totals come from the GENERATED column. Don't insert `total_amount_cents` on
  items or accept a client-sent total.
- Same admin security boundary as [[admin]]: the bearer token + admin-email check
  is server-side; RLS blocks any client-side invoice write.
- Keep the service-role key server-side only.
- The create/update RPCs live in `db/invoices-schema.sql` (+ `db/invoices-update.sql`);
  if the DB isn't migrated the route returns a clear error rather than crashing —
  preserve that.

## Related parts

- [[dashboard-admin]] — the Invoices tab whose create/edit form posts here.
- [[invoices-pay]] — how the client pays an invoice created by this route.
- [[admin]] — shares the same auth gate; the admin SPA's other actions go there.
- [[webhook]] — marks the invoice paid after the client pays.
- [[db-invoices]] — the `invoices` / `invoice_items` schema, the GENERATED column, and the create/update RPCs.
