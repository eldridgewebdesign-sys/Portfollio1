# Dashboard (Admin) — `dashboard.html`

> The owner-only control panel: every client, onboarding form, payment, invoice, subscription, domain, and request in one dark SPA. The other half of the combined dashboard file.

- **File:** `dashboard.html` (admin half — the second inline `<script>` block, an IIFE exposing `window.initAdmin`, and the `#admin` markup)
- **Type:** page (static HTML, inline CSS + JS)
- **Route:** `/dashboard` (same URL as the client dashboard — the file chooses which to show)
- **Last reviewed:** 2026-07-12

> `dashboard.html` is ~272 KB and contains **two** dashboards in one file: the
> client portal ([[dashboard-client]]) and this admin control panel. They're
> split into two docs because the file is too large to cover as one. Only the
> admin email ever sees this half.

## What it does

This is the business's back office. When the owner signs in, the same
`/dashboard` page — instead of the client portal — reveals a dark "control panel"
with a sidebar of views: an **Overview**, every client record (**Users**), the
raw **Onboarding Forms**, **Recent Payments**, **Invoices** and **Subscriptions**
(create + manage), **Websites** and **Domains**, **Alerts**, client **Requests**
(edit requests) and **Domain Requests**, an **Activity Log**, and **Settings**
(a reversible platform kill switch). Every list is searchable, filterable, and
CSV-exportable; clicking a client opens a detail drawer with all their info and
the admin actions. All privileged data flows through the server (`/api/admin`),
which re-verifies the admin on every call.

It has no route of its own — it's gated behind the admin email inside
`dashboard.html`.

## How everything inside works

The file loads `js/vendor/supabase.min.js` then `js/supabase-config.js` (the
shared `db` client), and has two inline `<script>` blocks. **This doc covers the
second block** (~line 2620 onward), an IIFE that exposes `window.initAdmin`.

**Handoff.** The client block's page-load gate checks the signed-in email against
the hard-coded `ADMIN_EMAIL` (`weeldridge09@gmail.com`); if it matches, it calls
`window.initAdmin(user)` and returns, so the client dashboard never renders. This
email check is **UX only** — real security is server-side.

**The API bridge.** `adminApi(action, payload)` POSTs `{action, payload}` to
**`/api/admin`** with the Supabase bearer token; `/api/admin` re-verifies the
caller is the admin before doing anything and uses the service-role key. Invoice
and subscription **creation** use two dedicated routes instead:
`/api/admin/invoices` and `/api/admin/subscriptions`.

**The list views are data-driven.** A single `VIEWS` config object defines each
list view — its `action` (the `adminApi` action to fetch), `columns`, `filters`,
`rowClick`, `exportColumns` (CSV keeps the full record even when the on-screen
preview is trimmed), and empty-state text. `loadView` / `switchView` /
`handleRowAction` / `exportCsv` render and drive them generically. Views wired
this way include Users, Onboarding, Recent Payments, Websites, Domains, Alerts,
Requests, Domain Requests, and Activity. Preview rows are intentionally minimal
(e.g. Users = Name · Business · Email · Phone + Edit); everything else lives in
the drawer.

**The user drawer.** `openUserDrawer` → `renderUserDrawer(data)` builds a
labelled detail panel — Contact · Business · Onboarding Details (incl. the
"Website Build Requirements" extension answers) · Hosting/Subscription (with
Stripe customer/subscription id + last-payment) · Website/Domain · Admin Actions ·
Recent Activity — with destructive actions (Ban · Cancel subscription · Delete)
grouped in a red **Danger Zone**. `saveUserDrawer` persists edits;
`loadDrawerMessages` / `reviewEditReq` handle the message thread and edit-request
approvals.

**Recent Payments & the invoice/subscription tools.** Recent Payments lists
invoices + subscriptions with an inline editable invoice-status `<select>`
(`invoiceStatusSelect` → `setInvoiceStatusUI` → the `set_invoice_status` action)
and a subscription **Cancel** action. The **Invoices** and **Subscriptions**
views host create/edit forms that post to `/api/admin/invoices` and
`/api/admin/subscriptions` (`runInvoiceSubmit` / `openInvoiceEditor` /
`runInvoiceUpdate`; `runSubCreate` / `openSubEditor` / `runSubUpdate` / `cancelSub`).

