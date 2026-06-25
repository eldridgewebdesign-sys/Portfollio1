-- =====================================================================
-- WebSharke — Custom recurring hosting subscriptions (schema migration)
-- =====================================================================
-- Run this in the Supabase SQL editor (Project → SQL → New query).
--
-- It is SAFE to run more than once: every statement uses
-- `add column if not exists` / `create … if not exists`, so re-running
-- never drops data or errors on already-applied changes.
--
-- What it does:
--   1. Adds the columns the EXISTING public.subscriptions table needs to
--      describe an admin-created, client-activated custom recurring
--      subscription (label, amount in cents, interval in months, category,
--      activation/cancel timestamps, etc.). These are ADDITIVE — the live
--      Stripe-plan hosting rows and the webhook that syncs them are
--      unaffected.
--   2. Adds a partial unique index on stripe_subscription_id so the
--      webhook's upsert(onConflict:"stripe_subscription_id") has a constraint
--      to match. It is partial (… where stripe_subscription_id is not null)
--      so the many PENDING rows (which have a NULL subscription id until the
--      client activates) never collide with each other.
--
-- Row Level Security is already correct from db/admin-schema.sql:
--   • sub_owner_select  → a signed-in client can SELECT only their own rows.
--   • sub_admin_all     → the admin email can do everything.
--   There is NO client INSERT/UPDATE policy, so a client can never create or
--   edit a subscription from the browser. Admin creation and client
--   activation both write through the server-side /api routes (service role),
--   which is the only place that bypasses RLS. No policy change is needed.
--
-- The `status` column intentionally has NO CHECK constraint (see
-- db/admin-schema.sql), so the new 'pending_activation' / 'incomplete'
-- values it can now hold need no schema change. Lifecycle:
--   pending_activation  (admin created it; no Stripe object yet)
--     → incomplete       (client started activation; Stripe sub created, unpaid)
--     → active|trialing  (first payment succeeded — webhook is the authority)
--     → past_due|unpaid  (a renewal failed)
--     → canceled         (admin canceled, or Stripe ended it)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Additive columns on the existing subscriptions table.
-- ---------------------------------------------------------------------
alter table public.subscriptions
  add column if not exists amount_cents bigint;            -- recurring amount in cents (admin-set, exact)
alter table public.subscriptions
  add column if not exists interval_months int;            -- billing cycle length in months (1..12)
alter table public.subscriptions
  add column if not exists currency text default 'usd';
alter table public.subscriptions
  add column if not exists category text;                  -- 'hosting' for these rows; NULL for legacy plans
alter table public.subscriptions
  add column if not exists activated_at timestamptz;       -- first time it became active/trialing
alter table public.subscriptions
  add column if not exists canceled_at timestamptz;
alter table public.subscriptions
  add column if not exists current_period_start timestamptz;
alter table public.subscriptions
  add column if not exists updated_at timestamptz;
alter table public.subscriptions
  add column if not exists created_by uuid;                -- admin user id that created the row
alter table public.subscriptions
  add column if not exists stripe_price_id text;           -- reserved; inline price_data means usually NULL

-- ---------------------------------------------------------------------
-- 2. Partial unique index for the webhook's upsert conflict target.
--    Partial (where … is not null) so multiple PENDING rows (NULL id) coexist.
-- ---------------------------------------------------------------------
create unique index if not exists subscriptions_stripe_sub_uniq
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- ---------------------------------------------------------------------
-- 3. Helpful filter index for the admin "Subscriptions" list (category).
-- ---------------------------------------------------------------------
create index if not exists subscriptions_category_idx
  on public.subscriptions (category);

-- =====================================================================
-- Done. Admin create + client activate + admin cancel all run server-side
-- (/api/admin/subscriptions, /api/subscriptions/activate) with the SERVICE
-- ROLE key. The RLS policies above are a second layer of defence so that
-- even direct anon-key access from a browser can never read or change
-- another user's subscription.
-- =====================================================================
