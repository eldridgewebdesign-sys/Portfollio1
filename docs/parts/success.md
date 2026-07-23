# Payment Success — `success.html`

> The post-payment landing page. Verifies the charge really cleared before it says "success."

- **File:** `success.html`
- **Type:** page (static HTML, inline CSS + JS)
- **Route:** `/success`
- **Last reviewed:** 2026-07-12

## What it does

Where Stripe sends the customer after a redirect-based payment. Its whole job is to
**not lie**: reaching this URL does not mean the payment cleared, so the page starts
neutral ("Finishing up…") and only shows "Payment successful!" once the database —
written by `api/webhook.js` — actually confirms the invoice is paid or the
subscription is active. If the webhook is still catching up, it shows a calm
"processing" state instead of a fake success. It never writes status from the browser.

## How everything inside works

Standard page shell (vendored fonts, ocean background, masked logo, translucent card),
plus the Supabase scripts and one IIFE.

- **Read the query string.** `type`, `invoice_id`, `subscription_id`. An explicit
  `?type=` wins; otherwise it infers subscription-vs-invoice from whichever id is
  present. `id` = the relevant one.
- **Three display states:** `showVerifying()` (neutral "Finishing up…"),
  `showProcessing()` (neutral "Payment processing" — used on webhook lag, no session,
  or timeout), and `showConfirmed()` (the real success: checkmark, next-steps copy for
  invoice vs subscription, and a 7s auto-redirect to `/dashboard`).
- **No id or no `db`** → stay on `showProcessing()` and stop. Never claims success it
  can't verify.
- **Verification.** Picks the table (`subscriptions` or `invoices`) and the "done"
  statuses (`active`/`trialing`, or `paid`). `poll()` reads the row's `status` every
  3s up to ~30 tries (~90s), promoting to confirmed when it matches, and settling on
  processing at timeout. At ~5 tries it shows processing to reassure while still checking.
- **Invoice fast-path.** For invoices it first POSTs to **`/api/invoices/confirm`** with
  the bearer token so the *server* reconciles with Stripe and can flip issued→paid
  immediately; if that isn't paid yet it falls back to polling.
- **Session gate.** Verification needs a signed-in session (RLS on the read + the bearer
  token for the confirm route). No session → neutral processing.

## Last five changes

Newest first. From `docs/logs.md`.

- **2026-07-17** — Added a `<head>` preconnect to the Supabase origin (hint only,
  no behavior change). _(Session: `full-site-optimization-pass`.)_
- **2026-06-23** — Rewritten from a static "Payment successful! Your plan is now
  active." (zero verification) into the neutral-by-default, verify-before-success page.
  Promotes to success only on Stripe's `?redirect_status=succeeded` or the in-page
  verification/one-shot flag; `processing`/`failed` states added; no-JS meta-refresh
  bumped to 6s. _(Session: `premature-payment-success-fix`.)_
- _Later additions (the `/api/invoices/confirm` server reconcile + subscription/invoice
  DB polling seen in the current file) build on that rewrite; log the exact session here
  next time this file is touched._

## Notes & gotchas

- Depends on `api/webhook.js` being the source of truth and on `/api/invoices/confirm`
  existing — this page reads status, it never writes it.
- `robots: noindex` — keep it; this is a transactional page, not a marketing one.
- Because it's a redirect target reachable by anyone, a param-less direct visit must
  stay neutral. Don't reintroduce an unconditional success message.

## Related parts

- [[webhook]] — writes the paid/active status this page waits on.
- [[dashboard-client]] — where it redirects after confirming (the RLS-scoped source of truth).
- [[cancel]] — the sibling page for an abandoned payment.
