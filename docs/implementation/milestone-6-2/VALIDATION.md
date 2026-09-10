# M6.2 validation and evidence

## Identity and method

Baseline: `cb46120537ee6e56c02611f910c67de1e1a1f80f`, served from the untouched
`m6-1-sanctuary` worktree on port 5201. Candidate:
`3822c638254d7398d4c4c02040bf7812d6404e2c`, port 5203. No uncommitted runtime
source during the final benchmark. Local development builds use the same
ocean path and fixed development quality. The separate production build also
passes; these are not measurements of a deployed Pages build.

Hardware: NVIDIA RTX 4070, Intel i5-14600K. Browser: Brave Chromium
152.0.7977.76, actual ANGLE NVIDIA **WebGL2**, not SwiftShader. Three **0.175.0**.
Viewport and ocean drawing buffer **1280×900**, DPR **1**, existing 4× MSAA,
normal production bloom-off path, unchanged quality/adaptive policy. The idle
canvas is inactive during measurement. Fresh browser profile for every case,
seed 7183, 6-second warm-up, same camera setup and 2+3-second settlement
(stationary uses 12 seconds), then **30 seconds** of measurement per case.

Read-only `async-render-completion-v2` probe records completion of the actual
awaited ocean update. These are **frame intervals, NOT GPU timings**. Sanctuary
CPU samples measure the existing controller/update block, not GPU shading.
Screenshot/screencast/encoding and build/test workloads do not run concurrently
with performance measurement. No quality/resolution reduction.

Reproduce with `scripts/m61-benchmark.mjs` and `scripts/m61-summary.mjs`, setting
`EVIDENCE_ROOT=/home/mani/dev/jellyfish-studio/m6-2-evidence/performance`.
Valid baseline folders are `m61-*`; valid candidate folders are `m62-valid-*`.
Earlier `m62-*` runs are **invalid and excluded**: they exposed a TSL uint/sine
shader error in tiny biological points. Explicit float conversion fixed it.
The shared capture helper now records console shader errors as well as thrown
exceptions, and the benchmark runner rejects runs with either.

## Measured comparison

All values below are milliseconds; each cell is baseline → candidate.

| Scene | Median | p95 | Maximum | Intervals >50 ms | Draw-call snapshot |
| --- | --- | --- | --- | --- | --- |
| First encounter | 16.7 → 16.7 | 18.2 → 19.0 | 24.9 → 26.2 | 0 → 0 | 172 → 177 |
| Full sanctuary | 16.6 → 16.7 | 18.1 → 18.0 | 25.5 → 25.2 | 0 → 0 | 173 → 178 |
| Close source | 16.7 → 16.6 | 18.4 → 19.2 | 27.8 → 26.9 | 0 → 0 | 160 → 163 |
| Thermal shimmer | 16.7 → 16.7 | 19.0 → 18.7 | 24.0 → 24.5 | 0 → 0 | 165 → 167 |
| Animal illumination | 16.7 → 16.7 | 19.1 → 17.7 | 22.7 → 22.7 | 0 → 0 | 173 → 178 |
| Stationary basin | 16.7 → 16.5 | 17.7 → 19.9 | 21.0 → 31.9 | 0 → 0 | 173 → 178 |
| Explore orbit | 16.7 → 16.6 | 18.7 → 19.8 | 25.3 → 24.9 | 0 → 0 | 172 → 177 |

Sanctuary CPU median remains **0.3 ms** in all cases. Candidate p95 is **0.4 ms**;
baseline p95 is 0.3–0.4 ms. Maximum candidate controller sample 1.0 ms vs baseline
0.9 ms. No new texture count; five additional cached geometries are present.
Full-view triangle snapshot grows 732,673 → 815,017 (includes the whole ocean).
Draw counts vary with the unchanged view/frustum; new work is at most five draws.

The added detail has a small observed tail cost, most notably stationary p95
**+2.2 ms** and orbit **+1.1 ms**, not a demonstrated GPU speedup. One run per
case cannot isolate scheduling noise from GPU/CPU cost. At the 60 Hz ceiling,
similar medians do not mean the geometry/shader work is free. No >50 ms stall
was observed in these seven candidate or baseline windows. Longer sessions and
weaker hardware may expose costs not captured here. All valid runs have **zero
browser/GLSL errors** and unchanged 1280×900 buffers/DPR before and after.

## Automated checks

- Baseline **86/86** tests; candidate **90/90** tests, no skips.
- `node scripts/check-approved-motion.mjs`: PASS; 720 frames, 24 checkpoints,
  byte-identical geometry, exact appendage state, equal activation.
- `node scripts/check-default-animal.mjs`: PASS; 240 frames, eight geometry
  checkpoints, equal material response.
