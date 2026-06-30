-- =====================================================================
-- WebSharke — Invoices are ONE-TIME only: drop redundant recurring data
-- =====================================================================
-- Run this ONCE in the Supabase SQL editor (Project → SQL → New query).
--
-- Context: invoices used to support recurring billing (billing_type
-- monthly/annual, which started a Stripe subscription on pay). That overlapped
-- with the Subscriptions tab (public.subscriptions). Invoices are now ALWAYS
-- one-time charges (a single Stripe PaymentIntent) and recurring billing lives
-- solely in public.subscriptions. This migration removes the now-redundant
-- invoice columns + the recurring-renewal history table, and rebuilds the
-- create_invoice_with_items() RPC without its billing_type parameter.
--
-- It is SAFE to run more than once (every statement uses IF EXISTS guards).
--
-- ⚠ DESTRUCTIVE: the dropped columns / table hold recurring-invoice data only.
-- If any invoices were ever billed monthly/annual, their Stripe linkage and
-- renewal history are removed here (the invoices themselves are kept). One-time
-- invoices are unaffected. Take a snapshot first if you want a rollback point.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Drop the redundant recurring columns from public.invoices.
--    billing_type was always 'one_time' going forward; the stripe_* / next_*
--    columns only ever applied to monthly/annual invoice-subscriptions.
--    (stripe_payment_intent_id + paid_at are KEPT — one-time invoices use them.)
-- ---------------------------------------------------------------------
alter table public.invoices drop column if exists billing_type;
alter table public.invoices drop column if exists stripe_customer_id;
alter table public.invoices drop column if exists stripe_subscription_id;
alter table public.invoices drop column if exists stripe_invoice_id;
alter table public.invoices drop column if exists next_payment_at;

-- The index that existed only to look invoices up by their subscription id is
-- dropped automatically with the column above; drop it explicitly too in case a
-- pre-existing install named it independently.
drop index if exists public.invoices_stripe_subscription_idx;

-- The billing_type CHECK constraint is dropped with the column on modern
-- Postgres; guard explicitly for any install where it lingered.
alter table public.invoices drop constraint if exists invoices_billing_type_check;

-- ---------------------------------------------------------------------
-- 2. Drop the recurring-renewal history table entirely.
--    invoice_payments recorded one row per recurring charge. One-time invoices
--    never used it, so it is redundant. (CASCADE removes its policies/indexes.)
-- ---------------------------------------------------------------------
drop table if exists public.invoice_payments cascade;

-- ---------------------------------------------------------------------
-- 3. Rebuild create_invoice_with_items() WITHOUT p_billing_type.
--    Drop every prior overload first so PostgREST sees exactly one signature,
--    then recreate + re-grant (create or replace resets privileges to PUBLIC,
--    so the revoke/grant MUST run with it).
-- ---------------------------------------------------------------------
drop function if exists public.create_invoice_with_items(
  uuid, text, text, date, text, bigint, bigint, bigint, bigint, jsonb
);
drop function if exists public.create_invoice_with_items(
  uuid, text, text, date, text, text, bigint, bigint, bigint, bigint, jsonb
);

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
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'invoice must have at least one line item';
  end if;

  insert into public.invoices (
    client_user_id, title, notes, due_date, status,
    subtotal_amount_cents, discount_amount_cents, tax_amount_cents, total_amount_cents
  ) values (
    p_client_user_id, p_title, p_notes, p_due_date, coalesce(p_status, 'draft'),
    p_subtotal_amount_cents, p_discount_amount_cents, p_tax_amount_cents, p_total_amount_cents
  )
  returning * into v_invoice;

  insert into public.invoice_items (invoice_id, name, description, quantity, unit_amount_cents, sort_order)
  select
    v_invoice.id,
    item->>'name',
    item->>'description',
    coalesce((item->>'quantity')::int, 1),
    (item->>'unit_amount_cents')::bigint,
    ord::int
  from jsonb_array_elements(p_items) with ordinality as t(item, ord);

  select coalesce(jsonb_agg(to_jsonb(it) order by it.sort_order, it.id), '[]'::jsonb)
    into v_items
  from public.invoice_items it
  where it.invoice_id = v_invoice.id;

  return jsonb_build_object('invoice', to_jsonb(v_invoice), 'items', v_items);
end;
$$;

revoke all on function public.create_invoice_with_items(
  uuid, text, text, date, text, bigint, bigint, bigint, bigint, jsonb
) from public;
grant execute on function public.create_invoice_with_items(
  uuid, text, text, date, text, bigint, bigint, bigint, bigint, jsonb
) to service_role;

-- Reload the PostgREST schema cache so the new signature resolves immediately.
notify pgrst, 'reload schema';

-- =====================================================================
-- Done. Invoices are one-time only; recurring billing lives in
-- public.subscriptions (admin Subscriptions tab → api/subscriptions/activate).
-- =====================================================================
