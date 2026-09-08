# M4.1 — performance recovery with approved visuals locked

Status: **READY FOR VISUAL REVIEW**. This is local work, not a published release.

Approved appearance is preserved. Population CPU work is materially lower;
the reproducible first-refraction hitch is moved into startup. This is not a
claim that every frame-time percentile improved: the second moving-camera run
and the distant scene have worse p95 values, reported below without omission.

## Identity and scope

- Repository: `Denoax/pelagic-jellyfish-webgl`.
- Exact approved M4 baseline: `ece7cc0f26acbd95b8386a02c3e84f2b5efc4f47`.
- Branch: `milestone-4-1-performance`.
- Frozen runtime: `907ba3c` (evidence driver `e439826054abd918595b057b18a314126462f08b`).
- Baseline worktree: `/home/mani/dev/jellyfish-studio/m4-1-approved-baseline`.
- The existing modified `AGENTS.md` and untracked September 7 research belong
  to the user and are not part of these commits.
- No main merge, push, deployment, Pages edit, or later milestone.

The current public release descends from M4 through publication commit
`a2ed3bc89c700ba5c792ecac19747939e9f09b8d`. It is not substituted for the
explicitly approved development baseline. Local M4.1 keeps the baseline's
development-only population/bubble switches.

## Profiling findings before optimization

Real NVIDIA WebGL2 CPU and allocation profiles were collected in the approved
worktree before candidate measurements. Profiles instrument animal methods and
sample Chrome's CPU/heap; clean performance tests run without those probes or
screen capture. Inclusive method totals overlap and must not be added together.

- Oral-spine contact separation is the largest sampled CPU consumer. It stays
  unchanged: no relaxed constraints, lower cadence, or cheaper visible physics.
- Visible tube sampling repeatedly computes the same taper powers and ring
  trigonometry. Those terms depend on fixed topology, not animal motion.
- Generic indexed normal refresh spends substantial time in buffer accessors,
  temporary vectors, and normalization. Its exact r175 arithmetic can operate
  directly on the existing Float32 buffers instead.
- Mantle sampling repeatedly computes fixed polar/azimuth terms.
- LOD importance itself is small: approximately 0.03 ms/frame in the school
  instrumented profile. It is not the principal bottleneck.
- Existing transitions already morph one mesh, not two transparent animals.
  They sample two grids temporarily, but do not double the animal draw or
  opacity. Their 1.2-second duration and thresholds are preserved.
- Animal tier geometries, materials, simulation particles and vertex arrays
  already persist. No tier-geometry disposal or vertex-array replacement was
  observed. The close profile observed no newly attached geometry/material.
- Lower-tier interpolation maps were still allocated lazily per animal on the
  first crossing. They are now shared by topology and prepared at construction.
- Hidden mesh sampling already sleeps. Hidden spines still consume CPU, but
  retain the approved state on return; this pass does not freeze or approximate
  them. Material updates are small and remain unchanged.

Resource counters identify **first observed scene attachments**, not constructor
calls. The school/moving profiles observed 1/3 additional non-tier attachments;
this is not evidence of repeatedly constructed LOD geometry. Sampled heap sizes
include collected allocations and profiling effects, not live retained memory.
The pre-created fleck pool attaches meshes lazily through `LivingAppendages.update`;
scene attachment is not resource construction. Dynamic GPU buffer uploads remain
part of the installed renderer, not newly allocated animal meshes.

### Attribution of the long hitch

The original M4 74.4 ms interval occurred **10.1226 seconds** into the moving
measurement. A fresh clean approved-M4 run reproduced a **65.5 ms** interval at
**10.1002 seconds**. A separate traced run reached **70.1 ms**. This is the first
visible refraction pass, not an arbitrary LOD crossing.

- The trace's longest animation callback was 60.35 ms: 21.947 ms in its normal
  function and 38.392 ms in renderer microtasks. Its minor GC was only 0.242 ms.
  No major GC occurred during that trace.
- CPU samples around the same first passage resolve through
  `LiveOceanLens.render → PostProcessing.renderAsync → QuadMesh.renderAsync →
  getNodeBuilderState → build/generate/getNodeType`. They show first-use shader
  node construction, not repeated animal geometry construction.
- Separate WebGL probes recorded two program links/checks during the tour. The
  refraction program's synchronous `getProgramParameter` cost 12.2 ms in the
  baseline probe (17.8 ms in the sampler-only candidate probe).
