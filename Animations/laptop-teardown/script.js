/* ============================================================================
   PREMIUM LAPTOP TEARDOWN — scroll-driven 3D exploded view
   Three.js (r160) + GSAP ScrollTrigger
   ----------------------------------------------------------------------------
   The laptop is built from PLACEHOLDER GEOMETRY (procedural Three.js meshes).
   Every part is its own THREE.Group registered in ASSEMBLED{} below, so the
   whole teardown can later be driven by a real GLTF/GLB model without touching
   the animation code — see "SWAPPING IN A REAL MODEL" at the bottom of the file.

   WHERE TO TUNE THINGS  → the CONFIG block immediately below:
     • scroll speed / smoothing ...... CONFIG.scrollLength / CONFIG.scrub
     • spacing between layers ......... CONFIG.spacing
     • camera framing & angle ......... CONFIG.camStart / camEnd / look* / fov
     • rotation & parallax ............ CONFIG.yaw* / parallax / idleFloat
     • colours & materials ............ CONFIG.col  (and buildMaterials())
   ========================================================================== */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* GSAP + ScrollTrigger are loaded as classic scripts (window globals). */
const { gsap } = window;
const ScrollTrigger = window.ScrollTrigger;
if (!gsap || !ScrollTrigger) {
  // Surfaced by the loader's error state (see index.html head script).
  window.__teardownError = 'Animation library failed to load (vendor/gsap.min.js).';
  throw new Error(window.__teardownError);
}
gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------------
   CONFIG — the single place to adjust the whole experience
   -------------------------------------------------------------------------- */
const CONFIG = {
  /* —— Scroll ———————————————————————————————————————————————————————————— */
  scrollLength: 3400,   // px of scroll the pinned teardown spans  (↑ = slower)
  scrub: 0.8,           // ScrollTrigger smoothing in s            (↑ = smoother/laggier)

  /* —— Layout / spacing ——————————————————————————————————————————————————— */
  spacing: 0.52,        // vertical gap between exploded layers     (↑ = more spread)
  centerLayer: 6,       // layer index parked near screen-centre

  /* —— Camera ————————————————————————————————————————————————————————————— */
  fov: 38,
  camStart:  { x: 0, y: 1.5, z: 8.6 },   // framing while assembled (closer / lower)
  camEnd:    { x: 0, y: 3.1, z: 12.8 },  // framing while exploded  (further / higher)
  lookStart: 0.15,      // camera target height, assembled
  lookEnd:   0.50,      // camera target height, exploded (stack is taller)

  /* —— Rotation / parallax ———————————————————————————————————————————————— */
  yawStart: -0.34,      // assembly Y-rotation, assembled
  yawEnd:   -0.60,      // assembly Y-rotation, exploded (reveals layer depth)
  parallax: 0.10,       // mouse parallax strength (0 disables)
  idleFloat: 0.05,      // gentle idle bob amplitude (0 disables)

  /* —— Eases ——————————————————————————————————————————————————————————————— */
  partEase: 'power2.inOut',
  camEase:  'power1.inOut',

  /* —— Colours / materials ———————————————————————————————————————————————————
     Restrained graphite / space-grey palette. No neon. The site aqua is used
     only as a whisper-faint accent. Edit here, or tweak buildMaterials(). */
  col: {
    shell:   0x3b3e44,  // anodised graphite aluminium (lid + bottom)
    deck:    0x303338,  // keyboard top case
    glass:   0x0b0d12,  // screen / trackpad glass
    key:     0x24262b,  // keycaps
    pcb:     0x18342e,  // muted deep-teal logic board (NOT neon green)
    chip:    0x1b1d22,  // chip packages / housings
    metal:   0xb9bfc6,  // brushed metal (heat-spreaders, contacts, ports)
    copper:  0x9c6b43,  // desaturated copper (heat-pipe)
    battery: 0x26282e,  // battery pouch cells
    accent:  0x6fb6c6,  // site aqua — used extremely sparingly
  },
};

