// model.js — the development stand-in laptop: a thin FANLESS ultrabook.
//
// Architecture reference: the internal logic of a modern thin fanless
// ultrabook — large flat battery cells, one dense logic board with the
// processor/memory/storage soldered on, a passive thermal stack (shield
// plate + graphite sheet, no fan anywhere), slim speaker chambers, port
// boards at the edges, an engineered display assembly and top case.
// No brand marks, no logos, no fake specs.
//
// The node names below are the bind contract shared with component-data.js,
// timeline.js, and main.js; a future production GLB must carry them
// byte-exactly. Every top-level part's pivot is recentered to its own bbox
// center; the world envelope (304 × 212 × 15.6 mm) matches the camera math.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createMaterials } from './materials.js';

const MM = 0.001;

function box(w, h, d, cx, cy, cz, ry) {
  const g = new THREE.BoxGeometry(w * MM, h * MM, d * MM);
  if (ry) g.rotateY(ry);
  g.translate(cx * MM, cy * MM, cz * MM);
  return g;
}

// Beveled box: precise small-radius edges so plates and packages catch light.
// Radius clamps to the thinnest half-dimension; segments stay low (cheap).
function rbox(w, h, d, cx, cy, cz, r, seg) {
  const radius = Math.min(r, w / 2, h / 2, d / 2) * MM;
  const g = new RoundedBoxGeometry(w * MM, h * MM, d * MM, seg || 2, radius);
  g.translate(cx * MM, cy * MM, cz * MM);
  return g;
}
function cyl(r, h, cx, cy, cz, seg, axisX) {
  const g = new THREE.CylinderGeometry(r * MM, r * MM, h * MM, seg || 16);
  if (axisX) g.rotateZ(Math.PI / 2);
  g.translate(cx * MM, cy * MM, cz * MM);
  return g;
}

