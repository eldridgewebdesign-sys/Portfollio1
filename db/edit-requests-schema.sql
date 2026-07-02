-- =====================================================================
-- WebSharke — Edit requests + user messages
-- =====================================================================
-- Run this in the Supabase SQL editor (Project → SQL → New query).
-- SAFE to run more than once (idempotent guards throughout).
--
-- Two tables power the "request an edit / Messages" feature:
--
--   edit_requests  — a signed-in CLIENT asks the admin to change the info in
--                    one of their dashboard sections (account / business /
--                    project) or to set up hosting. The client can NEVER edit
--                    their real account/business/project data directly; they
--                    only file a request. The admin reviews it (approve / deny,
--                    with a comment) from the admin dashboard's Requests view,
--                    and MAY apply the requested change to the client's record.
--
--   user_messages  — a message the ADMIN sends to a client, shown in the
--                    client dashboard's Messages tab. Clients can read their
--                    own messages and mark them read; they can NEVER insert a
--                    message (so a client can't forge an "admin" message).
--
-- Writes that matter go through the SERVICE ROLE (api/admin.js re-verifies the
-- admin email first). The RLS policies below are the second layer of defence so
-- that even direct anon-key browser access is safe.
-- =====================================================================

-- Relies on public.is_admin() (from db/admin-schema.sql). Re-declared here so
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

-- ---------------------------------------------------------------------
-- 1. edit_requests
-- ---------------------------------------------------------------------
create table if not exists public.edit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  section text not null
    check (section in ('account','business','project','hosting')),
  current_data jsonb,             -- snapshot of the fields' current values
  requested_data jsonb,           -- the new values the client is requesting
  request_message text,           -- free-text description of the change
  status text not null default 'pending'
    check (status in ('pending','approved','denied')),
  admin_comment text,             -- the admin's reply, shown to the client
  reviewed_by uuid,               -- admin auth id (nullable until reviewed)
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists edit_requests_user_id_idx on public.edit_requests (user_id);
create index if not exists edit_requests_status_idx  on public.edit_requests (status);
create index if not exists edit_requests_created_idx on public.edit_requests (created_at desc);

alter table public.edit_requests enable row level security;

-- A client may file a request for THEMSELVES only, and only a clean PENDING one
-- (they can't pre-approve it or pre-fill the admin's review fields). The admin
-- reviews + optionally applies it server-side (service role).
drop policy if exists er_owner_insert on public.edit_requests;
create policy er_owner_insert on public.edit_requests
  for insert with check (
    auth.uid() = user_id
    and status = 'pending'
    and admin_comment is null
    and reviewed_by is null
    and reviewed_at is null
  );

-- A client may read their OWN requests; the admin may read everything.
drop policy if exists er_owner_select on public.edit_requests;
create policy er_owner_select on public.edit_requests
  for select using (auth.uid() = user_id or public.is_admin());

-- Only the admin may update a request (status / comment / review fields). There
-- is deliberately NO client update/delete policy, so a client can never change
-- or approve a request after submitting it.
drop policy if exists er_admin_all on public.edit_requests;
create policy er_admin_all on public.edit_requests
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 2. user_messages
-- ---------------------------------------------------------------------
create table if not exists public.user_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sent_by text not null default 'admin',
  title text,
  body text not null,
  message_type text not null default 'admin_message'
    check (message_type in ('admin_message','request_update')),
  related_request_id uuid references public.edit_requests (id) on delete set null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists user_messages_user_id_idx on public.user_messages (user_id);
create index if not exists user_messages_created_idx on public.user_messages (created_at desc);

alter table public.user_messages enable row level security;

-- A client may read their OWN messages; the admin may read everything.
drop policy if exists um_owner_select on public.user_messages;
create policy um_owner_select on public.user_messages
  for select using (auth.uid() = user_id or public.is_admin());

-- A client may update ONLY their own message rows (row scope). Column scope is
-- locked to is_read via the column GRANT below, so a client can flip read state
-- but never rewrite a message body. (There is NO client insert policy, so a
-- client can never forge an "admin" message.)
drop policy if exists um_owner_update on public.user_messages;
create policy um_owner_update on public.user_messages
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists um_admin_all on public.user_messages;
create policy um_admin_all on public.user_messages
  for all using (public.is_admin()) with check (public.is_admin());

-- Column-level lock: a signed-in client may only UPDATE the is_read column.
-- (Supabase grants ALL on public tables to authenticated by default; RLS still
-- gates rows. This narrows the client's update surface to just the read flag.
-- The admin writes via the service role, which bypasses grants + RLS.)
revoke update on public.user_messages from anon, authenticated;
grant  update (is_read) on public.user_messages to authenticated;

-- =====================================================================
-- Done.
-- =====================================================================
