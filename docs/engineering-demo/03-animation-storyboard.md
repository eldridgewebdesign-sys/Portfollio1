# Engineering Demo — Animation Storyboard (`03-animation-storyboard.md`)

> Owned by the **Animation Director**. This document owns TIME: the scroll timeline, the camera
> choreography, and the motion language for `/engineering`. Every range, curve, and distance below is
> final for the documentation round; a builder should implement from this document without asking a
> question. The visitor's scroll position **is** the timeline — fully reversible, no drift, no autoplay
> (vision §1, §5).
>
> **Revision 5 (2026-07-01) — citation pass against the recorded rulings, plus a header repair.**
> The round-3 revision agent failed mid-edit: it rewrote this header block toward the retired
> variant (an eight-card deck with `copy.B1` deleted, a centered 50vw arrival with the title at
> 16vh, a 0.000–0.160 re-partition back to `B2 = 0.075`) while the document's body was never
> edited to match — the header contradicted the body it introduced. The PM has since recorded the
> referee rulings (`decisions.md` **D-009 – D-017**), and they ratify **this document's body as it
> stands**: the six merged teardown cards with **`copy.B1` shipping** (§7.1 = the D-009 table of
> record, cell for cell), and the **62vw pure-dolly opening** — `P0` at 4.15W / +22°, B1
> 0.000–0.105, Lid window 0.105–0.145, B1/B2 boundary **0.105** (D-010; the 50vw re-composition
> variant is retired on the record there, its full design preserved in `review-report.md` round 2).
> No body timing changed in this revision — every boundary is byte-identical to revision 3, so
> 02's `B2 = 0.105` and 04's five still addresses remain valid. Changes in this pass: this header
> repaired to describe the body truthfully; every "queued ruling" hedge replaced with its entry
> number (D-009 §7.1/§11/§14 · D-010 §4/§5.2/§8/§13/§14 · D-014a §7.4 · D-014b §11/§14 · D-014c
> §9.3 · D-014d §7.1/§7.6 · D-017 §7.1); §11's `R0` row corrected to pair `copy.B0` alone — the
> only copy live at `p = 0.000` (`copy.B1` enters at 0.040, §4-B1); and **D-015's seated battery
> label activated** — `label.battery` enters alongside `label.chassis` at 0.797, sharing its
> stagger slot (zero retiming, exactly as pre-priced), label inventory now 9 labels / 14 words
> (§3, §4-B6/B7/B8, §7.1, §7.2, §7.4, §11, §12, §14; the lifted variant stays declined and
> pre-priced in §14).
>
> **Revision 6 (2026-07-01) — additive coverage pass: the optics and lighting nulls, stated
> explicitly.** Two subsections added — **§5.5** (depth of field, focus, and lens effects, plus the
> hero frames) and **§6.4** (lighting over the timeline) — documenting decisions the approved
> design already implies but never states in one place: the frame carries no depth-of-field or
> lens treatment, and no lighting property is a function of `p`. An animator rebuilding the page
> should read those facts, not deduce them. **Nothing existing changed:** every range, curve,
> distance, window, and word of revision 5 is untouched; the new subsections schedule no event and
> introduce no element (01 §7.1's inventory is unchanged). Both are written as consumed policy,
> citing their owners (01 §1/§5/§6/§9/§10, 02 §3.1/§3.4/§4.3/§9.2/§11.1, 04 §9.2, 05 §14.3(c),
> D-012/D-014b), and both name the two runtime mechanisms — 02 §9.2's adaptive governor and
> 02 §11.1's HDR fallback — that bound the constancy claims, so the claims stay true as written.
> Per the round-5 precedent (changed text is changed text), this addendum re-opens the document
> for a same-rigor verification pass and is flagged for the Reviewer. 05 inherits no number
> change — the additions state nulls 05 already implements by construction.
>
> Cross-document contract: this document defines **beat numbering and normalized scroll ranges** — the
> other three specialists reference beats by number or by the generic names *opening* (B0–B1),
> *teardown* (B2–B6), and *ending* (B7–B8). The Creative Director owns every on-page word and all
> visual/composition grammar (I reference copy slots and cite 01's specs; I set only timing). The
> Technical Architect owns global budgets and the scrub implementation (I state requirements on it in
> §10). The Asset Director owns node/file naming and dimensions (I use only the PM's component canon
> in prose: Lid, Cooling Fan, Heat Pipes, Storage (SSD), Memory (RAM), Support Boards, Mainboard,
> Chassis — and consume 04 §3.1's measured sizes).

---

## Table of contents

1. [Units, constants, and total scroll length](#1-units-constants-and-total-scroll-length)
2. [Story structure — the beat list](#2-story-structure--the-beat-list)
3. [The master timeline table](#3-the-master-timeline-table)
4. [Per-beat detail](#4-per-beat-detail)
5. [Camera choreography grammar](#5-camera-choreography-grammar)
6. [Motion language](#6-motion-language)
7. [Text timing rules](#7-text-timing-rules)
8. [Opening sequence (B0–B1, expanded)](#8-opening-sequence-b0b1-expanded)
9. [Ending sequence (B7–B8, expanded)](#9-ending-sequence-b7b8-expanded)
10. [Scrub and rewind behavior](#10-scrub-and-rewind-behavior)
11. [Reduced-motion storyboard](#11-reduced-motion-storyboard)
12. [Mobile pacing adjustments](#12-mobile-pacing-adjustments)
13. [The purpose audit](#13-the-purpose-audit)
14. [Requirements this document places on the other documents](#14-requirements-this-document-places-on-the-other-documents)

---

## 1. Units, constants, and total scroll length

**Progress `p`.** The whole sequence maps to normalized progress `p ∈ [0.00, 1.00]`, computed from the
scroll offset through the pinned scene, exactly as the predecessor's `seg(p, start, end)` windows did
(`Animations/laptop-teardown/README.txt` — the proven precedent). Every animated property on the page
is a **pure function of smoothed `p`** (see §10). Nothing owns its own clock except the three items
explicitly exempted in §8 (loader handoff, scroll-cue fades, CTA hover) — all UI, never scene.

**Subject unit `W`.** All part travel and camera distances are expressed in `W` = the laptop's width
along its hinge (its longest dimension). Reason: the Asset Director owns the model's absolute scale;
distances in `W` survive any re-export unchanged. The published values (04 §3.1, consumed here as the
source of truth): **W = 0.304 m**, front-to-back depth 212 mm = **0.697W**, closed height 15.6 mm =
0.051W, Lid thickness 6.6 mm = 0.022W. The 0.697W depth figure is load-bearing for the finale spacing
math in §9.1.

**Total scroll length: 1200vh of scroll travel inside a 1300vh scene container** (1300 = 1200 of
travel + the 100vh fixed stage — same structure as the predecessor; mobile figures in §12: 1600vh
travel, 1700vh container). The pacing math, not vibes:

- Reference viewport for all px figures in this document: **1440 × 900** (a mid-range laptop).
  1200vh × 900px = **10,800px** of travel. So **0.01 of progress = 108px = 12vh**.
- The timeline holds 9 beats, **7 deliberate holds** (H1–H7, §3), 5 camera moves, 11 part-travel
  windows, and 6 beat cards (plus the arrival and closing blocks). The shortest standalone window is
  0.015 (≈162px) — below ~150px a wheel user crosses an event in two detents and it reads as a cut,
  not a movement. (Intra-group ramps — the B8 label re-entry staggers at 0.006 — are members of one
  larger 0.027 group event, not standalone events, so the floor does not apply to them.) 10,800px is
  the length at which every standalone event clears that floor while carrying six
  reading-floor-compliant beat cards (§7.2) and the designed silences (H4, H7), keeping the average
  beat ≈ 1.3 viewport-heights — the Apple product-page chapter rhythm (references §2: one idea per
  viewport, then hand off).
- Target engaged pass: **60–90 seconds** → an average scroll rate of 120–180px/s. Every text-timing
  guarantee in §7 is computed against that rate.
- Longer would pad (vision: padding is as bad as thinness); shorter breaks the §7 reading floors.

**Named easing curves** (referenced throughout; rationale in §5–§7):

| Name | cubic-bezier | Used for | Character |
|---|---|---|---|
| `CAM` | `(0.45, 0.00, 0.25, 1.00)` | all camera moves | fluid tripod head: symmetric ease-in-out, no whip |
| `LIFT` | `(0.30, 0.00, 0.12, 1.00)` | all part travel | machined rails: decisive break from rest, long asymptotic settle, **zero overshoot** |
| `TXT-IN` | `(0.16, 1.00, 0.30, 1.00)` | text entrances | the live site's house reveal curve (`index.html` `.rv`) — `/engineering` must feel native |
| `TXT-OUT` | `linear` | text exits | exits should be unnoticeable; any curve draws the eye to a departure |

Curves apply to segment-local progress: for a window `[a, b]`, the eased value is
`curve((p − a) / (b − a))` clamped to `[0, 1]` — identical math scrubbing forward and backward.

**The arrival anchor (used for all label and card in-points).** A part is named when it *arrives*
(§7.4). "Arrives" = the `p` at which the part has covered **80% of its eased travel**. Solving the
`LIFT` bezier: `y(u) = 3u² − 2u³ = 0.80` gives `u ≈ 0.715`, and `x(0.715) ≈ 0.47` — so for a part
window `[a, b]`, the anchor is **`a + 0.47 × (b − a)`**. Every label/card in-point in §3 is computed
from this one formula; no anchor is eyeballed.

---

## 2. Story structure — the beat list

The narrative spine is the homepage promise dramatized: *complexity, handled* (vision §2). The beat
order is the iFixit-honest disassembly order (references §4): Lid off first, then the thermal/component
layer, then Mainboard, then Chassis. One deliberate sub-ordering inside the component layer, justified
at B3–B5: the thermal module (Cooling Fan + Heat Pipes) comes off before Storage and Memory, and the
Support Boards come last — that is the order a real technician works in (the thermal module screws
down over the board first; edge boards unplug last), so hardware-literate visitors see a true
sequence and everyone else feels the rhythm of competence.

| Beat | Name | Range | One-line purpose |
|---|---|---|---|
| **B0** | Arrival | state at `p = 0.00` | Stillness. One closed machine, warm light, almost no UI — "this is different." |
| **B1** | The first inch | 0.000 – 0.105 | The first scroll visibly moves the scene: camera approaches, title steps aside — then `copy.B1` says the contract out loud, once. *You drive.* |
| **B2** | Lid | 0.105 – 0.160 | The cover comes off. The intimidating sealed object becomes an open one. First proof of "we know what's inside." |
| **B3** | Cooling Fan + Heat Pipes | 0.160 – 0.343 | The thermal module lifts, read low and in profile — the machine's plumbing, named plainly, one label per part. |
| **B4** | Storage + Memory | 0.343 – 0.569 | The two parts every owner has heard of, seen from above where their sockets read as a map. Recognition beat: the visitor feels smarter. |
| **B5** | Support Boards | 0.569 – 0.648 | The small unglamorous boards get named too — thoroughness is the message. |
| **B6** | Mainboard + Chassis | 0.648 – 0.865 | The core lifts off the Chassis; then the Chassis — the one part that never moves — is named last, sitting still. |
| **B7** | The spread | 0.865 – 0.928 | Camera steps back as every layer glides to its final rank — the exhale; parts to planes. |
| **B8** | The tableau | 0.928 – 1.000 | Everything on the mat, labeled. Held silence, then the closing line, the single CTA, and the sign-off. Trust. |

Generic mapping for the other documents: **opening = B0–B1 · teardown = B2–B6 · ending = B7–B8.**

Beat numbers are documentation identifiers only. **They never appear on screen** (D-006: the owner has
rejected numbered "01/02" eyebrow labels as AI-looking).

---

## 3. The master timeline table

Column key — *Camera*: position names defined in §5.2. *Parts*: canon names; transforms are vertical
deltas from assembled rest position, in `W`, pure translation (no rotation — §6.1). *Text*: slot IDs
(wording per the shared table in §7.1 — the Creative Director's, verbatim). *Hold*: deliberate
scene-still range (camera and parts both at rest; text may enter/exit inside a hold — reading is what
holds are for). px figures are at the 1440×900 reference viewport.

| # | Range (p) | ≈px | Camera (curve `CAM`) | Parts (curve `LIFT`) | Text (curves `TXT-IN`/`TXT-OUT`) | Hold |
|---|---|---|---|---|---|---|
| B0 | 0.000 (state) | 0 | at `P0` | all assembled, still | `copy.B0` (title + subline, 01 §5.2 composition) visible; `cue.scroll` after 2400ms idle (§8) | — until first scroll |
| B1 | 0.000–0.105 | 0–1134 | `P0 → P1` dolly 0.000–0.050: why — walk toward the workbench; first-scroll response is camera, subject untouched, so the machine's stillness survives the first gesture. A pure dolly: azimuth, elevation, and the 62vw subject center (01 §5.2) are all held — only distance moves (§5.2) | none | `copy.B0` exits 0.000–0.040 (rise 30px, opacity → 0 — the one visible exit, §7.3); `copy.B1` in 0.040–0.055, **full 0.055–0.105**, out 0.105–0.120 (out-ramp overlaps the Lid's first 0.015 — §7.3) | **H1** 0.050–0.105 (0.055) |
| B2 | 0.105–0.160 | 1134–1728 | holds at `P1`: why — the first part move must own the frame alone | **Lid** +0.50W, window 0.105–0.145 | `label.lid` in 0.124–0.139; `copy.B2` in 0.124–0.139, **full 0.139–0.189**, out 0.189–0.204 (straddles into B3's camera window — cards may persist through camera windows, §7.3) | **H2** 0.145–0.160 (0.015) |
| B3 | 0.160–0.343 | 1728–3704 | `P1 → P2` drop low, 0.160–0.205 (runs under `copy.B2`'s tail — §7.3 persistence rule): why — Heat Pipes are best read in profile; a low lens reads *mechanism* | **Cooling Fan + Heat Pipes** (two sibling nodes, one shared transform — §6.1) +0.28W, window 0.205–0.275 | `label.fan` in 0.238–0.253; `label.pipes` in 0.250–0.265; `copy.B3` in 0.238–0.253, **full 0.253–0.308**, out 0.308–0.323 | **H3** 0.275–0.343 (0.068) |
| B4 | 0.343–0.569 | 3704–6145 | `P2 → P3` rise high, 0.343–0.388 (card-free — `copy.B3` clears at 0.323): why — sockets and slots read as a map from above; a high lens reads *layout* | **Storage (SSD)** +0.28W, 0.388–0.433; **Memory (RAM)** +0.28W, 0.400–0.445 (stagger §6.2) | `label.storage` in 0.409–0.424; `label.memory` in 0.421–0.436; `copy.B4` in 0.421–0.436, **full 0.436–0.491**, out 0.491–0.506 | **H4** 0.445–0.569 (0.124) |
| B5 | 0.569–0.648 | 6145–6998 | holds at `P3`: why — same layout question, same lens; a camera move here would be decoration | **Support Boards** ×3, +0.28W each; starts 0.569 / 0.581 / 0.593, each window 0.040 (ends 0.609/0.621/0.633) | `label.support` (one group label) in 0.612–0.627; `copy.B5` in 0.612–0.627, **full 0.627–0.677** (straddles into B6), out 0.677–0.692 | **H5** 0.633–0.648 (0.015) |
| B6 | 0.648–0.865 | 6998–9342 | `P3 → P4` descend to mid, 0.648–0.693 (runs under `copy.B5`): why — the separation gap between Mainboard and Chassis only reads at mid height | **Mainboard** +0.14W, window 0.693–0.743 | `label.mainboard` in 0.717–0.732; `copy.B6` in 0.717–0.732, **full 0.732–0.862**, out 0.862–0.877; `label.chassis` + `label.battery` in 0.797–0.812, one shared slot (D-015; named while they sit, as the card's second clause becomes literal on screen) | **H6** 0.743–0.865 (0.122) |
| B7 | 0.865–0.928 | 9342–10022 | `P4 → P5` pull back + rise, 0.865–0.928 (the lateral look-at offset eases to zero across the same window, re-centering the stack to 50vw — 01 §5.4): why — the subject is no longer one part but the whole constellation; the retreat and the spread are one exhale (sanctioned dual-mover exception, §5.4) | all planes glide to final ranks (§9.1): Mainboard → +0.36W (0.865–0.910); components plane → +0.72W (0.872–0.916); Lid → +1.08W (0.879–0.922); Chassis stays 0 | all 9 labels out 0.862–0.877 (BATTERY rides the Chassis slot — D-015), concurrent with `copy.B6` out — one clearing gesture as the finale begins (§7.4) | — (the beat is one continuous gesture) |
| B8 | 0.928–1.000 | 10022–10800 | holds at `P5` for the whole beat, 0.928–1.000 (subject at 50vw — 01 §5.4): why — the destination earns stillness. The 0.928–0.930 sliver before the label re-entry is the first breath of this hold: the finale's arrival lands on a still frame before the diagram assembles | none — nothing moves again | 9 labels re-enter in 8 stagger slots 0.930–0.957 (BATTERY alongside CHASSIS in one slot — D-015; stagger 0.003, ramps 0.006, top→bottom); **silence 0.957–0.973**; `copy.close` in 0.973–0.986; `copy.cta` in 0.988–0.998 (clickable ≥ 0.992); `copy.signoff` in 0.992–1.000 | **H7 (silence)** 0.957–0.973 (0.016); terminal rest at 1.000 |

**The six card windows, verified against the §7.2 reading floor** (fully visible = in-ramp end →
out-ramp start; per-card floors re-run against 01 §8.2's final word counts in §7.2):

| Card | Words | Fully visible | Width | Floor | Verdict |
|---|---|---|---|---|---|
| `copy.B1` | 10 | 0.055 → 0.105 | 0.050 | 0.050 | ✓ |
| `copy.B2` | 8 | 0.139 → 0.189 | 0.050 | 0.050 | ✓ |
| `copy.B3` | 12 | 0.253 → 0.308 | 0.055 | 0.055 | ✓ |
| `copy.B4` | 11 | 0.436 → 0.491 | 0.055 | 0.055 | ✓ |
| `copy.B5` | 10 | 0.627 → 0.677 | 0.050 | 0.050 | ✓ |
| `copy.B6` | 12 | 0.732 → 0.862 | 0.130 | 0.055 | ✓ |

(`copy.B6` runs long deliberately: it is the only card in H6's 0.122 of stillness, it carries two
clauses — the lift and the stay — and holding it to 0.862 lets its exit join the label group exit as
one clearing gesture, §4-B7.)

**Continuity checks, re-verified against this table** (a builder should re-run all four):

1. **No camera window overlaps a part window** except B7 (the one sanctioned exception). Boundary
   cases abut exactly: B1 camera ends 0.050, first part starts 0.105; B3 camera ends 0.205 = thermal
   start; B4 camera ends 0.388 = Storage start; B6 camera ends 0.693 = Mainboard start.
2. **Maximum one copy card at any `p`.** `copy.B0`-out ends 0.040 = `copy.B1`-in start (exact
   abutment); every other adjacent pair has a clear gap (B1→B2 0.004, B2→B3 0.034, B3→B4 0.098,
   B4→B5 0.106, B5→B6 0.025, B6→close 0.096).
3. **The timeline is a partition — no unowned gaps.** Every `p` in [0,1] belongs to a named camera
   window, part window, or hold: B1 = camera 0.000–0.050 + H1 0.050–0.105 · B2 = Lid 0.105–0.145 +
   H2 · B3 = camera + thermal + H3 · B4 = camera + Storage/Memory 0.388–0.445 + H4 · B5 = boards
   0.569–0.633 + H5 · B6 = camera + Mainboard + H6 · B7 = the dual-mover window 0.865–0.928 · B8 =
   the `P5` hold 0.928–1.000, **explicitly including the 0.928–0.930 sliver** before the label
   re-entry (text events live inside holds; they do not break the partition).
4. **The Chassis never moves at any `p`** (§6.1 — the foundation stays put; every measurement on the
   page is taken from it).

---

## 4. Per-beat detail

### B0 — Arrival (state at p = 0.00)
Closed laptop (the `closed.png` three-quarter attitude) resting on the ground plane, framed from `P0`.
Composition is the Creative Director's arrival spec, consumed verbatim (01 §5.2, the D-010 arrival): the
machine sits right of center — subject center at ≈ 62vw, silhouette ≈ 38% of frame width (`P0`'s
distance is solved for exactly that figure, §5.2 — apparent size is the camera's, as 01 defers it);
`copy.B0` (title + subline) owns the left negative space, left-aligned in the word column (left edge
7vw, max-width 33vw), block vertically centered at 50vh — the same column every beat card uses, so
when the title exits, the cards arrive where the eye already is (01 §5.2). Scroll cue slot
bottom-center, 5vh above the bottom edge (§8). Site nav present — **logo only, tinted `--ink`,
linking home; there is no Sign In link on this page** (01 §2.2/§7.2; inventory is 01's closed list,
§7.1 there). No other UI. Full detail in §8.

### B1 — The first inch (0.000–0.105)
Camera translates along its view ray `P0 → P1` over 0.000–0.050 — a **pure dolly**: distance
4.15W → 2.90W, azimuth (+24°) and elevation (+22°) fixed, and the lateral look-at offset recomputed
per frame from the live distance so the subject's screen center holds at 62vw throughout (§5.2).
The round-2 50→62vw reframe is **retired on the record with the 50vw variant (D-010)**: 01 §5.2
places the arrival at 62vw already, so there is nothing to reframe — the dolly changes exactly one
thing (proximity), literally.
Why a dolly and not an orbit: the first move must be legible in 50px of scroll; an approach cannot
disorient, and it is the walk-up the beat's story needs. `copy.B0` exits upward (30px rise,
opacity → 0 over 0.000–0.040, `LIFT` for the rise, linear fade) — it steps aside because the machine
is about to speak, clearing the word column a beat before the camera settles, and the visible exit
doubles as the page's first reversibility lesson: scroll back and the title walks back in. Then the
page's one sentence about itself: **`copy.B1`** ("that was you" — wording 01 §8.2's, §7.1) takes the
vacated column at 0.040–0.055 and reads at full opacity over 0.055–0.105 — timed so the card that
says *this page only moves when you do* is itself read over a dead-still frame, proving its own
sentence. `copy.B1` is the one card with no part to anchor to (§7.3 states the exception): its
in-point is the dolly's settle, not an arrival anchor. H1 (0.050–0.105): the machine framed at
working distance, motionless — the visitor's first proof that *stop scrolling = the page is still*.

### B2 — Lid (0.105–0.160)
The **Lid** translates +0.50W straight up, window 0.105–0.145, curve `LIFT`, no rotation. Why +0.50W:
travel = 152 mm ≈ **23× the Lid's own 6.6 mm thickness** (04 §3.1) — unmistakably *removed*, not
ajar — while staying inside `P1`'s frame with ≈ 18% headroom (worked fit in §5.2). Why no tilt: a
tilt implies a wrist twisting it; there is no technician here — the machine takes itself apart
(references §4, what NOT to copy from iFixit). Why a 0.040 window (432px ≈ 2.4–3.6s at engaged
pace): the first part move should read as one clean, confident stroke — still 2.7× the standalone
event floor, and the width B1's reading floor releases to it. `label.lid` and `copy.B2` enter
together at the arrival anchor 0.124 (= 0.105 + 0.47 × 0.040, §1) — the part is named as it arrives,
and the card reads through the Lid's long settle, the H2 breath, and into B3's camera window (§7.3
persistence). H2 (0.145–0.160) is a deliberate 0.015 breath: the open machine held still before the
lens moves. The camera does not move for the whole beat.

### B3 — Cooling Fan + Heat Pipes (0.160–0.343)
Camera first: `P1 → P2` over 0.160–0.205 (azimuth +24° → +38°, elevation +22° → +9°, distance
2.90W → 2.95W, target rises to the thermal plane at +0.10W), running under `copy.B2`'s tail — the
reader finishes the lid sentence while the lens walks (§7.3). The stated reason, which is the vision's
own worked example (§9): *we go low — and as close as the word column allows (§5.2's quiet-zone bound
caps approach at 2.95W) — because the heat pipes are best read in profile*: their rise off the
Mainboard is invisible from above, and at +9° elevation the profile is the whole frame. Then the
part: the **Cooling Fan + Heat Pipes move as one rigid gesture** (+0.28W, 0.205–0.275). 04 §2.1
builds them as two sibling nodes (`cooling_fan`, `heat_pipes`); the storyboard drives both with one
shared transform — rigid in motion because they are physically one screwed-together module;
splitting their travel would be a lie about the hardware. One card, two names: `copy.B3` (01 §8.2's
merged sentence, §7.1) enters at the module's arrival anchor 0.238 and carries both parts in one
breath — the sentence structure matches the motion structure (one lift, one card), while the two
labels still name each part individually (`label.fan` 0.238, `label.pipes` 0.250 — per-part naming
is the labels' job, §7.4). H3 (0.275–0.343) holds the module high while the sentence does its work,
with 0.020 of silent tail after the card releases.

### B4 — Storage + Memory (0.343–0.569)
Camera rises `P2 → P3` (elevation +9° → +48°, azimuth +38° → +30°, distance 2.95W held, target the
components plane at +0.14W) over 0.343–0.388 — a card-free window (`copy.B3` clears at 0.323).
Reason: **Storage (SSD)** and **Memory (RAM)** are flat sticks in slots — from a low lens they are
edge-on slivers; from +48° their slots, and the empty sockets they leave behind, read like a floor
plan. Same working distance, opposite height: the meaning change is entirely angular (§5.2's
vocabulary). Storage lifts first (0.388–0.433), Memory follows at +0.012 stagger (0.400–0.445), both
+0.28W — the stagger says *two parts, one family* (§6.2) without ever moving in lockstep like a
copy-paste. Labels name each part at its own arrival (`label.storage` 0.409, `label.memory` 0.421);
the single card `copy.B4` (01 §8.2's merged sentence) enters at 0.421 — the anchor computed on the
*last* member of the family, the same rule B5 uses for its group, so the pair is captioned only once
the whole family has arrived. These are the two components a small-business owner has actually heard
of — this beat is deliberately placed mid-story as the recognition payoff (vision §4: curiosity →
understanding). H4 (0.445–0.569) is the longest hold on the page: the sentence reads over a settled
scene, then 0.063 of designed mid-story silence — the exhale after recognition, placed at the
story's midpoint before the final act.

### B5 — Support Boards (0.569–0.648)
No camera move — the same top-down layout question is being answered, so the same lens keeps answering
it; a move here would be motion for its own sake (vision §9, rejected on sight). The three **Support
Boards** lift +0.28W with 0.012 staggered starts in left-to-right physical order (§6.2), windows 0.040
each. One group label and one card (`label.support` / `copy.B5` at 0.612 — the anchor computed on
the *last* board, 0.593 + 0.47 × 0.040, so the group is named only when all of it has arrived), not
three — iFixit-grade density is for repairers; one name per idea is for this story (references §4).
04 §2.1 fixes the count at 3 (`support_board_io/wireless/aux`); if a future inventory changes it to
`n`, the stagger rule generalizes: starts at `0.569 + 0.012k`, window 0.040 each, and if `n > 4` the
offsets compress so the group still completes by 0.633 (the H5 boundary is load-bearing for §7
timing). H5 (0.633–0.648): a 0.015 breath before the lens moves.

### B6 — Mainboard + Chassis (0.648–0.865)
Camera descends `P3 → P4` (elevation +48° → +24°, azimuth +30° → +24°, distance 2.95W → 2.90W, target
the board/chassis gap at +0.11W) over 0.648–0.693, under `copy.B5`'s tail — the gap that is about
to open between **Mainboard** and **Chassis** is a vertical event and needs a near-horizontal lens to
read. The Mainboard lifts **+0.14W** (0.693–0.743): deliberately less than the components' +0.28W so
it hangs *below* the parts that came off it — the true spatial story (they were mounted on it) — with
a measured ≈ 0.13W clearance to the lifted components (board rest plane +0.023W per 04 §2.3, board
top after travel ≈ +0.18W vs component bellies at ≈ +0.31W). One card carries the whole beat:
`copy.B6` (01 §8.2's merged sentence — the lift *and* the stay; the Chassis line is re-homed here by
01's own ruling, a better address than a slot that never existed) enters at the 0.717 anchor and
holds to 0.862, the longest-lived card on the page, because its second clause must be read while the
visitor is looking at exactly that — the emptied foundation still carrying the frame. The beat's
second naming happens with no motion at all: `label.chassis` enters at 0.797, mid-card — and
`label.battery` beside it in the same slot (D-015: two parts that never leave, named together) —
pinning the parts that never move while the card's words say so. The card's exit (0.862–0.877) then joins
the label group exit as one gesture (§4-B7). H6 (0.743–0.865) hosts the reading over a settled scene.

### B7 — The spread (0.865–0.928)
All nine labels exit at 0.862–0.877 (beginning in H6's final sliver), concurrent with `copy.B6`'s
out-ramp — one clearing gesture: during the pull-back everything on screen is in motion and labels
tracking moving anchors read as noise; the diagram will re-assemble fresh on arrival. Then the one
sanctioned dual-mover gesture (§5.4): the camera retreats `P4 → P5` (0.865–0.928), easing the lateral
look-at offset to zero so the stack re-centers from 62vw to 50vw (01 §5.4 — the re-centering and the
retreat are one gesture), while every layer glides to its final rank
(staggered bottom-to-top, 0.007 offsets: Mainboard 0.865–0.910 → +0.36W; the components plane as one
group 0.872–0.916 → +0.72W; Lid 0.879–0.922 → +1.08W; Chassis stays 0). The three arrivals land at
0.910 / 0.916 / 0.922 — inside a 0.012 span, a chord, not an arpeggio. Spacing math in §9.1.

### B8 — The tableau (0.928–1.000)
The beat is one `P5` hold, 0.928–1.000 — the 0.928–0.930 sliver before anything enters is the hold's
first breath, so the finale's arrival lands on a still frame before the diagram assembles (and
continuity check 3's partition claim is literal). Labels re-enter 0.930–0.957 (stagger 0.003 per slot, ramps 0.006, top-of-stack first: Lid →
Cooling Fan → Heat Pipes → Storage → Memory → Support Boards → Mainboard → Chassis + Battery, the
one shared slot — nine labels in eight slots, D-015). Then the **held
silence** 0.957–0.973: nothing moves, nothing enters, nothing exits — 173px of scroll, ≈ 1.0–1.4s at
engaged pace, the "everything on the mat" breath (references §4). `copy.close` rises in at
0.973–0.986; `copy.cta` (the single CTA — `.btn-sand` verbatim per 01 §7.7) at 0.988–0.998, clickable
from 0.992; `copy.signoff` (01's sign-off microtext, the closing block's third element per 01 §5.4)
at 0.992–1.000. At `p = 1.000` the scene rests indefinitely. Full detail and page-end behavior in §9.

---

## 5. Camera choreography grammar

### 5.1 The lens
One camera, vertical FOV **24°** (≈ 55mm full-frame equivalent), fixed for the entire page. Reason:
the 50–85mm range is product-photography grammar — mild perspective compression keeps the laptop's
rectangles rectangular; a wide lens would bow the very edges whose machined straightness is the point.
FOV never animates: a focal-length change mid-move is a music-video tic, not a documentary one (the
single portrait exception is §12's 24° → 30° layout widening — a responsive layout rule, never a
scroll-driven animation). The camera **up vector is world-vertical at all times** (no roll): tripods
do not roll, and a level horizon is what "calm is confidence" looks like in camera terms (vision §3).

### 5.2 Named positions
Spherical coordinates about the scene origin (center of the Chassis footprint at ground level — 04's
`laptop_root` origin). Azimuth 0° faces the laptop's front edge (+Z per 04 §2.2); positive = toward
its left side — the `closed.png` three-quarter attitude. The camera **never crosses to azimuth < 0°**:
one side of the line for the whole film (spatial continuity — re-orienting the visitor costs
comprehension and buys nothing).

| Name | Azimuth | Elevation | Distance | Look-at target | Subject center | Serves | Reads as |
|---|---|---|---|---|---|---|---|
| `P0` | +24° | +22° | 4.15W | machine center (+0.02W), lateral offset | 62vw (01 §5.2) | B0 | across the room: the object at rest |
| `P1` | +24° | +22° | 2.90W | machine center (+0.02W), lateral offset | 62vw (01 §5.3) | B1–B2 | working distance: the object as subject |
| `P2` | +38° | +9° | 2.95W | thermal plane (+0.10W), lateral offset | 62vw | B3 | low profile: **mechanism** |
| `P3` | +30° | +48° | 2.95W | components plane (+0.14W), lateral offset | 62vw | B4–B5 | high angle: **layout / map** |
| `P4` | +24° | +24° | 2.90W | board–chassis gap (+0.11W), lateral offset | 62vw | B6 | mid three-quarter: **separation** |
| `P5` | +24° | +26° | 3.00W | stack midpoint (+0.55W) | 50vw (01 §5.4) | B7–B8 | pulled back: **the whole, understood** |

**Distances are derived, not chosen by eye** (all figures at the 24° vFOV, 16:9 → half-frame-width
factor tan 20.7° = 0.378, so frame width at the look-at plane = 0.756 × distance; silhouette
horizontal extent computed at that plane as `W·cos(az) + 0.697W·sin(az)`, on 04 §3.1's dimensions):

- **`P0` solves 01 §5.2's arrival figure (the D-010 ruling)** — silhouette ≈ 38% of frame width. Extent at +24° =
  0.913W + 0.284W = 1.197W; d = 1.197 / (0.38 × 0.756) ≈ 4.17W → **4.15W** delivers 38.2%.
- **`P1`–`P4` solve two binding screen constraints:** (a) 01 §5.3's quiet zone (x ∈ [4vw, 34vw])
  must be clear of the silhouette whenever a card shows → at a 62vw center the silhouette must stay
  ≤ 55vw wide (left edge ≥ 34.5vw) → d ≥ extent / (0.55 × 0.756): at +24° (1.197W) d ≥ 2.88W →
  **2.90W** (`P1`/`P4`, 54.6vw); at +38°/+30° (1.217W/1.215W) d ≥ 2.93W → **2.95W** (`P2`/`P3`,
  ≈ 54.6vw). (b) 01 §5.1 forbids cropping at rest, and every teardown hold contains the Lid parked
  at +0.50W → vertical fit, worst case `P1`: half-frame-height = 2.90 × tan 12° = 0.617W vs the Lid
  top 0.502W above the look-at → **18.6% headroom** (the §4-B2 figure). Because the quiet zone caps
  the working width, distance is nearly constant through the teardown and **elevation is the
  expressive axis** — which is what the height vocabulary below already says.
- **`P5` solves the tableau** (§9.1's framing check, verified there: 14% vertical margin at 3.00W).
- These are the design values at 16:9, computed at the look-at plane; §12's fit rule (≥ 10% margins,
  `max(distance_vertical_fit, distance_horizontal_fit)`) is the binding check at any live viewport
  and absorbs the plane approximation's near-corner error.

**Subject-center rule (composition consumed from 01):** from `P0` through `P4` the subject's screen
center sits at 62vw ± 2vw (01 §5.2 arrival / §5.3 teardown), so 01 §5.3's quiet zone (x ∈ [4vw,
34vw], y ∈ [30vh, 70vh]) stays clear of the machine's silhouette whenever a card is at opacity > 0;
at `P5` the subject is centered at 50vw (01 §5.4), and the offset eases to zero during the B7
retreat — the re-centering and the pull-back are one gesture. Mechanism: a lateral look-at offset,
magnitude `0.12 × (2 · distance · tan(hFOV/2))` — the 12vw shift expressed in world units at each
position's distance (worked examples: `P0` 0.12 × 2 × 4.15W × tan 20.7° ≈ 0.376W; `P1` ≈ 0.263W).
During B1's dolly the offset is recomputed per frame from the live distance, so the 62vw center
holds while only proximity changes. The rule (62vw) is binding; the offset values follow from it at
whatever viewport is live.

Height/angle meanings are a fixed vocabulary (low = mechanism, high = layout, mid = identity and
separation, far = comprehension) so the visitor's eye learns the grammar by B4 and stops noticing the
camera at all — which is the goal.

### 5.3 Movement rules
1. **Single mover.** In any window, either the camera moves or a part moves — never both. When both
   would fight, the subject wins and the camera waits its turn (B2, B5 hold the camera entirely).
   The one exception is defined in §5.4. (Screen-fixed text is not a mover: cards may read while the
   lens walks — §7.3.)
2. **Camera moves precede part moves** within a beat: the lens gets into position, *then* the event
   happens. A documentary camera anticipates; it does not chase.
3. **Move budget:** exactly 5 camera moves on the whole page (B1, B3, B4, B6, B7). Each exists to
   change what a beat's motion *means* (§5.2 vocabulary); a sixth move was tried in B5 planning and
   cut because it answered no new question.
4. **Magnitude caps:** azimuth change ≤ 14° per move, elevation change ≤ 39° (the B4 rise — the
   largest, because the meaning-change is the largest), distance ratio per move ≤ 1.8×. Within these
   caps a `CAM`-eased move never reads as a whip at engaged scroll rates.
5. **Look-at discipline (single focal point):** the target is always on the component the current beat
   discusses, and moves only during camera windows, `CAM`-eased, in sync with the position — the eye
   and the feet travel together.
6. **Distance floors (contract with 04 §3.6):** no position or move brings the camera closer than
   80 mm to hero surfaces, 150 mm to aluminum bodies, 200 mm to the lid underside/support boards.
   The closest approach in this storyboard is `P1`/`P4` at 2.90W = 882 mm — 11× the tightest floor;
   the contract is stated so any future close-up change is checked against it, not discovered in QA.

### 5.4 The sanctioned exception (B7)
B7 moves camera and parts simultaneously — allowed because the single-mover rule exists to protect a
single focal point, and in B7 there is deliberately no single focal point left: the subject has become
the whole constellation. The retreat and the spread are one composed gesture (the exhale), and running
them sequentially was rejected because it read as two endings back to back.

### 5.5 Depth of field, focus, and lens effects

**Depth of field: none — deep focus at every `p`.** Every part of the scene is in focus at all
times, at every position `P0`–`P5` and every viewport. No depth-of-field, bokeh, rack-focus, or
focus-pull treatment exists on this timeline, and none may be added without review: 02 §3's
pipeline configures no composer and no passes — its frame loop draws the scene in a single
`render()` call (02 §3.4) — so no post stage exists to blur with, and this document schedules no
focus event. Three reasons, in order of weight:

1. **The page is a diagram-film.** Selective focus decides for the visitor what to look at; this
   page's contract is that the visitor reads at their own pace (§7.2/§7.5) and the frame stays
   honest wherever they look. Framework's diagram-grade clarity (references §3) is deep-focus
   grammar. Hierarchy comes from composition (one focal point per viewport — 01 §5.1), camera
   height (§5.2's vocabulary), and light (01 §6) — never from blurring the parts the visitor is
   not reading yet.
2. **Deep focus is the honest photographic read.** Bench and product documentary work is shot
   stopped well down so the whole subject stays sharp; the 55mm-equivalent lens (§5.1; 30° under
   §12's portrait refit) at these working distances belongs to that tradition. Wide-open shallow
   focus is portrait and advertising grammar — the keynote register this page refuses (01 §1).
3. **Text sits over the render.** Cards are screen-fixed UI and labels are screen-space type
   (§7.3); crisp type over a blurred scene reads as an overlay on a screenshot, not words in a
   room — and the page's whole fiction is one room. A full-screen focus pass is also exactly the
   per-pixel GPU cost 02 §3.1's transparent-canvas design exists to avoid.

**Lens effects: none.** No lens flares, vignettes, film grain, or god-rays (01 §9 rule 10), no
distortion shaders (01 §10), and — same class, refused here where the lens is specified — no
bloom, no chromatic aberration, no light leaks, no barrel or pincushion warp. No motion blur at
any scrub speed (§6.3, §10.3). The only image-level grade on the page is 02 §3.1's ACES filmic
tone mapping at a fixed exposure — an exposure decision, not an effect, and never a function of
`p` (05 §14.3(c) rules 1.05 the number of record; the Creative Director grades at integration,
and any change is a decision-log entry). Beside that grade sit only the sRGB output transform and
01 §6's exposure clamps — static correctness rules, not treatments. The 24° lens is the page's
whole optical personality: mild compression, rectangles kept rectangular (§5.1), and nothing
between the scene and the screen that edits what the light did.

**The hero frames.** The page's identity is its held compositions — the B0 arrival state and the
seven holds H1–H7 (§3) — not its transitions: the arrival at `P0` (the page's postcard, identical
to `R0` — 01 §5.2), the working distance and the opened lid at `P1`, the copper profile at `P2`,
the top-down map at `P3`, the opened core at `P4`, and the tableau at `P5` (the destination —
§3-B8; geometry §9.1). Five frames ship verbatim as the D-014b stills (`R0`–`R4` →
`P0`/`P1`/`P3`/`P4`/`P5`, §11); `P2` is the one camera position without a still — the D-014b
addresses were chosen for story states, and 01 §7.8 runs the thermal section on text alone
("text needs no placeholder"). A change to any held composition is an identity change and re-runs
its owners (§5.2 here; composition 01 §5).

---

## 6. Motion language

### 6.1 How parts move
- **Pure vertical translation.** Every part travels along the machine's normal axis (world +Y),
  `LIFT`-eased, **zero rotation at all times**. Reason: the exploded-view grammar (Framework,
  references §3) is parallel planes; rotation implies a hand twisting a part free, and this machine
  has no hands. This is also the strongest anti-slop guard available: nothing can "float" or "tumble."
  (04 §2.3 offers a hinge locator and a rotor spindle pivot as capabilities; this storyboard uses
  neither — capability offered is not motion owed.)
- **Rails character.** `LIFT` breaks from rest decisively (a fastener letting go) and settles on a
  long asymptotic tail. **No overshoot, no bounce-back, ever** — the settle is expressed by the
  curve's tail, not by crossing the target. Machined parts on rails do not wobble; a single pixel of
  overshoot reads as cartoon physics and forfeits the "photographed, not rendered" standard
  (vision §3.4).
- **The thermal module moves as one.** `cooling_fan` and `heat_pipes` (two sibling nodes, 04 §2.1)
  receive the identical transform in B3 and B7 — physically one screwed-together module; no
  re-parenting is required of the Asset Director.
- **The Chassis never moves.** `Δ = 0` at every `p`. It is the datum: the story's "foundation" line
  belongs to the Creative Director, but the animation enforces it literally. (04's non-separating
  `chassis_battery` rides inside it and likewise never moves — §14, battery.)
- **No scale, ever.** Apparent size changes come from camera distance only. A part that changes size
  is a rendering; a part that gets closer is a thing.

### 6.2 Stagger rules (within a component group)
- Offset between group members: **0.012 progress (≈130px)** — large enough to read as intent, small
  enough that the group stays one thought. (B7's spread uses 0.007 between *planes* — tighter,
  because the finale is one chord, not a family introduction.)
- Order follows physical position (B4: Storage before Memory, front slot first; B5: Support Boards
  left → right as seen from `P3`). Never random, never alphabetical: the stagger must be *learnable*
  from the screen — randomness is the signature of generated motion and is banned outright (§10.1).
- All members of a group share the same window length and the same curve — family resemblance is the
  message; only the start offsets differ.

### 6.3 What never happens (the ban list)
No bounce/elastic/spring overshoot · no teleporting (every state change is a continuous function of
`p`) · no rotation of any part · no spinning turntables or camera orbits-for-flavor · no motion blur
or speed lines · no parts crossing paths (travel is vertical-only, so crossings are geometrically
impossible) · no scale animation · no idle/breathing loops on the machine (stillness between events is
absolute — vision: "Nothing plays without them") · no camera roll · no FOV animation · no
per-session randomness in any timing or offset. Each entry exists because its opposite appears in
this year's award-site clichés (references §5) or in the vision's rejected-on-sight list (§9).

### 6.4 Lighting over the timeline — never a function of `p`

**No lighting event exists at any `p`.** The rig — 01 §6's one window key, 02 §4.3's room-bounce
fill and IBL term, and the D-012 ground shadow — enters this timeline as constants, not functions
of progress: §3 schedules camera, parts, and text, and nothing else; no light position,
intensity, color, or exposure value is tweened anywhere, and none may be added without a §3
re-issue. There is no per-beat relight, no exposure ramp, no dusk. The loader handoff performs no
light-up: the scene beneath the crossfade is already composed at `p = 0`, its ground shadow
already agreeing with the key (§8; the predecessor's README records fading the scene in as a
fixed mistake — and §13 row 24's "we only turned on the light" is the loader's story sentence, a
figure for the reveal, not a lighting event). Two runtime mechanisms sit outside this claim by
construction, named here so nobody rediscovers them as contradictions: 02 §9.2's adaptive
governor may step the shadow map down and, at its last rung, disable shadows on a struggling
device — performance degradation triggered by frame time, never by `p`, animating no light; and
02 §11.1's failure branch may substitute the coded room environment for a twice-failed HDR at the
same intensity. Neither is a lighting event; neither is schedulable from this timeline.

Everything that looks like lighting change is the parts and the camera moving through constant
light — and that is the design. Shadows stack as layers lift (01 §6: the shadow stack is how a
non-technical eye reads "this part came from above that part"); the Heat Pipes turn their one
warm glint toward the lens as B3 drops it low (01 §6's "one permitted piece of jewelry"); the
Memory's gold contacts read as small warm sparks at Memory (RAM) range (01 §6) — the range B4's
high lens delivers. This is also the honest construction of 01 §1's one poetic exception
("Nothing on this page moves unless the visitor moves it, except the light catching an edge"):
the window never moves, so light catches an edge only when the visitor moves the edge, or the
lens, through it; when the visitor stops, the page holds its breath and so does every glint. The
light is the scene's fixed witness — materials read as aluminum, copper, and board *because* the
light never changes its story ("light behaves like light", vision §7; "no effect on this page
glows without a source", 01 §1). A scheduled lighting change would also be a third kind of mover
— neither camera nor part — and the single-mover rule (§5.3) has no seat for it. The static
experience obeys the same law: the five D-014b stills are captured from the production scene
under the same rig and exposure (04 §9.2), so the article and the film are lit by the same room.

---

## 7. Text timing rules

### 7.1 Slot inventory and the shared slot→wording table (the 01↔03 interface of record)

Slot IDs and windows are timeline addresses (mine); **all wording is the Creative Director's,
recorded verbatim as the table of record in `decisions.md` D-009** (01 §8.2 carries the identical
table); if 01 edits a sentence, a superseding decision entry records it, the quoted column updates,
and the word-count/floor formula in §7.2 re-runs. **`copy.B1` ships per D-009:** its round-2
deletion rested on a stale read of 01's deck, and the ruling settles it — the slot is timed in
§4-B1. The six teardown cards are the merged structure D-009 fixes (one card per beat; B3 and B4
each carry two parts in one sentence, matching the one-lift/one-family motion structure; the
Chassis line lives in `copy.B6`). The closing line is adopted per **D-017** — owner sign-off is
pending before implementation, and a rewrite would re-run §7.2's floor for `copy.close`.

| Slot | Wording (01 §8.2, verbatim) | Words | Window (in / full / out) |
|---|---|---|---|
| `copy.B0` | title "Engineering" + subline "A laptop is a complicated thing. It comes apart layer by layer." | 1 + 12 | visible at rest; exits 0.000–0.040 |
| `copy.B1` | "That was you. This page only moves when you do." | 10 | 0.040–0.055 / 0.055–0.105 / 0.105–0.120 |
| `copy.B2` | "The lid comes off first. It always does." | 8 | 0.124–0.139 / 0.139–0.189 / 0.189–0.204 |
| `copy.B3` | "The cooling fan and the copper heat pipes. They carry heat away." | 12 | 0.238–0.253 / 0.253–0.308 / 0.308–0.323 |
| `copy.B4` | "Storage and memory. Everything you keep, and everything it's thinking about." | 11 | 0.421–0.436 / 0.436–0.491 / 0.491–0.506 |
| `copy.B5` | "Support boards. Power, ports, and signals — small jobs, handled separately." | 10 | 0.612–0.627 / 0.627–0.677 / 0.677–0.692 |
| `copy.B6` | "The mainboard lifts away. The chassis stays, and asks for no credit." | 12 | 0.717–0.732 / 0.732–0.862 / 0.862–0.877 |
| `copy.close` | "Websites are complicated. / You've seen how we treat complicated." (Distillery, two lines, 3 + 6 words — both inside 01 §4.2's ≤6-word rule) | 9 | in 0.973–0.986; persists at 1.000 |
| `copy.cta` | "Start a Project" (`.btn-sand`, 01 §7.7) | 3 | in 0.988–0.998; clickable ≥ 0.992 |
| `copy.signoff` | "© 2026 WebSharke" | 3 | in 0.992–1.000; persists |
| `label.*` ×9 | canon names verbatim + BATTERY (D-015; shares the Chassis stagger slot) (01 §7.5 chip spec, active/settled treatments) | 14 total | in-points per §3; policy §7.4 |
| `cue.scroll` | "Scroll" (01 §7.3 design) | 1 | clock-based, §8 |

There is **no `ui.progress` slot** (D-009 records its absence; the ruling is D-014d). Progress
indication is a decided *no* (01 §7.4: the state of disassembly is the progress indicator); this
document schedules nothing for it, and nothing may be timed for an element that is not in 01
§7.1's closed inventory.

### 7.2 The reading floor (the guarantee, with math)
Every copy card is **fully visible (in-ramp end → out-ramp start) for ≥ 0.050 progress = 540px ≥ 3.0s
at the fastest engaged pace** (180px/s per §1). At 220 wpm (3.67 words/s), 3.0s reads 11 words —
49px ≈ **0.00455 progress per word**. Per-card floor: **`max(0.050, 0.00455 × word count)`**, rounded
up to the next 0.005. Re-run against the shared table's final word counts: `copy.B1` 10 → 0.050 ·
`copy.B2` 8 → 0.050 · `copy.B3` 12 → 0.0546 → **0.055** · `copy.B4` 11 → 0.0501 → **0.055** ·
`copy.B5` 10 → 0.050 · `copy.B6` 12 → **0.055**. §3 delivers 0.050 / 0.050 / 0.055 / 0.055 / 0.050 /
0.130 — every card at or above its floor (verified in §3's card table). The word
cap per card remains **14** (floor 0.0637 → 0.065); if 01 edits any sentence upward, the widened floor comes
out of the host hold's stillness (H3/H4/H6 carry 0.068/0.124/0.122), and if a hold cannot cover it,
the change is a §3 re-issue — never a silent stretch, so the two documents cannot drift apart.
Labels are single names (the eight canon parts + BATTERY, D-015) and are held ≥ 0.040 before any
exit (worst case, the shared `label.chassis`/`label.battery` slot: in-ramp ends 0.812, exit begins
0.862 → 0.050 ✓). The closing line, CTA, and sign-off persist at
`p = 1.00` indefinitely — no cap needed.

### 7.3 Enter / exit behavior
- **Enter:** opacity 0 → 1 and translateY 16px → 0 over **0.015 progress (≈162px)**, curve `TXT-IN` —
  the site's own reveal gesture at scrub-scale (design guide: reveal, not spectacle). Labels enter
  with 01 §7.5's visual grammar (fade + 6px rise) over the same 0.015 ramp, and the active→settled
  demotion crossfade (01 §7.5's two treatments) also runs over 0.015, concurrent with the next
  label's in-ramp — 01 §7.5 delegates ramp widths and in-points here ("whose widths and in-points
  are the Animation Director's"); 0.015 is that value.
- **Exit:** opacity 1 → 0 over 0.015, **no movement**, curve `TXT-OUT` (linear). Entrances may be
  noticed; exits must not be. One sanctioned exception: `copy.B0`'s exit keeps a 30px rise over a
  wider 0.040 window (§4-B1) — the page's first cause-and-effect lesson, deliberately visible,
  deliberately unhurried, and deliberately reversible.
- **Hand-off and persistence rule:** a card enters at its part's arrival anchor (§1) and its
  out-ramp begins no later than the next beat's **part-window** start. Cards may persist through
  *camera* windows, and may enter during them (the card is screen-fixed UI; a walking lens does not
  compete for reading — and if a transition must sweep the silhouette behind live text, 01 §4.4's
  scrim ellipse is the designed cover). Cards never persist into another part's motion except their
  own out-ramp, which may overlap the next part's first 0.015 (a linear fade under a starting
  movement is invisible — the motion takes the attention the card releases). B3 and B6 use the
  persistence rule (camera runs under `copy.B2` / `copy.B5` tails); the §3 table marks each case.
  **One anchor exception:** `copy.B1` has no part — its subject is the visitor's own gesture — so
  its in-point is the B1 dolly's settle (in-ramp 0.040–0.055 straddling the camera window's end),
  timed so its full window sits entirely on a still frame (§4-B1).
- **One card at a time:** **maximum one copy card on screen at any `p`** (one idea per viewport —
  references §2). Ramps may abut exactly; they never overlap (§3, continuity check 2).
- **Placement:** copy cards live in 01 §5.3's left column on desktop (left edge 7vw, width
  `min(34ch, 26vw)`, block centered at 50vh) and 01 §5.3's bottom zone on mobile — composition is
  01's; this document only schedules opacity and the 16px rise. Labels are 3D-anchored: projected
  from an anchor point on each part's near edge, drawn in screen space (no perspective distortion on
  type — warped type reads as sci-fi HUD, which is banned); chip, leader line, and all visual
  treatment per 01 §7.5.

### 7.4 Label lifecycle
A part is named when it *arrives*, not while it moves: each label's in-ramp starts at the `p` where
its part crosses 80% of its eased travel — the `a + 0.47 × (b − a)` anchor derived in §1 (naming a
moving thing splits attention; naming a settled thing confirms understanding). Labels persist through
their beat and all following beats until the B7 group exit at 0.862–0.877, then the full set
re-enters at B8 as the finished diagram (§4-B7 carries the reason). `label.chassis` and
`label.battery` (one shared slot, D-015) alone enter during a hold (0.797) because their parts
never move — they are named while they sit, which is their story.
**Joint visibility policy (01 §7.5, the spec of record — recorded as `decisions.md` D-014a):** labels
persist and accumulate exactly as this schedule runs them; at any `p` exactly one label — the most
recently entered — carries 01's **active** treatment, every earlier label carries the **settled**
treatment (full-strength text, quieter paper), and the demotion crossfade runs over 0.015 concurrent
with the next label's in-ramp (§7.3); at the B8 re-entry all nine labels enter at the active
treatment — in 01's words, the finished diagram is the one moment that has earned full emphasis
everywhere. The two halves serve one page: this document's accumulation builds the diagram the
ending pays off, and 01's active/settled hierarchy keeps one focal point per beat without deleting
names the visitor has earned. 01 verified the policy against this table's B3 stagger (`label.fan`
enters 0.238 and demotes as `label.pipes` enters 0.250 — never two active labels) and states that
**no retiming is required; none is scheduled here.**

### 7.5 Fast-scroll guarantee
No text gates the timeline, full stop — a minimum-dwell gate would make the page "wait on them,"
which the vision forbids (§1). The actual guarantee is determinism: every slot is a pure function of
`p`, so a visitor who flicks past a card and scrolls back gets it again, pixel-identical, at the same
addresses. Skipped is never lost. This is the graceful behavior, and it costs nothing.

### 7.6 Progress indication — none (consumed decision)
01 §7.4's reasoned decision is **no progress indicator**, recorded as `decisions.md` D-014d, and
this document consumes it: eight parts taken off in a known order, ending in the tableau the
subline promises, *are* the page's progress display. Nothing is scheduled, nothing fades in or out,
and the Round-1 `ui.progress` element is deleted from every table in this document. Should a future
superseding entry activate 01 §7.4's designed contingency (the 2px bottom hairline — D-014d keeps
it unbuilt), its timing here would be: in 0.010–0.020, out 0.973–0.988 (the ending needs no
odometer) — pre-priced, built only on that entry.

---

## 8. Opening sequence (B0–B1, expanded)

**At `p = 0.00`, before any scroll:** the machine closed and still at `P0`; ground shadow agreeing with
the single key light (04 §7.2's right-rear window key, per 01 §6's direction); `copy.B0` composed per
01 §5.2 (the D-010 arrival) — machine right of center at 62vw (≈ 38% of frame width, delivered by `P0`,
§5.2), title + subline left-aligned in the word column, block centered at 50vh, so the frame reads
words → object → the invitation to move (01's stated reading order); the site nav — logo only, no
Sign In (01 §2.2). Nothing else. No particles, no vignette pulsing, no idle drift on anything —
stillness is the statement, and any idle loop would spend it (vision §4: Arrival = stillness).

**The three clock-based exemptions** (UI only, never the scene — the timeline itself owns no clock):

1. **Loader hand-off — one spec, consumed from 01 §7.6:** the loader's real-progress hairline reaches
   100% → **hold 150ms** → wordmark + hairline + microtext **fade 400ms ease-out** → the loader wall
   **crossfades into the live scene over 600ms**. This document's requirement inside that contract:
   the scene beneath is already composed at `p = 0` — the scene itself never fades, scales, or moves
   during handoff (the predecessor's README records fading the scene in as a fixed mistake; we
   inherit the fix). The Round-1 "550ms homepage dissolve" spec is withdrawn; the loading experience
   has exactly one owner and one timing.
2. **`cue.scroll` — 01 §7.3's design, this document's trigger.** The visual is consumed verbatim from
   01 §7.3: the word "Scroll" (microtext style, `--ink-soft`) above a 1px × 34px vertical hairline in
   `rgba(70,60,51,.55)`, bottom-center — **no pulse, no bounce, no loop**: the cue is a still object
   in the room, like everything else here (Round-1's pulsing variant is withdrawn — two cues meant
   nobody decided; now 01 decides the object and this document decides its clock). The trigger is the
   storyboard's contribution (the appearance/fade points are timeline behavior, which 01 §7.3
   explicitly delegates here, adopting this trigger as the joint spec): the cue appears only if
   `p < 0.005` and no scroll input has occurred **2400ms** after the handoff crossfade completes
   (1800ms on mobile, §12). The 300ms ease-out fades (in, and out on first scroll input) and the
   never-returns rule are 01 §7.3's own — an instruction repeated becomes nagging (01's words);
   this document owns only the idle condition. Reason it exists at all: vision §5 requires the
   visitor to proceed unprompted, but an arrival page with zero affordance gambles the entire
   experience on a guess; one quiet word is the smallest possible bet.
3. **CTA hover** (B8): the site's standard button hover — instantaneous input feedback is exempt from
   scrub purity by definition.

**The first scroll response — teaching the contract:** the camera dolly and title exit both start
at `p = 0.000` with no dead zone, so the first wheel detent (≈100–120px ≈ 0.010) already produces
visible approach. Response latency is bounded by the smoothing budget (§10.2: ≤ 120ms, target 80ms) —
under the ~150ms threshold where cause and effect feel like one event. Stop scrolling and the smoother
settles within 250ms and the scene is perfectly still again: move, it moves; stop, it stops; scroll
up, it walks backward (and the title walks back in — the visible `copy.B0` exit is reversibility made
demonstrable). The entire interaction contract is taught in the first 200px, wordlessly; then
`copy.B1` confirms it in ten words over H1's stillness — the gesture first, the sentence after,
never the sentence instead of the gesture, and it is the page's only sentence about the page (every
card after it is about the machine). B1 spends its motion on the camera and leaves the machine
untouched: the payoff of B2's first part-move lands on a visitor who already trusts the controls.

---

## 9. Ending sequence (B7–B8, expanded)

### 9.1 Final tableau geometry (the spacing logic)
Final ranks, measured from the Chassis floor: **Chassis 0 · Mainboard +0.36W · components plane
(Cooling Fan, Heat Pipes, Storage, Memory, Support Boards — each still directly above the socket it
came from) +0.72W · Lid +1.08W.** Uniform 0.36W gaps, and the number is derived, not chosen by eye —
re-run here on 04 §3.1's built depth of **0.697W** (212/304 mm; the Round-1 draft assumed 0.72W):
from `P5` (elevation 26°) a vertical gap `g` projects to ≈ `g · cos 26° = 0.324W` of screen height
while a slab's footprint projects to ≈ `0.697W · sin 26° = 0.306W` — at `g = 0.36W` adjacent layers
clear each other on screen with ≈ 0.018W of visible daylight, so every layer is fully readable at a
glance (Framework's diagram-grade clarity, references §3) without inflating the stack. 0.36W is the
smallest gap in 0.01W steps that clears the projection; anything larger stretches the stack for no
added comprehension. Parts keep their true XZ positions — nothing is rearranged into decorative
ranks; every part hangs above where it lives, because the tableau is a diagram of the truth, not a
poster.

**`P5` framing check (recomputed on real dimensions):** stack top = Lid rank 1.08W + Lid thickness
0.022W (6.6 mm, 04 §3.1) ≈ **1.102W**; half-height 0.551W. At distance 3.00W with 24° FOV, visible
half-height = `3.00 × tan 12° = 0.638W` → vertical margin = 1 − 0.551/0.638 ≈ **14%**, above the 10%
floor that binds all framing (§12). Horizontally at 16:9 (hFOV ≈ 41.4°), visible half-width = 1.134W
against a 0.5W half-width object → side margins ≥ 25% hold easily. Mobile refit rule in §12.

### 9.2 The held silence, the line, the invitation
Sequence per §3/§4-B8: labels complete the diagram (by 0.957) → **silence 0.957–0.973** (nothing
enters, exits, or moves — the visitor sits with the whole machine, understood) → `copy.close` rises
(0.973–0.986) → `copy.cta` (0.988–0.998, clickable from 0.992) → `copy.signoff` (0.992–1.000), the
three arriving in 01 §5.4's closing-block order (line, CTA, sign-off). One CTA, once, at the end,
unhurried — exactly as the vision's ending prescribes (§4: Trust). The CTA is deliberately last with
weight on the entire page: nothing is asked of the visitor until everything has been shown.

### 9.3 Past the end
At `p = 1.000` the timeline rests, and **the scene container is the last element in the document —
there is no footer section and no content below it** (recorded as `decisions.md` D-014c; 01 §2/§5.4:
the page ends on the closing block. The Round-1 50vh footer block is deleted — it was never in 01's
closed inventory, and D-014c rules it out on the record). The page's obligations are already met inside the frame: the sign-off microtext is the
quiet signature (01 §7.1, element 8), and the always-present nav logo is the way back into the site
(vision §11.5 — the logo is the page's only exit, by 01 §2.2's design). Scroll input past the end
produces only the browser's own overscroll behavior; the page adds nothing — no snap, no re-pin, no
scroll trap, no synthetic rubber-band. Scrolling back up re-enters the timeline exactly where it
rested. A reload at the bottom reconstructs the identical tableau (§10.1 determinism).

---

## 10. Scrub and rewind behavior

### 10.1 Determinism (the ground rule)
Scene state is a **pure function of smoothed progress**: `state = f(smooth(p_raw))`. No accumulators,
no velocity-dependent branches, no "played once" flags, no randomness anywhere in the timeline (all
stagger offsets are the fixed constants in §3/§6.2). Consequences, all intended: reverse scroll is the
exact mirror of forward scroll at the same addresses; text enters/exits at identical thresholds in
both directions (no hysteresis needed — every threshold is a 0.015-wide ramp, not a step, so
oscillating on an edge produces a stable partial opacity, never flicker); a reload at any scroll
offset reconstructs the identical frame.

### 10.2 Requirements on the Technical Architect's scrub model (they own the implementation)
- **Lag budget:** smoothed `p` trails raw `p` by **≤ 120ms (target 80ms) and never more than 0.030
  progress** at a sustained 1080px/s scroll. Below ~150ms, hand and scene feel simultaneous (§8);
  0.030 caps spatial drift at fast rates so hand and scene never visibly disagree.
- **Settle:** after scroll input stops, `|smooth(p) − p_raw| < 0.001` within **250ms**. Stillness
  between inputs is a storyboard feature (§6.3); a smoother that keeps gliding is autoplay by another
  name.
- **Critically damped, zero overshoot.** An overshooting smoother plays motion the visitor did not
  ask for and can carry the scene past a hold boundary and back — both are contract violations.
- **Native scroll only.** No wheel hijack, no synthetic scroll physics: keyboard (space, arrows,
  PgDn), scrollbar dragging, and assistive-tech scrolling must all drive the same timeline for free
  (D-007 keyboard requirement lands here).

### 10.3 Fast scrub (flick speeds)
At `|dp/dt| > 0.25/s` (a hard trackpad flick ≈ a quarter of the timeline per second) nothing in the
*storyboard* changes — purity means there is nothing stateful to break. What may degrade is frame
delivery, which is the Technical Architect's budget; the storyboard's constraints on that degradation:
frames may be skipped but never interpolated with motion blur or ghosting; the smoother's damping must
prevent any overshoot at flick-terminal velocity; and text ramps remain functions of `p` (a card
flicked past simply appears partially through its ramp on the way — acceptable, because §7.5's
determinism makes every card recoverable by scrolling back).

---

## 11. Reduced-motion storyboard

Under `prefers-reduced-motion: reduce` the pin and the scrubbed timeline are **not built**. The page
is a plain linear article — five still states telling the same story in the same order with the same
words, matching the homepage's precedent (content shown instantly) and the predecessor's static-first
design. **The count and addresses are recorded as `decisions.md` D-014b: five stills at
0.000 / 0.160 / 0.633 / 0.743 / 1.000** — 01 §7.8 adopts `R0`–`R4` as the single cross-document
count (verified against 01 as it stands); the addresses are **unchanged by this revision** (the
retimed region is 0.000–0.160's interior, and `R1` sits on the untouched boundary), so the entry's
addresses hold as recorded. The article's structure
and still placements are 01 §7.8's (seven `h2` sections; stills placed where the story has reached
their state); the scene states and camera addresses below are this document's, frame-accurate to the
timeline. Text pairings per the final deck (§7.1 = the D-009 table):

| Still | Scene state (timeline address) | Camera | Paired text (final deck, per 01 §7.8's placements) |
|---|---|---|---|
| `R0` | `p = 0.000` — machine closed | `P0` | `copy.B0` — the only copy live at `p = 0.000` (`copy.B1` enters at 0.040, §4-B1; deck per D-009). 01 §7.8 keeps `copy.B1`'s sentence in the same opening section, verified against 01 as it stands |
| `R1` | `p = 0.160` — Lid at +0.50W | `P1` | `copy.B2` + `label.lid` as caption |
| `R2` | `p = 0.633` — thermal module, Storage, Memory, Support Boards all at +0.28W; Lid +0.50W | `P3` | placed after `copy.B3` + `copy.B4` + `copy.B5` (its state shows all three lifts complete); component names as captions |
| `R3` | `p = 0.743` — Mainboard at +0.14W | `P4` | `copy.B6` + `label.mainboard`/`label.chassis`/`label.battery` as captions (BATTERY joins the still captions per D-015) |
| `R4` | `p = 1.000` — full tableau, ranks per §9.1 | `P5` | all 9 labels — the 8 canon names + BATTERY (D-015) — as a caption list + `copy.close` + `copy.cta` + `copy.signoff` |

Rules: labels/captions are HTML text beside or below each still (not baked into renders — they must
stay selectable and translatable); **zero animated transforms**; the only motion permitted anywhere is
opacity ≤ 300ms on scroll-into-view, and even that is optional — instant is the default and matches
the site. **The scroll cue does not exist in the static experience** — a longform article needs no
scroll instruction, and 01 §7.8's static design carries none. The CTA appears after `R4` as a normal
in-flow button. The story survives intact: same order, same names, same closing line — a designed
experience, not an apology (vision §3.6).

---

## 12. Mobile pacing adjustments

Applies at ≤ 680px viewport width (the site's own breakpoint) or coarse-pointer portrait.

**What changes:**
- **Scroll travel: 1600vh (container 1700vh = 1600 travel + 100 stage)** vs desktop's 1200vh travel /
  1300vh container. Math: flick momentum covers *absolute pixels*, not vh. Desktop travel = 10,800px;
  a 660px-tall phone at 1200vh would give only 7,920px — a single hard flick (≈ 2,000–2,500px) would
  cross a whole chapter. At 1600vh × 660px = **10,560px**, absolute travel matches desktop within 3%,
  so every hold and reading floor in §7.2 keeps its *px and seconds* value with **no change to any
  normalized range** — one timeline of record for all devices.
- **Camera refit (framing rule, not new positions):** each beat's framing target (the subject box
  implied by its `P*` framing at 16:9) must fit with ≥ 10% margins; on any viewport the effective
  distance is `max(distance_vertical_fit, distance_horizontal_fit)` for that box. On aspect < 0.75
  the vertical FOV widens 24° → **30°** (≈ 44mm equivalent — still inside the no-distortion band) to
  keep portrait distances from ballooning; this is a layout rule applied at resize, never a
  scroll-driven animation (§5.1). Azimuth/elevation/targets are untouched — the grammar of §5.2 is
  device-independent. The 62vw subject-center rule relaxes to 01 §5.3's mobile composition (machine
  upper stage, text bottom zone).
- **Copy cards** move to 01 §5.3's bottom zone (bottom 30vh quiet-zone contract); labels keep 3D
  anchors but alternate screen-left/screen-right of the stack at B8 so all nine labels (D-015) fit a 390px width
  (visual spec 01 §5.4).
- **`cue.scroll` idle delay** shortens to 1800ms: mobile visitors decide faster whether a page is
  static.

**What does not change:** beat order and count, all normalized ranges and holds, all easing curves,
all part transforms in `W`, the stagger constants, the single-mover rule, the text hand-off rule, the
§10 lag budgets (they are ms/progress, already device-agnostic), and the reduced-motion article.

---

## 13. The purpose audit

The vision §9 test, applied here first: every motion element, one row, one story sentence. Anything
that could not fill its sentence was cut before this table was written (a sixth camera move in B5, a
lid tilt in B2, a progress bar, a pulsing cue — and the 50→62vw arrival reframe, retired on the
record with the 50vw variant by D-010: with the arrival fixed at 62vw it is a move with nothing to
say).

| # | Element | Story sentence |
|---|---|---|
| 1 | B1 camera dolly (`P0 → P1`, proximity only) | We walk you up to the workbench — nothing here is kept at a distance. |
| 2 | `copy.B0` title exit (the one visible exit) | The words step aside; from here the machine does the talking — and scrolling back brings them back, which is the whole contract in one gesture. |
| 3 | `copy.B1` over H1's stillness | The page's one sentence about itself, read on a frame that proves it: nothing moves until you do. |
| 4 | `cue.scroll` (01's still word and fades, this document's idle clock) | Your hand runs this machine — start whenever. |
| 5 | B2 Lid lift (+0.50W, ≈23× its thickness) | The sealed thing opens; the intimidation was a cover, and covers come off. |
| 6 | B3 low camera drop | We get down to where the mechanism actually is — understanding means changing your angle. |
| 7 | B3 thermal module lift (one shared transform) | The plumbing comes out as one honest piece, because that is what it is. |
| 8 | `copy.B3` one card, two names | One lift, one sentence — the words are shaped like the motion, because both are shaped like the hardware. |
| 9 | B4 camera rise to top-down | From above, the layout is a map — complexity is just placement you haven't seen yet. |
| 10 | B4 Storage then Memory stagger | The two parts you've heard of, handled one at a time — nothing is rushed past you. |
| 11 | B5 Support Boards stagger (no camera move) | Even the small unglamorous pieces get lifted and named — thoroughness has no favorites. |
| 12 | B6 camera descent to mid | The next event is a gap opening; we put your eye level with it. |
| 13 | B6 Mainboard lift (+0.14W, below the parts) | The core lifts free and hangs beneath everything that lived on it — the true order of things. |
| 14 | Chassis never moving, named mid-card while still | The foundation holds still and is named for exactly that; everything else is measured from it. |
| 15 | B7 label + final-card group exit | The diagram clears the stage while everything finds its place. |
| 16 | B7 pull-back + spread (dual mover, re-centering to 50vw) | Step back: the machine exhales into ranks, and the whole becomes visible at once. |
| 17 | B8 label re-entry, top→bottom | Every part, named in order — the finished diagram of what you just watched. |
| 18 | B8 held silence (0.957–0.973) | Sit with it: the most complicated thing on your desk now makes sense. |
| 19 | `copy.close` rise | One plain line lands the point the pictures already made. |
| 20 | `copy.cta` arrival (last element with weight) | Only after showing everything do we ask anything. |
| 21 | `copy.signoff` (with the closing block) | A quiet signature, same as the homepage's baked-in copyright — the page signs its work and stops. |
| 22 | Text 16px-rise entrances | Words arrive the way this site's words always arrive — this page is family, not a stunt. |
| 23 | `LIFT` zero-overshoot settle | Machined parts move like machined parts — precision is the personality. |
| 24 | Loader hand-off (150/400/600, per 01 §7.6) | The room was here before you arrived; we only turned on the light. |

---

## 14. Requirements this document places on the other documents

Stated here so the Reviewer can check both sides of each interface:

- **Creative Director (copy deck / UI):** the shared slot→wording table in §7.1 is the 01↔03
  interface of record, **recorded as `decisions.md` D-009** (six merged cards, `copy.B1` shipping;
  merged B3/B4 cards, Chassis line in `copy.B6`), windows mine; 01 §8.2 carries the identical
  table. The arrival and ending compositions are the **D-010 ruling** (machine at 62vw / ≈38%
  frame width, title in the word column at 50vh; tableau centered at 50vw) — B1 is a pure dolly
  accordingly, and `P0`–`P4` distances are derived to deliver those figures (§5.2). The
  label policy is the joint spec **recorded as D-014a**, restated in §7.4 (persist-and-accumulate +
  active/settled; 01 verified no retiming against B3's stagger — none is scheduled). The
  label appearance and demotion transitions consume 01 §7.5's visual grammar over 0.015 progress
  ramps (§7.3 — the widths 01 delegates here). 01 §8.5.3's withdrawn "one piece at a time"
  constraint is replaced by its **layer-order rule** (Lid layer → components plane → Mainboard;
  Chassis stays; a rigid assembly counts as one piece; intra-layer stagger per §6.2), which §3
  satisfies as written — 01 verified this against the table, and B2/B3–B5/B6 are exactly those
  layers. The scroll cue (§8) consumes 01 §7.3's design and fades; the loader handoff consumes 01
  §7.6's 150/400/600 timing. Component labels are the canon names verbatim; no on-screen beat
  numbers (D-006). Copy cards ≤ 14 words (the §7.2 widening formula governs any edit).
- **Technical Architect:** the scrub model must meet §10.2 (lag ≤ 120ms / ≤ 0.030 progress, settle
  ≤ 250ms, critically damped, zero overshoot, native scroll); scene state must be implementable as a
  pure function of smoothed `p`; the stage structure must support **containers of 1300vh (desktop)
  and 1700vh (mobile) — i.e. 1200vh / 1600vh of scroll travel plus the 100vh fixed stage** (§1, §12)
  inside their global budgets. Every timeline address 02 transcribes is read from §3 — the
  revision-3 body D-009/D-010 ratify; no boundary changed in revision 5: **B8 starts at 0.928**,
  the B1/B2 boundary is **0.105** with the Lid window 0.105–0.145 (D-010 — 02 §6.4's `B2 = 0.105`
  stands, per the entry), the retimed region was confined to 0.000–0.160's interior plus the card
  windows in §7.1, and every boundary from 0.160 onward is byte-identical to round 2.
- **Asset Director:** dimensions are consumed from 04 §3.1/§2.3 (W = 0.304 m, depth 0.697W, Lid
  6.6 mm, assembled rest origins — the measured MANIFEST values are what the implementation reads).
  The Cooling Fan + Heat Pipes stay two sibling nodes; this storyboard drives them with one shared
  transform, so no re-parent or re-export is needed (§6.1). Support Boards count = 3 per 04 §2.1
  (generalization rule in §4-B5). Label anchor points on each part's near edge (§7.3). The five
  reduced-motion renders `R0`–`R4` at the exact states in §11 — count and addresses
  (0.000/0.160/0.633/0.743/1.000) **recorded as `decisions.md` D-014b** and unchanged by this
  revision. **One change 04 must consume:** `P0`–`P4` camera distances and `P0`'s elevation were
  re-derived in revision 3 and are ratified by **D-010** (§5.2 — arrival at 4.15W / +22°, teardown
  positions 2.90–2.95W); the `R0`–`R3` render cameras read §5.2 as it stands (`R4`/`P5` is
  untouched). Camera distance floors (04 §3.6) are honored with ≈ 11× margin (§5.3, rule 6).
- **Battery — activated per `decisions.md` D-015 (seated, label-only variant).** 04 ships
  `chassis_battery`, non-separating, seated in the Chassis — it rides inside the Chassis and
  **never moves** (§6.1). Per D-015 the part is **named**: `label.battery` ("BATTERY") enters
  alongside `label.chassis` at 0.797, sharing its stagger slot (two parts that never leave, named
  together — zero retiming cost, exactly as pre-priced), joins the B8 diagram re-entry
  (§3-B8) and the fallback-still captions. Label inventory: **9 labels / 14 words** (§7.1). The
  **lifted variant is declined** by the same entry and stays pre-priced for the record: its reserve
  card ("The battery. One job, and it takes the most room." — 10 words, floor 0.050) would need a
  part window and a card slot that do not exist at the current 1.000 (`copy.B6` occupies H6, one
  card at a time), plus a 04 re-export (the shipped node is non-separating), extending desktop
  travel to 1300vh (container 1400vh; mobile 1700vh travel) and a re-issue of §3 — a future
  superseding entry would be required to activate it.

---

*End of document. Every number above is a commitment; changes go through review, not through quiet
edits.*
