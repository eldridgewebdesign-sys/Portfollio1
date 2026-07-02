// camera-rig.js — camera proxy, CAM_POSES, pose application, viewport fit (05 §6.7).
//
// One camera, vFOV 24° fixed (30° only on portrait aspect < 0.75, applied at
// init/accepted resize — never scroll-driven). No roll, no FOV animation: the
// rig proxy deliberately has no fov field.

export const W = 0.304; // the subject unit: laptop width in metres

const DEG = Math.PI / 180;

// Named positions (05 §6.7): spherical about the scene origin. Azimuth 0° faces
// the laptop's front edge (+Z); positive swings toward +X (screen-right side).
// ty = target height in W; shift = subject-center offset (0.12 → 62vw, 0 → 50vw).
const POSE_DATA = {
  P0: { az: 24, el: 22, d: 4.15, ty: 0.02, shift: 0.12 },
  P1: { az: 24, el: 22, d: 2.90, ty: 0.02, shift: 0.12 },
  P2: { az: 38, el: 9,  d: 2.95, ty: 0.10, shift: 0.12 },
  P3: { az: 30, el: 48, d: 2.95, ty: 0.14, shift: 0.12 },
  P4: { az: 24, el: 24, d: 2.90, ty: 0.11, shift: 0.12 },
  P5: { az: 24, el: 26, d: 3.00, ty: 0.55, shift: 0 },
};

export function createRig(camera) {
  const poses = {};
  for (const k in POSE_DATA) poses[k] = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0 };

  const rig = {
    px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0,
    poses,
    apply() {
      camera.position.set(this.px, this.py, this.pz);
      camera.lookAt(this.tx, this.ty, this.tz);
    },
    setPose(name) {
      const p = poses[name];
      this.px = p.px; this.py = p.py; this.pz = p.pz;
      this.tx = p.tx; this.ty = p.ty; this.tz = p.tz;
    },
    // Viewport fit (05 §6.7): per pose, at load and accepted resize only.
    // The reference frame box (16:9 at vFOV 24°) must stay visible; on
    // portrait (< 0.75) the vFOV widens to 30° and the horizontal fit keeps
    // a 10% margin (the mobile ≥10%-margin rule). Azimuth/elevation/targets
    // are never touched — offsets are screen-space look-at shifts.
    fit(width, height, compMobile) {
      const aspect = width / height;
      const portrait = aspect < 0.75;
      const vfov = portrait ? 30 : 24;
      camera.fov = vfov;
      camera.aspect = aspect;
      camera.near = 0.05;
      camera.far = 12;
      camera.updateProjectionMatrix();

      const tanV = Math.tan((vfov / 2) * DEG);
      const tanH = tanV * aspect;
      const marginH = portrait ? 0.9 : 1.0;

      for (const k in POSE_DATA) {
        const d0 = POSE_DATA[k];
        const dRef = d0.d * W;
        const halfHRef = dRef * Math.tan(12 * DEG);
        const halfWRef = halfHRef * (16 / 9);
        const dEff = Math.max(dRef, halfWRef / (marginH * tanH), halfHRef / tanV);

        const az = d0.az * DEG, el = d0.el * DEG;
        const px = dEff * Math.cos(el) * Math.sin(az);
        const py = dEff * Math.sin(el);
        const pz = dEff * Math.cos(el) * Math.cos(az);

        // Base target on the machine's vertical axis.
        const ty = d0.ty * W;

        // Camera-right direction (world up is +Y, no roll): right = f × up.
        const fx = 0 - px, fy = ty - py, fz = 0 - pz;
        let rx = -fz, rz = fx; // (f × up) for up=(0,1,0), projected to XZ
        const rl = Math.hypot(rx, rz) || 1;
        rx /= rl; rz /= rl;

        // Lateral offset: 12vw shift in world units at the live distance —
        // the look-at moves screen-left so the subject reads at 62vw.
        const offLat = d0.shift * (2 * dEff * tanH);
        let tx = 0 - rx * offLat;
        let tz = 0 - rz * offLat;
        let tyOut = ty;

        // Vertical framing offset (05 §14.3(p)): mobile upper stage centers
        // the subject at 40vh; the look-at drops below the subject center.
        if (compMobile && d0.shift > 0) {
          tyOut -= 0.10 * (2 * dEff * tanV);
        }

        const p = poses[k];
        p.px = px; p.py = py; p.pz = pz;
        p.tx = tx; p.ty = tyOut; p.tz = tz;
      }
    },
  };
  return rig;
}
