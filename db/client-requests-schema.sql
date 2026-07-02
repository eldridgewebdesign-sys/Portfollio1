-- =====================================================================
-- WebSharke — Client → Admin requests
-- =====================================================================
-- Run this in the Supabase SQL editor (Project → SQL → New query).
-- SAFE to run more than once (idempotent guards throughout).
--
-- A `client_requests` row is something a signed-in CLIENT asks the admin
-- to do. The first kind is a DOMAIN CHANGE (the Domain tab → "Change
-- Domain" popup): the client confirms their password and proposes a new
-- domain; the server checks it isn't already registered (RDAP) before
-- the row is created, so only available domains ever reach the admin.
--
-- Rows are CREATED server-side by /api/requests/create (service role) and
-- MANAGED server-side by /api/admin (list_requests / set_request_status).
-- The RLS policies below are a second layer of defence so that even direct
-- anon-key browser access can only read a user's OWN requests.
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

create table if not exists public.client_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'domain_change'
    check (type in ('domain_change')),
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','completed')),
  -- Denormalised client identity for fast admin display (kept in sync at
  -- insert time; the admin list also re-joins project_inquiries live).
  client_name text,
  client_email text,
  -- Domain-change payload.
  current_domain text,            -- the domain on file when the request was made
  requested_domain text,          -- the new domain the client wants
  availability text,              -- 'available' | 'unknown' (taken is blocked, never stored)
  admin_notes text,               -- the admin's response / internal note
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists client_requests_user_id_idx  on public.client_requests (user_id);
create index if not exists client_requests_status_idx   on public.client_requests (status);
create index if not exists client_requests_created_idx  on public.client_requests (created_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security.
-- ---------------------------------------------------------------------
alter table public.client_requests enable row level security;

-- A signed-in client may create a request for THEMSELVES only, and only a
-- HARMLESS pending one: a direct anon-key insert (bypassing /api/requests/create)
-- can never pre-approve itself or pre-fill an admin note. The canonical path is
-- the server route, which runs the password re-check + RDAP availability check
-- with the SERVICE ROLE (RLS bypassed). This policy is the safety net so a client
-- editing frontend code can't self-approve a request or skip those checks for
-- anything that matters — the worst they can do is queue a 'pending' row the admin
-- still reviews (and whose displayed identity the admin list takes from the live
-- account, not these client-settable columns).
drop policy if exists creq_owner_insert on public.client_requests;
create policy creq_owner_insert on public.client_requests
  for insert with check (
    auth.uid() = user_id
    and status = 'pending'
    and type = 'domain_change'
    and admin_notes is null
  );

-- A client may read their OWN requests; the admin may read everything.
drop policy if exists creq_owner_select on public.client_requests;
create policy creq_owner_select on public.client_requests
  for select using (auth.uid() = user_id or public.is_admin());

-- The admin may do everything (the server uses the service role, which
-- bypasses RLS anyway — this is defence in depth).
drop policy if exists creq_admin_all on public.client_requests;
create policy creq_admin_all on public.client_requests
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Done.
-- =====================================================================
