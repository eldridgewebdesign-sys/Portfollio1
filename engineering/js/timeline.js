// timeline.js — the master timeline, the ScrollTrigger, the progress smoother,
// text tweens, and the component-label system (05 §7, §8.5–§8.6).
//
// Everything here is data-first: the storyboard tables at the top ARE the
// timeline; scene state is a pure function of the smoothed playhead.

import * as THREE from 'three';
import { W } from './camera-rig.js';

const g = () => window.gsap;

/* ---------------- Storyboard data (05 §7.1/§7.3) ---------------- */

export const BEATS = { B0: 0, B1: 0, B2: 0.105, B3: 0.160, B4: 0.343, B5: 0.569, B6: 0.648, B7: 0.865, B8: 0.928 };

// Camera moves: exactly five on the whole page. [from, to, start, end]
const CAMERA_MOVES = [
  ['P0', 'P1', 0.000, 0.050],
  ['P1', 'P2', 0.160, 0.205],
  ['P2', 'P3', 0.343, 0.388],
  ['P3', 'P4', 0.648, 0.693],
  ['P4', 'P5', 0.865, 0.928],
];

// Teardown part travel: node · Δ (in W) · window. Pure +Y from captured rest.
// DEVIATION from 05 §7.3, documented in the build report: the lid takes a
// second rise (+0.50W → +1.08W, its final tableau rank) during late B3 while
// the camera holds at P2 — at +0.50W it sits square in P3's +48° sightline
// and occludes the storage/memory/support-board beats it is not part of
// (verified by ray check and screenshot; hiding the discussed component is
// banned by the vision). Single-mover rule holds: nothing else moves in that
// window. The lid's B7 glide is dropped — it is already at rank.
const PART_MOVES = [
  ['lid', 0.50, 0.105, 0.145],
  ['cooling_fan', 0.28, 0.205, 0.275],
  ['heat_pipes', 0.28, 0.205, 0.275],
  ['storage_ssd', 0.28, 0.388, 0.433],
  ['memory_ram', 0.28, 0.400, 0.445],
  ['support_board_io', 0.28, 0.569, 0.609],
  ['support_board_wireless', 0.28, 0.581, 0.621],
  ['support_board_aux', 0.28, 0.593, 0.633],
  ['mainboard', 0.14, 0.693, 0.743],
];

// The lid's second rise (see the deviation note above): from +0.50W to +1.08W.
const LID_CLEAR = [0.50, 1.08, 0.283, 0.343];

// B7 glide to final ranks (from teardown height → final rank, staggered 0.007).
// The lid is absent: it reached +1.08W during LID_CLEAR (deviation note above).
const TABLEAU_MOVES = [
  ['mainboard', 0.14, 0.36, 0.865, 0.910],
  ['cooling_fan', 0.28, 0.72, 0.872, 0.916],
  ['heat_pipes', 0.28, 0.72, 0.872, 0.916],
  ['storage_ssd', 0.28, 0.72, 0.872, 0.916],
  ['memory_ram', 0.28, 0.72, 0.872, 0.916],
  ['support_board_io', 0.28, 0.72, 0.872, 0.916],
  ['support_board_wireless', 0.28, 0.72, 0.872, 0.916],
  ['support_board_aux', 0.28, 0.72, 0.872, 0.916],
];

// Copy cards: in-ramp start / out-ramp start (ramps are 0.015 wide).
const COPY = [
  ['B1', 0.040, 0.105],
  ['B2', 0.124, 0.189],
  ['B3', 0.238, 0.308],
  ['B4', 0.421, 0.491],
  ['B5', 0.612, 0.677],
  ['B6', 0.717, 0.862],
];
// Windows during which any copy card is at opacity > 0 (for the quiet zone).
const CARD_WINDOWS = COPY.map(c => [c[1], c[2] + 0.015]);

