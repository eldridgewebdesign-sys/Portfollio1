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
3) An interim build reconstructed the CLOSED laptop by collapsing those four slices
   and faded the whole group in — which (a) wasn't the real closed-laptop asset,
   (b) showed the scattered component parts (with per-part shadows) as black/gray
   spots floating around the laptop, and (c) faded the scene in. Fixed: the closed
   state now uses images/Laptop/closed.png directly, it's visible from the top of the
   section (no fade-in), and the teardown layers stay hidden until the teardown
   actually starts.

LAYER ASSETS — HOW THEY WERE MADE (important)
---------------------------------------------
No separated per-layer art was ever provided — images/Laptop only had full composite
frames. So layer-{lid,components,board,chassis}.png were SLICED from teardown-4.png:
each is a full 1366x768 transparent frame containing only one horizontal band (the
gaps between layers were found by analysing the PNG's alpha). Because every slice
keeps the original frame's coordinates, stacking all four reconstructs teardown-4.png
exactly — and translating each one apart is a true physical separation.

The board and chassis bands had NO clean transparent gap between them, so each slice
carried one tiny stray sliver from its neighbour (board: ~92px at its bottom edge,
chassis: ~115px at its top edge). Those two isolated slivers were erased from
layer-board.png / layer-chassis.png so nothing stray can show. Per-part drop-shadows
were also removed from the board + components layers (a 40px-blur shadow on each of
the 13 scattered component parts read as soft black spots); a subtle shadow remains
only on the big silver panels (lid, chassis) and the closed laptop.

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
/images/Laptop/closed.png            closed laptop  (the REAL animated start + fallback)
/images/Laptop/teardown-4.png        full teardown  (static fallback + slice source)
/images/Laptop/teardown-3.png        currently unused (kept for reference)

HOW THE SCROLL SEQUENCE WORKS
-----------------------------
A tall <main class="scene"> drives the scroll; an inner sticky <div class="stage">
is pinned for the whole sequence. closed.png plus the four layer images are absolutely
stacked in one centred .product box. A small inline script maps scroll progress p
(0..1) to each LAYER'S translateY (GPU transforms only); opacity is only used to
dissolve the closed laptop into the teardown and to reveal the components layer:

  0.00-0.12  closed laptop already on screen (clean, centred); wordmark lifts + fades
  0.12-0.30  the closed laptop is held, clean and still
  0.30-0.42  the closed laptop drifts up + back and dissolves as the teardown layers
             appear beneath it (the cover coming off — NOT a scene fade-in)
  0.32-0.58  lid translates up + chassis translates down -> the laptop OPENS
  0.36-0.64  the mainboard settles into the middle
  0.50-0.80  the internal components appear in the opened gap + lift OFF the board
  0.82-1.00  a slight final spread, then the exploded view is held

The four teardown layers start HIDDEN and only appear once the teardown begins, so no
scattered components or seams are ever seen behind / around the closed laptop.
Layer z-order: closed(5) > lid(4) > components(3) > board(2) > chassis(1).

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
