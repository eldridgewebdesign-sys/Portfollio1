WebSharke — Laptop Teardown (scroll-driven product study)
=========================================================

A premium, scroll-driven showcase: a large "WEBSHARKE / ENGINEERING" wordmark
gives way to a thin silver laptop that takes itself apart, layer by layer, over a
quiet beige interior. Featured in the site's "Styles" section (the laptop teardown
card -> /Animations/laptop-teardown).

This is part of the WebSharke site and is served BY the site. It is a single,
self-contained page (inline CSS + inline JS) with NO external CDN requests and NO
JavaScript dependencies — nothing can be blocked by ad-blockers, proxies, or
tracking prevention.

WHAT REPLACED THE OLD DEMO
--------------------------
1) It used to be a Three.js + GSAP ScrollTrigger 3D scene (script.js / style.css /
   vendor/three.module.js / vendor/gsap*.js / vendor/jsm/). That whole stack was
   removed — no WebGL / ES-module / import-map, no dependencies.
2) The first rebuild cross-faded between full teardown frames, which read like a
   slideshow. This version does NOT cross-fade. It animates FOUR separate, registered
   layer images so the laptop physically comes apart under scroll.

LAYER ASSETS — HOW THEY WERE MADE (important)
---------------------------------------------
No separated per-layer art was ever provided — images/Laptop only had full composite
frames. So layer-{lid,components,board,chassis}.png were SLICED from teardown-4.png:
each is a full 1366x768 transparent frame containing only one horizontal band (the
gaps between layers were found by analysing the PNG's alpha). Because every slice
keeps the original frame's coordinates, stacking all four reconstructs teardown-4.png
exactly — and translating each one apart is a true physical separation.
For a PERFECT teardown you'd want natively-rendered, fully-separated transparent
layers (clean edges, no shared shadows, the populated vs. bare board as distinct art).

FILES
-----
index.html        the entire page — markup, inline CSS, inline scroll script
vendor/fonts/     vendored Cormorant Garamond (600, 500i) + Mulish (400, 500), woff2
README.txt        this file

IMAGE ASSETS  (root-absolute paths; folder casing matters on Vercel's Linux build)
----------------------------------------------------------------------------------
/images/Laptop/interior.jpg          fixed beige interior backdrop (never moves)
/images/Laptop/layer-lid.png         top shell      (animated layer, z4)
/images/Laptop/layer-components.png  fan/chips/RAM  (animated layer, z3)
/images/Laptop/layer-board.png       mainboard      (animated layer, z2)
/images/Laptop/layer-chassis.png     base chassis   (animated layer, z1)
/images/Laptop/closed.png            closed laptop  (static fallback only)
/images/Laptop/teardown-4.png        full teardown  (static fallback + slice source)
/images/Laptop/teardown-3.png        currently unused (kept for reference)

HOW THE SCROLL SEQUENCE WORKS
-----------------------------
A tall <main class="scene"> drives the scroll; an inner sticky <div class="stage">
is pinned for the whole sequence. The four layer images are absolutely stacked in
one centred .product box. A small inline script maps scroll progress p (0..1) to each
LAYER'S translateY (GPU transforms only; opacity is used once, to reveal the product):

  0.00-0.15  intro wordmark holds, then lifts + fades away
  0.15-0.30  product revealed; layers collapsed into a closed-laptop slab (lid on top)
  0.30-0.56  lid translates up + chassis translates down -> the laptop OPENS, the
             populated board shows in the middle (components still seated on it)
  0.56-0.84  components lift OFF the board (revealing the bare board) -> four layers
  0.82-1.00  a slight final spread, then the exploded view is held

Layer z-order (chassis<board<components<lid) means the lid covers everything when
collapsed (= a closed laptop) and reveals each layer as it moves — no opacity tricks.

PROGRESSIVE ENHANCEMENT / ACCESSIBILITY
---------------------------------------
Built static-first. With no JavaScript, or prefers-reduced-motion: reduce, the layer
animation is off and the page shows two plain frames (closed.png + teardown-4.png)
over the same backdrop. An early inline script adds the `anim` class only when motion
is allowed; there is no flash between modes.

LOCAL PREVIEW
-------------
Serve the site from the PROJECT ROOT and open /Animations/laptop-teardown :
    vercel dev            (the project's normal dev command; also runs /api)
    -- or any static server from the project root, e.g.  npx serve

TUNING
------
All timing lives in the render() function in index.html: each phase is a
seg(p, start, end) window over scroll progress p. Adjust those numbers to retime
the sequence; adjust .scene { height } to change the overall scroll length.
