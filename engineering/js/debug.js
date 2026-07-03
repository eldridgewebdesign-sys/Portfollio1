// debug.js — ?debug=1 stats overlay and the ?capture=1 still-production
// harness (05 §8.1, §5.1 rows 14–33). Ships but is inert without the flags;
// lazy-imported by main.js only when a flag is present. Never runs for
// ordinary visitors.

import * as THREE from 'three';
import { BEATS, LABEL_DEFS } from './timeline.js';

export function initDebug(ctx) {
  const { renderer, scene, camera, rig, T, q } = ctx;
  let overlay = null, lastDraw = 0;

  if (ctx.debugFlag) {
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:2000;' +
      'font:11px/1.5 monospace;color:#f2e8da;background:rgba(43,35,32,.85);' +
      'padding:8px 10px;border-radius:3px;pointer-events:none;white-space:pre';
    document.body.appendChild(overlay);

    if (new URLSearchParams(location.search).has('probe')) {
      // 18% gray probe sphere for grading the key-to-fill ratio (05 §6.3).
      const probe = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 32, 16),
        new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0, roughness: 1 })
      );
      probe.position.set(0.25, 0.15, 0.1);
      probe.castShadow = true;
      scene.add(probe);
    }
  }

  let frames = 0, fpsWindowStart = performance.now(), fps = 0, lastFrameMs = 0, lastTick = 0;

  function nearestBeat(p) {
    let best = 'B0', bestD = Infinity;
    for (const k in BEATS) {
      const d = Math.abs(BEATS[k] - p);
      if (d < bestD) { bestD = d; best = k; }
    }
    return best;
  }

  const api = {
    tick(now) {
      if (!overlay) return;
      frames++;
      if (lastTick) lastFrameMs = now - lastTick;
      lastTick = now;
      if (now - fpsWindowStart > 1000) {
        fps = Math.round(frames * 1000 / (now - fpsWindowStart));
        frames = 0; fpsWindowStart = now;
      }
      if (now - lastDraw < 250) return;
      lastDraw = now;
      const i = renderer.info;
      const p = T.scrub.smooth;
      overlay.textContent =
        'fps ' + fps + '  frame ' + lastFrameMs.toFixed(1) + 'ms\n' +
        'calls ' + i.render.calls + '  tris ' + i.render.triangles + '\n' +
        'tex ' + i.memory.textures + '  geo ' + i.memory.geometries +
        '  prog ' + (i.programs ? i.programs.length : 0) + '\n' +
        'tier ' + q.tier + '  dpr ' + renderer.getPixelRatio().toFixed(2) + '\n' +
        'p ' + p.toFixed(4) + '  ~' + nearestBeat(p);
    },
  };

  if (ctx.captureFlag) {
    const box = new THREE.Box3();
    const v = new THREE.Vector3();

    function seek(p) {
      T.scrub.raw = p; T.scrub.smooth = p;
      T.holder.master.progress(p);
      rig.apply();
      renderer.render(scene, camera);
    }

    // Projected label-anchor percentages for the caption-anchors sidecar
    // (05 §3.4): x/y as percentages of the frame from the top-left.
    function anchors(keys) {
      const out = [];
      for (const def of LABEL_DEFS) {
        if (keys && !keys.includes(def.key)) continue;
        const node = scene.getObjectByName(def.anchor);
        if (!node) continue;
        box.setFromObject(node);
        v.set(
          def.side > 0 ? box.max.x : box.min.x,
          (box.min.y + box.max.y) / 2,
          (box.min.z + box.max.z) / 2
        ).project(camera);
        out.push({
          caption: def.text,
          x: +((v.x * 0.5 + 0.5) * 100).toFixed(1),
          y: +((-v.y * 0.5 + 0.5) * 100).toFixed(1),
        });
      }
      return out;
    }

    async function still(p, width, height, name, type, quality) {
      renderer.setPixelRatio(1);
      renderer.setSize(width, height, false);
      ctx.refit(width, height);
      seek(p);
      const blob = await new Promise(res =>
        renderer.domElement.toBlob(res, type || 'image/webp', quality ?? 0.78));
      if (!blob || (type && blob.type !== type)) return { ok: false, reason: 'encode unsupported' };
      const r = await fetch('/__save?name=' + encodeURIComponent(name), { method: 'POST', body: blob });
      return { ok: r.ok, size: blob.size, type: blob.type, anchors: anchors() };
    }

    window.__eng = { seek, still, anchors, restore: ctx.restore, BEATS };
  }

  return api;
}
