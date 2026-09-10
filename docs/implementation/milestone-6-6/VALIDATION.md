# M6.6 validation

## Baseline / source

Baseline `dd97923241e1d914e637263a6a94182b074c3bf0`, candidate runtime `da7f09e6f5de76009cefdd0fa6d87843d9fd9bf6`. M6.5 worktree was clean before branching; older dirty `site` work remains untouched. Three.js 0.175.0, existing React/Vite and WebGPURenderer family, real NVIDIA RTX 4070 WebGL2 through ANGLE OpenGL. No version, renderer or quality changes.

## Evidence protocol

Root `/home/mani/dev/jellyfish-studio/m6-6-evidence/`. Baseline at5209 and candidate5211. Fixed browser seed7183, animal time14 and the same camera poses/buffers/quality. Primary worst close view is the exact inherited M6.5 Explore pose `[1,-11,-15]` looking at `[-.3,-15,-22.6]`. Additional newly authored *inspection* poses are matched on both sides; production tracks are unchanged.

`baseline/<view>/wide.png` versus `candidate/<view>/wide.png`: explore, stacked, ravine-edge, low-clear, high, shelf, deep, drift, glow-close, chimney, portrait, documentary, illumination, wide, ravine, grain, base, colony, spires. The original `low` pose was obstructed by existing terrain and is retained separately as a diagnostic, not represented as a useful low-angle success. It is supplemented with a clear shared low-angle pose, not a candidate-only flattering camera.

Motion pairs: `motion/{before,after}-{orbit,parallel,ravine,life,stationary}/motion.mp4`. These are timestamped actual browser frames, no generated imagery or brightened screenshots. Each starts from the same held state, then resumes the actual organism/current simulation. Orbit and parallel inspection paths stay separate from the public camera system. Free-running recording is not frame-perfect deterministic motion synchronization and is not a performance measurement.

## Tests / build

- Baseline99/99 Node tests, production build and both animal parity checks pass.
- Candidate102/102 Node tests, production build and both parity checks pass.
- Motion parity:720frames,24checkpoints; geometry/appendages byte-identical, activation equal.
- Default animal parity:240frames,8checkpoints; geometry byte-identical and material response equal.
- Focused tests: deterministic bounded archetypes, finite unit normals/positions, closed consistently oriented mesh, nondegenerate triangles/valid indices, positive volume, shared geometry/material, stable exact instance transforms, exact M6.5 life/glow/layout/sediment hashes, real support-ray preservation and no runtime resource churn.
- Two historical source-scope tests now permit the explicitly authorized M6.6 module/hook. Their other locks remain, and the new M6.5-relative test permits only the two changed runtime files. No visual assertions were deleted to hide a regression.
- An early test incorrectly compared a ray against the top of the life body rather than its rock support; filtering the tested life geometry corrected the harness. A convex-origin normal assertion was also replaced by closed orientation/positive-volume checks because an authorized concave undercut need not face away from the object origin. These were new-test issues, not claimed baseline failures.

Commands:

```sh
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build
node --test tests/*.test.mjs
node scripts/check-approved-motion.mjs
node scripts/check-default-animal.mjs
```

Existing >500kB build chunk warning remains. No general `npm test` script exists. Logs `/tmp/m66-{baseline,final}-{build,tests,motion,animal}.log`.

## Construction

Paired Node 24.20.0 diagnostic, one warm-up + five samples per source, separate from browser captures/benchmarks. Baseline median 945.19 ms; candidate 940.69 ms, effectively unchanged, not a meaningful speedup. Range 943.92–953.94 ms baseline, 938.93–960.17 ms candidate.

Existing large-mesh attachment rays still dominate: basin~378ms, primary chimney~250ms, secondary mesh~111ms, shelf~94ms in the baseline instrumented run. Those large-mesh ray counts remain unchanged. New safety checks add1393 small-block ray tests rather than new expensive basin/chimney intersections: original34-vertex block calls1364→2043 (+679), new42-vertex block714 calls. Added small-block ray time~2.7ms. No broad startup optimization or cached-geometry mutation is introduced. Raw `construction/{baseline,candidate}.json`.

## Frame intervals / lifecycle

Measurements use the existing actual async ocean-render completion probe, not separate rAF or GPU timestamps. Hardware: Intel i5-14600K, NVIDIA RTX 4070; Brave's Chromium 152.0.7977.76, ANGLE NVIDIA OpenGL WebGL2. Both sources use local Vite development serving; the production build passes separately, but these are not minified-production timing claims.

Six fresh baseline/candidate scenes use identical 1280×900 viewports/drawing buffers (portrait 390×844), DPR 1 throughout, direct ocean rendering with inherited bloom-off configuration and unchanged adaptive-quality settings. Every run uses a fresh browser, six seconds of initial warm-up, two seconds after camera selection and three more seconds of settlement (twelve for stationary), then 30 seconds of capture-free measurement. Capture/encoding/build/profile jobs do not overlap these runs. Motion follows the same inspection path on each side; living simulation remains free-running. The measurement tool commit is `0c5af6d`; the explicitly recorded source revisions are M6.5 `dd97923` and M6.6 runtime `da7f09e`.

