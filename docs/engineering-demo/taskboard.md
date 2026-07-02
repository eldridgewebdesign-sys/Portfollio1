# Engineering Demo — Task Board

> Owned by the Project Manager. Specialists do not edit this board — the PM records their status.
> Allowed statuses: **Todo · In Progress · Needs Review · Approved · Rejected · Completed**.
> Completed work is never deleted from this board.

---

## Phase 1 — Project setup

### T-01 · Create project hub (folder + five PM documents)
- **Owner:** Project Manager
- **Status:** Completed (2026-07-01)
- **Priority:** P0
- **Dependencies:** none
- **Notes:** `docs/engineering-demo/` created with README, project-vision, taskboard, decisions,
  references. Grounded in a recon pass over the live site: `index.html` design system,
  `docs/design-guide.md`, `Animations/laptop-teardown/` (predecessor + its README post-mortem),
  `images/Laptop/` reference art, `vercel.json` routing, `.vercelignore` (docs stay private).

---

## Phase 2 — Specialist documents (parallel)

### T-02 · Creative direction document
- **Owner:** Creative Director
- **Status:** Approved (round 4, 2026-07-01; revision 5)
- **Priority:** P0
- **Dependencies:** T-01
- **Notes:** Deliverable `01-creative-direction.md`. Must work inside the guardrails of
  `project-vision.md` §7 (Distillery + Playfair, warm-room/cool-machine palette, invisible UI).
  Rounds 1–3: Rejected — craft verified sound by round 3; residual defects were cross-citation
  seams (copy deck, arrival, poster ghost) now settled by D-009/D-010/D-013. Awaiting citation
  pass + round-4 review.

### T-03 · Technical architecture document
- **Owner:** Technical Architect
- **Status:** Approved (round 5, 2026-07-01; revision 5 — round 4 caught one stale tree diagram
  in §1.2/§7.1/§4.4 contradicting D-011; fixed and re-approved in round 5)
- **Priority:** P0
- **Dependencies:** T-01
- **Notes:** Deliverable `02-technical-architecture.md`. Hard constraints: no build step, no CDN,
  vendored Three.js + GSAP, `/engineering` via Vercel `cleanUrls`. Budgets must be numbers.
  Rounds 1–3: Rejected — "the strongest document in the project" on craft; residual defects were
  the asset-tree seam and stale 03 constants, settled by D-010/D-011/D-012. Awaiting citation
  pass + round-4 review.

### T-04 · Animation storyboard
- **Owner:** Animation Director
- **Status:** Approved (round 4, 2026-07-01; revision 5 — header repaired after the round-3
  mid-edit failure; body ratified by D-009/D-010)
- **Priority:** P0
- **Dependencies:** T-01
- **Notes:** Deliverable `03-animation-storyboard.md`. Full scroll timeline with exact progress
  ranges (the predecessor's `seg(p, start, end)` windows are the precedent), camera choreography
  with a stated reason per move, text timing, ending sequence.
  Rounds 1–3: Rejected — timing spine, floors, and camera ladder verified correct; residual
  defects were the copy/arrival seams, settled by D-009/D-010. **Known damage:** the round-3
  revision agent died mid-edit — the revision-4 header block contradicts the document's own body
  (header claims copy.B1 deleted + 50vw arrival; body ships copy.B1 + 62vw, which D-009/D-010
  ratify). Citation pass must repair the header to match body + entries.

### T-05 · Asset pipeline document
- **Owner:** Asset Director
- **Status:** Approved (round 4, 2026-07-01; revision 4.1)
- **Priority:** P0
- **Dependencies:** T-01
- **Notes:** Deliverable `04-asset-pipeline.md`. `images/Laptop/` art is reference only; production
  assets rebuilt. The predecessor README documents exactly what was wrong with sliced-frame assets
  (baked shadows, stray slivers, no true separation) — the pipeline must make those impossible.
  Rounds 1–3: Rejected — budget arithmetic and QA machinery verified in order; residual defects
  were stale quotations of 02, settled by D-011/D-012. Awaiting citation pass + round-4 review.

---

## Phase 3 — Review gate

### T-06 · Review all specialist documents
- **Owner:** Reviewer
- **Status:** Completed (5 rounds, 2026-07-01 — final verdicts: all four Approved)
- **Priority:** P0
- **Dependencies:** T-02, T-03, T-04, T-05
- **Notes:** Deliverable `review-report.md` (5 appended rounds, nothing deleted). Rounds 1–3
  rejected all four documents; by round 3 every intra-document standard was met and only
  cross-document citation seams remained. Round-3 root-cause finding (accepted by the PM): the
  seams mirror-swapped across parallel revision rounds because no referee rulings existed. The PM
  recorded D-009–D-017; round 4 was sequenced (entries → citation passes → re-review) and approved
  01/03/04, catching one stale tree diagram in 02; round 5 approved 02 after the fix.

### T-07 · Revisions (as required by review)
- **Owner:** each specialist, own document only
- **Status:** Completed (2026-07-01)
- **Priority:** P0
- **Dependencies:** T-06
- **Notes:** Three parallel revision waves (rounds 1–3), then two sequenced citation passes
  (rounds 4–5) against the recorded entries. Round-3 wave note: revise:03 died mid-edit leaving a
  header/body contradiction; the PM repaired the header by hand and the round-4 pass completed
  the sweep. Final revisions: 01 rev 5, 02 rev 5, 03 rev 5, 04 rev 4.1.

---

## Phase 4 — Master specification

### T-08 · Synthesize master specification
- **Owner:** Project Manager
- **Status:** Completed (2026-07-01)
- **Priority:** P0
- **Dependencies:** T-07 (all four documents Approved)
- **Notes:** Deliverable `05-master-specification.md` (1,913 lines, 15 sections). Synthesized from
  the five approved sources; then audited by two independent critics (completeness: build from
  this document alone; consistency: vs. D-001–D-017 and the approved documents). All 14
  high/medium audit findings were fixed surgically (banned words enumerated in-document, label
  anchor/collision system fully specified, loader manifest table completed, sr-only/aria-hidden
  focus conflicts resolved, breakpoint-matrix contradiction fixed, KTX2Loader transitive-import
  verification step added, and more — see the spec's §14 reconciliations).
  **10 low-severity audit notes remain unfixed by choice** (polish items: ending enter-window
  widths vs the 0.015 grammar, font preload count wording, a corrupted §2.3 sentence, missing
  head boilerplate enumeration, CTA clickability enforcement, millisecond-grep rule exceptions).
  These are recorded in the audit output and should be swept in the first implementation pass.
  **Open for the owner:** (a) D-017 closing-line + page-title sign-off — blocks implementation
  per D-008; (b) sign-off on the synthesis-authored meta description (§3.3); (c) the eventual
  fate of the predecessor `Animations/laptop-teardown` page (D-002).

---

## Phase 5 — Implementation

### T-09 · Build `/engineering`
- **Owner:** unassigned (implementation engineer, future round)
- **Status:** Todo (blocked on the owner's D-017 sign-off)
- **Priority:** P1
- **Dependencies:** T-08 (done) + owner sign-off on the closing line/page title (D-017)
- **Notes:** The blueprint is complete: build from `05-master-specification.md` alone. First
  implementation pass should also sweep the 10 low-severity audit notes recorded on T-08.
  Asset production (Blender model per `04`'s pipeline) can start in parallel with the code.