// Component labels (05 §7.5): side is the fixed ±X assignment; next = the next
// label's in-point (drives the active→settled demotion); re = B8 stagger slot.
export const LABEL_DEFS = [
  { key: 'lid', text: 'Lid', anchor: 'lid', move: 'lid', side: 1, inAt: 0.124, next: 0.238, re: 0 },
  { key: 'fan', text: 'Cooling fan', anchor: 'cooling_fan', move: 'cooling_fan', side: -1, inAt: 0.238, next: 0.250, re: 1 },
  { key: 'pipes', text: 'Heat pipes', anchor: 'heat_pipes', move: 'heat_pipes', side: 1, inAt: 0.250, next: 0.409, re: 2 },
  { key: 'storage', text: 'Storage (SSD)', anchor: 'storage_ssd', move: 'storage_ssd', side: -1, inAt: 0.409, next: 0.421, re: 3 },
  { key: 'memory', text: 'Memory (RAM)', anchor: 'memory_ram', move: 'memory_ram', side: 1, inAt: 0.421, next: 0.612, re: 4 },
  { key: 'support', text: 'Support boards', anchor: 'support_boards', move: 'support_board_io', side: -1, inAt: 0.612, next: 0.717, re: 5 },
  { key: 'mainboard', text: 'Mainboard', anchor: 'mainboard', move: 'mainboard', side: 1, inAt: 0.717, next: 0.797, re: 6 },
  { key: 'chassis', text: 'Chassis', anchor: 'chassis', move: 'chassis', side: -1, inAt: 0.797, next: null, re: 7 },
  { key: 'battery', text: 'Battery', anchor: 'chassis_battery', move: 'chassis', side: 1, inAt: 0.797, next: null, re: 7.5 },
];
const LABELS_OUT = 0.862; // group exit 0.862–0.877

/* ---------------- Eases (05 §7.2, registered once) ---------------- */

let EASE = null;
function registerEases() {
  if (EASE) return EASE;
  const CE = window.CustomEase;
  g().registerPlugin(window.ScrollTrigger, CE);
  EASE = {
    CAM: CE.create('CAM', '0.45,0.00,0.25,1.00'),
    LIFT: CE.create('LIFT', '0.30,0.00,0.12,1.00'),
    TXT_IN: CE.create('TXT-IN', '0.16,1.00,0.30,1.00'),
  };
  return EASE;
}

/* ---------------- Master timeline ---------------- */

