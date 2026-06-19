WebSharke — 3D Laptop Teardown (animation)
==========================================

A scroll-driven 3D teardown: a laptop separates into its internal components as
you scroll. Built with Three.js + GSAP ScrollTrigger. Featured in the site's
"Styles" section (the "3D Laptop Teardown" card → /Animations/laptop-teardown).

This is part of the WebSharke site and is served BY the site. Everything it
needs (Three.js, GSAP, and the fonts) is vendored under vendor/ — there are NO
external CDN requests, so nothing can be blocked by ad-blockers, proxies, or
browser tracking prevention.

FILES
-----
index.html    markup, <base href="/Animations/laptop-teardown/">, import map, overlays
style.css     dark teardown styling
script.js     the 3D scene + scroll-driven teardown (tune the CONFIG block at top)
vendor/       Three.js r160, GSAP 3.12.5, and vendored fonts (offline copies)

HOW IT'S SERVED
---------------
It loads as a normal page on the site at:   /Animations/laptop-teardown
Because it uses ES modules + an import map it must be served over http(s) (the
website does this). It cannot be opened by double-clicking index.html — browsers
block ES modules on the file:// protocol.

LOCAL PREVIEW
-------------
Run the whole site locally from the PROJECT ROOT, then open the path above:
    vercel dev          (the project's normal dev command; also runs /api)
    -- or any static server from the project root, e.g.  npx serve
(The earlier standalone serve.mjs / start-demo.bat were removed — the animation
is now served by the site, so they are no longer needed.)

TUNING  (CONFIG block at the top of script.js)
----------------------------------------------
  scrollLength / scrub ... scroll speed & smoothing
  spacing ................ vertical gap between exploded layers
  cam* / look* / fov ..... camera framing & angle
  yaw* / parallax ........ rotation & mouse parallax
  col{} .................. colours / materials

SWAPPING IN A REAL MODEL
------------------------
See the "SWAPPING IN A REAL MODEL" note at the bottom of script.js — name your
GLTF/GLB nodes to match the keys in ASSEMBLED{} (e.g. 'Screen', 'Battery').
