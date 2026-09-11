# Source-verified architecture before Asset 2 edits

Baseline `bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`; installed Three **0.175.0**,
Vite 6.4.2, React 19.2.0. No version or framework change planned.

## Ownership and composition

`HeroScene.jsx` constructs one Three `WebGPURenderer`, initialized by Aurelia
App. Its actual backend in the 1672×941 baseline capture is **NVIDIA RTX 4070
ANGLE OpenGL WebGL2**. `forceWebGL` uses explicit query, Brave detection and
release selection. Requested WebGPU is not proof of actual WebGPU.

Aurelia App owns the scene and perspective camera. Its normal direct update
calls the M3 `LiveOceanLens.render` callback when available. M3 either renders
directly or renders the SAME scene ONCE into RGBA16F linear-sRGB color with
unsigned-int depth and renderer sample count, then its output quad. M7 attaches
an alternative output node to that same target, not another ocean/context.
M7 owns two bounded liquid-field targets and clock textures; these are locked.
M3 resizes its target from actual drawing-buffer dimensions before use. No
current-frame read/write feedback. Transparent animals use existing material
ordering and depth-write policy; opaque depth is not a full transparent mask.

Inherited MRT bloom exists in Aurelia but is **not used** in normal production
direct rendering (both backends). Apparent tissue glow is the approved tissue
material. Exposure is 0.94, output sRGB. Do not change them or claim bloom cost.
Default DPR cap is 1.25 desktop / 1 mobile; existing specimen inspection disables
adaptive reduction. Equal-quality QA uses 1× DPR, actual buffer checked.

## Background and geological shading

`app.scene.backgroundNode` is initially `Background.fogFunction`.
`Background.waterRadiance` and `waterFog` ALSO serve approved animals. They
must stay byte-unchanged. New background presentation can replace ONLY the
scene background node; new geological extinction belongs only in the
environment material graph. No shared animal fog/exposure changes.

`PelagicEnvironment` owns sanctuary plus historical distant school and
particle layers. M4 hides/replaces historical school through PopulationDetail;
M2 hides historical particle layers/veil/Aurelia plankton, replacing them with
OceanSnow. Never tune hidden legacy layers as if they were visible production.

`Sanctuary` builds immutable basin, shelves, pillows, banks, chimney, secondary
spires, accretions, 231 meso beds and original four shelf archetypes. It owns
geometry/material disposal. Existing geometry/layout is read-only.
`mineralMaterial` is a **MeshBasicNodeMaterial** with triplanar photographed
rock luminance, derivative surface-gradient relief, mineral pigments, cavity
approximation and analytic environmental illumination. It has no PBR specular
BRDF: setting roughness alone cannot change this material. Existing texture is
the Poly Haven rock_07 diffuse atlas, sampled in a valid photographed patch.

`geologicalWater` already mixes near/far extinction with directional water.
It is not a camera constraint. New analytic extinction must remain opaque
environment-only and cannot be a global final-color multiplier.

## Actual bounds (computed once from baseline opaque solids)

- `FLOOR_Y` / requested `DEEP_FLOOR_Y`: **−15**.
- Basin dimensions: 192×192, centered horizontally at **(0, −28)**.
- Opaque world AABB: min **[−96, −19.04996109, −124]**, max
  **[96, −2.94500065, 68]**.
- AABB center: **[0, −10.99748087, −28]**.
- Horizontal max-corner radius **R = 135.76450198781714**.
- 18 opaque batches, 18 geometries, 7 materials; proxy bounds excluded.
- Hero landmark: x −2.4, z −24, nominal height 12. No relocation permitted.

Important: R is a corner radius, not the shortest distance to the square basin
edge (96). Radial falloff alone cannot conceal that nearer edge. Combine the
specified smooth radial envelope with opaque footprint/distance extinction;
do not misreport R as a small core radius or clamp Explore.

## Currents, particles, animal illumination

M2 `ConnectedOcean` observes tissue motion/pulses and feeds CurrentField and
OceanSnow. OceanSnow has 64/320/400 particles at desktop, existing fixed-step
world advection/recycling and local activation alpha. Simulation is read-only;
an environment-only material factor can modulate its existing presentation.
72 BenthicSediment points use existing current sampling; leave their state and
all plume/thermal behavior unchanged. Ten benthic pinpoints and five colonies
remain physically anchored and unchanged in count/layout.

M6 `AnimalLight` is currently **ONE** pooled, hysteretic, faded contribution,
not four slots. It reads animal position/presence/feature/activation, writes
only sanctuary uniforms, and never writes to animals. Reuse it first; do not
invent nonexistent multi-light infrastructure. Its falloff radius is 13 with
additional inverse-distance attenuation. Texture/uniform state is reused.

## Fixed comparison pose

`ASSET2_QA_POSE`: approved **Drift (B), progress 1**, FOV53, aspect1672/941.
Position **[0.3, −3.6, −8.2]**; quaternion
**[−0.0784322097552987, 0.026096253512354825, 0.0020538196931502704,
0.9965757150614236]**. Existing camera selection/seek API only; no track edits.
Seed7183; still capture at existing specimen clock hold14; direct render,
bloom off, DPR1, actual1672×941. Autonomous actors differ from drawn reference;
do not change/reposition them to game whole-frame metrics. Matched runtime
baseline/candidate use the same pose and animation setting.

## Baseline validation

All130 Node tests pass. Production build passes with existing chunk-size and
npm-global-config warnings. Both approved-motion (720frames/24checkpoints) and
default-animal (240frames/8checkpoints) parity scripts pass exact geometry/state.
Local-only baseline server5221; candidate5222. No live website modified.
