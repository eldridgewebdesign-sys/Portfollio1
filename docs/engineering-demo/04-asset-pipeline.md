# 04 — Asset Pipeline (Asset Director)

> Owner: Asset Director. Status: Revision 4 reviewed — **Approved, required changes: none**
> (review-report.md Round 4); Revision 4.1 below is a post-round-4 quotation-accuracy tidy.
> Scope: everything the renderer draws — the laptop reconstruction, its scene graph and naming
> (interface d), materials, textures, the lighting environment, and the 2D fallback art.
> Binding inputs: `project-vision.md` (esp. §9, §11), `decisions.md` D-003/D-005/D-006/D-007 and
> the revision-round rulings D-009–D-017 (this document is bound chiefly by
> D-011/D-012/D-013/D-014/D-015/D-016), `references.md`, the predecessor post-mortem
> (`Animations/laptop-teardown/README.txt`), and the reference images in `images/Laptop/`
> (references only, per D-005 — nothing in them ships).
>
> Interfaces respected: (a) the Creative Director owns all on-page words — this document supplies
> alt-text *content requirements* and drafts, never final copy; (b) the Animation Director owns
> beats and scroll ranges — this document refers to beats generically, and consumes (never
> redefines) the five reduced-motion still states 03 §11 publishes with exact timeline addresses;
> (c) the Technical Architect owns global budgets — every per-asset budget below is summed
> explicitly against 02 §8.1's published lines so the Reviewer can verify the totals fit; (d) this
> document owns all 3D node and file naming.
>
> **Revision 1 changelog (Round 1, changes 1–8, condensed):** payload re-derived under 02's lines;
> HDR cap 1.0 MB; fallback set = 03 §11's five stills; backdrop spec deferred wholly to 01; key
> elevation 40°, penumbra 24–36 mm in 01's terms; silkscreen face named (D-DIN, SIL OFL 1.1).
>
> **Revision 2 changelog (review-report Round 2, required changes 1–5):** §5.3 re-derived against
> 02 §8.1 **as published** — GLB ≤ 1.8 / textures ≤ 2.8 / HDR ≤ 1.0 MB, non-asset caps 2.83 MB
> using 02's current 0.30 critical / 0.14 GSAP figures; the round-2 ladder's steps 1–2 (atlas B +
> atlas D normals → 512 UASTC, −0.75 MB) are baked into the baseline so expected textures are
> 2.48 ≤ 2.8 MB and per-atlas caps sum to 2.80 exactly; the phantom "model + textures ≤ 5.0 MB"
> citation is deleted (change 1). Still addresses replaced with 03 §11's published
> 0.000/0.160/0.633/0.743/1.000 in §9.1/§9.2/§10.7 (change 2). §6.3 republished the tree on what
> this revision believed was 02 §1.2's mechanism — an immutable `v1/` directory — and withdrew
> the `.vN` suffix scheme (change 3; Round 3 found both attributions false — a second mirror-swap
> — reversed in Revision 3 below). The poster designation and its 02 citations are deleted —
> 02 §7.2 declines any poster and this document accepts its reasoning (change 4). §7.3 quoted
> what this revision believed were 02's published rig numbers (0.9 m / 0.32 / −0.0002); §9.3
> cited per-file and set ceilings that do not exist in 02 §8.1a (change 5; Round 3 found both
> quotations stale against 02 as published — corrected in Revision 3 below). Also healed: the stale "02 §1.2
> describes an embedded-texture GLB" note in §6.1 (02 has adopted external KTX2).
>
> **Revision 3 changelog (review-report Round 3, required changes 1–3 — a citation-and-naming
> pass; no design content, budget, or QA test changed):** §6.3 republishes the asset tree on 02
> §1.2's **current published mechanism — per-file `.vN` version tokens at `engineering/assets/`**
> — with this document's file canon inside, and corrects the false attribution on the record:
> `.vN` is 02's *current* mechanism, published as its own mount/versioning-owner decision, not its
> "abandoned round-1" one; this document's `v1/` version directory and `models/` subdirectory are
> withdrawn (the `models/` ruling is stated jointly in §6.3). §6.4's validator path, §5.3's GLB
> row, §5.2's encode outputs, §7.2's HDR name, and §10.1's load path follow the tree (change 1).
> §7.3 now quotes 02's actual published rig — **1.2 × 1.2 m / opacity 0.35 / bias −0.0003** —
> and the 0.32-vs-0.35 flag closes with it (change 2). §9.3/§5.3 correct the 02 §8.1a citations
> to 02's published lines — **≤ 220 KB per file, ≤ 1.6 MB set, 0.65 MB computed worst
> single-visitor download**; the phantom per-file, set, and single-visitor-line figures are
> withdrawn (change 3).
>
> **Revision 4 changelog (round-4 sequenced citation pass — the revision-round rulings now exist
> as `decisions.md` D-009–D-017; no design content, budget, arithmetic, or QA test changed):**
> every "entry pending / `decisions.md` ends at D-008" hedge is replaced with the recorded entry
> number. §6.3/§6.4: the asset tree cites **D-011** and the diagram is corrected to the entry
> exactly — flat `engineering/assets/` with `fallback/` as the only subdirectory (the `textures/`
> and `env/` subdirectories this document previously drew are gone; the 11 KTX2 files and the HDR
> sit at the `assets/` root), per-file `.vN`, no `models/`, geometry at `assets/laptop.v1.glb`;
> §6.1's external-URI note and §7.2's HDR path follow the flat mount. §7.3 cites **D-012** as the
> settling entry for the rig quotation (numbers unchanged — 1.2 × 1.2 m / 0.35 / −0.0003 /
> normalBias 0.02 / ±0.45 m / 2048/1024; 02 §4.3 stays the derivation source). §9.3's no-poster
> deletion cites **D-013**; the five stills in §9.1/§9.2/§10.7 cite **D-014(b)**; the §1.3
> battery flag closes as activated per **D-015** (seated, label-only — the §9.5 r3/r4 alt-text
> drafts now name the battery); the §4 copper-pipe deviation closes as approved per **D-016**.
> The Revision-3 withdrawal notes are restated without repeating the phantom figures.
>
> **Revision 4.1 changelog (post-round-4 tidy; Round 4 verdict: Approved, required changes
> none):** quotation accuracy only — neighbor text is quoted verbatim or cited by entry. §9.3's
> paraphrase of 02 §7.2's poster reasoning, previously printed inside quotation marks, is
> replaced with 02's verbatim sentence; §7.2's three compressed 01 §6 quotations are corrected
> to 01's exact wording ("elevated ~40°", "upper right … slightly behind the subject", "about
> 4:1 (two stops)"). No number, path, budget, arithmetic, or design content changed. §6.3's
> "the two documents publish one tree" sentence was re-read (not re-written) per Round 4's
> note: 02 §1.2/§7.1/§4.4 as now revised carry the flat D-011 tree, so the sentence is true
> as written.

## Table of contents

