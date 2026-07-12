# Login — `login.html`

> The sign-in page for existing WebSharke clients. Email + password in, dashboard out.

- **File:** `login.html`
- **Type:** page (static HTML, inline CSS + JS)
- **Route:** `/login`
- **Last reviewed:** 2026-07-12

## What it does

This is the front door for clients who already have an account. It shows one
small login card — email, password, a Sign In button — and nothing else. A
successful sign-in drops the user on `/dashboard`. It does **not** create
accounts; new clients go through `/onboarding` (there's a "New Project" button
that sends them there). If someone who is already signed in lands here, the page
skips the form and forwards them straight to the dashboard.

It sits between the public homepage and the members-only dashboard: `/` → `/login`
→ `/dashboard`.

## How everything inside works

The file is one self-contained page: an inline `<style>` block, the markup, then
an inline `<script>`. There is no shared stylesheet — the only external JS is the
Supabase client.

**Fonts (`<style>` top).** Local `@font-face` rules for Distillery Display and
Playfair Display, served from `/fonts` with `font-display:swap`. No Google Fonts
CDN — that was removed site-wide (see change history) because the deploy blocks
third-party font requests.

**Styling.** A `:root` token block defines the palette (deep navy ink, turquoise
accent, translucent aqua card). The look is a fixed layered-wave SVG ocean
background (`.ocean`), a masked WebSharke logo pinned top-left (`.ws-logo`, links
back to `/`), and a single frosted-glass login card (`.login-card`) with
underline-only inputs. There's a `@media(max-width:560px)` block that centers the
card and shrinks the logo on phones.

**Markup (`<body>`).** The wave SVG, the logo link, then a `<main class="login-shell">`
holding the card: an `<h1>`, an email `<input>`, a password `<input>`, the
`#signin-btn` button, the "No account?" line with the `/onboarding` link, and a
`#message` element (`aria-live="polite"`) for status/errors. Note there is **no
`<form>`** — submission is wired by hand in the script.

**Scripts.** Loads `js/vendor/supabase.min.js` then `js/supabase-config.js`, which
exposes the shared `db` client (must load in that order). The page script then:

- `showMessage(text, type)` — writes the little status/error line under the form.
- `goToDashboard()` — sets a lightweight `ws_session=1` cookie (`path=/;
  SameSite=Lax; Secure; max-age=604800`, i.e. 7 days) so the server-side
  `middleware.js` gate will let the user into `/dashboard`, then
  `window.location.replace("/dashboard")` (replace keeps login out of back history).
- Sign In click handler — disables the button, calls
  `db.auth.signInWithPassword({ email, password })`, and on error shows the
  message. On success it doesn't redirect directly; the auth listener below does.
- An Enter-key handler on both inputs (since there's no `<form>`) that triggers the
  button.
- On load, `db.auth.getSession()` — if a session already exists, go straight to the
  dashboard.
- `db.auth.onAuthStateChange` — the moment a session appears, `goToDashboard()`.

**Reads/writes:** reads the email/password fields; writes the `ws_session` cookie;
talks to Supabase Auth only (no table access on this page).

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. This page is stable, so
it has a short real history — only two changes have touched it; both are listed
rather than padded.

- **2026-06-22** — Comment-only accuracy fix in `goToDashboard()`: the comment said
  the `ws_session` cookie gates "/dashboard and /onboarding"; corrected to
  "/dashboard" to match a `middleware.js` change. No code change. _(Note: onboarding
  was un-gated the same session because gating it locked first-time signups out.
  Session: `fix-onboarding-access`.)_
- **2026-06-20** — Google Fonts CDN `<link>` + two `preconnect`s removed from
  `<head>`; replaced with the local inline `@font-face` block. _(Note: part of the
  site-wide no-CDN font pass; only the faces this page renders were vendored.
  Session: fonts-vendored-locally.)_

## Notes & gotchas

- The `ws_session` cookie is `Secure`, so it only works over HTTPS. On plain
  `vercel dev` (http) the middleware gate can't be exercised end-to-end — a real
  deploy/preview is needed to test the full click-through.
- Account creation must never move here — `/onboarding` is the only signup entry.
- Load order matters: `supabase.min.js` before `supabase-config.js` before any use
  of `db`.
- This page touches auth. Per `CLAUDE.md`, don't refactor working auth logic
  without a clearly identified bug.

## Related parts

- [[onboarding]] — where new clients sign up (sets the same `ws_session` cookie).
- [[middleware]] — the server-side gate that reads `ws_session` before serving `/dashboard`.
- [[dashboard-client]] — where a successful login lands.
- [[supabase-config]] — provides the shared `db` client this page uses.
