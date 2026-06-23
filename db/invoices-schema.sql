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
  currency text not null default 'usd',
  subtotal_amount_cents bigint not null default 0 check (subtotal_amount_cents >= 0),
  discount_amount_cents bigint not null default 0 check (discount_amount_cents >= 0),
  tax_amount_cents      bigint not null default 0 check (tax_amount_cents >= 0),
  total_amount_cents    bigint not null default 0 check (total_amount_cents >= 0),
  -- Stripe payment state (written by api/webhook.js on payment_intent.succeeded;
  -- the PaymentIntent id is also saved by api/invoices/pay when the intent opens).
  paid_at timestamptz,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

-- Idempotent guards: add any column missing from a pre-existing table.
alter table public.invoices add column if not exists client_user_id uuid;
alter table public.invoices add column if not exists title text;
alter table public.invoices add column if not exists notes text;
alter table public.invoices add column if not exists due_date date;
alter table public.invoices add column if not exists status text default 'draft';
alter table public.invoices add column if not exists currency text not null default 'usd';
alter table public.invoices add column if not exists subtotal_amount_cents bigint default 0;
alter table public.invoices add column if not exists discount_amount_cents bigint default 0;
alter table public.invoices add column if not exists tax_amount_cents bigint default 0;
alter table public.invoices add column if not exists total_amount_cents bigint default 0;
alter table public.invoices add column if not exists paid_at timestamptz;
alter table public.invoices add column if not exists stripe_payment_intent_id text;
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
  -- Preserves the admin's entered line-item order (set from the input array index
  -- by create_invoice_with_items). All items on one invoice are inserted in a single
  -- statement so they share created_at — without this they would have no stable order.
  sort_order integer,
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
alter table public.invoice_items add column if not exists sort_order integer;
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

-- ---------------------------------------------------------------------
-- 4. Atomic create: the invoice header + all its line items in ONE
--    transaction. A plpgsql function body executes as a single
--    transaction, so if ANY line-item insert fails the whole call rolls
--    back — it is impossible to end up with an invoice that has no line
--    items (no orphan rows, no application-side compensating delete).
--    Called only by the POST /api/admin/invoices route (service role).
--
--    SECURITY: EXECUTE is revoked from PUBLIC and granted ONLY to
--    service_role, so the anon / authenticated browser keys can never
--    call this RPC. It is also SECURITY INVOKER (the default), so even
--    if a grant were ever added, the invoice / invoice_items RLS policies
--    (admin-only writes) still apply to any non-service caller.
--
--    ⚠ IMPORTANT: `create or replace function` RESETS this function's
--    privileges to the Postgres default (EXECUTE to PUBLIC). If you edit the
--    body and re-run it, you MUST re-run the revoke/grant block right below it
--    as well (run them together) — otherwise the RPC becomes callable by
--    anon/authenticated again. The RLS policies above still backstop it, but
--    do not rely on that; keep the grant correct.
-- ---------------------------------------------------------------------
create or replace function public.create_invoice_with_items(
  p_client_user_id uuid,
  p_title text,
  p_notes text,
  p_due_date date,
  p_status text,
  p_subtotal_amount_cents bigint,
  p_discount_amount_cents bigint,
  p_tax_amount_cents bigint,
  p_total_amount_cents bigint,
  p_items jsonb
)
returns jsonb
language plpgsql
as $$
declare
  v_invoice public.invoices;
  v_items jsonb;
begin
  -- Defence in depth: the route already rejects an empty item list (400),
  -- but the function refuses one too so it can never create a header alone.
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'invoice must have at least one line item';
  end if;

  -- 1) Insert the invoice header. The money fields are computed AND validated by
  --    the server route (subtotal = Σ qty*unit, total = subtotal − discount + tax,
  --    discount <= subtotal, total >= 0, caps), so they are passed in, not recomputed
  --    here. The route (service_role) is the ONLY caller and the sole authority for
  --    money consistency — the DB does not re-derive these from p_items, so do not
  --    grant EXECUTE to any other role (see the security note above).
  insert into public.invoices (
    client_user_id, title, notes, due_date, status,
    subtotal_amount_cents, discount_amount_cents, tax_amount_cents, total_amount_cents
  ) values (
    p_client_user_id, p_title, p_notes, p_due_date, coalesce(p_status, 'draft'),
    p_subtotal_amount_cents, p_discount_amount_cents, p_tax_amount_cents, p_total_amount_cents
  )
  returning * into v_invoice;

  -- 2) Insert the line items. total_amount_cents is a generated column, so it
  --    is NEVER inserted — Postgres computes it from quantity * unit_amount_cents.
  --    WITH ORDINALITY captures each item's index in the input array; we store it
  --    as sort_order so the admin's entered order survives (all rows share created_at).
  insert into public.invoice_items (invoice_id, name, description, quantity, unit_amount_cents, sort_order)
  select
    v_invoice.id,
    item->>'name',
    item->>'description',
    coalesce((item->>'quantity')::int, 1),
    (item->>'unit_amount_cents')::bigint,
    ord::int
  from jsonb_array_elements(p_items) with ordinality as t(item, ord);

  -- 3) Return the invoice + its items (with the DB-generated per-line totals),
  --    in the admin's entered order (sort_order), as one JSON object: { invoice, items }.
  select coalesce(jsonb_agg(to_jsonb(it) order by it.sort_order, it.id), '[]'::jsonb)
    into v_items
  from public.invoice_items it
  where it.invoice_id = v_invoice.id;

  return jsonb_build_object('invoice', to_jsonb(v_invoice), 'items', v_items);
end;
$$;

-- Only the server route (service role) may execute this; never the browser keys.
revoke all on function public.create_invoice_with_items(
  uuid, text, text, date, text, bigint, bigint, bigint, bigint, jsonb
) from public;
grant execute on function public.create_invoice_with_items(
  uuid, text, text, date, text, bigint, bigint, bigint, bigint, jsonb
) to service_role;

-- Expose the new/updated function to PostgREST immediately — otherwise the first
-- /api/admin/invoices call after this migration can 404 (PGRST202) until the
-- schema cache auto-reloads.
notify pgrst, 'reload schema';

-- =====================================================================
-- Done. Only /api/admin/invoices (service role) writes these tables —
-- now via the atomic create_invoice_with_items() RPC; clients can read
-- their own invoices but can never create or edit them.
-- =====================================================================
