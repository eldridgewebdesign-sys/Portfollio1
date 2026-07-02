-- =====================================================================
-- WebSharke — Platform settings (global maintenance / kill switch)
-- =====================================================================
-- Run this in the Supabase SQL editor (Project → SQL → New query).
--
-- Safe to run more than once (IF NOT EXISTS / idempotent guards).
--
-- What it does:
--   1. Creates a single-row `platform_settings` table holding one
--      reversible boolean flag, `disabled`. When true, the platform is
--      in maintenance mode. NOTHING is deleted — this only flips a flag.
--   2. Enables RLS so:
--        - anyone (including signed-out visitors) can READ the flag, so
--          client pages can show a maintenance notice, but
--        - only the admin email can CHANGE it.
--      The admin dashboard toggles it via the server-side /api/admin
--      function (service role), which re-verifies the admin email first.
--
-- Reuses public.is_admin() from admin-schema.sql — run that first.
-- =====================================================================

create table if not exists public.platform_settings (
  id          int primary key default 1,
  disabled    boolean not null default false,   -- true = platform in maintenance mode
  disabled_at timestamptz,                       -- when it was last disabled
  disabled_by text,                              -- admin email that toggled it
  updated_at  timestamptz default now(),
  constraint platform_settings_singleton check (id = 1)
);

-- Seed the single row (id = 1) so reads always find it. No-op if present.
insert into public.platform_settings (id, disabled)
  values (1, false)
  on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.platform_settings enable row level security;

-- Everyone may READ the flag (so client pages can react to maintenance).
drop policy if exists ps_public_read on public.platform_settings;
create policy ps_public_read on public.platform_settings
  for select using (true);

-- Only the admin may CHANGE it (defence-in-depth; the server also uses
-- the service role, which bypasses RLS, and re-checks the admin email).
drop policy if exists ps_admin_write on public.platform_settings;
create policy ps_admin_write on public.platform_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Done. The "Disable Everything" button in the admin Settings tab flips
-- platform_settings.disabled. It is fully reversible (flip it back to
-- false) and never deletes data.
-- =====================================================================