- These are CPU/API wall durations, **not GPU timings**. The original historical
  run has no trace, so the matching phase and newly traced mechanism strongly
  explain its cause without claiming the historical timestamp itself was traced.

The fix prepares the existing bubble material and existing optical output during
startup, before `ready`. No alternative compositor is introduced. One extra
startup ocean draw and one output draw reuse the existing full-resolution,
RGBA16F/depth target and its unchanged MSAA setting. No new target or ongoing
pass is added. Renderer state is restored even on failure; disposal during
preparation stops subsequent draws. Simulation, camera and bubble clocks are
not advanced by this helper.

An intermediate warm-up incorrectly set the instance count to one. Matched
browser images caught missing ambient bubbles despite passing numerical animal
tests. Installed r175 selects its instancing shader using that count. The final
helper retains the real pool count, and the intermediate candidate's timings
are **excluded from final performance claims**. This is why image parity was
checked before accepting the stall removal.

## Exact runtime changes

| Source | Optimization |
| --- | --- |
| `src/scene/population/SurfaceLod.js` | Exact indexed Float32 normal accumulation; shared static mantle terms; topology-shared/prewarmed transition maps; reserve near membrane normal storage before rendering |
| `src/scene/population/TubeSampling.js` | Same approved tube equations and transported frame, with cached double-precision taper/ring terms and chain basis |
| `src/scene/population/PopulationAnimal.js` | Prepare caches once and call the exact tube sampler without allocating singleton chain arrays |
| `src/scene/population/PassageWarmup.js` | Prepare the existing instanced film and refraction programs once, with the real pool count and existing target |
| `src/scene/HeroScene.jsx` | Call preparation only for the opt-in M4 population/bubble path, then redraw the normal ocean before revealing the canvas |

There is no changed mesh density, shader, material, animation, simulation step,
visibility threshold, LOD duration, camera, water, bubble, idle, resolution,
DPR, quality policy, dependency, or renderer family. Three.js remains **0.175.0**.
The approved core `LivingAppendages` and anatomical contact solver are untouched.
All files under `src/scene/glass/` remain byte-for-byte equal to approved M4.
Normal runtime draw calls, transparent layers and optical passes are not reduced.

## Reproduction

```sh
cd /home/mani/dev/jellyfish-studio/site
node scripts/population-recovery-servers.mjs
```

- Approved baseline: `http://127.0.0.1:5188/?populationLod=1&bubblePassage=1&renderer=webgl&idle=300`
- Candidate: `http://127.0.0.1:5189/?populationLod=1&bubblePassage=1&renderer=webgl&idle=300`
- Native scrolling follows the unchanged journey; **B** runs the existing
  development tour. No new public inspection controls.

The two servers isolate Vite's mutable dependency cache while using the same
installed packages and bundling settings. Two initial harness attempts failed
because a shared cache and then a transformed generated dependency duplicated
TSL state; neither is counted as valid runtime evidence.

```sh
node scripts/population-recovery-suite.mjs profile before
node scripts/population-recovery-suite.mjs bench before
node scripts/population-recovery-suite.mjs matched-exact before
node scripts/population-recovery-suite.mjs motion before
# Repeat those four commands with "after" for the candidate.
node scripts/pack-population-recovery.mjs /home/mani/dev/jellyfish-studio/m4-1-evidence
node scripts/summarize-population-recovery.mjs docs/implementation/milestone-4-1/evidence
```

Do not run baseline/candidate browsers, screenshots/video encoding, builds or
tests concurrently with a benchmark. Raw captures and profiles are under
`/home/mani/dev/jellyfish-studio/m4-1-evidence`.

## Measurement contract

- CPU: Intel i5-14600K; memory approximately 62 GiB; GPU: NVIDIA RTX 4070.
- Brave/Chromium **152.0.7977.76**, actual ANGLE NVIDIA OpenGL ES 3.2 / WebGL2.
- Viewport and ocean drawing buffer **1280×900**, DPR **1** throughout.
- Approved production-direct rendering; inherited bloom remains disabled.
  The existing adaptive-quality policy is unchanged; actual buffer/DPR values
  are recorded before and after each run.
- Warm-up: 6 seconds after scene ready, then another 6 seconds at fixed scroll
  positions. Fixed scenes run 30 seconds; moving tour runs 44 seconds after
  the initial ready warm-up. Deterministic random seed is the same on both sides.
