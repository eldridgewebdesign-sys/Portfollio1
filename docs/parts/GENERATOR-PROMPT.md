# Prompt: generate/maintain per-part docs (for Claude Code)

Paste everything below the line into a Claude Code session opened in this repo.

---

You are documenting the WebSharke site, one markdown file per part, in `docs/parts/`.
A pattern already exists — follow it exactly. Do not invent a new format.

## Before you write anything

1. Read `CLAUDE.md` (root) for the architecture and the Critical constraints.
2. Read `docs/parts/README.md` — the index and the maintenance rule. It lists every
   part and its status (✅ done / ⬜ todo). Work only on ⬜ parts.
3. Read `docs/parts/TEMPLATE.md` and two finished examples as your format reference:
   `docs/parts/login.md` (a page) and `docs/parts/webhook.md` (an API route).

Note: `api/` and `db/` subfolders are OneDrive cloud-only and may not list in a shell.
If `ls`/`grep` in bash can't see a file, use the Read tool on the full path (it
downloads the file). Confirm real filenames before referencing them.

## For each part, produce `docs/parts/<name>.md` with these sections

- **Header** — part name, `file path`, type (page | serverless API | shared script |
  middleware | schema), route if it's a page, and `Last reviewed: <today>`.
- **What it does** — plain language, no code. Someone who's never seen the file should
  understand its job and where it sits in the user flow.
- **How everything inside works** — a real walkthrough of the file's contents: the
  structural blocks, key functions/handlers, what it reads/writes (Supabase tables,
  Stripe, cookies, env vars), and how it connects to other parts. Read the ACTUAL file
  first. For large files (e.g. `dashboard.html`), grep for section markers / function
  names and document by structure rather than pasting.
- **Last five changes** — newest first. See sourcing rules below.
- **Notes & gotchas** — constraints, traps, env vars, RLS assumptions; pull the binding
  ones from `CLAUDE.md` → Critical constraints.
- **Related parts** — `[[wikilinks]]` to related docs.

## Sourcing "Last five changes" — this is the important rule

Pull change history ONLY from `docs/logs.md` and `docs/CHANGELOG.md`. It is real
history — never invent, guess, or pad. If a file has fewer than five real changes,
list only the real ones and say so. If it has none logged, write one honest line
("No changes recorded in the work log; stable") — do not fabricate.

To attribute changes to dates efficiently, grep the log interleaving session headers
with the filename, then read the matching sessions:

    grep -nE '^## 20[0-9]{2}-[0-9]{2}-[0-9]{2}|<filename>' docs/logs.md

Each `## YYYY-MM-DD ...` line is a session; the nearest one above a filename hit is its
date. Confirm the file was actually MODIFIED that session (look under "Files changed:"),
not merely mentioned as "NOT touched" or as a baseline. Format each entry:

    - **YYYY-MM-DD** — What changed. _(Note: why / what to watch. Session: `name`.)_

## Scope and constraints

- Only create/edit files in `docs/parts/`. Do NOT touch site code, `CLAUDE.md`, or the
  other `docs/*` logs.
- One part per file, matching `README.md`'s inventory. Exception: `dashboard.html` is
  ~272KB and combines the client dashboard AND the admin panel — split it into
  `dashboard-client.md` and `dashboard-admin.md` rather than one unusable doc.
- Use extensionless routes (`/login`, `/dashboard`) in prose, per `vercel.json`.
- Don't reference assets/paths you haven't confirmed exist.

## When done with each part

- Flip its row in `docs/parts/README.md` from ⬜ to ✅ and link the doc.
- Verify the `[[links]]` point at real filenames.
- Report which docs you wrote and any part where the change history was thin/absent.

Work through the ⬜ parts in `README.md` order. Keep each doc tight and accurate over
long and padded.