- `VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build`:
  PASS, pre-existing >500 kB chunk warning remains. No dependency upgrade.
- New tests: actual gully mesh relief/finite normals, no outlet displacement,
  deterministic clustered layout, bounded life-current response, background-debt
  rejection, stable resource ownership/disposal, and byte parity for existing
  plume/shimmer/renderer/environment wiring.
- Full cinematic clearance against every solid triangle: minimum **11.294**
  units. Existing camera tracks unchanged. Freecam is intentionally unrestricted.

## Evidence layout

Root: `/home/mani/dev/jellyfish-studio/m6-2-evidence/`.
Images are actual ungraded browser captures. Motion files are real timestamped
Brave screencasts, not generated motion. Capture frame rate is not the benchmark.

Matched stills use seed 7183, held animal state 14 seconds, 1280×900/DPR1 and
identical camera positions in `scripts/m62-detail.mjs`:

| Subject | Baseline | Candidate |
| --- | --- | --- |
| Full Deep view | `before-detail/full.png` | `final-detail/full.png` |
| Chimney/local animal light | `before-detail/chimney.png` | `final-detail/chimney.png` |
| Basin/channel | `before-detail/ravine.png` | `final-detail/ravine.png` |
| Seep/life close view | `before-detail/life.png` | `final-detail/life.png` |
| Wide composition | `before-detail/wide.png` | `final-detail/wide.png` |

Hold fixes animal motion, not the wall-clock duration of local environment
settlement; plume/life are therefore representative rather than pixel-identical
simulation snapshots. Camera, scale, animal phase and rendering settings match.

Motion/review sets:

- `before-desktop/motion.mp4` / `final-desktop/motion.mp4`: Drift/Deep/Documentary,
  reverse/re-entry, Explore orbit, source, diffuse detail and narrow resize.
- `before-portrait/motion.mp4` / `final-portrait/motion.mp4`: 390×844 descent.
- `final-detail-motion/motion.mp4`: normal moving ocean in the five inspection
  poses, including local material reveal and life. Camera pose changes are
  inspection cuts, not a redesigned camera journey.
- `final-lifecycle/motion.mp4`: actual click, background/return, idle/return and
  resize. JSON checks distinguish functional return from the known cyan defect.

Earlier `geology-only`, `color-life-*`, `after-*` and `shader-validated` folders
are iteration records, not the final review set. One exploratory recording was
interrupted by a development hot reload during material editing; it is excluded.

## Browser outcomes

Final desktop recording: **110.41 s / 3,296 captured frames**, zero browser or
shader errors. Final portrait: **52.68 s / 1,581 frames**, zero errors. Five-pose
motion: **40.83 s / 1,220 frames**, zero errors. The still set also reports zero
errors. Captured timestamps preserve actual motion speed; these are not GPU FPS.

1280×900 desktop, 820×900 in-place narrow resize, and 390×844 portrait were
inspected. The main chimney remains visible in portrait, although its base and
the new channel contribute little at that framing. Explore reveals the channel
and local colonies from multiple angles. The ordinary moving animal continues
to reveal rock locally; the new filaments move minimally rather than becoming
an attention-grabbing plant field. Material colors remain too restrained in the
wide shot, hence PARTIAL.

**Lifecycle test is NOT a clean pass.** Click activation, actual hidden-tab
return (no plume wall-time catch-up), idle entry/exit, same world identity,
restored View UI, preserved camera progress and stable geometry/material counts
all satisfy their assertions. However, after idle return, the strict console
check fails on **18 `computeBoundingSphere(): Computed radius is NaN` errors**,
and cyan tissue disappears while pink internal anatomy remains.

A fresh run against untouched M6.1 using the same now-console-aware helper
reproduces **the same 18 errors and cyan loss**. Evidence:
`baseline-lifecycle-console/failure.json` versus `final-lifecycle/failure.json`,
plus their motion clips and `idle-return-later.png`. This verifies that the
failure predates M6.2; its underlying cause was not diagnosed or repaired in
this pass. No claim that functional return establishes visual idle correctness.

## Limits

Physical mobile, non-NVIDIA GPUs, hardware WebGPU and software WebGPU are
**NOT TESTED** here. Portrait/narrow are browser viewport emulation. The known
legacy full-ocean WebGPU issue is not claimed fixed. Existing screen-space
thermal/refraction transparency limits remain. The separate idle-return cyan
loss is known, out of scope and not hidden by successful functional tests.

The visual result remains **PARTIAL**, for the reasons in the audit and README.
No tests or performance result constitute artistic approval. M1–M5.2 source is
unchanged; no push/merge/deployment/Pages modification or M7 work.
