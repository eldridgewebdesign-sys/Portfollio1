# Previous Invoices — `prev-inv.html`

> The client's full payment history: every invoice WebSharke has issued them — paid, outstanding, and closed.

- **File:** `prev-inv.html`
- **Type:** page (static HTML, inline CSS + JS)
- **Route:** `/prev-inv`
- **Last reviewed:** 2026-07-12

## What it does

This is the client's invoice history page. Where the Invoices page (`/payment`)
focuses on the current/payable invoice, this one lists **all** of a signed-in
client's invoices across every status. Each unpaid, payable invoice gets a "Pay
invoice" link that sends them to `/payment` to actually pay. It's reached from the
dashboard's "View Previous Payments" button. Read-only — it never marks anything
paid itself.

## How everything inside works

Self-contained page — inline CSS, markup, one inline `<script>` over the shared
ocean/navy-teal `cinv-*` styling. Loads the Supabase vendor bundle +
`js/supabase-config.js` (the `db` client). No Stripe.js — this page never charges
a card; it only links to `/payment`.

**Gate.** On load, `db.auth.getUser()` then `db.auth.getSession()`; no user →
`replace()` to `/login`. A "Signed in as …" note shows the email.

**History list.** `loadHistory(user)` reads the caller's own `invoices`
(`id,title,status,total_amount_cents,due_date,paid_at,created_at`, newest first),
RLS-scoped to `user.id`. `buildHistoryCard(iv)` renders each as a read-only card:
title, a status badge (`CLIENT_STATUS_LABEL`), total, and a date (the paid date
for paid invoices, otherwise the created/due date). Empty and load-error states
have their own lines.

**Pay link.** Only invoices in `PAYABLE_STATUSES` (issued/overdue) get a **Pay
invoice** `<a>` pointing to `/payment?invoice_id=<id>` — which opens that invoice's
Stripe payment on the Invoices page. Paid/void/canceled invoices get no button.

**Everything is rendered with `textContent`/`cinvEl`, never `innerHTML`,** so
admin-entered invoice text can't inject markup.

**Reads:** `invoices` only (anon client, RLS-scoped to the signed-in user). No
writes, no server calls.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. This page is new and
stable — only three real changes touch it; all are listed rather than padded.

- **2026-07-17** — Added a `<head>` preconnect to the Supabase origin (hint only,
  no behavior change). _(Session: `full-site-optimization-pass`.)_
- **2026-06-27** — Read-only history card (`buildHistoryCard`) gained the shared
  billing-type / price-label helper block. _(Session: `recurring-invoice-price-labels`.)_
- **2026-06-24** — Created the file: a new, login-gated read-only full
  payment-history page, added alongside the dashboard's "View Previous Payments"
  button and served at `/prev-inv` via `cleanUrls`. _(Session: `dashboard-invoices-tab`.)_

## Notes & gotchas

- **All invoice text is rendered with `textContent`, never `innerHTML`** — keep it
  that way; the data is admin-entered.
- **Data isolation is RLS** (`db/invoices-schema.sql`): the anon key only returns
  the caller's own invoices. A client can never see or pay another client's
  invoice. Verify the RLS policies in the Supabase dashboard when reasoning about
  access.
- This page **never** marks an invoice paid — it only links to `/payment`. The
  webhook is the sole writer of paid status.
- `/prev-inv` is served from `prev-inv.html` via `vercel.json` `cleanUrls` — link
  to the extensionless route.

## Related parts

- [[payment]] — the Invoices page the "Pay invoice" links open (`?invoice_id=…`).
- [[dashboard-client]] — the "View Previous Payments" button that links here.
- [[webhook]] — the only writer of paid status.
- [[db-invoices]] — the `invoices` schema and RLS this page depends on.
- [[supabase-config]] — provides the shared `db` client.
