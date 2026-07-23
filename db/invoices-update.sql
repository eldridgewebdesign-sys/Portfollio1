-- =====================================================================
-- WebSharke — Edit an existing invoice (header + line items) ATOMICALLY
-- =====================================================================
-- Run this in the Supabase SQL editor (Project → SQL → New query).
--
-- Pairs with the POST /api/admin/invoices route (op:"update"). It mirrors
-- create_invoice_with_items (db/invoices-schema.sql) but for editing: it
-- updates the invoice header and REPLACES all of its line items inside ONE
-- transaction, so an edit can never leave the invoice half-updated or with
-- no line items. Safe to run more than once (create or replace).
--
-- SECURITY: identical model to create_invoice_with_items — EXECUTE is revoked
-- from PUBLIC and granted ONLY to service_role, and the function is SECURITY
-- INVOKER, so the anon/authenticated browser keys can never call it and the
-- invoices/invoice_items RLS policies (admin-only writes) still backstop it.
--
-- ⚠ `create or replace function` RESETS privileges to the Postgres default
-- (EXECUTE to PUBLIC). If you edit the body and re-run it, you MUST re-run the
-- revoke/grant block below as well (run them together).
-- =====================================================================

create or replace function public.update_invoice_with_items(
  p_invoice_id uuid,
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
  -- Defence in depth: never allow an edit that removes every line item.
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'invoice must have at least one line item';
  end if;

  -- 1) Update the header. Money fields are computed AND validated by the server
  --    route (same rules as create), so they are passed in, not recomputed here.
  --    paid_at, stripe_payment_intent_id and created_at are intentionally NOT
  --    touched — editing an invoice's contents never rewrites its payment history.
  update public.invoices set
    client_user_id = p_client_user_id,
    title = p_title,
    notes = p_notes,
    due_date = p_due_date,
    status = coalesce(p_status, status),
    subtotal_amount_cents = p_subtotal_amount_cents,
    discount_amount_cents = p_discount_amount_cents,
    tax_amount_cents = p_tax_amount_cents,
    total_amount_cents = p_total_amount_cents
  where id = p_invoice_id
  returning * into v_invoice;

  if not found then
    raise exception 'invoice not found';
  end if;

  -- 2) Replace the line items: drop the old set and insert the new one. Both
  --    happen inside this function's single transaction, so a failure rolls the
  --    whole edit back (the invoice keeps its previous items). total_amount_cents
  --    on invoice_items is a STORED GENERATED column — never inserted.
  delete from public.invoice_items where invoice_id = p_invoice_id;

  insert into public.invoice_items (invoice_id, name, description, quantity, unit_amount_cents, sort_order)
  select
    v_invoice.id,
    item->>'name',
    item->>'description',
    coalesce((item->>'quantity')::int, 1),
    (item->>'unit_amount_cents')::bigint,
    ord::int
  from jsonb_array_elements(p_items) with ordinality as t(item, ord);

  -- 3) Return the updated invoice + its items (DB-generated per-line totals),
  --    in entered order, as one JSON object: { invoice, items }.
  select coalesce(jsonb_agg(to_jsonb(it) order by it.sort_order, it.id), '[]'::jsonb)
    into v_items
  from public.invoice_items it
  where it.invoice_id = v_invoice.id;

  return jsonb_build_object('invoice', to_jsonb(v_invoice), 'items', v_items);
end;
$$;

-- Only the server route (service role) may execute this; never the browser keys.
revoke all on function public.update_invoice_with_items(
  uuid, uuid, text, text, date, text, bigint, bigint, bigint, bigint, jsonb
) from public;
grant execute on function public.update_invoice_with_items(
  uuid, uuid, text, text, date, text, bigint, bigint, bigint, bigint, jsonb
) to service_role;

-- Expose the new function to PostgREST immediately (avoids a first-call PGRST202).
notify pgrst, 'reload schema';

-- =====================================================================
-- Done. Only /api/admin/invoices (service role, op:"update") calls this;
-- clients can never edit invoices from the browser.
-- =====================================================================