- Fixed progress: distant `.06`, bubble `.35`, school `.52`, close `.68`.
  Normal motion continues during benchmarks. Matched stills start with the
  existing `hold=26` fixed-step fixture from the first tick, change native scroll
  at simulation time 17.5 seconds, and hold both simulation and shader time at 26.
- Reported intervals observe completion of the actual async ocean render
  callback, not a separate rAF observer. They are **not GPU timings**.
- The existing population CPU bracket also includes connected-field update and
  specimen callbacks; it is not mislabeled as pure animal CPU. Separate method
  profiles expose animal-only inclusive costs with instrumentation overhead.
- Initial baseline evidence's `uncommittedSource` inadvertently described the
  driver checkout. The target URL/worktree was frozen at the clean approved SHA.
  The evidence driver now records the target source root explicitly.

## Before/after performance

Each cell is **median / p95 / maximum milliseconds / intervals >50 ms**.
These are render-completion intervals, **not GPU timings**. Raw intervals,
CPU brackets, source/backend identities and buffer sizes are retained in
[the machine-readable summary](evidence/performance-summary.json).

| Scene | Approved M4 | Final M4.1 |
| --- | --- | --- |
| Close encounter, 30 s | 17.8 / 21.4 / 23.4 / 0 | 16.6 / 17.8 / 24.7 / 0 |
| Moving camera, 44 s | 16.6 / 23.2 / 65.5 / 1 | 16.0 / 21.4 / 33.0 / 0 |
| School, 30 s | 16.7 / 19.3 / 25.5 / 0 | 16.7 / 18.9 / 22.0 / 0 |
| Bubble passage, 30 s | 16.7 / 19.1 / 25.7 / 0 | 16.7 / 18.4 / 26.4 / 0 |
| Distant population, 30 s | 16.7 / 18.2 / 28.2 / 0 | 16.7 / 19.2 / 25.9 / 0 |
| Moving camera, independent 44 s repeat | 17.0 / 22.0 / 66.0 / 1 | 13.2 / 26.8 / 33.5 / 0 |

The repeat used the same tour/settings, after motion capture and encoding had
finished. Its raw data are [before](evidence/repeat-before-moving/performance.json)
and [after](evidence/repeat-after-moving/performance.json). Completion cadence
varies with render duration and browser scheduling. In particular, the repeat's
lower median must not conceal its **4.8 ms worse p95**. Neither a universal p95
improvement nor a guaranteed locked frame rate is established. Both final
moving runs eliminate the reproduced >50 ms first-use hitch. The final
[instrumented WebGL tour](evidence/gl-after-moving/webgl-cost.json) records
**no program compilation/link/status calls during the measured tour**.

### CPU cost, measured separately

Clean population-and-field CPU bracket, **median / p95 ms per frame**:

| Scene | M4 | M4.1 | Median reduction |
| --- | --- | --- | --- |
| Close | 15.1 / 18.6 | 9.1 / 9.9 | 40% |
| Moving | 11.5 / 18.6 | 7.5 / 12.0 | 35% |
| School | 13.3 / 15.7 | 8.3 / 9.5 | 38% |
| Bubbles | 10.1 / 12.4 | 6.9 / 8.3 | 32% |
| Distant | 7.8 / 9.2 | 6.1 / 7.5 | 22% |

Animal-only method profiles are instrumented, inclusive **mean ms/frame**.
They are not interchangeable with the clean bracket above. The after profiles
predate startup preparation but contain the exact final steady-state samplers.

| Method | School M4 → M4.1 | Close M4 → M4.1 | Moving M4 → M4.1 |
| --- | --- | --- | --- |
| Total animal update | 14.893 → 8.835 | 17.398 → 9.578 | 12.941 → 8.038 |
| Tube sampling | 2.778 → 0.830 | 3.126 → 0.921 | 2.282 → 0.663 |
| Membrane sampling | 2.442 → 0.656 | 2.926 → 0.724 | 2.018 → 0.535 |
| Bell surface | 1.965 → 0.300 | 2.371 → 0.369 | 1.616 → 0.257 |
| Chain integration | 1.976 → 1.763 | 2.306 → 1.845 | 1.691 → 1.582 |

Per-tier school profile below includes hidden members of that tier. Sampling
combines tubes, membranes and bell surface; integration excludes the separately
called oral-spine contact solver. Rows/columns are inclusive, not additive.

