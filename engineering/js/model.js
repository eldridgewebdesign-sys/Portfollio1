// model.js — the development stand-in laptop (02 §14's sanctioned scaffolding).
//
// The production asset is engineering/assets/laptop.v1.glb (Draco + KTX2, built
// per 04/05 §5). That asset does not exist yet, so this module builds a
// procedural stand-in that carries:
//   - the BYTE-EXACT node hierarchy and names of 05 §5.2 (bind + QA-17 pass),
//   - the real-world dimensions of 05 §5.3 (1 unit = 1 m),
//   - the PBR material values of 05 §5.5 (colors, metalness, roughness),
//   - the pivot rule (every top-level part's origin = its bbox center;
//     rotor pivot on the spindle axis).
// When the real GLB lands, flip ASSETS_READY in loader.js and delete this file;
// nothing in the timeline, camera, or label systems changes.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const MM = 0.001;

// PBR material table (05 §5.5) — solid-color stand-ins for the four atlases.
function makeMaterials() {
  const m = (color, metalness, roughness) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness });
  return {
    alu:       m(0xc8cbce, 1.0, 0.46),
    keycap:    m(0x303336, 0.0, 0.60),
    pcb:       m(0x0d1412, 0.0, 0.60),
    solder:    m(0xb9bec2, 1.0, 0.35),
    copper:    m(0xc87d52, 1.0, 0.32),
    silicon:   m(0x3a3f46, 0.0, 0.15),
    substrate: m(0x123018, 0.0, 0.50),
    epoxy:     m(0x16181a, 0.0, 0.75),
    gold:      m(0xd4af6a, 1.0, 0.25),
    label:     m(0xded9cf, 0.0, 0.85),
    fanHouse:  m(0x1b1d1f, 0.0, 0.60),
    fanRotor:  m(0x1b1d1f, 0.0, 0.45),
    steel:     m(0x9ea3a6, 1.0, 0.35),
    rubber:    m(0x2a2c2d, 0.0, 0.90),
    glass:     m(0x3f4548, 0.0, 0.20),
    pouch:     m(0x33363a, 0.0, 0.65),
    paste:     m(0xb9bdc0, 0.0, 0.35),
  };
}

// A box authored in world millimetres (center + size), returned in metres.
function box(w, h, d, cx, cy, cz, ry) {
  const g = new THREE.BoxGeometry(w * MM, h * MM, d * MM);
  if (ry) g.rotateY(ry);
  g.translate(cx * MM, cy * MM, cz * MM);
  return g;
}
function cyl(r, h, cx, cy, cz, seg, axisX) {
  const g = new THREE.CylinderGeometry(r * MM, r * MM, h * MM, seg || 16);
  if (axisX) g.rotateZ(Math.PI / 2);
  g.translate(cx * MM, cy * MM, cz * MM);
  return g;
}

