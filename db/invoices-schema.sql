-- =====================================================================
-- WebSharke — Custom invoices schema migration
-- =====================================================================
-- Run this in the Supabase SQL editor (Project -> SQL -> New query).
--
-- It is SAFE to run more than once (idempotent: IF NOT EXISTS guards and
-- additive column adds). It pairs with the POST /api/admin/invoices
-- serverless route (api/admin/invoices.js), which is the ONLY writer of
-- these tables and runs with the service-role key.
--
-- Requires the public.is_admin() helper from db/admin-schema.sql — run
-- that migration first if you have not already.
--
-- IMPORTANT: the /api/admin/invoices route writes EXACTLY the columns
-- defined below. If your existing tables use different column names, run
-- this migration to add the matching columns (it will not drop yours), or
-- rename your columns to match these names.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. invoices — one row per invoice, owned by a client (auth.users.id).
-- ---------------------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  notes text,
  due_date date,
  status text not null default 'draft'
    check (status in ('draft','issued','paid','overdue','void','canceled')),
  subtotal_amount_cents bigint not null default 0 check (subtotal_amount_cents >= 0),
  discount_amount_cents bigint not null default 0 check (discount_amount_cents >= 0),
  tax_amount_cents      bigint not null default 0 check (tax_amount_cents >= 0),
  total_amount_cents    bigint not null default 0 check (total_amount_cents >= 0),
  created_at timestamptz not null default now()
);

-- Idempotent guards: add any column missing from a pre-existing table.
alter table public.invoices add column if not exists client_user_id uuid;
alter table public.invoices add column if not exists title text;
alter table public.invoices add column if not exists notes text;
alter table public.invoices add column if not exists due_date date;
alter table public.invoices add column if not exists status text default 'draft';
alter table public.invoices add column if not exists subtotal_amount_cents bigint default 0;
alter table public.invoices add column if not exists discount_amount_cents bigint default 0;
alter table public.invoices add column if not exists tax_amount_cents bigint default 0;
alter table public.invoices add column if not exists total_amount_cents bigint default 0;
alter table public.invoices add column if not exists created_at timestamptz default now();

create index if not exists invoices_client_user_id_idx on public.invoices (client_user_id);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_created_idx on public.invoices (created_at desc);

-- ---------------------------------------------------------------------
-- 2. invoice_items — line items, each linked to one invoice.
-- ---------------------------------------------------------------------
create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  name text not null,
  description text,
  quantity integer not null default 1 check (quantity >= 1),
  unit_amount_cents bigint not null default 0 check (unit_amount_cents >= 0),
  -- Per-line total is DERIVED, never written: a STORED GENERATED column the
  -- database computes from quantity * unit_amount_cents. The /api/admin/invoices
  -- route inserts only quantity + unit_amount_cents and Postgres fills this in,
  -- so it can never drift from the inputs.
  total_amount_cents bigint generated always as (quantity * unit_amount_cents) stored,
  created_at timestamptz not null default now()
);

alter table public.invoice_items add column if not exists invoice_id uuid;
alter table public.invoice_items add column if not exists name text;
alter table public.invoice_items add column if not exists description text;
alter table public.invoice_items add column if not exists quantity integer default 1;
alter table public.invoice_items add column if not exists unit_amount_cents bigint default 0;
-- Idempotent guard for the generated per-line total (see the create table above).
alter table public.invoice_items add column if not exists total_amount_cents
  bigint generated always as (quantity * unit_amount_cents) stored;
alter table public.invoice_items add column if not exists created_at timestamptz default now();

create index if not exists invoice_items_invoice_id_idx on public.invoice_items (invoice_id);

-- ---------------------------------------------------------------------
-- 3. Row Level Security.
--    A client may READ only their own invoices / line items; the admin
--    can do everything. There is NO client INSERT/UPDATE/DELETE policy,
--    so the anon key cannot create or edit invoices from the browser.
--    The server route uses the service-role key (bypasses RLS) — these
--    policies are defence in depth, never the only control.
-- ---------------------------------------------------------------------
alter table public.invoices      enable row level security;
alter table public.invoice_items enable row level security;

-- invoices: owner can read own; admin everything.
drop policy if exists inv_owner_select on public.invoices;
create policy inv_owner_select on public.invoices
  for select using (auth.uid() = client_user_id or public.is_admin());

drop policy if exists inv_admin_all on public.invoices;
create policy inv_admin_all on public.invoices
  for all using (public.is_admin()) with check (public.is_admin());

-- invoice_items: readable when the parent invoice belongs to the caller
-- (or caller is admin); writable by admin only.
drop policy if exists invitem_owner_select on public.invoice_items;
create policy invitem_owner_select on public.invoice_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id and i.client_user_id = auth.uid()
    )
  );

drop policy if exists invitem_admin_all on public.invoice_items;
create policy invitem_admin_all on public.invoice_items
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Done. Only /api/admin/invoices (service role) writes these tables;
-- clients can read their own invoices but can never create or edit them.
-- =====================================================================
