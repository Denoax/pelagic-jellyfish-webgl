# M6.4 validation

## Baseline and environment

M6.3 baseline `8752d1af1f01bd1142bad1d55ae2b047cacb1d8d` was verified clean at `/home/mani/dev/jellyfish-studio/m6-3-sanctuary`. Candidate runtime `d2f8fffd1d443ce1df78bbca8d4cf6333aaa131d` is isolated on `milestone-6-4-geological-integration`. No main/Pages baseline substitution.

Real NVIDIA RTX4070 WebGL2 via ANGLE OpenGL, Intel i5-14600K, Brave/Chromium152.0.7977.76 (CDP Browser.getVersion). Both sources run through Vite development servers with the same installed Three.js0.175.0 and direct ocean rendering; inherited production bloom is off. Desktop1280×900 and portrait390×844, DPR1; actual draw buffers and backend recorded, not inferred from query parameters. Portrait is browser emulation, not physical mobile. No renderer/version/quality changes.

## Tests / build

- Baseline: 93/93 Node tests passed, production build passed, both existing animal parity scripts passed.
- Candidate: 97/97 Node tests passed, production build passed, both parity scripts passed.
- `check-approved-motion.mjs`: 720 frames /24 checkpoints, geometry and appendage state byte-identical, activation equal.
- `check-default-animal.mjs`: 240 frames /8 checkpoints, geometry and material response equal.
- New focused tests cover deterministic/bounded meso placement, recessed gully, outward triangle winding, embedded surface-normal colony roots, fixed counts, bounded current sediment, reverse/background debt rejection, buffer identity/teardown, and cached-vs-original exact raycast hits.
- Existing M6.3 guard was updated only for the newly authorized shelf/fracture surfaces and sanctuary integration. Its historical point utility test remains; new attachment has separate tests. M1–M5.2, plume, optics, camera/View/scroll/idle source locks remain.
- Build command: `VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build`. Existing >500kB chunk warning remains.
- Test command: `node --test tests/*.test.mjs`. There is no general `npm test` script.
- Logs: `/tmp/m64-final-build.log`, `/tmp/m64-final-tests.log`, `/tmp/m64-final-motion-parity.log`, `/tmp/m64-final-default-parity.log`.

## Evidence inventory

Root: `/home/mani/dev/jellyfish-studio/m6-4-evidence/`.

Primary rejected frame: `before/explore/wide.png`, annotated in `index.html` without retouching the image. Final matched stills use `baseline/<view>/wide.png` and `candidate/<view>/wide.png`, with adjacent full state/errors JSON.

| Step / view | Visual assessment |
|---|---|
| 1. Explore exact documented failed pose | Two-region wash removed; structural continuity improved. Still PARTIAL: recognizable repeated plate/block forms. |
| 2. Deep final | Channel banks and base transitions clearer; hero remains dominant. Foreground morphology still needs more convincing geological variety. |
| 3. Drift final | Same world and new bed breaks; no camera rescue. Broad shelf masses remain evident. |
| 4. Ravine at cinematic distance | Recessed dark channel survives, flanked by broken banks. Not outlined by emission. |
| 5. Chimney base | Low apron/pale seep bodies connect the foot; high accidental attachment was removed. |
| 6. Medium colony | Rooted pale bodies and filaments register, but forms remain stylized; wide ecology is not yet strong enough to claim artistic completion. |
| 7. Shelf transition | Actual surface relief and edge-collapse fragments replace smooth caps. Some plate-like character remains. |
| 8. Secondary spires | Existing formations gain surrounding broken beds; relative hierarchy preserved. |
| 9. Jellyfish illumination | Existing moving light reveals new surface variation locally; no added lights or whole-floor pulse. |
| 10. Portrait | Same camera crop and world. Bank/base readability improves, but wider ecological context remains cropped. |

Actual browser motion: `motion/{before,after}-{descent,stationary,orbit,ravine,life,illumination}/motion.mp4`. Adjacent timestamped JPEG sequences, `recording.json`, ending frame and scene state are retained. This is not generated imagery. The development Explore paths are repeatable inspection paths, not edits to production camera tracks; a brief initial pose handoff exists at clip start. Review both the video and wide stills, not only close-ups. Motion self-inspection uses timestamped browser frame sequences; human review remains required.

`trial*` directories are rejected/intermediate evidence, not the final candidate. `trial3` had a transient development-module syntax error; corrected before the clean recapture and production build. Those artifacts are retained rather than silently substituted.

### Matched-state and lifecycle results

`evidence-validation.json` confirms all ten before/after camera objects and drawing-buffer lists match exactly. Animal time14 and pulse phase match, as does plume time34. All still captures have zero browser errors. All twelve motion files validate as1280×900 with retained timestamps and zero capture-session errors.

The local HTML evidence viewer was opened in the same browser and its primary comparison inspected side by side. Visible images loaded successfully with zero browser errors; `review-page/wide-comparison.png` records that inspection. This compares the deterministic M6.3 documented rejected pose, not an unknowable exact pose from a screenshot without camera metadata. Final motion-frame inspection also confirms the remaining repeated/paver-like geology and simplified pale colony bodies; these shortcomings are not obscured in the handoff.

