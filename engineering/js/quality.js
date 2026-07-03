// quality.js — capability tiers, DPR policy, adaptive governor (05 §8.8).
// Detection runs once at boot; no user-agent parsing.

export function detectTier() {
  const fine = matchMedia('(pointer: fine)').matches;
  const minScreen = Math.min(screen.width, screen.height);
  const cores = navigator.hardwareConcurrency || 2;
  // deviceMemory is Chromium-only; where absent (Safari) the check is skipped.
  const memOk = !('deviceMemory' in navigator) || navigator.deviceMemory >= 4;

  if (fine && minScreen >= 900) {
    return { tier: 'A', dprCap: 2.0, shadowMap: 2048, governorMs: 24 };
  }
  if (!fine && memOk && cores >= 4) {
    return { tier: 'B', dprCap: 1.75, shadowMap: 1024, governorMs: 24 };
  }
  return { tier: 'C', dprCap: 1.5, shadowMap: 1024, governorMs: 28 };
}

// MSAA is decided once at init (a renderer cannot toggle antialias without
// recreation): on below effective DPR 2, off at >= 2.
export function wantsMSAA(q) {
  return Math.min(devicePixelRatio || 1, q.dprCap) < 2;
}

// Rolling 30-frame governor, sampled only while the playhead is moving.
// One degradation step per violation, 2 s cooldown, no automatic re-upgrade.
// Steps: DPR -0.25 (repeatable, floor 1.0) -> shadow map 512 -> shadows off.
export function createGovernor(q, { getDPR, setDPR, setShadowMap, disableShadows }) {
  const N = 30;
  const samples = new Float32Array(N);
  let idx = 0, filled = 0, lastStep = 0, stage = 0, lastTime = 0;

  return {
    sample(now) {
      if (lastTime) {
        samples[idx] = now - lastTime;
        idx = (idx + 1) % N;
        if (filled < N) { filled++; lastTime = now; return; }
        let sum = 0;
        for (let i = 0; i < N; i++) sum += samples[i];
        const avg = sum / N;
        if (avg > q.governorMs && now - lastStep > 2000) {
          lastStep = now;
          const dpr = getDPR();
          if (dpr > 1.0) setDPR(Math.max(1.0, dpr - 0.25));
          else if (stage === 0) { stage = 1; setShadowMap(512); }
          else if (stage === 1) { stage = 2; disableShadows(); }
        }
      }
      lastTime = now;
    },
    idle() { lastTime = 0; filled = 0; },
  };
}
