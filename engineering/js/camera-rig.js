// camera-rig.js — camera proxy, CAM_POSES, pose application, viewport fit (05 §6.7).
//
// One camera, vFOV 24° fixed (30° only on portrait aspect < 0.75, applied at
// init/accepted resize — never scroll-driven). No roll, no FOV animation: the
// rig proxy deliberately has no fov field.

export const W = 0.304; // the subject unit: laptop width in metres

const DEG = Math.PI / 180;

// Widest silhouette across the film: envelope 304 × 212 mm seen at the pose
// azimuths (24°–38°) — `W·cos(az) + 0.212·sin(az)`, maximal at 38°.
const SUBJECT_W = 0.370;
// The nearest pose distance (P1/P4). The portrait pull-in is solved here once
// and applied to every pose as one factor.
const D_NEAR = 2.90 * W;
// Portrait target: the silhouette fills 76% of the frame at the nearest pose —
// the ≥10% side margins of 05 §9.2 with a little slack for the label chips.
// A portrait viewport that is NOT the mobile composition (a very narrow desktop
// window) still carries the 62vw lateral shift, so there the subject may only
// fill what is left before the same 10% margin.
const PORTRAIT_FILL = 0.76;
const MARGIN = 0.10;

// Named positions (05 §6.7): spherical about the scene origin. Azimuth 0° faces
// the laptop's front edge (+Z); positive swings toward +X (screen-right side).
// ty = target height in W; shift = subject-center offset (0.12 → 62vw, 0 → 50vw).
const POSE_DATA = {
  // P0/P1 elevation lowered 22° → 16° (closed-laptop slimming pass): the
  // lower product angle compresses the projected footprint and reads the
  // closed machine as a thin machined slab. Both poses move together so B1
  // stays a pure dolly; P2–P5 are untouched.
  P0: { az: 24, el: 16, d: 4.15, ty: 0.02, shift: 0.12 },
  P1: { az: 24, el: 16, d: 2.90, ty: 0.02, shift: 0.12 },
  P2: { az: 38, el: 9,  d: 2.95, ty: 0.10, shift: 0.12 },
  P3: { az: 30, el: 48, d: 2.95, ty: 0.14, shift: 0.12 },
  P4: { az: 24, el: 24, d: 2.90, ty: 0.11, shift: 0.12 },
  // P5 pulled back for the five-rank tableau (lower shell 0 → logic +0.34W →
  // thermal/ports +0.68W → top case +1.02W → display +1.36W): at 3.65W the
  // 1.38W stack top clears the frame with ≈12% vertical margin.
  P5: { az: 24, el: 26, d: 3.65, ty: 0.70, shift: 0 },
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
    // Landscape: the reference frame box (16:9 at vFOV 24°) must stay visible.
    // Portrait (< 0.75): the vFOV widens to 30° and the fit is solved on the
    // subject instead of that box, so the machine keeps its size on a phone
    // (see the pull-in below) with the ≥10% side margins. Azimuth/elevation/
    // targets are never touched — offsets are screen-space look-at shifts.
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

      // Portrait pull-in: fitting the whole 16:9 reference box into a phone's
      // narrow frame pushed every pose ~3.4× back and the machine read as a
      // distant thumbnail. Portrait instead fits the *subject* — the silhouette
      // sits inside the frame with the §9.2 side margins — solved once at the
      // nearest pose so all six poses scale by the same factor and B1 stays a
      // true dolly. Landscape keeps the 16:9 box fit unchanged.
      const maxShift = Math.max(...Object.keys(POSE_DATA).map(k => POSE_DATA[k].shift));
      const fill = compMobile ? PORTRAIT_FILL : 2 * (0.5 - maxShift - MARGIN);
      const pull = portrait
        ? Math.max(1, (SUBJECT_W / (2 * fill * tanH)) / D_NEAR)
        : 1;

      for (const k in POSE_DATA) {
        const d0 = POSE_DATA[k];
        const dRef = d0.d * W;
        const halfHRef = dRef * Math.tan(12 * DEG);
        const halfWRef = halfHRef * (16 / 9);
        const dEff = portrait
          ? Math.max(dRef * pull, halfHRef / tanV)
          : Math.max(dRef, halfWRef / tanH, halfHRef / tanV);

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
        // the look-at moves screen-left so the subject reads at 62vw. The
        // mobile composition (05 §9.2) centers the machine at 50vw instead —
        // its copy sits in the bottom block, not beside the machine — so the
        // shift is dropped there. `upper` still marks P0–P4 (the poses that
        // take the mobile 40vh vertical offset) whichever way it goes.
        const upper = d0.shift > 0;
        const shift = compMobile ? 0 : d0.shift;
        const offLat = shift * (2 * dEff * tanH);
        let tx = 0 - rx * offLat;
        let tz = 0 - rz * offLat;
        let tyOut = ty;

        // Vertical framing offset (05 §14.3(p)): mobile upper stage centers
        // the subject at 40vh; the look-at drops below the subject center.
        if (compMobile && upper) {
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
