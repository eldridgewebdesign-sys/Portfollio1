// =====================================================================
// space-bg.js — shared deep-space background animation.
// Ported verbatim from the portfolio site so the client portal renders
// the identical nebula/star field + Three.js Earth globe.
//
// Requires, in this order, BEFORE this file:
//   1. Three.js r134 (for the Earth globe)
//   2. The DOM elements #stars-canvas, #earth-wrap, #earth-canvas
//      (place this script at the end of <body>).
// =====================================================================

// ── STARS + NEBULA ─────────────────────────────────────────────────────────
(function(){
  const c=document.getElementById('stars-canvas');
  if(!c) return;
  const ctx=c.getContext('2d');

  // Spectral palette — real astronomical color temperatures
  const palette=[
    [120,170,255],  // O class  — hot blue giants
    [160,200,255],  // B class  — blue-white
    [210,225,255],  // A class  — white
    [255,248,220],  // F class  — warm white
    [255,238,150],  // G class  — yellow (sun-like)
    [255,200,80],   // K class  — orange
    [255,145,55],   // K/M class — deep orange
    [255,90,70],    // M class  — red giants
    [230,160,255],  // hot subdwarf — lavender
    [140,200,255],  // B class  — ice blue
    [255,220,100],  // variable — amber
    [180,255,220],  // rare cyan — peculiar A stars
  ];

  let W,H,stars=[],nebulaCanvas=null,mx=-9999,my=-9999;
  window.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;},{passive:true});

  function buildNebula(){
    const off=document.createElement('canvas');
    off.width=W;off.height=H;
    const o=off.getContext('2d');

    // Deep space base — not pure black, hints of midnight blue
    o.fillStyle='#030610';
    o.fillRect(0,0,W,H);

    const clouds=[
      // [cx%,cy%,radius%,  r,  g,  b,  peak-a, mid-a]
      [0.12, 0.20, 0.55,  90, 20,175, 0.26, 0.12],  // violet — top-left
      [0.88, 0.38, 0.42, 220, 65, 15, 0.22, 0.10],  // orange-red — right
      [0.50, 0.92, 0.48,  10,155,170, 0.18, 0.09],  // teal — bottom
      [0.22, 0.78, 0.38, 190, 18,120, 0.16, 0.08],  // magenta — bottom-left
      [0.78, 0.14, 0.34, 200,140, 15, 0.14, 0.07],  // gold — top-right
      [0.60, 0.55, 0.30,  40, 80,200, 0.12, 0.06],  // deep blue — center-right
      [0.38, 0.42, 0.25, 255, 60,100, 0.10, 0.05],  // rose — center
    ];
    clouds.forEach(([cx,cy,rad,r,g,b,pa,ma])=>{
      const gx=cx*W,gy=cy*H,gr=rad*Math.max(W,H);
      const grd=o.createRadialGradient(gx,gy,0,gx,gy,gr);
      grd.addColorStop(0,  `rgba(${r},${g},${b},${pa})`);
      grd.addColorStop(0.4,`rgba(${r},${g},${b},${ma})`);
      grd.addColorStop(1,  `rgba(${r},${g},${b},0)`);
      o.fillStyle=grd;o.fillRect(0,0,W,H);
    });

    // Subtle star-cluster dense areas — bright micro-patches
    [[0.35,0.22,120,200,220,255],[0.68,0.60,90,255,210,130],[0.15,0.65,80,255,140,180]].forEach(([cx,cy,r2,r,g,b])=>{
      const grd=o.createRadialGradient(cx*W,cy*H,0,cx*W,cy*H,r2);
      grd.addColorStop(0,`rgba(${r},${g},${b},0.12)`);
      grd.addColorStop(1,`rgba(${r},${g},${b},0)`);
      o.fillStyle=grd;o.fillRect(0,0,W,H);
    });

    nebulaCanvas=off;
  }

  function resize(){
    W=c.width=window.innerWidth;H=c.height=window.innerHeight;
    buildNebula();
    stars=Array.from({length:280},()=>{
      const col=palette[Math.floor(Math.random()*palette.length)];
      const big=Math.random()<.07;
      const ox=Math.random()*W,oy=Math.random()*H;
      return{x:ox,y:oy,ox,oy,vx:0,vy:0,
        r:big?Math.random()*1.3+1:Math.random()*0.85+0.2,
        a:Math.random()*.75+.2,da:(Math.random()-.5)*(big?.003:.008),col,big};
    });
  }

  function draw(){
    if(nebulaCanvas)ctx.drawImage(nebulaCanvas,0,0);
    stars.forEach(s=>{
      s.a+=s.da;
      if(s.a<=.12||s.a>=.95)s.da*=-1;
      const dx=s.x-mx,dy=s.y-my,dist=Math.sqrt(dx*dx+dy*dy),rad=260;
      if(dist<rad&&dist>0){const f=(rad-dist)/rad*2.5;s.vx+=(dx/dist)*f;s.vy+=(dy/dist)*f;}
      s.vx+=(s.ox-s.x)*.06;s.vy+=(s.oy-s.y)*.06;
      s.vx*=.82;s.vy*=.82;
      s.x+=s.vx;s.y+=s.vy;
      const[r,g,b]=s.col;
      if(s.big){
        // multi-layer glow — inner hot, outer colored
        const g1=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*5);
        g1.addColorStop(0,  `rgba(255,255,255,${s.a*.9})`);
        g1.addColorStop(0.2,`rgba(${r},${g},${b},${s.a*.5})`);
        g1.addColorStop(1,  `rgba(${r},${g},${b},0)`);
        ctx.beginPath();ctx.arc(s.x,s.y,s.r*5,0,Math.PI*2);
        ctx.fillStyle=g1;ctx.fill();
      }
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${r},${g},${b},${s.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();draw();
  window.addEventListener('resize',()=>{resize()},{passive:true});
})();

// ── THREE.JS EARTH ─────────────────────────────────────────────────────────
(function(){
  const canvas=document.getElementById('earth-canvas');
  if(!canvas || typeof THREE==='undefined') return;
  const SZ=380;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(SZ,SZ);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.2;

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(50,1,.1,100);
  camera.position.z=2.5;

  const loader=new THREE.TextureLoader();
  function maybeRender(){ renderer.render(scene,camera); }   // re-render as each texture arrives

  const earth=new THREE.Mesh(
    new THREE.SphereGeometry(1,128,128),
    new THREE.MeshPhongMaterial({
      map:        loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',maybeRender),
      specularMap:loader.load('https://unpkg.com/three-globe/example/img/earth-water.png',maybeRender),
      bumpMap:    loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png',maybeRender),
      bumpScale:  0.06,
      specular:   new THREE.Color(0x66aadd),
      shininess:  55
    })
  );
  scene.add(earth);

  const clouds=new THREE.Mesh(
    new THREE.SphereGeometry(1.013,128,128),
    new THREE.MeshPhongMaterial({
      map:loader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png',maybeRender),
      transparent:true,opacity:.28,depthWrite:false
    })
  );
  scene.add(clouds);

  // Inner atmosphere — thin blue shell visible at the limb
  const atm=new THREE.Mesh(
    new THREE.SphereGeometry(1.06,64,64),
    new THREE.MeshPhongMaterial({
      color:0x2277ff,transparent:true,opacity:.10,
      side:THREE.FrontSide,depthWrite:false
    })
  );
  scene.add(atm);

  // Outer halo — wide, very faint atmospheric scatter
  const halo=new THREE.Mesh(
    new THREE.SphereGeometry(1.18,64,64),
    new THREE.MeshPhongMaterial({
      color:0x0055cc,transparent:true,opacity:.03,
      side:THREE.FrontSide,depthWrite:false
    })
  );
  scene.add(halo);

  // Sun — warm, strong, single source
  const sun=new THREE.DirectionalLight(0xfff4e0,2.2);
  sun.position.set(6,2,4);
  scene.add(sun);

  // Faint blue fill from opposite side — simulates earthshine/space scatter
  const fill=new THREE.DirectionalLight(0x1a3a7a,.15);
  fill.position.set(-5,-1,-3);
  scene.add(fill);

  // Cold rim backlight — highlights the atmosphere at the terminator
  const rim=new THREE.DirectionalLight(0x4488cc,.35);
  rim.position.set(-3,4,-5);
  scene.add(rim);

  // Very dark ambient — the dark side should be nearly black
  scene.add(new THREE.AmbientLight(0x0a0f1a,.25));

  // Earth is completely still: render once (and again as textures load via
  // maybeRender) — no rotation, no animation loop, no scroll/parallax drift.
  renderer.render(scene,camera);

  // Position: matches the portfolio's placeEarth() - a fixed, upper-left anchor
  // that drifts upward slower than the page (EARTH_PAR 0.05).
  const wrap=document.getElementById('earth-wrap');
  const EARTH_PAR=0.05;
  function place(){
    const vw=window.innerWidth,vh=window.innerHeight,mobile=vw<700;
    const baseX=mobile?-170:-110;
    const baseY=(mobile?0.14:0.30)*vh;
    const drift=(window.scrollY||window.pageYOffset||0)*EARTH_PAR;
    wrap.style.transform=`translate(${baseX}px,${baseY-drift}px)`;
  }
  place();
  window.addEventListener('scroll',place,{passive:true});
  window.addEventListener('resize',()=>{ place(); renderer.render(scene,camera); },{passive:true});
})();
