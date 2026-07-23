# Engineering Demo — Decision Log

> Owned by the Project Manager. Every important decision is recorded here, dated, with its reason.
> Decisions are never deleted. A changed decision is marked **SUPERSEDED by D-0XX** and left in place.

---

## D-001 — Project documentation lives in `docs/engineering-demo/`
- **Date:** 2026-07-01
- **Decision:** All project documents for the `/engineering` demo live under `docs/engineering-demo/`.
- **Reason:** `docs/` is already the project's internal-documentation home and is excluded from the
  public Vercel deploy via `.vercelignore` — process documents must never ship to production.
- **Approved by:** Project Manager
- **Affected files:** `docs/engineering-demo/**`

## D-002 — The existing `Animations/laptop-teardown` page stays live and untouched
- **Date:** 2026-07-01
- **Decision:** `/engineering` is a brand-new page. The current `Animations/laptop-teardown/` scroll
  study (linked from the homepage `#styles` card) is not modified, moved, or removed by this project.
  Whether it is later retired or redirected to `/engineering` is an owner decision for the
  implementation round.
- **Reason:** The teardown card is live, owner-approved, and referenced by the homepage. Replacing a
  working feature before its successor exists is risk with no benefit. The predecessor also serves as
  a documented post-mortem (its README candidly records the flaws of the sliced-frame approach).
- **Approved by:** Project Manager
- **Affected files:** none (protective decision)

## D-003 — Technology: Three.js + GSAP ScrollTrigger, vendored locally, no build step, no CDN
- **Date:** 2026-07-01
- **Decision:** The page uses real-time 3D (Three.js) with GSAP + ScrollTrigger driving the scroll
  timeline. Both libraries are vendored into the repo (exact versions pinned by the Technical
  Architect). No bundler, no framework, no external CDN request of any kind. Static binary assets
  (glTF/GLB models, compressed textures) are permitted and expected.
- **Reason:** The project brief mandates a Three.js + GSAP architecture; the ambition (camera
  choreography, physically-lit photoreal teardown) exceeds what layered 2D images can deliver — the
  predecessor's README documents that ceiling. Vendoring follows the owner's standing no-CDN
  preference and the predecessor's proven principle: nothing an ad-blocker, proxy, or third-party
  outage can break. No build step keeps the page consistent with every other page on the site.
- **Approved by:** Project Manager
- **Affected files:** future `/engineering` implementation, vendored library files

## D-004 — Typography: Distillery Display + Playfair Display only
- **Date:** 2026-07-01
- **Decision:** The page uses the live site's two-font system — Distillery Display (headings,
  caps-only face) + Playfair Display (body/UI) — self-hosted from the repo's `/fonts/` directory.
  No third family, no CDN fonts.
- **Reason:** Owner rule set 2026-06-26 (two fonts only, vendored). `/engineering` is a page *of* the
  live site, unlike the `demos/` templates which deliberately carry their own identities. The older
  Cormorant Garamond + Mulish files under `Animations/laptop-teardown/vendor/` are legacy for that
  page only.
- **Approved by:** Project Manager
- **Affected files:** `01-creative-direction.md`, future implementation

## D-005 — Reference images are references only; production assets are rebuilt
- **Date:** 2026-07-01
- **Decision:** The images in `images/Laptop/` (closed laptop, exploded teardown frames, sliced
  layers, beige interior backdrop) define the subject, the component set, and the lighting/mood
  direction — nothing from them ships as a production asset. The Asset Director owns the rebuild
  pipeline (true 3D model with separated components).
- **Reason:** The project brief states it explicitly, and the predecessor proved why: sliced
  composite frames carry baked shadows, stray slivers, and no true separation. Production quality
  requires natively separated assets.
- **Approved by:** Project Manager
- **Affected files:** `04-asset-pipeline.md`, future asset files

## D-006 — Copy voice and anti-hype rules are binding
- **Date:** 2026-07-01
- **Decision:** All page copy follows the owner's established voice: plain, specific, honest, a
  little dry. The design guide's banned-word list ("premium", "revolutionary", "cutting-edge",
  "seamless", "immersive", "next-generation", "masterpiece") applies to page copy and is modeled in
  project documents. No fake statistics, no invented testimonials, no numbered "01/02" eyebrow labels
  (owner has explicitly rejected these as AI-looking).
- **Reason:** Documented owner feedback in `docs/design-guide.md`; the vision's "show, don't claim"
  philosophy makes hype copy self-defeating on this page in particular.
- **Approved by:** Project Manager
- **Affected files:** all specialist documents, future page copy

