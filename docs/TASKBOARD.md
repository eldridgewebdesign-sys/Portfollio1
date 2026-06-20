# WebSharke — Task Board

> **Read `CLAUDE.md` first.** This project now uses the four-role system: **Manager · Designer ·
> Efficiency · Security**. Every session states its role, reads `docs/taskboard.md` + `docs/logs.md` (and
> its own role log), and claims files in a `docs/logs.md` START entry before editing.
> **Status labels** (`[TODO]` `[IN PROGRESS]` `[BLOCKED]` `[REVIEW]` `[DONE]`) and the **task format** are
> defined in `CLAUDE.md` — use them for every new task.

---

## ⚙️ Role-system migration — 2026-06-19

The old **Manager / Worker / Reviewer** system was replaced by **Manager / Designer / Efficiency /
Security**. What changed:

- **"Worker" is retired.** Build work is now split by specialty: **Designer** (visual / UX / copy),
  **Efficiency** (performance / loading / code weight), **Security** (safety / audits).
- **"Reviewer" is retired.** `docs/reviewer-log.md` is **deprecated** (it never held findings). Role-based
  findings now live in **`docs/design-guide.md`**, **`docs/performance-log.md`**, and
  **`docs/security-log.md`**; the Manager triages those into tasks here.
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

## [REVIEW] Designer: Establish the homepage design baseline and fix obvious visual inconsistencies

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

## [REVIEW] Efficiency: Finish the site-wide no-CDN web fonts (remaining pages)

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

## [REVIEW] Security: Run a site-wide security audit pass and populate the security log

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