/* ----------------------------------------------------------------------------
   STAGE CAPTIONS — drive the on-screen "01 — Display" style index.
   p = scroll progress (0..1) at which each stage becomes active.
   -------------------------------------------------------------------------- */
const STAGES = [
  { p: 0.00, n: '01', t: 'Assembled' },
  { p: 0.10, n: '02', t: 'Display' },
  { p: 0.22, n: '03', t: 'Keyboard deck' },
  { p: 0.34, n: '04', t: 'Logic board' },
  { p: 0.48, n: '05', t: 'Battery' },
  { p: 0.60, n: '06', t: 'Cooling & I/O' },
  { p: 0.80, n: '07', t: 'Exploded view' },
];

/* ----------------------------------------------------------------------------
   Environment flags (responsive + accessibility)
   -------------------------------------------------------------------------- */
const isMobile = window.matchMedia('(max-width: 768px)').matches ||
                 window.matchMedia('(pointer: coarse)').matches;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const useShadows = !isMobile && !prefersReduced;

/* ----------------------------------------------------------------------------
   Module-level handles
   -------------------------------------------------------------------------- */
let renderer, scene, camera;
let rig, assembly;                 // rig = parallax/idle wrapper, assembly = scroll-rotated model
let fanRotor = null;               // continuously spinning fan rotor
let firstFrameDone = false;
const parts = new Map();           // name -> { group, exp:{pos:[x,y,z], rot:[x,y,z]} }
const M = {};                      // shared materials
const clock = new THREE.Clock();
const state = { lookY: CONFIG.lookStart };
const pointer = { x: 0, y: 0 };    // normalised mouse (-1..1)
const damp = { x: 0, y: 0 };       // damped parallax

/* ============================================================================
   1. MATERIALS
   ========================================================================== */
function buildMaterials() {
  const C = CONFIG.col;
  M.shell   = new THREE.MeshStandardMaterial({ color: C.shell,  metalness: 0.92, roughness: 0.42 });
  M.deck    = new THREE.MeshStandardMaterial({ color: C.deck,   metalness: 0.85, roughness: 0.50 });
  M.glass   = new THREE.MeshPhysicalMaterial({ color: C.glass,  metalness: 0.10, roughness: 0.08,
                                               clearcoat: 1.0, clearcoatRoughness: 0.06 });
  M.key     = new THREE.MeshStandardMaterial({ color: C.key,    metalness: 0.30, roughness: 0.62 });
  M.pcb     = new THREE.MeshStandardMaterial({ color: C.pcb,    metalness: 0.40, roughness: 0.55 });
  M.chip    = new THREE.MeshStandardMaterial({ color: C.chip,   metalness: 0.50, roughness: 0.50 });
  M.metal   = new THREE.MeshStandardMaterial({ color: C.metal,  metalness: 1.00, roughness: 0.28 });
  M.copper  = new THREE.MeshStandardMaterial({ color: C.copper, metalness: 1.00, roughness: 0.36 });
  M.battery = new THREE.MeshStandardMaterial({ color: C.battery,metalness: 0.55, roughness: 0.60 });
  M.accent  = new THREE.MeshStandardMaterial({ color: C.accent, metalness: 0.40, roughness: 0.40,
                                               emissive: C.accent, emissiveIntensity: 0.04 });
}

/* Small helper: flag a mesh to cast/receive soft shadows, then return it. */
function shadow(mesh) {
  mesh.castShadow = useShadows;
  mesh.receiveShadow = useShadows;
  return mesh;
}

/* ============================================================================
   2. COMPONENT BUILDERS  (PLACEHOLDER GEOMETRY)
   Each returns a THREE.Group. Replace a builder's body with a GLTF node to
   upgrade that single part — the rest of the system keeps working untouched.
   ========================================================================== */

