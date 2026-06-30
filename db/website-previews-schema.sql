-- =====================================================================
-- WebSharke — manual WEBSITE PREVIEW image (admin-uploaded screenshot)
-- ---------------------------------------------------------------------
-- Lets the admin upload a screenshot for a client's site from the admin
-- dashboard (Websites drawer). The CLIENT dashboard's Domain tab shows
-- this image instead of the auto-generated screenshot when present.
--
-- Source of truth for the client is subscriptions.preview_image (the
-- Domain tab reads the subscriptions row). The websites copy is the
-- admin's editable record. The admin API writes both, keyed on user_id —
-- exactly like assign_domain.
--
-- Run this once in the Supabase SQL editor. Idempotent — safe to re-run.
-- =====================================================================

-- 1. Columns to hold the public image URL.
alter table public.websites      add column if not exists preview_image text;
alter table public.subscriptions add column if not exists preview_image text;

-- 2. Public Storage bucket for the preview images.
--    public = true so a client's <img> can load it with no auth (these are
--    screenshots of public websites). Uploads/removals happen ONLY through
--    the server-side admin API using the service-role key, which bypasses
--    Storage RLS — so no public write policy is needed or wanted.
insert into storage.buckets (id, name, public)
values ('website-previews', 'website-previews', true)
on conflict (id) do update set public = true;
