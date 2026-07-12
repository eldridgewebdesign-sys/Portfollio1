# Platform Settings Schema — `db/platform-settings-schema.sql`

> A single-row table holding one reversible `disabled` flag — the platform-wide maintenance / kill switch.

- **File:** `db/platform-settings-schema.sql`
- **Type:** schema / RLS migration (idempotent, run by hand in the Supabase SQL editor)
- **Last reviewed:** 2026-07-12

## What it does

This backs the admin **Settings → "Disable Everything"** kill switch. It's a
single-row `platform_settings` table with one boolean, `disabled`. When it's true,
the platform is in maintenance mode: non-admin clients hitting the dashboard see a
friendly maintenance notice instead of their portal. It's fully reversible and
**never deletes anything** — it only flips a flag. Everyone can read the flag (so
client pages can react); only the admin can change it.

## How everything inside works

**Table.** `create table if not exists public.platform_settings` with a singleton
design: `id int primary key default 1` + a `platform_settings_singleton` CHECK
(`id = 1`), the `disabled boolean not null default false`, and audit columns
`disabled_at`, `disabled_by` (admin email), `updated_at`. An `insert … on conflict
(id) do nothing` seeds the single row so reads always find it.

**RLS.**
- `ps_public_read` — `for select using (true)`: **anyone**, including signed-out
  visitors, can read the flag (so client pages can show the maintenance notice).
- `ps_admin_write` — `for all using (public.is_admin()) with check
  (public.is_admin())`: only the admin email may change it.

The admin dashboard toggles it via the server-side `/api/admin` function
(`set_platform_disabled`, service role), which re-verifies the admin email first;
RLS is defence-in-depth on top of that. The client dashboard reads
`platform_settings.disabled` directly (anon) and **fails open** — a read error lets
clients through rather than locking everyone out.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. One real change touches
this file.

- **2026-06-29** — Created the migration: the single-row `platform_settings` table
  (public read, `is_admin()`-only write) behind the reversible "Disable
  Everything" kill switch. _(Session: admin declutter pass 2; see `docs/CHANGELOG.md`.)_

## Notes & gotchas

- **The switch only flips a flag — it must never delete data.** It's fully
  reversible (flip `disabled` back to false).
- **Public read is intentional** so client pages can react; only the admin can
  write. Don't tighten the read policy without breaking the maintenance notice.
- The client-side check is deliberately **fail-open** (a read error lets clients
  through) — keep it that way so a hiccup can't lock out everyone. The admin gate
  runs before the disabled check, so the admin can't lock himself out.
- Requires `public.is_admin()` from `db/admin-schema.sql` — run that first.
  Idempotent and safe to re-run.

## Related parts

- [[admin]] — the `/api/admin` route with the `get_platform_status` / `set_platform_disabled` actions.
- [[dashboard-admin]] — the Settings tab kill-switch UI that toggles this flag.
- [[dashboard-client]] — reads `disabled` and shows the maintenance screen (fail-open).
