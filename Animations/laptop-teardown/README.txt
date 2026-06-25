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
This used to be a Three.js + GSAP ScrollTrigger 3D scene (script.js / style.css /
vendor/three.module.js / vendor/gsap*.js / vendor/jsm/). That whole stack was
removed. The new page composites four real production images instead of rendering
a 3D model, so it is dramatically lighter and has no WebGL / ES-module / import-map
requirements (it no longer breaks on the file:// protocol).

FILES
-----
index.html        the entire page — markup, inline CSS, inline scroll script
vendor/fonts/     vendored Cormorant Garamond (600, 500i) + Mulish (400, 500), woff2
README.txt        this file

IMAGE ASSETS  (root-absolute paths; folder casing matters on Vercel's Linux build)
----------------------------------------------------------------------------------
/images/Laptop/interior.png      the empty beige interior — the fixed backdrop
/images/Laptop/closed.png        the closed laptop (transparent PNG)
/images/Laptop/teardown-3.png    three-layer teardown   (transparent PNG)
/images/Laptop/teardown-4.png    four-layer full teardown (transparent PNG)
The three product shots share one 1366x768 frame, so they stay registered as they
cross-fade. The interior backdrop is a separate image and never moves.

HOW THE SCROLL SEQUENCE WORKS
-----------------------------
A tall <main class="scene"> drives the scroll; inside it a sticky <div class="stage">
is pinned for the whole sequence. A small inline script maps scroll progress (0..1)
to the opacity + transform of each frame, with light scrub-smoothing:

  intro wordmark  ->  fades/lifts away
  closed laptop   ->  floats in, then dissolves as it "opens"
  three layers    ->  emerge from a slightly compressed stack and spread
  four layers     ->  components materialise; held on screen at the end
  "Built layer by layer."  ->  closing line over the full teardown

PROGRESSIVE ENHANCEMENT / ACCESSIBILITY
---------------------------------------
The page is built static-first. With no JavaScript, or with
prefers-reduced-motion: reduce, it renders as a calm, vertically-stacked sequence
(each frame captioned) over the same backdrop — no pinning, no motion. An early
inline script adds the `anim` class only when motion is allowed, which switches on
the pinned scroll experience. There is no flash between the two modes.

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