## D-007 — Progressive enhancement is mandatory, designed, and reviewed
- **Date:** 2026-07-01
- **Decision:** The page must specify designed experiences for: `prefers-reduced-motion`, no
  JavaScript, no WebGL, keyboard-only use, and screen readers. These are specified in the
  architecture and creative documents and judged at review — not patched after implementation.
- **Reason:** Standing site principle (the predecessor is static-first with documented fallback
  frames; the homepage honors reduced motion everywhere). A showcase page that breaks for some
  visitors argues against the company that built it.
- **Approved by:** Project Manager
- **Affected files:** `01-creative-direction.md`, `02-technical-architecture.md`, future implementation

## D-008 — Documentation gate: no implementation until the master specification is approved
- **Date:** 2026-07-01
- **Decision:** No production code is written until every specialist document is Approved by the
  Reviewer and `05-master-specification.md` passes its completeness and consistency audit.
- **Reason:** Project brief rule. The cost of a wrong blueprint is a rebuilt page; the cost of a slow
  blueprint is a few documents.
- **Approved by:** Project Manager
- **Affected files:** all

---

> **Revision-round rulings (D-009 – D-016).** Rounds 1–3 of review found four cross-document seams
> that mirror-swapped because these entries did not exist (review-report.md, Round 3, consistency
> finding 6). They are recorded now, before the round-4 citation pass. Where a ruling fixes a table
> or a number, the entry is the interface of record: both documents carry it identically and cite
> the entry by number. Wording ownership (01), timing ownership (03), budget ownership (02), and
> naming ownership (04) are unchanged — an owner may still revise its own cells, but only together
> with a superseding entry here, never unilaterally.

## D-009 — Seam A ruling: the joint copy deck (slot structure, wording, `copy.B1` ships)
- **Date:** 2026-07-01
- **Decision:** The page's copy deck is the **six merged teardown cards plus `copy.B1`** — the
  structure and wording below, recorded verbatim. `copy.B1` **ships**. Slot IDs and windows are the
  Animation Director's (03 §3/§7.1); every word is the Creative Director's (01 §8.2). The table of
  record:

  | Slot | Wording (final) | Words |
  |---|---|---|
  | `copy.B0` | title "Engineering" + subline "A laptop is a complicated thing. It comes apart layer by layer." | 1 + 12 |
  | `copy.B1` | "That was you. This page only moves when you do." | 10 |
  | `copy.B2` | "The lid comes off first. It always does." | 8 |
  | `copy.B3` | "The cooling fan and the copper heat pipes. They carry heat away." | 12 |
  | `copy.B4` | "Storage and memory. Everything you keep, and everything it's thinking about." | 11 |
  | `copy.B5` | "Support boards. Power, ports, and signals — small jobs, handled separately." | 10 |
  | `copy.B6` | "The mainboard lifts away. The chassis stays, and asks for no credit." | 12 |
  | `copy.close` | "Websites are complicated." / "You've seen how we treat complicated." (Distillery, two lines) | 3 + 6 |
  | `copy.cta` | "Start a Project" | 3 |
  | `copy.signoff` | "© 2026 WebSharke" | 3 |
  | `label.*` | canon part names verbatim, chip treatment per 01 §7.5, lifecycle per 03 §7.4 | see D-015 |
  | `cue.scroll` | "Scroll" | 1 |

  There is no `ui.progress` slot (01 §7.4's no-progress-bar ruling stands; the contingency design
  remains a contingency). Windows are as published in 03 §3/§7.1 (revision 3 body). If 01 edits a
  sentence, the floor formula in 03 §7.2 re-runs and a superseding entry records the change.
- **Reason:** Card structure follows beat structure — one card per beat, one idea per viewport
  (interface b; references §2). `copy.B1` ships because the vision's second emotional beat ("wait,
  I'm doing this") deserves the page's one sentence about itself, read on a still frame that proves
  it; the Round-3 review verified B1's hold under `copy.B1` as the strongest version of the opening
  yet. The eight-per-component variant died on timing: its `copy.pipes` window sat inside 03's
  deliberately card-free B4 camera window. Wording is 01's throughout — the Reviewer's standing
  note is that 01's sentences ship regardless of structure.
- **Approved by:** Project Manager
- **Affected files:** `01-creative-direction.md` §8.2/§8.3, `03-animation-storyboard.md` §7.1/§3/§11

