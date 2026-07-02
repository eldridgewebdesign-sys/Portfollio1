// main.js — entry. Reads the mode gate; only in 3d mode dynamic-imports the
// module graph and runs the 05 §8.10 init order. Static/file modes are already
// the designed document — no JS work is needed for them.

const mode = document.documentElement.dataset.mode;

if (mode === '3d') {
  init().catch(async (err) => {
    console.error('engineering: 3d init failed', err);
    const fb = await import('./fallback.js');
    fb.convertToStatic(window.__engCtx || null, err && err.message);
  });
}

function compMobileNow() {
  return (matchMedia('(pointer: coarse)').matches && matchMedia('(orientation: portrait)').matches)
    || innerWidth < 768;
}
function trackMobileNow() {
  return (matchMedia('(pointer: coarse)').matches && matchMedia('(orientation: portrait)').matches)
    || innerWidth <= 680;
}

async function init() {
  // Every visit starts at beat zero (05 §8.9).
  history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  addEventListener('pageshow', (e) => { if (e.persisted) scrollTo(0, 0); });

  const params = new URLSearchParams(location.search);
  const captureFlag = params.has('capture');
  const debugFlag = params.has('debug');

  // GSAP loads as classic UMD scripts (core, then plugins), 3d mode only —
  // a static-mode visitor never downloads the animation stack (05 §12 P1).
  const script = (src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = res;
    s.onerror = () => rej(new Error('script failed: ' + src));
    document.head.appendChild(s);
  });
  const G = '/engineering/vendor/gsap-3.13.0/';
  await script(G + 'gsap.min.js');
  await Promise.all([script(G + 'CustomEase.min.js'), script(G + 'ScrollTrigger.min.js')]);

  // 2. Quality tier before any GL allocation.
  const { detectTier, wantsMSAA, createGovernor } = await import('./quality.js');
  const q = detectTier();

  // Composition + track classes (05 §9.1).
  const html = document.documentElement;
  html.classList.toggle('comp-mobile', compMobileNow());
  html.classList.toggle('track-mobile', trackMobileNow());

  // 3. Renderer, scene, lights.
  const [THREE, sceneMod] = await Promise.all([import('three'), import('./scene.js')]);
  const canvas = document.getElementById('gl');
  const renderer = sceneMod.createRenderer(canvas, q, wantsMSAA(q), captureFlag);
  renderer.setSize(innerWidth, innerHeight, false);
  const { scene, keyLight } = sceneMod.createScene(q);
  const camera = new THREE.PerspectiveCamera(24, innerWidth / innerHeight, 0.05, 12);

  // 4. Load (byte-weighted hairline on the production path; step-weighted on
  // the stand-in path — see loader.js ASSETS_READY).
  const fill = document.querySelector('#loader .fill');
  const onProgress = (v) => {
    window.gsap.to(fill, { scaleX: v, duration: 0.25, ease: 'power1.out', overwrite: true });
  };
  const { load } = await import('./loader.js');
  const { root, env } = await load({ renderer, scene, onProgress });
  scene.add(root);

  // 5. Bind by name, byte-for-byte; capture rest positions for the eleven
  // animatable parts. A missing name throws → static (05 §8.10 step 5).
  const TOP = ['lid', 'cooling_fan', 'heat_pipes', 'storage_ssd', 'memory_ram',
    'support_boards', 'mainboard', 'chassis'];
  const SUB = ['support_board_io', 'support_board_wireless', 'support_board_aux'];
  const laptopRoot = root.name === 'laptop_root' ? root : root.getObjectByName('laptop_root');
  if (!laptopRoot) throw new Error('node bind failed: laptop_root missing');
  const parts = {};
  for (const n of TOP.concat(SUB)) {
    const node = laptopRoot.getObjectByName(n);
    if (!node) throw new Error('node bind failed: ' + n + ' missing');
    node.userData.rest = node.position.clone();
    parts[n] = node;
  }

  // 6. Camera rig: poses, viewport fit, P0.
  const { createRig } = await import('./camera-rig.js');
  const rig = createRig(camera);
  rig.fit(innerWidth, innerHeight, compMobileNow());
  rig.setPose('P0');

  // Overlay centering translations are owned by GSAP so tween transforms
  // compose (CSS sets only left/top/bottom).
  function applyCompSets() {
    const mob = html.classList.contains('comp-mobile');
    window.gsap.set(['#opening', '.card'],
      mob ? { xPercent: -50, yPercent: 0 } : { xPercent: 0, yPercent: -50 });
  }
  applyCompSets();

  // Render-on-demand loop (05 §8.4) — zero cost while idle. Declared before
  // the timeline init: ScrollTrigger's creation-time refresh calls request().
  let raf = 0, last = performance.now();
  let dprCeil = q.dprCap;
  let dbg = null;
  let T = null;
  let fbMod = null, ctx = null;
  let rmPending = false;
  let cueTimer = 0, cueVisible = false;
  const gov = createGovernor(q, {
    getDPR: () => renderer.getPixelRatio(),
    setDPR: (v) => { dprCeil = v; renderer.setPixelRatio(v); request(); },
    setShadowMap: (v) => {
      keyLight.shadow.mapSize.set(v, v);
      if (keyLight.shadow.map) { keyLight.shadow.map.dispose(); keyLight.shadow.map = null; }
      request();
    },
    disableShadows: () => { keyLight.castShadow = false; request(); },
  });
  function frame(now) {
    raf = 0;
    if (!T) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    T.scrub.step(dt);            // the single smoothing stage; moves the playhead
    rig.apply();
    T.labels.update(T.scrub.smooth, innerWidth, innerHeight);
    T.applyUI(T.scrub.smooth);
    renderer.render(scene, camera);
    gov.sample(now);
    dbg?.tick(now);
    checkRM();
    if (T.scrub.pending()) request(); else gov.idle();
  }
  function request() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  function stopLoop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  // 7. Master timeline + ScrollTrigger.
  let scrolled = false;
  const tlMod = await import('./timeline.js');
  T = tlMod.initTimeline({
    rig, parts, scene, camera,
    request,
    compMobileRef: () => html.classList.contains('comp-mobile'),
    onScrollInput: onFirstScroll,
  });
  window.ScrollTrigger.refresh();

  // 8. 3d-mode ARIA/focus state (05 §10.1).
  document.getElementById('sr-story').hidden = false;
  document.getElementById('opening').setAttribute('aria-hidden', 'true');
  document.querySelectorAll('#scroll-track section[data-beat]')
    .forEach(s => s.setAttribute('aria-hidden', 'true'));
  T.applyUI(0); // CTA starts unfocusable/unclickable below p 0.992

  // Shared context for the fallback path.
  fbMod = await import('./fallback.js');
  ctx = window.__engCtx = {
    scrub: T.scrub, holder: T.holder, st: T.st, renderer, env, request, stopLoop,
  };
  fbMod.armContextLoss(canvas, ctx);

  // Reduced-motion flip → static at the next moment scrollY === 0 (05 §10.1).
  const rmq = matchMedia('(prefers-reduced-motion: reduce)');
  const onRM = (e) => { if (e.matches) { rmPending = true; checkRM(); } };
  rmq.addEventListener ? rmq.addEventListener('change', onRM) : rmq.addListener(onRM);
  function checkRM() {
    if (rmPending && scrollY === 0 && fbMod && ctx) {
      rmPending = false;
      fbMod.convertToStatic(ctx, 'reduced motion requested');
    }
  }

  // Resize: debounced 150 ms; iOS URL-bar deltas ignored (05 §8.7).
  let rw = innerWidth, rh = innerHeight, rt = 0;
  function onResize() {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const w = innerWidth, h = innerHeight;
      if (w === rw && Math.abs(h - rh) <= 120) return;
      rw = w; rh = h;
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, dprCeil));
      html.classList.toggle('comp-mobile', compMobileNow());
      html.classList.toggle('track-mobile', trackMobileNow());
      applyCompSets();
      rig.fit(w, h, compMobileNow());
      T.rebuild();
      window.ScrollTrigger.refresh();
      request();
    }, 150);
  }
  addEventListener('resize', onResize);
  addEventListener('orientationchange', onResize);

  // Scroll cue (05 §7.7): clock-based idle trigger, dismissed forever by the
  // first scroll input.
  const cue = document.getElementById('cue');
  function armCue() {
    const delay = html.classList.contains('comp-mobile') ? 1800 : 2400;
    cueTimer = setTimeout(() => {
      if (!scrolled && T.scrub.raw < 0.005) {
        cueVisible = true;
        window.gsap.to(cue, { opacity: 1, duration: 0.3, ease: 'power1.out' });
      }
    }, delay);
  }
  function onFirstScroll() {
    if (scrolled) return;
    scrolled = true;
    clearTimeout(cueTimer);
    if (cueVisible) { cueVisible = false; window.gsap.to(cue, { opacity: 0, duration: 0.3, ease: 'power1.out' }); }
  }

  // Warm-up frame synced to the live scroll position, then the loader handoff
  // (150 / 400 / 600 ms — the sanctioned clock exemptions, 05 §7.7).
  T.scrub.smooth = T.scrub.raw;
  T.holder.master.progress(T.scrub.smooth);
  rig.apply();
  T.labels.update(T.scrub.smooth, innerWidth, innerHeight);
  renderer.render(scene, camera);

  const loaderEl = document.getElementById('loader');
  const handoff = window.gsap.timeline();
  handoff
    .to(fill, { scaleX: 1, duration: 0.15, ease: 'power1.out', overwrite: true })
    .to(['#loader .wordmark', '#loader .hairline', '#loader .microtext'],
      { opacity: 0, duration: 0.4, ease: 'power1.out' }, '+=0.15')
    .to(loaderEl, {
      opacity: 0, duration: 0.6, ease: 'none',
      onComplete: () => { loaderEl.remove(); armCue(); },
    });

  // Debug overlay / capture harness — lazy, inert without the flags.
  if (debugFlag || captureFlag) {
    const dbgMod = await import('./debug.js');
    dbg = dbgMod.initDebug({
      renderer, scene, camera, rig, T, q, parts,
      captureFlag, debugFlag, request,
      refit: (w, h) => { rig.fit(w, h, false); T.rebuild(); },
      restore: () => {
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, dprCeil));
        renderer.setSize(innerWidth, innerHeight, false);
        rig.fit(innerWidth, innerHeight, compMobileNow());
        T.rebuild();
        request();
      },
    });
  }
}