Ordinary tab switching was exercised using a second actual browser tab: `document.visibilityState` was observed as `hidden`, then returned to `visible/ready`. Both M6.3 and M6.4 continued through reverse travel and800×900 →390×844 →1280×900 resizing, with no browser errors. Evidence: `lifecycle-{baseline,candidate}-tab/`.

The stronger CDP `Page.setWebLifecycleState(frozen/active)` test did **not** pass on either version. Both temporarily lost the runtime hooks and subsequently showed hidden/loading scene reinitialization. No console exception was reported. These results are retained in `lifecycle-{baseline,candidate}/`; do not label forced-freeze recovery fixed or attribute it solely to M6.4. The underlying browser/Vite/page-reinitialization cause was not isolated. This is separate from the already known idle-return defect, which remains out of scope.

## Performance

Six capture-free 30-second measurement windows, seed7183, initial6-second warm-up +2-second camera settling +3seconds (12seconds for stationary). Same modes/poses and inspection orbit code in `m64-benchmark.mjs`. No screenshot/video encoding or builds run during a measurement. Ocean async render-completion intervals are used, not independent rAF intervals or GPU timings.

Baseline/candidate results are recorded in `performance-summary.json`. Scene time is live, not frozen; render-buffer/backend/DPR and source identities are recorded at start/end. Draw counts are representative snapshots, not whole-run maxima. No statistical GPU claim is made from a single paired series.

| Scene | M6.3 median / p95 / max (ms) | M6.4 median / p95 / max (ms) | >50ms before / after | Sanctuary CPU median / p95, before → after (ms) | Draw snapshot before → after |
|---|---|---|---|---|---|
| Deep wide | 16.7 / 18.1 / 26.6 | 16.6 / 18.3 / 26.3 | 0 / 0 | .3 / .4 → .3 / .4 | 178 → 181 |
| Stationary wide | 16.7 / 18.1 / 25.5 | 16.6 / 19.3 / 25.1 | 0 / 0 | .3 / .4 → .3 / .5 | 176 → 179 |
| Explore orbit | 16.6 / 20.6 / 25.4 | 16.7 / 18.2 / 28.4 | 0 / 0 | .3 / .4 → .3 / .4 | 178 → 181 |
| Near floor | 16.7 / 18.1 / 23.3 | 16.7 / 18.1 / 23.4 | 0 / 0 | .3 / .4 → .4 / .5 | 162 → 165 |
| Jellyfish illumination | 16.7 / 17.9 / 22.9 | 16.7 / 17.8 / 29.2 | 0 / 0 | .3 / .4 → .3 / .4 | 181 → 184 |
| Portrait | 16.7 / 18.5 / 26.1 | 16.7 / 19.0 / 29.7 | 0 / 0 | .4 / .6 → .5 / .7 | 99 → 102 |

All twelve runs completed with zero browser errors and DPR1 →1; drawing-buffer dimensions stayed exactly1280×900 or390×844. Each has approximately1800 render-completion samples over30seconds. Sanctuary CPU is the existing sanctuary update instrumentation, not total animal cost or GPU time. At this 60Hz presentation cadence, equal medians do not establish equal GPU headroom. Stationary p95 increased1.2ms and portrait p95 increased.5ms. The lower orbit p95 in this single series is not sufficient evidence of an optimization. No quality or resolution was reduced.

Geometric addition at fixed instance count: 231 ×64 triangles +12,240 extra shelf triangles +42,768 extra shared terrace/bank/rubble triangles +144 sediment triangles = **69,936 additional geometry triangles** when all relevant batches are visible. One new opaque batch and one new transparent sediment batch produce **three additional recorded draw calls**: the inherited double-sided transparent particle material draws both faces. This also accounts for144 further submitted triangles (typical snapshot increase70,080; near-floor65,160 because of visibility). The two-sided material was not changed to hide cost. There are zero new full-ocean render passes, render targets or lights. All additional resources are constructed once and disposed by the sanctuary. Representative GPU resource counts increase by two geometries, with texture counts unchanged.

## Scope and remaining limitations

- **PARTIAL artistic result**: some wide/oblique shelf forms still read as plates or repeated blocks; the four selected ecology clusters are medium-readable but not sufficiently convincing in all wide views. Do not equate added polygons/tests with visual approval.
- Atmosphere is only restrained local sediment; no haze layer was added. It does not completely eliminate the disconnected feeling in every deep shadow.
- Node-only constructor diagnostic found increased attachment startup cost (~126ms baseline vs~762ms optimized candidate; initial candidate~1270ms). Not browser startup or GPU timing. Exact intersection caching improves the candidate without moving anchors, but startup remains a cost.
- The known pre-existing idle-return cyan-loss / invalid-geometry bug is explicitly out of scope and unchanged. No idle-fix claim.
- Hardware WebGPU, software WebGPU, Safari, Firefox, integrated GPUs and physical mobile: **NOT TESTED** in M6.4. The legacy full-ocean WebGPU issue remains separate.
- M1–M5.2 runtime outside sanctuary is byte unchanged, as are M6.1 plume/shimmer and M6.3 atmosphere. Camera tracks, View and scroll are untouched. No push, merge, deploy, Pages change or M7.
