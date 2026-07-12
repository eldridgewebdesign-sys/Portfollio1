# Admin API — `api/admin.js`

> The single secure entry point for the admin control panel. One POST route, an action switch, and the service-role key — never exposed to the browser.

- **File:** `api/admin.js`
- **Type:** Vercel serverless function (`POST /api/admin`)
- **Secrets used:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (+ optional `ADMIN_EMAIL`)
- **Last reviewed:** 2026-07-12

## What it does

Everything the admin dashboard reads or writes across **all** clients goes
through this one route. The browser can't be trusted to read other users' data or
run privileged writes, so the admin SPA sends `{action, payload}` here; the server
verifies the caller is really the admin, then does the work with the service-role
key (which bypasses RLS). A regular user editing frontend code still can't reach
admin data — every action re-checks the caller's email server-side and returns 403
otherwise. It also holds the reversible **platform kill switch**.

It's the backbone of [[dashboard-admin]]: the `adminApi(action, payload)` helper
there is a thin wrapper over this route. (Invoice/subscription *creation* uses the
two dedicated routes [[admin-invoices]] and [[admin-subscriptions]] instead.)

## How everything inside works

**Setup.** `adminClient()` builds a service-role Supabase client
(`autoRefreshToken:false`, `persistSession:false`). `ADMIN_EMAIL` defaults to
`weeldridge09@gmail.com` (overridable via env). Constants define the
admin-editable field allowlists (`USER_EDITABLE_FIELDS`,
`WEBSITE_EDITABLE_FIELDS` — note `preview_image` is deliberately excluded so a
normal save can't clear it), the `website-previews` Storage bucket, and a preview
size cap. `logActivity()` best-effort writes to `admin_activity_log` and never
throws.

**Every request runs the same gate (the exported handler):**
1. CORS headers; `OPTIONS` → 204; non-`POST` → 405.
2. 500 if the Supabase env vars are missing.
3. **Authenticate** — pull the `Bearer` token, verify it with
   `supa.auth.getUser(token)` (service-role); no/invalid token → 401.
4. **Authorize** — the verified caller's email must equal `ADMIN_EMAIL`, else 403.
5. Parse the body and dispatch on `action` through a big `switch`.

**Actions (grouped):**
- **Reads:** `overview` (three lists + recent activity), `list_users`,
  `list_onboarding`, `list_payments` (all invoices + all subscriptions with an
  editable-status shape), `get_invoice`, `list_websites`, `list_domains`,
  `list_alerts`, `list_requests`, `list_edit_requests`, `list_user_messages`,
  `list_activity`, `search` (global), `get_user`, `get_platform_status`.
- **User writes:** `update_user` / `update_onboarding` (allowlist-picked fields),
  `set_user_status`, `set_user_password`, `delete_user`.
- **Website/domain writes:** `create_website`, `update_website`,
  `set_website_preview` (Storage upload), `assign_domain`.
- **Request/message writes:** `set_request_status`, `review_edit_request`,
  `send_user_message`.
- **Billing writes:** `set_invoice_status`, `set_payment_status`, `update_plan`,
  `cancel_subscription`.
- **Platform:** `set_platform_disabled` (flips the reversible
  `platform_settings.disabled` flag, logs `platform_disabled`/`platform_enabled`).
- Unknown action → 400; any thrown error is logged with `console.error` and
  returned as a generic 500.

**Shared helpers:** `applyListOpts` (search/sort/limit/offset), `enrichUsers`,
`indexBy`, `countRows`, `pick` (allowlist filter). Each write action logs to
`admin_activity_log`.

**Reads/writes:** effectively every admin table — `project_inquiries`,
`subscriptions`, `invoices`, `websites`, domains/requests/messages tables,
`platform_settings`, `admin_activity_log`, and the `website-previews` Storage
bucket — all with the **service-role** key, server-side only.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. Several late-June
sessions reworked the same Payments/Invoices query paths.

- **2026-06-30** — Rebuilt `listPayments` to return **all** invoices + **all**
  subscriptions (each with date/amount/type/status), added the `set_invoice_status`
  action (validated against `INVOICE_STATUSES`, logs `invoice_status_changed`,
  never touches Stripe), and removed the `list_invoices` action. _(Session:
  `invoice-status-workflow-recent-payments`.)_
- **2026-06-30** — Added a `list_invoices` action / `listInvoices()` returning all
  invoices unfiltered, newest first. _(Note: reversed the same day by the change
  above. Session: `admin-invoices-subscriptions-all-time`.)_
- **2026-06-30** — Rewrote `listPayments` into a paid-only feed (paid invoices +
  subscriptions that imply a real charge). _(Note: also reworked by
  `invoice-status-workflow-recent-payments`. Session: `admin-recent-payments-paid-only`.)_
- **2026-06-29** — Declutter support: `getOverview` also returns
  `recentOnboarding` / `projects` / `websitesThisMonth` (from data already
  fetched); `listPayments` returns `user_name` + `business_name`; removed dead
  `paymentActionsHtml` / `doPayStatus`; added the `get_platform_status` /
  `set_platform_disabled` kill-switch actions. _(Session: admin declutter passes;
  see `docs/CHANGELOG.md`.)_
- **2026-06-22** — `assignDomain()` now writes the domain into
  `subscriptions.domain` for the target user (single source of truth for the
  client Domain tab). _(Session: `domain-sync-fix`.)_

## Notes & gotchas

- **This is the security boundary the browser's admin-email check is not.** Every
  action re-verifies the bearer token and the admin email server-side. Never move
  an admin capability to a direct client-side Supabase write.
- **Never expose the service-role key** — it lives only here (and the other `/api`
  routes) via `process.env`. It bypasses RLS, so a bug that leaks it exposes every
  client's data.
- The `USER_EDITABLE_FIELDS` / `WEBSITE_EDITABLE_FIELDS` allowlists are a
  guard — writes only touch listed columns. `preview_image` is intentionally
  excluded so a normal website save can't blank it (only `set_website_preview`
  sets it).
- The kill switch flips one **reversible** flag and logs it — it must never delete
  data.
- `logActivity` is best-effort and must never throw; keep the audit log
  non-blocking.
- Some actions depend on newer schema being applied in Supabase (e.g. the widened
  invoice status CHECK, `platform_settings`); they surface a clear message when the
  DB isn't migrated yet.

## Related parts

- [[dashboard-admin]] — the admin SPA whose `adminApi` helper calls this route.
- [[admin-invoices]] — the dedicated `/api/admin/invoices` create route.
- [[admin-subscriptions]] — the dedicated `/api/admin/subscriptions` create route.
- [[webhook]] — the payment-state authority; `set_invoice_status` here deliberately does NOT touch Stripe/paid_at.
- [[db-inquiries]] / [[db-invoices]] / [[db-subscriptions]] / [[db-platform-settings]] — the schemas these actions read and write.
