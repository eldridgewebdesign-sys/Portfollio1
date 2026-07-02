# Review Report — Round 1

- **Reviewer:** Reviewer (critique only)
- **Date:** 2026-07-01
- **Documents reviewed:** `01-creative-direction.md`, `02-technical-architecture.md`,
  `03-animation-storyboard.md`, `04-asset-pipeline.md`
- **Standard applied:** `project-vision.md` (§9, §10, §12 especially), `references.md`,
  `decisions.md` D-001–D-008, `README.md` contributor rules, `docs/design-guide.md` (banned-word
  list), the predecessor post-mortem, and the reference art in `images/Laptop/` (viewed).
- **Verification notes:** I checked claims against the repo. The homepage really does use
  Distillery Display (`font-weight:100 900`, one file) + Playfair Display, logo 210×118, `.btn-sand`
  exactly as 01 quotes it, `#loader` at 0.55s as 03 claims, `cleanUrls:true` + `trailingSlash:false`
  and a real `middleware.js` as 02 claims. I recomputed two of 01's WCAG ratios by hand (both
  correct to the second decimal) and 03's §9.1 projection math (correct). The banned-word grep
  across all four documents is zero-hit. The failures below are coordination and arithmetic
  failures, not fabrication — but several of them are fatal as written.

---

## 01 — Creative Direction

### Strengths

The strongest document of the four. The palette is measured, not invented — pixel-probe samples
with coordinates, derivations for every token, and a contrast table whose numbers are real (I
recomputed two). The closed inventory (§7.1) with a story sentence per element is exactly the
vision §9 test made operational. The copy deck is in the owner's voice ("The chassis. It holds
everything and asks for no credit." is the best line in the project), the word budget (123/135)
is checkable and its arithmetic is correct, and the caps-only handling of Distillery (§4.2 —
sentence-case markup + `text-transform`, ≤6-word lines, glyph-coverage gate) is precisely the
discipline a caps-only face needs. The warm-room/cool-machine palette engine (§3.5) and the
"copper is the machine warming up as you go deeper" reading give the color system a story
sentence of its own. The anti-slop rules (§9) are grep-checkable, which is the only kind that
survives implementation.

### Problems

1. **Timing overreach (interface contract a/b).** §7.5 specifies component-label appearance as
   "fade + 6px rise over **220ms** ease-out." Labels are scene-anchored elements on a scrub-pure
   timeline; the Animation Director's model (03 §7.3, §10.1) drives every scene-anchored reveal as
   a function of scroll progress, and 03's clock exemptions (loader, cue, CTA hover) do not
   include labels. A milliseconds duration for a scrubbed element is unimplementable as written —
   scrub backward and a 220ms clock has no meaning. The parenthetical "*when* a label appears...
   is the Animation Director's" concedes the ownership and then violates it in the same sentence.
2. **Beat-structure constraint that the beat owner cannot satisfy (contract b).** §8.5.3: "no
   beat may detach two canon components simultaneously." The storyboard (which owns beat
   structure) detaches Cooling Fan + Heat Pipes as one assembly in B3 and moves Storage
   (0.465–0.515) and Memory (0.477–0.527) with overlapping windows in B4. Either the subline's
   "one piece at a time" promise or the storyboard's structure must change; as written the two
   documents are irreconcilable and 01 planted the constraint in the other document's territory.
3. **Label-visibility policy contradicts the storyboard's diagram-building model.** §5.3/§7.5:
   "During the teardown exactly one label is visible at a time." 03 §7.4: labels persist and
   accumulate until the B7 group exit, and B3 shows two labels (fan at 0.350, pipes at 0.362)
   simultaneously. One of these is the page; it cannot be both.
4. **The copy deck does not cover every state the page has.** 02 requires wording for: the
   skip link (02 §10.5), the `file://` guard block (02 §11.3), and per-beat `h2` headings
   (02 §10.2). 03 requires wording for `copy.B1` (the "watch this" card) and a footer line
   (03 §9.3). None of these strings exist in §8.2. A developer building from these documents has
   to ask — the vision §10 failure condition, verbatim.
5. **The 8 beat sentences do not map onto the storyboard's slot inventory.** 03 has five teardown
   card slots (`copy.B2`–`copy.B6`) with a 14-word cap; 01 delivers eight component sentences.
   Merging fan+pipes for B3 gives 22 words; storage+memory for B4 gives 16 — both over cap, and
   the Chassis sentence has no slot at all. The mapping 01 §8.2 says the Animation Director will
   do is arithmetically impossible under both documents' own rules.
6. **The live-scene backdrop is unspecified.** 02 §3.1 requires the warm room behind the
   transparent canvas to be a CSS treatment "the Creative Director specifies" — 01 never
   specifies it. Flat `--wall`? The loader's three-stop gradient? If a gradient, the §9.1 census
   ("exactly three gradients may exist") has no seat for it. 04 §7.1 had to invent one
   (see 04 problem 6). This is the single largest surface on the page and it has no owner spec.
7. **Static-experience design conflicts with three other documents.** §7.8 designs **two** stills;
   03 §11 requires **five** (`R0`–`R4`); 04 §9.1 delivers **three**; 02 §8.1/§10.2 implies one
   per beat (~9). See cross-document findings — but 01's number is one of the four.
8. Minor: §4.1 claims Playfair ships "static weights 400–900 + italics"; the repo's italics stop
   at 700. Harmless today (the page uses no italics), but a spec document should not state a
   wrong inventory.

### Verdict: **Rejected**

Rejected narrowly, and mostly for interface breaches and coverage gaps rather than quality — the
taste, copy, and measurement discipline are at the standard the vision demands.

### Required changes

1. §7.5: re-express the label appearance transition as a scroll-progress ramp (e.g. "opacity
   0→1 and 6px rise over a progress window whose width the Animation Director sets"), or
   explicitly delegate the duration to 03 and delete "220ms". Keep the visual grammar (fade +
   6px rise); surrender the clock.
2. §8.5.3: either (a) rewrite the subline so it does not promise strict one-at-a-time (e.g. a
   wording that survives staggered pairs), or (b) convert the constraint into an explicit open
   question for the PM to adjudicate against 03's B3/B4 structure. Record the outcome in
   `decisions.md`.
3. §5.3/§7.5: resolve the one-label-at-a-time rule against 03 §7.4's persist-and-accumulate
   model — pick one policy with the PM and state it identically in both documents.
4. §8.2: add wording (or an explicit "slot does not exist — 03 must remove it" ruling) for:
   `copy.B1`, the skip link, the `file://` guard, per-beat `h2` headings, and the 03 §9.3 footer
   line (or record the PM decision that the page has no footer and 03 removes it).
5. §8.2: publish the sentence-to-slot mapping table jointly with the Animation Director: either
   the storyboard adds card slots so all eight sentences fit under the 14-word cap, or 01
   supplies merged ≤14-word sentences for B3 and B4 and retires/re-homes the Chassis sentence.
   The word budget (§8.3) must be recounted after.
6. Add a "stage backdrop" entry to §7.1's inventory and specify it exactly (tokens, flat or
   gradient, and if gradient, amend the §9.1 census to four with its physical cause named).
7. §7.8: align the static-experience still count with the PM's cross-document ruling (see
   cross-document section) and update §8.4 alt text to match the final set.
8. §4.1: correct the Playfair italics inventory to what `/fonts/playfair-display/` contains.

---

## 02 — Technical Architecture

### Strengths

Engineering judgment is genuinely strong: the import-map strategy with the single capability
cliff (§2.4) is the correct no-build answer and correctly reasoned; render-on-demand with an
exhaustive list of the five `request()` call sites (§3.4) is the kind of specificity §10 of the
vision asks for; the fixed-stage-instead-of-pin decision (§6.3), the iOS 120px resize rule
(§3.3), the versioned-immutable cache design (§7.6), the CSP wasm note (§7.5), and the
license/SHA-256 vendor audit (§1.3, QA-15) are all things a lesser architect discovers in
production. Budgets are numbers with owners and verification methods, and the QA table (§12.5)
maps one-to-one onto them. The GSAP licensing analysis is correct as of 3.13.

### Problems

1. **The scrub constants contradict the timing owner's requirements — fatally.** §6.2 specifies
   `scrub: 0.7` (fine pointer) / `0.4` (coarse), and §3.4 says the loop "drains within ~1 s."
   03 §10.2 (the document that owns timing) requires smoothed progress to trail raw progress by
   **≤120ms (target 80ms), never more than 0.030 progress**, and to settle within **250ms**. A
   0.7s catch-up constant misses all three by a factor of 3–6. Both documents quote the same
   vision sentence ("heavy, well-damped machine") and land 600ms apart. One number must win, and
   per the PM's contract the Animation Director owns feel; 02 owns only the mechanism.
2. **Node naming violates interface (d).** §4.1 declares `Lid, CoolingFan, HeatPipes, StorageSSD,
   MemoryRAM, SupportBoards, Mainboard, Chassis` under `LaptopRoot` to be "the architecture's
   contract" and binds the loader to those strings. Naming is the Asset Director's interface, and
   04 §2.1 canonizes `lid, cooling_fan, heat_pipes, storage_ssd, memory_ram, support_boards,
   mainboard, chassis` under `laptop_root`. As written, the loader's group binding (§12.2 step 5)
   throws on every name and the page falls to static mode on a perfect asset.
3. **Camera spec contradicts the choreography owner.** §5.2 sets base FOV **32°**, tweenable and
   clamped 24–45°, with an example beat that zooms; 03 §5.1 fixes FOV at **24°, never animated**
   ("a focal-length change mid-move is a music-video tic"), widening only to 30° on portrait
   (03 §12). Worse, §5.4 fits portrait "by dolly, not FOV" — the exact opposite of 03 §12's
   portrait rule. The rig must be capable of what the storyboard specifies, not prescribe its own
   cinematography.
4. **Laptop dimensions contradict the asset owner.** §4.2 hardcodes **0.312 m** width into the
   architecture and into the §5.4 portrait-fit formula; 04 §3.1 builds the machine at
   **0.304 m** (with a full dimension table). Dimensions belong with the asset; 0.312 appears
   nowhere else in the project.
5. **The lighting rig disagrees with the mood owner (and with 04).** 01 §6: one soft key from the
   **upper right, ~40° elevated, slightly behind** the subject, and "Fill: **the room itself** —
   warm bounce." 02 §4.3 places the key at (1.6, 2.2, 1.2) — ≈48° elevation and, under 04 §2.2's
   axis convention (+Z = front), on the **front**-right — and adds a **cool** `#cfe0ea`
   directional fill, which is neither the room nor warm. 04 §7.2 (35°, azimuth +55° right-rear)
   is close to 01; 02 is the outlier on both direction and fill temperature. 02 also never states
   its own axis convention for the laptop's facing, so its light positions are strictly
   uninterpretable without borrowing 04's.
6. **The loading experience contradicts the Creative Director's designed loader.** 01 §7.6
   designs a loader: gradient wall, masked logo, a 140px hairline "driven by **real**
   asset-loader progress," microtext, timed handoff. 02 §7.2 designs poster-first with "**No
   progress bar** — a bar promises precision the network can't keep" and a slow-network status
   line instead. These are two different, mutually exclusive loading designs, and the section
   even titles itself "the loading experience contract (with the Creative Director)" while
   breaking it. UI design is 01's.
7. **Packaging and versioning contradict 04.** §1.2 specifies one GLB with **embedded** KTX2
   textures, files suffixed `.v1`, under `engineering/assets/`; 04 §6.1/§6.3 specifies external
   `textures/*.ktx2` via `KHR_texture_basisu` (with a stated loading-priority rationale), a
   version **directory** (`v1/`), and a repo-root mount `engineering-assets/v1/`. Note the §7.6
   cache-header pattern `/engineering/(vendor|assets)/(.*)` would not even cover 04's mount
   point. One packaging scheme must be chosen and recorded.
8. **Fallback-render count conflicts with everyone.** §8.1 budgets "one per beat + poster duty"
   and §10.2's markup carries an `<img>` per beat (~9); 01 designs 2 stills, 03 requires 5,
   04 delivers 3. See cross-document section.
9. **Poster format conflicts with 04.** §8.1: "Poster image (AVIF + **JPEG** fallback)"; 04 §9.3
   ships AVIF + WebP and explicitly no JPEG tier.
10. Minor: the §8.1 per-item caps sum to ≈8.92 MB against the stated ≤8.5 MB total — defensible
    if the total governs and lines cannot all hit cap simultaneously, but the document should say
    which number wins, because QA-1 as written can pass every line and fail the total.
11. Minor: §10.5 mentions "the site's existing aqua outline convention" as the focus treatment
    while deferring to the Creative Director — 01 §7.9 specifies `--ink` outlines and bans cool
    tones in 2D UI. Delete the aqua reference; it will mislead an implementer.

### Verdict: **Rejected**

The engineering core is excellent, but it contradicts every one of the other three documents at a
named interface: timing (03), naming (04), dimensions (04), lighting mood (01), loading UI (01),
packaging (04). A developer holding all four documents cannot build.

### Required changes

1. §6.2/§3.4/§5.5: replace the 0.7/0.4 scrub constants with an implementation that meets 03
   §10.2's numbers (lag ≤120ms target 80ms, ≤0.030 progress at 1080px/s, settle ≤250ms,
   critically damped, zero overshoot) — or obtain a PM decision-log entry revising 03's numbers,
   and then cite it. Update the "drains within ~1 s" claim in §3.4 to the resulting settle time.
2. §4.1: adopt 04 §2.1's node names verbatim (`laptop_root`, `lid`, `cooling_fan`, `heat_pipes`,
   `storage_ssd`, `memory_ram`, `support_boards`, `mainboard`, `chassis`) in the scene graph and
   the loader binding, and state that the name canon is owned by 04.
3. §5.2/§5.4: set base FOV to 03's 24°, remove the tween-and-clamp policy (or mark the proxy's
   `fov` field as storyboard-reserved and unused), and replace dolly-only portrait fit with 03
   §12's rule (24°→30° on aspect < 0.75, then distance fit). State the camera spec as consumed
   from 03, not defined here.
4. §4.2/§5.4: change 0.312 m to 04's 0.304 m and reference 04 §3.1 as the source of truth for
   all dimensions.
5. §4.3: state the axis convention (adopt 04 §2.2: +Y up, +Z front), then move the key to match
   01 §6 (upper right, ~40° elevation, slightly behind — i.e. the right-rear quadrant, matching
   04 §7.2), and replace the cool `#cfe0ea` fill with a warm room-bounce fill consistent with
   "fill = the room itself," or obtain 01's written agreement to a cool fill via the PM.
6. §7.2: rebuild the loading contract around 01 §7.6's designed loader (real-progress hairline,
   logo, gradient wall, its handoff timings), or escalate the poster-vs-loader disagreement to
   the PM and cite the decision. The two documents must describe one loading experience.
