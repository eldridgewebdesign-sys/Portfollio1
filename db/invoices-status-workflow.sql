-- =====================================================================
-- WebSharke — extend invoices.status with the build-workflow stages
-- =====================================================================
-- Run this in the Supabase SQL editor (Project → SQL → New query).
--
-- It is SAFE to run more than once (idempotent: it only drops + re-adds the
-- one CHECK constraint). It enables the admin to move an invoice through the
-- new stages from the Recent Payments tab:
--   issued · paid · in_progress · finished · live
-- while keeping the original lifecycle values (draft / overdue / void /
-- canceled) valid so no existing invoice row is rejected.
--
-- Why it is needed: public.invoices.status has a CHECK constraint that only
-- allowed the original six values, so an UPDATE to 'in_progress' / 'finished' /
-- 'live' from api/admin.js (set_invoice_status) would fail with a check
-- violation until this runs.
-- =====================================================================

alter table public.invoices drop constraint if exists invoices_status_check;

alter table public.invoices
  add constraint invoices_status_check
  check (status in (
    'draft','issued','paid','overdue','void','canceled',
    'in_progress','finished','live'
  ));

-- Expose the change to PostgREST immediately.
notify pgrst, 'reload schema';

-- =====================================================================
-- Done. The admin Recent Payments tab can now set any invoice's status to
-- issued / paid / in_progress / finished / live (the client dashboard shows
-- the latest non-draft invoice's status).
-- =====================================================================
