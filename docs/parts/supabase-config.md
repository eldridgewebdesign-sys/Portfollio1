# Supabase Client — `js/supabase-config.js`

> The one shared JS file. Creates the global `db` Supabase client every page uses for auth and data.

- **File:** `js/supabase-config.js`
- **Type:** shared frontend script (the only shared JS on the site)
- **Loaded by:** any page that needs auth/db (login, onboarding, dashboard, payment, prev-inv…)
- **Last reviewed:** 2026-07-12

## What it does

Keeps the Supabase connection details in exactly one place. It builds a single
Supabase client and exposes it as a global called `db`. Every page that logs a user
in, reads their rows, or checks their session uses this same `db` object instead of
re-declaring the connection. Change the project URL or anon key here and it updates
everywhere at once.

## How everything inside works

Short file, three parts:

- **`SUPABASE_URL`** — the project URL (`https://pvamosrjqgzeuymwkruv.supabase.co`).
- **`SUPABASE_ANON_KEY`** — the project's **public "anon" key**. This is meant to be
  in frontend code; Row Level Security on the server is what actually protects data.
  The file carries a loud comment: never put the `service_role` (secret) key here or
  in any frontend file, because it bypasses RLS.
- **`const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`** — the CDN/
  vendored library exposes a global called `supabase` (the library itself); this
  builds a client from it and names the instance `db` so it doesn't clash with that
  library global.

Load order is mandatory: the Supabase library script (`js/vendor/supabase.min.js`)
must load **before** this file, and this file before any code that touches `db`.

## Last five changes

Newest first. From `docs/logs.md`.

- No content changes are recorded in the work log. Across the invoice/subscription/
  auth-gate sessions this file is repeatedly listed under "NOT touched" — it's treated
  as stable shared config. _(If you edit it, add the change here and drop this line.)_

## Notes & gotchas

- **Never** add the `service_role` key, Stripe secret, or webhook secret here. Only
  the anon key and other public values belong in frontend files (`CLAUDE.md` →
  Critical constraints).
- The header comment shows the supabase-js load as a jsDelivr CDN `<script>`, but the
  live pages load a **vendored** copy (`js/vendor/supabase.min.js`) per the site's
  no-CDN policy. The load-order requirement is the same either way; the comment is
  just slightly out of date.
- Because every page shares this one client, a breaking change here breaks auth and
  data on the whole site at once — treat edits as high-blast-radius.

## Related parts

- [[login]], [[onboarding]] — use `db` for auth.
- [[dashboard-client]] — uses `db` for RLS-scoped reads of the user's rows (admin half: [[dashboard-admin]]).