7. §1.2/§7.1/§7.6: adopt one packaging scheme with 04 — recommend 04's external-KTX2 textures
   (its loading-priority rationale is sound and §7.1's phase table already fetches in parallel)
   under 02's `engineering/assets/` location with one versioning scheme — and update the file
   tree, the phase table, the GLB budget line (split geometry vs textures), and the cache-header
   source pattern to match.
8. §8.1/§10.2: align the fallback-render count and budget line to the PM's cross-document ruling
   on the static experience; align the poster format line with 04 §9.3 (AVIF+WebP) or state why
   JPEG is required and make 04 produce it.
9. §8.1: state explicitly whether the 8.5 MB total or the per-line caps govern when they
   conflict.
10. §10.5: delete the aqua-outline reference; point at 01 §7.9.

---

## 03 — Animation Storyboard

### Strengths

The storytelling is the best in the project. The beat arc (stillness → first inch → lid →
mechanism → recognition → thoroughness → core → exhale → tableau/silence) is a real dramatic
shape, and placing Storage + Memory mid-story as the "recognition payoff" is a genuinely smart
audience decision traceable to vision §4. The camera grammar (low = mechanism, high = layout,
mid = separation, far = comprehension; never crossing the line; five moves, a sixth tried and
cut) is documentary discipline with stated reasons — the vision's §9 worked example, delivered.
The purpose audit (§13, 22 rows) and the ban list (§6.3) are the anti-slop philosophy made
enforceable. The §9.1 tableau spacing is derived, not eyeballed (I checked the projection math —
it is right), and §10's determinism model (pure function of smoothed p, ramps not steps, no
hysteresis needed) is exactly how a scrubbed page avoids drift.

### Problems

1. **The reading-floor guarantee is broken by the document's own timeline — fatal arithmetic.**
   §7.2 guarantees every copy card is "fully visible for ≥ 0.050 progress = 540px ≥ 3.0s."
   The §3 table delivers (in-ramp end → out-ramp start): `copy.B1` 0.090→0.110 = **0.020**;
   `copy.B2` 0.220→0.245 = **0.025**; `copy.B3` 0.400→0.425 = **0.025**; `copy.B4` 0.548→0.580 =
   **0.032**; `copy.B5` 0.668→0.685 = **0.017**; `copy.B6` 0.805→0.830 = **0.025**. Every single
   card misses the floor — the worst by 3×. At the engaged pace the document itself defines,
   `copy.B5` is fully readable for about one second. The document's central guarantee, the one
   §14 exports to the Creative Director as a 14-word budget, is false as written.
2. **Three on-screen elements violate the Creative Director's closed inventory.** (a) §7.6's
   `ui.progress` — 01 §7.4's reasoned decision is **no progress indicator** (with a designed
   contingency only if review demands one; this review does not). (b) §4-B0's nav "logo +
   **sign-in**" — 01 §2.2 removed the Sign In link with a stated reason. (c) §9.3's post-end
   **50vh footer block** — 01 §2/§5.4: "No footer sections." 01 §7.1's rule is that new elements
   require a PM decision, not a storyboard improvisation; none of these three has one.
3. **`copy.B1` demands words that do not exist.** §3/§8 schedule a `copy.B1` card ("the copy
   deck's 'watch this' beat") — 01 §8.2 contains no such copy. And the slot inventory (five
   teardown cards, 14-word cap, one card at a time) cannot carry 01's eight component sentences
   (see 01 problem 5). The interface both documents claim to honor has a hole in the middle.
4. **The scroll cue contradicts the cue's owner.** §8: a 1px × 44px hairline below `copy.B0`,
   appearing after 2400ms idle, **pulsing every 2800ms**. 01 §7.3: the word "Scroll" over a
   1px × 34px hairline, bottom-center, no pulse, present from arrival. Size, position, behavior,
   and trigger all differ. The visual is 01's; the idle timing is legitimately 03's — split it
   that way.
5. **Loader handoff timing contradicts 01.** §8 exemption 1: "dissolves over 550ms (matching the
   homepage's `#loader` 0.55s)" — the homepage claim is true (verified), but 01 §7.6 specifies
   hold 150ms → fade 400ms → crossfade 600ms. Two specs for one moment.
6. **Reduced-motion render count conflicts.** §11 requires five stills `R0`–`R4` at exact
   timeline states; 01 designs two, 04 delivers three, 02 implies per-beat. §11 is the most
   defensible spec of the four (frame-accurate, story-complete), but it is currently one of four.
7. **Internal inconsistencies.** §1 claims "6 deliberate holds"; the table defines H1–H7 (seven).
   §4-B2 claims the lid "clears the machine body by ≈ 6× its own thickness" — against 04's
   published dimensions (travel 0.50W = 152mm, lid 6.6mm thick) it is ≈23×; the illustrative
   claim is wrong by 4×. §1 assumes depth ≈ 0.72W; 04 builds 212/304 = 0.697W — the §9.1 finale
   math should be re-run on the real number (it survives, but the document should show it).
   §14 asks 02 to support "1300vh/1600vh scene heights," mixing a container number (desktop
   1300 = 1200 travel + 100 stage) with a travel number (mobile 1600 → container 1700).
   The Lid window ends at 0.195 but H2 begins at 0.200 — the 0.005 gap is unowned.

### Verdict: **Rejected**

Problem 1 alone is a rejection: the pacing math is the document's spine, and it does not hold.
The inventory violations (problem 2) are vision-process violations on top.

### Required changes

1. Retime §3 so every copy card's fully-visible window (in-ramp end → out-ramp start) is
   ≥ 0.050. The holds are long enough to absorb this — move each card's in-point earlier into
   its hold (e.g. `copy.B2` in at 0.150–0.165 during the Lid settle, `copy.B5` in at
   0.610–0.625) or lengthen the ranges; then re-verify every continuity check in §3 and restate
   the §7.2 guarantee against the new table. Show the six computed windows in the document.
2. Remove `ui.progress` (and §13 row 19), the nav sign-in mention in §4-B0, and the §9.3 footer
   block — or obtain PM decisions adding each to 01's closed inventory, and cite them. If the
   footer block survives, 01 must write its line; if it does not, §9.3's past-the-end behavior
   must be restated without it.
3. Resolve the copy-slot interface with 01 (one shared table: slot → wording → word count →
   card window). Either add card slots so all eight component sentences ship, or consume 01's
   merged ≤14-word rewrites for B3/B4 and a ruling on the Chassis sentence. Delete `copy.B1`
   or get its wording added to 01 §8.2.
4. §8: adopt 01 §7.3's cue design (the word "Scroll," 34px, bottom-center, no pulse, fade on
   first input) and keep only the idle-delay trigger (2400ms / 1800ms mobile) as 03's
   contribution — or escalate the pulse to the PM as a motion-grammar exception and cite the
   decision.
5. §8: align the loader-handoff timing with 01 §7.6 (150/400/600) or escalate; one spec.
6. §11: carry the PM's ruling on the static-experience still count; if five stands, 01 §7.8 and
   04 §9.1 must be revised to match and this document should say so in §14.
7. Fix the internal numbers: hold count (7), the lid-clearance multiple (recompute against 04
   §3.1), the depth ratio (0.697W, re-run §9.1), the §14 container/travel figures (1300/1700 or
   1200/1600, stated consistently), and close the 0.195–0.200 gap explicitly (assign it to the
   Lid settle or to H2).

---

## 04 — Asset Pipeline

### Strengths

The most predecessor-aware document: per-part AO baked in isolation (§7.4), fully-modeled hidden
faces (§3.3), and the populated-vs-bare board resolution (§1.2) each structurally kill a
documented flaw of the sliced-frame build — this is what "the post-mortem is the checklist"
looks like. The omissions table (§1.3) is honest engineering: the keyboard-deck reasoning is
airtight, the no-cables call is right for the no-hands fiction, and every decision is flagged to
its owner. The material table is specific to the hex, the copper deviation from the reference is
flagged with its vision citation (and agrees with 01 §8.5.2 — good parallel coordination), the
silkscreen "WEBSHARKE ENG-01 · REV A" is Framework-grade honesty, and the QA chapter (§10) is
runnable by a stranger. The §9.4 image-generation prohibition with provenance logging is the
anti-slop philosophy applied to pixels.

### Problems

1. **The budget sums violate interface (c) — fatal arithmetic.** §5.3's 3D path is ≈10.7 MB
   expected / 12.5 MB cap. 02 §8.1 (the budget owner) allows **≤8.5 MB total** for the whole 3D
   mode, of which non-asset items (critical path, three.js, addons, GSAP, our JS, decoders)
   consume ≈2.9 MB — leaving ≈5.6 MB for what this document ships against a GLB ≤5.0 MB + HDR
   ≤1.0 MB allocation. The document's own full downscale ladder saves only 3.4 MB, landing at
   ≈7.3 MB — **still over the global budget with every lever pulled**. The document says the
   sums "must fit inside the Technical Architect's global payload and memory budgets"; they do
   not, by roughly 30%, and no PM renegotiation is cited. (GPU memory ≈27 MB vs ≤48/96 MB,
   triangles 135.5k vs ≤350k, draw calls ≤24 vs ≤40/60, materials 4 vs ≤16 all fit — the
   payload is the one that fails, and it is the one that matters most at 10 Mbps.)
2. **The HDR cap breaks its budget line.** §7.2 caps the environment at 1.2 MB; 02 §8.1 budgets
   ≤1.0 MB. A cap above the owner's budget is not a cap.
3. **The fallback set breaks its budget lines.** §9.3: total ≤1.8 MB, largest file 260 KB.
   02 §8.1: "≤ 220 KB each, ≤ 1.6 MB set." Both numbers exceed the owner's.
4. **Three fallback frames vs the storyboard's required five.** 03 §11/§14 requires renders
   `R0`–`R4` at exact timeline states; §9.1 delivers three (closed/open/exploded) with a
   "designed summary" rationale. The rationale is reasonable — but it is an unagreed rejection
   of an explicit cross-document requirement, and 01 designs two while 02 implies nine. This
   document cannot unilaterally set the count.
5. **The mount point escapes the architecture's file structure.** §6.3 proposes
   `engineering-assets/v1/` at the repo root; 02 §1.2 places assets at `engineering/assets/`
   and its §7.6 immutable-cache header matches only `/engineering/(vendor|assets)/` — at 04's
   proposed path, every multi-megabyte binary would revalidate on every visit. The document
   half-defers ("the Technical Architect may re-root") — full deferral plus one agreed
   versioning scheme (02's `.vN` suffix vs this document's `v1/` directory) is required.
6. **The CSS backdrop gradient violates the Creative Director's census.** §7.1 specifies a
   radial gradient `#efe7da → #ddd2c0` for the page backdrop. 01 §9.1 permits exactly three
   gradients (btn-sand, loader wall, scrim) and 01 §3.4 bans raw hex outside the token block.
   The deferral ("final values are the Creative Director's to confirm") is right in spirit —
   finish it: no numbers, just the requirement, and let 01 specify the backdrop (see 01
   required change 6).
7. **Lighting numbers drift from the mood owner.** Key elevation 35° (§7.2) vs 01 §6's ~40°;
   contact-shadow penumbra "≈ 6–10 mm" (§7.3) vs 01 §6's "8–12% of the laptop's width"
   (= 24–36 mm at 0.304 m). The second is a 3× disagreement on a named acceptance criterion.
   Also minor drift against 02: plane 0.9 m vs 1.2 m, opacity 0.32 vs 0.35, map 1024 flat vs
   tiered 2048/1024 (§7.3 does defer supersede rights to 02 — the numbers should still match or
   be marked as superseded).
8. **Vague where it must be exact:** §3.5's silkscreen typeface is "(e.g. vendored-for-authoring
   DIN-alike)" — an "e.g." in a provenance-audited pipeline is a TBD. Name the exact face and
   license.

### Verdict: **Rejected**

Problem 1 is the interface-(c) arithmetic failure this review was explicitly required to check,
and it fails. The craft content of the document is otherwise close to approvable.

### Required changes

1. §5.3: produce a texture/geometry plan whose **expected** 3D-path total fits inside 02's
   global budget as allocated (≈5.6–6.0 MB for GLB + textures + HDR under the current 02
   numbers) — e.g. atlas B base to 2048 ETC1S with a documented silkscreen-legibility pass,
   atlas B normal to 1024, atlas A base to 1024, and re-derived expected sizes — **or** obtain a
   PM decision-log entry raising 02 §8.1's GLB/total budgets, and cite it. Restate the ladder
   from the new baseline. All caps ≤ the owner's caps.
2. §7.2: cap the HDR at 02's 1.0 MB (the 768×384 fallback already exists in the ladder).
3. §9.3: bring the fallback set inside 02's lines (≤220 KB per file, ≤1.6 MB set) or get the
   budget line changed; recompute the WebP 2560 target.
4. §9.1: align the frame count with the PM's static-experience ruling (if 03's five stills
   stand, produce `R0`–`R4` at 03 §11's exact states; the three-frame argument may be made to
   the PM, not enacted).
5. §6.3: adopt 02's mount location (`engineering/assets/…`) or record the PM's re-rooting
   decision plus the matching cache-header change; agree one versioning scheme with 02 and use
   it in the tree.
6. §7.1: remove the backdrop hex/gradient specification; state only "backdrop is page CSS, spec
   owned by 01 §-ref" once 01 adds it.
7. §7.2/§7.3: match 01 §6's key elevation (~40°) and express the contact-shadow penumbra in 01's
   units (8–12% of laptop width ≈ 24–36 mm) or escalate the disagreement with the mm-derivation
   to the PM; reconcile plane size/opacity/map size with 02 or mark them explicitly as 02's to
   supersede.
8. §3.5: name the exact authoring typeface and its license in place of "(e.g. …)".

---

## Cross-document consistency findings

The four documents were written in parallel and it shows. Findings, with the document that must
yield (per the PM's interface contracts: Creative owns words/UI, Animation owns beat structure
and timing, Architecture owns global budgets and mechanism, Assets own naming/dimensions):

1. **Scrub feel: 02's 0.7s/0.4s vs 03's ≤120ms/≤0.030/settle 250ms.** Timing is 03's. **02
   yields** (or the PM revises 03 §10.2 by decision).
2. **Camera FOV and portrait fit: 02's 32° tweenable + dolly-only vs 03's fixed 24°, portrait
   30°.** Choreography is 03's. **02 yields.**
3. **Node names: 02's PascalCase contract vs 04's snake_case canon.** Naming is 04's. **02
   yields.**
4. **Laptop width: 02's 0.312 m vs 04's 0.304 m.** Dimensions are 04's. **02 yields.**
5. **Lighting: 01 (key back-right ~40°, warm room fill) vs 02 (front-right ~48°, cool fill) vs
   04 (right-rear 35°).** Mood is 01's. **02 and 04 yield to 01's direction and numbers**; 04's
   mm-penumbra must be restated in 01's percentage terms or reconciled by the PM.
6. **Loading experience: 01's designed loader (real-progress hairline) vs 02's poster + "no
   progress bar" vs 03's 550ms homepage-style dissolve.** UI is 01's; **02 and 03 yield** — but
   02's poster-behind-the-loader mechanics can coexist with 01's design and the PM should merge
   them into one written sequence.
