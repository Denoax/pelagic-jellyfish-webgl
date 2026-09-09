# M6 validation and measurements

Runtime candidate: `963174b2507ed89768ee36cdc2ea2096abe1dadc`.
Approved M5.2 baseline: `aef830b1619eef71e36be4e8b4cd8b924fb1bd8a`.

## Frame intervals, not GPU timings

Actual NVIDIA RTX 4070, Intel i5-14600K (20 logical CPUs), approximately 62 GiB usable memory, Linux. Brave/Chromium **152.0.7977.76**, ANGLE NVIDIA OpenGL ES 3.2, actual **WebGL 2.0**. Three **0.175.0**, existing `WebGPURenderer` family using its WebGL backend. No software GPU substituted.

Both source worktrees run Vite development builds under the same browser driver: **1280×900 CSS viewport and 1280×900 ocean drawing buffer, DPR/pixel ratio 1**, fixed development quality (adaptive quality off), normal direct-render production bloom configuration **off**. The candidate's ratio/buffers were checked both before and after measurement. This does not validate physical mobile performance, WebGPU, or every production adaptive-quality choice.

Fresh browser per case, seed 7183. Six seconds initial renderer warm-up, two seconds after setting camera state, then three more seconds settling (12 for the prolonged final-rest case). Thirty-second recording-free measurement per case. No screenshots, screencast, build or test suite ran during measured windows. Tiny read-only statistics extraction occurred between/after measurements. First baseline suite was followed by the candidate and a complete quiet baseline repeat; the repeat is used below, because the original baseline Explore may have overlapped an earlier build/test.

Numbers use `performance.json → auditRender.intervals`, method **async-render-completion-v2**, not the outer requestAnimationFrame statistics. They measure intervals between completed render promises, **not hardware GPU duration**. These vsync-limited results should not be interpreted as precise GPU savings or statistically established small improvements.

| Scene | M5.2 median | p95 | max | >50 ms | M6 median | p95 | max | >50 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Pre-sanctuary, Drift .45 | 16.7 | 17.7 | 26.4 | 0 | 16.4 | 19.2 | 26.3 | 0 |
| First reveal, Drift .72 | 16.7 | 17.9 | 26.1 | 0 | 16.7 | 18.0 | 25.4 | 0 |
| Chimney + plume, Drift .92 | 16.6 | 18.2 | 30.0 | 0 | 16.6 | 18.3 | 25.7 | 0 |
| Nearby animal illumination, Drift 1 | 16.4 | 19.2 | 29.4 | 0 | 16.7 | 18.3 | 27.5 | 0 |
| Prolonged stationary finale, Drift 1 | 16.7 | 19.0 | 24.9 | 0 | 16.4 | 19.1 | 31.8 | 0 |
| Explore close inspection | 16.3 | 20.5 | 30.0 | 0 | 16.6 | 19.2 | 24.8 | 0 |

All numbers in ms except event counts. Explore uses the same camera position `[-4.6,-7,-17]`, looking toward `[-4.6,-7,-24]` in both implementations; the old site has no corresponding chimney, naturally. Illumination is observed from the same endpoint with ordinarily swimming animals, not an altered path or a synthetic isolated light benchmark.

Candidate sanctuary CPU update: **0.1 ms median, 0.2 ms p95, 0.3 ms maximum** in each case, at the browser's approximately 0.1 ms timer granularity. Includes fixed-step particle updates, buffer copies and pooled-light selection; excludes GPU draws. The old environment did not expose equivalent instrumentation: **baseline environment-only CPU delta NOT MEASURED**. Whole-scene intervals above remain comparable.

Candidate final-frame whole-scene draw calls: pre 172, first 172, chimney 174, illumination 173, rest 173, Explore 157. These are endpoint samples, not average/max draw-call histories. Candidate submitted triangles at those endpoints: 687897 / 681497 / 684825 / 658665 / 658985 / 562105. M6-specific architecture is eight solid draws plus two instanced transparent batches (272 particles), subject to frustum visibility. No new full-ocean pass, render target, shadow, or per-animal PointLight.

Interpretation: no large steady-state regression or >50 ms stall was observed in these windows. Pre-sanctuary p95 is **1.5 ms worse** and stationary maximum is **6.9 ms worse** than the repeated baseline, so this is not claimed as an across-the-board performance improvement. Quality/resolution was not reduced. Fine-scale shader/transparent overdraw and existing animal work remain costs; this test did not separate their GPU durations. Cold compilation/resource warm-up is outside these warm measurements and is not claimed stall-free.

Raw evidence: `/home/mani/dev/jellyfish-studio/m6-evidence/performance/{baseline-repeat,candidate}-{pre,first,chimney,illumination,rest,explore}/`. `performance.json` contains renderer/buffer/browser/source identity and raw intervals; `sanctuary-cost.json` contains candidate CPU samples, light/resource state and final renderer counts. Earlier `baseline-*` remains available as corroboration, not silently overwritten.

Reproduce from the M6 worktree, with baseline dev server on 5196 and candidate on 5198:

```sh
node scripts/m6-benchmark.mjs 'http://127.0.0.1:5196/?renderer=webgl&idle=300' baseline-new aef830b1619eef71e36be4e8b4cd8b924fb1bd8a /home/mani/dev/jellyfish-studio/m5-view-ui-r2
node scripts/m6-benchmark.mjs 'http://127.0.0.1:5198/?renderer=webgl&idle=300' candidate-new 963174b2507ed89768ee36cdc2ea2096abe1dadc /home/mani/dev/jellyfish-studio/m6-sanctuary
```