1. [Component inventory](#1-component-inventory)
2. [Scene graph, node naming, and pivots](#2-scene-graph-node-naming-and-pivots)
3. [Modeling specification](#3-modeling-specification)
4. [PBR material specifications](#4-pbr-material-specifications)
5. [Texture requirements and memory budget](#5-texture-requirements-and-memory-budget)
6. [Geometry export pipeline](#6-geometry-export-pipeline)
7. [Lighting and environment assets](#7-lighting-and-environment-assets)
8. [Material and lighting references](#8-material-and-lighting-references)
9. [2D fallback art and image-generation rules](#9-2d-fallback-art-and-image-generation-rules)
10. [Quality assurance checklist](#10-quality-assurance-checklist)

---

## 1. Component inventory

The machine is rebuilt from scratch as one hero object with eight separating parts, mapped 1:1 to
the PM's component canon. The reference frames define the silhouette, the component set, and the
band order (lid → thermal-and-components cluster → mainboard → chassis, per `teardown-4.png`);
none of their pixels ship (D-005).

### 1.1 The canon, part by part

| Canon name | Node | What the reference shows | Detail tier | Why that tier |
|---|---|---|---|---|
| Lid | `lid` | `closed.png`: a plain silver slab, three-quarter view, visible mid-height seam, hinge at rear, front lip notch. `teardown-4.png` top band: the same slab lifted, top surface only. | Hero (exterior), Medium (underside) | The exterior carries the opening; the camera holds on it longest at the start. The underside is seen briefly, at an angle, during lift-off — never closer than 200 mm (see §3.6). |
| Cooling Fan | `cooling_fan` | `layer-components.png`, left: a dark radial blower, thin-blade rotor reading as a ribbed disc, dark housing. | Hero | The vision (§9) demands specificity — "the cooling fan", legible as one. Blades are the most recognizable internal shape for a lay visitor. |
| Heat Pipes | `heat_pipes` | Top of the components band: a flattened pipe run spanning the cluster, with a plate at one end and a fin block near the fan exhaust. | Hero | The vision names heat pipes as a profile close-up subject. Camera reads them low and close; geometry must hold at 80 mm. |
| Storage (SSD) | `storage_ssd` | Center of the cluster: an elongated dark M.2 stick. | Hero | Named in copy; lifts alone; visitor must recognize "a small stick = all my files". |
| Memory (RAM) | `memory_ram` | Right of the cluster: a wide module with a visible gold edge-contact strip (the one warm pixel accent in the whole band). | Hero | Same reason as the SSD; the gold fingers are the honest warm accent the palette wants. |
| Support Boards | `support_boards` | Lower-left of the cluster: a small populated PCB; plus two smaller dark rectangles among the parts. | Supporting | They exist to make the teardown honest (a real ultrabook has daughterboards), not to be studied. Camera never approaches within 150 mm. |
| Mainboard | `mainboard` | Third band of `teardown-4.png`: a near-full-footprint dark PCB with visible packages; `teardown-3.png` middle band shows the same board still populated (fan + pipe attached). | Hero (the hero of heroes) | It is the destination of the teardown's middle act and the closest camera approach on the page. Highest polycount and the only 2048 maps (§5). |
| Chassis | `chassis` | Bottom band: a silver tub, screw bosses, raised structures along the front edge, ports on the left wall (also visible in `closed.png`). | Hero (exterior), Medium (interior) | Exterior matches the Lid's finish; interior is seen mostly under other parts. |

### 1.2 The populated-vs-bare board — resolved

The reference art contradicts itself: `teardown-3.png` shows the board *with* fan and pipe
attached; `teardown-4.png` lifts the cluster off a board that *still shows large packages
underneath* — the double-print ambiguity the predecessor README documents. The rebuild resolves
it structurally, so the flaw cannot recur:

- The `mainboard` mesh carries **only permanently-soldered parts**: SoC substrate + die, VRM
  chokes and capacitor fields, the M.2 socket with its standoff, the SO-DIMM socket with latches
  modeled in the **open** position (the only time the socket is visible is when the RAM is out),
  two USB-C connector shells + one audio jack on the left edge (aligned to the chassis wall
  cutouts), fan and battery header connectors (empty — see §1.3 on cables), screw bosses, and a
  thermal-paste imprint on the die (§4.9).
- Every removable module (`cooling_fan`, `heat_pipes`, `storage_ssd`, `memory_ram`,
  `support_boards`) is separate geometry seated in its exact footprint at assembly. Lift any of
  them and the board honestly shows the empty seat — open latches, bare socket, paste imprint —
  never a painted-on duplicate.

### 1.3 What the reference omits — decisions, flagged honestly

| Omission | Decision | Reason |
|---|---|---|
| **Keyboard deck** | The reference has no keyboard anywhere: the top band is a bare slab and nothing between it and the internals could hold keys. Decision: `lid` is modeled as the **entire upper clamshell half** — display back on top, keyboard deck + trackpad on its underside — moving as one sealed unit. | The closed laptop's top IS the lid (PM canon), and the seam in `closed.png` splits the body at mid-height: everything above the seam lifts as "the Lid". A laptop with no keyboard fails expert scrutiny worse than a merged lid+deck. The deck is a distinct sub-mesh (`lid_deck`, §2.1), so if a future storyboard ever separates it, that is a re-parent, not a remodel. Alternative rejected: modeling the underside as a dark display panel — then the machine has no keyboard at all, and the first hardware-literate visitor notices. |
| **Battery** | Added as `chassis_battery`: a 190 × 92 × 5.4 mm dark-gray pouch pack seated in the chassis tub, **non-separating** (it stays in the Chassis node). Plain label text: "Li-ion — 54 Wh". | The reference tub is bare; an empty tub reads as a display dummy under the exploded view's final hold. Batteries staying glued in the chassis is also how real teardowns go. It is a distinct mesh, so promoting it to its own named beat later costs nothing in modeling. **Ruled — D-015:** the PM activates the seated, label-only variant. The part ships exactly as specified here — non-separating, it never moves — and is now named: `label.battery` ("BATTERY") enters alongside `label.chassis` at 0.797, joins the B8 diagram, and appears in the fallback-still captions (§9.5). The lifted-battery variant is declined by the same entry (its reserve design stays pre-priced in 03 §14 / 01 §8). |
| **Speakers** | Two simple boxes (`chassis_speaker_l/r`, 58 × 18 × 5 mm) at the tub's front corners, non-separating. | The reference chassis shows raised front-edge structures; empty corners would contradict it. |
| **Display internals** | Not modeled. The lid never opens as a screen; it lifts sealed. | The story is the teardown of the base; opening the display is a different story, and panel internals would double the asset scope for zero beats. |
| **Cables / flex ribbons** | Not modeled. Board headers are modeled empty. | Dangling flexes need simulation to not look broken, and the page's fiction is that parts lift free — no hands, no tools (references.md, iFixit "what not to copy"). A rigid frozen cable would read as a mistake. |
| **Wi-Fi antennas** | Not modeled. | They live in the display bezel we never open; invisible at every framing. |
| **Screws as separate parts** | Screw heads are modeled in place on `chassis` and `mainboard` (non-separating geometry detail). | Eight flying screws would add beats the canon doesn't have; heads-in-place keeps the hardware honest without inventing motion. Flagged for the Animation Director: if a screw beat is ever wanted, this becomes a modeling change request. |
| **Webcam** | Not modeled (lives in the never-seen display bezel). | Same reason as antennas. |

---

## 2. Scene graph, node naming, and pivots

This section is canon for interface (d). Code, storyboard, and copy reference these names exactly.

### 2.1 Canonical hierarchy

Naming rules: `snake_case`, ASCII only, no spaces, sub-meshes prefixed by their parent node's
name. Exactly these names — the runtime looks nodes up by string, so a one-letter drift is a bug.

```
laptop_root                      (empty; origin = footprint center on the ground plane)
├─ lid                           Lid — upper clamshell half, sealed
│   ├─ lid_shell                 anodized top + side walls above the seam
│   ├─ lid_deck                  underside deck plate
│   ├─ lid_deck_keys             keycap field, one merged mesh
│   └─ lid_deck_trackpad         glass trackpad inset
├─ cooling_fan                   Cooling Fan
│   ├─ cooling_fan_housing       blower housing + exhaust flange
│   └─ cooling_fan_rotor         39-blade rotor (own spindle pivot, see 2.3)
├─ heat_pipes                    Heat Pipes — one assembly
│   ├─ heat_pipes_pipe           flattened 8 mm pipe run
│   ├─ heat_pipes_coldplate      die contact plate
│   └─ heat_pipes_finstack       exhaust fin block (45 fins)
├─ storage_ssd                   Storage (SSD) — M.2 2280 stick, one mesh
├─ memory_ram                    Memory (RAM) — SO-DIMM, one mesh
├─ support_boards                Support Boards (group)
│   ├─ support_board_io          left I/O daughterboard, 64 × 28 mm
│   ├─ support_board_wireless    M.2 2230 wireless card, 30 × 26 mm
│   └─ support_board_aux         connector/audio board, 46 × 20 mm
├─ mainboard                     Mainboard — one mesh incl. soldered parts (§1.2)
├─ chassis                       Chassis
│   ├─ chassis_tub               tub + walls + bosses + port cutouts + screw heads
│   ├─ chassis_battery           non-separating battery pack (§1.3)
│   ├─ chassis_speaker_l         front-left speaker box
│   ├─ chassis_speaker_r         front-right speaker box
│   └─ chassis_feet              4 rubber feet, merged
└─ locators
    ├─ loc_lid_hinge             empty at the hinge axis (see 2.4)
    └─ loc_ground_center         empty at world origin (capture/QA registration)
```

Mesh count: 20 renderable meshes (cap 24). Few meshes = few draw calls; every mesh above earns
its separateness by either moving independently, being promotable (battery, deck), or needing its
own pivot (rotor).

### 2.2 Coordinate system

- glTF standard: **+Y up, meters**. `laptop_root` origin at the center of the closed laptop's
  footprint, y = 0 at the ground (foot contact). **+Z is the laptop's front edge** (toward the
  viewer's default side), +X is the viewer's right. Hinge line sits at z = −0.106 m.
- Authored in Blender (Z-up); the glTF exporter's default "+Y up" conversion handles it. The
  exported file is the contract — all coordinates in this document are glTF/world space, in mm
  for readability.

### 2.3 Pivots — where the separation moves grab

Rule: **every top-level part's node origin sits at the geometric center of its own bounding box
in the assembled (closed) pose**, tolerance ±0.5 mm, axes world-aligned. Reason: the storyboard's
separation moves are straight lifts and gentle tilts (vision §1: parts "rise off the board");
a centered pivot makes translation symmetric and lets a small rotation read as a tilt-in-place
rather than a swing around a distant corner. Two exceptions, both stated:

- `cooling_fan_rotor`: origin on the spindle axis at blade mid-height — so the rotor can spin
  in place if the storyboard ever calls for it (capability offered; motion is the Animation
  Director's call).
- `locators/loc_lid_hinge`: empty at (x 0, y 9.0, z −106.0) — the lid/base seam at the rear
  edge. If a hinge-style tilt of the Lid is ever choreographed, the Animation Director parents or
  pivots about this locator instead of asking for a re-export.

Assembled-pose origins (world mm, ±1 mm; final values are measured off the export in QA §10.4):

| Node | x | y | z |
|---|---|---|---|
| `lid` | 0 | 12.3 | 0 |
| `cooling_fan` | −92 | 8.3 | −58 |
| `heat_pipes` | −10 | 10.6 | −72 |
| `storage_ssd` | −18 | 9.6 | −18 |
| `memory_ram` | 62 | 9.7 | −8 |
| `support_boards` | −98 | 8.9 | 38 |
| `mainboard` | 0 | 7.1 | −22 |
| `chassis` | 0 | 5.1 | 0 |

### 2.4 What the GLB must NOT contain

No cameras, no lights, no baked animation tracks, no skins. Camera and timing belong to the
Animation Director at runtime; lighting is scene-level per §7. A GLB carrying any of these fails
QA (§10.6) — it would smuggle authorship across the interfaces.

---

## 3. Modeling specification

### 3.1 Real-world dimensions (chosen numbers)

A 13.5-inch-class thin aluminum ultrabook. Chosen to match the reference silhouette's footprint
ratio (`closed.png` reads ≈ 1.43 : 1) and plausible real hardware:

| Part | Dimensions (w × d × h, mm) | Notes |
|---|---|---|
| Closed body | **304 × 212 × 15.6** | 14.4 body + 1.2 feet; seam at y 9.0 |
| Lid (upper half) | 304 × 212 × 6.6 | shell 1.8 thick; deck plate on underside |
| Chassis (tub) | 304 × 212 × 7.8 | walls 1.6; port cutouts left wall |
| Mainboard PCB | 262 × 158 × 1.2 | components up to 4.5 above board |
| Cooling Fan | 64 × 58 × 6.2 | rotor Ø 45, 39 blades |
| Heat Pipes assembly | 176 span, pipe 8 w × 3 h | coldplate 38 × 32 × 2; finstack 55 × 11.5 × 6.5 |
| Storage (SSD) | 80 × 22 × 3.6 | M.2 2280 |
| Memory (RAM) | 69.6 × 30 × 3.9 | SO-DIMM, 8 DRAM packages |
| Support boards | 64 × 28 / 30 × 26 / 46 × 20 | io / wireless / aux |
| Battery | 190 × 92 × 5.4 | in-chassis, non-separating |

Real size in meters in the file (laptop width exactly **0.304 m**) — IBL intensity, shadow
softness, and camera FOV all read correctly only at true scale.

### 3.2 Polycount budget (triangles)

The page has exactly one hero object, so budget goes where the camera goes close (the mainboard
and the thermal parts), and stays lean where surfaces are large and smooth (aluminum bodies,
whose quality comes from reflections, not density).

| Node | Budget (tris) | Reasoning |
|---|---|---|
| `lid` (all sub-meshes) | 24,000 | Big smooth surfaces + a full keycap field; keys are one merged relief mesh with real 0.4 mm chamfers, ~180 tris/key × 78 keys ≈ 14 k, shell + deck + trackpad ≈ 10 k |
| `chassis` (all) | 26,000 | Tub + bosses + ports + battery + speakers + feet; interior detail is geometry because the camera passes over it in the ending tableau |
| `mainboard` | 38,000 | The closest-approach hero: sockets, connector shells, choke and capacitor fields as real (merged) geometry — silhouette detail cannot come from normal maps at 80 mm |
| `cooling_fan` | 16,000 | 39 blades × ~300 tris (thin curved shells, both faces) ≈ 11.7 k + housing 4 k |
| `heat_pipes` | 12,000 | Pipe 24-segment sweep; 45 real fins at 1.2 mm pitch (~540 tris) + coldplate; profile close-up must show true fin gaps, not a normal-mapped decal |
| `storage_ssd` | 5,000 | PCB + controller + 2 NAND packages + label surface |
| `memory_ram` | 5,500 | PCB + 8 DRAM packages + gold-finger edge |
| `support_boards` (3) | 9,000 | 3 k each — populated but supporting-tier |
| **Total** | **135,500** | **Hard cap 150,000** — comfortable for a two-year-old phone at one object / ≤ 24 draw calls, and inside 02 §8.2's ≤ 350 k scene line with room to spare; headroom absorbs QA fixes without renegotiation |

### 3.3 Hard-surface standards

- **No visible faceting on aluminum at 150 mm camera distance** (the aluminum minimum-approach
  distance, §3.6): all visible edges get real chamfers ≥ 0.3 mm (2 segments) with weighted
  normals; no high-to-low-poly normal baking on the aluminum bodies — they are smooth by
  construction, and baked bodies would add texture cost for nothing.
- Cylindrical geometry segment counts, derived from the closest approach (at 80 mm, ~40° vertical
  FOV, 1080 px tall ≈ 18.6 screen px per mm): heat pipe 24 segments (chord error 0.026 mm ≈ 0.5 px
  — invisible), rotor hub 32, screw heads 12, feet 16.
- All meshes single-sided except the fan blades (double-sided thin shells); every part is fully
  modeled on all faces, **including faces hidden in the assembled pose** — true separation means
  any part can be isolated and orbited with no holes (QA §10.2 tests exactly this; this is the
  structural kill of the predecessor's "stray sliver" flaw).

### 3.4 UV standards

- One UV set per mesh; AO shares it (packed ORM, §5.1). No second UV channel — it costs vertex
  memory and the per-part-isolated AO bake (§7.4) doesn't need it.
- Texel density targets (baseColor): **hero board 7.8 px/mm** (2048 px across the 262 mm board),
  **aluminum bodies 3.2 px/mm** (2048 atlas A base; near-uniform anodize plus keycap legends —
  legends need this density, the anodize itself does not), **modules 10 px/mm** (small parts,
  1024 atlas). ORM maps run at half the baseColor density on atlases A and B (§5.1) — AO and
  roughness noise are edge-free content, so half density is invisible where baseColor density
  carries the edges. Verified with Blender's Texel Density Checker addon (QA §10.5).
- Seams only on hidden or occluded edges (part undersides, interior walls, under the fin stack);
  **no visible seams on any hero surface** at the §3.6 distances. Island gutter ≥ 8 px at 2048.
- Mirroring allowed only on symmetric supporting sub-meshes (speaker boxes, feet); never on the
  mainboard or any silkscreened surface (mirrored text is an instant honesty fail).

### 3.5 Silkscreen and on-asset text

Board silkscreen uses plain reference designators (R101, C204, J1 …) and one board ID near the
front edge: `WEBSHARKE ENG-01 · REV A`. Reason: a blank board reads as a render; real boards are
labeled; self-labeling with the project's own plain name is honest (Framework does exactly this)
and invents no marketing fiction. On-asset artwork text is not page copy, but because it is
readable on screen the Creative Director gets sign-off on these strings before texture lock
(interface a). **Typeface on textures: D-DIN Regular** (the D-DIN family commissioned by Datto,
Inc., released 2016), licensed under the **SIL Open Font License 1.1** — a free DIN-alike grotesk
whose license permits commercial use and rasterization into artwork. It is used only in texture
authoring (rasterized into the baseColor masters) and **never ships as a font file**, so D-004's
two-font rule is untouched; the font file's source URL and SHA-256 are logged in the provenance
manifest (§6.5) like every other texture source. Because the hero silkscreen is ETC1S-encoded
(§5.1), all silkscreen strokes are authored ≥ 2 texels wide (≥ 0.26 mm at 7.8 px/mm) so block
compression cannot sever them — the §10.5 legibility gate verifies the result, not the intent.
Keycap legends: standard ANSI in the same D-DIN, low-contrast (10% lighter than the cap), because
blank keys read as a display dummy but the deck is never closer than 200 mm.

### 3.6 Minimum camera distances (contract with the storyboard)

Assets are built to survive, at 1920 × 1080 and devicePixelRatio 2:

- **80 mm** — mainboard, heat pipes, cooling fan, SSD, RAM (hero surfaces).
- **150 mm** — lid exterior, chassis exterior (aluminum bodies).
- **200 mm** — lid underside (deck, keys, trackpad), support boards, chassis interior.

The Animation Director choreographs close-ups no closer than these floors; going closer is a
change request against this document, not a silent decision. (Stated here because texel density,
chamfer size, and segment counts above are all derived from these numbers.)

---

## 4. PBR material specifications

Workflow: glTF metallic-roughness. Twelve logical materials, consolidated into **four glTF
materials — one per texture atlas** (§5.1) — with all per-region variation driven by the maps.
Reason: material count ≈ shader-switch count; four materials keeps the whole laptop under 24 draw
calls. Values below are the authored targets in the maps.

| # | Material (region) | Atlas | baseColor (sRGB) | Metallic | Roughness | Notes |
|---|---|---|---|---|---|---|
| 1 | Anodized aluminum (lid, chassis) | A | `#c8cbce` | 1.0 | 0.42–0.50 (noise-varied) | Bead-blasted anodize like the reference — **not** brushed, so no anisotropy extension needed; micro-noise in roughness breaks up reflections. **Flag to PM:** 01 §6's material read mentions "visible brushed anisotropy at close range" — the reference art (`closed.png`) and this spec read bead-blasted. Reconcile in the master spec; if brushed wins, material #1 changes and the anisotropy extension cost lands in 02's loader/extension surface. |
| 2 | PCB solder mask (all boards) | B / C | `#0d1412` | 0.0 | 0.60 | **Decision: dark green-black.** The reference boards read near-black; a green-black keeps them in the site's dark cool family while staying honest to real solder mask under warm light. Silkscreen `#c9ccc4` |
| 3 | Solder pads / joints | B / C | `#b9bec2` | 1.0 | 0.35 | Painted as metallic-mask regions on the board atlases |
| 4 | Copper heat pipes + fins | D | `#c87d52` | 1.0 | 0.32 | **Deliberate deviation, approved — D-016:** the reference pipe reads dark (blackened/taped), but the vision names copper as the warm accent that exists *in the scene* ("aluminum, silicon, copper"; accent color "must exist in the scene"). Raw-copper pipes are equally common in real ultrabooks; this is the palette's engine, so we choose it — allowed because references are references only (D-005). 01 §8.5.2 flags the identical deviation with the identical reasoning, and D-016 settles it: raw copper stands, `copy.B3`'s "copper heat pipes" stands, and 01's staged non-copper fallback sentence is retired |
| 5 | Silicon die (SoC) | B | `#3a3f46` | 0.0 | 0.15 | Near-polished dark die on a `#123018` substrate |
| 6 | Chip packages (NAND, DRAM, VRM) | B / C | `#16181a` | 0.0 | 0.75 | Matte epoxy; laser-etch text `#8d9094` |
| 7 | Gold edge fingers (RAM, wireless) | C | `#d4af6a` | 1.0 | 0.25 | The one warm metal beside the copper |
| 8 | SSD label | C | `#ded9cf` | 0.0 | 0.85 | **Decision — the honest unbranded label:** matte paper, dark-gray plain text `NVMe SSD` / `1 TB`, thin keyline. No real brands, no invented brand names, no fake barcodes or certification marks — decorative fakery is exactly what §9 of the vision bans |
| 9 | Fan plastic (housing, rotor) | D | `#1b1d1f` | 0.0 | housing 0.60 / rotor 0.45 | Glass-filled nylon look; the rotor slightly glossier so blades catch a moving highlight |
| 10 | Steel shields / brackets | C | `#9ea3a6` | 1.0 | 0.35 | Stamped shields on support boards |
| 11 | Rubber feet | A | `#2a2c2d` | 0.0 | 0.90 | Dead matte — they must not sparkle in the contact-shadow zone |
| 12 | Thermal paste imprint | B (board) + D (coldplate) | `#b9bdc0` | 0.0 | 0.35 | **Decision: visible.** When the Heat Pipes lift, the die shows a thin gray paste footprint and the coldplate shows its mirror image — the single most "this is real" detail a teardown can show, at zero geometry cost |
| — | Trackpad glass | A | `#3f4548` | 0.0 | 0.20 | Inset on `lid_deck_trackpad` |
| — | Battery pouch | A | `#33363a` | 0.0 | 0.65 | Label text `Li-ion — 54 Wh`, same honest-label rules as #8 |

No emissive anywhere — nothing on this machine is powered, and the vision bans glow without a
light source. No transmission/clearcoat extensions — nothing needs them, and every extension is
transcoder/loader surface area.

---

## 5. Texture requirements and memory budget

### 5.1 Atlases and maps

Four atlases; each is one glTF material (§4). Maps per atlas: `base` (sRGB), `normal` (linear),
`orm` (linear; R = per-part AO, G = roughness, B = metallic — the glTF-native packing, one sampler
instead of three). **11 KTX2 files total** — atlas A ships no normal map (reasoned below).

| Atlas | Contents | base | normal | orm | Why these resolutions/encodings |
|---|---|---|---|---|---|
| **A `aluminum`** | lid shell+deck+keys+trackpad, chassis, battery, feet | 2048 ETC1S | **none** | 1024 ETC1S | Base at 2048 for keycap legends and label text at 3.2 px/mm; the anodize field itself is near-uniform, so ETC1S compresses it hard. **No normal map:** every chamfer and key edge is real geometry with weighted normals (§3.3), and the anodize micro-grain is sub-texel at this density — its visual work is done by the ORM roughness noise. A 1024 UASTC normal here cost ~0.5 MB for content the geometry already carries. ORM at 1024 (half density): AO and roughness noise are edge-free |
| **B `mainboard`** | mainboard top + bottom | 2048 ETC1S | 512 UASTC | 1024 ETC1S | The hero of heroes at 80 mm. Base ETC1S (not UASTC) is the budget call the global payload forces: ETC1S risks smearing fine text, so the silkscreen is *authored for ETC1S* — strokes ≥ 2 texels (§3.5), pale-on-dark luminance contrast (ETC1S's weakness is chroma detail, not luminance) — and the §10.5 legibility gate is the tripwire; if it fails at `--qlevel 220`, the ladder (§5.3) renegotiates, never a silent quality drop. Normal at 512 (round-2 ladder step 2, baked into the baseline to fit 02 §8.1's ≤ 2.8 MB texture line — §5.3): solder-mask ridges over traces are shading variation, not edges — package silhouettes are geometry and all text is baseColor, so the 80 mm softening touches finish only; 1024 is the first recorded upgrade if the PM ever re-splits 02's lines (§5.3 upgrade ladder) |
| **C `modules`** | SSD, RAM, support boards, shields | 1024 ETC1S | 512 UASTC | 512 ETC1S | Small parts → 1024 gives ~10 px/mm. Base ETC1S under the same authored-for-ETC1S text rules as atlas B (label/etch strokes ≥ 2 texels = 0.2 mm at 10 px/mm) with the §10.5 gate extended to the SSD label. Normal 512: package edges are geometry; the map carries only PCB surface texture |
| **D `thermal`** | fan housing + rotor, heat pipes, coldplate, finstack, paste | 1024 ETC1S | 512 UASTC | 512 ETC1S | Copper and black plastic are low-frequency in albedo (ETC1S is fine). Normal at 512 UASTC (round-2 ladder step 1, baked into the baseline — §5.3): the heat-pipe flattening marks and coldplate machining soften at the 80 mm profile close-up, honestly stated — but fins, blades, and the pipe profile are real geometry (§3.3), so every silhouette holds, and ORM roughness still carries the finish variation; 1024 is the second recorded upgrade (§5.3 upgrade ladder) |

Normals stay UASTC everywhere they exist: ETC1S normals band visibly on smooth curved metal
(the copper pipe is the worst case), and banding on the one "jewelry" highlight would be seen.

### 5.2 Compression pipeline

KTX2/Basis Universal, transcoded at runtime by the vendored Basis transcoder (no CDN, D-003;
the transcoder wasm is inside 02 §8.1's decoders ≤ 1.4 MB line — flagged, interface c). Authored
as 16-bit PNG masters, encoded with `toktx`:

```
toktx --t2 --genmipmap --assign_oetf srgb   --encode etc1s --clevel 5 --qlevel 220                     mainboard_base.v1.ktx2   mainboard_base.png
toktx --t2 --genmipmap --assign_oetf linear --encode uastc --uastc_quality 3 --uastc_rdo_l 0.75 --zcmp 19  mainboard_normal.v1.ktx2 mainboard_normal.png
```

(ETC1S for sRGB and ORM maps — with the §3.5/§5.1 authored-for-ETC1S text rules and the §10.5
gate; UASTC + RDO + zstd for all normals.) Fallback for the rare WebGL context without any
compressed format: the KTX2 transcoder decompresses to RGBA in memory — no separate JPEG texture
set is shipped, because the 2D fallback branch (§9) covers genuinely weak clients entirely.

### 5.3 The sums (interface c — verified against 02 §8.1 as published)

**The available envelope, from the budget owner's published lines (02 §8.1, current revision).**
02 caps the 3D-mode cold-cache total at **≤ 8.5 MB** and splits the asset envelope into three
lines: **GLB ≤ 1.8 MB · textures ≤ 2.8 MB · HDR ≤ 1.0 MB** (= 5.6 MB of asset allocation). Its
non-asset caps sum to **2.83 MB** (critical path 0.30 + Three.js 0.75 + addons 0.18 + GSAP 0.14 +
our JS 0.06 + decoders 1.40), and 02's own line-sum check is 8.43 ≤ 8.5 with a stated governing
rule (the 8.5 MB total wins any future conflict). Correction of this document's round-2 text: it
cited a "model + textures ≤ 5.0 MB" line that does not exist in 02 as published, and quoted 02's
round-1 non-asset figures (0.40 critical / 0.13 GSAP) — both replaced here with 02's current
numbers. No decision-log entry re-splits 02's lines (the revision-round rulings D-009–D-017 are
now recorded and none touches 02 §8.1), so the plan below fits the lines **as published** by **baking the round-2 ladder's
first two steps into the baseline**: atlas B and atlas D normals ship at 512 UASTC (§5.1),
−0.75 MB expected against round 2. Cost, stated honestly: solder-mask ridge shading and coldplate
machining marks soften at the 80 mm close-ups. Accepted because every edge, silhouette, and
legibility surface is untouched — fins, blades, and package bodies are real geometry (§3.3) and
all text lives in baseColor, so the §10.5 gates are unaffected; the budget line is the law, and
the design intent is recorded in the upgrade ladder below, not smuggled.

**Download payload (expected / cap):**

| Item | Expected | Cap | 02 §8.1 line |
|---|---|---|---|
| `laptop.v1.glb` (Draco, §6.2) | 1.05 MB | 1.20 MB | ≤ 1.8 MB ✓ |
| Atlas A (base 2048 ETC1S 0.40 + orm 1024 ETC1S 0.22) | 0.62 MB | 0.70 MB | — |
| Atlas B (base 2048 ETC1S 0.70 + normal 512 UASTC 0.14 + orm 1024 ETC1S 0.16) | 1.00 MB | 1.13 MB | — |
| Atlas C (base 1024 ETC1S 0.28 + normal 512 UASTC 0.14 + orm 512 ETC1S 0.05) | 0.47 MB | 0.53 MB | — |
| Atlas D (base 1024 ETC1S 0.20 + normal 512 UASTC 0.14 + orm 512 ETC1S 0.05) | 0.39 MB | 0.44 MB | — |
| **Textures subtotal (11 KTX2 files)** | **2.48 MB** | **2.80 MB** | **≤ 2.8 MB — caps sum to the line exactly** |
| Environment `.hdr` (§7.2) | 0.85 MB | 1.00 MB | ≤ 1.0 MB (= 02's line) |
| **3D-path asset total** | **4.38 MB** | **5.00 MB** | inside 02's 5.6 MB asset allocation |

Checks, shown: expected textures **2.48 ≤ 2.8 MB** (0.32 slack); the four per-atlas caps sum to
**2.80 MB = 02's line exactly**, so no combination of at-cap files can breach it. GLB cap 1.20
sits 0.60 under 02's 1.8 line — the slack stays 02's, because geometry may never hide inside the
texture line (02's own reason for splitting them). HDR cap = 02's line. Asset caps total
5.00 ≤ 5.6; with every non-asset line at its cap the worst cold-cache total is 2.83 + 5.00 =
**7.83 ≤ 8.5 MB**, and at expected sizes ≈ 7.21 MB — this plan passes 02's per-line caps *and*
its governing total simultaneously, under both readings of its rule. Expected sizes are
encoder-realistic for this content class (near-uniform anodize, dark low-chroma board, denoised
masters), not aspirations; each atlas carries ≈ 13% cap headroom, and the ladder below is the
pressure valve if any measured file lands over.

Fallback stills (§9) are a separate repo weight, never fetched in 3D mode (02 §7.1; its QA-1
audits for zero `fallback/` requests — a binding acceptance test per D-013): this document's set
cap is ≤ 1.6 MB (§9.3), landing on
02 §8.1a's published **≤ 1.6 MB set line** exactly, with the largest per-file cap (130 KB
WebP-2560) inside 02's **≤ 220 KB per-file line**; a fallback-branch visitor downloads one
format at one width per frame ≈ 0.14–0.53 MB expected, worst case 5 × 130 KB = **0.65 MB — the
figure 02 §8.1a itself computes and publishes as the worst single-visitor download** (typical
AVIF path ≈ 0.35 MB per 02; there is no separate single-visitor budget line in 02, and this
document's round-3 citation of one is withdrawn — the line does not exist).

**GPU texture memory (transcoded; ETC1S → 4 bpp BC1/ETC1-class, UASTC → 8 bpp BC7/ASTC-class;
×1.33 mips):** A ≈ 3.5 MB, B ≈ 3.8 MB, C ≈ 1.2 MB, D ≈ 1.2 MB, environment PMREM ≈ 4.2 MB →
**≈ 14 MB total** (cap 24 MB, unchanged from round 2) — inside 02 §8.2's ≤ 48 MB tier-B line
with 3× margin.

**The downscale ladder (restated from the new baseline).** It applies, in order, if any measured
file exceeds its cap above or if 02's budgets are revised downward; nothing else may be silently
resized — the ladder is the whole negotiation:

1. Environment → 768 × 384 (−0.35 MB). Cost: slightly softer reflection streaks — near-invisible
   at anodize roughness ≥ 0.42.
2. A base → 1024 ETC1S (−0.22 MB). Cost: keycap legends soften; survivable at the 200 mm deck
   floor; §10.5 legend check re-run.
3. B base → 1024 ETC1S (−0.45 MB). **Last resort:** silkscreen at 80 mm will likely fail the
   §10.5 gate, so this step requires the Animation Director to relax the closest board approach
   to 120 mm — a joint change request across documents, never a silent decision.

Full ladder pulls the expected asset total from 4.38 MB to ≈ 3.36 MB.

**The upgrade ladder (design intent, recorded).** The two normals baked down in this revision are
the first two upgrades if the PM ever re-splits 02's lines by a superseding `decisions.md` entry
— none of the recorded rulings D-009–D-017 does; Seam F closed without a re-split. In order: (1) atlas B normal → 1024 UASTC (+0.41 MB payload,
+1.04 MB GPU — restores solder-mask ridge shading at 80 mm); (2) atlas D normal → 1024 UASTC
(+0.34 MB, +1.04 MB GPU — restores coldplate machining marks at the thermal profile close-up).
Neither step happens without the cited entry; this paragraph exists so the quality intent
survives the budget decision instead of being lost to it.

---

## 6. Geometry export pipeline

### 6.1 Authoring

- **Blender 4.x LTS** (exact minor version pinned in the asset manifest at build time, §6.5).
  Single source file `laptop.blend`; scene units metric, 1.0 scale.
- Modifiers applied before export except mirrors already resolved in mesh data. No n-gons in the
  export mesh (triangulated by the exporter with fixed "Shortest Diagonal" method so re-exports
  are deterministic).
- Export: **glTF 2.0 Binary (.glb)** with **external texture URIs** (sibling `*.ktx2` files at
  the `assets/` root via `KHR_texture_basisu`, per D-011's flat mount — §6.3). One file for
  geometry+materials, textures fetched in parallel — this
  leaves the Technical Architect free to prioritize, preload, or defer maps without repacking
  geometry. (A fully-embedded GLB was rejected: it welds a multi-megabyte atomic fetch and forces
  all-or-nothing loading. This seam is healed: 02 §1.2 as revised adopts this external-KTX2
  packaging — its §7.1 phase table fetches geometry, textures, and HDR in parallel and its §8.1
  budgets GLB and textures as split lines.)
- Export settings: +Y up ✓, apply modifiers ✓, tangents ✓ (three.js should never compute tangents
  at runtime), vertex colors ✗, animations ✗, cameras ✗, lights ✗ (§2.4).

### 6.2 Compression — Draco, decided

`gltf-transform draco laptop.glb laptop.glb --quantize-position 14 --quantize-normal 10 --quantize-texcoord 12`

- **For:** ~4–6× geometry reduction (raw buffers for 135 k tris with tangents ≈ 5 MB → expected
  ≈ 1.05 MB, cap 1.20 MB per §5.3); the decoder path in three's `GLTFLoader` is long-proven.
- **Cost, accepted:** the vendored `draco_decoder.wasm` ≈ 0.31 MB (inside 02 §8.1's decoders
  ≤ 1.4 MB line — flagged, interface c) and ~50–150 ms decode on a mid-range phone, once, during
  the loader phase — not during scroll.
- **Alternative noted and rejected:** `EXT_meshopt_compression` (smaller decoder, faster decode)
  relies more on transport compression and is the less-traveled loader path; if the Technical
  Architect's document makes a reasoned case for meshopt, the switch is one pipeline flag and does
  not touch this document's budgets.
- Quantization sanity: 14-bit positions over a 0.304 m extent = 0.019 mm steps — an order of
  magnitude below the 0.3 mm chamfers, so no visible quantization anywhere.

### 6.3 Canonical asset tree and file naming (interface d)

**Mount point, directory structure, and versioning are the Technical Architect's, recorded as
the interface of record in `decisions.md` D-011 and adopted here in full: all runtime assets
mount at `engineering/assets/`, flat, with exactly one subdirectory — `fallback/` — and a
per-file `.vN` version token in every file name** (`laptop.v1.glb` → `laptop.v2.glb`), immutable
once shipped — a change is always a **new URL**, never an in-place edit, which is what keeps 02
§7.6's immutable cache header (source pattern `/engineering/(vendor|assets)/(.*)`) safe: every
asset URL carries its version, so nothing under the subtree can serve stale. The mount owner's
reason for per-file tokens over a version directory is adopted along with the mechanism:
invalidation is per-file — re-mastering one texture re-downloads one file instead of discarding
~5 MB of still-valid cache because a whole directory's URLs changed — and 02's loader already
carries a 13-entry per-file manifest, so per-file versions cost one name edit and zero new
machinery. **Correction, on the record (review Seam D, closed by D-011):** this document's
round-3 text adopted an `engineering/assets/v1/` version directory as "02 §1.2, current
revision" and withdrew `.vN` as "02's abandoned round-1 mechanism" — both attributions were
false. The per-file `.vN` token is the mount/versioning owner's mechanism, now recorded in
D-011; the `v1/` directory was this document's own earlier mechanism, mirror-swapped twice, and
is withdrawn for the per-file-invalidation reason above. D-011 is the tree's specification of
record and this section transcribes it — identically, so the two documents publish one tree.

**The `models/` subdirectory — ruled out by D-011, concurred with on the merits.** D-011 places
the geometry at `assets/laptop.v1.glb` with no `models/` directory; this document concurs, not
merely by deferral: the tree holds exactly one geometry file, a one-file directory
buys no organization while adding a path segment and one more place for two documents to
diverge, and name collisions between versions are already impossible because every version is a
distinct filename. File basenames *inside* the tree remain this document's canon (interface d —
D-011 states it: "File basenames are the Asset Director's canon"). The stills directory is
**`fallback/`** — D-011's single permitted subdirectory; this document's `posters/` name stays
withdrawn — with the poster designation deleted (§9.3, ratified as D-013) the name was wrong
anyway, and 02's §7.1 phase table, §10.2 markup, and QA-1 already reference `fallback/`.

```
engineering/assets/                (flat — D-011; fallback/ is the only subdirectory)
├─ laptop.v1.glb               Draco geometry; textures external via KHR_texture_basisu (§6.1)
├─ aluminum_base.v1.ktx2       aluminum_orm.v1.ktx2
├─ mainboard_base.v1.ktx2      mainboard_normal.v1.ktx2   mainboard_orm.v1.ktx2
├─ modules_base.v1.ktx2        modules_normal.v1.ktx2     modules_orm.v1.ktx2
├─ thermal_base.v1.ktx2        thermal_normal.v1.ktx2     thermal_orm.v1.ktx2   (11 KTX2 files)
├─ studio-warm.v1.hdr          environment (§7.2)
└─ fallback/
    └─ teardown-r{0..4}_{1280|2560}.v1.{avif|webp}                               (20 files)
```

**`studio-warm.v1.hdr`, not `studio-warm_1k.v1.hdr`:** resolution stays out of the filename. A
name states what a file *is* and which version it is, never its encode parameters; the
resolution lives in the manifest (§6.5), and the §5.3 ladder's 768 × 384 step — which ships as
`studio-warm.v2.hdr` under the new-URL rule — must not change what the asset is called. The rule
is now agreed, not merely asserted: 02 §1.2 adopts it with this document's rationale quoted ("a
`_1k` token would lie the moment 04 §5.3's 768×384 ladder step ships"). Every alternative name
this document has carried in earlier rounds (`models/laptop.glb`, plain unsuffixed filenames
inside a `v1/` directory, `posters/`) is withdrawn in favor of the D-011 tree above, under the
mount owner's stated discipline adopted here in full: **no file may live under `assets/` without
a `.vN` token** (02 §1.2; D-011's "immutable once shipped") — the subtree is immutable-cached,
so an unversioned file there would cache stale forever.

Source files (`laptop.blend`, `studio-warm.blend`, PNG texture masters) live in
`docs/engineering-demo/asset-source/` — inside `docs/`, which `.vercelignore` already excludes,
so sources can never leak into the deploy (D-001's mechanism, reused). The provenance manifest
(§6.5) lives there too, as `docs/engineering-demo/asset-source/MANIFEST.md`: it is process
documentation that changes with every re-export, so it must not sit in the immutable-cached,
publicly deployed `assets/` tree.

### 6.4 Validation steps (run in order, every export)

1. **Khronos glTF-Validator** (`npx gltf-validator engineering/assets/laptop.v1.glb`):
   zero errors, zero warnings. (Dev-machine tooling; the no-build-step rule governs the served
   site, not authoring.)
2. **`gltf-transform inspect`**: verify tri counts per mesh against the §3.2 table, material
   count = 4, mesh count ≤ 24, no unused buffers.
3. **In-engine smoke load** in a bare vendored-three harness: zero console warnings, all 11
   textures resolve, `renderer.info.render.calls ≤ 24` with the whole model in frame.
4. **Visual diff vs reference**: assembled model posed to `closed.png`'s three-quarter view and
   overlaid at 1366 × 768, 50% opacity — max silhouette edge deviation **≤ 8 px** (≈ 1% of frame
   width). Same procedure against `teardown-4.png` for the exploded spacing *proportions* (spacing
   itself is the storyboard's to direct at runtime; the diff checks part shapes, not gaps).

### 6.5 Provenance

`docs/engineering-demo/asset-source/MANIFEST.md` records: Blender/toktx/gltf-transform versions,
source-file hashes, per-texture provenance (authored procedural / hand-painted / CC0 source with
URL), and the D-DIN font file's source URL + SHA-256 (§3.5). Reason: six months from now, "where
did this map come from" must have a written answer (vision §10), and the image-generation
prohibition in §9.4 is only auditable if provenance is logged.

---

## 7. Lighting and environment assets

The Creative Director owns the mood (01 §6 is the binding lighting direction; the numbers below
implement it); this section supplies the assets that deliver it and decides their construction.

### 7.1 The decision: environment-only room, no room geometry, CSS backdrop

- **No modeled room.** The beige room exists as (a) the IBL environment map, which puts warm,
  believable content into every aluminum reflection, and (b) the page's own CSS-painted backdrop
  behind the transparent canvas. **The backdrop's visual specification — color values, flat or
  gradient, everything — is the Creative Director's alone** (01 is adding a stage-backdrop entry
  to its closed inventory per its own revision; this document names no values). This document
  states only its two requirements on that spec: the backdrop must be CSS, not geometry and not
  an image (02 §3.1 requires the same, for DPR and text-contrast reasons), and it must read as
  the same room the HDRI reflects — wall meets reflection at the §10.6 visual pass.
- **Why no room geometry:** it would cost polygons, shadows, and another texture set to look
  worse than an authored HDRI at reflection time; a backdrop *image* would fight the site's
  responsive layout. Reflections are the only thing aluminum has — they must be believable, and
  IBL is the cheapest believable source.

### 7.2 The environment map

- **`studio-warm.v1.hdr`**, at the `assets/` root (path per §6.3's D-011 tree) — 1024 × 512
  equirectangular Radiance HDR, expected
  0.85 MB, **cap 1.0 MB = 02 §8.1's line** (if the denoised render lands over the cap, the §5.3
  ladder's 768 × 384 step applies — the cap is the law, resolution is the variable). `.hdr`
  chosen over KTX2-HDR because RGBE loads through three's stock `RGBELoader` with zero extra
  transcoder surface.
- **Authored, not sourced:** rendered in Blender (`studio-warm.blend`) from a simple room scene
  purpose-built to echo `interior.jpg`: beige plaster walls, warm pale floor, one large window
  softbox camera-right-rear, a wood-slat feature strip camera-left (it exists to put a few
  vertical warm streaks into the lid's reflection — a flat-walled HDRI reflects as nothing).
  Low-noise render (2,000 samples + denoise) so RLE compression stays efficient.
- **Key light geometry (01 §6's direction, expressed as numbers):** window hot spot at azimuth
  **+55° (right-rear quadrant — 01's "upper right … slightly behind the subject")**, elevation
  **40°** (01 §6's "elevated ~40°"); window white point toward **`#fff3dd`** (01 §6's stated
  white point; ≈ 4,900 K); key-to-ambient luminance ratio **4 : 1** (01 §6's key-to-fill "about
  4:1 (two stops)"). Matches `interior.jpg`, where the light band rakes from upper right and the
  plant's shadow falls left. The runtime key light (below) points the same way — one believable
  light direction, per the vision's "light behaves like light". 01 §6's exposure clamps
  (highlights ≤ `#fff8ec`, shadows ≥ `#1b1a19`) bind the HDRI render as they bind the page.

### 7.3 Ground / contact shadow — real-time, decided; rig numbers are 02's, settled by D-012

- One `DirectionalLight` aligned to the §7.2 key direction, casting onto a `ShadowMaterial`
  ground plane at y = 0. **The rig — mechanism and every rig number — is the Technical
  Architect's (02 §3.1/§4.3); this document quotes it and publishes nothing of its own.** The
  numbers are **settled by `decisions.md` D-012**, with 02 §4.3 remaining the derivation source
  of record — quoted exactly: plane
  **1.2 × 1.2 m**, opacity **0.35**, PCFSoft, shadow map **2048 (tier A) / 1024 (tiers B–C)**,
  ortho frustum **±0.45 m**, `bias −0.0003`, `normalBias 0.02`. 02 §4.3's derivation settles
  both numbers this seam ever argued about: the plane size is forced by the ending tableau — the
  Lid's final rank at +1.08W casts its shadow ≈ 0.53 m from center under the 40° key, outside a
  0.9 m plane's 0.45 m half-size and inside a 1.2 m plane's 0.60 m — and opacity 0.35 is 01
  §6's "~35% strength" made literal, which also closes the 0.32-vs-0.35 flag this section
  carried in round 3. Correction of this document's round-3 quotation (review Seam E, closed
  by D-012): it printed 0.9 m / 0.32 / −0.0002 as "02's current revision" — those were
  02's *withdrawn* numbers, mirror-swapped a second time; they are replaced above with the
  D-012 set, and this section keeps tracking the entry (and 02 beneath it) without edits,
  because it states no rig value normatively.
- **The acceptance criterion is 01's, unchanged:** penumbra at the chassis contact = **8–12% of
  the laptop's width ≈ 24–36 mm** (01 §6; at 0.304 m width) — also the honest physical read of
  `interior.jpg`'s large-window source — and the shadow must visibly track every separated part.
  The rig must produce both; how is 02's business.
- **Baked AO plane rejected** because the parts *move*: a baked blob under a laptop that is
  lifting apart is the predecessor's wrong-layer-shadow flaw wearing a new hat. The whole point
  of rebuilding in 3D is that shadows follow the parts.

### 7.4 Per-part AO — baked in isolation only

Each part's AO (ORM red channel) is baked **with every other part hidden** — self-occlusion only:
keycap gaps, fin gaps, tub corners, under-package crevices. **Never bake AO of the assembled
stack**: assembled-pose bakes print neighbor shadows into parts, which is literally the
predecessor's documented flaw reproduced in PBR clothing. Inter-part occlusion at assembly comes
from the real-time shadow + IBL. QA §10.3 tests this directly.

---

## 8. Material and lighting references

Exact targets so a 3D artist matches the same thing the documents mean. All are look references
(D-005) — no pixels move from these files into production.

| Target | Reference region | What to match |
|---|---|---|
| Anodized aluminum, broad read | `closed.png`, lid top surface, the long highlight sweep center-left | How wide and soft the highlight band is — bead-blasted anodize, not mirror, not brushed streaks (see the §4 #1 flag to PM re 01 §6's "brushed" wording) |
| Aluminum edge behavior | `closed.png`, front-right chamfered edge catching light | Chamfers read as a bright 1 px line — this is the 0.3 mm chamfer + weighted-normal standard at work |
| Chassis interior finish | `teardown-4.png`, bottom band tub floor | Slightly flatter/grayer than the exterior; visible bosses |
| Solder mask + silkscreen | `teardown-4.png`, third band, board center | Near-black board with faint sheen; silkscreen barely lighter — legible only near, per §5.1 atlas B reasoning |
| Fan blade read | `layer-components.png`, blower at left | Blades resolve as a fine ribbed disc at distance; only near do individual blades separate — the 39-blade count reproduces this |
| Gold accent | `layer-components.png`, RAM module right side, gold contact strip | The only warm glint in the cluster — match its restraint; the gold must not read jewelry-bright |
| Heat pipe **shape** (not finish) | `layer-components.png`, top-spanning pipe + fin block | Flattened pipe profile and fin block proportions. Finish deliberately deviates to raw copper (§4 #4, approved — D-016) |
| Room mood, light direction, shadow softness | `interior.jpg`, the diagonal light band and the plant shadow on the right wall | Azimuth/elevation/warmth per §7.2 (= 01 §6's numbers); shadow edges soft but directional — this image is the whole lighting brief in one frame |
| Exploded-view legibility | `teardown-4.png` overall | Parts separated enough to read individually, aligned on one axis — the Framework-style "diagram-grade clarity" note in `references.md` |

---

## 9. 2D fallback art and image-generation rules

The fallback contract for the no-WebGL / no-JS / reduced-motion branches (architecture and
storyboard own *when* each branch triggers and *which words* accompany the frames; this section
owns the images themselves).

### 9.1 The frames — 03 §11's five stills, adopted

The frame set is **03 §11's reduced-motion storyboard verbatim — five stills `R0`–`R4` at exact
timeline addresses — now recorded across all four documents as `decisions.md` D-014(b): exactly
five, at p = 0.000 / 0.160 / 0.633 / 0.743 / 1.000, rendered from the production model and
lighting per this section (never AI composites, never the legacy reference slices).** This
document's Round-1 three-frame proposal is withdrawn and its economy argument closes with the
entry — the count is a cross-document contract, and the storyboard's spec is frame-accurate and
story-complete. Per 03 §11's rules, **no text, labels, or captions are baked into any
render** — all captions are HTML beside the stills (selectable, translatable), which also makes
the renders compress harder (§9.3).

| File stem | 03 §11 state (timeline address) | Camera | What the frame shows |
|---|---|---|---|
| `teardown-r0` | `p = 0.000` — machine closed | `P0` | The assembled machine on its contact shadow: what the machine is |
| `teardown-r1` | `p = 0.160` — Lid at +0.50W | `P1` | The Lid lifted clear of the body — the first honest separation |
| `teardown-r2` | `p = 0.633` — thermal module, Storage, Memory, Support Boards all at +0.28W; Lid +0.50W | `P3` | The teardown in motion: every module truly risen off the Mainboard, empty seats visible |
| `teardown-r3` | `p = 0.743` — Mainboard at +0.14W | `P4` | The Mainboard lifted above the Chassis — the core exposed |
| `teardown-r4` | `p = 1.000` — full tableau, ranks per 03 §9.1 | `P5` | All eight canon parts separated and aligned — the "everything on the mat" destination |

All five addresses are 03 §11's published numbers as revised; this document's round-2 set
(0.200/0.655/0.790) was stale against the retimed storyboard (review Seam G) and is withdrawn —
under 03's current table the old addresses landed mid-camera-move (0.200 inside the P1→P2 move,
0.655 inside P3→P4), contradicting this table's own camera column. The published addresses each
sit on a hold boundary in 03 §3 (0.160 = the H2/B3 boundary with the camera still at `P1`;
0.633 = H5's start at `P3`; 0.743 = H6's start at `P4`), so every captured frame is a settled
scene and the camera column above is exact, not approximate.

### 9.2 Production — rendered from the production scene, nothing else

Frames are captured **from the production three.js scene itself**: drive the master timeline to
each 03 §11 address (`p = 0.000 / 0.160 / 0.633 / 0.743 / 1.000`, recorded in D-014(b) — camera
pose comes with the
timeline state for free, since the camera rides the same timeline), render at 2560 × 1600 with
`preserveDrawingBuffer` enabled in a capture-only flag, save the canvas as PNG masters. **Never**
Blender re-renders (tone mapping would diverge from the live page), **never** AI-generated
composites, **never** the old `images/Laptop/` slices (D-005 and D-014(b); the predecessor's
flaws live in those files). The fallback must be pixel-consistent with what a full-fat visitor sees — one look,
two delivery mechanisms.

Capture settings: devicePixelRatio 1 at 2560 × 1600, the same environment, key light, and
exposure as the live page; the capture harness logs `master.progress()` and the scene-build hash
per frame into the manifest (§6.5) so QA §10.7 can verify frame accuracy; `loc_ground_center`
framing registration follows from the shared timeline camera, so the five frames register with
each other in sequence by construction.

### 9.3 Encoding and sizes — this document's caps, inside 02 §8.1a's published lines

From each PNG master: AVIF (primary) + WebP (fallback) at two widths, via
`avifenc -j all -s 4 --min 16 --max 32` and `cwebp -q 78 -m 6 -sharp_yuv`:

| Variant | Expected | Per-file cap |
|---|---|---|
| `*_2560.avif` | ~70 KB | ≤ 100 KB |
| `*_2560.webp` | ~105 KB | ≤ 130 KB |
| `*_1280.avif` | ~28 KB | ≤ 40 KB |
| `*_1280.webp` | ~38 KB | ≤ 50 KB |

Per frame at cap: 320 KB; **set of 5 frames × 4 variants = 20 files, ≤ 1.60 MB at cap, expected
≈ 1.21 MB.** Whose numbers are whose, stated plainly: the per-variant caps above are **this
document's production budgets**; the governing architecture-side lines are **02 §8.1a's as
published — ≤ 220 KB per file** (02's reason: static mode has no designed loader, so every
still must arrive fast enough to need none; 220 KB ≈ 0.18 s at 10 Mbps) **and ≤ 1.6 MB full-set
repo weight**. Fit, shown: the largest file at cap here is the 130 KB WebP-2560, inside 02's
220 KB per-file line with 41% headroom; the set cap 1.60 MB lands on 02's set line exactly —
and 02 §8.1a records both back ("largest variant, the 2560 WebP, capped at 130 KB; set 1.60 MB
at cap, expected ≈ 1.21 MB"), so the two documents state one set of numbers. The worst
single-visitor download is one format at one width per frame: 5 × 130 KB = **0.65 MB — the
figure 02 §8.1a computes and publishes as its worst case** (typical AVIF path ≈ 0.35 MB).
Correction of this document's round-3 text (review Round 3, required change 3): it cited
per-file and set ceilings, and a single-visitor line, that do not exist in 02 as published; all
three citations are withdrawn in favor of the real lines above. This document's own
caps were always inside the real lines, so nothing downstream moves.
These sizes are achievable because the content class is friendly: a denoised synthetic render of
one object on a large smooth beige field, no grain, and (per §9.1) no baked text — the bits all
go to the machine. Contingency if any file exceeds its cap at the settings above (exact steps,
in order): (1) WebP `-q 78 → 70` / AVIF `--max 32 → 36`, re-encode; (2) if still over, the large
tier drops **2560 → 2048 × 1280 for all frames** (uniformity — mixed-resolution sets read as an
error) and re-encodes at the original quality. The set cap is the law; these two steps are the
whole negotiation.

Delivered via `<picture>` + `srcset` (works with JS disabled). No JPEG tier: AVIF+WebP jointly
cover effectively every 2026 browser, and the no-JS visitor with neither is served the page's
text — the story survives in words (D-007's "designed, not apologized" standard). Formats now
agree across documents as published: 02 §8.1a states AVIF + WebP, no JPEG, adopting this section.
**No poster exists — ratified as `decisions.md` D-013.** This document's round-2 designation of
`teardown-r0_2560` as a preloaded
poster — and its citations of a 02 preload and a "≤ 180 KB poster line" — are deleted: 02 §7.2
explicitly declines any poster — its reasoning, quoted verbatim: "a poster duplicates the first
frame at real download cost, and two first frames would be two designs" — and 02 §8.1 removed
the poster budget line with it. This document accepts
that reasoning rather than escalating — the wait state is 01 §7.6's designed loader, one loading
experience, and a poster would compete with it — and D-013 records the acceptance: the first
rendered frame of the 3D scene is the first image the visitor sees, and `R0` is never requested
in 3d mode. The five stills serve the fallback branches
only; none is preloaded, and 02's QA-1 (zero `assets/fallback/` requests in 3d mode) is a
binding acceptance test per D-013.

### 9.4 Image-generation prohibition (project-wide, this pipeline)

No AI-generated imagery anywhere in the production path — not textures, not the HDRI, not
fallback frames, not "just a base to paint over". Reasons: the vision's §9 test (every element
needs a sentence; generated pixels have no author and no sentence), provenance/licensing
auditability (§6.5), and the owner's documented rejection of AI-flavored work. Permitted texture
sources: procedural authoring, hand-painting, and CC0 photo sources (Poly Haven, ambientCG) used
as *surface grain*, each logged in the manifest with URL.

### 9.5 Alt-text data (content requirements + drafts; final wording = Creative Director)

Each frame ships with an alt-text slot in the fallback markup (02 §10.3: the Creative Director
writes the final strings in the copy deck). Required content: what the machine is, which canon
parts are visible, and what state they are in — plain names only. Drafts, one per 03 §11 still:

- `teardown-r0`: "A thin silver laptop, closed, in warm studio light."
- `teardown-r1`: "The same laptop with its lid lifted straight up, the interior just visible
  beneath."
- `teardown-r2`: "The lid held high while the cooling fan, heat pipes, storage, memory and
  support boards rise together off the mainboard."
- `teardown-r3`: "The mainboard lifted above the chassis, its components exposed; the battery
  sits in place in the chassis below."
- `teardown-r4`: "The laptop fully taken apart: lid, cooling fan, heat pipes, storage, memory,
  support boards, mainboard and chassis — the battery still seated in the chassis — each
  separated and aligned."

The battery appears in the `teardown-r3` and `teardown-r4` drafts per D-015: it is now a named
part (`label.battery`, entering with `label.chassis` at 0.797), so the two stills that show the
chassis interior — 0.743 and 1.000 — name it too. It is described as seated because it never
moves (§1.3, D-015).

---

## 10. Quality assurance checklist

Per-asset acceptance tests a reviewer can run without asking anyone anything. A failed line is a
rejected asset. Tools named per test.

### 10.1 No baked shadows or lighting in any map

- Load `laptop.v1.glb` with all materials swapped to `MeshBasicMaterial` using only `base` maps
  (three-line harness tweak): albedo must show **zero** directional shading, no shadow gradients,
  no neighbor silhouettes. (Kills predecessor flaw: baked shadows on wrong layers.)
- Inspect each ORM red channel in isolation: only self-occlusion (crevices, gaps) — hide-all-but-
  one bake per §7.4. Test: view any single part's AO; darkening where an *absent* neighbor sat = fail.

### 10.2 True separation

- In the smoke harness, isolate each of the 8 top-level nodes in turn (`node.visible` toggles):
  orbit 360° — no holes, no missing faces, no fragments of any other part. (Kills: stray
  slivers, no-true-separation.)
- With all removable modules hidden, the `mainboard` shows its empty seats: open SO-DIMM latches,
  bare M.2 socket + standoff, die with paste imprint — and **no painted-on duplicates** of any
  module in atlas B. (Kills: populated-vs-bare ambiguity.)

### 10.3 Pivots and hierarchy

- Script check (pseudocode, runnable in the harness console): for each top-level part,
  `Box3.setFromObject(part).getCenter()` vs the node's world origin — distance ≤ 0.5 mm, except
  `cooling_fan_rotor` (spindle rule, §2.3). Node names match §2.1 byte-for-byte
  (`scene.getObjectByName` for all 20 mesh names + 2 locators returns non-null).
- `loc_lid_hinge` sits at (0, 9.0, −106.0) ± 0.5 mm.

### 10.4 Scale and registration

- Laptop bbox = 0.304 × 0.0156 × 0.212 m ± 1 mm (`Box3` in harness).
- Assembled-pose origins match the §2.3 table within ±1 mm; the measured values are written back
  into the manifest (§6.5) as the final numbers the storyboard implementation reads.

### 10.5 Budgets, texel density, and text legibility

- `gltf-transform inspect`: per-mesh tris ≤ §3.2 budgets, total ≤ 150,000; 4 materials;
  ≤ 24 meshes; Draco present; tangents present; no animations/cameras/lights/skins.
- File sizes vs §5.3 expected/cap table (`ls -l`): every file ≤ its cap; textures subtotal
  ≤ 2.8 MB (02 §8.1's line — the four atlas caps sum to it exactly); GLB ≤ 1.20 MB (this
  document's cap, inside 02's ≤ 1.8 MB line); HDR ≤ 1.0 MB (= 02's line); GPU memory via
  `renderer.info.memory.textures` count + the §5.3 computed table.
- Texel density spot-check (Blender Texel Density Checker): board 7.8 px/mm ± 10%, aluminum
  3.2 px/mm ± 10%, modules 10 px/mm ± 10%.
- **ETC1S text-legibility gate** (the tripwire for the §5.1 ETC1S-for-text decision): at 80 mm
  camera distance, 1080p, the `WEBSHARKE ENG-01 · REV A` board ID and reference designators are
  readable with no severed strokes; same check for the SSD label (`NVMe SSD` / `1 TB`) at 80 mm.
  Keycap legends readable at 200 mm. A failure here triggers the §5.3 ladder discussion — it is
  never patched by silently re-encoding one map.

### 10.6 Load hygiene and visual match

- Khronos glTF-Validator: zero errors, zero warnings. Harness load: zero console warnings,
  all 11 KTX2 files resolve, draw calls ≤ 24 (`renderer.info.render.calls`).
- Silhouette overlay vs `closed.png` (per §6.4): edge deviation ≤ 8 px at 1366 × 768.
- No visible faceting on any aluminum surface at 150 mm; no visible UV seam on any hero surface
  at the §3.6 distances (manual orbit pass, checklist signed in the manifest).
- Contact-shadow read: penumbra at the chassis contact within 24–36 mm (§7.3, 01 §6's criterion),
  measured against a 10 mm-grid QA plane in the harness; backdrop-vs-reflection room match
  confirmed in the same pass (§7.1).

### 10.7 Fallback art

- All 20 files present, named per §6.3, within §9.3 per-file caps; set total ≤ 1.6 MB.
- Frame accuracy: each frame's logged `master.progress()` equals its 03 §11 / D-014(b) address
  exactly (0.000 / 0.160 / 0.633 / 0.743 / 1.000), and the logged scene-build hash matches the shipped
  build's hash in the manifest (a fallback frame captured from a stale model version = fail).
- No baked text in any frame (03 §11's rule — captions are HTML): visual pass per frame.
- Each `<picture>` block carries its alt-text slot; drafts present, CD sign-off recorded before
  ship (interface a).

---

*End of document. Every number above is a commitment; changes go through review, not through
quiet edits.*
