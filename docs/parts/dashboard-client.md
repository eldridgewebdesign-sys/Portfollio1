# Dashboard (Client) — `dashboard.html`

> The signed-in client's portal: their account, project brief, invoices, subscriptions, domain, and messages. One half of the combined dashboard file.

- **File:** `dashboard.html` (client half — the first inline `<script>` block and the `#dash` markup)
- **Type:** page (static HTML, inline CSS + JS)
- **Route:** `/dashboard`
- **Last reviewed:** 2026-07-12

> `dashboard.html` is ~272 KB and contains **two** dashboards in one file: the
> client portal (this doc) and the admin control panel ([[dashboard-admin]]).
> They're split into two docs because the file is too large to cover as one. The
> same file decides at load time which one to show.

## What it does

This is where a logged-in client manages their relationship with WebSharke.
After they sign in (`/login`) or onboard (`/onboarding`), this page loads their
own records and shows a tabbed portal: their contact/account info, the business
and project details they submitted, their invoices, their recurring
subscriptions (with cancel + change-payment), their site's domain and preview,
and a two-way Messages/Requests thread with the admin. It reads **only the
signed-in user's own rows** (Supabase RLS enforces this); it never shows other
clients' data and holds no admin tools.

It's the end of the normal client flow: `/onboarding` or `/login` → `/dashboard`
→ (for payments) `/payment`.

## How everything inside works

The file loads `js/vendor/supabase.min.js` then `js/supabase-config.js` (the
shared `db` client), and has two inline `<script>` blocks. **This doc covers the
first block** (the client logic, ~line 1404 onward) and the `#dash` markup.

**The gate + who-gets-what (page-load IIFE).** On load it calls
`db.auth.getUser()` then `db.auth.getSession()`; if either fails or there's no
user it `replace()`s to `/login`. Then three branches:
1. **Admin** — if the user's email equals the hard-coded `ADMIN_EMAIL`
   (`weeldridge09@gmail.com`) and `window.initAdmin` exists, it calls
   `initAdmin(user)` and **returns** — the client dashboard never renders. (See
   [[dashboard-admin]].)
2. **Platform disabled** — reads `platform_settings.disabled`; if on, it shows
   the `#maintScreen` maintenance notice and stops. **Fail-open:** any read error
   lets the client through, so a hiccup can't lock everyone out.
3. **Normal client** — reveals `#dash` and loads data.

**Data loaded once at page load** (RLS scopes every query to `user.id`):
- `project_inquiries` — most-recent intake row → feeds Account, Business, and
  Project tabs.
- `subscriptions` — all the user's rows, newest first → domain/preview are
  surfaced from whichever row carries them; feeds the Subscriptions tab, the
  pay-banner, and the Domain tab.
- Invoices load separately via `loadClientInvoices(user)` (non-blocking).
- `loadMsgBadge()` fetches the unread-message count.

**Tabs (`#dash` sidebar → `#tab-*` panels):** Account info · Business info ·
Project details · **Invoices** · **Subscriptions** · Domain · Messages ·
Privacy.

**Key render/handler functions:**
- `render(user, inquiry, sub)` — Account tab (contact + top-line status).
- `renderBusiness(inquiry, …)` / `renderProject(inquiry, …)` — Business and
  Project tabs from the same `project_inquiries` row; both collapse empty rows so
  answered onboarding questions show and legacy/blank ones hide.
- `loadClientInvoices(user)` — shows the most recent **client-visible** invoice
  with a status badge; the **Pay Invoice** button appears only when the invoice
  is payable (issued/overdue) and links to `/payment`. "View Previous Payments"
  goes to `/prev-inv`.
- `renderSubscriptions(rows, …)` — one card per recurring subscription
  (active/past_due/canceled/pending) with plan name, recurring price + interval,
  status badge, and next-payment date. Actions: **Change Payment Info** →
  `openBillingPortal()` (POST `/api/customer-portal`, opens the Stripe Billing
  Portal), **Cancel Subscription** → `cancelSubscription()` (POST
  `/api/subscriptions/cancel` with the row id + bearer token; flips the card to
  "Canceled" in place on a confirmed 200), or **Activate** (pending) →
  `/payment?subscription_id=…`.