| Scene | M6.5 median / p95 / max ms | M6.6 median / p95 / max ms | >50 ms before / after | Sanctuary CPU median ms | Draw calls | Resident geometries |
|---|---:|---:|---:|---:|---:|---:|
| Deep wide | 16.7 / 17.9 / 23.8 | 16.7 / 17.9 / 29.7 | 0 / 0 | 0.3 → 0.3 | 181 → 185 | 189 → 193 |
| Stationary | 16.7 / 18.1 / 27.1 | 16.5 / 19.4 / 28.5 | 0 / 0 | 0.3 → 0.3 | 179 → 183 | 189 → 193 |
| Explore orbit | 16.7 / 19.1 / 25.6 | 16.6 / 18.3 / 25.9 | 0 / 0 | 0.3 → 0.3 | 181 → 185 | 196 → 200 |
| Near floor | 16.7 / 19.0 / 25.5 | 16.7 / 18.9 / 27.8 | 0 / 0 | 0.3 → 0.3 | 164 → 168 | 197 → 201 |
| Illumination | 16.7 / 17.7 / 22.2 | 16.7 / 18.5 / 35.0 | 0 / 0 | 0.3 → 0.3 | 184 → 188 | 191 → 195 |
| Portrait | 16.7 / 18.3 / 26.4 | 16.7 / 19.5 / 25.9 | 0 / 0 | 0.4 → 0.5 | 102 → 106 | 114 → 118 |

All twelve runs completed without browser errors. [Structured summary](performance-summary.json) retains sample counts, CPU distributions, actual NVIDIA backend, buffers/DPR, render snapshots and source identity. Complete interval arrays remain in `m6-6-evidence/performance/<side>-<scene>/performance.json`, with sanctuary CPU arrays in `sanctuary-cost.json`. There are roughly 1,800 render intervals per run.

The added four instanced batches/geometries are visible in every scene's final render snapshot. Resident geometry counts are whole-ocean counts, not only sanctuary resources; sanctuary itself increases 14→18. Material count and render passes are unchanged. The draw numbers are end-of-run snapshots rather than time-averaged draw counts.

Medians remain effectively at the 60 Hz presentation interval. Stationary p95 rises 1.3 ms, illumination 0.8 ms and portrait 1.2 ms; orbit p95 falls 0.8 ms and near-floor remains close. Portrait sanctuary CPU median is 0.5 versus 0.4 ms; other scenes remain 0.3 ms. These short paired observations show acceptable cost, not a statistical proof of zero overhead or a GPU speedup. No resolution/quality reduction was used. The full candidate maximum is 35.0 ms.

The previous 72.7 ms near-floor / 59.6 ms illumination stalls did not recur: zero >50 ms intervals in all six baseline and six candidate runs. Their cause remains unidentified; this milestone does not claim to have repaired them. No stall samples were excluded and no speculative scene changes were made.

## Completed visual and lifecycle review

All 20 still pairs have identical camera state, animal phase/time, plume time and drawing-buffer size, with no browser errors. All ten MP4s validate at 1280×900 and approximately 22 seconds each. The local review page loads 40 stills and ten videos; actual video playback advanced normally with no browser errors. Raw checks: `evidence-validation.json` and `review-page/validation.json`.

The foreground, stacked and ravine-edge comparisons show unequal corners and broken/tapered lips replacing the repeated rounded ledge outline. The high/low/parallel views retain broad planar basalt rather than spiky vertex noise. Wide, Documentary, Drift, Deep and Intimate comparisons retain their existing composition and dark-water hierarchy. The attachment-focused views retain the five colonies and ten pinpoints. Material source/uniforms remain identical; changed geometry and normals naturally change local shading, so this is not a claim of pixel-identical rock lighting.

Both baseline and candidate passed a five-second real browser-tab hide/return, reverse journey seeks, actual CDP wheel reversal, and resize through 800×900, 390×844 and back to 1280×900. Visibility was confirmed hidden, rendering resumed ready, and browser errors remained empty. See `lifecycle-{baseline,candidate}/` for states and screenshots. This checks ordinary background recovery, not the out-of-scope idle defect or forced renderer/process loss.

## Limits / safety

This is a small reusable family, not 231 unique sculptures: 183 pieces use four variants and 48 remain original to preserve protected vent aprons and attachment support. The original macro caps and bank/rubble families are untouched. Free Explore can still enter terrain; its original obstructed low-angle diagnostic is retained alongside a useful matched low-angle pair. No camera collision or visibility workaround was added. Visual self-review does not replace the user's approval.

The legacy idle-return cyan-loss/invalid-geometry defect remains untouched and is not claimed fixed. WebGPU, physical mobile, Safari/Firefox, integrated GPUs, HDR/black-level calibration are NOT TESTED unless separately recorded. Portrait is browser emulation. M1–M5.2, M6.1 plume/shimmer, accepted M6.5 materials/glow, ravine, chimney/spires, cameras, View/scroll/Explore controls and idle implementation are unchanged. No push, merge, deployment, Pages changes or later milestone.
