# Reviewer Log

> **Status: ACTIVE** — the Reviewer role was re-activated 2026-06-22. This log is in use. (It was briefly
> marked deprecated in the 2026-06-19 role migration; that is superseded.)

This file stores user-experience feedback from Reviewer sessions.

The Reviewer writes findings here.

The Manager manages the status of each finding and decides what becomes a task.

> **Reviewer:** copy the **Finding format** template below, give it the next sequential ID
> (`REVIEW-0001`, `REVIEW-0002`, …), set the status to `[NEW]`, and add it under **Findings**.
> Do not edit website code — report the experience, don't fix it.
>
> **Manager:** you own the status of every finding. Triage `[NEW]` entries, set the **Manager Status**,
> add **Manager Notes**, and when a finding is accepted, create a task in `docs/taskboard.md` and record
> its title under **Converted Task** (status → `[CONVERTED]`).
>
> **Canonical status = the finding's heading** (`## REVIEW-0001 - [STATUS] Title`). The Reviewer sets it to
> `[NEW]` once and does not change it again; the Manager owns every later status change there. The
> `Manager Status:` field is a mirror / notes line — keep it in step with the heading so they never drift.

---

## Statuses

- **[NEW]** freshly reported by Reviewer
- **[TRIAGED]** reviewed by Manager
- **[ACCEPTED]** should become a task
- **[CONVERTED]** turned into a task in docs/taskboard.md
- **[DUPLICATE]** same issue already exists
- **[REJECTED]** not worth changing
- **[NEEDS RECHECK]** needs another review pass
- **[RESOLVED]** fixed and confirmed

## Severity

- Low
- Medium
- High
- Critical

---

## Finding format

Use this format for every reviewer finding. Copy the block, increment the ID, and fill every field:

```
## REVIEW-0001 - [NEW] Issue Title

Date:
YYYY-MM-DD HH:MM

Reviewer Session:
Name or short ID

Page / Feature:
Where the issue happened

Device / Viewport:
Desktop / tablet / mobile, browser if known

Severity:
Low / Medium / High / Critical

User Experience:
Explain what it felt like as a normal visitor.

Issue:
Describe the exact problem.

Why It Matters:
Explain why this could hurt trust, clarity, usability, or polish.

Steps To Reproduce:

1. Step one
2. Step two
3. Step three

Expected:
What a normal user would expect to happen.

Actual:
What happened instead.

Suggested Fix:
Practical recommendation. Keep it specific.

Manager Status:
[NEW]

Manager Notes:
Empty until Manager reviews it.

Converted Task:
Empty until Manager creates a task.
```

---

## Findings

## 2026-06-22 18:30 — Reviewer — invoice-source-review