function buildMaster({ rig, parts, els, labelProxies }) {
  const E = registerEases();
  const m = g().timeline({ paused: true, defaults: { ease: 'none' } });
  for (const k in BEATS) m.addLabel(k, BEATS[k]);

  const ir = { immediateRender: false };

  // Camera: five CAM-eased moves between fitted poses.
  for (const [from, to, a, b] of CAMERA_MOVES) {
    const P = rig.poses;
    m.fromTo(rig,
      { px: P[from].px, py: P[from].py, pz: P[from].pz, tx: P[from].tx, ty: P[from].ty, tz: P[from].tz },
      { px: P[to].px, py: P[to].py, pz: P[to].pz, tx: P[to].tx, ty: P[to].ty, tz: P[to].tz,
        duration: b - a, ease: E.CAM, ...ir }, a);
  }

  // Parts: LIFT-eased pure vertical travel, rest + Δ·W.
  for (const [name, dW, a, b] of PART_MOVES) {
    const node = parts[name];
    const rest = node.userData.rest.y;
    m.fromTo(node.position, { y: rest }, { y: rest + dW * W, duration: b - a, ease: E.LIFT, ...ir }, a);
  }
  {
    const [fromW, toW, a, b] = LID_CLEAR;
    const lid = parts.lid;
    const rest = lid.userData.rest.y;
    m.fromTo(lid.position, { y: rest + fromW * W }, { y: rest + toW * W, duration: b - a, ease: E.LIFT, ...ir }, a);
  }
  for (const [name, fromW, toW, a, b] of TABLEAU_MOVES) {
    const node = parts[name];
    const rest = node.userData.rest.y;
    m.fromTo(node.position, { y: rest + fromW * W }, { y: rest + toW * W, duration: b - a, ease: E.LIFT, ...ir }, a);
  }

  // copy.B0 exit — the one moving exit: 30px rise (LIFT) + linear fade over 0.040.
  m.fromTo(els.opening, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.040, ease: 'none', ...ir }, 0);
  m.fromTo(els.opening, { y: 0 }, { y: -30, duration: 0.040, ease: E.LIFT, ...ir }, 0);

  // Cards: enter opacity 0→1 + 16px rise over 0.015 (TXT-IN); exit opacity-only, linear.
  for (const [key, inAt, outAt] of COPY) {
    const el = els.cards[key];
    m.fromTo(el, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.015, ease: E.TXT_IN, ...ir }, inAt);
    m.fromTo(el, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.015, ease: 'none', ...ir }, outAt);
  }

  // Ending block: opacity-only tweens (the sanctioned autoAlpha exception —
  // these stay in the accessibility tree at every p).
  m.fromTo(els.scrim, { opacity: 0 }, { opacity: 1, duration: 0.013, ease: E.TXT_IN, ...ir }, 0.973);
  m.fromTo(els.closing, { opacity: 0 }, { opacity: 1, duration: 0.013, ease: E.TXT_IN, ...ir }, 0.973);
  m.fromTo(els.cta, { opacity: 0 }, { opacity: 1, duration: 0.010, ease: E.TXT_IN, ...ir }, 0.988);
  m.fromTo(els.signoff, { opacity: 0 }, { opacity: 1, duration: 0.008, ease: E.TXT_IN, ...ir }, 0.992);

  // Labels: named on arrival; group exit 0.862–0.877; B8 re-entry staggered.
  for (const def of LABEL_DEFS) {
    const pr = labelProxies[def.key];
    m.fromTo(pr, { a: 0 }, { a: 1, duration: 0.015, ease: E.TXT_IN, ...ir }, def.inAt);
    m.fromTo(pr, { a: 1 }, { a: 0, duration: 0.015, ease: 'none', ...ir }, LABELS_OUT);
    const slot = Math.floor(def.re);
    const reStart = 0.930 + 0.003 * slot;
    m.fromTo(pr, { a: 0 }, { a: 1, duration: 0.006, ease: E.TXT_IN, ...ir }, reStart);
  }

  return m;
}

/* ---------------- The progress smoother (05 §8.5, transcribed) ---------------- */

export function createScrub(holder) {
  return {
    raw: 0, smooth: 0, TAU: 0.070, CLAMP: 0.030,
    pending() { return Math.abs(this.raw - this.smooth) > 0.0005; },
    step(dt) {
      this.smooth += (this.raw - this.smooth) * (1 - Math.exp(-dt / this.TAU));
      this.smooth = Math.max(this.raw - this.CLAMP, Math.min(this.raw + this.CLAMP, this.smooth));
      // Snap on drain: the rest state is exactly f(raw), so a stop is
      // pixel-identical from either scrub direction (QA-7 determinism).
      if (Math.abs(this.raw - this.smooth) <= 0.0005) this.smooth = this.raw;
      holder.master.progress(this.smooth);
    },
  };
}

/* ---------------- Label placement engine (05 §7.5) ---------------- */

