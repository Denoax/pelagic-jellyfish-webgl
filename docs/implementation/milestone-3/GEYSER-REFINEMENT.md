# M3 thin-shell / structured seep refinement

Status: **PARTIAL**, not artistic approval. Starting local SHA
`b3f1c9b4a82bf8d12394c29502c1f633390d27f5`, branch
`milestone-3-bubble-passage`. Preserve the accepted renderer/refraction, M1/M2,
camera, seabed and idle. No push, merge, deployment or Milestone 4.

## Fresh audit and references

The pre-edit browser capture is `/tmp/pelagic-m3-geyser/before/motion.mp4`.
At 1280×900 the former event shows sparse, detached glossy ovals, a centrally
concentrated specular spot and little source structure. Technical optics are
working; the presentation lacks the density, duration and thin interface asked
for. Three audit steps: approach is too inconspicuous; peak is weak/scattered;
return to calm is healthy and must remain finite. No DOM/accessibility redesign
is in scope; visual evidence does not establish accessibility compliance.

The Product Design audit guidance informed fresh capture-first comparison. Its
in-app browser skill/tools are unavailable here; the project's existing actual
Brave/CDP evidence path captures NVIDIA WebGL2. No Playwright was used.

| Reference / exact primary source | What was actually studied | Principle / limitation |
| --- | --- | --- |
| [Allen White — Bubble Shader Experiment](https://dicewrenchdesigns.artstation.com/projects/O29bk) | Author's description; actual browser attempt hit human verification. Motion NOT accessible; requested user clips. | Edge/reflection/refraction hierarchy, view-dependent squash and wobbly undersides inform direction, not an observed motion claim or copied billboard shader. |
| [Maggie Brown — Various Bubble VFX](https://www.artstation.com/artwork/GXR8ma) | Author describes blue Fresnel plus normal distortion and three stream variants. Actual browser hit verification. Fast/slow/environment videos NOT observed. | Separate stream/environment rhythms and understated blue edge language; primary motion comparison remains pending. |
| [NOAA — Atlantic methane bubbles](https://oceanexplorer.noaa.gov/multimedia/video-shorts-ex1302-bubbles/) | Actual [21-second video](https://oceanexplorer.noaa.gov/wp-content/uploads/2021/03/ex1302-bubbles.mp4) in browser; motion sequence inspected. | Tight lower stream, imperfect packets, coherent rising direction, divergence with height, ample open water alongside. |
| [NOAA — Seascape Alaska expedition](https://oceanexplorer.noaa.gov/expedition-feature/okeanos-seascape-alaska-ex2306-features-summary/) | Actual [Chatham seep video](https://oceanexplorer.noaa.gov/wp-content/uploads/2024/01/dive14-seep-1280x720-1.mp4), browser segment 3–13 seconds. | Concentrated lively foreground plume and much finer distant streaks. Distinct concentrations, not uniform fog; some larger bubbles show irregular shapes. |
| [NOAA — Bubble Plumes](https://oceanexplorer.noaa.gov/multimedia/explorations-20cascadia-seeps-logs-sept29-media-plumes/) | Primary page is an image/acoustic-plume reference, not optical motion footage. | Source-localized columns. Do not present sonar as a bubble-material motion study. |
| [RealtimeVFXStore collection](https://forums.unrealengine.com/t/realtime-vfx-store-bubbble-vfx-collection/2721595) / [video](https://www.youtube.com/watch?v=OSU_eksU5Dw) | Author's description; embed browser returned player error 153. | Mixed speed/wobble and rising/floating variants are source-based direction; not a successfully watched demo. No store assets imported. |
| [Fusion CI — Underwater Impact Splashes R&D](https://vimeo.com/12992219) | Author's process description; Vimeo player blocked by verification. | Grouped release and breakup into buoyant swarms, not projectile context. Motion unavailable; no fluid solver imported. |
| [Three.js physical transmission](https://threejs.org/examples/webgl_materials_physical_transmission.html) | Actual rendered browser view and clip: background detail survives the transmissive form; local bright reflections outline it. | Separate transmitted scene from edge light; avoid tinted opaque alpha interiors. Not an underwater gas IOR template. |
| [Three.js node transmission](https://threejs.org/examples/webgpu_materials_transmission.html) | Actual rendered browser capture, same glass geometry/background. | Node-compatible physical material is real, but no substitution for the shared approved buffer. Current example is not r175; installed `MeshPhysicalNodeMaterial` transmissionNode/thicknessNode APIs separately checked. |
| [Three.js refraction](https://threejs.org/examples/webgl_refraction.html) | Actual browser view/clip of optical box/object demonstration. | Continuous scene-edge bending; not a bubble generator or a composition to copy. |
| [Drei MeshTransmissionMaterial](https://github.com/pmndrs/drei/blob/master/src/core/MeshTransmissionMaterial.tsx) | Primary implementation interfaces: shared buffer, transmission sampler, thickness, distortion, temporal distortion and anisotropic blur. | Decouple optical thickness from body color; buffer ownership matters. No dependency or shader port; rainbow aberration/blur rejected here. |
| [threex.bubble](https://github.com/jeromeetienne/threex.bubble) | Author documentation and Fresnel/cubemap technique. | Reflection/refraction balance; legacy ShaderMaterial/cubemap architecture not ported. |
| [natTP droplets](https://github.com/natTP/droplet-flow-simulation) | Author technique report: instancing, cube-camera color, Fresnel reflection/refraction, water ratio. | Cheap shared instance data and transparent centre; cube-camera six-direction rendering and ramp physics are not adopted. |
| [jeantimex water](https://github.com/jeantimex/threejs-water) | Author's Evan Wallace port documentation and ray/pool optical approach. | Optical continuity against scene detail; no pool solver/scene imported. |
| [WaterThreeJS](https://github.com/achrefelouafi/WaterThreeJS) | Author's HDR scene-color/depth pipeline, Schlick Fresnel and Beer–Lambert water absorption description. | Absorption belongs to water distance, not uniform dark bubble fill. No ocean rewrite or extra volumetric passes. |
| [Wu & Gharib, Caltech (2002)](https://authors.library.caltech.edu/records/jkjy2-gb368) | Primary paper abstract and documented shape/path findings. | Smaller near-straight motion versus selected larger zigzag/spiral behavior. This does NOT establish a universal rule that larger bubbles rise slower: that requested speed hierarchy is deliberate art direction. No CFD claim. |

All third-party media remain research-only in `/tmp/pelagic-m3-geyser`; no assets,
code, shaders or textures were copied into runtime. Inaccessible videos must not
be described as a completed side-by-side primary motion review.

Post-iteration reference follow-through: the [threex live demo](https://jeromeetienne.github.io/threex.bubble/examples/basic.html)
was successfully captured in motion. Moving bubbles strongly invert/reflect
the park environment; their opaque-looking reflected upper lobes are a useful
warning, not a look to transfer into dark water. The [natTP live demo](https://nattp.github.io/droplet-flow-simulation/)
also rendered: small reflective/transmissive droplets slide down the ramp and
collect at its lower edge. The thin bright boundary survives at small scale,
but the distant droplets are not a large-bubble underside-motion reference.
The [jeantimex live pool](https://jeantimex.github.io/threejs-water/) rendered
cleanly with a bent grid and sphere at the water interface; the initial passive
clip is nearly still, so it is optical evidence, not a tested pointer-flow demo.
An additional actual CDP pointer sweep then produced propagating surface
ripples, moving caustics and bending of the submerged sphere/grid, followed by
recovery (`water-interaction/motion.mp4` in the research-only temporary root).
This validates the reference's dynamic optical continuity; its pool, caustic
solver and water-interaction system were not imported into Pelagic.
These supplemental checks caused no additional runtime edits.

## Architecture and iterations

First iteration `3c02d50`: 384 ambient / 5 hero slots, three fixed world-space
source cores, packet release, size-dependent buoyancy/wandering and shared
ellipsoid/shear shape vocabulary. Broader 20–56% existing journey envelope,
4-second rise / 14-second full temporal density / 5-second taper, finite at rest.
The source cores are anchored once per traversal, not moved with the camera.
Hero births still compose against visible real tissue, never move an animal.

Visual self-review rejected this first draft: it had clearer columns but still
too much apparent dark mass. The subsequent crescent pass narrows the ambient
Fresnel power from 4 to 9, removes the central dot, uses additive thin edge light
so ambient films cannot darken the underlying tissue, and fades very close hero
optics before they exceed 20–30% viewport width. Hero centre is the live sampled
scene, not a filled material. Its optical shape tracks the same bounded shear.

Shared full-resolution scene-color/depth target and one output pass remain.
No per-bubble target or scene render, renderer migration or Three upgrade.
Overlap remains back-to-front nearest-priority sampling of the original same-frame
ocean, not recursively warping previous heroes. Transparent per-object depth,
offscreen color, true gas total internal reflection and physical nested optics
remain approximate exactly as in the accepted M3 foundation.

Final runtime checkpoint: `3b395a1548109245f0da7f7ccb6cbe6a334de23e`.
The last iteration broadens sub-pixel small rims (power 3.5 versus medium 7)
without adding interior fill. Medium hero shape now uses the same modest
deformation as medium ambient bubbles; only large bubbles get the larger
squash/shear/wander amplitude. Optical tier no longer overrides size class.

## Review findings — why this is still PARTIAL

- **Material:** central white dots and alpha-darkened ambient interiors are
  removed. Thin asymmetric silver/cyan edges are better, but some close medium
  bubbles still read as glossy outlined ellipsoids against empty dark water.
  This is a perceptual limitation even though additive blending cannot darken
  the underlying scene. Not all large silhouettes reach the supplied VFX bar.
- **Motion:** small, medium and large now have different deformation/rise
  character, individual phases and multi-frequency wandering. Analytic
  ellipsoid/shear is still less rich than a deforming asymmetric underside.
- **Plume:** three fixed source cores, negative space and upward packets are
  clearly visible. They are not a uniform random box. However the existing
  moving camera leaves many fixed-core particles outside the frame: pool count
  is not on-screen density. The peak is stronger than b3, but not consistently
  the memorable, dense cinematic encounter requested.
- **Clarity:** the main animal and appendages remain legible; this improvement
  was not bought with opaque fog or reduced ocean quality.
- **Refraction:** the natural crossing comparison visibly bends the live bell
  contour and pink anatomy. Turning only optics off restores that silhouette.
  This confirms the accepted technical payoff remains. One controlled natural
  crossing is stronger evidence than a claim of several consistently beautiful
  crossings throughout every traversal; that artistic consistency remains open.
- **Reference gate:** actual NOAA and Three examples were inspected, but Allen
  White/Maggie Brown primary videos and supporting Fusion CI were inaccessible.
  The requested complete side-by-side primary motion review is NOT complete.

These are explicit remaining goals, not approval requests to start a new
milestone. No renderer limitation blocks additional focused visual work.

## Runtime and budget

Only `src/scene/glass/BubblePopulation.js`, `BubblePassage.js`, and
`LiveOceanLens.js` changed at runtime. Scoped `AGENTS.md`, focused tests, the
existing browser evidence driver and this documentation are supporting changes.
No animal, connected-ocean, camera, seabed or idle runtime file was edited.

The event spans 20–56% native scroll, with a 4-second temporal build, 14-second
full-density interval and 5-second taper. Spatial and temporal envelopes combine;
fast scrolling may shorten the event. Emission stops after 23 seconds even if
the visitor stays still. B replays the existing journey through native scroll;
it is a development inspection control, not new camera choreography.

Desktop recorded event: maximum **384 ambient / 5 heroes**; time-weighted
averages **295.76 / 3.56** over 22.19 seconds with envelope >0.01. These are
active pool/draw counts, NOT frustum-visible counts. The opening and settled
ending have zero active bubbles. Portrait has an explicit lower ambient birth
rate (48 versus 82/s), not a lower ocean DPR or quality setting.

One ambient instanced draw is added during the event; none during calm. The
same ocean scene renders once into one shared RGBA16F/depth24, 4×MSAA target,
then one output compositor evaluates up to five optical slots. There are no
extra scene passes/targets compared with b3. Logical target attachment storage
is about 66 MiB at 1280×900, excluding driver allocation/padding and the
renderer-owned output target. No per-bubble scene rendering or allocation.

## Validation and measured cost

Baseline: exact b3 detached worktree `/tmp/pelagic-m3-geyser-baseline`, port 5186.
Candidate: local working repo, port 5178. Before edits: **41/41 tests**, both
animal parity checks and production build passed. Candidate: **44/44 tests**,
both parity checks and production build passed. Missing generic `npm test` is
not counted as a suite. All existing test files ran with
`node --test tests/*.test.mjs`. Existing npm-config and Vite >500 kB chunk
warnings remain; no new build failure.

NVIDIA RTX 4070, Brave/Chromium 152.0.7977.76, ANGLE OpenGL ES WebGL2 backend
inside Three r175 WebGPURenderer; 1280×900 viewport and drawing buffer, DPR 1,
unchanged quality/adaptive setting and production bloom off. Each uncaptured
sample is 30 seconds / 1800 completed-frame intervals after six-second warm-up,
state setup and a further one-second settling period. Calm holds simulation/TSL
time 9; peak scrolls at 17.5 and holds time 26 at 35% journey.

| State | b3 median / p95 / max ms | Candidate median / p95 / max ms | >50 ms before / after |
| --- | --- | --- | --- |
| Calm | 16.7 / 17.6 / 20.1 | 16.7 / 17.4 / 18.4 | 0 / 0 |
| Peak | 16.7 / 17.0 / 18.2 | 16.7 / 17.3 / 18.4 | 0 / 0 |

These are **async render-completion intervals, not GPU timings**. The 60 Hz
cadence is a ceiling: this does not prove equal GPU cost. Camera position,
progress, FOV, phase and quality match; the existing variable-step environment
has small trajectory/target differences (up to ~0.03 world units in the logged
actors and ~0.003 in target), so this is not bit-identical pixel state. Peak
held population is 127/3 before versus 339/5 after. Screenshot/movie capture
was disabled during these measurements. Held simulation produces no controller
CPU samples: that absence is NOT reported as zero cost.

An additional **uncaptured moving 44-second run** uses the same injected native
scroll schedule in both builds (15→62% over 34 seconds after a 3-second prelude),
not the different old/new B replay durations. Baseline median/p95/max:
**17.0 / 20.3 / 48.5 ms**, 0 intervals >50 ms, 2640 intervals. Candidate:
**17.4 / 20.2 / 59.4 ms**, **1 interval >50 ms**, 2639 intervals. The initial
render warm-up is six seconds; this traversal includes first entry into optics,
so its maximum is not a prewarmed-optics steady-state maximum. The stall's
cause is not isolated and must not be dismissed as noise or claimed fixed.

Bubble population + matrix/controller CPU instrumentation over that moving run:
baseline median/p95/max **0.0 / 0.1 / 0.6 ms**; candidate **0.1 / 0.2 / 0.6 ms**.
Zero is timer quantization, not a free controller. This includes calm frames,
not only peak work. The existing lens CPU hook yields no separate samples in
bubble mode; compositing cost is captured only in the whole-frame intervals.
No GPU timing was collected. Raw logs are under
`geyser-evidence/perf-{before,after}-{calm,peak,moving}/`.

## Actual browser evidence

All following footage is actual Brave/NVIDIA WebGL2 rendering, encoded from
timestamped CDP screencast frames at original speed, not generated imagery or
animated stills. Raw frame files remain in `/tmp/pelagic-m3-geyser`.

| Inspection | Evidence |
| --- | --- |
| Pre-refinement b3 passage | [Motion](geyser-evidence/before/motion.mp4), [sequence](geyser-evidence/before-sequence.png) |
| Complete refined passage, approach / peak / exit / calm | [Motion](geyser-evidence/final-tour/motion.mp4), [sequence](geyser-evidence/final-sequence.png), [states/counts](geyser-evidence/final-tour/bubbles.json) |
| Approach | [Frame 8](geyser-evidence/final-tour/passage-8.png) |
| Peak and thin medium/small rims | [Frame 16](geyser-evidence/final-tour/passage-16.png) |
| Exit / settled ocean | [Frame 28](geyser-evidence/final-tour/passage-28.png), [frame 36](geyser-evidence/final-tour/passage-36.png) |
| Natural live bell/anatomy crossing | [Motion](geyser-evidence/final-crossing/motion.mp4), [refraction on](geyser-evidence/final-crossing/matched-bubbles.png), [only refraction off](geyser-evidence/final-crossing/matched-ambient-only.png), [clear ocean](geyser-evidence/final-crossing/matched-clear.png) |
| Ambient-only stream inspection | [Motion](geyser-evidence/final-ambient/motion.mp4) |
| Narrow 900×900 | [Motion](geyser-evidence/final-narrow/motion.mp4), [peak](geyser-evidence/final-narrow/passage-16.png) |
| Portrait 390×844 | [Motion](geyser-evidence/final-portrait/motion.mp4), [peak](geyser-evidence/final-portrait/passage-16.png) |
| Equivalent old/new 35% / time-26 material frames | [Old](geyser-evidence/matched-before/matched-bubbles.png), [new](geyser-evidence/matched-after/matched-bubbles.png) |

The crossing still triplet holds both simulation and shader time in one browser
session. The before/after *tour* sequences use their respective old/new event
timing and therefore are contextual comparisons, NOT matched-phase stills.
The separate time-26 old/new still pair uses equal camera position, FOV, viewport,
DPR and simulation/shader time; the small inherited trajectory differences
described above remain. Bubble births/distribution intentionally differ. Small
and medium rims can be inspected in the same full-resolution frame; the natural
crossing triplet isolates a hero. This is not a matched individual-bubble mesh
turntable, and no rare-large-only matched still is claimed.
Portrait/narrow show no observed flipped sampling, rectangular target edge or
black frame. Portrait clips more source columns and remains a weaker plume;
this is browser emulation on the desktop NVIDIA device, not mobile validation.

Browser lifecycle checks: [repeated traversal / resizing / suspension](geyser-evidence/final-lifecycle/lifecycle.json)
and [idle return / click](geyser-evidence/final-idle/lifecycle.json). Five
exit/re-entry cycles each drained to zero and re-emitted within fixed capacity;
the final no-input observation ended at age 23 with zero active bubbles.
1280→900→390→1280 resizing while active completed without exceptions. A real
click raised activation count from 0 to 1. Tab visibility was actually hidden;
2 seconds in background advanced the simulation only 0.136 seconds including
the observed foreground recovery. The separate idle check entered, dismissed
with Escape, accepted a click, then recovered from 1.8 seconds hidden with only
0.097 seconds of simulation advancement. No browser errors in these runs.
This validates bounded recovery, not heap profiling or forced graphics loss.

The freshly built local production preview was opened with the bubble/replay
query deliberately supplied. It reported release `milestone-2`, rendered via
NVIDIA WebGL2 and exposed **none** of the bubble/lens/specimen development
controllers. The browser assertion passed with zero errors: [capture metadata](geyser-evidence/production-guard/capture.json).
This was a local build check, not a GitHub Pages deployment.

## Local review / unchanged scope

The existing dev server is running on port 5178. Open
<http://127.0.0.1:5178/?bubblePassage=1&bubbleReview=1&renderer=webgl&idle=300>.
Press **B** to replay; wheel input cancels the guided native scroll. Without the
review query, the normal local artwork remains unchanged. For reproducibility:

```sh
cd /home/mani/dev/jellyfish-studio/site
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
npm run dev -- --host 127.0.0.1 --port 5178 --strictPort
```

Only the runtime checkpoint's three glass files changed. M1/M2 byte/parity
checks passed; no camera, seabed or idle implementation was edited. Public main
was rechecked as `a0501c21f8c782887bf6a5e1257e955ada41b678`; no remote mutation
was issued. Original root AGENTS change and untracked research remain unstaged.

Real NVIDIA WebGL2 was exercised. Candidate hardware WebGPU, software SwiftShader
WebGPU, AMD/Intel, Safari, Firefox, physical mobile and forced GPU/context loss:
**NOT TESTED in this refinement**. The known legacy full-ocean WebGPU problem
is not claimed fixed. No push, merge, deployment, Pages modification, Milestone
4, full idle glass, camera or seabed redesign occurred.
