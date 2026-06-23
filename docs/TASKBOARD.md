# WebSharke — Task Board

> **Read `CLAUDE.md` first.** This project uses a six-role system: **Manager · Designer · Developer
> (Implementation) · Efficiency · Security · Reviewer**. Every session states its role, reads
> `docs/taskboard.md` + `docs/logs.md` (and its own role log), and claims files in a `docs/logs.md` START
> entry before editing. **The Developer and Reviewer do not edit this board — the Manager records their task
> status.**
> **Status labels** (`[TODO]` `[IN PROGRESS]` `[BLOCKED]` `[REVIEW]` `[DONE]`) and the **task format** are
> defined in `CLAUDE.md` — use them for every new task.

---

## ⚙️ Role-system update — 2026-06-22

Added a dedicated **Developer / Implementation** role and **re-activated the Reviewer** role. The system is
now six roles in this pipeline: **Manager → Designer → Developer → Efficiency → Security → Reviewer →
Manager** (see `CLAUDE.md` → "Workflow order").

What changed and why:

- **Designer no longer writes production code.** The Designer was doing too much (design + coding + cleanup
  mixed together). The Designer now owns the *visual/UX direction* and documents it as a buildable spec in
  `docs/design-guide.md`; it does **not** edit production HTML/CSS/JS.
- **Developer / Implementation owns applying changes.** A new role makes the actual code changes from the
  Manager's task + the Designer's spec, and fixes bugs found by Reviewer / Efficiency / Security. It reports
  in `docs/logs.md` and does **not** edit this board (the Manager moves its tasks).
- **Reviewer is active again.** It tests the live site like a real customer and logs findings in
  `docs/reviewer-log.md`. (This supersedes the 2026-06-19 note below that called the Reviewer retired and the
  reviewer log deprecated.)
- **Design vs implementation is now a hard split in task-writing.** Future tasks are either a Designer
  *direction* task (output: a spec) or a Developer *implementation* task (cites the spec) — never both. Bug
  fixes are normally Developer tasks. See `CLAUDE.md` → "docs/taskboard.md Format".

> Existing tasks below keep their original owners. The Manager re-cuts any still-open "design + build" task
> into a Designer spec task + a Developer implementation task as it is picked up.

---

## 🧾 PHASE — Custom invoice / payment system (started 2026-06-22) — CURRENT FOCUS

> **Owner request:** replace the old fixed-payment (plan/subscribe) setup with an **admin-issued invoice
> system** — a client can only pay invoices an admin creates and assigns to their account. **This phase builds
> invoice creation + display ONLY. No Stripe yet** (see the deferred Phase 2 note at the end of this phase).
> The `invoices` + `invoice_items` Supabase tables already exist; the schema is in `db/invoices-schema.sql`
> (authoritative column names — use them exactly).
>
> **Roles used this phase:** Manager (orchestrates) + Designer + Developer/Implementation + Efficiency +
> Security + Reviewer — i.e. all six roles the system currently has. (The owner referred to "6 of 8"; the
> current system defines exactly these six. No role is held back beyond that.)

### Grounding (read before starting any task in this phase)

- **Schema / columns (authoritative — `db/invoices-schema.sql`):**
  - `public.invoices`: `id` (uuid), `client_user_id` (uuid → auth.users, cascade), `title` (not null),
    `notes`, `due_date` (date), `status` (`draft|issued|paid|overdue|void|canceled`, default `draft`),
    `subtotal_amount_cents`, `discount_amount_cents`, `tax_amount_cents`, `total_amount_cents` (bigint, ≥0),
    `created_at`.
  - `public.invoice_items`: `id`, `invoice_id` (uuid → invoices, cascade), `name` (not null), `description`,
    `quantity` (int ≥1), `unit_amount_cents`, `line_total_cents` (bigint ≥0), `created_at`.
  - There is **no `invoice_number`** column — display `id` (a human-friendly number is a Phase-2 nicety,
    out of scope). `discount_amount_cents` / `tax_amount_cents` exist but the owner's spec doesn't use them —
    **default them to `0`** this phase; do not build UI for them.
- **Admin auth to reuse:** `api/admin.js` — bearer token → `supa.auth.getUser(token)` (`:93`) → caller email
  === `ADMIN_EMAIL` (`:101`, else 403); service-role client built at `:44`. Mirror this gate exactly.
- **RLS:** `db/invoices-schema.sql` defines it (owner-SELECT-own via `client_user_id = auth.uid()`; admin via
  `public.is_admin()`; **no** client insert/update/delete; service role bypasses RLS). It needs
  `public.is_admin()` from `db/admin-schema.sql`. **Prerequisite (Manager/owner): confirm the migration —
  tables + RLS + `is_admin()` — is actually APPLIED in the live Supabase project, not just committed to the
  repo.** Tasks 1 and 6 both depend on this.
- **Where the UI lives:** both billing UIs are in `dashboard.html`. Client billing = the `data-tab="billing"`
  panel (`<h2 class="tab-title">Billing</h2>` ~`:639`). Admin = the `.adm-*` panel with `.adm-nav`
  `data-view="…"` views (Overview/Users/Onboarding/**Payments**/Websites/… ~`:702-710`); the admin builder is
  a new or extended admin view. ⚠️ **Task 3 (admin) and Task 5 (client) both edit `dashboard.html`** — in
  different regions, but they must **not** run concurrently; each claims its region in a START log entry.

### Sequence & dependencies

1. **Task 1** (Developer — admin API) and **Task 2** (Designer — admin builder spec) can start together.
2. **Task 3** (Developer — admin builder UI) needs **Task 1 + Task 2**.
3. **Task 4** (Designer — client billing spec) can start anytime (parallel with 1/2).
4. **Task 5** (Developer — client billing UI) needs **Task 4**, and must run **after Task 3** (shared file).
5. **Tasks 6 (Security), 7 (Efficiency), 8 (Reviewer)** run **after** Tasks 1/3/5 land.
6. **Stripe gate:** no Developer touches Stripe until creation (1+3) and display (5) all work — then the
   Manager opens Phase 2 (end of this phase).

---

## [REVIEW] Task 1 — Admin Invoice Creation API

> **Manager — recorded 2026-06-22 (a Developer session finished this concurrently; see docs/logs.md
> "2026-06-22 13:03 - Developer / Implementation - admin-invoices-route").** Built per spec:
> `api/admin/invoices.js` reuses the `api/admin.js` Bearer→`getUser`→admin-email gate + service-role key;
> validates the body; verifies `client_user_id` via `auth.admin.getUserById`; recomputes
> subtotal/line/total server-side (ignores client amounts); defaults discount/tax to 0; rejects
> discount>subtotal; inserts invoice+items with a compensating rollback + an `admin_activity_log` audit row;
> returns `{invoice, items}` (201). Plus the matching `db/invoices-schema.sql` migration. `node --check`
> passes; the Developer ran a 3-lens self-review (3 findings fixed). **No Stripe.** **PENDING before [DONE]:**
> (1) Security review = **Task 6**; (2) live e2e via `vercel dev` + real Supabase; (3) confirm the migration
> (tables + RLS + `is_admin()`) is **applied** in the live Supabase project.

Assigned Role:
Developer / Implementation

Owner:
Developer / Implementation · admin-invoices-route (2026-06-22) — board status recorded by the Manager

Risk:
High

Goal:
Build a secure, admin-only serverless route **`POST /api/admin/invoices`** (file `api/admin/invoices.js`)
that creates an invoice + its line items with the service-role key, server-calculating all money in cents.

Why:
This is the backend the whole phase depends on — the ONLY writer of `invoices`/`invoice_items`. It must be
admin-only and must never trust client-supplied totals. No Stripe in this task.

Files likely involved:

- NEW `api/admin/invoices.js` (Vercel maps it to `/api/admin/invoices`)
- read-only: `api/admin.js` (auth gate `:79-101`, service-role client `:44`), `db/invoices-schema.sql`

Do not touch:

- `api/checkout.js`, `api/webhook.js`, `api/customer-portal.js`, the live Stripe flow, `payment.html` price IDs
- the admin auth gate in `api/admin.js` (reuse the pattern; don't rewrite it)
- no Stripe code at all this task; no new dependencies (`@supabase/supabase-js` already present)

Steps:

1. Confirm the live table columns match `db/invoices-schema.sql` (and that the migration + RLS + `is_admin()`
   are applied — flag the Manager if not). Use the EXACT column names from the schema.
2. Mirror the `api/admin.js` gate: require `Authorization: Bearer <token>`; `supa.auth.getUser(token)`; 401 if
   missing/invalid; 403 unless `caller.email === ADMIN_EMAIL`. Build the service-role client from
   `process.env.SUPABASE_SERVICE_ROLE_KEY` (server only).
3. Validate the body: `client_user_id` (uuid), `title` (non-empty), optional `notes`/`due_date`, `status`
   (only `draft` or `issued` from this route), `items[]` (≥1; each `name` non-empty, `quantity` integer ≥1,
   `unit_amount_cents` integer ≥0). Reject empty invoices and negative / non-integer money.
4. Confirm `client_user_id` exists in `auth.users` (service-role lookup) — 400/404 if not.
5. Server-calculate money: `line_total_cents = quantity * unit_amount_cents`; `subtotal_amount_cents =
   Σ line_total_cents`; `total_amount_cents = subtotal + tax(0) − discount(0)`. **Ignore any client-sent
   totals.** Integers (cents) only.
6. Insert the `invoices` row, then the `invoice_items` rows (with `invoice_id`); make it atomic if possible (a
   Postgres function / RPC) or clean up on partial failure. Return the created invoice + items (201).
7. Generic, non-leaking client errors; `console.error` real errors server-side. Narrow CORS to the site origin
   (match the project's other routes).
8. `node --check api/admin/invoices.js`; trace negative paths (no token → 401, non-admin → 403, empty items →
   400, bad money → 400, unknown client → 404). Report results in docs/logs.md.

Completion checklist:

- [x] Change completed — `api/admin/invoices.js` + `db/invoices-schema.sql` (Developer, 2026-06-22 13:03)
- [~] Relevant tests/checks run — `node --check` passes + 3-lens self-review (3 fixed); **live e2e via `vercel dev` + real Supabase NOT run**
- [x] No unrelated files changed — only `api/admin/` + `db/invoices-schema.sql` added (no payment/auth/Stripe/vendor)
- [x] Reported in docs/logs.md (the Developer does not write a findings log)
- [x] docs/logs.md updated (FINISH 2026-06-22 13:03)
- [x] Manager recorded [REVIEW] (2026-06-22) — pending Security (Task 6) + live e2e + migration-applied check

Review requirements:
Manager (scope) + **Security** (admin-only, service-role not exposed, server-side totals) + Efficiency (query
shape). Touches admin + the service-role key — careful review before any deploy.

Notes:
Service-role key **server-only** — never reaches the browser. No Stripe. Pairs with the `db/invoices-schema.sql`
header comment ("writes EXACTLY the columns defined below").

---

## [REVIEW] Task 2 — Admin Invoice Builder UI (design direction)

Assigned Role:
Designer

Owner:
None

Risk:
Low (design direction / spec only — no code)

Goal:
Define the visual/UX direction for an admin invoice-builder screen and document it as a buildable spec in
`docs/design-guide.md`. Clean and professional — not a messy spreadsheet.

Why:
The admin needs a clear way to create/issue invoices. Per the role system the Designer specs it; the Developer
builds it in Task 3.

Files likely involved:

- `docs/design-guide.md` (the spec: layout, components, states, spacing/type using the documented system)
- read-only: `dashboard.html` admin panel (`.adm-*`, `.adm-nav` `data-view`, ~`:702-710`) to fit the existing admin UI

Do not touch:

- production code (the Designer does not edit `dashboard.html`); payment/auth/Stripe; the client billing page (Task 4)

Steps:

1. Spec the builder: client selector, title, optional notes, due date; a line-items editor (name, description,
   quantity, unit price) with add/remove rows; a **live subtotal + total**; **Save as draft** and **Issue
   invoice** actions; clear empty / error / success states.
2. Decide placement: a new admin **"Invoices"** `.adm-nav` view (recommended) or extend the existing
   **"Payments"** view — recommend one. Reuse the documented `.adm-*` admin components + the design system.
3. Show money to 2 decimals in the UI but note values are stored in **cents** (the Developer handles ×100 /
   ÷100). Specify how subtotal/total update live.
4. Write it all into `docs/design-guide.md` as a dated spec the Developer can build without guessing.

Completion checklist:

- [ ] Change completed (spec written in docs/design-guide.md)
- [ ] Relevant checks run (spec is buildable; references the documented design system)
- [ ] No unrelated files changed (docs only — no production code)
- [ ] Role-specific log updated (docs/design-guide.md dated entry)
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] (the Designer may set its own task status)

Review requirements:
Manager (scope + buildable spec). Security only if the spec implies new external scripts/links (it shouldn't).

Notes:
Direction only — no code. Pairs with Task 3. No Stripe / no Pay UI here (that's the client page + Phase 2).

---

## [REVIEW] Task 3 — Implement the Admin Invoice Builder

Assigned Role:
Developer / Implementation

Owner:
None (the Manager assigns + marks [IN PROGRESS] before start)

Risk:
High

Goal:
Build the admin invoice-builder UI from the Designer's Task 2 spec, wired to `POST /api/admin/invoices`.

Why:
Gives the admin a working create/issue-invoice screen. Depends on Task 1 (API) + Task 2 (design).

Files likely involved:

- `dashboard.html` — the **admin** (`.adm-*`) region only (new/extended Invoices view + its JS)
- read-only: `docs/design-guide.md` (Task 2 spec), `api/admin/invoices.js` (the API contract)

Do not touch:

- the **client** billing region of `dashboard.html` (Task 5) — claim only the admin region; do not run
  concurrently with Task 5
- payment/Stripe/auth logic; the Stripe `api/*` routes; price IDs
- NO Stripe / no payment code

Steps:

1. Build the UI per the Task 2 spec inside the admin panel (reuse `.adm-*` components; inline CSS/JS per
   convention).
2. Send the admin's Supabase access token as `Authorization: Bearer …` (mirror the existing `adminApi` pattern
   in `dashboard.html`) to `POST /api/admin/invoices`.
3. Client-side guards (defence-in-depth; the server is authoritative): block empty invoices, require ≥1 item,
   block negative / non-integer prices, require a selected client + a title.
4. Convert displayed dollars → **integer cents** before sending; do not rely on client totals (the server
   computes + trusts only its own).
5. Support **Save as draft** (`status: draft`) and **Issue** (`status: issued`). Show success + error states.
6. Test: load the admin panel, create a draft + an issued invoice against `vercel dev`; confirm rows land with
   correct cents; check the console. Report in docs/logs.md.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run (create draft + issued via `vercel dev`; console clean; cents correct)
- [ ] No unrelated files changed (admin region of dashboard.html only)
- [ ] Reported in docs/logs.md
- [ ] docs/logs.md updated (START + FINISH)
- [ ] Manager notified to record [REVIEW] (the Developer does not edit the board)

Review requirements:
Manager + Designer (matches the spec) + Security (token sent, no service-role on the client, server-trusted
totals) + Efficiency.

Notes:
Depends on Task 1 + Task 2. Shares `dashboard.html` with Task 5 — sequence this **first**, claim the admin
region. No Stripe.

---

## [REVIEW] Task 4 — Client Billing Page Invoice List (design direction)

Assigned Role:
Designer

Owner:
None

Risk:
Low (design direction / spec only)

Goal:
Define the client-facing billing page that lists the client's invoices (read-only), documented as a spec in
`docs/design-guide.md`.

Why:
Clients need to see invoices an admin issued them. Designer specs; Developer builds in Task 5.

Files likely involved:

- `docs/design-guide.md` (spec)
- read-only: `dashboard.html` client billing tab (`data-tab="billing"`, `<h2>Billing</h2>` ~`:639`)

Do not touch:

- production code; payment/auth/Stripe; the admin builder (Task 2)

Steps:

1. Spec the invoice list: per invoice show title, `id` (no `invoice_number` exists), a **status badge**
   (`draft|issued|paid|overdue|void|canceled`), total, due date, and line items (inline or expandable).
2. Spec a **Pay** button shown **only** for `issued`/`overdue` **unpaid** invoices — and for THIS phase it is a
   **disabled placeholder** (Stripe is Phase 2). Paid invoices read "Paid". **No edit controls anywhere** — the
   client can never change amounts.
3. Spec the empty state (no invoices) and the **mobile** layout. Reuse the design system / client billing styles.
4. Write the dated spec into `docs/design-guide.md`.

Completion checklist:

- [ ] Change completed (spec in docs/design-guide.md)
- [ ] Relevant checks run (buildable; on-system)
- [ ] No unrelated files changed (docs only)
- [ ] Role-specific log updated (docs/design-guide.md)
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] (the Designer sets its own task status)

Review requirements:
Manager. Security note: the spec must show read-only invoices + a disabled Pay button (no amount editing).

Notes:
Direction only. Pairs with Task 5. The Pay button is a disabled placeholder until Phase 2 (Stripe).

---

## [REVIEW] Task 5 — Implement the Client Billing Invoice List

Assigned Role:
Developer / Implementation

Owner:
None (the Manager assigns + marks [IN PROGRESS] before start)

Risk:
High

Goal:
Wire the client billing page to read the logged-in user's invoices + items from Supabase (anon key + RLS) and
render them per the Task 4 spec — read-only, with a disabled placeholder Pay button.

Why:
Lets clients see their issued invoices. Depends on Task 4 (design) + the applied schema/RLS.

Files likely involved:

- `dashboard.html` — the **client** billing region (`data-tab="billing"`) only
- read-only: `docs/design-guide.md` (Task 4 spec), `db/invoices-schema.sql`, `js/supabase-config.js` (the `db` client)

Do not touch:

- the **admin** region of `dashboard.html` (Task 3) — claim only the client region; not concurrent with Task 3
- payment/Stripe/auth logic; the existing plan/subscription buttons + `payment.html` (left intact — see Notes)
- NO Stripe Checkout (the Pay button is a disabled placeholder)

Steps:

1. With the signed-in session, query `invoices` (RLS returns only the caller's own via `client_user_id =
   auth.uid()`) + their `invoice_items`. Fetch items efficiently (one `in (...)` query or an embedded select),
   not N+1.
2. Render per Task 4: title, `id`, status badge, total (cents → dollars for display), due date, line items.
   **Hide `draft`** invoices (admin-only) unless the Manager later decides otherwise.
3. Show **paid** as paid; show **issued/overdue unpaid** with a **disabled** placeholder Pay button. **No edit
   controls** — render values, never inputs the client can change.
4. Escape any invoice/item text before inserting into the DOM (match the dashboard's existing `esc()` pattern;
   no raw `innerHTML` of DB data).
5. Empty state + mobile layout per spec. Test against `vercel dev` with a seeded issued invoice; confirm a
   second account cannot see the first's invoices; console clean. Report in docs/logs.md.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run (own-invoices-only confirmed; drafts hidden; no edit controls; console clean)
- [ ] No unrelated files changed (client billing region only)
- [ ] Reported in docs/logs.md
- [ ] docs/logs.md updated (START + FINISH)
- [ ] Manager notified to record [REVIEW] (the Developer does not edit the board)

Review requirements:
Manager + Designer (matches spec) + Security (own-rows-only via RLS, read-only, no amount editing, XSS-safe) +
Efficiency (no N+1).

Notes:
Depends on Task 4; run **after Task 3** (shared `dashboard.html`). The old plan/subscribe UI + `payment.html`
stay **untouched** this phase — whether the invoice list replaces them is a Phase-2 / Manager decision. No Stripe.

---

## [REVIEW] Task 6 — Security Review of the invoice system

Assigned Role:
Security

Owner:
None

Risk:
Medium (read-only audit)

Goal:
Audit the whole invoice system (Tasks 1/3/5) and report risks to the Manager in `docs/security-log.md`.

Why:
It handles money + admin powers + client data isolation — verify it, don't assume it.

Files likely involved:

- read-only: `api/admin/invoices.js`, `dashboard.html` (admin + client regions), `db/invoices-schema.sql`,
  `js/supabase-config.js`; the Supabase dashboard (RLS — not in the repo)
- write: `docs/security-log.md`

Do not touch:

- production code (audit only; fixes become Developer tasks)

Steps:

1. Verify clients **cannot create or edit** invoices (no client INSERT/UPDATE/DELETE; the service-role route is
   the only writer).
2. Verify a client **cannot view another client's** invoices/items (RLS `client_user_id = auth.uid()`; test
   cross-account if possible).
3. Verify the **service-role key is never exposed** to the frontend (only in `api/*` via `process.env`).
4. Verify `POST /api/admin/invoices` is **actually admin-only** (token → getUser → admin check; non-admin →
   403; no token → 401).
5. Verify **RLS is enabled** on `invoices` + `invoice_items` and the policies + `public.is_admin()` are applied
   in the live Supabase project (confirm the migration ran).
6. Verify **totals are computed server-side** and client-sent totals are ignored; money is integer cents.
7. Record each finding (evidence + severity) in `docs/security-log.md`; flag anything for the Manager to cut
   into a Developer fix task.

Completion checklist:

- [ ] Change completed (findings recorded)
- [ ] Relevant checks run (evidence-cited; cross-account test where possible)
- [ ] No unrelated files changed (docs only)
- [ ] Role-specific log updated (docs/security-log.md)
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] (Security sets its own task status)

Review requirements:
Manager (triage findings into Developer fix tasks).

Notes:
After Tasks 1/3/5. Read-only. RLS lives in Supabase — verify there, not just in the repo migration.

---

## [REVIEW] Task 7 — Performance / Code Review of the invoice system

> **Efficiency — invoice-system-review (2026-06-22 17:05).** Completed the review. Findings in
> `docs/performance-log.md` (dated entry): **1 Medium, 8 Low, ~8 Informational** + the confirmed strengths.
> Method: 5-dimension fan-out, every finding adversarially re-verified against source (verification downgraded
> the picker over-fetch Medium→Low and refuted the 500-`err.message` "fix" — it is by-design, mirrors
> `api/admin.js`). **Headline:** the system is healthy (N+1-free, indexed, integer-cents w/ server authority);
> the **one item to fix before Stripe** is the non-atomic invoice create (`api/admin/invoices.js:309-349` →
> Postgres RPC). The rest are cheap Low/Info wins. **Manager: triage the findings into Developer fix tasks.**

Assigned Role:
Efficiency

Owner:
Efficiency · invoice-system-review (2026-06-22)

Risk:
Low (review)

Goal:
Review invoice-related code for performance + maintainability and report to the Manager in
`docs/performance-log.md`.

Why:
Keep the billing pages fast and the code clean before more is built on top.

Files likely involved:

- read-only: `api/admin/invoices.js`, `dashboard.html` (invoice code), `db/invoices-schema.sql`
- write: `docs/performance-log.md`

Do not touch:

- production code (review only; fixes become Developer tasks)

Steps:

1. Check the billing-page load: no oversized/unbounded queries; invoice items fetched efficiently (no N+1; the
   `invoice_items_invoice_id_idx` / `invoices_client_user_id_idx` indexes are used).
2. Check for repeated code that should be shared, and messy/duplicated error handling.
3. Confirm no heavy assets/scripts were added; the page stays light.
4. Record findings + recommendations in `docs/performance-log.md`; flag fixes for the Manager.

Completion checklist:

- [x] Change completed (findings recorded — 1 Medium / 8 Low / ~8 Informational, 2026-06-22 17:05)
- [x] Relevant checks run (static review; queries cross-checked vs schema indexes; each finding adversarially re-verified against source; live timing/render deferred → Reviewer Task 8)
- [x] No unrelated files changed (docs only — performance-log.md, logs.md, this task's status line)
- [x] Role-specific log updated (docs/performance-log.md)
- [x] docs/logs.md updated
- [x] Task moved to [REVIEW] (Efficiency set its own task status)

Review requirements:
Manager (triage into Developer fix tasks).

Notes:
After Tasks 1/3/5. Review only. **Pre-Stripe gate:** the Medium finding (non-atomic invoice create → Postgres
RPC) should be scheduled as a Developer task ahead of Phase-2 Stripe; the rest are optional cheap wins.

---

## [REVIEW] Task 8 — Manual Testing of the invoice flow (Reviewer)

Assigned Role:
Reviewer

Owner:
None

Risk:
Low

Goal:
Test the invoice flow like a real user and log bugs / confusing parts / suggested fixes in
`docs/reviewer-log.md`.

Why:
Catch what code checks miss — the real admin + client experience, on desktop and mobile.

Files likely involved:

- write: `docs/reviewer-log.md` (REVIEW-#### findings)
- NO code (the Reviewer reports the experience)

Do not touch:

- any production code; `docs/taskboard.md` (the Manager turns findings into tasks)

Steps (test against a deployed preview or `vercel dev` — the Reviewer needs a real browser; if unavailable, say
so and defer rather than reporting a "live" test it could not run):

1. Admin can create a **draft** invoice; admin can **issue** an invoice.
2. Client sees their **issued** invoice (title, status, total, due date, line items).
3. Client **cannot edit** anything; client **cannot see another client's** invoice.
4. **Empty invoice** does not submit; **bad prices** (negative / non-numeric) do not submit.
5. Billing page looks good on **mobile**.
6. The **Pay** button is **not active yet** (disabled placeholder — Stripe is Phase 2).
7. Log every bug/confusion with steps, expected vs actual, severity, and a suggested fix.

Completion checklist:

- [ ] Change completed (findings logged)
- [ ] Relevant checks run (flows tested desktop + mobile, or deferred with a reason)
- [ ] No unrelated files changed (reviewer-log only)
- [ ] Role-specific log updated (docs/reviewer-log.md)
- [ ] docs/logs.md updated
- [ ] Manager notified (the Reviewer does not edit the board)

Review requirements:
Manager triages the findings into Developer/Designer tasks.

Notes:
After Tasks 1/3/5. Needs a browser/preview. Files findings only.

---

## 🚦 ROUND 2 — Pre-Stripe gate (from the Reviewer's conditional NO-GO, 2026-06-22)

> The Reviewer's source-level pass (`docs/reviewer-log.md`, REVIEW-0001…0013) returned a **conditional NO-GO**:
> the build has **no blocking code defect**, but the mandatory **live** test was not run and two items must be
> fixed before Stripe. These four gate tasks (G1–G4) are the **only** things between Phase 1 and Phase 2.
>
> **🔒 Manager gate — do NOT approve or start Stripe Checkout until ALL of:**
> 1. **G1** — atomic invoice creation is fixed,
> 2. **G2** — the mobile admin-builder label issue is fixed,
> 3. **G3** — Security passes the live RLS cross-tenant isolation check, and
> 4. **G4** — the Reviewer runs a real live browser pass and returns **GO**.

### Board sync — Phase-1 status (Manager, 2026-06-22)

Phase-1 build/review tasks were executed by concurrent sessions; the Manager has synced their board status from
`docs/logs.md`. **None can go [DONE] until the Round-2 gate (G1–G4) closes the live verification they all
deferred.**

| Task | What | Status | Evidence (docs/logs.md) |
|---|---|---|---|
| 1 | Admin invoice API | [REVIEW] | 13:03 Developer · admin-invoices-route |
| 2 | Admin builder design | [REVIEW] | 14:00 Designer · invoice-billing-ux |
| 3 | Admin builder impl | [REVIEW] | 13:40 Developer · admin-invoice-ui |
| 4 | Client billing design | [REVIEW] | 14:00 Designer · invoice-billing-ux |
| 5 | Client billing impl | [REVIEW] | 13:42 Developer · client-billing-invoices-ui; 16:40 · payment-page-invoices |
| 6 | Security review | [REVIEW] | 15:00 Security · invoice-security-review |
| 7 | Efficiency review | [REVIEW] | 17:05 Efficiency · invoice-system-review |
| 8 | Reviewer pass | [REVIEW] | 18:30 Reviewer · invoice-source-review (source pass → conditional NO-GO; live pass re-cut as **G4**) |

---

## [REVIEW] Gate Task G1 — Fix atomic invoice creation (owner "Task 1")

> **Manager — recorded 2026-06-22 (Developer `g1-atomic-invoice-rpc`, 19:25).** Built: `create_invoice_with_items`
> RPC (single transaction — a failed item insert rolls back the whole call, no orphan) + a `sort_order` column;
> `api/admin/invoices.js` now calls the RPC (two-insert/rollback removed); self-adversarial-reviewed (3 fixes).
> **PENDING before [DONE]:** owner applies `db/invoices-schema.sql` to Supabase (adds the RPC + `sort_order`;
> until then the route 404s the RPC), then Security re-review + an e2e create test. → [REVIEW]

Assigned Role:
Developer / Implementation

Owner:
None (Manager assigns + marks [IN PROGRESS] before the Developer starts)

Risk:
High — **pre-Stripe blocker**

Source:
Reviewer **REVIEW-0002** (Medium, data-integrity) + Efficiency "no atomic invoice create" + Security "non-atomic write" (grouped — one fix).

Goal:
Make invoice creation atomic — the `invoices` row and all `invoice_items` are created together, or nothing is.

Why:
Today the header + items are two non-transactional inserts with a compensating delete; if the items insert
fails AND the delete also fails, an **issued** invoice can persist with a Total but no line items — the client
sees a "phantom charge." Must be fixed before money flows.

Files likely involved:

- `db/invoices-schema.sql` — add a Postgres function `create_invoice_with_items(...)` that inserts header +
  items in ONE transaction and returns the rows (admin/service-role only; do not widen RLS)
- `api/admin/invoices.js` — replace the two-insert + compensating-delete flow with one
  `rpc('create_invoice_with_items', …)` call
- read-only: `docs/reviewer-log.md` (REVIEW-0002), `docs/performance-log.md`, `docs/security-log.md`

Do not touch:

- the admin auth gate, the server-side total calculation, or input validation (keep them — only the persistence step changes)
- payment/Stripe/customer-portal/webhook; price IDs; client-facing pages; no Stripe

Steps:

1. Add `create_invoice_with_items` to `db/invoices-schema.sql` (idempotent `create or replace function`): takes
   the validated invoice fields + the items, inserts the invoice then the items in one transaction, returns the
   created invoice + items.
2. In `api/admin/invoices.js`, after the existing auth + validation + **server-side** total calc, call the RPC
   instead of the two separate inserts; remove the compensating-delete path. Keep returning `{invoice, items}`.
3. Confirm validation + server-calculated totals are unchanged; RLS + service-role safety intact.
4. `node --check api/admin/invoices.js`; reason through the failure path (item insert fails → nothing persists);
   note the RPC must be **applied in Supabase**. Report in docs/logs.md.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run (`node --check`; failure-path reasoning; live e2e via `vercel dev` noted)
- [ ] No unrelated files changed
- [ ] Reported in docs/logs.md
- [ ] docs/logs.md updated (START + FINISH)
- [ ] Manager notified to record [REVIEW] (the Developer does not edit the board)

Review requirements:
Manager + **Security** (re-review the route: still admin-only, totals server-side, RLS/service-role intact) + Efficiency.

Acceptance criteria (owner):

- Invoice and invoice_items are created as one safe operation.
- If invoice_items fail, the invoice is not left behind.
- Server still calculates totals.
- Admin route still validates input.
- Existing RLS and service-role safety stay intact.

Notes:
The new RPC must be **applied in Supabase** (like the schema migration). Folds in REVIEW-0002. No Stripe.

---

## [REVIEW] Gate Task G2 — Fix the mobile admin invoice-builder labels (owner "Task 2")

> **Manager — recorded 2026-06-22 (Designer spec 19:10 + Developer build 19:55).** Added inline `data-label`s
> (Qty / Unit price / Amount) shown via `::before` at ≤560px, mirroring the client table. **PENDING before
> [DONE]:** Designer GUI-verify a likely **`$`/label overlap** on the price cell at ≤560px (the Developer
> proposed a small `.inv-cur` `position:static` fix) + the live mobile render. → [REVIEW]

Assigned Role:
Designer → Developer / Implementation (coupled design+build pair, per owner assignment)

Owner:
None (Manager assigns; the Manager marks the Developer half [IN PROGRESS] before build)

Risk:
Medium — pre-Stripe (usability)

Source:
Reviewer **REVIEW-0001** (Medium) + **REVIEW-0007** (Low, paired).

Goal:
Make the admin invoice builder usable on small screens (≤560px) — every line-item field clearly labelled.

Why:
At ≤560px the column header is `display:none` and the Qty / Unit price / Amount fields carry only `aria-label`s
(invisible to sighted users), so an admin on a phone sees unlabelled numeric boxes and can type a price into
Quantity. The **client** read-only table already does this right via `data-label` / `::before`.

Files likely involved:

- **Designer (step A):** `docs/design-guide.md` — spec the mobile labelling (reuse the client table's
  `data-label` + `::before` pattern; caption the read-only Amount; give the price input room at ~360px).
- **Developer (step B):** `dashboard.html` — admin invoice-builder region only (the ≤560px CSS ~`:576-577` and
  the line-item row builder ~`:2744-2747`).

Do not touch:

- the client billing region; payment/Stripe/auth; the server route; no Stripe

Steps:

A. **Designer** — write the mobile-label spec into `docs/design-guide.md` (visible labels for Qty / Unit price /
   Amount + the read-only Amount caption, mirroring the client table). Set [REVIEW]; hand off to the Developer.
B. **Developer** — implement per the spec: add visible labels at ≤560px; caption the read-only Amount so it
   doesn't read as editable; ease the price field at the smallest widths. Inline CSS per convention.
C. Test at 360px and 560px (a browser eyeball is the real check); confirm desktop unchanged; console clean.
   Report in docs/logs.md (Developer) / docs/design-guide.md (Designer).

Completion checklist:

- [ ] Change completed (Designer spec + Developer build)
- [ ] Relevant tests/checks run (≤560px + 360px render; desktop unaffected; console clean)
- [ ] No unrelated files changed (admin builder region only)
- [ ] Role-specific logs updated (design-guide.md for the Designer; docs/logs.md for the Developer)
- [ ] docs/logs.md updated
- [ ] Designer sets its own task status; Manager records the Developer/[REVIEW] status

Review requirements:
Manager + Designer (matches spec) + Reviewer (re-checks on mobile in G4).

Acceptance criteria (owner):

- Item name, description, quantity, and price fields are clearly labelled on mobile.
- The admin can understand every field without guessing.
- No cramped or overlapping invoice fields.
- Layout works on small phone widths.

Notes:
Owner-assigned **design+build pair** — a deliberate exception to the usual "design and build are separate tasks,"
because the design fix is trivial (reuse an existing pattern). Folds in REVIEW-0001 + REVIEW-0007. No Stripe.

---

## [TODO] Gate Task G3 — Live RLS cross-tenant isolation check (owner "Task 3") — STRIPE BLOCKER

Assigned Role:
Security

Owner:
None

Risk:
High — **Stripe blocker** (live verification; needs the owner's Supabase access + 2 client accounts)

Source:
Reviewer **REVIEW-0013** (gating) = Security **IV-GATE** (`invoice-gate-rls-must-be-live`) = standing F5.

Goal:
Confirm **live** that one client cannot read another client's invoices or invoice_items, and that normal
clients cannot write invoices or reach admin invoice routes.

Why:
Cross-tenant isolation rests **entirely** on Supabase RLS, which is invisible from the repo and unverifiable in
source. This is the single highest-impact failure mode and a hard prerequisite before any billing ships.

Files likely involved:

- the **Supabase dashboard** (RLS state — not in the repo); read-only: `db/invoices-schema.sql`,
  `js/supabase-config.js`, the client billing reads in `dashboard.html` / `payment.html`
- write: `docs/security-log.md`

Do not touch:

- production code (verification only; if RLS is wrong, the FIX becomes a separate Developer/owner task)

Steps:

1. In Supabase confirm `rowsecurity = true` on `public.invoices` AND `public.invoice_items`, and that all four
   policies + `public.is_admin()` exist (the migration + the G1 RPC were applied).
2. Signed in as **Client A** (anon key): `db.from('invoices').select('*')` (no `.eq`) → returns only A's rows.
3. As A, attempt to read a known **Client B** invoice id AND its `invoice_items` → must return **0 rows**.
4. As a normal client, attempt INSERT / UPDATE / DELETE on `invoices` → must be denied.
5. As a normal client (no admin token), call `POST /api/admin/invoices` → 401/403.
6. Record pass/fail per check in `docs/security-log.md`; if any fails, flag a fix task to the Manager. **This is
   a GO/NO-GO input — report the result clearly.**

Completion checklist:

- [ ] Change completed (live checks run + recorded)
- [ ] Relevant checks run (the 5 isolation checks above, against live Supabase)
- [ ] No unrelated files changed (docs only)
- [ ] Role-specific log updated (docs/security-log.md)
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] (Security sets its own task status) + result reported to the Manager

Review requirements:
Manager (records the gate result).

Acceptance criteria (owner):

- RLS is enabled on invoices and invoice_items; `rowsecurity` is active.
- Client A can read Client A invoices; Client A cannot read Client B invoices or Client B invoice_items.
- Normal clients cannot create, update, or delete invoices.
- Normal clients cannot access admin invoice routes.

Notes:
Needs the owner's Supabase access + a 2nd test client. No code change if RLS is correct. **Stripe blocker.**

---

## [TODO] Gate Task G4 — Real live Reviewer pass (owner "Task 4") — final GO / NO-GO

Assigned Role:
Reviewer

Owner:
None

Risk:
Required after fixes (live)

Source:
The Reviewer's own conditional NO-GO (`docs/reviewer-log.md`, 2026-06-22) — the live pass that was owed.

Goal:
Run the actual browser-based invoice flow **after G1 + G2 are fixed and G3 has passed**, and return a final
**GO or NO-GO** for Stripe.

Why:
The first Reviewer pass was source-only (no browser). Stripe cannot be approved without a real live pass.

Files likely involved:

- write: `docs/reviewer-log.md` (re-test results + final GO/NO-GO; close out REVIEW-0001 / 0002 / 0013)
- NO code (the Reviewer reports the experience)

Do not touch:

- production code; `docs/taskboard.md` (the Manager records status)

Steps (needs a real browser against a deployed preview or `vercel dev` + live Supabase):

1. Admin creates a **draft** invoice; admin **issues** an invoice.
2. Client sees the **issued** invoice; the client **cannot edit** anything.
3. The client **cannot** access another client's invoice (the live cross-account check — coordinate with G3).
4. Mobile **client billing** page works; the **admin invoice builder** works on mobile (confirm G2's label fix).
5. Console has **no major errors**.
6. Confirm the G1 atomic fix (no itemless issued invoice) holds.
7. Record results in `docs/reviewer-log.md` and give a clear **GO or NO-GO** for Stripe.

Completion checklist:

- [ ] Change completed (live re-test done; GO/NO-GO recorded)
- [ ] Relevant checks run (full flow desktop + phone; console)
- [ ] No unrelated files changed (reviewer-log only)
- [ ] Role-specific log updated (docs/reviewer-log.md)
- [ ] docs/logs.md updated
- [ ] Manager notified (the Reviewer does not edit the board)

Review requirements:
Manager records the GO/NO-GO and, on GO + G1/G2/G3 all green, opens the Stripe phase.

Acceptance criteria (owner):

- Admin creates a draft invoice; admin creates an issued invoice.
- Client sees the issued invoice; cannot edit it; cannot access another client's invoice.
- Mobile billing page works; admin invoice builder works on mobile.
- Console has no major errors.
- Reviewer gives a final GO or NO-GO for Stripe.

Notes:
**Last gate.** Sequence **after** G1, G2 (fixed) and G3 (passed). Needs a browser/preview.

---

### Deferred — non-gating invoice polish backlog (NOT a Stripe blocker)

Triaged from the Reviewer pass; batch these **after** GO (a future Developer/Designer cleanup task — none of
these block Stripe):

- **REVIEW-0003** (Low) — fractional-qty live estimate disagrees with Save (client-side).
- **REVIEW-0004** (Low) — client "Created" date can show the previous day in US timezones.
- **REVIEW-0005** (Low) — over-cap qty/price fails late as a generic toast (add client-side max checks).
- **REVIEW-0006** (Low) — client-list load-failure shows a misleading "Select a client" error.
- **REVIEW-0008** (Low) — admin identity defined in two places (route env vs SQL `is_admin()` literal) → can drift.
- **REVIEW-0009** (Low) — a client can read their OWN drafts via a direct anon query (owner decision: tighten
  the owner-SELECT policy to exclude drafts, or accept). Worth checking during G3.
- **REVIEW-0010** (Info) — no discount/tax input → Subtotal == Total (intentional phase-1; add a clarifying note).
- **REVIEW-0011** (Info) — dashboard billing loading/empty states not in an aria-live region (vs `/payment`).
- **REVIEW-0012** (Info) — cancelling "Issue invoice" gives no acknowledgement.

---

## 💳 PHASE — Stripe invoice payments (S4–S9), created 2026-06-22 — NEXT FOCUS

> **Goal:** connect the (already-built) custom invoice system to Stripe so a client can pay an **issued/overdue**
> invoice in-site, and the invoice flips to **paid** from the webhook. The project already uses Stripe Elements /
> Payment Element, PaymentIntents, the Customer Portal, and webhooks (`api/checkout.js`, `api/customer-portal.js`,
> `api/webhook.js`) — **reuse them, don't reinvent.**
>
> **Phase rules (owner, 2026-06-22):**
> - **Test mode only** this phase — use Stripe **test** keys for all building/testing.
> - **Never print or expose** the Stripe secret key, Stripe webhook secret, or Supabase service-role key. Server
>   secrets come only from `process.env`; the frontend uses only the **publishable** key + the anon key.
> - Local tooling is allowed: **Stripe CLI** (`stripe listen` / `stripe trigger`), **Supabase CLI** (if present),
>   npm scripts, local dev server (`vercel dev`).
> - **Ask the owner before any destructive DB change.** The two columns this phase needs are **additive**
>   (`ADD COLUMN IF NOT EXISTS`) — non-destructive — but must be **applied in the TEST Supabase project**.

### Gate (read before starting)

- **Build + test in TEST MODE may proceed now** — S4/S5/S6 are additive; no production deploy, no live keys.
- **Owner's Stripe-phase completion rule:** do NOT mark the Stripe phase complete until **S4 + S5 + S6** are done,
  **S7** (Security) passes, **S8** (Efficiency) passes, and **S9** (Reviewer live test, test mode) passes.
- **🔒 Manager safety flag (this moves money):** the Round-2 gate still matters here — land **G1 (atomic creation)**
  before **S5** so a *payable* invoice can never be an itemless phantom, and confirm **G3 (live RLS isolation)** +
  **G4** before flipping to **live** Stripe keys / production. (G2 mobile is non-blocking for payments.)

### Grounding (reuse — don't duplicate)

- **Auth + PaymentIntent pattern:** `api/checkout.js` — bearer token → `supabaseAdmin.auth.getUser` (:50-56),
  `stripe.paymentIntents.create({…metadata})` → returns `client_secret` (:97-110). S4 mirrors this, keyed to an invoice.
- **Webhook:** `api/webhook.js` — `bodyParser:false` (:20), `stripe.webhooks.constructEvent` (:85), service-role
  client (:23-25), `switch(event.type)` (:97). S6 adds a `payment_intent.succeeded` case.
  ⚠️ **There is ALREADY a Stripe `invoice.paid` case (:153) — that is for Stripe SUBSCRIPTION invoices, NOT our
  `public.invoices`.** Do not conflate or change it. Our flow keys off `metadata.invoice_id` on the PaymentIntent.
- **Schema columns to ADD (additive; apply in TEST Supabase):** `db/invoices-schema.sql` currently has **no**
  `stripe_payment_intent_id` and **no** `paid_at`. Add `stripe_payment_intent_id text` (S4) + `paid_at timestamptz`
  (S6) via `alter table public.invoices add column if not exists …`. The `status` CHECK already allows
  `issued`/`overdue`/`paid`.
- **Frontend Stripe:** `payment.html` already mounts the Stripe Payment Element — reuse that for S5 (test publishable key locally).

### Sequence & dependencies

1. **S4** (endpoint) + **S6** (webhook handler) — build in parallel; coordinate ONE additive migration that adds
   both columns. Independent code paths.
2. **S5** (Pay button) needs **S4**'s contract; **recommend G1 landed first**. Touches `dashboard.html` client
   billing region (+ `payment.html`) — not concurrent with the admin-region task (G2).
3. **S7** (Security) + **S8** (Efficiency) after S4/S5/S6.
4. **S9** (Reviewer live test, test mode) last — after S4/S5/S6 + S7/S8; needs Stripe CLI + test cards (+ the
   Manager-flag G3 confirmed for real-money safety).

---

## [TODO] Task S4 — Custom invoice payment endpoint (POST /api/invoices/pay)

Assigned Role:
Developer / Implementation

Owner:
None (Manager assigns + marks [IN PROGRESS] before the Developer starts)

Risk:
High — billing endpoint (test mode this phase)

Goal:
Build a secure `POST /api/invoices/pay` (file `api/invoices/pay.js`) that creates a Stripe PaymentIntent for a
specific invoice the caller owns, using the invoice total from Supabase — never the frontend.

Why:
The invoice system has no payment path yet. This is the server authority for invoice payment.

Files likely involved:

- NEW `api/invoices/pay.js` (→ `/api/invoices/pay`)
- `db/invoices-schema.sql` — add `alter table public.invoices add column if not exists stripe_payment_intent_id text;` (additive; apply in TEST Supabase)
- read-only: `api/checkout.js` (auth gate :50-56 + paymentIntents.create :97-110), `db/invoices-schema.sql`

Do not touch:

- Stripe secret-key handling (server `process.env` only — never to the client)
- `api/checkout.js` / `api/customer-portal.js` working logic; price IDs; the webhook (S6 owns it)

Steps:

1. Reuse the `api/checkout.js` auth gate: `Authorization: Bearer <token>` → `supabaseAdmin.auth.getUser` → 401 if invalid.
2. Accept **only** `invoice_id` from the body (ignore any client-sent amount/status).
3. Load the invoice from Supabase (service role) by `invoice_id`; 404 if missing.
4. Confirm `invoice.client_user_id === caller.id` → 403 otherwise.
5. Reject `draft` / `paid` / `void` / `canceled` (→ 409); allow **only** `issued` or `overdue`.
6. Read `total_amount_cents` from the loaded invoice (the ONLY amount source); guard > 0.
7. `stripe.paymentIntents.create({ amount: total_amount_cents, currency: 'usd', metadata: { invoice_id, supabase_user_id: caller.id } })` (test mode). (Optional: attach an existing `stripe_customer_id` if present.)
8. Save `stripe_payment_intent_id` on the invoice (the new column).
9. Return `{ clientSecret: intent.client_secret }` (mirror checkout.js). Generic non-leaking errors; `console.error` server-side.
10. `node --check api/invoices/pay.js`; trace negatives (no token→401, not owner→403, wrong status→409, bad invoice→404). Report in docs/logs.md.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run (`node --check`; negative-path trace; test-mode PaymentIntent via Stripe CLI / `vercel dev`)
- [ ] No unrelated files changed
- [ ] Reported in docs/logs.md
- [ ] docs/logs.md updated (START + FINISH)
- [ ] Manager notified to record [REVIEW] (Developer does not edit the board)

Review requirements:
Manager + Security (S7) + Efficiency (S8).

Acceptance criteria (owner):

- Verifies the logged-in Supabase user; accepts `invoice_id` only; loads the invoice; confirms `client_user_id`
  matches the caller.
- Rejects draft/paid/void/canceled; allows only issued/overdue.
- Reads `total_amount_cents` from Supabase; never trusts the frontend amount.
- Creates a PaymentIntent with metadata `invoice_id` + `supabase_user_id`; saves `stripe_payment_intent_id`;
  returns the `client_secret`.

Notes:
Adds an additive column → apply in the **TEST** Supabase project. Amount is server-only. Test mode; no secret keys in client.

---

## [TODO] Task S5 — Connect the client billing Pay Now button

Assigned Role:
Developer / Implementation

Owner:
None (Manager assigns + marks [IN PROGRESS] before start)

Risk:
High (client billing UI; test mode)

Goal:
Make the client billing Pay Now button live: call `POST /api/invoices/pay`, receive the `client_secret`, and let
the client pay in-site via the existing Stripe Payment Element.

Why:
Today the Pay button is a disabled placeholder (invoice phase). S5 wires it to S4.

Files likely involved:

- `dashboard.html` — client billing region (the invoice Pay button + an Elements mount) and/or `payment.html`
- read-only: `payment.html` (existing Payment Element setup to reuse), the S4 contract

Do not touch:

- the admin region of `dashboard.html` (G2); the subscription/plan logic; price IDs; the server route (S4)

Steps:

1. Show **Pay Now** only for `issued`/`overdue` **unpaid** invoices (the placeholder's existing condition).
2. On click, POST `{ invoice_id }` to `/api/invoices/pay` with the user's bearer token; receive `clientSecret`.
3. Mount the **existing** Stripe Payment Element (reuse the `payment.html` setup; **test** publishable key locally) and confirm payment in-site.
4. The client never sees or edits the amount (display only; the server set it).
5. Handle success (show "payment processing — confirmation pending"; the webhook S6 sets paid) + error/loading states.
6. Test in test mode (`vercel dev` + Stripe CLI + test card 4242…); console clean. Report in docs/logs.md.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run (test-mode pay in-site; Pay-button scoping; console clean)
- [ ] No unrelated files changed (client billing region only)
- [ ] Reported in docs/logs.md
- [ ] docs/logs.md updated (START + FINISH)
- [ ] Manager notified to record [REVIEW]

Review requirements:
Manager + Designer (button/flow matches the billing design) + Security (S7) + Reviewer (S9).

Acceptance criteria (owner):

- Pay Now appears only for issued/overdue unpaid invoices.
- Calls `POST /api/invoices/pay` with `invoice_id`; uses the returned `client_secret` + the existing Payment Element.
- Client pays inside the site; client cannot edit the amount.

Notes:
Depends on S4. **Recommend G1 (atomic) landed first.** Shares `dashboard.html` with G2 (admin) — not concurrent.
Test mode; test publishable key locally (don't commit/expose keys).

---

## [TODO] Task S6 — Webhook: mark invoice paid on payment_intent.succeeded

Assigned Role:
Developer / Implementation

Owner:
None (Manager assigns + marks [IN PROGRESS] before start)

Risk:
High (webhook → billing state; test mode)

Goal:
Add a `payment_intent.succeeded` handler to `api/webhook.js` that marks the matching invoice **paid** — idempotently.

Why:
Paid status must come from Stripe (the webhook), never the frontend.

Files likely involved:

- `api/webhook.js` — add a `case "payment_intent.succeeded":` in the existing `switch` (:97)
- `db/invoices-schema.sql` — add `alter table public.invoices add column if not exists paid_at timestamptz;` (additive; apply in TEST Supabase)
- read-only: existing `constructEvent` (:85), service-role client (:23-25)

Do not touch:

- the existing signature verification / `bodyParser:false` (:20) — keep them
- the existing `invoice.paid` (:153) + subscription cases — those are Stripe SUBSCRIPTION invoices, NOT ours; leave them

Steps:

1. Keep verifying the Stripe signature with the existing webhook secret + raw body (`constructEvent`).
2. In a new `case "payment_intent.succeeded":` read `pi.metadata.invoice_id`; if absent, ignore (non-invoice PI, e.g. a subscription).
3. Load the matching invoice (service role) by id.
4. Confirm `pi.amount === invoice.total_amount_cents` (and currency) — mismatch → log + do NOT mark paid.
5. **Idempotent:** if already `paid`, no-op (200). Otherwise set `status='paid'`, `paid_at=now()`, and `stripe_payment_intent_id` if not already set.
6. Always return 200 on handled/duplicate events; `console.error` real errors (no PII/secrets).
7. Test with the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook` + a real test payment (and/or `stripe trigger payment_intent.succeeded`); re-send to prove idempotency. `node --check`. Report in docs/logs.md.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run (`node --check`; `stripe listen`/`trigger`; duplicate-event idempotency; amount-mismatch rejected)
- [ ] No unrelated files changed
- [ ] Reported in docs/logs.md
- [ ] docs/logs.md updated (START + FINISH)
- [ ] Manager notified to record [REVIEW]

Review requirements:
Manager + Security (S7) + Efficiency (S8).

Acceptance criteria (owner):

- Verifies the Stripe signature with the existing webhook secret.
- Reads `invoice_id` from PaymentIntent metadata; loads the invoice; confirms amount == `total_amount_cents`.
- Marks status `paid`, sets `paid_at`, saves `stripe_payment_intent_id` if needed.
- Idempotent — repeated events don't break anything.

Notes:
Adds an additive `paid_at` column → apply in the **TEST** Supabase project. Idempotency required (Stripe retries).
Test mode. Don't touch the subscription-invoice cases.

---

## [TODO] Task S7 — Security review of the Stripe invoice payment flow

Assigned Role:
Security

Owner:
None

Risk:
High (review — money flow)

Goal:
Audit S4/S5/S6 and report risks to the Manager in `docs/security-log.md`. Give a clear pass/fail.

Files likely involved:

- read-only: `api/invoices/pay.js`, `api/webhook.js`, the S5 client code in `dashboard.html`/`payment.html`, `db/invoices-schema.sql`
- write: `docs/security-log.md`

Do not touch:

- production code (audit only; fixes → Developer tasks)

Steps / checks:

1. Client **cannot control the amount** — the server reads `total_amount_cents` from Supabase, ignores any client amount.
2. Client **cannot pay another's invoice** — S4 enforces `client_user_id === caller.id` (403 otherwise).
3. **Paid status comes from the webhook only** — no client path sets `status='paid'`.
4. **Webhook signature verification still works** (raw body + `constructEvent`; `bodyParser:false` intact).
5. **Stripe secret key + Supabase service-role key are server-only** (`process.env`; never to the client; never logged/printed).
6. **PaymentIntent metadata validated safely** — `invoice_id` looked up, amount re-checked vs the invoice; absent/unknown metadata handled.
7. **Draft/paid/void/canceled cannot be paid** (S4 rejects; webhook idempotent).
8. Record findings (evidence + severity) in `docs/security-log.md`; flag fixes to the Manager.

Completion checklist:

- [ ] Change completed (findings recorded)
- [ ] Relevant checks run (evidence-cited)
- [ ] No unrelated files changed (docs only)
- [ ] Role-specific log updated (docs/security-log.md)
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] (Security sets its own status) + pass/fail reported

Review requirements:
Manager.

Acceptance criteria (owner):
Client can't control amount; client can't pay another's invoice; paid status from webhook only; signature
verification works; Stripe secret + service-role keys server-only; metadata validated safely; draft/paid/void
can't be paid.

Notes:
After S4/S5/S6. Read-only. Pairs with Round-2 **G3** (live RLS) for the full money-safety sign-off.

---

## [REVIEW] Task S8 — Efficiency / code review of the Stripe implementation

> **Efficiency — invoice-stripe-payment-review (2026-06-22 21:30).** Done. Findings in
> `docs/performance-log.md`: **1 Medium bug, 3 Low, several Informational** + the future-maintainability map.
> Method: 5-area fan-out, every finding adversarially re-verified (23 agents). **Verdict: PASS** on code
> quality / performance / maintainability; **ready for Reviewer live test S9 in TEST MODE.** **One bug to fix
> before LIVE keys:** a concurrent **double-charge** — `api/invoices/pay.js:161` creates the PaymentIntent with
> no `idempotencyKey`, so two concurrent tabs can create two PIs and (if both confirmed) charge twice; the
> webhook keeps the row correct but can't refund the 2nd. **Not a Reviewer-blocker** (single-tab path is safe).
> One-line fix: `idempotencyKey: "inv_" + invoice.id`. **Manager: cut a Developer fix task for the
> idempotencyKey before flipping to live keys; the rest are optional cleanups.**

Assigned Role:
Efficiency

Owner:
Efficiency · invoice-stripe-payment-review (2026-06-22)

Risk:
Low (review)

Goal:
Review S4/S5/S6 for maintainability + clean reuse; report to the Manager in `docs/performance-log.md`.

Files likely involved:

- read-only: `api/invoices/pay.js`, `api/webhook.js`, `api/checkout.js` (shared patterns), the S5 client code
- write: `docs/performance-log.md`

Do not touch:

- production code (review only; fixes → Developer tasks)

Steps / checks:

1. **No duplicated Stripe logic** — `api/invoices/pay.js` and `api/checkout.js` share auth/PaymentIntent setup
   without copy-paste (a small shared helper if it's duplicated).
2. The existing **Payment Element** flow is reused cleanly (no second Stripe init style).
3. The pay endpoint is **readable**; the webhook handler is **not messy** (the new case is self-contained).
4. **Errors + loading states** are clean (client) and non-leaking (server).
5. Code is **maintainable for future deposits / partial payments** (amount source centralized; status flow extensible).
6. Record findings + recommendations in `docs/performance-log.md`; flag fixes to the Manager.

Completion checklist:

- [x] Change completed (findings recorded — 1 Medium bug / 3 Low / Informational, 2026-06-22 21:30)
- [x] Relevant checks run (static review; pay/webhook/DB flow + concurrency race traced; each finding adversarially re-verified against source; live e2e deferred → Reviewer S9)
- [x] No unrelated files changed (docs only — performance-log.md, logs.md, this task's status line)
- [x] Role-specific log updated (docs/performance-log.md)
- [x] docs/logs.md updated
- [x] Task moved to [REVIEW] (Efficiency set its own status)

Review requirements:
Manager.

Acceptance criteria (owner):
No duplicated Stripe logic; Payment Element reused cleanly; readable pay endpoint; non-messy webhook; clean
errors/loading; maintainable for future deposits/partial payments. → **All met** (auth boilerplate dedup is a
Low cleanup, not a blocker; Payment Element reused cleanly; pay endpoint readable; webhook clean + idempotent;
errors/loading clean; future deposits/partial path named via a child `invoice_payments` table).

Notes:
After S4/S5/S6. Review only. **One Medium bug for a Developer fix task before LIVE keys:** the missing
`idempotencyKey` on PaymentIntent create (concurrent double-charge). Ready for Reviewer S9 in TEST MODE now.

---

## [TODO] Task S9 — Reviewer live payment test (Stripe test mode)

Assigned Role:
Reviewer

Owner:
None

Risk:
Required (live flow, test mode)

Goal:
Test the full invoice payment flow in **Stripe test mode** and give a final **GO / NO-GO**; log in `docs/reviewer-log.md`.

Files likely involved:

- write: `docs/reviewer-log.md`
- NO code

Do not touch:

- production code; `docs/taskboard.md` (the Manager records status)

Steps (Stripe **test mode**; needs `vercel dev` + Stripe CLI `stripe listen --forward-to .../api/webhook` + a real browser):

1. Admin **issues** an invoice; the client sees it.
2. Client clicks **Pay Now** → the Stripe Payment Element opens **in-site**.
3. A **test card** (4242 4242 4242 4242) payment **succeeds**.
4. The **webhook marks the invoice paid** (status → paid; `paid_at` set).
5. The paid invoice **no longer shows an active Pay button**.
6. A **failed** test card (e.g. 4000 0000 0000 0002) does **NOT** mark the invoice paid.
7. A client **cannot pay another client's invoice** (attempt with another's `invoice_id` → rejected).
8. Console has no major errors. Record results + a clear **GO or NO-GO** in `docs/reviewer-log.md`.

Completion checklist:

- [ ] Change completed (test-mode run; GO/NO-GO recorded)
- [ ] Relevant checks run (success + failure + cross-client; webhook paid; button state)
- [ ] No unrelated files changed (reviewer-log only)
- [ ] Role-specific log updated (docs/reviewer-log.md)
- [ ] docs/logs.md updated
- [ ] Manager notified (Reviewer does not edit the board)

Review requirements:
Manager records the GO/NO-GO; on GO + S7/S8 pass (+ the Round-2 G1/G3 safety items), the Manager marks the
Stripe phase complete.

Acceptance criteria (owner):
Admin issues invoice → client sees it → Pay Now opens the Element in-site → test card succeeds → webhook marks
paid → paid invoice has no active Pay button → failed payment doesn't mark paid → client can't pay another's invoice.

Notes:
**Last gate.** Test mode only — never live keys for this test. Needs Stripe CLI + test cards + a browser/preview.

---

## ⚙️ Role-system migration — 2026-06-19

The old **Manager / Worker / Reviewer** system was replaced by **Manager / Designer / Efficiency /
Security**. What changed:

- **"Worker" is retired.** Build work is now split by specialty: **Designer** (visual / UX / copy),
  **Efficiency** (performance / loading / code weight), **Security** (safety / audits).
- **"Reviewer" is retired.** `docs/reviewer-log.md` is **deprecated** (it never held findings). Role-based
  findings now live in **`docs/design-guide.md`**, **`docs/performance-log.md`**, and
  **`docs/security-log.md`**; the Manager triages those into tasks here.
  **➤ Superseded 2026-06-22:** the Reviewer role is **active again** and `docs/reviewer-log.md` is **in
  use** — see the 2026-06-22 update above. (The "Worker → Designer/Efficiency/Security" split still stands;
  the new **Developer / Implementation** role now owns applying code changes.)
- **Legacy tasks below keep their original wording** (history — do not erase). Where a legacy task still
  says "Owner: Worker", treat it as **reassigned per the table below**. New tasks use the `CLAUDE.md` format.

**Open-task reassignment (new role owners):**

| Task | Status | New owner | Review by |
|---|---|---|---|
| Replace Styles Tab Preview w/ Laptop Teardown | [REVIEW] | closure via Task B (**Manager**) | Manager |
| Remove AI Aspects From Laptop Teardown | [REVIEW] | **Designer** | Manager; Efficiency if assets change |
| Redesign Laptop Teardown 3D Model | [REVIEW] | **Designer** | Manager; re-run Task A |
| Task A — Live-verify laptop teardown | [TODO] | **Designer** (render / mobile UX) | Efficiency (console / network) |
| Task B — Review & close the [REVIEW] tasks | [TODO] | **Manager** | — |
| Task C — Vendor homepage Google Fonts | [REVIEW] | **Efficiency** | Manager (scope) + Designer (type unchanged) |
| Task E — Vendor fonts on remaining pages | [TODO] | **Efficiency** | Security (head-only) + Manager |
| Backlog — lowercase `Animations/` | backlog | **Efficiency** | Security (case / deploy safety) |
| Task D — Resolve `dashboard-style.html` | [DONE] | — (done; user-confirmed removal) | — |

> The Manager will re-cut the most important of these into the new `CLAUDE.md` task format as they're
> picked up. Until then the task bodies below are accurate — only the **role owner** changes per this table.

---

# Active tasks (new role system)

> One task per role, in the `CLAUDE.md` format. Claim a task by marking it `[IN PROGRESS]`, adding your
> Owner/session, and writing a START entry in `docs/logs.md` before editing any file.

## [TODO] Manager: Triage role logs and drive the laptop-teardown REVIEW cluster to closure

Assigned Role:
Manager

Owner:
None

Risk:
Low

Goal:
Keep the board clean — read the three role logs, turn any new findings into properly-formatted tasks, and
shepherd the laptop-teardown `[REVIEW]` cluster (the cleanup/verify tasks + the 3D-model redesign) to
`[DONE]` via Task A (live-verify) and Task B (closeout).

Why:
Several tasks sit in `[REVIEW]` waiting on the one GUI-only item (live WebGL render) plus a closeout pass.
The Manager owns moving completed work through review and stopping the board from accumulating stale items.

Files likely involved:

- `docs/taskboard.md` (organize / close / re-cut), `docs/logs.md`
- read-only: `docs/design-guide.md`, `docs/performance-log.md`, `docs/security-log.md`

Do not touch:

- website code (the Manager organizes, it doesn't build) unless explicitly told to
- payment / Stripe / Supabase / auth

Steps:

1. Read the three role logs; group duplicates; convert any `New` findings into new-format tasks.
2. After a GUI session runs Task A, use Task B to move the two teardown `[REVIEW]` tasks + the 3D-model
   redesign to `[DONE]` (or bounce with specifics).
3. Re-cut the highest-value legacy tasks into the `CLAUDE.md` format; archive `[DONE]` items into a history
   section so the board stays readable.
4. Log decisions in `docs/logs.md`.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run
- [ ] No unrelated files changed
- [ ] Role-specific log updated
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] or [DONE]

Review requirements:
None (Manager owns the board) — record major decisions in `docs/logs.md`.

Notes:
This is the standing Manager loop — re-open it whenever the role logs accumulate new findings.

---

## [DONE] Designer: Establish the homepage design baseline and fix obvious visual inconsistencies

> **Manager review — 2026-06-20:** Scope verified — only `index.html` (a 2-line `--warm`/`--warm-lt` token
> substitution, visually a pure variable swap) + the docs. `docs/design-guide.md` is now fully documented
> (palette tokens, type scale, spacing, component rules) with an "Open design follow-ups" list. Approved → **DONE**.

Assigned Role:
Designer

Owner:
Designer · Opus — homepage-design-baseline (2026-06-20)

Risk:
Medium

Goal:
Read the homepage (`index.html`) and record the *actual* design system into `docs/design-guide.md` (color
tokens, type scale, spacing scale, canonical components), then apply only clearly-safe consistency fixes.
Anything larger gets written up as a proposed follow-up task, not done here.

Why:
`docs/design-guide.md` still has "to document" placeholders. The Designer can't keep the site consistent
(the brand-led, restrained direction) without knowing the tokens already in use — documenting them first
prevents one-off styles drifting in.

Files likely involved:

- `index.html` — inline `<style>` (read; light consistency edits only) + presentation copy
- `docs/design-guide.md` — fill in the tokens/decisions
- `docs/logs.md`; `docs/taskboard.md` (this task's status only)

Do not touch:

- payment / Stripe / Supabase / auth logic (and the logic on `dashboard|payment|onboarding|login`.html)
- vendor files; `Animations/laptop-teardown/` internals
- the `#styles` "Preview coming soon" cards 02–05
- no large redesign — document + propose; only trivially-safe fixes this pass

Steps:

1. Inspect `index.html` inline CSS: record the real background/text/accent color values, the type scale
   (Cormorant Garamond / Mulish sizes + line-heights per breakpoint), the spacing scale, and the canonical
   button (`.btn-sand`) + card (`.style-card`) styles into `docs/design-guide.md`.
2. List visual inconsistencies (stray colors, buttons not matching `.btn-sand`, cramped/one-off spacing,
   weak hierarchy) as design-guide findings.
3. Apply only clearly-safe consistency fixes; write anything bigger up as a proposed Designer task.
4. Test desktop + mobile layout, hover/focus states, and the console for visible breakage.
5. Log decisions in `docs/design-guide.md` + `docs/logs.md`; move task to `[REVIEW]`.

Completion checklist:

- [x] Change completed — documented the full homepage design system in `docs/design-guide.md`; applied 1 clearly-safe fix (`--warm` → `.btn-sand`, byte-identical)
- [x] Relevant tests/checks run — grep (token counts; no "To document" left; no `googleapis`/`gstatic`); re-read for coherence; `git status` scope check
- [x] No unrelated files changed — only `index.html` (2 lines) + the three docs; `git status` confirms
- [x] Role-specific log updated — `docs/design-guide.md` placeholders filled + dated decision entry + "Open design follow-ups"
- [x] docs/logs.md updated — START + FINISH
- [x] Task moved to [REVIEW] or [DONE] — **[REVIEW]**

Review requirements:
Manager (scope); Efficiency if any change adds assets/scripts; Security if any link/form/script is added.

Notes:
Inspiration (principles, not cloning): the vervaunt reference in `CLAUDE.md`. Stay restrained — no random
glows or hype copy.

---

## [DONE] Efficiency: Finish the site-wide no-CDN web fonts (remaining pages)

> **Manager review — 2026-06-20:** Scope verified — `git diff` on all 6 pages (incl. `payment.html` and
> `dashboard.html`) shows **head/font-only** changes: CDN `<link>`+`preconnect` removed, inline `@font-face`
> added → `/fonts`; no payment/auth/Stripe logic touched. Two woff2 added (`mulish-700`, `cormorantgaramond-700`).
> Site is now CDN-free for fonts. Residual: a GUI type-render eyeball (non-blocking). Approved → **DONE**.
> Legacy **Task E** below is superseded by this task.

Assigned Role:
Efficiency

Owner:
Efficiency · Opus · no-cdn-fonts-remaining-pages (2026-06-20)

Files claimed (this session):
`dashboard.html`, `login.html`, `payment.html`, `onboarding.html`, `success.html`, `cancel.html` — **head
font tags + top of the inline `<style>` only**; `fonts/` (added `mulish-700.woff2`,
`cormorantgaramond-700.woff2`). Not touching any payment/Stripe/Supabase/auth logic, vendor files, or
`index.html` (Task C, already done).

Risk:
Medium

Goal:
Replace the Google Fonts CDN `<link>` on every page other than the homepage with local `@font-face`,
reusing the `/fonts` folder. Homepage is already done (Task C); finish the rest so the whole site is
CDN-free for fonts.

Why:
Those pages still request `fonts.googleapis.com` / `fonts.gstatic.com` — render-blocking third-party
requests that also fail in the user's CDN-blocked environment. See `docs/performance-log.md` →
"google-fonts-cdn". This **absorbs the legacy "Task E" below** — treat this new-format task as the single
source of truth.

Files likely involved:

- `dashboard.html`, `login.html`, `payment.html`, `onboarding.html`, `success.html`, `cancel.html` —
  **only** the `<head>` font `<link>`/`preconnect` + an inline `@font-face` `<style>` block
  (`dashboard-style.html` was removed in Task D)
- `/fonts/` — reuse; add any missing woff2 weights a page actually uses
- `docs/performance-log.md`; `docs/logs.md`; `docs/taskboard.md` (status only)

Do not touch:

- any payment / Stripe / Supabase / auth **logic** on those pages — edit only the head font tags + the
  `@font-face` style block, nothing else
- vendor files; the animation's vendored fonts (read-only source)

Steps:

1. Per page, audit the faces actually used (every `font-family`/`font-weight`/`font-style` + a
   `<strong>`/`<b>`/`bold`/heading sweep). Don't trust the CDN URL — it over-requests (the homepage used
   5 of the 12 requested faces).
2. For each used face: if it's already in `/fonts`, point `@font-face` at it; if not (likely Mulish-700,
   Cormorant Garamond italic 400/600, CG-700), obtain the woff2 (Google Fonts latin subset) and add it.
3. Replace each page's CDN `<link>` + `preconnect`s with the inline `@font-face` block (`font-display:swap`).
4. Verify per page: grep clean of `googleapis`/`gstatic`; each woff2 valid (`wOF2` magic); type unchanged.
5. Log in `docs/performance-log.md` + `docs/logs.md`; move task to `[REVIEW]`.

Completion checklist:

- [x] Change completed — 6 pages swapped to local `@font-face`; `/fonts` gained `cormorantgaramond-700` (download) + `mulish-700` (copy from vendor)
- [x] Relevant tests/checks run — grep clean (no `googleapis`/`gstatic`/`preconnect`); both new woff2 valid `wOF2`; all `src` refs resolve (no 404); per-page face counts audited (6/2/4/4/3/4); head-only scope diff
- [x] No unrelated files changed — `git diff` shows only head/font lines on the 6 pages; vendored fonts untouched; no JS/auth/payment logic
- [x] Role-specific log updated — `docs/performance-log.md` (finding → Fixed + completion entry)
- [x] docs/logs.md updated — START + FINISH
- [x] Task moved to [REVIEW] or [DONE] — **[REVIEW]**

Review requirements:
Security (confirm only head/font tags changed on the auth/payment pages) + Manager (scope) + Designer
(type renders unchanged).

Notes:
May read the same page heads as the Designer task — claim files in a START log entry first to avoid a
collision.

---

## [DONE] Security: Run a site-wide security audit pass and populate the security log

> **Manager review — 2026-06-20:** Audit complete and in scope (read-only; `git status` confirms no code
> changed — only docs). 8 evidence-cited findings (1 High, 4 Medium, 1 Low, 1 informational bundle, 1 clean
> baseline). Findings triaged into fix tasks below ("Fix tasks triaged from the 2026-06-20 Security audit").
> Approved → **DONE**.

Assigned Role:
Security

Owner:
Security — Opus (site-wide-audit-pass, 2026-06-20)

Risk:
Low

Goal:
Do a read-only security sweep of the whole site and record every finding (with evidence + severity) in
`docs/security-log.md`. Audit only — propose fixes as findings/tasks; do not change code this pass.

Why:
`docs/security-log.md` currently holds only the migrated baseline. A live pass turns the Security
checklist into concrete, evidence-backed findings the Manager can triage into fix tasks.

Files likely involved:

- read-only: all root `*.html`, `supabase-config.js`, `api/*.js`, `vercel.json`, `Animations/**`
- write: `docs/security-log.md`; `docs/logs.md`; `docs/taskboard.md` (status only)

Do not touch:

- any production code this pass (audit only) — especially payment / Stripe / Supabase / auth
- vendor files

Steps:

1. Work the Security checklist from `CLAUDE.md`: unsafe links / `target="_blank"` without
   `rel="noopener noreferrer"`; unsafe `innerHTML`; secrets/API keys in any frontend file (only `pk_live_…`
   and the Supabase anon key are allowed there); external scripts/CDNs; `file://`/localhost assumptions;
   absolute local paths; iframe risks; form/input handling; deployment risks; local-only scripts.
2. Confirm the critical constraint: **no** Stripe secret / webhook secret / Supabase `service_role` key in
   any frontend file (those belong only in `/api` via `process.env`).
3. Record each finding in `docs/security-log.md` (Area / Finding / Severity / Evidence / Recommendation /
   Status: New). Extend the existing baseline entries; don't duplicate them.
4. For anything that warrants a fix, set Status: Task Created and flag it for the Manager — do not fix here.
5. Log in `docs/logs.md`; move task to `[REVIEW]`.

Completion checklist:

- [x] Change completed — *8 findings (F1–F8) recorded in `docs/security-log.md` with `file:line` evidence*
- [x] Relevant tests/checks run — *read-only audit; evidence re-grep-confirmed; `node --check` not needed (no code changed)*
- [x] No unrelated files changed — *`git status`: only `docs/security-log.md`, `docs/logs.md`, `docs/taskboard.md`*
- [x] Role-specific log updated — *`docs/security-log.md` — new "Live audit pass — 2026-06-20" subsection*
- [x] docs/logs.md updated — *START + FINISH entries*
- [x] Task moved to [REVIEW] or [DONE] — *[REVIEW]; headline F1 (High IDOR) flagged for the Manager*

Review requirements:
Manager (prioritize the findings into fix tasks).

Notes:
Evidence-based only — no scary claims without a code reference. This pass is non-blocking and won't collide
with the font/design work (it's read-only on code).

---

# Fix tasks triaged from the 2026-06-20 Security audit

> Source: `docs/security-log.md` (live audit pass, 2026-06-20). **F1 is the priority** — a High-severity
> IDOR on live billing. Tasks ordered by severity.

## [REVIEW] Security: Add caller authentication to the unauthenticated billing endpoints (customer-portal + checkout)

Assigned Role:
Security

Owner:
Security — Opus (billing-endpoints-auth-fix, 2026-06-20)

Risk:
High

Goal:
Require an authenticated Supabase session on `api/customer-portal.js` and `api/checkout.js`, and verify the
requested `userId` belongs to the caller, before doing any Stripe work.

Why:
Security audit **F1 (High)** + **F2 (Medium)**: `api/customer-portal.js` has no caller auth — anyone who
supplies a victim's `user_id` (or `cus_…`) gets a working Stripe Billing Portal URL for that victim (IDOR on
live billing: view invoices, change card, cancel). `api/checkout.js` similarly trusts an attacker-supplied
`userId`. Shared root cause and fix.

Files likely involved:

- `api/customer-portal.js`, `api/checkout.js`
- pattern reference (already implemented): `api/admin.js:86-103` (bearer token → `auth.getUser` → identity check)
- frontend callers that must now send the token: `dashboard.html` ("Manage Subscription"), `payment.html` (checkout)

Do not touch:

- the Stripe price IDs, the webhook, or the working Payment Element / subscription logic beyond adding the auth gate
- unrelated endpoints

Steps:

1. Read `Authorization: Bearer <token>`; 401 if missing.
2. Verify server-side with `supabaseAdmin.auth.getUser(token)`; 401 on failure.
3. Enforce `userId === caller.id` (403 otherwise) before resolving the customer / creating the portal or
   payment-intent/subscription.
4. Narrow CORS from `*` to the site origin; update the two frontend callers to send the access token.
5. Test the full live flow end-to-end (sign-in → checkout → manage subscription) before deploy.

Completion checklist:

- [x] Change completed — *auth gate on both endpoints + token sent by all 4 frontend callers; `caller`-derived identity*
- [x] Relevant tests/checks run — *`node --check` both API files; static 401/403 negative-path trace; `git diff` scope check. **Live e2e NOT run (needs browser/env/live keys) — required before deploy.***
- [x] No unrelated files changed — *only the 2 API files + 2 frontend callers + 3 docs; no webhook, no price IDs, no vendor*
- [x] Role-specific log updated — *`docs/security-log.md` "Fix applied" entry (F1/F2 → Fixed, pending live test)*
- [x] docs/logs.md updated — *START + FINISH entries*
- [x] Task moved to [REVIEW] or [DONE] — *[REVIEW]: live billing → needs e2e test + owner deploy sign-off*

Review requirements:
Manager (scope) + a careful end-to-end payment test. **Touches LIVE billing — confirm with the owner before deploying.**

Notes:
From `docs/security-log.md` 2026-06-20 (F1 `customer-portal-missing-auth-idor`, F2 `checkout-missing-auth`).
Highest priority on the board.

---

## [REVIEW] Efficiency: Exclude docs/ from the Vercel deploy (.vercelignore)

Assigned Role:
Efficiency

Owner:
Efficiency · Opus · deploy-hygiene (2026-06-20)

Risk:
Medium

Goal:
Stop the `docs/` folder (task board, work log, security log) from being served publicly on Vercel.

Why:
Security audit **F4**: with no `.vercelignore`, a static deploy serves `/docs/*` — publishing an
attacker-readable roadmap of known, unfixed weaknesses (including the F1 IDOR). Opsec / info-disclosure;
quick to fix.

Files likely involved:

- new `.vercelignore` (list `docs/`)
- `vercel.json` only if a different exclusion mechanism is chosen

Do not touch:

- routing / rewrites that serve the actual site

Steps:

1. Add `.vercelignore` containing `docs/`.
2. On a Vercel preview, confirm `/docs/security-log.md` returns 404 and the site still works.
3. Log it in `docs/logs.md`.

Completion checklist:

- [x] Change completed — added root `.vercelignore` excluding `docs`, `db`, `CLAUDE.md`
- [x] Relevant tests/checks run — confirmed no site page / `/api` references `docs/` or `db/` at runtime (only Stripe-SDK doc-comments in `node_modules`); `.vercelignore` syntax verified
- [x] No unrelated files changed — only the new `.vercelignore`
- [x] Role-specific log updated — `docs/performance-log.md` (deploy-hygiene entry, covers F4+F3)
- [x] docs/logs.md updated — START + FINISH
- [x] Task moved to [REVIEW] or [DONE] — **[REVIEW]** (Security to confirm `/docs/*` + `/db/*` 404 on a preview)

Review requirements:
Manager; Security (confirm `/docs/*` 404 on preview).

Notes:
From `docs/security-log.md` 2026-06-20 (F4 `docs-folder-publicly-served`). Do this soon — it currently
exposes the security findings themselves.

---

## [REVIEW] Efficiency: Vendor Chart.js locally on the admin dashboard (remove jsDelivr CDN)

Assigned Role:
Efficiency

Owner:
Efficiency · Opus · deploy-hygiene (2026-06-20)

Risk:
Medium

Goal:
Replace the jsDelivr Chart.js `<script>` on `dashboard.html` with a locally-vendored copy (or add SRI),
matching the no-CDN policy.

Why:
Security audit **F3**: `dashboard.html:830` loads `chart.js@4.4.1` from jsDelivr with no SRI, in the admin
(PII) context — supply-chain risk — and it breaks in the user's CDN-blocked environment.

Files likely involved:

- `dashboard.html` (the chart.js `<script src>` ~line 830)
- a new vendored `chart.umd.min.js` (e.g. under `vendor/` or `js/`)

Do not touch:

- the Stripe.js loads (`dashboard.html:828`, `payment.html:477`) — Stripe MUST load from `js.stripe.com` and
  does not support SRI; leave them
- admin / auth logic

Steps:

1. Download `chart.js@4.4.1` UMD build; vendor it locally; reference it with a root-relative path.
2. Confirm the dashboard charts still render; grep the page clean of `jsdelivr`.
3. Log in `docs/performance-log.md`.

Completion checklist:

- [x] Change completed — vendored `chart.js@4.4.1` UMD to `js/vendor/chart.umd.min.js`; dashboard `<script>` points there
- [x] Relevant tests/checks run — 205 KB, contains "Chart.js v4.4.1", `node --check` OK; `dashboard.html` grep-clean of `jsdelivr`/`cdn.` (only Stripe's `js.stripe.com` remains)
- [x] No unrelated files changed — my `dashboard.html` change is only the Chart.js `<script>`; the concurrent Security F1/F2 client-auth edits in the same file are theirs (different region — see logs)
- [x] Role-specific log updated — `docs/performance-log.md` (deploy-hygiene entry)
- [x] docs/logs.md updated — START + FINISH
- [x] Task moved to [REVIEW] or [DONE] — **[REVIEW]** (render is admin-GUI; Security confirms CDN gone)

Review requirements:
Manager; Security (confirm the CDN is gone / SRI added).

Notes:
From `docs/security-log.md` 2026-06-20 (F3 `chartjs-jsdelivr-cdn`).

---

## [TODO] Manager / Owner: Verify Supabase RLS policies in the Supabase dashboard

Assigned Role:
Manager

Owner:
None

Risk:
Medium (verification)

Goal:
Confirm Row Level Security is ON and correctly scoped for `project_inquiries` and `subscriptions`, so the
exposed anon key cannot read other users' rows.

Why:
Security audit **F5**: frontend data isolation depends entirely on RLS, which isn't in the repo and can't be
verified from source. If RLS is missing or mis-scoped, the anon key could read other users' data.

Files likely involved:

- none in-repo — this is a check in the **Supabase dashboard**; record the result in `docs/security-log.md`

Do not touch:

- n/a (verification only)

Steps:

1. In Supabase, confirm RLS is enabled on `project_inquiries` + `subscriptions`, policies scoped to `auth.uid()`.
2. Re-check the onboarding `signUp`→insert path under the current email-confirmation setting (`auth.uid()`
   may be null if confirmation is ON).
3. Record the outcome in `docs/security-log.md` (update F5 status).

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run
- [ ] No unrelated files changed
- [ ] Role-specific log updated
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] or [DONE]

Review requirements:
Manager.

Notes:
From `docs/security-log.md` 2026-06-20 (F5 `rls-not-verifiable-from-repo`). Needs the owner's Supabase access.

---

## [REVIEW] Security: Add security response headers in vercel.json

Assigned Role:
Security

Owner:
Security — Opus (security-headers-vercel-json, 2026-06-21)

Risk:
Low

Goal:
Add a `headers` block to `vercel.json` for defense-in-depth.

Why:
Security audit **F6** (+ the `inline-scripts-no-csp` note): no `X-Frame-Options` / `frame-ancestors` (the
auth/payment pages are frameable → clickjacking), and no `nosniff`, `Referrer-Policy`, or HSTS.

Files likely involved:

- `vercel.json` (`headers` block)

Do not touch:

- existing `cleanUrls` / `trailingSlash` / `rewrites`

Steps:

1. Add `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`),
   `Referrer-Policy: strict-origin-when-cross-origin`, and `Strict-Transport-Security`.
2. A full script-`src` CSP is harder (every page inlines scripts) — note it as a follow-up; don't break pages.
3. Verify the headers on a preview; log it.

Completion checklist:

- [x] Change completed — *6 headers added to `vercel.json` (`source: "/(.*)"`); minimal CSP only — no script/style/connect restriction*
- [x] Relevant tests/checks run — *valid JSON (node parse); routing keys preserved. **Header presence + live regression need a Vercel preview (curl -sI + browser) — not runnable headless.***
- [x] No unrelated files changed — *only `vercel.json` + 3 docs; `cleanUrls`/`trailingSlash`/`rewrites` untouched*
- [x] Role-specific log updated — *`docs/security-log.md` F6 → Fixed; deferred full-CSP allowlist recorded*
- [x] docs/logs.md updated — *START + FINISH entries*
- [x] Task moved to [REVIEW] or [DONE] — *[REVIEW]: verify the 6 headers + no CSP violations on a preview before deploy*

Review requirements:
Manager; Efficiency if it affects loading.

Notes:
From `docs/security-log.md` 2026-06-20 (F6 `missing-security-headers`). The Low/informational F7 items
(admin-email disclosure, `admin.js` raw errors + `.or()` interpolation, checkout email-dedupe) are logged as
defense-in-depth notes — fold them in here or leave as low-priority; not urgent.

---

# Designer queue — brand de-AI (2026-06-20)

> Owner request: the site reads as AI-generated; restore the intended identity. **Run in order F → S → T**
> (one Designer at a time). **F and S both edit `index.html` — never concurrently.** Each session claims
> files in a `docs/logs.md` START entry first.

## [TODO] Designer: Restore original-snapshot typography (Distillery Display + Playfair Display), site-wide

Assigned Role:
Designer

Owner:
None

Risk:
High

Goal:
Replace Cormorant Garamond (display) + Mulish (body) with **Distillery Display** (headers/display) +
**Playfair Display** (subtext/body) across the whole site, vendored locally (no CDN).

Why:
The owner wants the original typographic identity back; the current CG + Mulish reads generic. Git history
has no Distillery/Playfair, so this is a fresh vendor, not a revert.

Files likely involved:

- `/fonts/` — add `distillery-display-*.woff2` (downloaded / licensed) + `playfair-display-*.woff2` (Google
  Fonts latin subset). The existing CG/Mulish woff2 become unused → Efficiency prunes later.
- `index.html` — the `@font-face` block + **every** `font-family` declaration (the type system documented in
  `docs/design-guide.md`).
- `dashboard.html`, `login.html`, `payment.html`, `onboarding.html`, `success.html`, `cancel.html` — head
  `@font-face` + `font-family` **only**.
- `docs/design-guide.md` — rewrite the Typography section to the new families.
- (Teardown fonts are handled in Task T, not here.)

Do not touch:

- payment / Stripe / Supabase / auth **logic** (font CSS only on those pages); vendor JS; the teardown files.

Steps:

1. Download & vendor Distillery Display (legitimate / licensed web font) + Playfair Display woff2 into
   `/fonts`. Pick the weights actually used (map CG 600 / CG 500-italic / Mulish 400-500-600-700 → matching
   Distillery display weights + Playfair regular / medium / semibold / italic).
2. Add `@font-face` rules (`font-display:swap`, `src:url(fonts/…)`); swap `font-family` site-wide
   (display → Distillery, body/subtext → Playfair).
3. Update `docs/design-guide.md` Typography to the new families.
4. Verify: type renders on every page; grep clean of `googleapis`/`gstatic`; no stray old-family refs left
   unintentionally; legibility check on Playfair at body/subtext sizes.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run
- [ ] No unrelated files changed
- [ ] Role-specific log updated
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] or [DONE]

Review requirements:
Manager (scope) + Efficiency (loading + prune unused woff2) + Designer (visual).

Notes:
Distillery Display is commercial — use a legitimately obtained web font; if a proper woff2 can't be sourced,
flag to the owner and set this `[BLOCKED]`. Playfair Display = OFL (free). **Collides with Task S on
`index.html` — run first, not concurrently.**

---

## [REVIEW] Designer: Redesign the Styles section (remove the AI numbered placeholder grid)

Assigned Role:
Designer

Owner:
Designer · Opus — styles-redesign (2026-06-20)

Risk:
Medium

Goal:
Full redesign of the homepage `#styles` section so it stops reading as an AI/template grid: remove the
`01–06` `.sc-index` numbering and the five empty "Preview coming soon" placeholder cards, and present the
real content intentionally and on-brand.

Why:
Owner: "the styles section looks like ai… the 01,02,etc is ai." Only card 01 (the teardown) is real; 02–06
are empty placeholders → the section looks unfinished / templated.

Files likely involved:

- `index.html` — the `#styles` markup (`~290–339`) + its inline CSS (`.style-grid`, `.style-card`,
  `.sc-index`, `.sc-kicker`, `.sc-title`, `.sc-desc`, `.sc-foot`, `.sc-go`, `.sc-soon`, `~144–199`).
- `docs/design-guide.md` — record the decision.

Do not touch:

- payment / auth / etc.; the teardown animation files (keep the card → `/Animations/laptop-teardown` link
  working); other homepage sections unless a shared component must change.

Steps:

1. Remove the `.sc-index` numbered motif.
2. Replace the 6-card placeholder grid with an intentional treatment (e.g. feature the real Teardown
   showcase + an honest, minimal "more coming" instead of 5 fake cards), using the canonical components and
   the new fonts.
3. Keep card 01 → teardown link functional; retire the "Preview coming soon" placeholders.
4. Test desktop / mobile / hover / console; record the decision in `docs/design-guide.md`.

Completion checklist:

- [x] Change completed — *`#styles` redesigned: numbered grid + 5 placeholder cards removed; single
      featured teardown card (`.style-card.feat`) + honest lede. `index.html` diff +10/−51, Styles-only.*
- [x] Relevant tests/checks run — *grep: 0 `.sc-index`/`.sc-soon`/`.style-grid`/"Preview coming soon"
      left, 1 `.style-card`, teardown link intact; CSS braces 124/124; no JS/payment/auth hunks. Live
      in-browser eyeball still advised (non-GUI).*
- [x] No unrelated files changed — *only `index.html` (#styles) + docs; `--warm` token fix in HEAD untouched.*
- [x] Role-specific log updated — *`docs/design-guide.md` styles-redesign decision entry + ref sections.*
- [x] docs/logs.md updated — *START + FINISH (2026-06-20).*
- [x] Task moved to [REVIEW] or [DONE] — *[REVIEW].*

Review requirements:
Manager (scope) + Efficiency if assets added + Security if new links added.
→ **Manager:** done **ahead of Task F** (typography) per owner direction — forward-compatible (canonical
components + current fonts; the later `font-family` swap needs no rework here). Efficiency/Security **not**
triggered: no new assets/links/forms/scripts (net markup + CSS removed; same single teardown link).

Notes:
"Full redesign" per the owner. **Sequence after Task F** (build on the new type system) — both edit
`index.html`. The teardown's functional `cap-num` "01" counter is handled in Task T, not here.
Done 2026-06-20 (Designer · styles-redesign); see `docs/logs.md` FINISH + `docs/design-guide.md`.

---

## [TODO] Designer: De-AI / on-theme polish pass on the laptop-teardown feature

Assigned Role:
Designer

Owner:
None

Risk:
Medium

Goal:
Audit `Animations/laptop-teardown/` for anything that looks AI-generated or off-theme, list it in
`docs/design-guide.md`, and apply the safe fixes — aligning typography, color, copy, and the CTA with the
WebSharke brand.

Why:
The owner wants the "computer unfolding" page to match the site and shed any generic / AI feel. It currently
uses a generic dark/aqua studio look, a plain `.btn` CTA (not `.btn-sand`), and will diverge from the site
after the font change.

Files likely involved:

- `Animations/laptop-teardown/index.html` (copy / structure), `style.css` (theme / color / effects / type),
  `vendor/fonts.css` (only to align fonts — coordinate with Task F).
- `docs/design-guide.md`.

Do not touch:

- vendor JS (three / gsap / ScrollTrigger); `script.js` model / animation logic (geometry already
  redesigned — presentation only); payment / auth.

Steps:

1. Inventory AI / off-theme items: generic glows, colors vs the palette (`--deep`/`--foam`/`--aqua`/`--ink`/
   sand), plain `.btn` vs `.btn-sand`, fonts not matching the new site fonts, copy tone, the `01/Assembled`
   caption styling, missing coastal/brand cues.
2. Align typography to the new site fonts; match the CTA to `.btn-sand`; tune colors to the palette; tighten
   copy. Apply safe fixes; propose bigger reworks for Manager review.
3. Test the scroll render + console + mobile; record findings / decisions in `docs/design-guide.md`.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run
- [ ] No unrelated files changed
- [ ] Role-specific log updated
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] or [DONE]

Review requirements:
Manager (scope) + Efficiency (no heavy assets added; perf intact) + Security (if any link / script changes).

Notes:
**Depends on Task F** (type alignment) — sequence after it. Keep the useful runtime guards / strings
(`file://` message, loader / error text). Don't touch `script.js` geometry / animation.

---

# More tasks — 2026-06-20 (round 2)

> Owner asked for more tasks across all roles, plus a corporate-site Designer task. Several depend on
> **Task F** (fonts) — don't start those until F lands. Severity/sequence noted per task.

## [TODO] Manager: Clean & archive the task board + add a "Current focus" list

Assigned Role:
Manager

Owner:
None

Risk:
Low

Goal:
Move `[DONE]`/closed legacy items into a "History (archived)" section at the bottom, keep active work near
the top, and add a short "Current focus" priority list so any session sees what matters most.

Why:
The board has grown long and mixes finished history with active work. "Keep `docs/taskboard.md` clean" is
core Manager work.

Files likely involved:

- `docs/taskboard.md`; `docs/logs.md`

Do not touch:

- website code; do not delete task history — **move** it to an archive section and log what moved.

Steps:

1. Add a "## Current focus" list ordering the open work (F1 billing-auth first, then brand F→S→T, etc.).
2. Move `[DONE]`/closed legacy tasks into "## History (archived)" at the bottom.
3. Log the cleanup.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run
- [ ] No unrelated files changed
- [ ] Role-specific log updated
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] or [DONE]

Review requirements:
None (Manager owns the board).

Notes:
This rewrites large parts of `docs/taskboard.md` — don't run it while another session is editing task statuses.

---

## [TODO] Manager: Start a decisions log (docs/DECISIONS.md)

Assigned Role:
Manager

Owner:
None

Risk:
Low

Goal:
Create `docs/DECISIONS.md` capturing standing decisions so sessions stop re-litigating them: no-CDN/
vendor-locally policy, the six-role system (Manager / Designer / Developer / Efficiency / Security /
Reviewer), the font change (Distillery + Playfair), the F1 auth-fix direction, docs/ excluded from deploy,
etc.

Why:
`CLAUDE.md` originally referenced a decisions doc that never existed; decisions are scattered across logs.

Files likely involved:

- new `docs/DECISIONS.md`; `docs/logs.md`; optionally `CLAUDE.md` reading list.

Do not touch:

- website code

Steps:

1. Create `docs/DECISIONS.md` with dated one-paragraph entries (each with its "why").
2. Optionally link it from `CLAUDE.md`.
3. Log it.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run
- [ ] No unrelated files changed
- [ ] Role-specific log updated
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] or [DONE]

Review requirements:
None.

Notes:
Low priority; do after the board cleanup.

---

## [REVIEW] Designer: Create a corporate-style demo site

Assigned Role:
Designer

Owner:
Designer · Opus — corporate-demo (2026-06-21)

Risk:
Medium

Goal:
Build a **single self-contained corporate-style demo page, as a reusable template** — generic/**unnamed**
brand with realistic, swappable placeholder content — that WebSharke can showcase in the Styles section and
reuse for future client corporate sites (the way the laptop-teardown is a live demo).

Why:
Owner request. The Styles section (Task S) is being redesigned to show real examples instead of empty
"Preview coming soon" placeholders; a corporate demo is one such example.

Files likely involved:

- a new self-contained folder/page, e.g. `demos/corporate/` (HTML/CSS/JS inline per convention), all assets
  vendored locally (no CDN); images under `images/`.
- `index.html` `#styles` — link the demo from a card (coordinate with Task S).
- `vercel.json` only if a clean route is needed; `docs/design-guide.md` (record the style direction).

Do not touch:

- payment / Stripe / Supabase / auth; vendor JS of other features.

Steps:

1. Build **one** self-contained corporate landing page as a reusable template: **no company name**;
   realistic placeholder copy in clearly-swappable blocks (hero, services, about, contact, etc.).
2. Design a clean, professional corporate aesthetic (strong hierarchy, restrained, real-feeling content),
   reusing the site's new fonts/components where sensible; **no** generic AI-template look.
3. Self-contained, responsive, no external CDNs; test desktop/mobile/console.
4. Link it from the redesigned Styles section; record the decision in `docs/design-guide.md`.

Completion checklist:

- [x] Change completed — built `demos/corporate/index.html` (self-contained, unnamed, reusable; own
      warm-paper/forest-teal brand; vendored CG+Mulish `@font-face`, inline SVG only, inert form) + wired it
      into `index.html` `#styles` as the 2nd live demo (new `.style-two` 2-up grid). Fixed an SVG-`var()`
      presentation-attr bug in the work-tile motifs.
- [x] Relevant tests/checks run — grep: 0 SVG-`var()` left, all 7 font `src` resolve, base/favicon/lang
      present, landmarks balanced (9/9 sections), 22 `SWAP:` markers, reduced-motion + `<noscript>`, CSS
      braces net 0, no CDN/fetch/XHR/SRI; `index.html` diff scoped to `.style-two` CSS + `#styles` markup.
      **Live in-browser render NOT run (non-GUI) — recommend a ~1-min eyeball.**
- [x] No unrelated files changed — my footprint is `demos/corporate/index.html` (new) + `index.html`
      `#styles`; the `Site_bkg` `<picture>` hunks in `index.html` are the concurrent Efficiency session's.
- [x] Role-specific log updated — `docs/design-guide.md` `corporate-demo` decision entry (+ the reusable
      SVG-`var()` rule).
- [x] docs/logs.md updated — START (11:35) + FINISH (12:30).
- [x] Task moved to [REVIEW] or [DONE] — **[REVIEW]**.

Review requirements:
Manager (scope/aesthetic) + Efficiency (asset weight; no CDN) + Security (any forms/links/scripts).
→ Same-origin `/demos/corporate` link only; the page's contact form is inert (no endpoint/fetch). Built
ahead of Task F (fonts) per owner direction — reuses the CG/Mulish family names F will swap, so it inherits
the new fonts with no rework here.

Notes:
Scope confirmed by the owner: **single demo page, built as an unnamed reusable template** with swappable
placeholder content (not a full multi-page site). Pairs with Task S (extends `#styles` from one demo to two).
Keep it lightweight and fully self-contained. No raster images — all visuals inline SVG/CSS.

---

## [TODO] Designer: Extend the documented design system to the inner pages

Assigned Role:
Designer

Owner:
None

Risk:
Medium

Goal:
Audit the inner pages (`login`, `onboarding`, `payment`, `dashboard`, `success`, `cancel`) against the
design system documented in `docs/design-guide.md` and align their typography/spacing/color/components —
**presentation only**.

Why:
The baseline only documented/standardized the homepage; the inner pages have their own inline styles and may
drift from the brand, especially after the font change.

Files likely involved:

- the 6 inner pages' inline `<style>` / presentation markup (CSS only).
- `docs/design-guide.md`.

Do not touch:

- payment / Stripe / Supabase / auth **logic** on those pages — presentation only.

Steps:

1. Compare each page's tokens/type/spacing/components to the design-guide; list inconsistencies.
2. Align presentation to the documented system + new fonts; apply safe fixes, propose larger reworks.
3. Test each page desktop/mobile/console; record decisions in `docs/design-guide.md`.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run
- [ ] No unrelated files changed
- [ ] Role-specific log updated
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] or [DONE]

Review requirements:
Manager (scope) + Security (confirm only presentation changed on payment/auth pages) + Efficiency if assets.

Notes:
**Sequence after Task F** (fonts). Also folds in the design-guide "Open design follow-ups" (unused/duplicate
tokens `--sand` / `--surf` / `--aqua-d`).

---

## [REVIEW] Efficiency: Image / asset optimization audit

Assigned Role:
Efficiency

Owner:
Efficiency · Opus · image-optimization (2026-06-21)

Risk:
Low

Goal:
Audit `images/` for oversized assets and optimize them — especially the full-bleed homepage background
`images/Site_bkg.png` (loaded `fetchpriority="high"`) and the logos — with no visible quality loss.

Why:
The homepage paints a full-screen background image early; an oversized PNG hurts LCP/mobile load.

Files likely involved:

- `images/*` (compress/resize; consider WebP + appropriate sizes); references in pages if formats change.
- `docs/performance-log.md`.

Do not touch:

- payment/auth logic; keep the `images/` path convention (don't break image links).

Steps:

1. List image sizes; flag the heaviest (likely `Site_bkg.png`).
2. Compress/resize (and/or add WebP with fallback); preserve visual quality.
3. Verify each page renders; record before/after sizes in `docs/performance-log.md`.

Completion checklist:

- [x] Change completed — Site_bkg.png (1.5 MB) → WebP 73 KB + JPEG fallback via `<picture>`; logos quantized in place (Tab 47→3 KB, Main 39→13 KB); `images/` −84% on disk, −94.5% modern payload
- [x] Relevant tests/checks run — visual orig-vs-optimized (3 gradient regions + logos at render size) → no banding/regression; quantitative pixel diff ≈1/255; grep clean of `Site_bkg.png`; every page's logo paths unchanged
- [x] No unrelated files changed — only `images/*` + `index.html` (bg `<picture>` + WebP preload); no JS/auth/payment
- [x] Role-specific log updated — `docs/performance-log.md` (before/after entry)
- [x] docs/logs.md updated — START + FINISH
- [x] Task moved to [REVIEW] or [DONE] — **[REVIEW]** (Designer/Manager: GUI quality eyeball)

Review requirements:
Manager + Designer (confirm no visible quality regression).

Notes:
Don't add a build step/dependency — optimize the files directly.

---

## [TODO] Efficiency: Prune the now-unused Cormorant Garamond / Mulish woff2 (after Task F)

Assigned Role:
Efficiency

Owner:
None

Risk:
Low

Goal:
Once Task F swaps the site to Distillery + Playfair, remove the orphaned CG/Mulish woff2 from `/fonts` and
any dead `@font-face` rules so the repo doesn't ship unused fonts.

Why:
Task F leaves the old families unused; dead font files = wasted weight + confusion.

Files likely involved:

- `/fonts/` (delete orphaned woff2); leftover `@font-face`/`font-family` refs across pages.
- `docs/performance-log.md`.

Do not touch:

- the laptop-teardown's `vendor/fonts/*` unless Task T also moved it off CG/Mulish (coordinate).

Steps:

1. After F lands, grep for remaining `cormorant`/`mulish` refs; confirm none still used.
2. Delete orphaned woff2 + dead `@font-face`; verify every page's type still renders.
3. Log before/after in `docs/performance-log.md`.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run
- [ ] No unrelated files changed
- [ ] Role-specific log updated
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] or [DONE]

Review requirements:
Manager.

Notes:
**Blocked until Task F is done.** Don't remove a font still referenced anywhere.

---

## [TODO] Security: Harden the admin API minor items (audit F7)

Assigned Role:
Security

Owner:
None

Risk:
Low

Goal:
Address the low/informational F7 items: parameterize/escape the PostgREST `.or()` search filters in
`api/admin.js` and return generic admin error messages instead of raw `err.message`.

Why:
Defense-in-depth from the 2026-06-20 audit. Admin-only (low impact) but cheap to harden; partial hardening
already exists (commit `c9a3cc3`).

Files likely involved:

- `api/admin.js` (`:143` raw error; `:245`, `:516`, `:521` `.or()` interpolation).
- `docs/security-log.md`.

Do not touch:

- the admin auth gate (`:86-103`) — it's correct; payment/Stripe/Supabase logic beyond these items.

Steps:

1. Escape/encode the search term used in `.or()` (or build the filter safely) so metacharacters can't alter it.
2. Return generic client errors; keep `console.error` server-side.
3. Confirm admin search/sort still works; update F7 status in `docs/security-log.md`.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run
- [ ] No unrelated files changed
- [ ] Role-specific log updated
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] or [DONE]

Review requirements:
Manager + Efficiency if loading affected (it won't be).

Notes:
Lower priority than F1 (the High billing-auth fix). From `docs/security-log.md` 2026-06-20 (F7).

---

## [TODO] Security: Re-audit external requests after the brand changes land

Assigned Role:
Security

Owner:
None

Risk:
Low

Goal:
After Tasks F (fonts), D1 (corporate demo), and T (teardown) land, re-check that they introduced **no** new
external requests, inline-script risks, or unsafe loads — keeping the no-CDN posture intact.

Why:
Task F downloads a commercial font and D1 builds a new demo; both could accidentally pull a CDN or add risky
markup. The Security review of Designer changes is part of the role review flow.

Files likely involved:

- read-only: the changed pages + `/fonts`, the corporate demo, the teardown.
- write: `docs/security-log.md`.

Do not touch:

- production code (audit only; file fixes as findings/tasks).

Steps:

1. Grep the changed files for `http(s)`/`googleapis`/`gstatic`/`jsdelivr`/`cdn`; confirm all assets are local.
2. Spot-check the new demo for unsafe `innerHTML`/inline handlers/forms; confirm no new external scripts.
3. Record results in `docs/security-log.md`.

Completion checklist:

- [ ] Change completed
- [ ] Relevant tests/checks run
- [ ] No unrelated files changed
- [ ] Role-specific log updated
- [ ] docs/logs.md updated
- [ ] Task moved to [REVIEW] or [DONE]

Review requirements:
Manager.

Notes:
**Sequence after Tasks F + D1 + T.** Read-only audit.

---

## Task: Replace Styles Tab Dashboard Preview With Laptop Teardown Animation

- **Status:** REVIEW — audit complete, **no code changes needed** (everything verifiable passed; one
  in-browser WebGL eyeball on a Vercel preview is the only item a non-GUI session can't execute)
- **Owner:** Worker — Opus (verify/audit session, 2026-06-19)
- **Created by:** Manager — 2026-06-18
- **Priority:** Medium

> **Claimed files (this session):** `docs/TASKBOARD.md`, `docs/logs.md` only — **no production code was
> edited** because every verification check passed (nothing failed → nothing to harden). Read-only audit
> of `index.html` (#styles), `Animations/laptop-teardown/**`, `vercel.json`. See the 2026-06-19 Worker
> finish entry in `docs/logs.md` for full results.

> ### ⚠️ Current state — READ THIS FIRST
> **The core implementation already landed in commit `772bed3 "wowowowowah"`.** This is **NOT** a
> greenfield build. Before you change anything, confirm what already exists:
>
> - The animation is already copied into the repo at **`Animations/laptop-teardown/`** (git-tracked,
>   fully vendored, no CDN).
> - The Styles section on the homepage (`index.html`) **already has the replacement card** — card `01`
>   "3D Laptop Teardown" is an `<a href="/Animations/laptop-teardown">` (lines ~288–294). The old
>   dashboard-style preview is no longer in the grid.
> - The animation page (`Animations/laptop-teardown/index.html`) already has: `<base href>`, an import
>   map, vendored Three.js/GSAP/fonts, a `file://` guard, an error-capture fallback, and a root-absolute
>   favicon.
>
> **Your job is to verify, audit, and harden the existing implementation against the checklist below —
> and fix only what fails.** Do **not** re-copy the animation or rebuild the card from scratch; that
> risks regressing working, committed code. If you find nothing broken, complete the verification items
> and sign off the audit.

### Goal
Replace the existing dashboard preview/card in the Styles tab with the uploaded 3D laptop teardown
animation. *(Already done in code — confirm it is correct and production-safe.)*

### Why
The Styles tab should showcase a stronger interactive visual instead of the static dashboard preview.

### Files involved (verified to exist)
- **`index.html`** — the Styles section.
  - Markup: the `#styles` section / `.style-grid`, **lines ~283–325**. Card `01` (the teardown link) is
    **lines ~288–294**. Cards `02`–`05` are unrelated "Preview coming soon" placeholders — **leave them
    alone**.
  - Styles: inline `<style>` rules for `#styles` / `.style-grid` / `.style-card` / `.style-card.feat` /
    `.sc-*`, **roughly lines ~144–282**.
- **`Animations/laptop-teardown/`** — the animation itself:
  `index.html`, `style.css`, `script.js`, `vendor/` (three.module.js, gsap.min.js, ScrollTrigger.min.js,
  `jsm/…`, `fonts.css`, `fonts/*.woff2`), `README.txt`.
- **`vercel.json`** — `cleanUrls:true`, `trailingSlash:false`. This is what serves the clean route
  `/Animations/laptop-teardown` → the folder's `index.html`.
- **`dashboard-style.html`** — the old "Sales Dashboard static mockup". Now appears **orphaned** (nothing
  links to it). It was likely the previous preview. Decide keep-vs-remove (removal optional, out of the
  core task — flag, don't delete on a whim).

### Animation source (original drop)
`C:\Users\WEeld\OneDrive\Documents\Eldridge-Web-Designs\Portfollio1-main\Portfollio1-main\Portfollio1\Animations`
— note the live copy now sits in the project-relative `Animations/laptop-teardown/`. The original
absolute-path drop should **not** appear anywhere in production code (verify).

### Implementation requirements (with current status)
- ✅ Copy the animation into the project using a **relative** project folder, not the absolute Windows
  path. — **DONE**: `Animations/laptop-teardown/`, git-tracked.
- ⚠️ Suggested destination was `public/animations/…` or lowercase `animations/…`. Actual is capital-
  **`Animations/`**. It is internally consistent (link, `<base>`, and folder all use capital `A`), so it
  resolves on case-sensitive hosting — but every other top-level asset folder is lowercase
  (`images/`, `api/`, `css/`, `js/`). **Consider** lowercasing to `animations/` for convention + case
  safety. If you rename, update `index.html` (the `href`) and the animation's `<base href>` together.
- ✅ Preserve the animation's vendor file structure. — **DONE** (`vendor/`, `vendor/jsm/…`,
  `vendor/fonts/…` intact).
- ✅ Do not use external CDNs. — **DONE** (three/gsap/fonts vendored; import map points at `./vendor/`).
- ✅ Do not load the full Three.js animation on the homepage. — **DONE**: `index.html` has no
  `type="module"` / no `three` import; the card is a plain `<a>` link. Heavy code loads only on the route.
- ✅ Keep the Styles tab card lightweight. — **DONE** (pure HTML/CSS card).
- ✅ The animation opens from the Styles tab card. — **DONE** (same-tab navigation to the route).
- ✅ The final site must not contain the absolute Windows path. — **DONE/VERIFIED**: repo-wide grep for
  `C:\Users` / `C:/Users` / `file://` returns matches **only** in `docs/**` and as the intentional
  `file://`-guard *strings* in the animation `index.html`/`README.txt` (plus a three.js source comment).
  No absolute Windows path in any production code path.
- ✅ Dashboard preview replaced; unrelated style cards unchanged. — **DONE** (cards 02–05 untouched).

### Security audit requirements (Manager first-pass findings — worker to confirm & sign off)
| Item | Finding | Action |
|---|---|---|
| Unsafe inline scripts | Present **by project convention** (every page inlines JS); no CSP in `vercel.json`. Not a regression. | Note only |
| Unsafe `innerHTML` | Animation `script.js:580` deliberately avoids it (`textContent=''` "build nodes safely (no innerHTML)"). Homepage uses `innerHTML` only for decorative snow/fish from **static constants** (no user input). | OK |
| External CDN usage | **None** in the animation (vendored). | OK |
| Exposed secrets | **None** in animation files (pure frontend; no keys/tokens/`fetch`). | OK |
| `file://` assumptions | **Handled** — animation `index.html` detects `location.protocol==='file:'` and shows a clear message; README documents http(s)-only. | OK |
| Absolute local paths | **None found** (`C:\…`) in production code. | ✅ Verified repo-wide (grep clean; only `docs/**` + `file://`-guard strings) |
| iframe risk | Card is a same-tab `<a>` link, **not** an iframe; animation not embedded. | N/A |
| `target="_blank"` w/o `rel` | Card does **not** use `target="_blank"`. If you switch it to open a new tab, you **must** add `rel="noopener noreferrer"`. | OK now / flag if changed |
| Path traversal in `serve.mjs` | `serve.mjs` / `start-demo.bat` were **not** copied (removed; README "LOCAL PREVIEW" confirms). | N/A — no risk |
| Deployment | `Animations/` is git-tracked at repo root (not gitignored) → Vercel deploys it. `cleanUrls` serves the route; `<base>` covers trailing-slash variance. | ◑ Confirmed locally (static server: `/Animations/laptop-teardown` 301→200 to folder index; all assets 200). Vercel directory-index behaviour is standard + `<base href>` covers slash variance → expected to work; **final eyeball on a real preview still advised** |
| Unnecessary code on main page | **No** — homepage loads no Three.js; ~1.6 MB payload (three.module.js ≈1.2 MB + fonts + gsap) loads **only** on the animation route. | OK |

> ⚠️ **Out-of-scope observation (do NOT fix under this task):** `index.html` line ~31 still loads
> **Google Fonts via CDN** (`fonts.googleapis.com`), which conflicts with the project's "vendor locally"
> stance. Pre-existing and unrelated to the animation — log it as a separate future task, don't touch it
> here.

### Do not touch
Payment logic · Stripe · Supabase · auth/login · unrelated dashboard logic · unrelated design sections ·
unrelated style cards (02–05).

### Completion checklist
- [x] Animation files copied into the project with relative paths — *commit 772bed3*
- [x] Dashboard preview/card in Styles tab replaced — *index.html card 01*
- [x] New card links to / opens the animation — *`<a href="/Animations/laptop-teardown">`*
- [~] Animation page loads **without console errors** — *every statically-provable load path verified on a
      local static server (route 301→200 + **all** vendored assets 200 with correct MIME: `.js`→
      `text/javascript`, `.woff2`→`font/woff2`); `script.js` passes `node --check` as an ES module; import
      map is valid JSON; `file://`+WebGL+6s-fallback+noscript guards present.* **Remaining:** the actual
      in-browser WebGL render/console can't be executed in a non-GUI session — needs a ~60s eyeball on a
      Vercel preview.
- [x] No absolute Windows paths remain in production code — *repo-wide grep clean (matches only in `docs/**`
      and the intentional `file://`-guard strings)*
- [x] No external CDNs added (animation) — *vendored; grep found only license-header comments inside the
      libs, no live `http(s)` asset requests* — but see Google-Fonts out-of-scope note above
- [x] Security audit completed — *worker confirmed & signed off the table below; see logs finish entry*
- [x] Performance checked — *homepage grep shows no three/gsap/module/importmap (only a CSS comment); card
      is a plain `<a>`; ~1.6 MB payload loads only on the route*
- [x] Mobile layout checked *(by CSS inspection, not visually rendered)* — *homepage `.style-grid` 3→2
      (≤900px)→1 (≤680px); animation hides `.side-index` ≤820px, repositions caption ≤600px; `isMobile`
      cuts keycap count + disables shadows/parallax; both pages honor `prefers-reduced-motion`*
- [x] docs/logs.md updated — *worker finish entry appended 2026-06-19*

### Suggested next task (after this)
Vendor the homepage Google Fonts locally to match the project's no-CDN policy (separate task — see
out-of-scope note).

---

## Task: Remove AI Aspects From Laptop Teardown Feature

- **Status:** [REVIEW] — copy/comment cleanup complete 2026-06-19; no behaviour changes, no vendor edits. See `docs/logs.md` FINISH entry.
- **Owner:** Worker · Opus (AI-feel cleanup) · 2026-06-19
- **Created by:** Manager — 2026-06-19
- **Risk:** Medium
- **Files claimed:** `index.html` (card 01 only, ~288–294) · `Animations/laptop-teardown/`{`index.html`,
  `style.css`, `script.js`, `README.txt`} · `docs/`{`taskboard.md`, `logs.md`}.
  **Not** touching `vendor/*`, cards 02–06, payment/Stripe/Supabase/auth.

### Goal
Remove the AI-generated feel from the laptop teardown feature while keeping the animation working.

### Why
The feature should feel intentional, human, and portfolio-ready instead of generic, overhyped, or
obviously AI-written.

### Tone direction
It should read like a real portfolio piece from a small web design business: simple, direct, confident.
- **Good:** "Interactive Laptop Teardown" · "A scroll-based 3D build study." · "Explore the layers of a
  device-style interface as it separates on scroll." · "View Demo"
- **Bad:** "Premium futuristic immersive experience" · "Revolutionary AI-powered visual journey" ·
  "Next-generation digital masterpiece" · "Seamless cutting-edge innovation"

### Files likely involved (verified during inspection)
- **`index.html`** — **only** the teardown card, lines **~288–294** (`sc-kicker` / `sc-title` /
  `sc-desc` / `sc-foot`). Nothing else on this page.
- **`Animations/laptop-teardown/index.html`** — user-facing copy: `<title>`, intro `.eyebrow` / `h1` /
  `.lede`, `#stage-title`, `.scroll-hint`, outro `h2` / `.lede`, the `.btn`, plus loader/error strings.
- **`Animations/laptop-teardown/style.css`** — comment headers + a few effects (the gradient `.btn`,
  glow/box-shadows, big text-shadows).
- **`Animations/laptop-teardown/script.js`** — **header comment only** (line 2). The rest of the comments
  are useful — keep them.
- *(Optional, low priority)* `Animations/laptop-teardown/README.txt` — dev note, not user-facing; only
  touch if it carries hype wording.

### Manager findings — concrete items to address (grounded in inspection)
| Location | Current text / effect | Why it feels AI / off | Direction |
|---|---|---|---|
| `index.html` ~292 (card desc) | "A scroll-driven teardown that lifts a laptop apart layer by layer — screen, board, battery, silicon. **Engineering shown as motion.**" | Over-explained list + slogan tagline | Tighten to one plain line (e.g. a "scroll-based 3D build study"). Title "3D Laptop Teardown" is fine — keep. |
| `index.html` ~293 (card foot) | "View **live** demo" | "live" is mild hype | "View Demo" |
| anim `index.html` `<title>` / `h1` | "Anatomy of a **Build**" / "Anatomy of a build" | Editorial / dramatic | Plainer, e.g. "Interactive Laptop Teardown" |
| anim `.eyebrow` | "WebSharke · **Engineering**" | Inflated dept label for a small studio | Tone down (e.g. "WebSharke" or "Interactive · 3D") |
| anim `.lede` (intro) | "Every site we ship is **engineered in layers — front to back, screen to silicon.** Scroll to take one apart." | Alliterative marketing flourish | Simple, human one-liner |
| anim outro `h2` | "**Built like hardware. Shipped like software.**" | Punchy ad/parallel tagline | Simplify or drop |
| anim outro `.lede` | "The same care, layer by layer, goes into the websites we build for you." | Earnest sales fluff (borders on a fake claim) | Make it plain/honest or remove |
| `style.css` line 2 **and** `script.js` line 2 | "**PREMIUM** LAPTOP TEARDOWN" (comment headers) | Hype word in code comments | "Laptop Teardown — …" |
| `style.css` ~30 / ~42 (comments) | "**Elegant**, simple background" / "**Whisper-faint** vignette" | Cutesy, AI-ish comment voice | Plain wording ("subtle vignette") — optional polish |
| `style.css` `.btn` ~283–288 + text-shadows ~124/184 | Gradient button + coloured glow `box-shadow`, large soft `text-shadow`s | Generic "premium gradient + glow" look | Compare against the **main WebSharke** button/CTA + theme; tone down/replace effects that clash. **Keep** shadows that are doing legibility work over the 3D scene. |

**Keep as-is (already clean, human):** loader "Preparing teardown"; error "Couldn't start the 3D
experience." / "Please refresh to try again."; caption "01 / Assembled"; hint "Scroll to disassemble";
CTA button "Start a Project"; the `<meta name="description">`; the `<noscript>` line.

### ⚠️ Traps — DO NOT over-correct (false positives found during inspection)
A blind find-and-replace on "premium / placeholder / generated" **will break things**. Specifically:
- **`index.html` lines ~304–305 "Premium Dark" / "Dark · Premium"** = the unrelated **style card 03**.
  **Leave it.** It is not part of this feature.
- **`script.js` "PLACEHOLDER GEOMETRY"** (lines ~5, ~141, ~641) = a real **technical** term — the laptop
  is built from procedural meshes that stand in for a future GLTF/GLB model. **Keep the meaning** (it
  prevents future bugs in the "swap in a real model" path); it is *not* marketing placeholder text.
- **`index.html` line ~351 "MARINE SNOW (generated once …)"** = a technical comment, unrelated to AI and
  unrelated to this feature. **Leave it.**
- **The `file://` / http(s) message** (the `FILE_MSG` block) and the **"Animation library failed to load
  (vendor/gsap.min.js)"** string = useful runtime/server notes that prevent support headaches. **Keep.**
- **The `CONFIG` block + "SWAPPING IN A REAL MODEL" notes** in `script.js` = genuinely useful. **Keep.**

### Do not touch
- **Vendor files:** `vendor/gsap.min.js`, `vendor/ScrollTrigger.min.js`, `vendor/three.module.js`,
  `vendor/jsm/environments/RoomEnvironment.js`, `vendor/jsm/geometries/RoundedBoxGeometry.js`.
- Payment logic · Stripe · Supabase · auth/login · unrelated dashboard logic.
- **Unrelated style cards:** the teardown card (01) is in scope; cards **02–05 are not**.
- Unrelated site sections.

### Steps
1. Inspect the laptop teardown card and animation page.
2. Identify copy, styling, labels, comments, or effects that feel AI-generated.
3. Rewrite user-facing copy to sound simple, direct, and human.
4. Reduce or remove unnecessary hype language.
5. Clean related styling only where it affects the laptop teardown feature.
6. Clean custom comments only if they are bloated or obvious.
7. Search for AI-ish terms like AI, generated, premium, revolutionary, cutting-edge, seamless, immersive,
   next-generation, masterpiece, placeholder, and lorem.
8. Only change matches that belong to this feature (see **Traps** above before editing any match).
9. Test the Styles tab, animation link/page, scroll animation, console, and mobile layout.
10. Update `docs/logs.md` and move the task to **[REVIEW]**.

### Completion checklist
- [x] Styles tab card copy feels natural and specific
- [x] Animation page copy feels natural and specific
- [x] No fake client claims remain
- [x] No obvious AI/template wording remains in this feature — *hype-term sweep clean*
- [x] No unrelated style cards changed — *cards 02–06 untouched*
- [x] No vendor files changed — *git confirms zero vendor edits*
- [x] Animation still loads — *ESM syntax OK · all JS DOM hooks present · HTML parses; load path also confirmed by the prior verify pass*
- [~] Scroll animation still works — *GSAP/scroll JS unchanged by this task (comment-only edits); live scroll not eyeballed in a non-GUI session*
- [~] Browser console has no new errors — *ESM syntax valid + no logic change; live console not eyeballed*
- [~] Mobile layout checked — *responsive CSS untouched; only `.btn` shadow alpha changed — not viewed live*
- [x] docs/logs.md updated — *START + FINISH entries*
- [x] Task moved to [REVIEW]

---

> **Manager note (2026-06-19):** a request came in to hold "Remove AI Aspects…" as
> `[BLOCKED — waiting on audit]`. By then a Worker had **already completed it → [REVIEW]**, and the audit
> task is **also [REVIEW]** (no code changes). "Waiting on audit" is satisfied, so the task was **left in
> [REVIEW]** rather than reverted to BLOCKED (reverting would undo finished work). Bounce it only if the
> review wants rework. Both original tasks now await final sign-off — see tasks **A** and **B** below.

---

## Task A: Live-verify the Laptop Teardown on a real preview

- **Status:** [TODO]
- **Owner:** _unassigned_ — **needs a session with a real browser / GUI**
- **Created by:** Manager — 2026-06-19
- **Risk:** Low · **Priority:** High (the one open item gating both REVIEW tasks)

### Goal
Run the in-browser eyeball no non-GUI session could do: confirm the teardown actually renders and behaves.

### Why
Both finished tasks left exactly one item open (`[~]`): the live WebGL render + scroll. Everything that
*gates* the load is already verified in code — this closes the loop.

### Steps
1. Deploy a Vercel preview (or `vercel dev`) and open `/Animations/laptop-teardown`.
2. Confirm: 3D scene renders (no loader error state); scroll drives the teardown; side-index + caption
   (`01 / Assembled` …) + progress bar update; page starts at top on reload.
3. DevTools Console + Network: **no errors/warnings**; each `vendor/*.js` + `*.woff2` is 200 with correct
   MIME (JS as `text/javascript`).
4. Mobile (≤600px / emulation): layout clean, `.side-index` hidden, caption repositioned, touch-scroll
   drives the animation; verify `prefers-reduced-motion`.
5. Homepage `/`: card 01 navigates correctly; Network shows **no** `three.module.js` on the homepage.
6. Log results. If all pass → flag both REVIEW tasks ready to close (task B). If something fails → open a
   new bug task; **don't fix inline here.**

### Do not touch
Verification only — no code edits (flag any obvious in-scope fix to the Manager first).

### Completion checklist
- [ ] Scene renders on a real preview
- [ ] Scroll-driven teardown works end to end
- [ ] Console clean; all assets 200 w/ correct MIME
- [ ] Mobile layout + touch scroll OK; reduced-motion respected
- [ ] Homepage loads no Three.js; card link works
- [ ] Results logged

---

## Task B: Review & close out the two laptop-teardown [REVIEW] tasks

- **Status:** [TODO]
- **Owner:** _unassigned_
- **Created by:** Manager — 2026-06-19
- **Risk:** Low · **Priority:** High

### Goal
Independently review the verify/audit + AI-cleanup changes, then move both from [REVIEW] to [DONE]
(or bounce with specific notes).

### Steps
1. Read the AI-cleanup git diff (6 files: copy + comments + 2 `.btn` shadow values). Confirm only
   in-scope files; cards 02–06 untouched; **no** `vendor/*` edits; Traps respected (`PLACEHOLDER GEOMETRY`,
   `CONFIG`/SWAP notes, `file://` guard, card 03 "Premium Dark" all intact).
2. Read the rewritten copy against the tone examples. Decide the flagged line — outro headline
   "Like the way this is built?" — keep or fine-tune.
3. Confirm Task A passed.
4. Optional: run `/code-review` on the branch.
5. Move both tasks to [DONE] in `docs/taskboard.md` + log the sign-off; if something's off, set
   [TODO]/[BLOCKED] with specifics.

### Do not touch
Docs only (status + sign-off) unless the review surfaces a clearly-safe, in-scope fix.

### Completion checklist
- [ ] AI-cleanup diff reviewed (scope + Traps respected)
- [ ] Copy/tone accepted (or fine-tune noted)
- [ ] Task A confirmed passing
- [ ] Both tasks → [DONE] (or bounced with notes)
- [ ] docs/logs.md updated

---

## Task C: Vendor the homepage Google Fonts locally

- **Status:** [REVIEW] — Worker · Opus · 2026-06-19 (homepage done; 1 GUI-only eyeball left for the reviewer)
- **Owner:** Worker — Opus (2026-06-19)
- **Created by:** Manager — 2026-06-19
- **Risk:** Medium · **Priority:** Medium
- **Files claimed (this session):** `index.html` (head `<link>`s + inline `<style>`), new `fonts/` folder
  (copies only), `docs/`{`taskboard.md`, `logs.md`, `CHANGELOG.md`}. **Not** touching the animation's
  vendored fonts (read-only source), other pages, payment/Stripe/Supabase/auth, cards 02–06.

### Goal
Replace the Google Fonts CDN `<link>` in `index.html` (~line 31) with locally-vendored `@font-face`
fonts, matching the project's vendor-locally policy.

### Why
The homepage still loads Cormorant Garamond + Mulish from `fonts.googleapis.com` — inconsistent with the
rest of the site, and the user's environment blocks CDNs (see `[[cdn-blocked-vendor-locally]]`). The
animation already vendors these exact families, so most woff2 files can be reused.

### Files
- `index.html` — the `<link …fonts.googleapis.com…>` (~line 31) + any `preconnect`; add `@font-face`
  (inline `<style>`, per convention).
- **Reuse** `Animations/laptop-teardown/vendor/fonts/`: `cormorantgaramond-{400,500,500i,600}.woff2`,
  `mulish-{300,400,500,600,700}.woff2`. Copy what the homepage needs into a new top-level `fonts/`.

### Steps
1. List the exact families/weights/styles `index.html` uses (the CDN URL names them).
2. Copy the matching woff2 into `fonts/`; download **only** any weight the vendored set lacks (e.g.
   Cormorant 700, if the homepage uses it).
3. Add `@font-face` rules with `font-display: swap`, pointing at `fonts/…`.
4. Remove the Google Fonts `<link>` (+ preconnect).
5. Verify type renders unchanged; Network shows **no** `googleapis`/`gstatic` request.

### Do not touch
The animation's vendored fonts (copy/read only) · payment/Stripe/Supabase/auth · unrelated sections.
⚠️ Both this and the optional `animations/` rename edit `index.html` — **don't run them concurrently.**

### Completion checklist
- [x] All homepage font weights/styles vendored in `fonts/` — *5 used faces (CG 600 + 500i; Mulish
      400/500/600); the unused CDN-requested weights are intentionally omitted (they never render)*
- [x] `@font-face` added; Google Fonts `<link>`/preconnect removed — *inline `<style>`, `font-display:swap`*
- [x] No `googleapis`/`gstatic` request in Network — *`index.html` grep clean; no CDN URL remains so the
      request can't be made (static proof; live Network panel not run in a non-GUI session)*
- [~] Type renders unchanged — *same latin woff2 the CDN served; family/weight/style match the CSS exactly
      → expected identical. Not visually eyeballed (non-GUI) — ~30 s preview check advised*
- [x] docs/logs.md updated; task → [REVIEW] — *START + FINISH entries; CHANGELOG.md created*

---

## Task D: Resolve the orphaned `dashboard-style.html`

- **Status:** [DONE] — removal **confirmed by the user 2026-06-19**; file was already staged-deleted, verified
  truly orphaned, recoverable from HEAD. See `docs/logs.md` FINISH entry.
- **Owner:** Worker — Opus (2026-06-19)
- **Created by:** Manager — 2026-06-19
- **Risk:** Low · **Priority:** Low

### Goal
Decide and act on `dashboard-style.html` (the old "Sales Dashboard" static mockup) — the verify worker
confirmed it's orphaned (referenced only in `docs/**`) since the teardown card replaced it.

### Steps
1. Repo-wide grep to re-confirm **zero** inbound links/redirects outside `docs/**`.
2. Recommend remove (it's the unused old preview) **or** keep it as a standalone demo (then link/note it).
3. ⚠️ It's committed work — confirm keep-vs-remove with the Manager/user **before deleting**.

### Do not touch
`dashboard.html` (the real, live dashboard) · payment/auth/etc.

### Completion checklist
- [x] Confirmed unreferenced (grep) — *every `dashboard-style` match is in `docs/**`; zero inbound links, JS redirects, or `vercel.json` rewrites in any production file*
- [x] Keep-or-remove decided with Manager and actioned — *user confirmed **remove** 2026-06-19; `git status` shows `D dashboard-style.html` (staged deletion); recoverable from HEAD*
- [x] docs/logs.md updated — *FINISH entry appended*

---

## Task E: Vendor Google Fonts on the remaining pages (finish site-wide no-CDN)

- **Status:** [TODO]
- **Owner:** _unassigned_
- **Created by:** Worker — Opus (2026-06-19, discovered while doing Task C)
- **Risk:** Medium · **Priority:** Medium

### Goal
Finish the no-CDN font policy site-wide: replace the Google Fonts CDN `<link>` on the **7 pages other than
the homepage** with local `@font-face`, reusing the `/fonts` folder created in Task C.

### Why
Task C vendored the homepage only. These pages still load `fonts.googleapis.com` / `fonts.gstatic.com`
(grep-confirmed 2026-06-19): `dashboard.html`, `login.html`, `payment.html`, `onboarding.html`,
`success.html`, `cancel.html`, `dashboard-style.html`. Same CDN-blocked-environment problem as the
homepage (`[[cdn-blocked-vendor-locally]]`).

### Files
- The 7 pages above — **only** the `<head>` font `<link>`/`preconnect` + an inline `<style>` `@font-face`
  block (per the page-inline convention).
- Reuse top-level `/fonts/` (from Task C); **add** any extra woff2 a page needs (see step 2).

### Steps
1. **Per page**, audit the faces actually used (every `font-family`/`font-weight`/`font-style` + a
   `<strong>`/`<b>`/`bold`/heading sweep). Don't trust the CDN URL — it over-requests (Task C proved the
   homepage used **5 of the 12** requested faces).
2. For each used face: if it's already in `/fonts`, point `@font-face` at it; if not — likely candidates
   are **Mulish-700** (bold), **Cormorant Garamond italic 400/600**, **CG-700**, none of which are in
   `/fonts` yet *and* which the animation's vendored set also lacks — obtain that woff2 (Google Fonts latin
   subset) and add it to `/fonts`.
3. Replace each page's CDN `<link>` + `preconnect`s with the inline `@font-face` block.
4. Verify per page: grep clean of `googleapis`/`gstatic`; every woff2 valid (`wOF2` magic); type renders
   unchanged.

### Do not touch
Payment/Stripe/Supabase/auth **logic** — `payment.html`, `dashboard.html`, `onboarding.html`, `login.html`
carry live logic; edit **only** the `<head>` font tags + the `@font-face` `<style>`, nothing else. Resolve
**Task D** (`dashboard-style.html`) first — if it's removed there, it drops off this list.

### Completion checklist
- [ ] Each page's used faces vendored in `/fonts` (extra weights downloaded as needed)
- [ ] CDN `<link>`/`preconnect` removed from all in-scope pages; `@font-face` added
- [ ] No `googleapis`/`gstatic` left in any page HTML (repo grep)
- [ ] Type renders unchanged on each page
- [ ] docs/logs.md updated; task → [REVIEW]

---

## Task: Redesign Laptop Teardown 3D Model

- **Status:** [REVIEW] — Worker · Opus · 2026-06-19. Model redesigned (thin / unbranded / de-clipped);
  ESM + local-load checks pass. The one GUI-only item — the in-browser WebGL/scroll render — should be
  re-run as **Task A** against this new model.
- **Owner:** Worker · Opus (3D model redesign) · 2026-06-19
- **Created by:** Worker (self, from a Manager request) — 2026-06-19
- **Risk:** Medium · **Priority:** Medium
- **Files claimed:** `Animations/laptop-teardown/script.js` (the procedural model only — builders,
  `ASSEMBLED{}` layout, `CONFIG` materials/spacing) · `Animations/laptop-teardown/style.css` (only if
  visual framing/background needs a small adjustment) · `docs/taskboard.md`, `docs/logs.md`.
  **Not** touching: `vendor/*` (three/gsap/ScrollTrigger/jsm), payment/Stripe/Supabase/auth, the
  homepage style cards, or unrelated sections.

### Goal
Redesign the procedural laptop so the assembled form reads as a thin, premium, **unbranded** ultrabook
(MacBook-Air-style silhouette — without any Apple logo/trademark). Internals should look thin, layered
and intentional; no part may clip/phase through another in the assembled OR exploded state. Refine
materials toward restrained anodised aluminium. Keep performance and the existing scroll/teardown
framework intact.

### In scope (script.js geometry only)
- Remove the lid "logo" disc (`buildBackCover`) → unbranded.
- Thin every part + the overall base; refine proportions (low-profile keys, large inset trackpad, slim
  speakers, thin battery cells, compact logic board, subtle cooling).
- Recompute the `ASSEMBLED{}` transforms so the base is slim and nothing intersects (clear internal
  cavity between bottom-shell floor and keyboard-deck underside).
- Retune exploded `layer`/`spacing` so thin layers stay separated and readable.
- Refine `CONFIG.col` / `buildMaterials()` toward premium aluminium / dark glass / muted board.
- Keep all 13 part **names** in `ASSEMBLED{}` unchanged (the scroll timeline references them by name).

### Do not touch
`vendor/*` · payment/Stripe/Supabase/auth · the homepage style cards · unrelated sections. No new
libraries, no external model downloads, no large assets.

### Completion checklist
- [~] Assembled laptop reads as a thin, premium, unbranded ultrabook — *base ratio cut from ~0.125 to
      ~0.078; geometry math done, final **visual** eyeball is the GUI-only Task A item*
- [x] No Apple logo / trademark / branding anywhere — *lid logo disc removed; grep finds no
      `CircleGeometry`/`logo` geometry (only "no logo" comments)*
- [x] No clipping/phasing in the assembled state — *internals re-thinned + zoned into one cavity 0.03–0.17,
      all top-out below the 0.17 deck underside; lid lifted to hinge from the deck back*
- [x] No clipping/phasing across the scroll/exploded animation — *traced every adjacent exploded layer:
      min gap ≈0.14 (keys↔deck), rest 0.2–0.6; parts recenter + lie flat*
- [x] Exploded spacing clean + readable; thin layers don't merge — *thinner parts → more air at the same
      0.52 spacing*
- [x] Materials refined (aluminium / dark glass / muted board / brushed metal) — *space-grey shell, dark
      bezel, near-black glass, muted teal board; no neon/glow*
- [x] Geometry complexity kept reasonable (no perf regression) — *kept InstancedMesh for keys/screws/blades,
      lowered some segment counts; net +~8 small tray boxes; no libs/textures/downloads*
- [x] `script.js` passes `node --check`; all DOM hooks + 13 part names intact — *13 `explode()` calls map
      1:1 to `ASSEMBLED{}`*
- [x] No vendor files changed — *only `script.js` + docs*
- [x] docs/logs.md updated; task → [REVIEW]

### Note for reviewers
This **changes the 3D model** that the two `[REVIEW]` laptop-teardown tasks and Task A examined. The
in-browser WebGL/scroll eyeball (Task A) should be re-run against the new model.

---

### Backlog (optional, low priority)
- **Lowercase `Animations/` → `animations/`** for folder-naming consistency + case-safety on
  case-sensitive hosts. Works today (internally consistent); both workers deliberately left it
  ("fix only what fails"). If done: `git mv`, update the card `href` **and** the animation `<base href>`
  **together**, grep for stray `Animations` refs, verify on a preview. Sequence with Task C (both edit
  `index.html`).

### Coordination (avoid the collision we already hit once)
A=read-only/ops · B=docs-only · C **edits `index.html`** · D **edits only `dashboard-style.html`** ·
backlog rename **edits `index.html`**. → Don't run **C** and the **rename** at the same time. Claim files
in a START log entry before editing.