// Merge per-material geometry lists into ONE mesh (one group per material —
// draw calls stay at one per material, not one per box). The mesh's pivot is
// recentered to its own bbox center (the 05 §5.2 pivot rule).
function buildMesh(name, parts, recenter = true) {
  const perMat = [];
  const mats = [];
  for (const p of parts) {
    if (!p.geoms.length) continue;
    const merged = p.geoms.length === 1 ? p.geoms[0] : mergeGeometries(p.geoms, false);
    perMat.push(merged);
    mats.push(p.mat);
  }
  const geo = perMat.length === 1 ? perMat[0] : mergeGeometries(perMat, true);
  if (perMat.length === 1) geo.clearGroups?.();
  const mesh = new THREE.Mesh(geo, perMat.length === 1 ? mats[0] : mats);
  if (recenter) {
    geo.computeBoundingBox();
    const c = new THREE.Vector3();
    geo.boundingBox.getCenter(c);
    geo.translate(-c.x, -c.y, -c.z);
    mesh.position.copy(c);
  }
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// After composing a group's children (authored in world coords), move the
// group's origin to the group bbox center, keeping world positions intact.
function recenterGroup(g) {
  const bb = new THREE.Box3().setFromObject(g);
  const c = new THREE.Vector3();
  bb.getCenter(c);
  for (const ch of g.children) ch.position.sub(c);
  g.position.copy(c);
  return g;
}

export function buildStandIn() {
  const M = makeMaterials();
  const root = new THREE.Group();
  root.name = 'laptop_root';

  /* ---------------- lid — the sealed upper clamshell half ---------------- */
  const lid = new THREE.Group();
  lid.name = 'lid';

  lid.add(buildMesh('lid_shell', [{ mat: M.alu, geoms: [
    box(304, 1.8, 212, 0, 14.7, 0),                    // display back (top plate)
    box(1.8, 4.8, 212, -151.1, 11.4, 0),               // perimeter skirt
    box(1.8, 4.8, 212, 151.1, 11.4, 0),
    box(300.4, 4.8, 1.8, 0, 11.4, -105.1),
    box(300.4, 4.8, 1.8, 0, 11.4, 105.1),
  ]}]));

  lid.add(buildMesh('lid_deck', [{ mat: M.alu, geoms: [
    box(300, 1.2, 208, 0, 9.7, 0),
  ]}]));

  // 78-key field (6 rows × 13 columns), one merged mesh, on the deck underside.
  const keyGeoms = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 13; c++) {
      keyGeoms.push(box(16, 0.8, 16, -114 + c * 19, 8.7, -86 + r * 19));
    }
  }
  lid.add(buildMesh('lid_deck_keys', [{ mat: M.keycap, geoms: keyGeoms }]));

  lid.add(buildMesh('lid_deck_trackpad', [{ mat: M.glass, geoms: [
    box(120, 0.8, 70, 0, 8.85, 62),
  ]}]));

  recenterGroup(lid);
  root.add(lid);

  /* ---------------- cooling_fan ---------------- */
  const fan = new THREE.Group();
  fan.name = 'cooling_fan';

  fan.add(buildMesh('cooling_fan_housing', [{ mat: M.fanHouse, geoms: [
    box(64, 1.0, 58, -92, 5.7, -58),                   // base plate
    box(3, 5.2, 58, -122.5, 8.8, -58),                 // side walls (open top)
    box(3, 5.2, 58, -61.5, 8.8, -58),
    box(58, 5.2, 3, -92, 8.8, -85.5),
    box(58, 5.2, 3, -92, 8.8, -30.5),
  ]}]));

  // 39-blade rotor; pivot stays on the spindle axis at blade mid-height.
  const bladeGeoms = [cyl(7, 4.6, -92, 8.6, -58, 32)];
  for (let i = 0; i < 39; i++) {
    const a = (i / 39) * Math.PI * 2;
    const bx = -92 + Math.cos(a) * 14.5;
    const bz = -58 - Math.sin(a) * 14.5;
    bladeGeoms.push(box(15, 4.0, 1.4, bx, 8.6, bz, a));
  }
  fan.add(buildMesh('cooling_fan_rotor', [{ mat: M.fanRotor, geoms: bladeGeoms }]));

  recenterGroup(fan);
  root.add(fan);

  /* ---------------- heat_pipes (one assembly, raw copper — D-016) ---------------- */
  const pipes = new THREE.Group();
  pipes.name = 'heat_pipes';

  pipes.add(buildMesh('heat_pipes_pipe', [{ mat: M.copper, geoms: [
    box(50, 3, 8, -15, 10.0, -30),                     // run west from the coldplate
    box(62, 3, 8, -54, 10.0, -60, 2.116),              // angled run to the fin stack
    // mirrored thermal-paste imprint on the coldplate underside (05 §5.5 #12)
  ]}, { mat: M.paste, geoms: [
    box(16, 0.1, 14, 2, 9.47, -30),
  ]}]));

  pipes.add(buildMesh('heat_pipes_coldplate', [{ mat: M.copper, geoms: [
    box(38, 2, 32, 2, 10.5, -30),
  ]}]));

  const finGeoms = [];
  for (let i = 0; i < 45; i++) {
    finGeoms.push(box(0.5, 6.5, 11.5, -97 + i * 1.22, 8.4, -92));
  }
  pipes.add(buildMesh('heat_pipes_finstack', [{ mat: M.copper, geoms: finGeoms }]));

  recenterGroup(pipes);
  root.add(pipes);

  /* ---------------- storage_ssd — M.2 2280, one mesh ---------------- */
  root.add(buildMesh('storage_ssd', [
    { mat: M.pcb, geoms: [box(80, 1.2, 22, -18, 9.4, -18)] },
    { mat: M.epoxy, geoms: [
      box(14, 1.2, 16, -34, 10.0, -18),
      box(14, 1.2, 16, -16, 10.0, -18),
      box(10, 1.2, 12, 0, 10.0, -18),
    ]},
    { mat: M.label, geoms: [box(56, 0.2, 18, -22, 10.75, -18)] },  // honest unbranded label
    { mat: M.gold, geoms: [box(6, 1.3, 18, 19, 9.4, -18)] },
  ]));

  /* ---------------- memory_ram — SO-DIMM, one mesh ---------------- */
  const dramGeoms = [];
  for (let i = 0; i < 4; i++) {
    dramGeoms.push(box(12, 1.0, 11, 62 - 21 + i * 14, 10.15, -13));
    dramGeoms.push(box(12, 1.0, 11, 62 - 21 + i * 14, 10.15, -1));
  }
  root.add(buildMesh('memory_ram', [
    { mat: M.pcb, geoms: [box(69.6, 1.2, 30, 62, 9.5, -8)] },
    { mat: M.epoxy, geoms: dramGeoms },
    { mat: M.gold, geoms: [box(64, 0.6, 3, 62, 9.5, -21.5)] },
  ]));

  /* ---------------- support_boards (group of 3; B5 drives them individually) ---------------- */
  const boards = new THREE.Group();
  boards.name = 'support_boards';

  boards.add(buildMesh('support_board_io', [
    { mat: M.pcb, geoms: [box(64, 1.2, 28, -116, 8.9, 18)] },
    { mat: M.steel, geoms: [box(30, 2.5, 20, -124, 10.7, 18)] },
  ]));
  boards.add(buildMesh('support_board_wireless', [
    { mat: M.pcb, geoms: [box(30, 1.2, 26, -104, 8.9, 44)] },
    { mat: M.steel, geoms: [box(20, 2.0, 18, -104, 10.5, 44)] },
  ]));
  boards.add(buildMesh('support_board_aux', [
    { mat: M.pcb, geoms: [box(46, 1.2, 20, -84, 8.9, 64)] },
    { mat: M.epoxy, geoms: [box(6, 2, 4, -94, 10.5, 64), box(6, 2, 4, -76, 10.5, 64)] },
  ]));

  recenterGroup(boards);
  root.add(boards);

  /* ---------------- mainboard — one mesh incl. permanently-soldered parts ---------------- */
  const chokeGeoms = [];
  for (let i = 0; i < 6; i++) chokeGeoms.push(box(8, 3, 8, -60 + i * 14, 9.2, -60));
  const capGeoms = [];
  for (let i = 0; i < 8; i++) capGeoms.push(box(3.4, 1.6, 2, -58 + i * 9, 8.5, -48));
  root.add(buildMesh('mainboard', [
    { mat: M.pcb, geoms: [box(262, 1.2, 158, 0, 7.1, -22)] },
    { mat: M.substrate, geoms: [box(40, 0.8, 34, 2, 8.1, -30)] },
    { mat: M.silicon, geoms: [box(18, 1.0, 16, 2, 9.0, -30)] },
    { mat: M.paste, geoms: [box(16, 0.1, 14, 2, 9.42, -30)] },   // paste imprint on the die
    { mat: M.epoxy, geoms: [
      ...chokeGeoms, ...capGeoms,
      box(8, 2, 22, 24, 8.7, -18),                     // M.2 socket
      box(74, 1.5, 3, 62, 8.45, -25),                  // SO-DIMM socket, latches open
      box(74, 1.5, 3, 62, 8.45, 9),
      box(3, 1.5, 31, 26.5, 8.45, -8),
      box(3, 1.5, 31, 97.5, 8.45, -8),
      box(6, 2, 3, -70, 8.7, -40),                     // empty fan header
      box(6, 2, 3, 30, 8.7, 30),                       // empty battery header
    ]},
    { mat: M.solder, geoms: [
      box(9, 3.5, 7.5, -127, 9.0, 10),                 // two USB-C shells, left wall
      box(9, 3.5, 7.5, -127, 9.0, 24),
      cyl(2, 2, -56, 8.7, -18, 12),                    // M.2 standoff
    ]},
    { mat: M.epoxy, geoms: [cyl(3, 12, -127, 9.0, 40, 12, true)] }, // audio jack
  ]));

  /* ---------------- chassis ---------------- */
  const chassis = new THREE.Group();
  chassis.name = 'chassis';

  chassis.add(buildMesh('chassis_tub', [{ mat: M.alu, geoms: [
    box(304, 1.6, 212, 0, 2.0, 0),                     // floor
    box(1.6, 6.2, 212, -151.2, 5.9, 0),                // walls (port cutouts implied)
    box(1.6, 6.2, 212, 151.2, 5.9, 0),
    box(300.8, 6.2, 1.6, 0, 5.9, -105.2),
    box(300.8, 6.2, 1.6, 0, 5.9, 105.2),
  ]}]));

  chassis.add(buildMesh('chassis_battery', [{ mat: M.pouch, geoms: [
    box(190, 5.4, 92, 35, 5.5, 52),                    // non-separating (D-015); labeled, never moves
  ]}]));

  chassis.add(buildMesh('chassis_speaker_l', [{ mat: M.epoxy, geoms: [box(58, 5, 18, -120, 5.4, 88)] }]));
  chassis.add(buildMesh('chassis_speaker_r', [{ mat: M.epoxy, geoms: [box(58, 5, 18, 120, 5.4, 88)] }]));

  chassis.add(buildMesh('chassis_feet', [{ mat: M.rubber, geoms: [
    cyl(6, 1.2, -132, 0.6, -92), cyl(6, 1.2, 132, 0.6, -92),
    cyl(6, 1.2, -132, 0.6, 92), cyl(6, 1.2, 132, 0.6, 92),
  ]}]));

  recenterGroup(chassis);
  root.add(chassis);

  /* ---------------- locators ---------------- */
  const locators = new THREE.Group();
  locators.name = 'locators';
  const hinge = new THREE.Object3D();
  hinge.name = 'loc_lid_hinge';
  hinge.position.set(0, 9.0 * MM, -106.0 * MM);
  const groundCenter = new THREE.Object3D();
  groundCenter.name = 'loc_ground_center';
  locators.add(hinge, groundCenter);
  root.add(locators);

  return root;
}
