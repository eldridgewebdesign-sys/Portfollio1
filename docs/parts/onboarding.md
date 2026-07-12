# Onboarding — `onboarding.html`

> New-client intake form that also creates the client's account. It's both the signup page and the project brief.

- **File:** `onboarding.html`
- **Type:** page (static HTML, inline CSS + JS)
- **Route:** `/onboarding`
- **Last reviewed:** 2026-07-12

## What it does

This is where a brand-new client starts. One page does two jobs at once: it
**creates the client's login** (Supabase Auth account) and **captures the project
brief** (what their business is, what features they want) into the
`project_inquiries` table. It's the only signup entry point on the site — `/login`
is for people who already have an account. On success it either forwards the new
client straight to `/dashboard` (if email confirmation is off) or tells them to
confirm their email and sign in.

It sits at the top of the flow next to the homepage: `/home` → **Start a Project**
→ `/onboarding` → `/dashboard`. There's an "Already a client? Sign in →" link to
`/login` for people who landed here by mistake.

## How everything inside works

One self-contained page — inline `<style>`, markup, inline `<script>` — over the
same ocean/glass visual system as the rest of the site. External JS is the local
Supabase vendor bundle plus the shared config.

**Look.** Local `@font-face` (Distillery Display + Playfair Display, no CDN); a
fixed layered-turquoise-wave SVG background (`.ocean`); a masked WebSharke logo
top-left linking to `/`; and one big translucent `.ob-card` holding the whole
form.

**The form (`#onboarding-form`, `novalidate`)** is four sections:
1. **Account Information** — email, password, confirm password. These create the
   Supabase Auth user; the password is never stored in the table.
2. **Website Features** — a checkbox group of four "extensions": Authentication,
   Administrator Dashboard, Spreadsheets, Payment Integration. Checking one
   reveals its matching detail block below.
3. **About You & Your Site** (always shown) — Name, Business Name, Cell Phone,
   "What do you do?", "What is everything I should know?", "How should the style
   look?".
4. **Feature Details** — conditional `.cond` cards (`data-ext` matches the
   checkbox value) that reveal/hide as extensions are ticked. Values stay in the
   DOM while hidden, so unchecking then re-checking keeps what was typed. The
   Spreadsheets block links to `/how-to-sheets` (new tab). The Payment block has a
   Yes/No embedded-payment choice plus a repeatable **Add product** list.

A hidden success screen (`#thanks`) is swapped in after a good submit.

**Script.** After the shared `db` client loads:
- `syncConditionals()` shows/hides each `.cond` block from the checkboxes and
  toggles the "select an extension" hint.
- Repeatable products: `addProduct()` / `refreshProductBlocks()` (the last block
  can't be removed) / `gatherProducts()` collects `{name, price, description}`.
- `validate()` enforces base required fields (email format, password ≥ 6 +
  match) and conditional required fields (only for selected extensions; Payment
  needs the Yes/No choice + at least one named product), marking `.invalid` and
  focusing the first bad field.
- **Submit handler** (async): (1) `db.auth.signUp({email, password})` — handles
  Supabase's "email already in use" case (returned as a user with an empty
  `identities` array); (2) builds an `inquiry` object and
  `db.from("project_inquiries").insert(...)` — `client_name` is mirrored into
  `full_name` for the admin's name column/search, `selected_extensions` is a
  `text[]`, conditional answers are saved as `null` when their extension isn't
  selected, and `payment_products` is `jsonb`; (3) on success, shows the thank-you
  screen, and **if a session exists** sets the same `ws_session=1` cookie
  `login.html` sets (`path=/; SameSite=Lax; Secure; max-age=604800`) before
  `window.location.replace("/dashboard")`. If there's no session (email
  confirmation ON), it points the client to `/login` instead.

**Reads/writes:** reads all the form fields; writes the Supabase Auth user and one
`project_inquiries` row; writes the `ws_session` cookie on the auto-signin path.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. This page has three
real logged changes (an older bulk commit also touched it during the
space-background → ocean rework, but isn't cleanly session-attributed).

- **2026-06-30** — Full rewrite into the feature-driven intake form: the four
  "extensions" checkboxes, the conditional Feature Details cards, the repeatable
  product blocks, and the rebuilt `validate()` + `inquiry` insert. Account
  creation + submit/redirect behavior kept intact; added the new
  `project_inquiries` columns and the `/how-to-sheets` helper page. _(Note: needs
  the `add column if not exists` migration in `supabase-project-inquiries.sql` run
  before it goes live. Session: `onboarding-feature-extensions-redesign`.)_
- **2026-06-22** — Set the `ws_session=1` cookie on the signup success path (the
  `if (session)` branch) so a brand-new, auto-signed-in client passes the
  middleware gate and lands on `/dashboard` instead of bouncing to `/login`. Paired
  with un-gating `/onboarding` in `middleware.js`. _(Session: `fix-onboarding-access`.)_
- **2026-06-20** — Removed the Google Fonts CDN `<link>` + preconnects from the
  `<head>`; replaced with local inline `@font-face` rules served from `/fonts`.
  _(Note: part of the site-wide no-CDN font pass. Session: `no-cdn-fonts-remaining-pages`.)_

## Notes & gotchas

- **Email confirmation / RLS trap (from `CLAUDE.md`):** if Supabase "Confirm
  email" is ON, `signUp` returns **no session**, so the `project_inquiries` insert
  runs with `auth.uid()` null and will fail unless RLS allows it. The page surfaces
  that insert error gracefully, but confirm the email-confirmation setting and RLS
  policies in the Supabase dashboard when reasoning about this path.
- This is the **only** signup entry — account creation must never move to `/login`.
- The `ws_session` cookie is `Secure` (HTTPS only), so the full
  onboarding → dashboard click-through can't be exercised end-to-end on plain
  `vercel dev` (http); needs a real deploy/preview.
- Touches auth. Per `CLAUDE.md`, don't refactor the working `db.auth.signUp` logic
  without a clearly identified bug.
- Load order: `js/vendor/supabase.min.js` before `js/supabase-config.js` before
  any use of `db`.

## Related parts

- [[login]] — the sign-in page for returning clients (sets the same `ws_session` cookie).
- [[middleware]] — the server-side gate; `/onboarding` is intentionally **not** gated.
- [[dashboard-client]] — where a successful signup lands; reads the `project_inquiries` row written here.
- [[how-to-sheets]] — the spreadsheet explainer the Spreadsheets block links to.
- [[db-inquiries]] — the `project_inquiries` schema this form writes.
- [[supabase-config]] — provides the shared `db` client.
