# WebSharke Admin Dashboard — Setup

The admin dashboard lives **inside `dashboard.html`**. The same page now serves
two experiences:

- **Regular clients** → the normal client dashboard (unchanged), plus a clear
  payment-status banner when they are unpaid / past due / canceled.
- **Admin** (`weeldridge09@gmail.com` only) → a dark "business control panel"
  with sidebar navigation, tables, charts, a global search bar, and a right-side
  editing drawer.

The admin view is only shown when the signed-in user's email matches the admin
email. **That UI gate is convenience only** — the real security is server-side:
every admin read and write goes through `/api/admin`, which re-verifies the
caller's Supabase token and email before doing anything and returns `403`
otherwise. The browser never sees the service-role key.

---

## 1. Run the database migration

Open the Supabase SQL editor and run **`db/admin-schema.sql`**. It is idempotent
(safe to run more than once). It:

1. Adds `account_status` (`active` / `suspended` / `banned`), `domain`, and
   `terms_agreed` to `project_inquiries`.
2. Adds payment/plan columns to `subscriptions`
   (`plan_name`, `plan_interval`, `website_type`, `amount`,
   `current_period_end`, `last_payment_date`, `domain`, `created_at`).
3. Creates the **`websites`** table (site purchases / build tracking).
4. Creates the **`admin_activity_log`** table (audit trail).
5. Enables Row Level Security with owner-only reads + admin-everything policies
   (defence in depth — the public onboarding insert keeps working).

> If you change the admin email, update it in **three** places: the
> `public.is_admin()` SQL function, the `ADMIN_EMAIL` env var (below), and the
> `ADMIN_EMAIL` constant in `dashboard.html`'s page-load gate.

## 2. Environment variables (hosting platform — e.g. Vercel)

The admin API reuses the same secrets the existing functions already need:

| Variable | Used by | Notes |
|---|---|---|
| `SUPABASE_URL` | `api/admin.js`, `api/webhook.js`, `api/customer-portal.js` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | same | **Server only.** Never in the browser. |
| `ADMIN_EMAIL` | `api/admin.js` | Optional; defaults to `weeldridge09@gmail.com` |
| `STRIPE_SECRET_KEY` | all Stripe functions | **Server only.** Secret key (`sk_…`). |
| `STRIPE_WEBHOOK_SECRET` | `api/webhook.js` | Signing secret (`whsec_…`) for the `/api/webhook` endpoint. |
| `STRIPE_PUBLISHABLE_KEY` | `api/subscriptions/activate.js`, `api/invoices/pay.js` | **Required** for the client-side Payment Element. Returned to the browser (`pk_…`, safe to expose). Without it the card form never mounts → "Payments aren't available right now." |
| `STRIPE_SUBSCRIPTION_PRODUCT_ID` | `api/subscriptions/activate.js`, `api/invoices/pay.js` (monthly/annual) | **Required** to activate a subscription / pay a recurring invoice. The shared Stripe **Product** (`prod_…`) the inline recurring `price_data` attaches to (see §2a). Without it, activation returns 500 "Subscription billing is not configured yet." and **no card form appears.** |

> **All Stripe values must be in the SAME mode** — either all **Test** (`sk_test_…` /
> `pk_test_…` + a test-mode Product + a test-mode webhook) or all **Live**. Mixing a test
> publishable key with a live Product (or vice-versa) → "No such product" / mode errors.

### 2a. Create the shared Stripe Product (`STRIPE_SUBSCRIPTION_PRODUCT_ID`)

Custom subscriptions and monthly/annual invoices bill an **inline price** that Stripe requires
to reference a Product. You create that Product once:

1. Stripe Dashboard → confirm the **mode** (Test/Live) matches your keys (toggle, top-right).
2. **Products → Add product** → name it e.g. `WebSharke Hosting`. **No price is needed** — the
   code supplies the amount + interval inline per subscription/invoice. Save.
3. Copy the **product id** (`prod_…`) and set it as `STRIPE_SUBSCRIPTION_PRODUCT_ID` in Vercel,
   then **redeploy** (env-var changes only take effect on a new deployment).

### 2b. Stripe webhook events

Register the endpoint **`https://<your-domain>/api/webhook`** in Stripe (Developers → Webhooks),
copy its signing secret into `STRIPE_WEBHOOK_SECRET`, and enable these events. The webhook is the
**only** writer of `status='active'` / invoice `paid` — without `invoice.paid`, a card charges but
the dashboard never reflects it:

`invoice.paid` · `invoice.payment_failed` · `customer.subscription.created` ·
`customer.subscription.updated` · `customer.subscription.deleted` ·
`payment_intent.succeeded` · `payment_intent.payment_failed`

## 3. Payment data

`subscriptions.status` is the source of truth for payment state on the dashboard
(not a live Stripe call). The Stripe webhook (`api/webhook.js`) now also syncs
`plan_name`, `plan_interval`, `amount`, `current_period_end`, and
`last_payment_date`, and maps Stripe's `invoice.payment_failed` →
`past_due` and `invoice.paid` → `active`. Statuses surfaced:
`active`, `unpaid`, `past_due`, `canceled`.

The admin can also override payment status manually (Mark Active / Mark Unpaid /
Past Due / Cancel / Edit Plan) — every change is written to
`admin_activity_log`.

## 4. What the admin can do

- **Overview** — metric cards + charts (subscription, payment status, website
  type, site purchases over time) + recent activity.
- **Users** — all `project_inquiries` columns (long text truncated, full text in
  the drawer) + assigned domain; edit / suspend / ban / delete; filters, sort,
  search, infinite scroll, CSV export, skeletons, empty states.
- **Onboarding Forms** — editable intake answers via the drawer; CSV export.
- **Payments** — per-client subscription state, amount, billing, dates, linked
  website/domain; mark active/unpaid, cancel, edit plan; CSV export.
- **Websites** — view / create / edit site records (user, domain, type, status,
  notes); CSV export.
- **Domains** — view & assign domains to users/sites.
- **Alerts** — unpaid clients, missing domains, suspended/banned users, new
  onboarding, websites waiting on client; click → opens the record drawer.
- **Activity Log** — full audit trail with search/filters/sort.
- **Settings** — admin email, connection indicators, table density.

Dangerous actions (delete, ban, suspend, cancel subscription, mark unpaid) show a
confirmation modal first. Success/error toasts surface the real API/Supabase
message on failure.
