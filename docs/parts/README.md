# Site Parts — Documentation Index

One markdown file per part of the website. Each part doc explains, in plain
language: **what it does**, **how everything inside it works**, and its **last
five changes** (with what changed and any notes). The goal is that anyone — or any
AI session — can understand a single part without reading the whole codebase.

Use `TEMPLATE.md` as the starting point for any new part doc.

## How this stays true

The change history in each doc is pulled from `docs/logs.md` and
`docs/CHANGELOG.md` — real history, never invented. That means these docs are only
as honest as the maintenance habit:

**Maintenance rule — when you change a site file, update its part doc's "Last five
changes" in the same session.** Add the new change to the top, drop the oldest so
the list stays at five, and bump "Last reviewed". If the change alters how the file
works, update "How everything inside works" too. This is the same discipline the
repo already uses for `docs/logs.md`; the part doc is just the per-file view of it.

## Parts

Status: ✅ documented · ⬜ not yet written.

The API folder is deeper than a first glance suggests — it has admin and invoice/
subscription sub-routes, not just the three payment files. The list below reflects the
real inventory found in `docs/logs.md`; confirm exact filenames against the repo when
you write each doc (the `api/` subfolders are OneDrive cloud-only and don't always list
in a shell).

### Pages (what visitors and clients touch)

| Part | File | Route | Doc | Status |
|------|------|-------|-----|--------|
| Homepage | `index.html` | `/home` | [index.md](index.md) | ✅ |
| Login | `login.html` | `/login` | [login.md](login.md) | ✅ |
| Onboarding | `onboarding.html` | `/onboarding` | [onboarding.md](onboarding.md) | ✅ |
| Dashboard — client portal | `dashboard.html` | `/dashboard` | [dashboard-client.md](dashboard-client.md) | ✅ · split² |
| Dashboard — admin panel | `dashboard.html` | `/dashboard` | [dashboard-admin.md](dashboard-admin.md) | ✅ · split² |
| Invoices page | `payment.html` | `/payment` | [payment.md](payment.md) | ✅ · repurposed¹ |
| Previous Invoices | `prev-inv.html` | `/prev-inv` | [prev-inv.md](prev-inv.md) | ✅ |
| Payment Success | `success.html` | `/success` | [success.md](success.md) | ✅ |
| Payment Cancel | `cancel.html` | `/cancel` | [cancel.md](cancel.md) | ✅ |
| How-To Sheets | `how-to-sheets.html` | `/how-to-sheets` | [how-to-sheets.md](how-to-sheets.md) | ✅ |

¹ `payment.html` used to be the Stripe checkout page; it was reworked into a read-only
invoices view. The live plan-purchase surface needs re-homing (flagged in the log) —
capture the current reality when documenting it.

² `dashboard.html` (~272 KB) contains both the client portal and the admin control panel
in one file. It's documented as two docs — `dashboard-client.md` and `dashboard-admin.md`
— because the file is too large to cover as one; the file chooses which to render at load
time based on the signed-in email.

### Backend & shared logic

| Part | File | Doc | Status |
|------|------|-----|--------|
| Auth Middleware | `middleware.js` | [middleware.md](middleware.md) | ✅ |
| Supabase Client | `js/supabase-config.js` | [supabase-config.md](supabase-config.md) | ✅ |
| Checkout API | `api/checkout.js` | [checkout.md](checkout.md) | ✅ |
| Stripe Webhook | `api/webhook.js` | [webhook.md](webhook.md) | ✅ |
| Customer Portal API | `api/customer-portal.js` | [customer-portal.md](customer-portal.md) | ✅ |
| Admin API | `api/admin.js` | [admin.md](admin.md) | ✅ · large |
| Invoice Pay API | `api/invoices/pay.js` | [invoices-pay.md](invoices-pay.md) | ✅ |
| Invoice Confirm API | `api/invoices/confirm.js` | [invoices-confirm.md](invoices-confirm.md) | ✅ · referenced by success.html |
| Admin Invoices API | `api/admin/invoices.js` | [admin-invoices.md](admin-invoices.md) | ✅ |
| Admin Subscriptions API | `api/admin/subscriptions.js` | [admin-subscriptions.md](admin-subscriptions.md) | ✅ |
| Subscription Activate API | `api/subscriptions/activate.js` | [subscriptions-activate.md](subscriptions-activate.md) | ✅ |

### Data (Supabase schema)

| Part | File | Doc | Status |
|------|------|-----|--------|
| Project inquiries schema | `supabase-project-inquiries.sql` | [db-inquiries.md](db-inquiries.md) | ✅ |
| Invoices schema | `db/invoices-schema.sql` | [db-invoices.md](db-invoices.md) | ✅ |
| Hosting subscriptions schema | `db/hosting-subscriptions-schema.sql` | [db-subscriptions.md](db-subscriptions.md) | ✅ |
| Platform settings schema | `db/platform-settings-schema.sql` | [db-platform-settings.md](db-platform-settings.md) | ✅ |

_The `/engineering` demo and `Animations/` are larger self-contained subsystems.
They can each get their own part doc later if you want them covered — flag it and
I'll add them to this list._