function createLabels({ container, camera, scene, parts, compMobileRef }) {
  const tmp = new THREE.Vector3();
  const box = new THREE.Box3();
  const items = [];
  const proxies = {};

  for (const def of LABEL_DEFS) {
    const root = document.createElement('div');
    root.className = 'label';
    const dot = document.createElement('span'); dot.className = 'dot';
    const leader = document.createElement('span'); leader.className = 'leader';
    const chip = document.createElement('span'); chip.className = 'chip';
    chip.textContent = def.text;
    root.append(dot, leader, chip);
    container.appendChild(root);
    proxies[def.key] = { a: 0 };
    items.push({ def, root, dot, leader, chip, proxy: proxies[def.key],
      ax: 0, ay: 0, az: 0, move: null, restY: 0, w: 0, h: 0, lastA: -1, lastSett: -1 });
  }

  // Bind-time anchors: bbox face midpoint on the assigned ±X side, at rest
  // (parts only translate, so live anchor = stored point + node Δy).
  function bind() {
    for (const it of items) {
      const anchorNode = scene.getObjectByName(it.def.anchor);
      box.setFromObject(anchorNode);
      it.ax = it.def.side > 0 ? box.max.x : box.min.x;
      it.ay = (box.min.y + box.max.y) / 2;
      it.az = (box.min.z + box.max.z) / 2;
      it.move = parts[it.def.move];
      it.restY = it.move.userData.rest.y;
    }
  }

  function measure() {
    for (const it of items) { it.w = 0; it.h = 0; }
  }

  const placed = []; // reused rect list: [x1,y1,x2,y2] per placed chip
  const order = items.map((_, i) => i);

  function cardsVisible(p) {
    for (const w of CARD_WINDOWS) if (p >= w[0] && p <= w[1]) return true;
    return false;
  }

  function update(p, vw, vh) {
    // Projection must match THIS frame's camera pose: rig.apply() has just
    // moved the camera, but matrixWorldInverse is otherwise refreshed only by
    // the render that happens after this call. Without this, the settle frame
    // after a skip-link/anchor jump places every chip with the pre-jump camera.
    camera.updateMatrixWorld();
    placed.length = 0;
    const quiet = cardsVisible(p);
    const tableau = p >= BEATS.B8;
    const mobileTableau = tableau && compMobileRef();

    // Priority: active label first, then settled newest-entry-first.
    order.sort((a, b) => (items[b].def.inAt - items[a].def.inAt) || (b - a));

    for (const idx of order) {
      const it = items[idx];
      const a = it.proxy.a;
      if (a <= 0.001) {
        if (it.lastA !== 0) { it.root.style.opacity = '0'; it.lastA = 0; }
        continue;
      }
      if (!it.w) { it.w = it.chip.offsetWidth || 80; it.h = it.chip.offsetHeight || 26; }

      // Active → settled demotion: a pure function of p (05 §7.6).
      let sett = 0;
      if (!tableau && it.def.next !== null && p < LABELS_OUT) {
        sett = Math.min(1, Math.max(0, (p - it.def.next) / 0.015));
      }
      if (sett !== it.lastSett) {
        it.root.style.setProperty('--sett', sett.toFixed(3));
        it.lastSett = sett;
      }

      // Project the anchor (stored rest point + the node's live Δy).
      tmp.set(it.ax, it.ay + (it.move.position.y - it.restY), it.az).project(camera);
      const sx = (tmp.x * 0.5 + 0.5) * vw;
      const sy = (-tmp.y * 0.5 + 0.5) * vh - (1 - a) * 6; // 6px entry rise

      let side = it.def.side;
      if (mobileTableau) side = (Math.floor(it.def.re * 2) % 2 === 0) ? -1 : 1;

      // The deterministic slot ladder: horizontal 36→64, 45° up, 45° down.
      const lens = [36, 50, 64];
      const slots = [];
      if (!mobileTableau) for (const L of lens) slots.push([sx + side * L, sy, L, 0]);
      for (const L of lens) slots.push([sx + side * L * 0.7071, sy - L * 0.7071, L, side > 0 ? -45 : -135]);
      for (const L of lens) slots.push([sx + side * L * 0.7071, sy + L * 0.7071, L, side > 0 ? 45 : 135]);

      let pick = null;
      for (const s of slots) {
        const left = side > 0 ? s[0] : s[0] - it.w;
        const top = s[1] - it.h / 2;
        if (left < 24 || left + it.w > vw - 24 || top < 24 || top + it.h > vh - 24) continue;
        if (quiet && left < 0.34 * vw) continue;
        let hit = false;
        for (let r = 0; r < placed.length; r += 4) {
          if (left - 4 < placed[r + 2] && left + it.w + 4 > placed[r] &&
              top - 4 < placed[r + 3] && top + it.h + 4 > placed[r + 1]) { hit = true; break; }
        }
        if (!hit) { pick = s; break; }
      }
      if (!pick) {
        // Deterministic fallback (45° up, 64px), clamped into the safe area
        // horizontally so a chip never clips the viewport edge.
        pick = slots[mobileTableau ? 2 : 5].slice();
        pick[0] = Math.min(Math.max(pick[0], 24 + (side < 0 ? it.w : 0)), vw - 24 - (side > 0 ? it.w : 0));
      }

      const [cx, cy, len, angDeg] = pick;
      placed.push(side > 0 ? cx : cx - it.w, cy - it.h / 2, side > 0 ? cx + it.w : cx, cy + it.h / 2);

      it.root.style.opacity = a.toFixed(3);
      it.lastA = a;
      it.dot.style.transform = 'translate(' + sx + 'px,' + sy + 'px) translate(-50%,-50%)';
      const ang = angDeg === 0 ? (side > 0 ? 0 : 180) : angDeg;
      it.leader.style.width = len + 'px';
      it.leader.style.transform = 'translate(' + sx + 'px,' + sy + 'px) rotate(' + ang + 'deg)';
      it.chip.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(' + (side > 0 ? '0' : '-100%') + ',-50%)';
    }
  }

  return { bind, update, measure, proxies, container };
}

