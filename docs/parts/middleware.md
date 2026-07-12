# Auth Middleware — `middleware.js`

> Vercel Edge Middleware that gates `/dashboard` server-side before any HTML is served.

- **File:** `middleware.js`
- **Type:** Vercel Edge Middleware (ES module — `export default`)
- **Runs on:** every request matching the `matcher` config, before the static file/function
- **Last reviewed:** 2026-07-12

## What it does

It's a server-side lock on the members area. Before the dashboard HTML is even
sent to the browser, this checks for a session cookie. No cookie → the visitor is
redirected to `/login` and never sees the page. This is a second, independent layer
on top of the client-side Supabase check inside `dashboard.html`, so the page isn't
protected by JavaScript alone.

Only `/dashboard` is gated. `/onboarding` is deliberately public — it's the signup
entry point, and gating it would bounce every new client to `/login` before they
could sign up.

## How everything inside works

The whole file is one exported `middleware(request)` function plus a `config`.

- It reads `pathname` from the request URL.
- `protectedRoutes = ["/dashboard"]` — the list of gated paths. A comment explains
  why `/onboarding` is intentionally absent.
- If the path is protected, it reads the `cookie` header and tests it against
  `/(?:^|;\s*)ws_session=1/` — i.e. does the `ws_session=1` cookie exist.
- No session → `Response.redirect(new URL("/login", request.url), 302)`. The 302
  (not 301) is deliberate so the browser retries after login instead of caching the
  redirect permanently.
- Returning `undefined` passes the request through untouched.
- `export const config = { matcher: ["/dashboard"] }` tells Vercel to only run this
  middleware for `/dashboard`, so it adds no overhead to any other route.

The `ws_session` cookie it checks is **set** by `login.html` (`goToDashboard()`) and
by `onboarding.html` on successful signup, and **cleared** by both signout handlers
in `dashboard.html`.

## Last five changes

Newest first. From `docs/logs.md`.

- **2026-06-22** — Removed `/onboarding` from the gate — dropped it from both
  `protectedRoutes` and the `matcher`. _(Note: gating it had made signup impossible —
  first-time visitors have no session, so they were 302'd to `/login` before the
  intake form rendered. Session: `fix-onboarding-access`.)_
- **~2026-06-21** — Introduced as the server-side auth gate. _(Note: a 2026-06-22
  Manager entry flags it as newly present with no role log documenting its creation;
  treat this date as approximate.)_

## Notes & gotchas

- The `ws_session` cookie is `Secure`, so the gate only exercises over HTTPS —
  `vercel dev` on plain http can't test it end-to-end; needs a real deploy/preview.
- This is a security-sensitive file. Per the role rules, changes here should get a
  Security review. Per `CLAUDE.md`, don't weaken auth to make a feature easier.
- The cookie is a lightweight session *hint*, not cryptographic proof of identity —
  the real data access control is Supabase RLS on the anon key. Don't treat the
  cookie as authorization for data, only as a page-serving gate.

## Related parts

- [[login]] — sets the `ws_session` cookie this reads.
- [[onboarding]] — also sets the cookie on signup; intentionally not gated here.
- [[dashboard-client]] — the protected page (client portal); clears the cookie on signout. (Admin half: [[dashboard-admin]].)
