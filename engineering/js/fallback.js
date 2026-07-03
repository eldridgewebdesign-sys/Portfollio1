// fallback.js — mid-session 3d → static conversion (05 §10.4) and the WebGL
// context-loss swap (05 §10.1). The static article is the designed track —
// no error UI, no apology.

// Beat-range → article-section map (05 §10.4 step 4).
const SECTION_MAP = [
  [0.105, '[data-beat="B0"]'],
  [0.160, '[data-beat="B2"]'],
  [0.343, '[data-beat="B3"]'],
  [0.569, '[data-beat="B4"]'],
  [0.648, '[data-beat="B5"]'],
  [0.865, '[data-beat="B6"]'],
  [Infinity, '#ending'],
];

export function convertToStatic(ctx, reason) {
  if (document.documentElement.dataset.mode !== '3d') return;
  if (reason) console.warn('engineering: converting to static —', reason);

  // 1. Record p.
  let p = 0;
  if (ctx?.scrub) p = ctx.scrub.raw;
  else {
    const track = document.getElementById('scroll-track');
    const travel = Math.max(1, (track?.offsetHeight || innerHeight) - innerHeight);
    p = Math.min(1, Math.max(0, scrollY / travel));
  }

  // 2. Kill the ScrollTrigger and the rAF loop; collapse to static.
  try { ctx?.st?.kill(); } catch (e) { /* already dead */ }
  try { ctx?.stopLoop?.(); } catch (e) { /* already dead */ }
  try { ctx?.holder?.master?.kill(); } catch (e) { /* already dead */ }
  document.documentElement.dataset.mode = 'static';
  document.documentElement.classList.remove('comp-mobile', 'track-mobile');

  // Clear every inline style the timeline wrote.
  const gs = window.gsap;
  if (gs) {
    gs.set(['#opening', '.card', '#ending .closing', '#ending .btn-sand',
      '#ending .signoff', '#ending .scrim'], { clearProps: 'all' });
  }
  const labels = document.getElementById('labels');
  if (labels) labels.textContent = '';
  document.getElementById('loader')?.remove();
  try { ctx?.renderer?.dispose(); } catch (e) { /* GPU already gone */ }

  // 3. Restore the no-JS ARIA/focus state.
  const sr = document.getElementById('sr-story');
  if (sr) sr.hidden = true;
  document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
    if (el.id !== 'stage' && el.id !== 'cue' && !el.classList.contains('scrim')) {
      el.removeAttribute('aria-hidden');
    }
  });
  const cta = document.querySelector('#ending .btn-sand');
  if (cta) { cta.removeAttribute('tabindex'); cta.style.pointerEvents = ''; }

  // 4. Instant-scroll to the section whose beat range contains p.
  for (const [limit, sel] of SECTION_MAP) {
    if (p < limit) {
      const sec = document.querySelector(sel);
      if (sec) scrollTo({ top: sec.offsetTop, behavior: 'instant' });
      break;
    }
  }
}

// WebGL context loss: preventDefault + stop the loop; restore rebuilds the
// PMREM environment and re-renders the current playhead. If restoration has
// not fired within 4000 ms → static, in place.
export function armContextLoss(canvas, ctx) {
  let timer = 0;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    ctx.stopLoop();
    timer = setTimeout(() => convertToStatic(ctx, 'webgl context not restored within 4s'), 4000);
  });
  canvas.addEventListener('webglcontextrestored', () => {
    clearTimeout(timer);
    try {
      ctx.env?.rebuild();
      ctx.request();
    } catch (err) {
      convertToStatic(ctx, 'webgl rebuild failed: ' + err.message);
    }
  });
}