## D-010 — Seam B ruling: the 62vw arrival is live; the 50vw centered variant is retired
- **Date:** 2026-07-01
- **Decision:** The page's first frame (desktop ≥1024px): the closed machine right of center,
  **subject center 62vw, silhouette ≈38% of frame width**, title in the left word column centered
  at 50vh, delivered by camera pose **P0 at 4.15W ≈ 1.26 m, elevation +22°**. **B1 is a pure
  dolly** (4.15W → 2.90W working distance), no lateral reframe; timing per 03 §3/§4-B1 as published
  (B1 0.000–0.105, H1 hold 0.055, Lid part window 0.105–0.145, B1/B2 boundary **0.105** — 02 §6.4's
  `B2 = 0.105` stands). The subject holds 62vw through P0–P4 and centers at 50vw only for the P5
  tableau. Mobile (<768px) keeps the portrait refit as published (center 50vw/40vh, ≥10% margins,
  ≤88vw). The round-2 "50vw centered arrival + B1 reframe" variant is **retired on the record**; if
  ever revisited, its full design lives in review-report.md Round 2 and requires a superseding entry.
- **Reason:** (a) Composition: the machine at 62vw leaves the left third as a calm reading column,
  so the eye never travels between copy and subject — the design guide's editorial principle, one
  focal point per frame. (b) Motion: a pure dolly makes the first scroll's cause-and-effect
  instantly legible (approach only); the 50→62vw reframe was a camera move whose purpose-audit row
  had already been deleted. (c) Verification economy: 01, 02, and 04 as published already carry the
  62vw numbers, and the Reviewer hand-checked P0's trigonometry (extent 1.197W → 38.2%) — ruling
  the other way would force three documents to re-derive verified arithmetic.
- **Approved by:** Project Manager
- **Affected files:** `01-creative-direction.md` §5, `03-animation-storyboard.md` §4-B0/§4-B1/§5.2/§8
  (03's revision-4 header block must be corrected to this ruling — its body already complies),
  `02-technical-architecture.md` §4.2/§6.4, `04-asset-pipeline.md` render cameras §9

## D-011 — Seam D ruling: asset packaging — flat `engineering/assets/` with per-file `.vN` tokens
- **Date:** 2026-07-01
- **Decision:** All runtime assets mount at **`engineering/assets/`**, flat, with exactly one
  subdirectory: `fallback/` (static-experience images). Versioning is **per-file `.vN` tokens**
  (`laptop.v1.glb` → `laptop.v2.glb`), immutable once shipped, matching the immutable cache-header
  policy. There is **no `models/` subdirectory** and no `v1/` version directory. File basenames are
  the Asset Director's canon (interface d); the mount, mechanism, and cache policy are the Technical
  Architect's. Geometry lives at `engineering/assets/laptop.v1.glb`.
- **Reason:** 02 owns the mount and published the `.vN` mechanism with its cache rationale; one GLB
  does not need a subdirectory, and a flat tree has fewer path tokens to get wrong — Round 1's
  node-name 404 and Round 3's two-tree seam were both path-token failures. 04's current revision
  already concurs in text; this entry ends the swap.
- **Approved by:** Project Manager
- **Affected files:** `02-technical-architecture.md` §1.2/§7, `04-asset-pipeline.md` §6.3/§6.4

## D-012 — Seam E ruling: the ground-shadow rig numbers
- **Date:** 2026-07-01
- **Decision:** Ground contact shadow: plane **1.2 × 1.2 m**, opacity **0.35**, PCFSoft, shadow map
  **2048 (tier A) / 1024 (tiers B–C)**, ortho frustum **±0.45 m**, bias **−0.0003**, normalBias
  **0.02**. 02 §4.3 is the source of record (its derivation: the tableau Lid's shadow at the 40°
  key lands ≈0.53 m from center — a 0.9 m plane clips it); 04 §7.3 defers normatively and quotes
  these numbers exactly.
- **Reason:** 02's numbers carry a physical derivation the Reviewer verified; 04's earlier
  0.9/0.32/−0.0002 were 02's own withdrawn round-1 values, kept alive only by the citation swap.
- **Approved by:** Project Manager
- **Affected files:** `02-technical-architecture.md` §4.3, `04-asset-pipeline.md` §7.3

## D-013 — No loader poster
- **Date:** 2026-07-01
- **Decision:** No poster image exists anywhere on the page. The loading experience is 01's
  inline-CSS empty-room design (wall gradient, masked wordmark, real-progress copper hairline); the
  first rendered frame of the 3D scene is the first image the visitor sees. `R0` (a fallback still)
  is never requested in 3d mode — 02's QA-1 (zero `assets/fallback/` requests in 3d mode) is a
  binding acceptance test.
- **Reason:** 02 §7.2's refusal is reasoned (a poster duplicates the first frame at real download
  cost and creates a double-first-frame cliché); 04 deleted its poster designation to match; 01's
  three residual poster references were the last ghost and are deleted per its final revision.
