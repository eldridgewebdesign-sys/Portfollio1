# Vendor manifest — /engineering

Every third-party file served by the `/engineering` page, its exact version,
source, and SHA-256. No CDN request of any kind exists on this page (D-003);
these files are the complete third-party surface. Pins are frozen for the life
of the page unless a `docs/engineering-demo/decisions.md` entry supersedes them.

| Library | Version | Source |
|---|---|---|
| Three.js (`three-r180/`) | r180 (npm `three@0.180.0`, Sep 2025 release) | npm registry, vendored 2026-07-02 |
| GSAP core + CustomEase + ScrollTrigger (`gsap-3.13.0/`) | 3.13.0 (npm `gsap@3.13.0`) | npm registry, vendored 2026-07-02 |
| Draco + Basis decoders (`decoders-r180/`) | from the same `three@0.180.0` release (`examples/jsm/libs/`) | npm registry, vendored 2026-07-02 |

Licenses: `three-r180/LICENSE` (MIT, permits vendoring); `gsap-3.13.0/LICENSE.txt`
(GSAP Standard License — free incl. commercial use since 3.13, self-hosting
expressly permitted; vendored as-is, never modified).

## Transitive-import gate (05 §2.3)

Verified against the actual r180 tag at vendoring time:

- `KTX2Loader.js` imports `../libs/ktx-parse.module.js`, `../libs/zstddec.module.js`,
  `../utils/WorkerPool.js`, **and `../math/ColorSpaces.js`** — all four vendored.
- `RGBELoader.js` in r180 is a re-export of `./HDRLoader.js` — vendored beside it.
- `GLTFLoader.js` imports `../utils/BufferGeometryUtils.js` — vendored.
- `DRACOLoader.js`, `RoomEnvironment.js`, `RoundedBoxGeometry.js` import only `three`.

`RoundedBoxGeometry.js` is vendored beyond 05 §2.2's list to support the
procedural stand-in model era (currently unused; kept for the asset round).
The addons line therefore carries more bytes than 05 §11.1's ≤ 180 KB estimate
(real r180 `GLTFLoader.js` alone is 112 KB) — but in the stand-in era only
`RoomEnvironment.js` + `BufferGeometryUtils.js` are ever fetched; the full
loader graph loads only when `ASSETS_READY` flips (see `js/loader.js`).

## SHA-256 of every vendored file

```
8478b5b6d6b74e7d3082b89f6417321d8d1dc0307f2b30d4484bb11b441696a1  decoders-r180/basis/basis_transcoder.js
6cf17dc889352c42e9acf8897107978d127005fe3386c36a0e3845e27967630a  decoders-r180/basis/basis_transcoder.wasm
a680d927bed9cb864ddbd63521868891af2bfbe755092761b4837487618df8ac  decoders-r180/draco/draco_decoder.wasm
8bb2952d2ba7d67e1414f8df819410cb0434a666be53f671fff75f68843d76f6  decoders-r180/draco/draco_wasm_wrapper.js
1cb16222708d6c44d20bfdd6b512ea968f3a71f4d0b2f43b27cd2476349845a0  gsap-3.13.0/CustomEase.min.js
96c01b81f44a3290e2b4532f55e2c9534b2adc43273a19f3756b2cb41f0fd0b6  gsap-3.13.0/gsap.min.js
308219390e5e3b84cda0c481e70caa9820883ae10bda44e6e9a149a81aac4b3f  gsap-3.13.0/ScrollTrigger.min.js
bfe119ea4fd413f5f7ca3fcd63adb0c4a073ed39daa2fe7d3e6b769e21272601  three-r180/LICENSE
61ba0df005b05991361d040d8ff670e1aadfd0ce7aeebd1fdb0725957a8957de  three-r180/three.core.min.js
e2b5ee6bccd38fd6d8a2428546b83c5f2426d84b152ef82be8055556e3b40eb6  three-r180/three.module.min.js
c20f0b4677f6128a138d7152b85cbef9091f4f45cdfa05adca04d40c1697c7ae  three-r180/addons/environments/RoomEnvironment.js
c1b7c9bd2cddff2e3f3a0723f618a3d364a47450e3d25771d21faed88410bec8  three-r180/addons/geometries/RoundedBoxGeometry.js
f40c491f6c44dde511268121f778a0050e73b1a15fd844c1ae2c78c73213eafc  three-r180/addons/libs/ktx-parse.module.js
5cbf818e842628a4464e748594a6deae18ceddda3c2f541e7b3a0ff5fc7611e2  three-r180/addons/libs/zstddec.module.js
7a4a51c694a6c9f983be452cc82b365e69ce08424654e3f245b4115e6efef258  three-r180/addons/loaders/DRACOLoader.js
67ac5551fdafa6e349bd80c8f8e5e39c136d6b2fb1ad647db9abb21dc86f9e4a  three-r180/addons/loaders/GLTFLoader.js
d7053cfc4019f520335ae07e0fe82b4ef5a66b6766e8b253d066616184995e89  three-r180/addons/loaders/HDRLoader.js
c43052b95310199d50935bdc41fcd0fc347f25eac3b4f0245e6e4de1ef6e1d93  three-r180/addons/loaders/KTX2Loader.js
6c08f9c441040a61a188ad7711078da4df48f8c5ac3b3725dd6f10ac9ff81162  three-r180/addons/loaders/RGBELoader.js
cc35c01c793cd17ccded7bc8142abffd3ce0d60dd6de8d5d216983bd05aee262  three-r180/addons/math/ColorSpaces.js
fda7e946b8e0b5ab39b779206589e7a1079a22eb24efb89d7223e03fdfb1f751  three-r180/addons/utils/BufferGeometryUtils.js
5ac7095fd566bc9ae48376055fd66edf27cb9ebbf9e1269dc206bfd4933ae9eb  three-r180/addons/utils/WorkerPool.js
```

(`gsap-3.13.0/LICENSE.txt` and this README are project-authored, not vendored.)
