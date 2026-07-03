// materials.js — the machine's material system (realism pass).
//
// Named PBR recipes; every material defines base color, roughness, metalness,
// and where it helps, procedural roughness/bump/color maps from textures.js
// and environment response. MeshPhysicalMaterial is used only where it
// clearly earns its cost: machined aluminum (anisotropic brushing) and glass
// (clearcoat). Everything else is MeshStandardMaterial. Materials are shared
// instances, created once.
//
// Realism comes from different materials answering the same warm light
// differently: aluminum reflects the room softly, glass sharply, polymer and
// PCB barely at all, copper/gold with small warm highlights.

import * as THREE from 'three';
import { createTextures } from './textures.js';

export function createMaterials() {
  const T = createTextures();

  // -------- aluminumMaterial: machined, brushed, never chrome --------
  function aluminum(map) {
    const m = new THREE.MeshPhysicalMaterial({
      color: 0xc8cbce, metalness: 1.0, roughness: 0.52,
      anisotropy: 0.35, // brushed along the grain, subtle
      map: map || T.brushedMap,
      roughnessMap: T.brushedRough,
      bumpMap: T.brushedBump, bumpScale: 0.35,
      envMapIntensity: 1.0,
    });
    return m;
  }
  const aluminumMaterial = aluminum();           // display shell
  const aluminumDeckMaterial = aluminum(T.deckMap);   // top case (trackpad recess AO)
  const aluminumShellMaterial = aluminum(T.floorMap); // lower shell (interior vignette)

  // -------- glassMaterial: thin cover glass, sharp restrained highlight --------
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x16181a, metalness: 0.0, roughness: 0.09,
    clearcoat: 1.0, clearcoatRoughness: 0.08,
    roughnessMap: T.glassRough,
    envMapIntensity: 1.5,
  });
  const trackpadGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x3f4548, metalness: 0.0, roughness: 0.16,
    clearcoat: 0.8, clearcoatRoughness: 0.12,
    roughnessMap: T.glassRough,
    envMapIntensity: 1.2,
  });

  // -------- pcbMaterial: matte, dense, traces etched not glowing --------
  const pcbMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, // the dark board tone lives entirely in the map
    metalness: 0.0, roughness: 0.55,
    map: T.pcbMap, roughnessMap: T.pcbRough,
    envMapIntensity: 0.5,
  });

  // -------- batteryMaterial: satin polymer pouch, soft against the metal --------
  const batteryMaterial = new THREE.MeshStandardMaterial({
    color: 0x2e3033, metalness: 0.0, roughness: 0.62,
    map: T.batteryMap, roughnessMap: T.batteryRough,
    envMapIntensity: 0.6,
  });

  // -------- graphiteMaterial: heat-spreading sheet, dark satin flake --------
  const graphiteMaterial = new THREE.MeshStandardMaterial({
    color: 0x232323, metalness: 0.0, roughness: 0.5,
    map: T.graphiteMap,
    envMapIntensity: 0.55,
  });

  // -------- shieldPlateMaterial: thin stamped metal, faint handling marks --------
  const shieldPlateMaterial = new THREE.MeshStandardMaterial({
    color: 0xb9bdc0, metalness: 1.0, roughness: 0.32,
    roughnessMap: T.shieldRough,
    envMapIntensity: 1.0,
  });

  // -------- copperContactMaterial: muted warm metal, tiny highlights --------
  const copperContactMaterial = new THREE.MeshStandardMaterial({
    color: 0xc3a36f, metalness: 1.0, roughness: 0.36,
    envMapIntensity: 1.15,
  });

  // -------- blackPlasticMaterial: molded speaker chambers with ribbing --------
  const blackPlasticMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b1d1f, metalness: 0.0, roughness: 0.75,
    bumpMap: T.speakerBump, bumpScale: 0.3,
    envMapIntensity: 0.35,
  });

  // -------- ribbonCableMaterial: dark flexible film, almost no reflection --------
  const ribbonCableMaterial = new THREE.MeshStandardMaterial({
    color: 0x26221f, metalness: 0.0, roughness: 0.5,
    envMapIntensity: 0.4,
  });

  // -------- rubberFootMaterial --------
  const rubberFootMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2c2d, metalness: 0.0, roughness: 0.9,
    envMapIntensity: 0.2,
  });

  const m = (color, metalness, roughness, envMapIntensity = 1) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness, envMapIntensity });

  // The full keyed set model.js builds from (recipe aliases below).
  return {
    alu: aluminumMaterial,
    aluDeck: aluminumDeckMaterial,
    aluShell: aluminumShellMaterial,
    aluDark: m(0x9fa2a6, 1.0, 0.40),          // hinge barrels, bosses, brackets
    glassBlack: glassMaterial,
    panelDark: m(0x101214, 0.0, 0.40, 0.5),
    wellDark: m(0x1f2124, 0.0, 0.65, 0.4),
    keycap: m(0x2b2d30, 0.0, 0.60, 0.5),
    button: m(0x3a3d42, 0.0, 0.45, 0.7),
    backlight: m(0x8b857a, 0.0, 0.80, 0.4),
    membrane: m(0x232527, 0.0, 0.70, 0.4),
    glassPad: trackpadGlassMaterial,
    pcb: pcbMaterial,
    trace: m(0x1e232a, 0.0, 0.55, 0.4),
    substrate: m(0x1c1f24, 0.0, 0.50, 0.6),
    silicon: m(0x3a3f46, 0.0, 0.15, 1.2),     // exposed die — the one sharp dark mirror
    chip: m(0x24272b, 0.0, 0.72, 0.5),        // lifted a step off the near-black mask
    steel: m(0x9ea3a6, 1.0, 0.35),
    shieldTop: shieldPlateMaterial,
    graphite: graphiteMaterial,
    pouch: batteryMaterial,
    adhesive: m(0xb9b2a4, 0.0, 0.85, 0.4),
    molded: blackPlasticMaterial,
    flexFilm: ribbonCableMaterial,
    contact: copperContactMaterial,
    plastic: m(0x4a4642, 0.0, 0.70, 0.4),
    rubber: rubberFootMaterial,
    cavity: m(0x101112, 0.0, 0.85, 0.15),     // port cutouts — dark inner cavities

    // Recipe-name aliases (documentation and future passes):
    aluminumMaterial, aluminumDeckMaterial, aluminumShellMaterial,
    glassMaterial, trackpadGlassMaterial, pcbMaterial, batteryMaterial,
    graphiteMaterial, shieldPlateMaterial, copperContactMaterial,
    blackPlasticMaterial, ribbonCableMaterial, rubberFootMaterial,
  };
}