// —— Lid: outer aluminium back cover ————————————————————————————————————————
function buildBackCover() {
  const g = new THREE.Group();
  g.add(shadow(new THREE.Mesh(new RoundedBoxGeometry(3.10, 0.09, 2.02, 4, 0.08), M.shell)));
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.16, 40), M.metal);
  logo.rotation.x = -Math.PI / 2;
  logo.position.y = 0.051;                 // sit just proud of the surface
  g.add(logo);
  return g;
}

// —— Lid: display panel (bezel + glass) ——————————————————————————————————————
function buildScreen() {
  const g = new THREE.Group();
  g.add(shadow(new THREE.Mesh(new RoundedBoxGeometry(2.96, 0.05, 1.92, 4, 0.05), M.deck)));
  const glass = new THREE.Mesh(new RoundedBoxGeometry(2.74, 0.06, 1.68, 4, 0.03), M.glass);
  glass.position.y = 0.012;
  g.add(glass);
  return g;
}

// —— Keyboard top case (deck) ——————————————————————————————————————————————
function buildKeyboardDeck() {
  const g = new THREE.Group();
  g.add(shadow(new THREE.Mesh(new RoundedBoxGeometry(3.16, 0.10, 2.06, 4, 0.07), M.deck)));
  const well = new THREE.Mesh(new RoundedBoxGeometry(2.52, 0.03, 1.00, 3, 0.03), M.key);
  well.position.set(0, 0.05, -0.42);       // recessed keyboard well
  g.add(well);
  return g;
}

// —— Keycaps (InstancedMesh grid — cheap & swappable) ———————————————————————
function buildKeys() {
  const g = new THREE.Group();
  const cols = isMobile ? 12 : 14, rows = 5;     // fewer keys on mobile
  const areaW = 2.40, areaD = 0.92, z0 = -0.42;
  const kw = (areaW / cols) * 0.82, kd = (areaD / rows) * 0.78;
  const geo = new RoundedBoxGeometry(1, 1, 1, 2, 0.16);     // unit cube, scaled per-instance
  const mesh = new THREE.InstancedMesh(geo, M.key, cols * rows);
  mesh.castShadow = useShadows;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(),
        s = new THREE.Vector3(), p = new THREE.Vector3();
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c - (cols - 1) / 2) * (areaW / cols);
      const z = z0 + (r - (rows - 1) / 2) * (areaD / rows);
      p.set(x, 0, z); s.set(kw, 0.05, kd);
      m.compose(p, q, s);
      mesh.setMatrixAt(i++, m);
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  g.add(mesh);
  return g;
}

// —— Trackpad (glass) ————————————————————————————————————————————————————————
function buildTrackpad() {
  const g = new THREE.Group();
  g.add(shadow(new THREE.Mesh(new RoundedBoxGeometry(1.06, 0.03, 0.72, 4, 0.04), M.glass)));
  return g;
}

// —— Logic board / motherboard ——————————————————————————————————————————————
function buildMotherboard() {
  const g = new THREE.Group();
  g.add(shadow(new THREE.Mesh(new RoundedBoxGeometry(2.70, 0.05, 0.78, 3, 0.03), M.pcb)));
  const box = (w, h, d, x, z, mat) => {
    const mm = shadow(new THREE.Mesh(
      new RoundedBoxGeometry(w, h, d, 2, Math.min(w, d) * 0.12), mat));
    mm.position.set(x, 0.025 + h / 2, z);
    g.add(mm);
  };
  box(0.50, 0.06, 0.50, -0.85, 0.00, M.chip);   // chipset
  box(0.22, 0.10, 0.50,  1.05, 0.00, M.chip);   // RAM bank
  box(0.22, 0.10, 0.50,  0.78, 0.00, M.chip);   // RAM bank
  box(0.60, 0.04, 0.18,  0.10, 0.28, M.metal);  // connector strip
  return g;
}

// —— CPU / GPU heat-spreaders ————————————————————————————————————————————————
function buildChips() {
  const g = new THREE.Group();
  for (const x of [-0.45, 0.45]) {
    const base = shadow(new THREE.Mesh(new RoundedBoxGeometry(0.60, 0.06, 0.60, 3, 0.02), M.chip));
    const lid  = shadow(new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.05, 0.42, 3, 0.02), M.metal));
    base.position.x = x;
    lid.position.set(x, 0.05, 0);
    g.add(base, lid);
  }
  return g;
}

