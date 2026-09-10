# M6.5 validation

## Identity and environment

Baseline `518db86f0be40ac4273900081b5385a9f8ca25bf` at local5207. Candidate runtime `0a9168474ae96584f3b6f9b662c06628bf69c107` at local5209. Result documentation commit is recorded in the final handoff. No baseline/main substitution. Same Three.js0.175.0 WebGPURenderer family, actual NVIDIA RTX4070 WebGL2 via ANGLE OpenGL, i5-14600K, Brave/Chromium152.0.7977.76. No renderer/version/dependency changes.

Both run the existing Vite development path. Production build is validated separately; these measurements are not claimed to be production-minified browser benchmarks. Actual desktop draw buffer1280×900, portrait390×844, DPR1. Inherited direct ocean path/bloom-off/adaptive-quality configuration is unchanged.

## Visual evidence

Root `/home/mani/dev/jellyfish-studio/m6-5-evidence/`. Viewer: <http://127.0.0.1:5210/>. Unmodified source screenshots and actual timestamped browser frames/videos are retained externally, not new repository runtime assets.

Matched `baseline/<view>/wide.png` / `candidate/<view>/wide.png` with state/errors JSON:

| View | Purpose |
|---|---|
| explore | Primary close Explore rock field, same inherited review pose |
| drift | Primary wide Drift end |
| deep | Wide Deep end |
| chimney | Main chimney close inspection |
| ravine | Recessed channel and wall material |
| shelf | Existing repeated shelf geometry under new material |
| grain | Close mineral relief and pore scale |
| wide | Wide Explore basin with sparse life |
| glow-close | Close attachment to actual existing colony body |
| illumination | Existing Intimate camera/animal light |
| portrait | 390×844 browser emulation |
| base / colony / spires | Additional context checks |

All use seed7183, held animal time14, same camera/FOV and draw buffer. No hand-selected new dark camera is used only for the candidate. The text-only request does not contain a new image or exported camera state; exact matching is between the documented M6.4/M6.5 captures, not a claim to recover unknown user screenshot metadata.

Motion: `motion/{before,after}-{ravine,stationary,illumination,life}/motion.mp4`. `life` goes wide-to-close; `ravine` is a slow Explore inspection past shelf faces and through the existing channel. These are development inspection paths, not altered production camera tracks. Every clip resumes the actual organism/current simulation after matching its starting phase. Capture timings are not performance timings.

First trial was too dark and too aggressively bumped; it is retained under `trial1/`. The second trial reduced microheight and restored enough material response for the chimney/edges. No geometry was changed to rescue the material.

### Final visual assessment: PARTIAL

All14 pairs have exactly equal camera state, draw buffers, held animal time/phase and plume time, with zero console errors. All8 browser clips passed container/dimension checks and contain about22seconds/664–665 timestamped frames each. Raw verification: `evidence-validation.json`.

The local evidence server was restarted during final handoff validation after its earlier process had exited. Browser verification then found all28 image elements and8 video controls, loaded visible comparison images, and successfully played the candidate sweep clip (readyState4, advancing time, no console errors). `review-page/` contains that check. Candidate5209 and evidence5210 are checked live at handoff; neither is a public deployment.

The final material suppresses broad shelf midtones and reveals coarse relief under the unchanged animal lighting. The chimney remains legible, and the ravine recedes into shadow. Jellyfish remain the dominant luminous/colorful objects. However, repeated rounded shelf contours and some clean primitive edges still advertise their construction in close/oblique Explore views. Material-side masking reduces their visibility but cannot fully erase silhouettes. This is the explicit reason for PARTIAL, not a claim that the user's visual gate has passed. No geometry changes are made to hide that limitation.