7. **Static / reduced-motion render count: 01 = 2, 02 ≈ per-beat (~9), 03 = 5, 04 = 3.** Four
   documents, four answers — the clearest evidence the interface contract itself had a hole.
   **PM must rule** (a `decisions.md` entry). Recommendation: 03 §11's five frame-accurate
   states are the strongest spec narratively and are cheap under 04's pipeline; whatever the
   ruling, all four documents restate the same number and the same states.
8. **Copy slots vs copy deck: 03's five 14-word card slots (plus a `copy.B1` with no words)
   cannot carry 01's eight component sentences.** Joint failure; **PM convenes 01 + 03** to
   publish one slot→wording table both documents reference.
9. **Label policy: 01's one-label-at-a-time vs 03's persist-and-accumulate.** Composition vs
   timing sits exactly on the contract seam; **PM must rule.** (03's accumulate model serves the
   B8 diagram; 01's rule serves one-focal-point. They are both defensible; they are not both
   buildable.)
10. **On-page inventory: 03's `ui.progress`, nav sign-in, and 50vh footer are not in 01's closed
    inventory.** Inventory is 01's; **03 yields** absent PM decisions.
11. **Packaging: 02's embedded-texture GLB + `.vN` files vs 04's external KTX2 + `v1/`
    directory + repo-root mount.** Mechanism is 02's, naming is 04's; **recommend 04's external
    textures at 02's location with one versioning scheme** — PM records it.
12. **Budgets (interface c): 04's ≈10.7 MB expected vs 02's ≤8.5 MB global.** Budgets are 02's;
    **04 yields** or the PM raises the budget by decision. The arithmetic is in 04's problem 1.
13. **Poster format: 02's AVIF+JPEG vs 04's AVIF+WebP.** Either works; pick one, both documents
    state it.
14. **Consistent and correct across documents (credit where due):** the component canon's eight
    names and their order; Chassis-never-moves; the copper deviation (01 §8.5.2 ↔ 04 §4#4, both
    flagged with the same fallback); the battery contingency (01 reserve copy ↔ 03 seated-label
    contingency ↔ 04 non-separating `chassis_battery`) — note 04 **did** add the battery, so the
    PM must now formally activate or decline the 01/03 contingencies; Distillery caps-only
    handling (no document depends on lowercase display type); D-006 respected everywhere (no
    numbered eyebrows, zero banned words in all four documents); the fixed-stage/scroll-track
    mechanism (02) matches the pinned-stage structure 03 assumes; support-board count (3) agrees
    between 03 and 04.

---

## Global questions

**Does this feel handcrafted?** Yes — unusually so for a documentation round. The palette is
sampled at named pixel coordinates; the contrast ratios are genuinely computed (I recomputed two
by hand and they hold); the tableau spacing is derived from projection trigonometry; the beat
order matches how a technician actually works; a sixth camera move was designed, tried, and cut
with the reason recorded. That is what a hundred small human decisions looks like on paper. The
failure mode here is not template-thinking — it is four craftspeople building four slightly
different pages.

**Does anything look AI-generated?** In the design itself, no: no gradients without a light
source, no particles, no floating cards, no HUD, no fake numbers, and the copy is dry and
specific in the owner's register ("It holds everything and asks for no credit"). The banned-word
grep is zero-hit across all four documents. Two things would *read* as generated if shipped
as-written and must die in revision: the storyboard's pulsing scroll cue living alongside the
Creative Director's different static cue (two cues = nobody decided), and any trace of the
`ui.progress` bar the Creative Director explicitly designed out.

**Does every animation have purpose?** On paper, yes — and provably: 03 §13 names a story
sentence for all 22 motion elements, 01 §7.1 does the same for all 9 UI elements, and both
documents record what they cut. The single-mover rule, the zero-overshoot LIFT curve, and the
never-moving Chassis are purpose made mechanical. The one purposeless element is the progress
bar that exists in one document and not the other.

**Is the pacing engaging?** The arc is — arrival stillness, an earned first move, a
recognition payoff placed mid-story, an exhale, and twenty seconds of designed silence before
the only ask. That is a real dramatic structure and a small-business owner would ride it to the
end. But as written the pacing is broken in execution: every one of the six copy cards misses
the storyboard's own 3-second reading floor, the worst by 3×. The engaging arc currently has
unreadable captions. Fix the arithmetic and the pacing stands.

**Is anything distracting?** Three candidates, all fixable: the pulsing cue (if 03's version
survives), the label pile-up by B6 under 03's accumulate policy (seven labels on screen during
the quietest camera move — 01's one-at-a-time instinct is worth weighing seriously), and 02's
cool fill light, which would visibly argue with the warm room every frame.

**Would this impress a client?** Built to these documents — after reconciliation — yes. The
metaphor is the pitch ("a laptop is the most complicated object on most desks, taken apart
calmly"), the proof is on screen rather than in adjectives, and the ending asks once. A
prospective client shown this from a phone would understand both what it is and why it argues
for hiring the people who made it. Nothing in the concept needs to be louder.

**Would this compete with Bruno Simon?** Honestly: not on novelty, and it should not try.
Bruno's site is a genre-founding free-roam toy; this is a directed scroll film, a grammar Apple
established. Where it *can* compete is exactly where the documents aim it — memorability through
one totally-committed idea, an input that feels engineered (the damped scrub done right is the
whole ballgame), and the self-disassembling machine with no technician, which is a genuinely
original image. It will be remembered as "the laptop that took itself apart," and that is a real
answer to "the site you can drive."

**Would this compete for Awwwards Site of the Day?** As specified — with the budgets holding,
the fallbacks designed (they are: 02 §10 and 03 §11 are the most serious accessibility design
this project has produced), the determinism QA (pixel-identical reverse-scrub screenshots) and
zero third-party requests — yes, it would credibly compete on all four judging axes. The risk is
not ambition; it is that the current contradictions (two loaders, four fallback counts, two
label policies) would surface as exactly the finish-depth inconsistencies juries look for.

**What should be rejected?** All four documents, for the specific, fixable reasons above: 03 for
its broken reading-floor arithmetic and inventory violations; 04 for budget sums that exceed the
global budget even after its own mitigation ladder; 02 for contradicting the timing, naming,
dimension, lighting, and loading-UI owners; 01, most narrowly, for timing/structure overreach,
missing copy for required states, and the unspecified backdrop.

**What should be improved even where approved?** Nothing is approved this round, but the
must-keep list is worth stating so revision does not sand it off: 01's measured palette,
closed inventory, and copy deck voice; 02's render-on-demand loop, capability gate, and QA
table; 03's beat arc, camera vocabulary, and purpose audit; 04's isolation-baked AO, honest
omissions table, and provenance rules. The revisions should reconcile the documents, not
dilute them.

---

## Overall verdict

**All four documents are Rejected — none for lack of craft, all for failures of arithmetic and
agreement.** Individually, each is far above template grade; two of them (01 and 03) contain the
best creative thinking this project has produced. But the round's binding standard is that a
developer could build from these documents without one question, and today they could not: the
scrub feel differs by 6×, the scene-graph names differ in case and convention, the laptop is two
different widths, the page has two loaders and four different fallback experiences, the copy deck
and the slot inventory do not fit each other, and both numeric guarantees this review was
required to check — the storyboard's reading floor and the asset pipeline's budget sums — fail
as written. Every one of these has a named owner and a concrete fix listed above, and most are
one-session revisions. The PM owes the team four `decisions.md` entries (static-experience frame
count, copy slot table, label policy, packaging/budget reconciliation) before the revision pass,
because four of the conflicts trace to holes in the interface contracts rather than to any
specialist's negligence. Revise, re-review; the vision is intact and the bar has not moved.

---

## Round 2 re-review (2026-07-01)

- **Documents re-reviewed:** all four, in full, against the round-1 required changes, the vision,
  and each other.
- **Verification notes:** I re-ran the checks. Banned-word grep across all four documents: zero-hit.
  01's corrected Playfair inventory matches `/fonts/playfair-display/` exactly (six upright 400–900,
  four italics 400–700). 01's `.btn-sand` quote is byte-accurate against `index.html` (gradient,
  padding, inset highlight, hover `.4s cubic-bezier(.16,1,.3,1)`). I recomputed by hand: 03's
  arrival-anchor derivation (bezier x at y=0.80 → 0.470 — correct), all eight reading-floor windows
  and every abutment/gap claim in 03 §3 (all correct), 03 §9.1's re-run projection math on 0.697W
  (correct), 02 §6.2's smoother constants against 03 §10.2 (70 ms ≤ 120; drift 0.007 ≪ 0.030 plus a
  hard clamp; settle 238 ms ≤ 250; zero overshoot by construction — all correct), 02 §8.1's line sum
  (8.43 ≤ 8.5 — correct), 02 §4.3's key-light position (elevation exactly 40.0°, bearing 55°
  right-rear — matches 01 §6 and 04 §7.2), 04's texture sums, and 01 §3.3's settled-chip blend
  contrast (10.39:1 — exact). `decisions.md` still ends at D-008: **none of the four rulings the
  round-1 report said the PM owes the team were recorded.** That omission is the direct cause of
  most of what follows.

### The headline

Round 1's fatal failures are genuinely fixed: the scrub feel, the node names, the dimensions, the
lighting rig, the loading experience, the camera spec, the reading floor, the budget sum rule, the
inventory violations, the fallback count and formats — all reconciled, with shown work. But the four
documents were revised **in parallel again, each against the others' round-1 text**, and the result
is a fresh crop of mutual stale citations and two seams where the documents flatly contradict each
other while each claims the other agrees. A developer holding all four still cannot build the copy
deck, the arrival frame, or the asset tree without asking a question.

### 01 — Creative Direction (Round 2)

**Round-1 changes, verified:** all eight addressed in substance. The label transition is now a
clock-free progress ramp (§7.5). The subline constraint was rewritten as a layer-order rule 03's
table already satisfies (§8.5.3 — checked, true). The label policy is a genuinely good joint design
(persist-and-accumulate + active/settled treatment; the B6 seven-chip worry from round 1 is solved
without retiming). Wording now exists for `copy.B1`, the skip link, the `file://` guard, the `h2`s,
the slow-network line; the footer is explicitly ruled out. The stage backdrop (§7.1a) is the best new
section of the round — one `--wall-grad` definition serving loader and stage keeps the gradient
census at three and makes the loader handoff invisible by construction. Static count is five with
alt text for all five. Playfair italics corrected (verified against the repo).

**Problems:**

1. **The "joint" sentence-to-slot table is not joint (Seam A).** §8.2 publishes a six-card deck
   (`copy.B1`–`copy.B6`, B3/B4 merged, Chassis re-homed into `copy.B6`) and claims "03 mirrors this
   table verbatim." 03 §7.1 publishes a *different* table: eight per-component cards
   (`copy.lid`…`copy.chassis`) quoting 01's **retired round-0 sentences**, and it **deletes
   `copy.B1`** on the stated ground that "01's deck contains no such words" — false; §8.2 contains
   exactly those words. Round 1's required change offered "either 03 adds slots or 01 supplies
   merged rewrites"; each document took a different branch, unilaterally, and each now asserts the
   other's agreement falsely. The page's words — the most visitor-facing element — have two specs.