// —— Cooling fan + copper heat-pipe ——————————————————————————————————————————
function buildFan() {
  const g = new THREE.Group();
  g.add(shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.12, 44), M.chip)));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.03, 12, 44), M.shell);
  ring.rotation.x = Math.PI / 2;
  g.add(ring);

  // Rotor (hub + blades) — spun continuously in the render loop.
  const rotor = new THREE.Group();
  rotor.add(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.14, 24), M.metal));
  const N = 13;
  const blades = new THREE.InstancedMesh(new RoundedBoxGeometry(0.40, 0.02, 0.11, 1, 0.01), M.metal, N);
  blades.castShadow = useShadows;
  const m = new THREE.Matrix4();
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    m.identity()
      .multiply(new THREE.Matrix4().makeRotationY(a))
      .multiply(new THREE.Matrix4().makeTranslation(0.27, 0.02, 0))
      .multiply(new THREE.Matrix4().makeRotationZ(0.5));   // blade pitch
    blades.setMatrixAt(i, m);
  }
  blades.instanceMatrix.needsUpdate = true;
  rotor.add(blades);
  g.add(rotor);

  const pipe = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 16), M.copper));
  pipe.rotation.z = Math.PI / 2;
  pipe.position.set(-0.70, 0, 0);
  g.add(pipe);

  g.userData.rotor = rotor;                // picked up during registration
  return g;
}

// —— Battery (pouch cells) ———————————————————————————————————————————————————
function buildBattery() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const cell = shadow(new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.10, 0.82, 3, 0.04), M.battery));
    cell.position.x = (i - 1) * 0.84;
    g.add(cell);
  }
  return g;
}

// —— Speakers (L / R) ————————————————————————————————————————————————————————
function buildSpeakers() {
  const g = new THREE.Group();
  for (const x of [-1.30, 1.30]) {
    const sp = shadow(new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.10, 0.92, 3, 0.04), M.chip));
    sp.position.x = x;
    g.add(sp);
  }
  return g;
}

// —— Ports (USB-C-style connectors) —————————————————————————————————————————
function buildPorts() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const z = (i - 1) * 0.34;
    const shell = shadow(new THREE.Mesh(new RoundedBoxGeometry(0.30, 0.09, 0.16, 2, 0.03), M.metal));
    shell.position.z = z;
    const hole = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.05, 0.10, 2, 0.02), M.glass);
    hole.position.set(0.06, 0, z);
    g.add(shell, hole);
  }
  return g;
}

// —— Bottom shell (+ rubber feet) ————————————————————————————————————————————
function buildBottomShell() {
  const g = new THREE.Group();
  g.add(shadow(new THREE.Mesh(new RoundedBoxGeometry(3.20, 0.12, 2.14, 4, 0.09), M.shell)));
  for (const x of [-1.30, 1.30]) for (const z of [-0.80, 0.80]) {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 16), M.key);
    foot.position.set(x, -0.07, z);
    g.add(foot);
  }
  return g;
}

// —— Screws / small details (InstancedMesh) ——————————————————————————————————
function buildScrews() {
  const g = new THREE.Group();
  const pos = [[-1.45, 0.95], [1.45, 0.95], [-1.45, -0.95], [1.45, -0.95], [0, 0.98], [0, -0.98]];
  const mesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 18), M.metal, pos.length);
  mesh.castShadow = useShadows;
  pos.forEach((p, i) => mesh.setMatrixAt(i, new THREE.Matrix4().makeTranslation(p[0], 0, p[1])));
  mesh.instanceMatrix.needsUpdate = true;
  g.add(mesh);
  return g;
}

