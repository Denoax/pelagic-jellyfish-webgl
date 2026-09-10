# M6.3 validation

## Matched wide images

| View | Mean encoded luma, M6.2 → M6.3 | Near-black (<8/255) | Violet-classified pixels |
|---|---:|---:|---:|
| drift | 3.21 → 9.85 | 88.45% → 59.60% | 0.09% → 5.90% |
| deep | 2.94 → 11.73 | 91.31% → 52.31% | 0.08% → 9.28% |
| documentary | 2.97 → 7.59 | 90.45% → 67.17% | 0.08% → 3.86% |
| intimate | 3.88 → 9.55 | 86.60% → 61.82% | 0.10% → 7.40% |
| portrait | 2.30 → 8.75 | 94.32% → 53.29% | 0.00% → 0.20% |
| explore | 1.37 → 9.58 | 97.43% → 57.92% | 0.00% → 7.52% |

These are cropped image statistics in encoded sRGB, not linear-light measurements or exposure settings. The coarse hue classifier is not a segmentation model. It confirms a substantial cool/violet separation; its strict warm threshold remains 0%, so do not claim strongly saturated warm regions. Ochre is a muted mineral undertone, not a bright orange accent. The open-water black field remains intact; the increased mean comes from formerly extinguished geology. Large near-black regions remain in every view.

Camera JSON is exactly equal for all six pairs. Animal time/pulse phase, plume time, draw-buffer dimensions and DPR match. Pooled light position can differ by less than a millimetre because of existing frame-boundary stabilization, so whole-image pixel equality is not claimed. Resource state remains 13 solids / 13 sanctuary geometries / 7 sanctuary materials, with plume 768, diffuse 16, local snow 80 and zero extra ocean passes on both sides.

## Build / tests

- Production build with Pages base path and existing release flag: PASS. Existing large-chunk warning remains.
- All Node tests: 93/93 PASS. The repository has no general npm test script; used `node --test tests/*.test.mjs`.
- Approved motion parity: PASS, 720 frames / 24 checkpoints; geometry and appendage state exact, activation equal.
- Default animal parity: PASS, 240 frames / eight checkpoints; geometry and material response equal.
- Focused M6.3 tests cover protected-source parity, original colony-layout parity, exactly 15 selected surface accents with fixed X/Z, resource reuse, and cleanup.
- Existing water source parity permits only the ESM import extension correction; it still rejects shader changes.
- Final wide captures: six views, zero browser/shader errors.
- Actual browser stationary/descent motion: zero browser/shader errors. Original candidate orbit recording was cropped by the headless browser; replaced by `motion/after-corrected-orbit/motion.mp4`, verified 1280×900 / 20.2 seconds / 605 captured frames / zero browser errors. The review page links the corrected clip. Motion was inspected through captured frame sequences, not inferred from still-image or test success alone.

## Performance protocol

Measurements are ocean render-completion intervals from the existing completion probe, **not GPU timings** or the independent requestAnimationFrame interval field. NVIDIA RTX 4070 / Intel i5-14600K, Brave Chromium 152 / ANGLE OpenGL WebGL2. Three.js 0.175.0, same installed renderer family. Viewport/draw buffer 1280×900 at DPR1 for desktop; 390×844 at DPR1 for portrait. Normal production bloom is off on both. Existing adaptive quality stays enabled with actual ratio recorded before/after; it remains 1. No quality reduction is allowed.

Each scene receives the same six-second initial warm-up plus two seconds after selecting the camera and three seconds settling (twelve seconds for stationary ending), then thirty seconds capture-free measurement. Seed and progress/mode are identical, but these are real-time moving-animal runs rather than frozen simulation GPU timings. All five cases use fresh browser sessions. Test/build/video work is excluded from the clean runs. The first provisional baseline series overlapped test/build work and is not used in the final comparison; `baseline-clean-*` is authoritative.

## Clean baseline versus candidate results

All values in milliseconds except counts. Raw summary: [performance-summary.json](performance-summary.json). Raw interval arrays remain in the external evidence directories.

| Scene | Median M6.2 → M6.3 | p95 | Maximum | >50 ms | Draw-call snapshot |
|---|---:|---:|---:|---:|---:|
| wide | 16.7 → 16.7 | 17.9 → 18.0 | 22.1 → 27.5 | 0 → 0 | 178 → 178 |
| stationary | 16.7 → 16.4 | 18.0 → 19.1 | 26.0 → 26.1 | 0 → 0 | 178 → 178 |
| orbit | 16.7 → 16.6 | 17.8 → 18.7 | 23.1 → 27.6 | 0 → 0 | 176 → 176 |
| illumination | 16.7 → 16.7 | 18.3 → 17.9 | 25.4 → 27.4 | 0 → 0 | 178 → 178 |
| portrait | 16.7 → 16.7 | 19.0 → 19.0 | 29.3 → 30.8 | 0 → 0 | 99 → 99 |

The largest measured p95 increase is +1.1 ms (stationary) and +0.9 ms (orbit); this is a documented tail-cost change, not called a free improvement. No >50 ms intervals were observed. Medians remain near the browser's 60 Hz presentation cadence. These runs are not GPU timings, cannot establish a GPU speedup and do not prove equivalence on weaker hardware.

Sanctuary CPU median/p95 remains 0.3/0.4 ms on desktop and 0.4/0.6 ms in portrait in both versions. All five matching draw-call snapshots are equal. Whole-scene resource snapshots can vary with existing population state; sanctuary's own 13 geometries / 7 materials / 13 solids and life counts remain constant. No additional render pass or target was added. DPR remains 1 and drawing-buffer sizes remain identical before/after each run.

Benchmark source roots and exact SHAs are recorded separately from the driver's SHA, preventing an accidental comparison against the wrong checkout. Baseline clean source is M6.2 `685eaf5960251923bc4ae7012f8fd3c8c42bf46d`; candidate source is `0937f05fd836e721fb1fbe70d6fe1864d84d748d`. All ten measured runs have zero browser errors.


## Unchanged / not tested

M1–M5.2 animals, swimming, activation, currents, wakes, bubbles/refraction, camera/View/scroll and idle source are preserved. M6.2 geology and plume/thermal architecture remain exact. Pooled animal lighting is unchanged. New shading modifies only sanctuary response.

The known idle-return cyan-loss / invalid-geometry defect was not fixed, hidden or reclassified. Physical mobile, hardware WebGPU, software WebGPU, Safari and Firefox are NOT TESTED in this pass. No deployment, Pages update, push, merge or M7 work occurred.
