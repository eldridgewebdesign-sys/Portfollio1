# WebSharke Engineering Demo — Project Hub

> **Project:** a cinematic, scroll-driven laptop-teardown experience served at **`/engineering`**.
> **Status:** documentation phase. No production code exists yet, and none may be written until the
> blueprint is approved (see Build order below).
> **Managed by:** the Engineering Demo Project Manager. This folder is the single source of truth for
> the project. `docs/` is excluded from the Vercel deploy (`.vercelignore`), so nothing here is public.

---

## What this is

The homepage promises: *"Websites are complicated — good thing we're not."* The `/engineering` page is
the proof. A visitor scrolls and a laptop — the most complicated object on most desks — calmly takes
itself apart, piece by piece, until every part of it makes sense. It is the flagship demonstration of
what WebSharke can build. The first thought a visitor should have:

> **"I didn't know websites could do this."**

It is not a landing page, not a product page, not a portfolio. It is one continuous, scroll-paced story
told with a real-time 3D scene. It succeeds the existing `Animations/laptop-teardown` scroll study
(which stays live and untouched — see `decisions.md` D-002).

## Directory

| File | Owner | Purpose |
|---|---|---|
| `README.md` | Project Manager | This hub — overview, progress, rules |
| `project-vision.md` | Project Manager | The heart of the project — philosophy, goals, quality bar |
| `taskboard.md` | Project Manager | Every task, its owner, status, dependencies |
| `decisions.md` | Project Manager | Every binding decision, dated, never deleted |
| `references.md` | Project Manager | Inspiration references — what to learn, what not to copy |
| `01-creative-direction.md` | Creative Director | Visual identity, type, color, light, mood, layout |
| `02-technical-architecture.md` | Technical Architect | Three.js/GSAP architecture, files, performance, fallbacks |
| `03-animation-storyboard.md` | Animation Director | The full scroll timeline — camera, reveals, text, pacing |
| `04-asset-pipeline.md` | Asset Director | Laptop reconstruction, PBR materials, textures, naming |
| `review-report.md` | Reviewer | Brutal critique of every document; approval gate |
| `05-master-specification.md` | Project Manager | Final synthesis — the build blueprint (written last) |

## Current progress

- [x] Phase 1 — Project setup (this folder, vision, board, decisions, references)
- [x] Phase 2 — Specialist documents (four written in parallel, 2026-07-01)
- [x] Phase 3 — Review (5 rounds; all four documents **Approved** — see `review-report.md`)
- [x] Phase 4 — Master specification (`05-master-specification.md`, 1,913 lines; passed the
      completeness + consistency audits with all high/medium findings fixed)
- [ ] Phase 5 — Implementation (**blocked on the owner's D-017 sign-off**: the closing line and
      page title echo the homepage headline and need owner approval; separate effort, not this round)

## Team & responsibilities

| Specialist | Deliverable | Scope |
|---|---|---|
| Creative Director | `01-creative-direction.md` | Visual identity, typography, layout, composition, palette, lighting direction, mood, UX, anti-AI-slop rules, artistic vision |
| Technical Architect | `02-technical-architecture.md` | Three.js + GSAP architecture, file structure, rendering pipeline, performance, asset loading, camera system, mobile, accessibility, build organization |
| Animation Director | `03-animation-storyboard.md` | Scroll timeline, camera choreography, component reveal order, text timing, motion language, transitions, ending, pacing |
| Asset Director | `04-asset-pipeline.md` | Laptop reconstruction, photoreal assets, PBR materials, component hierarchy, file naming, texture requirements, lighting/material references, image-generation requirements |
| Reviewer | `review-report.md` | Critique only. Never designs, never codes. Rejects average work |

## Build order

1. Project Manager writes the five hub documents (done).
2. The four specialists write their documents **in parallel**. They read `project-vision.md`,
   `references.md`, the live site (`index.html`, `docs/design-guide.md`), the predecessor
   (`Animations/laptop-teardown/README.txt`), and the reference images (`images/Laptop/`).
3. The Reviewer critiques all four documents in `review-report.md`. Verdict per document:
   **Approved** or **Rejected** with specific required changes.
4. Rejected documents are revised by their owners and re-reviewed. Repeat until all four are approved.
5. The Project Manager synthesizes `05-master-specification.md` from the approved documents, then has it
   audited for completeness and consistency.
6. Only then may implementation begin — from the master specification alone.

## Rules for contributors

1. **No specialist writes production code.** Documentation only, in this folder only.
2. **No specialist edits another specialist's document.** The Reviewer writes only `review-report.md`.
3. **The Project Manager's decision is final.** Disagreements are recorded in `decisions.md`.
4. **Nothing is deleted.** Completed tasks stay on the board; superseded decisions are marked, not removed.
5. **Every document must stand alone.** A developer joining six months from now must be able to build
   from it without asking questions. No assumptions, no "obviously", no hand-waving.
6. **Every choice needs a reason.** "It looks cool" is a rejection, not a rationale.
7. **The site's voice rules apply to internal docs too.** No buzzwords ("premium", "seamless",
   "immersive", "cutting-edge", "revolutionary", "next-generation", "masterpiece"), no fake numbers.
   Write plainly. See `docs/design-guide.md` → "AI-looking patterns to avoid".
8. **Respect the live site.** The typography system, the owner's copy voice, and the existing
   `Animations/laptop-teardown` page are constraints, not suggestions (see `decisions.md`).