/* ============================================================================
   3. PART REGISTRY
   For each part:  build() it, place it at its realistic ASSEMBLED transform,
   and compute its EXPLODED transform (a clean vertical layer from `layer`).
   Order top→bottom in the final exploded view is set purely by `layer`.
   `expPos` / `expRot` optionally override the default centred layer position.
   ========================================================================== */
const ASSEMBLED = {
  // name             build                pos (assembled)        rot (assembled)  layer
  'Back cover':   { build: buildBackCover,   pos: [0, 1.06, -0.97], rot: [-1.62, 0, 0], layer: 11.0 },
  'Screen':       { build: buildScreen,      pos: [0, 1.00, -0.88], rot: [-1.62, 0, 0], layer: 10.0 },
  'Keys':         { build: buildKeys,        pos: [0, 0.315, 0.00], rot: [0, 0, 0],     layer: 8.95 },
  'Keyboard deck':{ build: buildKeyboardDeck,pos: [0, 0.260, 0.00], rot: [0, 0, 0],     layer: 8.60 },
  'Trackpad':     { build: buildTrackpad,    pos: [0, 0.305, 0.66], rot: [0, 0, 0],     layer: 7.70 },
  'Speakers':     { build: buildSpeakers,    pos: [0, 0.130, 0.42], rot: [0, 0, 0],     layer: 6.90 },
  'CPU / GPU':    { build: buildChips,       pos: [0, 0.180, -0.50],rot: [0, 0, 0],     layer: 6.00 },
  'Motherboard':  { build: buildMotherboard, pos: [0, 0.135, -0.50],rot: [0, 0, 0],     layer: 5.40 },
  'Cooling fan':  { build: buildFan,         pos: [0.95, 0.170, -0.50], rot: [0, 0, 0], layer: 4.60 },
  'Battery':      { build: buildBattery,     pos: [0, 0.135, 0.55], rot: [0, 0, 0],     layer: 3.40 },
  'Ports':        { build: buildPorts,       pos: [1.55, 0.150, 0.10],  rot: [0, 0, 0], layer: 2.50 },
  'Bottom shell': { build: buildBottomShell, pos: [0, 0.000, 0.00], rot: [0, 0, 0],     layer: 1.20 },
  'Screws':       { build: buildScrews,      pos: [0, 0.050, 0.00], rot: [0, 0, 0],     layer: 0.70 },
};

function registerParts() {
  for (const name of Object.keys(ASSEMBLED)) {
    const d = ASSEMBLED[name];
    const group = d.build();
    group.name = name;
    group.position.set(d.pos[0], d.pos[1], d.pos[2]);
    group.rotation.set(d.rot[0], d.rot[1], d.rot[2]);
    assembly.add(group);

    // Default exploded transform: re-centred, flat, lifted to its layer height.
    const y = (d.layer - CONFIG.centerLayer) * CONFIG.spacing;
    const exp = {
      pos: [d.expPos?.[0] ?? 0, d.expPos?.[1] ?? y, d.expPos?.[2] ?? 0],
      rot: [d.expRot?.[0] ?? 0, d.expRot?.[1] ?? 0, d.expRot?.[2] ?? 0],
    };
    parts.set(name, { group, exp });

    if (d.build === buildFan) fanRotor = group.userData.rotor;
  }
}

/* ============================================================================
   4. SCENE / RENDERER / LIGHTS
   ========================================================================== */