- **Approved by:** Project Manager
- **Affected files:** `01-creative-direction.md` §5.2/§7.6/§8.4, `02-technical-architecture.md` §7.2,
  `04-asset-pipeline.md` §9.3

## D-014 — Converged joint rulings, recorded formally
- **Date:** 2026-07-01
- **Decision:** The following, already identical across the documents that share them, are now on
  the record: (a) **Label policy** — a part is named when it arrives (in-ramp at the
  `a + 0.47 × (b − a)` eased-travel anchor), one active label at a time with the active→settled
  demotion, group exit at 0.862–0.877 (01 §7.5 = 03 §7.4, joint text). (b) **Fallback stills** —
  exactly five, at p = 0.000 / 0.160 / 0.633 / 0.743 / 1.000, rendered from the production model
  and lighting per 04 §9 (never AI composites, never the legacy reference slices). (c) **No footer
  block** — the page ends on the CTA and the sign-off line; the scene container is the document's
  last element (01 §5.4 = 03 §9.3). (d) **No progress bar** — the machine's state of disassembly is
  the progress indicator; 01 §7.4's hairline contingency stays unbuilt unless a future entry
  activates it.
- **Reason:** Round 3 verified all four as healed seams; recording them prevents regression and
  gives the master specification citable anchors.
- **Approved by:** Project Manager
- **Affected files:** none (recording of converged state)

## D-015 — Battery ruling: ships seated and named, never moves
- **Date:** 2026-07-01
- **Decision:** The model ships `chassis_battery` (04 §6.1), non-separating, seated in the Chassis
  for the whole timeline. The PM **activates the seated, label-only variant**: `label.battery`
  ("BATTERY") enters alongside `label.chassis` at 0.797 — two parts that never leave, named
  together — and joins the B8 diagram and the fallback-still captions. Label inventory becomes
  **9 labels, 14 words**; no copy card is added. The lifted-battery variant (reserve card "The
  battery. One job, and it takes the most room.", track extension to 1300vh desktop / 1700vh
  mobile, 04 re-export) is **declined** and stays pre-priced in 03 §14 / 01 §8 reserve copy.
- **Reason:** Honesty: anyone who has opened a laptop knows the battery is the biggest thing in it;
  a teardown that never names it reads false (Framework-honesty, references §3). The seated variant
  costs zero timeline and no card. The lifted variant is declined because the chassis beat's copy
  ("asks for no credit") already owns the quiet-parts moment, and a ninth moving part would dilute
  the one-lift-per-beat grammar for no new story sentence.
- **Approved by:** Project Manager
- **Affected files:** `01-creative-direction.md` §7.5/§8 (label list + word budget),
  `03-animation-storyboard.md` §3 (label in-point 0.797, B8 diagram), `04-asset-pipeline.md` §6.1
  (already ships the node)

## D-016 — Copper heat pipes: the flagged deviation from the reference is approved
- **Date:** 2026-07-01
- **Decision:** Heat Pipes render as raw copper (04 §4 row 4: `#c87d52`, metallic 1.0, roughness
  0.32), deviating from the reference render's dark/taped pipe. `copy.B3`'s "copper heat pipes"
  stands; 01's staged fallback sentence for a non-copper pipe is retired.
- **Reason:** The vision names copper as the warm accent that must exist *in the scene*; raw-copper
  pipes are equally common in real ultrabooks, and D-005 makes the reference art advisory. 01 §8.5.2
  and 04 §4 flag the identical deviation with the identical reasoning — this entry settles it.
- **Approved by:** Project Manager
- **Affected files:** `01-creative-direction.md` §8.5, `04-asset-pipeline.md` §4

## D-017 — Closing line adopted; flagged for owner sign-off before implementation
- **Date:** 2026-07-01
- **Decision:** The closing line "Websites are complicated." / "You've seen how we treat
  complicated." is adopted for the documentation round. Because it deliberately echoes the owner's
  homepage headline, the owner signs off on it (and on the page title "Engineering") before
  implementation begins. If the owner rewrites it, a superseding entry records the new line and 03
  §7.2's floor re-runs.
- **Reason:** The echo is the page's thesis landing where it started — but the headline is the
  owner's voice, and reusing it is the owner's call, not the studio's.
- **Approved by:** Project Manager (owner sign-off pending)
- **Affected files:** `01-creative-direction.md` §8, `03-animation-storyboard.md` §7.1
