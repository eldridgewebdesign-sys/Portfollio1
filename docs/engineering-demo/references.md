# Engineering Demo — Reference Study

> Owned by the Project Manager. References teach principles; they never provide material. The
> finished page must feel original — including against its own references. For each reference:
> what makes it exceptional, what to learn, and what must NOT be copied.

---

## 1. Bruno Simon — bruno-simon.com

**What makes it exceptional.** The canonical proof that a personal site can be an experience people
remember for years. A drivable 3D world as a portfolio: total commitment to one idea, executed with
real physics, real humor, and craft in every collision sound and dust particle. It made "I didn't
know websites could do this" a genre.

**What to learn.**
- Total commitment: one strong concept carried through 100% of the page, no half-measures.
- The input *is* the delight — his car, our scroll. The connection between user action and scene
  reaction must be instant, precise, and satisfying in itself.
- Personality survives technical ambition. The tech never upstages the author's voice.
- Performance discipline: an experience this heavy only works because it's ruthlessly optimized.

**What NOT to copy.**
- The playground/game format. Ours is a directed story, not free roam — a small-business owner
  should never be handed a steering wheel and left to wonder what the point is.
- The toy-like, low-poly art direction. Our subject is photoreal hardware in studio light.
- Loading-screen tolerance. His audience waits for a portfolio legend; our visitor gives us seconds.

## 2. Apple — product pages (AirPods Pro, MacBook scroll sequences)

**What makes it exceptional.** The industry benchmark for scroll-driven product storytelling.
Scroll-scrubbed sequences where the product disassembles or rotates with per-frame precision;
typography and whitespace that give a $3,000 machine the presentation of a museum piece; copy
timed to appear exactly when its subject is on screen.

**What to learn.**
- Scroll-scrubbing discipline: position in the page maps deterministically to a moment in the
  sequence. Reversible, frame-accurate, no drift.
- One idea per viewport. Each scroll "beat" makes a single point, then hands off.
- Restraint as luxury: neutral backgrounds, enormous negative space, short declarative sentences.
- Light as the material's proof: their aluminum reads as aluminum because reflections behave.

**What NOT to copy.**
- The voice. Apple's superlative register ("unbelievably pro") is the exact register our design
  guide bans. Our copy is plainer and warmer — a person, not a keynote.
- The coldness. Apple floats products in void-white or void-black; our machine lives in a warm,
  physical room (the `interior.jpg` direction).
- Their scale of production (custom image sequences per breakpoint, thousands of frames). Our
  architecture is real-time 3D on a static site — the technique differs even where the grammar rhymes.

## 3. Framework — frame.work

**What makes it exceptional.** A laptop company whose entire brand is the teardown. Exploded views,
labeled modules, repair guides as marketing. They made openness — screws, connectors, part numbers —
feel aspirational. The closest brand-spirit match to this project: engineering honesty as the
selling point.

**What to learn.**
- The exploded view as an argument: showing the inside *is* the trust pitch.
- Real component names, plainly labeled. Naming the RAM "memory" and the SSD "storage" respects the
  reader; inventing marketing names for parts insults them.
- Diagram-grade clarity: their exploded renders are readable at a glance — separation distances and
  angles chosen for comprehension, not drama.

**What NOT to copy.**
- The e-commerce frame (specs, configurators, prices). We sell nothing on this page but a feeling.
- The utilitarian visual temperature. Framework's renders are catalog-neutral; ours are cinematic —
  studio light, considered composition, a story arc.

## 4. iFixit — teardown culture

**What makes it exceptional.** Two decades of opening devices on camera built the entire mental
model our visitors have of a "teardown": lid off first, then shields, then board — an order, a
ritual, a verdict. Their photography (top-down, evenly lit, parts laid out in ranks) is the visual
language of device internals.

**What to learn.**
- Teardown *order* carries meaning. Following a plausible disassembly sequence (lid → thermal
  module/components → board → chassis) keeps the animation honest — hardware people will notice,
  and everyone else will feel it.
- The laid-out-parts tableau as a destination: the final exploded state should read like the
  satisfying "everything on the mat" photo at the end of a good teardown.
- Honesty about what things are. iFixit never pretends a heat pipe is magic.

**What NOT to copy.**
- The workbench documentary aesthetic (hands, tools, guide steps). No hands, no screwdrivers —
  our machine takes *itself* apart; the magic is that there is no technician.
- Information density. iFixit serves repairers; we serve a story. One label per component, not spec
  tables.

## 5. Awwwards — Site of the Day standards

**What makes it exceptional.** As a reference, Awwwards is the calibration instrument: the running
record of what "world-class web experience" means this year. SOTD winners share traits — a strong
single concept, cohesive art direction, motion with intent, technical fluency without jank, and
detail work at every breakpoint.

**What to learn.**
- The judging lens: design, usability, creativity, content — a page must score on all four, so
  craft (usability, performance, accessibility) is scored, not just spectacle.
- First-impression economy: winners establish their concept within the first viewport and the
  first scroll.
- Finish depth: hover states, loading states, reduced-motion states — juries look where lazy
  builders don't.

**What NOT to copy.**
- The current meta. Awwwards has house clichés — huge marquee text, noise overlays, cursor
  followers, Lenis-smooth everything, WebGL distortion on every image. Adopting this year's tics
  guarantees looking dated next year and generic now. Our design guide already bans most of them.
- Award-bait complexity: interactions added to impress juries at the cost of confusing a
  small-business owner. When the two audiences conflict, the owner wins (vision §6).

---

## Internal references (the project's own history — read these too)

- **`Animations/laptop-teardown/`** — the predecessor. Learn: static-first progressive enhancement,
  scroll-window (`seg(p, start, end)`) timeline discipline, the no-CDN principle, and its README's
  honest post-mortem of sliced-frame assets. Do not copy: the 2.5D layer technique itself — its
  ceiling is the reason this project exists.
- **`index.html` + `docs/design-guide.md`** — the live design system: two-font rule, palette
  discipline (no pure black/white), reveal-not-spectacle motion, the banned-word list, and the
  owner's recorded rejections of AI-looking patterns. `/engineering` is a page of this site.
- **`images/Laptop/`** — the subject reference: thin silver ultrabook (closed), four-layer exploded
  view (lid / thermal-and-components / mainboard / chassis), warm beige studio interior. Reference
  only (Decision D-005).