| Tier | Animal update M4 → M4.1 | Chain integration | Surface sampling | Material response |
| --- | --- | --- | --- | --- |
| Near | 6.791 → 2.765 | 0.691 → 0.636 | 5.029 → 1.117 | 0.0048 → 0.0064 |
| Medium | 5.890 → 4.097 | 0.882 → 0.777 | 2.106 → 0.653 | 0.0171 → 0.0163 |
| Far/hidden | 2.213 → 1.973 | 0.403 → 0.350 | 0.050 → 0.016 | 0.0080 → 0.0070 |

Unchanged equations/cadence can have lower sampled integration time because
profiling overhead, JIT and surrounding workload differ. No simulation speedup
is attributed to a physics change. Full tier/visibility/transition breakdowns,
counts over time, CPU profiles and sampled allocation profiles are included.
Compressed `.json.gz` traces can be decompressed for Chrome DevTools/Perfetto.

### Counts and transparent work

All 22 animals remain present. The clean benchmark's final **near / medium /
far / hidden** counts are below; these are endpoint snapshots, not means.
Live motion is not paused during timing, so small phase differences can place
one animal on the other side of an unchanged threshold at the endpoint.

| Scene | M4 | M4.1 |
| --- | --- | --- |
| Close | 4 / 6 / 2 / 10 | 4 / 6 / 2 / 10 |
| Moving | 5 / 9 / 1 / 7 | 5 / 9 / 1 / 7 |
| School | 3 / 11 / 1 / 7 | 3 / 11 / 0 / 8 |
| Bubble passage | 2 / 10 / 1 / 9 | 2 / 9 / 2 / 9 |
| Distant | 1 / 8 / 3 / 10 | 1 / 8 / 3 / 10 |

The instrumented moving tour spans near **1–5**, medium **5–12 (M4) / 5–13
(M4.1)**, far **0–6**, hidden **6–13**, and **0–5** simultaneous transitions.
School spans near 3–4, medium 6–12, far 0–3, hidden 7–12 on both sides.
Close spans near 4–5, medium 3–8 / 4–8, far 0–3, hidden 9–12.

School median draw calls remain **178**, maximum **182**; close median is
175 / 176, maximum **181** on both sides. School/close have median **126**
visible transparent scene objects and maximum **127** on both sides. This is
an object count, not a per-pixel overdraw measurement. Exact held-state draw
counts/triangles agree (school 179 / 854,047; close 177 / 717,483; bubbles
180 / 866,137; distant 178 / 754,803). Refraction remains the same full-resolution
multisampled scene-color path; no transparent pass was removed to improve timing.

## Visual parity and motion

Twelve matched native-resolution frames cover four camera positions with normal
bubbles, ambient-only and clear-water debug settings. Maximum RGB channel error
is **1/255 in every pair**, affecting only **23–55 of 1,152,000 pixels**.
There are no masks, crops, alignment transforms or resolution substitutions.
Animal/camera/field/shader-time state agrees in the held fixtures. This is
strong image parity evidence, not a replacement for motion review.

| Matched scene | Approved M4 | M4.1 | Pixel comparison |
| --- | --- | --- | --- |
| Close | [Before](evidence/matched-before-secondary/matched-bubbles.png) | [After](evidence/matched-after-secondary/matched-bubbles.png) | [JSON](evidence/matched-after-secondary/parity.json) |
| School | [Before](evidence/matched-before-school/matched-bubbles.png) | [After](evidence/matched-after-school/matched-bubbles.png) | [JSON](evidence/matched-after-school/parity.json) |
| Bubbles | [Before](evidence/matched-before-bubbles/matched-bubbles.png) | [After](evidence/matched-after-bubbles/matched-bubbles.png) | [JSON](evidence/matched-after-bubbles/parity.json) |
| Distant | [Before](evidence/matched-before-far-school/matched-bubbles.png) | [After](evidence/matched-after-far-school/matched-bubbles.png) | [JSON](evidence/matched-after-far-school/parity.json) |

Actual browser motion, with captured timestamps preserved in variable-frame-rate
MP4s (not still-image slideshows):

- Native-scroll journey, approximately 74 s: [M4](evidence/motion-before-journey/motion.mp4)
  / [M4.1](evidence/motion-after-journey/motion.mp4).
- Bubble traversal, approximately 44 s: [M4](evidence/motion-before-bubbles/motion.mp4)
  / [M4.1](evidence/motion-after-bubbles/motion.mp4).
- [Repeated real pointer activation and settling](evidence/clicks-after/motion.mp4).

