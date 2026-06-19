-- =====================================================================
-- WebSharke — One-time orders table (design purchases)
-- =====================================================================
-- Run this in the Supabase SQL editor (Project → SQL → New query).
--
-- Why this exists:
--   One-time design purchases ($750 / $1500, with optional hosting add-on)
--   go through the Stripe Payment Element as PaymentIntents, NOT through
--   subscriptions. Before this table, a successful one-time payment was
--   only logged to the server console and never persisted — so a paying
--   client had no record of their purchase anywhere in the app.
--
--   The Stripe webhook (/api/webhook, payment_intent.succeeded) now upserts
--   each completed one-time payment into this table using the service-role
--   key.
--
-- SAFE to run more than once (idempotent guards throughout).
-- =====================================================================

create table if not exists public.orders (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references auth.users (id) on delete set null,
  stripe_payment_intent_id  text unique not null,
  stripe_customer_id        text,
  price_id                  text,
  amount                    numeric(10,2),
  currency                  text default 'usd',
  status                    text default 'paid',
  paid_at                   timestamptz,
  created_at                timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);

-- ---------------------------------------------------------------------
-- Row Level Security: clients read ONLY their own orders; the admin email
-- reads everything. All writes happen server-side via the service-role key
-- in /api/webhook, which bypasses RLS — so there is no client write policy.
-- (Relies on public.is_admin() created in admin-schema.sql.)
-- ---------------------------------------------------------------------
alter table public.orders enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'orders_select_own'
  ) then
    create policy orders_select_own on public.orders
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'orders_select_admin'
  ) then
    create policy orders_select_admin on public.orders
      for select using (public.is_admin());
  end if;
end$$;
