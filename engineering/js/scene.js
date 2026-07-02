// scene.js — scene graph assembly, lights, ground plane, environment (05 §6).
import * as THREE from 'three';

// Renderer configuration transcribed from 05 §6.2.
export function createRenderer(canvas, q, msaa, captureFlag) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: msaa,              // set once at init; never recreated
    alpha: true,                  // the warm room is CSS, not geometry
    powerPreference: 'high-performance',
    stencil: false,
    preserveDrawingBuffer: !!captureFlag, // true only under the capture-only flag
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;   // r180 default — stated so nobody "fixes" it
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // AgX evaluated and rejected (dulls the copper)
  renderer.toneMappingExposure = 1.05;                // the number of record (05 §14.3(c))
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, q.dprCap));
  return renderer;
}

// Lighting rig (05 §6.3): one warm key (the only shadow caster), one wall-colored
// bounce fill, IBL as the ambient term. No AmbientLight, no rim, no cool fill.
export function createScene(q) {
  const scene = new THREE.Scene(); // background stays null — the wall is CSS

  const keyLight = new THREE.DirectionalLight(0xfff3dd, 2.4);
  keyLight.position.set(2.0, 2.05, -1.4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(q.shadowMap, q.shadowMap);
  keyLight.shadow.camera.left = -0.45;
  keyLight.shadow.camera.right = 0.45;
  keyLight.shadow.camera.top = 0.45;
  keyLight.shadow.camera.bottom = -0.45;
  keyLight.shadow.camera.near = 0.05;
  keyLight.shadow.camera.far = 8;
  keyLight.shadow.bias = -0.0003;
  keyLight.shadow.normalBias = 0.02;
  scene.add(keyLight);
  scene.add(keyLight.target); // target defaults to the origin = laptop_root

  const bounceFill = new THREE.DirectionalLight(0xe9ddd1, 0.6);
  bounceFill.position.set(-1.6, 0.9, 1.2);
  scene.add(bounceFill);

  // Ground rig (D-012): 1.2 × 1.2 m ShadowMaterial plane, opacity 0.35, receive-only.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.2),
    new THREE.ShadowMaterial({ opacity: 0.35 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  ground.name = 'ground_shadow';
  scene.add(ground);

  return { scene, keyLight, bounceFill, ground };
}

// Environment / IBL (05 §6.4). The production path loads studio-warm.v1.hdr;
// until that asset exists (see loader.js ASSETS_READY) the sanctioned fallback —
// the vendored RoomEnvironment through PMREM at the same intensity — is used.
// Returns a rebuild() hook for WebGL context restoration.
export async function applyRoomEnvironment(renderer, scene) {
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
  function build() {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envRT = pmrem.fromScene(room, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.5;
    pmrem.dispose();
    return envRT;
  }
  let rt = build();
  return {
    rebuild() { if (rt) rt.dispose(); rt = build(); },
  };
}

export async function applyHDREnvironment(renderer, scene, url) {
  const { RGBELoader } = await import('three/addons/loaders/RGBELoader.js');
  const tex = await new RGBELoader().loadAsync(url);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  let source = tex; // retained for context-loss rebuild (02 §13 memory rule)
  function build() {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromEquirectangular(source);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.5;
    pmrem.dispose();
    return envRT;
  }
  let rt = build();
  return {
    rebuild() { if (rt) rt.dispose(); rt = build(); },
  };
}
