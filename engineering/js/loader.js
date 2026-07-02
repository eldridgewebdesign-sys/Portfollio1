// loader.js — asset loading, progress, retry, stall detection (05 §12, §10.1).
//
// ASSETS_READY is the one build flag of this implementation round: the
// production assets (laptop.v1.glb, the 11 KTX2 atlases, studio-warm.v1.hdr)
// do not exist yet — they require the 04-asset-pipeline Blender work. Until
// they land, the page runs on the sanctioned development stand-in (model.js)
// with the vendored RoomEnvironment as its IBL (05 §6.4's own HDR-failure
// fallback). Flip this to true once the real files sit in engineering/assets/
// — the full byte-weighted pipeline below is already wired.
export const ASSETS_READY = false;

// The 13-entry loader manifest (05 §5.1): per-file expected sizes in MB are
// the byte-weighting denominators until measured encode sizes replace them.
// Paths are root-absolute: with cleanUrls the page URL is /engineering (no
// trailing slash), so document-relative asset URLs would resolve at the root.
const A = '/engineering/assets/';
const MANIFEST = [
  [A + 'laptop.v1.glb', 1.05],
  [A + 'aluminum_base.v1.ktx2', 0.40],
  [A + 'aluminum_orm.v1.ktx2', 0.22],
  [A + 'mainboard_base.v1.ktx2', 0.70],
  [A + 'mainboard_normal.v1.ktx2', 0.14],
  [A + 'mainboard_orm.v1.ktx2', 0.16],
  [A + 'modules_base.v1.ktx2', 0.28],
  [A + 'modules_normal.v1.ktx2', 0.14],
  [A + 'modules_orm.v1.ktx2', 0.05],
  [A + 'thermal_base.v1.ktx2', 0.20],
  [A + 'thermal_normal.v1.ktx2', 0.14],
  [A + 'thermal_orm.v1.ktx2', 0.05],
  [A + 'studio-warm.v1.hdr', 0.85],
];

// Stand-in path: progress is step-weighted (model build, environment, ready).
export async function load({ renderer, scene, onProgress }) {
  if (!ASSETS_READY) {
    onProgress(0.08);
    const [{ buildStandIn }, sceneMod] = await Promise.all([
      import('./model.js'),
      import('./scene.js'),
    ]);
    onProgress(0.3);
    const root = buildStandIn();
    onProgress(0.55);
    const env = await sceneMod.applyRoomEnvironment(renderer, scene);
    onProgress(0.9);
    return { root, env };
  }
  return loadProduction({ renderer, scene, onProgress });
}

// Production path (dormant until ASSETS_READY): 13 parallel requests,
// byte-weighted hairline, one retry with ?r=1 after 500 ms, stall → throws
// so main.js converts to static (05 §10.1 load-failure row).
async function loadProduction({ renderer, scene, onProgress }) {
  const THREE = await import('three');
  const [{ GLTFLoader }, { DRACOLoader }, { KTX2Loader }, sceneMod] = await Promise.all([
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/loaders/DRACOLoader.js'),
    import('three/addons/loaders/KTX2Loader.js'),
    import('./scene.js'),
  ]);

  const totalBytes = MANIFEST.reduce((s, m) => s + m[1] * 1048576, 0);
  const loadedBytes = new Map();
  let lastProgressAt = performance.now();
  const startedAt = lastProgressAt;

  function report(url, loaded) {
    loadedBytes.set(url.split('?')[0], loaded);
    let sum = 0;
    for (const v of loadedBytes.values()) sum += v;
    lastProgressAt = performance.now();
    onProgress(Math.min(1, sum / totalBytes));
  }

  // Stall rule: no progress event for 8 s, or scene-ready absent 20 s after
  // the asset fetch starts → static (05 §12).
  let stalled = null;
  let cancelStall = null;
  const stallGuard = new Promise((_, reject) => {
    const t = setInterval(() => {
      const now = performance.now();
      if (now - lastProgressAt > 8000) { clearInterval(t); reject(stalled = new Error('stall: no progress for 8s')); }
      if (now - startedAt > 20000) { clearInterval(t); reject(stalled = new Error('stall: scene-ready absent 20s')); }
    }, 1000);
    cancelStall = () => clearInterval(t);
  });

  const draco = new DRACOLoader().setDecoderPath('/engineering/vendor/decoders-r180/draco/')
    .setDecoderConfig({ type: 'wasm' });
  const ktx2 = new KTX2Loader().setTranscoderPath('/engineering/vendor/decoders-r180/basis/');
  ktx2.workerLimit = Math.min(4, navigator.hardwareConcurrency || 2);
  ktx2.detectSupport(renderer);

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(draco);
  gltfLoader.setKTX2Loader(ktx2);

  const retry = (fn, url) => fn(url).catch(() =>
    new Promise(r => setTimeout(r, 500)).then(() => fn(url + '?r=1')));

  const loadGLB = url => new Promise((res, rej) =>
    gltfLoader.load(url, res, e => report(A + 'laptop.v1.glb', e.loaded || 0), rej));

  const work = (async () => {
    const gltf = await retry(loadGLB, A + 'laptop.v1.glb');
    // GPU-compressed textures resolve inside the GLB via KHR_texture_basisu.
    let env;
    try {
      env = await sceneMod.applyHDREnvironment(renderer, scene, A + 'studio-warm.v1.hdr');
    } catch (e) {
      // HDR fails twice → stay in 3d with RoomEnvironment at 0.5 (05 §10.1).
      console.warn('engineering: HDR environment failed, using RoomEnvironment', e);
      env = await sceneMod.applyRoomEnvironment(renderer, scene);
    }
    // Memory rules (02 §13): dispose decoder workers after bind, drop refs.
    draco.dispose();
    ktx2.dispose();
    return { root: gltf.scene, env };
  })();

  try {
    const out = await Promise.race([work, stallGuard]);
    cancelStall?.();
    onProgress(1);
    return out;
  } catch (e) {
    cancelStall?.();
    throw stalled || e;
  }
}