/* ---------------- Public init ---------------- */

export function initTimeline(ctx) {
  const E = registerEases();
  const holder = { master: null };
  const scrub = createScrub(holder);

  const els = {
    opening: document.getElementById('opening'),
    cards: {},
    closing: document.querySelector('#ending .closing'),
    cta: document.querySelector('#ending .btn-sand'),
    signoff: document.querySelector('#ending .signoff'),
    scrim: document.querySelector('#ending .scrim'),
  };
  for (const [key] of COPY) els.cards[key] = document.querySelector('[data-copy="' + key + '"]');

  const labels = createLabels({
    container: document.getElementById('labels'),
    camera: ctx.camera, scene: ctx.scene, parts: ctx.parts,
    compMobileRef: ctx.compMobileRef,
  });
  labels.bind();

  holder.master = buildMaster({ rig: ctx.rig, parts: ctx.parts, els, labelProxies: labels.proxies });

  // ScrollTrigger (05 §8.6): no pin, no scrub value — it only reports raw
  // progress; the smoother is the single stage that moves the playhead.
  window.ScrollTrigger.config({ ignoreMobileResize: true });
  const st = window.ScrollTrigger.create({
    trigger: '#scroll-track',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      scrub.raw = self.progress;
      // Jump rule (05 §8.9): programmatic jumps land, they don't travel.
      if (Math.abs(scrub.raw - scrub.smooth) > 0.25) scrub.smooth = scrub.raw;
      ctx.request();
      ctx.onScrollInput?.();
    },
    onRefresh: (self) => { scrub.raw = self.progress; ctx.request(); },
  });

  // p-driven UI state (pure functions of the playhead, applied on change only).
  let ctaOn = null, tableauOn = null;
  function applyUI(p) {
    const cta = p >= 0.992;
    if (cta !== ctaOn) {
      ctaOn = cta;
      els.cta.tabIndex = cta ? 0 : -1;
      els.cta.style.pointerEvents = cta ? 'auto' : 'none';
    }
    const tb = p >= BEATS.B8;
    if (tb !== tableauOn) {
      tableauOn = tb;
      labels.container.classList.toggle('tableau', tb);
    }
  }

  function rebuild() {
    const p = scrub.smooth;
    holder.master.kill();
    labels.measure();
    holder.master = buildMaster({ rig: ctx.rig, parts: ctx.parts, els, labelProxies: labels.proxies });
    holder.master.progress(p);
  }

  return { holder, scrub, st, labels, applyUI, rebuild, els };
}