> ## ⚠️ READ THIS FIRST — what this review is, and what it is NOT
>
> The task was to **manually test the invoice system end-to-end like a real admin and a real client**.
> **I could not run a live test.** No browser/extension is connected, there is no preview deploy, and there
> is no `vercel dev` / live Supabase available to this session. Per `CLAUDE.md` ("the Reviewer needs a real
> browser against a deployed / preview build … if that is unavailable, say so and defer rather than reporting
> a 'live' test it could not run"), **I did not click through anything and I am not reporting any observed
> live behavior.**
>
> What this IS: a **source-level pre-review** — I read the actual invoice code (`api/admin/invoices.js`,
> `db/invoices-schema.sql`, the admin builder + client billing in `dashboard.html`, and the `payment.html`
> client invoices page) and ran a 6-dimension adversarial source pass (37 agents) that verified each finding
> against the code. **Every "PASS" below means "correct in the source," NOT "seen working."** Every item
> that needs a running system to settle is tagged **[NEEDS LIVE]**.
>
> A full live pass (admin builder + client billing on desktop AND a real phone, the cross-account RLS read
> test, and the console) is **still required** before this can truly be signed off — see the Go/No-Go.

### 1. Summary

- **Does the invoice system basically work?** **On paper, yes — it is a genuinely well-built, well-hardened
  feature.** The server is the sole money authority (subtotal/total recomputed server-side, per-line total is
  a Postgres GENERATED column, client totals never trusted); the admin route is correctly auth+admin gated
  (401/403 before any work); the client view is true read-only (no inputs, no write policy/route, all text via
  `textContent` so admin-entered text can't inject); drafts are hidden in the UI; and the Pay button is an
  inert, correctly-scoped placeholder. Security (0 exploits, 2026-06-22) and Efficiency (2026-06-22) reached
  the same conclusion in their own passes. I found **no blocking defect in the code.**
- **Is it ready for Stripe Checkout? — Not yet, on this pass. NO-GO (conditional).** Not because the build is
  broken, but because (a) the mandatory **live end-to-end test was not run** (no browser this session), and
  (b) the single highest-impact property — **cross-tenant data isolation via Supabase RLS** — is *unverifiable
  from the repo* and must be confirmed live before money flows (Security's standing **IV-GATE**). Flip to GO
  once the live test passes: RLS isolation confirmed, the admin/client flows verified in a browser, and the
  one medium mobile issue (REVIEW-0001) looked at. See §8.

### 2. Checklist coverage — per-item verdict (source basis)

> Legend: **PASS (src)** = correct in the code · **[NEEDS LIVE]** = needs a running system to confirm ·
> **BUG** = defect found (see the REVIEW-#### finding).

**Admin (invoice builder — `dashboard.html#view-invoices` → `POST /api/admin/invoices`)**

| # | Check | Verdict | Notes |
|---|---|---|---|
| 1 | Create a draft invoice | [NEEDS LIVE] | "Save as draft" → `runInvoiceSubmit('draft')` path present + validated |
| 2 | Create an issued invoice | [NEEDS LIVE] | "Issue" → confirm dialog → POST `status:issued`; path present |
| 3 | Add one line item | [NEEDS LIVE] | one row by default; supported |
| 4 | Add multiple line items | [NEEDS LIVE] | "+ Add line item"; supported |
| 5 | Quantity > 1 | [NEEDS LIVE] + **BUG** | multiplies correctly; **fractional qty mismatch → REVIEW-0003** |
| 6 | Notes + due date | [NEEDS LIVE] | optional fields handled (due_date is timezone-safe) |
| 7 | Subtotal & total calculate correctly | **PASS (src)** | server-authoritative; live estimate matches; Subtotal==Total today (REVIEW-0010) |
| 8 | Submit an empty invoice | **PASS (src)** | blocked with specific inline errors; a row can never reach zero |
| 9 | Missing client | **PASS (src)** | `invFail("Select a client for this invoice.")`, focuses field |
| 10 | Empty item name | **PASS (src)** | `invFail("Line N: enter an item name.")`, focuses field |
| 11 | Negative price | **PASS (src)** | rejected at 3 layers (input regex, server `isCents`, DB CHECK) |
| 12 | Errors clear & useful | **PASS (src)** *(mostly)* | inline + toast + focus; **except** REVIEW-0003 / 0005 / 0006 |

**Client (billing view — `dashboard.html#cinv-block` and `payment.html#invoices-page`)**

| # | Check | Verdict | Notes |
|---|---|---|---|
| 1 | Log in as the client | [NEEDS LIVE] | session-gated; redirects to /login otherwise |
| 2 | Open client billing page | [NEEDS LIVE] | dashboard Billing tab + standalone `/payment` |
| 3 | Issued invoice appears | [NEEDS LIVE] | query filters to client-visible statuses; depends on RLS (IV-GATE) |
| 4 | Title/status/due/notes/items/total correct | **PASS (src)** + **BUG** | rendering correct; **"Created" date tz shift → REVIEW-0004** |
| 5 | Drafts hidden | **PASS (src)** *(UI)* | hidden in UI; **but readable via direct anon query → REVIEW-0009** |
| 6 | Client cannot edit | **PASS (src)** | no inputs; no client write policy/route |
| 7 | Client cannot delete | **PASS (src)** | no delete control; no delete policy |
| 8 | Client cannot change prices/totals | **PASS (src)** | read-only; server-authoritative; generated line total |
| 9 | Pay button is an inert placeholder | **PASS (src)** | `disabled`, `aria-disabled`, only issued/overdue, "coming soon" |

**Access / security behavior**

| # | Check | Verdict | Notes |
|---|---|---|---|
| 1 | View another client's invoice | [NEEDS LIVE] | **GATING** — rests on RLS → REVIEW-0013 (IV-GATE) |
| 2 | Change invoice IDs in URL / request | **PASS (src)** | no per-invoice id route/param client-side; admin route needs admin token |
| 3 | System blocks access to others' invoices | [NEEDS LIVE] | **GATING** — RLS → REVIEW-0013 |
| 4 | Normal clients can't reach admin create routes | **PASS (src)** | server route 401/403 is the real control; client gate is UX-only |

**Mobile / responsive**

| # | Check | Verdict | Notes |
|---|---|---|---|
| 1 | Admin invoice builder, small screen | **BUG** + [NEEDS LIVE] | **label loss → REVIEW-0001 (Medium)**; ambiguous amount/cramped → REVIEW-0007 |
| 2 | Client billing page, small screen | **PASS (src)** + [NEEDS LIVE] | clean stacked-card collapse with labels preserved |
| 3 | Report layout issues | done | REVIEW-0001, REVIEW-0007 |

### 3. What worked (verified correct in source — do not regress)

- **Money is server-authoritative & tamper-proof.** `parseInvoiceBody` recomputes `subtotal = Σ(qty×unit)` and
  `total = subtotal − discount + tax`; client-supplied totals are ignored; per-line total is a STORED
  GENERATED column so a line amount can never drift (`api/admin/invoices.js:201-237`, `invoices-schema.sql:68`).
- **Admin write route is correctly gated:** missing/invalid token → 401, valid non-admin → 403, *before* any
  DB work or the (leaky) 500 path — so raw error text is only ever returned to the admin (`invoices.js:263-280`).
- **Client view is genuinely read-only & XSS-safe:** every dynamic value rendered via `textContent`/`cinvEl()`;
  no inputs anywhere on the card; no client INSERT/UPDATE/DELETE policy or write route.
- **Validation is thorough and field-focused:** empty/missing client/empty name/negative price each produce a
  specific inline error that highlights, focuses, and scrolls to the offending field, mirrored to a toast.
- **Robust against double-submit:** the busy lock spans validate → confirm → POST, so a second click (or
  tabbing to the other button while the Issue modal is open) can't create a duplicate invoice.
- **Drafts hidden in the rendered UI; Pay button correctly inert** and only on issued/overdue invoices.
- **No N+1** on the client read; explicit column lists; defensive money/date formatting (`cinvMoney` guards
  NaN; `cinvDate` avoids the UTC day-shift for `due_date`). The `payment.html` page is a faithful read-only port.

### 4. Bugs found

See the individual **REVIEW-####** findings under **## Findings** below. Headline list (corrected severity):

- **REVIEW-0001 — Medium (mobile):** Admin builder line-item Qty/Unit-price/Amount lose their visible labels at ≤560px.
- **REVIEW-0002 — Medium (data-integrity, already logged):** rare double-DB-failure can leave a client-visible *issued* invoice with a Total but **no line items**.
- **REVIEW-0003 — Low (admin UX):** fractional quantity shows a valid-looking estimate, then Save rejects it.
- **REVIEW-0004 — Low (client display, NEW):** "Created" date can show the previous calendar day in US timezones.
- **REVIEW-0005 — Low (admin UX):** over-cap quantity/price fails late as a generic toast, not an inline field error.
- **REVIEW-0006 — Low (admin UX):** if the client list fails to load, Save shows a misleading "Select a client" error on an empty disabled dropdown.
- **REVIEW-0007 — Low (mobile):** admin per-line read-only Amount can look editable; price field is cramped at ~360px.
- **REVIEW-0008 — Low (robustness/access):** admin identity is defined in two places (route env vs SQL `is_admin()` literal) and can drift.

### 5. Confusing UX

- **REVIEW-0003** (fractional qty: estimate vs Save disagree) and **REVIEW-0005** (over-cap late/generic error)
  and **REVIEW-0006** (misleading "Select a client" on list-load failure) — all above.
- **REVIEW-0010 — Info:** the builder has no discount/tax input, so the Summary always shows **Subtotal == Total**
  (two identical lines, no discount/tax row). Consistent and correct, but reads as redundant. (Intentional phase-1.)
- **REVIEW-0012 — Info:** cancelling the "Issue invoice" confirmation gives no acknowledgement — the button
  flickers "Issuing…"→back and nothing else happens (data is safely preserved).

### 6. Mobile issues

- **REVIEW-0001 — Medium:** admin invoice builder, ≤560px — the column header is `display:none` and the per-row
  Qty/Unit-price/Amount fields carry only `aria-label`s (no visible labels), unlike the client table which keeps
  labels via `data-label`. A sighted admin on a phone sees three unlabeled numeric fields stacked under the item
  name. **[NEEDS LIVE]** to confirm exact rendering.
- **REVIEW-0007 — Low:** related — the read-only per-line Amount sits next to the inputs with no caption (can read
  as a 4th editable field), and the price input is tight at ~360px. **[NEEDS LIVE]**.
- **Client billing page** collapses cleanly to labeled stacked cards at ≤560px (PASS in source) — still wants a
  real-device eyeball **[NEEDS LIVE]**.
- **a11y note REVIEW-0011 — Info:** the dashboard billing loading/empty states aren't wrapped in a status
  live-region (the `/payment` port is), so a screen reader may not announce "no invoices" on the dashboard tab.

### 7. Access / security behavior (Reviewer view — Security owns the formal sign-off)

- **REVIEW-0013 — GATING / High impact [NEEDS LIVE]:** cross-tenant isolation depends **entirely** on Supabase
  RLS, which is invisible from the repo. The client query's `.eq("client_user_id", user.id)` is removable from
  the browser console, so RLS is the real control. **This is the #1 thing blocking GO** and is already tracked as
  Security's **IV-GATE** (`invoice-gate-rls-must-be-live`). Required check: signed in as client A, attempt to read
  client B's invoice id via the anon key → must return **0 rows**; confirm `rowsecurity = true` on both tables.
- **REVIEW-0009 — Low:** a client can read their **own** drafts via a direct anon query (UI hiding is cosmetic).
  Own data, not cross-tenant. Duplicate of Security's `invoice-draft-readable-by-client`.
- **Positives:** no per-invoice URL/id a client can tamper with; admin builder write is server-enforced (client
  gate is UX-only); service-role key is server-only; CORS scoped to `https://websharke.com`.

### 8. Go / No-Go decision

**NO-GO for the Stripe phase on this pass — but conditional, not because the code is broken.**

- The code-level review (mine + Security + Efficiency) finds **no blocking defect**; the build is solid.
- I am withholding GO for two honest reasons: **(1)** the **live end-to-end test — the actual Reviewer gate —
  was not run** (no browser/preview/Supabase this session), so I cannot certify the admin/client flows actually
  work in a browser; and **(2)** the **live RLS cross-tenant isolation test (REVIEW-0013 / IV-GATE) is a hard
  prerequisite** before any billing feature ships, and it is unverifiable from source.
- **Path to GO (for the Manager/owner):** run the live pass — (a) verify RLS isolation with the cross-account
  read test and confirm `rowsecurity = true` on `invoices` + `invoice_items`; (b) walk the admin builder (draft +
  issued, multi-item, qty>1, the validation cases) and the client billing page (issued appears, read-only, drafts
  hidden, Pay inert) in a real browser, desktop **and** a phone; (c) look at REVIEW-0001 on mobile. With those
  green and the Low/Medium items triaged, this flips to **GO**. The Medium atomicity item (REVIEW-0002) is the one
  worth fixing before Stripe (move the two writes into one Postgres RPC — already named in code and the Efficiency/
  Security logs).

---

## Findings

## REVIEW-0001 - [NEW] Admin invoice builder: line-item fields lose their visible labels on small screens (≤560px)

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
Admin invoice builder — `dashboard.html` `#view-invoices`, line-item rows

Device / Viewport:
Mobile ≤560px (source/CSS analysis; needs a real-viewport confirmation)

Severity:
Medium

User Experience:
On a phone the admin building an invoice would see, under each item name, a row of bare values — a "1", a "$ 0.00" field, and another "$0.00" with an × — with nothing labelling which box is Quantity, which is Unit price, and which is the (non-editable) line Amount.

Issue:
On desktop the three numeric columns are labelled only by a single header row (`.inv-items-head`). The `@media(max-width:560px)` block sets `.inv-items-head{display:none}` and collapses the row to a 2-col grid, but the per-row controls carry only `aria-label`s (invisible to sighted users) — there is no `data-label` visible-label fallback. The **client** read-only table does it right (`data-label` + `::before`); the admin builder does not.

Why It Matters:
Easy to type the price into the Quantity box or misread the line. It's admin-only (single trusted user) and has no data-integrity impact (server recomputes totals), but it's a real usability defect on mobile.

Steps To Reproduce (for the live tester):

1. Sign in as admin, open the Invoices view.
2. Narrow the browser to ≤560px (or load on a phone).
3. Add a line item and look at the Qty / Unit price / Amount fields.

Expected:
Each field is clearly labelled on mobile (as the client invoice table is).

Actual (from source):
The header is hidden and the fields show only raw values/placeholders with no visible labels.

Suggested Fix:
Mirror the client table's pattern — add a visible `data-label` (e.g. via `::before`) to the qty/price/amount cells at ≤560px, or keep a compact inline label per field.

Evidence:
`dashboard.html` CSS line ~576 (`.inv-items-head{display:none}`), ~577 (2-col grid), row builder ~2744-2747 (inputs have only `aria-label`); contrast client `cinvNumCell` ~1753-1756 + CSS ~281.

Manager Status:
[NEW]

Manager Notes:
_Empty until Manager reviews it._

Converted Task:
_Empty until Manager creates a task._

---

## REVIEW-0002 - [NEW] Rare double-DB-failure can show a client an "issued" invoice with a Total but no line items

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
`api/admin/invoices.js` create flow → client billing card

Device / Viewport:
N/A (server logic + client render)

Severity:
Medium

User Experience:
In a rare failure case, a client opening Billing would see an invoice card with a real dollar **Total** and **no line items** explaining it — a "phantom charge" look.

Issue:
The invoice header and its line items are two separate, non-transactional inserts. If the items insert fails, the route does a compensating delete; if that delete **also** fails, it knowingly leaves an orphaned invoice with the body's status (which can be `issued`) and a total but zero items. The client card renders the items table only when `items.length` is truthy but always renders the totals — so an issued orphan shows a Total with nothing itemised.

Why It Matters:
Erodes trust ("what is this charge?"). Narrow (needs two consecutive DB failures), not attacker-controllable, logged loudly with the invoice id, and the admin gets a manual-cleanup toast — hence Medium, not High. **This is the item most worth fixing before Stripe.**

Steps To Reproduce (for the live tester):
Hard to force without fault injection; conceptually: cause `invoice_items` insert to fail AND the compensating `invoices` delete to fail, with `status:issued` — then load the client's Billing tab.

Expected:
A client never sees an invoice without its line items; header+items commit or roll back together.

Actual (from source):
On the double-failure path an issued, itemless invoice persists and is client-readable.

Suggested Fix:
Move steps 5–6 into one Postgres RPC (`create_invoice_with_items`) so header+items are atomic — already named in the code comment and in both the Security and Efficiency logs. Interim: insert as `draft`, flip to `issued` only after items commit.

Evidence:
`api/admin/invoices.js:309-349`; client render `dashboard.html:1688` (items gated on length) vs `:1691` (totals always). Already logged: `performance-log.md` (No atomic invoice create), `security-log.md` (Non-atomic write).

Manager Status:
[NEW]

Manager Notes:
_Duplicate of an Efficiency + Security finding — group these. Reviewer adds the client-facing presentation consequence._

Converted Task:
_Empty until Manager creates a task._

---

## REVIEW-0003 - [NEW] Fractional quantity shows a valid-looking estimate, then Save rejects it

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
Admin invoice builder — quantity field

Device / Viewport:
Any

Severity:
Low

User Experience:
An admin types a quantity like "2.7", the line Amount and the Summary total update to a normal-looking dollar figure, so the line looks fine — then clicking Save/Issue throws an inline error on that row.

Issue:
The live estimate floors the qty (`Math.floor`) so "2.7" displays as 2 and looks coherent, but the submit validator rejects any non-integer. The estimate and the validator disagree about the same input.

Why It Matters:
Minor friction/confusion; no bad data is stored (submit is blocked client-side and the server also rejects it). Already logged by Efficiency.

Steps To Reproduce (for the live tester):

1. Admin → Invoices → enter a quantity of "2.5".
2. Note the line Amount / Summary look valid.
3. Click "Save as draft" or "Issue invoice".

Expected:
The estimate signals the problem the same way Save will (e.g. show a dash / 0 for a non-integer qty).

Actual (from source):
Estimate looks fine; Save errors "quantity must be a whole number of 1 or more."

Suggested Fix:
Make `recomputeInvoice` treat a non-integer qty the way `collectInvoice` does (show 0/a dash) so the estimate warns. Pure client-side. (`dashboard.html:2764` vs `2794-2795`.)

Manager Status:
[NEW]

Manager Notes:
_Duplicate of an Efficiency note — group._

Converted Task:
_Empty until Manager creates a task._

---

## REVIEW-0004 - [NEW] "Created" date on the client invoice card can show the previous calendar day (timezone shift)

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
Client billing card — "Created" meta line (`dashboard.html` + `payment.html`)

Device / Viewport:
Any client in a negative-UTC timezone (all of the US) — **[NEEDS LIVE]** (depends on viewer's browser timezone)

Severity:
Low

User Experience:
A client could see "Created: June 21" for an invoice actually created June 22, if it was created just after midnight UTC and they're in a US timezone.

Issue:
`created_at` (a UTC `timestamptz`) is rendered with `fmtDate()` → `new Date(value).toLocaleDateString()`, which shifts to local time. Notably the code already avoids exactly this bug for `due_date` (handled timezone-safe via `cinvDate`), but not for `created_at`.

Why It Matters:
Cosmetic, off-by-at-most-one-day, never affects money or due date — but can look like a record-keeping error if the client cross-checks against an email/receipt. **New** finding (the perf log only flagged the duplicate `fmtDate` helpers as a code smell, not this day-shift).

Steps To Reproduce (for the live tester):

1. Have an invoice whose `created_at` falls between 00:00 UTC and the local UTC offset.
2. View it as a client in a US-timezone browser.

Expected:
"Created" shows the same calendar day the admin created it.

Actual (from source):
Can render the previous day.

Suggested Fix:
Render `created_at` as a date in a fixed/UTC-aware way (or label it with the time/zone). Lowest-effort: format with an explicit timezone, or show date+time.

Evidence:
`dashboard.html:1676` (`fmtDate(iv.created_at)`) + `fmtDate` ~1359; same in `payment.html:429` / ~297. Contrast tz-safe `cinvDate` ~1578-1587.

Manager Status:
[NEW]

Manager Notes:
_Empty until Manager reviews it._

Converted Task:
_Empty until Manager creates a task._

---

## REVIEW-0005 - [NEW] Over-cap quantity/price fails late as a generic toast instead of an inline field error

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
Admin invoice builder — quantity/price validation

Device / Viewport:
Any

Severity:
Low

User Experience:
Every other builder error highlights and focuses the bad field; but an unrealistically large qty/price produces a server round-trip then a generic toast not pinned to the field.

Issue:
`collectInvoice` enforces only lower bounds (qty ≥ 1, price ≥ 0); the maximums (MAX_QTY 1,000,000; MAX_CENTS) exist only server-side, so an over-cap value passes client validation, is POSTed, and the 400 surfaces as the generic `#inv-msg` + toast.

Why It Matters:
Inconsistent error UX; never stores bad money (server rejects). Already noted as an optional-parity item by Efficiency.

Steps To Reproduce (for the live tester):

1. Admin → Invoices → enter qty 9999999 or price 99999999.99.
2. Save → observe a generic toast, not a field-level error.

Expected:
Inline, field-focused error like every other check.

Actual (from source):
Late, generic server error.

Suggested Fix:
Add matching client-side max checks in `collectInvoice` (mirror the server caps) and route them through `invFail`.

Manager Status:
[NEW]

Manager Notes:
_Empty until Manager reviews it._

Converted Task:
_Empty until Manager creates a task._

---

## REVIEW-0006 - [NEW] If the client list fails to load, Save shows a misleading "Select a client" error on an empty, disabled dropdown

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
Admin invoice builder — client picker error path

Device / Viewport:
Any

Severity:
Low

User Experience:
If the client list fails to load, an admin who fills out items and clicks Save is told "Select a client for this invoice" and focused on a dropdown that has no selectable clients — blaming them instead of explaining the list failed.

Issue:
On a `list_users` failure the picker shows a disabled "couldn't load — reopen to retry" option and an error in `#inv-msg`. But the form/buttons stay enabled; on Save, `collectInvoice` runs `clearInvFlags()` (erasing the real load-error message) then hits the generic "Select a client" guard and focuses the disabled select.

Why It Matters:
Misleading message on an uncommon-but-real error path; no bad submit occurs.

Steps To Reproduce (for the live tester):

1. Force the client list to fail to load (e.g. offline) in the Invoices view.
2. Fill items, click Save.

Expected:
A message that the client list failed and to reopen/retry.

Actual (from source):
"Select a client for this invoice" on an empty disabled dropdown.

Suggested Fix:
When `INV.clientsLoaded` is false, keep the load-error message and/or disable Save with a "client list unavailable — reopen to retry" hint instead of the generic guard.

Manager Status:
[NEW]

Manager Notes:
_Empty until Manager reviews it._

Converted Task:
_Empty until Manager creates a task._

---

## REVIEW-0007 - [NEW] Admin builder on mobile: read-only line Amount can look editable; price field cramped at ~360px

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
Admin invoice builder — line-item row at ≤560px

Device / Viewport:
Mobile ~360–560px — **[NEEDS LIVE]**

Severity:
Low

User Experience:
On a phone the per-line read-only Amount sits in the same column area as the inputs with no caption, so it can read as a fourth editable field; large prices feel tight against the "$" prefix in a ~half-width input.

Issue:
At ≤560px the row is a 2-col grid; `.inv-amount` (a bold read-only `<div>`) auto-flows next to the inputs without a label, and `.inv-price` (right-aligned, with reserved left padding for "$") gets ~half the panel width. Coherent layout, no overflow — but ambiguous/tight. (The verifier downgraded the "looks editable" part to low because the amount div has distinct styling and the price has a visible "$".)

Why It Matters:
Minor mobile-admin polish; no data impact. Pairs with REVIEW-0001.

Steps To Reproduce (for the live tester):

1. Admin → Invoices at ≤560px; enter a long price (e.g. 12345.67).
2. Observe the Amount cell and price input crowding.

Expected:
Read-only Amount is clearly captioned/visually distinct; inputs comfortable.

Actual (from source):
Uncaptioned amount; tight price field.

Suggested Fix:
Add a visible "Amount" caption (ties to REVIEW-0001's labels) and give the price input a touch more room at the smallest widths.

Manager Status:
[NEW]

Manager Notes:
_Empty until Manager reviews it._

Converted Task:
_Empty until Manager creates a task._

---

## REVIEW-0008 - [NEW] Admin identity is defined in two independent places and can drift

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
`api/admin/invoices.js` `ADMIN_EMAIL` vs SQL `is_admin()` literal

Device / Viewport:
N/A

Severity:
Low

User Experience:
None day-to-day with the default email; latent operational hazard.

Issue:
The route's admin email is env-overridable (`process.env.ADMIN_EMAIL` || hardcoded default); the RLS `is_admin()` SQL function hardcodes the same address as a literal. If the env override is ever set to a different address, the service-role route would accept that admin while RLS-governed admin reads would treat them as non-admin — confusing latent drift (not an exploit).

Why It Matters:
Two sources of truth for the most important identity in the authZ model.

Steps To Reproduce (for the live tester):
Set `ADMIN_EMAIL` env to a non-default value; admin write route works but `is_admin()`-governed reads behave as non-admin.

Expected:
One source of truth for admin identity.

Actual (from source):
Two (route env + SQL literal).

Suggested Fix:
Add a "keep in sync" note, or drive both from a single role/`app_metadata` claim. (`api/admin/invoices.js:61-63,278`; `db/admin-schema.sql:34-37`.)

Manager Status:
[NEW]

Manager Notes:
_Empty until Manager reviews it._

Converted Task:
_Empty until Manager creates a task._

---

## REVIEW-0009 - [NEW] A client can read their OWN draft invoices via a direct anon-key query (UI draft-hiding is cosmetic)

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
RLS `inv_owner_select` vs client draft-hiding — **[NEEDS LIVE]**

Device / Viewport:
N/A

Severity:
Low

User Experience:
A client never sees drafts in the UI; only a hand-crafted console query exposes their own draft figures.

Issue:
The owner-SELECT RLS policy has no status condition, so a client can read their own `draft` invoices (and amounts) by dropping the UI's `.in("status", …)` filter. The draft-hiding is defence-in-depth, not enforcement. It's the client's own data — not cross-tenant.

Why It Matters:
Matters only if drafts hold not-yet-final figures the admin doesn't want seen pre-issue. **Duplicate of Security's `invoice-draft-readable-by-client`** — surfaced here from the client-billing dimension.

Steps To Reproduce (for the live tester):
Signed in as a client, run `db.from('invoices').select('*').eq('status','draft')` in the console; see whether draft rows return.

Expected:
Drafts not readable by the client until issued (if that's the intent).

Actual (from source):
RLS permits the client to read their own drafts.

Suggested Fix:
If drafts must be hidden server-side, tighten the policy: `using ((auth.uid() = client_user_id and status <> 'draft') or public.is_admin())`. (Owner decision.)

Manager Status:
[NEW]

Manager Notes:
_Duplicate of Security `invoice-draft-readable-by-client` — group/cross-reference._

Converted Task:
_Empty until Manager creates a task._

---

## REVIEW-0010 - [NEW] Builder has no discount/tax input, so Subtotal always equals Total

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
Admin builder Summary panel

Device / Viewport:
Any

Severity:
Info

User Experience:
The Summary always shows two identical lines (Subtotal and Total) with no discount/tax row, which can read as a layout bug even though the math is correct.

Issue:
The server supports discount/tax and the client card renders those rows when present, but the admin builder collects neither, so `total = subtotal` always. Consistent and correct; just looks redundant. Intentional phase-1 scope (already noted by Efficiency).

Why It Matters:
Cosmetic/clarity only.

Suggested Fix:
Either add discount/tax inputs, or add a one-line note ("no discount/tax in this phase") so the duplicated rows don't read as a bug. Evidence: `dashboard.html:2770-2771`, markup `932-933`.

Manager Status:
[NEW]

Manager Notes:
_Empty until Manager reviews it._

Converted Task:
_Empty until Manager creates a task._

---

## REVIEW-0011 - [NEW] Dashboard billing loading/empty states aren't in a status live-region (a11y inconsistency vs /payment)

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
Client billing — dashboard tab vs `payment.html` port — **[NEEDS LIVE]** (AT/browser dependent)

Device / Viewport:
Screen reader

Severity:
Info

User Experience:
A screen-reader user on the dashboard Billing tab may not hear "Loading…" / "You don't have any invoices yet"; the same user on `/payment` would (its port wraps them in `role="status" aria-live="polite"`).

Issue:
On the dashboard, the loading/empty `<p>`s aren't in a live region (only `#cinv-list` is). The two near-verbatim ports diverge in SR behavior.

Why It Matters:
Minor accessibility/consistency nit; sighted behavior identical.

Suggested Fix:
Wrap the dashboard loading+empty in a `role="status" aria-live="polite"` container, matching `payment.html`. Evidence: `dashboard.html:783-793` vs `payment.html:262-268`.

Manager Status:
[NEW]

Manager Notes:
_Empty until Manager reviews it._

Converted Task:
_Empty until Manager creates a task._

---

## REVIEW-0012 - [NEW] Cancelling the "Issue invoice" confirmation gives no acknowledgement

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
Admin builder — Issue confirm modal

Device / Viewport:
Any

Severity:
Info

User Experience:
Click "Issue invoice" → confirm dialog → Cancel: the button flickers "Issuing…"→back and nothing else happens. The form is safely intact, but there's no "cancelled" closure.

Issue:
On cancel, the code returns early and the `finally` restores state with no status message. Acceptable for a modal cancel; only a minor closure nit. (Double-submit protection here is solid.)

Why It Matters:
Trivial polish.

Suggested Fix:
Optional: show a brief "Issue cancelled — nothing was saved" status. Evidence: `dashboard.html:2851-2858`.

Manager Status:
[NEW]

Manager Notes:
_Empty until Manager reviews it._

Converted Task:
_Empty until Manager creates a task._

---

## REVIEW-0013 - [NEW] GATING: cross-tenant invoice isolation depends entirely on Supabase RLS, which is unverifiable from the repo

Date:
2026-06-22 18:30

Reviewer Session:
invoice-source-review (SOURCE-LEVEL — not observed live)

Page / Feature:
Client billing reads (`dashboard.html` + `payment.html`) vs RLS in `db/invoices-schema.sql` — **[NEEDS LIVE]**

Device / Viewport:
N/A

Severity:
High (impact) — gating verification item (the migration/policies are correct *as written*; this is not a code defect)

User Experience:
If RLS is on and correct (expected), a client sees only their own invoices. If RLS were off/mis-applied on the live project, a logged-in user could read **every** client's invoices + line items (financial PII) from the browser console.

Issue:
There is no client write policy and only an owner-SELECT policy, so RLS is the **entire** server-side control for cross-tenant read isolation. The client query's `.eq("client_user_id", user.id)` is removable by the user, and the items query has no app-level ownership filter at all — it relies wholly on `invitem_owner_select`. None of this is provable from the repo (RLS lives in the Supabase dashboard).

Why It Matters:
This is the single highest-impact failure mode of the feature and it is invisible from source. **It is the #1 prerequisite before Stripe.** Duplicate of Security's **IV-GATE** (`invoice-gate-rls-must-be-live`) and standing F5 (`rls-not-verifiable-from-repo`).

Steps To Reproduce / Verify (for the live tester / owner):

1. In Supabase, confirm `rowsecurity = true` on `public.invoices` AND `public.invoice_items`, and that all four policies + `public.is_admin()` exist.
2. Signed in as client A, run `db.from('invoices').select('*')` (no `.eq`) → must return only A's rows.
3. Attempt to read a known client-B invoice id (and its items) as A → must return **0 rows**.

Expected:
Cross-tenant reads return 0 rows.

Actual:
Unverifiable from source — must be confirmed live before relying on it.

Suggested Fix:
Run the live verification above and record the result. (No code change needed if RLS is correctly enabled.)

Manager Status:
[NEW]

Manager Notes:
_Duplicate of Security IV-GATE — this is the gating item for the Go/No-Go. Needs the owner's Supabase access._

Converted Task:
_Empty until Manager creates a task._
