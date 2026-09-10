# M7 — pre-implementation audit

Approved baseline: `046430847448206cfc58ce84758d9410121a97d3`, clean local
`m6-6-1-idle-return-hotfix`. New worktree `m7-ocean-glass`, branch
`milestone-7-ocean-glass-integration`. No remote mutation authorized.

## Source map

### Review-protocol ordering correction

The local approved checkout, source, installed APIs and baseline were inspected
before editing. The standing protocol's *public browser inspection first* step
was missed: the live audit and final reread of the September 7 documents happened
late in this turn. This is an ordering deviation, not a claim that the published
release was used as the implementation baseline.

Public browser audit: Pages reached `ready`, animated, and logged no errors.
Assets: `index-Du7wn8Xk.js`, `index-DpyDdchG.css`. Public main and latest successful
[Pages workflow 34182837955](https://github.com/Denoax/pelagic-jellyfish-webgl/actions/runs/34182837955)
identify `a2ed3bc89c700ba5c792ecac19747939e9f09b8d` (M4 publication,
2026-09-08). The unauthenticated legacy Pages-build endpoint returned 404;
workflow identity is the available deployment evidence, not an embedded HTML SHA.
Actual browser evidence is `../m7-evidence/public-audit/`.

The September 7 documents are absent from the approved baseline tree and exist
as untracked user files in the older `site` worktree. They were read there, not
copied, staged or overwritten. Their scene-color / single-renderer direction
matches the verified local implementation. Approved M6.6.1 remains authoritative.

`App` owns useIdleScreen; enabled only after HeroScene ready and without reduced
motion. HeroScene keeps its world in one mount effect. It uses r175
WebGPURenderer (`three/webgpu`) with the validated WebGL2 backend. Production
MRT bloom is disabled; direct rendering and procedural tissue emission remain.

BubblePassage owns LiveOceanLens. Its single drawing-buffer-size RGBA16F target
has a depth24 texture and renderer.samples MSAA. The main scene renders once to
this clean target, then PostProcessing renders one fullscreen optical output.
Thermal shimmer and up to six bubble slots sample this same image, not each
other. Transparent animals contribute color but not meaningful transparent
depth; existing virtual-depth approximation remains. If neither thermal nor
bubbles are active, rendering bypasses the optical target. Resizing follows
actual drawing-buffer dimensions including adaptive DPR.

Legacy IdleScreen prepares IdleGlassScene after 2.2 s quiet time. It creates a
SECOND classic WebGLRenderer/context, separate canvas, two fixed low-resolution
RGBA16F state targets (RGBA8 fallback), and two canvas clock masks. No additional
full-resolution idle target is explicitly allocated. Its independent rAF loops
continue between visits but normally skip rendering; a minute refresh can draw
even outside idle. While active, up to three 60 Hz simulation steps precede one
transparent glass draw. This glass shades its OWN field, not live ocean color.
CSS opacity fades this separate canvas for 3 s in / 2.6 s out. The semantic main
element fades; HeroScene is a sibling and continues rendering/animating below.
This explains visual layering rather than genuine refraction/continuity.

useIdleScreen accepts pointer movement without dismissal; pointerdown/touch or
Enter/Escape/Space dismiss. Current listeners are passive and bubbling: M7 must
consume dismissal before camera/animal handlers. Hidden currently dismisses and
reschedules on return. Main ocean hidden frames consume Clock delta without
simulation. Camera ViewController ignores idle wheel, but pose/progress update
is not explicitly frozen by HeroScene; integration must freeze those calls
while keeping world updates alive. Never rebuild the camera controller.

## Planned integration, before runtime edits

One main renderer. Port clock field and persistent spring/advection state to
r175 node materials. LiveOceanLens owns this optional idle controller and folds
its result into the existing output. Reuse target; no new ocean render or
full-resolution color copy. Two low-res simulation targets only. Reuse canvas
typography as shape data, not captured ocean pixels. All color samples come
from clean M3 source; combined optics are approximate, not recursive nesting.
First gate: clock on/off in this path, one context, same world/pose, no errors.
Only after that gate: persistent liquid/topology/choreography improvements.

## API verification

Installed Three is exactly 0.175.0. Its ViewportTextureNode uses
copyFramebufferToTexture; unnecessary here because M3 already owns clean color.
MeshPhysicalNodeMaterial has transmissionNode/thicknessNode, but introducing
its separate transmission handling is unnecessary and risks transparent depth.
Use existing texture/uniform/Fn/PostProcessing + MeshBasicNodeMaterial APIs.
No renderer/version/framework change.

## Baseline checks

Production build PASS (existing chunk-size warning); 107/107 Node tests PASS.
Approved motion: 720 frames/24 checkpoints exact. Default animal: 240 frames/8
checkpoints exact. Baseline logs `/tmp/m7-baseline-*.log`.
Browser baseline entry/exit recorded in `../m7-evidence/baseline-idle/`.

## Primary reference mechanisms (2026-09-10)

- [Shader/Codrops](https://tympanus.net/codrops/2026/09/08/building-an-infinite-liquid-glass-grid-with-three-js-webgpu-and-tsl/):
  implicit boundary → thickness → central-difference normal → refracted source.
  Their source is card video, ours is real ocean. No grid, videos, XPBD cloth,
  composition or implementation copied. One optical output remains the target.
- [Apple WWDC25](https://developer.apple.com/videos/play/wwdc2025/219/) and
  [announcement](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/):
  contextual clarity and restrained content-dependent optical response, not UI
  recreation. Test bright tissue and dark basalt without exposure changes.
- [Evan Wallace](https://madebyevan.com/webgl-water/) / [source](https://github.com/evanw/webgl-water/blob/master/water.js):
  persistent height state and spatial gradients. Do not transplant pool,
  caustics, renderer or assets. Existing original spring field is sufficient.
- [Pavel Dobryakov](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation):
  ping-pong state and localized input; do not add pressure/Jacobi passes.
- [FluidGlass](https://github.com/chiuhans111/fluidglass): behavior reference only;
  no license granted for source reuse. No code/shader/assets imported.
- [Inigo Quilez smooth minimum](https://iquilezles.org/articles/smin/): page
  unavailable to web reader; do not claim live inspection. Smooth implicit
  unions can connect fields without rebuilding topology.
- Current [viewport](https://threejs.org/docs/pages/ViewportTextureNode.html),
  [physical node material](https://threejs.org/docs/pages/MeshPhysicalNodeMaterial.html),
  [refraction demo](https://threejs.org/examples/webgpu_refraction.html) reviewed
  as direction only; installed r175 source determines compatibility.

Acceptance: actual moving silhouettes bend through clock, persistent recovery,
continuous neck/merge/pinch, no ghost digit crossfade, bounded edge lookup,
single context/scene render, unchanged non-idle source/quality, repeatable
lifecycle and capture-free performance evidence. Browser reference observations
are recorded separately from the source-derived mechanisms above.

## Architecture gate result

`../m7-evidence/architecture-gate/`: actual browser entry, ten-second settled
clock and exit. NVIDIA RTX4070 WebGL2, 1280×900 buffer, DPR1. Exactly one
successful graphics context (the second DOM canvas is the existing 2D camera
debug overlay, not an idle renderer). Zero browser errors. Same world object,
same Deep progress/position/quaternion, no activation on Enter dismissal.
Sanctuary geometry visibly bends through the clock. Gate one passes technically;
fade-only reveal and static shape are intentionally NOT final M7 art approval.

Fresh reference captures: `../m7-evidence/references/`. FluidGlass responds with
stretched/split digit boundaries; too many droplets/metallic edges for Pelagic.
Evan's pool renders and shows strongly displaced underwater sphere/tiles.
Shader's demo returned its branding and dark canvas but no cards in the captured
interval, without reported console errors: its motion is NOT visually verified.