Fixed image ROIs show mean linear displayed luminance reduced to21.8% of baseline in close Explore,23.6% in wide Drift,26.3% in Deep and28.2% in the grain close-up. These are identical rectangular image regions, including overlapping life/objects where present—not isolated albedo measurements or exposure changes. Raw ROI coordinates/statistics: `image-analysis.json`. Display calibration and black crush may affect subjective readability; HDR displays are untested.

Wide Drift and Deep each show one clearly perceptible lower-central attached pinpoint in the final frames, with any remaining tiny sources faint, subpixel or occluded. Close and wide-to-close motion reveal the support bodies, not a floating halo. Static raycast/projected-radius diagnostics are included in `image-analysis.json`, but are not substituted for pixel inspection: filaments and shimmer affect apparent visibility. Three signature allocations need not all be visible. The larger close bodies still expose existing low-poly edges; no anatomy/geometry refinement was attempted.

## Performance procedure

Six fresh baseline/candidate pairs: Deep wide, stationary, Explore orbit, near-floor, jellyfish illumination, portrait. Same6-second initial warm-up, same camera selection +2seconds settling, then3seconds (12for stationary) and30-second capture-free measurement. Actual async ocean-render completion intervals are used, not independent rAF callbacks or GPU timestamps. No screenshots/video encodes, builds or construction profiles run alongside these measurements. Source revisions and buffer/DPR/backend are recorded by the existing probe.

### First paired series (all six scenes)

| Scene | M6.4 median / p95 / max ms | M6.5 median / p95 / max ms | >50ms before → after | Sanctuary CPU median / p95 before → after ms | Draws before → after |
|---|---|---|---|---|---|
| Deep wide | 16.6 / 18.0 / 27.9 | 16.7 / 17.9 / 26.1 | 0 →0 | .3/.4 →.3/.4 | 181 →181 |
| Stationary | 16.7 / 17.9 / 22.0 | 16.7 / 18.2 / 26.1 | 0 →0 | .3/.4 →.3/.4 | 179 →179 |
| Explore orbit | 16.7 / 19.1 / 25.5 | 16.7 / 18.2 / 24.4 | 0 →0 | .3/.4 →.3/.5 | 181 →181 |
| Near floor | 16.7 / 19.1 / 27.9 | 16.7 / 18.2 / 72.7 | 0 →1 | .3/.4 →.3/.5 | 164 →164 |
| Illumination | 16.7 / 18.5 / 21.7 | 16.6 / 18.9 / 59.6 | 0 →2 | .3/.4 →.3/.4 | 184 →184 |
| Portrait | 16.7 / 18.3 / 28.2 | 16.7 / 18.8 / 25.3 | 0 →0 | .4/.6 →.5/.7 | 102 →102 |

Raw summary: `performance-summary.json`. All twelve runs have zero console errors, unchanged DPR/draw-buffer sizes, and around1800 completed-render samples. These are frame intervals, not GPU timings. The three candidate long intervals are retained, not excluded as outliers. Sanctuary-update CPU did not exhibit the long stalls; this does not identify where they occurred. Targeted repeat results are recorded separately, never substituted for this first series. Equal 60Hz medians must not be described as equal GPU headroom. Static draw-count snapshots are not whole-run maxima; normal live LOD/culling state can cause triangle variation. Removing30 point instances removes1080 geometric triangles from the point batch. Passes, draw batches, texture and geometry resource counts are unchanged.

### Targeted repeat — retained separately

Same clean30-second measurement protocol, same scenes/settings and backend; no captures or build work alongside it. These results do not replace the first series.

| Scene | M6.4 median / p95 / max ms | M6.5 median / p95 / max ms | >50ms before → after | Sanctuary CPU median / p95 before → after ms | Draw snapshot before → after |
|---|---|---|---|---|---|
| Near floor | 16.7 /19.0 /28.9 | 16.7 /18.2 /28.5 | 0 →0 | .3/.4 →.3/.5 | 164 →166 |
| Illumination | 16.7 /18.3 /24.6 | 16.7 /18.4 /24.5 | 0 →0 | .3/.4 →.3/.4 | 184 →184 |