- `renderClientPayBanner(sub)` — a top banner when the user's status is
  unpaid/past_due/canceled, linking to `/payment`.
- Domain tab — `loadDomainShot(url)` polls a live screenshot service until it
  stops redirecting, then shows the preview; reads `sub.domain` as the source of
  truth.
- Messages/Requests — `loadMessages()` / `renderMsgItem()` / `loadMsgBadge()`
  (the two-way thread), and `submitEditRequest()` (POST `/api/requests/create`)
  for change requests.
- `doReset()` — password-reset flow.

**Reads:** `project_inquiries`, `subscriptions`, `platform_settings`, and the
messages/edit-request tables — all as the anon client, RLS-scoped to the signed-in
user. **Server calls:** `/api/customer-portal`, `/api/subscriptions/cancel`,
`/api/requests/create` (each with the Supabase bearer token). **No Stripe secret
or service-role key is ever on this page.**

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. (This is the
client-side history; admin-side changes are in [[dashboard-admin]].)

- **2026-07-17** — Perf pass: Supabase preconnect + vendored `supabase.min.js`
  preload in `<head>`; the two boot queries (`project_inquiries` +
  `subscriptions`) now start concurrently (each still awaited in its own
  unchanged try/catch); removed the two TEMP debug console.logs and the dead
  `cinvDate()` copy. _(Session: `full-site-optimization-pass`.)_
- **2026-06-30** — Project details + Business info tabs now surface the new
  onboarding-extension fields, with a hide-empty helper so answered questions
  show and removed/legacy ones collapse. _(Session: `onboarding-feature-extensions-redesign`.)_
- **2026-06-30** — Cleanly separated one-time invoices from recurring
  subscriptions: the **Invoices** tab is one-time-only; the old Hosting tab was
  renamed **Subscriptions** and rebuilt as per-row cards (cancel via a new
  `/api/subscriptions/cancel`, change payment via the Stripe Customer Portal).
  _(Session: `separate-invoices-from-subscriptions`.)_
- **2026-06-30** — `loadClientInvoices` shows the most recent client-visible
  invoice (now including in_progress/finished/live) with its status badge; the
  Pay button shows only when the invoice is actually payable. _(Session:
  `invoice-status-workflow-recent-payments`.)_
- **2026-06-27** — Client Invoices-tab summary (`buildCurrentInvoiceCard`) gained
  shared billing-type / recurring price labels. _(Session: `recurring-invoice-price-labels`.)_

## Notes & gotchas

- **Data isolation is RLS, not code.** Every client query is the anon client
  scoped by `user.id`; the real guarantee lives in Supabase Row Level Security
  policies that aren't in this repo — verify them in the Supabase dashboard when
  reasoning about access.
- The admin gate here is **UX only** — the hard-coded `ADMIN_EMAIL` just decides
  which dashboard to render. Real admin security is server-side (every
  `/api/admin` call re-verifies the caller). Don't treat this check as a
  security boundary.
- The platform-disabled check is deliberately **fail-open** — keep it that way so
  a read error can't lock out all clients.
- Never put the Stripe secret or Supabase service-role key here — this page uses
  only the anon key and talks to server routes for anything privileged.
- There are a few `// TEMP debug` `console.log`s (user id, subscription/domain
  query) flagged in the log for removal before production.
- Link to **extensionless** routes (`/payment`, `/prev-inv`, `/login`).

## Related parts

- [[dashboard-admin]] — the admin control panel in the same file (shown instead of this when the admin email signs in).
- [[login]] / [[onboarding]] — how clients arrive here (and set the `ws_session` cookie the middleware gate checks).
- [[middleware]] — the server-side gate that guards `/dashboard`.
- [[payment]] — where the Pay/Activate buttons send the client.
- [[prev-inv]] — the "View Previous Payments" history view.
- [[customer-portal]] — the Stripe Billing Portal route behind "Change Payment Info".
- [[subscriptions-activate]] — activates a pending subscription from `/payment`.
- [[webhook]] — writes the `subscriptions` billing state this page reads.
- [[db-inquiries]] / [[db-subscriptions]] / [[db-invoices]] — the schemas behind these tabs.
- [[supabase-config]] — provides the shared `db` client.
