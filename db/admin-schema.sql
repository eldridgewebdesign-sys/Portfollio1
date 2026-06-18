-- =====================================================================
-- WebSharke — Admin dashboard schema migration
-- =====================================================================
-- Run this in the Supabase SQL editor (Project → SQL → New query).
--
-- It is SAFE to run more than once: every statement uses
-- IF NOT EXISTS / idempotent guards, so re-running will not drop data
-- or error on already-applied changes.
--
-- What it does:
--   1. Adds account status + domain/terms columns to project_inquiries.
--   2. Makes sure the subscriptions table can describe payment state,
--      plan, amount, billing type and dates for the Payments tab.
--   3. Creates the `websites` table (site purchases / build tracking).
--   4. Creates the `admin_activity_log` table (audit trail).
--   5. Enables Row Level Security on the new tables and the existing
--      ones, with policies that:
--        - let a signed-in client read ONLY their own rows, and
--        - let the admin email read/write everything.
--      All dangerous admin writes still go through the server-side
--      /api/admin function (service role) — these RLS policies are a
--      second layer of defence, never the only one.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Helper: who is the admin? Centralised so every policy agrees.
--    Returns true when the current JWT's email is the admin email.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    lower(nullif(current_setting('request.jwt.claims', true), '')::json ->> 'email'),
    ''
  ) = 'weeldridge09@gmail.com';
$$;

-- ---------------------------------------------------------------------
-- 1. project_inquiries — account status + domain + terms columns.
-- ---------------------------------------------------------------------
alter table public.project_inquiries
  add column if not exists account_status text not null default 'active';

-- Constrain account_status to the three allowed values.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'project_inquiries_account_status_chk'
  ) then
    alter table public.project_inquiries
      add constraint project_inquiries_account_status_chk
      check (account_status in ('active','suspended','banned'));
  end if;
end$$;

alter table public.project_inquiries
  add column if not exists domain text;

alter table public.project_inquiries
  add column if not exists terms_agreed boolean not null default true;

-- ---------------------------------------------------------------------
-- 2. subscriptions — payment status + plan / billing / amount / dates.
--    These are all additive; the Stripe webhook keeps `status` in sync.
-- ---------------------------------------------------------------------
-- Make sure the table exists at all (it does in production, but this
-- keeps the migration self-contained for fresh projects).
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'active',
  created_at timestamptz default now()
);

alter table public.subscriptions
  add column if not exists plan_name text;
alter table public.subscriptions
  add column if not exists plan_interval text;           -- 'month' | 'year' (billing type)
alter table public.subscriptions
  add column if not exists website_type text;            -- 'frontend' | 'full_stack'
alter table public.subscriptions
  add column if not exists amount numeric;               -- in dollars
alter table public.subscriptions
  add column if not exists current_period_end timestamptz; -- next billing date
alter table public.subscriptions
  add column if not exists last_payment_date timestamptz;
alter table public.subscriptions
  add column if not exists domain text;
alter table public.subscriptions
  add column if not exists created_at timestamptz default now();

-- Allowed payment-status values (active / unpaid / past_due / canceled).
-- We do NOT add a hard CHECK here because Stripe can also send other
-- native statuses (trialing, incomplete, etc.); the dashboard maps them.

-- ---------------------------------------------------------------------
-- 3. websites — site purchases / build tracking, linked to a user.
-- ---------------------------------------------------------------------
create table if not exists public.websites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,                                  -- auth.users.id of the client
  client_name text,                              -- denormalised for quick display
  client_email text,
  domain text,
  website_type text default 'frontend'
    check (website_type in ('frontend','full_stack')),
  status text default 'not_started'
    check (status in ('not_started','in_progress','waiting_on_client','complete','live')),
  notes text,
  purchase_date timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists websites_user_id_idx on public.websites (user_id);
create index if not exists websites_status_idx on public.websites (status);

-- ---------------------------------------------------------------------
-- 4. admin_activity_log — audit trail of every admin action.
-- ---------------------------------------------------------------------
create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  entity_type text,
  entity_id text,
  affected_user_id text,
  changed_field text,
  old_value text,
  new_value text,
  created_at timestamptz default now()
);

create index if not exists admin_activity_log_created_idx
  on public.admin_activity_log (created_at desc);

-- ---------------------------------------------------------------------
-- 5. Row Level Security.
-- ---------------------------------------------------------------------
alter table public.project_inquiries enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.websites          enable row level security;
alter table public.admin_activity_log enable row level security;

-- project_inquiries: owner can read own row; admin can do everything.
drop policy if exists piq_owner_select on public.project_inquiries;
create policy piq_owner_select on public.project_inquiries
  for select using (auth.uid() = user_id or public.is_admin());

-- INSERT stays open: the onboarding page is a PUBLIC lead form and may run
-- before a session exists (when email confirmation is on). Reads/updates are
-- still locked to the owner/admin below, so an inserted row can only ever be
-- read back by its owner or the admin.
drop policy if exists piq_public_insert on public.project_inquiries;
create policy piq_public_insert on public.project_inquiries
  for insert with check (true);

drop policy if exists piq_admin_all on public.project_inquiries;
create policy piq_admin_all on public.project_inquiries
  for all using (public.is_admin()) with check (public.is_admin());

-- subscriptions: owner can read own; admin everything.
drop policy if exists sub_owner_select on public.subscriptions;
create policy sub_owner_select on public.subscriptions
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists sub_admin_all on public.subscriptions;
create policy sub_admin_all on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

-- websites: owner can read own; admin everything.
drop policy if exists web_owner_select on public.websites;
create policy web_owner_select on public.websites
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists web_admin_all on public.websites;
create policy web_admin_all on public.websites
  for all using (public.is_admin()) with check (public.is_admin());

-- admin_activity_log: admin only (no client access at all).
drop policy if exists log_admin_all on public.admin_activity_log;
create policy log_admin_all on public.admin_activity_log
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Done. The server-side /api/admin function uses the SERVICE ROLE key,
-- which bypasses RLS entirely, so admin writes work regardless of the
-- policies above. The policies exist so that even direct anon-key
-- access from a browser can never read or change another user's data.
-- =====================================================================