2. **The arrival composition contradicts 03, with a false citation (Seam B).** §5.2 places the
   arrival machine at ≈62% frame width with the title in the left word column at 50vh, and claims
   this is "the framing 03 §4-B0's `P0` camera delivers." 03's published `P0` delivers a **50vw
   centered** machine with the title at 16vh, and 03's entire B1 beat is the 50vw→62vw reframe.
   §5.1's claim that 03 frames "subject center ≈ 62% frame width at every `P*` position" is also
   false (03's P0 and P5 are 50vw). Two first frames; composition is 01's to own, but 01 may not
   claim 03 already delivers what 03 does not.
3. **Stale 03 citations in the label policy.** §7.5 cites `label.fan` at 0.350 / `label.pipes` at
   0.362 — 03's current table says 0.238 / 0.250 (the conclusion survives; the numbers are wrong) —
   and claims "03 §7.4 restates this paragraph verbatim," which it does not (03 §7.4 still
   describes 01's *round-0* one-label-at-a-time position as current).
4. Minor: §7.8 claims `R0` pairs "`copy.B0` + `copy.B1`, per 03 §11" — 03 §11 pairs `R0` with
   `copy.B0` only (its `copy.B1` is deleted). Downstream of problem 1.

**Verdict: Rejected** — narrowly, and for the same shape of reason as round 1: the craft is at
standard (the measured backdrop, the contrast table, the copy voice are the project's best work);
the document's statements about its neighbor are not true.

**Required changes:**

1. §8.2: publish the **actual** joint slot→wording table once the PM records the ruling
   (`decisions.md`): one table — slot IDs, wording, word counts, windows — appearing identically in
   01 §8.2 and 03 §7.1, including an explicit ruling on whether `copy.B1` exists. Re-count §8.3
   against the final deck. Delete "03 mirrors this table verbatim" until it is true.
2. §5.1/§5.2/§5.5: resolve the arrival composition with 03 via the PM — either 01's 62%-arrival
   stands (and 03 §4-B0/B1/§5.2-P0 are explicitly superseded, acknowledging B1's reframe must be
   redesigned by 03), or 03's 50vw arrival stands and §5.2 is rewritten to it. Remove the false
   claims about what 03's camera delivers.
3. §7.5: correct the label in-point citations to 03's current table (0.238/0.250) and remove or
   fulfill the "restates verbatim" claim.
4. §7.8: align `R0`'s paired-text claim with 03 §11 as finally ruled.

### 02 — Technical Architecture (Round 2)

**Round-1 changes, verified:** all ten addressed, most of them exemplarily. The custom progress
smoother (§6.2) is the round's best engineering: it meets every 03 §10.2 number with the derivation
shown (I verified each line), adds a hard drift clamp 03 only implied, and gets its own QA row
(QA-16). Node names are 04's verbatim with a bind-check (QA-17). FOV/camera/portrait-fit are
consumed from 03 correctly, and deleting the proxy's `fov` field so a build *cannot* animate it is
the right kind of paranoia. W = 0.304 everywhere. The lighting rig now implements 01 §6 literally —
key at exactly 40° elevation, 55° right-rear (agreeing with 04's HDR hot spot), warm wall-colored
fill, cool fill and rim deleted. The loader is 01 §7.6 implemented faithfully, with honest
byte-weighted progress and the stall numbers 01 delegated (8 s / 20 s, both reasoned). The budget
lines now sum to 8.43 ≤ 8.5 with a stated governing rule.

**Problems:**

1. **The asset tree contradicts 04's — a mirror-swap (Seam D).** §1.2 adopts "04's `v1/` directory
   versioning" with tree `assets/v1/{models,textures,env,fallback}/` and plain filenames, claiming
   the names are "04 §6.3's, verbatim." 04's revision did the opposite swap: it withdrew the `v1/`
   directory, adopted "02's `.vN` suffix," and publishes `assets/{laptop.v1.glb, textures/*.v1.ktx2,
   env/studio-warm.v1.hdr, posters/}`. Each document adopted the other's round-1 scheme; **no
   definitive tree now exists** — different versioning mechanism, different filenames, different
   fallback directory name (`fallback/` vs `posters/`), different HDR name (04 gives a reasoned
   argument against resolution-in-name that 02's `studio-warm_1k.hdr` violates).
2. **Texture count is stale: 12 vs 04's 11.** 04 dropped the aluminum normal map with a full
   rationale; §1.2's tree pattern still generates `aluminum_normal.ktx2`, §7.1 says 14 P2
   requests / a 14-entry manifest (should be 13), §11.1 says "any of the 12 KTX2 textures."
3. **Ground-shadow rig mirror-swap (Seam E).** §3.1/§4.3 specify 0.9 × 0.9 m, opacity 0.32, bias
   −0.0002 as "04 §7.3's values, adopted." 04 §7.3 now specifies 1.2 × 1.2 m, 0.35, −0.0003 as
   "02's, adopted verbatim" and withdraws its 0.9/0.32. Both attributions are false; the numbers
   conflict; and 01 §6's "~35% strength" sides with 0.35, not 0.32.
4. **Stale timeline constant.** §6.4: `master.addLabel('B8', 0.918)` — 03 §3's B8 starts at
   **0.928**. The section's promise ("every number … is a transcription from 03 §3") is broken by
   its own example.
5. Minor stale attributions: §8.1's GLB parenthetical ("04 §6.2's own cap (expected 1.2 MB)" — 04
   now says expected 1.05, cap 1.20); §8.1a's fallback numbers ("≤ 260 KB … 04 §9.3's largest
   variant, the 2560 WebP" — 04's 2560 WebP cap is now 130 KB; set ≤ 1.6 MB, not 2.83). These are
   compatible (04 under-ships the ceilings) but factually misattributed.
6. Open, and 02 flags it correctly: the textures ≤ 2.8 MB line vs 04's expected 3.23 MB (Seam F,
   charged to 04 below) — 02's "until that entry exists, this line is the allocation" is the right
   posture; the PM entry still does not exist.

**Verdict: Rejected.** The engineering core is now the strongest document of the four, but its
interface citations to 03 and 04 contain hard numbers a builder would transcribe wrongly (tree,
texture count, B8 address, shadow rig).

**Required changes:**

1. §1.2/§7.1/§7.6/§10.2/§12.3: publish **one** asset tree with 04, PM-recorded: as mount/versioning
   owner, state the versioning mechanism as your own decision (stop attributing it to 04), and take
   04's **current** file canon inside it (11 KTX2 files, 04's HDR naming rationale, one agreed
   fallback-directory name). Fix 12→11, 14→13, the tree's texture pattern, and every `assets/…`
   path in the document to the agreed tree.
2. §3.1/§4.3: publish the ground-plane spec as your own rig decision, reconciled with 04 §7.3 to a
   single set of numbers (given 01 §6's "~35% strength," 0.35 is the defensible opacity), and delete
   the false "04 §7.3's values" attribution.
3. §6.4: correct `B8` to 0.928 and re-verify every transcribed address against 03 §3 as revised.
4. §8.1/§8.1a: refresh the stale 04 citations (GLB expected/cap; fallback per-file/set) or state
   them as deliberately looser architecture-side ceilings without attributing them to 04.

### 03 — Animation Storyboard (Round 2)

**Round-1 changes, verified:** the fatal arithmetic is fixed, properly. The timeline was rebuilt
around eight card slots and **every one of the eight windows now meets the reading floor** — I
recomputed all eight (including the widened 0.055 floor for the 12-word card), every stated
abutment, every stated gap, and the arrival-anchor derivation; all correct. `ui.progress`, the nav
Sign In, and the footer block are gone, each with the right reasoning. The cue and loader handoff
now consume 01's designs with only the trigger/clock retained here — exactly the split round 1
required. Every internal number flagged in round 1 is fixed (7 holds; 23× lid clearance; 0.697W
re-run in §9.1 — verified; 1300/1200 and 1700/1600 stated consistently; the orphan gap closed by
construction). The battery contingency is updated to 04's shipped reality and both variants are
priced. This is, in isolation, the best storyboard revision I could have asked for.

**Problems:**

1. **The slot table quotes words the Creative Director retired (Seam A).** §7.1 claims all wording
   is "quoted verbatim from 01 §8.2." Of its nine quoted body strings, only `copy.lid` and
   `copy.support` are in 01's current deck. `copy.fan`, `copy.pipes`, `copy.storage`,
   `copy.memory`, `copy.mainboard`, and `copy.chassis` quote 01's **round-0 standalone sentences**,
   which 01 §8.2 explicitly retired into merged cards; the subline quoted ("one piece at a time")
   is round-0 — 01's is "layer by layer"; and `copy.close`'s quoted second line ("You've just seen
   how we treat complicated", 7 words) is the round-0 line 01 deliberately shortened to fit its
   ≤6-word Distillery rule — as quoted here it **breaks the caps-face line-length discipline**.
2. **`copy.B1` deleted on a false premise.** §7.1: "01's deck contains no such words." 01 §8.2 now
   contains exactly those words ("That was you. This page only moves when you do."), written in
   response to round 1. Whether B1 carries a card is a legitimate storyboard question — but it must
   be argued against 01's real deck and settled by the PM, not asserted from a stale read.
3. **The arrival composition consumed from 01 is 01's round-0 spec (Seam B).** §4-B0/§8 specify
   machine centered 50vw/58vh with the title at 16vh, "consumed verbatim (01 §5.2)" — 01 §5.2 now
   specifies the machine at ≈62% with the title in the left word column at 50vh. B1's entire
   dramaturgy (the 50→62vw reframe) exists only under the old arrival; if 01's new arrival stands,
   B1 must be redesigned, and if it does not, 01 must retract it. Either way the current pair of
   documents describes two different first frames.
4. **Stale interface notes.** §7.4 still describes 01 as "currently specif[ying] one-label-at-a-time"
   (01 §7.5 now publishes persist-and-accumulate with an active/settled treatment and states no
   retiming is needed — the two policies are substantively compatible, and this document doesn't
   say so). §14 still cites "01 §8.5.3's 'one piece at a time' constraint" — withdrawn; 01's
   replacement is a layer-order rule this table already satisfies.
5. Trivial: B8's label re-entry starts at 0.930 against a beat boundary of 0.928 — a 0.002 sliver
   the partition claim (continuity check 3) technically leaves unnamed. State it as part of the P5
   hold.

**Verdict: Rejected** — solely on the 01 seam. The timing spine is now sound and verified; the
document's claims about what 01 says are not.

**Required changes:**

1. §7.1: carry the PM-recorded slot table (see 01 required change 1) with 01's **current** wording
   verbatim — or, if the eight-slot structure wins the ruling, with the wording 01 issues for eight
   slots. Re-run the §7.2 floor formula against the final word counts (the mechanism is already in
   place). Restore or formally delete `copy.B1` per the ruling, arguing from 01's real deck.
2. §4-B0/§5.2/§8: consume 01 §5.2 **as revised** (or the PM's arrival ruling) and restate B1
   accordingly — including what happens to the 50→62vw reframe if arrival is already at 62vw.
3. §7.4/§14: replace the stale characterizations of 01's label policy and 01 §8.5.3 with the
   current ones; state plainly that 01's active/settled treatment layers onto this schedule with no
   retiming (01 has already verified this against your B3 stagger).
4. §11: confirm the R-still text pairings against the final deck.

### 04 — Asset Pipeline (Round 2)

**Round-1 changes, verified:** substantially addressed. The HDR cap is 1.0 MB = 02's line. The
fallback set is rebuilt to five stills with per-file/set caps and an explicit two-step encode
contingency. The backdrop spec is fully deferred to 01 (whose §7.1a now exists — the two mesh
cleanly). Key elevation is 40°, the penumbra is restated in 01's terms (24–36 mm), and the
silkscreen face is named exactly (D-DIN, SIL OFL 1.1, provenance-logged, never shipped as a font —
D-004 intact). The bead-blasted-vs-brushed aluminum question is flagged to the PM honestly rather
than decided silently — the correct handling.

**Problems:**

1. **Interface (c) fails again as written (Seam F).** §5.3 claims "the plan below fits the owner's
   numbers as published" against a "model + textures ≤ 5.0 MB" line — **02's revision contains no
   such line.** 02 §8.1 as published splits it: GLB ≤ 1.8 MB and **textures ≤ 2.8 MB** ("until
   [a PM] entry exists, this line is the allocation"). Against those lines: GLB expected 1.05 ✓,
   HDR 0.85 ✓, but textures expected **3.23 MB > 2.8** (caps 3.80), and the caps total (6.0 MB)
   exceeds 02's asset allocation (5.6 MB) — substituting them would push 02's line-sum to 8.83 >
   8.5. The §5.3 derivation also quotes 02's round-1 non-asset numbers (critical 0.40, GSAP 0.13;
   now 0.30 / 0.14). The gap is small and 04's own ladder covers it (steps 1–2 = −0.75 MB → 2.48 ≤
   2.8), but the round-1 mandate was exact: fit the owner's published lines **or cite a PM entry**.
   Neither is true, and the claim that it is true is the failure.
2. **The five still addresses are stale against their owner (Seam G).** §9.1/§9.2/§10.7 fix the
   captures at 0.000/**0.200/0.655/0.790**/1.000, calling them "03 §11's … verbatim." 03 §11's
   revised addresses are 0.000/**0.160/0.633/0.743**/1.000. Under 03's current table, p = 0.200 is
   89% through the P1→P2 camera move — contradicting this document's own row ("Camera: P1") — and
   p = 0.655 sits inside the P3→P4 move. QA §10.7 would enforce the wrong frames.
3. **Versioning mirror-swap (Seam D, the other half).** §6.3 adopts "02's `.vN` file-suffix scheme"
   and withdraws the `v1/` directory — while 02's revision adopted the `v1/` directory as "04's."
   The two published trees disagree on mechanism, names, and the `posters/`-vs-`fallback/`
   directory.
4. **The poster contradicts 02.** §9.3: "`teardown-r0_2560` is the poster (02 §7.2 preloads it) …
   inside 02's ≤ 180 KB poster line." 02 §7.2 explicitly **declines** the poster ("two first-frames
   would be two designs") and §8.1 removed the poster line ("no poster exists").
5. Minor: §7.3 attributes 1.2 m/0.35/−0.0003 to 02, which now states 0.9/0.32/−0.0002 (Seam E);
   §9.3 cites "02 §8.1's lines (≤ 220 KB/file, ≤ 1.6 MB set)" which 02 no longer states (its §8.1a
   now allows more — compatible, but the attribution is stale).

**Verdict: Rejected.** The craft chapters (modeling, materials, AO isolation, QA) are approvable as
they stand; the document's stated relationship to 02's budgets and 03's addresses is not.

**Required changes:**

1. §5.3: re-derive against 02 §8.1 **as published** (GLB ≤ 1.8 / textures ≤ 2.8 / HDR ≤ 1.0;
   non-asset caps 2.83 MB): either bake ladder steps 1–2 into the baseline so expected textures
   ≤ 2.8 with caps ≤ the line, or obtain and cite the PM decision-log entry re-splitting 02's lines
   inside the 8.5 total. Delete the phantom "5.0 MB" line and the round-1 non-asset figures.
2. §9.1/§9.2/§10.7: adopt 03 §11's published addresses (0.000/0.160/0.633/0.743/1.000) — your own
   camera column already requires them.
3. §6.3: republish the tree per the joint PM ruling with 02 (one versioning mechanism, one
   directory name for the stills, your file canon inside).
4. §9.3: delete the poster designation and its 02 citations, or escalate to the PM if you believe
   a poster should exist against 02's reasoned refusal.
5. §7.3: quote 02's final rig numbers once Seam E is settled.

### Cross-document consistency findings (Round 2)

**Healed since round 1 (verified):** scrub feel (02 implements 03 §10.2 exactly, math shown);
camera FOV/portrait fit (02 = 03); node names (02 = 04, byte-for-byte, QA'd from both sides);
laptop width 0.304 m everywhere; lighting (01 = 02 = 04: key 40° elevation, 55° right-rear, warm
`#fff3dd`, warm room fill, 4:1, penumbra 8–12% of W = 24–36 mm); loading experience (one design,
01's, implemented by 02, consumed by 03); scroll cue (01's object, 03's clock — both documents
state the same spec); `ui.progress`/nav Sign In/footer (gone everywhere); static-experience count
(five, all four documents) and formats (AVIF+WebP); reading floors (03's table now honors its own
guarantee); track heights (02 = 03: 1300/1700 containers, 1200/1600 travel); eases (02 registers
03's exact beziers); battery status (all four aligned on "pending PM activation," both variants
priced); backdrop (01 specifies, 02 hosts, 04 defers). This is most of round 1's list, and it is
real convergence, not paraphrase.

**Still broken, with who yields:**

1. **Seam A — the copy deck.** 01's six merged cards vs 03's eight cards quoting retired wording;
   `copy.B1` shipped by 01, deleted by 03 on a false premise. Wording is 01's; slot structure is
   03's; the round-1 either/or was taken twice, once by each. **PM must finally record the slot
   table (the entry owed since round 1); both documents then carry it identically.** My
   observation, not a design: 03's eight-slot structure passes its own floors and 01's retired
   round-0 sentences were written for exactly those slots — the shortest path is likely eight
   slots with 01 (re)issuing the wording, but that is the PM's call with 01 holding the pen on
   words.
2. **Seam B — the arrival frame.** 01 §5.2 (62%, title at 50vh) vs 03 P0/B1 (50vw, title 16vh,
   reframe to 62vw). Composition is 01's; choreography is 03's; both cite the other falsely. **PM
   rules; the loser rewrites; B1's reframe is redesigned or retained accordingly.**
3. **Seam D — the asset tree.** 02 (`assets/v1/` directories, plain names, `fallback/`,
   `studio-warm_1k.hdr`) vs 04 (`.v1` suffixes, `posters/`, `studio-warm.v1.hdr`, 11 textures) — a
   perfect mirror-swap of round-1 positions. Mount and versioning are 02's; names are 04's. **PM
   records one tree; both documents restate it.** 04's resolution-out-of-the-filename argument
   should survive whichever mechanism wins.
4. **Seam E — the shadow rig numbers.** 02 (0.9/0.32/−0.0002 "= 04's") vs 04 (1.2/0.35/−0.0003
   "= 02's"). Rig is 02's mechanism; 01 §6's "~35%" favors 0.35. **02 publishes its own final
   numbers; 04 quotes them.**
5. **Seam F — the texture budget.** 04's expected 3.23 MB vs 02's published 2.8 MB line. Budgets
   are 02's. **04 yields (its own ladder suffices) or the PM re-splits the lines by decision.**
6. **Seam G — the still addresses.** 04's 0.200/0.655/0.790 vs 03 §11's 0.160/0.633/0.743.
   Addresses are 03's. **04 yields** (five numbers).
7. **Seam H — the poster.** 04 designates one; 02 declines any. Loading UI is 01's and 01's loader
   needs no poster; **04 yields** or escalates.
8. Small stale constants: 02's `B8 = 0.918` (03: 0.928) — **02 yields**; 02's "12 KTX2 / 14
   requests" (04: 11 / 13) — **02 yields**; 01 §7.5's label addresses and 01 §7.8's `R0` pairing —
   **01 yields**; 03 §7.4/§14's characterizations of 01 — **03 yields**.
9. **Root cause, named plainly:** the PM never wrote the four `decisions.md` entries round 1 said
   were owed (static count, copy slots, label policy, packaging/budgets). Three of the four seams
   above are those same holes. The specialists reconciled everything that had a clear owner and
   diverged almost exactly where the PM's ruling was missing. **Before any round-3 revision, the
   decisions must be recorded** — otherwise round 3 will diverge the same way, and that would be a
   process failure, not a specialist failure.

### Global questions (Round 2)

**Does this feel handcrafted?** More than round 1, and round 1 already passed. The revisions added
derivations instead of assertions: the arrival anchor is solved from the easing bezier rather than
eyeballed; the smoother's every constant is proven against the timing owner's budget; the backdrop
and loader share one gradient definition so the handoff is invisible *by construction*; the settled
label keeps full-strength ink while only its paper fades. These are the fingerprints of people
making specific decisions for stated reasons.

**Does anything look AI-generated?** In the designed page, no — the round-1 risks (two loaders,
two cues, a progress bar) are dead, the banned-word grep is zero-hit, and nothing new was invented
to fill space. What *would* read as machine-made if shipped today is the seams themselves: a page
whose first frame follows 01 will contradict a scroll story built by 03, and captions would flicker
between two decks. Contradiction is the tell juries and owners both catch.

**Does every animation have purpose?** Yes, and the audit is stronger: 03 §13 now carries 23 rows
including the new deletions (the pulsing cue and the progress bar died with their reasons recorded),
and the one visible text exit (`copy.B0`) is justified as the page's reversibility lesson. Nothing
moves without a sentence.

**Is the pacing engaging?** Now provably, which round 1's version was not: every one of the eight
cards clears the 3-second floor at the document's own fastest engaged pace (verified), the holds
absorb the reading, the recognition beat still lands mid-story, and the ending's 0.016 of designed
silence survives. The arc was always right; the arithmetic finally supports it.

**Is anything distracting?** On paper, one thing only: the unresolved arrival means the first
viewport — the single most important frame — is currently two frames. Everything else that
distracted in round 1 (cool fill, pulsing cue, label pile-up) has been designed out; the
active/settled label treatment in particular resolves the B6 seven-chip worry elegantly.

**Would this impress a client?** Yes — the concept was never the problem, and the execution spec
beneath it is now largely one page instead of four. A client shown the reconciled build would meet
a calm, warm, precise thing that no template resembles.

**Would this compete with Bruno Simon?** The round-1 answer stands: not on novelty, and rightly
so — but the damped scrub is now specified to the millisecond with a QA row that measures it, and
"the laptop that takes itself apart with nobody touching it" remains a genuinely ownable image. The
input feel, which is the whole ballgame, is the best-specified part of the project.

**Would this compete for Awwwards Site of the Day?** As specified — with the two seams closed —
yes, more credibly than round 1: the finish-depth surfaces juries probe (loading, reduced-motion,
keyboard, focus, determinism) are not just designed but cross-verified between documents, and the
budgets now arithmetically cohere at the architecture level. The only thing that would sink a jury
pass today is the same thing that would sink a build: two copy decks and two trees.

**What should be rejected?** All four documents, again — but for a much smaller and completely
enumerable set of reasons: 01 and 03 for the copy/arrival seam and their false claims about each
other; 02 and 04 for the tree/versioning mirror-swap plus their respective stale constants; 04
additionally for an interface-(c) claim that is false against 02 as published. Nothing is rejected
for craft this round.

**What should be improved even where approved?** Nothing is approved, but the protect-list from
round 1 held through revision and grew: keep 03's anchor derivation and floor formula, 02's
smoother and its QA-16/17, 01's one-gradient backdrop/loader unification and the active/settled
labels, and 04's ladder discipline and the honestly-flagged bead-blast question. Round 3 should
change citations and tables, not designs.

### Overall verdict (Round 2)

**All four documents are Rejected — but the distance closed this round is large and real.** Every
fatal round-1 failure of craft and arithmetic is fixed and verified: the scrub, the floors, the
lighting, the loader, the budgets' internal sum, the inventory. What remains is a coordination
failure with a precise shape: the specialists revised in parallel against each other's round-1
text, so each document now quotes a neighbor that no longer exists — six of 03's nine quoted copy
strings, 01's citations of 03's camera and label addresses, 02's and 04's mutual adoption of each
other's *abandoned* packaging schemes, 04's stale still addresses and phantom budget line. Two
seams block a build (the copy deck and the asset tree); one seam blocks the first frame (arrival);
the rest are one-line fixes. The root cause is unchanged from round 1 and is now on its second
citation: **the PM has not written the owed `decisions.md` entries.** The order of operations for
round 3 is therefore non-negotiable: PM records the rulings (copy-slot table, arrival composition,
asset tree + versioning, texture-line split, plus the battery activation already queued) — then
the documents revise against the *recorded* rulings, citing them, in one pass each. Done that way,
round 3 is a short round, and on present evidence it will pass.

---

## Round 3 re-review (2026-07-01)

- **Documents re-reviewed:** all four, in full, against the round-2 required changes, the vision,
  and each other.
- **Verification notes:** I re-ran the checks. Banned-word grep across all four documents:
  zero-hit. `decisions.md` **still ends at D-008** — none of the five entries owed since round 1
  exists; both 01 and 03 cite "the PM's revision-round rulings (queued for `decisions.md`)" and
  those queued rulings say **opposite things**. Recomputed by hand and correct: 03's retimed
  opening and all six card floors (10→0.050, 8→0.050, 12→0.055, 11→0.055, 10→0.050, 12→0.055
  against delivered 0.050/0.050/0.055/0.055/0.050/0.130), every continuity gap and abutment in
  03 §3, every arrival anchor (0.124/0.238/0.409/0.421/0.612/0.717 from the 0.47 formula), 03's
  new `P0` derivation (extent 1.197W; 4.15W → 38.2%) and the quiet-zone distance ladder
  (2.90/2.95W), the §9.1 tableau math on 0.697W and the `P5` 14% margin; 02's §8.1 line sum
  (8.43 ≤ 8.5), the key-light elevation (exactly 40.0°, bearing 55° right-rear), and the new
  ground-plane derivation (the Lid's +1.08W tableau shadow lands ≈ 0.53 m from center at the 40°
  key — a 0.9 m plane clips it, 1.2 m holds it); 04's rebuilt sums (atlas caps 0.70 + 1.13 +
  0.53 + 0.44 = **2.80 MB = 02's texture line exactly**, expected 2.48 ≤ 2.8, asset caps 5.00 ≤
  5.6, worst-case cold-cache 2.83 + 5.00 = **7.83 ≤ 8.5**, fallback 20 files ≤ 1.60 MB at cap /
  ≈ 1.21 expected). The still addresses 0.000/0.160/0.633/0.743/1.000 agree across 02/03/04 and
  survive 03's opening retime (only 0.000–0.160's interior moved; 0.160 itself is a hold
  boundary, as 04's camera column requires).

### The headline

Round 2's closing warning has come true, literally. The PM never wrote the owed `decisions.md`
entries; the four specialists revised **in parallel against each other's round-2 text a second
time**; and every seam that was a mirror-swap in round 2 has now mirror-swapped **again**. 01
adopted 03's round-2 copy structure while 03 adopted 01's round-2 copy structure; 01 adopted 03's
round-2 arrival while 03 adopted 01's round-2 arrival; 02 adopted 04's round-2 versioning while 04
adopted 02's round-2 versioning; 02 published 04's round-2 shadow rig while 04 re-quoted 02's
round-2 rig. Meanwhile everything with a single settled owner got *better*: the budget arithmetic
(Seam F), the still addresses (Seam G), and the poster (Seam H) are genuinely healed and verified.
Nothing in this round fails on craft or arithmetic — every number I checked holds. The failures
are, for the third consecutive round, documents making false statements about their neighbors, and
this time each false statement was manufactured by the process itself.

### 01 — Creative Direction (Round 3)

**Round-2 changes, verified:** (1) attempted in good faith — one slot→wording table with IDs,
windows, counts, an explicit `copy.B1` ruling, per-mode word budgets recounted (128/152, arithmetic
checked), and the false mirror claim deleted — but executed against 03's *round-2* eight-slot
table, which 03 has since abandoned. (2) attempted — the arrival is resolved to one frame with
real composition reasons, the round-2 62% arrival explicitly withdrawn — but resolved to 03's
*round-2* centered arrival, which 03 has since abandoned. (3) genuinely fixed: the label
in-points (0.238/0.250) are correct against 03's current table and the "restates verbatim" claim
is gone. (4) executed — `R0` pairs `copy.B0` only — which 03's revision now contradicts from the
other side.

**Problems:**

1. **Seam A, mirror-swapped (fatal).** §8.2 publishes eight per-component cards
   (`copy.lid`–`copy.chassis`) and rules `copy.B1` out of existence, claiming "every slot ID,
   window, and word count above matches 03's table." False: 03 as revised publishes **six merged
   cards** (`copy.B2`–`copy.B6`) with different sentences and different windows, and **restores
   `copy.B1`** with the exact sentence §8.2 declares "retired unused." 01's quoted windows no
   longer exist in 03 — `copy.lid` (0.108–0.188) matches nothing, and `copy.pipes` (0.323–0.403)
   would sit inside 03's deliberately card-free B4 camera window (0.343–0.388). The page's words
   have two specs for the third consecutive round.
2. **Seam B, mirror-swapped (fatal).** §5.2 adopts the centered 50vw arrival (title top-center at
   16vh) and claims "the framing 03 §5.2's `P0` camera (distance 2.60W) delivers" and that "03
   §4-B0, §4-B1, and §5.2-`P0` stand as published; nothing in 03 requires redesign." False on
   every count: 03's published `P0` is **4.15W delivering a 62vw / 38%-width arrival** with the
   title in the left word column at 50vh, and 03 **deleted** the 50→62vw reframe that §5.1 says
   "carries the subject to 62vw." §5.1's "subject center is 50vw at `P0` and `P5`, 62vw at
   `P1`–`P4`" is also false (03: 62vw at `P0`–`P4`). Two first frames, sides exchanged.
3. **The loader-poster ghost.** §5.2(c) ("the loader poster, the static article's `R0`, and the
   arrival are one identical frame"), §7.6 ("the Technical Architect's poster-first mechanics
   (static shell + poster behind)"), and §8.4 ("the loader poster, which is `R0` doing double
   duty") all reference a poster that **no document ships**: 02 §7.2 explicitly declines any
   poster ("no poster exists"), 04 §9.3 deleted its designation, and preloading `R0` would fail
   02's QA-1 (zero `assets/fallback/` requests in 3d mode). Seam H healed between 02 and 04; its
   ghost survives only here, and as written it directs a builder to violate another document's QA.
4. Minor: §7.5's status note claims 03 §7.4 "still characterizes this document's withdrawn
   round-0 one-label-at-a-time rule as current" — stale; 03 §7.4 as revised carries the joint
   policy in full. (Self-neutralizing as written, but it should not survive another pass.)

**Verdict: Rejected.**

**Required changes:**

1. §8.2/§8.3: carry the PM-**recorded** slot table (the decision entry must exist first and be
   cited by number) identically with 03 — one structure, one wording set, one `copy.B1` ruling;
   recount the word budget; every statement about 03's table must be true against 03 as it stands
   after the same ruling.
2. §5.1/§5.2/§5.5: restate the arrival against the PM's recorded arrival ruling and delete the
   false 03 citations (the 2.60W `P0`, the reframe attribution, the 50vw-at-`P0` claim). Whichever
   frame wins, both documents must describe it identically.
3. §5.2(c)/§7.6/§8.4: delete all three poster references (restating §8.4's `#stage` note and
   §7.6's merge note without them), or escalate a poster into existence via the PM against 02
   §7.2's reasoned refusal. No middle state.
4. §7.5: delete the stale characterization of 03 §7.4.

### 02 — Technical Architecture (Round 3)

**Round-2 changes, verified:** all four addressed as specified, and most of the work is right:
the tree is published as this document's own mount/versioning decision with an 11-file canon and
the counts fixed everywhere (12→11, 14→13 — checked); the ground rig is published as its own final
numbers with a shown derivation (1.2 m plane forced by the tableau shadow; 0.35 = 01 §6's "~35%";
−0.0003 justified at both map sizes) and 01's penumbra criterion restated; `B8` is corrected to
0.928 with a full transcription audit; the §8.1/§8.1a refreshes against 04 are **accurate against
04 as revised** (GLB 1.05/1.20, fallback 130 KB largest / 1.6 MB set / 0.65 MB worst visitor —
all checked true). The Seam F posture ("no PM re-split needed; 04's own ladder fits my line") is
exactly what 04's revision then did.

**Problems:**

1. **Seam D, third iteration (fatal at the interface).** §1.2 claims "04 §6.3 as published
   already mounts at `engineering/assets/` with this same `.vN` scheme, so the two trees now
   differ in exactly one token." False: 04 as published **withdrew** `.vN`, adopted an immutable
   `v1/` version directory with plain filenames, and added a `models/` subdirectory — 04 delivers
   `assets/v1/models/laptop.glb`; this document's 13-entry manifest fetches `assets/laptop.v1.glb`.
   Built as written, every asset request 404s and the page falls to static on a perfect asset —
   the same failure shape as round 1's node-name break.
2. **Seam E prediction, falsified.** §4.3 states "04 §7.3's published quotation of exactly these
   values — 1.2 m / 0.35 / −0.0003 — becomes true as of this revision." It did not: 04's published
   quotation mirror-swapped to this document's withdrawn 0.9/0.32/−0.0002. The rig numbers
   themselves are right and derived; the claim about 04 is wrong.
3. **Stale 03 constant.** §6.4 places `B2` at **0.075**; 03 §3 as revised moved the B1/B2 boundary
   to **0.105** (Lid window 0.105–0.145), and 03 §14 explicitly directs the re-read. The audit's
   own promise — "every 03 constant … re-verified against 03 as revised this round" — is false
   for B2, the exact failure the audit was added to prevent.
4. Minor: §4.2's "the farthest, `P5` at 3.00W ≈ 0.91 m" is stale — 03's re-derived `P0` sits at
   4.15W ≈ 1.26 m (the 12 m far plane is unaffected; the sentence is simply no longer true).

**Verdict: Rejected** — narrowly. The engineering core is unchanged and remains the strongest
document in the project; every defect is a stale or falsified cross-citation.

**Required changes:**

1. §1.2/§7.1/§7.2/§7.6/§12.3: after the PM records the packaging entry, publish the one tree with
   04 and cite the entry — this document's mechanism (per-file `.vN`, as owner, unless the entry
   rules otherwise) around 04's **current** file canon (including an explicit ruling on the
   `models/` subdirectory), and delete the false "differ in exactly one token" convergence claim.
2. §6.4: `B2` → 0.105; re-run the transcription audit against 03 §3 as revised (the retimed
   region is 0.000–0.160's interior) and correct §4.2's farthest-pose sentence to `P0` at 4.15W.
3. §4.3: replace the prediction about 04 §7.3 with the fact (04 defers normatively and must
   transcribe 1.2/0.35/−0.0003 in its next pass, or the decision entry is cited).

### 03 — Animation Storyboard (Round 3)

**Round-2 changes, verified:** (1) executed with real rigor — the six-card floor formula re-run
is correct in every cell, the retimed opening (B1 0.000–0.105, Lid 0.105–0.145) is internally
sound, and the continuity checks all pass — but executed against 01's *round-2* six-card deck,
which 01 has since abandoned, and `copy.B1` was restored on a premise ("01 §8.2 ships exactly
those words") that 01's revision has since falsified (the sentence is now "retired unused" and the
slot ruled non-existent). (2) executed with the same rigor in the same wrong direction: the 62vw
arrival was consumed from 01's *round-2* §5.2, B1 rebuilt as a pure dolly, and `P0`–`P4`
re-derived (the trigonometry is correct — I checked it) — while 01 simultaneously withdrew the
62% arrival and adopted the centered frame. (3) genuinely fixed: §7.4 carries the joint label
policy verbatim, and §14 carries 01's layer-order rule, which §3 satisfies (checked: B2 = Lid
layer, B3–B5 = components plane, B6 = Mainboard, Chassis still). (4) §11's pairings match this
document's final deck — which is not 01's.

**Problems:**

1. **Seam A, mirror-swapped (fatal).** §7.1 claims all wording is "quoted verbatim from 01 §8.2
   as revised." False: 01 as revised publishes **eight per-component cards** and no `copy.B1`.
   Four of this table's six teardown wordings (`copy.B1`, `copy.B3`, `copy.B4`, `copy.B6`) do not
   exist in 01's current deck (only `copy.B2` and `copy.B5` match). The restoration argument for
   `copy.B1` — right or wrong on the merits — is argued from a deck 01 no longer publishes.
2. **Seam B, mirror-swapped (fatal).** §4-B0/§5.2/§8 present the 62vw arrival as "01 §5.2 as
   revised" — false; 01 as revised places the machine dead-center at 50vw with the title
   top-center at 16vh and expects a B1 reframe this document has deleted. Two first frames and
   two B1s, sides exchanged from round 2.
3. §11 pairs `R0` with `copy.B0` + `copy.B1`; 01 §7.8 pairs `copy.B0` only. Downstream of
   problem 1, listed so the fix is not forgotten.
4. §14's Creative Director paragraph restates both stale reads as settled agreements, which will
   mislead the master-spec synthesis if left standing.

**Verdict: Rejected** — for the third time solely on the 01 seam. The timing spine, the floors,
the derived camera ladder, and the purpose audit are all sound and verified; they are aimed at a
composition and a copy deck that no longer exist.

**Required changes:**

1. §7.1/§3: carry the PM-recorded slot table identically with 01 (cite the entry); re-run §7.2
   and the §3 card windows against whichever deck the entry fixes; `copy.B1` lives or dies by the
   ruling, argued against 01's real deck.
2. §4-B0/§4-B1/§5.2/§8/§14: restate the arrival per the recorded ruling. Both variants are now
   fully designed (this round's 62vw dolly opening and round 2's 50vw reframe opening) — state
   which is live and retire the other explicitly.
3. §11: align `R0`'s paired text with the final deck.
4. §14: replace the "as revised" characterizations of 01 with citations of the recorded rulings.

### 04 — Asset Pipeline (Round 3)

**Round-2 changes, verified:** (1) genuinely fixed, and well: §5.3 is re-derived against 02 §8.1
as published, the ladder's first two steps are baked into the baseline with their costs stated
honestly, the phantom "5.0 MB" line and round-1 non-asset figures are gone, and the arithmetic
holds everywhere I checked (atlas caps sum to 02's 2.8 line *exactly*; worst-case total 7.83 ≤
8.5; GPU ≈ 14 MB ≤ 48). The upgrade ladder recording the design intent is exactly the right way
to lose a budget argument. (2) genuinely fixed: 0.000/0.160/0.633/0.743/1.000 in §9.1/§9.2/§10.7,
with the hold-boundary verification shown — and still correct after 03's opening retime. (4)
genuinely fixed: the poster is deleted and 02's reasoning accepted rather than escalated. (3) and
(5) were executed as directed — and both were invalidated by 02 revising past them in parallel.

**Problems:**

1. **Seam D, the other half (fatal at the interface).** §6.3 adopts "the Technical Architect's
   [tree], adopted here as published (02 §1.2, current revision)": `engineering/assets/v1/` with
   plain filenames — and withdraws its own `.vN` scheme as "02's abandoned round-1 mechanism."
   Both claims are false against 02 as published: `.vN` per-file suffixes are 02's **current**
   mechanism, published as its own mount-owner decision, and 02's tree has no `models/`
   subdirectory. The two documents have now traded versioning schemes twice without ever holding
   the same one in the same round.
2. **Seam E ghost.** §7.3 prints, as "published in 02's current revision," the rig numbers
   0.9 × 0.9 m / 0.32 / −0.0002 — 02's current revision publishes **1.2 / 0.35 / −0.0003** as its
   final numbers, with a derivation that makes 0.9 m physically wrong (the tableau Lid's shadow
   lands outside it). The normative deferral ("this section tracks [02] without edits") is the
   correct posture; the printed quotation is still a wrong number a builder would transcribe.
3. **Stale 02 §8.1a citations.** §9.3/§5.3 cite 02's fallback ceilings as "≤ 260 KB per file,
   ≤ 2.9 MB set" and an "≤ 1.3 MB single-visitor line" — 02 as published states ≤ 220 KB and
   ≤ 1.6 MB, and computes 0.65 MB as the worst single-visitor download (no 1.3 MB line exists).
   04's own caps (130 KB / 1.6 MB / 0.65 MB) still fit inside the real ceilings, so this is
   misattribution, not an arithmetic failure — but the round-1 lesson stands: a cap justified
   against a line that does not exist is not justified.

**Verdict: Rejected** — narrowly. The craft chapters, the budget arithmetic, and the QA machinery
are now fully in order; what remains is three stale quotations of 02, one of which (the tree)
breaks the build.

**Required changes:**

1. §6.3 (+ §6.4's validator path): republish the tree per the PM packaging entry — 02's published
   `.vN` mechanism (or whatever the entry fixes) with this document's file canon inside, the
   `models/` question answered jointly, and the false "02's current revision" attribution
   corrected.
2. §7.3: quote 02's actual published rig numbers (1.2 × 1.2 m / 0.35 / −0.0003) or cite the
   decision entry that supersedes them.
3. §9.3/§5.3: correct the 02 §8.1a citations to 02's published lines (≤ 220 KB per file,
   ≤ 1.6 MB set, 0.65 MB computed worst visitor).

### Cross-document consistency findings (Round 3)

**Healed since round 2 (verified):** the texture budget (Seam F — 04 fits 02's published lines
with the arithmetic shown; 02's line-sum holds); the still addresses (Seam G — 0.000/0.160/0.633/
0.743/1.000 in 02, 03, and 04, robust to 03's retime); the poster (Seam H — dead in 02 and 04,
with 04 accepting 02's reasoning on the record); fallback formats and caps (AVIF+WebP everywhere;
04's caps nested inside 02's real ceilings even where 04 cites them stale); the label policy (01
§7.5 = 03 §7.4, verbatim in substance, verified against B3's stagger); the loading experience
(one design, 01's, implemented by 02 with 8 s/20 s stall numbers, consumed by 03 — save 01's
poster ghost); the scroll cue; the lighting rig (01 = 02 = 04 at 40° / 55° right-rear / `#fff3dd`
/ 4:1; 02's ground opacity 0.35 now literally implements 01's "~35%"); `B8` = 0.928 (02 = 03);
and everything healed in round 2 that stayed healed: node names, W = 0.304, FOV 24/30, the
smoother, track heights 1300/1700.

**Still broken — every one a second-generation mirror-swap, every one traceable to the missing
decision entries:**

1. **Seam A (copy deck):** 01 = eight slots, no `copy.B1`; 03 = six merged slots, `copy.B1`
   restored. Each adopted the other's round-2 position; each claims a "queued PM ruling" that
   contradicts the other's claimed ruling. **The PM records the table; both documents then carry
   it identically, citing the entry.**
2. **Seam B (arrival):** 01 = 50vw centered, title 16vh, B1 reframes; 03 = 62vw, title in the
   50vh word column, B1 pure dolly. Same swap, same fix: **PM rules; both restate; the loser's
   variant is retired on the record** (both variants are now fully designed, so the ruling is
   cheap).
3. **Seam D (asset tree):** 02 = `.vN` suffixes, no `models/`; 04 = `v1/` directory, `models/`.
   Third round of two trees. Mechanism is 02's and 02 has now published it as its own —
   **04 yields to `.vN`; 02 deletes its false convergence claim; the `models/` subdirectory is
   ruled jointly; the PM entry records the tree.**
4. **Seam E (rig quote):** 02 published 1.2/0.35/−0.0003 with the derivation; 04 quotes
   0.9/0.32/−0.0002 as "02's current." **04 yields** (one line).
5. **Small stales:** 02's `B2` = 0.075 (03: 0.105) — **02 yields**; 02 §4.2's farthest-pose
   sentence — **02 yields**; 01 §7.5's stale note on 03 §7.4 — **01 yields**; 01's three poster
   references — **01 yields** (or escalates); 04's §8.1a citations — **04 yields**.
6. **Root cause, third citation, now beyond argument:** `decisions.md` still ends at D-008. Round
   2 stated the order of operations as non-negotiable — record the rulings, then revise. Instead,
   a second parallel round ran, and all four seams that needed a referee mirror-swapped exactly as
   predicted, while every seam with a settled owner converged. Two rounds of correct work have now
   been aimed at superseded targets. **Round 4 must be sequenced, not parallel:** (1) the PM
   writes the entries — copy-slot table, arrival composition, packaging/tree, plus formal
   recordings of the already-converged label policy, still count, no-footer, and battery rulings;
   (2) each document makes one citation-level pass against the recorded entries. On the evidence
   of three rounds, a fourth parallel revision will produce a fourth swap; a sequenced one is an
   afternoon.

### Global questions (Round 3)

**Does this feel handcrafted?** More than ever, and now provably at almost every joint: 03 solves
its camera distances from the quiet-zone contract instead of asserting them; 02 derives its shadow
plane from the tableau's projected shadow; 04's atlas caps sum to the budget line to the second
decimal by construction. The irony of this round is that the handcraft is no longer in question
anywhere — the documents fail only where they describe each other.

**Does anything look AI-generated?** In the designed page, no — nothing new was invented, the
banned-word grep is zero-hit, and the two clichés that threatened earlier rounds (poster-plus-
loader double first-frame, progress bar) are dead in the documents that own them. The one
machine-tell risk remains the seams: a build following 01's first frame contradicts a scroll story
following 03's, and captions would flicker between two decks. Contradiction is still the tell.

**Does every animation have purpose?** Yes — 03 §13 now carries 24 rows, and this round's
deletion (the 50→62vw reframe) has its reason recorded... with the caveat that the reframe may be
resurrected by the arrival ruling, in which case its round-2 purpose row comes back with it.
Nothing moves without a sentence in either variant.

**Is the pacing engaging?** Yes, and the retimed opening is the best version yet: B1 now earns a
real hold (H1 0.055) under `copy.B1`, the Lid beat owns a full stroke, and every reading floor
passes with the formula shown. I verified the whole table; the arc — stillness, earned first move,
mid-story recognition, exhale, twenty-ish seconds of designed silence — survives intact in both
copy-deck variants.

**Is anything distracting?** One thing, unchanged in kind since round 2 and now in its third
configuration: the first viewport is two frames. Everything else that ever distracted is designed
out and has stayed out.

**Would this impress a client?** Yes — unchanged. The concept never wavered, and the execution
spec beneath it is now verified arithmetic almost end to end. A client cannot be shown two first
frames, though; the ruling is the last thing standing between this blueprint and that meeting.

**Would this compete with Bruno Simon?** The standing answer holds: not on novelty, deliberately
— but the input feel is specified and QA'd to the millisecond, the self-disassembling machine
remains an ownable image, and the discipline (zero overshoot, zero drift, zero third-party bytes)
is the kind experts recognize on contact.

**Would this compete for Awwwards Site of the Day?** With the seams closed, yes — the
finish-depth surfaces juries actually probe (loading, reduced-motion, no-JS, keyboard, focus,
determinism, budgets) are designed, cross-verified, and in several cases derived. The one thing
that would sink it today is the same thing that would sink the build: two decks, two arrivals,
two trees.

**What should be rejected?** All four documents, a third time — but the reject set is now purely
citational: 01 and 03 for the twice-swapped copy/arrival seams and their mutually false "as
revised" claims (plus 01's poster ghost); 02 and 04 for the twice-swapped tree and rig quotations
plus a handful of stale constants (02's B2, 04's §8.1a ceilings). Nothing — nothing — is rejected
for craft, taste, arithmetic, coverage, or vision compliance this round.

**What should be improved even where approved?** Nothing is approved, so the protect-list, third
edition: 03's derived camera ladder and floor discipline; 02's smoother, rig derivation, and
transcription-audit habit (it failed only because its source moved after transcription); 04's
caps-sum-to-the-line budget table and upgrade ladder; 01's copy voice — whichever deck structure
the PM picks, 01's sentences should be the ones that ship.

### Overall verdict (Round 3)

**All four documents are Rejected — and for the first time, none of the reasons lives inside a
single document.** Every intra-document standard this review enforces is now met everywhere:
budgets sum, floors hold, derivations check, fallbacks are designed, the banned-word count is
zero, and the craft chapters of all four documents are at or above the bar the vision sets. What
failed — again, and in the exact shape round 2 predicted in writing — is coordination without a
referee: the PM did not record the owed decisions, the specialists revised in parallel a second
time, and the four open seams mirror-swapped a second time, so that each document now correctly
implements a neighbor that no longer exists. The distance to approval is one PM writing session
and one citation pass per document. Sequence round 4 — entries first, revisions after, in order —
and this project's documentation phase ends. Run it in parallel again and we will meet back here
for round 5 with the sides exchanged.

---

## Round 4 re-review (2026-07-01)

- **Documents re-reviewed:** all four, in full, against the round-3 required changes, the recorded
  entries `decisions.md` D-009–D-017, the vision, and each other. The sequencing round 3 demanded
  finally happened: the PM recorded the rulings first, and each document then made one citation
  pass against the recorded entries.
- **Verification notes:** I re-ran everything. Banned-word grep across all four documents:
  zero-hit. Hedge grep ("queued ruling", "pending entry", "ends at D-008"): every surviving
  mention is historical, inside a revision changelog describing its own removal — no live hedge
  anywhere; entries are cited by number throughout. Recomputed by hand and correct: every word
  count in the D-009 deck (cards 10/8/12/11/10/12; subline 12; close 3 + 6, both lines inside the
  ≤6-word Distillery rule; labels 9 names = 14 words under D-015) and 01 §8.3's recounted budgets
  (3d: 13 + 1 + 63 + 14 + 15 + 7 = **113**; static: 13 + 63 + 27 + 19 + 15 + 4 = **141** — the
  seven `h2` headings really sum to 19 words and the still captions to 1 + 10 + 2 + 14 = 27; the
  declined lifted-battery contingency's worst cases 123/152 sit under the stated 125/155 caps;
  the "106 steady words" line = 113 − 4 skip-link − 3 loader). 03's six card floors against the
  D-009 counts (floors 0.050/0.050/0.055/0.055/0.050/0.055 vs delivered 0.050/0.050/0.055/0.055/
  0.050/0.130 — every window recomputed from §3; every continuity-check-2 gap re-verified:
  0.004/0.034/0.098/0.106/0.025/0.096); the arrival anchors from the 0.47 formula
  (0.124/0.238/0.409/0.421/0.612/0.717, plus the shared chassis/battery slot at 0.797 holding
  0.050 before the 0.862 exit, and the B8 re-entry closing at 0.930 + 7×0.003 + 0.006 = 0.957);
  03 §5.2's `P0` trigonometry (extent 1.197W → 4.15W delivers 38.2%; quiet-zone distances
  2.88→2.90W and 2.93→2.95W; `P1` headroom 18.6%) and §9.1's tableau margins (14% vertical; the
  44vw width 01 §5.4 quotes). 02's smoother tail (τ·ln(0.030/0.0005) ≈ 287 ms → the ≈290 ms
  drain; settle 238 ≤ 250 ms), key-light elevation (exactly 40.0°, bearing 55° right-rear), §8.1
  line sum (8.43 ≤ 8.5), and all nine §6.4 label addresses against 03 §3 as published (`B2` =
  0.105 and `B8` = 0.928 — both correct now, with the audit genuinely re-run item by item). 04's
  atlas arithmetic (expected 0.62 + 1.00 + 0.47 + 0.39 = 2.48 ≤ 2.8; caps 0.70 + 1.13 + 0.53 +
  0.44 = 2.80 = 02's line exactly; asset caps 5.00 ≤ 5.6; worst cold-cache 2.83 + 5.00 = 7.83 ≤
  8.5), tri budget (135,500 = the table's sum), and the fallback encode table (100 + 130 + 40 +
  50 = 320 KB/frame at cap → 1.60 MB set, expected ≈ 1.21 MB; worst visitor 5 × 130 = 0.65 MB =
  02 §8.1a's published figure). Per the instruction to sweep 03 with particular care after its
  round-3 revision agent died mid-edit: I grepped 03 for "0.075", "16vh", "2.60W", "eight-card",
  and the 50vw arrival — every hit is inside the revision-5 header's historical description of
  the repaired defect; every other "50vw" in the body is the legitimate, D-010-sanctioned `P5`
  re-centering. The header repair is genuine: the body it now introduces is the body D-009/D-010
  ratify, and every boundary from 0.160 onward is byte-identical to the round-3 body I verified
  then.

### The headline

Sequencing worked — almost completely. **Seam A is closed:** 01 §8.2, 03 §7.1, and D-009's table
of record are cell-identical (I compared every wording string, word count, and window across all
three). **Seam B is closed:** the 62vw / ≈38% / `P0` 4.15W / +22° / pure-dolly arrival with the
0.105 B1/B2 boundary reads identically in 01 §5, 03 §4/§5.2/§8, 02 §4.2/§6.4, and D-010, and the
retired 50vw variant survives only as history. **Seam E is closed:** D-012's rig numbers appear
once as 02 §4.3's derivation and once as 04 §7.3's normative quotation, identical to the digit.
D-013, D-014(a–d), D-015, D-016, and D-017 propagate correctly everywhere I checked (details
below). What did not close is **Seam D — for the fourth consecutive round, in a new, one-sided
shape:** D-011 records the tree as flat with `fallback/` as the only subdirectory; 04 §6.3
transcribed the entry exactly (its former `textures/` and `env/` directories deleted, the 11 KTX2
files and the HDR at the `assets/` root); 02's revision-4 header quotes the entry's terms
correctly — and its §1.2 **tree diagram and operative paths still carry the `textures/` and
`env/` subdirectories from revision 3**, alongside a sentence ("`textures/`, `env/`, and
`fallback/` stand") that flatly contradicts the entry text this same section quotes four
paragraphs earlier. Built as written: 02's 13-entry loader manifest fetches
`assets/textures/*.v1.ktx2` and `assets/env/studio-warm.v1.hdr` while 04 authors the GLB's
external URIs against sibling files at the `assets/` root and delivers them there — every texture
and the HDR 404s in one direction or the other, and the page falls to static on a perfect asset.
The same failure shape as round 1's node names and round 3's two trees, now confined to one
document and roughly a dozen lines.

### 01 — Creative Direction (Round 4)

**Strengths.** The citation pass is the model of how to do one: every entry cited by number at the
point of use, and the retired centered-arrival's four arguments answered on the record rather than
deleted (§5.2 a–d) — the right way to lose an argument. The D-015 fold-in is complete and honest:
the label list, the recounted budgets (113/141, arithmetic verified), the still captions, and the
§9 grep rules all moved together, with the declined variant's cap math (125/155) pre-stated so a
future entry cannot smuggle words in. The copy voice is intact and still the project's best asset.

**Round-3 changes, verified:** (1) §8.2/§8.3 carry the D-009 table cell-identically with 03 §7.1,
cite the entry, and recount the budget — checked word by word. (2) §5.1/§5.2/§5.5 carry D-010
with every false 03 citation gone; the transcribed numbers (4.15W, +22°, the 43–81vw silhouette,
the 3vw title clearance, the ≈0.022 crossing during the dolly) all check against 03 §5.2/§3.
(3) all three poster references now state the no-poster fact and cite D-013; §7.6 additionally
retires the slow-network status line with a reason that is true against 02 §7.2 as published.
(4) the stale §7.5 note is deleted; the joint label policy cites D-014a, and every claim it makes
about 03 §7.4 is true against 03 as it stands (I re-read both sides).

**Problems:** none that survive verification. Two notes, neither a defect: (a) §7.8 describes
`R0`'s opening section as "pairing `copy.B0` + `copy.B1`" while 03 §11's R0 row pairs `copy.B0`
alone at `p = 0.000` and separately endorses 01's section placement — the two documents state
both halves of the same fact (B1's sentence lives in the opening article section; only B0 is live
at 0.000) and each describes the other truthfully, so this is a terminology asymmetry, not a
contradiction; a future pass could reserve "pairing" for one of the two meanings. (b) §8.2's `h2`
row compresses the opening section's contents to "(title, subline, `R0`)" — not exhaustive; §7.8
is the placement spec and is complete. Neither misleads a builder.

**Verdict: Approved.**

**Required changes:** none.

### 02 — Technical Architecture (Round 4)

**Strengths.** The transcription audit finally works as designed: all nine §6.4 label addresses
and every carried 03 constant check true against 03 as published, stated item by item — including
the two constants (`B2`, the farthest pose) that previous rounds got wrong. The §4.3 rig
derivation stands as D-012's source of record and 04's quotation of it is exact. The §8.1/§8.1a
citations of 04's current numbers are all accurate (GLB 1.05/1.20; textures 2.48/2.80; fallback
130 KB / 1.60 MB / 0.65 MB — each verified against 04 as revised). The engineering core remains
the strongest in the project.

**Round-3 changes, verified:** (2) executed correctly — `B2` = 0.105, `B8` = 0.928, `P0` 4.15W ≈
1.26 m in §4.2, audit re-run for real. (3) executed correctly — the falsified prediction is
replaced with the fact, and the fact is true (04 §7.3 quotes D-012's numbers exactly).
(1) executed **incompletely** — the header and the prose adopted D-011; the tree and the paths did
not. See problem 1.

**Problems:**

1. **Seam D, fourth iteration — the defect now lives entirely inside this document (fatal at the
   interface).** §1.2 twice states D-011's terms correctly ("flat, with exactly one subdirectory
   (`fallback/`)" — the revision-4 header block and the versioning-rule paragraph both carry it),
   then contradicts them three ways in the same section and twice downstream: the tree diagram
   draws `textures/` (11 files) and `env/` (the HDR) as subdirectories; the Seam-D closure
   paragraph asserts "`textures/`, `env/`, and `fallback/` stand"; the section claims "this
   section carries that entry" and "04 §6.3/§6.4 carry the identical tree" (04's tree is flat —
   the itemized convergence points quoted from 04 are individually true, but "identical tree" is
   not); §7.1's P2 row fetches `textures/*.v1.ktx2` + `env/studio-warm.v1.hdr`; §4.4 loads
   `assets/env/studio-warm.v1.hdr`. Against D-011 and against 04 §6.3 as published, these paths
   are wrong, and a builder transcribing the P2 manifest ships 12 asset requests that 404.
2. Minor: §1.2's `models/` paragraph presents "ruled jointly, withdrawn … this document concurs"
   inside quotation marks as "04's current text" — 04 §6.3's actual words are "ruled out by
   D-011, concurred with on the merits" / "this document concurs". The substance is true; the
   quotation is not verbatim.

**Verdict: Rejected** — narrowly, on one section's incomplete transcription of an entry the
document itself quotes correctly. Nothing else in the document failed verification.

**Required changes:**

1. §1.2: transcribe D-011's tree exactly — delete the `textures/` and `env/` directory entries;
   the 11 KTX2 files and `studio-warm.v1.hdr` sit at the `assets/` root beside `laptop.v1.glb`;
   `fallback/` remains the only subdirectory. Alternatively, if the mount owner believes
   `textures/` and `env/` should exist (they were never a disputed cell in rounds 1–3; the
   disputes were `v1/`, `models/`, and `posters/`), obtain a superseding `decisions.md` entry and
   cite it — after which 04 re-transcribes. No middle state.
2. §1.2: delete or restate "`textures/`, `env/`, and `fallback/` stand" and re-qualify the
   convergence claims ("this section carries that entry"; "04 §6.3/§6.4 carry the identical
   tree") so they are true against the corrected tree.
3. §7.1 (P2 row): correct the manifest paths to the flat tree (`laptop.v1.glb` + 11 `*.v1.ktx2` +
   `studio-warm.v1.hdr`, all at `assets/`), and re-check every `assets/…` path in the document.
4. §4.4: `assets/env/studio-warm.v1.hdr` → `assets/studio-warm.v1.hdr`.
5. Minor: §1.2's `models/` paragraph — quote 04 §6.3 verbatim or drop the quotation marks.

### 03 — Animation Storyboard (Round 4)

**Strengths.** The header repair is exactly what was instructed and nothing more: the revision-5
header now describes the body truthfully, names the mid-edit failure plainly instead of hiding
it, and the body — the one D-009/D-010 ratify — is untouched from the round-3 body whose every
number I verified then (re-spot-checked this round: floors, anchors, continuity, `P0`
trigonometry, §9.1 tableau math — all hold). The D-015 activation is executed at zero retiming
cost exactly as pre-priced: nine labels in eight stagger slots, the shared 0.797 in-point, the B8
diagram and §11 captions updated, the lifted variant left declined and priced. The protect-list
(camera ladder, floor formula, purpose audit — now 24 rows with the retired reframe's reason
recorded) survived intact.

**Round-3 changes, verified:** (1) §7.1/§3 carry the D-009 table identically with 01 §8.2, entry
cited, floors re-run — checked cell by cell. (2) the arrival is D-010's, stated once and
consistently in §4-B0/§4-B1/§5.2/§8/§13/§14, with the retired variant named and its design's
location on the record. (3) §11's R0 row is corrected to the copy live at `p = 0.000` and states
01's section placement truthfully. (4) §14's characterizations of 01 now cite the entries and are
true against 01 as published. The instructed residue sweep came back clean: no trace of the
eight-card/50vw-arrival/0.075 variant outside the header's historical account.

**Problems:** none found.

**Verdict: Approved.**

**Required changes:** none.

### 04 — Asset Pipeline (Round 4)

**Strengths.** The document did the hardest thing on the board this round — moving its own tree to
match an entry that overruled its previous two revisions — and did it completely: §6.3's diagram
is D-011 to the letter, §6.1's external-URI note and §7.2's HDR path follow the flat mount, the
`models/` ruling is concurred with on the merits (with reasons, not just deference), and the
false round-3 attributions are corrected on the record instead of silently. The budget chapter
remains the project's best arithmetic (every sum re-verified), the D-015 fold-in reaches all the
way into the r3/r4 alt-text drafts, and D-016 closes the copper flag with the same reasoning in
both owning documents.

**Round-3 changes, verified:** (1) §6.3 (+ §6.4's validator path) republishes the tree per D-011
with the file canon inside and the attribution corrections stated. (2) §7.3 quotes 02's actual
rig — D-012's numbers, exact. (3) §9.3/§5.3 cite 02 §8.1a's real lines (≤ 220 KB per file,
≤ 1.6 MB set, 0.65 MB computed worst visitor) — verified against 02 as published.

**Problems:** one, contingent and not of this document's making: §6.3's closing claim "the two
documents publish one tree" is currently falsified by 02's un-transcribed diagram. 04 needs no
edit — the sentence becomes true the moment 02 executes its required change 1 — but the
master-spec synthesis must not treat it as true until then. No other defect found.

**Verdict: Approved.**

**Required changes:** none.

### Cross-document consistency findings (Round 4)

**Closed and verified against the entries (not against memory):**

1. **Seam A (D-009):** 01 §8.2 = 03 §7.1 = the entry's table, cell for cell — wording, counts,
   windows, the `label.*` and `cue.scroll` rows, the no-`ui.progress` ruling, and `copy.B1`
   shipping with the restoration argued from the real deck in both documents.
2. **Seam B (D-010):** 62vw / ≈38% / `P0` 4.15W ≈ 1.26 m / +22° / pure dolly to 2.90W / boundary
   0.105 / Lid window 0.105–0.145 / 50vw only at `P5` / mobile refit — identical in 01 §5,
   03 §4/§5.2/§8, 02 §4.2/§6.4; 04's render cameras (`P0`/`P1`/`P3`/`P4`/`P5` at the five still
   addresses) consume 03 §5.2 as ratified.
3. **Seam E (D-012):** 1.2 × 1.2 m / 0.35 / PCFSoft / 2048–1024 / ±0.45 m / −0.0003 / normalBias
   0.02 — 02 §4.3 derives, 04 §7.3 defers and quotes exactly.
4. **D-013 (no poster):** stated in the no-poster form with the entry cited in 01 §5.2/§7.6/§8.4,
   02 §7.2/§8.1/§8.1a, 04 §9.3; QA-1 named a binding acceptance test in 02 §12.5 and referenced
   by all three neighbors.
5. **D-014a–d:** label policy verbatim-joint (01 §7.5 = 03 §7.4); five stills at
   0.000/0.160/0.633/0.743/1.000 in all four documents; no footer (01 §5.4 = 03 §9.3); no
   progress bar (01 §7.4 = 03 §7.6, contingency priced and unbuilt).
6. **D-015 (battery):** 01's label list and word budgets (9/14; 113/141), 03's 0.797 shared slot,
   B7 nine-label exit, B8 nine-in-eight re-entry, §11/§12/§14; 04 §1.3 ruled-closed and §9.5's
   r3/r4 drafts naming the seated battery; 02 §4.1's non-separating `chassis_battery` note.
7. **D-016 (copper)** — 01 §3.1/§8.5.2 and 04 §4 row 4, same deviation, same reasoning, fallback
   sentence retired on the record. **D-017 (closing line)** — adopted in 01 §8.2 and 03 §7.1,
   both carrying the owner-sign-off-pending status; correctly listed as 01's one open item.

**Still broken:**

8. **Seam D (D-011), fourth iteration, now one-sided:** the entry and 04 §6.3 say flat with
   `fallback/` the only subdirectory; 02 §1.2's diagram and paths keep `textures/` and `env/`.
   **02 yields** (required changes 1–4 above), or the PM supersedes D-011 and 04 re-transcribes.
   A note for the PM either way: D-011's "exactly one subdirectory" clause is the operative text
   — 04 implemented it literally and 02's header quotes it — but `textures/` and `env/` were
   never a disputed cell in rounds 1–3 (both documents drew them in every previous tree; the
   disputes were `v1/`, `models/`, `posters/`). If the flattening was deliberate, 02 transcribes
   and this closes in a dozen lines; if it was a drafting artifact, the superseding entry should
   say so explicitly, because the entry is the interface of record and silent divergence from it
   is how this seam has survived four rounds.
9. Terminology only, no action required: 01 §7.8's "pairing" (section granularity) vs 03 §11's
   "paired text" (timeline-address granularity) for `R0` — both documents state both facts and
   each describes the other truthfully.

### Global questions (Round 4)

**Does this feel handcrafted?** Yes, and this round adds a distinctly human texture the previous
rounds lacked: documents losing arguments gracefully on the record. 01 answers the centered
arrival's four arguments instead of deleting them; 04 concurs with the `models/` ruling on the
merits after being overruled; 03's header names its own mid-edit failure rather than papering it.
Template output does not annotate its own defeats.

**Does anything look AI-generated?** In the designed page, no — banned-word grep zero-hit,
nothing invented, the clichés (poster, progress bar, pulsing cue) all dead with reasons recorded.
The one machine-tell left in the project is the single surviving contradiction: a tree that is
flat in three places and nested in one.

**Does every animation have purpose?** Yes — 03 §13 carries 24 rows, every mover has its
sentence, the retired reframe's row is retired with its reason, and the two documents that own
motion and words now provably agree on where every word sits while things move.

**Is the pacing engaging?** Yes, and now verified end to end against the ratified deck: every
card clears its floor at the document's own fastest engaged pace, B1's hold earns the page's one
sentence about itself, the recognition beat sits mid-story, and the 0.016 of designed silence
survives. The arc has been right since round 1; as of this round the arithmetic under it is
correct in every document that carries it.

**Is anything distracting?** On the designed page, nothing — every distraction flagged in rounds
1–3 stayed designed-out. At process level, one thing: the tree. It is the last item on the list.

**Would this impress a client?** Yes. The blueprint now reads as one page described four ways,
which is what four specialist documents are supposed to be. A client cannot see the tree defect;
a developer would hit it on day one — which is exactly why it blocks approval of 02 and nothing
else.

**Would this compete with Bruno Simon?** The standing answer, unchanged and now fully specified:
not on novelty, deliberately — but the input feel is engineered to the millisecond with a QA row
that measures it, the self-disassembling machine is an ownable image, and the discipline (zero
overshoot, zero drift, zero third-party bytes, zero unexplained light) is the kind experts
recognize on contact.

**Would this compete for Awwwards Site of the Day?** With Seam D closed — yes, credibly. Every
finish-depth surface juries probe (loading, reduced-motion, no-JS, keyboard, focus, determinism,
budgets) is designed, cross-verified, and in most cases derived, and for the first time the
documents describing those surfaces agree with each other everywhere but one directory listing.

**What should be rejected?** Only 02, only for §1.2's incomplete transcription and its three
downstream path echoes. Nothing anywhere else survived verification as a defect.

**What should be improved even where approved?** Small and optional: unify the "pairing"
terminology between 01 §7.8 and 03 §11; 04's "one tree" sentence should be re-read (not
re-written) once 02's fix lands; and the master specification should re-run 03 §7.2's floor
check one final time if the owner's D-017 sign-off rewrites the closing line. The protect-list
held through a fourth round: 03's camera ladder and floors, 02's budgets and derivations, 04's
caps-sum arithmetic, 01's copy voice — all intact, none diluted.

### Overall verdict (Round 4)

**01, 03, and 04 are Approved. 02 is Rejected — on one section, for the last surviving
contradiction in the project.** The sequenced process did what three parallel rounds could not:
every seam with a recorded entry and a completed transcription closed and stayed closed, and the
craft underneath — verified again this round down to the word counts and the trigonometry — never
needed defending. The one failure is not a swap this time but an incomplete transcription: 02
quotes D-011 correctly and then ships a diagram and three paths that predate it, while 04, which
had to give up the most to conform, conformed exactly. The distance to a fully approved
documentation set is one short transcription pass in 02 (§1.2's diagram and Seam-D paragraph,
§7.1's P2 paths, §4.4's HDR path, one quotation tidied) — no design, no derivation, no
renegotiation, no other document touched. After that: the D-008 gate still requires the
05-master-specification audit before any code, and D-017's owner sign-off on the closing line
remains the one open non-document item. Fix the tree, re-cite the entry, and this documentation
phase ends where round 3 predicted it would — one writing session and one citation pass from
done, with the citation pass now three-quarters banked.

## Round 5 re-review (2026-07-01)

- **Scope:** a targeted verification round. Round 4 approved 01, 03, and 04 and rejected 02 on five
  required changes, all confined to one seam. Since that report: 02 shipped revision 5 (its header
  claims all five changes addressed) and 04 shipped revision 4.1 (a post-approval quotation-accuracy
  tidy — not required by round 4, but changed text is changed text, so it was verified with the same
  rigor). 01 and 03 are byte-untouched since the round-4 verification (modification times precede
  the round-4 append; headers and spot-checked sections match the state verified then), so their
  round-4 verdicts carry rather than being re-litigated.
- **Verification notes.** 02's five required changes, each checked against the entry and against 04
  as published, not against 02's own changelog: (1) the §1.2 tree diagram now transcribes D-011
  exactly — `laptop.v1.glb`, the 11 KTX2 files (`aluminum_base/orm`, `mainboard_base/normal/orm`,
  `modules_base/normal/orm`, `thermal_base/normal/orm`), and `studio-warm.v1.hdr` all at the
  `assets/` root, `fallback/` the only subdirectory holding the 20 stills — compared cell for cell
  against 04 §6.3's diagram and D-011's text: identical, all three. (2) The false sentence
  ("`textures/`, `env/`, and `fallback/` stand") is gone; the Seam-D paragraph now states the flat
  truth ("the earlier revisions' `textures/` and `env/` groupings do not exist"), and every
  re-qualified convergence claim was re-verified clause by clause — "geometry at
  `assets/laptop.v1.glb`", "the 11 KTX2 files and `studio-warm.v1.hdr` at the same root",
  "`fallback/` the only subdirectory", "`models/` withdrawn", "validator command reading `npx
  gltf-validator engineering/assets/laptop.v1.glb`" — each true against 04 §6.3/§6.4 as published.
  (3) §7.1's P2 row fetches the 13 flat paths (GLB + 11 KTX2 + HDR, "all at the `assets/` root"),
  and a full-document grep for `assets/`-rooted paths finds only correct ones: `assets/laptop.v1.glb`,
  `assets/studio-warm.v1.hdr`, and `assets/fallback/` (which D-011 sanctions); every surviving
  "textures/"/"env/" string in 02 is either the revision-5 header's historical account or an
  explicit negation ("no `textures/` subdirectory (D-011)"). (4) §4.4 loads
  `assets/studio-warm.v1.hdr` at the root, entry cited. (5) The `models/` paragraph now quotes 04
  §6.3 verbatim — "ruled out by D-011, concurred with on the merits" and "this document concurs,
  not merely by deferral" are byte-exact against 04's current text. 04's revision 4.1, verified the
  same way: §9.3's poster reasoning is now 02 §7.2's actual sentence, quoted exactly ("a poster
  duplicates the first frame at real download cost, and two first frames would be two designs" —
  byte-identical to 02 as published); §7.2's three 01 §6 quotations are now verbatim ("elevated
  ~40°"; "upper right … slightly behind the subject" — an accurate elision of 01's "from the
  camera's upper right, elevated ~40°, slightly behind the subject"; key-to-fill "about 4:1 (two
  stops)"); and §6.3's "the two documents publish one tree" sentence — round 4's one contingent
  problem — was re-read, not rewritten, and is now simply true. Regression spot-checks on
  everything adjacent to the edits: 04 §7.3's rig quotation still carries D-012's numbers exactly
  (1.2 × 1.2 m / 0.35 / PCFSoft / 2048–1024 / ±0.45 m / −0.0003 / normalBias 0.02 = 02 §4.3 to the
  digit); 04 §9.3's encode arithmetic re-summed (100 + 130 + 40 + 50 = 320 KB/frame at cap → 1.60 MB
  set; expected 70 + 105 + 28 + 38 = 241 KB → ≈ 1.21 MB; worst visitor 5 × 130 = 0.65 MB = 02
  §8.1a's published figure); 02 §8.1's line sum unchanged (8.43 ≤ 8.5); the 13-entry loader
  manifest count is consistent at every mention (§1.2, §7.1, §7.2, §12.2); 02 §7.6's cache-header
  pattern still covers the flat tree. Hedge grep across all four: every hit is a changelog
  describing its own repair — no live hedge. Banned-word grep: zero-hit, all four documents.

### 01 — Creative Direction (Round 5)

Untouched since the round-4 verification; nothing in 02's or 04's pass changes anything 01 cites
(01's D-011-adjacent references were already flat-tree-correct, which is why it never carried this
seam). The two round-4 notes (the "pairing" terminology asymmetry with 03 §11; the compressed `h2`
row in §8.2) remain optional, non-defects.

**Verdict: Approved.** **Required changes:** none.

### 02 — Technical Architecture (Round 5)

**Strengths.** The revision does exactly what was required and nothing else — a dozen lines, no
design or arithmetic touched, exactly as round 4 priced it. The corrected §1.2 is now the best
statement of the packaging interface in the project: the entry quoted, the tree transcribed, the
mechanism reasoned, the seam's four-round history recorded inside the section that kept breaking
it, and every convergence claim checkable in one sitting because it names what it checked.

**Round-4 changes, verified:** all five, as itemized in the verification notes — the tree (1), the
restated sentence and re-qualified claims (2), the P2 manifest and the full path sweep (3), the
§4.4 HDR path (4), and the verbatim quotation (5). Nothing else in the document moved, and the
protect-list items adjacent to §1.2 (the §7.6 header rationale, the §8.1 budget lines, the §6.4
audit) are intact.

**Problems:** none found.

**Verdict: Approved.** **Required changes:** none.

### 03 — Animation Storyboard (Round 5)

Untouched since round 4; its body remains the round-3 body whose every number was verified then and
re-spot-checked in round 4. 02's tree fix consumes nothing from 03, and 04's quotation tidy does
not touch any 03 constant.

**Verdict: Approved.** **Required changes:** none.

### 04 — Asset Pipeline (Round 5)

**Strengths.** Revision 4.1 was voluntary — the document was already approved — and it spent that
freedom on quotation hygiene: three paraphrases-in-quotation-marks converted to verbatim
quotations, and the one contingent sentence round 4 flagged re-read against 02 as revised. That is
the correct instinct for a document whose seam history was made of almost-right citations. The
changelog states truthfully that no number, path, budget, or design content changed, and
verification agrees.

**Round-5 verification:** the three corrected quotations are byte-exact against their sources (02
§7.2; 01 §6 twice); "the two documents publish one tree" is now true — D-011 = 02 §1.2 = 04 §6.3,
cell for cell; the rig, encode-table, and alt-text sections adjacent to the edits are unchanged and
still correct.

**Problems:** none found.

**Verdict: Approved.** **Required changes:** none.

### Cross-document consistency (Round 5)

**Seam D (D-011) is closed — the last one.** The entry, 02 §1.2, and 04 §6.3 publish one tree:
same 13 root-level files, same single subdirectory, same 20 fallback filenames, same validator
path, same versioning discipline, entry cited from both sides. Built as written, every asset fetch
resolves. Seams A, B, and E and the D-013–D-017 propagations were verified closed in round 4
against documents that have not changed where those seams live (01 and 03 untouched; 02's and 04's
edits confined to Seam-D text and quotation marks), and the spot-checks above confirm the borders
held. For the first time in five rounds, there is no seam finding to write. The one open
non-document item is unchanged and correctly recorded everywhere it appears: D-017's owner
sign-off on the closing line.

### Global questions (Round 5)

The round-4 answers stand, with the one caveat they carried now resolved: the single surviving
machine-tell — a tree flat in three places and nested in one — is gone, so "does anything look
AI-generated?" is now a clean no at both page level and process level. Handcrafted: yes, and the
five-round paper trail of documents arguing, losing, and conceding on the record is itself the
evidence. Every animation purposeful, pacing verified against the ratified deck, nothing
distracting, client-impressive: unchanged from round 4, verified there in full. Bruno Simon:
competes on discipline and input feel, not novelty — deliberate, specified, measurable. Awwwards
SOTD: credibly, yes — the caveat "with Seam D closed" is now satisfied. What should be rejected:
nothing. What should be improved even where approved: the two standing optional notes (unify
"pairing" terminology between 01 §7.8 and 03 §11; re-run 03 §7.2's floor check if the owner's
D-017 sign-off rewrites the closing line), both correctly parked for the master specification.

### Overall verdict (Round 5)

**All four documents are Approved.** The documentation phase ends here, where rounds 3 and 4 said
it would: the craft never needed defending, the seams needed a decision log, and once the entries
existed every document transcribed them — 02 last, completely, in the dozen lines round 4
specified. The blueprint now reads as one page described four ways, every cross-document number
verified against its interface of record, every retired variant retired on the record with its
reasons. Next, per D-008: the 05-master-specification synthesis and its completeness/consistency
audit before any code — carrying forward the two optional notes above and the one open item,
D-017's owner sign-off on the closing line and the page title. Nothing else stands between this
documentation set and implementation.
