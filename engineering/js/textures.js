// textures.js — procedural canvas textures for the realism pass.
//
// Everything here is generated ONCE at load and cached in GPU memory; nothing
// recalculates during scroll. All detail is deliberately subtle: machining
// variation, brushed grain, etched trace hints, seated-part occlusion — never
// dirt, damage, or glow. Color maps are near-white multipliers over the
// material's base color; roughness maps multiply the material's roughness
// (green channel), so painted values stay close to 1.

import * as THREE from 'three';

function make(size, draw, srgb) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

// Deterministic PRNG so every visit renders the same machine (no per-session
// randomness — the scrub-determinism rule extends to textures).
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function brushedStrokes(ctx, s, r, count, alpha) {
  for (let i = 0; i < count; i++) {
    const y = r() * s;
    const x = r() * s * 0.6;
    const len = s * (0.2 + r() * 0.8);
    const a = alpha * (0.4 + r() * 0.6);
    ctx.strokeStyle = r() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
}

function aoBlob(ctx, s, u, v, ru, rv, a) {
  const g = ctx.createRadialGradient(u * s, v * s, 0, u * s, v * s, Math.max(ru, rv) * s);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.translate(u * s, v * s);
  ctx.scale(1, rv / ru);
  ctx.translate(-u * s, -v * s);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  ctx.restore();
}

export function createTextures() {
  const T = {};

  // ---- Machined aluminum: color variation, roughness variation, fine bump grain.
  T.brushedMap = make(512, (ctx, s) => {
    const r = rng(11);
    ctx.fillStyle = '#fbfbfb';
    ctx.fillRect(0, 0, s, s);
    brushedStrokes(ctx, s, r, 900, 0.035);
  }, true);
  T.brushedRough = make(512, (ctx, s) => {
    const r = rng(23);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, s, s);
    brushedStrokes(ctx, s, r, 700, 0.10);
  });
  T.brushedBump = make(256, (ctx, s) => {
    const r = rng(37);
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, s, s);
    brushedStrokes(ctx, s, r, 500, 0.25);
  });

  // ---- Top-case deck: brushed base + trackpad inset occlusion ring.
  // (Painted mirrored in v; the wrong-orientation copy hides under the
  // keyboard well, so the texture is safe either way the box UV runs.)
  T.deckMap = make(512, (ctx, s) => {
    const r = rng(41);
    ctx.fillStyle = '#fbfbfb';
    ctx.fillRect(0, 0, s, s);
    brushedStrokes(ctx, s, r, 900, 0.035);
    // Trackpad recess: deck 304×212, pad 130×82 centered (0, +62).
    for (const v of [(62 + 106) / 212, 1 - (62 + 106) / 212]) {
      const w = (134 / 304) * s, h = (86 / 212) * s;
      const x = 0.5 * s - w / 2, y = v * s - h / 2;
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 7;
      ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
    }
  }, true);

  // ---- Lower shell: brushed base + soft interior vignette (corner occlusion).
  T.floorMap = make(512, (ctx, s) => {
    const r = rng(53);
    ctx.fillStyle = '#fbfbfb';
    ctx.fillRect(0, 0, s, s);
    brushedStrokes(ctx, s, r, 700, 0.03);
    const g = ctx.createRadialGradient(s / 2, s / 2, s * 0.28, s / 2, s / 2, s * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.14)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  }, true);

  // ---- Logic board: matte near-black with etched trace hints, via dots,
  // pad fields, and soft occlusion where the packages sit. Zones are painted
  // mirrored in v so the board reads dense either way the top-face UV runs.
  T.pcbMap = make(512, (ctx, s) => {
    const r = rng(67);
    ctx.fillStyle = '#14171a';
    ctx.fillRect(0, 0, s, s);
    // manhattan trace routes — barely lighter than the mask
    ctx.strokeStyle = 'rgba(58,68,78,0.55)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 46; i++) {
      const x = r() * s, y = r() * s;
      const l1 = 20 + r() * 90, l2 = 10 + r() * 60;
      const dir = r() > 0.5 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + l1, y);
      ctx.lineTo(x + l1, y + dir * l2);
      ctx.stroke();
    }
    // via dots
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = r() > 0.85 ? 'rgba(64,56,38,0.5)' : 'rgba(9,11,13,0.7)';
      const d = r() > 0.9 ? 2 : 1;
      ctx.fillRect(r() * s, r() * s, d, d);
    }
    // solder pad fields
    ctx.fillStyle = 'rgba(46,52,60,0.5)';
    for (let i = 0; i < 26; i++) {
      const x = r() * s, y = r() * s;
      for (let k = 0; k < 6; k++) ctx.fillRect(x + k * 4, y, 2, 3);
    }
    // seated-package occlusion (u,v of the known package sites, mirrored)
    const sites = [
      [0.545, 0.533, 0.14, 0.24], // processor package
      [0.62, 0.51, 0.06, 0.10],   // memory pair
      [0.213, 0.53, 0.07, 0.14],  // storage packages
      [0.80, 0.28, 0.10, 0.10],   // PMIC row
      [0.89, 0.55, 0.06, 0.10],   // wireless module
      [0.40, 0.30, 0.08, 0.10],   // VRM field
    ];
    for (const [u, v, ru, rv] of sites) {
      aoBlob(ctx, s, u, v, ru, rv, 0.30);
      aoBlob(ctx, s, u, 1 - v, ru, rv, 0.30);
    }
  }, true);
  T.pcbRough = make(256, (ctx, s) => {
    const r = rng(71);
    ctx.fillStyle = '#f4f4f4';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},0.05)`;
      ctx.fillRect(r() * s, r() * s, 6 + r() * 20, 6 + r() * 20);
    }
  });

  // ---- Battery cells: satin polymer, soft edge occlusion, abstract print.
  T.batteryMap = make(512, (ctx, s) => {
    const r = rng(83);
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, s, s);
    // soft edge darkening — the pouch reads slightly pillowed
    const inset = 0.045 * s;
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    ctx.lineWidth = inset;
    ctx.strokeRect(inset / 2, inset / 2, s - inset, s - inset);
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = inset * 2;
    ctx.strokeRect(inset, inset, s - inset * 2, s - inset * 2);
    // abstract micro-markings (no readable text, no fake specs)
    for (const v of [0.24, 0.76]) {
      const x = 0.16 * s, y = v * s;
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let k = 0; k < 9; k++) ctx.fillRect(x + k * 9, y, 5 + (k % 3), 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 6, y - 7, 96, 16);
    }
    // faint center seam
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, s / 2, s, 1.5);
    brushedStrokes(ctx, s, r, 120, 0.02);
  }, true);
  T.batteryRough = make(256, (ctx, s) => {
    const r = rng(89);
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},0.04)`;
      ctx.beginPath();
      ctx.arc(r() * s, r() * s, 8 + r() * 26, 0, 7);
      ctx.fill();
    }
  });

  // ---- Graphite sheet: dark satin, faint directional flake.
  T.graphiteMap = make(256, (ctx, s) => {
    const r = rng(97);
    ctx.fillStyle = '#f6f6f6';
    ctx.fillRect(0, 0, s, s);
    brushedStrokes(ctx, s, r, 420, 0.05);
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.03 + r() * 0.05})`;
      ctx.fillRect(r() * s, r() * s, 2 + r() * 5, 1);
    }
  }, true);

  // ---- Shield plate: stamped metal — brushed variation + a few faint
  // handling marks (shinier lines, never grime).
  T.shieldRough = make(256, (ctx, s) => {
    const r = rng(103);
    ctx.fillStyle = '#ededed';
    ctx.fillRect(0, 0, s, s);
    brushedStrokes(ctx, s, r, 500, 0.09);
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const x = r() * s, y = r() * s, a = r() * Math.PI;
      const l = 20 + r() * 60;
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    }
  });

  // ---- Glass: near-uniform, with the faintest smudge variation.
  T.glassRough = make(256, (ctx, s) => {
    const r = rng(109);
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},0.035)`;
      ctx.beginPath();
      ctx.arc(r() * s, r() * s, 24 + r() * 60, 0, 7);
      ctx.fill();
    }
  });

  // ---- Speaker chambers: molded ribbing as a bump pattern.
  T.speakerBump = make(256, (ctx, s) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 10) {
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fillRect(x, 0, 2, s);
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.fillRect(x + 4, 0, 2, s);
    }
  });

  return T;
}
