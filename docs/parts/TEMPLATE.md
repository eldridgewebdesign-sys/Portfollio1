# [Part name] — `[path/to/file]`

> One-line summary of what this part is, in plain language.

- **File:** `path/to/file`
- **Type:** page | serverless API | shared script | middleware | schema
- **Route (if a page):** `/route`
- **Last reviewed:** YYYY-MM-DD

## What it does

Plain-language explanation of this part's job in the product. Why it exists,
who hits it, and where it sits in the user flow. No code here — a person who
has never seen the file should understand its purpose after this section.

## How everything inside works

A walkthrough of the actual contents of the file, in the order they appear or
in logical groups. Cover:

- the main structural blocks (markup sections, style blocks, script blocks)
- the key functions / handlers and what each one does
- what it reads from and writes to (Supabase tables, Stripe, cookies, env vars)
- how it connects to other parts (what it links to, redirects to, or calls)

Enough detail that someone editing the file knows what they are touching and
what will break if they change it.

## Last five changes

Newest first. Pulled from `docs/logs.md` and `docs/CHANGELOG.md` — real history,
not invented. If fewer than five real changes exist, list only the real ones.

- **YYYY-MM-DD** — What changed. _(Note: why, or anything to watch. Session: `session-name`.)_
- **YYYY-MM-DD** — What changed. _(Note.)_

## Notes & gotchas

Constraints and traps specific to this file: things not to touch, known bugs,
env vars it depends on, RLS assumptions, etc. Pull the binding ones from
`CLAUDE.md` → Critical constraints where relevant.

## Related parts

- [[other-part]] — how it relates
