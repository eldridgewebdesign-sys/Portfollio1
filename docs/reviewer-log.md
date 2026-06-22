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

_No reviewer findings logged yet. Reviewer: add entries below, starting at `REVIEW-0001`, using the
**Finding format** above._