Raw summary: `performance-repeat.json`; raw root `performance-repeat/`. All four runs had zero console errors. The earlier72.7ms/59.6ms stalls did not reproduce and remain unattributed. No corrective runtime optimization was made or claimed. This is not proof of their absence during longer use. Near-floor live population/culling was sampled at a slightly different instantaneous state (two more draws); it was not a new material pass or changed quality threshold. Same requested camera/time protocol is not exact per-frame trajectory synchronization in free-running performance runs. Matched stills, separately, use exact held animation states.

### Construction

Same Node24.20.0, one warm-up then five constructor samples per source, separate from browser capture/benchmark and a separate instrumented run. M6.4 median948.98ms; M6.5 median942.69ms. This is effectively unchanged, not a meaningful speedup. The historical126/762ms diagnostics were separate single measurements and are not substituted for this paired result.

In the separately instrumented baseline constructor (~940.95ms), direct mesh ray tests account for~871ms: basin371.21ms/667calls, main chimney250.57ms/178calls, secondary-spire mesh110.74ms/420calls, shelf92.68ms/907calls, other fracture spheres40.47ms/1326calls. The231-piece new meso mesh costs only3.26ms/1364proxy ray tests. M6.5 preserves these ray counts and has comparable times. Attachment against the large basin/chimney meshes is the major existing cost, not the10-point selection or material graph creation. No construction optimization or geometry rewrite was added in this pass. Raw files: `construction/{baseline,candidate}-final.json`.

## Tests and build

- Baseline97/97 and candidate99/99 Node tests passed.
- Production build passed, including existing Sites packaging; existing >500kB chunk warning remains.
- Approved motion parity:720frames,24checkpoints, geometry/appendages byte-identical and activation equal.
- Default animal parity:240frames,8checkpoints, geometry byte-identical and material response equal.
- Focused M6.5 tests lock runtime changes to two files, all geology/other system sources, ten deterministic embedded pinpoints, three signature sites, five colony body counts,231meso pieces,72sediment particles, zero lights/passes and stable resources through updates.
- Commands: `VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build`; `node --test tests/*.test.mjs`; `node scripts/check-approved-motion.mjs`; `node scripts/check-default-animal.mjs`.
- Final logs: `/tmp/m65-final-{build,tests,motion,animal}.log`. There is no general npm test script. The initial fresh-worktree packaging-file failure was resolved by building its required artifacts before running the suite.

## Scope / lifecycle limits

Geometry/layout/instance transforms, M1–M5.2 systems, M6.1 plume/shimmer, current field, M6.4 sediment, camera/View/scroll and water composition remain source-identical to M6.4. Only sanctuary material and pinpoint selection change. No new passes, targets or realtime lights.

The known idle-return cyan-loss/invalid-geometry issue is not repaired or concealed. Ordinary hidden-tab recovery, reverse travel and resize are evaluated separately. M6.4's stronger forced-CDP-freeze reinitialization issue remains separately documented; do not describe it as fixed.

Ordinary background-tab validation passed on both baseline and candidate: switch to another actual browser tab for five seconds, confirm hidden state, return and verify the live renderer. Repeated forward/reverse seek and actual CDP wheel input in both directions passed. Resizes800×900 →390×844 →1280×900 passed with no console errors. Explore is exercised in the matched stills, orbit benchmark and ravine/life browser clips. Art/code parity does not imply physical touch-device validation. Raw state, screenshots and wheel progress are in `lifecycle-{baseline,candidate}/`. The stronger forced-freeze case and known idle defect were not retested in this pass.

Hardware/software WebGPU, Safari, Firefox, integrated GPUs, physical mobile and HDR displays: NOT TESTED unless explicitly recorded otherwise. Portrait screenshots are emulation, not phone validation. No push, merge, deploy, Pages changes or M7.
