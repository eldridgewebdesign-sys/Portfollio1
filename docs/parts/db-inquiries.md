# Project Inquiries Schema — `supabase-project-inquiries.sql`

> The Supabase table + RLS behind onboarding and the client dashboard. One row per intake form. This SQL file is a hand-run backup of that definition.

- **File:** `supabase-project-inquiries.sql` (repo root)
- **Type:** schema / RLS migration (idempotent, run by hand in the Supabase SQL editor)
- **Last reviewed:** 2026-07-12

## What it does

`project_inquiries` is where a new client's onboarding answers live — their
business, contact details, chosen features, and everything they told us during
intake. It's written once by `/onboarding` (the signup) and read by both the
client dashboard (their own row) and the admin panel (every row). This `.sql` file
isn't run by the app; it's a **manual, idempotent backup** of the table +
Row-Level-Security policies, kept in the repo so the schema the signup/dashboard
flow depends on can be recreated or repaired by pasting it into the Supabase SQL
editor. It only creates what's missing and replaces named policies — it never
drops the table or deletes rows.

## How everything inside works

**1. Table (idempotent).** `create table if not exists public.project_inquiries`
with `id`, `created_at`, `user_id` (→ `auth.users`, `on delete set null`),
`status` (default `'New Lead'`), the original 14 intake columns (`full_name`,
`business_name`, `email`, `cell_phone`, `business_description`,
`products_services` — note the **plural**; a past bug read the singular —
`preferred_styles text[]`, etc.), and the newer **feature-driven** columns:
`selected_extensions text[]`, `client_name`, `key_points`, `style_preferences`,
the `auth_*` answers, `admin_dashboard_needs`, `spreadsheet_needs`,
`payment_embedded`, and `payment_products jsonb`. A block of `add column if not
exists` backfills every column onto an older table, plus per-user and
newest-first indexes.

**2. RLS enabled** — with RLS on and no matching policy, an action is denied by
default.

**3. Policies:**
- **(a) anon INSERT** (`with check (true)`) — **required for signup.** When
  Supabase "Confirm email" is ON, `signUp` returns no session, so the intake
  insert runs as the **anon** role; this policy lets it save. `user_id` is set
  client-side from the just-created auth user.
- **(b) authenticated INSERT** (`user_id = auth.uid()`) — the "Confirm email OFF"
  / already-signed-in case.
- **(c) authenticated SELECT** (`user_id = auth.uid()`) — a user reads only their
  own rows.
- **(d) authenticated UPDATE** (`using` + `with check` on `user_id = auth.uid()`)
  — a user edits only their own rows and can't reassign one.
- **No DELETE policy and no public SELECT/UPDATE** — deletes and anon reads/writes
  are denied; manage rows via the dashboard or the service-role key.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. The base table predates
the structured work log; one logged change touches this file.

- **2026-06-30** — Added (idempotent `add column if not exists`) the feature-driven
  intake columns: `selected_extensions`, `client_name`, `key_points`,
  `style_preferences`, `auth_sign_in_method` / `auth_account_creation` /
  `auth_user_capabilities`, `admin_dashboard_needs`, `spreadsheet_needs`,
  `payment_embedded`, `payment_products`. No RLS change (the existing policies are
  column-agnostic). _(Note: must be applied in Supabase before the redesigned
  onboarding form goes live. Session: `onboarding-feature-extensions-redesign`.)_

## Notes & gotchas

- **The anon INSERT policy is load-bearing for signup** under "Confirm email ON" —
  don't remove it thinking it's overly permissive; without it, first-time intake
  saves fail (the `auth.uid()` null case called out in `CLAUDE.md`).
- **Data isolation is these RLS policies.** The live policies in Supabase are the
  real control; this file is a backup that may drift from production — verify the
  Supabase dashboard when reasoning about access.
- The products column is `products_services` (**plural**) — a past bug read the
  singular form.
- **Never** put the `service_role` key in frontend code — it bypasses every policy
  here.
- This file is idempotent and safe to re-run; it never drops the table or deletes
  rows.

## Related parts

- [[onboarding]] — writes a row here on signup (via anon INSERT).
- [[dashboard-client]] — reads the signed-in user's own row (Account / Business / Project tabs).
- [[dashboard-admin]] — reads/edits every row (Users / Onboarding views, via the admin API).
- [[admin]] — the server route that edits these rows with the service-role key.