The motion pairs use equivalent scroll sequences and initial seed, not identical
wall-clock frame indices: capture overhead changes frame counts slightly. Review
focused on sequential browser frames around promotion/demotion, moving folded
arms/tentacles, the first optical passage and bubble continuity. No new LOD pop,
missing bubbles, matte/color change or broken refraction was observed in those
sampled sequences. Full clips are supplied for the user's review; this is not a
claim of frame-by-frame inspection of every recorded frame or new artistic approval.

## Validation

Before editing: **54 tests passed**, both legacy motion/default-animal parity
scripts passed, and the production build passed.

Candidate: **57 tests passed**, both legacy parity scripts passed, and
the production build passed. The additional animal test loads the exact M4 adapter
from the immutable baseline commit alongside the candidate: two identities,
720 frames each, all tiers, turns, activation, and hidden return. It compares
every visible attribute/index buffer and all particle position/history state
exactly at 120 checkpoints, not with a permissive visual tolerance.
Two focused preparation tests verify real-count instancing, reuse, idempotence,
renderer/mesh state restoration on failure, and disposal during asynchronous work.

Exact commands that passed on the final runtime:

[Validation results](evidence/validation.json) record the commands and exit codes.

```sh
node --test tests/*.test.mjs
node scripts/check-approved-motion.mjs
node scripts/check-default-animal.mjs
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build
```

There is no generic `npm test` script; the explicit Node suite ran all 57 tests,
including Sites tests. Legacy parity covers 720 frames/24 checkpoints and
240 frames/8 checkpoints respectively. The build preserves the existing Sites
artifacts. Existing large-chunk and npm configuration warnings remain; no new
test/build failure is hidden by them. Build settings here match the repository's
existing release selector; no publication flag or public default was changed.

- [Lifecycle evidence](evidence/lifecycle-after/lifecycle.json): actual idle entry
  `true`, after Escape `false`; subsequent click accepted; actual browser
  visibility became `hidden` during the 1.8 s background interval. On return,
  animal time advanced only about 0.119 s across the recorded samples, not a
  violent wall-time catch-up. No browser errors.
- [Activation evidence](evidence/clicks-after/clicks.json): four raycast pointer
  clicks hit the requested animals **3, 11, 17, 14**; activation count reaches
  four. Neighbor echoes occur, then active interactions and echoes return to
  zero; the bubble event also settles to zero ambient/hero bubbles. No errors.
- All final matched, journey, bubble, lifecycle and click captures report zero
  browser errors. The unchanged 1280×900 / DPR 1 configuration is recorded in
  each capture; numerical tests exercise hidden return and all tier transitions.

## Compromises and untested environments

- The unchanged oral-spine contact solver is still the largest remaining CPU
  hotspot. Hidden spine continuity is intentionally preserved. Further exact
  implementation optimization may be possible; profiling does not prove this
  cost is physically irreducible. Skipping visible or stateful work was not used.
- There are still many transparent draws and dynamic GPU uploads. No GPU timer
  query was collected, so GPU bottlenecks or GPU speedups are not established.
- Shared immutable sampling data is retained per finite topology/species key;
  mutable animal vertices and per-animal activation state are not shared.
  Shader/material appearance and variants remain unchanged.
- Preparation adds roughly **59–132 ms before scene ready** in observed browser
  runs and makes the already-existing full-resolution optical target resident
  earlier. It does not eliminate the cost; it removes first-encounter compilation
  from the visible journey. Zero new render targets, zero extra steady-state passes.
- The distant p95 regression and inconsistent moving p95 remain explicit.
  Benchmarks are a small local sample, not a statistical guarantee across hardware.
  The success here is exact visible parity, materially reduced measured CPU work
  and the reproduced avoidable hitch removed—not every performance problem solved.
- **TESTED:** actual NVIDIA WebGL2 in Brave's headless Chromium backend.
  **NOT TESTED in M4.1:** hardware WebGPU, SwiftShader WebGPU, physical mobile,
  other GPUs/browsers, portrait/narrow viewport reruns, long-duration soak or forced
  GPU-context loss. The previously documented legacy full-ocean WebGPU issue is
  not claimed fixed. Startup disposal/error restoration is covered by focused tests.

M1–M4 visual behavior remains unchanged in the parity evidence and preserved
source systems. Main and latest successful Pages workflow still identify
`a2ed3bc89c700ba5c792ecac19747939e9f09b8d` at final read-only verification
(workflow run `34182837955`). **No push, merge, deployment, Pages change, or M5 work.**
The existing user changes remain unstaged. The resulting local report commit is
reported in the handoff; the frozen tested runtime is `907ba3c`.
