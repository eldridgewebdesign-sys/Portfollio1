// =====================================================================
// planets.js — adds a system of high-quality planets to the space
// background, matching the Earth globe's rendering quality.
//
// Requires Three.js r134 loaded first, and a full-viewport
// <canvas id="planets-canvas"> in the page.
//
// MOTION (single shared system — no body is special):
//   • Every planet spins axially in place AND drifts with scroll parallax —
//     translating slower than the page content (larger planets slower, smaller
//     faster) for a subtle falling-through-space depth effect. No orbit, weave,
//     bob, mouse parallax, or per-body bespoke motion. The portfolio Earth is
//     driven by the identical parallax model (see portfolio.html).
// =====================================================================
(function(){
  const canvas = document.getElementById('planets-canvas');
  if(!canvas || typeof THREE === 'undefined') return;

  // Guard WebGL creation so old devices fail silently (no console errors).
  let renderer;
  try{
    renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  }catch(e){ return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;   // same as Earth
  renderer.toneMappingExposure = 1.1;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 12;

  // ---- Lighting model — same character as the Earth globe ----
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.0);   // warm key light
  sun.position.set(6, 3, 5); scene.add(sun);
  const rim = new THREE.DirectionalLight(0x4488cc, 0.40);  // cold rim/back
  rim.position.set(-6, 2, -5); scene.add(rim);
  scene.add(new THREE.AmbientLight(0x0a0f1a, 0.25));        // very dark ambient

  // ---- Texture loader ----
  const loader = new THREE.TextureLoader();
  function tex(url){
    return loader.load(url, undefined, undefined, ()=>{});
  }

  // High-quality, CORS-enabled planet maps (threex.planets via jsDelivr).
  const BASE = 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/';

  // Each planet hand-placed around the PERIPHERY (the centre reading column
  // is masked out in CSS) at varied sizes + depths (more negative z = farther).
  // `par` = scroll-parallax factor (screen-px drift per scrolled px). Larger
  // planets move slower (smaller par), smaller planets faster — depth cue.
  const defs = [
    // gas giant — large, top-right
    { map:'jupitermap.jpg',  size:2.6, pos:[ 10.5,  5.2, -13], spin:0.0020, shininess:3, atmo:0xcaa97a, atmoOp:0.06, par:0.06 },
    // ice/ocean giant — top-left
    { map:'neptunemap.jpg',  size:1.15,pos:[-10.0,  5.5, -12], spin:0.0022, shininess:22, specular:0x2a4d8f, atmo:0x2b6fff, atmoOp:0.13, par:0.10 },
    // ringed gas giant — bottom-left
    { map:'saturnmap.jpg',   size:1.7, pos:[-10.5, -5.5, -11], spin:0.0024, shininess:4, ring:true, par:0.08 },
    // desert planet — bottom-right
    { map:'venusmap.jpg',    size:1.0, pos:[  9.5, -5.2, -10], spin:0.0011, shininess:8, atmo:0xe0b070, atmoOp:0.14, par:0.11 },
    // rocky/desert — far + small, upper-left
    { map:'marsmap1k.jpg',   bump:'marsbump1k.jpg', size:0.62, pos:[ -5.5, 7.2, -15], spin:0.0016, shininess:6, specular:0x1a1a1a, par:0.13 },
    // rocky — far + small, lower-right
    { map:'mercurymap.jpg',  size:0.5, pos:[  6.5, -7.0, -14], spin:0.0014, shininess:5, specular:0x161616, par:0.14 },
  ];

  // Saturn ring: RingGeometry with radial UVs + alpha pattern (so the
  // Cassini gaps read through), same source set as the planet maps.
  function makeRing(inner, outer){
    const geo = new THREE.RingGeometry(inner, outer, 96, 1);
    const pos = geo.attributes.position, uv = geo.attributes.uv, v = new THREE.Vector3();
    for(let i=0;i<pos.count;i++){
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, (v.length()-inner)/(outer-inner), 0.5); // u = normalized radius
    }
    const mat = new THREE.MeshBasicMaterial({
      map:      tex(BASE+'saturnringcolor.jpg'),
      alphaMap: tex(BASE+'saturnringpattern.gif'),
      side: THREE.DoubleSide, transparent:true, opacity:0.92
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI/2; // lay the disc into the equatorial plane
    return ring;
  }

  const planets = [];
  defs.forEach(d=>{
    const grp = new THREE.Group();
    grp.position.set(d.pos[0], d.pos[1], d.pos[2]);

    const mat = new THREE.MeshPhongMaterial({
      map: tex(BASE+d.map),
      shininess: d.shininess || 6,
      specular: new THREE.Color(d.specular || 0x111111)
    });
    if(d.bump){ mat.bumpMap = tex(BASE+d.bump); mat.bumpScale = 0.03; }

    const body = new THREE.Mesh(new THREE.SphereGeometry(d.size, 48, 48), mat);
    grp.add(body);

    // Thin atmospheric shell (gas/ice/desert planets) — like Earth's limb.
    if(d.atmo){
      const a = new THREE.Mesh(
        new THREE.SphereGeometry(d.size*1.05, 32, 32),
        new THREE.MeshPhongMaterial({ color:d.atmo, transparent:true, opacity:d.atmoOp||0.1, side:THREE.FrontSide, depthWrite:false })
      );
      grp.add(a);
    }

    if(d.ring){
      grp.add(makeRing(d.size*1.4, d.size*2.4));
      grp.rotation.set(-0.5, 0, 0.32); // oblique, ringed-planet tilt
    }

    scene.add(grp);
    planets.push({ grp, body, spin:d.spin||0.002, base:[d.pos[0], d.pos[1], d.pos[2]], size:d.size, ring:!!d.ring, par:d.par||0.1, layoutY:d.pos[1], wpp:0 });
  });

  // ---- Sizing + responsive framing ----
  const TANHALF = Math.tan((45 * Math.PI/180) / 2);   // camera vertical half-FOV
  function layout(){
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    const aspect = w/h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    // On narrow/portrait screens, pull planets inward so they stay framed
    // (the centre mask keeps them clear of text either way).
    const kx = aspect < 1 ? Math.max(0.5, aspect) : 1;
    const ky = aspect < 1 ? 0.92 : 1;
    planets.forEach(p=>{
      p.grp.position.x = p.base[0]*kx;
      p.layoutY = p.base[1]*ky;                        // parallax baseline (Y)
      // world units per on-screen pixel at this planet's depth — lets the
      // parallax drift be expressed in real screen pixels (see loop).
      const dist = camera.position.z - p.base[2];
      p.wpp = (2 * dist * TANHALF) / h;
    });
  }
  window.addEventListener('resize', layout, { passive:true });
  layout();

  // ---- Motion: shared spin + scroll parallax ----
  // Every planet spins axially in place and drifts upward slower than the page
  // as you scroll (larger planets slower) — the one motion system, no body is
  // treated specially.
  camera.lookAt(0, 0, 0);

  let scrollY = window.scrollY || window.pageYOffset || 0;
  window.addEventListener('scroll', ()=>{ scrollY = window.scrollY || window.pageYOffset || 0; }, { passive:true });

  (function loop(){
    requestAnimationFrame(loop);
    for(const p of planets){
      p.body.rotation.y += p.spin;
      p.grp.position.y = p.layoutY + scrollY * p.par * p.wpp;   // parallax drift
    }
    renderer.render(scene, camera);
  })();
})();