Run serially, with capture/tests/build stopped. All scripts use the existing Brave/CDP route, not Playwright or browser emulation of a GPU.

## Tests and build

```sh
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build
node --test tests/*.test.mjs
node scripts/check-approved-motion.mjs
node scripts/check-default-animal.mjs
node scripts/m6-clearance.mjs
```

There is no package-wide `npm test` script. The actual Node test files were invoked explicitly; a missing script is not counted as a pass.

- Baseline first invocation: 75/76, missing generated Sites bundle; production build then **76/76**.
- Candidate production build: **PASS**, existing >500 kB chunk warning. Builds local `dist/client` and Sites wrapper only; no hosting/deployment tool invoked.
- Candidate Node tests: **82/82 PASS**, zero skipped.
- Approved motion: **PASS**, 720 frames, 24 checkpoints, geometry/motion/activation parity.
- Default animal: **PASS**, 240 frames, eight checkpoints, geometry/material parity.
- Six new focused M6 tests cover deterministic finite geometry, opaque reverse-progress solids, resource stability/idempotent cleanup, preallocated current-coupled lifecycle, 30/60 Hz fixed-step parity, ignored invalid/long resume deltas, reduced-motion continuation, pooled-light selection/activation/no mutation/cleanup, and protected-source parity.
- Offline clearance: **101920 actual solid triangles**, 1201 samples per unchanged track. Minima A 11.725132 / B 11.146921 / C 11.067139 / D 11.148506 world units, all nearest to basalt shelves. This is not a new runtime collision system.

## Browser and lifecycle

Desktop and portrait tours produced zero Runtime exceptions. 1280×900 desktop, 820×900 resize and 390×844 portrait emulation were exercised. Portrait UI remains available, but the landmark is substantially cropped at the left: **visual composition limitation**, not a claimed portrait success.

The development lifecycle capture verifies a real animal click at the deep destination, actual `document.visibilityState === 'hidden'`, return without wall-time simulation catch-up, idle entry, idle exit back into the same ocean/camera at progress 1, and unchanged environment resource counts. The 2.5-second hidden interval plus 0.7-second visible recovery advanced plume time only **0.767 seconds**, not 3.2 seconds.

The production bundle passed the same deep activation/background/idle/return/resource **state assertions** on WebGL2, with development camera controls absent. **These are not a visual idle-return pass:** screenshot review found cyan bell/appendage tissue disappearing after idle exit, leaving pink internal pieces. The same exact sequence reproduced this on the approved M5.2 production baseline, including eight seconds later. Therefore it is a **pre-existing visual lifecycle defect**, not demonstrated to originate in M6, and remains unfixed under the no-idle/no-animal-change boundary. The root cause was not established; no speculative renderer explanation is presented as fact.

Evidence: `lifecycle-dev/checks.json`, `lifecycle-production-correct-base/checks.json`, and matched diagnostic folders `lifecycle-baseline-diagnostic/` / `lifecycle-candidate-diagnostic/`, particularly `resume.png`, `idle-return.png`, `idle-return-later.png` and the real motion clips. The hidden-tab return frame still has cyan tissue; the later idle-return frame does not. State identity/ready flags alone missed this failure.

The first local production attempt failed to become ready because the Vite preview process lacked the build's `/pelagic-jellyfish-webgl/` base setting: JS requests received the HTML fallback. It is retained in `lifecycle-production/failure.json`. Restarting **only the local preview process** with the matching base fixed serving; no runtime source change was required:

```sh
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ npm run preview -- --host 127.0.0.1 --port 5199 --strictPort
node scripts/m6-lifecycle.mjs 'http://127.0.0.1:5199/pelagic-jellyfish-webgl/?renderer=webgl&idle=300' lifecycle-production-correct-base
```

GPU-context-loss recovery is **NOT TESTED** in this pass. Constructor/disposal unit tests do not substitute for real device-loss validation.

## Remaining limitations

- Plume appearance is gray/steam-like in some views; localized current coupling works numerically but visible mineral-discharge character is not yet convincing enough.
- Pre-existing cyan tissue loss after idle return reproduced on approved M5.2 and M6. Functional state assertions pass, **visual idle return fails**. No idle or animal repair was folded into M6.
- Plume is an instanced billboard approximation with normal blending, no volumetric self-shadowing or depth-aware intersection softening. Existing transparent-object ordering remains approximate; severe arbitrary Explore overlaps are not comprehensively proven correct.
- Mineral noise can look camouflaged/painted, especially close; geometry's repetition remains visible. No extra glow is used to hide that.
- Diffuse patches and small life are attached/clustered, but near-base activity is weak. Live thermal shimmer is absent; M3 target reuse was unsafe without changing its approved path.
- Portrait needs an environment-side composition solution; approved camera choreography was intentionally not altered.
- Finite terrain boundaries and freecam penetration remain reachable outside audited tracks; no player collision was added.
- Long-duration soak beyond the recorded tours/30-second benchmark windows and exhaustive all-time animal/jet avoidance are **NOT TESTED**.
- Hardware WebGPU, SwiftShader WebGPU, Firefox, Safari, reduced-motion visual browser capture and physical mobile are **NOT TESTED**. Reduced-motion numerical continuation is tested. Known legacy full-ocean WebGPU issue remains separate.

## Scope confirmation

No changes to approved M1 animal implementation, M2 currents/wakes/snow, M3 glass, M4 population, M4.1 optimization, M5.2 camera paths, View UI, scroll behavior or idle implementation. Their source/parity checks remain intact except the explicitly authorized replacement of old deep-environment code. New geometry necessarily changes environmental pixels/occlusion, not animal quality or controller behavior. No push, merge, deployment, Pages edit or M7 work.