function initScene(canvas) {
  // Renderer — transparent so the elegant CSS background shows through.
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  if (useShadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(CONFIG.fov, 1, 0.1, 100);
  camera.position.set(CONFIG.camStart.x, CONFIG.camStart.y, CONFIG.camStart.z);

  // rig (parallax + idle) → assembly (scroll rotation) → parts
  rig = new THREE.Group();
  assembly = new THREE.Group();
  assembly.rotation.y = CONFIG.yawStart;
  rig.add(assembly);
  scene.add(rig);

  // —— Lighting: soft studio fill + key + rim ——
  scene.add(new THREE.HemisphereLight(0xbfd3e6, 0x0a0c10, 0.55));   // sky/ground fill
  const key = new THREE.DirectionalLight(0xffffff, 2.2);           // main key light
  key.position.set(5, 9, 6);
  if (useShadows) {
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 8;                  // soften the contact shadow
    key.shadow.bias = -0.0005;
    const c = key.shadow.camera;
    c.near = 1; c.far = 30; c.left = -6; c.right = 6; c.top = 6; c.bottom = -6;
  }
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb8d6, 0.7);           // cool back rim
  rim.position.set(-6, 4, -6);
  scene.add(rim);

  // —— Soft studio reflections (no external HDR needed) ——
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // —— Soft ground shadow catcher (shows only the shadow over the CSS bg) ——
  if (useShadows) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.0;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  buildMaterials();
  registerParts();
  resize();
}

/* ============================================================================
   5. SCROLL TIMELINE  (GSAP + ScrollTrigger, scrubbed → driven by scroll)
   The cascade order below is the teardown narrative:
     display → deck/keys → trackpad → logic board → chips/fan → battery →
     speakers/ports → bottom shell → screws.
   ========================================================================== */
function buildTimeline() {
  const tl = gsap.timeline({
    defaults: { ease: CONFIG.partEase },
    scrollTrigger: {
      trigger: '#teardown',
      start: 'top top',
      end: '+=' + CONFIG.scrollLength,        // ← scroll speed / length
      pin: '#stage',                          // keep the 3D stage centred while scrolling
      scrub: prefersReduced ? 0.2 : CONFIG.scrub,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => updateUI(self.progress),
    },
  });

  // Per-part explode tween: position + rotation, from assembled → exploded.
  const explode = (name, start, dur) => {
    const p = parts.get(name);
    if (!p) return;
    tl.to(p.group.position, { x: p.exp.pos[0], y: p.exp.pos[1], z: p.exp.pos[2], duration: dur }, start);
    tl.to(p.group.rotation, { x: p.exp.rot[0], y: p.exp.rot[1], z: p.exp.rot[2], duration: dur }, start);
  };

  //       name             start  dur     (overlapping → smooth cascade)
  explode('Back cover',     0.00,  0.36);
  explode('Screen',         0.04,  0.34);
  explode('Keyboard deck',  0.12,  0.30);
  explode('Keys',           0.12,  0.30);
  explode('Trackpad',       0.22,  0.28);
  explode('Motherboard',    0.28,  0.30);
  explode('CPU / GPU',      0.36,  0.28);
  explode('Cooling fan',    0.40,  0.28);
  explode('Battery',        0.46,  0.30);
  explode('Speakers',       0.54,  0.26);
  explode('Ports',          0.58,  0.26);
  explode('Bottom shell',   0.62,  0.34);
  explode('Screws',         0.66,  0.34);

  // Camera dolly, look-target lift, and assembly yaw run across the whole scroll.
  tl.to(camera.position, { x: CONFIG.camEnd.x, y: CONFIG.camEnd.y, z: CONFIG.camEnd.z, duration: 1.0, ease: CONFIG.camEase }, 0);
  tl.to(state,           { lookY: CONFIG.lookEnd, duration: 1.0, ease: CONFIG.camEase }, 0);
  tl.to(assembly.rotation,{ y: CONFIG.yawEnd, duration: 1.0, ease: CONFIG.camEase }, 0);
}

/* ============================================================================
   6. RENDER LOOP  (idle float + damped parallax + fan spin + lookAt)
   ========================================================================== */
function tick(timeMs) {
  requestAnimationFrame(tick);
  const dt = clock.getDelta();

  if (!prefersReduced) {
    // Idle vertical bob on the whole rig.
    rig.position.y += (Math.sin(timeMs * 0.0006) * CONFIG.idleFloat - rig.position.y) * 0.05;
    // Damped mouse parallax (desktop only — pointer stays 0 on touch).
    damp.x += (pointer.x * CONFIG.parallax - damp.x) * 0.05;
    damp.y += (pointer.y * CONFIG.parallax * 0.6 - damp.y) * 0.05;
    rig.rotation.y = damp.x;
    rig.rotation.x = damp.y;
    // Spin the cooling fan.
    if (fanRotor) fanRotor.rotation.y += dt * 2.2;
  }

  camera.lookAt(0, state.lookY, 0);
  renderer.render(scene, camera);

  if (!firstFrameDone) {
    firstFrameDone = true;
    window.__teardownReady = true;
    document.getElementById('loader')?.classList.add('done');
  }
}