function buildMesh(name, parts, recenter = true) {
  const perMat = [];
  const mats = [];
  for (const p of parts) {
    if (!p.geoms.length) continue;
    // RoundedBoxGeometry is non-indexed while Box/Cylinder are indexed;
    // mergeGeometries requires one convention, so de-index uniformly.
    const geoms = p.geoms.map(g => (g.index ? g.toNonIndexed() : g));
    const merged = geoms.length === 1 ? geoms[0] : mergeGeometries(geoms, false);
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

function recenterGroup(g) {
  const bb = new THREE.Box3().setFromObject(g);
  const c = new THREE.Vector3();
  bb.getCenter(c);
  for (const ch of g.children) ch.position.sub(c);
  g.position.copy(c);
  return g;
}

export function buildStandIn() {
  const M = createMaterials();
  const root = new THREE.Group();
  root.name = 'laptop_root';

  /* ================= display_assembly =================
     Not one slab: shell + glass + panel + camera + flex + hinges + antennas.
     Closed: y 10.6–15.6 (glass faces down toward the deck). */
  const display = new THREE.Group();
  display.name = 'display_assembly';

  // Slimmed closed profile: the display assembly is a 3.3 mm stack
  // (glass 10.9 → shell top 13.95) instead of the earlier 4.8 mm brick.
  display.add(buildMesh('display_shell', [{ mat: M.alu, geoms: [
    rbox(304, 1.2, 212, 0, 13.35, 0, 0.55),            // outer shell plate, beveled edge
    box(1.6, 2.05, 212, -151.2, 11.72, 0),             // perimeter skirt
    box(1.6, 2.05, 212, 151.2, 11.72, 0),
    box(300.8, 2.05, 1.6, 0, 11.72, -105.2),
    box(300.8, 2.05, 1.6, 0, 11.72, 105.2),
  ]}]));

  display.add(buildMesh('display_antenna', [{ mat: M.plastic, geoms: [
    box(40, 1.9, 4, -120, 11.85, -100),                // antenna windows, hinge-side corners
    box(40, 1.9, 4, 120, 11.85, -100),
  ]}]));

  display.add(buildMesh('display_panel', [{ mat: M.panelDark, geoms: [
    box(288, 0.6, 192, 0, 11.65, 2),
  ]}]));

  display.add(buildMesh('display_glass', [{ mat: M.glassBlack, geoms: [
    rbox(296, 0.4, 200, 0, 11.12, 2, 0.18, 1),         // thin glass, tiny edge bevel
  ]}]));

  display.add(buildMesh('display_camera', [
    { mat: M.chip, geoms: [box(9, 0.7, 6, 0, 11.75, -92)] },
    { mat: M.glassBlack, geoms: [cyl(1.2, 0.3, 0, 11.35, -92, 12)] },
  ]));

  // Two flex ribbons arcing through the hinge line — segmented so the film
  // reads as a bent cable, not a flat sticker.
  const flexArc = (x) => {
    const segs = [];
    const g1 = new THREE.BoxGeometry(26 * MM, 0.25 * MM, 9 * MM);
    g1.rotateX(0.5);
    g1.translate(x * MM, 10.75 * MM, -97 * MM);
    const g2 = new THREE.BoxGeometry(26 * MM, 0.25 * MM, 9 * MM);
    g2.rotateX(-0.35);
    g2.translate(x * MM, 10.45 * MM, -104.5 * MM);
    segs.push(g1, g2);
    return segs;
  };
  display.add(buildMesh('display_flex', [{ mat: M.flexFilm, geoms: [
    ...flexArc(-60), ...flexArc(60),
  ]}, { mat: M.contact, geoms: [
    box(26, 0.12, 1.4, -60, 10.9, -93.5),              // faint contact edges at the anchored ends
    box(26, 0.12, 1.4, 60, 10.9, -93.5),
  ]}]));

  display.add(buildMesh('hinge_barrel_l', [
    { mat: M.aluDark, geoms: [cyl(2.5, 36, -92, 10.25, -102, 20, true)] },
    { mat: M.steel, geoms: [box(12, 1.0, 8, -92, 10.25, -96)] },
  ]));
  display.add(buildMesh('hinge_barrel_r', [
    { mat: M.aluDark, geoms: [cyl(2.5, 36, 92, 10.25, -102, 20, true)] },
    { mat: M.steel, geoms: [box(12, 1.0, 8, 92, 10.25, -96)] },
  ]));

  recenterGroup(display);
  root.add(display);

  /* ================= top_case (keyboard deck) =================
     A thin engineered platform: deck, membrane, backlight, keys, fingerprint
     button, trackpad glass + force assembly + flex. y 9.0–10.4 (+ keys). */
  const topCase = new THREE.Group();
  topCase.name = 'top_case';

  topCase.add(buildMesh('top_shell', [
    { mat: M.aluDeck, geoms: [rbox(304, 1.2, 212, 0, 9.6, 0, 0.55)] },
    { mat: M.wellDark, geoms: [box(240, 0.15, 110, 0, 10.27, -32)] }, // keyboard well
  ]));

  topCase.add(buildMesh('keyboard_membrane', [{ mat: M.membrane, geoms: [
    box(236, 0.1, 106, 0, 10.38, -32),
  ]}]));

  topCase.add(buildMesh('key_backlight', [{ mat: M.backlight, geoms: [
    box(234, 0.08, 104, 0, 10.46, -32),
  ]}]));

  // 77 shallow keys + 1 distinct fingerprint power button (6 rows × 13 cols).
  const keyGeoms = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 13; c++) {
      if (r === 0 && c === 12) continue; // power button slot
      keyGeoms.push(rbox(15.6, 0.4, 15.6, -106.8 + c * 17.8, 10.7, -76.5 + r * 17.8, 0.18, 1));
    }
  }
  topCase.add(buildMesh('keycap_field', [{ mat: M.keycap, geoms: keyGeoms }]));
  topCase.add(buildMesh('power_button', [
    { mat: M.button, geoms: [rbox(15.6, 0.4, 15.6, -106.8 + 12 * 17.8, 10.7, -76.5, 0.18, 1)] },
    { mat: M.steel, geoms: [box(11, 0.08, 11, -106.8 + 12 * 17.8, 10.94, -76.5)] }, // sensor ring hint
  ]));

  topCase.add(buildMesh('trackpad_glass', [{ mat: M.glassPad, geoms: [
    rbox(130, 0.45, 82, 0, 10.42, 62, 0.2, 1),
  ]}]));
  topCase.add(buildMesh('trackpad_assembly', [
    { mat: M.steel, geoms: [rbox(118, 0.5, 72, 0, 8.75, 62, 0.2, 1)] },
    { mat: M.chip, geoms: [box(24, 0.4, 8, 0, 8.45, 40)] },   // force-sensing module
  ]));
  topCase.add(buildMesh('trackpad_flex', [{ mat: M.flexFilm, geoms: [
    box(10, 0.15, 26, 0, 8.75, 14),
  ]}]));

  recenterGroup(topCase);
  root.add(topCase);

  /* ================= passive thermal stack (no fan) =================
     Shield/heat plate with a processor contact pad, then the graphite sheet.
     Both rest over the processor region of the logic board. */
  root.add(buildMesh('shield_plate', [
    { mat: M.shieldTop, geoms: [
      rbox(120, 0.5, 80, 8, 8.95, -52, 0.22, 1),       // thin stamped sheet, beveled
      box(26, 0.3, 18, 8, 8.60, -52),                  // processor contact plate
    ]},
    { mat: M.aluDark, geoms: [
      cyl(1.2, 0.4, -46, 9.3, -86, 10), cyl(1.2, 0.4, 62, 9.3, -18, 10), // shield screws
    ]},
  ]));

  root.add(buildMesh('graphite_sheet', [{ mat: M.graphite, geoms: [
    box(150, 0.15, 95, 0, 9.35, -52),
  ]}]));

  /* ================= logic_board =================
     One dense compact board at the rear: processor package with on-substrate
     unified memory, soldered storage, PMICs, VRM field, wireless, timing
     crystal, board-to-board connectors, ribbon sockets, grounding pads,
     screw posts, and subtle etched traces. */
  const board = new THREE.Group();
  board.name = 'logic_board';

  // Named anchor meshes first (tight label boxes). Packages get tiny bevels
  // so they read as molded parts seated on the board, not painted rectangles.
  board.add(buildMesh('soc_package', [
    { mat: M.substrate, geoms: [rbox(56, 0.8, 34, 8, 8.1, -52, 0.25, 1)] },
    { mat: M.silicon, geoms: [rbox(20, 0.4, 15, 0, 8.7, -52, 0.15, 1)] }, // exposed die
  ]));
  board.add(buildMesh('memory_packages', [{ mat: M.chip, geoms: [
    rbox(13, 0.4, 11, 26, 8.7, -58, 0.15, 1),          // unified memory on the substrate
    rbox(13, 0.4, 11, 26, 8.7, -46, 0.15, 1),
  ]}]));
  board.add(buildMesh('storage_packages', [{ mat: M.chip, geoms: [
    rbox(14, 0.6, 12, -70, 8.0, -42, 0.18, 1),         // soldered NAND
    rbox(14, 0.6, 12, -70, 8.0, -64, 0.18, 1),
  ]}]));

  // The board itself with its regions.
  const vrmInd = [];
  for (let i = 0; i < 8; i++) vrmInd.push(box(3.2, 1.0, 3.2, -30 + (i % 4) * 5.2, 8.2, -72 + Math.floor(i / 4) * 5.2));
  const vrmCaps = [];
  for (let i = 0; i < 12; i++) vrmCaps.push(box(1.8, 0.6, 1.1, -32 + i * 3.1, 8.0, -61));
  const traces = [];
  for (let i = 0; i < 8; i++) traces.push(box(20 + (i % 3) * 8, 0.06, 0.7, -40 + i * 16, 7.74, -30 - (i % 4) * 12));
  board.add(buildMesh('logic_board_body', [
    { mat: M.pcb, geoms: [rbox(235, 1.2, 90, -2.5, 7.1, -55, 0.4, 1)] },
    { mat: M.chip, geoms: [
      box(9, 0.5, 9, -48, 7.95, -53),                  // storage controller
      box(7, 0.6, 7, 58, 8.0, -74), box(7, 0.6, 7, 68, 8.0, -74), box(7, 0.6, 7, 78, 8.0, -74), // PMICs
      box(16, 0.7, 14, 90, 8.05, -44),                 // wireless module
      box(3, 0.5, 1.6, 44, 7.95, -70),                 // timing crystal
      box(8, 0.5, 8, 96, 7.95, -70),                   // USB-C controller
      box(7, 0.5, 7, -96, 7.95, -30),                  // audio controller
      ...vrmInd, ...vrmCaps,
    ]},
    { mat: M.steel, geoms: [
      box(18, 0.3, 16, 90, 8.55, -44),                 // wireless shield can
      cyl(1.2, 0.4, -112, 7.9, -92, 10), cyl(1.2, 0.4, 108, 7.9, -92, 10), // board screws
      cyl(1.2, 0.4, -112, 7.9, -18, 10), cyl(1.2, 0.4, 108, 7.9, -18, 10),
    ]},
    { mat: M.contact, geoms: [
      box(4, 0.1, 4, -110, 7.72, -88), box(4, 0.1, 4, 106, 7.72, -88),   // grounding pads
      box(4, 0.1, 4, -110, 7.72, -22), box(4, 0.1, 4, 106, 7.72, -22),
    ]},
    { mat: M.aluDark, geoms: [
      box(9, 0.8, 3, -80, 8.1, -16), box(9, 0.8, 3, -30, 8.1, -14),      // board-to-board connectors
      box(9, 0.8, 3, 30, 8.1, -14), box(9, 0.8, 3, 80, 8.1, -16),
    ]},
    { mat: M.membrane, geoms: [
      box(7, 0.7, 2.4, -55, 8.05, -14), box(7, 0.7, 2.4, 5, 8.05, -14), box(7, 0.7, 2.4, 55, 8.05, -14), // ribbon sockets
      box(1.2, 0.4, 1.2, -60, 7.9, -84), box(1.2, 0.4, 1.2, -20, 7.9, -88), // microphone ports
    ]},
    { mat: M.trace, geoms: traces },
  ]));

  recenterGroup(board);
  root.add(board);

  /* ================= port and I/O boards (left wall) ================= */
  root.add(buildMesh('port_board_usbc', [
    { mat: M.pcb, geoms: [rbox(46, 1.2, 22, -136, 7.4, -66, 0.35, 1)] },
    { mat: M.steel, geoms: [
      box(9, 3.4, 7.6, -146, 7.4, -73),                // two USB-C shells
      box(9, 3.4, 7.6, -146, 7.4, -59),
      box(2.5, 5, 24, -149, 7.4, -66),                 // reinforcement bracket
    ]},
    { mat: M.flexFilm, geoms: [box(14, 0.2, 8, -110, 7.9, -66)] },
  ]));
  root.add(buildMesh('port_board_charge', [
    { mat: M.pcb, geoms: [rbox(36, 1.2, 14, -136, 7.4, -20, 0.35, 1)] },
    { mat: M.contact, geoms: [box(3, 1.0, 22, -148, 7.6, -20)] },        // magnetic contact strip
    { mat: M.flexFilm, geoms: [box(14, 0.2, 7, -112, 7.9, -20)] },
  ]));
  root.add(buildMesh('port_board_audio', [
    { mat: M.pcb, geoms: [rbox(24, 1.2, 12, -136, 7.4, 42, 0.35, 1)] },
    { mat: M.chip, geoms: [cyl(2.6, 10, -143, 7.4, 42, 12, true)] },     // jack barrel
    { mat: M.flexFilm, geoms: [box(12, 0.2, 7, -118, 7.9, 42)] },
  ]));

  /* ================= battery_system (stays seated; the volume king) ================= */
  const battery = new THREE.Group();
  battery.name = 'battery_system';

  battery.add(buildMesh('battery_cells', [
    { mat: M.pouch, geoms: [
      rbox(80, 5.2, 82, -42, 5.4, 55, 1.4),            // pouch cells — soft edge puff
      rbox(80, 5.2, 82, 42, 5.4, 55, 1.4),
      rbox(40, 5.2, 72, -106, 5.4, 55, 1.4),
      rbox(40, 5.2, 72, 106, 5.4, 55, 1.4),
    ]},
    { mat: M.adhesive, geoms: [
      box(6, 0.25, 70, -84, 2.95, 55),                 // adhesive zones in the cell gaps
      box(6, 0.25, 70, 0, 2.95, 55),
      box(6, 0.25, 70, 84, 2.95, 55),
      box(10, 0.1, 26, -60, 8.05, 88),                 // pull tabs on the front cells
      box(10, 0.1, 26, 60, 8.05, 88),
    ]},
  ]));

  battery.add(buildMesh('battery_bms', [
    { mat: M.pcb, geoms: [box(130, 1.4, 10, 0, 8.5, 12)] },              // management board
    { mat: M.flexFilm, geoms: [box(24, 0.5, 12, 0, 8.5, -2)] },          // battery cable to the board
    { mat: M.contact, geoms: [box(10, 0.3, 3, 0, 9.0, 8)] },
  ]));

  recenterGroup(battery);
  root.add(battery);

  /* ================= audio: slim speaker chambers beside the battery ================= */
  root.add(buildMesh('speaker_l', [
    { mat: M.molded, geoms: [rbox(38, 5.6, 92, -128, 5.8, 40, 0.9)] },
    { mat: M.chip, geoms: [cyl(6, 0.8, -128, 8.8, 18, 20)] },            // driver
    { mat: M.flexFilm, geoms: [box(10, 0.2, 18, -128, 8.7, -6)] },       // audio flex
  ]));
  root.add(buildMesh('speaker_r', [
    { mat: M.molded, geoms: [rbox(38, 5.6, 92, 128, 5.8, 40, 0.9)] },
    { mat: M.chip, geoms: [cyl(6, 0.8, 128, 8.8, 18, 20)] },
    { mat: M.flexFilm, geoms: [box(10, 0.2, 18, 128, 8.7, -6)] },
  ]));

  /* ================= lower_case ================= */
  const lower = new THREE.Group();
  lower.name = 'lower_case';

  lower.add(buildMesh('lower_shell', [
    { mat: M.aluShell, geoms: [
      rbox(304, 1.6, 212, 0, 2.0, 0, 0.7),             // floor — beveled, ventless edges all round
      box(1.6, 6.2, 212, -151.2, 5.9, 0),
      box(1.6, 6.2, 212, 151.2, 5.9, 0),
      box(300.8, 6.2, 1.6, 0, 5.9, -105.2),
      box(300.8, 6.2, 1.6, 0, 5.9, 105.2),
      box(180, 0.8, 2.5, 10, 3.2, 5),                  // internal ribs
      box(120, 0.8, 2.5, 0, 3.2, -98),
    ]},
    { mat: M.cavity, geoms: [
      // Port cutouts on the left wall exterior — dark cavities aligned with
      // the port boards inside, so the ports read as cut into the chassis.
      rbox(0.5, 4.2, 10, -152.3, 7.4, -73, 0.2, 1),    // USB-C pair
      rbox(0.5, 4.2, 10, -152.3, 7.4, -59, 0.2, 1),
      rbox(0.5, 3.4, 24, -152.3, 7.4, -20, 0.2, 1),    // magnetic charge slot
      cyl(2.4, 0.5, -152.3, 7.4, 42, 14, true),        // headphone jack cavity
    ]},
    { mat: M.aluDark, geoms: [
      cyl(2, 2.5, -140, 4.0, -95, 10), cyl(2, 2.5, 140, 4.0, -95, 10),   // screw bosses
      cyl(2, 2.5, -140, 4.0, 95, 10), cyl(2, 2.5, 140, 4.0, 95, 10),
      cyl(2, 2.5, -140, 4.0, 0, 10), cyl(2, 2.5, 140, 4.0, 0, 10),
    ]},
    { mat: M.steel, geoms: [
      cyl(1.1, 0.35, -140, 2.95, -95, 10), cyl(1.1, 0.35, 140, 2.95, -95, 10), // visible screws
      cyl(1.1, 0.35, -140, 2.95, 95, 10), cyl(1.1, 0.35, 140, 2.95, 95, 10),
    ]},
    { mat: M.contact, geoms: [
      box(5, 0.15, 5, -60, 2.9, -12), box(5, 0.15, 5, 60, 2.9, -12),     // grounding contacts
    ]},
  ]));

  lower.add(buildMesh('foot_inserts', [{ mat: M.rubber, geoms: [
    cyl(6, 1.2, -132, 0.6, -92), cyl(6, 1.2, 132, 0.6, -92),
    cyl(6, 1.2, -132, 0.6, 92), cyl(6, 1.2, 132, 0.6, 92),
  ]}]));

  recenterGroup(lower);
  root.add(lower);

  /* ================= locators ================= */
  const locators = new THREE.Group();
  locators.name = 'locators';
  const hinge = new THREE.Object3D();
  hinge.name = 'loc_lid_hinge';
  hinge.position.set(0, 10.2 * MM, -102.0 * MM);
  const groundCenter = new THREE.Object3D();
  groundCenter.name = 'loc_ground_center';
  locators.add(hinge, groundCenter);
  root.add(locators);

  return root;
}
