-- =====================================================================
-- project_inquiries — schema + Row Level Security (RLS) backup
-- =====================================================================
-- WebSharke / Eldridge Web Design client portal.
--
-- WHAT THIS FILE IS:
--   A manual, idempotent backup of the table definition and the RLS
--   policies that the signup + dashboard flow depends on. Copy/paste it
--   into the Supabase SQL Editor and run it. It is safe to re-run: it
--   only creates things that are missing and replaces the named policies
--   (it never drops the table, never deletes rows).
--
-- WHY THE POLICIES LOOK LIKE THIS:
--   onboarding.html signs the user up with db.auth.signUp() and then
--   immediately inserts the intake row into project_inquiries.
--   When "Confirm email" is ON, signUp returns a user but NO session,
--   so that insert runs as the **anon** role (not authenticated yet).
--   The anon INSERT policy below is what lets that intake save succeed.
--   Once the user confirms their email and logs in, the SELECT/UPDATE
--   policies reconnect them to their own row via user_id = auth.uid().
--
-- DO NOT put the service_role key in frontend code — it bypasses all of
-- the policies below.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TABLE (idempotent)
--    create-if-not-exists + add-column-if-not-exists, so running this on
--    an existing table is a no-op and never alters/destroys live data.
-- ---------------------------------------------------------------------
create table if not exists public.project_inquiries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz      not null default now(),
  user_id       uuid             references auth.users (id) on delete set null,
  status        text             not null default 'New Lead',

  -- ---- the 14 intake form columns (see onboarding.html) ----
  full_name             text,
  business_name         text,
  email                 text,
  cell_phone            text,
  business_address      text,
  business_description  text,
  products_services     text,
  website_goals         text,
  visitor_actions       text,
  websites_liked        text,
  preferred_styles      text[],   -- multi-select "Preferred Style" checkboxes
  color_preferences     text,
  design_notes          text,
  additional_info       text
);

-- Backfill columns if an older version of the table already exists.
alter table public.project_inquiries add column if not exists user_id              uuid references auth.users (id) on delete set null;
alter table public.project_inquiries add column if not exists status               text   not null default 'New Lead';
alter table public.project_inquiries add column if not exists full_name            text;
alter table public.project_inquiries add column if not exists business_name        text;
alter table public.project_inquiries add column if not exists email                text;
alter table public.project_inquiries add column if not exists cell_phone           text;
alter table public.project_inquiries add column if not exists business_address     text;
alter table public.project_inquiries add column if not exists business_description text;
alter table public.project_inquiries add column if not exists products_services    text;
alter table public.project_inquiries add column if not exists website_goals        text;
alter table public.project_inquiries add column if not exists visitor_actions      text;
alter table public.project_inquiries add column if not exists websites_liked       text;
alter table public.project_inquiries add column if not exists preferred_styles     text[];
alter table public.project_inquiries add column if not exists color_preferences    text;
alter table public.project_inquiries add column if not exists design_notes         text;
alter table public.project_inquiries add column if not exists additional_info      text;

-- Helpful indexes for the dashboard (newest-first per user).
create index if not exists project_inquiries_user_id_idx    on public.project_inquiries (user_id);
create index if not exists project_inquiries_created_at_idx on public.project_inquiries (created_at desc);


-- ---------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY
--    With RLS on and no matching policy, an action is DENIED by default.
--    That is why DELETE has no policy below: deletes are blocked for the
--    anon and authenticated roles entirely.
-- ---------------------------------------------------------------------
alter table public.project_inquiries enable row level security;


-- ---------------------------------------------------------------------
-- 3. POLICIES
-- ---------------------------------------------------------------------

-- (a) ANON INSERT — required for signup.
--     At signup, "Confirm email" is ON, so there is no session yet and
--     the intake insert runs as the anon role. This permits that insert.
--     user_id is supplied client-side from the just-created auth user, so
--     the new row is still linked to the account. `with check (true)`
--     is intentionally permissive because anon has no auth.uid() to match.
drop policy if exists "Allow anon intake insert during signup" on public.project_inquiries;
create policy "Allow anon intake insert during signup"
on public.project_inquiries
for insert
to anon
with check (true);

-- (b) AUTHENTICATED INSERT — covers the "Confirm email OFF" / already
--     signed-in case, where signUp returns a session immediately. The
--     row must be stamped with the inserting user's own id.
drop policy if exists "Users can insert own project inquiries" on public.project_inquiries;
create policy "Users can insert own project inquiries"
on public.project_inquiries
for insert
to authenticated
with check (user_id = auth.uid());

-- (c) AUTHENTICATED SELECT — a logged-in user may read ONLY their own
--     rows. No broad/public read access is granted.
drop policy if exists "Users can view own project inquiries" on public.project_inquiries;
create policy "Users can view own project inquiries"
on public.project_inquiries
for select
to authenticated
using (user_id = auth.uid());

-- (d) AUTHENTICATED UPDATE — a logged-in user may edit ONLY their own
--     rows, and cannot reassign a row to another user (the with check
--     keeps user_id pinned to themselves). No public update access.
drop policy if exists "Users can update own project inquiries" on public.project_inquiries;
create policy "Users can update own project inquiries"
on public.project_inquiries
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- NOTE: there is deliberately NO DELETE policy and NO public SELECT/UPDATE
-- policy. With RLS enabled, that means deletes (and any anon reads/updates)
-- are denied. Manage/remove rows from the Supabase dashboard or with the
-- service_role key on the server only.