/* ============================================================================
   7. RESIZE  (renderer + camera follow the pinned stage)
   ========================================================================== */
function resize() {
  const stage = document.getElementById('stage');
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);            // false → CSS controls canvas size
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

/* ============================================================================
   8. BOOT
   ========================================================================== */
function boot() {
  const canvas = document.getElementById('webgl');

  // WebGL capability guard — fail gracefully into the loader's error state.
  try {
    initScene(canvas);
  } catch (err) {
    console.error('[teardown] WebGL init failed:', err);
    document.getElementById('loader')?.classList.add('error');
    return;
  }

  buildTimeline();
  buildIndexUI();
  updateUI(0);

  // Input + lifecycle listeners.
  if (!isMobile && !prefersReduced) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { resize(); ScrollTrigger.refresh(); }, 150);
  }, { passive: true });

  // Refresh ScrollTrigger once fonts settle (layout can shift slightly).
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  requestAnimationFrame(tick);
}

/* ============================================================================
   9. OVERLAY UI  (stage caption, side index, progress bar, scroll hint)
   ========================================================================== */
function buildIndexUI() {
  const wrap = document.getElementById('index');
  if (!wrap) return;
  wrap.textContent = '';                         // build nodes safely (no innerHTML)
  for (const s of STAGES) {
    const li = document.createElement('li');
    li.dataset.t = s.t;
    const num = document.createElement('span');
    num.textContent = s.n;
    li.append(num, document.createTextNode(s.t));
    wrap.appendChild(li);
  }
}

function updateUI(p) {
  // Scroll hint fades the moment scrolling begins.
  const hint = document.getElementById('hint');
  if (hint) hint.style.opacity = p > 0.03 ? '0' : '';

  // Big intro title over the stage fades out as the teardown starts.
  const title = document.getElementById('stage-title');
  if (title) title.style.opacity = String(Math.max(0, 1 - p / 0.12));

  // Active stage → caption + side-index highlight.
  let cur = STAGES[0];
  for (const s of STAGES) if (p >= s.p) cur = s;
  const num = document.getElementById('cap-num');
  const name = document.getElementById('cap-name');
  if (num) num.textContent = cur.n;
  if (name) name.textContent = cur.t;
  document.querySelectorAll('#index li').forEach(el =>
    el.classList.toggle('on', el.dataset.t === cur.t));

  // Thin progress bar.
  const bar = document.getElementById('bar');
  if (bar) bar.style.transform = `scaleX(${p})`;
}

/* —— go ———————————————————————————————————————————————————————————————————— */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

/* ============================================================================
   SWAPPING IN A REAL MODEL  (GLTF / GLB)  — optional upgrade path
   ----------------------------------------------------------------------------
   The animation only needs each part to be a THREE.Group with the same NAME as
   the keys in ASSEMBLED{}. To drive a real model instead of placeholders:

     import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

     new GLTFLoader().load('laptop.glb', (gltf) => {
       // Name your exported nodes to match: 'Screen', 'Battery', 'Cooling fan'…
       for (const name of Object.keys(ASSEMBLED)) {
         const node = gltf.scene.getObjectByName(name);
         // …wrap `node` in a Group, set its assembled pos/rot from ASSEMBLED,
         //    add to `assembly`, and register it in `parts` exactly as
         //    registerParts() does — then call buildTimeline().
       }
     });

   Keep the per-part `layer` values to control the exploded stacking order, and
   delete the matching build*() placeholder once a real node replaces it.
   ========================================================================== */