**Overview.** `loadOverview()` renders exactly three lists — New Onboarding,
Current Projects, Websites This Month (`renderOvOnboarding` / `renderOvProjects` /
`renderOvMonth`) — each row opening the relevant drawer, each section with a
"View all →" that calls `switchView`.

**Settings — the platform kill switch.** `loadPlatformStatus` / `togglePlatform`
call the `get_platform_status` / `set_platform_disabled` admin actions to flip the
single reversible `platform_settings.disabled` flag. It **never deletes data**,
is logged to `admin_activity_log`, and shows a confirmation modal; while on,
non-admin clients see the `#maintScreen` notice. Badges (`loadAlertBadge`,
`loadRequestBadge`, `loadEditReqBadge`, `loadMsgBadge`) show pending counts.

**Reads/writes:** effectively all admin data goes through `/api/admin` (and the
two create routes) using the service-role key **server-side**; the `platform_settings`
disabled flag is also read directly by the client block. The browser only ever
holds the Supabase anon key + bearer token.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. (Client-side changes
are in [[dashboard-client]].) The four late-June admin sessions iterated on the
same Payments/Invoices/Subscriptions tabs several times.

- **2026-07-17** — The website-preview `<img>` in the admin drawer gained
  `loading="lazy"` + `decoding="async"` (attributes only, markup string
  otherwise unchanged). _(Session: `full-site-optimization-pass`.)_
- **2026-06-30** — Admin drawer gained a read-only "Website Build Requirements"
  section (the onboarding extension answers) and the Onboarding CSV export gained
  the new intake columns. _(Session: `onboarding-feature-extensions-redesign`.)_
- **2026-06-30** — Recent Payments now lists **all** invoices + subscriptions
  with an inline editable invoice-status select (`set_invoice_status`) and a
  subscription Cancel; the all-invoices / all-subscriptions lists were removed
  from the Invoices/Subscriptions tabs (those are create-only again). _(Note:
  this reworked the two changes below. Session: `invoice-status-workflow-recent-payments`.)_
- **2026-06-30** — Added all-time "All invoices" and "All subscriptions" lists to
  the Invoices/Subscriptions tabs (every status, newest first). _(Note: superseded
  the same day by the change above. Session: `admin-invoices-subscriptions-all-time`.)_
- **2026-06-30** — Reworked the "Payments" tab into a paid-only **Recent
  Payments** feed (paid invoices + subscriptions with a real charge). _(Note: also
  reworked by `invoice-status-workflow-recent-payments`. Session: `admin-recent-payments-paid-only`.)_

## Notes & gotchas

- **The admin email check in the browser is UX only.** Every write and every
  privileged read must go through `/api/admin` (or the two create routes), which
  re-verify the signed-in user's email server-side. Never move an admin action to
  a direct client-side Supabase write.
- **Never** put the Supabase service-role key or any Stripe secret in this file —
  they belong only in the `/api` routes. The browser holds only the anon key +
  the user's bearer token.
- The kill switch flips one **reversible** flag and is logged — it must never
  delete data. The client-side gate runs the admin check **before** the
  platform-disabled check, so the admin can't lock himself out.
- Some admin features depend on newer schema (`db/*-schema.sql`,
  `db/invoices-status-workflow.sql`, `db/platform-settings-schema.sql`) being
  applied in Supabase; several sessions flag "run this migration before it goes
  live."
- The status-workflow statuses (in_progress/finished/live) need the widened
  invoices CHECK constraint applied, or setting them returns a clear toast and
  reverts the dropdown.

## Related parts

- [[dashboard-client]] — the client portal in the same file (shown to everyone except the admin email).
- [[admin]] — the `/api/admin` route behind `adminApi` (list/search/status/delete/platform actions).
- [[admin-invoices]] — the `/api/admin/invoices` create route.
- [[admin-subscriptions]] — the `/api/admin/subscriptions` create route.
- [[webhook]] — writes the payment/subscription state these views display.
- [[db-inquiries]] / [[db-invoices]] / [[db-subscriptions]] / [[db-platform-settings]] — the schemas behind these views.
- [[supabase-config]] — provides the shared `db` client.
