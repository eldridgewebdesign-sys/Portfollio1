# Invoice Confirm API — `api/invoices/confirm.js`

> Server route the success page calls to reconcile an invoice payment immediately, instead of waiting on the async webhook.

- **File:** `api/invoices/confirm.js`
- **Type:** Vercel serverless function (`POST /api/invoices/confirm`)
- **Secrets used:** `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **Last reviewed:** 2026-07-12

## What it does

After a client finishes the Stripe Payment Element, they're sent to `/success`.
The webhook that marks invoices paid can lag on a cold serverless function, so the
success page calls this route to reconcile right away. It asks Stripe directly
(server-to-server) whether the invoice's PaymentIntent actually succeeded, and —
only if Stripe confirms it succeeded for the **exact** amount and currency — marks
the invoice paid. This is **not** the browser marking itself paid; the server
checks the real PaymentIntent and writes the row. It mirrors the webhook's logic
exactly and is idempotent, so whichever runs first flips the row and the other is
a harmless no-op. The webhook stays the authoritative backstop (it also handles
async methods that succeed later, plus refunds/failures).

## How everything inside works

**Setup.** Stripe client from `STRIPE_SECRET_KEY`; a service-role Supabase client;
a UUID regex; the same secret-free `errorInfo()` diagnostic shape as
[[invoices-pay]].

**Handler flow:**
1. CORS locked to `https://websharke.com`; `OPTIONS` → 204; non-`POST` → 405;
   500 if env vars missing.
2. **Authenticate** — verify the `Bearer` token with `supabaseAdmin.auth.getUser`;
   no/invalid → 401.
3. **Validate** — `invoice_id` must be a valid UUID.
4. **Load + authorize** — fetch the invoice (service role). Not found → 404;
   `client_user_id !== caller.id` → 403.
5. **Short-circuits** — already `paid` → idempotent `{status:"paid"}`; no
   `stripe_payment_intent_id` recorded yet → return current status (the webhook
   will reconcile once the intent from `/api/invoices/pay` succeeds).
6. **Reconcile** — retrieve the PaymentIntent from Stripe. Mark paid **only** when
   `pi.status === "succeeded"` AND `pi.amount` matches `total_amount_cents` AND the
   currency matches — the same money-integrity defence as the webhook. The update
   sets `status:"paid"` + `paid_at` with a `.neq("status","paid")` guard so a
   concurrent webhook can't double-apply. A succeeded-but-mismatched amount/currency
   is logged loudly and **not** marked paid. Still-processing → returns the current
   status + `payment_status` so the success page keeps waiting rather than claiming
   success early.
7. Errors log full detail server-side and return a generic 500 + secret-free `debug`.

**Reads:** the `invoices` row + the Stripe PaymentIntent. **Writes:** only flips
`invoices.status`/`paid_at` when Stripe confirms an exact-match success.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`.

- No changes recorded in the work log; stable. _(This route isn't named in
  `docs/logs.md` or `docs/CHANGELOG.md`. It reconciles the same way the webhook
  does and is referenced by the success page.)_

## Notes & gotchas

- **This is not the browser marking itself paid** — the server verifies the real
  PaymentIntent with Stripe before writing. Keep it that way.
- The exact **amount + currency match** before marking paid is a real
  money-integrity guard — don't relax it to "just mark it paid." It mirrors
  `api/webhook.js` deliberately.
- Idempotent by design: the `paid` early-out and the `.neq("status","paid")` guard
  mean this and the webhook can't conflict. Preserve both.
- The webhook remains the authoritative backstop (async methods, refunds,
  failures) — this route is the fast path, not a replacement.
- Keep the Stripe secret + service-role key server-side; the `errorInfo`
  diagnostic must stay secret-free.

## Related parts

- [[success]] — the page that calls this route on return to reconcile the payment.
- [[invoices-pay]] — creates the PaymentIntent this route verifies.
- [[webhook]] — the authoritative writer of paid status; this mirrors its logic.
- [[db-invoices]] — the `invoices` schema this reconciles.
