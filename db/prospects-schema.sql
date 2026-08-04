-- =====================================================================
-- WebSharke — Prospects (leads imported from the Client Gather desktop app)
-- =====================================================================
-- Run this in the Supabase SQL editor (Project → SQL → New query).
-- SAFE to run more than once (idempotent guards throughout).
--
-- A `prospects` row is a potential client the Client Gather desktop app
-- found and verified (business with a poor website, owner name + phone
-- confirmed on a public page). The desktop app exports a single JSON file;
-- an admin uploads it in Dashboard → Prospects, and every admin then sees
-- the same shared list.
--
-- Rows are written ONLY by /api/admin/prospects (service role). There is no
-- client-facing path to this table at all — these are internal sales leads,
-- not customer records — so RLS below allows admins and nobody else.
--
-- The `status` / `status_note` columns are the SITE's own workflow fields:
-- an admin types them in free-form here, and re-importing the same export
-- NEVER overwrites them (see api/admin/prospects.js → IMPORT_FIELDS).
-- =====================================================================

-- Relies on public.is_admin() from db/admin-schema.sql. Re-declared here so
-- this file can be run stand-alone (create or replace is idempotent).
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

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),

  -- The Client Gather record id. UNIQUE so re-importing an export updates the
  -- existing row instead of creating a duplicate.
  source_id text not null unique,

  -- ---- Business identity ----
  business_name text,
  what_they_sell text,
  website text,

  -- ---- Contact. owner_name + phone are verified by the desktop app before a
  -- record can exist; email is best-effort and may be blank. ----
  owner_name text,
  phone text,
  email text,
  owner_name_source text,          -- page the finder cited for the name
  phone_source text,               -- page the finder cited for the number
  owner_verified_on text,          -- page the app itself re-read the name on
  phone_verified_on text,          -- page the app itself re-read the number on
  contact_verified boolean not null default false,
  verification_note text,

  -- ---- Findings ----
  security_risks text,
  visual_details text,
  overall_look_rating text,
  ai_generated_rating text,
  examples text,
  -- [{ type, title, detail, location, anchor, image_url }]
  problems jsonb not null default '[]'::jsonb,
  screenshot_url text,             -- full-page screenshot in Storage
  raw_json text,                   -- exactly what Claude returned

  date_found text,                 -- as recorded by the desktop app

  -- ---- Site-only workflow. Typed by an admin here; never set by an import. ----
  status text not null default '',
  status_note text not null default '',
  status_updated_at timestamptz,
  status_updated_by text,

  imported_at timestamptz not null default now(),
  imported_by text,
  updated_at timestamptz not null default now()
);

create index if not exists prospects_business_idx  on public.prospects (business_name);
create index if not exists prospects_status_idx    on public.prospects (status);
create index if not exists prospects_verified_idx  on public.prospects (contact_verified);
create index if not exists prospects_imported_idx  on public.prospects (imported_at desc);

-- Older installs: add columns introduced after the first release.
alter table public.prospects add column if not exists status_note text not null default '';
alter table public.prospects add column if not exists raw_json text;

-- ---------------------------------------------------------------------
-- Row Level Security — admin-only, no client access of any kind.
-- The server route uses the service role (which bypasses RLS); these
-- policies are defence in depth for direct anon-key access.
-- ---------------------------------------------------------------------
alter table public.prospects enable row level security;

drop policy if exists prospects_admin_all on public.prospects;
create policy prospects_admin_all on public.prospects
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Storage bucket for the screenshots that come with an import.
-- Public-read (same as website-previews) so the dashboard can render them
-- with a plain <img src>; writes are service-role only.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('prospect-screenshots', 'prospect-screenshots', true)
on conflict (id) do update set public = true;

drop policy if exists "prospect screenshots are publicly readable" on storage.objects;
create policy "prospect screenshots are publicly readable" on storage.objects
  for select using (bucket_id = 'prospect-screenshots');

-- =====================================================================
-- Done. Next: Dashboard → Prospects → "Import from Client Gather".
-- =====================================================================
